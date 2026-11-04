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

// Database storage directory for server backup (safe for Vercel read-only filesystem)
const dataDir = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn('Gagal membuat folder cadangan server dataDir:', e);
}

// Import TiDB Cloud / MySQL2 Pool Configuration & Storage Helpers
import pool, {
  checkDatabaseHealth,
  executeQuery,
  initTiDBSchemas,
  saveSchoolDataToTiDB,
  loadSchoolDataFromTiDB,
  isDatabaseConfigured,
} from './src/config/db.ts';

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mysqlSupported: true,
  });
});

// TiDB Cloud / Database Health Check Endpoint (mendukung GET dan POST dengan custom config)
app.all('/api/database/health', async (req, res) => {
  const customConfig = req.body?.config || (req.body?.host ? req.body : null) || (req.query?.host ? req.query : null);

  if (customConfig && customConfig.host && typeof customConfig.host === 'string' && customConfig.host.trim() !== '') {
    const start = Date.now();
    try {
      const conn = await getMySQLConnection(customConfig);
      await conn.query('SELECT 1');
      const latencyMs = Date.now() - start;
      let siswaCount = 0;
      try {
        const [rows]: any = await conn.query('SELECT COUNT(*) as count FROM `siswa`');
        siswaCount = rows?.[0]?.count || 0;
      } catch {}
      await conn.end();

      const isTiDB = (customConfig.host || '').includes('tidbcloud.com');
      return res.status(200).json({
        success: true,
        healthy: true,
        message: `Terhubung sukses ke ${isTiDB ? 'TiDB Cloud Serverless' : 'MySQL Database'} (${latencyMs}ms)`,
        latencyMs,
        host: customConfig.host,
        database: customConfig.database || 'test',
        isTiDB,
        siswaCount,
      });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        healthy: false,
        message: `Gagal terhubung ke TiDB Cloud: ${err.message}`,
        error: err.code || err.message,
        host: customConfig.host,
        database: customConfig.database || 'test',
        isTiDB: Boolean((customConfig.host || '').includes('tidbcloud.com')),
      });
    }
  }

  // Fallback ke Environment Variables default
  const health = await checkDatabaseHealth();
  return res.status(200).json({ success: health.healthy, ...health });
});

// TiDB Cloud Auto Table Schema Initialization Endpoint (mendukung custom config dari body)
app.post('/api/tidb/init-tables', async (req, res) => {
  const customConfig = req.body?.config || (req.body?.host ? req.body : undefined);
  const result = await initTiDBSchemas(customConfig);
  return res.status(200).json(result);
});

// TiDB Data Service REST API Proxy & Health Endpoint
app.get('/api/tidb-dataservice/health', async (req, res) => {
  const baseUrl = (req.query.baseUrl as string) || process.env.TIDB_DATA_SERVICE_BASE_URL || 'https://ap-southeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-xepxutFs/endpoint';
  const publicKey = (req.query.publicKey as string) || process.env.TIDB_DATA_SERVICE_PUBLIC_KEY || 'S3JJGQO0';
  const privateKey = (req.query.privateKey as string) || process.env.TIDB_DATA_SERVICE_PRIVATE_KEY || '';
  const schoolId = (req.query.schoolId as string) || '20602495';

  const startTime = Date.now();
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const targetUrl = `${cleanUrl}/get_school_profile?school_id=${encodeURIComponent(schoolId)}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (publicKey && privateKey) {
      headers['Authorization'] = `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`;
    }

    const response = await fetch(targetUrl, { method: 'GET', headers });
    const latencyMs = Date.now() - startTime;
    const isOk = response.ok;
    const status = response.status;
    let data = null;
    try {
      data = await response.json();
    } catch {}

    return res.json({
      success: isOk,
      status,
      latencyMs,
      message: isOk
        ? `Berhasil terhubung ke TiDB Data Service (${latencyMs}ms)!`
        : `TiDB Data Service merespons status ${status}`,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Gagal memanggil TiDB Data Service: ${err.message}`,
    });
  }
});

/**
 * Endpoint Contoh: Mengambil seluruh data tabel siswa dari TiDB Cloud / MySQL
 * Mendukung filter kelas (?kelas=I) dan pencarian nama/NISN (?search=Andi)
 * Dilengkapi penanganan error mendalam untuk koneksi terputus (503 Service Unavailable),
 * tabel belum dibuat (404 Not Found), dan kegagalan query lainnya.
 */
