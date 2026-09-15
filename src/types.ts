export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: 'Major' | 'Europe' | 'Asia & Pacific' | 'Middle East & Central Asia' | 'Africa' | 'Americas' | 'Other';
  flag: string;
  speechCode?: string; // BCP-47 for speech synthesis / recognition
}

export interface AudioSegment {
  id: number;
  start: string; // e.g. "00:00"
  end: string;   // e.g. "00:04"
  original: string;
  translated: string;
}

export interface TranscriptionRecord {
  id: string;
  createdAt: number;
  audioBlobUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioDurationSeconds: number;
  fileName?: string;
  
  // Detection
  detectedLanguage: string;
  detectedLanguageCode?: string;
  detectedConfidence: number; // 0.0 - 1.0
  
  // Results
  originalTranscript: string;
  targetLanguage: string;
  translatedText: string;
  summary?: string;
  segments: AudioSegment[];
}

export interface LiveStreamState {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  audioLevel: number;
  liveOriginalText: string;
  liveTranslatedText: string;
  isTranslatingLive: boolean;
}
