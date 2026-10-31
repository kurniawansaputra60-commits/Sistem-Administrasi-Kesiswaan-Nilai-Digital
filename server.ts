import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database storage directory for server backup
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mysqlSupported: true,
  });
});

// Helper to obtain MySQL connection
async function getMySQLConnection(cfg?: any) {
  return await mysql.createConnection({
    host: cfg?.host || process.env.MYSQL_HOST || 'localhost',
    port: Number(cfg?.port || process.env.MYSQL_PORT || 3306),
    user: cfg?.user || process.env.MYSQL_USER || 'root',
    password: cfg?.password !== undefined ? cfg.password : process.env.MYSQL_PASSWORD || '',
    database: cfg?.database || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah',
    connectTimeout: 5000,
  });
}

// Test connection to live MySQL database and count existing records
app.post('/api/mysql/test-connection', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  try {
    const connection = await getMySQLConnection({ host, port, user, password, database });
    await connection.ping();

    // Check if tables exist
    let siswaCount = 0;
    try {
      const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM `siswa`');
      siswaCount = rows?.[0]?.count || 0;
    } catch {}

    await connection.end();
    return res.json({
      success: true,
      message: `Koneksi ke database MySQL '${database || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah'}' BERHASIL! Ditemukan ${siswaCount} data siswa di tabel 'siswa'.`,
      siswaCount,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      message: `Koneksi MySQL gagal: ${err.message}. Pastikan host, database, user, dan password benar. Jika menggunakan remote hosting, aktifkan 'Remote MySQL' di cPanel.`,
      errorDetail: err.code || err.message,
    });
  }
});

