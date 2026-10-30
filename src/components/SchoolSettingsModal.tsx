import React, { useState, useEffect } from 'react';
import { X, Save, Download, Upload, RotateCcw, Check, AlertCircle, Image as ImageIcon, Users, User, Building, ShieldCheck, PenTool, Sparkles, Trash2, Plus, FileText } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { SchoolProfile, WaliKelasItem } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import { generateDigitalSignatureSvg } from '../utils/signatureUtils';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({ isOpen, onClose }) => {
  const { schoolProfile, updateSchoolProfile, forceSyncToCloud, exportDataToJson, importDataFromJson, resetToDefaultData } = useSchool();
  const [activeTab, setActiveTab] = useState<'kop' | 'wali_kelas' | 'identitas'>('wali_kelas');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterRombel, setFilterRombel] = useState<string>('ALL');

  // Modal Pad Tanda Tangan
  const [sigPadConfig, setSigPadConfig] = useState<{
    isOpen: boolean;
    targetId: string; // 'kepala' or wali kelas id
    title: string;
    name: string;
    currentSignature?: string;
  } | null>(null);

  const [profileForm, setProfileForm] = useState<SchoolProfile>(() => {
    // Data default untuk kelas 1 s/d 6 dengan rombel A dan B
    const defaultWaliList: WaliKelasItem[] = [
      { id: 'wk-1a', kelas: '1', rombel: 'A', nama: 'Siti Khadijah, S.Pd.', nip: '19850312 201001 2 021', ttdUrl: generateDigitalSignatureSvg('Siti Khadijah, S.Pd.', 'SK') },
      { id: 'wk-1b', kelas: '1', rombel: 'B', nama: 'Rina Wulandari, S.Pd.', nip: '19880415 201101 2 018', ttdUrl: generateDigitalSignatureSvg('Rina Wulandari, S.Pd.', 'RW') },
      { id: 'wk-2a', kelas: '2', rombel: 'A', nama: 'Ahmad Fauzi, S.Pd.SD', nip: '19870824 201101 1 015', ttdUrl: generateDigitalSignatureSvg('Ahmad Fauzi, S.Pd.SD', 'AF') },
      { id: 'wk-2b', kelas: '2', rombel: 'B', nama: 'Fitri Handayani, S.Pd.', nip: '19900210 201503 2 007', ttdUrl: generateDigitalSignatureSvg('Fitri Handayani, S.Pd.', 'FH') },
      { id: 'wk-3a', kelas: '3', rombel: 'A', nama: 'Dewi Sartika, S.Pd.', nip: '19891105 201402 2 009', ttdUrl: generateDigitalSignatureSvg('Dewi Sartika, S.Pd.', 'DS') },
      { id: 'wk-3b', kelas: '3', rombel: 'B', nama: 'Budi Hartono, S.Pd.', nip: '19910315 201601 1 008', ttdUrl: generateDigitalSignatureSvg('Budi Hartono, S.Pd.', 'BH') },
      { id: 'wk-4a', kelas: '4', rombel: 'A', nama: 'Indah Permatasari, S.Pd.', nip: '19920520 201702 2 011', ttdUrl: generateDigitalSignatureSvg('Indah Permatasari, S.Pd.', 'IP') },
      { id: 'wk-4b', kelas: '4', rombel: 'B', nama: 'Agus Setiawan, S.Pd.', nip: '19860718 201001 1 014', ttdUrl: generateDigitalSignatureSvg('Agus Setiawan, S.Pd.', 'AS') },
      { id: 'wk-5a', kelas: '5', rombel: 'A', nama: 'Nurlela, S.Pd.SD', nip: '19830714 200801 2 016', ttdUrl: generateDigitalSignatureSvg('Nurlela, S.Pd.SD', 'NL') },
      { id: 'wk-5b', kelas: '5', rombel: 'B', nama: 'Dedi Kurniawan, S.Pd.', nip: '19851004 201001 1 019', ttdUrl: generateDigitalSignatureSvg('Dedi Kurniawan, S.Pd.', 'DK') },
      { id: 'wk-6a', kelas: '6', rombel: 'A', nama: 'Drs. Supriyadi, M.Pd.', nip: '19790610 200501 1 012', ttdUrl: generateDigitalSignatureSvg('Drs. Supriyadi, M.Pd.', 'SP') },
      { id: 'wk-6b', kelas: '6', rombel: 'B', nama: 'Hj. Eni Rohaeni, S.Pd.', nip: '19810816 200604 2 014', ttdUrl: generateDigitalSignatureSvg('Hj. Eni Rohaeni, S.Pd.', 'ER') },
    ];

    // Jika waliKelasList sudah ada tetapi belum memiliki rombel atau kurang dari 12, sesuaikan
    let currentList = schoolProfile.waliKelasList;
    if (!currentList || currentList.length === 0) {
      currentList = defaultWaliList;
    } else if (currentList.some(w => !w.rombel)) {
      // Normalisasi item lama yang belum memiliki rombel
      currentList = currentList.map((w, idx) => ({
        ...w,
        id: w.id || `wk-${w.kelas.toLowerCase()}-${w.rombel || (idx % 2 === 0 ? 'a' : 'b')}`,
        rombel: w.rombel || 'A',
        ttdUrl: w.ttdUrl || generateDigitalSignatureSvg(w.nama || `Guru ${w.kelas}`),
      }));
    }

    return {
      ...schoolProfile,
      pemerintahDaerah: schoolProfile.pemerintahDaerah || 'PEMERINTAH KABUPATEN LEBAK',
      dinasPendidikan: schoolProfile.dinasPendidikan || 'DINAS PENDIDIKAN',
      uptdSatuanPendidikan: schoolProfile.uptdSatuanPendidikan || 'UPTD SATUAN PENDIDIKAN SD NEGERI 1 CEMPAKA',
      kecamatan: schoolProfile.kecamatan || 'WARUNGGUNUNG',
      desaKelurahan: schoolProfile.desaKelurahan || 'Desa Cempaka',
      rtRw: schoolProfile.rtRw || 'RT 006/RW 002',
      akreditasi: schoolProfile.akreditasi || 'Terakreditasi B',
      email: schoolProfile.email || 'helojagoanhosting@gmail.com',
      website: schoolProfile.website || 'sdn1cempaka@sch.id',
      kopBannerUrl: schoolProfile.kopBannerUrl || '/assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png',
      useBannerKop: schoolProfile.useBannerKop !== false,
      kepalaSekolahTtdUrl: schoolProfile.kepalaSekolahTtdUrl || generateDigitalSignatureSvg(schoolProfile.namaKepalaSekolah, 'MLY'),
      waliKelasList: currentList,
    };
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfileForm({
        ...schoolProfile,
        waliKelasList: schoolProfile.waliKelasList && schoolProfile.waliKelasList.length > 0 
          ? schoolProfile.waliKelasList 
          : profileForm.waliKelasList,
      });
    }
  }, [isOpen, schoolProfile]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    const synced = await forceSyncToCloud();
    if (synced) {
      setSuccessMsg('Pengaturan profil sekolah, kop surat, data wali kelas & TTD digital berhasil tersimpan dan tersinkron ke Cloud Firebase!');
    } else {
      setSuccessMsg('Pengaturan disimpan secara lokal. Menyinkronkan ke Cloud Firebase...');
    }
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleWaliFieldChange = (id: string, field: keyof WaliKelasItem, value: string) => {
    const list = (profileForm.waliKelasList || []).map(w => {
      if (w.id === id) {
        return { ...w, [field]: value };
      }
      return w;
    });

    // Update fallback wali kelas utama jika Kelas I A diubah
    const wk1a = list.find(w => w.kelas === 'I' && w.rombel === 'A');
    const updateMain = wk1a ? { namaWaliKelas: wk1a.nama, nipWaliKelas: wk1a.nip || '' } : {};

    setProfileForm({
      ...profileForm,
      ...updateMain,
      waliKelasList: list,
    });
  };

  const handleAddWaliKelas = () => {
    const newId = `wk-${Date.now()}`;
    const newWali: WaliKelasItem = {
      id: newId,
      kelas: 'I',
      rombel: 'A',
      nama: '',
      nip: '',
      ttdUrl: generateDigitalSignatureSvg('Wali Kelas Baru'),
    };
    setProfileForm({
      ...profileForm,
      waliKelasList: [...(profileForm.waliKelasList || []), newWali],
    });
    setSuccessMsg('Rombel wali kelas baru berhasil ditambahkan! Silakan pilih kelas & rombel.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDeleteWaliKelas = (id: string) => {
    if ((profileForm.waliKelasList || []).length <= 1) {
      setErrorMsg('Minimal harus ada satu data wali kelas.');
      setTimeout(() => setErrorMsg(null), 2500);
      return;
    }
    setProfileForm({
      ...profileForm,
      waliKelasList: (profileForm.waliKelasList || []).filter(w => w.id !== id),
    });
  };

  // Upload file gambar TTD
  const handleUploadTtdFile = (targetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (PNG, JPG)!');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (targetId === 'kepala') {
        setProfileForm(prev => ({ ...prev, kepalaSekolahTtdUrl: dataUrl }));
      } else if (targetId === 'admin_officer') {
        setProfileForm(prev => ({ ...prev, petugasAdminTtdUrl: dataUrl }));
      } else {
        setProfileForm(prev => ({
          ...prev,
          waliKelasList: (prev.waliKelasList || []).map(w => w.id === targetId ? { ...w, ttdUrl: dataUrl } : w),
        }));
      }
      setSuccessMsg('Tanda tangan digital berhasil diunggah!');
      setTimeout(() => setSuccessMsg(null), 2500);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleAutoGenerateSignature = (targetId: string, name: string) => {
    const isOfficer = targetId === 'admin_officer' || name.toUpperCase().includes('KURNIAWAN');
    const dataUrl = generateDigitalSignatureSvg(name || 'Guru', isOfficer ? 'KS' : undefined);
    if (targetId === 'kepala') {
      setProfileForm(prev => ({ ...prev, kepalaSekolahTtdUrl: dataUrl }));
    } else if (targetId === 'admin_officer') {
      setProfileForm(prev => ({ ...prev, petugasAdminTtdUrl: dataUrl }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        waliKelasList: (prev.waliKelasList || []).map(w => w.id === targetId ? { ...w, ttdUrl: dataUrl } : w),
      }));
    }
    setSuccessMsg('Paraf kaligrafi digital dinas otomatis berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleRemoveSignature = (targetId: string) => {
    if (targetId === 'kepala') {
      setProfileForm(prev => ({ ...prev, kepalaSekolahTtdUrl: undefined }));
    } else if (targetId === 'admin_officer') {
      setProfileForm(prev => ({ ...prev, petugasAdminTtdUrl: undefined }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        waliKelasList: (prev.waliKelasList || []).map(w => w.id === targetId ? { ...w, ttdUrl: undefined } : w),
      }));
    }
  };

  const handleSaveFromSigPad = (dataUrl: string) => {
    if (!sigPadConfig) return;
    if (sigPadConfig.targetId === 'kepala') {
      setProfileForm(prev => ({ ...prev, kepalaSekolahTtdUrl: dataUrl }));
    } else if (sigPadConfig.targetId === 'admin_officer') {
      setProfileForm(prev => ({ ...prev, petugasAdminTtdUrl: dataUrl }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        waliKelasList: (prev.waliKelasList || []).map(w => w.id === sigPadConfig.targetId ? { ...w, ttdUrl: dataUrl } : w),
      }));
    }
    setSuccessMsg(`Tanda tangan untuk ${sigPadConfig.title} berhasil disimpan!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleUploadLogoSekolah = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (PNG, JPG, SVG)!');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setProfileForm(prev => ({
        ...prev,
        logoSekolahUrl: dataUrl,
      }));
      setSuccessMsg('Logo sekolah berhasil dimuat!');
      setTimeout(() => setSuccessMsg(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBannerKop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (PNG, JPG)!');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setProfileForm(prev => ({
        ...prev,
        kopBannerUrl: dataUrl,
        useBannerKop: true,
      }));
      setSuccessMsg('Banner kop surat berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const jsonStr = exportDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_administrasi_kesiswaan_${profileForm.npsn}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataFromJson(content);
      if (success) {
        setSuccessMsg('Data cadangan berhasil diimpor!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg('Format file tidak valid atau data rusak!');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke data percontohan standar? Data perubahan Anda akan dikembalikan.')) {
      resetToDefaultData();
      setSuccessMsg('Data telah diatur ulang ke sampel standar!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    }
  };

  const kelasList = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-xs my-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                <span>Pengaturan Kop Surat, Wali Kelas &amp; Profil Sekolah</span>
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>SORT ROMBEL (I A - VI B) ACTIVE</span>
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Sesuaikan kop surat resmi, upload logo sekolah, isi data wali kelas I-VI, dan cadangan database
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('kop')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kop'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-white z-10'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kop Surat &amp; Logo Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wali_kelas')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wali_kelas'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-white z-10'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Wali Kelas (I s/d VI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'identitas'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-white z-10'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Identitas Sekolah &amp; Backup</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-900 px-6 py-2.5 flex items-center gap-2 border-b border-emerald-100 font-medium text-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 text-rose-900 px-6 py-2.5 flex items-center gap-2 border-b border-rose-100 font-medium text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: KOP SURAT & LOGO */}
          {activeTab === 'kop' && (
            <div className="space-y-6">
              {/* Preview Kop Saat Ini */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Pratinjau Kop Surat Resmi yang Digunakan di Semua Dokumen:
                </span>
                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
                  {profileForm.useBannerKop ? (
                    <img
                      src={profileForm.kopBannerUrl || '/assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png'}
                      alt="Banner Kop"
                      className="w-full max-h-28 object-contain mx-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-4 text-center">
                      <div className="w-14 h-14 shrink-0 border border-slate-300 rounded flex items-center justify-center text-[10px] bg-slate-50 font-bold">
                        Logo Pemda
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[11px] font-bold uppercase">{profileForm.pemerintahDaerah}</h4>
                        <h5 className="text-[10px] font-bold uppercase">{profileForm.dinasPendidikan}</h5>
                        <h3 className="text-xs font-extrabold uppercase">{profileForm.uptdSatuanPendidikan}</h3>
                        <p className="text-[9px] text-slate-600">{profileForm.alamat}</p>
                      </div>
                      <div className="w-14 h-14 shrink-0 border border-slate-300 rounded flex items-center justify-center text-[10px] bg-slate-50 font-bold">
                        {profileForm.logoSekolahUrl ? (
                          <img src={profileForm.logoSekolahUrl} alt="Logo" className="max-h-12 max-w-12 object-contain" />
                        ) : (
                          'Logo Sekolah'
                        )}
                      </div>
                    </div>
                  )}
                  <div className="border-b-2 border-slate-900 mt-2 mb-0.5"></div>
                  <div className="border-b border-slate-900"></div>
                </div>
              </div>

              {/* Mode Tampilan Kop */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
                <span className="text-xs font-bold text-emerald-950 block">Pilihan Format Tampilan Kop Surat:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 bg-white ${
                    profileForm.useBannerKop ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="kopMode"
                      checked={profileForm.useBannerKop === true}
                      onChange={() => setProfileForm({ ...profileForm, useBannerKop: true })}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Banner Resmi Gambar Lengkap</span>
                      <span className="text-[11px] text-slate-500">
                        Menggunakan banner gambar resmi sesuai format lampiran (Logo Pemda + Teks + Logo SDN 1 Cempaka).
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 bg-white ${
                    !profileForm.useBannerKop ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="kopMode"
                      checked={profileForm.useBannerKop === false}
                      onChange={() => setProfileForm({ ...profileForm, useBannerKop: false })}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Format Teks Dinamis + Dua Logo</span>
                      <span className="text-[11px] text-slate-500">
                        Menyusun teks kop secara dinamis dengan Logo Daerah di kiri dan Logo Sekolah di kanan.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Upload Logo Sekolah & Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Upload Logo Sekolah Anda</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Pilih file gambar logo sekolah Anda dari komputer (format PNG transparan atau JPG).
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogoSekolah}
                    id="schoolLogoInput"
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('schoolLogoInput')?.click()}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File Logo Sekolah</span>
                    </button>
                    {profileForm.logoSekolahUrl && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Logo Terpasang
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Upload / Ganti Banner Kop Surat</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Ganti gambar banner kop surat atau gunakan banner default resmi SDN 1 Cempaka.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBannerKop}
                    id="bannerKopInput"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('bannerKopInput')?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileForm(p => ({ ...p, kopBannerUrl: '/assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png', useBannerKop: true }))}
                      className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-md text-xs cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
              </div>

              {/* Teks Kop Surat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Pemerintah Daerah (Header Baris 1)</label>
                  <input
                    type="text"
                    value={profileForm.pemerintahDaerah || ''}
                    onChange={e => setProfileForm({ ...profileForm, pemerintahDaerah: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-semibold text-slate-900"
                    placeholder="PEMERINTAH KABUPATEN LEBAK"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Dinas Pendidikan (Header Baris 2)</label>
                  <input
                    type="text"
                    value={profileForm.dinasPendidikan || ''}
                    onChange={e => setProfileForm({ ...profileForm, dinasPendidikan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-semibold text-slate-900"
                    placeholder="DINAS PENDIDIKAN"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700">UPTD Satuan Pendidikan &amp; Nama Sekolah (Header Baris 3)</label>
                  <input
                    type="text"
                    value={profileForm.uptdSatuanPendidikan || ''}
                    onChange={e => setProfileForm({ ...profileForm, uptdSatuanPendidikan: e.target.value, namaSekolah: e.target.value.replace(/^UPTD SATUAN PENDIDIKAN\s+/i, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-950"
                    placeholder="UPTD SATUAN PENDIDIKAN SD NEGERI 1 CEMPAKA"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kecamatan</label>
                  <input
                    type="text"
                    value={profileForm.kecamatan || ''}
                    onChange={e => setProfileForm({ ...profileForm, kecamatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-semibold"
                    placeholder="WARUNGGUNUNG"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Status Akreditasi</label>
                  <input
                    type="text"
                    value={profileForm.akreditasi || ''}
                    onChange={e => setProfileForm({ ...profileForm, akreditasi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-semibold"
                    placeholder="Terakreditasi B"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA WALI KELAS (KELAS I A & B s/d VI A & B) & TTD DIGITAL */}
          {activeTab === 'wali_kelas' && (
            <div className="space-y-6">
              {/* Kepala Sekolah Card & TTD */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pimpinan Satuan Pendidikan (Kepala Sekolah) &amp; Tanda Tangan</span>
                  </span>
                  {profileForm.kepalaSekolahTtdUrl && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> TTD Digital Aktif
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Nama Lengkap Kepala Sekolah Beserta Gelar</label>
                    <input
                      type="text"
                      value={profileForm.namaKepalaSekolah}
                      onChange={e => setProfileForm({ ...profileForm, namaKepalaSekolah: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      value={profileForm.nipKepalaSekolah}
                      onChange={e => setProfileForm({ ...profileForm, nipKepalaSekolah: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Tanda Tangan Kepala Sekolah */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-14 bg-white border border-slate-300 rounded flex items-center justify-center overflow-hidden shadow-xs relative">
                      {profileForm.kepalaSekolahTtdUrl ? (
                        <img
                          src={profileForm.kepalaSekolahTtdUrl}
                          alt="TTD Kepala"
                          className="max-h-12 max-w-[100px] object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum ada TTD</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800">Tanda Tangan Kepala Sekolah</p>
                      <p className="text-[10px] text-slate-500">Tercetak di sebelah kiri lembar dokumen resmi</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSigPadConfig({
                        isOpen: true,
                        targetId: 'kepala',
                        title: 'Kepala Sekolah',
                        name: profileForm.namaKepalaSekolah,
                        currentSignature: profileForm.kepalaSekolahTtdUrl,
                      })}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Gambar TTD di Layar</span>
                    </button>

                    <label className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-xs">
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                      <span>Upload File TTD</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleUploadTtdFile('kepala', e)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAutoGenerateSignature('kepala', profileForm.namaKepalaSekolah)}
                      className="px-2 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded font-medium flex items-center gap-1 cursor-pointer text-xs"
                      title="Generate paraf kaligrafi otomatis"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Paraf Otomatis</span>
                    </button>

                    {profileForm.kepalaSekolahTtdUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSignature('kepala')}
                        className="px-2 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-medium cursor-pointer text-xs"
                        title="Hapus tanda tangan digital (menjadi tanda tangan basah)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Petugas Administrasi / Pengelola Card & TTD (Kurniawan Saputra) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Petugas Administrasi &amp; Pengelola Dokumen Induk (Kurniawan Saputra)</span>
                  </span>
                  {profileForm.petugasAdminTtdUrl ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> TTD Petugas Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                      Belum ada TTD
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Nama Petugas Administrasi / Pengelola</label>
                    <input
                      type="text"
                      value={profileForm.namaPetugasAdmin || 'KURNIAWAN SAPUTRA'}
                      onChange={e => setProfileForm({ ...profileForm, namaPetugasAdmin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">NIP Petugas Administrasi</label>
                    <input
                      type="text"
                      value={profileForm.nipPetugasAdmin || '19890906 202521 1 004'}
                      onChange={e => setProfileForm({ ...profileForm, nipPetugasAdmin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Tanda Tangan Petugas Administrasi (Kurniawan Saputra) */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-14 bg-white border border-slate-300 rounded flex items-center justify-center overflow-hidden shadow-xs relative">
                      {profileForm.petugasAdminTtdUrl ? (
                        <img
                          src={profileForm.petugasAdminTtdUrl}
                          alt="TTD Kurniawan Saputra"
                          className="max-h-12 max-w-[100px] object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum ada TTD</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800">Tanda Tangan Petugas Administrasi (KURNIAWAN SAPUTRA)</p>
                      <p className="text-[10px] text-slate-500">Tercetak pada dokumen resmi (Format S-1 s/d S-3, PS-5a, PS-5b, dsb)</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSigPadConfig({
                        isOpen: true,
                        targetId: 'admin_officer',
                        title: 'Petugas Administrasi',
                        name: profileForm.namaPetugasAdmin || 'KURNIAWAN SAPUTRA',
                        currentSignature: profileForm.petugasAdminTtdUrl,
                      })}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Gambar TTD di Layar</span>
                    </button>

                    <label className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-xs">
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                      <span>Upload File TTD</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleUploadTtdFile('admin_officer', e)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAutoGenerateSignature('admin_officer', profileForm.namaPetugasAdmin || 'KURNIAWAN SAPUTRA')}
                      className="px-2.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded font-bold flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                      title="Generate paraf kaligrafi otomatis untuk Kurniawan Saputra"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Paraf Otomatis untuk Kurniawan Saputra</span>
                    </button>

                    {profileForm.petugasAdminTtdUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSignature('admin_officer')}
                        className="px-2 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-medium cursor-pointer text-xs"
                        title="Hapus tanda tangan digital petugas"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input Wali Kelas Per Rombel I - VI */}
              <div className="space-y-4">
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-800" />
                      <span>Pengelolaan Data Wali Kelas &amp; TTD Digital (Kelas I A &amp; B s/d VI A &amp; B)</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Gunakan dropdown untuk memilih kelas dan rombel belajar. Masing-masing wali kelas memiliki tanda tangan digital tersendiri.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Dropdown Filter Kelas */}
                    <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-300 rounded shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600">Kelas:</span>
                      <select
                        value={filterKelas}
                        onChange={e => setFilterKelas(e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                      >
                        <option value="ALL">Semua Tingkat</option>
                        <option value="1">Kelas 1</option>
                        <option value="2">Kelas 2</option>
                        <option value="3">Kelas 3</option>
                        <option value="4">Kelas 4</option>
                        <option value="5">Kelas 5</option>
                        <option value="6">Kelas 6</option>
                      </select>
                    </div>

                    {/* Dropdown Filter Rombel */}
                    <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-300 rounded shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600">Rombel:</span>
                      <select
                        value={filterRombel}
                        onChange={e => setFilterRombel(e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                      >
                        <option value="ALL">Semua Rombel</option>
                        <option value="A">Rombel A</option>
                        <option value="B">Rombel B</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWaliKelas}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold flex items-center gap-1 cursor-pointer text-xs shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rombel Baru</span>
                    </button>
                  </div>
                </div>

                {/* List Kartu Wali Kelas dengan Dropdown Memilih Kelas & Rombel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(profileForm.waliKelasList || [])
                    .filter(w => {
                      const matchK = filterKelas === 'ALL' || w.kelas === filterKelas || (filterKelas === '1' && w.kelas === 'I');
                      const matchR = filterRombel === 'ALL' || w.rombel === filterRombel;
                      return matchK && matchR;
                    })
                    .map((wali, index) => {
                      const waliId = wali.id || `wk-${wali.kelas}-${wali.rombel || index}`;
                      return (
                        <div key={waliId} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 relative hover:border-slate-300 transition-colors">
                          {/* Top Header Card dengan Dropdown Memilih Kelas & Rombel */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              {/* Dropdown Memilih Tingkat Kelas */}
                              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase">Kelas:</span>
                                <select
                                  value={wali.kelas}
                                  onChange={e => handleWaliFieldChange(waliId, 'kelas', e.target.value)}
                                  className="text-xs font-black text-emerald-950 bg-transparent cursor-pointer outline-none"
                                >
                                  <option value="1">Kelas 1</option>
                                  <option value="2">Kelas 2</option>
                                  <option value="3">Kelas 3</option>
                                  <option value="4">Kelas 4</option>
                                  <option value="5">Kelas 5</option>
                                  <option value="6">Kelas 6</option>
                                </select>
                              </div>

                              {/* Dropdown Memilih Rombel (A, B) */}
                              <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                <span className="text-[10px] font-bold text-blue-800 uppercase">Rombel:</span>
                                <select
                                  value={wali.rombel || 'A'}
                                  onChange={e => handleWaliFieldChange(waliId, 'rombel', e.target.value)}
                                  className="text-xs font-black text-blue-950 bg-transparent cursor-pointer outline-none"
                                >
                                  <option value="A">Rombel A</option>
                                  <option value="B">Rombel B</option>
                                </select>
                              </div>

                              <span className="text-xs font-bold text-slate-800">
                                (Kelas {wali.kelas} {wali.rombel || 'A'})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteWaliKelas(waliId)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                              title="Hapus Rombel ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Data Guru */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                Nama Lengkap Wali Kelas &amp; Gelar:
                              </label>
                              <input
                                type="text"
                                value={wali.nama}
                                onChange={e => handleWaliFieldChange(waliId, 'nama', e.target.value)}
                                placeholder={`Nama Guru Wali Kelas ${wali.kelas} ${wali.rombel || 'A'}`}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-900 bg-white"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                  NIP Wali Kelas (ASN / PPPK):
                                </label>
                                <input
                                  type="text"
                                  value={wali.nip || ''}
                                  onChange={e => handleWaliFieldChange(waliId, 'nip', e.target.value)}
                                  placeholder="1985xxxx xxxxx x xxx"
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                  NIK Wali Kelas (Honorer / Non-ASN):
                                </label>
                                <input
                                  type="text"
                                  value={wali.nik || ''}
                                  onChange={e => handleWaliFieldChange(waliId, 'nik', e.target.value)}
                                  placeholder="360212xxxxxxxxxx (16 Digit)"
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono text-slate-800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Area Tanda Tangan Digital (TTD) Masing-Masing Wali Kelas */}
                          <div className="pt-2 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                <PenTool className="w-3 h-3 text-emerald-700" />
                                <span>Tanda Tangan Digital (TTD) Wali Kelas {wali.kelas} {wali.rombel || 'A'}:</span>
                              </span>
                              {wali.ttdUrl ? (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Ada TTD
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Belum Ada</span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Box TTD Preview */}
                              <div className="w-24 h-12 bg-white border border-slate-300 rounded flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {wali.ttdUrl ? (
                                  <img
                                    src={wali.ttdUrl}
                                    alt={`TTD ${wali.nama}`}
                                    className="max-h-11 max-w-[85px] object-contain"
                                  />
                                ) : (
                                  <span className="text-[9px] text-slate-400 italic text-center leading-tight">
                                    TTD Basah
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons TTD */}
                              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSigPadConfig({
                                    isOpen: true,
                                    targetId: waliId,
                                    title: `Wali Kelas ${wali.kelas} ${wali.rombel || 'A'}`,
                                    name: wali.nama,
                                    currentSignature: wali.ttdUrl,
                                  })}
                                  className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                                  title="Gambar tanda tangan dengan mouse atau sentuhan jari"
                                >
                                  <PenTool className="w-3 h-3 text-emerald-700" />
                                  <span>Gambar</span>
                                </button>

                                <label className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer text-[11px]" title="Unggah file foto / gambar PNG">
                                  <Upload className="w-3 h-3 text-blue-700" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleUploadTtdFile(waliId, e)}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleAutoGenerateSignature(waliId, wali.nama)}
                                  className="px-2 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                                  title="Buat paraf kaligrafi otomatis sesuai nama"
                                >
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  <span>Paraf</span>
                                </button>

                                {wali.ttdUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSignature(waliId)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded cursor-pointer"
                                    title="Hapus tanda tangan"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Petugas Administrasi / Kesiswaan */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-3">
                  Petugas Administrasi / Pengelola Kesiswaan:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Nama Petugas Admin / Kesiswaan</label>
                    <input
                      type="text"
                      value={profileForm.namaPetugasAdmin}
                      onChange={e => setProfileForm({ ...profileForm, namaPetugasAdmin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">NIP Petugas Admin</label>
                    <input
                      type="text"
                      value={profileForm.nipPetugasAdmin}
                      onChange={e => setProfileForm({ ...profileForm, nipPetugasAdmin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTITAS POKOK & BACKUP */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">NPSN</label>
                  <input
                    type="text"
                    value={profileForm.npsn}
                    onChange={e => setProfileForm({ ...profileForm, npsn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">NSS</label>
                  <input
                    type="text"
                    value={profileForm.nss}
                    onChange={e => setProfileForm({ ...profileForm, nss: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700">Alamat Lengkap Sekolah</label>
                  <input
                    type="text"
                    value={profileForm.alamat}
                    onChange={e => setProfileForm({ ...profileForm, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">RT / RW</label>
                  <input
                    type="text"
                    value={profileForm.rtRw || ''}
                    onChange={e => setProfileForm({ ...profileForm, rtRw: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    placeholder="RT 006/RW 002"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={profileForm.desaKelurahan}
                    onChange={e => setProfileForm({ ...profileForm, desaKelurahan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={profileForm.kabupatenKota}
                    onChange={e => setProfileForm({ ...profileForm, kabupatenKota: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Provinsi</label>
                  <input
                    type="text"
                    value={profileForm.provinsi}
                    onChange={e => setProfileForm({ ...profileForm, provinsi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Kode Pos</label>
                  <input
                    type="text"
                    value={profileForm.kodePos}
                    onChange={e => setProfileForm({ ...profileForm, kodePos: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Telepon Sekolah</label>
                  <input
                    type="text"
                    value={profileForm.telepon}
                    onChange={e => setProfileForm({ ...profileForm, telepon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Email Sekolah</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Website Resmi Sekolah</label>
                  <input
                    type="text"
                    value={profileForm.website || ''}
                    onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                    placeholder="sdn1cempaka@sch.id"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tahun Ajaran Aktif</label>
                  <input
                    type="text"
                    value={profileForm.tahunAjaranAktif}
                    onChange={e => setProfileForm({ ...profileForm, tahunAjaranAktif: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Semester Aktif</label>
                  <select
                    value={profileForm.semesterAktif}
                    onChange={e => setProfileForm({ ...profileForm, semesterAktif: e.target.value as '1' | '2' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-semibold bg-white"
                  >
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Tanggal Dokumen Tercetak</label>
                  <input
                    type="date"
                    value={profileForm.tanggalDokumen}
                    onChange={e => setProfileForm({ ...profileForm, tanggalDokumen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Backup & Restore Data */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-3">
                  Cadangan &amp; Pemulihan Data Seluruh Sistem (Backup JSON)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Cadangan Data (.json)</span>
                  </button>

                  <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pulihkan dari File (.json)</span>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Data Awal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 p-4">
            <span className="text-[11px] text-slate-500">
              Perubahan kop surat dan wali kelas langsung terhubung ke seluruh 28 format cetak.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded font-medium hover:bg-slate-100 cursor-pointer text-xs"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Pad Gambar Tanda Tangan */}
      {sigPadConfig && sigPadConfig.isOpen && (
        <SignaturePadModal
          isOpen={sigPadConfig.isOpen}
          onClose={() => setSigPadConfig(null)}
          title={sigPadConfig.title}
          name={sigPadConfig.name}
          currentSignature={sigPadConfig.currentSignature}
          onSave={handleSaveFromSigPad}
        />
      )}
    </div>
  );
};
