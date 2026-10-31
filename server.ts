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

// Test connection to live MySQL database
app.post('/api/mysql/test-connection', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  try {
    const connection = await mysql.createConnection({
      host: host || process.env.MYSQL_HOST || 'localhost',
      port: Number(port || process.env.MYSQL_PORT || 3306),
      user: user || process.env.MYSQL_USER || 'root',
      password: password !== undefined ? password : process.env.MYSQL_PASSWORD || '',
      database: database || process.env.MYSQL_DATABASE || 'db_kesiswaan_sekolah',
      connectTimeout: 4000,
    });
    await connection.ping();
    await connection.end();
    return res.json({ success: true, message: 'Koneksi ke server database MySQL berhasil terhubung!' });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      message: `Koneksi MySQL gagal: ${err.message}. Data tetap tersimpan aman di penyimpanan lokal dan dapat diekspor ke file .sql kapan saja untuk diimpor ke MySQL.`,
      errorDetail: err.code || err.message,
    });
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
