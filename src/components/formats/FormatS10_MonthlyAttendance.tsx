import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Calendar, CheckSquare, Save, Lock } from 'lucide-react';
import { DailyAttendanceRecord } from '../../types';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

export const FormatS10_MonthlyAttendance: React.FC = () => {
  const { students, schoolProfile, attendances, saveAttendance } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('I');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  const [activeDayToFill, setActiveDayToFill] = useState<number>(15);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Siswa aktif di kelas & rombel terpilih
  const classStudents = students.filter(
    s => s.statusSiswa === 'aktif' && isKelasMatch(s.kelasSekarang, effectiveClass) && (s.rombel || 'A') === effectiveRombel
  );

  // Status mapping: get student attendance for day
  const getStatus = (studentId: string, day: number): 'H' | 'S' | 'I' | 'A' | '-' => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, day);
    if (dateObj.getDay() === 0) return '-'; // Minggu libur

    const rec = attendances.find(a => a.tanggal === dateStr && a.kelas === selectedClass);
    if (!rec) return 'H'; // Default Hadir bila hari sekolah
    const entry = rec.entries.find(e => e.studentId === studentId);
    return entry ? entry.status : 'H';
  };

  // Toggle status onClick
  const handleCellClick = (studentId: string, day: number) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, day);
    if (dateObj.getDay() === 0) return; // ignore Sundays

    const current = getStatus(studentId, day);
    const nextStatus: 'H' | 'S' | 'I' | 'A' =
      current === 'H' ? 'S' : current === 'S' ? 'I' : current === 'I' ? 'A' : 'H';

    const existingRec = attendances.find(a => a.tanggal === dateStr && a.kelas === selectedClass);
    let newEntries = existingRec ? [...existingRec.entries] : classStudents.map(s => ({ studentId: s.id, status: 'H' as const }));

    const entryIdx = newEntries.findIndex(e => e.studentId === studentId);
    if (entryIdx >= 0) {
      newEntries[entryIdx] = { studentId, status: nextStatus };
    } else {
      newEntries.push({ studentId, status: nextStatus });
    }

    const updatedRecord: DailyAttendanceRecord = {
      id: existingRec ? existingRec.id : `att-${dateStr}-${selectedClass}`,
      tanggal: dateStr,
      kelas: selectedClass,
      entries: newEntries,
    };
    saveAttendance(updatedRecord);
  };

  // Mark all students present for active day
  const handleMarkAllPresent = () => {
    const dateStr = `${selectedMonth}-${String(activeDayToFill).padStart(2, '0')}`;
    const newEntries = classStudents.map(s => ({ studentId: s.id, status: 'H' as const }));
    saveAttendance({
      id: `att-${dateStr}-${selectedClass}`,
      tanggal: dateStr,
      kelas: selectedClass,
      entries: newEntries,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Quick Attendance filler */}
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
                <span className="text-xs font-semibold text-slate-700">Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="I">Kelas I</option>
                  <option value="II">Kelas II</option>
                  <option value="III">Kelas III</option>
                  <option value="IV">Kelas IV</option>
                  <option value="V">Kelas V</option>
                  <option value="VI">Kelas VI</option>
                </select>
              </div>

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
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-mono"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs text-slate-600">Tgl:</span>
            <input
              type="number"
              min="1"
              max={daysInMonth}
              value={activeDayToFill}
              onChange={e => setActiveDayToFill(Number(e.target.value))}
              className="w-14 text-xs px-2 py-1.5 border border-slate-300 rounded-md font-mono text-center"
            />
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer border border-emerald-200"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>Semua Hadir</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Format S-10</span>
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="no-print bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex items-center justify-between">
        <span>
          💡 <strong>Petunjuk Digital:</strong> Klik pada kotak tanggal siswa untuk mengubah status secara langsung (<strong>H</strong>=Hadir &rarr; <strong>S</strong>=Sakit &rarr; <strong>I</strong>=Izin &rarr; <strong>A</strong>=Alpa &rarr; <strong>H</strong>). Kolom Minggu berwarna merah.
        </span>
        <span className="text-[11px] font-mono text-amber-700">
          Total: {classStudents.length} Siswa di Kelas {effectiveClass} {effectiveRombel}
        </span>
      </div>

      {/* Official S-10 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-10"
          formatTitle="BUKU ABSEN BULANAN SISWA"
          subTitle={`BULAN : ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(Number(yearStr), Number(monthStr) - 1, 1)).toUpperCase()} · TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={`${effectiveClass} - ${effectiveRombel}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[10px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-1 w-8" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-1 w-16" rowSpan={2}>NIS</th>
                <th className="border border-slate-800 p-1 min-w-[130px] text-left" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-1 w-7" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-1" colSpan={daysInMonth}>
                  Tanggal Pelaksanaan Pembelajaran
                </th>
                <th className="border border-slate-800 p-1" colSpan={4}>
                  Jumlah Absen
                </th>
                <th className="border border-slate-800 p-1 w-10" rowSpan={2}>Hadir (H)</th>
                <th className="border border-slate-800 p-1 w-10" rowSpan={2}>%</th>
              </tr>
              <tr>
                {days.map(d => {
                  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, d);
                  const isSunday = dateObj.getDay() === 0;
                  return (
                    <th
                      key={d}
                      className={`border border-slate-800 p-0.5 w-5 font-mono ${
                        isSunday ? 'bg-rose-100 text-rose-800' : ''
                      }`}
                    >
                      {d}
                    </th>
                  );
                })}
                <th className="border border-slate-800 p-0.5 w-6 bg-blue-50 text-blue-900">S</th>
                <th className="border border-slate-800 p-0.5 w-6 bg-amber-50 text-amber-900">I</th>
                <th className="border border-slate-800 p-0.5 w-6 bg-rose-50 text-rose-900">A</th>
                <th className="border border-slate-800 p-0.5 w-7 bg-slate-200">Jml</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, idx) => {
                let sCount = 0;
                let iCount = 0;
                let aCount = 0;
                let effectiveDays = 0;

                days.forEach(d => {
                  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, d);
                  if (dateObj.getDay() !== 0) {
                    effectiveDays++;
                    const st = getStatus(student.id, d);
                    if (st === 'S') sCount++;
                    else if (st === 'I') iCount++;
                    else if (st === 'A') aCount++;
                  }
                });

                const totalAbsent = sCount + iCount + aCount;
                const hadirCount = Math.max(0, effectiveDays - totalAbsent);
                const percent = effectiveDays > 0 ? Math.round((hadirCount / effectiveDays) * 100) : 100;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-1 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-1 font-mono">{student.nis}</td>
                    <td className="border border-slate-800 p-1 text-left font-bold truncate max-w-[140px]">
                      {student.namaLengkap}
                    </td>
                    <td className="border border-slate-800 p-1 font-semibold">{student.jenisKelamin}</td>

                    {/* Matrix of days */}
                    {days.map(d => {
                      const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, d);
                      const isSunday = dateObj.getDay() === 0;
                      const status = getStatus(student.id, d);

                      let cellColor = '';
                      if (isSunday) {
                        cellColor = 'bg-rose-50 text-rose-300 select-none';
                      } else if (status === 'S') {
                        cellColor = 'bg-blue-100 text-blue-900 font-bold';
                      } else if (status === 'I') {
                        cellColor = 'bg-amber-100 text-amber-900 font-bold';
                      } else if (status === 'A') {
                        cellColor = 'bg-rose-200 text-rose-950 font-extrabold';
                      } else {
                        cellColor = 'text-slate-400 font-medium'; // H
                      }

                      return (
                        <td
                          key={d}
                          onClick={() => handleCellClick(student.id, d)}
                          className={`border border-slate-800 p-0.5 font-mono cursor-pointer transition-colors hover:ring-1 hover:ring-emerald-500 ${cellColor}`}
                          title={`Tgl ${d}: ${status === '-' ? 'Libur' : status}`}
                        >
                          {status === 'H' ? '•' : status}
                        </td>
                      );
                    })}

                    {/* Totals */}
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums text-blue-900">
                      {sCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums text-amber-900">
                      {iCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums text-rose-900">
                      {aCount || '-'}
                    </td>
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums font-semibold bg-slate-100">
                      {totalAbsent || '0'}
                    </td>
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums font-bold text-emerald-800">
                      {hadirCount}
                    </td>
                    <td className="border border-slate-800 p-0.5 font-mono tabular-nums font-semibold">
                      {percent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[10px] text-slate-600 flex items-center gap-4">
          <span>Keterangan Tanda:</span>
          <span>(•) = Hadir</span>
          <span className="text-blue-700 font-bold">S = Sakit</span>
          <span className="text-amber-700 font-bold">I = Izin</span>
          <span className="text-rose-700 font-bold">A = Alpa / Tanpa Keterangan</span>
          <span className="text-rose-500">(-) = Hari Libur</span>
        </div>

        <OfficialSignature kelas={effectiveClass} rombel={effectiveRombel} />
      </div>
    </div>
  );
};
