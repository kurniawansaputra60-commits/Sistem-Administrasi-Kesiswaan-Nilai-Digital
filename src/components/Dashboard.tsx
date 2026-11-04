import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowLeftRight,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  BookmarkCheck,
  Database,
  Award,
  Settings,
  Trophy,
  Sparkles,
  BarChart3,
  LineChart,
  Download,
  User,
  Shield,
  ArrowRight,
  Lock,
  CheckCircle2,
  Trash2,
  KeyRound,
  AlertCircle,
  FileText,
  Plus,
  Search,
  BookOpen,
  PieChart,
  Filter,
  Cloud,
  RefreshCw,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { NavItemKey } from './Sidebar';
import { WaliKelasItem } from '../types';
import {
  downloadStudentExcelTemplate,
  exportRombelStudentsToExcel,
  exportRombelAttendanceToExcel,
  exportRombelGradesTemplateToExcel,
  exportRombelToCsv,
} from '../utils/excelHelper';
import { isKelasMatch } from '../utils/classUtils';
import { generateDigitalSignatureSvg } from '../utils/signatureUtils';
import { OfficialKop, OfficialSignature } from './OfficialKop';
import { formatTempatTanggalLahirLengkap } from '../utils/dateUtils';

interface DashboardProps {
  onNavigate: (tab: NavItemKey) => void;
  onOpenAddStudent: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAddStudent }) => {
  const { userProfile } = useAuth();
  const {
    schoolProfile,
    updateSchoolProfile,
    students,
    mutations,
    achievements,
    attendances,
    downloadMySQLDump,
    exportDataToJson,
    importDataFromJson,
    cloudSyncStatus,
    lastSyncedAt,
    forceSyncToCloud,
    pullLatestFromCloud,
  } = useSchool();

  // Active role: default to admin if not set
  const activeRole: UserRole = userProfile?.role || 'admin';

  // State for creating new Wali Kelas directly in Dashboard
  const [newWaliNama, setNewWaliNama] = useState('');
  const [newWaliKelas, setNewWaliKelas] = useState('1');
  const [newWaliRombel, setNewWaliRombel] = useState('A');
  const [newWaliIsNik, setNewWaliIsNik] = useState(false);
  const [newWaliNumber, setNewWaliNumber] = useState('');
  const [waliSuccessMsg, setWaliSuccessMsg] = useState<string | null>(null);
  const [waliErrorMsg, setWaliErrorMsg] = useState<string | null>(null);

  // State for JSON Backup & Restore
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // State for Wali Kelas Rombel Export & Print
  const [rombelExportMsg, setRombelExportMsg] = useState<string | null>(null);
  const [showRombelPrintSheet, setShowRombelPrintSheet] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleManualCloudSync = async () => {
    setIsManualSyncing(true);
    try {
      const ok = await pullLatestFromCloud();
      if (ok) {
        setWaliSuccessMsg('Sinkronisasi Cloud Berhasil! Seluruh data kesiswaan dan akun wali kelas terbaru telah dimuat dari Cloud Firebase.');
      } else {
        await forceSyncToCloud();
        setWaliSuccessMsg('Menyinkronkan data dengan Cloud Firebase.');
      }
      setTimeout(() => setWaliSuccessMsg(null), 5000);
    } catch (err: any) {
      setWaliErrorMsg(`Gagal menyinkronkan cloud: ${err.message}`);
      setTimeout(() => setWaliErrorMsg(null), 5000);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleExportJson = () => {
    try {
      const jsonStr = exportDataToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_sistem_kesiswaan_${schoolProfile.npsn || 'sdn1cempaka'}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupMsg('Cadangan data JSON berhasil diunduh! Simpan file ini di perangkat Anda untuk pemulihan aman anti hilang.');
      setTimeout(() => setBackupMsg(null), 5000);
    } catch (err: any) {
      setBackupError(`Gagal membuat cadangan JSON: ${err.message}`);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataFromJson(content);
        if (success) {
          setBackupMsg('Pemulihan data seluruh sistem berhasil! Memuat ulang halaman...');
          setBackupError(null);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setBackupError('Format file JSON tidak valid. Pastikan file cadangan sistem benar.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter rombel for admin inspection
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>('all');

  // Guru / Wali Kelas active class & rombel (locked to assigned NIP rombel)
  const teacherKelas = userProfile?.kelasTugas || '1';
  const teacherRombel = userProfile?.rombelTugas || 'A';
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherGenderFilter, setTeacherGenderFilter] = useState<'all' | 'L' | 'P'>('all');

  const activeStudents = students.filter(s => s.statusSiswa === 'aktif');
  const maleCount = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = activeStudents.filter(s => s.jenisKelamin === 'P').length;
  const calonCount = students.filter(s => s.statusSiswa === 'calon').length;

  // Filter students strictly for the teacher's assigned rombel
  const teacherRombelStudents = activeStudents.filter(
    s => isKelasMatch(s.kelasSekarang, teacherKelas) && (s.rombel || 'A') === teacherRombel
  );

  const classes = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const classStats = classes.map(cls => {
    const clsStudents = activeStudents.filter(s => s.kelasSekarang === cls);
    const l = clsStudents.filter(s => s.jenisKelamin === 'L').length;
    const p = clsStudents.filter(s => s.jenisKelamin === 'P').length;
    return {
      kelas: cls,
      l,
      p,
      total: clsStudents.length,
    };
  });

  // Handler: Buat Akun Wali Kelas Baru Langsung dari Dashboard
  const handleCreateWaliKelas = (e: React.FormEvent) => {
    e.preventDefault();
    setWaliSuccessMsg(null);
    setWaliErrorMsg(null);

    if (!newWaliNama.trim()) {
      setWaliErrorMsg('Harap masukkan nama lengkap guru & gelar.');
      return;
    }
    if (!newWaliNumber.trim()) {
      setWaliErrorMsg(newWaliIsNik ? 'Harap masukkan 16 digit NIK.' : 'Harap masukkan NIP.');
      return;
    }

    const currentList = schoolProfile.waliKelasList || [];
    const newId = `wk-${Date.now()}`;
    const newWaliItem: WaliKelasItem = {
      id: newId,
      nama: newWaliNama.trim(),
      kelas: newWaliKelas,
      rombel: newWaliRombel,
      nip: newWaliIsNik ? '' : newWaliNumber.trim(),
      nik: newWaliIsNik ? newWaliNumber.trim() : '',
      ttdUrl: generateDigitalSignatureSvg(newWaliNama.trim()),
    };

    const updatedList = [...currentList, newWaliItem];
    updateSchoolProfile({
      waliKelasList: updatedList,
    });

    setWaliSuccessMsg(
      `Akun Wali Kelas "${newWaliNama.trim()}" (Kelas ${newWaliKelas} ${newWaliRombel}) berhasil diterbitkan! Guru ini sekarang dapat langsung login menggunakan ${newWaliIsNik ? 'NIK' : 'NIP'}.`
    );
    setNewWaliNama('');
    setNewWaliNumber('');
    setTimeout(() => setWaliSuccessMsg(null), 5000);
  };

  // Handler: Hapus Akun Wali Kelas
  const handleDeleteWali = (id?: string, nama?: string) => {
    if (!id) return;
    if (window.confirm(`Hapus akun Wali Kelas "${nama || 'ini'}"? Guru ini tidak akan bisa login lagi.`)) {
      const currentList = schoolProfile.waliKelasList || [];
      const updatedList = currentList.filter(w => w.id !== id);
      updateSchoolProfile({ waliKelasList: updatedList });
      setWaliSuccessMsg(`Akun Wali Kelas "${nama}" telah dihapus.`);
      setTimeout(() => setWaliSuccessMsg(null), 3000);
    }
  };

  // =========================================================================
  // 1. DASHBOARD KHUSUS GURU / WALI KELAS
  // =========================================================================
  if (activeRole === 'guru_kelas') {
    const filteredTeacherStudents = teacherRombelStudents.filter(s => {
      if (teacherGenderFilter !== 'all' && s.jenisKelamin !== teacherGenderFilter) return false;
      if (teacherSearch.trim()) {
        const q = teacherSearch.toLowerCase();
        const matchName = s.namaLengkap.toLowerCase().includes(q);
        const matchNis = (s.nis || '').includes(q);
        const matchNisn = (s.nisn || '').includes(q);
        return matchName || matchNis || matchNisn;
      }
      return true;
    });

    // Demografi Agama Rombel Binaan
    const religionList = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'];

    return (
      <div className="space-y-6">
        {/* Banner Khusus Guru / Wali Kelas */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-300" />
                  <span>Portal Guru / Wali Kelas</span>
                </span>
                <span className="text-[11px] text-blue-200 font-mono">
                  {schoolProfile.namaSekolah} · TP {schoolProfile.tahunAjaranAktif}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white">
                Ruang Kerja Wali Kelas {teacherKelas} {teacherRombel}
              </h1>
              <p className="text-xs text-blue-100 mt-1">
                Wali Kelas: <strong className="text-white">{userProfile?.displayName}</strong> · NIP/NIK: <span className="font-mono text-blue-200">{userProfile?.nip || '-'}</span> · Akses Terkunci Khusus Rombel Binaan
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenAddStudent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Siswa Rombel Ini</span>
              </button>
              <button
                onClick={() => onNavigate('s17-exam-results')}
                className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Input Nilai Rapor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrik Rombel Binaan Guru */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Siswa Aktif Binaan</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {teacherRombelStudents.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Siswa</span>
            </div>
            <span className="text-[11px] text-blue-900 font-semibold mt-1 block">
              Kelas {teacherKelas} {teacherRombel}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Laki-laki (L)</span>
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700 font-mono tabular-nums">
                {teacherRombelStudents.filter(s => s.jenisKelamin === 'L').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Siswa</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Rombongan Belajar {teacherRombel}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Perempuan (P)</span>
              <User className="w-4 h-4 text-pink-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-pink-700 font-mono tabular-nums">
                {teacherRombelStudents.filter(s => s.jenisKelamin === 'P').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Siswi</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Rombongan Belajar {teacherRombel}</span>
          </div>

          {/* Calculate dynamic attendance stats for teacher's students */}
          {(() => {
            const teacherStudentIds = new Set(teacherRombelStudents.map(s => s.id));
            let sakitCount = 0;
            let izinCount = 0;
            let alfaCount = 0;
            let hadirCount = 0;

            attendances.forEach(att => {
              att.entries?.forEach(entry => {
                if (teacherStudentIds.has(entry.studentId)) {
                  if (entry.status === 'S') sakitCount++;
                  else if (entry.status === 'I') izinCount++;
                  else if (entry.status === 'A') alfaCount++;
                  else if (entry.status === 'H') hadirCount++;
                }
              });
            });

            const totalRecs = sakitCount + izinCount + alfaCount + hadirCount;
            const attendancePct = totalRecs > 0 ? Math.round((hadirCount / totalRecs) * 100) : 100;

            return (
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Tingkat Kehadiran</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">{attendancePct}%</span>
                  <span className="text-xs text-emerald-600 font-medium">
                    {sakitCount + izinCount + alfaCount > 0 ? `S:${sakitCount} I:${izinCount} A:${alfaCount}` : 'Optimal'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Presensi Format S-8 &amp; S-9</span>
              </div>
            );
          })()}
        </div>

        {/* Ringkasan Demografi Rombel Binaan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Komposisi Agama Siswa Rombel Ini */}
          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Komposisi Agama Rombel {teacherKelas} {teacherRombel}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('ps7a-religion-stats')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Lihat Format PS-7a &rarr;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {religionList.map(rel => {
                const count = teacherRombelStudents.filter(s => s.agama === rel).length;
                return (
                  <div key={rel} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block truncate">{rel}</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Akses Dokumen Rombel Binaan */}
          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Buku Induk &amp; Mutasi Kelas {teacherKelas} {teacherRombel}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('s4-master-book')}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Buku Induk S-4 &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('s4-master-book')}
                className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Buku Induk S-4</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-900 block mt-1">Data Siswa Rombel Ini</span>
                <span className="text-[10px] text-slate-500">{teacherRombelStudents.length} siswa binaan</span>
              </button>
              <button
                onClick={() => onNavigate('ps14a-mutation-class')}
                className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">Format PS-14a</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-900 block mt-1">Mutasi Siswa Kelas</span>
                <span className="text-[10px] text-slate-500">Keluar / Masuk Kelas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Sinkronisasi Real-time Firebase Firestore & Cadangan Sistem untuk Guru & Wali Kelas */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm md:text-base font-black text-white">
                    Sinkronisasi Cloud Firebase Firestore (Aktif &amp; Otomatis)
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    cloudSyncStatus === 'synced'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      : cloudSyncStatus === 'syncing' || cloudSyncStatus === 'initial_loading'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 animate-pulse'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      cloudSyncStatus === 'synced' ? 'bg-emerald-400 animate-ping' : cloudSyncStatus === 'syncing' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {cloudSyncStatus === 'synced'
                      ? 'Tersinkron Real-time'
                      : cloudSyncStatus === 'syncing'
                      ? 'Menyimpan ke Cloud...'
                      : cloudSyncStatus === 'initial_loading'
                      ? 'Menghubungkan Cloud...'
                      : 'Koneksi Offline'}
                  </span>
                </div>
                {lastSyncedAt && (
                  <p className="text-[11px] text-emerald-300 font-mono mt-1">
                    ✓ Terakhir tersimpan di cloud: {lastSyncedAt.toLocaleTimeString('id-ID')} WIB
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  const ok = await forceSyncToCloud();
                  if (ok) {
                    setBackupMsg('Data berhasil diverifikasi dan disinkronkan ke Cloud Firebase!');
                    setTimeout(() => setBackupMsg(null), 4000);
                  }
                }}
                disabled={cloudSyncStatus === 'syncing'}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{cloudSyncStatus === 'syncing' ? 'Menyimpan...' : 'Sinkronkan Sekarang'}</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Unduh file .JSON sebagai arsip cadangan fisik komputer Anda (opsional)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>Arsip Cadangan JSON</span>
              </button>

              <label className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95" title="Pulihkan dari file JSON lama jika diperlukan">
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                <span>Pulihkan JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {backupMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{backupMsg}</span>
            </div>
          )}
          {backupError && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="text-[11px] text-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
            <span>💡 Cloud Firebase terhubung 24/7. Data kelas 1 s.d 6 otomatis tersinkron antar pengguna tanpa perlu pengiriman file manual.</span>
            <span className="font-mono text-emerald-300 font-semibold">Instance: Firestore Real-Time DB</span>
          </div>
        </div>

        {/* Navigasi Format Wali Kelas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Menu Administrasi Wali Kelas {teacherKelas} {teacherRombel}
              </h2>
              <p className="text-xs text-slate-500">
                Akses cepat ke buku presensi, nilai rapor, mutasi kelas, dan catatan kurikulum
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded font-bold">
              Rombel: {teacherKelas}{teacherRombel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('s17-exam-results')}
              className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-400 rounded-xl text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-blue-950 group-hover:text-blue-800">
                    Buku Nilai &amp; Leger Rapor
                  </h3>
                  <p className="text-[11px] text-blue-800/80">Input Nilai TP, STS, SAS Kelas {teacherKelas}{teacherRombel}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('s8-daily-board')}
              className="p-3.5 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-400 rounded-xl text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-blue-950 group-hover:text-blue-800">
                    Papan Absen Harian Siswa
                  </h3>
                  <p className="text-[11px] text-blue-800/80">Format S-8 (Pencatatan Presensi Tiap Hari)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('s9-daily-recap')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Buku Rekap Absen Harian</h3>
                  <p className="text-[11px] text-slate-500">Format S-9 (Rekap Presensi Harian Siswa)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('ps14a-mutation-class')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Mutasi Siswa Kelas</h3>
                  <p className="text-[11px] text-slate-500">Format PS-14a (Keluar / Masuk Siswa Kelas)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Notifikasi Sukses Ekspor Rombel */}
        {rombelExportMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{rombelExportMsg}</span>
            </div>
            <button
              onClick={() => setRombelExportMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal / Sheet Pratinjau Cetak Berkas Resmi Rombel Binaan */}
        {showRombelPrintSheet && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-start p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 overflow-hidden border border-slate-300">
              {/* Top Floating Action Bar */}
              <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between gap-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Pratinjau Cetak Berkas Resmi Rombel: Kelas {teacherKelas} {teacherRombel}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Dokumen resmi siap cetak / simpan ke format PDF dengan Kop Surat dan Tanda Tangan Wali Kelas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                  <button
                    onClick={() => setShowRombelPrintSheet(false)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* Printable Sheet */}
              <div className="p-8 md:p-12 print:p-0 print:m-0 text-slate-900 text-xs">
                <OfficialKop
                  formatCode={`Rombel-${teacherKelas}${teacherRombel}`}
                  formatTitle={`DAFTAR PESERTA DIDIK ROMBONGAN BELAJAR KELAS ${teacherKelas} ${teacherRombel}`}
                  subTitle={`TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} · SEMESTER ${schoolProfile.semesterAktif === '1' ? 'GANJIL' : 'GENAP'}`}
                  kelas={`${teacherKelas} - ${teacherRombel}`}
                />

                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-slate-800 text-[11px]">
                    <thead className="bg-slate-100 text-slate-900 text-center font-bold">
                      <tr>
                        <th className="border border-slate-800 p-2 w-8">No</th>
                        <th className="border border-slate-800 p-2 w-20">NIS</th>
                        <th className="border border-slate-800 p-2 w-24">NISN</th>
                        <th className="border border-slate-800 p-2 min-w-[150px]">Nama Lengkap Siswa</th>
                        <th className="border border-slate-800 p-2 w-10">L/P</th>
                        <th className="border border-slate-800 p-2 min-w-[150px]">Tempat, Tanggal Lahir</th>
                        <th className="border border-slate-800 p-2 w-16">Agama</th>
                        <th className="border border-slate-800 p-2 min-w-[120px]">Nama Orang Tua</th>
                        <th className="border border-slate-800 p-2 min-w-[110px]">Pekerjaan</th>
                        <th className="border border-slate-800 p-2 min-w-[140px]">Alamat Lengkap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherRombelStudents.map((st, i) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="border border-slate-800 p-2 text-center font-mono">{i + 1}</td>
                          <td className="border border-slate-800 p-2 font-mono text-center">{st.nis || '-'}</td>
                          <td className="border border-slate-800 p-2 font-mono text-center">{st.nisn || '-'}</td>
                          <td className="border border-slate-800 p-2 font-bold">{st.namaLengkap}</td>
                          <td className="border border-slate-800 p-2 text-center font-bold">{st.jenisKelamin}</td>
                          <td className="border border-slate-800 p-2 text-[10px]">
                            {formatTempatTanggalLahirLengkap(st.tempatLahir, st.tanggalLahir)}
                          </td>
                          <td className="border border-slate-800 p-2 text-center">{st.agama}</td>
                          <td className="border border-slate-800 p-2">{st.dataAyah?.nama || '-'}</td>
                          <td className="border border-slate-800 p-2">{st.dataAyah?.pekerjaan || '-'}</td>
                          <td className="border border-slate-800 p-2 text-[10px]">{st.alamat || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rekapitulasi */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <span>Rekapitulasi Siswa Rombel {teacherKelas} {teacherRombel}:</span>
                  <span>Laki-Laki : {teacherRombelStudents.filter(s => s.jenisKelamin === 'L').length} Orang</span>
                  <span>Perempuan : {teacherRombelStudents.filter(s => s.jenisKelamin === 'P').length} Orang</span>
                  <span>Total : {teacherRombelStudents.length} Orang</span>
                </div>

                <OfficialSignature
                  kelas={teacherKelas}
                  rombel={teacherRombel}
                  waliKelasNama={userProfile?.displayName}
                  waliKelasNip={userProfile?.nip}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pusat Format Ekspor & Unduh Berkas Rombel Binaan */}
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                <span>Pusat Format Ekspor &amp; Cetak Berkas Rombel {teacherKelas} {teacherRombel}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Unduh berkas administrasi rombongan belajar dalam berbagai format resmi (Excel .XLSX, Rekap Presensi, Leger Nilai, CSV, &amp; PDF)
              </p>
            </div>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded font-bold self-start sm:self-auto">
              {teacherRombelStudents.length} Siswa Siap Ekspor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Format 1: Ekspor Excel Lengkap */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white hover:border-emerald-400 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    Format .XLSX
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Data Induk Siswa Rombel</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ekspor biodata lengkap rombel, orang tua, alamat, dan tanggal lahir lengkap (Hari, Tanggal Bulan Tahun).
                </p>
              </div>
              <button
                onClick={() => {
                  try {
                    exportRombelStudentsToExcel(
                      teacherRombelStudents,
                      teacherKelas,
                      teacherRombel,
                      schoolProfile.namaSekolah,
                      userProfile?.displayName
                    );
                    setRombelExportMsg(`Berhasil mengekspor Data Siswa Kelas ${teacherKelas} ${teacherRombel} ke file Excel (.xlsx).`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  } catch (e: any) {
                    setRombelExportMsg(`Gagal mengekspor: ${e?.message || 'Terjadi kesalahan sistem'}`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  }
                }}
                className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Excel Siswa (.xlsx)</span>
              </button>
            </div>

            {/* Format 2: Rekap Presensi Rombel */}
            <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white hover:border-blue-400 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                    Format Presensi
                  </span>
                  <CalendarCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Rekap Kehadiran Siswa</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ekspor rekapitulasi kehadiran Hadir (H), Sakit (S), Izin (I), Alpa (A) dan persentase kehadiran per siswa.
                </p>
              </div>
              <button
                onClick={() => {
                  try {
                    exportRombelAttendanceToExcel(
                      teacherRombelStudents,
                      attendances,
                      teacherKelas,
                      teacherRombel,
                      schoolProfile.namaSekolah
                    );
                    setRombelExportMsg(`Berhasil mengekspor Rekap Presensi Kelas ${teacherKelas} ${teacherRombel} ke file Excel (.xlsx).`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  } catch (e: any) {
                    setRombelExportMsg(`Gagal mengekspor presensi: ${e?.message || 'Terjadi kesalahan sistem'}`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  }
                }}
                className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap Presensi (.xlsx)</span>
              </button>
            </div>

            {/* Format 3: Format Leger Nilai Rapor */}
            <div className="p-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white hover:border-purple-400 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
                    Format Nilai
                  </span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Template Nilai &amp; Leger</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ekspor spreadsheet daftar siswa rombel ini dengan kolom mata pelajaran Kurikulum Merdeka yang siap diisi.
                </p>
              </div>
              <button
                onClick={() => {
                  try {
                    exportRombelGradesTemplateToExcel(
                      teacherRombelStudents,
                      teacherKelas,
                      teacherRombel,
                      schoolProfile.namaSekolah
                    );
                    setRombelExportMsg(`Berhasil mengekspor Template Nilai Kelas ${teacherKelas} ${teacherRombel} ke file Excel (.xlsx).`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  } catch (e: any) {
                    setRombelExportMsg(`Gagal mengekspor template nilai: ${e?.message || 'Terjadi kesalahan sistem'}`);
                    setTimeout(() => setRombelExportMsg(null), 5000);
                  }
                }}
                className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Nilai (.xlsx)</span>
              </button>
            </div>

            {/* Format 4: CSV & Cetak PDF */}
            <div className="p-4 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50/60 to-white hover:border-slate-400 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase">
                    CSV &amp; PDF
                  </span>
                  <Printer className="w-4 h-4 text-slate-700" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">Cetak Dokumen Resmi &amp; CSV</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cetak lembar resmi rombel dengan kop surat atau unduh file CSV untuk sinkronisasi sistem dinas.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowRombelPrintSheet(true)}
                  className="py-2 px-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  onClick={() => {
                    try {
                      exportRombelToCsv(
                        teacherRombelStudents,
                        teacherKelas,
                        teacherRombel,
                        schoolProfile.namaSekolah
                      );
                      setRombelExportMsg(`Berhasil mengekspor Data Siswa Kelas ${teacherKelas} ${teacherRombel} ke file CSV.`);
                      setTimeout(() => setRombelExportMsg(null), 5000);
                    } catch (e: any) {
                      setRombelExportMsg(`Gagal mengekspor CSV: ${e?.message || 'Terjadi kesalahan sistem'}`);
                      setTimeout(() => setRombelExportMsg(null), 5000);
                    }
                  }}
                  className="py-2 px-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>File .CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Siswa Binaan Rombel dengan Pencarian & Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Siswa Binaan: Kelas {teacherKelas} {teacherRombel}</span>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                  {filteredTeacherStudents.length} / {teacherRombelStudents.length} Siswa
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daftar peserta didik aktif dalam rombongan belajar yang Anda ampu semester ini
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-40"
                />
              </div>

              {/* Gender Filter */}
              <select
                value={teacherGenderFilter}
                onChange={e => setTeacherGenderFilter(e.target.value as 'all' | 'L' | 'P')}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">Semua JK</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>

              {/* Quick Export Button Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ekspor Rombel</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        exportRombelStudentsToExcel(teacherRombelStudents, teacherKelas, teacherRombel, schoolProfile.namaSekolah, userProfile?.displayName);
                        setRombelExportMsg(`Berhasil mengekspor Data Siswa Kelas ${teacherKelas} ${teacherRombel} ke Excel (.xlsx).`);
                        setTimeout(() => setRombelExportMsg(null), 4000);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ekspor Siswa (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        exportRombelAttendanceToExcel(teacherRombelStudents, attendances, teacherKelas, teacherRombel, schoolProfile.namaSekolah);
                        setRombelExportMsg(`Berhasil mengekspor Rekap Presensi Kelas ${teacherKelas} ${teacherRombel} ke Excel (.xlsx).`);
                        setTimeout(() => setRombelExportMsg(null), 4000);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 text-slate-800 hover:text-blue-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rekap Presensi (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        exportRombelGradesTemplateToExcel(teacherRombelStudents, teacherKelas, teacherRombel, schoolProfile.namaSekolah);
                        setRombelExportMsg(`Berhasil mengekspor Template Nilai Kelas ${teacherKelas} ${teacherRombel} ke Excel (.xlsx).`);
                        setTimeout(() => setRombelExportMsg(null), 4000);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-purple-50 text-slate-800 hover:text-purple-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>Template Nilai (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        exportRombelToCsv(teacherRombelStudents, teacherKelas, teacherRombel, schoolProfile.namaSekolah);
                        setRombelExportMsg(`Berhasil mengekspor Data Siswa Kelas ${teacherKelas} ${teacherRombel} ke CSV.`);
                        setTimeout(() => setRombelExportMsg(null), 4000);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-cyan-50 text-slate-800 hover:text-cyan-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Ekspor Data CSV (.csv)</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        setShowRombelPrintSheet(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 text-slate-800 hover:text-amber-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cetak Lembar Resmi (PDF)</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onOpenAddStudent}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Siswa</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">No</th>
                  <th className="py-2.5 px-3 text-center w-24">NIS / NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3 text-center w-12">L/P</th>
                  <th className="py-2.5 px-3">Tempat, Tanggal Lahir</th>
                  <th className="py-2.5 px-3 text-center">Agama</th>
                  <th className="py-2.5 px-3 text-center">Status Presensi</th>
                  <th className="py-2.5 px-3 text-right">Aksi Wali Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeacherStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                      {teacherSearch.trim() || teacherGenderFilter !== 'all'
                        ? 'Tidak ada siswa binaan yang cocok dengan filter pencarian.'
                        : `Belum ada siswa aktif terdaftar di Kelas ${teacherKelas} ${teacherRombel}.`}
                    </td>
                  </tr>
                ) : (
                  filteredTeacherStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-blue-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 text-center font-mono font-medium text-slate-700">
                        {s.nis || '-'}/{s.nisn || '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{s.namaLengkap}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {formatTempatTanggalLahirLengkap(s.tempatLahir, s.tanggalLahir)}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-700 font-medium">
                        {s.agama}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Aktif (100% Hadir)
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => onNavigate('s17-exam-results')}
                          className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                        >
                          Nilai
                        </button>
                        <button
                          onClick={() => onNavigate('s10-monthly-attendance')}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          Absen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DASHBOARD KHUSUS KEPALA SEKOLAH
  // =========================================================================
  if (activeRole === 'kepala_sekolah') {
    return (
      <div className="space-y-6">
        {/* Banner Khusus Kepala Sekolah */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold bg-amber-500/30 border border-amber-400/40 text-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portal Eksekutif Kepala Sekolah</span>
                </span>
                <span className="text-[11px] text-amber-200 font-mono">
                  {schoolProfile.namaSekolah}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white">
                Otorisasi Dokumen &amp; Surat Keputusan (SK) Sekolah
              </h1>
              <p className="text-xs text-amber-100 mt-1">
                Kepala Sekolah: <strong className="text-white">{schoolProfile.namaKepalaSekolah}</strong> · NIP: <span className="font-mono text-amber-200">{schoolProfile.nipKepalaSekolah}</span> · NPSN: {schoolProfile.npsn}
              </p>
            </div>

            <div className="px-3.5 py-2 bg-amber-500/20 border border-amber-400/30 text-amber-100 text-xs rounded-xl flex items-center gap-2 shrink-0 font-semibold shadow-xs">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Hak Akses: Pengesahan &amp; SK Resmi</span>
            </div>
          </div>
        </div>

        {/* Metrik Eksekutif Sekolah */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Siswa Aktif</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {activeStudents.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({maleCount} L / {femaleCount} P)
              </span>
            </div>
            <span className="text-[11px] text-amber-900 font-semibold mt-1 block">
              12 Rombongan Belajar (Kelas 1 - 6 A &amp; B)
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Mutasi Semester Ini</span>
              <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                {mutations.length}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Catatan</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Laporan Format PS-14a
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">SK Kenaikan &amp; Kelulusan</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700 font-mono tabular-nums">
                100%
              </span>
              <span className="text-xs text-purple-600 font-semibold">Tersahkan</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Format S-19 &amp; S-20 Resmi
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Prestasi Siswa Sekolah</span>
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700 font-mono tabular-nums">
                {achievements.length}
              </span>
              <span className="text-xs text-blue-600 font-semibold">Kejuaraan</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Format PS-21 &amp; PS-22
            </span>
          </div>
        </div>

        {/* Panel Otorisasi & SK Dokumen Resmi */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Panel Pengesahan SK &amp; Otorisasi Dokumen Kepala Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Dokumen resmi yang membutuhkan penandatanganan dan pengesahan Kepala Sekolah
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('s20-graduation')}
              className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-xs text-amber-950">SK Rekap Kenaikan &amp; Kelulusan</h3>
                <p className="text-[11px] text-amber-800">Format S-20 (Pengesahan Yudisium Akhir)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('s19-grade-promotion')}
              className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-xs text-amber-950">SK Kenaikan Kelas per Tingkat</h3>
                <p className="text-[11px] text-amber-800">Format S-19 (Otorisasi Hasil Kenaikan)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('ps14a-mutation-class')}
              className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-xs text-amber-950">Buku Mutasi Siswa Kelas</h3>
                <p className="text-[11px] text-amber-800">Format PS-14a (Keluar &amp; Masuk Peserta Didik)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tabel Rekapitulasi Rombel Sekolah */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Rekapitulasi Keadaan Siswa Seluruh Rombongan Belajar
              </h2>
              <p className="text-[11px] text-slate-500">
                Data resmi peserta didik aktif semester {schoolProfile.semesterAktif === '1' ? '1 (Ganjil)' : '2 (Genap)'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('s20-graduation')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 cursor-pointer"
            >
              Lihat Rekap Yudisium (S-20) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Tingkat Kelas</th>
                  <th className="py-2.5 px-4 text-center">Laki-laki (L)</th>
                  <th className="py-2.5 px-4 text-center">Perempuan (P)</th>
                  <th className="py-2.5 px-4 text-center">Jumlah Siswa</th>
                  <th className="py-2.5 px-4 text-center">Rasio Gender</th>
                  <th className="py-2.5 px-4 text-right">Aksi Eksekutif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStats.map(stat => (
                  <tr key={stat.kelas} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      Kelas {stat.kelas}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">{stat.l}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{stat.p}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-950">
                      {stat.total}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[11px] font-mono text-slate-500">
                        {stat.total > 0 ? `${Math.round((stat.l / stat.total) * 100)}% L · ${Math.round((stat.p / stat.total) * 100)}% P` : '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('s19-grade-promotion')}
                        className="text-[11px] text-amber-800 font-bold hover:underline cursor-pointer"
                      >
                        SK Kenaikan
                      </button>
                      <button
                        onClick={() => onNavigate('s17-exam-results')}
                        className="text-[11px] text-slate-600 font-medium hover:underline cursor-pointer"
                      >
                        Hasil UAS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. DASHBOARD KHUSUS ADMINISTRATOR (KONTROL PENUH & KELOLA AKUN WALI KELAS)
  // =========================================================================
  const waliList = schoolProfile.waliKelasList || [];

  return (
    <div className="space-y-6">
      {/* Banner Utama Administrator */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden border border-purple-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-bold bg-purple-500/30 border border-purple-400/40 text-purple-200 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-inner">
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                <span>Pusat Kontrol Administrator Sistem</span>
              </span>
              <span className="text-[11px] text-purple-200 font-mono bg-white/10 px-2 py-0.5 rounded">
                NPSN: {schoolProfile.npsn}
              </span>
              <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                Akses Penuh Seluruh Dashboard
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              Pusat Kendali Administrasi &amp; Manajemen Akun GTK
            </h1>
            <p className="text-xs text-purple-200 mt-1">
              Petugas Admin: <strong className="text-white">{schoolProfile.namaPetugasAdmin || 'KURNIAWAN SAPUTRA'}</strong> · NIP: <span className="font-mono text-purple-100">{schoolProfile.nipPetugasAdmin || '19890906 202521 1 004'}</span> · Mengontrol seluruh data kesiswaan &amp; pembagian rombel guru
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Siswa</span>
            </button>
            <button
              onClick={() => onNavigate('excel-import')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Impor Excel</span>
            </button>
            <button
              onClick={() => onNavigate('school-settings')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Sekolah</span>
            </button>
            <button
              onClick={handleManualCloudSync}
              disabled={isManualSyncing}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 border border-teal-500"
              title="Tarik data terbaru dari server Cloud Firebase agar semua perangkat sinkron"
            >
              <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>{isManualSyncing ? 'Menyinkronkan...' : 'Sinkronkan Cloud'}</span>
            </button>
            <button
              onClick={() => onNavigate('mysql-database')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 border border-slate-600"
            >
              <Database className="w-4 h-4" />
              <span>Backup MySQL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifikasi feedback sinkronisasi / akun */}
      {waliSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{waliSuccessMsg}</span>
        </div>
      )}
      {waliErrorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{waliErrorMsg}</span>
        </div>
      )}

      {/* Kartu Ringkasan Statistik Global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Siswa Aktif</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {activeStudents.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({maleCount} L / {femaleCount} P)
            </span>
          </div>
          <span className="text-[11px] text-purple-900 font-semibold mt-1 block">
            Terbagi dalam {classStats.length * 2} Rombongan Belajar
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Akun Wali Kelas Terdaftar</span>
            <KeyRound className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 font-mono tabular-nums">
              {waliList.length}
            </span>
            <span className="text-xs text-blue-600 font-semibold">Guru Binaan</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Login via NIP (ASN) atau NIK (Non-ASN)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Pendaftaran PPDB Calon</span>
            <UserPlus className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {calonCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Calon Siswa</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Format S-1, S-2 &amp; S-3
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Mutasi &amp; Prestasi Siswa</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">
              {mutations.length + achievements.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">Berkas Aktif</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {mutations.length} Mutasi · {achievements.length} Prestasi
          </span>
        </div>
      </div>

      {/* Status Sinkronisasi Real-time Firebase Firestore & Cadangan Sistem untuk Admin */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm md:text-base font-black text-white">
                  Pusat Sinkronisasi Cloud Firebase Firestore (Aktif &amp; Otomatis)
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  cloudSyncStatus === 'synced'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                    : cloudSyncStatus === 'syncing' || cloudSyncStatus === 'initial_loading'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 animate-pulse'
                    : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    cloudSyncStatus === 'synced' ? 'bg-emerald-400 animate-ping' : cloudSyncStatus === 'syncing' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  {cloudSyncStatus === 'synced'
                    ? 'Tersinkron Real-time'
                    : cloudSyncStatus === 'syncing'
                    ? 'Menyimpan ke Cloud...'
                    : cloudSyncStatus === 'initial_loading'
                    ? 'Menghubungkan Cloud...'
                    : 'Koneksi Offline'}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
                Seluruh pengisian nilai dan presensi dari para <strong>Wali Kelas 1 s.d 6 otomatis tersinkronisasi ke dasbor Administrator secara instan</strong> via Google Cloud Firebase Firestore. Anda dapat langsung mengawasi data tanpa menunggu pengiriman file.
              </p>
              {lastSyncedAt && (
                <p className="text-[11px] text-purple-300 font-mono mt-1">
                  ✓ Terakhir tersimpan di cloud: {lastSyncedAt.toLocaleTimeString('id-ID')} WIB
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                const ok = await forceSyncToCloud();
                if (ok) {
                  setBackupMsg('Seluruh data sistem berhasil disinkronkan ke Cloud Firebase!');
                  setTimeout(() => setBackupMsg(null), 4000);
                }
              }}
              disabled={cloudSyncStatus === 'syncing'}
              className="px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{cloudSyncStatus === 'syncing' ? 'Menyimpan...' : 'Sinkronkan Sekarang'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Unduh file .JSON sebagai arsip cadangan fisik komputer Anda (opsional)"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Arsip Cadangan JSON</span>
            </button>

            <label className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95" title="Pulihkan dari file JSON lama jika diperlukan">
              <FileText className="w-3.5 h-3.5 text-purple-300" />
              <span>Pulihkan JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {backupMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{backupMsg}</span>
          </div>
        )}
        {backupError && (
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{backupError}</span>
          </div>
        )}

        <div className="text-[11px] text-purple-200/80 flex flex-wrap items-center justify-between gap-2">
          <span>💡 Cloud Firebase Firestore aktif 24/7. Data otomatis tersimpan di cloud terpusat tanpa perlu unduh/unggah berkas JSON berkala.</span>
          <span className="font-mono text-purple-300 font-semibold">Instance: Firestore Real-Time DB</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PUSAT PEMBUATAN & KELOLA AKUN WALI KELAS (LANGSUNG DI DASHBOARD) */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-extrabold text-slate-900">
                Pusat Kelola Akun Wali Kelas &amp; Penugasan GTK
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Buat akun guru/wali kelas baru langsung dari dashboard. Data otomatis tersimpan permanen dan guru dapat langsung login menggunakan NIP atau NIK.
            </p>
          </div>

          <button
            onClick={() => onNavigate('school-settings')}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Pengaturan Lengkap Kop &amp; TTD</span>
          </button>
        </div>

        {/* Notifikasi feedback */}
        {waliSuccessMsg && (
          <div className="m-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{waliSuccessMsg}</span>
          </div>
        )}
        {waliErrorMsg && (
          <div className="m-5 p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{waliErrorMsg}</span>
          </div>
        )}

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Buat Akun Baru (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Plus className="w-4 h-4 text-purple-700" />
              <span>Form Buat Akun Wali Kelas Baru</span>
            </div>

            <form onSubmit={handleCreateWaliKelas} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Guru Lengkap &amp; Gelar *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rina Wulandari, S.Pd."
                  value={newWaliNama}
                  onChange={e => setNewWaliNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:border-purple-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkat Kelas *
                  </label>
                  <select
                    value={newWaliKelas}
                    onChange={e => setNewWaliKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold focus:border-purple-600 outline-none cursor-pointer"
                  >
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rombel *
                  </label>
                  <select
                    value={newWaliRombel}
                    onChange={e => setNewWaliRombel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold focus:border-purple-600 outline-none cursor-pointer"
                  >
                    <option value="A">Rombel A</option>
                    <option value="B">Rombel B</option>
                  </select>
                </div>
              </div>

              {/* Status Kepegawaian Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Kepegawaian &amp; Jenis Kredensial *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewWaliIsNik(false);
                      setNewWaliNumber('');
                    }}
                    className={`py-1.5 px-3 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${
                      !newWaliIsNik
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    ASN (NIP Resmi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewWaliIsNik(true);
                      setNewWaliNumber('');
                    }}
                    className={`py-1.5 px-3 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${
                      newWaliIsNik
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Non-ASN (NIK 16 Digit)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {newWaliIsNik ? 'Nomor Induk Kependudukan (NIK 16 Digit) *' : 'Nomor Induk Pegawai (NIP 18 Digit) *'}
                </label>
                <input
                  type="text"
                  placeholder={newWaliIsNik ? 'Contoh: 3602123456780001 (16 digit)' : 'Contoh: 19850312 201001 2 021'}
                  value={newWaliNumber}
                  onChange={e => setNewWaliNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:border-purple-600 outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Nomor ini akan menjadi <strong>Username</strong> dan <strong>Password</strong> bagi guru tersebut saat masuk.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Simpan &amp; Terbitkan Akun Wali Kelas</span>
              </button>
            </form>
          </div>

          {/* Tabel Akun Wali Kelas Terdaftar (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Daftar Akun Guru / Wali Kelas Aktif ({waliList.length} Akun)
                </span>
                <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                  Login NIP / NIK
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3">Rombel</th>
                      <th className="py-2 px-3">Nama Guru</th>
                      <th className="py-2 px-3">Kredensial Login (NIP / NIK)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waliList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                          Belum ada akun wali kelas yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      waliList.map(w => {
                        const isNonAsn = !!w.nik && (!w.nip || w.nip === '-');
                        return (
                          <tr key={w.id} className="hover:bg-purple-50/30">
                            <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                              Kelas {w.kelas} {w.rombel || 'A'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              {w.nama}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                              {isNonAsn ? w.nik : w.nip || '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isNonAsn
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}>
                                {isNonAsn ? 'Non-ASN (NIK)' : 'ASN (NIP)'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteWali(w.id, w.nama)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="Hapus Akun Wali Kelas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
              <span>💡 Seluruh perubahan akun langsung tersinkronisasi ke sesi login dan dokumen cetak.</span>
              <button
                onClick={() => onNavigate('school-settings')}
                className="font-bold text-purple-700 hover:underline cursor-pointer"
              >
                Atur TTD &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rekapitulasi Rombel Sekolah & Filter Inspeksi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Rekapitulasi Keadaan Siswa Seluruh Rombongan Belajar
            </h2>
            <p className="text-[11px] text-slate-500">
              Data resmi peserta didik aktif semester {schoolProfile.semesterAktif === '1' ? '1 (Ganjil)' : '2 (Genap)'} SD NEGERI 1 CEMPAKA
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Rombel:</span>
            <select
              value={selectedRombelFilter}
              onChange={e => setSelectedRombelFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:border-purple-600 outline-none cursor-pointer"
            >
              <option value="all">Semua Kelas &amp; Rombel</option>
              {classes.map(c => (
                <React.Fragment key={c}>
                  <option value={`${c}-A`}>Kelas {c} A</option>
                  <option value={`${c}-B`}>Kelas {c} B</option>
                </React.Fragment>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Tingkat Kelas</th>
                <th className="py-2.5 px-4 text-center">Laki-laki (L)</th>
                <th className="py-2.5 px-4 text-center">Perempuan (P)</th>
                <th className="py-2.5 px-4 text-center">Jumlah Siswa</th>
                <th className="py-2.5 px-4 text-center">Rasio Gender</th>
                <th className="py-2.5 px-4 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStats.map(stat => (
                <tr key={stat.kelas} className="hover:bg-purple-50/30">
                  <td className="py-2.5 px-4 font-bold text-slate-800">
                    Kelas {stat.kelas}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">{stat.l}</td>
                  <td className="py-2.5 px-4 text-center font-mono">{stat.p}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-purple-950">
                    {stat.total}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-[11px] font-mono text-slate-500">
                      {stat.total > 0 ? `${Math.round((stat.l / stat.total) * 100)}% L · ${Math.round((stat.p / stat.total) * 100)}% P` : '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => onNavigate('s4-master-book')}
                      className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      Buku Induk
                    </button>
                    <button
                      onClick={() => onNavigate('s17-exam-results')}
                      className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Nilai Rapor
                    </button>
                    <button
                      onClick={() => onNavigate('s10-monthly-attendance')}
                      className="text-[11px] text-slate-600 font-medium hover:underline cursor-pointer"
                    >
                      Presensi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2.5 px-4 text-slate-900">Total Seluruh Sekolah</td>
                <td className="py-2.5 px-4 text-center font-mono">{maleCount}</td>
                <td className="py-2.5 px-4 text-center font-mono">{femaleCount}</td>
                <td className="py-2.5 px-4 text-center font-mono text-purple-950 font-black">
                  {activeStudents.length}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-xs text-slate-600">
                  100%
                </td>
                <td className="py-2.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Navigasi Lengkap Seluruh 28 Format Cetak Resmi */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Akses Pintas 28 Buku Administrasi Resmi Kesiswaan (S-1 s/d PS-24)
          </h2>
          <p className="text-xs text-slate-500">
            Administrator memiliki akses penuh ke seluruh buku induk, mutasi, ujian, statistik, dan kelulusan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('s4-master-book')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Buku Induk Siswa (S-4)</h3>
              <p className="text-[11px] text-slate-500">Lembar Induk Siswa Lengkap</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('s5-klapper')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Buku Klapper Siswa (S-5)</h3>
              <p className="text-[11px] text-slate-500">Indeks Abjad Siswa Resmi</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('ps5a-master-key')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Buku Kunci Induk (PS-5a)</h3>
              <p className="text-[11px] text-slate-500">Kunci Registrasi &amp; Ijazah</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('ps5b-aux-master')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Buku Pembantu Induk (PS-5b)</h3>
              <p className="text-[11px] text-slate-500">Buku Induk per Rombel Kelas</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('s14-mutation-semester')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Mutasi Semesteran (S-14)</h3>
              <p className="text-[11px] text-slate-500">Laporan Mutasi ke Dinas</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('s17-exam-results')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Prestasi Nilai UAS (S-17)</h3>
              <p className="text-[11px] text-slate-500">Rekapitulasi Nilai &amp; Kelulusan</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('s20-graduation')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Rekap Kenaikan / Lulus (S-20)</h3>
              <p className="text-[11px] text-slate-500">SK Yudisium Seluruh Tingkat</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('ps21-bibit-unggul')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Siswa Berprestasi (PS-21)</h3>
              <p className="text-[11px] text-slate-500">Bibit Unggul &amp; Kejuaraan</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
