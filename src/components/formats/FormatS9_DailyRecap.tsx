import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { CLASS_NUMBERS, ROMBEL_LETTERS, ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { isDayOff } from '../../utils/holidayUtils';
import { formatBulanRentangIndo, formatBulanTahunIndo } from '../../utils/dateUtils';
import { Printer, Calendar, Lock, RefreshCw } from 'lucide-react';

export const FormatS9_DailyRecap: React.FC = () => {
  const { students, schoolProfile, attendances } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';
  const effectiveUserKelas = userProfile?.kelasTugas || '1';
  const effectiveUserRombel = userProfile?.rombelTugas || 'A';

  // Default: June 2026 s.d. June 2026 (format bulan Indonesia: Juni 2026 s.d. Juni 2026)
  const [startMonth, setStartMonth] = useState<string>('2026-06');
  const [endMonth, setEndMonth] = useState<string>('2026-06');

  const [selectedClass, setSelectedClass] = useState<string>(isGuruKelas ? normalizeKelas(effectiveUserKelas) : 'ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>(isGuruKelas ? effectiveUserRombel : 'ALL');

  // Pilihan Penandatangan: 'GURU_PIKET' atau 'WALI_BINAAN'
  const [signatureType, setSignatureType] = useState<string>(isGuruKelas ? 'WALI_BINAAN' : 'GURU_PIKET');

  const effectiveClass = isGuruKelas ? normalizeKelas(effectiveUserKelas) : selectedClass;
  const effectiveRombel = isGuruKelas ? effectiveUserRombel : selectedRombel;

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

  // Bangun rentang tanggal harian dari startMonth sampai endMonth
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const startDateObj = new Date(startYear, startMonthNum - 1, 1);
  const endDateObj = new Date(endYear, endMonthNum, 0); // Hari terakhir bulan akhir

  const daysArray: {
    dateStr: string;
    dayNum: number;
    monthLabel: string;
    dayName: string;
    isLibur: boolean;
    liburReason?: string;
    s: number;
    izin: number;
    alpa: number;
    absent: number;
    present: number;
    pct: number;
  }[] = [];

  const curr = new Date(startDateObj);
  while (curr <= endDateObj) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(curr);
    const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(curr);
    const dayOffCheck = isDayOff(new Date(curr));

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

    daysArray.push({
      dateStr,
      dayNum: curr.getDate(),
      monthLabel,
      dayName,
      isLibur: dayOffCheck.isLibur,
      liburReason: dayOffCheck.reason,
      s,
      izin,
      alpa,
      absent,
      present,
      pct,
    });

    curr.setDate(curr.getDate() + 1);
  }

  // Statistik Total Akumulasi
  const effectiveDays = daysArray.filter(d => !d.isLibur);
  const totalAccumulatedS = daysArray.reduce((acc, d) => acc + d.s, 0);
  const totalAccumulatedI = daysArray.reduce((acc, d) => acc + d.izin, 0);
  const totalAccumulatedA = daysArray.reduce((acc, d) => acc + d.alpa, 0);
  const totalAccumulatedAbsent = totalAccumulatedS + totalAccumulatedI + totalAccumulatedA;
  const avgMonthlyPct = effectiveDays.length > 0
    ? Math.round(effectiveDays.reduce((acc, d) => acc + d.pct, 0) / effectiveDays.length)
    : 100;

  const subTitleClass =
    effectiveClass === 'ALL'
      ? 'SEMUA KELAS (REKAPITULASI SEKOLAH)'
      : `KELAS ${effectiveClass}${effectiveRombel !== 'ALL' ? ` ROMBEL ${effectiveRombel}` : ''}`;

  const bulanRangeIndoText = formatBulanRentangIndo(startMonth, endMonth);

  // Deteksi Wali Kelas Binaan yang cocok
  const matchedWali = schoolProfile.waliKelasList?.find(
    w => normalizeKelas(w.kelas) === (effectiveClass !== 'ALL' ? effectiveClass : '6') &&
         (w.rombel || 'A') === (effectiveRombel !== 'ALL' ? effectiveRombel : 'A')
  );

  // Handler Sinkronisasi dengan Dashboard Wali Kelas Binaan
  const handleSyncWithWaliKelasBinaan = () => {
    if (isGuruKelas) {
      setSelectedClass(normalizeKelas(effectiveUserKelas));
      setSelectedRombel(effectiveUserRombel);
    } else {
      // Default ke kelas binaan terdaftar (misal Kelas VI Rombel A)
      setSelectedClass('6');
      setSelectedRombel('A');
    }
    setSignatureType('WALI_BINAAN');
  };

  const handleResetToAllClasses = () => {
    setSelectedClass('ALL');
    setSelectedRombel('ALL');
    setSignatureType('GURU_PIKET');
  };

  const isSyncedWithBinaan = effectiveClass !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pilih Rentang Bulan */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Pilih Bulan &amp; Kelas:</span>
            <input
              type="month"
              value={startMonth}
              onChange={e => {
                const val = e.target.value;
                setStartMonth(val);
                if (val > endMonth) setEndMonth(val);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono bg-white shadow-2xs"
            />
            <span className="text-xs font-semibold text-slate-600">s.d</span>
            <input
              type="month"
              value={endMonth}
              onChange={e => {
                const val = e.target.value;
                setEndMonth(val);
                if (val < startMonth) setStartMonth(val);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono bg-white shadow-2xs"
            />
          </div>

          {/* Badge Format Bulan Indonesia */}
          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-md">
            📅 {bulanRangeIndoText}
          </div>

          {/* Filter Kelas & Rombel */}
          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-xs font-bold text-blue-900 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel} (Terkunci NIP)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedClass(val);
                  if (val === 'ALL') {
                    setSelectedRombel('ALL');
                    setSignatureType('GURU_PIKET');
                  } else {
                    setSignatureType('WALI_BINAAN');
                  }
                }}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
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
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                >
                  <option value="ALL">Semua Rombel</option>
                  {ROMBEL_LETTERS.map(r => (
                    <option key={r} value={r}>
                      Rombel {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Pilihan Tanda Tangan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Tanda Tangan:</span>
            <select
              value={signatureType}
              onChange={e => setSignatureType(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
            >
              <option value="GURU_PIKET">Guru Piket / Petugas Absensi Harian</option>
              <option value="WALI_BINAAN">
                Wali Kelas Binaan {effectiveClass !== 'ALL' ? `(Kelas ${effectiveClass} ${effectiveRombel})` : '(Wali Kelas Terkait)'}
              </option>
            </select>
          </div>

          {/* Tombol Singkronkan dengan Dashboard Walikelas Binaan */}
          {!isGuruKelas && (
            <button
              onClick={isSyncedWithBinaan ? handleResetToAllClasses : handleSyncWithWaliKelasBinaan}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                isSyncedWithBinaan
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Sinkronkan dengan dashboard wali kelas binaan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {isSyncedWithBinaan
                  ? `Tersinkron Kelas ${effectiveClass} ${effectiveRombel} (Tampilkan Semua)`
                  : 'Sinkronkan dengan Dashboard Walikelas Binaan'}
              </span>
            </button>
          )}
        </div>

        {/* Tombol Cetak Format S-9 */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Format S-9</span>
        </button>
      </div>

      {/* Official S-9 Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-9"
          formatTitle="BUKU REKAP ABSENSI HARIAN SISWA"
          subTitle={`BULAN : ${bulanRangeIndoText.toUpperCase()} · ${subTitleClass} · TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={effectiveClass !== 'ALL' ? effectiveClass : undefined}
          rombel={effectiveRombel !== 'ALL' ? effectiveRombel : undefined}
        />

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Siswa Terdaftar</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalRegistered}</p>
            <span className="text-[10px] text-slate-400 font-mono">(L: {totalL} | P: {totalP})</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Hari Efektif KBM</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{effectiveDays.length} Hari</p>
            <span className="text-[10px] text-slate-400 font-mono">(Total: {daysArray.length} Hari)</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Ketidakhadiran</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{totalAccumulatedAbsent}</p>
            <span className="text-[10px] text-slate-400 font-mono">(S: {totalAccumulatedS} | I: {totalAccumulatedI} | A: {totalAccumulatedA})</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rata-Rata Kehadiran</span>
            <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{avgMonthlyPct}%</p>
            <span className="text-[10px] text-slate-400 font-mono">Bulan {formatBulanTahunIndo(startMonth)}</span>
          </div>
        </div>

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
                  <td className="border border-slate-800 p-1 text-left pl-2 font-medium">{day.dayName}</td>
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
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>Total Rekapitulasi Bulan</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums">{totalL}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums">{totalP}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums bg-slate-200 font-bold">{totalRegistered}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums bg-emerald-100 font-bold text-emerald-900">
                  {effectiveDays.reduce((acc, d) => acc + d.present, 0)}
                </td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-blue-800">{totalAccumulatedS}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-amber-800">{totalAccumulatedI}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums text-rose-800">{totalAccumulatedA}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums bg-amber-100 font-bold">{totalAccumulatedAbsent}</td>
                <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold text-emerald-800">{avgMonthlyPct}%</td>
                <td className="border border-slate-800 p-1 text-left text-[10px]">Rata-rata Kehadiran</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan Resmi S-9 */}
        {signatureType === 'GURU_PIKET' ? (
          <OfficialSignature
            waliKelasLabel="Guru Piket / Petugas Absensi Harian"
            waliKelasNama={schoolProfile.namaPetugasAdmin || 'KURNIAWAN SAPUTRA'}
            waliKelasNip={schoolProfile.nipPetugasAdmin || '19890906 202521 1 004'}
            waliKelasTtdUrl={schoolProfile.petugasAdminTtdUrl}
            useAdminOfficer={true}
          />
        ) : (
          <OfficialSignature
            kelas={effectiveClass !== 'ALL' ? effectiveClass : (matchedWali?.kelas || '6')}
            rombel={effectiveRombel !== 'ALL' ? effectiveRombel : (matchedWali?.rombel || 'A')}
            waliKelasLabel={
              effectiveClass !== 'ALL'
                ? `Wali Kelas ${effectiveClass}${effectiveRombel !== 'ALL' ? ` ${effectiveRombel}` : ''}`
                : `Wali Kelas ${matchedWali?.kelas || '6'} ${matchedWali?.rombel || 'A'}`
            }
            waliKelasNama={matchedWali?.nama || (isGuruKelas ? userProfile?.displayName : schoolProfile.namaWaliKelas)}
            waliKelasNip={matchedWali?.nip || (matchedWali?.nik ? `NIK. ${matchedWali.nik}` : '') || (isGuruKelas ? userProfile?.nip : schoolProfile.nipWaliKelas)}
            waliKelasTtdUrl={matchedWali?.ttdUrl}
            useAdminOfficer={false}
          />
        )}
      </div>
    </div>
  );
};

