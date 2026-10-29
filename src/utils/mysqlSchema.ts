import {
  SchoolProfile,
  Student,
  DailyAttendanceRecord,
  AbsenceWarningLetter,
  TransferRequestLetter,
  TransferOutCertificate,
  TransferInConfirmation,
  ExamCandidate,
  ExamSession,
  GraduateStudyRecord,
} from '../types';

export function generateMySQLDump(
  school: SchoolProfile,
  students: Student[],
  attendances: DailyAttendanceRecord[],
  warningLetters: AbsenceWarningLetter[],
  transferRequests: TransferRequestLetter[],
  transferOuts: TransferOutCertificate[],
  transferIns: TransferInConfirmation[],
  examCandidates: ExamCandidate[],
  examSessions: ExamSession[],
  gradStudies: GraduateStudyRecord[]
): string {
  const escapeSql = (str: any) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number') return str;
    return `'${String(str).replace(/'/g, "\\'")}'`;
  };

  const sql: string[] = [];

  sql.push(`-- ==========================================================`);
  sql.push(`-- SISTEM ADMINISTRASI KESISWAAN DIGITAL (FORMAT S-1 S/D S-20)`);
  sql.push(`-- DUMP DATABASE MYSQL STANDAR DEPKIKNAS / KEMDIKBUD`);
  sql.push(`-- Waktu Ekspor: ${new Date().toISOString()}`);
  sql.push(`-- ==========================================================`);
  sql.push(``);
  sql.push(`CREATE DATABASE IF NOT EXISTS \`db_kesiswaan_sekolah\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  sql.push(`USE \`db_kesiswaan_sekolah\`;`);
  sql.push(``);

  // 1. Table sekolah_profile
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: sekolah_profile`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`sekolah_profile\`;`);
  sql.push(`CREATE TABLE \`sekolah_profile\` (`);
  sql.push(`  \`id\` INT AUTO_INCREMENT PRIMARY KEY,`);
  sql.push(`  \`nama_sekolah\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`npsn\` VARCHAR(20) NOT NULL,`);
  sql.push(`  \`nss\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`alamat\` TEXT NOT NULL,`);
  sql.push(`  \`desa_kelurahan\` VARCHAR(100),`);
  sql.push(`  \`kecamatan\` VARCHAR(100),`);
  sql.push(`  \`kabupaten_kota\` VARCHAR(100),`);
  sql.push(`  \`provinsi\` VARCHAR(100),`);
  sql.push(`  \`kode_pos\` VARCHAR(10),`);
  sql.push(`  \`telepon\` VARCHAR(30),`);
  sql.push(`  \`email\` VARCHAR(100),`);
  sql.push(`  \`nama_kepala_sekolah\` VARCHAR(120),`);
  sql.push(`  \`nip_kepala_sekolah\` VARCHAR(30),`);
  sql.push(`  \`nama_wali_kelas\` VARCHAR(120),`);
  sql.push(`  \`nip_wali_kelas\` VARCHAR(30),`);
  sql.push(`  \`nama_petugas_admin\` VARCHAR(120),`);
  sql.push(`  \`nip_petugas_admin\` VARCHAR(30),`);
  sql.push(`  \`tahun_ajaran_aktif\` VARCHAR(20) NOT NULL,`);
  sql.push(`  \`semester_aktif\` ENUM('1', '2') NOT NULL DEFAULT '2',`);
  sql.push(`  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  sql.push(`INSERT INTO \`sekolah_profile\` (\`nama_sekolah\`, \`npsn\`, \`nss\`, \`alamat\`, \`desa_kelurahan\`, \`kecamatan\`, \`kabupaten_kota\`, \`provinsi\`, \`kode_pos\`, \`telepon\`, \`email\`, \`nama_kepala_sekolah\`, \`nip_kepala_sekolah\`, \`nama_wali_kelas\`, \`nip_wali_kelas\`, \`nama_petugas_admin\`, \`nip_petugas_admin\`, \`tahun_ajaran_aktif\`, \`semester_aktif\`) VALUES (`);
  sql.push(`  ${escapeSql(school.namaSekolah)}, ${escapeSql(school.npsn)}, ${escapeSql(school.nss)}, ${escapeSql(school.alamat)}, ${escapeSql(school.desaKelurahan)}, ${escapeSql(school.kecamatan)}, ${escapeSql(school.kabupatenKota)}, ${escapeSql(school.provinsi)}, ${escapeSql(school.kodePos)}, ${escapeSql(school.telepon)}, ${escapeSql(school.email)}, ${escapeSql(school.namaKepalaSekolah)}, ${escapeSql(school.nipKepalaSekolah)}, ${escapeSql(school.namaWaliKelas)}, ${escapeSql(school.nipWaliKelas)}, ${escapeSql(school.namaPetugasAdmin)}, ${escapeSql(school.nipPetugasAdmin)}, ${escapeSql(school.tahunAjaranAktif)}, ${escapeSql(school.semesterAktif)}`);
  sql.push(`);`);
  sql.push(``);

  // 2. Table siswa (Buku Induk Format S-4 & Data Siswa S-1, S-2, S-3, S-5)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: siswa (Master Data Siswa / Buku Induk Format S-4)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`siswa\`;`);
  sql.push(`CREATE TABLE \`siswa\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`nis\` VARCHAR(30) NOT NULL UNIQUE,`);
  sql.push(`  \`nisn\` VARCHAR(30) NOT NULL UNIQUE,`);
  sql.push(`  \`nama_lengkap\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`nama_panggilan\` VARCHAR(50),`);
  sql.push(`  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,`);
  sql.push(`  \`tempat_lahir\` VARCHAR(100),`);
  sql.push(`  \`tanggal_lahir\` DATE,`);
  sql.push(`  \`agama\` ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'),`);
  sql.push(`  \`kewarganegaraan\` VARCHAR(30) DEFAULT 'WNI',`);
  sql.push(`  \`anak_ke\` INT DEFAULT 1,`);
  sql.push(`  \`jumlah_saudara\` INT DEFAULT 1,`);
  sql.push(`  \`bahasa_sehari_hari\` VARCHAR(50) DEFAULT 'Indonesia',`);
  sql.push(`  \`alamat\` TEXT,`);
  sql.push(`  \`kelurahan\` VARCHAR(100),`);
  sql.push(`  \`kecamatan\` VARCHAR(100),`);
  sql.push(`  \`kabupaten_kota\` VARCHAR(100),`);
  sql.push(`  \`provinsi\` VARCHAR(100),`);
  sql.push(`  \`telepon\` VARCHAR(30),`);
  sql.push(`  \`no_hp\` VARCHAR(30),`);
  sql.push(`  \`status_siswa\` ENUM('calon', 'aktif', 'mutasi_keluar', 'lulus', 'tinggal_kelas') DEFAULT 'aktif',`);
  sql.push(`  \`kelas_sekarang\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`tanggal_diterima\` DATE,`);
  sql.push(`  \`diterima_di_kelas\` VARCHAR(10),`);
  sql.push(`  \`asal_sekolah\` VARCHAR(150),`);
  sql.push(`  \`no_ijazah_sebelumnya\` VARCHAR(100),`);
  sql.push(`  \`ayah_nama\` VARCHAR(150),`);
  sql.push(`  \`ayah_pendidikan\` VARCHAR(50),`);
  sql.push(`  \`ayah_pekerjaan\` VARCHAR(100),`);
  sql.push(`  \`ayah_penghasilan\` VARCHAR(100),`);
  sql.push(`  \`ayah_hp\` VARCHAR(30),`);
  sql.push(`  \`ibu_nama\` VARCHAR(150),`);
  sql.push(`  \`ibu_pendidikan\` VARCHAR(50),`);
  sql.push(`  \`ibu_pekerjaan\` VARCHAR(100),`);
  sql.push(`  \`ibu_penghasilan\` VARCHAR(100),`);
  sql.push(`  \`ibu_hp\` VARCHAR(30),`);
  sql.push(`  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  if (students.length > 0) {
    sql.push(`INSERT INTO \`siswa\` (\`id\`, \`nis\`, \`nisn\`, \`nama_lengkap\`, \`nama_panggilan\`, \`jenis_kelamin\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`agama\`, \`kewarganegaraan\`, \`anak_ke\`, \`jumlah_saudara\`, \`bahasa_sehari_hari\`, \`alamat\`, \`kelurahan\`, \`kecamatan\`, \`kabupaten_kota\`, \`provinsi\`, \`telepon\`, \`no_hp\`, \`status_siswa\`, \`kelas_sekarang\`, \`tanggal_diterima\`, \`diterima_di_kelas\`, \`asal_sekolah\`, \`no_ijazah_sebelumnya\`, \`ayah_nama\`, \`ayah_pendidikan\`, \`ayah_pekerjaan\`, \`ayah_penghasilan\`, \`ayah_hp\`, \`ibu_nama\`, \`ibu_pendidikan\`, \`ibu_pekerjaan\`, \`ibu_penghasilan\`, \`ibu_hp\`) VALUES`);
    const studentRows = students.map(s => {
      return `(${escapeSql(s.id)}, ${escapeSql(s.nis)}, ${escapeSql(s.nisn)}, ${escapeSql(s.namaLengkap)}, ${escapeSql(s.namaPanggilan)}, ${escapeSql(s.jenisKelamin)}, ${escapeSql(s.tempatLahir)}, ${escapeSql(s.tanggalLahir)}, ${escapeSql(s.agama)}, ${escapeSql(s.kewarganegaraan)}, ${s.anakKe || 1}, ${s.jumlahSaudara || 1}, ${escapeSql(s.bahasaSehariHari)}, ${escapeSql(s.alamat)}, ${escapeSql(s.kelurahan)}, ${escapeSql(s.kecamatan)}, ${escapeSql(s.kabupatenKota)}, ${escapeSql(s.provinsi)}, ${escapeSql(s.telepon)}, ${escapeSql(s.noHp)}, ${escapeSql(s.statusSiswa)}, ${escapeSql(s.kelasSekarang)}, ${escapeSql(s.tanggalDiterima)}, ${escapeSql(s.diterimaDiKelas)}, ${escapeSql(s.asalSekolah)}, ${escapeSql(s.noIjazahSebelumnya)}, ${escapeSql(s.dataAyah?.nama)}, ${escapeSql(s.dataAyah?.pendidikan)}, ${escapeSql(s.dataAyah?.pekerjaan)}, ${escapeSql(s.dataAyah?.penghasilan)}, ${escapeSql(s.dataAyah?.noHp)}, ${escapeSql(s.dataIbu?.nama)}, ${escapeSql(s.dataIbu?.pendidikan)}, ${escapeSql(s.dataIbu?.pekerjaan)}, ${escapeSql(s.dataIbu?.penghasilan)}, ${escapeSql(s.dataIbu?.noHp)})`;
    });
    sql.push(studentRows.join(',\n') + ';');
    sql.push(``);
  }

  // 3. Table absensi_harian (Format S-8 & S-9)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: absensi_harian (Format S-8 & S-9)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`absensi_harian\`;`);
  sql.push(`CREATE TABLE \`absensi_harian\` (`);
  sql.push(`  \`id\` INT AUTO_INCREMENT PRIMARY KEY,`);
  sql.push(`  \`tanggal\` DATE NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`status\` ENUM('H', 'S', 'I', 'A') NOT NULL DEFAULT 'H',`);
  sql.push(`  \`keterangan\` VARCHAR(100),`);
  sql.push(`  UNIQUE KEY \`unique_student_date\` (\`tanggal\`, \`student_id\`)`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 4. Table surat_ketidakhadiran_s10
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: surat_ketidakhadiran_s10 (Format S-10 Panggilan Ortu)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`surat_ketidakhadiran_s10\`;`);
  sql.push(`CREATE TABLE \`surat_ketidakhadiran_s10\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`student_name\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`nama_orang_tua\` VARCHAR(150),`);
  sql.push(`  \`alamat\` TEXT,`);
  sql.push(`  \`nomor_surat\` VARCHAR(100) NOT NULL,`);
  sql.push(`  \`tanggal_surat\` DATE NOT NULL,`);
  sql.push(`  \`tanggal_menghadap\` DATE NOT NULL,`);
  sql.push(`  \`waktu_menghadap\` VARCHAR(50),`);
  sql.push(`  \`tempat_menghadap\` VARCHAR(100),`);
  sql.push(`  \`jumlah_alfa\` INT DEFAULT 0,`);
  sql.push(`  \`jumlah_sakit\` INT DEFAULT 0,`);
  sql.push(`  \`jumlah_izin\` INT DEFAULT 0,`);
  sql.push(`  \`catatan_wali_kelas\` TEXT`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 5. Table surat_pindah_s12_s13_s14 (Mutasi)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: surat_pindah_s12_s13_s14 (Format Mutasi S-12, S-13, S-14)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`mutasi_siswa\`;`);
  sql.push(`CREATE TABLE \`mutasi_siswa\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`jenis_format\` ENUM('S-12', 'S-13', 'S-14') NOT NULL,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`student_name\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`nis\` VARCHAR(30),`);
  sql.push(`  \`nisn\` VARCHAR(30),`);
  sql.push(`  \`kelas\` VARCHAR(10),`);
  sql.push(`  \`nomor_surat\` VARCHAR(100) NOT NULL,`);
  sql.push(`  \`tanggal_surat\` DATE NOT NULL,`);
  sql.push(`  \`sekolah_asal_tujuan\` VARCHAR(150),`);
  sql.push(`  \`alasan_mutasi\` TEXT`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 6. Table calon_peserta_ujian_s15
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: calon_peserta_ujian_s15 (Format S-15)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`calon_peserta_ujian_s15\`;`);
  sql.push(`CREATE TABLE \`calon_peserta_ujian_s15\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`nomor_peserta\` VARCHAR(50) NOT NULL UNIQUE,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`nis\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`nisn\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`nama_lengkap\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`syarat_nilai\` VARCHAR(50) DEFAULT 'Lengkap',`);
  sql.push(`  \`syarat_presensi\` VARCHAR(50) DEFAULT 'Memenuhi',`);
  sql.push(`  \`status_verifikasi\` VARCHAR(50) DEFAULT 'Memenuhi Syarat'`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 7. Table kelulusan_lanjutan_studi_s18
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: kelulusan_lanjutan_studi_s18 (Format S-18)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`kelulusan_lanjutan_studi_s18\`;`);
  sql.push(`CREATE TABLE \`kelulusan_lanjutan_studi_s18\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`nis\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`nisn\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`nama_lengkap\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,`);
  sql.push(`  \`tahun_lulus\` VARCHAR(20) NOT NULL,`);
  sql.push(`  \`status_studi\` ENUM('MELANJUTKAN', 'TIDAK_MELANJUTKAN', 'BEKERJA', 'BELUM_DIKETAHUI') DEFAULT 'MELANJUTKAN',`);
  sql.push(`  \`nama_sekolah_lanjutan\` VARCHAR(150),`);
  sql.push(`  \`jenis_sekolah_lanjutan\` VARCHAR(50),`);
  sql.push(`  \`kabupaten_kota_lanjutan\` VARCHAR(100),`);
  sql.push(`  \`no_ijazah\` VARCHAR(100)`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 8. Table kenaikan_kelulusan_s19_s20
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: kenaikan_kelulusan_s19_s20 (Format S-19 & S-20)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`kenaikan_kelulusan_s19_s20\`;`);
  sql.push(`CREATE TABLE \`kenaikan_kelulusan_s19_s20\` (`);
  sql.push(`  \`id\` INT AUTO_INCREMENT PRIMARY KEY,`);
  sql.push(`  \`student_id\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`tahun_ajaran\` VARCHAR(20) NOT NULL,`);
  sql.push(`  \`kelas_asal\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`status_keputusan\` ENUM('Naik ke Kelas', 'Tinggal di Kelas', 'Lulus', 'Belum Ditentukan') NOT NULL,`);
  sql.push(`  \`kelas_tujuan\` VARCHAR(20),`);
  sql.push(`  \`rata_rata_nilai\` DECIMAL(5,2),`);
  sql.push(`  \`peringkat\` INT,`);
  sql.push(`  \`catatan\` TEXT`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 9. Table mutasi_siswa_s14 (Format S-14 & PS-14a)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: mutasi_siswa_s14 (Format S-14 & PS-14a)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`mutasi_siswa_s14\`;`);
  sql.push(`CREATE TABLE \`mutasi_siswa_s14\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`student_id\` VARCHAR(50),`);
  sql.push(`  \`nama_siswa\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`nis\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,`);
  sql.push(`  \`jenis_mutasi\` ENUM('MASUK', 'KELUAR') NOT NULL,`);
  sql.push(`  \`tanggal_mutasi\` DATE NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`semester\` ENUM('1', '2') NOT NULL,`);
  sql.push(`  \`sekolah_asal_tujuan\` VARCHAR(200) NOT NULL,`);
  sql.push(`  \`alasan_mutasi\` TEXT NOT NULL,`);
  sql.push(`  \`nomor_surat\` VARCHAR(100) NOT NULL`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 10. Table prestasi_siswa_ps21_ps22 (Format PS-21 & PS-22)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: prestasi_siswa_ps21_ps22 (Format PS-21 & PS-22)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`prestasi_siswa_ps21_ps22\`;`);
  sql.push(`CREATE TABLE \`prestasi_siswa_ps21_ps22\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`nama_siswa\` VARCHAR(150) NOT NULL,`);
  sql.push(`  \`nis\` VARCHAR(30) NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`bidang\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`nama_prestasi\` VARCHAR(200) NOT NULL,`);
  sql.push(`  \`kategori\` ENUM('Bibit Unggul', 'Juara Lomba') NOT NULL,`);
  sql.push(`  \`peringkat\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`tingkat\` VARCHAR(50) NOT NULL,`);
  sql.push(`  \`tahun\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`penyelenggara\` VARCHAR(150),`);
  sql.push(`  \`nomor_piagam\` VARCHAR(100)`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);

  // 11. Table sasaran_kurikulum_ps23_ps24 (Format PS-23 & PS-24)
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`-- Tabel: sasaran_kurikulum_ps23_ps24 (Format PS-23 & PS-24)`);
  sql.push(`-- --------------------------------------------------------`);
  sql.push(`DROP TABLE IF EXISTS \`sasaran_kurikulum_ps23_ps24\`;`);
  sql.push(`CREATE TABLE \`sasaran_kurikulum_ps23_ps24\` (`);
  sql.push(`  \`id\` VARCHAR(50) PRIMARY KEY,`);
  sql.push(`  \`mata_pelajaran\` VARCHAR(100) NOT NULL,`);
  sql.push(`  \`kelas\` VARCHAR(10) NOT NULL,`);
  sql.push(`  \`semester\` ENUM('1', '2') NOT NULL,`);
  sql.push(`  \`tahun_ajaran\` VARCHAR(20) NOT NULL,`);
  sql.push(`  \`kkm\` INT NOT NULL,`);
  sql.push(`  \`target_kurikulum_persen\` INT NOT NULL,`);
  sql.push(`  \`tercapai_kurikulum_persen\` INT NOT NULL,`);
  sql.push(`  \`taraf_serap_persen\` DECIMAL(5,2) NOT NULL,`);
  sql.push(`  \`jumlah_siswa_tuntas\` INT NOT NULL,`);
  sql.push(`  \`jumlah_siswa_belum_tuntas\` INT NOT NULL,`);
  sql.push(`  \`catatan_hambatan\` TEXT`);
  sql.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  sql.push(``);
  sql.push(`-- SELESAI SCRIPT DUMP MYSQL`);

  return sql.join('\n');
}
