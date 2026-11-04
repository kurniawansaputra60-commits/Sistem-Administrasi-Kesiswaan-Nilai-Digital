-- ============================================================================
-- SKEMA DATABASE TIDB CLOUD SERVERLESS (MYSQL COMPATIBLE)
-- SISTEM ADMINISTRASI KESISWAAN & BUKU INDUK DIGITAL (MULTI-TENANCY)
-- Engine: TiDB v8.5.3 (AWS ap-southeast-1)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_kesiswaan_sekolah` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_kesiswaan_sekolah`;

-- 1. TABEL PROFIL SEKOLAH (MULTI-TENANCY)
CREATE TABLE IF NOT EXISTS `schools` (
  `id` VARCHAR(50) NOT NULL COMMENT 'ID Unik Sekolah / NPSN (e.g. 20602495)',
  `nama_sekolah` VARCHAR(150) NOT NULL,
  `pemerintah_daerah` VARCHAR(150) DEFAULT 'PEMERINTAH KABUPATEN LEBAK',
  `dinas_pendidikan` VARCHAR(150) DEFAULT 'DINAS PENDIDIKAN',
  `uptd_satuan_pendidikan` VARCHAR(150) DEFAULT 'UPTD SATUAN PENDIDIKAN SD NEGERI 1 CEMPAKA',
  `akreditasi` VARCHAR(20) DEFAULT 'Terakreditasi B',
  `npsn` VARCHAR(20) NOT NULL,
  `nss` VARCHAR(30) NOT NULL,
  `alamat` TEXT NOT NULL,
  `desa_kelurahan` VARCHAR(100),
  `kecamatan` VARCHAR(100),
  `kabupaten_kota` VARCHAR(100),
  `provinsi` VARCHAR(100),
  `kode_pos` VARCHAR(10),
  `telepon` VARCHAR(30),
  `email` VARCHAR(100),
  `website` VARCHAR(100),
  `nama_kepala_sekolah` VARCHAR(120),
  `nip_kepala_sekolah` VARCHAR(30),
  `kepala_sekolah_ttd_url` LONGTEXT,
  `nama_wali_kelas` VARCHAR(120),
  `nip_wali_kelas` VARCHAR(30),
  `nama_petugas_admin` VARCHAR(120) DEFAULT 'KURNIAWAN SAPUTRA',
  `nip_petugas_admin` VARCHAR(30) DEFAULT '19890906 202521 1 004',
  `petugas_admin_ttd_url` LONGTEXT,
  `logo_sekolah_url` LONGTEXT,
  `logo_daerah_url` LONGTEXT,
  `kop_banner_url` LONGTEXT,
  `use_banner_kop` TINYINT(1) DEFAULT 1,
  `tahun_ajaran_aktif` VARCHAR(20) NOT NULL DEFAULT '2025/2026',
  `semester_aktif` ENUM('1', '2') NOT NULL DEFAULT '2',
  `tanggal_dokumen` VARCHAR(30),
  `wali_kelas_list_json` LONGTEXT COMMENT 'Daftar Wali Kelas Format JSON',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_npsn` (`npsn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL SISWA (BUKU INDUK & KESISWAAN LENGKAP)
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID Siswa Primary Key',
  `school_id` VARCHAR(50) NOT NULL COMMENT 'FK Multi-tenancy ke schools.id',
  `nis` VARCHAR(30) NOT NULL COMMENT 'Nomor Induk Siswa Lokal',
  `nisn` VARCHAR(30) NOT NULL COMMENT 'Nomor Induk Siswa Nasional',
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `nama_panggilan` VARCHAR(50),
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_lahir` VARCHAR(100),
  `tanggal_lahir` DATE,
  `agama` VARCHAR(30) DEFAULT 'Islam',
  `kewarganegaraan` VARCHAR(30) DEFAULT 'WNI',
  `anak_ke` SMALLINT DEFAULT 1,
  `jumlah_saudara` SMALLINT DEFAULT 0,
  `bahasa_sehari_hari` VARCHAR(50) DEFAULT 'Indonesia',
  `alamat` TEXT,
  `kelurahan` VARCHAR(100),
  `kecamatan` VARCHAR(100),
  `kabupaten_kota` VARCHAR(100),
  `provinsi` VARCHAR(100),
  `telepon` VARCHAR(30),
  `no_hp` VARCHAR(30),
  `status_siswa` ENUM('calon', 'aktif', 'mutasi_keluar', 'lulus', 'tinggal_kelas') NOT NULL DEFAULT 'aktif',
  `kelas_sekarang` VARCHAR(10) NOT NULL COMMENT 'I, II, III, IV, V, VI',
  `rombel` VARCHAR(10) NOT NULL DEFAULT 'A',
  `tanggal_diterima` DATE,
  `diterima_di_kelas` VARCHAR(10) DEFAULT 'I',
  `asal_sekolah` VARCHAR(150),
  `no_ijazah_sebelumnya` VARCHAR(50),
  `tahun_ijazah` VARCHAR(10),
  `ayah_nama` VARCHAR(120),
  `ayah_tahun_lahir` VARCHAR(10),
  `ayah_pendidikan` VARCHAR(50),
  `ayah_pekerjaan` VARCHAR(100),
  `ayah_penghasilan` VARCHAR(50),
  `ayah_hp` VARCHAR(30),
  `ibu_nama` VARCHAR(120),
  `ibu_tahun_lahir` VARCHAR(10),
  `ibu_pendidikan` VARCHAR(50),
  `ibu_pekerjaan` VARCHAR(100),
  `ibu_penghasilan` VARCHAR(50),
  `ibu_hp` VARCHAR(30),
  `wali_nama` VARCHAR(120),
  `wali_hubungan` VARCHAR(50),
  `wali_pendidikan` VARCHAR(50),
  `wali_pekerjaan` VARCHAR(100),
  `wali_penghasilan` VARCHAR(50),
  `wali_hp` VARCHAR(30),
  `foto_url` TEXT,
  `keterangan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_school_nis` (`school_id`, `nis`),
  INDEX `idx_school_kelas` (`school_id`, `kelas_sekarang`, `rombel`),
  INDEX `idx_nisn` (`nisn`),
  INDEX `idx_status` (`school_id`, `status_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL NILAI MATA PELAJARAN PER SEMESTER (GRADES)
CREATE TABLE IF NOT EXISTS `student_grades` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `semester_key` VARCHAR(30) NOT NULL COMMENT 'e.g. 2025/2026-1 atau 2025/2026-2',
  `subject_id` VARCHAR(30) NOT NULL COMMENT 'e.g. pai, pkn, bindo, mtk, ipas, sbdp, pjok',
  `subject_name` VARCHAR(100) NOT NULL,
  `kkm` DECIMAL(5,2) DEFAULT 75.00,
  `tugas` DECIMAL(5,2) DEFAULT 0.00,
  `uts` DECIMAL(5,2) DEFAULT 0.00,
  `uas` DECIMAL(5,2) DEFAULT 0.00,
  `nilai_akhir` DECIMAL(5,2) DEFAULT 0.00,
  `predikat` ENUM('A', 'B', 'C', 'D') DEFAULT 'B',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_student_subject_sem` (`school_id`, `student_id`, `semester_key`, `subject_id`),
  INDEX `idx_student_grades` (`student_id`, `semester_key`),
  INDEX `idx_school_sem` (`school_id`, `semester_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL PRESENSI HARIAN SISWA (ATTENDANCE)
CREATE TABLE IF NOT EXISTS `daily_attendances` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `tanggal` DATE NOT NULL,
  `kelas` VARCHAR(10) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `status` ENUM('H', 'S', 'I', 'A') NOT NULL DEFAULT 'H' COMMENT 'Hadir, Sakit, Izin, Alpa',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_attendance_unique` (`school_id`, `tanggal`, `kelas`, `student_id`),
  INDEX `idx_school_date_class` (`school_id`, `kelas`, `tanggal`),
  INDEX `idx_student_attendance` (`student_id`, `tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL BUKU MUTASI SISWA (FORMAT S-14 / PS-14A)
CREATE TABLE IF NOT EXISTS `student_mutations` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `nis` VARCHAR(30) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `jenis_mutasi` ENUM('MASUK', 'KELUAR') NOT NULL,
  `tanggal_mutasi` DATE NOT NULL,
  `kelas` VARCHAR(10) NOT NULL,
  `rombel` VARCHAR(10) DEFAULT 'A',
  `semester` ENUM('1', '2') NOT NULL,
  `sekolah_asal_tujuan` VARCHAR(150) NOT NULL,
  `alasan_mutasi` TEXT NOT NULL,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `keterangan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mutasi_school_sem` (`school_id`, `semester`, `tanggal_mutasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL SURAT PANGGILAN ORANG TUA / PERINGATAN KETIDAKHADIRAN (FORMAT S-10)
CREATE TABLE IF NOT EXISTS `absence_warning_letters` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `kelas` VARCHAR(10) NOT NULL,
  `nama_orang_tua` VARCHAR(120),
  `alamat` TEXT,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `tanggal_menghadap` DATE,
  `waktu_menghadap` VARCHAR(30),
  `tempat_menghadap` VARCHAR(100),
  `jumlah_sakit` INT DEFAULT 0,
  `jumlah_izin` INT DEFAULT 0,
  `jumlah_alfa` INT DEFAULT 0,
  `catatan_wali_kelas` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_letters_school` (`school_id`, `tanggal_surat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL SURAT PERMOHONAN PINDAH SEKOLAH (FORMAT S-12)
CREATE TABLE IF NOT EXISTS `transfer_requests` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `nis` VARCHAR(30) NOT NULL,
  `nisn` VARCHAR(30),
  `kelas` VARCHAR(10) NOT NULL,
  `nama_orang_tua` VARCHAR(120),
  `pekerjaan_orang_tua` VARCHAR(100),
  `alamat_orang_tua` TEXT,
  `sekolah_tujuan` VARCHAR(150) NOT NULL,
  `alasan_pindah` TEXT NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_treq_school` (`school_id`, `tanggal_surat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL SURAT KETERANGAN PINDAH SEKOLAH (FORMAT S-13)
CREATE TABLE IF NOT EXISTS `transfer_outs` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `nis` VARCHAR(30) NOT NULL,
  `nisn` VARCHAR(30),
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_tanggal_lahir` VARCHAR(120),
  `kelas_ditinggalkan` VARCHAR(10) NOT NULL,
  `sekolah_tujuan` VARCHAR(150) NOT NULL,
  `desa_kelurahan_tujuan` VARCHAR(100),
  `kecamatan_tujuan` VARCHAR(100),
  `kabupaten_kota_tujuan` VARCHAR(100),
  `provinsi_tujuan` VARCHAR(100),
  `alasan_pindah` TEXT NOT NULL,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `catatan_kelakuan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tout_school` (`school_id`, `tanggal_surat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABEL CALON PESERTA UJIAN (FORMAT S-15)
CREATE TABLE IF NOT EXISTS `exam_candidates` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `nomor_peserta_ujian` VARCHAR(50) NOT NULL,
  `nis` VARCHAR(30) NOT NULL,
  `nisn` VARCHAR(30) NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_tanggal_lahir` VARCHAR(120),
  `kelas` VARCHAR(10) NOT NULL,
  `syarat_nilai` VARCHAR(50) DEFAULT 'Memenuhi Syarat',
  `syarat_presensi` VARCHAR(50) DEFAULT 'Memenuhi Syarat',
  `status_verifikasi` VARCHAR(50) DEFAULT 'Terverifikasi',
  `keterangan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_exam_no` (`school_id`, `nomor_peserta_ujian`),
  INDEX `idx_cand_school_class` (`school_id`, `kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABEL PRESTASI SISWA (FORMAT PS-21 & PS-22)
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `nis` VARCHAR(30) NOT NULL,
  `kelas` VARCHAR(10) NOT NULL,
  `bidang` VARCHAR(50) NOT NULL,
  `nama_prestasi` VARCHAR(150) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL,
  `peringkat` VARCHAR(50) NOT NULL,
  `tingkat` VARCHAR(50) NOT NULL,
  `tahun` VARCHAR(10) NOT NULL,
  `penyelenggara` VARCHAR(150) NOT NULL,
  `nomor_piagam` VARCHAR(100),
  `keterangan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ach_school` (`school_id`, `tahun`, `tingkat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABEL TARGET KURIKULUM & TARAF SERAP (FORMAT PS-23 & PS-24)
CREATE TABLE IF NOT EXISTS `curriculum_targets` (
  `id` VARCHAR(36) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `mata_pelajaran` VARCHAR(100) NOT NULL,
  `kelas` VARCHAR(10) NOT NULL,
  `semester` ENUM('1', '2') NOT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL,
  `kkm` DECIMAL(5,2) DEFAULT 75.00,
  `target_kurikulum_persen` DECIMAL(5,2) DEFAULT 100.00,
  `tercapai_kurikulum_persen` DECIMAL(5,2) DEFAULT 0.00,
  `taraf_serap_persen` DECIMAL(5,2) DEFAULT 0.00,
  `jumlah_siswa_tuntas` INT DEFAULT 0,
  `jumlah_siswa_belum_tuntas` INT DEFAULT 0,
  `catatan_hambatan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_curr_school` (`school_id`, `tahun_ajaran`, `semester`, `kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABEL SNAPSHOT JSON CADANGAN UNIVERSAL (OFFLINE SYNC & MULTI-DEVICE COMPATIBILITY)
CREATE TABLE IF NOT EXISTS `school_data` (
  `key_name` VARCHAR(64) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL DEFAULT '20602495',
  `data_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`, `school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
