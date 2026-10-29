import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
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

export interface NavItem {
  key: NavItemKey;
  label: string;
  formatTag?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavSection {
  id: string;
  title: string;
  shortTitle?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { userProfile } = useAuth();
  const role = userProfile?.role || 'admin';

  // Master katalog semua modul menu
  const allSections: Record<string, NavSection> = {
    main: {
      id: 'main',
      title: 'Menu Utama & Basis Data',
      shortTitle: 'Basis Data',
      items: [
        { key: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
        { key: 'excel-import', label: 'Import & Export Excel', icon: FileSpreadsheet },
        { key: 'mysql-database', label: 'Pusat Database MySQL', icon: Database },
        { key: 'school-settings', label: 'Pengaturan Kop & Wali Kelas', icon: Settings },
      ],
    },
    ppdb: {
      id: 'ppdb',
      title: '1. Penerimaan Siswa Baru (PPDB)',
      shortTitle: '1. PPDB',
      items: [
        { key: 's1-registration', label: 'Formulir Pendaftaran Siswa', formatTag: 'S-1', icon: UserPlus },
        { key: 's2-candidates', label: 'Daftar Calon Siswa Baru', formatTag: 'S-2', icon: Users },
        { key: 's3-new-students', label: 'Daftar Siswa Baru (Diterima)', formatTag: 'S-3', icon: Users },
      ],
    },
    bukuUtama: {
      id: 'bukuUtama',
      title: '2. Buku Utama Data Siswa',
      shortTitle: '2. Buku Utama',
      items: [
        { key: 's4-master-book', label: 'Buku Induk Siswa', formatTag: 'S-4', icon: BookOpen },
        { key: 's5-klapper', label: 'Buku Klaper (A-Z)', formatTag: 'S-5', icon: BookMarked },
        { key: 'ps5a-master-key', label: 'Buku Kunci Induk Registrasi', formatTag: 'PS-5a', icon: KeyRound },
        { key: 'ps5b-aux-master', label: 'Buku Pembantu Induk Siswa', formatTag: 'PS-5b', icon: Layers },
      ],
    },
    statistik: {
      id: 'statistik',
      title: '3. Statistik & Klasifikasi Siswa',
      shortTitle: '3. Statistik Siswa',
      items: [
        { key: 's6-origin-stats', label: 'Siswa Menurut Asal & JK', formatTag: 'S-6', icon: PieChart },
        { key: 's7-age-stats', label: 'Siswa Menurut Usia & JK', formatTag: 'S-7', icon: PieChart },
        { key: 'ps7a-religion-stats', label: 'Siswa Menurut Agama & JK', formatTag: 'PS-7a', icon: PieChart },
      ],
    },
    presensi: {
      id: 'presensi',
      title: '4. Presensi / Kehadiran',
      shortTitle: '4. Presensi',
      items: [
        { key: 's8-daily-board', label: 'Papan Absen Harian Siswa', formatTag: 'S-8', icon: CalendarCheck },
        { key: 's9-daily-recap', label: 'Buku Rekap Absen Harian', formatTag: 'S-9', icon: CalendarCheck },
        { key: 's10-monthly-attendance', label: 'Buku Absen Bulanan Siswa', formatTag: 'S-10', icon: CalendarCheck },
        { key: 's11-monthly-recap', label: 'Buku Rekap Absen Bulanan', formatTag: 'S-11', icon: CalendarCheck },
      ],
    },
    mutasi: {
      id: 'mutasi',
      title: '5. Mutasi & Pindah Sekolah',
      shortTitle: '5. Mutasi',
      items: [
        { key: 's12-transfer-request', label: 'Surat Permohonan Pindah', formatTag: 'S-12', icon: ArrowLeftRight },
        { key: 's13-transfer-out', label: 'Surat Keterangan Pindah', formatTag: 'S-13', icon: ArrowLeftRight },
        { key: 's14-mutation-semester', label: 'Buku Mutasi Semesteran', formatTag: 'S-14', icon: ArrowLeftRight },
        { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
      ],
    },
    ujian: {
      id: 'ujian',
      title: '6. Nilai & Evaluasi Ujian',
      shortTitle: '6. Evaluasi / Ujian',
      items: [
        { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
        { key: 's15-exam-candidates', label: 'Daftar Calon Peserta UAS', formatTag: 'S-15', icon: FileCheck },
        { key: 's16-exam-card', label: 'Tanda Peserta UAS (Kartu)', formatTag: 'S-16', icon: CreditCard },
        { key: 's17-exam-results', label: 'Daftar Peserta UAS & Prestasinya', formatTag: 'S-17', icon: Trophy },
      ],
    },
    kelulusan: {
      id: 'kelulusan',
      title: '7. Kelanjutan Studi & Kelulusan',
      shortTitle: '7. Kelulusan',
      items: [
        { key: 's18-graduate-studies', label: 'Daftar Masuk SLTP/MTS', formatTag: 'S-18', icon: GraduationCap },
        { key: 's19-grade-promotion', label: 'Daftar Kenaikan Kelas', formatTag: 'S-19', icon: Award },
        { key: 's20-graduation', label: 'Rekap Kenaikan & Kelulusan', formatTag: 'S-20', icon: Award },
      ],
    },
    kurikulum: {
      id: 'kurikulum',
      title: '8. Prestasi & Kurikulum',
      shortTitle: '8. Prestasi / Kur.',
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
    if (role === 'admin') {
      return Object.values(allSections);
    }

    if (role === 'guru_kelas') {
      const isClass6Teacher = userProfile?.kelasTugas === '6' || userProfile?.kelasTugas === 'VI';

      const kelulusanItems: NavItem[] = [
        { key: 's19-grade-promotion', label: 'Daftar Kenaikan Kelas', formatTag: 'S-19', icon: Award },
      ];

      if (isClass6Teacher) {
        kelulusanItems.push(
          { key: 's18-graduate-studies', label: 'Daftar Masuk SLTP/MTS', formatTag: 'S-18', icon: GraduationCap },
          { key: 's20-graduation', label: 'Rekap Kenaikan & Kelulusan', formatTag: 'S-20', icon: Award }
        );
      }

      return [
        {
          id: 'guru_main',
          title: 'Ruang Guru & Kelas',
          shortTitle: 'Ruang Guru',
          items: [
            { key: 'dashboard', label: 'Dashboard Wali Kelas', icon: LayoutDashboard },
            { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
          ],
        },
        // Buku Utama Data Siswa untuk Wali Kelas HANYA Buku Induk S-4
        {
          id: 'guru_bukuUtama',
          title: '2. Buku Utama Data Siswa',
          shortTitle: '2. Buku Utama',
          items: [
            { key: 's4-master-book', label: 'Buku Induk Siswa', formatTag: 'S-4', icon: BookOpen },
          ],
        },
        allSections.statistik,
        allSections.presensi,
        {
          id: 'guru_mutasi',
          title: '5. Mutasi Siswa Kelas',
          shortTitle: '5. Mutasi Kelas',
          items: [
            { key: 's14-mutation-semester', label: 'Buku Mutasi Semesteran', formatTag: 'S-14', icon: ArrowLeftRight },
            { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
          ],
        },
        {
          id: 'guru_ujian',
          title: '6. Evaluasi & Ujian Siswa',
          shortTitle: '6. Evaluasi',
          items: [
            { key: 'student-grades', label: 'Input & Leger Nilai Rapor', formatTag: 'LEGER', icon: Award },
            { key: 's16-exam-card', label: 'Tanda Peserta UAS (Kartu)', formatTag: 'S-16', icon: CreditCard },
            { key: 's17-exam-results', label: 'Daftar Nilai UAS Siswa', formatTag: 'S-17', icon: Trophy },
          ],
        },
        {
          id: 'guru_kelulusan',
          title: '7. Kenaikan & Kelulusan Siswa',
          shortTitle: '7. Kelulusan',
          items: kelulusanItems,
        },
        allSections.kurikulum,
      ];
    }

    if (role === 'kepala_sekolah') {
      // Sesuai permintaan: sembunyikan 'school-settings' (Pengaturan Kop & Profil) dari Kepala Sekolah!
      return [
        {
          id: 'kepsek_main',
          title: 'Menu Eksekutif Kepala Sekolah',
          shortTitle: 'Eksekutif',
          items: [
            { key: 'dashboard', label: 'Dashboard Kepala Sekolah', icon: LayoutDashboard },
          ],
        },
        allSections.bukuUtama,
        allSections.statistik,
        {
          id: 'kepsek_mutasi',
          title: '5. Laporan Mutasi Kesiswaan',
          shortTitle: '5. Mutasi',
          items: [
            { key: 'ps14a-mutation-class', label: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a', icon: ArrowLeftRight },
          ],
        },
        {
          id: 'kepsek_ujian',
          title: '6. Evaluasi & Prestasi UAS',
          shortTitle: '6. Evaluasi UAS',
          items: [
            { key: 's17-exam-results', label: 'Daftar Peserta UAS & Nilai', formatTag: 'S-17', icon: Trophy },
          ],
        },
        {
          id: 'kepsek_kelulusan',
          title: '7. Kelulusan & Kenaikan',
          shortTitle: '7. Kelulusan',
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

  // State sub-menu accordion: ID sections yang sedang terbuka
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(sec => {
      // Buka seksi yang memiliki activeTab atau default buka 2 seksi pertama
      const hasActive = sec.items.some(item => item.key === activeTab);
      initial[sec.id] = hasActive || sec.id === 'main' || sec.id === 'guru_main' || sec.id === 'kepsek_main' || sec.id === 'bukuUtama';
    });
    return initial;
  });

  // Otomatis buka sub-menu tempat tab aktif berada saat berganti tab
  useEffect(() => {
    sections.forEach(sec => {
      if (sec.items.some(i => i.key === activeTab)) {
        setOpenSections(prev => ({
          ...prev,
          [sec.id]: true,
        }));
      }
    });
  }, [activeTab]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    sections.forEach(sec => {
      updated[sec.id] = expand;
    });
    setOpenSections(updated);
  };

  const areAllExpanded = sections.every(s => openSections[s.id]);

  const getRoleBadge = () => {
    switch (role) {
      case 'guru_kelas':
        return (
          <div className="bg-blue-950/80 border border-blue-700/60 text-blue-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Wali Kelas {userProfile?.kelasTugas || '1'}{userProfile?.rombelTugas || 'A'}</span>
            </span>
            <span className="text-[9px] bg-blue-800 text-white px-1.5 py-0.2 rounded font-mono shrink-0">
              Rombel Binaan
            </span>
          </div>
        );
      case 'kepala_sekolah':
        return (
          <div className="bg-amber-950/80 border border-amber-700/60 text-amber-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Kepala Sekolah</span>
            </span>
            <span className="text-[9px] bg-amber-800 text-white px-1.5 py-0.2 rounded font-mono">
              Otorisasi &amp; SK
            </span>
          </div>
        );
      case 'admin':
        return (
          <div className="bg-purple-950/80 border border-purple-700/60 text-purple-200 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
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
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 select-none print:hidden">
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

      {/* Baris Kontrol Sub-menu (Collapse / Expand All) */}
      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/30">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
          Kategori Sub-Menu
        </span>
        <button
          onClick={() => toggleAll(!areAllExpanded)}
          className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          {areAllExpanded ? 'Tutup Semua' : 'Buka Semua'}
        </button>
      </div>

      {/* Nav List Berupa Sub-Menu Accordion Rapih */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
        {sections.map(section => {
          const isOpen = !!openSections[section.id];
          const hasActiveItem = section.items.some(item => item.key === activeTab);

          return (
            <div
              key={section.id}
              className={`rounded-xl border transition-all ${
                hasActiveItem
                  ? 'border-emerald-500/30 bg-slate-850/60 shadow-xs'
                  : 'border-slate-800/80 bg-slate-900/60'
              }`}
            >
              {/* Header Sub-Menu Accordion */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  hasActiveItem
                    ? 'text-emerald-300 font-bold bg-slate-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? (
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold tracking-wide truncate">
                    {section.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-semibold">
                    {section.items.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Daftar Sub-item */}
              {isOpen && (
                <div className="pt-1 pb-1.5 px-2 space-y-0.5 border-t border-slate-800/60">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onSelectTab(item.key)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                          isActive
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
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
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Settings */}
      {role === 'admin' && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
          {/* Profil Sekolah & Kop Surat HANYA untuk Administrator (Sesuai instruksi: sembunyikan dari Kepala Sekolah & Wali Kelas) */}
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
        </div>
      )}
    </aside>
  );
};
