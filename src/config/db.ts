import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Modul Konfigurasi Database TiDB Cloud / MySQL2 Pool
 * Menggunakan connection pool (createPool) dengan mysql2/promise
 * Mendukung SSL/TLS wajib TiDB Cloud (AWS/GCP Serverless), DATABASE_URL, dan pemulihan otomatis saat koneksi terputus.
 */

/**
 * Cek apakah kredensial database telah dikonfigurasi melalui Environment Variables
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL || process.env.TIDB_DATABASE_URL || process.env.MYSQL_URL;
  if (url && url.startsWith('mysql://')) {
    return true;
  }
  const host = process.env.TIDB_HOST || process.env.MYSQL_HOST;
  if (host && host.trim() !== '' && host !== 'localhost' && host !== '127.0.0.1') {
    return true;
  }
  return false;
}

function parseDatabaseConfig(): mysql.PoolOptions {
  // Dukungan untuk URL string DATABASE_URL (format umum Vercel / TiDB Cloud Connection String)
  const connectionUri = process.env.DATABASE_URL || process.env.TIDB_DATABASE_URL || process.env.MYSQL_URL;

  if (connectionUri && connectionUri.startsWith('mysql://')) {
    try {
      const url = new URL(connectionUri);
      return {
        host: url.hostname,
        port: Number(url.port) || 4000,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, '') || 'db_kesiswaan_sekolah',
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
      };
    } catch (e) {
      console.warn('Gagal mem-parsing DATABASE_URL, beralih ke variabel individual:', e);
    }
  }

  // Variabel individual
  const isTiDB = (process.env.TIDB_HOST || process.env.MYSQL_HOST || '').includes('tidbcloud.com');
  const defaultPort = isTiDB ? 4000 : 3306;

  return {
    host: process.env.TIDB_HOST || process.env.MYSQL_HOST || '',
    port: Number(process.env.TIDB_PORT || process.env.MYSQL_PORT || defaultPort),
    user: process.env.TIDB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.TIDB_PASSWORD !== undefined 
      ? process.env.TIDB_PASSWORD 
      : (process.env.MYSQL_PASSWORD || ''),
    database: process.env.TIDB_DATABASE || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    maxIdle: Number(process.env.DB_MAX_IDLE || 10),
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: (process.env.TIDB_ENABLE_SSL === 'false' || process.env.MYSQL_ENABLE_SSL === 'false')
      ? undefined
      : {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
  };
}

let dbConfig = parseDatabaseConfig();
let pool: mysql.Pool | null = null;

/**
 * Mendapatkan instance pool saat ini secara lazy atau membuat ulang jika konfigurasi kustom diberikan
 */
