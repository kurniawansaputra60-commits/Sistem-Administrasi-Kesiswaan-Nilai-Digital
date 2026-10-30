export type Gender = 'L' | 'P';

export type StudentStatus = 'calon' | 'aktif' | 'mutasi_keluar' | 'lulus' | 'tinggal_kelas';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu';

export interface ParentInfo {
  nama: string;
  tahunLahir?: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
  noHp: string;
}

export interface GuardianInfo extends ParentInfo {
  hubungan: string;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  kkm: number;
  tugas: number;
  uts: number;
  uas: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
}

export interface PromotionRecord {
  tahunAjaran: string;
  status: 'Naik ke Kelas' | 'Tinggal di Kelas' | 'Lulus' | 'Belum Ditentukan';
  kelasTujuan: string;
  peringkat?: number;
  catatan?: string;
}

export interface Student {
  id: string;
  nis: string; // Nomor Induk Siswa (untuk Buku Induk & Kunci Induk)
  nisn: string; // Nomor Induk Siswa Nasional
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Religion;
  kewarganegaraan: string;
  anakKe: number;
  jumlahSaudara: number;
  bahasaSehariHari: string;
  
  // Kontak & Alamat
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  telepon?: string;
  noHp?: string;
  
  // Akademik & Status
  statusSiswa: StudentStatus;
  kelasSekarang: string; // e.g. "I", "II", "III", "IV", "V", "VI"
  rombel?: string; // e.g. "A", "B"
  tanggalDiterima: string;
  diterimaDiKelas: string;
  asalSekolah: string; // TK / PAUD / SD Asal
  noIjazahSebelumnya?: string;
  tahunIjazah?: string;

  // Orang Tua & Wali
  dataAyah: ParentInfo;
  dataIbu: ParentInfo;
  dataWali?: GuardianInfo;

  // Riwayat Nilai per Semester
  nilaiSemester: Record<string, SubjectGrade[]>;

  // Kenaikan Kelas & Kelulusan
  riwayatKenaikan?: PromotionRecord;

  // Catatan Tambahan
  fotoUrl?: string;
  keterangan?: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa
}

export interface DailyAttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelas: string;
  entries: AttendanceEntry[];
}

// Format S-10 Surat Panggilan: Surat Permohonan Penjelasan Ketidakhadiran
export interface AbsenceWarningLetter {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  namaOrangTua: string;
  alamat: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalMenghadap: string;
  waktuMenghadap: string;
  tempatMenghadap: string;
  jumlahSakit: number;
  jumlahIzin: number;
  jumlahAlfa: number;
  catatanWaliKelas: string;
}

// Surat Keterangan Telah Menerima Siswa Pindahan
export interface TransferInConfirmation {
  id: string;
  studentId: string;
  studentName: string;
  nisBaru: string;
  nisn: string;
  jenisKelamin: Gender;
  diterimaDiKelas: string;
  tanggalDiterima: string;
  sekolahAsal: string;
  nomorSuratPindahAsal: string;
  tanggalSuratPindahAsal: string;
  nomorSuratKeterangan: string;
  tanggalSurat: string;
  keterangan: string;
}

// Format S-12: Permohonan Pindah Sekolah
export interface TransferRequestLetter {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  nisn: string;
  kelas: string;
  namaOrangTua: string;
  pekerjaanOrangTua: string;
  alamatOrangTua: string;
  sekolahTujuan: string;
  alasanPindah: string;
  tanggalSurat: string;
}

// Format S-13: Surat Keterangan Pindah Sekolah (dari Sekolah Asal)
export interface TransferOutCertificate {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  nisn: string;
  jenisKelamin: Gender;
  tempatTanggalLahir: string;
  kelasDitinggalkan: string;
  sekolahTujuan: string;
  desaKelurahanTujuan: string;
  kecamatanTujuan: string;
  kabupatenKotaTujuan: string;
  provinsiTujuan: string;
  alasanPindah: string;
  nomorSurat: string;
  tanggalSurat: string;
  catatanKelakuan: string;
}

