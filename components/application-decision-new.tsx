/**
 * Başvuru Karar Component (Yeni Statü Sistemi)
 * 
 * Yeni başvuru statüsü sistemine göre güncellendi
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Application {
  profile: {
    id: string;
    full_name: string;
    application_status: string | null;
  };
  documents: Array<{
    id: string;
    document_type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }>;
  applicationStatus: 'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';
}

interface ApplicationDecisionProps {
  application: Application;
  onUpdate: () => void;
}

export default function ApplicationDecision({
  application,
  onUpdate,
}: ApplicationDecisionProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const updateApplicationStatus = async (newStatus: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Giriş yapmamışsınız');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        application_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.profile.id);

    if (updateError) throw updateError;
  };

  const handleApproveClick = () => {
    // Tüm belgelerin onaylanmış olması gerekir
    const allDocumentsApproved = application.documents.length > 0 && 
      application.documents.every((doc) => doc.status === 'APPROVED');

    if (!allDocumentsApproved) {
      setError('Lütfen önce tüm belgeleri onaylayın');
      return;
    }

    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    setShowApproveModal(false);

    try {
      await updateApplicationStatus('APPROVED');
      await onUpdate();
    } catch (err: any) {
      setError(err.message || 'Onaylama sırasında hata oluştu');
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim() === '') {
      setError('Lütfen reddetme nedenini yazın');
      return;
    }

    setLoading(true);
    setError(null);
    setShowRejectModal(false);

    try {
      await updateApplicationStatus('REJECTED');
      setRejectReason('');
      await onUpdate();
    } catch (err: any) {
      setError(err.message || 'Reddetme sırasında hata oluştu');
      setLoading(false);
    }
  };

  const handleUpdateRequired = async () => {
    // Tüm belgelerin işaretlenmiş (APPROVED veya REJECTED) olması gerekir
    const allDocumentsReviewed = application.documents.length > 0 && 
      application.documents.every((doc) => doc.status !== 'PENDING');

    if (!allDocumentsReviewed) {
      setError('Lütfen önce tüm belgeleri onaylayın veya reddedin');
      return;
    }

    // En az bir belge reddedilmiş olmalı
    const hasRejectedDocuments = application.documents.some((doc) => doc.status === 'REJECTED');

    if (!hasRejectedDocuments) {
      setError('Bilgi/Evrak güncelleme için en az bir belge reddedilmiş olmalıdır');
      return;
    }

    if (!confirm('Bu başvuruyu "Bilgi/Evrak Güncelleme" durumuna geçirmek istediğinize emin misiniz? Adaya bildirim gidecektir.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateApplicationStatus('UPDATE_REQUIRED');
      // TODO: Email bildirimi gönder
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Güncelleme sırasında hata oluştu');
      setLoading(false);
    }
  };

  const handleRequireUpdateFromApproved = async () => {
    if (!confirm('Bu başvuruyu "Bilgi/Evrak Güncelleme Gerekli" durumuna geçirmek istediğinize emin misiniz? Adaya bildirim gidecektir.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateApplicationStatus('UPDATE_REQUIRED');
      // TODO: Email bildirimi gönder
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Güncelleme sırasında hata oluştu');
      setLoading(false);
    }
  };

  // Yeni Başvuru statüsündeyse hiçbir işlem yapılamaz
  if (application.applicationStatus === 'NEW_APPLICATION') {
    return (
      <div className="text-xs text-gray-500 text-center">
        Sadece Görüntüleme
      </div>
    );
  }

  // Bilgi/Evrak Güncelleme statüsündeyse danışman işlem yapamaz
  if (application.applicationStatus === 'UPDATE_REQUIRED') {
    return (
      <div className="text-xs text-orange-600 text-center">
        Güncelleme Bekleniyor
      </div>
    );
  }

  // Reddedildi statüsündeyse işlem yapılamaz
  if (application.applicationStatus === 'REJECTED') {
    return (
      <div className="text-xs text-gray-500 text-center">
        Reddedildi
      </div>
    );
  }

  // Onaylı statüsündeyse sadece "Bilgi/Evrak Güncelleme Gerekli" butonu göster
  if (application.applicationStatus === 'APPROVED') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRequireUpdateFromApproved}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-700"
          title="Bilgi/Evrak Güncelleme Gerekli"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Güncelle</span>
        </button>
        {error && (
          <div className="text-xs text-red-600 text-center bg-red-50 px-3 py-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Değerlendirme aşamasında - işlemler yapılabilir
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleApproveClick}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-700"
          title="Onayla"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Onayla</span>
        </button>
        <button
          onClick={handleRejectClick}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-700"
          title="Reddet"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Reddet</span>
        </button>
        <button
          onClick={handleUpdateRequired}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-700"
          title="Bilgi/Evrak Güncelleme"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Güncelle</span>
        </button>

        {error && (
          <div className="w-full sm:w-auto text-xs text-red-600 text-center bg-red-50 px-3 py-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Onayla Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => !loading && setShowApproveModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                Başvuruyu Onayla
              </h3>
              <p className="text-sm text-slate-600 text-center mb-6">
                Bu başvuruyu onaylamak istediğinize emin misiniz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Onaylanıyor...</span>
                    </>
                  ) : (
                    'Onayla'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reddet Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => !loading && setShowRejectModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                Başvuruyu Reddet
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reddetme Nedeni <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reddetme nedenini yazın..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm text-slate-900 resize-none"
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Reddediliyor...</span>
                    </>
                  ) : (
                    'Reddet'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
