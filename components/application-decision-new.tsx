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

  const handleApprove = async () => {
    // Tüm belgelerin onaylanmış olması gerekir
    const allDocumentsApproved = application.documents.length > 0 && 
      application.documents.every((doc) => doc.status === 'APPROVED');

    if (!allDocumentsApproved) {
      setError('Lütfen önce tüm belgeleri onaylayın');
      return;
    }

    if (!confirm('Bu başvuruyu onaylamak istediğinize emin misiniz?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateApplicationStatus('APPROVED');
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Onaylama sırasında hata oluştu');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Red nedeni:');
    if (!reason || reason.trim() === '') {
      return;
    }

    if (!confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateApplicationStatus('REJECTED');
      onUpdate();
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
      <div className="flex flex-col gap-1">
        <button
          onClick={handleRequireUpdateFromApproved}
          disabled={loading}
          className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bilgi/Evrak Güncelleme Gerekli"
        >
          Güncelle
        </button>
        {error && (
          <div className="text-xs text-red-600 mt-1 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Değerlendirme aşamasında - işlemler yapılabilir
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Onayla"
        >
          ✓
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reddet"
        >
          ✗
        </button>
      </div>
      <button
        onClick={handleUpdateRequired}
        disabled={loading}
        className="w-full px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Bilgi/Evrak Güncelleme"
      >
        Güncelle
      </button>

      {error && (
        <div className="text-xs text-red-600 mt-1 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
