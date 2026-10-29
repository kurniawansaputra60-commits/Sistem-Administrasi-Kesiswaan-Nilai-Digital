import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { CLASS_NUMBERS, ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { Printer, Filter, User } from 'lucide-react';

export const FormatS7_AgeDemographics: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const { userProfile } = useAuth();

  const isWaliKelas = userProfile?.role === 'guru_kelas';
  const userRombelCode = (userProfile?.kelasTugas && userProfile?.rombelTugas)
    ? `${userProfile.kelasTugas}${userProfile.rombelTugas}`
    : '1A';

  const [rombelFilter, setRombelFilter] = useState<string>(isWaliKelas ? userRombelCode : 'ALL');

  const currentRombelFilter = isWaliKelas ? userRombelCode : rombelFilter;

  const activeStudents = students.filter(s => {
    if (s.statusSiswa !== 'aktif') return false;
    if (currentRombelFilter === 'ALL') return true;
    if (currentRombelFilter === 'A' || currentRombelFilter === 'B') {
      const sRombel = s.rombel || 'A';
      return sRombel === currentRombelFilter;
    }
    // Specific rombel e.g. '1A'
    if (currentRombelFilter.length === 2) {
      const k = currentRombelFilter.charAt(0);
      const r = currentRombelFilter.charAt(1);
      const matchKelas = normalizeKelas(s.kelasSekarang) === k;
      const matchRombel = (s.rombel || 'A') === r;
      return matchKelas && matchRombel;
    }
    return true;
  });

  const calculateAge = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const now = new Date(2026, 6, 1); // Acuan tahun ajaran Juli 2026
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const ageGroups = [
    { label: '< 6 Tahun', min: 0, max: 5 },
    { label: '6 Tahun', min: 6, max: 6 },
    { label: '7 Tahun', min: 7, max: 7 },
    { label: '8 Tahun', min: 8, max: 8 },
    { label: '9 Tahun', min: 9, max: 9 },
    { label: '10 Tahun', min: 10, max: 10 },
    { label: '11 Tahun', min: 11, max: 11 },
    { label: '12 Tahun', min: 12, max: 12 },
    { label: '> 12 Tahun', min: 13, max: 99 },
  ];

  const filterLabel = currentRombelFilter === 'ALL'
    ? 'SEMUA ROMBEL'
    : currentRombelFilter === 'A' || currentRombelFilter === 'B'
    ? `HANYA ROMBEL ${currentRombelFilter}`
    : `ROMBEL BINAAN KELAS ${currentRombelFilter.charAt(0)} ${currentRombelFilter.charAt(1)}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800">
              Format S-7: Jumlah Siswa Menurut Usia, Kelas, dan Jenis Kelamin
            </h2>
            {isWaliKelas && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                📌 Terkunci: Kelas {userProfile?.kelasTugas || '1'} {userProfile?.rombelTugas || 'A'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Matriks statistik usia siswa per 1 Juli tahun ajaran {schoolProfile.tahunAjaranAktif} {isWaliKelas ? `(Khusus Rombel Binaan Kelas ${userProfile?.kelasTugas || '1'} ${userProfile?.rombelTugas || 'A'})` : '(Kelas 1 - 6)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isWaliKelas ? (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <span className="text-xs font-semibold text-slate-700">Filter Rombel:</span>
              <select
                value={rombelFilter}
                onChange={e => setRombelFilter(e.target.value)}
                className="text-xs px-2.5 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 cursor-pointer"
              >
                <option value="ALL">Semua Kelas &amp; Rombel</option>
                {ALL_ROMBELS.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
                <option value="A">Rombel A (Semua Tingkat)</option>
                <option value="B">Rombel B (Semua Tingkat)</option>
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
            <span>Cetak Format S-7</span>
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
              Tampilan statistik usia terpisah &amp; terkunci khusus Rombel Binaan <strong>Kelas {userProfile?.kelasTugas} {userProfile?.rombelTugas}</strong> ({userProfile?.displayName}).
            </span>
          </div>
        </div>
      )}

      {/* Official S-7 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-7"
          formatTitle="JUMLAH SISWA MENURUT USIA, KELAS, DAN JENIS KELAMIN"
          subTitle={`KEADAAN TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} (PER 1 JULI) · ${filterLabel}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 min-w-[90px]" rowSpan={2}>Kelompok Usia</th>
                {CLASS_NUMBERS.map(cls => {
                  const isUserClass = isWaliKelas && userProfile?.kelasTugas === cls;
                  return (
                    <th
                      key={cls}
                      className={`border border-slate-800 p-1.5 ${isUserClass ? 'bg-blue-100/70 text-blue-950 font-black' : ''}`}
                      colSpan={3}
                    >
                      Kelas {cls} {isUserClass ? '(Binaan)' : ''}
                    </th>
                  );
                })}
                <th className="border border-slate-800 p-1.5" colSpan={3}>
                  Jumlah Seluruhnya
                </th>
              </tr>
              <tr className="text-[10px]">
                {CLASS_NUMBERS.map(cls => (
                  <React.Fragment key={cls}>
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
              {ageGroups.map((group, idx) => {
                let rowTotalL = 0;
                let rowTotalP = 0;

                return (
                  <tr key={group.label} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-1.5 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-1.5 text-left font-semibold">{group.label}</td>
                    {CLASS_NUMBERS.map(cls => {
                      const match = activeStudents.filter(s => {
                        const age = calculateAge(s.tanggalLahir);
                        return normalizeKelas(s.kelasSekarang) === cls && age >= group.min && age <= group.max;
                      });
                      const l = match.filter(s => s.jenisKelamin === 'L').length;
                      const p = match.filter(s => s.jenisKelamin === 'P').length;
                      const jml = match.length;
                      rowTotalL += l;
                      rowTotalP += p;

                      const isUserClass = isWaliKelas && userProfile?.kelasTugas === cls;

                      return (
                        <React.Fragment key={cls}>
                          <td className={`border border-slate-800 p-1 font-mono tabular-nums ${isUserClass ? 'bg-blue-50/40' : ''}`}>{l || '-'}</td>
                          <td className={`border border-slate-800 p-1 font-mono tabular-nums ${isUserClass ? 'bg-blue-50/40' : ''}`}>{p || '-'}</td>
                          <td className={`border border-slate-800 p-1 font-mono tabular-nums font-semibold ${isUserClass ? 'bg-blue-100/60 text-blue-900 font-bold' : 'bg-slate-50'}`}>
                            {jml || '-'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{rowTotalL || '-'}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{rowTotalP || '-'}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">
                      {rowTotalL + rowTotalP || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>Jumlah Seluruhnya</td>
                {CLASS_NUMBERS.map(cls => {
                  const matchCls = activeStudents.filter(s => normalizeKelas(s.kelasSekarang) === cls);
                  const l = matchCls.filter(s => s.jenisKelamin === 'L').length;
                  const p = matchCls.filter(s => s.jenisKelamin === 'P').length;
                  const isUserClass = isWaliKelas && userProfile?.kelasTugas === cls;
                  return (
                    <React.Fragment key={cls}>
                      <td className={`border border-slate-800 p-1.5 font-mono tabular-nums ${isUserClass ? 'bg-blue-100/40' : ''}`}>{l}</td>
                      <td className={`border border-slate-800 p-1.5 font-mono tabular-nums ${isUserClass ? 'bg-blue-100/40' : ''}`}>{p}</td>
                      <td className={`border border-slate-800 p-1.5 font-mono tabular-nums font-bold ${isUserClass ? 'bg-blue-200 text-blue-950' : 'bg-slate-200'}`}>{matchCls.length}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {activeStudents.filter(s => s.jenisKelamin === 'L').length}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {activeStudents.filter(s => s.jenisKelamin === 'P').length}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-emerald-900 bg-slate-200 font-bold">
                  {activeStudents.length}
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
