import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark } from 'lucide-react';

export default function SourceCard({ source, index }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getScoreBadgeColor = (score) => {
    if (!score) return 'bg-slate-100 text-slate-700';
    if (score >= 0.7) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 0.4) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden text-xs transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 font-semibold text-slate-800 truncate">
          <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            {index + 1}
          </div>
          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">{source.document_name}</span>
          {source.page && (
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] shrink-0">
              Page {source.page}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {source.score !== undefined && source.score !== null && (
            <span className={`px-2 py-0.5 rounded-full font-semibold border text-[11px] ${getScoreBadgeColor(source.score)}`}>
              {(source.score * 100).toFixed(0)}% Match
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-200/60 bg-white/60">
          <p className="text-slate-600 leading-relaxed italic font-serif bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/80 text-slate-700">
            "{source.snippet}"
          </p>
        </div>
      )}
    </div>
  );
}
