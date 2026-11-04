import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Save, Check, Award, SlidersHorizontal, UserCheck, Lock } from 'lucide-react';
import { SubjectGrade } from '../../types';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

export const FormatGrades_Management: React.FC = () => {
  const { students, schoolProfile, updateStudentGrades } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('I');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');
  const [defaultKKM, setDefaultKKM] = useState<number>(75);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempGrades, setTempGrades] = useState<SubjectGrade[]>([]);
  const [saveAlert, setSaveAlert] = useState(false);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const semesterKey = `${schoolProfile.tahunAjaranAktif}-${selectedSemester}`;

  const classStudents = students.filter(s => {
    if (s.statusSiswa !== 'aktif' || !isKelasMatch(s.kelasSekarang, effectiveClass)) return false;
    return (s.rombel || 'A') === effectiveRombel;
  });

  // Daftar Mata Pelajaran Resmi SD (Kurikulum Merdeka):
  // IPAS (Ilmu Pengetahuan Alam dan Sosial), Bahasa Sunda (Muatan Lokal), Kokurikuler (P5)
  const defaultSubjectList = [
    { id: 'PAI', name: 'Pendidikan Agama & BP', short: 'PAI' },
    { id: 'PPKN', name: 'Pendidikan Pancasila / PPKn', short: 'PPKN' },
    { id: 'BINDO', name: 'Bahasa Indonesia', short: 'B.IND' },
    { id: 'MTK', name: 'Matematika', short: 'MTK' },
    { id: 'IPAS', name: 'Ilmu Pengetahuan Alam & Sosial (IPAS)', short: 'IPAS' },
    { id: 'SBDP', name: 'Seni Budaya & Prakarya (SBdP)', short: 'SBDP' },
    { id: 'PJOK', name: 'PJOK', short: 'PJOK' },
    { id: 'BING', name: 'Bahasa Inggris', short: 'B.ING' },
    { id: 'BSUNDA', name: 'Bahasa Sunda (Muatan Lokal)', short: 'B.SNDA' },
    { id: 'KOKURIKULER', name: 'Kokurikuler (Projek P5)', short: 'KOKUR' },
  ];

  const getStudentGrades = (student: typeof classStudents[0]): SubjectGrade[] => {
    if (student.nilaiSemester && student.nilaiSemester[semesterKey]) {
      const existing = student.nilaiSemester[semesterKey];
      // Pastikan semua subject baru (IPAS, BSUNDA, KOKURIKULER) terpenuhi jika data lama
      return defaultSubjectList.map(s => {
        const found = existing.find(e => e.subjectId === s.id);
        if (found) return found;

        // Migrasi jika sebelumnya masih ada IPA/IPS
        if (s.id === 'IPAS') {
          const oldIpa = existing.find(e => e.subjectId === 'IPA');
          const oldIps = existing.find(e => e.subjectId === 'IPS');
          const avgScore = oldIpa && oldIps ? Math.round((oldIpa.nilaiAkhir + oldIps.nilaiAkhir) / 2) : 80;
          return {
            subjectId: 'IPAS',
            subjectName: s.name,
            kkm: defaultKKM,
            tugas: avgScore,
            uts: avgScore,
            uas: avgScore,
            nilaiAkhir: avgScore,
            predikat: 'B',
          };
        }

        return {
          subjectId: s.id,
          subjectName: s.name,
          kkm: defaultKKM,
          tugas: 82,
          uts: 80,
          uas: 84,
          nilaiAkhir: 82,
          predikat: 'B',
        };
      });
    }

    // Default fallback grades untuk mata pelajaran baru
    return defaultSubjectList.map(s => ({
      subjectId: s.id,
      subjectName: s.name,
      kkm: defaultKKM,
      tugas: 80,
      uts: 80,
      uas: 82,
      nilaiAkhir: 81,
      predikat: 'B' as const,
    }));
  };

  const calculateAverage = (grades: SubjectGrade[]) => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + g.nilaiAkhir, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  };

  // Rank students by average grade
  const rankedStudents = [...classStudents].map(s => {
    const grades = getStudentGrades(s);
    const avg = calculateAverage(grades);
    return { student: s, grades, avg };
  }).sort((a, b) => b.avg - a.avg);

  const startEdit = (studentId: string, currentGrades: SubjectGrade[]) => {
    setEditingStudentId(studentId);
    setTempGrades(JSON.parse(JSON.stringify(currentGrades)));
  };

  // Handler saat nilai atau KKM diubah secara bebas oleh guru
  const handleGradeChange = (
    idx: number,
    field: 'kkm' | 'tugas' | 'uts' | 'uas',
    value: number
  ) => {
    const updated = [...tempGrades];
    const val = Math.min(100, Math.max(0, value || 0));
    updated[idx][field] = val;

    // Recalculate nilaiAkhir: Tugas 30% + UTS 30% + UAS 40%
    const t = updated[idx].tugas;
    const ut = updated[idx].uts;
    const ua = updated[idx].uas;
    const na = Math.round((t * 0.3 + ut * 0.3 + ua * 0.4) * 10) / 10;
    updated[idx].nilaiAkhir = na;

    // Hitung predikat dinamis berbasis KKM yang diketik
    const kkm = updated[idx].kkm || 75;
    let p: 'A' | 'B' | 'C' | 'D' = 'B';
    if (na >= Math.min(100, kkm + 14)) p = 'A';
    else if (na >= kkm) p = 'B';
    else if (na >= Math.max(0, kkm - 10)) p = 'C';
    else p = 'D';

    updated[idx].predikat = p;
    setTempGrades(updated);
  };

  // Terapkan KKM seragam ke semua mata pelajaran siswa yang sedang diedit
  const handleApplyKKMToAllInModal = (newKKM: number) => {
    const updated = tempGrades.map(g => {
      const kkm = newKKM;
      let p: 'A' | 'B' | 'C' | 'D' = 'B';
      if (g.nilaiAkhir >= Math.min(100, kkm + 14)) p = 'A';
      else if (g.nilaiAkhir >= kkm) p = 'B';
      else if (g.nilaiAkhir >= Math.max(0, kkm - 10)) p = 'C';
      else p = 'D';
      return { ...g, kkm, predikat: p };
    });
    setTempGrades(updated);
  };

  const handleSaveGrades = (studentId: string) => {
    updateStudentGrades(studentId, semesterKey, tempGrades);
    setEditingStudentId(null);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  // Wali kelas aktif untuk kelas & rombel terpilih
  const currentWali = (schoolProfile.waliKelasList || []).find(w => isKelasMatch(w.kelas, effectiveClass) && w.rombel === effectiveRombel)
    || (schoolProfile.waliKelasList || []).find(w => isKelasMatch(w.kelas, effectiveClass))
    || {
      nama: isGuruKelas && userProfile?.displayName ? userProfile.displayName : schoolProfile.namaWaliKelas,
      nip: isGuruKelas && userProfile?.nip ? userProfile.nip : schoolProfile.nipWaliKelas,
      ttdUrl: undefined,
    };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions (Tidak Tercetak) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-xs font-bold text-blue-900 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel} (Terkunci NIP)</span>
            </div>
          ) : (
            <>
              {/* Dropdown Kelas */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Pilih Kelas:</span>
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

              {/* Dropdown Rombel (A & B) */}
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
            <span className="text-xs font-semibold text-slate-700">Semester:</span>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value as '1' | '2')}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>

          {/* Pengaturan KKM Acuan yang bisa diketik */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 border border-slate-200 rounded-md">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">KKM Acuan:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={defaultKKM}
              onChange={e => setDefaultKKM(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded"
              title="KKM bisa diketik langsung sesuai KKM sekolah/kelas"
            />
          </div>

          {/* Info Wali Kelas Terpilih & Status TTD */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-emerald-50/70 px-3 py-1 border border-emerald-200 rounded-md">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wali Kelas {selectedClass} {selectedRombel}: <strong className="text-slate-800">{currentWali.nama}</strong></span>
            {currentWali.ttdUrl && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded ml-1">
                TTD Digital Aktif
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Leger Nilai</span>
        </button>
      </div>

      {saveAlert && (
        <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nilai siswa berhasil disimpan secara permanen ke Buku Induk &amp; database sekolah!</span>
        </div>
      )}

      {/* Official Ledger Nilai Kelas - Dokumen Cetak Bersih */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 print:w-full text-slate-900 text-xs">
        <OfficialKop
          formatCode="LEGER NILAI"
          formatTitle="DAFTAR KUMPULAN NILAI (LEGER) PESERTA DIDIK"
          subTitle={`TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} · SEMESTER ${selectedSemester === '1' ? 'GANJIL' : 'GENAP'}`}
          kelas={`${effectiveClass} - ${effectiveRombel}`}
        />

        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-8" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>NIS</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-1" colSpan={defaultSubjectList.length}>
                  Mata Pelajaran (Nilai Akhir Rapor)
                </th>
                <th className="border border-slate-800 p-2 w-16" rowSpan={2}>Rata-Rata</th>
                <th className="border border-slate-800 p-2 w-14" rowSpan={2}>Ranking</th>
                <th className="border border-slate-800 p-2 w-20 no-print" rowSpan={2}>Kelola Nilai</th>
              </tr>
              <tr className="text-[10px]">
                {defaultSubjectList.map(sub => (
                  <th key={sub.id} className="border border-slate-800 p-1 w-12" title={sub.name}>
                    {sub.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankedStudents.length === 0 ? (
                <tr>
                  <td colSpan={defaultSubjectList.length + 6} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Belum ada data siswa aktif di kelas {selectedClass}.
                  </td>
                </tr>
              ) : (
                rankedStudents.map((item, rankIdx) => {
                  const s = item.student;
                  const grades = item.grades;
                  const avg = item.avg;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 text-center">
                      <td className="border border-slate-800 p-2 font-mono">{rankIdx + 1}</td>
                      <td className="border border-slate-800 p-2 font-mono font-semibold">{s.nis}</td>
                      <td className="border border-slate-800 p-2 text-left font-bold">{s.namaLengkap}</td>
                      <td className="border border-slate-800 p-2 font-semibold">{s.jenisKelamin}</td>

                      {/* Subject final grades */}
                      {defaultSubjectList.map(sub => {
                        const g = grades.find(x => x.subjectId === sub.id);
                        const score = g ? g.nilaiAkhir : 80;
                        const subjectKkm = g ? g.kkm : defaultKKM;
                        const isUnderKkm = score < subjectKkm;

                        return (
                          <td
                            key={sub.id}
                            className={`border border-slate-800 p-1 font-mono tabular-nums ${
                              isUnderKkm ? 'text-rose-700 font-bold bg-rose-50' : 'text-slate-800'
                            }`}
                            title={`KKM: ${subjectKkm}`}
                          >
                            {score}
                          </td>
                        );
                      })}

                      <td className="border border-slate-800 p-2 font-mono font-bold text-emerald-950 bg-slate-50 tabular-nums">
                        {avg}
                      </td>
                      <td className="border border-slate-800 p-2 font-mono font-bold text-slate-800">
                        {rankIdx === 0 ? (
                          <span className="text-amber-800 font-extrabold">🏆 1</span>
                        ) : (
                          rankIdx + 1
                        )}
                      </td>
                      <td className="border border-slate-800 p-1.5 no-print">
                        <button
                          onClick={() => startEdit(s.id, grades)}
                          className="px-2 py-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold cursor-pointer"
                        >
                          Input Nilai
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Signature dengan otomatis lookup Wali Kelas & TTD digital untuk kelas dan rombel ini */}
        <OfficialSignature kelas={selectedClass} rombel={selectedRombel} />
      </div>

      {/* Modal / Dialog Edit Nilai Lengkap Siswa dengan KKM yang Bisa Diketik */}
      {editingStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden text-xs my-6">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Input &amp; Kelola Nilai Digital: {students.find(s => s.id === editingStudentId)?.namaLengkap}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelas {selectedClass} · Semester {selectedSemester === '1' ? 'Ganjil' : 'Genap'} · NIS: {students.find(s => s.id === editingStudentId)?.nis}
                </p>
              </div>
              <button
                onClick={() => setEditingStudentId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4">
              {/* Petunjuk & Quick Set KKM */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-600 font-medium">
                  Kolom <strong>KKM dapat diketik langsung</strong> untuk setiap mata pelajaran secara spesifik.
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">Set Semua KKM ke:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={defaultKKM}
                    id="bulkKKMInput"
                    className="w-14 px-1.5 py-1 text-center font-mono font-bold border border-slate-300 rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('bulkKKMInput') as HTMLInputElement;
                      const val = Number(el?.value) || 75;
                      handleApplyKKMToAllInModal(val);
                    }}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-[11px] cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-center text-slate-800">
                    <tr>
                      <th className="p-2 text-left">Mata Pelajaran</th>
                      <th className="p-2 w-20">KKM (Ketik)</th>
                      <th className="p-2 w-20">Formatif / Tugas (30%)</th>
                      <th className="p-2 w-20">STS (30%)</th>
                      <th className="p-2 w-24">
                        {effectiveClass === 'VI' ? 'ASAJ (40%)' : selectedSemester === '2' ? 'ASAT (40%)' : 'ASAS (40%)'}
                      </th>
                      <th className="p-2 w-20">Nilai Akhir</th>
                      <th className="p-2 w-16">Predikat</th>
                      <th className="p-2 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tempGrades.map((g, idx) => {
                      const isTuntas = g.nilaiAkhir >= (g.kkm || 75);

                      return (
                        <tr key={g.subjectId} className="hover:bg-slate-50 text-center">
                          <td className="p-2 font-medium text-left text-slate-900">
                            {g.subjectName}
                          </td>
                          {/* KKM Editable / Bisa Diketik */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={g.kkm}
                              onChange={e => handleGradeChange(idx, 'kkm', Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-amber-300 bg-amber-50/50 rounded text-center font-mono font-bold text-amber-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              title="Ketik KKM mata pelajaran ini"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={g.tugas}
                              onChange={e => handleGradeChange(idx, 'tugas', Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-mono"
                              title="Nilai Formatif / Tugas Harian"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={g.uts}
                              onChange={e => handleGradeChange(idx, 'uts', Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-mono"
                              title="Nilai Sumatif Tengah Semester (STS)"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={g.uas}
                              onChange={e => handleGradeChange(idx, 'uas', Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-mono"
                              title={`Nilai ${effectiveClass === 'VI' ? 'ASAJ' : selectedSemester === '2' ? 'ASAT' : 'ASAS'}`}
                            />
                          </td>
                          <td className="p-2 font-bold font-mono text-emerald-900 bg-emerald-50/40">
                            {g.nilaiAkhir}
                          </td>
                          <td className="p-2 font-bold">
                            {g.predikat}
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isTuntas ? 'Tuntas' : 'Remidi'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded font-medium hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveGrades(editingStudentId)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Nilai Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