// Format S-14 & PS-14a: Buku Mutasi Siswa Semesteran & Kelas
export interface StudentMutationRecord {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  jenisKelamin: Gender;
  jenisMutasi: 'MASUK' | 'KELUAR';
  tanggalMutasi: string;
  kelas: string;
  semester: '1' | '2';
  sekolahAsalTujuan: string;
  alasanMutasi: string;
  nomorSurat: string;
  keterangan?: string;
}

// Format S-15: Daftar Calon Peserta Ujian
export interface ExamCandidate {
  id: string;
  studentId: string;
  nomorPesertaUjian: string;
  nis: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  tempatTanggalLahir: string;
  kelas: string;
  syaratNilai: string;
  syaratPresensi: string;
  statusVerifikasi: string;
  keterangan?: string;
}

// Format S-16: Daftar Hadir Peserta Ujian
export interface ExamParticipant {
  id: string;
  studentId: string;
  nomorPeserta: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  statusHadir: 'HADIR' | 'TIDAK HADIR' | 'IZIN' | 'SAKIT';
  nomorMeja?: string;
  tandaTangan?: boolean;
}

export interface ExamSession {
  id: string;
  mataPelajaran: string;
  tanggalUjian: string;
  waktuUjian: string;
  ruangUjian: string;
  pengawas1: string;
  pengawas2: string;
  participants: ExamParticipant[];
}

// Format S-17: Daftar UAS & Prestasi
export interface ExamScoreRecord {
  studentId: string;
  nomorPeserta: string;
  nis: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  kelas: string;
  mapelScores: { mapel: string; nilai: number }[];
  jumlahNilai: number;
  rataRata: number;
  ranking: number;
  prestasi?: string;
}

// Format S-18, S-19, S-20: Lulusan & Studi Lanjutan
export interface GraduateStudyRecord {
  id: string;
  studentId: string;
  nis: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  tahunLulus: string;
  statusStudi: 'MELANJUTKAN' | 'TIDAK_MELANJUTKAN' | 'BEKERJA' | 'BELUM_DIKETAHUI';
  namaSekolahLanjutan?: string;
  jenisSekolahLanjutan?: string;
  kabupatenKotaLanjutan?: string;
  noIjazah?: string;
  keterangan?: string;
}

// Format PS-21 & PS-22: Daftar Prestasi Siswa (Bibit Unggul) & Daftar Siswa Berprestasi
export interface AchievementRecord {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  kelas: string;
  bidang: 'Akademik' | 'Sains / MIPA' | 'Seni Budaya' | 'Olahraga' | 'Keagamaan' | 'Teknologi' | 'Kepemimpinan';
  namaPrestasi: string;
  kategori: 'Bibit Unggul' | 'Juara Lomba';
  peringkat: string; // e.g. "Juara 1", "Medali Emas", "Bibit Unggul Harapan"
  tingkat: 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  tahun: string;
  penyelenggara: string;
  nomorPiagam?: string;
  keterangan?: string;
}

// Format PS-23 & PS-24: Buku Catatan & Grafik Pencapaian Sasaran Kurikulum dan Taraf Serap
export interface CurriculumTargetRecord {
  id: string;
  mataPelajaran: string;
  kelas: string;
  semester: '1' | '2';
  tahunAjaran: string;
  kkm: number;
  targetKurikulumPersen: number; // e.g. 100%
  tercapaiKurikulumPersen: number; // e.g. 96%
  tarafSerapPersen: number; // e.g. 85.2%
  jumlahSiswaTuntas: number;
  jumlahSiswaBelumTuntas: number;
  catatanHambatan?: string;
}

export interface WaliKelasItem {
  id?: string;
  kelas: string; // 'I', 'II', 'III', 'IV', 'V', 'VI'
  rombel: string; // 'A', 'B', etc.
  nama: string;
  nip?: string;
  nik?: string; // NIK 16 digit untuk Non-ASN / Honorer
  ttdUrl?: string; // Data URL / Base64 image tanda tangan digital
}

