/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider } from './context/SchoolContext';
import { useAuth } from './context/AuthContext';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentModal } from './components/StudentModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { MySQLDatabaseCenter } from './components/MySQLDatabaseCenter';
import { ExcelImportCenter } from './components/ExcelImportCenter';
import { LoginPage } from './components/LoginPage';
import { Student } from './types';

// 1. PPDB (Format S-1 s/d S-3)
import { FormatS1_RegistrationForm } from './components/formats/FormatS1_RegistrationForm';
import { FormatS2_NewStudentCandidates } from './components/formats/FormatS2_NewStudentCandidates';
import { FormatS3_AcceptedClass1 } from './components/formats/FormatS3_AcceptedClass1';

// 2. Buku Utama Data Siswa (Format S-4, S-5, PS-5a, PS-5b)
import { FormatS4_MasterBook } from './components/formats/FormatS4_MasterBook';
import { FormatS5_KlapperBook } from './components/formats/FormatS5_KlapperBook';
import { FormatPS5a_MasterKeyBook } from './components/formats/FormatPS5a_MasterKeyBook';
import { FormatPS5b_AuxiliaryMasterBook } from './components/formats/FormatPS5b_AuxiliaryMasterBook';

// 3. Statistik & Klasifikasi Siswa (Format S-6, S-7, PS-7a)
import { FormatS6_OriginDemographics } from './components/formats/FormatS6_OriginDemographics';
import { FormatS7_AgeDemographics } from './components/formats/FormatS7_AgeDemographics';
import { FormatReligionDemographics } from './components/formats/FormatReligionDemographics';

// 4. Rekapitulasi Presensi / Kehadiran (Format S-8 s/d S-11)
import { FormatS8_DailyBoard } from './components/formats/FormatS8_DailyBoard';
import { FormatS9_DailyRecap } from './components/formats/FormatS9_DailyRecap';
import { FormatS10_MonthlyAttendance } from './components/formats/FormatS10_MonthlyAttendance';
import { FormatS11_MonthlyRecap } from './components/formats/FormatS11_MonthlyRecap';

// 5. Mutasi & Pindah Sekolah (Format S-12, S-13, S-14, PS-14a)
import { FormatS12_TransferLetter } from './components/formats/FormatS12_TransferLetter';
import { FormatS13_TransferOutCert } from './components/formats/FormatS13_TransferOutCert';
import { FormatS14_SemesterMutation } from './components/formats/FormatS14_SemesterMutation';
import { FormatPS14a_ClassMutation } from './components/formats/FormatPS14a_ClassMutation';

// 6. Data Ujian & Evaluasi (Format S-15, S-16, S-17 & Leger Nilai)
import { FormatGrades_Management } from './components/formats/FormatGrades_Management';
import { FormatS15_ExamCandidates } from './components/formats/FormatS15_ExamCandidates';
import { FormatS16_ExamCard } from './components/formats/FormatS16_ExamCard';
import { FormatS17_ExamResults } from './components/formats/FormatS17_ExamResults';

// 7. Kelanjutan Studi & Kelulusan (Format S-18, S-19, S-20)
import { FormatS18_GraduateStudies } from './components/formats/FormatS18_GraduateStudies';
import { FormatS19_GradePromotion } from './components/formats/FormatS19_GradePromotion';
import { FormatS20_GraduationPromotion } from './components/formats/FormatS20_GraduationPromotion';

// 8. Prestasi & Kurikulum (Format PS-21 s/d PS-24)
import { FormatPS21_BibitUnggul } from './components/formats/FormatPS21_BibitUnggul';
import { FormatPS22_SiswaBerprestasi } from './components/formats/FormatPS22_SiswaBerprestasi';
import { FormatPS23_CurriculumRecord } from './components/formats/FormatPS23_CurriculumRecord';
import { FormatPS24_CurriculumGraph } from './components/formats/FormatPS24_CurriculumGraph';

