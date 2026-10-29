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
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { NavItemKey } from './Sidebar';
import { downloadStudentExcelTemplate } from '../utils/excelHelper';
import { isKelasMatch } from '../utils/classUtils';

interface DashboardProps {
  onNavigate: (tab: NavItemKey) => void;
  onOpenAddStudent: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAddStudent }) => {
  const { userProfile } = useAuth();
  const {
    schoolProfile,
    students,
    mutations,
    achievements,
    downloadMySQLDump,
  } = useSchool();

  // Active role to determine which view to display
  const activeRole: UserRole = userProfile?.role === 'guru_kelas' ? 'guru_kelas' : 'kepala_sekolah';

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
  const teacherMale = teacherRombelStudents.filter(s => s.jenisKelamin === 'L').length;
  const teacherFemale = teacherRombelStudents.filter(s => s.jenisKelamin === 'P').length;

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
                Wali Kelas: <strong className="text-white">{userProfile?.displayName || 'Siti Rahmah, S.Pd.SD'}</strong> · NIP: <span className="font-mono text-blue-200">{userProfile?.nip || '19850312 201001 2 021'}</span> · T.A. {schoolProfile.tahunAjaranAktif} Sem. {schoolProfile.semesterAktif === '1' ? 'Ganjil' : 'Genap'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenAddStudent}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Siswa</span>
              </button>

              {/* Badge Rombel Binaan Terkunci */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl flex items-center gap-2 shrink-0">
                <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[10px] text-blue-200 font-semibold block uppercase tracking-wider">Rombel Binaan Terkunci:</span>
                  <span className="text-xs font-black text-white font-mono">
                    Kelas {teacherKelas} Rombel {teacherRombel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrik Khusus Rombel yang Diampu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Siswa Rombel Ini</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {teacherRombelStudents.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({teacherMale} L / {teacherFemale} P)
              </span>
            </div>
            <span className="text-[11px] text-blue-800 font-semibold mt-1 block">
              Kelas {teacherKelas} Rombel {teacherRombel}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Presensi Bulan Ini</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                97.2%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Hadir</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Format S-10 Bulanan &amp; S-8 Harian
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Leger &amp; Nilai Rapor</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">
                {teacherRombelStudents.length}/{teacherRombelStudents.length}
              </span>
              <span className="text-xs text-amber-800 font-semibold">Tersinkron</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Leger Nilai Semester Aktif
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Target Kurikulum</span>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700 font-mono tabular-nums">
                88.5%
              </span>
              <span className="text-xs text-purple-600 font-semibold">Tuntas</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Format PS-23 &amp; PS-24 Grafik
            </span>
          </div>
        </div>

        {/* Menu Aksi Cepat Guru / Wali Kelas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Menu Administrasi Guru &amp; Wali Kelas
              </h2>
              <p className="text-xs text-slate-500">
                Peralatan harian untuk pengelolaan nilai, absensi harian, jurnal kurikulum, dan kenaikan kelas
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Khusus Kelas {teacherKelas} {teacherRombel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('student-grades')}
              className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 rounded-xl text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-amber-950 group-hover:text-amber-800">
                    Input &amp; Leger Nilai Rapor
                  </h3>
                  <p className="text-[11px] text-amber-800/80">Format LEGER (Nilai Tugas, UTS &amp; UAS)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('s10-monthly-attendance')}
              className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-400 rounded-xl text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950 group-hover:text-emerald-800">
                    Buku Absen Bulanan Siswa
                  </h3>
                  <p className="text-[11px] text-emerald-800/80">Format S-10 (Kehadiran &amp; Rekapitulasi)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
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
              onClick={() => onNavigate('ps23-curriculum-record')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Catatan Sasaran Kurikulum</h3>
                  <p className="text-[11px] text-slate-500">Format PS-23 (Taraf Serap &amp; Ketuntasan)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('ps24-curriculum-graph')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Grafik Capaian Kurikulum</h3>
                  <p className="text-[11px] text-slate-500">Format PS-24 (Visualisasi Daya Serap)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('ps21-bibit-unggul')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Prestasi Siswa (Bibit Unggul)</h3>
                  <p className="text-[11px] text-slate-500">Format PS-21 &amp; PS-22 (Siswa Berprestasi)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('s19-grade-promotion')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Daftar Kenaikan Kelas</h3>
                  <p className="text-[11px] text-slate-500">Format S-19 (Penetapan Kenaikan Siswa)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('ps14a-mutation-class')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Buku Mutasi Siswa Kelas</h3>
                  <p className="text-[11px] text-slate-500">Format PS-14a (Catatan Pindah Kelas)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tabel Siswa di Rombel yang Diampu */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
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
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <div className="font-bold text-slate-800">{s.nis}</div>
                        <div className="text-[10px] text-slate-400">{s.nisn}</div>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {s.namaLengkap}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {s.jenisKelamin === 'L' ? (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">L</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">P</span>
                        )}
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

          <button
            onClick={() => onNavigate('s17-exam-results')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Laporan Prestasi &amp; Nilai UAS</h3>
              <p className="text-[11px] text-slate-500">Format S-17 (Hasil Ujian Akhir Semester)</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('s7-age-stats')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Statistik Demografi Usia Siswa</h3>
              <p className="text-[11px] text-slate-500">Format S-7 (Matriks Usia &amp; Gender per 1 Juli)</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('school-settings')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xs text-slate-900">Pengaturan Kop Surat &amp; Wali Kelas</h3>
              <p className="text-[11px] text-slate-500">Kelola TTD Digital &amp; SK Pembagian Tugas</p>
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
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2.5 px-4 text-slate-900">Total Seluruh Sekolah</td>
                <td className="py-2.5 px-4 text-center font-mono">{maleCount}</td>
                <td className="py-2.5 px-4 text-center font-mono">{femaleCount}</td>
                <td className="py-2.5 px-4 text-center font-mono text-amber-950 font-black">
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
    </div>
  );
};
