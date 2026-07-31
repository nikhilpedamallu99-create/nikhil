import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import Toast from '../components/Toast';
import { askQuestion, getChatHistory, getDocuments } from '../services/api';
import { Bot, Send, Sparkles, Loader2, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function AISearch() {
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [documentCount, setDocumentCount] = useState(0);
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);

  const EXAMPLE_QUESTIONS = [
    'What is the main topic of the uploaded document?',
    'Summarize this document.',
    'What are the important points?',
    'Explain this topic in simple words.',
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadInitialData = async () => {
    setFetchingHistory(true);
    try {
      const docData = await getDocuments();
      setDocumentCount(docData.total || 0);

      const historyData = await getChatHistory();
      if (historyData.history && historyData.history.length > 0) {
        const formatted = historyData.history.flatMap((msg) => [
          { sender: 'user', text: msg.question, timestamp: msg.timestamp },
          { sender: 'ai', text: msg.answer, sources: msg.sources, timestamp: msg.timestamp },
        ]);
        setMessages(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (questionToSend) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || loading) return;

    if (documentCount === 0) {
      setToast({
        type: 'error',
        message: 'No documents uploaded yet! Please upload documents in the Knowledge Base first.',
      });
      return;
    }

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await askQuestion(q);
      const aiMsg = {
        sender: 'ai',
        text: res.answer,
        sources: res.sources || [],
        timestamp: res.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to process AI query.';
      setToast({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      <Sidebar documentCount={documentCount} />

      <main className="flex-1 flex flex-col h-full bg-slate-50 relative">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Chat Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs z-10 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Semantic Document Search
            </h1>
            <p className="text-xs text-slate-500">
              Retrieval-Augmented Generation grounded strictly in uploaded knowledge base documents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              documentCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {documentCount > 0 ? `${documentCount} Doc${documentCount === 1 ? '' : 's'} Active` : 'No Docs Loaded'}
            </span>
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {fetchingHistory ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm">Loading chat history...</span>
            </div>
          ) : messages.length === 0 ? (
            /* Initial Empty State */
            <div className="flex flex-col items-center justify-center min-h-[70%] text-center max-w-xl mx-auto space-y-6 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Bot className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">Ask anything about your knowledge base.</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Select a suggested question below or type your query in the search bar.
                </p>
              </div>

              {/* Example Question Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {EXAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left text-xs font-medium text-slate-700 hover:text-indigo-900 transition-all shadow-xs flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
            </div>
          )}

          {/* Loading Animation while AI generates answer */}
          {loading && (
            <div className="max-w-4xl mx-auto flex items-center gap-3 my-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                <Sparkles className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3 text-xs text-slate-600 font-medium">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                Searching vector store & generating answer...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 z-10">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your uploaded documents..."
              rows={2}
              disabled={loading}
              className="w-full pl-4 pr-14 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || loading}
              className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-40 transition-all shadow-sm shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
