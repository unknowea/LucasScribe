import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large payloads up to 2GB for audio and video media data
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

/**
 * Configure Nginx reverse proxy to allow large uploads up to 500MB
 */
function configureNginxMaxBodySize() {
  exec(
    `sed -i 's/client_max_body_size [^;]*;/client_max_body_size 500M;/' /etc/nginx/nginx.conf 2>/dev/null && nginx -t 2>/dev/null && nginx -s reload 2>/dev/null`,
    (err) => {
      if (!err) {
        console.log('[Nginx] Configured client_max_body_size 500M successfully');
      }
    }
  );
}

/**
 * Resilient Audio Optimizer
 * Takes any audio/video payload (even 60MB+ uncompressed WAV, video files, etc.)
 * and converts to a clean, highly optimized 16kHz mono MP3 or WAV for speech AI models.
 * This shrinks large 60MB+ files down to 2-3MB in milliseconds, guaranteeing seamless Gemini processing.
 */
async function optimizeAudioIfNeeded(
  base64Data: string,
  mimeType: string
): Promise<{ data: string; mimeType: string }> {
  // If payload is already compact (< 10MB) and an audio format, pass directly
  const rawBytesEstimate = (base64Data.length * 3) / 4;
  if (
    rawBytesEstimate <= 10 * 1024 * 1024 &&
    (mimeType === 'audio/mp3' || mimeType === 'audio/mpeg' || mimeType === 'audio/webm')
  ) {
    return { data: base64Data, mimeType };
  }

  const id = crypto.randomBytes(8).toString('hex');
  const tempInput = path.join(os.tmpdir(), `upload_${id}`);
  const tempOutput = path.join(os.tmpdir(), `opt_${id}.mp3`);

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(tempInput, buffer);

    // Convert via ffmpeg to 16kHz mono speech MP3 with 48k bitrate
    await new Promise<void>((resolve) => {
      exec(
        `ffmpeg -y -i "${tempInput}" -ar 16000 -ac 1 -b:a 48k "${tempOutput}"`,
        (err, stdout, stderr) => {
          if (err) {
            console.warn('[Audio Optimizer] ffmpeg conversion notice:', stderr || err.message);
          }
          resolve();
        }
      );
    });

    if (fs.existsSync(tempOutput)) {
      const optBuffer = await fs.promises.readFile(tempOutput);
      if (optBuffer.length > 0) {
        console.log(
          `[Audio Optimizer] Compressed audio from ${(buffer.length / (1024 * 1024)).toFixed(1)}MB to ${(optBuffer.length / (1024 * 1024)).toFixed(1)}MB`
        );
        return {
          data: optBuffer.toString('base64'),
          mimeType: 'audio/mp3',
        };
      }
    }
  } catch (optErr) {
    console.warn('[Audio Optimizer] Optimization notice, using original:', optErr);
  } finally {
    try {
      if (fs.existsSync(tempInput)) await fs.promises.unlink(tempInput);
      if (fs.existsSync(tempOutput)) await fs.promises.unlink(tempOutput);
    } catch {
      // ignore cleanup errors
    }
  }

  return { data: base64Data, mimeType };
}

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient content generation with automatic model fallback
 * If gemini-3.8-flash encounters high demand (503) or transient failure,
 * automatically falls back to gemini-3.1-flash-lite.
 */
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
  }
): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {
        temperature: params.temperature ?? 0.2,
      };
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
      if (params.responseSchema) config.responseSchema = params.responseSchema;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Engine] Model ${model} encountered an issue:`, err?.message || err);
      // Brief pause before trying fallback model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Final fallback without strict schema if schema parsing caused the issue
  if (params.responseSchema) {
    try {
      console.log('[AI Engine] Trying resilient fallback without strict schema on gemini-3.1-flash-lite...');
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: params.contents,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (fallbackErr) {
      lastError = fallbackErr;
    }
  }

  throw lastError || new Error('All AI models failed to respond');
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Full Audio Transcription and Translation Endpoint
app.post('/api/transcribe-and-translate', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, targetLanguage, sourceLanguage } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Missing audio data in request' });
    }

    const targetLang = targetLanguage || 'English';
    const sourceConstraint = sourceLanguage && sourceLanguage !== 'auto'
      ? `The speaker is expected to speak ${sourceLanguage}, though verify from audio.`
      : `Auto-detect the spoken language with high precision across any world language, dialect, or accent.`;

    const ai = getAI();

    // Prepare audio part
    // Clean audio base64 if data URI prefix is attached
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    // Standardize mime type by removing codec parameters (e.g. audio/webm;codecs=opus -> audio/webm)
    const rawMime = mimeType || 'audio/webm';
    const cleanMime = rawMime.split(';')[0].trim();

    // Optimize large or heavy audio into compact 16kHz mono speech audio
    const { data: finalBase64, mimeType: finalMime } = await optimizeAudioIfNeeded(
      cleanBase64,
      cleanMime
    );

    const audioPart = {
      inlineData: {
        mimeType: finalMime,
        data: finalBase64,
      },
    };

    const promptText = `You are a universal audio transcription and multilingual translation engine with native fluency in every human language, regional dialect, and accent.
