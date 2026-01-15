'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AccountDeletionRequestProps {
  profileId: string;
}

export default function AccountDeletionRequest({ profileId }: AccountDeletionRequestProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const requiredText = 'Bilgilerimin tamamen silinmesini ve hesabımın kapatılmasını istiyorum.';

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (confirmationText.trim() !== requiredText) {
        setError(`Lütfen tam olarak şunu yazın: "${requiredText}"`);
        setLoading(false);
        return;
      }

      // Mevcut bekleyen talep var mı kontrol et
      const { data: existingRequest } = await supabase
        .from('account_deletion_requests')
        .select('id')
        .eq('profile_id', profileId)
        .eq('status', 'PENDING')
        .maybeSingle();

      if (existingRequest) {
        setError('Zaten bekleyen bir silme talebiniz var. Lütfen admin onayını bekleyin.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('account_deletion_requests')
        .insert({
          profile_id: profileId,
          confirmation_text: confirmationText.trim(),
          status: 'PENDING',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setConfirmationText('');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Hesap silme talebi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Hesap Silme</h2>
            <p className="text-gray-600">Hesabınızı kalıcı olarak silmek için talep oluşturun</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setConfirmationText('');
            setError(null);
            setSuccess(false);
          }}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
        >
          Tüm Bilgilerimin Silinmesini İstiyorum
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => !loading && setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              {/* Close Button */}
              <button
                onClick={() => !loading && setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Hesap Silme Talebi
              </h3>

              {/* Warning */}
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ Bu işlem geri alınamaz!
                </p>
                <p className="text-sm text-red-700">
                  Hesabınızı silmek istediğinizden emin misiniz? Tüm bilgileriniz, belgeleriniz ve verileriniz kalıcı olarak silinecektir.
                </p>
              </div>

              {/* Form */}
              <div className="mb-6">
                <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama için lütfen aşağıdaki metni tam olarak yazın:
                </label>
                <p className="text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono">
                  {requiredText}
                </p>
                <textarea
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Yukarıdaki metni buraya yazın..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✅ Hesap silme talebiniz başarıyla oluşturuldu. Admin onayından sonra hesabınız kapatılacaktır.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || confirmationText.trim() !== requiredText}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Gönderiliyor...' : 'Talep Oluştur'}
                </button>
                <button
                  onClick={() => !loading && setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
