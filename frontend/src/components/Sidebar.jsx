import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Bot, Home as HomeIcon, FileText, Database, Settings, ShieldCheck } from 'lucide-react';

export default function Sidebar({ documentCount = 0 }) {
  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: FolderOpen, badge: documentCount },
    { label: 'AI Search', path: '/ai-search', icon: Bot },
    { label: 'Home Page', path: '/', icon: HomeIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</h3>
          <div className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System Info</h3>
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><Database className="w-3.5 h-3.5 text-indigo-500" /> Vector DB</span>
              <span className="font-medium text-slate-800">ChromaDB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><FileText className="w-3.5 h-3.5 text-purple-500" /> Embeddings</span>
              <span className="font-medium text-slate-800">MiniLM-L6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Mode</span>
              <span className="font-medium text-emerald-700">Fact-Grounded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
        <p className="font-semibold mb-0.5">Academic RAG Demo</p>
        <p className="text-indigo-700">Full-Stack Document Intelligence Engine</p>
      </div>
    </aside>
  );
}
