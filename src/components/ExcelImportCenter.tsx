import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  downloadStudentExcelTemplate,
  parseStudentExcelFile,
  exportStudentsToExcel,
  ExcelImportRow,
} from '../utils/excelHelper';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Database,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

export const ExcelImportCenter: React.FC = () => {
  const { schoolProfile, students, importStudentsFromExcel } = useSchool();
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ExcelImportRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    await processFile(selected);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    await processFile(dropped);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);
    setImportSuccessMessage(null);
    setIsParsing(true);

    try {
      const rows = await parseStudentExcelFile(selectedFile);
      setParsedRows(rows);
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca file Excel. Pastikan format file sesuai template.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada baris data valid yang dapat diimpor.');
      return;
    }

    const { added, replaced } = importStudentsFromExcel(validRows, importMode);
    setImportSuccessMessage(
      importMode === 'replace'
        ? `Berhasil memperbarui basis data! ${added} siswa diimpor (menggantikan ${replaced} data sebelumnya).`
        : `Berhasil menambahkan ${added} data siswa baru ke sistem.`
    );
    setFile(null);
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-700/50 text-emerald-200 text-xs font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Modul Integrasi & Migrasi Spreadsheet
            </div>
            <h1 className="text-xl font-bold tracking-tight">Import & Export Data Siswa dengan Excel</h1>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Memudahkan petugas kesiswaan dan wali kelas memasukkan data ratusan siswa sekaligus dari format Microsoft Excel (.xlsx / .xls) maupun CSV ke Buku Induk, Klaper, dan seluruh format administrasi secara otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadStudentExcelTemplate(schoolProfile.namaSekolah)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-50 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              Unduh Template Excel Resmi
            </button>
            <button
              onClick={() => exportStudentsToExcel(students, schoolProfile.namaSekolah)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer border border-emerald-500/40 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Ekspor Data Aktif (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-medium">{importSuccessMessage}</div>
        </div>
      )}

      {/* Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Download Template */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-800">Unduh Format Template</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Format template telah disesuaikan dengan standar Dapodik dan Buku Induk Depdiknas dengan kolom NIS, NISN, Nama, Agama, Tempat/Tgl Lahir, dan Orang Tua.
            </p>
          </div>
          <button
            onClick={() => downloadStudentExcelTemplate(schoolProfile.namaSekolah)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Template (.xlsx)
          </button>
        </div>

        {/* Step 2: Upload Excel File */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-800">Pilih & Unggah File</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tarik atau pilih file Excel (.xlsx / .xls) yang sudah Anda isi dengan data peserta didik baru atau mutasi masuk.
            </p>
          </div>
          <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Pilih Berkas Excel
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Step 3: Current Data Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-800">Status Data Saat Ini</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Siswa Tersimpan:</span>
                <span className="font-bold text-slate-900">{students.length} Siswa</span>
              </div>
              <div className="flex justify-between">
                <span>Siswa Aktif:</span>
                <span className="font-semibold text-emerald-700">
                  {students.filter(s => s.statusSiswa === 'aktif').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Siswa Calon / Baru:</span>
                <span className="font-semibold text-blue-700">
                  {students.filter(s => s.statusSiswa === 'calon').length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => exportStudentsToExcel(students, schoolProfile.namaSekolah)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Cadangkan ke Excel
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          file
            ? 'border-emerald-500 bg-emerald-50/40'
            : 'border-slate-300 hover:border-emerald-500 bg-white'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            {isParsing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
            ) : file ? (
              <FileCheck className="w-6 h-6 text-emerald-700" />
            ) : (
              <Upload className="w-6 h-6 text-emerald-700" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {file ? `File terpilih: ${file.name}` : 'Tarik & Lepas File Excel ke Sini'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Mendukung format .xlsx, .xls, dan .csv (Ukuran maksimal 10MB)
            </p>
          </div>

          {!file && (
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Pilih dari Komputer
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Error Message */}
      {parseError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Terjadi Kesalahan Pembacaan Berkas:</span>
            <p>{parseError}</p>
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Pratinjau Data Impor ({parsedRows.length} Baris Terdeteksi)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa data sebelum menyimpannya ke database kesiswaan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {validCount} Data Valid
              </span>
              {invalidCount > 0 && (
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  {invalidCount} Perlu Perbaikan
                </span>
              )}
            </div>
          </div>

          {/* Import Mode Options */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">Mode Penyimpanan:</span>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-emerald-700"
                  />
                  <span className="font-medium text-slate-700">
                    Tambahkan ke Data yang Ada (Rekomendasi)
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-emerald-700"
                  />
                  <span className="font-medium text-rose-700">
                    Gantikan Seluruh Data Siswa (Hati-hati)
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                validCount > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Simpan {validCount} Siswa ke Database
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5">NIS</th>
                  <th className="p-2.5">NISN</th>
                  <th className="p-2.5">Nama Lengkap</th>
                  <th className="p-2.5 text-center">L/P</th>
                  <th className="p-2.5">Kelas</th>
                  <th className="p-2.5">Tempat, Tgl Lahir</th>
                  <th className="p-2.5">Agama</th>
                  <th className="p-2.5">Asal Sekolah</th>
                  <th className="p-2.5">Nama Orang Tua</th>
                  <th className="p-2.5 text-center">Status Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 ${!r.isValid ? 'bg-rose-50/50' : ''}`}
                  >
                    <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-semibold text-emerald-900">{r.nis}</td>
                    <td className="p-2.5 font-mono text-slate-600">{r.nisn}</td>
                    <td className="p-2.5 font-bold text-slate-900">{r.namaLengkap}</td>
                    <td className="p-2.5 text-center font-bold">{r.jenisKelamin}</td>
                    <td className="p-2.5 font-semibold text-slate-800">
                      Kelas {r.kelasSekarang} <span className="text-blue-700 font-mono text-[11px]">(Rombel {r.rombel || 'A'})</span>
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {r.tempatLahir}, {r.tanggalLahir}
                    </td>
                    <td className="p-2.5">{r.agama}</td>
                    <td className="p-2.5 text-slate-600">{r.asalSekolah}</td>
                    <td className="p-2.5 text-slate-700">
                      <div className="font-medium">Ayah: <span className="font-bold">{r.dataAyah?.nama || r.namaAyah || '-'}</span></div>
                      <div className="text-[11px] text-slate-500">Ibu: <span className="font-semibold">{r.dataIbu?.nama || r.namaIbu || '-'}</span></div>
                    </td>
                    <td className="p-2.5 text-center">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Siap Impor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> {r.validationError}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
