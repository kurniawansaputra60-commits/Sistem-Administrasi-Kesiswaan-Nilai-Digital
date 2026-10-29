import React from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer } from 'lucide-react';

export const FormatS3_AcceptedClass1: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const [selectedRombel, setSelectedRombel] = React.useState<string>('ALL');

  // Siswa baru kelas I / 1 yang berstatus aktif
  const acceptedClass1 = students.filter(
    s => s.statusSiswa === 'aktif' &&
      (s.kelasSekarang === 'I' || s.kelasSekarang === '1') &&
      (selectedRombel === 'ALL' || !s.rombel || s.rombel === selectedRombel)
  );

  const maleCount = acceptedClass1.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = acceptedClass1.filter(s => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Print */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h2 className="text-xs font-bold text-slate-800">
              Daftar Resmi Siswa Baru Diterima Kelas I (Format S-3)
            </h2>
            <p className="text-[11px] text-slate-500">
              Total {acceptedClass1.length} Siswa Diterima ({maleCount} Laki-laki, {femaleCount} Perempuan)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Rombel:</span>
            <select
              value={selectedRombel}
              onChange={e => setSelectedRombel(e.target.value)}
              className="text-xs px-3 py-1.5 border border-blue-300 rounded-md font-bold text-blue-900 bg-blue-50/50"
            >
              <option value="ALL">Semua Rombel</option>
              <option value="A">Rombel A</option>
              <option value="B">Rombel B</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Format S-3</span>
        </button>
      </div>

      {/* Official Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-3"
          formatTitle="DAFTAR SISWA BARU KELAS I"
          subTitle={`TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={selectedRombel !== 'ALL' ? `I - ${selectedRombel}` : "I (SATU)"}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10">No.</th>
                <th className="border border-slate-800 p-2 w-20">NIS</th>
                <th className="border border-slate-800 p-2 w-24">NISN</th>
                <th className="border border-slate-800 p-2 min-w-[140px]">Nama Lengkap Siswa Baru</th>
                <th className="border border-slate-800 p-2 w-10">L/P</th>
                <th className="border border-slate-800 p-2 min-w-[130px]">Tempat &amp; Tanggal Lahir</th>
                <th className="border border-slate-800 p-2 w-16">Agama</th>
                <th className="border border-slate-800 p-2 min-w-[120px]">Nama Orang Tua</th>
                <th className="border border-slate-800 p-2 min-w-[110px]">Pekerjaan</th>
                <th className="border border-slate-800 p-2 min-w-[140px]">Alamat Lengkap</th>
                <th className="border border-slate-800 p-2 min-w-[110px]">Asal TK / PAUD</th>
                <th className="border border-slate-800 p-2 w-24">Tanggal Diterima</th>
                <th className="border border-slate-800 p-2 w-16">Ket.</th>
              </tr>
            </thead>
            <tbody>
              {acceptedClass1.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-800 p-2 font-mono font-semibold text-center">{student.nis}</td>
                  <td className="border border-slate-800 p-2 font-mono text-center">{student.nisn}</td>
                  <td className="border border-slate-800 p-2 font-bold">{student.namaLengkap}</td>
                  <td className="border border-slate-800 p-2 text-center font-bold">{student.jenisKelamin}</td>
                  <td className="border border-slate-800 p-2">
                    {student.tempatLahir}, {student.tanggalLahir}
                  </td>
                  <td className="border border-slate-800 p-2 text-center">{student.agama}</td>
                  <td className="border border-slate-800 p-2">{student.dataAyah.nama}</td>
                  <td className="border border-slate-800 p-2">{student.dataAyah.pekerjaan}</td>
                  <td className="border border-slate-800 p-2 text-[10px]">{student.alamat}</td>
                  <td className="border border-slate-800 p-2">{student.asalSekolah}</td>
                  <td className="border border-slate-800 p-2 text-center font-mono">{student.tanggalDiterima}</td>
                  <td className="border border-slate-800 p-2 text-center text-[10px]">Diterima</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 flex items-center justify-between text-xs font-semibold">
          <span>Rekapitulasi Siswa Baru Kelas I:</span>
          <span>Laki-Laki : {maleCount} Orang</span>
          <span>Perempuan : {femaleCount} Orang</span>
          <span>Jumlah Total : {acceptedClass1.length} Orang</span>
        </div>

        <OfficialSignature
          useAdminOfficer={true}
          leftTitle="Ketua Panitia PPDB"
          leftName="KURNIAWAN SAPUTRA"
          leftNip="19890906 202521 1 004"
        />
      </div>
    </div>
  );
};
