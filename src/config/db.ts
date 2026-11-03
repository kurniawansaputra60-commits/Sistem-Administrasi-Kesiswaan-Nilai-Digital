import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Modul Konfigurasi Database TiDB Cloud / MySQL2 Pool
 * Menggunakan connection pool (createPool) dengan mysql2/promise
 * Mendukung SSL/TLS wajib TiDB Cloud dan pemulihan otomatis saat koneksi terputus.
 */

// Port default TiDB Cloud adalah 4000 (MySQL standar 3306)
const isTiDB = (process.env.TIDB_HOST || process.env.MYSQL_HOST || '').includes('tidbcloud.com');
const defaultPort = isTiDB ? 4000 : 3306;

// Konfigurasi koneksi dari environment variables (process.env)
const dbConfig: mysql.PoolOptions = {
  host: process.env.TIDB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.TIDB_PORT || process.env.MYSQL_PORT || defaultPort),
  user: process.env.TIDB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.TIDB_PASSWORD !== undefined 
    ? process.env.TIDB_PASSWORD 
    : (process.env.MYSQL_PASSWORD || ''),
  database: process.env.TIDB_DATABASE || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah',
  
  // Konfigurasi Connection Pool
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  maxIdle: Number(process.env.DB_MAX_IDLE || 10),
  idleTimeout: 60000, // 60 detik idle timeout
  queueLimit: 0,
  
  // Keep-alive untuk menjaga koneksi cloud tidak diputus oleh gateway/NAT
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 detik

  // TiDB Cloud mewajibkan koneksi terenkripsi SSL/TLS
  // Hanya dinonaktifkan jika TIDB_ENABLE_SSL secara eksplisit bernilai 'false' atau localhost tanpa SSL
  ssl: (process.env.TIDB_ENABLE_SSL === 'false' || process.env.MYSQL_ENABLE_SSL === 'false')
    ? undefined
    : {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
};

// Inisialisasi pool
let pool: mysql.Pool = mysql.createPool(dbConfig);

/**
 * Mendapatkan instance pool saat ini.
 * Jika pool rusak atau di-shutdown, fungsi ini dapat membuat ulang pool secara dinamis.
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Uji kesehatan koneksi database (Health Check).
 * Mengembalikan true jika koneksi aktif dan siap menerima query.
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const currentPool = getPool();
    // Query ringan 'SELECT 1' untuk memverifikasi soket koneksi masih terbuka
    await currentPool.query('SELECT 1');
    const latencyMs = Date.now() - start;
    return {
      healthy: true,
      message: `Database TiDB Cloud terhubung dengan baik (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (error: any) {
    return {
      healthy: false,
      message: `Gagal terhubung ke database: ${error.message} (${error.code || 'UNKNOWN_ERROR'})`,
    };
  }
}

/**
 * Helper eksekusi query dengan proteksi Retry Otomatis saat koneksi terputus.
 * Menangani error pemutusan koneksi seperti:
 * - PROTOCOL_CONNECTION_LOST
 * - ECONNRESET
 * - ETIMEDOUT
 * - ER_CON_COUNT_ERROR
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

      console.warn(`[MySQL/TiDB Warning] Query gagal (Percobaan ${attempts}/${maxRetries + 1}): ${err.message} [Code: ${err.code}]`);

      // Jika koneksi terputus dan masih ada kuota retry, tunggu sebentar lalu coba lagi
      if (isConnectionLost && attempts <= maxRetries) {
        console.info(`[MySQL/TiDB Info] Mencoba menyambungkan kembali ke TiDB Cloud dalam ${attempts * 500}ms...`);
        await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        continue;
      }

      // Lempar error jika bukan masalah koneksi atau kuota retry telah habis
      throw err;
    }
  }

  throw new Error('Gagal mengeksekusi query setelah batas percobaan retry tercapai.');
}

export default pool;
