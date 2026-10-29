import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  PieChart,
  CalendarCheck,
  ArrowLeftRight,
  GraduationCap,
  Award,
  BarChart3,
  Building2,
  Database,
  FileSpreadsheet,
  KeyRound,
  FileCheck,
  CreditCard,
  Trophy,
  LineChart,
  BookMarked,
  Layers,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavItemKey =
  | 'dashboard'
  // 1. PPDB
  | 's1-registration'
  | 's2-candidates'
  | 's3-new-students'
  // 2. Buku Utama Data Siswa
  | 's4-master-book'
  | 's5-klapper'
  | 'ps5a-master-key'
  | 'ps5b-aux-master'
  // 3. Statistik & Klasifikasi Siswa
  | 's6-origin-stats'
  | 's7-age-stats'
  | 'ps7a-religion-stats'
  // 4. Presensi / Kehadiran
  | 's8-daily-board'
  | 's9-daily-recap'
  | 's10-monthly-attendance'
  | 's11-monthly-recap'
  // 5. Mutasi & Pindah Sekolah
  | 's12-transfer-request'
  | 's13-transfer-out'
  | 's14-mutation-semester'
  | 'ps14a-mutation-class'
  // 6. Data Ujian & Evaluasi
  | 'student-grades'
  | 's15-exam-candidates'
  | 's16-exam-card'
  | 's17-exam-results'
  // 7. Kelanjutan Studi & Kelulusan
  | 's18-graduate-studies'
  | 's19-grade-promotion'
  | 's20-graduation'
  // 8. Prestasi & Kurikulum
  | 'ps21-bibit-unggul'
  | 'ps22-siswa-berprestasi'
  | 'ps23-curriculum-record'
  | 'ps24-curriculum-graph'
  // Database & Tools
  | 'excel-import'
  | 'mysql-database'
  | 'school-settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

