import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDocuments, getChatHistory } from '../services/api';
import { FileText, CheckCircle2, MessageSquare, Database, UploadCloud, Bot, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const docData = await getDocuments();
      setDocuments(docData.documents || []);
      setProcessedCount(docData.processed_count || 0);

      const chatData = await getChatHistory();
      setTotalQuestions(chatData.total || 0);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getKbStatus = () => {
    if (documents.length === 0) return { label: 'Empty', color: 'bg-amber-100 text-amber-800' };
    if (processedCount === documents.length) return { label: 'Active & Ready', color: 'bg-emerald-100 text-emerald-800' };
    return { label: 'Indexing...', color: 'bg-indigo-100 text-indigo-800' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar documentCount={documents.length} />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of uploaded knowledge base documents and AI search interactions.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/knowledge-base"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-slate-500" />
              Upload Document
            </Link>
            <Link
              to="/ai-search"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-200"
            >
              <Bot className="w-4 h-4" />
              Ask AI
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Docs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Documents</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{loading ? '-' : documents.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Documents Processed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed & Indexed</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{loading ? '-' : processedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Questions Asked */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions Asked</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{loading ? '-' : totalQuestions}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: KB Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knowledge Base Status</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getKbStatus().color}`}>
                  {getKbStatus().label}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Documents Table Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Documents</h3>
              <p className="text-xs text-slate-500 mt-0.5">Documents stored in SQLite and indexed in ChromaDB.</p>
            </div>
            <Link
              to="/knowledge-base"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm">Loading dashboard data...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No documents uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Upload PDF or TXT files to enable AI search.</p>
              <Link
                to="/knowledge-base"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
              >
                <UploadCloud className="w-4 h-4" /> Upload Document
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 px-2">Document Name</th>
                    <th className="pb-3 px-2">Format</th>
                    <th className="pb-3 px-2">Upload Date</th>
                    <th className="pb-3 px-2">Chunks</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-2 font-semibold text-slate-800 flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="truncate max-w-xs">{doc.original_filename}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono rounded font-semibold uppercase">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500">
                        {formatDate(doc.upload_date)}
                      </td>
                      <td className="py-3.5 px-2 font-medium text-slate-700">
                        {doc.chunk_count}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                          doc.status === 'Ready'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
