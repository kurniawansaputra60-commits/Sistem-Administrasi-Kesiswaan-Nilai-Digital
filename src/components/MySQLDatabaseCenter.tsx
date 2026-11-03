import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Database,
  Download,
  Copy,
  Check,
  RefreshCw,
  Server,
  FileCode,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  Terminal,
  Zap,
  Info,
} from 'lucide-react';

export const MySQLDatabaseCenter: React.FC = () => {
  const {
    mysqlConfig,
    updateMySQLConfig,
    testMySQLConnection,
    downloadMySQLDump,
    getMySQLDumpText,
    students,
    schoolProfile,
    importStudentsFromExcel,
    updateSchoolProfile,
    forceSyncToCloud,
    pullLatestFromCloud,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'tidb' | 'vercel' | 'github' | 'sql'>('tidb');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; host?: string; isTiDB?: boolean } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [initializingTables, setInitializingTables] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  const sqlDump = getMySQLDumpText();

  // Jalankan health check awal saat tab TiDB dibuka
  useEffect(() => {
    checkTiDBHealth();
  }, []);

  const checkTiDBHealth = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/database/health');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Tidak dapat memanggil API database: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInitTiDBTables = async () => {
    setInitializingTables(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/tidb/init-tables', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        await checkTiDBHealth();
      } else {
        setActionMsg({ type: 'error', text: data.message || 'Gagal inisialisasi tabel TiDB' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Gagal memanggil endpoint init tables: ${err.message}` });
    } finally {
      setInitializingTables(false);
    }
  };

  const handlePushToMySQL = async () => {
    setPushing(true);
    setActionMsg(null);
    try {
      // 1. Simpan ke sinkronisasi global server & TiDB
      await forceSyncToCloud();

      // 2. Simpan juga ke tabel relasional mysql
      const res = await fetch('/api/mysql/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig, students, schoolProfile }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `${data.message} Seluruh data siswa & profil tersimpan di TiDB Cloud / MySQL!` });
      } else {
        setActionMsg({ type: 'error', text: `Gagal sinkron ke MySQL: ${data.error || 'Terjadi kesalahan'}` });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Gagal terhubung ke server: ${err.message}` });
    } finally {
      setPushing(false);
    }
  };

  const handlePullFromMySQL = async () => {
    if (!window.confirm('Tarik data dari database TiDB Cloud / MySQL? Data di aplikasi akan disinkronkan dengan server database.')) return;
    setPulling(true);
    setActionMsg(null);
    try {
      // Coba pull via SchoolContext terlebih dahulu
      const pulled = await pullLatestFromCloud();
      if (pulled) {
        setActionMsg({ type: 'success', text: 'Berhasil menarik data kesiswaan terbaru dari Cloud Database!' });
        setPulling(false);
        return;
      }

      // Fallback ke relasional MySQL
      const res = await fetch('/api/mysql/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.schoolProfile) updateSchoolProfile(data.schoolProfile);
        if (Array.isArray(data.students) && data.students.length > 0) {
          importStudentsFromExcel(data.students, 'replace');
        }
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setActionMsg({ type: 'error', text: `Gagal menarik data dari MySQL: ${data.error || 'Terjadi kesalahan'}` });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Gagal terhubung ke server: ${err.message}` });
    } finally {
      setPulling(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const vercelEnvSnippet = `# Salin dan tempel ke Vercel Dashboard -> Project Settings -> Environment Variables:
TIDB_HOST=${mysqlConfig.host || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'}
TIDB_PORT=${mysqlConfig.port || 4000}
TIDB_USER=${mysqlConfig.user || 'your_prefix.root'}
TIDB_PASSWORD=${mysqlConfig.password || 'your_tidb_password'}
TIDB_DATABASE=${mysqlConfig.database || 'db_kesiswaan_sekolah'}
TIDB_ENABLE_SSL=true
NODE_ENV=production`;

  const gitCommandsSnippet = `# Perintah Push ke GitHub (Jalankan di Terminal / Command Prompt):
git init
git add .
git commit -m "feat: Integrasi Kesiswaan TiDB Cloud + Vercel Deployment"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA_REPOSITORY_ANDA.git
git push -u origin main`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900">
                Integrasi Cloud: GitHub, Vercel &amp; TiDB Cloud
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                testResult?.success ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {testResult?.success ? 'TiDB Cloud: Online' : 'Siap Dihubungkan'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hubungkan repositori GitHub, deploy otomatis ke Vercel, dan simpan data kesiswaan secara permanen di TiDB Cloud Serverless (bebas batas kuota).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadMySQLDump}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Unduh SQL</span>
          </button>
          <button
            onClick={handlePushToMySQL}
            disabled={pushing}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className={`w-4 h-4 ${pushing ? 'animate-bounce' : ''}`} />
            <span>{pushing ? 'Menyimpan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tidb')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tidb'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1. TiDB Cloud (Database)</span>
        </button>

        <button
          onClick={() => setActiveTab('vercel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'vercel'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>2. Vercel Deployment</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'github'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>3. GitHub Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sql'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>4. Script SQL &amp; phpMyAdmin</span>
        </button>
      </div>

      {/* Tab 1: TiDB Cloud */}
      {activeTab === 'tidb' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration & Health Check */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>Koneksi TiDB Cloud Serverless (MySQL2 Pool)</span>
                </h2>
                <button
                  onClick={checkTiDBHealth}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Menguji...' : 'Uji Koneksi Live'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-lg text-xs flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.latencyMs && (
                      <p className="text-[11px] text-emerald-700">
                        Latensi respon server: <strong>{testResult.latencyMs} ms</strong> · SSL Terenkripsi TLSv1.2
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Input Parameter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700">Host (TiDB Cloud Gateway)</label>
                  <input
                    type="text"
                    value={mysqlConfig.host}
                    onChange={e => updateMySQLConfig({ host: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    placeholder="gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Port (Default TiDB 4000)</label>
                  <input
                    type="number"
                    value={mysqlConfig.port}
                    onChange={e => updateMySQLConfig({ port: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    placeholder="4000"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Database Name</label>
                  <input
                    type="text"
                    value={mysqlConfig.database}
                    onChange={e => updateMySQLConfig({ database: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    placeholder="db_kesiswaan_sekolah"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Username</label>
                  <input
                    type="text"
                    value={mysqlConfig.user}
                    onChange={e => updateMySQLConfig({ user: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    placeholder="xxxxxx.root"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Password</label>
                  <input
                    type="password"
                    value={mysqlConfig.password}
                    onChange={e => updateMySQLConfig({ password: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
                <button
                  onClick={handleInitTiDBTables}
                  disabled={initializingTables}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${initializingTables ? 'animate-spin' : ''}`} />
                  <span>{initializingTables ? 'Membuat Tabel...' : 'Inisialisasi Tabel Otomatis'}</span>
                </button>

                <button
                  onClick={handlePushToMySQL}
                  disabled={pushing}
                  className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${pushing ? 'animate-bounce' : ''}`} />
                  <span>{pushing ? 'Menyimpan ke TiDB...' : 'Kirim Data (Push ke TiDB)'}</span>
                </button>

                <button
                  onClick={handlePullFromMySQL}
                  disabled={pulling}
                  className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 ${pulling ? 'animate-spin' : ''}`} />
                  <span>{pulling ? 'Menarik dari TiDB...' : 'Tarik Data (Pull dari TiDB)'}</span>
                </button>
              </div>

              {actionMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                  actionMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {actionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="font-semibold">{actionMsg.text}</p>
                </div>
              )}
            </div>

            {/* Right: Cara Daftar TiDB Cloud Gratis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Kelebihan TiDB Cloud Serverless</span>
              </h2>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Gratis 5GB Penyimpanan</strong> &amp; 50 Juta Request Unit tiap bulan (bebas biaya, tanpa perlu kartu kredit).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% Kompatibel MySQL</strong>: Menggunakan driver <code className="font-mono bg-slate-100 px-1 rounded">mysql2/promise</code> bawaan aplikasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Solusi Kuota Firestore</strong>: Menghilangkan error batasan kuota harian Firebase selamanya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-Device Realtime</strong>: Data langsung tersinkron di HP dan Laptop seluruh guru &amp; staf.</span>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href="https://tidbcloud.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Buka TiDB Cloud Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vercel Deployment */}
      {activeTab === 'vercel' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Panduan Menghubungkan ke Vercel</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aplikasi ini telah dilengkapi dengan <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">vercel.json</code> dan <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">api/index.ts</code> untuk backend serverless.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(vercelEnvSnippet, 'vercel-all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              {copiedKey === 'vercel-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'vercel-all' ? 'Tersalin!' : 'Salin Semua Env Vercel'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Langkah Konfigurasi di Vercel Dashboard:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-700 leading-relaxed">
              <li>
                Buka <strong>vercel.com</strong> dan pilih project Anda (atau klik <strong>Add New &gt; Project</strong> dan pilih repositori GitHub Anda).
              </li>
              <li>
                Di halaman <strong>Configure Project</strong>, buka bagian <strong>Environment Variables</strong>.
              </li>
              <li>
                Tambahkan variabel berikut (bisa salin dari tombol di atas):
              </li>
            </ol>

            {/* Variable Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Nama Variabel</th>
                    <th className="p-2.5">Nilai Rekomendasi (TiDB Cloud)</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_HOST</td>
                    <td className="p-2.5 text-slate-600">{mysqlConfig.host || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(mysqlConfig.host || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 'TIDB_HOST')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_HOST' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_PORT</td>
                    <td className="p-2.5 text-slate-600">{mysqlConfig.port || 4000}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(String(mysqlConfig.port || 4000), 'TIDB_PORT')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_PORT' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_USER</td>
                    <td className="p-2.5 text-slate-600">{mysqlConfig.user || 'your_prefix.root'}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(mysqlConfig.user || 'your_prefix.root', 'TIDB_USER')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_USER' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_PASSWORD</td>
                    <td className="p-2.5 text-slate-600">••••••••</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(mysqlConfig.password || '', 'TIDB_PASSWORD')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_PASSWORD' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_DATABASE</td>
                    <td className="p-2.5 text-slate-600">{mysqlConfig.database || 'db_kesiswaan_sekolah'}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(mysqlConfig.database || 'db_kesiswaan_sekolah', 'TIDB_DATABASE')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_DATABASE' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">TIDB_ENABLE_SSL</td>
                    <td className="p-2.5 text-slate-600">true</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard('true', 'TIDB_ENABLE_SSL')}
                        className="text-blue-700 hover:underline cursor-pointer font-sans text-xs"
                      >
                        {copiedKey === 'TIDB_ENABLE_SSL' ? 'Tersalin' : 'Salin'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Setelah menambahkan variabel lingkungan di Vercel, klik <strong>Redeploy</strong>. Aplikasi Anda di Vercel akan otomatis online, dapat diakses dari HP guru, dan tersinkronisasi 100% dengan TiDB Cloud!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GitHub Sync */}
      {activeTab === 'github' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                <span>Panduan Menghubungkan ke GitHub</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan seluruh kode sumber dan perubahannya ke GitHub untuk kemudahan kolaborasi dan CI/CD Vercel.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(gitCommandsSnippet, 'git-all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg cursor-pointer"
            >
              {copiedKey === 'git-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'git-all' ? 'Tersalin!' : 'Salin Perintah Git'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto space-y-2">
            <div className="text-slate-400"># 1. Buka Terminal pada folder proyek</div>
            <div>git init</div>
            <div>git add .</div>
            <div>git commit -m &quot;feat: Integrasi Kesiswaan TiDB Cloud + Vercel Deployment&quot;</div>
            <div>git branch -M main</div>
            <div className="text-amber-400"># 2. Ganti URL di bawah dengan URL repo GitHub Anda</div>
            <div>git remote add origin https://github.com/USERNAME/NAMA_REPOSITORY_ANDA.git</div>
            <div>git push -u origin main</div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Setelah di-push ke GitHub, buka Vercel dan hubungkan repo tersebut. Setiap kali Anda melakukan perubahan di masa depan, Vercel akan otomatis men-deploy versi terbaru tanpa downtime.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SQL & phpMyAdmin */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          {/* SQL Script Viewer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Pratinjau Skrip DDL &amp; DML MySQL (db_kesiswaan_sekolah.sql)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSqlViewer(!showSqlViewer)}
                  className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  {showSqlViewer ? 'Sembunyikan Kode' : 'Tampilkan Kode Lengkap'}
                </button>
                <button
                  onClick={() => copyToClipboard(sqlDump, 'sql-dump')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 cursor-pointer font-medium"
                >
                  {copiedKey === 'sql-dump' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedKey === 'sql-dump' ? 'Tersalin' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={downloadMySQLDump}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .SQL</span>
                </button>
              </div>
            </div>

            {showSqlViewer && (
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96">
                <pre>{sqlDump}</pre>
              </div>
            )}
          </div>

          {/* Instructions on importing to phpMyAdmin / MySQL */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panduan Import ke phpMyAdmin (cPanel Hosting / XAMPP):</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Agar tidak terjadi kendala <code className="font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">#1046 No database selected</code>, ikuti urutan langkah standar phpMyAdmin berikut:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
              <li>Unduh file dengan mengklik tombol <strong>&quot;Unduh .SQL&quot;</strong> di atas.</li>
              <li>Buka <strong>phpMyAdmin</strong> di cPanel hosting atau localhost Anda.</li>
              <li>
                <strong>LANGKAH KUNCI:</strong> Pada menu sebelah kiri phpMyAdmin, <strong>KLIK NAMA DATABASE</strong> Anda terlebih dahulu agar database tersebut aktif dibuka.
              </li>
              <li>Setelah database terbuka, klik menu <strong>&quot;Import&quot; / &quot;Impor&quot;</strong> di tab bagian atas.</li>
              <li>Pilih file <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">.sql</code> yang telah Anda unduh, lalu klik tombol <strong>&quot;Kirim&quot; / &quot;Go&quot;</strong>.</li>
              <li>Semua 11 tabel kesiswaan resmi beserta data siswa akan langsung terisi sempurna tanpa error.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
