import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UploadCloud, Search, CheckCircle, FileText, ArrowRight, Database, BrainCircuit, ShieldCheck, BookOpen } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Upload Knowledge',
      description: 'Drag and drop PDF, TXT, or DOCX documents to build your personal or organization AI knowledge repository.',
      icon: UploadCloud,
      color: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      link: '/knowledge-base',
      actionText: 'Upload Documents →',
    },
    {
      title: 'AI-Powered Search',
      description: 'Converts questions into 384-dimensional dense vector embeddings using SentenceTransformers for semantic similarity matching.',
      icon: Search,
      color: 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      link: '/ai-search',
      actionText: 'Start AI Search →',
    },
    {
      title: 'Accurate Answers',
      description: 'Fact-grounded LLM synthesis constrained strictly to retrieved document snippets, eliminating hallucinations.',
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      link: '/ai-search',
      actionText: 'Ask Question →',
    },
    {
      title: 'Source References',
      description: 'Every answer is backed by exact document names, page numbers, similarity scores, and transparent text snippets.',
      icon: BookOpen,
      color: 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      link: '/ai-search',
      actionText: 'View Citations →',
    },
  ];

  const ragSteps = [
    { step: '01', title: 'Document Upload', desc: 'PDF, TXT, or DOCX uploaded via FastAPI multipart storage.', link: '/knowledge-base' },
    { step: '02', title: 'Text Extraction & Chunking', desc: 'Text extracted and split into 800-1000 char chunks with overlap.', link: '/knowledge-base' },
    { step: '03', title: 'Embedding & ChromaDB Storage', desc: 'all-MiniLM-L6-v2 vector embeddings persisted in ChromaDB.', link: '/dashboard' },
    { step: '04', title: 'Semantic Search & Retrieval', desc: 'Top-K relevant chunks retrieved using cosine similarity.', link: '/ai-search' },
    { step: '05', title: 'Contextual AI Answer', desc: 'Strict prompt template generates grounded answer with full citations.', link: '/ai-search' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Full-Stack RAG Knowledge System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            AI Knowledge Base Search
          </h1>
          <p className="mt-4 text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Ask questions. Get answers from your documents.
          </p>

          <p className="mt-6 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Retrieval-Augmented Generation (RAG) combines semantic vector database search with LLM intelligence to answer questions strictly using your uploaded documents.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/knowledge-base"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
            >
              <UploadCloud className="w-5 h-5 text-slate-500" />
              Upload Documents
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Cards Section (Key Capabilities - Clickable & Interactive) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Key Capabilities</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
              Click on any capability below to launch and interact with the feature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  to={feat.link}
                  className="bg-slate-50/80 border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                      {feat.title}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60">
                    <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                      {feat.actionText}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* RAG Workflow Architecture Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">How RAG Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">End-to-End Pipeline Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ragSteps.map((step, idx) => (
              <Link
                key={idx}
                to={step.link}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 group block"
              >
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {step.step}
                </span>
                <h4 className="font-semibold text-sm text-slate-900 mt-3 mb-1.5 group-hover:text-indigo-600 transition-colors">{step.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
