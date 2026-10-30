import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import { Search, Printer, Edit, BookOpen, ShieldCheck, UserCheck } from 'lucide-react';
import { isKelasMatch } from '../../utils/classUtils';

interface FormatS4Props {
  onEditStudent: (student: Student) => void;
  onOpenAddStudent?: () => void;
}

export const FormatS4_MasterBook: React.FC<FormatS4Props> = ({ onEditStudent }) => {
  const { students } = useSchool();
  const { userProfile } = useAuth();

  const isGuruKelas = userProfile?.role === 'guru_kelas';
  const teacherKelas = userProfile?.kelasTugas || '1';
  const teacherRombel = userProfile?.rombelTugas || 'A';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterRombel, setFilterRombel] = useState<string>('ALL');

  // Filter siswa: Wali Kelas HANYA dapat melihat siswa rombel binaannya
  const filteredStudents = students.filter(s => {
    const matchQuery =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);

    if (isGuruKelas) {
      const matchKelas = isKelasMatch(s.kelasSekarang, teacherKelas);
      const matchRombel = (s.rombel || 'A') === teacherRombel;
      return matchQuery && matchKelas && matchRombel;
    }

    const matchClass = filterClass === 'ALL' || isKelasMatch(s.kelasSekarang, filterClass);
    const matchRombel = filterRombel === 'ALL' || !s.rombel || s.rombel === filterRombel;
    return matchQuery && matchClass && matchRombel;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    filteredStudents[0]?.id || students[0]?.id || ''
  );

  const currentStudent =
    filteredStudents.find(s => s.id === selectedStudentId) ||
    filteredStudents[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Top Action & Information Header */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Format S-4: Buku Induk Siswa</span>
              {isGuruKelas ? (
                <span className="text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-700" />
                  <span>Rombel Binaan: Kelas {teacherKelas} {teacherRombel}</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Akses Seluruh Sekolah</span>
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500">
              {isGuruKelas
                ? `Menampilkan buku induk khusus peserta didik rombel binaan Kelas ${teacherKelas} ${teacherRombel} (${filteredStudents.length} Siswa)`
                : `Lembar resmi buku induk registrasi peserta didik (${filteredStudents.length} Siswa Terfilter)`}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Lembar Buku Induk</span>
        </button>
      </div>

      {/* Main Grid: Student Selector + Printable Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Student Selector List (Hidden on Print) */}
        <div className="no-print bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[750px]">
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={isGuruKelas ? `Cari siswa Kelas ${teacherKelas}${teacherRombel}...` : "Cari nama / NIS..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Filter hanya untuk Administrator & Kepala Sekolah; Guru Kelas terkunci pada rombel binaannya */}
            {!isGuruKelas && (
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
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Tidak ada data siswa ditemukan.
              </div>
            ) : (
              filteredStudents.map(student => {
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
                        {student.kelasSekarang} {student.rombel || 'A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>NIS: {student.nis}</span>
                      <span>·</span>
                      <span>{student.jenisKelamin === 'L' ? 'L' : 'P'}</span>
                    </div>
                  </button>
                );
              })
            )}
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
                    Status : <span className="uppercase font-semibold">{currentStudent.statusSiswa}</span> · Kelas Sekarang : <span className="font-bold">Kelas {currentStudent.kelasSekarang} {currentStudent.rombel || 'A'}</span>
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

                {/* Bagian B: Alamat & Tempat Tinggal */}
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-2 border border-slate-300">
                    B. KETERANGAN TEMPAT TINGGAL
                  </h3>
                  <table className="w-full mt-2 border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-56 py-1.5 font-medium">1. Alamat Lengkap</td>
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
                          {currentStudent.kabupatenKota || 'KABUPATEN LEBAK'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 font-medium">4. Provinsi</td>
                        <td className="py-1.5">:</td>
                        <td className="py-1.5 font-semibold">
                          {currentStudent.provinsi || 'BANTEN'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 font-medium">5. Nomor HP / Telepon</td>
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

              <OfficialSignature
                kelas={currentStudent.kelasSekarang}
                rombel={currentStudent.rombel || 'A'}
                waliKelasLabel={`Wali Kelas ${currentStudent.kelasSekarang} ${currentStudent.rombel || 'A'}`}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Pilih siswa dari daftar untuk melihat lembar buku induk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
