import { AudioSegment, TranscriptionRecord } from '../types';

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function exportAsSrt(segments: AudioSegment[]): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map((seg, idx) => {
      const startTime = formatSrtTimestamp(seg.start);
      const endTime = formatSrtTimestamp(seg.end);
      return `${idx + 1}\n${startTime} --> ${endTime}\n${seg.translated || seg.original}\n`;
    })
    .join('\n');
}

export function exportAsVtt(segments: AudioSegment[]): string {
  if (!segments || segments.length === 0) return 'WEBVTT\n\n';
  let vtt = 'WEBVTT\n\n';
  segments.forEach((seg, idx) => {
    const startTime = formatVttTimestamp(seg.start);
    const endTime = formatVttTimestamp(seg.end);
    vtt += `${idx + 1}\n${startTime} --> ${endTime}\n${seg.translated || seg.original}\n\n`;
  });
  return vtt;
}

export function exportAsTxt(record: TranscriptionRecord): string {
  const dateStr = new Date(record.createdAt).toLocaleString();
  return `OmniScribe Audio Transcription & Translation Report
Date: ${dateStr}
Audio Duration: ${formatDuration(record.audioDurationSeconds)}
Detected Language: ${record.detectedLanguage} (${Math.round(record.detectedConfidence * 100)}% confidence)
Target Language: ${record.targetLanguage}
${record.summary ? `\n--- SUMMARY ---\n${record.summary}\n` : ''}
--- ORIGINAL TRANSCRIPT (${record.detectedLanguage}) ---
${record.originalTranscript}

--- TRANSLATION (${record.targetLanguage}) ---
${record.translatedText}

${record.segments && record.segments.length > 0 ? `\n--- TIMESTAMPS ---\n` + record.segments.map(s => `[${s.start} - ${s.end}]\nORIGINAL: ${s.original}\nTRANSLATION: ${s.translated}\n`).join('\n') : ''}
`;
}

export function exportAsJson(record: TranscriptionRecord): string {
  return JSON.stringify(record, null, 2);
}

function formatSrtTimestamp(timeStr: string): string {
  // expects "MM:SS" or "HH:MM:SS"
  const parts = timeStr.split(':').map(Number);
  let h = 0, m = 0, s = 0;
  if (parts.length === 2) {
    [m, s] = parts;
  } else if (parts.length === 3) {
    [h, m, s] = parts;
  }
  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},000`;
}

function formatVttTimestamp(timeStr: string): string {
  const parts = timeStr.split(':').map(Number);
  let h = 0, m = 0, s = 0;
  if (parts.length === 2) {
    [m, s] = parts;
  } else if (parts.length === 3) {
    [h, m, s] = parts;
  }
  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.000`;
}

export function speakText(text: string, speechCode?: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  if (!text || !text.trim()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  if (speechCode) {
    utterance.lang = speechCode;
    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(speechCode.toLowerCase().slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
  }
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
