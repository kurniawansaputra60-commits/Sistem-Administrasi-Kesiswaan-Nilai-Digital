import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Sparkles, Plus, Trash2, Lock } from 'lucide-react';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

export const FormatPS21_BibitUnggul: React.FC = () => {
  const { schoolProfile, achievements, addAchievement, deleteAchievement } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedBidang, setSelectedBidang] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : '';

  // Form State
  const [studentName, setStudentName] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState(effectiveClass || 'I');
  const [bidang, setBidang] = useState<'Akademik' | 'Sains / MIPA' | 'Seni Budaya' | 'Olahraga' | 'Keagamaan' | 'Teknologi' | 'Kepemimpinan'>('Sains / MIPA');
  const [namaBakat, setNamaBakat] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const bibitUnggulList = achievements.filter(a => a.kategori === 'Bibit Unggul');
  const filtered = bibitUnggulList.filter(a => {
    const matchBidang = selectedBidang === 'ALL' || a.bidang === selectedBidang;
    const matchClass = isGuruKelas ? isKelasMatch(a.kelas, effectiveClass) : true;
    return matchBidang && matchClass;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !namaBakat) return;

    addAchievement({
      studentId: `stu-bu-${Date.now()}`,
      studentName,
      nis: nis || '2025001',
      kelas: isGuruKelas ? effectiveClass : kelas,
      bidang,
      namaPrestasi: namaBakat,
      kategori: 'Bibit Unggul',
      peringkat: 'Bibit Unggul Potensial',
      tingkat: 'Kecamatan',
      tahun: new Date().getFullYear().toString(),
      penyelenggara: schoolProfile.namaSekolah,
      keterangan: keterangan || 'Pembinaan intensif persiapan lomba',
    });

    setShowAddModal(false);
    setStudentName('');
    setNis('');
    setNamaBakat('');
    setKeterangan('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Bidang Bakat:</span>
            <select
              value={selectedBidang}
              onChange={e => setSelectedBidang(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Semua Bidang Keunggulan</option>
              <option value="Sains / MIPA">Sains / MIPA (Matematika & IPA)</option>
              <option value="Seni Budaya">Seni Budaya & Musik</option>
              <option value="Olahraga">Olahraga & Kebugaran</option>
              <option value="Keagamaan">Keagamaan & Tahfidz</option>
              <option value="Akademik">Akademik Umum</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Bibit Unggul
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Bibit Unggul (PS-21)
          </button>
        </div>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none space-y-4">
        <OfficialKop
          formatCode="Format PS-21"
          title="DAFTAR PRESTASI SISWA (BIBIT UNGGUL)"
          subtitle={`BUKU REKAPITULASI PEMETAAN BAKAT, MINAT DAN BIBIT UNGGUL SISWA T.A. ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-12">Kelas</th>
                <th className="border border-slate-800 p-2 text-center w-28">Bidang Bakat</th>
                <th className="border border-slate-800 p-2 text-left min-w-[180px]">Potensi / Keunggulan Menonjol</th>
                <th className="border border-slate-800 p-2 text-center w-28">Status Pemetaan</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Rencana Pembinaan Lanjutan</th>
                <th className="border border-slate-800 p-2 text-center w-12 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Belum ada catatan bibit unggul untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center font-bold text-emerald-950">
                      {b.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">{b.studentName}</td>
                    <td className="border border-slate-800 p-2 text-center font-semibold">Kelas {b.kelas}</td>
                    <td className="border border-slate-800 p-2 text-center">
                      <span className="font-semibold text-emerald-900">{b.bidang}</span>
                    </td>
                    <td className="border border-slate-800 p-2 font-medium">{b.namaPrestasi}</td>
                    <td className="border border-slate-800 p-2 text-center text-[10px]">
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-semibold border border-amber-200">
                        Bibit Unggul
                      </span>
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px] text-slate-700 italic">
                      {b.keterangan || 'Bimbingan khusus ekstrakurikuler & klub talenta'}
                    </td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      <button
                        onClick={() => deleteAchievement(b.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <OfficialSignature
          kelas={effectiveClass}
          rombel="A"
        />
      </div>

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              Tambah Catatan Bibit Unggul Siswa
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">NIS:</label>
                  <input
                    type="text"
                    placeholder="2025xxx"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kelas:</label>
                  <select
                    value={kelas}
                    onChange={e => setKelas(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    {['I', 'II', 'III', 'IV', 'V', 'VI'].map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Bidang Keunggulan:</label>
                <select
                  value={bidang}
                  onChange={e => setBidang(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-1.5"
                >
                  <option value="Sains / MIPA">Sains / MIPA</option>
                  <option value="Seni Budaya">Seni Budaya & Musik</option>
                  <option value="Olahraga">Olahraga & Kebugaran</option>
                  <option value="Keagamaan">Keagamaan / Tahfidz</option>
                  <option value="Akademik">Akademik Umum</option>
                  <option value="Teknologi">Teknologi & Robotik</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Potensi / Bakat Menonjol:</label>
                <input
                  type="text"
                  placeholder="Contoh: Logika aritmatika cepat, hafalan Al-Qur'an tartil, dll"
                  value={namaBakat}
                  onChange={e => setNamaBakat(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Rencana Pembinaan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Diikutsertakan dalam pelatihan intensif bimbingan OSN"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-medium rounded hover:bg-emerald-800 cursor-pointer"
                >
                  Simpan Bibit Unggul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
