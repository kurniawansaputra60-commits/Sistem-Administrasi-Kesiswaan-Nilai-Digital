import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { isKelasMatch, toRomanClass, formatPlaceAndBirthDate } from '../../utils/classUtils';
import { Printer, CheckCircle2, UserCheck, Plus, Lock } from 'lucide-react';

export const FormatS15_ExamCandidates: React.FC = () => {
  const { students, schoolProfile, examCandidates, addExamCandidate } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedClass, setSelectedClass] = useState<string>('VI');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');
  const [selectedExamCategory, setSelectedExamCategory] = useState<'ASAS' | 'ASAT' | 'ASAJ'>('ASAS');

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  // Siswa kelas terpilih yang belum didaftarkan sebagai calon peserta ujian
  const unassignedStudents = students.filter(
    s => isKelasMatch(s.kelasSekarang, effectiveClass) && s.statusSiswa !== 'calon' && (!s.rombel || s.rombel === effectiveRombel) && !examCandidates.some(c => c.studentId === s.id)
  );

  const filteredCandidates = examCandidates.filter(c => {
    const kMatch = isKelasMatch(c.kelas, effectiveClass);
    if (!kMatch) return false;
    if (!isGuruKelas) return true;
    const st = students.find(s => s.id === c.studentId);
    return !st || !st.rombel || st.rombel === effectiveRombel;
  });

  const handleEnrollAll = () => {
    unassignedStudents.forEach((st, idx) => {
      const code = `01-04-20-${String(examCandidates.length + idx + 1).padStart(3, '0')}-8`;
      addExamCandidate({
        studentId: st.id,
        nomorPesertaUjian: code,
        nis: st.nis,
        nisn: st.nisn,
        namaLengkap: st.namaLengkap,
        jenisKelamin: st.jenisKelamin,
        tempatTanggalLahir: formatPlaceAndBirthDate(st.tempatLahir, st.tanggalLahir),
        kelas: st.kelasSekarang,
        syaratNilai: 'Lengkap',
        syaratPresensi: 'Memenuhi (>=85%)',
        statusVerifikasi: 'Memenuhi Syarat',
        keterangan: `Terverifikasi Berhak Mengikuti Ujian ${selectedExamCategory} (DNT Final)`,
      });
    });
  };

  const maleCount = filteredCandidates.filter(c => c.jenisKelamin === 'L').length;
  const femaleCount = filteredCandidates.filter(c => c.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Kategori Ujian:</span>
            <select
              value={selectedExamCategory}
              onChange={e => setSelectedExamCategory(e.target.value as 'ASAS' | 'ASAT' | 'ASAJ')}
              className="text-xs px-3 py-1.5 border border-emerald-300 rounded-md font-bold text-emerald-900 bg-emerald-50/50"
            >
              <option value="ASAS">ASAS (Asesmen Sumatif Akhir Semester - Ganjil)</option>
              <option value="ASAT">ASAT (Asesmen Sumatif Akhir Tahun - Genap)</option>
              <option value="ASAJ">ASAJ (Asesmen Sumatif Akhir Jenjang - Kelas VI)</option>
            </select>
          </div>

          {isGuruKelas ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg text-xs font-semibold border border-blue-200">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>📌 Rombel Binaan: Kelas {effectiveClass} {effectiveRombel}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Tingkat Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="VI">Kelas VI (ASAJ - Asesmen Sumatif Akhir Jenjang)</option>
                  <option value="V">Kelas V (ASAT / ASAS - Asesmen Sumatif Akhir Tahun / Semester)</option>
                  <option value="IV">Kelas IV (ASAT / ASAS - Asesmen Sumatif Akhir Tahun / Semester)</option>
                  <option value="III">Kelas III (ASAT / ASAS - Asesmen Sumatif Akhir Tahun / Semester)</option>
                  <option value="II">Kelas II (ASAT / ASAS - Asesmen Sumatif Akhir Tahun / Semester)</option>
                  <option value="I">Kelas I (ASAT / ASAS - Asesmen Sumatif Akhir Tahun / Semester)</option>
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
          {unassignedStudents.length > 0 && (
            <button
              onClick={handleEnrollAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Daftarkan Semua Siswa Kelas {effectiveClass} ({unassignedStudents.length})</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Format S-15</span>
          </button>
        </div>
      </div>

      {/* Official S-15 Document Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-15"
          formatTitle={`DAFTAR CALON PESERTA UJIAN (${selectedExamCategory})`}
          subTitle={`DAFTAR NOMINASI TETAP (DNT) ${selectedExamCategory} TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          kelas={`${effectiveClass} - ${effectiveRombel}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10">No.</th>
                <th className="border border-slate-800 p-2 w-28">Nomor Peserta Ujian</th>
                <th className="border border-slate-800 p-2 w-20">NIS</th>
                <th className="border border-slate-800 p-2 w-24">NISN</th>
                <th className="border border-slate-800 p-2 min-w-[150px] text-left">Nama Lengkap Peserta Didik</th>
                <th className="border border-slate-800 p-2 w-10">L/P</th>
                <th className="border border-slate-800 p-2 min-w-[140px] text-left">Tempat, Tanggal Lahir</th>
                <th className="border border-slate-800 p-2 w-24">Syarat Nilai</th>
                <th className="border border-slate-800 p-2 w-28">Syarat Presensi</th>
                <th className="border border-slate-800 p-2 w-28">Status Verifikasi</th>
                <th className="border border-slate-800 p-2 min-w-[130px] text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand, idx) => {
                const st = students.find(s => s.id === cand.studentId);
                const ttl = st ? formatPlaceAndBirthDate(st.tempatLahir, st.tanggalLahir) : cand.tempatTanggalLahir;
                return (
                  <tr key={cand.id} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-emerald-900">
                      {cand.nomorPesertaUjian}
                    </td>
                    <td className="border border-slate-800 p-2 font-mono">{cand.nis}</td>
                    <td className="border border-slate-800 p-2 font-mono">{cand.nisn}</td>
                    <td className="border border-slate-800 p-2 text-left font-bold">{cand.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 font-semibold">{cand.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-left">{ttl}</td>
                    <td className="border border-slate-800 p-2 text-emerald-800 font-semibold">{cand.syaratNilai}</td>
                    <td className="border border-slate-800 p-2 text-emerald-800 font-semibold">{cand.syaratPresensi}</td>
                    <td className="border border-slate-800 p-2 font-bold text-emerald-800 bg-emerald-50/50">
                      {cand.statusVerifikasi}
                    </td>
                    <td className="border border-slate-800 p-2 text-left text-[10px]">{cand.keterangan}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 flex items-center justify-between text-xs font-semibold">
          <span>Rekapitulasi Calon Peserta Ujian:</span>
          <span>Laki-Laki : {maleCount} Orang</span>
          <span>Perempuan : {femaleCount} Orang</span>
          <span>Jumlah Total Peserta : {filteredCandidates.length} Orang</span>
        </div>

        <OfficialSignature kelas={effectiveClass} rombel={effectiveRombel} waliKelasLabel={`Wali Kelas ${effectiveClass}`} />
      </div>
    </div>
  );
};
