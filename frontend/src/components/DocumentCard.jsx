import React, { useState } from 'react';
import { FileText, File, Trash2, CheckCircle2, Clock, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { getDocumentDownloadUrl } from '../services/api';

export default function DocumentCard({ document, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (type.includes('docx') || type.includes('doc')) {
      return <FileText className="w-5 h-5 text-indigo-500" />;
    } else {
      return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
          </span>
        );
      case 'Processing':
      case 'Uploading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(document.id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              {getFileIcon(document.file_type)}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 line-clamp-1" title={document.original_filename}>
                {document.original_filename}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {document.file_type?.toUpperCase()} • {formatFileSize(document.file_size)}
              </p>
            </div>
          </div>
          {getStatusBadge(document.status)}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(document.upload_date)}
          </span>
          <span className="font-medium text-slate-600">
            {document.chunk_count || 0} vector chunk{document.chunk_count === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Actions: Open / Download File & Delete */}
      <div className="mt-4 pt-2 flex items-center gap-2">
        <a
          href={getDocumentDownloadUrl(document.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/80"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open File
        </a>

        {showConfirm ? (
          <div className="p-1 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-[11px] disabled:opacity-50"
            >
              {isDeleting ? '...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-1.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium text-[11px]"
            >
              X
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200/80"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