interface NavSection {
  title: string;
  items: {
    key: NavItemKey;
    label: string;
    formatTag?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { userProfile } = useAuth();
  const [showAllMenus, setShowAllMenus] = useState(false);

  const role = userProfile?.role || 'admin';

  // Master katalog semua menu
  const allSections: Record<string, NavSection> = {
    main: {
      title: 'Menu Utama',
      items: [
        { key: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
        { key: 'excel-import', label: 'Import & Export Excel', icon: FileSpreadsheet },
        { key: 'mysql-database', label: 'Pusat Database MySQL', icon: Database },
        { key: 'school-settings', label: 'Pengaturan Kop & Wali Kelas', icon: Settings },
      ],
    },
    ppdb: {
      title: '1. Penerimaan Siswa Baru (PPDB)',
      items: [
        { key: 's1-registration', label: 'Formulir Pendaftaran Siswa Baru', formatTag: 'S-1', icon: UserPlus },
        { key: 's2-candidates', label: 'Daftar Calon Siswa Baru', formatTag: 'S-2', icon: Users },
        { key: 's3-new-students', label: 'Daftar Siswa Baru (Diterima)', formatTag: 'S-3', icon: Users },
      ],
    },
    bukuUtama: {
      title: '2. Buku Utama Data Siswa',
      items: [
        { key: 's4-master-book', label: 'Buku Induk', formatTag: 'S-4', icon: BookOpen },
        { key: 's5-klapper', label: 'Buku Klaper', formatTag: 'S-5', icon: BookMarked },
        { key: 'ps5a-master-key', label: 'Buku Kunci Induk', formatTag: 'PS-5a', icon: KeyRound },
        { key: 'ps5b-aux-master', label: 'Buku Pembantu Induk', formatTag: 'PS-5b', icon: Layers },
      ],
    },
    statistik: {
      title: '3. Statistik & Klasifikasi Siswa',
      items: [
        { key: 's6-origin-stats', label: 'Siswa Menurut Asal & JK', formatTag: 'S-6', icon: PieChart },
        { key: 's7-age-stats', label: 'Siswa Menurut Usia & JK', formatTag: 'S-7', icon: PieChart },
        { key: 'ps7a-religion-stats', label: 'Siswa Menurut Agama & JK', formatTag: 'PS-7a', icon: PieChart },
      ],
    },
    presensi: {
      title: '4. Rekapitulasi Presensi / Kehadiran',
      items: [
        { key: 's8-daily-board', label: 'Papan Absen Harian Siswa', formatTag: 'S-8', icon: CalendarCheck },
        { key: 's9-daily-recap', label: 'Buku Rekap Absen Harian Siswa', formatTag: 'S-9', icon: CalendarCheck },
        { key: 's10-monthly-attendance', label: 'Buku Absen Bulanan Siswa', formatTag: 'S-10', icon: CalendarCheck },
        { key: 's11-monthly-recap', label: 'Buku Rekap Absen Bulanan Siswa', formatTag: 'S-11', icon: CalendarCheck },
      ],
    },
    mutasi: {
      title: '5. Mutasi & Pindah Sekolah',
      items: [
        { key: 's12-transfer-request', label: 'Surat Permohonan Pindah Sekolah', formatTag: 'S-12', icon: ArrowLeftRight },
        { key: 's13-transfer-out', label: 'Surat Keterangan Pindah Sekolah', formatTag: 'S-13', icon: ArrowLeftRight },
        { key: 's14-mutation-semester', label: 'Buku Mutasi Siswa Semesteran', formatTag: 'S-14', icon: ArrowLeftRight },
        { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
      ],
    },
    ujian: {
      title: '6. Data Nilai & Ujian / Evaluasi',
      items: [
        { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
        { key: 's15-exam-candidates', label: 'Daftar Calon Peserta UAS', formatTag: 'S-15', icon: FileCheck },
        { key: 's16-exam-card', label: 'Tanda Peserta UAS (Kartu)', formatTag: 'S-16', icon: CreditCard },
        { key: 's17-exam-results', label: 'Daftar Peserta UAS & Prestasinya', formatTag: 'S-17', icon: Trophy },
      ],
    },
    kelulusan: {
      title: '7. Kelanjutan Studi & Kelulusan',
      items: [
        { key: 's18-graduate-studies', label: 'Daftar Siswa Masuk SLTP/MTS', formatTag: 'S-18', icon: GraduationCap },
        { key: 's19-grade-promotion', label: 'Daftar Kenaikan Kelas', formatTag: 'S-19', icon: Award },
        { key: 's20-graduation', label: 'Rekap Kelas Kenaikan & Kelulusan', formatTag: 'S-20', icon: Award },
      ],
    },
    kurikulum: {
      title: '8. Prestasi & Kurikulum',
      items: [
        { key: 'ps21-bibit-unggul', label: 'Daftar Prestasi (Bibit Unggul)', formatTag: 'PS-21', icon: Sparkles },
        { key: 'ps22-siswa-berprestasi', label: 'Daftar Siswa Berprestasi', formatTag: 'PS-22', icon: Trophy },
        { key: 'ps23-curriculum-record', label: 'Catatan Sasaran Kurikulum', formatTag: 'PS-23', icon: BarChart3 },
        { key: 'ps24-curriculum-graph', label: 'Grafik Capaian Kurikulum', formatTag: 'PS-24', icon: LineChart },
      ],
    },
  };

  // Filter sections sesuai peran pengguna
  const getVisibleSections = (): NavSection[] => {
    if (showAllMenus || role === 'admin') {
      return Object.values(allSections);
    }

    if (role === 'guru_kelas') {
      return [
        {
          title: 'Ruang Guru / Wali Kelas',
          items: [
            { key: 'dashboard', label: 'Dashboard Wali Kelas', icon: LayoutDashboard },
            { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
          ],
        },
        allSections.presensi,
        {
          title: '6. Evaluasi & Nilai Kelas',
          items: [
            { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
            { key: 's17-exam-results', label: 'Daftar Peserta UAS & Nilai', formatTag: 'S-17', icon: Trophy },
          ],
        },
        {
          title: '7. Kenaikan Kelas',
          items: [
            { key: 's19-grade-promotion', label: 'Daftar Kenaikan Kelas', formatTag: 'S-19', icon: Award },
          ],
        },
        allSections.kurikulum,
        {
          title: '5. Mutasi Kelas',
          items: [
            { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
          ],
        },
      ];
    }

    if (role === 'kepala_sekolah') {
      return [
        {
          title: 'Menu Eksekutif',
          items: [
            { key: 'dashboard', label: 'Dashboard Kepala Sekolah', icon: LayoutDashboard },
            { key: 'school-settings', label: 'Pengaturan Kop & Wali Kelas', icon: Settings },
          ],
        },
        allSections.statistik,
        {
          title: '5. Laporan Mutasi Kesiswaan',
          items: [
            { key: 's14-mutation-semester', label: 'Buku Mutasi Semesteran', formatTag: 'S-14', icon: ArrowLeftRight },
            { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
          ],
        },
        {
          title: '6. Evaluasi & Prestasi UAS',
          items: [
            { key: 's17-exam-results', label: 'Daftar Peserta UAS & Nilai', formatTag: 'S-17', icon: Trophy },
          ],
        },
        {
          title: '7. Kelulusan & Kenaikan',
          items: [
            { key: 's19-grade-promotion', label: 'Daftar Kenaikan Kelas', formatTag: 'S-19', icon: Award },
            { key: 's20-graduation', label: 'Rekap Kenaikan & Kelulusan', formatTag: 'S-20', icon: Award },
          ],
        },
        allSections.kurikulum,
      ];
    }

    return Object.values(allSections);
  };

  const sections = getVisibleSections();

  const getRoleBadge = () => {
    switch (role) {
      case 'guru_kelas':
        return (
          <div className="bg-blue-950/80 border border-blue-700/60 text-blue-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between">
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">Wali Kelas {userProfile?.kelasTugas || '1'}{userProfile?.rombelTugas || 'A'}</span>
            </span>
            <span className="text-[9px] bg-blue-800 text-white px-1.5 py-0.2 rounded font-mono shrink-0">
              Rombel Binaan
            </span>
          </div>
        );
      case 'kepala_sekolah':
        return (
          <div className="bg-amber-950/80 border border-amber-700/60 text-amber-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Kepala Sekolah</span>
            </span>
            <span className="text-[9px] bg-amber-800 text-white px-1.5 py-0.2 rounded font-mono">
              Otorisasi &amp; SK
            </span>
          </div>
        );
      case 'admin':
        return (
          <div className="bg-purple-950/80 border border-purple-700/60 text-purple-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Administrator</span>
            </span>
            <span className="text-[9px] bg-purple-800 text-white px-1.5 py-0.2 rounded font-mono">
              Akses Penuh
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-68 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 select-none print:hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-0.5 border border-white/20 shadow-md shrink-0">
            <img
              src="/assets/aistudio/llogo_06ce9f11.png"
              alt="Logo SDN 1 Cempaka"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-black text-white tracking-tight truncate uppercase">
              SD NEGERI 1 CEMPAKA
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono truncate">
              Format Resmi S-1 s/d PS-24
            </p>
          </div>
        </div>

        {/* Role Badge Indicator */}
        {getRoleBadge()}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            <h2 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>
                    {item.formatTag && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 font-bold ml-1.5 ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.formatTag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
        {/* Toggle Lihat Semua Menu hanya untuk Kepala Sekolah / Admin, Sembunyikan untuk Guru Kelas */}
        {role === 'kepala_sekolah' && (
          <button
            onClick={() => setShowAllMenus(!showAllMenus)}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
          >
            {showAllMenus ? (
              <>
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>Tampilkan Menu Peran Saya Saja</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Lihat Semua Format (24 Format)</span>
              </>
            )}
          </button>
        )}

        {(role === 'kepala_sekolah' || role === 'admin') && (
          <button
            onClick={() => onSelectTab('school-settings')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'school-settings'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profil Sekolah &amp; Kop Surat</span>
          </button>
        )}
      </div>
    </aside>
  );
};