export interface SchoolProfile {
  namaSekolah: string;
  pemerintahDaerah?: string; // e.g. "PEMERINTAH KABUPATEN LEBAK"
  dinasPendidikan?: string; // e.g. "DINAS PENDIDIKAN"
  uptdSatuanPendidikan?: string; // e.g. "UPTD SATUAN PENDIDIKAN SD NEGERI 1 CEMPAKA"
  akreditasi?: string; // e.g. "Terakreditasi B"
  website?: string; // e.g. "sdn1cempaka@sch.id"
  rtRw?: string; // e.g. "RT 006/RW 002"
  logoSekolahUrl?: string; // custom school logo (base64 or URL)
  logoDaerahUrl?: string; // regional emblem logo (base64 or URL)
  kopBannerUrl?: string; // high-res official banner (e.g. /assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png)
  useBannerKop?: boolean; // toggle whether to render full official banner or dual-logo layout
  npsn: string;
  nss: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kepalaSekolahTtdUrl?: string; // TTD digital kepala sekolah
  namaWaliKelas: string;
  nipWaliKelas: string;
  waliKelasList?: WaliKelasItem[]; // Data Wali Kelas per Kelas & Rombel (I A, I B, s/d VI B)
  namaPetugasAdmin: string;
  nipPetugasAdmin: string;
  petugasAdminTtdUrl?: string; // TTD digital petugas administrasi (Kurniawan Saputra)
  tahunAjaranAktif: string; // e.g. "2025/2026"
  semesterAktif: '1' | '2';
  tanggalDokumen: string;
  updatedAt?: string;
}

// MySQL Database Config
export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  isConnected: boolean;
  lastSync?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 's1_pendaftaran'
  | 's2_calon'
  | 's3_siswa_baru'
  | 's4_buku_induk'
  | 's5_buku_klaper'
  | 'ps5a_kunci_induk'
  | 'ps5b_pembantu_induk'
  | 's6_demografi_asal'
  | 's7_demografi_usia'
  | 'ps7a_demografi_agama'
  | 's8_papan_absen'
  | 's9_rekap_absen_harian'
  | 's10_absen_bulanan'
  | 's11_rekap_absen_bulanan'
  | 's12_permohonan_pindah'
  | 's13_keterangan_pindah'
  | 's14_mutasi_semesteran'
  | 'ps14a_mutasi_kelas'
  | 's15_calon_uas'
  | 's16_tanda_peserta_uas'
  | 's17_daftar_nilai_uas'
  | 's18_lulusan_studi_lanjut'
  | 's19_daftar_lulusan'
  | 's20_statistik_kelulusan'
  | 'ps21_prestasi_bibit_unggul'
  | 'ps22_siswa_berprestasi'
  | 'ps23_capaian_kurikulum'
  | 'ps24_taraf_serap'
  | 'mysql_center';

export interface UserProfileDraft {
  uid: string;
  email?: string;
  displayName?: string;
  role?: string;
  kelasTugas?: string;
  rombelTugas?: string;
}

export interface MySQLConnectionResult {
  success: boolean;
  message: string;
}

export interface ImportResult {
  added: number;
  replaced: number;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  schoolProfile: SchoolProfile;
  students: Student[];
  attendances: DailyAttendanceRecord[];
  warningLetters: AbsenceWarningLetter[];
  transferRequests: TransferRequestLetter[];
  transferOuts: TransferOutCertificate[];
  transferIns: TransferInConfirmation[];
  mutations: StudentMutationRecord[];
  examCandidates: ExamCandidate[];
  examSessions: ExamSession[];
  examScores: ExamScoreRecord[];
  gradStudies: GraduateStudyRecord[];
  achievements: AchievementRecord[];
  curriculumTargets: CurriculumTargetRecord[];
}

export type SyncStatus = 'initial_loading' | 'synced' | 'syncing' | 'error';
