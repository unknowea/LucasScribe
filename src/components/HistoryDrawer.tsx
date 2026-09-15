import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Play,
  Copy,
  Clock,
  ExternalLink,
  Search,
  Volume2,
  FileText
} from 'lucide-react';
import { TranscriptionRecord } from '../types';
import { formatDuration } from '../utils/audioUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: TranscriptionRecord[];
  onSelectRecord: (record: TranscriptionRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = records.filter(
    (r) =>
      r.originalTranscript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detectedLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetLanguage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="history-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="history-drawer-panel"
        className="relative w-full max-w-md h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Transcription History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
              {records.length}
            </span>
          </div>
          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search transcriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
          {records.length > 0 && (
            <button
              id="clear-all-history-btn"
              onClick={onClearHistory}
              className="p-2 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition text-xs"
              title="Clear all recordings history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No saved recordings yet</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                Record or upload audio to start transcribing and translating
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No recordings match "{searchQuery}"
            </div>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                id={`history-item-${record.id}`}
                onClick={() => {
                  onSelectRecord(record);
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-xs dark:hover:shadow-md"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-amber-600 dark:text-amber-400">{record.detectedLanguage}</span>
                    <span>&rarr;</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{record.targetLanguage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                      {formatDuration(record.audioDurationSeconds)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(record.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition"
                      title="Delete recording"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-800 dark:text-neutral-300 font-medium line-clamp-2 mb-2">
                  {record.translatedText || record.originalTranscript}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-200/80 dark:border-neutral-900">
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  <span className="text-amber-600 dark:text-amber-400/80 group-hover:underline flex items-center gap-1">
                    Open Transcript &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
