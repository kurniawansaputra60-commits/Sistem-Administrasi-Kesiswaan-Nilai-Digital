import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { Search, Printer, Edit, Eye, BookOpen, Key, Users } from 'lucide-react';

interface FormatS4Props {
  onEditStudent: (student: Student) => void;
  onOpenAddStudent?: () => void;
}

export const FormatS4_MasterBook: React.FC<FormatS4Props> = ({ onEditStudent, onOpenAddStudent }) => {
  const { students, schoolProfile } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<'buku-induk' | 'pembantu' | 'kunci-induk'>('buku-induk');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterRombel, setFilterRombel] = useState<string>('ALL');

  const filteredStudents = students.filter(s => {
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    const matchClass = filterClass === 'ALL' || s.kelasSekarang === filterClass;
    const matchRombel = filterRombel === 'ALL' || !s.rombel || s.rombel === filterRombel;
    return matchQuery && matchClass && matchRombel;
  });

  const currentStudent = students.find(s => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  return (
    <div className="space-y-6">
      {/* Subtab Selection (Buku Induk vs Pembantu Induk vs Kunci Induk) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('buku-induk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'buku-induk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Format S-4 Buku Induk Lengkap</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pembantu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'pembantu' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Buku Pembantu Induk</span>
          </button>
          <button
            onClick={() => setActiveSubTab('kunci-induk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'kunci-induk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-700" />
            <span>Kunci Induk Registrasi</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Tampilan Ini</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BUKU INDUK LENGKAP (LEMBAR BUKU INDUK PER SISWA) */}
      {activeSubTab === 'buku-induk' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Student Selector List (Hidden on Print) */}
          <div className="no-print bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[750px]">
            <div className="mb-3 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                >
                  <option value="ALL">Semua Kelas</option>
                  <option value="I">Kelas I</option>
                  <option value="II">Kelas II</option>
                  <option value="III">Kelas III</option>
                  <option value="IV">Kelas IV</option>
                  <option value="V">Kelas V</option>
                  <option value="VI">Kelas VI</option>
                </select>
                <select
                  value={filterRombel}
                  onChange={e => setFilterRombel(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                >
                  <option value="ALL">Semua Rombel</option>
                  <option value="A">Rombel A</option>
                  <option value="B">Rombel B</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const isSelected = student.id === currentStudent?.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {student.namaLengkap}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-slate-100 rounded text-slate-700">
                        {student.kelasSekarang}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>NIS: {student.nis}</span>
                      <span>·</span>
                      <span>{student.jenisKelamin === 'L' ? 'L' : 'P'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Lembar Resmi Buku Induk Siswa (Printable Sheet) */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 print:col-span-4 text-slate-900 text-xs">
            {currentStudent ? (
              <div>
                <OfficialKop
                  formatCode="S-4"
                  formatTitle="LEMBAR BUKU INDUK SISWA"
                  subTitle="NOMOR INDUK SISWA REGISTRASI RESMI DEPKIKNAS / KEMDIKBUD"
                />

                {/* Top NIS & Photo Bar */}
                <div className="flex justify-between items-start mb-6 p-4 bg-slate-50 border border-slate-300 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      NOMOR INDUK SISWA (NIS) : <span className="font-mono text-emerald-800">{currentStudent.nis}</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      NISN : <span className="font-mono">{currentStudent.nisn}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Status : <span className="uppercase font-semibold">{currentStudent.statusSiswa}</span> · Kelas Sekarang : <span className="font-bold">Kelas {currentStudent.kelasSekarang}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-24 border border-slate-400 bg-white flex flex-col items-center justify-center text-[10px] text-slate-400 text-center font-mono">
                      <span>Foto Siswa</span>
                      <span>3 x 4 cm</span>
                    </div>
                    <button
                      onClick={() => onEditStudent(currentStudent)}
                      className="no-print p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded border border-slate-200 shadow-2xs cursor-pointer"
                      title="Edit Data Siswa Ini"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Data Tables */}
                <div className="space-y-6">
                  {/* Bagian A: Keterangan Siswa */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-2 border border-slate-300">
                      A. KETERANGAN TENTANG DIRI SISWA
                    </h3>
                    <table className="w-full mt-2 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-56 py-1.5 font-medium">1. Nama Lengkap Siswa</td>
                          <td className="w-4 py-1.5">:</td>
                          <td className="py-1.5 font-bold uppercase">{currentStudent.namaLengkap}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">2. Nama Panggilan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.namaPanggilan}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">3. Jenis Kelamin</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">4. Tempat, Tanggal Lahir</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.tempatLahir}, {currentStudent.tanggalLahir}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">5. Agama</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.agama}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">6. Kewarganegaraan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.kewarganegaraan}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">7. Anak ke / Jumlah Saudara</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">Anak ke-{currentStudent.anakKe} dari {currentStudent.jumlahSaudara} bersaudara</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">8. Bahasa Sehari-hari</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.bahasaSehariHari}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Bagian B: Alamat */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-2 border border-slate-300">
                      B. KETERANGAN TEMPAT TINGGAL
                    </h3>
                    <table className="w-full mt-2 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-56 py-1.5 font-medium">1. Alamat Tempat Tinggal</td>
                          <td className="w-4 py-1.5">:</td>
                          <td className="py-1.5">{currentStudent.alamat}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">2. Kelurahan / Desa &amp; Kecamatan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">Kel. {currentStudent.kelurahan}, Kec. {currentStudent.kecamatan}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">3. Kota / Kabupaten</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5">
                            {currentStudent.kabupatenKota && currentStudent.provinsi
                              ? `${currentStudent.kabupatenKota.replace(/,\s*DKI\s*Jakarta/gi, '')}, ${currentStudent.provinsi.replace(/DKI\s*Jakarta/gi, 'BANTEN')}`
                              : 'LEBAK, BANTEN'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">4. Nomor HP / Telepon</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono">{currentStudent.noHp || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Bagian C: Orang Tua */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-2 border border-slate-300">
                      C. KETERANGAN ORANG TUA KANDUNG / WALI
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="border border-slate-200 p-3 rounded">
                        <h4 className="font-bold text-slate-800 underline mb-2">Ayah Kandung</h4>
                        <p><span className="text-slate-500">Nama:</span> <strong className="uppercase">{currentStudent.dataAyah.nama}</strong></p>
                        <p><span className="text-slate-500">Pendidikan:</span> {currentStudent.dataAyah.pendidikan}</p>
                        <p><span className="text-slate-500">Pekerjaan:</span> {currentStudent.dataAyah.pekerjaan}</p>
                        <p><span className="text-slate-500">Penghasilan:</span> {currentStudent.dataAyah.penghasilan}</p>
                        <p><span className="text-slate-500">No. HP:</span> <span className="font-mono">{currentStudent.dataAyah.noHp}</span></p>
                      </div>

                      <div className="border border-slate-200 p-3 rounded">
                        <h4 className="font-bold text-slate-800 underline mb-2">Ibu Kandung</h4>
                        <p><span className="text-slate-500">Nama:</span> <strong className="uppercase">{currentStudent.dataIbu.nama}</strong></p>
                        <p><span className="text-slate-500">Pendidikan:</span> {currentStudent.dataIbu.pendidikan}</p>
                        <p><span className="text-slate-500">Pekerjaan:</span> {currentStudent.dataIbu.pekerjaan}</p>
                        <p><span className="text-slate-500">Penghasilan:</span> {currentStudent.dataIbu.penghasilan}</p>
                        <p><span className="text-slate-500">No. HP:</span> <span className="font-mono">{currentStudent.dataIbu.noHp}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Bagian D: Riwayat Masuk Sekolah */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-2 border border-slate-300">
                      D. KETERANGAN PENERIMAAN DAN PERKEMBANGAN
                    </h3>
                    <table className="w-full mt-2 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-56 py-1.5 font-medium">1. Asal Sekolah Sebelum Masuk</td>
                          <td className="w-4 py-1.5">:</td>
                          <td className="py-1.5 font-semibold">{currentStudent.asalSekolah}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">2. Tanggal Diterima di Sekolah Ini</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono">{currentStudent.tanggalDiterima} (Kelas {currentStudent.diterimaDiKelas})</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 font-medium">3. Status Kenaikan / Kelulusan Terakhir</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-semibold">
                            {currentStudent.riwayatKenaikan?.status} {currentStudent.riwayatKenaikan?.kelasTujuan || ''}
                            {currentStudent.riwayatKenaikan?.peringkat && ` (Peringkat ${currentStudent.riwayatKenaikan.peringkat})`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <OfficialSignature kelas={currentStudent.kelasSekarang} rombel={currentStudent.rombel} waliKelasLabel={`Wali Kelas ${currentStudent.kelasSekarang}`} />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Pilih siswa dari daftar untuk melihat lembar buku induk.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BUKU PEMBANTU INDUK SISWA */}
      {activeSubTab === 'pembantu' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
          <OfficialKop
            formatCode="S-4 (PEMBANTU)"
            formatTitle="BUKU PEMBANTU INDUK SISWA"
            subTitle={`IKHTISAR REGISTER SISWA AKTIF TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead className="bg-slate-100 font-bold text-center">
                <tr>
                  <th className="border border-slate-800 p-2 w-10">No.</th>
                  <th className="border border-slate-800 p-2 w-20">NIS</th>
                  <th className="border border-slate-800 p-2 w-24">NISN</th>
                  <th className="border border-slate-800 p-2 min-w-[140px]">Nama Lengkap Siswa</th>
                  <th className="border border-slate-800 p-2 w-10">L/P</th>
                  <th className="border border-slate-800 p-2 min-w-[130px]">Tempat &amp; Tgl Lahir</th>
                  <th className="border border-slate-800 p-2 w-16">Agama</th>
                  <th className="border border-slate-800 p-2 w-16">Kelas</th>
                  <th className="border border-slate-800 p-2 min-w-[120px]">Nama Orang Tua</th>
                  <th className="border border-slate-800 p-2 min-w-[140px]">Alamat</th>
                  <th className="border border-slate-800 p-2 w-20">Status</th>
                  <th className="border border-slate-800 p-2 w-16 no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold text-center">{student.nis}</td>
                    <td className="border border-slate-800 p-2 font-mono text-center">{student.nisn}</td>
                    <td className="border border-slate-800 p-2 font-bold">{student.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{student.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2">{student.tempatLahir}, {student.tanggalLahir}</td>
                    <td className="border border-slate-800 p-2 text-center">{student.agama}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">Kelas {student.kelasSekarang}</td>
                    <td className="border border-slate-800 p-2">{student.dataAyah.nama}</td>
                    <td className="border border-slate-800 p-2 text-[10px]">{student.alamat}</td>
                    <td className="border border-slate-800 p-2 text-center uppercase font-semibold text-[10px]">
                      {student.statusSiswa}
                    </td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setActiveSubTab('buku-induk');
                        }}
                        className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                        title="Lihat Lembar Buku Induk Lengkap"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <OfficialSignature
            useAdminOfficer={true}
            leftTitle="Petugas Administrasi / Pengelola Buku Pembantu Induk"
            leftName="KURNIAWAN SAPUTRA"
            leftNip="19890906 202521 1 004"
          />
        </div>
      )}

      {/* VIEW 3: KUNCI INDUK REGISTRASI */}
      {activeSubTab === 'kunci-induk' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
          <OfficialKop
            formatCode="KUNCI INDUK"
            formatTitle="BUKU KUNCI INDUK REGISTRASI SISWA"
            subTitle="DAFTAR NOMOR INDUK SISWA (NIS) SECARA BERURUT DARI TAHUN KE TAHUN"
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead className="bg-slate-100 font-bold text-center">
                <tr>
                  <th className="border border-slate-800 p-2 w-14">No. Urut</th>
                  <th className="border border-slate-800 p-2 w-28">Nomor Induk (NIS)</th>
                  <th className="border border-slate-800 p-2 min-w-[180px]">Nama Lengkap Siswa</th>
                  <th className="border border-slate-800 p-2 w-14">L/P</th>
                  <th className="border border-slate-800 p-2 w-28">Tgl Masuk</th>
                  <th className="border border-slate-800 p-2 w-24">Diterima di Kelas</th>
                  <th className="border border-slate-800 p-2 w-28">Status Sekarang</th>
                  <th className="border border-slate-800 p-2 min-w-[150px]">Keterangan / Arsip</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .slice()
                  .sort((a, b) => a.nis.localeCompare(b.nis))
                  .map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-800 p-2 text-center font-mono font-bold text-emerald-800">
                        {student.nis}
                      </td>
                      <td className="border border-slate-800 p-2 font-bold">{student.namaLengkap}</td>
                      <td className="border border-slate-800 p-2 text-center font-bold">{student.jenisKelamin}</td>
                      <td className="border border-slate-800 p-2 text-center font-mono">{student.tanggalDiterima}</td>
                      <td className="border border-slate-800 p-2 text-center">Kelas {student.diterimaDiKelas}</td>
                      <td className="border border-slate-800 p-2 text-center font-semibold uppercase text-[10px]">
                        {student.statusSiswa} (Kelas {student.kelasSekarang})
                      </td>
                      <td className="border border-slate-800 p-2 text-[10px]">
                        Buku Induk Hal. {idx + 1}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <OfficialSignature
            useAdminOfficer={true}
            leftTitle="Petugas Administrasi / Pengelola Buku Kunci Induk"
            leftName="KURNIAWAN SAPUTRA"
            leftNip="19890906 202521 1 004"
          />
        </div>
      )}
    </div>
  );
};
