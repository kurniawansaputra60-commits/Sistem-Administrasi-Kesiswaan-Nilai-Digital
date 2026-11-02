import * as XLSX from 'xlsx';
import { Student, Gender, Religion, StudentStatus } from '../types';
import { formatTempatTanggalLahirLengkap, formatTanggalIndonesiaLengkap } from './dateUtils';

export interface ExcelImportRow {
  nis: string;
  nisn: string;
  namaLengkap: string;
  namaPanggilan?: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  agama: Religion;
  kelasSekarang: string;
  rombel?: string;
  statusSiswa: StudentStatus;
  asalSekolah: string;
  anakKe?: number;
  jumlahSaudara?: number;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  namaAyah?: string;
  pendidikanAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;
  noHpAyah?: string;
  namaIbu?: string;
  pendidikanIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;
  noHpIbu?: string;
  dataAyah?: {
    nama: string;
    pendidikan: string;
    pekerjaan: string;
    penghasilan: string;
    noHp: string;
  };
  dataIbu?: {
    nama: string;
    pendidikan: string;
    pekerjaan: string;
    penghasilan: string;
    noHp: string;
  };
  isValid: boolean;
  validationError?: string;
}

/**
 * Buat dan unduh file template Excel (.xlsx) resmi untuk import data siswa (Kelas 1 A & 1 B)
 */