export function getPool(customConfig?: mysql.PoolOptions): mysql.Pool | null {
  if (customConfig) {
    return mysql.createPool(customConfig);
  }
  if (!isDatabaseConfigured()) {
    return null;
  }
  if (!pool) {
    dbConfig = parseDatabaseConfig();
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Cek kesehatan koneksi TiDB Cloud (Health Check)
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  latencyMs?: number;
  host?: string;
  database?: string;
  isTiDB?: boolean;
}> {
  if (!isDatabaseConfigured()) {
    return {
      healthy: false,
      message: 'Database TiDB Cloud / MySQL belum dikonfigurasi pada Environment Variables (TIDB_HOST atau DATABASE_URL).',
      host: 'Belum Dikonfigurasi',
      database: 'Belum Dikonfigurasi',
      isTiDB: false,
    };
  }

  const start = Date.now();
  const host = String(dbConfig.host || '');
  const database = String(dbConfig.database || 'db_kesiswaan_sekolah');
  const isTiDB = host.includes('tidbcloud.com');

  try {
    const currentPool = getPool();
    if (!currentPool) {
      return {
        healthy: false,
        message: 'Pool database belum diinisialisasi.',
        host,
        database,
        isTiDB,
      };
    }
    await currentPool.query('SELECT 1');
    const latencyMs = Date.now() - start;
    return {
      healthy: true,
      message: `Terhubung dengan sukses ke ${isTiDB ? 'TiDB Cloud Serverless' : 'MySQL Database'} (${latencyMs}ms)`,
      latencyMs,
      host,
      database,
      isTiDB,
    };
  } catch (error: any) {
    return {
      healthy: false,
      message: `Gagal terhubung ke database: ${error.message} (${error.code || 'UNKNOWN_ERROR'})`,
      host,
      database,
      isTiDB,
    };
  }
}

/**
 * Inisialisasi tabel dasar pada TiDB Cloud / MySQL otomatis jika belum ada.
 * Mendukung konfigurasi kustom dari frontend (misalnya saat pengujian live) atau pool default.
 */
export async function initTiDBSchemas(customConfig?: any): Promise<{ success: boolean; message: string }> {
  let targetClient: any = null;
  let isStandalone = false;

  try {
    if (customConfig && customConfig.host && typeof customConfig.host === 'string' && customConfig.host.trim() !== '') {
      const isTargetTiDB = (customConfig.host || '').includes('tidbcloud.com');
      const defaultPort = isTargetTiDB ? 4000 : 3306;
      targetClient = await mysql.createConnection({
        host: customConfig.host,
        port: Number(customConfig.port) || defaultPort,
        user: customConfig.user || 'root',
        password: customConfig.password !== undefined ? customConfig.password : '',
        database: customConfig.database || 'test',
        connectTimeout: 10000,
        ssl: customConfig.ssl === false ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      });
      isStandalone = true;
    } else if (isDatabaseConfigured()) {
      targetClient = getPool();
      if (!targetClient) {
        return { success: false, message: 'Pool database tidak tersedia.' };
      }
    } else {
      return {
        success: false,
        message: 'Koneksi database belum aktif. Harap isi formulir Host & Password TiDB atau atur variabel TIDB_HOST di Vercel.',
      };
    }

    const currentPool = targetClient;

    // 1. Tabel school_data untuk sinkronisasi dokumen instan
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`school_data\` (
        \`key_name\` VARCHAR(64) PRIMARY KEY,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Tabel sekolah_profile
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`sekolah_profile\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nama_sekolah\` VARCHAR(150) NOT NULL,
        \`npsn\` VARCHAR(20) NOT NULL,
        \`nss\` VARCHAR(30) NOT NULL,
        \`alamat\` TEXT NOT NULL,
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
        \`tahun_ajaran_aktif\` VARCHAR(20) NOT NULL,
        \`semester_aktif\` ENUM('1', '2') NOT NULL DEFAULT '2',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Tabel siswa
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`siswa\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`nis\` VARCHAR(30) NOT NULL,
        \`nisn\` VARCHAR(30) NOT NULL,
        \`nama_lengkap\` VARCHAR(150) NOT NULL,
        \`nama_panggilan\` VARCHAR(50),
        \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
        \`tempat_lahir\` VARCHAR(100),
        \`tanggal_lahir\` DATE,
        \`agama\` VARCHAR(30),
        \`kewarganegaraan\` VARCHAR(30) DEFAULT 'WNI',
        \`anak_ke\` INT DEFAULT 1,
        \`jumlah_saudara\` INT DEFAULT 0,
        \`bahasa_sehari_hari\` VARCHAR(50) DEFAULT 'Indonesia',
        \`alamat\` TEXT,
        \`kelurahan\` VARCHAR(100),
        \`kecamatan\` VARCHAR(100),
        \`kabupaten_kota\` VARCHAR(100),
        \`provinsi\` VARCHAR(100),
        \`telepon\` VARCHAR(30),
        \`no_hp\` VARCHAR(30),
        \`status_siswa\` ENUM('aktif', 'lulus', 'mutasi_keluar', 'drop_out', 'meninggal') DEFAULT 'aktif',
        \`kelas_sekarang\` VARCHAR(10) NOT NULL,
        \`tanggal_diterima\` DATE,
        \`diterima_di_kelas\` VARCHAR(10),
        \`asal_sekolah\` VARCHAR(150),
        \`no_ijazah_sebelumnya\` VARCHAR(50),
        \`ayah_nama\` VARCHAR(120),
        \`ayah_pendidikan\` VARCHAR(50),
        \`ayah_pekerjaan\` VARCHAR(80),
        \`ayah_penghasilan\` VARCHAR(50),
        \`ayah_hp\` VARCHAR(30),
        \`ibu_nama\` VARCHAR(120),
        \`ibu_pendidikan\` VARCHAR(50),
        \`ibu_pekerjaan\` VARCHAR(80),
        \`ibu_penghasilan\` VARCHAR(50),
        \`ibu_hp\` VARCHAR(30),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kelas (kelas_sekarang),
        INDEX idx_nisn (nisn)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Tabel schools & students (kompatibilitas multi-tenancy TiDB Data Service)
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`schools\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`nama_sekolah\` VARCHAR(150) NOT NULL,
        \`npsn\` VARCHAR(20) NOT NULL,
        \`alamat\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`school_id\` VARCHAR(50) NOT NULL,
        \`nis\` VARCHAR(30) NOT NULL,
        \`nisn\` VARCHAR(30) NOT NULL,
        \`nama_lengkap\` VARCHAR(150) NOT NULL,
        \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
        \`kelas_sekarang\` VARCHAR(10) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX idx_school_kelas (\`school_id\`, \`kelas_sekarang\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    if (isStandalone && targetClient) {
      await targetClient.end();
    }

    return {
      success: true,
      message: 'Struktur tabel TiDB Cloud (`school_data`, `sekolah_profile`, `siswa`, `schools`, `students`) berhasil diinisialisasi.',
    };
  } catch (error: any) {
    if (isStandalone && targetClient) {
      try { await targetClient.end(); } catch {}
    }
    return {
      success: false,
      message: `Gagal inisialisasi tabel di TiDB: ${error.message}`,
    };
  }
}

/**
 * Simpan snapshot data lengkap ke tabel school_data di TiDB Cloud
 */
export async function saveSchoolDataToTiDB(data: any): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const currentPool = getPool();
    if (!currentPool) return false;

    const jsonStr = JSON.stringify(data);
    await currentPool.query(
      `INSERT INTO \`school_data\` (\`key_name\`, \`data_json\`) 
       VALUES ('main', ?) 
       ON DUPLICATE KEY UPDATE \`data_json\` = VALUES(\`data_json\`), \`updated_at\` = CURRENT_TIMESTAMP`,
      [jsonStr]
    );
    return true;
  } catch (error: any) {
    // Supress noise if connection is refused or unavailable
    if (error?.code !== 'ECONNREFUSED') {
      console.warn('[TiDB Cloud] Gagal menyimpan snapshot school_data:', error.message || error);
    }
    return false;
  }
}

