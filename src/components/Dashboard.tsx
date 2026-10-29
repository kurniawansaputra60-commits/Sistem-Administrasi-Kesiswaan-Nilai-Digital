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
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { NavItemKey } from './Sidebar';
import { WaliKelasItem } from '../types';
import { downloadStudentExcelTemplate } from '../utils/excelHelper';
import { isKelasMatch } from '../utils/classUtils';
import { generateDigitalSignatureSvg } from '../utils/signatureUtils';

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
    downloadMySQLDump,
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

  // Filter rombel for admin inspection
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>('all');

  // Guru / Wali Kelas active class & rombel (locked to assigned NIP rombel)
  const teacherKelas = userProfile?.kelasTugas || '1';
  const teacherRombel = userProfile?.rombelTugas || 'A';

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
                  {schoolProfile.namaSekolah}
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
                <span>+ Siswa Rombel Ini</span>
              </button>
              <button
                onClick={() => onNavigate('student-grades')}
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

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Kehadiran Hari Ini</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">100%</span>
              <span className="text-xs text-emerald-600 font-medium">Optimal</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Presensi Format S-8 &amp; S-9</span>
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
              onClick={() => onNavigate('student-grades')}
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

        {/* Tabel Siswa Binaan Rombel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Siswa Binaan: Kelas {teacherKelas} {teacherRombel}</span>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                  {teacherRombelStudents.length} Siswa
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daftar peserta didik aktif dalam rombongan belajar yang Anda ampu semester ini
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddStudent}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Siswa</span>
              </button>
              <button
                onClick={() => onNavigate('student-grades')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Input Nilai Rapor Rombel</span>
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
                {teacherRombelStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                      Belum ada siswa aktif terdaftar di Kelas {teacherKelas} {teacherRombel}.
                    </td>
                  </tr>
                ) : (
                  teacherRombelStudents.map((s, idx) => (
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
                      <td className="py-2 px-3 text-slate-600">
                        {s.tempatLahir}, {s.tanggalLahir}
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
                          onClick={() => onNavigate('student-grades')}
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

            <button
              onClick={() => onNavigate('school-settings')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-2 shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span>Kop Surat &amp; Tanda Tangan Resmi</span>
            </button>
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
              Laporan Format S-14 &amp; PS-14a
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
              onClick={() => onNavigate('s14-mutation-semester')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-xs text-slate-900">Laporan Mutasi Kesiswaan Dinas</h3>
                <p className="text-[11px] text-slate-500">Format S-14 (Keluar &amp; Masuk Peserta Didik)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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
              onClick={() => onNavigate('mysql-database')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 border border-slate-600"
            >
              <Database className="w-4 h-4" />
              <span>Backup MySQL</span>
            </button>
          </div>
        </div>
      </div>

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
                      onClick={() => onNavigate('student-grades')}
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