app.get(['/api/students', '/api/mysql/students'], async (req, res) => {
  const { kelas, search } = req.query;

  if (!isDatabaseConfigured()) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: 'Database TiDB Cloud / MySQL belum dikonfigurasi di Environment Variables.',
      total: 0,
      data: [],
    });
  }

  try {
    let sql = 'SELECT * FROM `siswa` WHERE 1=1';
    const params: any[] = [];

    if (kelas && typeof kelas === 'string' && kelas.trim() !== '') {
      sql += ' AND `kelas_sekarang` = ?';
      params.push(kelas.trim());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ' AND (`nama_lengkap` LIKE ? OR `nisn` LIKE ? OR `nis` LIKE ?)';
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }

    sql += ' ORDER BY `kelas_sekarang` ASC, `nama_lengkap` ASC';

    // Eksekusi query menggunakan fungsi executeQuery yang memiliki auto-retry jika koneksi sempat terputus
    const rows = await executeQuery<any[]>(sql, params);

    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil ${rows.length} data siswa dari TiDB Cloud / MySQL.`,
      total: rows.length,
      data: rows,
    });
  } catch (error: any) {
    console.error('[API Error /api/students]:', error);

    // 1. Tangani jika koneksi ke database terputus / tidak dapat dijangkau
    const connectionErrorCodes = [
      'PROTOCOL_CONNECTION_LOST',
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
      'ER_CON_COUNT_ERROR',
      'SERVER_SHUTDOWN',
      'HANDSHAKE_ERROR',
    ];

    if (connectionErrorCodes.includes(error.code) || error.message?.includes('Connection lost') || error.message?.includes('ETIMEDOUT')) {
      return res.status(503).json({
        success: false,
        error: 'DATABASE_CONNECTION_LOST',
        message: 'Koneksi ke TiDB Cloud terputus atau tidak dapat dijangkau saat mengambil data siswa.',
        detail: `Kode Error: ${error.code || 'UNKNOWN'}. Silakan periksa kembali TIDB_HOST, status cluster TiDB Cloud, serta pastikan konfigurasi SSL/TLS aktif.`,
        retryable: true,
      });
    }

    // 2. Tangani jika tabel belum diimpor / tidak ditemukan di database
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(404).json({
        success: false,
        error: 'TABLE_NOT_FOUND',
        message: "Tabel 'siswa' belum ada di database TiDB Cloud Anda. Silakan impor struktur tabel terlebih dahulu melalui menu Database MySQL di aplikasi.",
        detail: error.message,
      });
    }

    // 3. Tangani error autentikasi atau izin akses
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_FAILED',
        message: 'Akses ke TiDB Cloud ditolak. Periksa username dan password pada TIDB_USER / TIDB_PASSWORD.',
        detail: error.message,
      });
    }

    // 4. Kesalahan query / server umum
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Terjadi kesalahan pada server saat memproses data siswa.',
      detail: error.message,
    });
  }
});

// Helper to obtain MySQL connection (fallback for direct manual config testing)
async function getMySQLConnection(cfg?: any) {
  const isTargetTiDB = (cfg?.host || process.env.TIDB_HOST || process.env.MYSQL_HOST || '').includes('tidbcloud.com');
  const defaultPort = isTargetTiDB ? 4000 : 3306;

  return await mysql.createConnection({
    host: cfg?.host || process.env.TIDB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: Number(cfg?.port || process.env.TIDB_PORT || process.env.MYSQL_PORT || defaultPort),
    user: cfg?.user || process.env.TIDB_USER || process.env.MYSQL_USER || 'root',
    password: cfg?.password !== undefined 
      ? cfg.password 
      : (process.env.TIDB_PASSWORD || process.env.MYSQL_PASSWORD || ''),
    database: cfg?.database || process.env.TIDB_DATABASE || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah',
    connectTimeout: 8000,
    ssl: (cfg?.ssl === false || process.env.TIDB_ENABLE_SSL === 'false') 
      ? undefined 
      : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
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

// Sync data endpoint: Save and retrieve system data for instant multi-device sync, TiDB Cloud, and offline fallback
app.get(['/api/data', '/api/sync', '/api/school-data'], async (_req, res) => {
  try {
    // 1. Prioritaskan pengambilan dari TiDB Cloud jika terhubung
    try {
      const cloudData = await loadSchoolDataFromTiDB();
      if (cloudData) {
        return res.json({ success: true, source: 'tidb_cloud', data: cloudData });
      }
    } catch (e) {
      console.warn('[TiDB Read Warning]:', e);
    }

    // 2. Fallback ke disk lokal data/database_kesiswaan.json
    const filePath = path.join(dataDir, 'database_kesiswaan.json');
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(rawData);
      return res.json({ success: true, source: 'server_disk', data: parsed });
    }

    return res.json({ success: true, data: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const payload = req.body;
    
    // 1. Tulis ke file disk server
    try {
      const filePath = path.join(dataDir, 'database_kesiswaan.json');
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Gagal menulis cadangan lokal data/database_kesiswaan.json:', e);
    }

    // 2. Simpan juga ke TiDB Cloud jika terhubung
    let tidbSaved = false;
    try {
      tidbSaved = await saveSchoolDataToTiDB(payload);
    } catch (e) {
      console.warn('Gagal sinkron ke TiDB Cloud:', e);
    }

    res.json({
      success: true,
      message: 'Data kesiswaan berhasil disinkronkan ke server.',
      tidbSaved,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rute API 404 - memastikan tidak ada permintaan /api/* yang menghasilkan HTML SPA
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint API '${req.originalUrl}' tidak ditemukan pada server backend.`,
  });
});

// Penanganan error global untuk API Express
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Terjadi kesalahan internal pada server.',
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.VERCEL) {
    // Di lingkungan Serverless Vercel, file statis dilayani otomatis oleh CDN Vercel
    return;
  }

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

export default app;
