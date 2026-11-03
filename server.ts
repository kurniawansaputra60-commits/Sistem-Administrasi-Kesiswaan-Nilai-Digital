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

// Helper to obtain MySQL / TiDB Cloud connection
async function getMySQLConnection(cfg?: any) {
  const host = cfg?.host || process.env.MYSQL_HOST || 'localhost';
  const port = Number(cfg?.port || process.env.MYSQL_PORT || 3306);
  const isTiDB = host.toLowerCase().includes('tidbcloud.com') || host.toLowerCase().includes('tidb') || port === 4000;
  const targetDb = cfg?.database || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah';
  const user = cfg?.user || process.env.MYSQL_USER || 'root';
  const password = cfg?.password !== undefined ? cfg.password : process.env.MYSQL_PASSWORD || '';
  const ssl = isTiDB || cfg?.useSSL ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined;

  try {
    return await mysql.createConnection({
      host,
      port: isTiDB && port === 3306 ? 4000 : port,
      user,
      password,
      database: targetDb,
      ssl,
      connectTimeout: 6000,
    });
  } catch (err: any) {
    // If unknown database error (ER_BAD_DB_ERROR or 1049), connect without database and auto-create it!
    if (err.code === 'ER_BAD_DB_ERROR' || err.errno === 1049 || String(err.message).includes('Unknown database')) {
      const rootConn = await mysql.createConnection({
        host,
        port: isTiDB && port === 3306 ? 4000 : port,
        user,
        password,
        ssl,
        connectTimeout: 6000,
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await rootConn.query(`USE \`${targetDb}\``);
      return rootConn;
    }
    throw err;
  }
}

// Test connection to live MySQL / TiDB Cloud database
app.post('/api/mysql/test-connection', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  const startTime = Date.now();
  try {
    const connection = await getMySQLConnection({ host, port, user, password, database });
    await connection.ping();
    const pingTime = Date.now() - startTime;

    // Check server version
    let serverVersion = 'MySQL';
    let isTiDB = false;
    try {
      const [vRows]: any = await connection.query('SELECT VERSION() as v');
      serverVersion = vRows?.[0]?.v || '';
      if (serverVersion.includes('TiDB') || (host && host.toLowerCase().includes('tidb'))) {
        isTiDB = true;
      }
    } catch {}

    // Check table count
    let tablesList: string[] = [];
    try {
      const [tblRows]: any = await connection.query('SHOW TABLES');
      tablesList = tblRows.map((r: any) => Object.values(r)[0] as string);
    } catch {}

    // Check siswa count
    let siswaCount = 0;
    const hasSiswaTable = tablesList.includes('siswa');
    if (hasSiswaTable) {
      try {
        const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM `siswa`');
        siswaCount = rows?.[0]?.count || 0;
      } catch {}
    }

    await connection.end();
    return res.json({
      success: true,
      isTiDB,
      serverVersion,
      pingTime,
      tablesCount: tablesList.length,
      tablesList,
      hasSiswaTable,
      siswaCount,
      database: database || 'db_kesiswaan_sekolah',
      message: isTiDB
        ? `Koneksi ke TiDB Cloud Serverless BERHASIL! (Latency: ${pingTime}ms, Engine: ${serverVersion}). Ditemukan ${tablesList.length} tabel.`
        : `Koneksi ke database '${database || 'db_kesiswaan_sekolah'}' BERHASIL! (Latency: ${pingTime}ms). Ditemukan ${siswaCount} data siswa di tabel 'siswa'.`,
    });
  } catch (err: any) {
    let friendlyMsg = err.message || 'Gagal menghubungi database.';
    const code = err.code || '';
    if (code === 'ETIMEDOUT') {
      friendlyMsg = 'Koneksi timeout. Pastikan Anda telah menambahkan IP 0.0.0.0/0 pada Security > IP Access List di TiDB Cloud Console.';
    } else if (code === 'ENOTFOUND') {
      friendlyMsg = `Host '${host}' tidak ditemukan. Periksa kembali nama host dari TiDB Cloud Console.`;
    } else if (code === 'ECONNREFUSED') {
      friendlyMsg = `Koneksi ditolak pada port ${port || 4000}. Untuk TiDB Cloud gunakan port 4000.`;
    } else if (code === 'ER_ACCESS_DENIED_ERROR') {
      friendlyMsg = 'Akses ditolak: User atau Password salah. Periksa kredensial di TiDB Cloud Console.';
    }

    return res.status(200).json({
      success: false,
      message: `Koneksi gagal: ${friendlyMsg}`,
      errorDetail: code || err.message,
    });
  }
});

// Push current application data directly into live MySQL / TiDB Cloud tables
app.post('/api/mysql/push', async (req, res) => {
  const { config, students, schoolProfile } = req.body;
  try {
    const connection = await getMySQLConnection(config);

    // 0. Ensure tables exist before inserting (essential for brand new TiDB Cloud instances)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`sekolah_profile\` (
        \`id\` INT PRIMARY KEY,
        \`nama_sekolah\` VARCHAR(150),
        \`npsn\` VARCHAR(20),
        \`nss\` VARCHAR(30),
        \`alamat\` TEXT,
        \`desa_kelurahan\` VARCHAR(100),
        \`kecamatan\` VARCHAR(100),
        \`kabupaten_kota\` VARCHAR(100),
        \`provinsi\` VARCHAR(100),
        \`kode_pos\` VARCHAR(10),
        \`telepon\` VARCHAR(30),
        \`email\` VARCHAR(100),
        \`nama_kepala_sekolah\` VARCHAR(120),
        \`nip_kepala_sekolah\` VARCHAR(30),
        \`nama_wali_kelas\` VARCHAR(120),
        \`nip_wali_kelas\` VARCHAR(30),
        \`nama_petugas_admin\` VARCHAR(120),
        \`nip_petugas_admin\` VARCHAR(30),
        \`tahun_ajaran_aktif\` VARCHAR(20),
        \`semester_aktif\` VARCHAR(10),
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`siswa\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`nis\` VARCHAR(30) NOT NULL,
        \`nisn\` VARCHAR(30) NOT NULL,
        \`nama_lengkap\` VARCHAR(150) NOT NULL,
        \`nama_panggilan\` VARCHAR(50),
        \`jenis_kelamin\` VARCHAR(10) NOT NULL,
        \`tempat_lahir\` VARCHAR(100),
        \`tanggal_lahir\` DATE,
        \`agama\` VARCHAR(50),
        \`kewarganegaraan\` VARCHAR(50),
        \`anak_ke\` INT DEFAULT 1,
        \`jumlah_saudara\` INT DEFAULT 0,
        \`bahasa_sehari_hari\` VARCHAR(50),
        \`alamat\` TEXT,
        \`kelurahan\` VARCHAR(100),
        \`kecamatan\` VARCHAR(100),
        \`kabupaten_kota\` VARCHAR(100),
        \`provinsi\` VARCHAR(100),
        \`telepon\` VARCHAR(30),
        \`no_hp\` VARCHAR(30),
        \`status_siswa\` VARCHAR(30) DEFAULT 'aktif',
        \`kelas_sekarang\` VARCHAR(20) DEFAULT 'I',
        \`tanggal_diterima\` DATE,
        \`diterima_di_kelas\` VARCHAR(20) DEFAULT 'I',
        \`asal_sekolah\` VARCHAR(120),
        \`no_ijazah_sebelumnya\` VARCHAR(50),
        \`ayah_nama\` VARCHAR(120),
        \`ayah_pendidikan\` VARCHAR(50),
        \`ayah_pekerjaan\` VARCHAR(100),
        \`ayah_penghasilan\` VARCHAR(100),
        \`ayah_hp\` VARCHAR(30),
        \`ibu_nama\` VARCHAR(120),
        \`ibu_pendidikan\` VARCHAR(50),
        \`ibu_pekerjaan\` VARCHAR(100),
        \`ibu_penghasilan\` VARCHAR(100),
        \`ibu_hp\` VARCHAR(30),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

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

// Interactive SQL Query Executor for TiDB Cloud / MySQL Console
app.post('/api/mysql/execute-query', async (req, res) => {
  const { config, query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query SQL harus diisi.' });
  }

  const trimmed = query.trim().toUpperCase();
  const allowedPrefixes = ['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN'];
  const isAllowed = allowedPrefixes.some(p => trimmed.startsWith(p));
  if (!isAllowed) {
    return res.status(400).json({
      success: false,
      error: 'Konsol interaktif dibatasi untuk perintah pembacaan (SELECT, SHOW, DESCRIBE, EXPLAIN) demi keamanan data kesiswaan.',
    });
  }

  try {
    const connection = await getMySQLConnection(config);
    const [rows]: any = await connection.query(query);
    await connection.end();
    return res.json({
      success: true,
      rows: Array.isArray(rows) ? rows.slice(0, 50) : rows,
      rowCount: Array.isArray(rows) ? rows.length : 1,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Sync data endpoint: Save and retrieve system data for instant multi-device sync & offline fallback
const handleGetData = (req: express.Request, res: express.Response) => {
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
};

app.get('/api/data', handleGetData);
app.get('/api/school-data', handleGetData);

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

app.get('/api/sync', (_req, res) => {
  try {
    const filePath = path.join(dataDir, 'database_kesiswaan.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data) });
    }
    return res.json({ success: false, message: 'No server backup found' });
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
