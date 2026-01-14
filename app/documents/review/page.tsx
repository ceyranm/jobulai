/**
 * Belge İnceleme Sayfası
 * 
 * Consultant'ların belgeleri inceleyip onaylayabileceği/reddedebileceği sayfa
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';
import DocumentReviewActions from '@/components/document-review-actions';
import DocumentViewer from '@/components/document-viewer';

export default async function DocumentReviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Profil ve rol kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['CONSULTANT', 'ADMIN'].includes(profile.role)) {
    redirect('/');
  }

  // Bekleyen belgeleri al (profilleri ile birlikte)
  const { data: pendingDocuments } = await supabase
    .from('documents')
    .select(`
      *,
      profiles:profile_id (
        id,
        full_name,
        role
      )
    `)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  // Onaylanmış ve reddedilmiş belgeler (son 20)
  const { data: reviewedDocuments } = await supabase
    .from('documents')
    .select(`
      *,
      profiles:profile_id (
        id,
        full_name
      ),
      reviewer:reviewed_by (
        id,
        full_name
      )
    `)
    .in('status', ['APPROVED', 'REJECTED'])
    .order('reviewed_at', { ascending: false })
    .limit(20);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ModernHeader 
        title="Belge İnceleme"
        subtitle="Belge Onay/Red İşlemleri"
        backLink={{
          href: `/dashboard/${profile.role.toLowerCase()}`,
          label: "Dashboard'a Dön"
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Belge İnceleme</h1>

        {/* Bekleyen Belgeler */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Bekleyen Belgeler ({pendingDocuments?.length || 0})
            </h2>
          </div>

          {pendingDocuments && pendingDocuments.length > 0 ? (
            <div className="space-y-4">
              {pendingDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📄</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{doc.file_name}</h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Aday:</span> {doc.profiles?.full_name || 'İsimsiz'} •{' '}
                            <span className="font-medium">Tip:</span> {doc.document_type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Yüklenme: {new Date(doc.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {doc.file_size && ` • Boyut: ${(doc.file_size / 1024).toFixed(2)} KB`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                      >
                        {getStatusText(doc.status)}
                      </span>
                      <DocumentViewer
                        documentId={doc.id}
                        filePath={doc.file_path}
                        fileName={doc.file_name}
                        mimeType={doc.mime_type}
                      />
                      <DocumentReviewActions documentId={doc.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-600">Bekleyen belge bulunmuyor.</p>
            </div>
          )}
        </div>

        {/* İncelenmiş Belgeler */}
        {reviewedDocuments && reviewedDocuments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Son İncelenen Belgeler</h2>
            <div className="space-y-4">
              {reviewedDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.file_name}</h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Aday:</span> {doc.profiles?.full_name || 'İsimsiz'} •{' '}
                            <span className="font-medium">Tip:</span> {doc.document_type}
                          </p>
                          {doc.review_notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              "{doc.review_notes}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.reviewed_at &&
                              `İncelendi: ${new Date(doc.reviewed_at).toLocaleDateString('tr-TR')} • `}
                            {doc.reviewer && `İnceleyen: ${doc.reviewer.full_name}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
