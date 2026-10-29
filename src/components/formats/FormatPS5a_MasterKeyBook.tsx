import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Search, Printer, KeyRound } from 'lucide-react';

export const FormatPS5a_MasterKeyBook: React.FC = () => {
  const { students, schoolProfile, mutations } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  // Urutkan siswa berdasarkan Nomor Induk (NIS)
  const sortedStudents = [...students].sort((a, b) =>
    a.nis.localeCompare(b.nis, undefined, { numeric: true })
  );

  const filtered = sortedStudents.filter(s => {
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    const matchYear =
      filterYear === 'ALL' ||
      s.tanggalDiterima.startsWith(filterYear);
    return matchQuery && matchYear;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIS, NISN, atau nama..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white"
          >
            <option value="ALL">Semua Tahun Penerimaan</option>
            <option value="2025">Tahun Masuk 2025</option>
            <option value="2024">Tahun Masuk 2024</option>
            <option value="2023">Tahun Masuk 2023</option>
            <option value="2022">Tahun Masuk 2022</option>
            <option value="2021">Tahun Masuk 2021</option>
            <option value="2020">Tahun Masuk 2020</option>
          </select>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Buku Kunci Induk (PS-5a)
        </button>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none">
        <OfficialKop
          formatCode="Format PS-5a"
          title="BUKU KUNCI INDUK SISWA"
          subtitle="REGISTER RESMI PENOMORAN INDUK SISWA SECARA KRONOLOGIS KEMDIKBUD"
        />

        <div className="overflow-x-auto my-6">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-800 p-2 text-center w-10" rowSpan={2}>No</th>
                <th className="border border-slate-800 p-2 text-center w-24" rowSpan={2}>Nomor Induk (NIS)</th>
                <th className="border border-slate-800 p-2 text-center w-28" rowSpan={2}>NISN</th>
                <th className="border border-slate-800 p-2 text-left min-w-[180px]" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-12" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-2 text-center" colSpan={2}>Masuk Sekolah</th>
                <th className="border border-slate-800 p-2 text-center" colSpan={2}>Keluar / Meninggalkan Sekolah</th>
                <th className="border border-slate-800 p-2 text-center w-24" rowSpan={2}>Halaman Buku Induk</th>
                <th className="border border-slate-800 p-2 text-center w-28" rowSpan={2}>Status Terakhir</th>
              </tr>
              <tr className="bg-slate-100">
                <th className="border border-slate-800 p-1.5 w-24">Tanggal</th>
                <th className="border border-slate-800 p-1.5 w-16">Kelas</th>
                <th className="border border-slate-800 p-1.5 w-24">Tanggal</th>
                <th className="border border-slate-800 p-1.5 min-w-[120px]">Sebab / Alasan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => {
                const mutasi = mutations.find(m => m.studentId === s.id && m.jenisMutasi === 'KELUAR');
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-center text-emerald-950">
                      {s.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{s.nisn}</td>
                    <td className="border border-slate-800 p-2 font-bold">{s.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 text-center font-semibold">{s.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{s.tanggalDiterima}</td>
                    <td className="border border-slate-800 p-2 text-center">{s.diterimaDiKelas}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">
                      {mutasi ? mutasi.tanggalMutasi : s.statusSiswa === 'lulus' ? '2026-06-20' : '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px]">
                      {mutasi ? mutasi.alasanMutasi : s.statusSiswa === 'lulus' ? 'Lulus Satuan Pendidikan' : '-'}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono text-center font-semibold">
                      Hal. {idx + 1}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-semibold text-[10px]">
                      {s.statusSiswa === 'aktif' ? `Aktif (${s.kelasSekarang})` : s.statusSiswa.toUpperCase()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <OfficialSignature
          rightTitle="Kepala Sekolah"
          rightName={schoolProfile.namaKepalaSekolah}
          rightNip={schoolProfile.nipKepalaSekolah}
          leftTitle="Petugas Administrasi / Pengelola Kesiswaan"
          leftName={schoolProfile.namaPetugasAdmin || 'KURNIAWAN SAPUTRA'}
          leftNip={schoolProfile.nipPetugasAdmin || '19890906 202521 1 004'}
          useAdminOfficer={true}
          city={schoolProfile.kabupatenKota}
          date={schoolProfile.tanggalDokumen}
        />
      </div>
    </div>
  );
};
