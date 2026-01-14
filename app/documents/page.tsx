/**
 * Belgeler Sayfası
 * 
 * Adayların belgelerini görüntüleyip yükleyebileceği sayfa
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';
import DocumentDownloadButton from '@/components/document-download-button';

export default async function DocumentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Profil kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  // Sadece CANDIDATE belgelerini görebilir
  if (profile.role !== 'CANDIDATE') {
    redirect(`/dashboard/${profile.role.toLowerCase()}`);
  }

  // Belgeleri al
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

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
        title="Belgelerim"
        subtitle="Belge Yönetimi"
        backLink={{
          href: '/dashboard/candidate',
          label: "Dashboard'a Dön"
        }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Belgelerim</h1>
          <Link
            href="/documents/upload"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            + Belge Yükle
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Bilgi:</strong> CV, diploma, kimlik belgesi gibi belgelerinizi buradan yükleyebilirsiniz.
            Belgeler consultant'lar tarafından incelendikten sonra onaylanacaktır.
          </p>
        </div>

        {/* Documents List */}
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.file_name}</h3>
                        <p className="text-sm text-gray-600">{doc.document_type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                      <span>
                        Yüklenme: {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      {doc.file_size && (
                        <span>
                          Boyut: {(doc.file_size / 1024).toFixed(2)} KB
                        </span>
                      )}
                    </div>

                    {doc.review_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Not:</strong> {doc.review_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                    <DocumentDownloadButton filePath={doc.file_path} fileName={doc.file_name} />
                    {doc.status === 'REJECTED' && (
                      <Link
                        href="/documents/upload"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Yeniden Yükle
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz belge yüklenmemiş
            </h3>
            <p className="text-gray-600 mb-6">
              İlk belgenizi yüklemek için yukarıdaki "Belge Yükle" butonuna tıklayın.
            </p>
            <Link
              href="/documents/upload"
              className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              + Belge Yükle
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
