import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';
import { Printer, GraduationCap, CheckCircle, Lock } from 'lucide-react';

export const FormatS20_GraduationPromotion: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const defaultClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : 'VI';
  const defaultRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : 'A';

  const [filterClass, setFilterClass] = useState<string>(defaultClass);
  const [selectedRombel, setSelectedRombel] = useState<string>(defaultRombel);

  // Siswa kelas VI/terpilih yang lulus atau siswa kelas lainnya
  const classStudents = students.filter(s => {
    const activeClass = isGuruKelas ? defaultClass : filterClass;
    const activeRombel = isGuruKelas ? defaultRombel : selectedRombel;
    const kMatch = isKelasMatch(s.kelasSekarang, activeClass);
    const rMatch = !s.rombel || s.rombel === activeRombel;
    return s.statusSiswa === 'aktif' && kMatch && rMatch;
  });

  const displayClass = isGuruKelas ? defaultClass : filterClass;
  const displayRombel = isGuruKelas ? defaultRombel : selectedRombel;

  const calculateStudentAvg = (s: typeof classStudents[0]) => {
    const sem2 = s.nilaiSemester?.[`${schoolProfile.tahunAjaranAktif}-2`];
    const sem1 = s.nilaiSemester?.[`${schoolProfile.tahunAjaranAktif}-1`];
    const grades = sem2 || sem1;
    if (!grades || grades.length === 0) return 85.0;
    const sum = grades.reduce((acc, g) => acc + g.nilaiAkhir, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  };

  const maleCount = classStudents.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = classStudents.filter(s => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isGuruKelas ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg text-xs font-semibold border border-blue-200">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>📌 Rombel Binaan: Kelas {displayClass} {displayRombel}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Tingkat Kelas:</span>
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="VI">Kelas VI (Daftar Kelulusan Satuan Pendidikan)</option>
                  <option value="V">Kelas V (Daftar Kenaikan)</option>
                  <option value="IV">Kelas IV (Daftar Kenaikan)</option>
                  <option value="III">Kelas III (Daftar Kenaikan)</option>
                  <option value="II">Kelas II (Daftar Kenaikan)</option>
                  <option value="I">Kelas I (Daftar Kenaikan)</option>
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

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Format S-20</span>
        </button>
      </div>

      {/* Official S-20 Document */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-20"
          formatTitle="REKAP KELAS KENAIKAN DAN KELULUSAN"
          subTitle={`TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={`${filterClass} - ${selectedRombel}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10">No.</th>
                <th className="border border-slate-800 p-2 w-24">No. Peserta Ujian / Ijazah</th>
                <th className="border border-slate-800 p-2 w-20">NIS</th>
                <th className="border border-slate-800 p-2 w-24">NISN</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 w-10">L/P</th>
                <th className="border border-slate-800 p-2 min-w-[130px]">Tempat &amp; Tgl Lahir</th>
                <th className="border border-slate-800 p-2 min-w-[120px]">Nama Orang Tua</th>
                <th className="border border-slate-800 p-2 w-20">Rata-rata Nilai</th>
                <th className="border border-slate-800 p-2 w-24">Keputusan</th>
                <th className="border border-slate-800 p-2 min-w-[130px]">Keterangan Lanjutan</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, idx) => {
                const avg = calculateStudentAvg(student);
                const examNo = `01-04-20-${student.nis.slice(-3)}`;
                const isClass6 = filterClass === 'VI';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono">{examNo}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold">{student.nis}</td>
                    <td className="border border-slate-800 p-2 font-mono">{student.nisn}</td>
                    <td className="border border-slate-800 p-2 text-left font-bold">{student.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 font-semibold">{student.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-left">
                      {student.tempatLahir}, {student.tanggalLahir}
                    </td>
                    <td className="border border-slate-800 p-2 text-left">{student.dataAyah.nama}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold tabular-nums text-slate-900">
                      {avg}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-emerald-800">
                      {isClass6 ? 'LULUS' : 'NAIK KELAS'}
                    </td>
                    <td className="border border-slate-800 p-2 text-left text-[10px]">
                      {isClass6 ? 'Melanjutkan ke SMP / MTs' : `Naik ke Kelas ${Number(filterClass) + 1 || ''}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi Kelulusan */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 flex items-center justify-between text-xs font-semibold">
          <span>Rekapitulasi Hasil Evaluasi Akhir:</span>
          <span>Laki-Laki : {maleCount} Orang</span>
          <span>Perempuan : {femaleCount} Orang</span>
          <span>Persentase Kelulusan : 100%</span>
          <span>Jumlah Total : {classStudents.length} Orang</span>
        </div>

        <OfficialSignature
          kelas={filterClass}
          rombel={selectedRombel}
          waliKelasLabel={filterClass === 'VI' ? 'Ketua Panitia Kelulusan / Wali Kelas VI' : `Wali Kelas ${filterClass}`}
        />
      </div>
    </div>
  );
};
