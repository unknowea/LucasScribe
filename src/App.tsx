import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Mic,
  Languages,
  ShieldCheck,
  CheckCircle2,
  FileAudio,
  Radio,
  History,
  Info
} from 'lucide-react';
import { Language, TranscriptionRecord } from './types';
import { LANGUAGES, DEFAULT_TARGET_LANGUAGE } from './data/languages';
import { SAMPLE_RECORDS } from './data/sampleRecords';
import { Header } from './components/Header';
import { LiveRecorder } from './components/LiveRecorder';
import { TranscriptResultCard } from './components/TranscriptResultCard';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { HistoryDrawer } from './components/HistoryDrawer';

const LOCAL_STORAGE_KEY = 'lucasscribe_records_v1';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('lucasscribe_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('lucasscribe_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [targetLanguage, setTargetLanguage] = useState<Language>(() => {
    return LANGUAGES.find((l) => l.code === DEFAULT_TARGET_LANGUAGE) || LANGUAGES[0];
  });

  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState<string>('auto');
  const [currentRecord, setCurrentRecord] = useState<TranscriptionRecord | null>(() => SAMPLE_RECORDS[0]);
  const [history, setHistory] = useState<TranscriptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('omniscribe_records_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_RECORDS;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isRetranslateModalOpen, setIsRetranslateModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [history]);

  // When a new transcription completes
  const handleTranscriptionComplete = (record: TranscriptionRecord) => {
    setCurrentRecord(record);
    setHistory((prev) => [record, ...prev.filter((r) => r.id !== record.id)].slice(0, 30));
  };

  // Re-translate current record into a new language
  const handleRetranslate = async (newTargetLang: Language) => {
    if (!currentRecord) return;
    setIsProcessing(true);

    try {
      // If we have audio base64, re-transcribe with new target language or translate the original transcript
      const response = await fetch('/api/translate-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentRecord.originalTranscript,
          targetLanguage: newTargetLang.name,
          sourceLanguage: currentRecord.detectedLanguage,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Retranslation failed (${response.status})`);
      }

      // Also update segments if present
      const updatedSegments = (currentRecord.segments || []).map((seg) => ({
        ...seg,
        // We will keep original and mark translated
      }));

      const updatedRecord: TranscriptionRecord = {
        ...currentRecord,
        targetLanguage: newTargetLang.name,
        translatedText: data.translatedText || currentRecord.translatedText,
        segments: updatedSegments,
      };

      setCurrentRecord(updatedRecord);
      setHistory((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
      );
    } catch (err) {
      console.error('Retranslation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your transcription history?')) {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
    }
  };

  return (
    <div id="lucasscribe-app-root" className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-200 transition-colors duration-200">
      {/* Top Navigation */}
      <Header
        targetLanguage={targetLanguage}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        isRecording={false}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>Real-time voice transcription &amp; live translation across all 140+ languages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            Speak in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-400 dark:to-amber-200">Any Language</span>.
            <br />
            Translate in <span className="underline decoration-amber-500/40 underline-offset-8">Real-Time</span>.
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Record voice from your microphone or upload any audio file. Automatic dialect detection, verbatim transcription, and instant translation into every world language.
          </p>
        </div>

        {/* Live Recorder Panel */}
        <LiveRecorder
          targetLanguage={targetLanguage}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          onSelectPopularLanguage={(lang) => setTargetLanguage(lang)}
          onTranscriptionComplete={handleTranscriptionComplete}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          selectedSourceLanguage={selectedSourceLanguage}
          setSelectedSourceLanguage={setSelectedSourceLanguage}
        />

        {/* Sample Audio Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">Try sample recordings:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_RECORDS.map((sample) => (
              <button
                key={sample.id}
                id={`sample-btn-${sample.id}`}
                onClick={() => {
                  setCurrentRecord(sample);
                  if (sample.detectedLanguage === 'Amharic') {
                    const amLang = LANGUAGES.find((l) => l.code === 'am');
                    if (amLang) setTargetLanguage(amLang);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 font-medium ${
                  currentRecord?.id === sample.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200 text-neutral-700 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-700'
                }`}
              >
                <span>
                  {sample.detectedLanguage === 'Amharic'
                    ? '🇪🇹'
                    : sample.detectedLanguage === 'Spanish'
                    ? '🇪🇸'
                    : sample.detectedLanguage === 'Japanese'
                    ? '🇯🇵'
                    : '🇫🇷'}
                </span>
                <span>
                  {sample.detectedLanguage === 'Amharic'
                    ? 'Amharic Audio to Text (አማርኛ)'
                    : `${sample.detectedLanguage} Sample`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Transcription & Translation Result */}
        {currentRecord && (
          <section id="transcription-result-section" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Transcription &amp; Translation Output</span>
              </h2>
              <span className="text-xs text-neutral-500">
                Created {new Date(currentRecord.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <TranscriptResultCard
              record={currentRecord}
              targetLanguage={targetLanguage}
              onRetranslate={handleRetranslate}
              onOpenLanguageModalForRetranslate={() => setIsRetranslateModalOpen(true)}
            />
          </section>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-200">Every Single Language</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Full coverage for over 140 global languages and regional dialects: Spanish, Mandarin, Hindi, Arabic, French, Swahili, Amharic, Japanese, and more.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-200">Real-Time Live Translation</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Watch translations update stream-by-stream as words are spoken, followed by a verbatim timestamped audio pass when recording completes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <FileAudio className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-200">Subtitle &amp; Text Export</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Download synchronized SRT subtitles, WebVTT files, and full transcripts for video editing, translation reports, or meeting notes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LucasScribe &bull; Universal Audio Transcriber &amp; Real-Time Translator</span>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Audio processed securely via Gemini 3.8 Multimodal AI
          </span>
        </div>
      </footer>

      {/* Target Language Selection Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguageCode={targetLanguage.code}
        onSelectLanguage={(lang) => setTargetLanguage(lang)}
        title="Select Target Language"
        description="Choose the language you want your speech or audio translated into"
      />

      {/* Re-translation Modal */}
      <LanguageSelectorModal
        isOpen={isRetranslateModalOpen}
        onClose={() => setIsRetranslateModalOpen(false)}
        selectedLanguageCode={targetLanguage.code}
        onSelectLanguage={(lang) => {
          setTargetLanguage(lang);
          handleRetranslate(lang);
        }}
        title="Translate Recording to Another Language"
        description="Select a new language to re-translate this audio recording"
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={(rec) => setCurrentRecord(rec)}
        onClearHistory={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
}
