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
} from 'lucide-react';

export const MySQLDatabaseCenter: React.FC = () => {
  const { mysqlConfig, updateMySQLConfig, testMySQLConnection, downloadMySQLDump, getMySQLDumpText } = useSchool();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  const sqlDump = getMySQLDumpText();

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testMySQLConnection();
    setTesting(false);
    setTestResult(res);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Pusat Pengelolaan Database MySQL
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                mysqlConfig.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {mysqlConfig.isConnected ? 'MySQL Terhubung' : 'Penyimpanan Aktif + Siap Ekspor .SQL'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data administrasi kesiswaan Format S-1 s/d S-20 tersimpan secara permanen dan terstruktur dalam skema relasional tabel MySQL (InnoDB utf8mb4).
            </p>
          </div>
        </div>

        <button
          onClick={downloadMySQLDump}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Script MySQL (.sql)</span>
        </button>
      </div>

      {/* Grid: MySQL Configuration & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Konfigurasi Koneksi Server MySQL</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700">Host Server MySQL</label>
              <input
                type="text"
                value={mysqlConfig.host}
                onChange={e => updateMySQLConfig({ host: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="localhost atau IP VPS"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700">Port</label>
              <input
                type="number"
                value={mysqlConfig.port}
                onChange={e => updateMySQLConfig({ port: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="3306"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Database Name</label>
              <input
                type="text"
                value={mysqlConfig.database}
                onChange={e => updateMySQLConfig({ database: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="db_kesiswaan_sekolah"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Username</label>
              <input
                type="text"
                value={mysqlConfig.user}
                onChange={e => updateMySQLConfig({ user: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="root"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Password</label>
              <input
                type="password"
                value={mysqlConfig.password}
                onChange={e => updateMySQLConfig({ password: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              * Driver <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mysql2/promise</code> aktif di server Express.
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi MySQL'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}>
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <p className="font-semibold">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Table Structure Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Skema Tabel Relasional MySQL</span>
          </h2>

          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">sekolah_profile</span>
              <span className="text-slate-500">Profil &amp; Kop</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">siswa</span>
              <span className="text-slate-500">S-1, S-2, S-3, S-4, S-5</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">absensi_harian</span>
              <span className="text-slate-500">Format S-8 &amp; S-9</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">surat_ketidakhadiran_s10</span>
              <span className="text-slate-500">Format S-10 Panggilan</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">mutasi_siswa</span>
              <span className="text-slate-500">Format S-12, S-13, S-14</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">calon_peserta_ujian_s15</span>
              <span className="text-slate-500">Format S-15, S-16, S-17</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">kelulusan_lanjutan_studi_s18</span>
              <span className="text-slate-500">Format S-18 Studi</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
              <span className="font-mono font-semibold text-slate-800">kenaikan_kelulusan_s19_s20</span>
              <span className="text-slate-500">Format S-19 &amp; S-20</span>
            </div>
          </div>
        </div>
      </div>

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
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 cursor-pointer font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Tersalin' : 'Salin SQL'}</span>
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
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold text-slate-900">Cara Mengimpor ke MySQL Server Lokal / Sekolah (phpMyAdmin / XAMPP / MariaDB):</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Klik tombol <strong>"Unduh Script MySQL (.sql)"</strong> di atas untuk mengunduh seluruh skrip tabel &amp; data siswa.</li>
          <li>Buka <strong>phpMyAdmin</strong> pada browser Anda (biasanya di <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">http://localhost/phpmyadmin</code>).</li>
          <li>Klik tab <strong>"Import"</strong> pada menu atas.</li>
          <li>Pilih file <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">.sql</code> yang baru saja diunduh, lalu klik tombol <strong>"Kirim / Go"</strong>.</li>
          <li>Database <code className="font-mono font-bold">db_kesiswaan_sekolah</code> beserta seluruh data Format S-1 s/d S-20 akan langsung terbuat dan terisi otomatis.</li>
        </ol>
      </div>
    </div>
  );
};
