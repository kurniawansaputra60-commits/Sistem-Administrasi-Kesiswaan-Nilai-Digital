import React, { useState } from 'react';
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
  Zap,
  Terminal,
  HelpCircle,
  Play,
  Sparkles,
  Lock,
  Layers,
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
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'connect' | 'guide' | 'console' | 'schema'>('connect');

  // Connection Test & Sync states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    isTiDB?: boolean;
    pingTime?: number;
    serverVersion?: string;
    tablesCount?: number;
    siswaCount?: number;
    errorDetail?: string;
  } | null>(null);

  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Connection String Parser input
  const [connStringInput, setConnStringInput] = useState('');
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  // SQL Dump copy state
  const [copied, setCopied] = useState(false);
  const sqlDump = getMySQLDumpText();

  // Interactive SQL Query Console states
  const [consoleQuery, setConsoleQuery] = useState('SHOW TABLES;');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    rows?: any[];
    rowCount?: number;
    error?: string;
    duration?: number;
  } | null>(null);

  // TiDB Connection String Parser
  const handleParseConnectionString = () => {
    setParseNotice(null);
    const clean = connStringInput.trim();
    if (!clean) {
      setParseNotice('Harap tempelkan connection string atau perintah CLI dari TiDB Cloud Console terlebih dahulu.');
      return;
    }

    // Pattern 1: URL format mysql://user:password@host:port/database
    const urlMatch = clean.match(/mysql:\/\/(?:([^:]+)(?::([^@]+))?@)?([^:\/?#\s]+)(?::(\d+))?(?:\/([^?#\s]+))?/i);
    if (urlMatch && urlMatch[3]) {
      const user = urlMatch[1] ? decodeURIComponent(urlMatch[1]) : '';
      const password = urlMatch[2] ? decodeURIComponent(urlMatch[2]) : '';
      const host = urlMatch[3];
      const port = urlMatch[4] ? parseInt(urlMatch[4], 10) : 4000;
      const database = urlMatch[5] || 'test';

      updateMySQLConfig({
        host,
        port,
        user: user || mysqlConfig.user,
        password: password || mysqlConfig.password,
        database: database || mysqlConfig.database,
      });

      setParseNotice(`Berhasil mengekstrak kredensial TiDB Cloud! Host: ${host}, Port: ${port}, Database: ${database}`);
      return;
    }

    // Pattern 2: CLI format mysql -u user -h host -P port -D database
    const cliHost = clean.match(/-h\s+['"]?([^'"\s]+)['"]?/i);
    const cliUser = clean.match(/-u\s+['"]?([^'"\s]+)['"]?/i);
    const cliPort = clean.match(/-P\s+(\d+)/i);
    const cliDb = clean.match(/-D\s+['"]?([^'"\s]+)['"]?/i);

    if (cliHost || cliUser) {
      const updates: any = {};
      if (cliHost) updates.host = cliHost[1];
      if (cliUser) updates.user = cliUser[1];
      if (cliPort) updates.port = parseInt(cliPort[1], 10);
      if (cliDb) updates.database = cliDb[1];

      updateMySQLConfig(updates);
      setParseNotice(`Berhasil mengekstrak parameter dari perintah CLI TiDB Cloud! Host: ${updates.host || mysqlConfig.host}`);
      return;
    }

    // Pattern 3: Bare TiDB hostname
    if (clean.includes('tidbcloud.com')) {
      updateMySQLConfig({
        host: clean,
        port: 4000,
      });
      setParseNotice('Host TiDB Cloud berhasil diterapkan dengan port standar 4000.');
      return;
    }

    setParseNotice('Format tidak dikenali. Pastikan Anda menyalin URL mysql://... atau perintah CLI dari TiDB Cloud Console.');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setActionMsg(null);
    const res = await testMySQLConnection();
    setTesting(false);
    setTestResult(res);
  };

  const handlePushToMySQL = async () => {
    setPushing(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/mysql/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig, students, schoolProfile }),
      });
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        setActionMsg({ type: 'error', text: `Server sedang merespons (${res.status}). Silakan ulangi dalam beberapa detik.` });
        return;
      }
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        // Refresh connection test info
        handleTestConnection();
      } else {
        setActionMsg({ type: 'error', text: `Gagal sinkron ke TiDB/MySQL: ${data.error || 'Terjadi kesalahan'}` });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Gagal terhubung ke server: ${err.message}` });
    } finally {
      setPushing(false);
    }
  };

  const handlePullFromMySQL = async () => {
    if (!window.confirm('Tarik data dari TiDB Cloud / MySQL live? Data profil dan siswa lokal akan disinkronkan dengan data dari server database.')) return;
    setPulling(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/mysql/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig }),
      });
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        setActionMsg({ type: 'error', text: `Server sedang merespons (${res.status}). Silakan ulangi dalam beberapa detik.` });
        return;
      }
      if (data.success) {
        if (data.schoolProfile) updateSchoolProfile(data.schoolProfile);
        if (Array.isArray(data.students) && data.students.length > 0) {
          importStudentsFromExcel(data.students, 'replace');
        }
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setActionMsg({ type: 'error', text: `Gagal menarik data dari TiDB/MySQL: ${data.error || 'Terjadi kesalahan'}` });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: `Gagal terhubung ke server: ${err.message}` });
    } finally {
      setPulling(false);
    }
  };

  const handleRunQuery = async () => {
    if (!consoleQuery.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/mysql/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig, query: consoleQuery }),
      });
      const duration = Date.now() - startTime;
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        setQueryResult({
          success: false,
          error: `Server sedang merespons (${res.status}). Silakan coba eksekusi query kembali.`,
          duration,
        });
        return;
      }
      if (data.success) {
        setQueryResult({
          success: true,
          rows: data.rows,
          rowCount: data.rowCount,
          duration,
        });
      } else {
        setQueryResult({
          success: false,
          error: data.error || 'Eksekusi query gagal.',
          duration,
        });
      }
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: `Gagal menghubungi server database: ${err.message}`,
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTiDBHost =
    mysqlConfig.host.toLowerCase().includes('tidbcloud.com') ||
    mysqlConfig.host.toLowerCase().includes('tidb') ||
    mysqlConfig.port === 4000;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-lg md:text-xl font-black text-white">
                  Pusat Database TiDB Cloud &amp; MySQL
                </h1>
                {isTiDBHost && (
                  <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>TiDB Cloud Serverless</span>
                  </span>
                )}
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  mysqlConfig.isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${mysqlConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span>{mysqlConfig.isConnected ? 'Database Terhubung (Online)' : 'Belum Terhubung'}</span>
                </span>
              </div>
              <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
                Hubungkan aplikasi administrasi kesiswaan secara langsung ke <strong>TiDB Cloud Console</strong> (Database Relasional Terdistribusi dengan Enkripsi SSL Otomatis) untuk sinkronisasi live data siswa &amp; profil sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={downloadMySQLDump}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Unduh .SQL Dump</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('connect')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'connect'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Koneksi &amp; Konfigurasi</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Panduan TiDB Cloud Console</span>
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Konsol SQL Interaktif</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Skema Tabel &amp; Skrip SQL</span>
        </button>
      </div>

      {/* TAB 1: KONEKSI & KONFIGURASI CEPAT */}
      {activeTab === 'connect' && (
        <div className="space-y-6">
          {/* Box 1: Quick Paste Connection String from TiDB Cloud Console */}
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Tempelkan Connection String dari TiDB Cloud Console
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cukup salin teks koneksi dari popup &quot;Connect&quot; di TiDB Cloud, aplikasi akan otomatis memecah Host, Port, User, Password, &amp; Database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://tidbcloud.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                >
                  <span>Buka TiDB Cloud Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder='Contoh: mysql://2w1x...root:Password123@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}'
                value={connStringInput}
                onChange={e => setConnStringInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-amber-300 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleParseConnectionString}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terapkan Otomatis</span>
              </button>
            </div>

            {parseNotice && (
              <div className="p-3 bg-white border border-amber-300 text-slate-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{parseNotice}</span>
              </div>
            )}
          </div>

          {/* Form Konfigurasi Manual Parameter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>Parameter Koneksi Database</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateMySQLConfig({
                        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
                        port: 4000,
                        user: '3xxxxx.root',
                        database: 'test',
                      });
                    }}
                    className="text-[11px] font-bold text-amber-800 bg-amber-100/60 hover:bg-amber-200/60 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Template TiDB Cloud (Port 4000)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMySQLConfig({
                        host: 'localhost',
                        port: 3306,
                        user: 'root',
                        database: 'db_kesiswaan_sekolah',
                      });
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Localhost / cPanel (Port 3306)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700">Host Server (TiDB / MySQL)</label>
                  <input
                    type="text"
                    value={mysqlConfig.host}
                    onChange={e => updateMySQLConfig({ host: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    placeholder="gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    * Endpoint cluster dari tab Connect di TiDB Cloud Console
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Port Server</label>
                  <input
                    type="number"
                    value={mysqlConfig.port}
                    onChange={e => updateMySQLConfig({ port: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    placeholder="4000"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    * TiDB Cloud: <strong>4000</strong>, MySQL: <strong>3306</strong>
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Database Name</label>
                  <input
                    type="text"
                    value={mysqlConfig.database}
                    onChange={e => updateMySQLConfig({ database: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    placeholder="test atau db_kesiswaan_sekolah"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Username</label>
                  <input
                    type="text"
                    value={mysqlConfig.user}
                    onChange={e => updateMySQLConfig({ user: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    placeholder="2w1x...root"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Password</label>
                  <input
                    type="password"
                    value={mysqlConfig.password}
                    onChange={e => updateMySQLConfig({ password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enkripsi SSL/TLS 1.2 diaktifkan otomatis untuk koneksi TiDB Cloud.</span>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Menguji Koneksi...' : 'Uji Koneksi Server (Ping)'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border border-rose-300 text-rose-950'
                }`}>
                  {testResult.success ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{testResult.message}</p>
                    {testResult.success && (
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          ⚡ Latency: {testResult.pingTime}ms
                        </span>
                        {testResult.serverVersion && (
                          <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                            Engine: {testResult.serverVersion}
                          </span>
                        )}
                        <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          Tabel Ditemukan: {testResult.tablesCount || 0}
                        </span>
                        <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          Siswa di Database: {testResult.siswaCount || 0}
                        </span>
                      </div>
                    )}
                    {!testResult.success && testResult.errorDetail && (
                      <p className="text-[11px] font-mono text-rose-800 bg-rose-100/60 p-1.5 rounded">
                        Kode Error: {testResult.errorDetail}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons: Push & Pull */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  onClick={handlePushToMySQL}
                  disabled={pushing || testing}
                  className="flex-1 min-w-[220px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${pushing ? 'animate-bounce' : ''}`} />
                  <span>{pushing ? 'Membuat Tabel & Mengirim Data...' : 'Kirim & Inisialisasi Data (Push to TiDB)'}</span>
                </button>

                <button
                  onClick={handlePullFromMySQL}
                  disabled={pulling || testing}
                  className="flex-1 min-w-[220px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 ${pulling ? 'animate-spin' : ''}`} />
                  <span>{pulling ? 'Menarik Data dari TiDB...' : 'Tarik Data dari TiDB ke Aplikasi (Pull)'}</span>
                </button>
              </div>

              {actionMsg && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  actionMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {actionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="font-semibold leading-relaxed">{actionMsg.text}</p>
                </div>
              )}
            </div>

            {/* Right Card: Status & Info */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Status Arsitektur Database</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950">1. Google Cloud Firebase</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Aktif 24/7
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-900/80">
                      Penyimpanan real-time primer multi-perangkat (PC, laptop, smartphone wali kelas).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">2. TiDB Cloud / MySQL</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        mysqlConfig.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {mysqlConfig.isConnected ? 'Tersambung' : 'Standby'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900/80">
                      Database relasional SQL terdistribusi untuk analitik, backup SQL, dan integrasi dinas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <Zap className="w-4 h-4" />
                  <span>Tips Koneksi TiDB Cloud</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Port default TiDB Cloud selalu <strong>4000</strong>.</li>
                  <li>Database default biasanya bernama <strong>test</strong>.</li>
                  <li>Jika database belum memiliki tabel, tombol <strong>&quot;Kirim &amp; Inisialisasi Data&quot;</strong> akan membuatkan tabel secara otomatis.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN LANGKAH DEMI LANGKAH TIDB CLOUD */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Panduan Lengkap Menghubungkan TiDB Cloud Console</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ikuti 5 langkah sederhana berikut untuk mendapatkan connection string dari dashboard TiDB Cloud Anda:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-xs text-slate-900">Buka &amp; Login ke TiDB Cloud</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kunjungi <a href="https://tidbcloud.com" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold underline">https://tidbcloud.com</a>. Jika belum punya akun, daftar gratis (Free Tier Serverless tersedia tanpa kartu kredit).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-xs text-slate-900">Buat Cluster Serverless</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Di dashboard, klik <strong>&quot;Create Cluster&quot;</strong> &rarr; pilih <strong>Serverless</strong> &rarr; pilih Region terdekat (misal: Singapore / <code>ap-southeast-1</code>) &rarr; klik <strong>Create</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-xs text-slate-900">Buka Modal &quot;Connect&quot;</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setelah cluster siap (kurang dari 10 detik), klik tombol biru <strong>&quot;Connect&quot;</strong> di pojok kanan atas halaman cluster Anda. Buat password database jika diminta dan simpan password tersebut.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-xs text-slate-900">Salin Connection String</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih opsi <strong>&quot;General&quot;</strong> atau <strong>&quot;Node.js&quot;</strong>, lalu salin URL koneksi yang berformat <code>mysql://...</code> atau perintah <code>mysql -u ... -h ...</code>.
              </p>
            </div>
          </div>

          {/* Important Security Tip: IP Access List */}
          <div className="p-5 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>PENTING: Atur IP Access List di TiDB Cloud Console</span>
            </div>
            <p className="leading-relaxed">
              Agar aplikasi cloud ini diizinkan menghubungi TiDB Cloud Anda:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Di halaman cluster TiDB Cloud Anda, klik tab <strong>&quot;Security&quot;</strong> di menu sebelah kiri.</li>
              <li>Pilih <strong>&quot;IP Access List&quot;</strong> &rarr; klik <strong>&quot;Add IP Address&quot;</strong>.</li>
              <li>Pilih <strong>&quot;Allow access from anywhere&quot;</strong> (IP: <code>0.0.0.0/0</code>) &rarr; klik <strong>Confirm</strong>.</li>
            </ol>
            <p className="text-[11px] text-amber-800 italic pt-1">
              * Tanpa izin IP ini, TiDB Cloud akan menolak koneksi dari luar dengan error &quot;Connection refused / Access denied&quot;.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('connect')}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Kembali ke Form Koneksi &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: KONSOL SQL INTERAKTIF */}
      {activeTab === 'console' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-700" />
                <span>Konsol SQL Interaktif (Live Query Runner)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Jalankan perintah SQL pembacaan langsung ke server TiDB Cloud / MySQL yang terhubung.
              </p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              <span>Target:</span>
              <strong className="text-blue-900">{mysqlConfig.host}:{mysqlConfig.port}/{mysqlConfig.database}</strong>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Shortcut Query:</span>
            {[
              'SHOW TABLES;',
              'SELECT VERSION();',
              'SELECT COUNT(*) as total_siswa FROM `siswa`;',
              'SELECT nama_lengkap, kelas_sekarang, jenis_kelamin FROM `siswa` LIMIT 10;',
              'DESCRIBE `sekolah_profile`;',
              'DESCRIBE `siswa`;',
            ].map((q) => (
              <button
                key={q}
                onClick={() => setConsoleQuery(q)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] rounded-md transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Query Editor & Run */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={consoleQuery}
              onChange={(e) => setConsoleQuery(e.target.value)}
              className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              placeholder="SELECT * FROM siswa LIMIT 10;"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                * Didukung perintah: <code>SELECT</code>, <code>SHOW</code>, <code>DESCRIBE</code>, <code>EXPLAIN</code>.
              </span>
              <button
                onClick={handleRunQuery}
                disabled={queryLoading}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${queryLoading ? 'animate-spin' : ''}`} />
                <span>{queryLoading ? 'Menjalankan...' : 'Jalankan Query (Execute)'}</span>
              </button>
            </div>
          </div>

          {/* Query Result Viewer */}
          {queryResult && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Hasil Eksekusi: {queryResult.success ? `${queryResult.rowCount} baris ditemukan` : 'Gagal'}
                </span>
                {queryResult.duration !== undefined && (
                  <span className="text-[11px] font-mono text-slate-500">
                    Durasi: {queryResult.duration}ms
                  </span>
                )}
              </div>

              {queryResult.success && queryResult.rows && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
                  {queryResult.rows.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      Query berhasil dieksekusi, tidak ada baris data yang dihasilkan.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 sticky top-0 z-10 font-mono">
                        <tr>
                          {Object.keys(queryResult.rows[0] || {}).map((col) => (
                            <th key={col} className="py-2 px-3 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-slate-700">
                                {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {!queryResult.success && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-mono">
                  {queryResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SKEMA TABEL & SKRIP SQL */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Skrip DDL &amp; DML SQL Lengkap (db_kesiswaan_sekolah.sql)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Tersalin' : 'Salin SQL'}</span>
                  </button>
                  <button
                    onClick={downloadMySQLDump}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .SQL</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[460px] overflow-y-auto">
                <pre>{sqlDump}</pre>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>Daftar Tabel Database Kesiswaan</span>
              </h2>

              <div className="space-y-1.5 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">sekolah_profile</span>
                  <span className="text-slate-500">Profil, Kop &amp; SK</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">siswa</span>
                  <span className="text-slate-500">Buku Induk S-1 s/d S-5</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">absensi_harian</span>
                  <span className="text-slate-500">Presensi S-8 &amp; S-9</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">surat_ketidakhadiran_s10</span>
                  <span className="text-slate-500">Panggilan Orang Tua S-10</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">mutasi_siswa</span>
                  <span className="text-slate-500">Mutasi S-12 s/d S-14</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">calon_peserta_ujian_s15</span>
                  <span className="text-slate-500">Ujian &amp; Kartu UAS S-16</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">kelulusan_lanjutan_studi_s18</span>
                  <span className="text-slate-500">Format S-18 Studi</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                  <span className="font-mono font-bold text-slate-800">kenaikan_kelulusan_s19_s20</span>
                  <span className="text-slate-500">SK Yudisium S-19 &amp; S-20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
