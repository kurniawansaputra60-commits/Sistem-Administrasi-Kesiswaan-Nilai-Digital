import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { isKelasMatch, toRomanClass } from '../../utils/classUtils';
import { Printer, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';
import { StudentMutationRecord } from '../../types';

export const FormatS14_SemesterMutation: React.FC = () => {
  const { schoolProfile, students, mutations, addMutation, deleteMutation } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>(schoolProfile.semesterAktif);
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveClass = isGuruKelas ? toRomanClass(userProfile?.kelasTugas) : null;
  const effectiveRombel = isGuruKelas ? (userProfile?.rombelTugas || 'A') : selectedRombel;

  // Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newJK, setNewJK] = useState<'L' | 'P'>('L');
  const [newJenis, setNewJenis] = useState<'MASUK' | 'KELUAR'>('KELUAR');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newKelas, setNewKelas] = useState(isGuruKelas ? (effectiveClass || 'I') : 'I');
  const [newRombel, setNewRombel] = useState(isGuruKelas ? (effectiveRombel || 'A') : 'A');
  const [newSekolah, setNewSekolah] = useState('');
  const [newAlasan, setNewAlasan] = useState('');
  const [newNoSurat, setNewNoSurat] = useState(`421.2/${Math.floor(100 + Math.random() * 900)}/SDN-PC/${new Date().getFullYear()}`);

  const semesterMutations = mutations.filter(m => {
    const sMatch = m.semester === selectedSemester;
    const kMatch = !isGuruKelas || isKelasMatch(m.kelas, effectiveClass!);
    const rMatch = !isGuruKelas
      ? (selectedRombel === 'ALL' || !m.rombel || m.rombel === selectedRombel)
      : (!m.rombel || m.rombel === effectiveRombel);
    return sMatch && kMatch && rMatch;
  });
  const mutasiMasuk = semesterMutations.filter(m => m.jenisMutasi === 'MASUK');
  const mutasiKeluar = semesterMutations.filter(m => m.jenisMutasi === 'KELUAR');

  // Rekapitulasi angka
  const activeStudents = students.filter(s => {
    if (s.statusSiswa !== 'aktif') return false;
    const kMatch = !isGuruKelas || isKelasMatch(s.kelasSekarang, effectiveClass!);
    const rMatch = !isGuruKelas
      ? (selectedRombel === 'ALL' || !s.rombel || s.rombel === selectedRombel)
      : (!s.rombel || s.rombel === effectiveRombel);
    return kMatch && rMatch;
  });
  const totalL = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const totalP = activeStudents.filter(s => s.jenisKelamin === 'P').length;

  const masukL = mutasiMasuk.filter(m => m.jenisKelamin === 'L').length;
  const masukP = mutasiMasuk.filter(m => m.jenisKelamin === 'P').length;

  const keluarL = mutasiKeluar.filter(m => m.jenisKelamin === 'L').length;
  const keluarP = mutasiKeluar.filter(m => m.jenisKelamin === 'P').length;

  const awalL = totalL - masukL + keluarL;
  const awalP = totalP - masukP + keluarP;

  const handleAddMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    addMutation({
      studentId: `stu-mut-${Date.now()}`,
      studentName: newStudentName,
      nis: newNis || '2025099',
      jenisKelamin: newJK,
      jenisMutasi: newJenis,
      tanggalMutasi: newDate,
      kelas: newKelas,
      rombel: newRombel,
      semester: selectedSemester,
      sekolahAsalTujuan: newSekolah,
      alasanMutasi: newAlasan,
      nomorSurat: newNoSurat,
    });

    setShowAddModal(false);
    setNewStudentName('');
    setNewNis('');
    setNewSekolah('');
    setNewAlasan('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Pilih Semester:</span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              <button
                onClick={() => setSelectedSemester('1')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  selectedSemester === '1'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester 1 (Ganjil)
              </button>
              <button
                onClick={() => setSelectedSemester('2')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  selectedSemester === '2'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester 2 (Genap)
              </button>
            </div>
          </div>

          {/* Filter Rombel: HANYA tampil untuk Admin / Kepsek. Terkunci untuk Guru Kelas */}
          {!isGuruKelas ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Rombel:</span>
              <select
                value={selectedRombel}
                onChange={e => setSelectedRombel(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white font-semibold text-slate-800"
              >
                <option value="ALL">Semua Rombel</option>
                <option value="A">Rombel A</option>
                <option value="B">Rombel B</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>Rombel Binaan: Kelas {effectiveClass} {effectiveRombel}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Mutasi Masuk/Keluar
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Buku Mutasi (S-14)
          </button>
        </div>
      </div>

      {/* Sheet Printable */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        <OfficialKop
          formatCode="Format S-14"
          title="BUKU MUTASI SISWA SEMESTERAN"
          subtitle={`LAPORAN MUTASI KELUAR DAN MASUK PESERTA DIDIK SEMESTER ${selectedSemester} TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        {/* Tabel 1: Mutasi Masuk */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-300 pb-1">
            <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
            <span>A. DAFTAR SISWA MASUK (PINDAHAN MASUK)</span>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-24">Tanggal Masuk</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS Baru</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-10">L/P</th>
                <th className="border border-slate-800 p-2 text-center w-14">Kelas</th>
                <th className="border border-slate-800 p-2 text-left min-w-[160px]">Sekolah Asal Siswa</th>
                <th className="border border-slate-800 p-2 text-left min-w-[140px]">Alasan Masuk / Pindah</th>
                <th className="border border-slate-800 p-2 text-center min-w-[130px]">No. Surat Keterangan</th>
                <th className="border border-slate-800 p-2 text-center w-12 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mutasiMasuk.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-slate-800 p-4 text-center text-slate-500 italic">
                    Tidak ada catatan siswa masuk pada semester ini.
                  </td>
                </tr>
              ) : (
                mutasiMasuk.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{m.tanggalMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-center text-emerald-950">{m.nis}</td>
                    <td className="border border-slate-800 p-2 font-bold">{m.studentName}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{m.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-center font-semibold">Kelas {m.kelas}</td>
                    <td className="border border-slate-800 p-2">{m.sekolahAsalTujuan}</td>
                    <td className="border border-slate-800 p-2">{m.alasanMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-[10px]">{m.nomorSurat}</td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      <button
                        onClick={() => deleteMutation(m.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tabel 2: Mutasi Keluar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-300 pb-1">
            <ArrowUpRight className="w-4 h-4 text-rose-700" />
            <span>B. DAFTAR SISWA KELUAR (PINDAHAN KELUAR)</span>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-800 p-2 text-center w-8">No</th>
                <th className="border border-slate-800 p-2 text-center w-24">Tanggal Keluar</th>
                <th className="border border-slate-800 p-2 text-center w-20">NIS</th>
                <th className="border border-slate-800 p-2 text-left min-w-[150px]">Nama Lengkap Siswa</th>
                <th className="border border-slate-800 p-2 text-center w-10">L/P</th>
                <th className="border border-slate-800 p-2 text-center w-14">Kelas</th>
                <th className="border border-slate-800 p-2 text-left min-w-[160px]">Sekolah Tujuan</th>
                <th className="border border-slate-800 p-2 text-left min-w-[140px]">Alasan Pindah Keluar</th>
                <th className="border border-slate-800 p-2 text-center min-w-[130px]">No. Surat Mutasi Keluar</th>
                <th className="border border-slate-800 p-2 text-center w-12 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mutasiKeluar.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-slate-800 p-4 text-center text-slate-500 italic">
                    Tidak ada catatan siswa keluar pada semester ini.
                  </td>
                </tr>
              ) : (
                mutasiKeluar.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{m.tanggalMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold text-center text-slate-800">{m.nis}</td>
                    <td className="border border-slate-800 p-2 font-bold">{m.studentName}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{m.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2 text-center font-semibold">Kelas {m.kelas}</td>
                    <td className="border border-slate-800 p-2">{m.sekolahAsalTujuan}</td>
                    <td className="border border-slate-800 p-2">{m.alasanMutasi}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center text-[10px]">{m.nomorSurat}</td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      <button
                        onClick={() => deleteMutation(m.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tabel 3: Rekapitulasi Statistik Jumlah Siswa */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-300 pb-1">
            C. REKAPITULASI KEADAAN SISWA SEMESTER INI
          </div>

          <table className="w-full text-xs border-collapse border border-slate-800 max-w-xl">
            <thead>
              <tr className="bg-slate-100 text-center">
                <th className="border border-slate-800 p-2 text-left">Uraian Status Siswa</th>
                <th className="border border-slate-800 p-2 w-20">Laki-laki (L)</th>
                <th className="border border-slate-800 p-2 w-24">Perempuan (P)</th>
                <th className="border border-slate-800 p-2 w-24">Jumlah (L+P)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-800 p-2">1. Keadaan Siswa Awal Semester</td>
                <td className="border border-slate-800 p-2 text-center font-mono">{awalL}</td>
                <td className="border border-slate-800 p-2 text-center font-mono">{awalP}</td>
                <td className="border border-slate-800 p-2 text-center font-mono font-bold">{awalL + awalP}</td>
              </tr>
              <tr>
                <td className="border border-slate-800 p-2 text-emerald-900 font-medium">2. Siswa Masuk (Pindahan)</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-emerald-900">+{masukL}</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-emerald-900">+{masukP}</td>
                <td className="border border-slate-800 p-2 text-center font-mono font-bold text-emerald-900">+{masukL + masukP}</td>
              </tr>
              <tr>
                <td className="border border-slate-800 p-2 text-rose-900 font-medium">3. Siswa Keluar (Mutasi)</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-rose-900">-{keluarL}</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-rose-900">-{keluarP}</td>
                <td className="border border-slate-800 p-2 text-center font-mono font-bold text-rose-900">-{keluarL + keluarP}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-800 p-2">4. Keadaan Siswa Akhir Semester Ini</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-emerald-950">{totalL}</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-emerald-950">{totalP}</td>
                <td className="border border-slate-800 p-2 text-center font-mono text-emerald-950 font-bold">{totalL + totalP}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <OfficialSignature
          rightTitle="Kepala Sekolah"
          rightName={schoolProfile.namaKepalaSekolah}
          rightNip={schoolProfile.nipKepalaSekolah}
          leftTitle={isGuruKelas ? `Wali Kelas ${effectiveClass} ${effectiveRombel}` : "Petugas Mutasi Kesiswaan"}
          leftName={isGuruKelas && userProfile?.displayName ? userProfile.displayName : schoolProfile.namaPetugasAdmin}
          leftNip={isGuruKelas && userProfile?.nip ? userProfile.nip : schoolProfile.nipPetugasAdmin}
          city={schoolProfile.kabupatenKota}
          date="20 Juli 2026"
        />
      </div>

      {/* Add Mutation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Tambah Catatan Mutasi Siswa</span>
              {isGuruKelas && (
                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-700" />
                  <span>Rombel Binaan: {effectiveClass} {effectiveRombel}</span>
                </span>
              )}
            </h3>

            <form onSubmit={handleAddMutation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jenis Mutasi:</label>
                  <select
                    value={newJenis}
                    onChange={e => setNewJenis(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    <option value="KELUAR">Mutasi KELUAR (Pindah Keluar)</option>
                    <option value="MASUK">Mutasi MASUK (Pindahan Masuk)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Mutasi:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">NIS:</label>
                  <input
                    type="text"
                    placeholder="2025xxx"
                    value={newNis}
                    onChange={e => setNewNis(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">L/P:</label>
                  <select
                    value={newJK}
                    onChange={e => setNewJK(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    <option value="L">L</option>
                    <option value="P">P</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kelas:</label>
                  {isGuruKelas ? (
                    <input
                      type="text"
                      value={`Kelas ${effectiveClass}`}
                      disabled
                      className="w-full border border-slate-200 bg-slate-100 rounded p-1.5 font-bold text-slate-700 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={newKelas}
                      onChange={e => setNewKelas(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5"
                    >
                      {['I', 'II', 'III', 'IV', 'V', 'VI'].map(k => (
                        <option key={k} value={k}>Kelas {k}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Rombel:</label>
                  {isGuruKelas ? (
                    <input
                      type="text"
                      value={`Rombel ${effectiveRombel}`}
                      disabled
                      className="w-full border border-slate-200 bg-slate-100 rounded p-1.5 font-bold text-slate-700 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={newRombel}
                      onChange={e => setNewRombel(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 font-bold"
                    >
                      <option value="A">Rombel A</option>
                      <option value="B">Rombel B</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {newJenis === 'MASUK' ? 'Sekolah Asal:' : 'Sekolah Tujuan:'}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SD Negeri 01 Menteng Jakarta Pusat"
                  value={newSekolah}
                  onChange={e => setNewSekolah(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Alasan Pindah:</label>
                <input
                  type="text"
                  placeholder="Contoh: Mengikuti perpindahan tempat kerja orang tua"
                  value={newAlasan}
                  onChange={e => setNewAlasan(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor Surat Dinas:</label>
                <input
                  type="text"
                  value={newNoSurat}
                  onChange={e => setNewNoSurat(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-medium rounded hover:bg-emerald-800 cursor-pointer"
                >
                  Simpan Catatan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
