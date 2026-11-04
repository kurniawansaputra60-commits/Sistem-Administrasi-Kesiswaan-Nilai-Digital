import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Printer, Users } from 'lucide-react';
import { isKelasMatch, toRomanClass, formatPlaceAndBirthDate } from '../../utils/classUtils';

export const FormatPS5b_AuxiliaryMasterBook: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const { userProfile } = useAuth();

  const isGuruKelas = userProfile?.role === 'guru_kelas';
  const initialClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas || '1') : 'I';
  const initialRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : 'A';

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedRombel, setSelectedRombel] = useState<string>(initialRombel);
  const [searchQuery, setSearchQuery] = useState('');

  const classList = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const rombelList = ['A', 'B'];

  // Wali kelas otomatis menyesuaikan kelas & rombel yang dipilih
  const matchedWali = (schoolProfile.waliKelasList || []).find(
    w => isKelasMatch(w.kelas, selectedClass) && (w.rombel || 'A') === selectedRombel
  ) || (schoolProfile.waliKelasList || []).find(w => isKelasMatch(w.kelas, selectedClass));

  const waliKelasName = matchedWali?.nama || (selectedClass === 'I' ? 'Siti Khadijah, S.Pd.' : schoolProfile.namaWaliKelas);

  const filtered = students.filter(s => {
    const matchClass = isKelasMatch(s.kelasSekarang, selectedClass);
    const matchRombel = !selectedRombel || (s.rombel || 'A') === selectedRombel;
    const matchActive = s.statusSiswa === 'aktif';
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    return matchClass && matchRombel && matchActive && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pemilihan Kelas */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Tingkat Kelas:</span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              {classList.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  disabled={isGuruKelas}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 disabled:opacity-50'
                  }`}
                >
                  Kelas {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Pemilihan Rombel */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Rombel:</span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              {rombelList.map(rb => (
                <button
                  key={rb}
                  onClick={() => setSelectedRombel(rb)}
                  disabled={isGuruKelas}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    selectedRombel === rb
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 disabled:opacity-50'
                  }`}
                >
                  Rombel {rb}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 cursor-pointer shadow-xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Buku Pembantu Induk (PS-5b)</span>
        </button>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none">
        <OfficialKop
          formatCode="Format PS-5b"
          title="BUKU PEMBANTU INDUK SISWA"
          subtitle={`CATATAN INDUK PESERTA DIDIK TINGKAT KELAS / ROMBEL ${selectedClass} ${selectedRombel}`}
        />

        {/* Metadata Header Sesuai Instruksi Resmi */}
        <div className="flex flex-wrap justify-between items-center text-xs font-medium text-slate-800 mb-4 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            Tingkat Kelas: <span className="font-bold font-mono text-emerald-900">Kelas {selectedClass}</span> {selectedRombel && <span className="font-semibold text-slate-600">({selectedRombel})</span>}
          </div>
          <div>
            Tahun Pelajaran: <span className="font-bold font-mono text-emerald-900">{schoolProfile.tahunAjaranAktif || '2025/2026'}</span>
          </div>
          <div>
            Wali Kelas: <span className="font-bold text-slate-950 underline">{waliKelasName}</span>
          </div>
        </div>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100 text-slate-900 font-bold">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS</th>
                <th className="border border-slate-800 p-2 text-center w-24">NISN</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-10">L/P</th>
                <th className="border border-slate-800 p-2 text-left min-w-[130px]">Tempat, Tgl Lahir</th>
                <th className="border border-slate-800 p-2 text-center w-16">Agama</th>
                <th className="border border-slate-800 p-2 text-left min-w-[130px]">Nama Orang Tua</th>
                <th className="border border-slate-800 p-2 text-left min-w-[110px]">Pekerjaan Ortu</th>
                <th className="border border-slate-800 p-2 text-left min-w-[140px]">Alamat Tempat Tinggal</th>
                <th className="border border-slate-800 p-2 text-center w-20">No. HP Ortu</th>
                <th className="border border-slate-800 p-2 text-left min-w-[100px]">Catatan Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Belum ada data siswa aktif pada Kelas {selectedClass} Rombel {selectedRombel}.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-center text-emerald-950">
                      {s.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-slate-600">{s.nisn}</td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">{s.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{s.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-[11px]">
                      {formatPlaceAndBirthDate(s.tempatLahir, s.tanggalLahir)}
                    </td>
                    <td className="border border-slate-800 p-2 text-center">{s.agama}</td>
                    <td className="border border-slate-800 p-2 text-[11px]">
                      {s.dataAyah?.nama || '-'} / {s.dataIbu?.nama || '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px] text-slate-700">
                      {s.dataAyah?.pekerjaan || '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px]">{s.alamat}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-[10px]">
                      {s.dataAyah?.noHp || s.noHp || '-'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px] text-slate-600 italic">
                      {s.keterangan || 'Mengikuti kegiatan belajar dengan baik.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Resmi:
            Kepala Sekolah tercetak di sebelah kiri lembar dokumen resmi ("Mengetahui")
            Petugas Administrasi Kurniawan Saputra tercetak di sebelah kanan dokumen resmi
        */}
        <OfficialSignature
          rightTitle="Kepala Sekolah"
          rightName={schoolProfile.namaKepalaSekolah}
          rightNip={schoolProfile.nipKepalaSekolah}
          leftTitle="Petugas Administrasi / Pengelola Buku Pembantu Induk"
          leftName="KURNIAWAN SAPUTRA"
          leftNip="19890906 202521 1 004"
          useAdminOfficer={true}
          city={schoolProfile.kabupatenKota}
          date={schoolProfile.tanggalDokumen}
        />
      </div>
    </div>
  );
};
