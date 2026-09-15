import React, { useState, useMemo } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../data/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguageCode: string;
  onSelectLanguage: (language: Language) => void;
  title?: string;
  description?: string;
}

type RegionTab = 'All' | 'Major' | 'Europe' | 'Asia & Pacific' | 'Middle East & Central Asia' | 'Africa' | 'Americas';

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguageCode,
  onSelectLanguage,
  title = 'Select Language',
  description = 'Choose from over 140 supported languages and regional dialects',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionTab>('All');

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter((lang) => {
      const matchesSearch =
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = activeRegion === 'All' || lang.region === activeRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, activeRegion]);

  if (!isOpen) return null;

  return (
    <div id="language-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="language-modal-content"
        className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            </div>
          </div>
          <button
            id="close-language-modal-btn"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="language-search-input"
              type="text"
              placeholder="Search by language name, native script (e.g. Español, አማርኛ, 日本語, العربية)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region filter tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs no-scrollbar">
            {(['All', 'Major', 'Europe', 'Asia & Pacific', 'Middle East & Central Asia', 'Africa', 'Americas'] as RegionTab[]).map((tab) => (
              <button
                key={tab}
                id={`region-tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveRegion(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeRegion === tab
                    ? 'bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/20'
                    : 'bg-neutral-200/70 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {tab === 'All' ? `All (${LANGUAGES.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Languages grid */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {filteredLanguages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-500">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No language found matching "{searchQuery}"</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">Try searching by English or native characters</p>
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = lang.code.toLowerCase() === selectedLanguageCode.toLowerCase();
              return (
                <button
                  key={lang.code}
                  id={`language-option-${lang.code}`}
                  onClick={() => {
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-neutral-900 dark:text-neutral-100 ring-1 ring-amber-500/30'
                      : 'bg-neutral-50 hover:bg-neutral-100/90 border-neutral-200 text-neutral-800 dark:bg-neutral-950/60 dark:border-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-800/70 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl select-none" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1.5">
                        {lang.name}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 uppercase font-mono">
                          {lang.code}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {lang.nativeName}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 flex-shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-500">
          <span>Powered by Gemini 3.8 Flash Multilingual Intelligence</span>
          <span className="font-mono text-neutral-600 dark:text-neutral-400">{filteredLanguages.length} languages shown</span>
        </div>
      </div>
    </div>
  );
};