const TAB_CONFIG: Record<NavItemKey, { title: string; formatTag?: string }> = {
  'dashboard': { title: 'Pusat Administrasi & Ringkasan Kesiswaan' },
  'excel-import': { title: 'Import & Export Data Siswa dengan Excel (.xlsx)', formatTag: 'EXCEL' },
  'mysql-database': { title: 'Pusat Pengelolaan Database MySQL', formatTag: 'MYSQL' },
  'school-settings': { title: 'Pengaturan Profil Satuan Pendidikan & Cadangan' },
  'student-grades': { title: 'Input & Leger Nilai Peserta Didik (Rapor & Semester)', formatTag: 'LEGER' },

  // 1. PPDB
  's1-registration': { title: 'Formulir Pendaftaran Peserta Didik Baru', formatTag: 'S-1' },
  's2-candidates': { title: 'Daftar Calon Peserta Didik Baru', formatTag: 'S-2' },
  's3-new-students': { title: 'Daftar Peserta Didik Baru (Siswa yang Diterima)', formatTag: 'S-3' },

  // 2. Buku Utama
  's4-master-book': { title: 'Buku Induk Siswa', formatTag: 'S-4' },
  's5-klapper': { title: 'Buku Klaper (Urut Abjad A-Z)', formatTag: 'S-5' },
  'ps5a-master-key': { title: 'Buku Kunci Induk Siswa', formatTag: 'PS-5a' },
  'ps5b-aux-master': { title: 'Buku Pembantu Induk Siswa (per Kelas)', formatTag: 'PS-5b' },

  // 3. Statistik
  's6-origin-stats': { title: 'Jumlah Siswa Menurut Kelas, Asal, dan Jenis Kelamin', formatTag: 'S-6' },
  's7-age-stats': { title: 'Jumlah Siswa Menurut Usia, Kelas, dan Jenis Kelamin', formatTag: 'S-7' },
  'ps7a-religion-stats': { title: 'Jumlah Siswa Menurut Kelas, Agama, dan Jenis Kelamin', formatTag: 'PS-7a' },

  // 4. Presensi
  's8-daily-board': { title: 'Papan Absen Harian Siswa', formatTag: 'S-8' },
  's9-daily-recap': { title: 'Buku Rekap Absen Harian Siswa', formatTag: 'S-9' },
  's10-monthly-attendance': { title: 'Buku Absen Bulanan Siswa', formatTag: 'S-10' },
  's11-monthly-recap': { title: 'Buku Rekap Absen Bulanan Siswa', formatTag: 'S-11' },

  // 5. Mutasi
  's12-transfer-request': { title: 'Surat Permohonan Pindah Sekolah', formatTag: 'S-12' },
  's13-transfer-out': { title: 'Surat Keterangan Pindah Sekolah', formatTag: 'S-13' },
  's14-mutation-semester': { title: 'Buku Mutasi Siswa Semesteran', formatTag: 'S-14' },
  'ps14a-mutation-class': { title: 'Buku Mutasi Siswa Kelas', formatTag: 'PS-14a' },

  // 6. Ujian
  's15-exam-candidates': { title: 'Daftar Calon Peserta UAS', formatTag: 'S-15' },
  's16-exam-card': { title: 'Tanda Peserta UAS (Kartu Ujian)', formatTag: 'S-16' },
  's17-exam-results': { title: 'Daftar Peserta UAS dan Prestasinya', formatTag: 'S-17' },

  // 7. Kelulusan
  's18-graduate-studies': { title: 'Daftar Siswa Masuk SLTP/MTS', formatTag: 'S-18' },
  's19-grade-promotion': { title: 'Daftar Kenaikan Kelas', formatTag: 'S-19' },
  's20-graduation': { title: 'Rekap Kelas Kenaikan dan Kelulusan', formatTag: 'S-20' },

  // 8. Prestasi & Kurikulum
  'ps21-bibit-unggul': { title: 'Daftar Prestasi Siswa (Bibit Unggul)', formatTag: 'PS-21' },
  'ps22-siswa-berprestasi': { title: 'Daftar Siswa Berprestasi', formatTag: 'PS-22' },
  'ps23-curriculum-record': { title: 'Buku Catatan Pencapaian Sasaran Kurikulum dan Taraf Serap', formatTag: 'PS-23' },
  'ps24-curriculum-graph': { title: 'Grafik Pencapaian Sasaran Kurikulum dan Taraf Serap', formatTag: 'PS-24' },
};

