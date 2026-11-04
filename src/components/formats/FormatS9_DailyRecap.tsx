import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { CLASS_NUMBERS, ROMBEL_LETTERS, normalizeKelas } from '../../utils/classUtils';
import { isDayOff } from '../../utils/holidayUtils';
import { Printer, Calendar, Lock } from 'lucide-react';

export const FormatS9_DailyRecap: React.FC = () => {
  const { students, schoolProfile, attendances } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');

  const effectiveClass = isGuruKelas ? normalizeKelas(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const activeStudents = students.filter(s => {
    if (s.statusSiswa !== 'aktif') return false;
    const matchClass = effectiveClass === 'ALL' || normalizeKelas(s.kelasSekarang) === effectiveClass;
    const sRombel = s.rombel || 'A';
    const matchRombel = effectiveRombel === 'ALL' || sRombel === effectiveRombel;
    return matchClass && matchRombel;
  });

  const totalL = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const totalP = activeStudents.filter(s => s.jenisKelamin === 'P').length;
  const totalRegistered = activeStudents.length;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, dayNum);
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(dateObj);
    const dayOffCheck = isDayOff(dateObj); // Cek libur akhir pekan (Sabtu & Minggu) atau libur nasional/PHBN/PHBI

    // Filter attendance for this date across active students in scoped class/rombel
    const recs = attendances.filter(a => a.tanggal === dateStr);

    let s = 0;
    let izin = 0;
    let alpa = 0;

    if (!dayOffCheck.isLibur) {
      recs.forEach(r => {
        r.entries.forEach(e => {
          const inActive = activeStudents.some(st => st.id === e.studentId);
          if (inActive) {
            if (e.status === 'S') s++;
            else if (e.status === 'I') izin++;
            else if (e.status === 'A') alpa++;
          }
        });
      });
    }

    const absent = s + izin + alpa;
    const present = dayOffCheck.isLibur ? 0 : Math.max(0, totalRegistered - absent);
    const pct = dayOffCheck.isLibur || totalRegistered === 0 ? 0 : Math.round((present / totalRegistered) * 100);

    return {
      dateStr,
      dayNum,
      dayName,
      isLibur: dayOffCheck.isLibur,
      liburReason: dayOffCheck.reason,
      s,
      izin,
      alpa,
      absent,
      present,
      pct,
    };
  });

  const subTitleClass =
    effectiveClass === 'ALL'
      ? 'SELURUH KELAS'
      : `KELAS ${effectiveClass}${effectiveRombel !== 'ALL' ? ` ROMBEL ${effectiveRombel}` : ''}`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Pilih Bulan &amp; Kelas:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-mono"
          />

          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-xs font-bold text-blue-900 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel} (Terkunci NIP)</span>
            </div>
          ) : (
            <>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
              >
                <option value="ALL">Semua Kelas (Rekapitulasi Sekolah)</option>
                {CLASS_NUMBERS.map(k => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>

              {selectedClass !== 'ALL' && (
                <select
                  value={selectedRombel}
                  onChange={e => setSelectedRombel(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                >
                  <option value="ALL">Semua Rombel</option>
                  {ROMBEL_LETTERS.map(r => (
                    <option key={r} value={r}>
                      Rombel {r}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Format S-9</span>
        </button>
      </div>

      {/* Official S-9 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-9"
          formatTitle="BUKU REKAP ABSENSI HARIAN SISWA"
          subTitle={`BULAN : ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(Number(yearStr), Number(monthStr) - 1, 1)).toUpperCase()} · ${subTitleClass}`}
          kelas={effectiveClass !== 'ALL' ? effectiveClass : undefined}
          rombel={effectiveRombel !== 'ALL' ? effectiveRombel : undefined}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-1.5 w-10" rowSpan={2}>Tgl</th>
                <th className="border border-slate-800 p-1.5 w-24" rowSpan={2}>Hari</th>
                <th className="border border-slate-800 p-1.5" colSpan={3}>Jumlah Siswa</th>
                <th className="border border-slate-800 p-1.5 w-16" rowSpan={2}>Hadir</th>
                <th className="border border-slate-800 p-1.5" colSpan={4}>Tidak Masuk (Absen)</th>
                <th className="border border-slate-800 p-1.5 w-16" rowSpan={2}>% Hadir</th>
                <th className="border border-slate-800 p-1.5 min-w-[120px]" rowSpan={2}>Keterangan</th>
              </tr>
              <tr className="text-[10px]">
                <th className="border border-slate-800 p-1 w-10">L</th>
                <th className="border border-slate-800 p-1 w-10">P</th>
                <th className="border border-slate-800 p-1 w-12 bg-slate-200">Jml</th>
                <th className="border border-slate-800 p-1 w-8">S</th>
                <th className="border border-slate-800 p-1 w-8">I</th>
                <th className="border border-slate-800 p-1 w-8">A</th>
                <th className="border border-slate-800 p-1 w-10 bg-amber-100">Jml</th>
              </tr>
            </thead>
            <tbody>
              {daysArray.map(day => (
                <tr
                  key={day.dateStr}
                  className={`text-center ${
                    day.isLibur
                      ? 'bg-rose-50/70 text-rose-800 font-semibold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="border border-slate-800 p-1 font-mono">{day.dayNum}</td>
                  <td className="border border-slate-800 p-1 text-left pl-2">{day.dayName}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{totalL}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{totalP}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums bg-slate-100 font-bold">{totalRegistered}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold text-emerald-800">
                    {day.isLibur ? '-' : day.present}
                  </td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{day.isLibur ? '-' : day.s || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{day.isLibur ? '-' : day.izin || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{day.isLibur ? '-' : day.alpa || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold bg-amber-50">
                    {day.isLibur ? '-' : day.absent || '0'}
                  </td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">
                    {day.isLibur ? '-' : `${day.pct}%`}
                  </td>
                  <td className="border border-slate-800 p-1 text-left text-[10px] pl-2 font-medium">
                    {day.isLibur
                      ? day.liburReason
                      : day.absent === 0
                      ? 'Nihil'
                      : `S:${day.s} I:${day.izin} A:${day.alpa}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <OfficialSignature
          kelas={effectiveClass !== 'ALL' ? effectiveClass : undefined}
          rombel={effectiveRombel !== 'ALL' ? effectiveRombel : undefined}
          waliKelasLabel={
            effectiveClass !== 'ALL'
              ? `Wali Kelas ${effectiveClass}${effectiveRombel !== 'ALL' ? ` ${effectiveRombel}` : ''}`
              : 'Guru Piket Bulanan'
          }
        />
      </div>
    </div>
  );
};
