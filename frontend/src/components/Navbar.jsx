import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Sparkles, LayoutDashboard, FolderOpen, Bot, BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: BrainCircuit },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: FolderOpen },
    { label: 'AI Search', path: '/ai-search', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                AI Knowledge Base <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">RAG</span>
              </span>
              <span className="text-xs text-slate-500 block font-normal">Intelligent Document Retrieval</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/ai-search"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:shadow-indigo-300 active:scale-[0.98]"
            >
              <Bot className="w-4 h-4" />
              Ask AI
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
