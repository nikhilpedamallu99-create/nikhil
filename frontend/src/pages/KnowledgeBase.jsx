import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import UploadArea from '../components/UploadArea';
import DocumentCard from '../components/DocumentCard';
import Toast from '../components/Toast';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api';
import { FolderOpen, RefreshCw, Loader2, FileText, AlertCircle } from 'lucide-react';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    showToast('info', `Uploading and extracting text from '${file.name}'...`);

    try {
      const result = await uploadDocument(file);
      showToast('success', `Document '${file.name}' uploaded and indexed into vector store!`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to upload document.';
      showToast('error', errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await deleteDocument(documentId);
      showToast('success', 'Document and vector embeddings successfully deleted.');
      setDocuments(documents.filter((d) => d.id !== documentId));
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete document.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar documentCount={documents.length} />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Toast Alerts */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <FolderOpen className="w-7 h-7 text-indigo-600" />
              Knowledge Base Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload, organize, and manage documents indexed in your vector database.
            </p>
          </div>

          <button
            onClick={fetchDocuments}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {/* Drag and Drop Upload Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Add New Document</h3>
          <UploadArea onUpload={handleUpload} isUploading={isUploading} />
        </div>

        {/* Uploaded Documents List Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Uploaded Knowledge Documents ({documents.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm">Loading knowledge base...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Your Knowledge Base is Empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload your PDF or TXT documents above to begin generating embeddings and enabling AI-powered search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
