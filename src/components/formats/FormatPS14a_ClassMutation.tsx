import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Lock } from 'lucide-react';
import { isKelasMatch, toRomanClass, ROMBEL_FILTER_OPTIONS } from '../../utils/classUtils';

export const FormatPS14a_ClassMutation: React.FC = () => {
  const { schoolProfile, students, mutations } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('I');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>(schoolProfile.semesterAktif);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const classList = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  // Cari wali kelas sesuai kelas & rombel yang dipilih
  const matchedWali = (schoolProfile.waliKelasList || []).find(w => {
    const kMatch = isKelasMatch(w.kelas, effectiveClass);
    if (!kMatch) return false;
    if (effectiveRombel === 'ALL') return true;
    return (w.rombel || 'A') === effectiveRombel;
  });

  const waliNama = isGuruKelas && userProfile?.displayName ? userProfile.displayName : (matchedWali ? matchedWali.nama : schoolProfile.namaWaliKelas);
  const waliNip = isGuruKelas && userProfile?.nip ? userProfile.nip : (matchedWali ? matchedWali.nip : schoolProfile.nipWaliKelas);
  const waliTtd = matchedWali ? matchedWali.ttdUrl : undefined;

  const classMutations = mutations.filter(m => {
    const kMatch = isKelasMatch(m.kelas, effectiveClass);
    const sMatch = m.semester === selectedSemester;
    const rMatch = effectiveRombel === 'ALL' || !m.rombel || m.rombel === effectiveRombel;
    return kMatch && sMatch && rMatch;
  });

  const activeInClass = students.filter(s => {
    const kMatch = isKelasMatch(s.kelasSekarang, effectiveClass);
    const aMatch = s.statusSiswa === 'aktif';
    const rMatch = effectiveRombel === 'ALL' || !s.rombel || s.rombel === effectiveRombel;
    return kMatch && aMatch && rMatch;
  });

  const totalL = activeInClass.filter(s => s.jenisKelamin === 'L').length;
  const totalP = activeInClass.filter(s => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-xs font-bold text-blue-900 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel} (Terkunci NIP)</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Pilih Kelas:</span>
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                  {classList.map(cls => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        selectedClass === cls
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kelas {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropdown Rombel: Semua Rombel, Rombel A, Rombel B */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Rombel:</span>
                <select
                  value={selectedRombel}
                  onChange={e => setSelectedRombel(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white font-semibold text-slate-800"
                >
                  {ROMBEL_FILTER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Semester:</span>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white font-semibold text-slate-800"
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Buku Mutasi Kelas (PS-14a)
        </button>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        <OfficialKop
          formatCode="Format PS-14a"
          title="BUKU MUTASI SISWA KELAS"
          subtitle={`CATATAN MUTASI KELUAR & MASUK KHUSUS TINGKAT KELAS ${effectiveClass}${effectiveRombel !== 'ALL' ? ` ROMBEL ${effectiveRombel}` : ''} SEMESTER ${selectedSemester}`}
        />

        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-2 px-1">
          <div>
            Kelas: <span className="font-bold font-mono">Kelas {effectiveClass}{effectiveRombel !== 'ALL' ? ` (Rombel ${effectiveRombel})` : ' (Semua Rombel)'}</span>
          </div>
          <div>
            Tahun Ajaran: <span className="font-bold">{schoolProfile.tahunAjaranAktif}</span>
          </div>
          <div>
            Wali Kelas: <span className="font-bold">{waliNama}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-24">Tanggal Mutasi</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS</th>
                <th className="border border-slate-800 p-2 text-left min-w-[160px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-10">L/P</th>
                <th className="border border-slate-800 p-2 text-center w-24">Jenis Mutasi</th>
                <th className="border border-slate-800 p-2 text-left min-w-[160px]">Sekolah Asal / Tujuan</th>
                <th className="border border-slate-800 p-2 text-left min-w-[140px]">Alasan Mutasi</th>
                <th className="border border-slate-800 p-2 text-center min-w-[130px]">No. Surat Bukti</th>
              </tr>
            </thead>
            <tbody>
              {classMutations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Tidak ada catatan mutasi keluar atau masuk pada Kelas {selectedClass} {selectedRombel !== 'ALL' ? `Rombel ${selectedRombel}` : ''} di Semester {selectedSemester}.
                  </td>
                </tr>
              ) : (
                classMutations.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{m.tanggalMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-center text-emerald-950">
                      {m.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold">{m.studentName}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{m.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      {m.jenisMutasi === 'MASUK' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">MASUK (+)</span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">KELUAR (-)</span>
                      )}
                    </td>
                    <td className="border border-slate-800 p-2">{m.sekolahAsalTujuan}</td>
                    <td className="border border-slate-800 p-2">{m.alasanMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-[10px]">{m.nomorSurat}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Kelas */}
        <div className="bg-slate-50 p-4 border border-slate-800 rounded-sm max-w-md text-xs space-y-1">
          <span className="font-bold text-slate-900 block mb-1">
            Rekap Siswa Kelas {selectedClass} {selectedRombel !== 'ALL' ? `Rombel ${selectedRombel}` : ''} Saat Ini:
          </span>
          <div className="flex justify-between">
            <span>Siswa Laki-laki:</span>
            <span className="font-mono font-bold">{totalL} anak</span>
          </div>
          <div className="flex justify-between">
            <span>Siswa Perempuan:</span>
            <span className="font-mono font-bold">{totalP} anak</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
            <span>Jumlah Siswa Aktif Rombel:</span>
            <span className="font-mono text-emerald-950">{totalL + totalP} anak</span>
          </div>
        </div>

        <OfficialSignature
          rightTitle="Kepala Sekolah"
          rightName={schoolProfile.namaKepalaSekolah}
          rightNip={schoolProfile.nipKepalaSekolah}
          leftTitle={`Guru / Wali Kelas ${selectedClass}${selectedRombel !== 'ALL' ? ` ${selectedRombel}` : ''}`}
          leftName={waliNama}
          leftNip={waliNip}
          waliKelasTtdUrl={waliTtd}
          city={schoolProfile.kabupatenKota}
          date="20 Juli 2026"
        />
      </div>
    </div>
  );
};
