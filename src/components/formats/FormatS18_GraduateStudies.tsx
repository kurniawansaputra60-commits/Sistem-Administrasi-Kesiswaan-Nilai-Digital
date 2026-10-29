import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Plus, GraduationCap, Building } from 'lucide-react';
import { GraduateStudyRecord } from '../../types';

export const FormatS18_GraduateStudies: React.FC = () => {
  const { students, schoolProfile, gradStudies, addGraduateStudy, updateGraduateStudy } = useSchool();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [studentId, setStudentId] = useState<string>(students.filter(s => s.kelasSekarang === 'VI')[0]?.id || students[0]?.id || '');
  const [statusStudi, setStatusStudi] = useState<GraduateStudyRecord['statusStudi']>('MELANJUTKAN');
  const [namaSekolahLanjutan, setNamaSekolahLanjutan] = useState('SMP Negeri 1 Jakarta');
  const [jenisSekolahLanjutan, setJenisSekolahLanjutan] = useState<GraduateStudyRecord['jenisSekolahLanjutan']>('SMP Negeri');
  const [kabupatenKotaLanjutan, setKabupatenKotaLanjutan] = useState('Jakarta Pusat');
  const [noIjazah, setNoIjazah] = useState('DN-01/D-SD/K13/26/0012986');
  const [keterangan, setKeterangan] = useState('Diterima melalui Jalur Zonasi Reguler');

  const filtered = gradStudies.filter(g => {
    if (filterStatus === 'ALL') return true;
    return g.statusStudi === filterStatus;
  });

  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    addGraduateStudy({
      studentId: st.id,
      nis: st.nis,
      nisn: st.nisn,
      namaLengkap: st.namaLengkap,
      jenisKelamin: st.jenisKelamin,
      tahunLulus: schoolProfile.tahunAjaranAktif,
      statusStudi,
      namaSekolahLanjutan,
      jenisSekolahLanjutan,
      kabupatenKotaLanjutan,
      noIjazah,
      keterangan,
    });

    setIsModalOpen(false);
  };

  const melanjutkanCount = gradStudies.filter(g => g.statusStudi === 'MELANJUTKAN').length;
  const tidakCount = gradStudies.filter(g => g.statusStudi === 'TIDAK_MELANJUTKAN').length;
  const pctMelanjutkan = gradStudies.length > 0 ? Math.round((melanjutkanCount / gradStudies.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Filter Status Studi:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
          >
            <option value="ALL">Semua Lulusan ({gradStudies.length})</option>
            <option value="MELANJUTKAN">Melanjutkan ke SMP/MTs ({melanjutkanCount})</option>
            <option value="TIDAK_MELANJUTKAN">Tidak Melanjutkan ({tidakCount})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Sekolah Lanjutan</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Format S-18</span>
          </button>
        </div>
      </div>

      {/* Official S-18 Document Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-18"
          formatTitle="DAFTAR SISWA MASUK SLTP/MTS"
          subTitle={`PENELUSURAN ALUMNI TAHUN KELULUSAN ${schoolProfile.tahunAjaranAktif} (WAJIB BELAJAR 9/12 TAHUN)`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10">No.</th>
                <th className="border border-slate-800 p-2 w-20">NIS</th>
                <th className="border border-slate-800 p-2 w-24">NISN</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left">Nama Lengkap Siswa Lulusan</th>
                <th className="border border-slate-800 p-2 w-10">L/P</th>
                <th className="border border-slate-800 p-2 w-28">Status Studi</th>
                <th className="border border-slate-800 p-2 min-w-[160px] text-left">Nama Sekolah Lanjutan (SMP / MTs)</th>
                <th className="border border-slate-800 p-2 w-24">Jenis Jenjang</th>
                <th className="border border-slate-800 p-2 min-w-[120px] text-left">Kabupaten / Kota</th>
                <th className="border border-slate-800 p-2 w-32 font-mono">No. Seri Ijazah SD</th>
                <th className="border border-slate-800 p-2 min-w-[130px] text-left">Keterangan Jalur</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((grad, idx) => (
                <tr key={grad.id} className="hover:bg-slate-50 text-center">
                  <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                  <td className="border border-slate-800 p-2 font-mono font-semibold">{grad.nis}</td>
                  <td className="border border-slate-800 p-2 font-mono">{grad.nisn}</td>
                  <td className="border border-slate-800 p-2 text-left font-bold">{grad.namaLengkap}</td>
                  <td className="border border-slate-800 p-2 font-semibold">{grad.jenisKelamin}</td>
                  <td className="border border-slate-800 p-2 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      grad.statusStudi === 'MELANJUTKAN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {grad.statusStudi}
                    </span>
                  </td>
                  <td className="border border-slate-800 p-2 text-left font-semibold text-slate-900">
                    {grad.namaSekolahLanjutan || '-'}
                  </td>
                  <td className="border border-slate-800 p-2">{grad.jenisSekolahLanjutan || '-'}</td>
                  <td className="border border-slate-800 p-2 text-left">{grad.kabupatenKotaLanjutan || '-'}</td>
                  <td className="border border-slate-800 p-2 font-mono text-[10px]">{grad.noIjazah || '-'}</td>
                  <td className="border border-slate-800 p-2 text-left text-[10px]">{grad.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi Wajib Belajar */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 flex items-center justify-between text-xs font-semibold">
          <span>Rekapitulasi Penelusuran Studi Lanjutan:</span>
          <span>Melanjutkan : {melanjutkanCount} Orang</span>
          <span>Tidak Melanjutkan : {tidakCount} Orang</span>
          <span>Persentase Melanjutkan : <strong className="text-emerald-800">{pctMelanjutkan}%</strong></span>
          <span>Total Lulusan : {gradStudies.length} Orang</span>
        </div>

        <OfficialSignature waliKelasLabel="Koordinator Penelusuran Lulusan" />
      </div>

      {/* Modal Catat Lanjutan Studi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Catat Kelanjutan Studi Siswa (Format S-18)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStudy} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1">Pilih Siswa Lulusan *</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} - Kelas {s.kelasSekarang} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Studi Lanjutan *</label>
                <select
                  value={statusStudi}
                  onChange={e => setStatusStudi(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                >
                  <option value="MELANJUTKAN">MELANJUTKAN KE SMP / MTS</option>
                  <option value="TIDAK_MELANJUTKAN">TIDAK MELANJUTKAN</option>
                  <option value="BEKERJA">BEKERJA / BANTU KELUARGA</option>
                  <option value="BELUM_DIKETAHUI">BELUM DIKETAHUI</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Sekolah Lanjutan *</label>
                <input
                  type="text"
                  required
                  value={namaSekolahLanjutan}
                  onChange={e => setNamaSekolahLanjutan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  placeholder="SMP Negeri 1 Jakarta / MTs Negeri ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jenis Jenjang Lanjutan</label>
                  <select
                    value={jenisSekolahLanjutan}
                    onChange={e => setJenisSekolahLanjutan(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    <option value="SMP Negeri">SMP Negeri</option>
                    <option value="SMP Swasta">SMP Swasta</option>
                    <option value="MTs Negeri">MTs Negeri</option>
                    <option value="MTs Swasta">MTs Swasta</option>
                    <option value="Pesantren">Pondok Pesantren</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kabupaten / Kota Sekolah</label>
                  <input
                    type="text"
                    value={kabupatenKotaLanjutan}
                    onChange={e => setKabupatenKotaLanjutan(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nomor Seri Ijazah SD</label>
                <input
                  type="text"
                  value={noIjazah}
                  onChange={e => setNoIjazah(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  placeholder="DN-01/D-SD/K13/26/0012986"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Keterangan / Jalur Penerimaan</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  placeholder="Zonasi / Prestasi / Afirmasi"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded"
                >
                  Simpan Format S-18
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
