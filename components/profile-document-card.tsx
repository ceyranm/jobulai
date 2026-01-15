'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ProfileDocumentCardProps {
  documentType: string;
  documentTypeLabel: string;
  document: any;
  status: string;
}

export default function ProfileDocumentCard({
  documentType,
  documentTypeLabel,
  document,
  status,
}: ProfileDocumentCardProps) {
  const supabase = createClient();

  const statusConfig = {
    APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
    PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;

  const getShortFileName = (fileName: string) => {
    if (!fileName) return '';
    if (fileName.length <= 20) return fileName;
    return fileName.substring(0, 17) + '...';
  };

  const handleViewDocument = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document) return;

    try {
      const { data, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);

      if (urlError) {
        alert('Belge açılamadı: ' + urlError.message);
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      alert('Belge açılamadı: ' + error.message);
    }
  };

  const isLocked = document && document.status === 'APPROVED';

  return (
    <div 
      className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && document ? 'cursor-pointer' : ''}`}
      onClick={status === 'PENDING' && document ? handleViewDocument : undefined}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{documentTypeLabel}</p>
          {status === 'EVALUATION' && document ? (
            <button
              onClick={handleViewDocument}
              className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
              title={document.file_name || 'Belgeyi Görüntüle'}
            >
              {getShortFileName(document.file_name || '')}
            </button>
          ) : status === 'PENDING' && document ? (
            <button
              onClick={handleViewDocument}
              className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
              title={document.file_name || 'Belgeyi Görüntüle'}
            >
              {getShortFileName(document.file_name || '')}
            </button>
          ) : (
            <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
          )}
        </div>
        {status === 'APPROVED' && document ? (
          <button
            onClick={handleViewDocument}
            className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
            title="Belgeyi Görüntüle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        ) : status === 'EVALUATION' && document ? (
          <button
            onClick={handleViewDocument}
            className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
            title="Belgeyi Görüntüle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        ) : status === 'REJECTED' && document ? (
          <Link
            href="/profile#documents"
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
            title="Belgeyi Düzenle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        ) : !isLocked && (
          <Link
            href="/profile#documents"
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
            title="Belge Yükle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
