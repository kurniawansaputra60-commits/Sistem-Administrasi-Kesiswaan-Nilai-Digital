import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { isKelasMatch, toRomanClass, formatPlaceAndBirthDate, normalizeKelas } from '../../utils/classUtils';
import { Printer, CreditCard, Lock } from 'lucide-react';

export const FormatS16_ExamCard: React.FC = () => {
  const { students, schoolProfile, examCandidates } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedExamCategory, setSelectedExamCategory] = useState<'ASAS' | 'ASAT' | 'ASAJ'>('ASAS');
  const [selectedClass, setSelectedClass] = useState<string>('VI');
  const [selectedRombel, setSelectedRombel] = useState<string>('A');

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : selectedClass;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  const getExamCategoryFullName = (category: 'ASAS' | 'ASAT' | 'ASAJ') => {
    switch (category) {
      case 'ASAS':
        return 'ASESMEN SUMATIF AKHIR SEMESTER (ASAS)';
      case 'ASAT':
        return 'ASESMEN SUMATIF AKHIR TAHUN (ASAT)';
      case 'ASAJ':
        return 'ASESMEN SUMATIF AKHIR JENJANG (ASAJ)';
      default:
        return 'ASESMEN SUMATIF AKHIR SEMESTER (ASAS)';
    }
  };

  // Filter kandidat sesuai rombel binaan bila Guru Kelas atau filter kelas
  const scopedCandidates = examCandidates.filter(c => {
    const kMatch = isKelasMatch(c.kelas, effectiveClass);
    if (!kMatch) return false;
    const st = students.find(s => s.id === c.studentId);
    return !st || !st.rombel || st.rombel === effectiveRombel;
  });

  // Jika belum ada kandidat terdaftar di context untuk kelas tersebut, ambil siswa aktif kelas sebagai fallback
  const fallbackStudents = students.filter(
    s => isKelasMatch(s.kelasSekarang, effectiveClass) && s.statusSiswa !== 'calon' && (!s.rombel || s.rombel === effectiveRombel)
  );

  const displayCandidates = scopedCandidates.length > 0 ? scopedCandidates : fallbackStudents.map((st, idx) => ({
    id: `cand-${st.id}`,
    studentId: st.id,
    nomorPesertaUjian: `01-04-20-${String(idx + 1).padStart(3, '0')}-8`,
    nis: st.nis,
    nisn: st.nisn,
    namaLengkap: st.namaLengkap,
    jenisKelamin: st.jenisKelamin,
    tempatTanggalLahir: formatPlaceAndBirthDate(st.tempatLahir, st.tanggalLahir),
    kelas: effectiveClass,
    syaratNilai: 'Lengkap',
    syaratPresensi: 'Memenuhi (>=85%)',
    statusVerifikasi: 'Memenuhi Syarat',
    keterangan: 'Terverifikasi Berhak Mengikuti Ujian',
  }));

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    displayCandidates[0]?.studentId || students[0]?.id || ''
  );
  const [printAllMode, setPrintAllMode] = useState(false);

  const activeCandidate = displayCandidates.find(c => c.studentId === selectedStudentId) || displayCandidates[0];
  const activeStudent = students.find(s => s.id === (activeCandidate ? activeCandidate.studentId : selectedStudentId)) || students[0];

  const getExamSchedules = (cls?: string) => {
    const normClass = normalizeKelas(cls);
    const isClass1Or2 = normClass === '1' || normClass === '2';
    if (isClass1Or2) {
      // Total 9 Mata Pelajaran untuk Kelas 1 & 2
      return [
        { hariTanggal: 'Senin, 18 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Pendidikan Agama & Budi Pekerti' },
        { hariTanggal: 'Senin, 18 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Pendidikan Pancasila (PPKn)' },
        { hariTanggal: 'Selasa, 19 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Bahasa Indonesia' },
        { hariTanggal: 'Selasa, 19 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Matematika' },
        { hariTanggal: 'Rabu, 20 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)' },
        { hariTanggal: 'Kamis, 21 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Bahasa Inggris' },
        { hariTanggal: 'Kamis, 21 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Bahasa Sunda (Muatan Lokal)' },
        { hariTanggal: 'Jumat, 22 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Seni Budaya & Prakarya (SBdP)' },
        { hariTanggal: 'Jumat, 22 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Kokurikuler / Projek P5' },
      ];
    }

    // Total 10 Mata Pelajaran untuk Kelas 3, 4, 5, 6
    return [
      { hariTanggal: 'Senin, 18 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Pendidikan Agama & Budi Pekerti' },
      { hariTanggal: 'Senin, 18 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Pendidikan Pancasila (PPKn)' },
      { hariTanggal: 'Selasa, 19 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Bahasa Indonesia' },
      { hariTanggal: 'Selasa, 19 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Matematika' },
      { hariTanggal: 'Rabu, 20 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Ilmu Pengetahuan Alam & Sosial (IPAS)' },
      { hariTanggal: 'Rabu, 20 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Seni Budaya & Prakarya (SBdP)' },
      { hariTanggal: 'Kamis, 21 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)' },
      { hariTanggal: 'Kamis, 21 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Bahasa Inggris' },
      { hariTanggal: 'Jumat, 22 Mei 2026', waktu: '07.30 - 09.00 WIB', mapel: 'Bahasa Sunda (Muatan Lokal)' },
      { hariTanggal: 'Jumat, 22 Mei 2026', waktu: '09.30 - 11.00 WIB', mapel: 'Kokurikuler / Projek P5' },
    ];
  };

  const renderSingleCard = (cand: typeof displayCandidates[0], st: typeof activeStudent, index: number) => {
    const rawClass = st ? st.kelasSekarang : (cand?.kelas || effectiveClass);
    const romanClass = toRomanClass(rawClass);
    const studentRombel = st?.rombel || effectiveRombel;

    const examSchedules = getExamSchedules(rawClass);
    let lastDate = '';

    const bannerUrl = schoolProfile.kopBannerUrl || '/assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png';
    const useBanner = schoolProfile.useBannerKop !== false && !!bannerUrl;

    return (
      <div
        key={cand ? cand.id : index}
        className="border-2 border-slate-900 p-5 rounded-lg bg-white relative max-w-xl mx-auto break-inside-avoid mb-6 shadow-xs text-xs"
      >
        {/* Format Tag */}
        <div className="flex justify-end mb-1">
          <span className="text-[9px] font-bold border border-slate-900 px-1.5 py-0.2 uppercase bg-white">
            Format : S-16
          </span>
        </div>

        {/* Official Kop Sekolah */}
        {useBanner ? (
          <div className="w-full text-center pb-2 border-b-2 border-slate-900 mb-3">
            <img
              src={bannerUrl}
              alt="Kop Surat Resmi Sekolah"
              className="w-full max-h-24 object-contain mx-auto block"
            />
          </div>
        ) : (
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-center justify-between gap-3 text-slate-900">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {schoolProfile.logoDaerahUrl ? (
                  <img src={schoolProfile.logoDaerahUrl} alt="Logo Pemda" className="max-h-14 max-w-14 object-contain" />
                ) : (
                  <div className="w-12 h-12 border border-slate-700 flex items-center justify-center text-[7px] font-bold uppercase rounded">
                    LEBAK
                  </div>
                )}
              </div>

              <div className="flex-1 text-center leading-tight">
                <h4 className="text-[10px] font-bold text-slate-700 uppercase">
                  {schoolProfile.pemerintahDaerah || `PEMERINTAH KABUPATEN ${schoolProfile.kabupatenKota.toUpperCase()}`}
                </h4>
                <h3 className="text-[10px] font-bold text-slate-800 uppercase">
                  {schoolProfile.dinasPendidikan || 'DINAS PENDIDIKAN'}
                </h3>
                <h2 className="text-xs font-black text-slate-950 uppercase mt-0.5">
                  {schoolProfile.namaSekolah}
                </h2>
                <p className="text-[9px] text-slate-600">
                  {schoolProfile.alamat} Kodepos: {schoolProfile.kodePos}
                </p>
                <p className="text-[8px] text-slate-500 font-mono">
                  NPSN: {schoolProfile.npsn} | NSS: {schoolProfile.nss}
                </p>
              </div>

              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {schoolProfile.logoSekolahUrl ? (
                  <img src={schoolProfile.logoSekolahUrl} alt="Logo Sekolah" className="max-h-14 max-w-14 object-contain" />
                ) : (
                  <div className="w-12 h-12 border border-amber-700 bg-amber-50 flex items-center justify-center text-[7px] font-bold text-amber-900 uppercase rounded">
                    SDN 1
                  </div>
                )}
              </div>
            </div>
            <div className="border-b-[2px] border-slate-950 mt-1.5"></div>
          </div>
        )}

        {/* Tanda Peserta Ujian dengan ENTER untuk Kategori Ujian */}
        <div className="text-center font-bold text-xs sm:text-sm tracking-wider uppercase mb-3">
          <div className="underline decoration-slate-900 decoration-1 underline-offset-4">
            TANDA PESERTA UJIAN
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">
            {getExamCategoryFullName(selectedExamCategory)}
          </div>
        </div>

        {/* Identity & Pas Foto Frame */}
        <div className="grid grid-cols-4 gap-4 mb-4 items-center">
          <div className="col-span-3 space-y-1.5 text-xs">
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 text-slate-700 font-medium">Nomor Peserta</span>
              <span className="col-span-8 font-mono font-bold text-slate-950">
                : {cand ? cand.nomorPesertaUjian : '01-04-20-001-8'}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 text-slate-700 font-medium">Nama Siswa</span>
              <span className="col-span-8 font-bold text-slate-950">
                : {st ? st.namaLengkap : '-'}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 text-slate-700 font-medium">NIS / NISN</span>
              <span className="col-span-8 font-mono text-slate-900">
                : {st ? `${st.nis} / ${st.nisn}` : '-'}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 text-slate-700 font-medium">Tempat, Tgl Lahir</span>
              <span className="col-span-8 text-slate-900">
                : {st ? formatPlaceAndBirthDate(st.tempatLahir, st.tanggalLahir) : '-'}
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 text-slate-700 font-medium">Kelas / Sesi</span>
              <span className="col-span-8 font-semibold text-slate-900">
                : Kelas {romanClass} {studentRombel} / Sesi 1 (Pagi)
              </span>
            </div>
          </div>

          {/* Pas Foto: Muncul langsung jika siswa memiliki foto di buku induk */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {st?.fotoUrl ? (
              <div className="w-20 h-24 border border-slate-900 rounded overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
                <img
                  src={st.fotoUrl}
                  alt={st.namaLengkap}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-24 border-2 border-dashed border-slate-400 bg-slate-50 rounded flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold p-1 text-center">
                <span>PAS FOTO</span>
                <span>3 x 4</span>
                <span className="text-[8px] font-normal text-slate-400 mt-1">Cap Sekolah</span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="mb-4">
          <div className="text-[11px] font-bold text-slate-800 mb-1">
            JADWAL &amp; PARAF PENGAWAS ({examSchedules.length} MATA PELAJARAN):
          </div>
          <table className="w-full text-[10px] border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-100 text-center">
                <th className="border border-slate-800 p-1 w-6">No</th>
                <th className="border border-slate-800 p-1 text-left w-28">Hari, Tanggal</th>
                <th className="border border-slate-800 p-1 text-left">Mata Pelajaran</th>
                <th className="border border-slate-800 p-1 w-24">Waktu</th>
                <th className="border border-slate-800 p-1 w-16">Paraf</th>
              </tr>
            </thead>
            <tbody>
              {examSchedules.map((sch, i) => {
                const isFirstOfDate = sch.hariTanggal !== lastDate;
                let dateSpan = 1;
                if (isFirstOfDate) {
                  lastDate = sch.hariTanggal;
                  dateSpan = examSchedules.filter(s => s.hariTanggal === sch.hariTanggal).length;
                }

                return (
                  <tr key={i}>
                    <td className="border border-slate-800 p-1 text-center font-mono">{i + 1}</td>
                    {isFirstOfDate && (
                      <td
                        rowSpan={dateSpan}
                        className="border border-slate-800 p-1 font-semibold text-center align-middle bg-slate-50/50"
                      >
                        {sch.hariTanggal}
                      </td>
                    )}
                    <td className="border border-slate-800 p-1 font-semibold">{sch.mapel}</td>
                    <td className="border border-slate-800 p-1 text-center font-mono">{sch.waktu}</td>
                    <td className="border border-slate-800 p-1 text-center text-slate-300">...</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card Footer Signature */}
        <div className="flex justify-between items-end pt-2 text-[10px]">
          <div className="text-slate-500 italic max-w-[240px]">
            Catatan: Wajib dibawa setiap sesi ujian. Tidak boleh dilipat atau dicoret-coret.
          </div>
          <div className="text-center min-w-[160px]">
            <div>{schoolProfile.kabupatenKota}, 15 Mei 2026</div>
            <div className="font-semibold">Kepala Sekolah,</div>
            <div className="h-10 flex items-center justify-center my-1">
              {schoolProfile.kepalaSekolahTtdUrl ? (
                <img
                  src={schoolProfile.kepalaSekolahTtdUrl}
                  alt="TTD Kepala Sekolah"
                  className="max-h-10 max-w-[120px] object-contain"
                />
              ) : (
                <div className="h-10"></div>
              )}
            </div>
            <div className="font-bold underline">{schoolProfile.namaKepalaSekolah}</div>
            <div className="font-mono text-[9px]">NIP. {schoolProfile.nipKepalaSekolah}</div>
          </div>
        </div>
      </div>
    );
  };

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
              <option value="ASAS">ASESMEN SUMATIF AKHIR SEMESTER (ASAS)</option>
              <option value="ASAT">ASESMEN SUMATIF AKHIR TAHUN (ASAT)</option>
              <option value="ASAJ">ASESMEN SUMATIF AKHIR JENJANG (ASAJ)</option>
            </select>
          </div>

          {isGuruKelas ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900">
              <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Tingkat Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value);
                  }}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900 bg-white"
                >
                  <option value="VI">Kelas VI</option>
                  <option value="V">Kelas V</option>
                  <option value="IV">Kelas IV</option>
                  <option value="III">Kelas III</option>
                  <option value="II">Kelas II</option>
                  <option value="I">Kelas I</option>
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
            <span className="text-xs font-semibold text-slate-700">Pilih Peserta:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white font-medium min-w-[240px]"
            >
              {displayCandidates.map(c => (
                <option key={c.studentId} value={c.studentId}>
                  {c.nomorPesertaUjian} - {c.namaLengkap} ({c.kelas})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={printAllMode}
              onChange={e => setPrintAllMode(e.target.checked)}
              className="rounded text-emerald-700"
            />
            <span className="font-medium">Mode Cetak Semua Kartu Peserta Rombel Binaan</span>
          </label>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Kartu Peserta (S-16)
        </button>
      </div>

      {/* Sheet Printable */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs print:bg-white print:p-0 print:border-none print:shadow-none">
        <div className="no-print text-center text-xs font-semibold text-slate-500 mb-4 flex items-center justify-center gap-1.5">
          <CreditCard className="w-4 h-4 text-emerald-700" />
          Pratinjau Kartu Peserta Ujian {selectedExamCategory} Siap Cetak
        </div>

        {printAllMode ? (
          <div className="space-y-6">
            {displayCandidates.map((c, idx) => {
              const st = students.find(s => s.id === c.studentId) || activeStudent;
              return renderSingleCard(c, st, idx);
            })}
          </div>
        ) : (
          renderSingleCard(activeCandidate, activeStudent, 0)
        )}
      </div>
    </div>
  );
};
