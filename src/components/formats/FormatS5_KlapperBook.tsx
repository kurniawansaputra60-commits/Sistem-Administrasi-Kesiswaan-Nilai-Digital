import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Search, Printer } from 'lucide-react';

export const FormatS5_KlapperBook: React.FC = () => {
  const { students, schoolProfile, transferOuts } = useSchool();
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Urutkan siswa secara alfabetis berdasarkan nama
  const sortedStudents = [...students].sort((a, b) =>
    a.namaLengkap.localeCompare(b.namaLengkap, 'id', { sensitivity: 'base' })
  );

  const filtered = sortedStudents.filter(s => {
    const matchLetter =
      selectedLetter === 'ALL' ||
      s.namaLengkap.trim().toUpperCase().startsWith(selectedLetter);
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery);
    return matchLetter && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Alphabet Filter Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pada buku klapper..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Buku Klapper (Format S-5)</span>
          </button>
        </div>

        {/* Alphabet Tabs */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedLetter('ALL')}
            className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
              selectedLetter === 'ALL'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua (A-Z)
          </button>
          {alphabet.map(letter => {
            const count = sortedStudents.filter(s =>
              s.namaLengkap.trim().toUpperCase().startsWith(letter)
            ).length;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-1 text-xs font-bold font-mono rounded transition-colors ${
                  selectedLetter === letter
                    ? 'bg-emerald-700 text-white'
                    : count > 0
                    ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-300'
                }`}
                disabled={count === 0}
              >
                {letter} {count > 0 && <span className="text-[10px] font-normal">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Official S-5 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-5"
          formatTitle="BUKU KLAPPER SISWA"
          subTitle={`PENYUSUNAN DAFTAR SISWA MENURUT ABJAD TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 min-w-[160px]" rowSpan={2}>Nama Siswa (Sesuai Abjad)</th>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>NIS</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={2}>NISN</th>
                <th className="border border-slate-800 p-2 min-w-[120px]" colSpan={2}>Penerimaan</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={2}>Tgl Lahir</th>
                <th className="border border-slate-800 p-2 min-w-[140px]" rowSpan={2}>Alamat Rumah</th>
                <th className="border border-slate-800 p-2 min-w-[120px]" colSpan={2}>Meninggalkan Sekolah</th>
                <th className="border border-slate-800 p-2 min-w-[110px]" rowSpan={2}>Ket. (Kelas Sekarang)</th>
              </tr>
              <tr>
                <th className="border border-slate-800 p-1.5 w-20">Tanggal</th>
                <th className="border border-slate-800 p-1.5 w-14">Kelas</th>
                <th className="border border-slate-800 p-1.5 w-20">Tanggal</th>
                <th className="border border-slate-800 p-1.5 min-w-[110px]">Alasan / Sebab</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => {
                const transferOut = transferOuts.find(t => t.studentId === student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-bold">{student.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{student.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold text-center text-emerald-900">
                      {student.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{student.nisn}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{student.tanggalDiterima}</td>
                    <td className="border border-slate-800 p-2 text-center">{student.diterimaDiKelas}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{student.tanggalLahir}</td>
                    <td className="border border-slate-800 p-2 text-[10px]">{student.alamat}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">
                      {transferOut ? transferOut.tanggalSurat : student.statusSiswa === 'lulus' ? 'Lulus 2026' : '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px]">
                      {transferOut ? transferOut.alasanPindah : student.statusSiswa === 'lulus' ? 'Telah Lulus Satuan Pendidikan' : '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-semibold text-[10px]">
                      {student.statusSiswa === 'aktif' ? `Kelas ${student.kelasSekarang}` : student.statusSiswa.toUpperCase()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <OfficialSignature
          leftTitle="Petugas Administrasi"
          leftName={schoolProfile.namaPetugasAdmin || 'KURNIAWAN SAPUTRA'}
          leftNip={schoolProfile.nipPetugasAdmin || '19890906 202521 1 004'}
          useAdminOfficer={true}
        />
      </div>
    </div>
  );
};