export function downloadStudentExcelTemplate(schoolName: string = 'SD NEGERI PERCONTOHAN CEMPAKA') {
  const templateData = [
    {
      'No': 1,
      'NIS': '2025001',
      'NISN': '0181234567',
      'Nama Lengkap': 'Ahmad Fauzi Rahman',
      'Nama Panggilan': 'Fauzi',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Lebak',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-05-14',
      'Agama': 'Islam',
      'Anak Ke-': 1,
      'Jumlah Saudara': 2,
      'Kelas': '1',
      'Rombel (A/B)': 'A',
      'Status Siswa': 'aktif',
      'Asal Sekolah': 'TK Pertiwi 01',
      'Alamat Jalan': 'Jl. Cempaka Putih No. 12 RT 03/RW 02',
      'Kelurahan': 'Cempaka',
      'Kecamatan': 'Warunggunung',
      'Kota / Kabupaten': 'Kabupaten Lebak',
      'Provinsi': 'Banten',
      'Nama Ayah': 'Rahmat Hidayat',
      'Pendidikan Ayah': 'S1 / Sarjana',
      'Pekerjaan Ayah': 'Karyawan Swasta',
      'Penghasilan Ayah': '3.000.000 - 5.000.000',
      'No HP Orang Tua': '081234567890',
      'Nama Ibu': 'Nurul Aini',
      'Pendidikan Ibu': 'SMA / Sederajat',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'Penghasilan Ibu': 'Tidak Berpenghasilan',
    },
    {
      'No': 2,
      'NIS': '2025002',
      'NISN': '0182345678',
      'Nama Lengkap': 'Anisa Rahmawati',
      'Nama Panggilan': 'Anisa',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Lebak',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-03-22',
      'Agama': 'Islam',
      'Anak Ke-': 2,
      'Jumlah Saudara': 1,
      'Kelas': '1',
      'Rombel (A/B)': 'A',
      'Status Siswa': 'aktif',
      'Asal Sekolah': 'PAUD Melati 03',
      'Alamat Jalan': 'Jl. Rawasari Selatan No. 8',
      'Kelurahan': 'Cempaka',
      'Kecamatan': 'Warunggunung',
      'Kota / Kabupaten': 'Kabupaten Lebak',
      'Provinsi': 'Banten',
      'Nama Ayah': 'Budi Rahmadi',
      'Pendidikan Ayah': 'D3 / Diploma',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Penghasilan Ayah': '3.000.000 - 5.000.000',
      'No HP Orang Tua': '081311223344',
      'Nama Ibu': 'Siti Maryam',
      'Pendidikan Ibu': 'SMA / Sederajat',
      'Pekerjaan Ibu': 'Karyawan Swasta',
      'Penghasilan Ibu': '2.000.000 - 3.000.000',
    },
    {
      'No': 3,
      'NIS': '2025003',
      'NISN': '0183456789',
      'Nama Lengkap': 'Bima Sakti Pratama',
      'Nama Panggilan': 'Bima',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Rangkasbitung',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-08-20',
      'Agama': 'Islam',
      'Anak Ke-': 1,
      'Jumlah Saudara': 3,
      'Kelas': '1',
      'Rombel (A/B)': 'B',
      'Status Siswa': 'aktif',
      'Asal Sekolah': 'TK Kartika V-1',
      'Alamat Jalan': 'Jl. Percetakan Negara IX No. 4',
      'Kelurahan': 'Cempaka',
      'Kecamatan': 'Warunggunung',
      'Kota / Kabupaten': 'Kabupaten Lebak',
      'Provinsi': 'Banten',
      'Nama Ayah': 'Hendra Pratama',
      'Pendidikan Ayah': 'SMA / Sederajat',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Penghasilan Ayah': '5.000.000 - 10.000.000',
      'No HP Orang Tua': '081398765432',
      'Nama Ibu': 'Dewi Sartika',
      'Pendidikan Ibu': 'S1 / Sarjana',
      'Pekerjaan Ibu': 'Guru',
      'Penghasilan Ibu': '3.000.000 - 5.000.000',
    },
    {
      'No': 4,
      'NIS': '2025004',
      'NISN': '0184567890',
      'Nama Lengkap': 'Citra Lestari',
      'Nama Panggilan': 'Citra',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Serang',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-11-05',
      'Agama': 'Islam',
      'Anak Ke-': 3,
      'Jumlah Saudara': 2,
      'Kelas': '1',
      'Rombel (A/B)': 'B',
      'Status Siswa': 'aktif',
      'Asal Sekolah': 'TK Islam Al-Azhar',
      'Alamat Jalan': 'Jl. Sudirman No. 45',
      'Kelurahan': 'Cempaka',
      'Kecamatan': 'Warunggunung',
      'Kota / Kabupaten': 'Kabupaten Lebak',
      'Provinsi': 'Banten',
      'Nama Ayah': 'Surya Lestari',
      'Pendidikan Ayah': 'S1 / Sarjana',
      'Pekerjaan Ayah': 'PNS / ASN',
      'Penghasilan Ayah': '5.000.000 - 10.000.000',
      'No HP Orang Tua': '081566778899',
      'Nama Ibu': 'Rina Fitriani',
      'Pendidikan Ibu': 'S1 / Sarjana',
      'Pekerjaan Ibu': 'Apoteker',
      'Penghasilan Ibu': '3.000.000 - 5.000.000',
    },
  ];

  const petunjukData = [
    { 'KOLOM': 'NIS', 'DESKRIPSI': 'Nomor Induk Siswa (Wajib diisi, unik per siswa)', 'CONTOH': '2025001' },
    { 'KOLOM': 'NISN', 'DESKRIPSI': 'Nomor Induk Siswa Nasional (10 digit angka)', 'CONTOH': '0181234567' },
    { 'KOLOM': 'Nama Lengkap', 'DESKRIPSI': 'Nama lengkap sesuai Akta Kelahiran / KK', 'CONTOH': 'Ahmad Fauzi Rahman' },
    { 'KOLOM': 'Jenis Kelamin (L/P)', 'DESKRIPSI': 'Isi L untuk Laki-laki atau P untuk Perempuan', 'CONTOH': 'L atau P' },
    { 'KOLOM': 'Tanggal Lahir', 'DESKRIPSI': 'Format tanggal: YYYY-MM-DD (Tahun-Bulan-Hari)', 'CONTOH': '2018-05-14' },
    { 'KOLOM': 'Agama', 'DESKRIPSI': 'Islam, Kristen, Katolik, Hindu, Buddha, Khonghucu', 'CONTOH': 'Islam' },
    { 'KOLOM': 'Anak Ke-', 'DESKRIPSI': 'Urutan anak dalam keluarga', 'CONTOH': '1' },
    { 'KOLOM': 'Jumlah Saudara', 'DESKRIPSI': 'Jumlah saudara kandung siswa', 'CONTOH': '2' },
    { 'KOLOM': 'Kelas', 'DESKRIPSI': 'Tingkat kelas angka: 1, 2, 3, 4, 5, atau 6', 'CONTOH': '1' },
    { 'KOLOM': 'Rombel (A/B)', 'DESKRIPSI': 'Pilih A atau B untuk pembagian Rombongan Belajar', 'CONTOH': 'A atau B' },
    { 'KOLOM': 'Provinsi', 'DESKRIPSI': 'Provinsi tempat tinggal siswa', 'CONTOH': 'Banten' },
    { 'KOLOM': 'Nama Ayah', 'DESKRIPSI': 'Nama lengkap ayah kandung/wali', 'CONTOH': 'Rahmat Hidayat' },
    { 'KOLOM': 'Pendidikan Ayah', 'DESKRIPSI': 'Pendidikan terakhir Ayah', 'CONTOH': 'SMA / S1' },
    { 'KOLOM': 'Pekerjaan Ayah', 'DESKRIPSI': 'Pekerjaan atau instansi ayah', 'CONTOH': 'Karyawan Swasta' },
    { 'KOLOM': 'Penghasilan Ayah', 'DESKRIPSI': 'Kisaran penghasilan bulanan ayah', 'CONTOH': '3.000.000 - 5.000.000' },
    { 'KOLOM': 'Nama Ibu', 'DESKRIPSI': 'Nama lengkap ibu kandung', 'CONTOH': 'Nurul Aini' },
    { 'KOLOM': 'Pekerjaan Ibu', 'DESKRIPSI': 'Pekerjaan ibu', 'CONTOH': 'Ibu Rumah Tangga' },
    { 'KOLOM': 'Penghasilan Ibu', 'DESKRIPSI': 'Kisaran penghasilan bulanan ibu', 'CONTOH': 'Tidak Berpenghasilan' },
  ];

  const wb = XLSX.utils.book_new();

  const wsData = XLSX.utils.json_to_sheet(templateData);
  wsData['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 26 }, // Nama Lengkap
    { wch: 14 }, // Panggilan
    { wch: 18 }, // JK
    { wch: 16 }, // Tempat Lahir
    { wch: 22 }, // Tgl Lahir
    { wch: 12 }, // Agama
    { wch: 10 }, // Anak Ke
    { wch: 14 }, // Jml Saudara
    { wch: 10 }, // Kelas
    { wch: 12 }, // Rombel
    { wch: 14 }, // Status
    { wch: 20 }, // Asal Sekolah
    { wch: 32 }, // Alamat
    { wch: 20 }, // Kelurahan
    { wch: 20 }, // Kecamatan
    { wch: 20 }, // Kota
    { wch: 18 }, // Provinsi
    { wch: 22 }, // Nama Ayah
    { wch: 18 }, // Pendidikan Ayah
    { wch: 18 }, // Pekerjaan Ayah
    { wch: 22 }, // Penghasilan Ayah
    { wch: 16 }, // No HP
    { wch: 22 }, // Nama Ibu
    { wch: 18 }, // Pendidikan Ibu
    { wch: 18 }, // Pekerjaan Ibu
    { wch: 22 }, // Penghasilan Ibu
  ];
  XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA');

  const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukData);
  wsPetunjuk['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'PETUNJUK');

  const filename = `Template_Import_Siswa_Kelas1_AB.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function normalizeIncomeString(val?: string): string {
  if (!val || !String(val).trim()) return 'Tidak Berpenghasilan';
  return String(val)
    .replace(/[\u2013\u2014\u2212~]/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Baca dan validasi file Excel (.xlsx / .xls / .csv) yang diunggah pengguna
 */
export async function parseStudentExcelFile(file: File): Promise<ExcelImportRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const sheetName = workbook.SheetNames.includes('DATA_SISWA')
    ? 'DATA_SISWA'
    : workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Lembar kerja Excel tidak ditemukan atau kosong.');
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File Excel tidak memuat baris data.');
  }

  const parsedList: ExcelImportRow[] = rawRows.map((row) => {
    // Normalisasi kunci header case-insensitive agar kolom Ayah & Ibu terbaca sempurna
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
        // Cari key case-insensitive & bersihkan spasi/simbol
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matched = Object.keys(row).find(
          rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey
        );
        if (matched && row[matched] !== undefined && row[matched] !== null && String(row[matched]).trim() !== '') {
          return String(row[matched]).trim();
        }
      }
      return '';
    };

    const nis = getVal('NIS', 'Nomor Induk', 'No Induk', 'nis');
    const nisn = getVal('NISN', 'No NISN', 'nisn') || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const namaLengkap = getVal('Nama Lengkap', 'Nama Siswa', 'Nama', 'namalengkap');
    const namaPanggilan = getVal('Nama Panggilan', 'Panggilan', 'namapanggilan') || (namaLengkap ? namaLengkap.split(' ')[0] : '');

    const rawJK = getVal('Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'Gender', 'jeniskelamin').toUpperCase();
    const jenisKelamin: Gender = rawJK.startsWith('P') || rawJK.startsWith('W') ? 'P' : 'L';

    const tempatLahir = getVal('Tempat Lahir', 'TempatLahir', 'tempatlahir') || 'Lebak';
    let tanggalLahir = getVal('Tanggal Lahir (YYYY-MM-DD)', 'Tanggal Lahir', 'Tgl Lahir', 'tanggallahir');
    
    if (tanggalLahir && !isNaN(Number(tanggalLahir)) && Number(tanggalLahir) > 20000) {
      const dateObj = XLSX.SSF.parse_date_code(Number(tanggalLahir));
      const mm = String(dateObj.m).padStart(2, '0');
      const dd = String(dateObj.d).padStart(2, '0');
      tanggalLahir = `${dateObj.y}-${mm}-${dd}`;
    } else if (!tanggalLahir || !tanggalLahir.includes('-')) {
      tanggalLahir = '2018-07-01';
    }

    const rawAgama = getVal('Agama', 'Religi', 'agama');
    let agama: Religion = 'Islam';
    if (['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'].includes(rawAgama)) {
      agama = rawAgama as Religion;
    }

    const anakKe = Number(getVal('Anak Ke-', 'Anak Ke', 'anakke')) || 1;
    const jumlahSaudara = Number(getVal('Jumlah Saudara', 'Jml Saudara', 'jumlahsaudara')) || 0;

    const rawKelasInput = getVal('Kelas', 'Kelas Sekarang', 'Tingkat', 'kelassekarang') || '1';
    const rawRombelInput = getVal('Rombel (A/B)', 'Rombel', 'Rombongan Belajar', 'Kelompok Kelas', 'rombel').toUpperCase();

    // Deteksi dan bersihkan Kelas & Rombel (A / B)
    let rombel = 'A';
    if (rawRombelInput.includes('B') || rawKelasInput.toUpperCase().includes('B')) {
      rombel = 'B';
    } else if (rawRombelInput.includes('A') || rawKelasInput.toUpperCase().includes('A')) {
      rombel = 'A';
    }

    // Bersihkan angka tingkat kelas (misal: "1A", "1 B", "Kelas 1", "I-A" -> "1")
    let kelasSekarang = rawKelasInput.replace(/[^0-9I|V|X]/gi, '').trim() || '1';

    const rawStatus = getVal('Status Siswa', 'Status', 'statussiswa').toLowerCase();
    let statusSiswa: StudentStatus = 'aktif';
    if (['calon', 'aktif', 'mutasi_keluar', 'lulus', 'tinggal_kelas'].includes(rawStatus)) {
      statusSiswa = rawStatus as StudentStatus;
    }

    const asalSekolah = getVal('Asal Sekolah', 'Sekolah Asal', 'TK Asal', 'asalsekolah') || 'TK Pertiwi';
    const alamat = getVal('Alamat Jalan', 'Alamat', 'Tempat Tinggal', 'alamat') || 'Jl. Raya Pendidikan';
    const kelurahan = getVal('Kelurahan', 'kelurahan') || 'Cempaka';
    const kecamatan = getVal('Kecamatan', 'kecamatan') || 'Warunggunung';
    const kabupatenKota = getVal('Kota / Kabupaten', 'Kabupaten', 'Kota', 'kabupatenkota') || 'Kabupaten Lebak';
    const provinsi = getVal('Provinsi', 'Prov', 'provinsi') || 'Banten';

    // Perbaikan komprehensif pembacaan Data Ayah dan Ibu dari berbagai variasi header Excel
    const namaAyah = getVal('Nama Ayah', 'Nama Ayah Kandung', 'Ayah Kandung', 'Ayah', 'Nama Bapak', 'Bapak', 'Nama Orang Tua', 'Nama Ortu', 'namaayah');
    const pendidikanAyah = getVal('Pendidikan Ayah', 'Pendidikan Ayah Kandung', 'Pendidikan Bapak', 'pendidikanayah') || 'SMA';
    const pekerjaanAyah = getVal('Pekerjaan Ayah', 'Pekerjaan Ayah Kandung', 'Kerja Ayah', 'Pekerjaan Bapak', 'pekerjaanayah') || 'Swasta';
    const penghasilanAyah = normalizeIncomeString(getVal('Penghasilan Ayah', 'Penghasilan Ayah Kandung', 'Gaji Ayah', 'penghasilanayah') || '3.000.000 - 5.000.000');
    const noHpAyah = getVal('No HP Orang Tua', 'No HP Ayah', 'No HP Ortu', 'No HP', 'Telepon Ayah', 'Telepon Ortu', 'Telepon', 'nohpayah') || '08123456789';

    const namaIbu = getVal('Nama Ibu', 'Nama Ibu Kandung', 'Ibu Kandung', 'Ibu', 'namaibu');
    const pendidikanIbu = getVal('Pendidikan Ibu', 'Pendidikan Ibu Kandung', 'pendidikanibu') || 'SMA';
    const pekerjaanIbu = getVal('Pekerjaan Ibu', 'Pekerjaan Ibu Kandung', 'Kerja Ibu', 'pekerjaanibu') || 'Ibu Rumah Tangga';
    const penghasilanIbu = normalizeIncomeString(getVal('Penghasilan Ibu', 'Penghasilan Ibu Kandung', 'Gaji Ibu', 'penghasilanibu') || 'Tidak Berpenghasilan');
    const noHpIbu = getVal('No HP Ibu', 'No HP Ibu Kandung', 'nohpibu') || noHpAyah || '08123456789';

    const dataAyah = {
      nama: namaAyah || 'Bapak Siswa',
      pendidikan: pendidikanAyah,
      pekerjaan: pekerjaanAyah,
      penghasilan: penghasilanAyah,
      noHp: noHpAyah,
    };

    const dataIbu = {
      nama: namaIbu || 'Ibu Siswa',
      pendidikan: pendidikanIbu,
      pekerjaan: pekerjaanIbu,
      penghasilan: penghasilanIbu,
      noHp: noHpIbu,
    };

    let isValid = true;
    let validationError = '';

    if (!namaLengkap) {
      isValid = false;
      validationError = 'Nama Lengkap tidak boleh kosong';
    } else if (!nis) {
      isValid = false;
      validationError = 'NIS tidak boleh kosong';
    }

    return {
      nis,
      nisn,
      namaLengkap,
      namaPanggilan,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      agama,
      anakKe,
      jumlahSaudara,
      kelasSekarang,
      rombel,
      statusSiswa,
      asalSekolah,
      alamat,
      kelurahan,
      kecamatan,
      kabupatenKota,
      provinsi,
      namaAyah,
      pendidikanAyah,
      pekerjaanAyah,
      penghasilanAyah,
      noHpAyah,
      namaIbu,
      pendidikanIbu,
      pekerjaanIbu,
      penghasilanIbu,
      noHpIbu,
      dataAyah,
      dataIbu,
      isValid,
      validationError,
    };
  });

  return parsedList;
}

/**
 * Ekspor seluruh data siswa saat ini ke file Excel (.xlsx)
 */
export function exportStudentsToExcel(students: Student[], schoolName: string = 'SD NEGERI PERCONTOHAN CEMPAKA') {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.namaLengkap,
    'Panggilan': s.namaPanggilan,
    'JK': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    'Agama': s.agama,
    'Anak Ke-': s.anakKe || 1,
    'Jumlah Saudara': s.jumlahSaudara || 0,
    'Kelas': s.kelasSekarang,
    'Rombel': s.rombel || 'A',
    'Status': s.statusSiswa.toUpperCase(),
    'Tanggal Diterima': s.tanggalDiterima,
    'Diterima di Kelas': s.diterimaDiKelas,
    'Asal Sekolah': s.asalSekolah,
    'Alamat': s.alamat,
    'Kelurahan': s.kelurahan,
    'Kecamatan': s.kecamatan,
    'Kota/Kab': s.kabupatenKota,
    'Provinsi': s.provinsi || 'Banten',
    'Nama Ayah': s.dataAyah?.nama || '-',
    'Pendidikan Ayah': s.dataAyah?.pendidikan || '-',
    'Pekerjaan Ayah': s.dataAyah?.pekerjaan || '-',
    'Penghasilan Ayah': s.dataAyah?.penghasilan || '-',
    'No HP Ortu': s.dataAyah?.noHp || s.noHp || '-',
    'Nama Ibu': s.dataIbu?.nama || '-',
    'Pendidikan Ibu': s.dataIbu?.pendidikan || '-',
    'Pekerjaan Ibu': s.dataIbu?.pekerjaan || '-',
    'Penghasilan Ibu': s.dataIbu?.penghasilan || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama
    { wch: 14 }, // Panggilan
    { wch: 6 },  // JK
    { wch: 16 }, // Tempat Lahir
    { wch: 14 }, // Tgl Lahir
    { wch: 12 }, // Agama
    { wch: 10 }, // Anak Ke
    { wch: 14 }, // Jml Saudara
    { wch: 8 },  // Kelas
    { wch: 8 },  // Rombel
    { wch: 12 }, // Status
    { wch: 16 }, // Tgl Masuk
    { wch: 12 }, // Kelas Masuk
    { wch: 22 }, // Asal
    { wch: 32 }, // Alamat
    { wch: 18 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 18 }, // Kota
    { wch: 16 }, // Provinsi
    { wch: 22 }, // Ayah
    { wch: 16 }, // Pend Ayah
    { wch: 18 }, // Kerja Ayah
    { wch: 20 }, // Penghasilan Ayah
    { wch: 16 }, // HP
    { wch: 22 }, // Ibu
    { wch: 16 }, // Pend Ibu
    { wch: 18 }, // Kerja Ibu
    { wch: 20 }, // Penghasilan Ibu
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'BUKU_INDUK_SISWA');
  const filename = `Data_Siswa_${schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Ekspor resmi Data Siswa Rombel Binaan ke file Excel (.xlsx)
 * Disertai format Tempat, Tanggal Lahir lengkap (Hari, Tanggal Bulan Tahun)
 */
export function exportRombelStudentsToExcel(
  students: Student[],
  kelas: string,
  rombel: string,
  schoolName: string = 'SD NEGERI',
  waliKelasName?: string
) {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis || '-',
    'NISN': s.nisn || '-',
    'Nama Lengkap Siswa': s.namaLengkap,
    'Nama Panggilan': s.namaPanggilan || '-',
    'L/P': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir || '-',
    'Tanggal Lahir (Lengkap Hari, Tgl Bulan Thn)': formatTanggalIndonesiaLengkap(s.tanggalLahir),
    'Tanggal Lahir (Standar)': s.tanggalLahir,
    'Agama': s.agama,
    'Kelas': s.kelasSekarang,
    'Rombel': s.rombel || rombel,
    'Status Kesiswaan': s.statusSiswa.toUpperCase(),
    'Alamat Lengkap': s.alamat,
    'Kelurahan': s.kelurahan || '-',
    'Kecamatan': s.kecamatan || '-',
    'Kabupaten / Kota': s.kabupatenKota || '-',
    'Provinsi': s.provinsi || 'Banten',
    'Nama Ayah': s.dataAyah?.nama || '-',
    'Pendidikan Ayah': s.dataAyah?.pendidikan || '-',
    'Pekerjaan Ayah': s.dataAyah?.pekerjaan || '-',
    'Penghasilan Ayah': s.dataAyah?.penghasilan || '-',
    'Nama Ibu': s.dataIbu?.nama || '-',
    'Pendidikan Ibu': s.dataIbu?.pendidikan || '-',
    'Pekerjaan Ibu': s.dataIbu?.pekerjaan || '-',
    'Penghasilan Ibu': s.dataIbu?.penghasilan || '-',
    'No. HP Orang Tua': s.dataAyah?.noHp || s.dataIbu?.noHp || s.noHp || '-',
    'Asal Sekolah': s.asalSekolah || '-',
    'Tanggal Diterima': s.tanggalDiterima || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama Lengkap
    { wch: 14 }, // Panggilan
    { wch: 6 },  // L/P
    { wch: 16 }, // Tempat Lahir
    { wch: 28 }, // Tanggal Lahir Lengkap
    { wch: 14 }, // Tanggal Lahir Standar
    { wch: 12 }, // Agama
    { wch: 8 },  // Kelas
    { wch: 8 },  // Rombel
    { wch: 12 }, // Status
    { wch: 32 }, // Alamat
    { wch: 18 }, // Kelurahan
    { wch: 18 }, // Kecamatan
    { wch: 20 }, // Kab/Kota
    { wch: 16 }, // Provinsi
    { wch: 22 }, // Nama Ayah
    { wch: 16 }, // Pend Ayah
    { wch: 18 }, // Kerja Ayah
    { wch: 22 }, // Penghasilan Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 16 }, // Pend Ibu
    { wch: 18 }, // Kerja Ibu
    { wch: 22 }, // Penghasilan Ibu
    { wch: 18 }, // No HP
    { wch: 22 }, // Asal Sekolah
    { wch: 16 }, // Tanggal Diterima
  ];

  const sheetName = `SISWA_${kelas}_${rombel}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Daftar_Siswa_Kelas_${kelas}_${rombel}_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Ekspor Rekap Kehadiran / Presensi Siswa Rombel Binaan ke Excel (.xlsx)
 */
export function exportRombelAttendanceToExcel(
  students: Student[],
  attendances: any[],
  kelas: string,
  rombel: string,
  schoolName: string = 'SD NEGERI'
) {
  const studentMap = new Map<string, { h: number; s: number; i: number; a: number }>();
  students.forEach(s => {
    studentMap.set(s.id, { h: 0, s: 0, i: 0, a: 0 });
  });

  attendances.forEach(att => {
    att.entries?.forEach((entry: any) => {
      if (studentMap.has(entry.studentId)) {
        const stats = studentMap.get(entry.studentId)!;
        if (entry.status === 'H') stats.h++;
        else if (entry.status === 'S') stats.s++;
        else if (entry.status === 'I') stats.i++;
        else if (entry.status === 'A') stats.a++;
      }
    });
  });

  const exportData = students.map((s, idx) => {
    const stat = studentMap.get(s.id) || { h: 0, s: 0, i: 0, a: 0 };
    const totalRecorded = stat.h + stat.s + stat.i + stat.a;
    const pct = totalRecorded > 0 ? Math.round((stat.h / totalRecorded) * 100) : 100;
    return {
      'No': idx + 1,
      'NIS': s.nis || '-',
      'NISN': s.nisn || '-',
      'Nama Lengkap': s.namaLengkap,
      'L/P': s.jenisKelamin,
      'Kelas': s.kelasSekarang,
      'Rombel': s.rombel || rombel,
      'Hadir (H)': stat.h,
      'Sakit (S)': stat.s,
      'Izin (I)': stat.i,
      'Alpa (A)': stat.a,
      'Total Catatan Hari': totalRecorded,
      'Persentase Kehadiran (%)': `${pct}%`,
      'Predikat Kehadiran': pct >= 90 ? 'Sangat Baik' : pct >= 75 ? 'Baik' : pct >= 60 ? 'Cukup' : 'Perlu Perhatian',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama
    { wch: 6 },  // L/P
    { wch: 8 },  // Kelas
    { wch: 8 },  // Rombel
    { wch: 12 }, // H
    { wch: 12 }, // S
    { wch: 12 }, // I
    { wch: 12 }, // A
    { wch: 18 }, // Total
    { wch: 22 }, // Pct
    { wch: 20 }, // Predikat
  ];

  const sheetName = `PRESENSI_${kelas}_${rombel}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Rekap_Presensi_Kelas_${kelas}_${rombel}_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Ekspor Format / Template Nilai Rapor Rombel Binaan ke Excel (.xlsx)
 */
export function exportRombelGradesTemplateToExcel(
  students: Student[],
  kelas: string,
  rombel: string,
  schoolName: string = 'SD NEGERI'
) {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis || '-',
    'NISN': s.nisn || '-',
    'Nama Lengkap Siswa': s.namaLengkap,
    'L/P': s.jenisKelamin,
    'Kelas': s.kelasSekarang,
    'Rombel': s.rombel || rombel,
    'Pendidikan Agama': '',
    'Pancasila / PKn': '',
    'Bahasa Indonesia': '',
    'Matematika': '',
    'IPAS': '',
    'PJOK': '',
    'Seni Budaya': '',
    'Bahasa Inggris': '',
    'Muatan Lokal': '',
    'Catatan / Deskripsi Perkembangan': '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama
    { wch: 6 },  // L/P
    { wch: 8 },  // Kelas
    { wch: 8 },  // Rombel
    { wch: 16 }, // Agama
    { wch: 16 }, // PKn
    { wch: 16 }, // BI
    { wch: 16 }, // MTK
    { wch: 16 }, // IPAS
    { wch: 16 }, // PJOK
    { wch: 16 }, // SBdP
    { wch: 16 }, // Bing
    { wch: 16 }, // Mulok
    { wch: 32 }, // Catatan
  ];

  const sheetName = `LEGER_${kelas}_${rombel}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Format_Nilai_Rapor_Kelas_${kelas}_${rombel}_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Ekspor Data Siswa Rombel Binaan ke file CSV dengan BOM UTF-8 (Kompatibel Microsoft Excel & Google Sheets)
 */
export function exportRombelToCsv(
  students: Student[],
  kelas: string,
  rombel: string,
  schoolName: string = 'SD NEGERI'
) {
  const headers = [
    'No',
    'NIS',
    'NISN',
    'Nama Lengkap',
    'L/P',
    'Tempat Lahir',
    'Tanggal Lahir (Lengkap)',
    'Tanggal Lahir (Standar)',
    'Agama',
    'Kelas',
    'Rombel',
    'Alamat',
    'Kelurahan',
    'Kecamatan',
    'Kota/Kabupaten',
    'Provinsi',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'No HP',
  ];

  const rows = students.map((s, idx) => [
    idx + 1,
    `"${s.nis || ''}"`,
    `"${s.nisn || ''}"`,
    `"${(s.namaLengkap || '').replace(/"/g, '""')}"`,
    `"${s.jenisKelamin || ''}"`,
    `"${(s.tempatLahir || '').replace(/"/g, '""')}"`,
    `"${formatTanggalIndonesiaLengkap(s.tanggalLahir).replace(/"/g, '""')}"`,
    `"${s.tanggalLahir || ''}"`,
    `"${s.agama || ''}"`,
    `"${s.kelasSekarang || ''}"`,
    `"${s.rombel || rombel}"`,
    `"${(s.alamat || '').replace(/"/g, '""')}"`,
    `"${(s.kelurahan || '').replace(/"/g, '""')}"`,
    `"${(s.kecamatan || '').replace(/"/g, '""')}"`,
    `"${(s.kabupatenKota || '').replace(/"/g, '""')}"`,
    `"${(s.provinsi || 'Banten').replace(/"/g, '""')}"`,
    `"${(s.dataAyah?.nama || '').replace(/"/g, '""')}"`,
    `"${(s.dataAyah?.pekerjaan || '').replace(/"/g, '""')}"`,
    `"${(s.dataIbu?.nama || '').replace(/"/g, '""')}"`,
    `"${(s.dataIbu?.pekerjaan || '').replace(/"/g, '""')}"`,
    `"${s.dataAyah?.noHp || s.dataIbu?.noHp || s.noHp || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Daftar_Siswa_Kelas_${kelas}_${rombel}_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
