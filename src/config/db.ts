import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Modul Konfigurasi Database TiDB Cloud / MySQL2 Pool
 * Menggunakan connection pool (createPool) dengan mysql2/promise
 * Mendukung SSL/TLS wajib TiDB Cloud (AWS/GCP Serverless), DATABASE_URL, dan pemulihan otomatis saat koneksi terputus.
 */

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
    host: process.env.TIDB_HOST || process.env.MYSQL_HOST || 'localhost',
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
let pool: mysql.Pool = mysql.createPool(dbConfig);

/**
 * Mendapatkan instance pool saat ini atau membuat ulang jika konfigurasi berubah
 */
export function getPool(customConfig?: mysql.PoolOptions): mysql.Pool {
  if (customConfig) {
    return mysql.createPool(customConfig);
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
  const start = Date.now();
  const host = String(dbConfig.host || 'localhost');
  const database = String(dbConfig.database || 'db_kesiswaan_sekolah');
  const isTiDB = host.includes('tidbcloud.com');

  try {
    const currentPool = getPool();
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
 * Inisialisasi tabel dasar pada TiDB Cloud / MySQL otomatis jika belum ada
 */
export async function initTiDBSchemas(): Promise<{ success: boolean; message: string }> {
  try {
    const currentPool = getPool();

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

    return {
      success: true,
      message: 'Struktur tabel TiDB Cloud (`school_data`, `sekolah_profile`, `siswa`) berhasil diinisialisasi.',
    };
  } catch (error: any) {
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
  try {
    const currentPool = getPool();
    const jsonStr = JSON.stringify(data);
    await currentPool.query(
      `INSERT INTO \`school_data\` (\`key_name\`, \`data_json\`) 
       VALUES ('main', ?) 
       ON DUPLICATE KEY UPDATE \`data_json\` = VALUES(\`data_json\`), \`updated_at\` = CURRENT_TIMESTAMP`,
      [jsonStr]
    );
    return true;
  } catch (error) {
    console.warn('[TiDB Cloud] Gagal menyimpan snapshot school_data:', error);
    return false;
  }
}

/**
 * Muat snapshot data dari tabel school_data di TiDB Cloud
 */
export async function loadSchoolDataFromTiDB(): Promise<any | null> {
  try {
    const currentPool = getPool();
    const [rows]: any = await currentPool.query(
      `SELECT \`data_json\` FROM \`school_data\` WHERE \`key_name\` = 'main' LIMIT 1`
    );
    if (rows && rows.length > 0 && rows[0].data_json) {
      return JSON.parse(rows[0].data_json);
    }
    return null;
  } catch (error) {
    console.warn('[TiDB Cloud] Gagal memuat snapshot school_data:', error);
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
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      const currentPool = getPool();
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
