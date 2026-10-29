import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Trophy, Award, Search, PlusCircle, Edit3, Check, Save, X, BookOpen, SlidersHorizontal, Lock } from 'lucide-react';
import { ExamScoreRecord } from '../../types';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';

interface FormatS17Props {
  onNavigateToLeger?: () => void;
}

export const FormatS17_ExamResults: React.FC<FormatS17Props> = ({ onNavigateToLeger }) => {
  const { schoolProfile, examScores, students, updateExamScore } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('VI');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [kkmAcuan, setKkmAcuan] = useState<number>(75);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  // Edit / Input Score Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<ExamScoreRecord | null>(null);

  // Daftar Mata Pelajaran Resmi (IPAS menggantikan IPA & IPS, ditambah Bahasa Sunda dan Kokurikuler)
  const subjects = [
    { fullName: 'Pendidikan Agama & BP', short: 'PAI' },
    { fullName: 'PPKn', short: 'PPKN' },
    { fullName: 'Bahasa Indonesia', short: 'B.IND' },
    { fullName: 'Matematika', short: 'MTK' },
    { fullName: 'IPAS', short: 'IPAS' },
    { fullName: 'SBdP', short: 'SBDP' },
    { fullName: 'PJOK', short: 'PJOK' },
    { fullName: 'Bahasa Inggris', short: 'B.ING' },
    { fullName: 'Bahasa Sunda', short: 'B.SNDA' },
    { fullName: 'Kokurikuler', short: 'KOKUR' },
  ];

  // Siswa aktif di kelas ini
  const classStudents = students.filter(
    s => s.statusSiswa === 'aktif' && isKelasMatch(s.kelasSekarang, effectiveClass) && (s.rombel || 'A') === effectiveRombel
  );

  // Urutkan berdasarkan peringkat nilai tertinggi
  const sortedScores = [...examScores].sort((a, b) => b.jumlahNilai - a.jumlahNilai);

  const filtered = sortedScores.filter(s => {
    const matchClass = isKelasMatch(s.kelas, effectiveClass);
    const matchRombel = (s.rombel || 'A') === effectiveRombel;
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nomorPeserta.includes(searchQuery) ||
      s.nis.includes(searchQuery);
    return matchClass && matchRombel && matchQuery;
  });

  const handleOpenEdit = (scoreRec: ExamScoreRecord) => {
    setEditingScore(JSON.parse(JSON.stringify(scoreRec)));
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    const existingIds = new Set(examScores.map(e => e.studentId));
    const candidate = classStudents.find(s => !existingIds.has(s.id)) || classStudents[0];

    const initialMapelScores = subjects.map(m => ({ mapel: m.fullName, nilai: 80 }));
    const sum = initialMapelScores.reduce((acc, m) => acc + m.nilai, 0);

    const newRecord: ExamScoreRecord = {
      studentId: candidate ? candidate.id : `stu-${Date.now()}`,
      nomorPeserta: `UAS-${effectiveClass}-${(candidate ? candidate.nis : '001').slice(-3)}`,
      nis: candidate ? candidate.nis : '001',
      namaLengkap: candidate ? candidate.namaLengkap : '',
      jenisKelamin: candidate ? candidate.jenisKelamin : 'L',
      kelas: effectiveClass,
      mapelScores: initialMapelScores,
      jumlahNilai: sum,
      rataRata: Math.round((sum / subjects.length) * 10) / 10,
      ranking: 1,
      prestasi: 'Tuntas & Memuaskan',
    };

    setEditingScore(newRecord);
    setIsModalOpen(true);
  };

  const handleSelectStudentForScore = (studentId: string) => {
    const stu = students.find(s => s.id === studentId);
    if (!stu || !editingScore) return;

    setEditingScore({
      ...editingScore,
      studentId: stu.id,
      nis: stu.nis,
      namaLengkap: stu.namaLengkap,
      jenisKelamin: stu.jenisKelamin,
      nomorPeserta: `UAS-${effectiveClass}-${stu.nis.slice(-3)}`,
    });
  };

  const handleSubjectScoreChange = (mapel: string, val: number) => {
    if (!editingScore) return;
    const clamped = Math.min(100, Math.max(0, val || 0));
    const updatedMapel = editingScore.mapelScores.map(m =>
      m.mapel === mapel ? { ...m, nilai: clamped } : m
    );

    if (!updatedMapel.some(m => m.mapel === mapel)) {
      updatedMapel.push({ mapel, nilai: clamped });
    }

    const sum = updatedMapel.reduce((acc, m) => acc + m.nilai, 0);
    const avg = Math.round((sum / subjects.length) * 10) / 10;

    let autoPrestasi = editingScore.prestasi;
    if (avg >= Math.min(100, kkmAcuan + 15)) autoPrestasi = 'Predikat Istimewa (Nilai Tertinggi)';
    else if (avg >= kkmAcuan + 5) autoPrestasi = 'Tuntas Sangat Baik';
    else if (avg >= kkmAcuan) autoPrestasi = 'Tuntas Memuaskan';
    else autoPrestasi = 'Perlu Remidial / Pendampingan';

    setEditingScore({
      ...editingScore,
      mapelScores: updatedMapel,
      jumlahNilai: sum,
      rataRata: avg,
      prestasi: autoPrestasi,
    });
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScore) return;

    updateExamScore(editingScore);
    setIsModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls - tidak tercetak */}
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
                <span className="text-xs font-semibold text-slate-700">Tingkat Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white font-medium"
                >
                  <option value="I">Kelas I</option>
                  <option value="II">Kelas II</option>
                  <option value="III">Kelas III</option>
                  <option value="IV">Kelas IV</option>
                  <option value="V">Kelas V</option>
                  <option value="VI">Kelas VI (UAS Akhir Jenjang)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Rombel:</span>
                <select
                  value={selectedRombel}
                  onChange={e => setSelectedRombel(e.target.value)}
                  className="text-xs border border-blue-300 rounded-md px-3 py-1.5 bg-blue-50/50 font-bold text-blue-900"
                >
                  <option value="A">Rombel A</option>
                  <option value="B">Rombel B</option>
                </select>
              </div>
            </>
          )}

          {/* KKM Acuan Bisa Diketik */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">KKM:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={kkmAcuan}
              onChange={e => setKkmAcuan(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded"
              title="KKM bisa diketik langsung"
            />
          </div>

          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToLeger && (
            <button
              onClick={onNavigateToLeger}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-md hover:bg-emerald-100 cursor-pointer shadow-xs transition-colors"
              title="Buka Leger Nilai Rapor Semester Lengkap"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Leger Nilai Rapor</span>
            </button>
          )}

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800 cursor-pointer shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Nilai Siswa</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Hasil UAS (S-17)
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nilai UAS peserta berhasil diperbarui dan disimpan secara permanen ke database!</span>
        </div>
      )}

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none print:w-full space-y-4 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format S-17"
          title="DAFTAR PESERTA UAS DAN PRESTASINYA"
          subtitle={`REKAPITULASI HASIL NILAI UJIAN AKHIR SEMESTER (UAS) KELAS ${effectiveClass} ${effectiveRombel} TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={`${effectiveClass} - ${effectiveRombel}`}
        />

        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs border-collapse border border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-800 p-2 w-8" rowSpan={2}>No</th>
                <th className="border border-slate-800 p-2 w-28" rowSpan={2}>No. Peserta Ujian</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>NIS</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-1.5" colSpan={subjects.length}>
                  Nilai Mata Pelajaran UAS (KKM: {kkmAcuan})
                </th>
                <th className="border border-slate-800 p-2 w-16" rowSpan={2}>Jumlah Nilai</th>
                <th className="border border-slate-800 p-2 w-16" rowSpan={2}>Rata-Rata</th>
                <th className="border border-slate-800 p-2 w-12" rowSpan={2}>Rang-king</th>
                <th className="border border-slate-800 p-2 min-w-[140px] text-left" rowSpan={2}>Prestasi / Keterangan</th>
                <th className="border border-slate-800 p-2 w-24 no-print" rowSpan={2}>Aksi</th>
              </tr>
              <tr className="bg-slate-100 text-[10px]">
                {subjects.map((sub, i) => (
                  <th key={i} className="border border-slate-800 p-1 w-12 font-semibold" title={sub.fullName}>
                    {sub.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 7} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Belum ada rekaman nilai UAS untuk kelas {effectiveClass}. Klik tombol <strong>"Input Nilai Siswa"</strong> di atas untuk memasukkan data nilai.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-[11px] font-semibold">
                      {row.nomorPeserta}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-emerald-950">
                      {row.nis}
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-left text-slate-900">{row.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 font-bold">{row.jenisKelamin}</td>

                    {/* Subject scores */}
                    {subjects.map((sub, i) => {
                      const scoreItem = row.mapelScores.find(m => m.mapel === sub.fullName || m.mapel === sub.short);
                      const val = scoreItem ? scoreItem.nilai : 80;
                      const isUnder = typeof val === 'number' && val < kkmAcuan;

                      return (
                        <td key={i} className={`border border-slate-800 p-1 font-mono text-xs ${isUnder ? 'text-rose-700 bg-rose-50 font-bold' : ''}`}>
                          {val}
                        </td>
                      );
                    })}

                    <td className="border border-slate-800 p-2 font-mono font-bold text-slate-900">
                      {row.jumlahNilai}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-extrabold text-emerald-900">
                      {row.rataRata.toFixed(1)}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono font-extrabold">
                      {idx === 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-black">1</span>
                      ) : idx === 1 ? (
                        <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-bold">2</span>
                      ) : idx === 2 ? (
                        <span className="text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-bold">3</span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="border border-slate-800 p-2 text-left text-[10px] font-medium text-slate-700">
                      {row.prestasi}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center no-print">
                      <button
                        onClick={() => handleOpenEdit(row)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-600" />
                        <span>Input/Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <OfficialSignature kelas={effectiveClass} rombel={effectiveRombel} />
      </div>

      {/* Modal Input & Edit Nilai UAS Siswa */}
      {isModalOpen && editingScore && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden text-xs my-8 animate-in fade-in duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Input &amp; Perbarui Nilai UAS Siswa (Format S-17)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-base leading-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScore}>
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Info Siswa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pilih Siswa:
                    </label>
                    <select
                      value={editingScore.studentId}
                      onChange={e => handleSelectStudentForScore(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                    >
                      {classStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.namaLengkap} ({s.nis}) - {s.jenisKelamin}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nomor Peserta Ujian:
                    </label>
                    <input
                      type="text"
                      value={editingScore.nomorPeserta}
                      onChange={e => setEditingScore({ ...editingScore, nomorPeserta: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Tabel Input Nilai Mata Pelajaran */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 text-xs">
                      Nilai Ujian Per Mata Pelajaran (Skala 0 - 100):
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-600 font-medium">KKM Acuan:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={kkmAcuan}
                        onChange={e => setKkmAcuan(Number(e.target.value) || 75)}
                        className="w-12 px-1 py-0.5 border border-slate-300 rounded text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 font-semibold text-slate-700">
                        <tr>
                          <th className="p-2 text-left">No</th>
                          <th className="p-2 text-left">Mata Pelajaran</th>
                          <th className="p-2 text-center w-24">KKM</th>
                          <th className="p-2 text-center w-32">Nilai UAS</th>
                          <th className="p-2 text-center w-28">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {subjects.map((sub, idx) => {
                          const currentScore = editingScore.mapelScores.find(m => m.mapel === sub.fullName || m.mapel === sub.short)?.nilai ?? 80;
                          const isTuntas = currentScore >= kkmAcuan;

                          return (
                            <tr key={sub.fullName} className="hover:bg-slate-50">
                              <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{sub.fullName}</td>
                              <td className="p-2 text-center font-mono text-slate-600">{kkmAcuan}</td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentScore}
                                  onChange={e => handleSubjectScoreChange(sub.fullName, Number(e.target.value))}
                                  className="w-20 px-2 py-1 text-center font-mono font-bold text-xs border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </td>
                              <td className="p-2 text-center">
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

                {/* Ringkasan Otomatis: Jumlah & Rata-Rata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200">
                  <div>
                    <span className="block text-[11px] text-emerald-800 font-medium">Jumlah Total Nilai:</span>
                    <span className="text-lg font-bold font-mono text-emerald-950">
                      {editingScore.jumlahNilai}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-emerald-800 font-medium">Nilai Rata-Rata:</span>
                    <span className="text-lg font-bold font-mono text-emerald-950">
                      {editingScore.rataRata.toFixed(1)}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[11px] text-emerald-800 font-medium">Kategori Kelulusan:</span>
                    <span className="text-xs font-bold text-emerald-900">
                      {editingScore.rataRata >= kkmAcuan ? 'Tuntas / Memenuhi Syarat' : 'Perlu Remidial'}
                    </span>
                  </div>
                </div>

                {/* Catatan Prestasi */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catatan Prestasi / Keterangan:
                  </label>
                  <input
                    type="text"
                    value={editingScore.prestasi}
                    onChange={e => setEditingScore({ ...editingScore, prestasi: e.target.value })}
                    placeholder="Contoh: Peringkat 1 / Nilai Tertinggi, Lulus Tuntas Memuaskan..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded font-medium hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Nilai Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
