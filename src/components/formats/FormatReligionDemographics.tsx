import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Religion } from '../../types';
import { ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { Printer, Filter, User } from 'lucide-react';

export const FormatReligionDemographics: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const { userProfile } = useAuth();

  const isWaliKelas = userProfile?.role === 'guru_kelas';
  const userRombelCode = (userProfile?.kelasTugas && userProfile?.rombelTugas)
    ? `${userProfile.kelasTugas}${userProfile.rombelTugas}`
    : '1A';

  const [selectedRombel, setSelectedRombel] = useState<string>(isWaliKelas ? userRombelCode : 'ALL');

  const activeStudents = students.filter(s => s.statusSiswa === 'aktif');

  const religions: { key: Religion; label: string }[] = [
    { key: 'Islam', label: 'Islam' },
    { key: 'Kristen', label: 'Kristen' },
    { key: 'Katolik', label: 'Katolik' },
    { key: 'Hindu', label: 'Hindu' },
    { key: 'Buddha', label: 'Buddha' },
    { key: 'Khonghucu', label: 'Khonghucu' },
  ];

  const currentRombel = isWaliKelas ? userRombelCode : selectedRombel;

  const visibleRombels = ALL_ROMBELS.filter(rInfo => {
    if (currentRombel === 'ALL') return true;
    return rInfo.code === currentRombel;
  });

  const activeRombelLabel = currentRombel === 'ALL'
    ? 'SEMUA ROMBEL (1A - 6B)'
    : `ROMBEL BINAAN KELAS ${currentRombel.charAt(0)} ${currentRombel.charAt(1)}`;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800">
              Laporan Jumlah Siswa Menurut Rombel, Agama, dan Jenis Kelamin (Format PS-7a)
            </h2>
            {isWaliKelas && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                📌 Terkunci: Kelas {userProfile?.kelasTugas || '1'} {userProfile?.rombelTugas || 'A'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Digunakan untuk pemetaan guru Pendidikan Agama dan Budi Pekerti {isWaliKelas ? `(Khusus Rombel Binaan Kelas ${userProfile?.kelasTugas || '1'} ${userProfile?.rombelTugas || 'A'})` : 'disusun per rombel'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Rombel Dropdown: HANYA tampil untuk Admin / Kepala Sekolah. Disembunyikan untuk Wali Kelas */}
          {!isWaliKelas ? (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <span className="text-xs font-semibold text-slate-700">Filter Rombel:</span>
              <select
                value={selectedRombel}
                onChange={e => setSelectedRombel(e.target.value)}
                className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 cursor-pointer"
              >
                <option value="ALL">Semua Rombel (1A - 6B)</option>
                {ALL_ROMBELS.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Rombel Binaan: Kelas {userProfile?.kelasTugas} {userProfile?.rombelTugas}</span>
            </div>
          )}

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
            <span>Cetak Laporan Agama</span>
          </button>
        </div>
      </div>

      {/* Wali Kelas Badge Notice */}
      {isWaliKelas && (
        <div className="no-print bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-900 shadow-2xs">
          <User className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">Otorisasi Wali Kelas: </span>
            <span>
              Tampilan statistik agama terpisah &amp; terkunci khusus Rombel Binaan <strong>Kelas {userProfile?.kelasTugas} {userProfile?.rombelTugas}</strong> ({userProfile?.displayName}).
            </span>
          </div>
        </div>
      )}

      {/* Official Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format PS-7a"
          formatTitle="JUMLAH SISWA MENURUT KELAS, AGAMA, DAN JENIS KELAMIN"
          subTitle={`KEADAAN TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} ${selectedRombel !== 'ALL' ? `· ${activeRombelLabel}` : ''}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={3}>No.</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={3}>Kelas &amp; Rombel</th>
                <th className="border border-slate-800 p-2" colSpan={religions.length * 3}>
                  Agama yang Dianut
                </th>
                <th className="border border-slate-800 p-2" colSpan={3} rowSpan={2}>
                  Jumlah Seluruhnya
                </th>
              </tr>
              <tr>
                {religions.map(r => (
                  <th key={r.key} className="border border-slate-800 p-1.5" colSpan={3}>
                    {r.label}
                  </th>
                ))}
              </tr>
              <tr className="text-[10px]">
                {religions.map(r => (
                  <React.Fragment key={r.key}>
                    <th className="border border-slate-800 p-1 w-6">L</th>
                    <th className="border border-slate-800 p-1 w-6">P</th>
                    <th className="border border-slate-800 p-1 w-7 bg-slate-200">Jml</th>
                  </React.Fragment>
                ))}
                <th className="border border-slate-800 p-1 w-7">L</th>
                <th className="border border-slate-800 p-1 w-7">P</th>
                <th className="border border-slate-800 p-1 w-9 bg-slate-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleRombels.map((rInfo, idx) => {
                const inClass = activeStudents.filter(s => {
                  const matchK = normalizeKelas(s.kelasSekarang) === rInfo.kelas;
                  const sRombel = s.rombel || 'A';
                  return matchK && sRombel === rInfo.rombel;
                });
                const totalL = inClass.filter(s => s.jenisKelamin === 'L').length;
                const totalP = inClass.filter(s => s.jenisKelamin === 'P').length;
                const isUserRombelRow = rInfo.code === userRombelCode;

                return (
                  <tr
                    key={rInfo.code}
                    className={`hover:bg-slate-50 text-center ${
                      isUserRombelRow ? 'bg-blue-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="border border-slate-800 p-1.5 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">
                      {rInfo.label}
                      {isUserRombelRow && isWaliKelas && (
                        <span className="ml-1 text-[9px] text-blue-700 font-normal no-print">(Binaan)</span>
                      )}
                    </td>
                    {religions.map(r => {
                      const match = inClass.filter(s => s.agama === r.key);
                      const l = match.filter(s => s.jenisKelamin === 'L').length;
                      const p = match.filter(s => s.jenisKelamin === 'P').length;
                      return (
                        <React.Fragment key={r.key}>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{l || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{p || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold bg-slate-50">
                            {match.length || '-'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{totalL}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{totalP}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">{inClass.length}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>
                  {currentRombel === 'ALL' ? 'Jumlah Seluruhnya' : `Total ${activeRombelLabel}`}
                </td>
                {religions.map(r => {
                  const filterStudents = currentRombel === 'ALL'
                    ? activeStudents
                    : activeStudents.filter(s => {
                        const k = currentRombel.charAt(0);
                        const romb = currentRombel.charAt(1);
                        return normalizeKelas(s.kelasSekarang) === k && (s.rombel || 'A') === romb;
                      });
                  const matchAll = filterStudents.filter(s => s.agama === r.key);
                  const l = matchAll.filter(s => s.jenisKelamin === 'L').length;
                  const p = matchAll.filter(s => s.jenisKelamin === 'P').length;
                  return (
                    <React.Fragment key={r.key}>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{l || '-'}</td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{p || '-'}</td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums bg-slate-200">{matchAll.length || '-'}</td>
                    </React.Fragment>
                  );
                })}
                {(() => {
                  const filterStudents = currentRombel === 'ALL'
                    ? activeStudents
                    : activeStudents.filter(s => {
                        const k = currentRombel.charAt(0);
                        const romb = currentRombel.charAt(1);
                        return normalizeKelas(s.kelasSekarang) === k && (s.rombel || 'A') === romb;
                      });
                  return (
                    <>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                        {filterStudents.filter(s => s.jenisKelamin === 'L').length}
                      </td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                        {filterStudents.filter(s => s.jenisKelamin === 'P').length}
                      </td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-emerald-900 bg-slate-200 font-bold">
                        {filterStudents.length}
                      </td>
                    </>
                  );
                })()}
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
