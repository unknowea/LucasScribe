import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Upload,
  Sparkles,
  AlertCircle,
  Volume2,
  Radio,
  FileAudio,
  Languages,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Language, TranscriptionRecord, AudioSegment } from '../types';
import { POPULAR_LANGUAGES, AMHARIC_LANGUAGE } from '../data/languages';
import { AudioWaveform } from './AudioWaveform';
import { blobToBase64, formatDuration } from '../utils/audioUtils';

interface LiveRecorderProps {
  targetLanguage: Language;
  onOpenLanguageModal: () => void;
  onSelectPopularLanguage: (lang: Language) => void;
  onTranscriptionComplete: (record: TranscriptionRecord) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  selectedSourceLanguage: string;
  setSelectedSourceLanguage: (lang: string) => void;
}

export const LiveRecorder: React.FC<LiveRecorderProps> = ({
  targetLanguage,
  onOpenLanguageModal,
  onSelectPopularLanguage,
  onTranscriptionComplete,
  isProcessing,
  setIsProcessing,
  selectedSourceLanguage,
  setSelectedSourceLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranslation, setLiveTranslation] = useState('');
  const [isLiveTranslating, setIsLiveTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastTranslatedTextRef = useRef<string>('');
  const translationTimeoutRef = useRef<number | null>(null);
  const dragCounterRef = useRef<number>(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
      translationTimeoutRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyser(null);
  };

  // Setup Web Speech API for zero-latency live real-time translation feedback
  const setupSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log('Web Speech API not supported in this browser; fallback to full Gemini audio processing.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      if (selectedSourceLanguage && selectedSourceLanguage !== 'auto') {
        recognition.lang = selectedSourceLanguage === 'am' ? 'am-ET' : selectedSourceLanguage;
      } else if (targetLanguage.code === 'am') {
        recognition.lang = 'am-ET';
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          setLiveTranscript(currentText);
          debounceLiveTranslation(currentText);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition warning:', err.error);
      };

      recognition.onend = () => {
        // Restart if still recording
        if (isRecording && !isPaused && speechRecognitionRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  };

  // Debounced translation request to backend
  const debounceLiveTranslation = (text: string) => {
    if (!text || text === lastTranslatedTextRef.current) return;

    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    translationTimeoutRef.current = window.setTimeout(async () => {
      lastTranslatedTextRef.current = text;
      setIsLiveTranslating(true);
      try {
        const res = await fetch('/api/translate-realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLanguage: targetLanguage.name,
            sourceLanguage: selectedSourceLanguage,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.translatedText) {
            setLiveTranslation(data.translatedText);
          }
        }
      } catch (err) {
        console.error('Live translation error:', err);
      } finally {
        setIsLiveTranslating(false);
      }
    }, 450);
  };

  // Start recording
  const startRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setLiveTranslation('');
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // AudioContext & Analyser for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 128;
      source.connect(analyserNode);

      audioContextRef.current = audioCtx;
      setAnalyser(analyserNode);

      // MediaRecorder with cross-browser mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await handleProcessAudioBlob(audioBlob, recordingTime);
      };

      recorder.start(1000); // 1-second chunks
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start live speech recognition for real-time text updates
      setupSpeechRecognition();
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings to record.'
          : 'Failed to access microphone. Please check your audio input device.'
      );
      stopAllMedia();
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch {}
      }
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setIsPaused(true);
    }
  };

  // Stop recording and process
  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsPaused(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyser(null);
  };

  // Cancel recording without saving
  const cancelRecording = () => {
    stopAllMedia();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setLiveTranscript('');
    setLiveTranslation('');
    audioChunksRef.current = [];
  };

  // Process audio blob with Gemini
  const handleProcessAudioBlob = async (blob: Blob, durationSeconds: number, customFileName?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const audioBase64 = await blobToBase64(blob);
      const audioBlobUrl = URL.createObjectURL(blob);

      const response = await fetch('/api/transcribe-and-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: blob.type || 'audio/webm',
          targetLanguage: targetLanguage.name,
          sourceLanguage: selectedSourceLanguage,
        }),
      });

      let json: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          json = await response.json();
        } catch {
          json = null;
        }
      }

      if (!response.ok || !json?.success) {
        if (response.status === 413) {
          throw new Error('Audio file exceeds the network transfer size (max 24MB). Please record or upload a shorter clip.');
        }
        if (json?.error) {
          throw new Error(json.error);
        }
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error('Transcription service is warming up. Please try again in a few seconds.');
        }
        throw new Error(`Transcription could not be completed (${response.status}). Please try again.`);
      }

      const resData = json.data;

      const record: TranscriptionRecord = {
        id: `rec-${Date.now()}`,
        createdAt: Date.now(),
        audioBlobUrl,
        audioBase64,
        audioMimeType: blob.type || 'audio/webm',
        audioDurationSeconds: durationSeconds || 1,
        fileName: customFileName || `Voice Recording (${formatDuration(durationSeconds)})`,
        detectedLanguage: resData.detectedLanguage || 'Auto-detected',
        detectedLanguageCode: resData.detectedLanguageCode,
        detectedConfidence: resData.detectedConfidence ?? 0.95,
        originalTranscript: resData.originalTranscript || liveTranscript || '[No speech detected]',
        targetLanguage: targetLanguage.name,
        translatedText: resData.translatedText || liveTranslation || '[Translation unavailable]',
        summary: resData.summary,
        segments: resData.segments || [],
      };

      onTranscriptionComplete(record);
      setLiveTranscript('');
      setLiveTranslation('');
    } catch (err: any) {
      console.error('Audio processing failed:', err);
      setErrorMessage(
        err.message || 'Error transcribing audio. Please ensure audio has clear speech and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Reusable File Processing (handles both click-upload and drag-and-drop)
  const processSelectedFile = async (file: File) => {
    if (!file) return;

    // Check size (cap at 24MB raw file size to stay cleanly under Nginx's 32M limit after Base64 encoding)
    const MAX_FILE_SIZE_BYTES = 24 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`Audio file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. To ensure smooth online transcription, please upload an audio file under 24MB.`);
      return;
    }

    // Audio format check
    const isLikelyAudio =
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      /\.(mp3|wav|m4a|webm|ogg|flac|aac|opus|wma|mp4|mov)$/i.test(file.name);

    if (!isLikelyAudio) {
      setErrorMessage(
        'Please drop or upload a valid audio file (e.g. MP3, WAV, M4A, WEBM, FLAC, OGG).'
      );
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    // Get duration via HTMLAudioElement
    const tempUrl = URL.createObjectURL(file);
    const audio = new Audio(tempUrl);

    audio.onloadedmetadata = async () => {
      const duration = Math.round(audio.duration) || 10;
      await handleProcessAudioBlob(file, duration, file.name);
      URL.revokeObjectURL(tempUrl);
    };

    audio.onerror = async () => {
      // Fallback if metadata fails to load (e.g. some webm/opus containers)
      await handleProcessAudioBlob(file, 10, file.name);
      URL.revokeObjectURL(tempUrl);
    };
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (isRecording) {
      setErrorMessage('Please finish or cancel your current microphone recording before dropping a new file.');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  // File Upload Handling via Click
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-selected if needed
    event.target.value = '';
    await processSelectedFile(file);
  };

  return (
    <div
      id="live-recorder-panel"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full bg-white dark:bg-neutral-900 border rounded-3xl p-5 sm:p-7 shadow-xs dark:shadow-xl transition-all duration-200 overflow-hidden ${
        isDragging
          ? 'border-amber-500 ring-4 ring-amber-500/20 bg-amber-500/5 dark:bg-neutral-900/90'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      {/* Drag & Drop Full-Panel Overlay */}
      {isDragging && (
        <div
          id="drag-drop-overlay"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-neutral-950/92 backdrop-blur-xs border-2 border-dashed border-amber-500 dark:border-amber-400 rounded-3xl p-6 pointer-events-none animate-in fade-in duration-150"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-4 animate-bounce">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Drop Audio File Here
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
            Instantly transcribe and translate into <span className="text-amber-600 dark:text-amber-400 font-semibold">{targetLanguage.name}</span> across 140+ languages (up to 2GB)
          </p>
        </div>
      )}
      {/* Target Language Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-neutral-200 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">Target Language:</span>
          <button
            id="open-language-picker-pill"
            onClick={onOpenLanguageModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-amber-800 dark:text-amber-300 font-semibold text-sm transition shadow-xs"
          >
            <span className="text-xl leading-none">{targetLanguage.flag}</span>
            <span>{targetLanguage.name}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400/80 font-normal">({targetLanguage.nativeName})</span>
          </button>
        </div>

        {/* Popular Language Quick Pick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs no-scrollbar">
          {/* 1-Click Amharic Audio to Amharic Text Mode */}
          <button
            id="amharic-audio-to-text-btn"
            onClick={() => {
              onSelectPopularLanguage(AMHARIC_LANGUAGE);
              setSelectedSourceLanguage('am');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              targetLanguage.code === 'am' && selectedSourceLanguage === 'am'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm ring-2 ring-amber-500/30'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:bg-neutral-950 dark:text-amber-300 hover:bg-amber-500/20 dark:hover:bg-neutral-800 hover:border-amber-500'
            }`}
            title="Preset: Record Amharic Audio and transcribe directly to Amharic Text"
          >
            <span>🇪🇹</span>
            <span>አማርኛ ድምፅ ወደ ጽሁፍ (Amharic to Text)</span>
          </button>

          <span className="text-neutral-500 hidden sm:inline mr-1">Popular:</span>
          {POPULAR_LANGUAGES.slice(0, 6).map((lang) => (
            <button
              key={lang.code}
              id={`quick-lang-btn-${lang.code}`}
              onClick={() => onSelectPopularLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 transition ${
                lang.code === targetLanguage.code
                  ? 'bg-neutral-200 dark:bg-neutral-800 border-amber-500/60 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-neutral-100 hover:bg-neutral-200/70 border-neutral-300 text-neutral-700 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
          <button
            id="more-languages-btn"
            onClick={onOpenLanguageModal}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-500/60 transition flex items-center gap-1"
          >
            <Languages className="w-3 h-3" />
            <span>More (140+)</span>
          </button>
        </div>
      </div>

      {/* Main Recording Interface */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Visualizer when recording */}
        <div className="w-full max-w-lg mb-6">
          <AudioWaveform analyser={analyser} isRecording={isRecording} isPaused={isPaused} />
        </div>

        {/* Live Timer / Status Indicator */}
        <div className="flex items-center gap-3 mb-6">
          {isRecording ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-base font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>{formatDuration(recordingTime)}</span>
              {isPaused && (
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-sans">
                  Paused
                </span>
              )}
              <span className="text-xs text-neutral-400 font-sans ml-1 flex items-center gap-1">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" /> Real-time live
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Universal Speech Engine Ready &bull; Every Language &amp; Dialect</span>
            </div>
          )}
        </div>

        {/* Big Record / Action Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          {!isRecording ? (
            <>
              {/* Start Recording Button */}
              <button
                id="start-recording-btn"
                onClick={startRecording}
                disabled={isProcessing}
                className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 font-bold shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Start Recording"
              >
                <Mic className="w-9 h-9 sm:w-10 sm:h-10 text-neutral-950 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tap to Record
                </span>
              </button>

              {/* Upload Audio File Button */}
              <div className="flex flex-col items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="audio-file-input"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  id="upload-audio-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 dark:hover:bg-neutral-700/60 shadow-xs transition-all disabled:opacity-50"
                  title="Upload pre-recorded audio file (up to 2GB)"
                >
                  <Upload className="w-6 h-6" />
                </button>
                <span className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Upload (Max 2GB)</span>
              </div>
            </>
          ) : (
            <>
              {/* Pause / Resume Button */}
              <button
                id="pause-resume-recording-btn"
                onClick={togglePause}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 dark:hover:bg-neutral-700 transition shadow-xs"
                title={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
              </button>

              {/* Stop & Transcribe Button */}
              <button
                id="stop-and-transcribe-btn"
                onClick={stopRecording}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Finish &amp; Transcribe</span>
              </button>

              {/* Cancel Button */}
              <button
                id="cancel-recording-btn"
                onClick={cancelRecording}
                className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Dedicated Drag & Drop Zone (when not recording) */}
        {!isRecording && !isProcessing && (
          <div
            id="audio-dropzone"
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-amber-500/70 bg-neutral-50/80 hover:bg-neutral-100/90 dark:border-neutral-800 dark:hover:border-amber-500/60 dark:bg-neutral-950/40 dark:hover:bg-neutral-950/80 transition-all cursor-pointer group flex items-center justify-center gap-3 sm:gap-4 text-left"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-200/80 border border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition flex-shrink-0">
              <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 flex items-center gap-1.5 flex-wrap">
                <span>Drag and drop audio files here, or</span>
                <span className="text-amber-600 dark:text-amber-400 underline underline-offset-2">browse computer</span>
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-0.5">
                MP3, WAV, M4A, WEBM, FLAC, OGG &bull; Supports up to 2GB
              </p>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded-md bg-neutral-200/70 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
              Max 2GB
            </span>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div id="processing-indicator" className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-4 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Transcribing audio &amp; translating to {targetLanguage.name} across 140+ languages...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div id="recorder-error-alert" className="w-full max-w-xl flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm text-left mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-200">Recording Notice</p>
              <p className="text-xs text-red-700/90 dark:text-red-300/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real-Time Live Translation Preview Box (Visible while recording or when live text exists) */}
        {(isRecording || liveTranscript || liveTranslation) && (
          <div id="live-translation-preview" className="w-full mt-4 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/90 border border-amber-500/30 text-left shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Real-Time Live Translation Stream
                </span>
              </div>
              {isLiveTranslating && (
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500 dark:text-amber-400" /> Translating stream...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spoken Live */}
              <div className="bg-white dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Spoken Voice (Live Input)</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">Original</span>
                </div>
                <p className="text-sm text-neutral-900 dark:text-neutral-200 min-h-[44px] italic">
                  {liveTranscript || (
                    <span className="text-neutral-400 dark:text-neutral-600 not-italic">
                      Listening... speak into your microphone in any language
                    </span>
                  )}
                </p>
              </div>

              {/* Translated Live */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 rounded-xl p-3 border border-amber-500/25">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center justify-between">
                  <span>Real-Time Translation</span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-400/70 font-mono">{targetLanguage.name}</span>
                </div>
                <p className="text-sm text-amber-950 dark:text-amber-100 min-h-[44px] font-medium">
                  {liveTranslation || (
                    <span className="text-neutral-400 dark:text-neutral-600 font-normal">
                      Translation will appear here instantaneously as you speak...
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