// Push current application data directly into live MySQL tables
app.post('/api/mysql/push', async (req, res) => {
  const { config, students, schoolProfile } = req.body;
  try {
    const connection = await getMySQLConnection(config);

    // 1. Update/Insert sekolah_profile
    if (schoolProfile) {
      await connection.query(`
        INSERT INTO \`sekolah_profile\` (
          id, nama_sekolah, npsn, nss, alamat, desa_kelurahan, kecamatan, kabupaten_kota,
          provinsi, kode_pos, telepon, email, nama_kepala_sekolah, nip_kepala_sekolah,
          nama_wali_kelas, nip_wali_kelas, nama_petugas_admin, nip_petugas_admin,
          tahun_ajaran_aktif, semester_aktif
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ) ON DUPLICATE KEY UPDATE
          nama_sekolah = VALUES(nama_sekolah),
          npsn = VALUES(npsn),
          nss = VALUES(nss),
          alamat = VALUES(alamat),
          desa_kelurahan = VALUES(desa_kelurahan),
          kecamatan = VALUES(kecamatan),
          kabupaten_kota = VALUES(kabupaten_kota),
          provinsi = VALUES(provinsi),
          kode_pos = VALUES(kode_pos),
          telepon = VALUES(telepon),
          email = VALUES(email),
          nama_kepala_sekolah = VALUES(nama_kepala_sekolah),
          nip_kepala_sekolah = VALUES(nip_kepala_sekolah),
          nama_wali_kelas = VALUES(nama_wali_kelas),
          nip_wali_kelas = VALUES(nip_wali_kelas),
          nama_petugas_admin = VALUES(nama_petugas_admin),
          nip_petugas_admin = VALUES(nip_petugas_admin),
          tahun_ajaran_aktif = VALUES(tahun_ajaran_aktif),
          semester_aktif = VALUES(semester_aktif)
      `, [
        schoolProfile.namaSekolah || 'SD NEGERI 1 CEMPAKA',
        schoolProfile.npsn || '20602495',
        schoolProfile.nss || '101020304048',
        schoolProfile.alamat || '',
        schoolProfile.desaKelurahan || '',
        schoolProfile.kecamatan || '',
        schoolProfile.kabupatenKota || '',
        schoolProfile.provinsi || '',
        schoolProfile.kodePos || '',
        schoolProfile.telepon || '',
        schoolProfile.email || '',
        schoolProfile.namaKepalaSekolah || '',
        schoolProfile.nipKepalaSekolah || '',
        schoolProfile.namaWaliKelas || '',
        schoolProfile.nipWaliKelas || '',
        schoolProfile.namaPetugasAdmin || '',
        schoolProfile.nipPetugasAdmin || '',
        schoolProfile.tahunAjaranAktif || '2025/2026',
        schoolProfile.semesterAktif || '2',
      ]);
    }

    // 2. Batch insert/update siswa
    if (Array.isArray(students) && students.length > 0) {
      for (const s of students) {
        await connection.query(`
          INSERT INTO \`siswa\` (
            id, nis, nisn, nama_lengkap, nama_panggilan, jenis_kelamin,
            tempat_lahir, tanggal_lahir, agama, kewarganegaraan, anak_ke,
            jumlah_saudara, bahasa_sehari_hari, alamat, kelurahan, kecamatan,
            kabupaten_kota, provinsi, telepon, no_hp, status_siswa, kelas_sekarang,
            tanggal_diterima, diterima_di_kelas, asal_sekolah, no_ijazah_sebelumnya,
            ayah_nama, ayah_pendidikan, ayah_pekerjaan, ayah_penghasilan, ayah_hp,
            ibu_nama, ibu_pendidikan, ibu_pekerjaan, ibu_penghasilan, ibu_hp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            nama_lengkap = VALUES(nama_lengkap),
            nama_panggilan = VALUES(nama_panggilan),
            jenis_kelamin = VALUES(jenis_kelamin),
            tempat_lahir = VALUES(tempat_lahir),
            tanggal_lahir = VALUES(tanggal_lahir),
            agama = VALUES(agama),
            alamat = VALUES(alamat),
            kelas_sekarang = VALUES(kelas_sekarang),
            status_siswa = VALUES(status_siswa),
            ayah_nama = VALUES(ayah_nama),
            ibu_nama = VALUES(ibu_nama)
        `, [
          s.id,
          s.nis || s.id,
          s.nisn || s.nis || s.id,
          s.namaLengkap || '',
          s.namaPanggilan || '',
          s.jenisKelamin || 'L',
          s.tempatLahir || '',
          s.tanggalLahir ? s.tanggalLahir.slice(0, 10) : null,
          s.agama || 'Islam',
          s.kewarganegaraan || 'WNI',
          s.anakKe || 1,
          s.jumlahSaudara || 0,
          s.bahasaSehariHari || 'Indonesia',
          s.alamat || '',
          s.kelurahan || '',
          s.kecamatan || '',
          s.kabupatenKota || '',
          s.provinsi || '',
          s.telepon || '',
          s.noHp || '',
          s.statusSiswa || 'aktif',
          s.kelasSekarang || 'I',
          s.tanggalDiterima ? s.tanggalDiterima.slice(0, 10) : null,
          s.diterimaDiKelas || 'I',
          s.asalSekolah || '',
          s.noIjazahSebelumnya || '',
          s.dataAyah?.nama || '',
          s.dataAyah?.pendidikan || '',
          s.dataAyah?.pekerjaan || '',
          s.dataAyah?.penghasilan || '',
          s.dataAyah?.noHp || '',
          s.dataIbu?.nama || '',
          s.dataIbu?.pendidikan || '',
          s.dataIbu?.pekerjaan || '',
          s.dataIbu?.penghasilan || '',
          s.dataIbu?.noHp || '',
        ]);
      }
    }

    await connection.end();
    return res.json({
      success: true,
      message: `Berhasil mengirim dan menyinkronkan data profil sekolah dan ${students?.length || 0} siswa ke server MySQL Live!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pull data from live MySQL database into application format
app.post('/api/mysql/pull', async (req, res) => {
  const { config } = req.body;
  try {
    const connection = await getMySQLConnection(config);

    // 1. Get profile
    let profileData: any = null;
    try {
      const [profiles]: any = await connection.query('SELECT * FROM `sekolah_profile` LIMIT 1');
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        profileData = {
          namaSekolah: p.nama_sekolah,
          npsn: p.npsn,
          nss: p.nss,
          alamat: p.alamat,
          desaKelurahan: p.desa_kelurahan,
          kecamatan: p.kecamatan,
          kabupatenKota: p.kabupaten_kota,
          provinsi: p.provinsi,
          kodePos: p.kode_pos,
          telepon: p.telepon,
          email: p.email,
          namaKepalaSekolah: p.nama_kepala_sekolah,
          nipKepalaSekolah: p.nip_kepala_sekolah,
          namaWaliKelas: p.nama_wali_kelas,
          nipWaliKelas: p.nip_wali_kelas,
          namaPetugasAdmin: p.nama_petugas_admin,
          nipPetugasAdmin: p.nip_petugas_admin,
          tahunAjaranAktif: p.tahun_ajaran_aktif,
          semesterAktif: p.semester_aktif,
        };
      }
    } catch {}

    // 2. Get students
    const [rows]: any = await connection.query('SELECT * FROM `siswa` ORDER BY `kelas_sekarang` ASC, `nama_lengkap` ASC');
    const studentsData = rows.map((r: any) => ({
      id: r.id,
      nis: r.nis,
      nisn: r.nisn,
      namaLengkap: r.nama_lengkap,
      namaPanggilan: r.nama_panggilan || '',
      jenisKelamin: r.jenis_kelamin,
      tempatLahir: r.tempat_lahir || '',
      tanggalLahir: r.tanggal_lahir ? new Date(r.tanggal_lahir).toISOString().slice(0, 10) : '',
      agama: r.agama || 'Islam',
      kewarganegaraan: r.kewarganegaraan || 'WNI',
      anakKe: Number(r.anak_ke) || 1,
      jumlahSaudara: Number(r.jumlah_saudara) || 0,
      bahasaSehariHari: r.bahasa_sehari_hari || 'Indonesia',
      alamat: r.alamat || '',
      kelurahan: r.kelurahan || '',
      kecamatan: r.kecamatan || '',
      kabupatenKota: r.kabupaten_kota || '',
      provinsi: r.provinsi || '',
      telepon: r.telepon || '',
      noHp: r.no_hp || '',
      statusSiswa: r.status_siswa || 'aktif',
      kelasSekarang: r.kelas_sekarang || 'I',
      tanggalDiterima: r.tanggal_diterima ? new Date(r.tanggal_diterima).toISOString().slice(0, 10) : '',
      diterimaDiKelas: r.diterima_di_kelas || 'I',
      asalSekolah: r.asal_sekolah || '',
      noIjazahSebelumnya: r.no_ijazah_sebelumnya || '',
      dataAyah: {
        nama: r.ayah_nama || '',
        pendidikan: r.ayah_pendidikan || '',
        pekerjaan: r.ayah_pekerjaan || '',
        penghasilan: r.ayah_penghasilan || '',
        noHp: r.ayah_hp || '',
      },
      dataIbu: {
        nama: r.ibu_nama || '',
        pendidikan: r.ibu_pendidikan || '',
        pekerjaan: r.ibu_pekerjaan || '',
        penghasilan: r.ibu_penghasilan || '',
        noHp: r.ibu_hp || '',
      },
      nilaiSemester: {},
    }));

    await connection.end();
    return res.json({
      success: true,
      message: `Berhasil menarik ${studentsData.length} data siswa dari tabel MySQL Live!`,
      students: studentsData,
      schoolProfile: profileData,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Sync data endpoint: Save and retrieve system data for instant multi-device sync & offline fallback
app.get('/api/data', (req, res) => {
  try {
    const filePath = path.join(dataDir, 'database_kesiswaan.json');
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(rawData);
      return res.json({ success: true, data: parsed });
    }
    return res.json({ success: true, data: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sync', (req, res) => {
  try {
    const payload = req.body;
    const filePath = path.join(dataDir, 'database_kesiswaan.json');
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    res.json({ success: true, message: 'Data kesiswaan berhasil disinkronkan ke server.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware error:', err);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  } else if (hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server administrasi kesiswaan aktif di port ${PORT}`);
  });
}

startServer();
