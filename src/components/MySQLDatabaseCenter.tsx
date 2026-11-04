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
  Code,
  Sparkles,
  Play,
  Layers,
  Key,
  HelpCircle,
} from 'lucide-react';
import {
  getTiDBDataServiceConfig,
  saveTiDBDataServiceConfig,
  testTiDBDataService,
  fetchStudentsFromTiDBDataService,
  fetchReportS20FromTiDBDataService,
  fetchReportS11FromTiDBDataService,
  TiDBDataServiceConfig,
} from '../services/tidbDataService';

export const MySQLDatabaseCenter: React.FC = () => {
  const {
    mysqlConfig,
    updateMySQLConfig,
    downloadMySQLDump,
    getMySQLDumpText,
    students,
    schoolProfile,
    importStudentsFromExcel,
    updateSchoolProfile,
    forceSyncToCloud,
    pullLatestFromCloud,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'dataservice' | 'tidb' | 'reports' | 'vercel' | 'github' | 'sql'>('dataservice');

  // Connection & Health states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; host?: string; isTiDB?: boolean } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [initializingTables, setInitializingTables] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // TiDB Data Service configuration & test states
  const [dsConfig, setDsConfig] = useState<TiDBDataServiceConfig>(getTiDBDataServiceConfig);
  const [testingDs, setTestingDs] = useState(false);
  const [dsTestResult, setDsTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; data?: any } | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_students');
  const [endpointParamInput, setEndpointParamInput] = useState<{ kelas: string; search: string; semester: string }>({
    kelas: 'VI',
    search: '',
    semester: '2025/2026-2',
  });
  const [runningEndpoint, setRunningEndpoint] = useState(false);
  const [endpointResponse, setEndpointResponse] = useState<any>(null);

  const sqlDump = getMySQLDumpText();

  useEffect(() => {
    checkTiDBHealth();
  }, []);

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (text.includes('<!doctype') || text.includes('<html')) {
        throw new Error(`Server Vercel merespons halaman HTML (Status ${res.status}). Kemungkinan fungsi backend Vercel belum selesai redeploy atau periksa konfigurasi Vercel Environment Variables.`);
      }
      throw new Error(`Respons server bukan JSON valid: ${text.slice(0, 120)}`);
    }
  };

  const checkTiDBHealth = async (overrideCfg?: any) => {
    setTesting(true);
    const targetCfg = (overrideCfg && typeof overrideCfg === 'object' && 'host' in overrideCfg)
      ? overrideCfg
      : mysqlConfig;
    try {
      const data = await safeFetchJson('/api/database/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: targetCfg }),
      });
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

  const handleTestDs = async () => {
    setTestingDs(true);
    setDsTestResult(null);
    try {
      const res = await testTiDBDataService(dsConfig);
      setDsTestResult(res);
    } catch (err: any) {
      setDsTestResult({ success: false, message: `Error: ${err.message}` });
    } finally {
      setTestingDs(false);
    }
  };

  const handleSaveDsConfig = () => {
    saveTiDBDataServiceConfig(dsConfig);
    setActionMsg({ type: 'success', text: 'Konfigurasi TiDB Data Service berhasil disimpan!' });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleRunSelectedEndpoint = async () => {
    setRunningEndpoint(true);
    setEndpointResponse(null);
    try {
      if (selectedEndpoint === 'get_students') {
        const data = await fetchStudentsFromTiDBDataService({
          schoolId: dsConfig.schoolId || schoolProfile.npsn,
          kelas: endpointParamInput.kelas || '%',
          search: endpointParamInput.search || '%',
        });
        setEndpointResponse(data);
      } else if (selectedEndpoint === 'report_rekap_nilai_s20') {
        const data = await fetchReportS20FromTiDBDataService({
          schoolId: dsConfig.schoolId || schoolProfile.npsn,
          kelas: endpointParamInput.kelas || 'VI',
          semesterKey: endpointParamInput.semester || '2025/2026-2',
        });
        setEndpointResponse(data);
      } else if (selectedEndpoint === 'report_rekap_absensi_s11') {
        const data = await fetchReportS11FromTiDBDataService({
          schoolId: dsConfig.schoolId || schoolProfile.npsn,
          kelas: endpointParamInput.kelas || 'VI',
          bulanTahun: '2026-11',
        });
        setEndpointResponse(data);
      } else {
        // Panggil endpoint generik
        const cleanUrl = dsConfig.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/${selectedEndpoint}?school_id=${encodeURIComponent(dsConfig.schoolId || schoolProfile.npsn)}`, {
          headers: dsConfig.publicKey && dsConfig.privateKey ? {
            'Authorization': `Basic ${btoa(`${dsConfig.publicKey}:${dsConfig.privateKey}`)}`
          } : {}
        });
        const json = await res.json();
        setEndpointResponse(json);
      }
    } catch (err: any) {
      setEndpointResponse({ error: err.message });
    } finally {
      setRunningEndpoint(false);
    }
  };

  const handleInitTiDBTables = async () => {
    setInitializingTables(true);
    setActionMsg(null);
    try {
      const data = await safeFetchJson('/api/tidb/init-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig }),
      });
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
      await forceSyncToCloud();
      const data = await safeFetchJson('/api/mysql/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig, students, schoolProfile }),
      });
      if (data.success) {
        setActionMsg({ type: 'success', text: `${data.message} Seluruh data siswa & profil tersimpan di TiDB Cloud!` });
      } else {
        setActionMsg({ type: 'error', text: `Gagal sinkron ke MySQL: ${data.error || data.message || 'Terjadi kesalahan'}` });
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
      const pulled = await pullLatestFromCloud();
      if (pulled) {
        setActionMsg({ type: 'success', text: 'Berhasil menarik data kesiswaan terbaru dari Cloud Database!' });
        setPulling(false);
        return;
      }
      const data = await safeFetchJson('/api/mysql/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: mysqlConfig }),
      });
      if (data.success) {
        if (data.schoolProfile) updateSchoolProfile(data.schoolProfile);
        if (Array.isArray(data.students) && data.students.length > 0) {
          importStudentsFromExcel(data.students, 'replace');
        }
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setActionMsg({ type: 'error', text: `Gagal menarik data dari MySQL: ${data.error || data.message || 'Terjadi kesalahan'}` });
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

  // Prompts Templates pre-populated with actual school data
  const prompt1Schema = `"Saya sedang memigrasikan database aplikasi sekolah saya dari Firebase (NoSQL) ke TiDB (MySQL-compatible).

Ini adalah contoh struktur dokumen JSON untuk data Siswa di sekolah kami (${schoolProfile.namaSekolah}):
${JSON.stringify((students[0] || {}), null, 2).slice(0, 800)}...

Tolong buatkan saya perintah CREATE TABLE MySQL yang rapi dan ternormalisasi. Pastikan untuk:
1. Menambahkan kolom id (VARCHAR 36) sebagai Primary Key.
2. Menambahkan kolom school_id sebagai indikator multi-tenancy (NPSN: ${schoolProfile.npsn}).
3. Tentukan tipe data yang paling efisien (VARCHAR, INT, DATE, DECIMAL)."`;

  const prompt2DataService = `"Saya menggunakan TiDB Data Service di mana saya cukup menulis file .sql di folder /db GitHub dan TiDB akan mengubahnya menjadi REST API endpoint.

Saya memiliki tabel bernama students dengan struktur kolom: id, school_id, nis, nisn, nama_lengkap, kelas_sekarang, rombel, status_siswa.

Buatkan saya query SQL murni untuk kebutuhan berikut:
Mengambil semua data siswa aktif berdasarkan \${school_id} dan \${kelas}.

Catatan: Gunakan sintaks variabel \${namaVariabel} untuk parameter dinamis yang akan diterima dari API."`;

  const prompt3ReactFetch = `"Bertindaklah sebagai React Developer Senior. Saya sedang mengubah kode React saya dari Firebase Firestore ke TiDB Data Service.

Info API baru:
- Method: GET
- URL: https://ap-southeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-xepxutFs/endpoint/get_students
- Parameter URL: ?school_id=${schoolProfile.npsn}&kelas=VI
- Headers wajib: Basic Authentication menggunakan Public Key '${dsConfig.publicKey || 'S3JJGQO0'}' dan Private Key dari file .env.

Berikan saya kode React utuh (hook useEffect + fetch) yang sudah di-update beserta loading state dan error handling-nya."`;

  const prompt4ComplexReport = `"Saya perlu membuat laporan Rekap Nilai Raport S-20 yang menggabungkan data dari tabel students dan tabel student_grades.

Format laporan yang saya butuhkan harus menampilkan:
- Nomor Induk Siswa (NIS)
- Nama Siswa
- Nilai Akhir untuk setiap mata pelajaran secara mendatar (pivot kolom PAI, PKn, B.Indo, MTK, IPAS, PJOK, SBdP, Mulok)
- Total Nilai, Rata-Rata, dan Ranking Kelas

Buatkan saya query SQL (MySQL/TiDB) yang efisien untuk menghasilkan output tersebut berdasarkan school_id = '${schoolProfile.npsn}' dan kelas = 'VI'."`;

  const vercelEnvSnippet = `# Salin dan tempel ke Vercel Dashboard -> Project Settings -> Environment Variables:
TIDB_HOST=${mysqlConfig.host || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'}
TIDB_PORT=${mysqlConfig.port || 4000}
TIDB_USER=${mysqlConfig.user || 'your_prefix.root'}
TIDB_PASSWORD=${mysqlConfig.password || 'your_tidb_password'}
TIDB_DATABASE=${mysqlConfig.database || 'db_kesiswaan_sekolah'}
TIDB_ENABLE_SSL=true
TIDB_DATA_SERVICE_BASE_URL=${dsConfig.baseUrl}
TIDB_DATA_SERVICE_PUBLIC_KEY=${dsConfig.publicKey}
TIDB_DATA_SERVICE_PRIVATE_KEY=${dsConfig.privateKey || 'your_private_key'}
NODE_ENV=production`;

  const gitCommandsSnippet = `# Perintah Push ke GitHub (Folder /db otomatis diproses TiDB Data Service):
git init
git add .
git commit -m "feat: Integrasi TiDB Data Service endpoints di folder /db"
git branch -M main
git remote add origin https://github.com/kurniawansaputra60-commits/Sistem-Administrasi-Kesiswaan-Nilai-Digital.git
git push -u origin main`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900">
                Pusat Integrasi TiDB Cloud &amp; Data Service
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                testResult?.success ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {testResult?.success ? 'TiDB Pool: Online' : 'GitHub /db Terhubung'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                Cluster: sistem-administrasi-kesiswaan-nilai
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Migrasi penuh dari Firebase ke TiDB Cloud Serverless via <strong>TiDB Data Service (Folder GitHub <code>/db</code>)</strong> dan Connection Pool MySQL. Bebas batas kuota harian.
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
          onClick={() => setActiveTab('dataservice')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dataservice'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1. TiDB Data Service (/db)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>2. SQL Laporan (S-1 s/d S-20)</span>
        </button>

        <button
          onClick={() => setActiveTab('tidb')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tidb'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>3. Koneksi Database MySQL2</span>
        </button>

        <button
          onClick={() => setActiveTab('vercel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vercel'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>4. Vercel Deployment</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'github'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>5. GitHub Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sql'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>6. Skrip DDL (/db/schema.sql)</span>
        </button>
      </div>

      {/* TAB 1: TiDB Data Service & GitHub /db */}
      {activeTab === 'dataservice' && (
        <div className="space-y-6">
          {/* Status Box TiDB Data Service Properties */}
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/60 p-6 rounded-xl border border-blue-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfigurasi TiDB Data Service (Sesuai Dashboard Anda)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Folder <code>/db</code> di GitHub Anda (<code>kurniawansaputra60-commits/Sistem-Administrasi-Kesiswaan-Nilai-Digital</code>) otomatis dideploy menjadi REST API endpoint.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestDs}
                  disabled={testingDs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingDs ? 'animate-spin' : ''}`} />
                  <span>{testingDs ? 'Menguji API...' : 'Uji Koneksi Data Service'}</span>
                </button>
              </div>
            </div>

            {dsTestResult && (
              <div className="space-y-3">
                <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
                  dsTestResult.success ? 'bg-emerald-50 border border-emerald-300 text-emerald-950' : 'bg-amber-50 border border-amber-300 text-amber-950'
                }`}>
                  {dsTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-bold">{dsTestResult.message}</p>
                    {dsTestResult.latencyMs && (
                      <p className="text-[11px] text-slate-600 mt-0.5">Latensi panggilan endpoint: {dsTestResult.latencyMs} ms</p>
                    )}
                  </div>
                </div>

                {!dsTestResult.success && dsTestResult.message.includes('404') && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-2.5">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-700" />
                      <span>Panduan Mengatasi HTTP 404 TiDB Data Service:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                      <li>
                        <strong>Buka Tab 'Deployments' di TiDB Cloud:</strong> Pada dashboard TiDB Data Service (di samping tab <em>Settings</em>), buka tab <strong>Deployments</strong>. Jika ada draft deployment bertuliskan <em>Pending Review</em> atau <em>Draft</em>, klik tombol <strong>Deploy</strong>.
                      </li>
                      <li>
                        <strong>Nonaktifkan 'Review Draft' (Rekomendasi):</strong> Pada tab <em>Settings &gt; Deployment Configuration</em>, klik tombol <strong>Configure</strong> di sebelah kanan, lalu <strong>hilangkan centang pada 'Review Draft'</strong> (tetap centang <em>Auto Sync &amp; Deployment</em>), lalu klik <strong>Save</strong>. Ini membuat setiap commit SQL otomatis live tanpa perlu konfirmasi manual.
                      </li>
                      <li>
                        <strong>Pastikan File SQL Ada di GitHub:</strong> Pastikan file <code>/db/get_school_profile.sql</code> dan <code>/db/get_students.sql</code> sudah berada di branch <code>main</code> pada repositori GitHub Anda.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Base URL Endpoint (dari TiDB Console):</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={dsConfig.baseUrl}
                    onChange={e => setDsConfig({ ...dsConfig, baseUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                  />
                  <button
                    onClick={() => copyToClipboard(dsConfig.baseUrl, 'ds-url')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    {copiedKey === 'ds-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">School ID / NPSN Multi-tenancy:</label>
                <input
                  type="text"
                  value={dsConfig.schoolId}
                  onChange={e => setDsConfig({ ...dsConfig, schoolId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                  placeholder="20602495"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Public Key (Username API):</label>
                <input
                  type="text"
                  value={dsConfig.publicKey}
                  onChange={e => setDsConfig({ ...dsConfig, publicKey: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                  placeholder="S3JJGQO0"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Private Key (Password API):</label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={dsConfig.privateKey}
                    onChange={e => setDsConfig({ ...dsConfig, privateKey: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                    placeholder="Masukkan Private Key dari TiDB Cloud"
                  />
                  <button
                    onClick={handleSaveDsConfig}
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Daftar 10 Endpoint SQL di Folder /db */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Daftar Endpoint SQL Otomatis di Folder /db</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap file <code>.sql</code> berikut sudah tersedia di folder <code>/db</code> proyek Anda dan siap diubah TiDB menjadi REST API:
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                10 Endpoint Siap Pakai
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'get_students.sql', desc: 'Mengambil daftar siswa aktif dengan filter kelas dan pencarian', params: '${school_id}, ${kelas}, ${search}' },
                { name: 'get_student_by_id.sql', desc: 'Mengambil profil detail satu siswa lengkap beserta data orang tua', params: '${school_id}, ${student_id}' },
                { name: 'get_school_profile.sql', desc: 'Mengambil identitas profil sekolah, KOP, dan petugas admin', params: '${school_id}' },
                { name: 'get_grades_by_student.sql', desc: 'Mengambil daftar nilai mata pelajaran per semester', params: '${school_id}, ${student_id}, ${semester_key}' },
                { name: 'get_attendances.sql', desc: 'Mengambil presensi harian per kelas dan tanggal', params: '${school_id}, ${kelas}, ${tanggal}' },
                { name: 'get_mutations.sql', desc: 'Mengambil daftar mutasi masuk & keluar (Buku Mutasi S-14)', params: '${school_id}, ${semester}' },
                { name: 'report_rekap_nilai_s20.sql', desc: 'Laporan Pivot Rekap Nilai Raport S-20 (PAI, PKn, B.Indo, MTK, IPAS, PJOK, SBdP, Ranking)', params: '${school_id}, ${kelas}, ${semester_key}' },
                { name: 'report_rekap_absensi_s11.sql', desc: 'Laporan Rekapitulasi Presensi Bulanan S-11 (Hadir, Sakit, Izin, Alpa, % Kehadiran)', params: '${school_id}, ${kelas}, ${bulan_tahun}' },
                { name: 'report_mutasi_siswa_s14.sql', desc: 'Laporan Buku Mutasi Siswa Masuk dan Keluar per Tahun/Semester', params: '${school_id}, ${semester}, ${tahun}' },
                { name: 'upsert_student.sql', desc: 'Menambah atau memperbarui data siswa ke database', params: '${id}, ${school_id}, ${nis}, ${nama_lengkap}, dll' },
              ].map((ep, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">/db/{ep.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">GET</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{ep.desc}</p>
                  <p className="text-slate-400 font-mono text-[10px] mt-1">Param: {ep.params}</p>
                </div>
              ))}
            </div>

            {/* Test Endpoint Runner */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Uji Panggilan Endpoint Langsung (Interactive Runner)</span>
              </h4>

              <div className="flex flex-wrap gap-2 text-xs">
                <select
                  value={selectedEndpoint}
                  onChange={e => setSelectedEndpoint(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="get_students">/get_students</option>
                  <option value="get_school_profile">/get_school_profile</option>
                  <option value="report_rekap_nilai_s20">/report_rekap_nilai_s20 (Pivot S-20)</option>
                  <option value="report_rekap_absensi_s11">/report_rekap_absensi_s11 (Absen S-11)</option>
                </select>

                <input
                  type="text"
                  placeholder="Kelas (contoh: VI atau %)"
                  value={endpointParamInput.kelas}
                  onChange={e => setEndpointParamInput({ ...endpointParamInput, kelas: e.target.value })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white w-28 text-xs font-mono"
                />

                <input
                  type="text"
                  placeholder="Semester (contoh: 2025/2026-2)"
                  value={endpointParamInput.semester}
                  onChange={e => setEndpointParamInput({ ...endpointParamInput, semester: e.target.value })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white w-36 text-xs font-mono"
                />

                <button
                  onClick={handleRunSelectedEndpoint}
                  disabled={runningEndpoint}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${runningEndpoint ? 'animate-spin' : ''}`} />
                  <span>{runningEndpoint ? 'Memanggil...' : 'Jalankan Endpoint'}</span>
                </button>
              </div>

              {endpointResponse && (
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(endpointResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Kartu Template 4 Prompt AI Siap Salin */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Template Prompt Migrasi (Siap Copy-Paste ke Gemini / AI Studio)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Prompt 1 */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">1. Prompt Membuat Tabel SQL</h4>
                  <button
                    onClick={() => copyToClipboard(prompt1Schema, 'p1')}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    {copiedKey === 'p1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'p1' ? 'Tersalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">Rancang tabel database ternormalisasi berdasarkan struktur dokumen Firestore Anda.</p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[10px] text-slate-700 max-h-24 overflow-hidden text-ellipsis">
                  {prompt1Schema.slice(0, 200)}...
                </div>
              </div>

              {/* Prompt 2 */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">2. Prompt Endpoint TiDB Data Service</h4>
                  <button
                    onClick={() => copyToClipboard(prompt2DataService, 'p2')}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    {copiedKey === 'p2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'p2' ? 'Tersalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">Membuat query SQL untuk file .sql di folder /db GitHub yang otomatis menjadi REST API.</p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[10px] text-slate-700 max-h-24 overflow-hidden text-ellipsis">
                  {prompt2DataService.slice(0, 200)}...
                </div>
              </div>

              {/* Prompt 3 */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">3. Prompt Mengubah Kode React</h4>
                  <button
                    onClick={() => copyToClipboard(prompt3ReactFetch, 'p3')}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    {copiedKey === 'p3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'p3' ? 'Tersalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">Mengubah getDocs / onSnapshot Firestore menjadi fetch REST API TiDB Data Service.</p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[10px] text-slate-700 max-h-24 overflow-hidden text-ellipsis">
                  {prompt3ReactFetch.slice(0, 200)}...
                </div>
              </div>

              {/* Prompt 4 */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">4. Prompt Logika Laporan S-1 s/d S-20</h4>
                  <button
                    onClick={() => copyToClipboard(prompt4ComplexReport, 'p4')}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    {copiedKey === 'p4' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'p4' ? 'Tersalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">Query SQL Pivot untuk rekapitulasi nilai rapor mendatar dan peringkat kelas.</p>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[10px] text-slate-700 max-h-24 overflow-hidden text-ellipsis">
                  {prompt4ComplexReport.slice(0, 200)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQL Laporan Kompleks (S-1 s/d S-20) */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <span>Kueri SQL Laporan Kompleks Resmi (S-1 s/d S-20)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Berikut adalah query SQL relasional TiDB murni untuk menghasilkan pivot nilai, rekap absensi, dan mutasi siswa.
              </p>
            </div>
          </div>

          {/* S-20 Pivot Report */}
          <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Laporan S-20: Rekapitulasi Nilai Rapor Siswa Mendatar (Pivot Mata Pelajaran &amp; Ranking)
              </span>
              <button
                onClick={() => copyToClipboard(`SELECT s.id, s.nis, s.nama_lengkap, s.kelas_sekarang,
  MAX(CASE WHEN g.subject_id IN ('pai', 'agama') THEN g.nilai_akhir END) AS nilai_agama,
  MAX(CASE WHEN g.subject_id IN ('pkn', 'pancasila') THEN g.nilai_akhir END) AS nilai_pkn,
  MAX(CASE WHEN g.subject_id IN ('bindo', 'bahasa_indonesia') THEN g.nilai_akhir END) AS nilai_bindo,
  MAX(CASE WHEN g.subject_id IN ('mtk', 'matematika') THEN g.nilai_akhir END) AS nilai_mtk,
  MAX(CASE WHEN g.subject_id IN ('ipas', 'ipa') THEN g.nilai_akhir END) AS nilai_ipas,
  MAX(CASE WHEN g.subject_id IN ('pjok', 'penjas') THEN g.nilai_akhir END) AS nilai_pjok,
  MAX(CASE WHEN g.subject_id IN ('sbdp', 'seni') THEN g.nilai_akhir END) AS nilai_sbdp,
  ROUND(SUM(g.nilai_akhir), 1) AS total_nilai,
  ROUND(AVG(g.nilai_akhir), 2) AS rata_rata,
  DENSE_RANK() OVER (ORDER BY AVG(g.nilai_akhir) DESC) AS ranking
FROM students s
LEFT JOIN student_grades g ON s.id = g.student_id AND g.semester_key = '2025/2026-2'
WHERE s.school_id = '${schoolProfile.npsn}' AND s.kelas_sekarang = 'VI'
GROUP BY s.id, s.nis, s.nama_lengkap, s.kelas_sekarang
ORDER BY rata_rata DESC;`, 'sql-s20')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-slate-300 rounded hover:bg-blue-50 cursor-pointer"
              >
                {copiedKey === 'sql-s20' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql-s20' ? 'Tersalin' : 'Salin SQL Pivot S-20'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`-- Laporan S-20: Pivot Nilai per Mata Pelajaran & Peringkat Kelas
SELECT 
  s.id AS student_id,
  s.nis,
  s.nama_lengkap,
  s.jenis_kelamin,
  s.kelas_sekarang AS kelas,
  
  -- Kolom Nilai Mendatar (Pivot)
  MAX(CASE WHEN g.subject_id IN ('pai', 'agama') THEN g.nilai_akhir END) AS nilai_agama,
  MAX(CASE WHEN g.subject_id IN ('pkn', 'pancasila') THEN g.nilai_akhir END) AS nilai_pkn,
  MAX(CASE WHEN g.subject_id IN ('bindo', 'bahasa_indonesia') THEN g.nilai_akhir END) AS nilai_bindo,
  MAX(CASE WHEN g.subject_id IN ('mtk', 'matematika') THEN g.nilai_akhir END) AS nilai_mtk,
  MAX(CASE WHEN g.subject_id IN ('ipas', 'ipa') THEN g.nilai_akhir END) AS nilai_ipas,
  MAX(CASE WHEN g.subject_id IN ('pjok', 'penjas') THEN g.nilai_akhir END) AS nilai_pjok,
  MAX(CASE WHEN g.subject_id IN ('sbdp', 'seni') THEN g.nilai_akhir END) AS nilai_sbdp,
  
  -- Akumulasi & Peringkat
  ROUND(SUM(g.nilai_akhir), 1) AS total_nilai,
  ROUND(AVG(g.nilai_akhir), 2) AS rata_rata,
  DENSE_RANK() OVER (ORDER BY AVG(g.nilai_akhir) DESC) AS peringkat_kelas

FROM students s
LEFT JOIN student_grades g 
  ON s.id = g.student_id 
  AND s.school_id = g.school_id 
  AND g.semester_key = '2025/2026-2'
WHERE s.school_id = '${schoolProfile.npsn}' 
  AND s.kelas_sekarang = 'VI'
  AND s.status_siswa = 'aktif'
GROUP BY s.id, s.nis, s.nama_lengkap, s.jenis_kelamin, s.kelas_sekarang
ORDER BY rata_rata DESC;`}
            </pre>
          </div>

          {/* S-11 Rekap Presensi */}
          <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Laporan S-11: Rekapitulasi Presensi Bulanan (Hadir, Sakit, Izin, Alpa &amp; % Kehadiran)
              </span>
              <button
                onClick={() => copyToClipboard(`SELECT s.nis, s.nama_lengkap, s.kelas_sekarang,
  COUNT(CASE WHEN a.status = 'H' THEN 1 END) AS hadir,
  COUNT(CASE WHEN a.status = 'S' THEN 1 END) AS sakit,
  COUNT(CASE WHEN a.status = 'I' THEN 1 END) AS izin,
  COUNT(CASE WHEN a.status = 'A' THEN 1 END) AS alpa,
  ROUND((COUNT(CASE WHEN a.status = 'H' THEN 1 END) / COUNT(a.id)) * 100, 1) AS persentase_kehadiran
FROM students s
LEFT JOIN daily_attendances a ON s.id = a.student_id AND DATE_FORMAT(a.tanggal, '%Y-%m') = '2026-11'
WHERE s.school_id = '${schoolProfile.npsn}' AND s.kelas_sekarang = 'VI'
GROUP BY s.id, s.nis, s.nama_lengkap, s.kelas_sekarang;`, 'sql-s11')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-slate-300 rounded hover:bg-blue-50 cursor-pointer"
              >
                {copiedKey === 'sql-s11' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql-s11' ? 'Tersalin' : 'Salin SQL S-11'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`-- Laporan S-11: Rekapitulasi Presensi Bulanan
SELECT 
  s.nis, 
  s.nama_lengkap, 
  s.kelas_sekarang,
  COUNT(CASE WHEN a.status = 'H' THEN 1 END) AS jumlah_hadir,
  COUNT(CASE WHEN a.status = 'S' THEN 1 END) AS jumlah_sakit,
  COUNT(CASE WHEN a.status = 'I' THEN 1 END) AS jumlah_izin,
  COUNT(CASE WHEN a.status = 'A' THEN 1 END) AS jumlah_alpa,
  ROUND((COUNT(CASE WHEN a.status = 'H' THEN 1 END) / COUNT(a.id)) * 100, 1) AS persentase_kehadiran
FROM students s
LEFT JOIN daily_attendances a 
  ON s.id = a.student_id 
  AND a.school_id = s.school_id 
  AND DATE_FORMAT(a.tanggal, '%Y-%m') = '2026-11'
WHERE s.school_id = '${schoolProfile.npsn}' 
  AND s.kelas_sekarang = 'VI'
GROUP BY s.id, s.nis, s.nama_lengkap, s.kelas_sekarang
ORDER BY s.nama_lengkap ASC;`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: Koneksi Database TiDB Cloud (MySQL2 Pool) */}
      {activeTab === 'tidb' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>Koneksi TiDB Cloud Serverless (MySQL2 Pool)</span>
                </h2>
                <button
                  onClick={() => checkTiDBHealth()}
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
                  actionMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  <p className="font-semibold">{actionMsg.text}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Detail Cluster TiDB Anda</span>
              </h2>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Cluster Name:</span>
                  <span className="font-bold text-slate-800">sistem-administrasi-kesiswaan-nilai</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Instance ID:</span>
                  <span className="font-mono text-[11px] text-slate-800">10828830728998486849</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Region:</span>
                  <span className="font-bold text-slate-800">Singapore (ap-southeast-1)</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">TiDB Version:</span>
                  <span className="font-bold text-slate-800">v8.5.3 (MySQL 8.0 Compatible)</span>
                </div>
              </div>

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

      {/* TAB 4: Vercel Deployment */}
      {activeTab === 'vercel' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Panduan Menghubungkan ke Vercel</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aplikasi ini telah dilengkapi dengan <code>vercel.json</code> dan <code>api/index.ts</code> untuk backend serverless.
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

          <div className="p-4 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{vercelEnvSnippet}</pre>
          </div>
        </div>
      )}

      {/* TAB 5: GitHub Sync */}
      {activeTab === 'github' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                <span>Panduan Push ke GitHub Repository</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Folder <code>/db</code> telah dibuat dan berisi 10 file query endpoint. Push ke repositori agar TiDB Data Service otomatis meng-update API.
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
            <div className="text-slate-400"># Jalankan di Terminal / Command Prompt:</div>
            <div>git init</div>
            <div>git add .</div>
            <div>git commit -m &quot;feat: Integrasi TiDB Data Service endpoints di folder /db&quot;</div>
            <div>git branch -M main</div>
            <div className="text-amber-400"># URL Repositori Anda (dari screenshot):</div>
            <div>git remote add origin https://github.com/kurniawansaputra60-commits/Sistem-Administrasi-Kesiswaan-Nilai-Digital.git</div>
            <div>git push -u origin main</div>
          </div>
        </div>
      )}

      {/* TAB 6: Skrip DDL /db/schema.sql */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Pratinjau Skrip DDL TiDB Cloud (/db/schema.sql)
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
        </div>
      )}
    </div>
  );
};
