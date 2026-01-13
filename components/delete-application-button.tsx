/**
 * Başvuru Silme Butonu (Danışman için)
 * 
 * Test süreci için - başvuruyu ve ilişkili belgeleri siler
 */

'use client';

import { useState } from 'react';
import { deleteApplicationByConsultant } from '@/lib/auth/application-actions';

interface DeleteApplicationButtonProps {
  profileId: string;
  candidateName: string;
  onDelete: () => void;
}

export default function DeleteApplicationButton({
  profileId,
  candidateName,
  onDelete,
}: DeleteApplicationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`"${candidateName}" adlı adayın başvurusunu ve tüm belgelerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteApplicationByConsultant(profileId);

      if (result.error) {
        setError(result.error);
      } else {
        onDelete();
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Başvuruyu Sil"
      >
        {loading ? '...' : '🗑️ Sil'}
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-1 text-center max-w-20">
          {error}
        </div>
      )}
    </div>
  );
}