/**
 * Muat snapshot data dari tabel school_data di TiDB Cloud
 */
export async function loadSchoolDataFromTiDB(): Promise<any | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const currentPool = getPool();
    if (!currentPool) return null;

    const [rows]: any = await currentPool.query(
      `SELECT \`data_json\` FROM \`school_data\` WHERE \`key_name\` = 'main' LIMIT 1`
    );
    if (rows && rows.length > 0 && rows[0].data_json) {
      return JSON.parse(rows[0].data_json);
    }
    return null;
  } catch (error: any) {
    if (error?.code !== 'ECONNREFUSED') {
      console.warn('[TiDB Cloud] Gagal memuat snapshot school_data:', error.message || error);
    }
    return null;
  }
}

/**
 * Helper eksekusi query dengan proteksi Retry Otomatis saat koneksi terputus.
 */
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = [],
  maxRetries = 2
): Promise<T> {
  if (!isDatabaseConfigured()) {
    throw new Error('Database TiDB Cloud / MySQL belum dikonfigurasi pada server.');
  }

  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Pool koneksi database belum tersedia.');
  }

  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      const [results] = await currentPool.query(sql, params);
      return results as T;
    } catch (err: any) {
      attempts++;
      
      const isConnectionLost = [
        'PROTOCOL_CONNECTION_LOST',
        'ECONNRESET',
        'ETIMEDOUT',
        'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
        'SERVER_SHUTDOWN',
        'ECONNREFUSED',
      ].includes(err.code);

      console.warn(`[TiDB/MySQL Warning] Query gagal (Percobaan ${attempts}/${maxRetries + 1}): ${err.message} [Code: ${err.code}]`);

      if (isConnectionLost && attempts <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        continue;
      }

      throw err;
    }
  }

  throw new Error('Gagal mengeksekusi query setelah batas percobaan retry tercapai.');
}

export default pool;
