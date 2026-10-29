import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Trophy, Plus, Trash2, Award, Lock } from 'lucide-react';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

export const FormatPS22_SiswaBerprestasi: React.FC = () => {
  const { schoolProfile, achievements, addAchievement, deleteAchievement } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedTingkat, setSelectedTingkat] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : '';

  // Form State
  const [studentName, setStudentName] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState(effectiveClass || 'VI');
  const [namaLomba, setNamaLomba] = useState('');
  const [peringkat, setPeringkat] = useState('Juara 1');
  const [tingkat, setTingkat] = useState<'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional'>('Kabupaten/Kota');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [nomorPiagam, setNomorPiagam] = useState('');

  const prestasiJuara = achievements.filter(a => a.kategori === 'Juara Lomba');
  const filtered = prestasiJuara.filter(a => {
    const matchTingkat = selectedTingkat === 'ALL' || a.tingkat === selectedTingkat;
    const matchClass = isGuruKelas ? isKelasMatch(a.kelas, effectiveClass) : true;
    return matchTingkat && matchClass;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !namaLomba) return;

    addAchievement({
      studentId: `stu-pres-${Date.now()}`,
      studentName,
      nis: nis || '2020071',
      kelas: isGuruKelas ? effectiveClass : kelas,
      bidang: 'Akademik',
      namaPrestasi: namaLomba,
      kategori: 'Juara Lomba',
      peringkat,
      tingkat,
      tahun: new Date().getFullYear().toString(),
      penyelenggara: penyelenggara || 'Dinas Pendidikan',
      nomorPiagam: nomorPiagam || `PG/${Math.floor(100 + Math.random() * 900)}/2026`,
      keterangan: 'Pemberian piagam dan penghargaan sekolah',
    });

    setShowAddModal(false);
    setStudentName('');
    setNis('');
    setNamaLomba('');
    setPenyelenggara('');
    setNomorPiagam('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Tingkat:</span>
            <select
              value={selectedTingkat}
              onChange={e => setSelectedTingkat(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Semua Tingkatan</option>
              <option value="Kecamatan">Tingkat Kecamatan</option>
              <option value="Kabupaten/Kota">Tingkat Kabupaten / Kota</option>
              <option value="Provinsi">Tingkat Provinsi</option>
              <option value="Nasional">Tingkat Nasional</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Prestasi Siswa
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Siswa Berprestasi (PS-22)
          </button>
        </div>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none space-y-4">
        <OfficialKop
          formatCode="Format PS-22"
          title="DAFTAR SISWA BERPRESTASI"
          subtitle={`REKAPITULASI PIAGAM PENGHARGAAN DAN KEJUARAAN PESERTA DIDIK TAHUN ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-12">Kelas</th>
                <th className="border border-slate-800 p-2 text-left min-w-[180px]">Nama Kejuaraan / Lomba</th>
                <th className="border border-slate-800 p-2 text-center w-28">Peringkat / Juara</th>
                <th className="border border-slate-800 p-2 text-center w-28">Tingkat Kejuaraan</th>
                <th className="border border-slate-800 p-2 text-center w-16">Tahun</th>
                <th className="border border-slate-800 p-2 text-left min-w-[160px]">Lembaga Penyelenggara</th>
                <th className="border border-slate-800 p-2 text-center min-w-[130px]">Nomor Piagam</th>
                <th className="border border-slate-800 p-2 text-center w-12 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Belum ada data prestasi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center font-bold text-emerald-950">
                      {p.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">{p.studentName}</td>
                    <td className="border border-slate-800 p-2 text-center font-semibold">Kelas {p.kelas}</td>
                    <td className="border border-slate-800 p-2 font-semibold text-slate-800">{p.namaPrestasi}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {p.peringkat}
                      </span>
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-medium">{p.tingkat}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{p.tahun}</td>
                    <td className="border border-slate-800 p-2 text-[11px]">{p.penyelenggara}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-[10px] text-slate-700">
                      {p.nomorPiagam || '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      <button
                        onClick={() => deleteAchievement(p.id)}
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
              Tambah Prestasi / Kejuaraan Siswa
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  placeholder="Nama Siswa Berprestasi"
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
                    placeholder="2020xxx"
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
                <label className="block text-slate-700 font-medium mb-1">Nama Kejuaraan / Lomba:</label>
                <input
                  type="text"
                  placeholder="Contoh: Juara 1 Olimpiade Sains Nasional (OSN) Matematika"
                  value={namaLomba}
                  onChange={e => setNamaLomba(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Peringkat / Juara:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Juara 1 / Medali Emas"
                    value={peringkat}
                    onChange={e => setPeringkat(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tingkat Lomba:</label>
                  <select
                    value={tingkat}
                    onChange={e => setTingkat(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Lembaga Penyelenggara:</label>
                <input
                  type="text"
                  placeholder="Contoh: Balai Pengembangan Talenta Indonesia (BPTI)"
                  value={penyelenggara}
                  onChange={e => setPenyelenggara(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor Piagam / Sertifikat:</label>
                <input
                  type="text"
                  placeholder="Contoh: 0981/BPTI/OSN-SD/2025"
                  value={nomorPiagam}
                  onChange={e => setNomorPiagam(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono"
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
                  Simpan Prestasi Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
