import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { isDayOff } from '../../utils/holidayUtils';
import { formatTanggalRentangIndo, formatDDMMYYYY } from '../../utils/dateUtils';
import { Printer, Calendar, Lock, AlertCircle, RefreshCw } from 'lucide-react';

export const FormatS8_DailyBoard: React.FC = () => {
  const { students, schoolProfile, attendances } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';
  const effectiveKelas = userProfile?.kelasTugas || '1';
  const effectiveRombel = userProfile?.rombelTugas || 'A';
  const binaanCode = `${effectiveKelas}${effectiveRombel}`;

  // Default: 06/03/2026 s.d. 06/03/2026 (format tanggal Indonesia)
  const [startDate, setStartDate] = useState<string>('2026-03-06');
  const [endDate, setEndDate] = useState<string>('2026-03-06');

  // Mode Tampilan Rombel: 'ALL' (Semua Rombel) atau kode rombel binaan ('1A', '6A', dll)
  const [filterRombel, setFilterRombel] = useState<string>(isGuruKelas ? binaanCode : 'ALL');

  // Pilihan Tanda Tangan: 'GURU_PIKET' atau kode rombel binaan ('1A', '6A', dll)
  const [signatureType, setSignatureType] = useState<string>(isGuruKelas ? binaanCode : 'GURU_PIKET');

  const activeStudents = students.filter(s => s.statusSiswa === 'aktif');

  // Filter kehadiran dalam rentang tanggal
  const attendanceForRange = attendances.filter(a => a.tanggal >= startDate && a.tanggal <= endDate);
  const holidayCheck = isDayOff(new Date(startDate));

  // Matriks per rombel (1A s/d 6B) - Disaring jika memilih rombel tertentu atau jika Guru Kelas
  const displayedRombels = filterRombel === 'ALL'
    ? ALL_ROMBELS
    : ALL_ROMBELS.filter(r => r.code === filterRombel);

  const boardData = displayedRombels.map(rInfo => {
    const inClass = activeStudents.filter(s => {
      const matchK = normalizeKelas(s.kelasSekarang) === rInfo.kelas;
      const sRombel = s.rombel || 'A';
      return matchK && sRombel === rInfo.rombel;
    });

    const totalL = inClass.filter(s => s.jenisKelamin === 'L').length;
    const totalP = inClass.filter(s => s.jenisKelamin === 'P').length;
    const totalSiswa = inClass.length;

    // Sinkronisasi S, I, A dengan mencocokkan ID Siswa di rombel ini dari record tanggal terpilih
    let sCount = 0;
    let iCount = 0;
    let aCount = 0;

    if (!holidayCheck.isLibur) {
      attendanceForRange.forEach(classRecord => {
        classRecord.entries.forEach(e => {
          const matchedStudent = inClass.find(st => st.id === e.studentId);
          if (matchedStudent) {
            if (e.status === 'S') sCount++;
            else if (e.status === 'I') iCount++;
            else if (e.status === 'A') aCount++;
          }
        });
      });
    }

    const totalAbsent = sCount + iCount + aCount;
    const totalPresent = holidayCheck.isLibur ? 0 : Math.max(0, totalSiswa - totalAbsent);
    const percentage = totalSiswa > 0 && !holidayCheck.isLibur
      ? Math.round((totalPresent / totalSiswa) * 100)
      : holidayCheck.isLibur ? 0 : 100;

    return {
      kelas: rInfo.kelas,
      rombel: rInfo.rombel,
      label: rInfo.label,
      code: rInfo.code,
      totalL,
      totalP,
      totalSiswa,
      sCount,
      iCount,
      aCount,
      totalAbsent,
      totalPresent,
      percentage,
    };
  });

  const totalAllStudents = boardData.reduce((acc, r) => acc + r.totalSiswa, 0);
  const totalAllL = boardData.reduce((acc, r) => acc + r.totalL, 0);
  const totalAllP = boardData.reduce((acc, r) => acc + r.totalP, 0);
  const totalAllS = boardData.reduce((acc, r) => acc + r.sCount, 0);
  const totalAllI = boardData.reduce((acc, r) => acc + r.iCount, 0);
  const totalAllA = boardData.reduce((acc, r) => acc + r.aCount, 0);
  const totalAllAbsent = totalAllS + totalAllI + totalAllA;
  const totalAllPresent = holidayCheck.isLibur ? 0 : totalAllStudents - totalAllAbsent;
  const avgPercentage = totalAllStudents > 0 && !holidayCheck.isLibur
    ? Math.round((totalAllPresent / totalAllStudents) * 100)
    : holidayCheck.isLibur ? 0 : 100;

  // Tanggal format Indonesia lengkap
  const tanggalRangeIndoText = formatTanggalRentangIndo(startDate, endDate);

  // Cari data wali kelas binaan jika tanda tangan diarahkan ke wali kelas
  const matchedWaliItem = schoolProfile.waliKelasList?.find(
    w => `${w.kelas}${w.rombel || 'A'}` === signatureType
  );
  const selectedRombelObj = ALL_ROMBELS.find(r => r.code === signatureType);

  // Handler tombol sinkronisasi dengan dashboard wali kelas binaan
  const handleSyncWithWaliKelasBinaan = () => {
    const targetCode = isGuruKelas ? binaanCode : '6A'; // default ke rombel binaan guru atau kelas binaan VI A
    setFilterRombel(targetCode);
    setSignatureType(targetCode);
  };

  const handleResetToAllRombels = () => {
    setFilterRombel('ALL');
    setSignatureType('GURU_PIKET');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Bagian Rentang Tanggal Indonesia */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                const val = e.target.value;
                setStartDate(val);
                if (val > endDate) setEndDate(val);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono bg-white shadow-2xs"
            />
            <span className="text-xs font-semibold text-slate-600">s.d tanggal</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                const val = e.target.value;
                setEndDate(val);
                if (val < startDate) setStartDate(val);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono bg-white shadow-2xs"
            />
          </div>

          {/* Badge Format Tanggal Indonesia */}
          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium rounded-md flex items-center gap-1.5">
            <span className="font-bold">{formatDDMMYYYY(startDate)} s.d. tanggal {formatDDMMYYYY(endDate)}</span>
            <span className="text-emerald-600 hidden sm:inline">({tanggalRangeIndoText.split('(')[1]?.replace(')', '') || ''})</span>
          </div>

          {/* Filter Rombel / Sinkronisasi Binaan */}
          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-xs font-bold text-blue-900 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveKelas} {effectiveRombel} (Terkunci NIP)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Tampilan Rombel:</span>
              <select
                value={filterRombel}
                onChange={e => setFilterRombel(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
              >
                <option value="ALL">Semua Rombel (Seluruh Sekolah)</option>
                {ALL_ROMBELS.map(r => (
                  <option key={r.code} value={r.code}>
                    Rombel {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pilihan Tanda Tangan: Guru Piket atau Wali Kelas Binaan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Tanda Tangan:</span>
            <select
              value={signatureType}
              onChange={e => setSignatureType(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
            >
              <option value="GURU_PIKET">Guru Piket / Petugas Absensi Harian</option>
              <optgroup label="Wali Kelas Binaan">
                {ALL_ROMBELS.map(r => {
                  const w = schoolProfile.waliKelasList?.find(item => `${item.kelas}${item.rombel || 'A'}` === r.code);
                  return (
                    <option key={r.code} value={r.code}>
                      Wali {r.label} {w ? `(${w.nama})` : ''}
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          {/* Tombol Singkronkan dengan Dashboard Walikelas Binaan */}
          {!isGuruKelas && (
            <button
              onClick={filterRombel === 'ALL' ? handleSyncWithWaliKelasBinaan : handleResetToAllRombels}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                filterRombel !== 'ALL'
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Sinkronkan tampilan dengan dashboard wali kelas binaan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {filterRombel !== 'ALL'
                  ? `Tersinkron Rombel ${filterRombel} (Tampilkan Semua)`
                  : 'Sinkronkan dengan Dashboard Walikelas Binaan'}
              </span>
            </button>
          )}
        </div>

        {/* Tombol Cetak S-8 */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Papan Absensi (S-8)</span>
        </button>
      </div>

      {holidayCheck.isLibur && (
        <div className="no-print bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>HARI LIBUR:</strong> Tanggal {formatDDMMYYYY(startDate)} merupakan <u>{holidayCheck.reason}</u>. Kegiatan KBM dan presensi diliburkan.
          </span>
        </div>
      )}

      {/* Official S-8 Board Document */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-8"
          formatTitle="PAPAN ABSENSI HARIAN SISWA"
          subTitle={`TANGGAL : ${formatDDMMYYYY(startDate)} S.D. TANGGAL ${formatDDMMYYYY(endDate)} (${tanggalRangeIndoText.toUpperCase()}) · TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={filterRombel !== 'ALL' ? (selectedRombelObj?.kelas || effectiveKelas) : undefined}
          rombel={filterRombel !== 'ALL' ? (selectedRombelObj?.rombel || effectiveRombel) : undefined}
        />

        {/* Highlight Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Siswa Terdaftar</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalAllStudents}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Hadir Hari Ini</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{totalAllPresent}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Tidak Hadir (S/I/A)</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{totalAllAbsent}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">% Kehadiran Sekolah</span>
            <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{avgPercentage}%</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 w-28" rowSpan={2}>Rombel</th>
                <th className="border border-slate-800 p-2" colSpan={3}>Jumlah Siswa Terdaftar</th>
                <th className="border border-slate-800 p-2" colSpan={4}>Tidak Masuk (Absen)</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>Jumlah Hadir</th>
                <th className="border border-slate-800 p-2 w-16" rowSpan={2}>% Hadir</th>
                <th className="border border-slate-800 p-2 min-w-[120px]" rowSpan={2}>Keterangan / Rincian Absen</th>
              </tr>
              <tr className="text-[10px]">
                <th className="border border-slate-800 p-1 w-10">L</th>
                <th className="border border-slate-800 p-1 w-10">P</th>
                <th className="border border-slate-800 p-1 w-12 bg-slate-200">Jml</th>
                <th className="border border-slate-800 p-1 w-9">Sakit</th>
                <th className="border border-slate-800 p-1 w-9">Izin</th>
                <th className="border border-slate-800 p-1 w-9">Alpa</th>
                <th className="border border-slate-800 p-1 w-11 bg-amber-100">Jml</th>
              </tr>
            </thead>
            <tbody>
              {boardData.map((row, idx) => (
                <tr key={row.code} className="hover:bg-slate-50 text-center">
                  <td className="border border-slate-800 p-1.5 font-mono">{idx + 1}</td>
                  <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">{row.label}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{row.totalL}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums">{row.totalP}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">{row.totalSiswa}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums text-blue-700">{row.sCount || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums text-amber-700">{row.iCount || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums text-rose-700">{row.aCount || '-'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold bg-amber-50">{row.totalAbsent || '0'}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold text-emerald-800 bg-slate-50">{row.totalPresent}</td>
                  <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{row.percentage}%</td>
                  <td className="border border-slate-800 p-1 text-left text-[10px]">
                    {row.totalAbsent === 0 ? 'Nihil (Hadir Lengkap)' : `S:${row.sCount} I:${row.iCount} A:${row.aCount}`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>Jumlah Seluruh Rombel</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{totalAllL}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{totalAllP}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums bg-slate-200 font-bold">{totalAllStudents}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-blue-800">{totalAllS}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-amber-800">{totalAllI}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-rose-800">{totalAllA}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums bg-amber-100 font-bold">{totalAllAbsent}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums bg-emerald-100 font-bold text-emerald-900">{totalAllPresent}</td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums font-bold">{avgPercentage}%</td>
                <td className="border border-slate-800 p-1.5 text-left text-[10px]">Persentase Kehadiran Sekolah</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan Resmi: Guru Piket / Petugas Absensi Harian vs Wali Kelas Binaan */}
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
            kelas={matchedWaliItem?.kelas || selectedRombelObj?.kelas || effectiveKelas}
            rombel={matchedWaliItem?.rombel || selectedRombelObj?.rombel || effectiveRombel}
            waliKelasLabel={`Wali Kelas ${matchedWaliItem?.kelas || selectedRombelObj?.kelas || effectiveKelas} ${matchedWaliItem?.rombel || selectedRombelObj?.rombel || effectiveRombel}`}
            waliKelasNama={matchedWaliItem?.nama || (isGuruKelas ? userProfile?.displayName : schoolProfile.namaWaliKelas)}
            waliKelasNip={matchedWaliItem?.nip || (matchedWaliItem?.nik ? `NIK. ${matchedWaliItem.nik}` : '') || (isGuruKelas ? userProfile?.nip : schoolProfile.nipWaliKelas)}
            waliKelasTtdUrl={matchedWaliItem?.ttdUrl}
            useAdminOfficer={false}
          />
        )}
      </div>
    </div>
  );
};

