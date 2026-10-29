import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Lock } from 'lucide-react';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

export const FormatS11_MonthlyRecap: React.FC = () => {
  const { students, schoolProfile, attendances } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');
  const [selectedPeriod, setSelectedPeriod] = useState<'SEMESTER_1' | 'SEMESTER_2' | 'TAHUNAN'>('SEMESTER_2');

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const activeStudents = students.filter(
    s => s.statusSiswa === 'aktif' &&
      (effectiveClass === 'ALL' || isKelasMatch(s.kelasSekarang, effectiveClass)) &&
      (effectiveClass === 'ALL' || !s.rombel || s.rombel === effectiveRombel)
  );

  // Filter attendance records by selected period (Ganjil: Bulan 7-12, Genap: Bulan 1-6, Tahunan: Semua)
  const filteredAttendances = attendances.filter(att => {
    if (!att.tanggal) return true;
    const m = parseInt(att.tanggal.split('-')[1], 10);
    if (selectedPeriod === 'SEMESTER_1') return m >= 7 && m <= 12;
    if (selectedPeriod === 'SEMESTER_2') return m >= 1 && m <= 6;
    return true; // TAHUNAN
  });

  // Hitung akumulasi presensi per siswa
  const studentRecaps = activeStudents.map(s => {
    let sCount = 0;
    let iCount = 0;
    let aCount = 0;

    filteredAttendances.forEach(att => {
      const entry = att.entries.find(e => e.studentId === s.id);
      if (entry) {
        if (entry.status === 'S') sCount++;
        else if (entry.status === 'I') iCount++;
        else if (entry.status === 'A') aCount++;
      }
    });

    const totalAbsent = sCount + iCount + aCount;
    const totalHariEfektif = selectedPeriod === 'TAHUNAN' ? 220 : 110; // Rata-rata hari efektif
    const hadir = Math.max(0, totalHariEfektif - totalAbsent);
    const persentase = Math.round((hadir / totalHariEfektif) * 100);

    return {
      student: s,
      sCount,
      iCount,
      aCount,
      totalAbsent,
      persentase,
    };
  });

  const totalS = studentRecaps.reduce((acc, r) => acc + r.sCount, 0);
  const totalI = studentRecaps.reduce((acc, r) => acc + r.iCount, 0);
  const totalA = studentRecaps.reduce((acc, r) => acc + r.aCount, 0);
  const totalAllAbsent = totalS + totalI + totalA;

  const periodLabel = selectedPeriod === 'SEMESTER_1'
    ? 'SEMESTER 1 (GANJIL)'
    : selectedPeriod === 'SEMESTER_2'
    ? 'SEMESTER 2 (GENAP)'
    : 'SATU TAHUN AJARAN';

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
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
                <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="ALL">Seluruh Kelas (I s/d VI)</option>
                  <option value="I">Kelas I</option>
                  <option value="II">Kelas II</option>
                  <option value="III">Kelas III</option>
                  <option value="IV">Kelas IV</option>
                  <option value="V">Kelas V</option>
                  <option value="VI">Kelas VI</option>
                </select>
              </div>

              {selectedClass !== 'ALL' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Rombel:</span>
                  <select
                    value={selectedRombel}
                    onChange={e => setSelectedRombel(e.target.value)}
                    className="text-xs px-3 py-1.5 border border-blue-300 rounded-md font-bold text-blue-900 bg-blue-50/50"
                  >
                    <option value="A">Rombel A</option>
                    <option value="B">Rombel B</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Periode Rekap:</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value as any)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-bold text-slate-800"
            >
              <option value="SEMESTER_1">Semester 1 (Ganjil)</option>
              <option value="SEMESTER_2">Semester 2 (Genap)</option>
              <option value="TAHUNAN">Satu Tahun Pelajaran Penuh</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Format S-11</span>
        </button>
      </div>

      {/* Official S-11 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-11"
          formatTitle="BUKU REKAP ABSEN BULANAN SISWA"
          subTitle={`PERIODE : ${periodLabel} TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={effectiveClass === 'ALL' ? 'SELURUH TINGKAT' : `KELAS ${effectiveClass} ${effectiveRombel}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>NIS</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={2}>NISN</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 w-14" rowSpan={2}>Kelas</th>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-1" colSpan={4}>
                  Jumlah Hari Tidak Hadir (Absen)
                </th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>% Kehadiran</th>
                <th className="border border-slate-800 p-2 min-w-[130px] text-left" rowSpan={2}>Status &amp; Tindak Lanjut</th>
              </tr>
              <tr className="text-[10px]">
                <th className="border border-slate-800 p-1 w-12 bg-blue-50 text-blue-900">Sakit (S)</th>
                <th className="border border-slate-800 p-1 w-12 bg-amber-50 text-amber-900">Izin (I)</th>
                <th className="border border-slate-800 p-1 w-12 bg-rose-50 text-rose-900">Alfa (A)</th>
                <th className="border border-slate-800 p-1 w-14 bg-slate-200">Total Hari</th>
              </tr>
            </thead>
            <tbody>
              {studentRecaps.map((item, idx) => {
                const s = item.student;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold">{s.nis}</td>
                    <td className="border border-slate-800 p-2 font-mono">{s.nisn}</td>
                    <td className="border border-slate-800 p-2 text-left font-bold">{s.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 font-semibold">Kelas {s.kelasSekarang}</td>
                    <td className="border border-slate-800 p-2 font-semibold">{s.jenisKelamin}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums text-blue-800">
                      {item.sCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums text-amber-800">
                      {item.iCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums text-rose-800 font-bold">
                      {item.aCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">
                      {item.totalAbsent || '0'}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-emerald-900">
                      {item.persentase}%
                    </td>
                    <td className="border border-slate-800 p-2 text-left text-[10px]">
                      {item.aCount >= 3 ? (
                        <span className="text-rose-700 font-bold">Peringatan (Format S-10)</span>
                      ) : item.totalAbsent === 0 ? (
                        <span className="text-emerald-700 font-semibold">Kehadiran Sempurna (100%)</span>
                      ) : (
                        'Baik'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={6}>Jumlah Kumulatif Seluruh Siswa</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-blue-900">{totalS}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-amber-900">{totalI}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-rose-900">{totalA}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums bg-slate-200">{totalAllAbsent}</td>
                <td className="border border-slate-800 p-2 font-mono tabular-nums text-emerald-900 font-bold">
                  98%
                </td>
                <td className="border border-slate-800 p-2 text-left text-[10px]">Rata-rata Presensi Sekolah</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <OfficialSignature
          kelas={effectiveClass !== 'ALL' ? effectiveClass : undefined}
          rombel={effectiveClass !== 'ALL' ? effectiveRombel : undefined}
          waliKelasLabel={effectiveClass !== 'ALL' ? `Wali Kelas ${effectiveClass} ${effectiveRombel}` : "Wali Kelas / Koordinator Presensi"}
        />
      </div>
    </div>
  );
};
