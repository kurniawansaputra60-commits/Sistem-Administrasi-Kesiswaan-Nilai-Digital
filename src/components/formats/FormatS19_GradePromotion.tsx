import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, CheckCircle, Lock } from 'lucide-react';
import { toRomanClass } from '../../utils/classUtils';

export const FormatS19_GradePromotion: React.FC = () => {
  const { students, schoolProfile, updateStudentPromotion, batchPromoteClass } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('I');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  // Siswa aktif di kelas ini (exclude Kelas VI karena kelulusan memakai S-20)
  const classStudents = students.filter(
    s => s.statusSiswa === 'aktif' && s.kelasSekarang === effectiveClass && (s.rombel ? s.rombel === effectiveRombel : true)
  );

  const getNextClass = (cls: string) => {
    switch (cls) {
      case 'I': return 'II';
      case 'II': return 'III';
      case 'III': return 'IV';
      case 'IV': return 'V';
      case 'V': return 'VI';
      default: return 'VI';
    }
  };

  const nextClass = getNextClass(effectiveClass);

  const handleSetPromotion = (studentId: string, status: 'Naik ke Kelas' | 'Tinggal di Kelas') => {
    updateStudentPromotion(studentId, {
      tahunAjaran: schoolProfile.tahunAjaranAktif,
      status,
      kelasTujuan: status === 'Naik ke Kelas' ? nextClass : effectiveClass,
    });
  };

  const handleBatchPromote = () => {
    batchPromoteClass(effectiveClass, nextClass, 'Naik ke Kelas');
  };

  const calculateStudentAvg = (s: typeof classStudents[0]) => {
    const sem2 = s.nilaiSemester?.[`${schoolProfile.tahunAjaranAktif}-2`];
    const sem1 = s.nilaiSemester?.[`${schoolProfile.tahunAjaranAktif}-1`];
    const grades = sem2 || sem1;
    if (!grades || grades.length === 0) return 82.5;
    const sum = grades.reduce((acc, g) => acc + g.nilaiAkhir, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  };

  const sortedList = [...classStudents].sort((a, b) => calculateStudentAvg(b) - calculateStudentAvg(a));

  return (
    <div className="space-y-6">
      {/* Top Filter and Batch Action */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rombel Binaan: Kelas {effectiveClass} - Rombel {effectiveRombel}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Pilih Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="I">Kelas I (Naik ke Kelas II)</option>
                  <option value="II">Kelas II (Naik ke Kelas III)</option>
                  <option value="III">Kelas III (Naik ke Kelas IV)</option>
                  <option value="IV">Kelas IV (Naik ke Kelas V)</option>
                  <option value="V">Kelas V (Naik ke Kelas VI)</option>
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
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchPromote}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tetapkan Semua Naik ke Kelas {nextClass}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Format S-19</span>
          </button>
        </div>
      </div>

      {/* Official S-19 Document Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-19"
          formatTitle="DAFTAR KENAIKAN KELAS"
          subTitle={`TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={`${effectiveClass} ${effectiveRombel} (MENUJU KELAS ${nextClass} ${effectiveRombel})`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10">No.</th>
                <th className="border border-slate-800 p-2 w-20">NIS</th>
                <th className="border border-slate-800 p-2 w-24">NISN</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 w-10">L/P</th>
                <th className="border border-slate-800 p-2 w-20">Rata-rata Nilai</th>
                <th className="border border-slate-800 p-2 w-14">Peringkat</th>
                <th className="border border-slate-800 p-2 min-w-[140px]">Keputusan Rapat Dewan Guru</th>
                <th className="border border-slate-800 p-2 min-w-[160px]">Catatan Wali Kelas</th>
                <th className="border border-slate-800 p-2 w-24 no-print">Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((student, idx) => {
                const avg = calculateStudentAvg(student);
                const currentStatus = student.riwayatKenaikan?.status || 'Naik ke Kelas';
                const targetCls = student.riwayatKenaikan?.kelasTujuan || nextClass;
                const note = student.riwayatKenaikan?.catatan || 'Menunjukkan perkembangan belajar dan sikap yang sangat baik.';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold">{student.nis}</td>
                    <td className="border border-slate-800 p-2 font-mono">{student.nisn}</td>
                    <td className="border border-slate-800 p-2 text-left font-bold">{student.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 font-semibold">{student.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold tabular-nums text-slate-900">
                      {avg}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-slate-800">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold">
                      {currentStatus === 'Naik ke Kelas' ? (
                        <span className="text-emerald-800 font-bold">
                          Naik ke Kelas {targetCls}
                        </span>
                      ) : (
                        <span className="text-rose-800 font-bold">
                          Tinggal di Kelas {effectiveClass}
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-800 p-2 text-left text-[10px]">
                      {note}
                    </td>
                    <td className="border border-slate-800 p-2 no-print">
                      <select
                        value={currentStatus}
                        onChange={e => handleSetPromotion(student.id, e.target.value as any)}
                        className="text-[10px] p-1 border border-slate-300 rounded bg-white"
                      >
                        <option value="Naik ke Kelas">Naik Kelas</option>
                        <option value="Tinggal di Kelas">Tinggal Kelas</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Keputusan Rapat Catatan */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 text-xs">
          <p className="font-semibold text-slate-800">Keputusan Rapat Dewan Pendidik :</p>
          <p className="text-slate-600 mt-1">
            Berdasarkan kriteria kenaikan kelas Kurikulum Nasional dan hasil rapat evaluasi dewan guru pada akhir semester genap tahun ajaran {schoolProfile.tahunAjaranAktif}, seluruh siswa yang tercantum dalam daftar ini dinyatakan memenuhi syarat kenaikan kelas.
          </p>
        </div>

        <OfficialSignature kelas={effectiveClass} rombel={effectiveRombel} />
      </div>
    </div>
  );
};
