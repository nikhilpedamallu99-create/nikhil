import React from 'react';
import { User, Sparkles, AlertCircle, BookOpen, Clock } from 'lucide-react';
import SourceCard from './SourceCard';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 my-4">
        <div className="max-w-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <span className="text-[10px] text-indigo-200 block text-right mt-1 font-mono">
            {formatDate(message.timestamp)}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  const isNoInfo = message.text?.includes("couldn't find enough information") || message.sources?.length === 0;

  return (
    <div className="flex justify-start gap-3 my-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-indigo-200">
        <Sparkles className="w-4.5 h-4.5" />
      </div>

      <div className="max-w-3xl w-full bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-5 shadow-xs space-y-4">
        {/* Answer Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Knowledge Assistant
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {formatDate(message.timestamp)}
            </span>
          </div>

          {isNoInfo && (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl mb-3 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Strict RAG Guardrail: Answer was restricted because the question detail could not be grounded in the uploaded documents.</span>
            </div>
          )}

          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {message.text}
          </div>
        </div>

        {/* Source References */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Retrieved Document Context ({message.sources.length} source{message.sources.length === 1 ? '' : 's'})</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
