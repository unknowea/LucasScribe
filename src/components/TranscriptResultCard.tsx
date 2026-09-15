import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Download,
  FileText,
  Sparkles,
  Share2,
  RotateCcw,
  Languages,
  Clock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  VolumeX
} from 'lucide-react';
import { TranscriptionRecord, Language } from '../types';
import {
  exportAsSrt,
  exportAsVtt,
  exportAsTxt,
  exportAsJson,
  speakText,
  stopSpeaking,
  formatDuration
} from '../utils/audioUtils';

interface TranscriptResultCardProps {
  record: TranscriptionRecord;
  onRetranslate: (targetLang: Language) => void;
  onOpenLanguageModalForRetranslate: () => void;
  targetLanguage: Language;
}

export const TranscriptResultCard: React.FC<TranscriptResultCardProps> = ({
  record,
  onRetranslate,
  onOpenLanguageModalForRetranslate,
  targetLanguage,
}) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('Copied Text!');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingOriginal, setIsSpeakingOriginal] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [showSegments, setShowSegments] = useState(true);
  const [activeTab, setActiveTab] = useState<'both' | 'translation' | 'original'>('both');

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Audio Player Toggle
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Generic Copy handler with instant clipboard copy & visual confirmation
  const handleCopyText = (textToCopy?: string, label = 'Copied Text!') => {
    let content = textToCopy;
    if (!content) {
      if (activeTab === 'original') {
        content = record.originalTranscript;
      } else if (activeTab === 'translation') {
        content = record.translatedText;
      } else {
        // In side-by-side view, default to translated text, or both if identical
        content = record.translatedText || record.originalTranscript;
      }
    }
    navigator.clipboard.writeText(content);
    setCopiedMessage(label);
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2200);
  };

  const handleCopy = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    }
    setCopiedMessage(isOriginal ? 'Original Copied!' : 'Translation Copied!');
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2200);
  };

  const handleCopyBoth = () => {
    const combined = `[Original - ${record.detectedLanguage}]\n${record.originalTranscript}\n\n[Translation - ${record.targetLanguage}]\n${record.translatedText}`;
    navigator.clipboard.writeText(combined);
    setCopiedMessage('Copied Both!');
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2200);
  };

  // Text to speech
  const handleSpeak = (text: string, speechLang?: string, isOriginal = false) => {
    if (isOriginal ? isSpeakingOriginal : isSpeakingTranslation) {
      stopSpeaking();
      if (isOriginal) setIsSpeakingOriginal(false);
      else setIsSpeakingTranslation(false);
      return;
    }

    stopSpeaking();
    if (isOriginal) {
      setIsSpeakingOriginal(true);
      setIsSpeakingTranslation(false);
    } else {
      setIsSpeakingTranslation(true);
      setIsSpeakingOriginal(false);
    }

    speakText(text, speechLang);

    // Auto reset speaking icon after approximate reading time
    const words = text.split(/\s+/).length;
    const estSeconds = Math.max(2, Math.min(30, (words / 130) * 60));
    setTimeout(() => {
      setIsSpeakingOriginal(false);
      setIsSpeakingTranslation(false);
    }, estSeconds * 1000);
  };

  // Download files
  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id={`transcript-record-${record.id}`} className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs dark:shadow-xl space-y-6">
      {/* Top Banner: Detection & Audio Playback */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-neutral-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Detected Language Tag */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700/80 shadow-2xs">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Spoken Language:</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              {record.detectedLanguage}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              {Math.round(record.detectedConfidence * 100)}% Match
            </span>
          </div>

          {/* Target Language Tag */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
            <span className="text-xs text-amber-700 dark:text-amber-400/80 font-medium">Translated into:</span>
            <span className="text-sm font-bold flex items-center gap-1.5">
              <span>{targetLanguage.flag}</span>
              {record.targetLanguage}
            </span>
          </div>

          <button
            id="retranslate-different-lang-btn"
            onClick={onOpenLanguageModalForRetranslate}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 dark:bg-neutral-800 dark:border-transparent text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-300 transition"
            title="Translate this recording into another language"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Translate to other language</span>
          </button>

          {/* Quick Copy Text Button */}
          <button
            id="copy-text-btn"
            onClick={() => handleCopyText()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition active:scale-95"
            title="Copy transcribed or translated text to clipboard"
          >
            {copiedMain ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{copiedMessage}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Player for the recording */}
        {record.audioBlobUrl && (
          <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-2">
            <audio
              ref={audioRef}
              src={record.audioBlobUrl}
              onEnded={() => setIsPlayingAudio(false)}
            />
            <button
              id="audio-playback-btn"
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition shadow-md"
              title={isPlayingAudio ? 'Pause audio playback' : 'Play recorded audio'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{formatDuration(record.audioDurationSeconds)}</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[140px]">
              {record.fileName || 'Original Audio'}
            </span>
          </div>
        )}
      </div>

      {/* AI Summary Banner (if provided) */}
      {record.summary && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 text-neutral-800 dark:text-neutral-200">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Recording Summary ({record.targetLanguage})
          </div>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{record.summary}</p>
        </div>
      )}

      {/* View Mode Tabs on mobile */}
      <div className="flex sm:hidden border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 bg-neutral-100 dark:bg-neutral-950 text-xs">
        <button
          onClick={() => setActiveTab('both')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${activeTab === 'both' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Side-by-Side
        </button>
        <button
          onClick={() => setActiveTab('translation')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${activeTab === 'translation' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Translation
        </button>
        <button
          onClick={() => setActiveTab('original')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition ${activeTab === 'original' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Original
        </button>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Original Spoken Transcript */}
        {(activeTab === 'both' || activeTab === 'original') && (
          <div className="flex flex-col bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Original Transcript
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 font-medium">
                  {record.detectedLanguage}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="speak-original-transcript-btn"
                  onClick={() => handleSpeak(record.originalTranscript, record.detectedLanguageCode, true)}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeakingOriginal
                      ? 'bg-amber-500 border-amber-400 text-neutral-950'
                      : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                  title="Listen to original transcript speech"
                >
                  {isSpeakingOriginal ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  id="copy-original-transcript-btn"
                  onClick={() => handleCopy(record.originalTranscript, true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:border-neutral-700 transition text-xs font-medium"
                  title="Copy original transcript text"
                >
                  {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOriginal ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 text-sm sm:text-base leading-relaxed text-neutral-900 dark:text-neutral-200 whitespace-pre-wrap font-normal select-text min-h-[120px]">
              {record.originalTranscript}
            </div>
          </div>
        )}

        {/* Column 2: Translated Text */}
        {(activeTab === 'both' || activeTab === 'translation') && (
          <div className="flex flex-col bg-amber-500/5 rounded-2xl border border-amber-500/30 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Real-Time Translation
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold">
                  {record.targetLanguage}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="speak-translation-btn"
                  onClick={() => handleSpeak(record.translatedText, targetLanguage.speechCode, false)}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeakingTranslation
                      ? 'bg-amber-500 border-amber-400 text-neutral-950'
                      : 'bg-white hover:bg-neutral-100 border-amber-500/30 text-neutral-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                  title="Listen to translated speech out loud"
                >
                  {isSpeakingTranslation ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  id="copy-translation-btn"
                  onClick={() => handleCopy(record.translatedText, false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 border border-amber-500/30 text-neutral-800 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:border-neutral-700 transition text-xs font-medium"
                  title="Copy translated text"
                >
                  {copiedTranslation ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTranslation ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 text-sm sm:text-base leading-relaxed text-neutral-950 dark:text-amber-100 font-medium whitespace-pre-wrap select-text min-h-[120px]">
              {record.translatedText}
            </div>
          </div>
        )}
      </div>

      {/* Timestamped Subtitle Segments Collapsible */}
      {record.segments && record.segments.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
          <button
            onClick={() => setShowSegments(!showSegments)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50 transition"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Timestamped Speech Segments &amp; Subtitles ({record.segments.length})
              </span>
            </div>
            {showSegments ? (
              <ChevronUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            )}
          </button>

          {showSegments && (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80 border-t border-neutral-200 dark:border-neutral-800 max-h-[360px] overflow-y-auto">
              {record.segments.map((seg, idx) => (
                <div key={seg.id || idx} className="p-3.5 sm:p-4 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/30 transition flex flex-col sm:flex-row gap-3 items-start">
                  <div className="font-mono text-xs text-amber-700 dark:text-amber-400/90 bg-white dark:bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                    {seg.start} - {seg.end}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <p className="text-neutral-600 dark:text-neutral-400 italic">"{seg.original}"</p>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">"{seg.translated}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
        <div className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Multilingual translation completed</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download SRT Subtitles */}
          <button
            id="download-srt-btn"
            onClick={() => downloadFile(exportAsSrt(record.segments), `transcript-${record.id}.srt`, 'text/plain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition shadow-2xs"
            title="Download Subtitles in SRT format"
          >
            <Download className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>SRT Subtitles</span>
          </button>

          {/* Download VTT */}
          <button
            id="download-vtt-btn"
            onClick={() => downloadFile(exportAsVtt(record.segments), `transcript-${record.id}.vtt`, 'text/vtt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition shadow-2xs"
            title="Download WebVTT format"
          >
            <Download className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>WebVTT</span>
          </button>

          {/* Download TXT */}
          <button
            id="download-txt-btn"
            onClick={() => downloadFile(exportAsTxt(record), `transcript-${record.id}.txt`, 'text/plain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition shadow-2xs"
            title="Download full text report"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Text (.txt)</span>
          </button>

          {/* Download JSON */}
          <button
            id="download-json-btn"
            onClick={() => downloadFile(exportAsJson(record), `transcript-${record.id}.json`, 'application/json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition shadow-2xs"
            title="Download JSON structured data"
          >
            <Download className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>JSON</span>
          </button>

          {/* Copy Both (Side-by-Side) */}
          <button
            id="copy-both-text-btn"
            onClick={handleCopyBoth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition shadow-2xs"
            title="Copy both original transcript and translation"
          >
            <Copy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Copy Both</span>
          </button>

          {/* Primary Copy Text Button */}
          <button
            id="copy-text-toolbar-btn"
            onClick={() => handleCopyText()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-sm active:scale-95"
            title="Copy text to clipboard"
          >
            {copiedMain ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMain ? copiedMessage : 'Copy Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
