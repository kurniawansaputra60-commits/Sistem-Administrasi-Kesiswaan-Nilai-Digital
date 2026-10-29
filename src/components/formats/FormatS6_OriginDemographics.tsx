import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { Printer, Filter, User } from 'lucide-react';

export const FormatS6_OriginDemographics: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const { userProfile } = useAuth();

  const isWaliKelas = userProfile?.role === 'guru_kelas';
  const userRombelCode = (userProfile?.kelasTugas && userProfile?.rombelTugas)
    ? `${userProfile.kelasTugas}${userProfile.rombelTugas}`
    : '1A';

  const [selectedRombel, setSelectedRombel] = useState<string>(isWaliKelas ? userRombelCode : 'ALL');

  const activeStudents = students.filter(s => s.statusSiswa === 'aktif');

  // Kelompok asal sekolah umum di Indonesia
  const originCategories = [
    { key: 'TK', label: 'Taman Kanak-kanak (TK)' },
    { key: 'RA', label: 'Raudhatul Athfal (RA)' },
    { key: 'PAUD', label: 'PAUD / Kelompok Bermain (KB)' },
    { key: 'PINDAHAN', label: 'Pindahan dari SD/MI Lain' },
    { key: 'RUMAH', label: 'Belum Pernah TK / Langsung Masuk' },
  ];

  // Helper untuk menentukan kategori asal
  const categorizeOrigin = (originStr: string, diterimaKelas: string) => {
    const str = (originStr || '').toUpperCase();
    const dKelas = normalizeKelas(diterimaKelas);
    if (dKelas !== '1' || str.includes('SD') || str.includes('MI')) return 'PINDAHAN';
    if (str.includes('RA ') || str.includes('RA-') || str.includes('ATHFAL')) return 'RA';
    if (str.includes('PAUD') || str.includes('KB') || str.includes('BERMAIN')) return 'PAUD';
    if (str.includes('TK') || str.includes('TAMAN KANAK')) return 'TK';
    return 'TK';
  };

  // Filter daftar rombel yang ditampilkan berdasarkan opsi terpilih
  const visibleRombels = ALL_ROMBELS.filter(rInfo => {
    if (selectedRombel === 'ALL') return true;
    return rInfo.code === selectedRombel;
  });

  // Hitung matriks data per rombel
  const matrixData = visibleRombels.map(rInfo => {
    const inClass = activeStudents.filter(s => {
      const matchKelas = normalizeKelas(s.kelasSekarang) === rInfo.kelas;
      const sRombel = s.rombel || 'A';
      return matchKelas && sRombel === rInfo.rombel;
    });

    const rowStats: Record<string, { l: number; p: number; jml: number }> = {};

    originCategories.forEach(cat => {
      const match = inClass.filter(s => categorizeOrigin(s.asalSekolah, s.diterimaDiKelas) === cat.key);
      const l = match.filter(s => s.jenisKelamin === 'L').length;
      const p = match.filter(s => s.jenisKelamin === 'P').length;
      rowStats[cat.key] = { l, p, jml: match.length };
    });

    const totalL = inClass.filter(s => s.jenisKelamin === 'L').length;
    const totalP = inClass.filter(s => s.jenisKelamin === 'P').length;

    return {
      kelas: rInfo.kelas,
      rombel: rInfo.rombel,
      label: rInfo.label,
      code: rInfo.code,
      rowStats,
      totalL,
      totalP,
      totalAll: inClass.length,
    };
  });

  const activeRombelLabel = selectedRombel === 'ALL'
    ? 'SEMUA ROMBEL (1A - 6B)'
    : `ROMBEL BINAAN KELAS ${selectedRombel.charAt(0)} ${selectedRombel.charAt(1)}`;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800">
              Format S-6: Jumlah Siswa Menurut Rombongan Belajar (Rombel), Asal Sekolah, dan Jenis Kelamin
            </h2>
            {isWaliKelas && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                Rombel Binaan: Kelas {userProfile?.kelasTugas || '1'} {userProfile?.rombelTugas || 'A'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Laporan demografi statistik asal sekolah peserta didik disusun per rombel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector Filter Rombel */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <span className="text-xs font-semibold text-slate-700">Rombel:</span>
            <select
              value={selectedRombel}
              onChange={e => setSelectedRombel(e.target.value)}
              className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 cursor-pointer"
            >
              {isWaliKelas && (
                <option value={userRombelCode}>
                  📌 Rombel Binaan (Kelas {userProfile?.kelasTugas} {userProfile?.rombelTugas})
                </option>
              )}
              <option value="ALL">Semua Rombel (1A - 6B)</option>
              {ALL_ROMBELS.map(r => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <span className="text-slate-500">Penandatangan:</span>
            <span className="text-emerald-800 font-bold">KURNIAWAN SAPUTRA</span>
            <span className="text-[10px] text-slate-500 font-mono">(Pengelola Statistik)</span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Format S-6</span>
          </button>
        </div>
      </div>

      {/* Wali Kelas Badge Notice */}
      {isWaliKelas && (
        <div className="no-print bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">Mode Wali Kelas: </span>
              <span>
                Menampilkan statistik untuk <strong className="underline">{userProfile?.displayName}</strong> (Wali Kelas {userProfile?.kelasTugas} {userProfile?.rombelTugas}).
              </span>
            </div>
          </div>
          {selectedRombel !== userRombelCode && (
            <button
              onClick={() => setSelectedRombel(userRombelCode)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              Kembali ke Rombel Binaan
            </button>
          )}
        </div>
      )}

      {/* Official S-6 Document */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-6"
          formatTitle="JUMLAH SISWA MENURUT KELAS, ASAL, DAN JENIS KELAMIN"
          subTitle={`KEADAAN TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} ${selectedRombel !== 'ALL' ? `· ${activeRombelLabel}` : ''}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={3}>No.</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={3}>Kelas &amp; Rombel</th>
                <th className="border border-slate-800 p-2" colSpan={originCategories.length * 3}>
                  Asal Sekolah / Lembaga Pendidikan Sebelumnya
                </th>
                <th className="border border-slate-800 p-2" colSpan={3} rowSpan={2}>
                  Jumlah Seluruhnya
                </th>
              </tr>
              <tr>
                {originCategories.map(cat => (
                  <th key={cat.key} className="border border-slate-800 p-1.5 text-[10px]" colSpan={3}>
                    {cat.label}
                  </th>
                ))}
              </tr>
              <tr className="text-[10px]">
                {originCategories.map(cat => (
                  <React.Fragment key={cat.key}>
                    <th className="border border-slate-800 p-1 w-7">L</th>
                    <th className="border border-slate-800 p-1 w-7">P</th>
                    <th className="border border-slate-800 p-1 w-9 bg-slate-200">Jml</th>
                  </React.Fragment>
                ))}
                <th className="border border-slate-800 p-1 w-8">L</th>
                <th className="border border-slate-800 p-1 w-8">P</th>
                <th className="border border-slate-800 p-1 w-10 bg-slate-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, idx) => {
                const isUserRombelRow = row.code === userRombelCode;
                return (
                  <tr
                    key={row.code}
                    className={`hover:bg-slate-50 text-center ${
                      isUserRombelRow ? 'bg-blue-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="border border-slate-800 p-1.5 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">
                      {row.label}
                      {isUserRombelRow && isWaliKelas && (
                        <span className="ml-1 text-[9px] text-blue-700 font-normal no-print">(Binaan)</span>
                      )}
                    </td>
                    {originCategories.map(cat => {
                      const stat = row.rowStats[cat.key];
                      return (
                        <React.Fragment key={cat.key}>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{stat.l || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{stat.p || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold bg-slate-50">
                            {stat.jml || '-'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{row.totalL}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{row.totalP}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">
                      {row.totalAll}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>
                  {selectedRombel === 'ALL' ? 'Jumlah Seluruh Rombel' : `Total ${activeRombelLabel}`}
                </td>
                {originCategories.map(cat => {
                  const sumL = matrixData.reduce((acc, r) => acc + r.rowStats[cat.key].l, 0);
                  const sumP = matrixData.reduce((acc, r) => acc + r.rowStats[cat.key].p, 0);
                  const sumAll = sumL + sumP;
                  return (
                    <React.Fragment key={cat.key}>
                      <td className="border border-slate-800 p-1 font-mono tabular-nums">{sumL || '-'}</td>
                      <td className="border border-slate-800 p-1 font-mono tabular-nums">{sumP || '-'}</td>
                      <td className="border border-slate-800 p-1 font-mono tabular-nums bg-slate-200">{sumAll || '-'}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {matrixData.reduce((acc, r) => acc + r.totalL, 0)}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {matrixData.reduce((acc, r) => acc + r.totalP, 0)}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-emerald-900 bg-slate-200 font-bold">
                  {matrixData.reduce((acc, r) => acc + r.totalAll, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <OfficialSignature
          useAdminOfficer={true}
          leftTitle="Petugas Administrasi / Pengelola Statistik Kesiswaan"
          leftName="KURNIAWAN SAPUTRA"
          leftNip="19890906 202521 1 004"
        />
      </div>
    </div>
  );
};
