import React from 'react';
import { Mic, History, Sparkles, Languages, Sun, Moon } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  targetLanguage: Language;
  onOpenLanguageModal: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  isRecording: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  targetLanguage,
  onOpenLanguageModal,
  onToggleHistory,
  historyCount,
  isRecording,
  theme,
  onToggleTheme,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: LucasScribe */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20">
            <Mic className="w-5 h-5 text-neutral-950" />
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                Lucas<span className="text-amber-500 dark:text-amber-400">Scribe</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="w-2.5 h-2.5" /> 140+ Languages
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden md:block">
              Universal Speech-to-Text & Real-Time Multilingual Translation
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Target Language Selector Trigger */}
          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
            <span className="hidden lg:inline mr-2">Translating to:</span>
            <button
              id="header-target-language-btn"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 hover:border-amber-500/60 text-neutral-900 dark:text-neutral-100 transition shadow-xs hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80"
              title="Click to change target language"
            >
              <span className="text-lg leading-none select-none">{targetLanguage.flag}</span>
              <span className="font-semibold text-xs sm:text-sm">{targetLanguage.name}</span>
              <Languages className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 ml-1" />
            </button>
          </div>

          {/* History Button */}
          <button
            id="toggle-history-btn"
            onClick={onToggleHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition text-xs sm:text-sm shadow-xs"
            title="View saved recordings"
          >
            <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-neutral-950 font-mono">
                {historyCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-amber-500/60 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

