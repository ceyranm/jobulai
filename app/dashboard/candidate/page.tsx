/**
 * Candidate Dashboard - Landing Page
 * 
 * Adayların ana sayfası - Hoş geldiniz ve özet bilgiler
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';
import { submitApplicationForEvaluation, submitSingleDocumentForEvaluation } from '@/lib/auth/application-actions';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [approvedDocumentsCount, setApprovedDocumentsCount] = useState(0);
  const [pendingDocumentsCount, setPendingDocumentsCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState<'CV' | 'POLICE' | 'RESIDENCE' | 'KIMLIK' | 'DIPLOMA'>('CV');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  // Hoş geldiniz mesajını 7 saniye sonra kapat
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // Profil tamamlama yüzdesini onaylanan belgelere göre hesapla
  const calculateProfileCompletion = (documentsData: any[]) => {
    // Gerekli belgeler: CV, POLICE, RESIDENCE, KIMLIK, DIPLOMA
    const requiredDocs = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];
    
    // Onaylanan belgeleri say
    const approvedDocs = documentsData?.filter((doc) => 
      requiredDocs.includes(doc.document_type) && doc.status === 'APPROVED'
    ) || [];
    
    return Math.round((approvedDocs.length / requiredDocs.length) * 100);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Profil bilgilerini al
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Rol kontrolü
        if (!profileData || profileData.role !== 'CANDIDATE') {
          router.push('/');
          return;
        }

        setProfile(profileData);

        // Aday bilgilerini al
        const { data: candidateInfoData } = await supabase
          .from('candidate_info')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        setCandidateInfo(candidateInfoData);

        // Belgeleri al
        const { data: documentsData } = await supabase
          .from('documents')
          .select('*')
          .eq('profile_id', user.id);

        setDocuments(documentsData || []);
        setDocumentsCount(documentsData?.length || 0);
        setApprovedDocumentsCount(
          documentsData?.filter((doc) => doc.status === 'APPROVED').length || 0
        );
        setPendingDocumentsCount(
          documentsData?.filter((doc) => doc.status === 'PENDING').length || 0
        );

        // Profil tamamlama yüzdesini sadece belgelere göre hesapla
        const completion = calculateProfileCompletion(documentsData || []);
        setProfileCompletion(completion);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // Belge yükleme fonksiyonu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Dosya formatı kontrolü
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setUploadError('Sadece PDF, PNG, JPG ve JPEG formatları kabul edilir');
        return;
      }
      
      // Dosya boyutu kontrolü (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('Dosya boyutu 50MB\'dan küçük olmalıdır');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!selectedFile) {
      setUploadError('Lütfen bir dosya seçin');
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUploadError('Giriş yapmamışsınız');
        setUploading(false);
        return;
      }

      // Dosyayı Storage'a yükle
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Dosya yüklenirken hata: ${uploadError.message}`);
      }

      // Aynı tipte belge var mı kontrol et
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id, status, file_path')
        .eq('profile_id', user.id)
        .eq('document_type', uploadDocumentType)
        .single();

      if (existingDoc) {
        // Profil durumunu kontrol et
        const { data: profileData } = await supabase
          .from('profiles')
          .select('application_status')
          .eq('id', user.id)
          .single();

        // Eğer belge APPROVED ise, değiştirilemez
        const isLocked = existingDoc.status === 'APPROVED';
        
        if (isLocked) {
          // Yüklenen dosyayı sil
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error('Bu belge onaylanmış durumda olduğu için değiştirilemez.');
        }
        
        // Reddedilen veya PENDING durumundaki belge varsa, mevcut kaydı güncelle
        if (existingDoc.status === 'REJECTED' || existingDoc.status === 'PENDING') {
          // Eski dosyayı sil (varsa)
          if (existingDoc.file_path) {
            await supabase.storage.from('documents').remove([existingDoc.file_path]);
          }
          
          // Mevcut kaydı güncelle
          const { error: updateError } = await supabase
            .from('documents')
            .update({
              file_name: selectedFile.name,
              file_path: filePath,
              file_size: selectedFile.size,
              mime_type: selectedFile.type,
              status: 'PENDING',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingDoc.id);

          if (updateError) {
            // Yüklenen dosyayı sil
            await supabase.storage.from('documents').remove([filePath]);
            throw new Error(`Belge güncellenirken hata: ${updateError.message}`);
          }

          // Belgeleri yeniden yükle
          const { data: documentsData } = await supabase
            .from('documents')
            .select('*')
            .eq('profile_id', user.id);
          
          setDocuments(documentsData || []);
          setDocumentsCount(documentsData?.length || 0);
          setApprovedDocumentsCount(
            documentsData?.filter((doc) => doc.status === 'APPROVED').length || 0
          );
          setPendingDocumentsCount(
            documentsData?.filter((doc) => doc.status === 'PENDING').length || 0
          );

          setUploadSuccess(true);
          
          // 2 saniye sonra modal'ı otomatik kapat
          setTimeout(() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadSuccess(false);
            setUploadError(null);
          }, 2000);
          
          return;
        }
        
        // Diğer durumlar için (APPROVED veya EVALUATION) hata ver
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error('Bu belge onaylanmış veya değerlendirme aşamasında olduğu için değiştirilemez.');
      }

      // Documents tablosuna kayıt ekle
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          profile_id: user.id,
          document_type: uploadDocumentType,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          status: 'PENDING',
        });

      if (insertError) {
        // Yüklenen dosyayı sil
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Belge kaydedilirken hata: ${insertError.message}`);
      }

      setUploadSuccess(true);
      
      // Belgeleri yeniden yükle
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', user.id);
      
      setDocuments(documentsData || []);
      setDocumentsCount(documentsData?.length || 0);
      setApprovedDocumentsCount(
        documentsData?.filter((doc) => doc.status === 'APPROVED').length || 0
      );
      setPendingDocumentsCount(
        documentsData?.filter((doc) => doc.status === 'PENDING').length || 0
      );

      // 2 saniye sonra modal'ı otomatik kapat
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadSuccess(false);
        setUploadError(null);
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Belge yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!profile?.id) {
      alert('Profil bilgisi bulunamadı');
      return;
    }

    setSubmittingEvaluation(true);

    try {
      const result = await submitApplicationForEvaluation(profile.id);

      if (result.error) {
        alert(result.error);
        setSubmittingEvaluation(false);
      } else {
        // İşlem başarılı, sayfayı yenile
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Evaluation submit error:', error);
      alert(error.message || 'Değerlendirmeye gönderilirken bir hata oluştu');
      setSubmittingEvaluation(false);
    }
  };

  const handleSubmitSingleDocument = async (documentId: string) => {
    try {
      const result = await submitSingleDocumentForEvaluation(documentId);

      if (result.error) {
        alert(result.error);
      } else {
        // İşlem başarılı, sayfayı yenile
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Single document evaluation submit error:', error);
      alert(error.message || 'Belge değerlendirmeye gönderilirken bir hata oluştu');
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setSubmittingEvaluation(false);
  };

  const handleModalSuccessClose = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadSuccess(false);
    setSubmittingEvaluation(false);
    window.location.reload();
  };

  const handleViewDocument = async (document: any) => {
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
    } catch (err: any) {
      alert('Belge açılamadı: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const getDocumentTypeLabel = () => {
    switch (uploadDocumentType) {
      case 'CV':
        return 'CV';
      case 'POLICE':
        return 'Sabıka Kaydı';
      case 'RESIDENCE':
        return 'İkametgah';
      case 'KIMLIK':
        return 'Kimlik Belgesi';
      case 'DIPLOMA':
        return 'Diploma';
      default:
        return 'Belge';
    }
  };

  const openUploadModal = (documentType: 'CV' | 'POLICE' | 'RESIDENCE' | 'KIMLIK' | 'DIPLOMA') => {
    // Belge müdahale edilebilir mi kontrolü (sadece APPROVED statüsünde kilitli)
    const existingDoc = documents.find(doc => doc.document_type === documentType);
    if (existingDoc) {
      const isLocked = existingDoc.status === 'APPROVED';

      if (isLocked) {
        alert('Bu belge onaylanmış durumda olduğu için değiştirilemez.');
        return;
      }
    }
    
    setUploadDocumentType(documentType);
    setShowUploadModal(true);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Ana Sayfa"
        subtitle="Aday Paneli"
        showProfileLink={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        {showWelcome && (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white animate-fade-in">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Kapat"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9IjAuMSI+PGcgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                  Hoş Geldiniz, {profile?.full_name || 'Aday'}! 👋
                </h1>
                <p className="text-emerald-100 text-lg md:text-xl max-w-2xl">
                  Aday dashboard'unuza hoş geldiniz. Profil bilgilerinizi yönetebilir, 
                  belgelerinizi yükleyebilir ve başvuru durumunuzu takip edebilirsiniz.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Profile Completion Card */}
          <Link
            href="/profile"
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 md:p-6">
              {/* Mobilde yatay, desktop'ta dikey */}
              <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-0">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 md:text-center md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 md:mb-1">Profil Tamamlanma</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">%{profileCompletion}</p>
                  <div className="mt-2 md:mt-3 w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 md:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Documents Card */}
          <Link
            href="/documents"
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 md:p-6">
              {/* Mobilde yatay, desktop'ta dikey */}
              <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-0">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 md:text-center md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 md:mb-1">Yüklenen Belgeler</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{documentsCount}</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Approved Documents Card */}
          <Link
            href="/documents"
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 md:p-6">
              {/* Mobilde yatay, desktop'ta dikey */}
              <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-0">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 md:text-center md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 md:mb-1">Onaylanan Belgeler</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{approvedDocumentsCount}</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Pending Documents Card */}
          <Link
            href="/documents"
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 md:p-6">
              {/* Mobilde yatay, desktop'ta dikey */}
              <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-0">
                <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 md:text-center md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 md:mb-1">Bekleyen Belgeler</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{pendingDocumentsCount}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Document Status & Profile Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Status - Left Side */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Belge Durumları</h3>
              <div className="p-2 rounded-lg bg-blue-50">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            {/* Belge Durumu Bilgi Kartları */}
            {(() => {
              // Belge durumlarını analiz et
              const allDocuments = documents.filter(doc => ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'].includes(doc.document_type));
              const approvedDocs = allDocuments.filter(doc => doc.status === 'APPROVED');
              const rejectedDocs = allDocuments.filter(doc => doc.status === 'REJECTED');
              const pendingDocs = allDocuments.filter(doc => doc.status === 'PENDING');
              const evaluationDocs = pendingDocs.filter(doc => profile?.application_status === 'EVALUATION');

              // Tüm belgeler değerlendirmede mi? (Sadece gerçekten EVALUATION durumunda olanlar)
              const allInEvaluation = allDocuments.length > 0 && 
                allDocuments.every(doc => doc.status === 'APPROVED' || doc.status === 'EVALUATION');

              // Tüm belgeler onaylandı mı?
              const allApproved = allDocuments.length > 0 && 
                allDocuments.every(doc => doc.status === 'APPROVED');

              // Reddedilen belgeler var mı?
              const hasRejected = rejectedDocs.length > 0;
              
              // PENDING durumunda belgeler var mı? (Değerlendirmeye gönderilmeyi bekleyen)
              const hasPending = pendingDocs.length > 0;
              
              // Belge adlarını Türkçe'ye çevir
              const getDocumentName = (docType: string) => {
                switch (docType) {
                  case 'CV': return 'CV';
                  case 'POLICE': return 'Sabıka Kaydı';
                  case 'RESIDENCE': return 'İkametgah';
                  case 'KIMLIK': return 'Kimlik';
                  case 'DIPLOMA': return 'Diploma';
                  default: return docType;
                }
              };

              if (allApproved) {
                return (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-green-900 mb-0.5 md:mb-1">Tebrikler! Tüm belgeleriniz onaylandı</h4>
                        <p className="text-xs md:text-sm text-green-700">Tüm belgeleriniz başarıyla onaylanmıştır.</p>
                      </div>
                    </div>
                  </div>
                );
              } else if (hasPending) {
                return (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-amber-700">Yüklediğiniz belgeleri değerlendirmeye göndermek için "Değerlendirmeye Gönder" butonuna tıklayın.</p>
                      </div>
                    </div>
                  </div>
                );
              } else if (hasRejected) {
                const rejectedNames = rejectedDocs.map(doc => getDocumentName(doc.document_type)).join(', ');
                return (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex-shrink-0">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-red-900 mb-0.5 md:mb-1">Reddedilen Belgeler</h4>
                        <p className="text-xs md:text-sm text-red-700">
                          <span className="font-semibold">{rejectedNames}</span> belgeleri reddedilmiştir. Lütfen gözden geçirin ve gerekli düzenlemeleri yapın.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else if (allInEvaluation) {
                return (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-blue-900 mb-0.5 md:mb-1">Belgeleriniz Değerlendirmede</h4>
                        <p className="text-xs md:text-sm text-blue-700">Tüm belgeleriniz consultant tarafından incelenmektedir. Sonuçları yakında öğreneceksiniz.</p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* CV Card */}
              {(() => {
                const cvDoc = documents.find(doc => doc.document_type === 'CV');
                let status = cvDoc?.status || 'MISSING';
                
                // Öncelik sırası: APPROVED > REJECTED > EVALUATION > PENDING > MISSING
                // Belge müdahale edilemez mi kontrolü (sadece APPROVED statüsünde)
                const isLocked = cvDoc && cvDoc.status === 'APPROVED';
                
                // Dosya adını kısalt
                const getShortFileName = (fileName: string) => {
                  if (!fileName) return '';
                  if (fileName.length <= 20) return fileName;
                  return fileName.substring(0, 17) + '...';
                };
                
                const statusConfig = {
                  APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
                  PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                  MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;
                return (
                  <div 
                    className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && cvDoc ? 'cursor-pointer' : ''}`}
                    onClick={status === 'PENDING' && cvDoc ? () => handleViewDocument(cvDoc) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">CV</p>
                        {status === 'EVALUATION' && cvDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(cvDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={cvDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(cvDoc.file_name || '')}
                          </button>
                        ) : status === 'PENDING' && cvDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(cvDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={cvDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(cvDoc.file_name || '')}
                          </button>
                        ) : (
                          <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
                        )}
                      </div>
                      {status === 'APPROVED' && cvDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(cvDoc);
                          }}
                          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : status === 'REJECTED' && cvDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('CV');
                          }}
                          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : !isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('CV');
                          }}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belge Yükle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* POLICE Card */}
              {(() => {
                const policeDoc = documents.find(doc => doc.document_type === 'POLICE');
                let status = policeDoc?.status || 'MISSING';
                
                // Öncelik sırası: APPROVED > REJECTED > EVALUATION > PENDING > MISSING
                // Belge müdahale edilemez mi kontrolü (sadece APPROVED statüsünde)
                const isLocked = policeDoc && policeDoc.status === 'APPROVED';
                
                // Dosya adını kısalt
                const getShortFileName = (fileName: string) => {
                  if (!fileName) return '';
                  if (fileName.length <= 20) return fileName;
                  return fileName.substring(0, 17) + '...';
                };
                
                const statusConfig = {
                  APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
                  PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                  MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;
                return (
                  <div 
                    className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && policeDoc ? 'cursor-pointer' : ''}`}
                    onClick={status === 'PENDING' && policeDoc ? () => handleViewDocument(policeDoc) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Sabıka Kaydı</p>
                        {status === 'EVALUATION' && policeDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(policeDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={policeDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(policeDoc.file_name || '')}
                          </button>
                        ) : status === 'PENDING' && policeDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(policeDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={policeDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(policeDoc.file_name || '')}
                          </button>
                        ) : (
                          <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
                        )}
                      </div>
                      {status === 'APPROVED' && policeDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(policeDoc);
                          }}
                          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : status === 'REJECTED' && policeDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('POLICE');
                          }}
                          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : !isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('POLICE');
                          }}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belge Yükle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* RESIDENCE Card */}
              {(() => {
                const residenceDoc = documents.find(doc => doc.document_type === 'RESIDENCE');
                let status = residenceDoc?.status || 'MISSING';
                
                // Öncelik sırası: APPROVED > REJECTED > EVALUATION > PENDING > MISSING
                // Belge müdahale edilemez mi kontrolü (sadece APPROVED statüsünde)
                const isLocked = residenceDoc && residenceDoc.status === 'APPROVED';
                
                // Dosya adını kısalt
                const getShortFileName = (fileName: string) => {
                  if (!fileName) return '';
                  if (fileName.length <= 20) return fileName;
                  return fileName.substring(0, 17) + '...';
                };
                
                const statusConfig = {
                  APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
                  PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                  MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;
                return (
                  <div 
                    className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && residenceDoc ? 'cursor-pointer' : ''}`}
                    onClick={status === 'PENDING' && residenceDoc ? () => handleViewDocument(residenceDoc) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">İkametgah</p>
                        {status === 'EVALUATION' && residenceDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(residenceDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={residenceDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(residenceDoc.file_name || '')}
                          </button>
                        ) : status === 'PENDING' && residenceDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(residenceDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={residenceDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(residenceDoc.file_name || '')}
                          </button>
                        ) : (
                          <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
                        )}
                      </div>
                      {status === 'APPROVED' && residenceDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(residenceDoc);
                          }}
                          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : status === 'REJECTED' && residenceDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('RESIDENCE');
                          }}
                          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : !isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('RESIDENCE');
                          }}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belge Yükle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* KIMLIK Card */}
              {(() => {
                const kimlikDoc = documents.find(doc => doc.document_type === 'KIMLIK');
                let status = kimlikDoc?.status || 'MISSING';
                
                // Öncelik sırası: APPROVED > REJECTED > EVALUATION > PENDING > MISSING
                // Belge müdahale edilemez mi kontrolü (sadece APPROVED statüsünde)
                const isLocked = kimlikDoc && kimlikDoc.status === 'APPROVED';
                
                // Dosya adını kısalt
                const getShortFileName = (fileName: string) => {
                  if (!fileName) return '';
                  if (fileName.length <= 20) return fileName;
                  return fileName.substring(0, 17) + '...';
                };
                
                const statusConfig = {
                  APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
                  PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                  MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;
                return (
                  <div 
                    className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && kimlikDoc ? 'cursor-pointer' : ''}`}
                    onClick={status === 'PENDING' && kimlikDoc ? () => handleViewDocument(kimlikDoc) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Kimlik</p>
                        {status === 'EVALUATION' && kimlikDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(kimlikDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={kimlikDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(kimlikDoc.file_name || '')}
                          </button>
                        ) : status === 'PENDING' && kimlikDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(kimlikDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={kimlikDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(kimlikDoc.file_name || '')}
                          </button>
                        ) : (
                          <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
                        )}
                      </div>
                      {status === 'APPROVED' && kimlikDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(kimlikDoc);
                          }}
                          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : status === 'REJECTED' && kimlikDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('KIMLIK');
                          }}
                          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : !isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('KIMLIK');
                          }}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belge Yükle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* DIPLOMA Card */}
              {(() => {
                const diplomaDoc = documents.find(doc => doc.document_type === 'DIPLOMA');
                let status = diplomaDoc?.status || 'MISSING';
                
                // Öncelik sırası: APPROVED > REJECTED > EVALUATION > PENDING > MISSING
                // Belge müdahale edilemez mi kontrolü (sadece APPROVED statüsünde)
                const isLocked = diplomaDoc && diplomaDoc.status === 'APPROVED';
                
                // Dosya adını kısalt
                const getShortFileName = (fileName: string) => {
                  if (!fileName) return '';
                  if (fileName.length <= 20) return fileName;
                  return fileName.substring(0, 17) + '...';
                };
                
                const statusConfig = {
                  APPROVED: { colorClass: 'text-green-600', bg: 'from-green-500 to-green-600', text: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  REJECTED: { colorClass: 'text-red-600', bg: 'from-red-500 to-red-600', text: 'Reddedildi', icon: 'M6 18L18 6M6 6l12 12' },
                  PENDING: { colorClass: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', text: 'Beklemede', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  EVALUATION: { colorClass: 'text-blue-600', bg: 'from-blue-500 to-indigo-600', text: 'Değerlendirmede', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                  MISSING: { colorClass: 'text-gray-600', bg: 'from-gray-400 to-gray-500', text: 'Yüklenmedi', icon: 'M12 4v16m8-8H4' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MISSING;
                return (
                  <div 
                    className={`group relative bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5 ${status === 'PENDING' && diplomaDoc ? 'cursor-pointer' : ''}`}
                    onClick={status === 'PENDING' && diplomaDoc ? () => handleViewDocument(diplomaDoc) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.bg} shadow-md group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Diploma</p>
                        {status === 'EVALUATION' && diplomaDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(diplomaDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={diplomaDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(diplomaDoc.file_name || '')}
                          </button>
                        ) : status === 'PENDING' && diplomaDoc ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(diplomaDoc);
                            }}
                            className={`text-xs font-medium ${config.colorClass} hover:underline cursor-pointer text-left`}
                            title={diplomaDoc.file_name || 'Belgeyi Görüntüle'}
                          >
                            {getShortFileName(diplomaDoc.file_name || '')}
                          </button>
                        ) : (
                          <p className={`text-xs font-medium ${config.colorClass}`}>{config.text}</p>
                        )}
                      </div>
                      {status === 'APPROVED' && diplomaDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(diplomaDoc);
                          }}
                          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : status === 'REJECTED' && diplomaDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('DIPLOMA');
                          }}
                          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belgeyi Düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      ) : !isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal('DIPLOMA');
                          }}
                          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:scale-110 flex-shrink-0"
                          title="Belge Yükle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Değerlendirmeye Gönder Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmitEvaluation}
                disabled={submittingEvaluation}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingEvaluation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Değerlendirmeye Gönder
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Info - Right Side */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Profil Bilgileri</h3>
              <Link
                href="/profile"
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Ad Soyad</p>
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Belirtilmemiş'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Telefon</p>
                  <p className="text-sm font-semibold text-gray-900">{candidateInfo?.phone || 'Belirtilmemiş'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Adres</p>
                  <p className="text-sm font-semibold text-gray-900">{candidateInfo?.address || 'Belirtilmemiş'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Eğitim Seviyesi</p>
                  <p className="text-sm font-semibold text-gray-900">{candidateInfo?.education_level || 'Belirtilmemiş'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Deneyim Yılları</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidateInfo?.experience_years !== null && candidateInfo?.experience_years !== undefined 
                      ? `${candidateInfo.experience_years} Yıl` 
                      : 'Belirtilmemiş'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Yetenekler</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidateInfo?.skills && candidateInfo.skills.length > 0 
                      ? candidateInfo.skills.join(', ') 
                      : 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Belge Yükleme Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 md:p-8">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={uploading || submittingEvaluation}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {getDocumentTypeLabel()} Yükle
              </h3>
              <p className="text-sm text-gray-600">
                PDF, PNG, JPG, JPEG formatlarında, maksimum 50MB
              </p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Input */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {selectedFile ? (
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın
                        </p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG, JPEG</p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">Belge başarıyla yüklendi!</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={uploading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yükleniyor...
                    </span>
                  ) : (
                    'Yükle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-600">
            <div>
              © {currentYear} Tüm Hakları Saklıdır
            </div>
            <div>
              <span className="mx-1">-</span>
              <span>SoftAI</span>
              <span className="ml-1">Tarafından Geliştirilmiştir</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