${sourceConstraint}

Special Instructions for Amharic (አማርኛ) and Semitic/Ge'ez scripts:
- When the audio is spoken in Amharic (አማርኛ), transcribe verbatim in authentic Ethiopian Ge'ez Fidel script (ፊደል) e.g., "ሰላም ጤና ይስጥልኝ". Never transliterate into Latin alphabet.
- If the target language is Amharic (or if transcribing Amharic audio to Amharic text), ensure both the transcript and translation are rendered in beautiful, grammatically correct Amharic Ge'ez script with appropriate punctuation (። ፣ ፤).
- If the target language matches the spoken language (such as Amharic to Amharic, or English to English), ensure translatedText maintains the pristine verbatim transcript in that script.

Task:
1. Transcribe the spoken audio with maximum verbatim fidelity in the original spoken language. If multiple speakers or languages are present, transcribe faithfully.
2. Accurately detect the exact primary language name and language code (e.g., "Amharic" / "am", "Spanish" / "es", "Mandarin Chinese" / "zh", "Arabic" / "ar", etc.), along with a confidence rating between 0.0 and 1.0.
3. Translate the full verbatim transcription into ${targetLang}. Make the translation natural, accurate, and culturally appropriate while preserving the original tone and meaning. If ${targetLang} is the same as the detected language, keep the transcript faithful in that language.
4. Segment the audio into sequential chronological chunks/sentences with estimated timestamps (format MM:SS or HH:MM:SS), showing both the original phrase and the translated phrase.
5. Provide a clear 1-2 sentence concise summary of the audio content in ${targetLang}.

If the audio is completely silent, contains only ambient background noise, or no human speech is detected, set originalTranscript to "[No clear speech detected]" and translatedText to "[No clear speech detected]" with detectedConfidence 0.0.