function MainApp() {
  const { userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Jika sedang memuat status otentikasi
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-semibold text-slate-300">Menghubungkan ke Sistem Keamanan Cloud Firebase...</p>
      </div>
    );
  }

  // Jika pengguna belum terautentikasi / belum login
  if (!userProfile) {
    return <LoginPage />;
  }

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSelectTab = (tab: NavItemKey) => {
    if (tab === 'school-settings') {
      if (userProfile?.role === 'admin') {
        setIsSettingsModalOpen(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const currentConfig = TAB_CONFIG[activeTab] || { title: 'Administrasi Sekolah' };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row print:block print:bg-white print:m-0 print:p-0 app-layout">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 print:block print:w-full print:m-0 print:p-0">
        <Header
          currentTitle={currentConfig.title}
          formatTag={currentConfig.formatTag}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:overflow-visible">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleSelectTab}
              onOpenAddStudent={handleOpenAddStudent}
            />
          )}

          {/* Excel Import/Export Center */}
          {activeTab === 'excel-import' && <ExcelImportCenter />}

          {/* Database MySQL Center */}
          {activeTab === 'mysql-database' && <MySQLDatabaseCenter />}

          {/* 1. PPDB */}
          {activeTab === 's1-registration' && <FormatS1_RegistrationForm />}
          {activeTab === 's2-candidates' && <FormatS2_NewStudentCandidates onOpenAddStudent={handleOpenAddStudent} />}
          {activeTab === 's3-new-students' && <FormatS3_AcceptedClass1 />}

          {/* 2. Buku Utama Data Siswa */}
          {activeTab === 's4-master-book' && (
            <FormatS4_MasterBook
              onEditStudent={handleEditStudent}
              onOpenAddStudent={handleOpenAddStudent}
            />
          )}
          {activeTab === 's5-klapper' && <FormatS5_KlapperBook />}
          {activeTab === 'ps5a-master-key' && <FormatPS5a_MasterKeyBook />}
          {activeTab === 'ps5b-aux-master' && <FormatPS5b_AuxiliaryMasterBook />}

          {/* 3. Statistik & Klasifikasi Siswa */}
          {activeTab === 's6-origin-stats' && <FormatS6_OriginDemographics />}
          {activeTab === 's7-age-stats' && <FormatS7_AgeDemographics />}
          {activeTab === 'ps7a-religion-stats' && <FormatReligionDemographics />}

          {/* 4. Rekapitulasi Presensi / Kehadiran */}
          {activeTab === 's8-daily-board' && <FormatS8_DailyBoard />}
          {activeTab === 's9-daily-recap' && <FormatS9_DailyRecap />}
          {activeTab === 's10-monthly-attendance' && <FormatS10_MonthlyAttendance />}
          {activeTab === 's11-monthly-recap' && <FormatS11_MonthlyRecap />}

          {/* 5. Mutasi & Pindah Sekolah */}
          {activeTab === 's12-transfer-request' && <FormatS12_TransferLetter />}
          {activeTab === 's13-transfer-out' && <FormatS13_TransferOutCert />}
          {activeTab === 's14-mutation-semester' && <FormatS14_SemesterMutation />}
          {activeTab === 'ps14a-mutation-class' && <FormatPS14a_ClassMutation />}

          {/* 6. Data Ujian & Evaluasi */}
          {activeTab === 'student-grades' && <FormatGrades_Management />}
          {activeTab === 's15-exam-candidates' && <FormatS15_ExamCandidates />}
          {activeTab === 's16-exam-card' && <FormatS16_ExamCard />}
          {activeTab === 's17-exam-results' && <FormatS17_ExamResults onNavigateToLeger={() => setActiveTab('student-grades')} />}

          {/* 7. Kelanjutan Studi & Kelulusan */}
          {activeTab === 's18-graduate-studies' && <FormatS18_GraduateStudies />}
          {activeTab === 's19-grade-promotion' && <FormatS19_GradePromotion />}
          {activeTab === 's20-graduation' && <FormatS20_GraduationPromotion />}

          {/* 8. Prestasi & Kurikulum */}
          {activeTab === 'ps21-bibit-unggul' && <FormatPS21_BibitUnggul />}
          {activeTab === 'ps22-siswa-berprestasi' && <FormatPS22_SiswaBerprestasi />}
          {activeTab === 'ps23-curriculum-record' && <FormatPS23_CurriculumRecord />}
          {activeTab === 'ps24-curriculum-graph' && <FormatPS24_CurriculumGraph />}
        </main>
      </div>

      {/* Global Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        studentToEdit={studentToEdit}
      />

      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainApp />
    </SchoolProvider>
  );
}