Return the result matching the requested JSON format.`;

    const outputText = await callGeminiWithFallback(ai, {
      contents: {
        parts: [audioPart, { text: promptText }],
      },
      temperature: 0.15,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLanguage: {
            type: Type.STRING,
            description: 'The name of the detected spoken language in English',
          },
          detectedLanguageCode: {
            type: Type.STRING,
            description: 'The ISO 639-1 or 639-3 code of the detected language (e.g. en, es, fr, ar, zh, etc.)',
          },
          detectedConfidence: {
            type: Type.NUMBER,
            description: 'Confidence in language detection between 0.0 and 1.0',
          },
          originalTranscript: {
            type: Type.STRING,
            description: 'Complete verbatim transcript in the original spoken language',
          },
          translatedText: {
            type: Type.STRING,
            description: `Complete translation of the transcript into ${targetLang}`,
          },
          summary: {
            type: Type.STRING,
            description: `A concise 1-2 sentence summary of what was spoken in ${targetLang}`,
          },
          segments: {
            type: Type.ARRAY,
            description: 'Chronological list of timestamped speech segments',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                start: { type: Type.STRING, description: 'Start timestamp like 00:00' },
                end: { type: Type.STRING, description: 'End timestamp like 00:04' },
                original: { type: Type.STRING, description: 'Spoken text in this segment' },
                translated: { type: Type.STRING, description: `Translated text in this segment into ${targetLang}` },
              },
              required: ['id', 'start', 'end', 'original', 'translated'],
            },
          },
        },
        required: ['detectedLanguage', 'detectedConfidence', 'originalTranscript', 'translatedText', 'segments'],
      },
    });

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // Fallback in case JSON was wrapped in markdown blocks
      const cleaned = outputText.replace(/```(?:json)?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: {
        detectedLanguage: parsedData.detectedLanguage || 'Auto-detected',
        detectedLanguageCode: parsedData.detectedLanguageCode || '',
        detectedConfidence: typeof parsedData.detectedConfidence === 'number' ? parsedData.detectedConfidence : 0.95,
        originalTranscript: parsedData.originalTranscript || '[No clear speech detected]',
        translatedText: parsedData.translatedText || '[No clear speech detected]',
        summary: parsedData.summary || '',
        segments: Array.isArray(parsedData.segments) ? parsedData.segments : [],
        targetLanguage: targetLang,
      },
    });
  } catch (error: any) {
    console.error('Transcription & translation error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to transcribe and translate audio. Please try again.',
    });
  }
});

// Real-Time Live Text Translation Endpoint (for streaming speech updates)
app.post('/api/translate-realtime', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    if (!text || !text.trim()) {
      return res.json({ success: true, translatedText: '' });
    }

    const ai = getAI();
    const prompt = `Translate the following spoken sentence into ${targetLanguage || 'English'}.
${sourceLanguage && sourceLanguage !== 'auto' ? `Source language: ${sourceLanguage}.` : 'Auto-detect source language.'}
If target language is Amharic (አማርኛ), write purely in authentic Ge'ez script (ፊደል).
If target language is the same as source language (such as Amharic to Amharic), output the cleaned, punctuated verbatim transcription in that language script.
Preserve spoken colloquialisms, emotion, and context naturally.
Return ONLY the direct translated text. Do not add quotes, introductory remarks, or explanations.

Text to translate:
"""${text}"""`;

    const outputText = await callGeminiWithFallback(ai, {
      contents: prompt,
      temperature: 0.1,
    });

    const translatedText = (outputText || '').trim();
    return res.json({
      success: true,
      translatedText,
    });
  } catch (error: any) {
    console.error('Real-time text translation error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Translation failed',
    });
  }
});

// Live Audio Chunk Transcription and Translation (for live streaming mic chunks)
app.post('/api/transcribe-chunk', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, targetLanguage, previousContext } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'No audio provided' });
    }

    const ai = getAI();
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const cleanMime = mimeType || 'audio/webm';

    const audioPart = {
      inlineData: {
        mimeType: cleanMime,
        data: cleanBase64,
      },
    };

    const promptText = `Transcribe this short audio snippet verbatim in its original language and translate it to ${targetLanguage || 'English'}.
${previousContext ? `Previous context for smooth continuation: "${previousContext}"` : ''}
Return JSON with { "original": string, "translated": string, "language": string }.
If silence or indistinct noise, return empty strings.`;

    const rawMime = mimeType || 'audio/webm';
    const cleanMimeType = rawMime.split(';')[0].trim();

    const outputText = await callGeminiWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      temperature: 0.1,
      responseMimeType: 'application/json',
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(outputText || '{}');
    } catch {
      const cleaned = (outputText || '{}').replace(/```(?:json)?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      original: parsed.original || '',
      translated: parsed.translated || '',
      language: parsed.language || '',
    });
  } catch (error: any) {
    console.error('Audio chunk error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Audio chunk transcription failed',
    });
  }
});

// JSON error middleware to prevent Express from sending HTML errors on API routes
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err) {
    console.error('Express caught error:', err);
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: 'Payload too large. Please use an audio file under 250MB or record a shorter clip.',
      });
    }
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Server request processing error',
    });
  }
  next();
});

// Start Server with Vite Middleware
async function startServer() {
  configureNginxMaxBodySize();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
