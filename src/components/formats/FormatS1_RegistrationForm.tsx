import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { Printer, UserCheck } from 'lucide-react';

export const FormatS1_RegistrationForm: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const candidatesAndClass1 = students.filter(s => s.statusSiswa === 'calon' || s.kelasSekarang === 'I');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    candidatesAndClass1[0]?.id || ''
  );

  const currentStudent: Student | undefined = students.find(s => s.id === selectedStudentId) || candidatesAndClass1[0];

  return (
    <div className="space-y-6">
      {/* Control Bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Pilih Siswa / Calon:
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white max-w-xs truncate font-medium"
          >
            {candidatesAndClass1.map(s => (
              <option key={s.id} value={s.id}>
                {s.namaLengkap} - {s.statusSiswa === 'calon' ? '[Calon PPDB]' : `[Kelas ${s.kelasSekarang}]`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Formulir S-1</span>
          </button>
        </div>
      </div>

      {/* Official S-1 Printable Document Sheet */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-1"
          formatTitle="FORMULIR PENDAFTARAN SISWA BARU"
          subTitle={`PENERIMAAN PESERTA DIDIK BARU (PPDB) TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-300 font-medium">
          <div className="space-y-0.5">
            <p>
              Nomor Pendaftaran : <span className="font-mono font-bold">{currentStudent?.nis || '2026/PPDB/001'}</span>
            </p>
            <p>
              Tanggal Pendaftaran : <span className="font-mono">{currentStudent?.tanggalDiterima || schoolProfile.tanggalDokumen}</span>
            </p>
          </div>
          <div className="w-24 h-32 border border-slate-400 border-dashed flex flex-col items-center justify-center text-[10px] text-slate-500 text-center p-2 bg-slate-50">
            <span>Pas Foto Siswa</span>
            <span className="font-mono">3 x 4 cm</span>
          </div>
        </div>

        {currentStudent ? (
          <div className="space-y-4">
            {/* Bagian I: Keterangan Siswa */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-1.5 border border-slate-300">
                I. KETERANGAN TENTANG DIRI SISWA
              </h3>
              <table className="w-full mt-2 border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-48 py-1.5 font-medium">1. Nama Lengkap</td>
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
                    <td className="py-1.5 font-medium">7. Anak ke berapa</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.anakKe} dari {currentStudent.jumlahSaudara} bersaudara</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">8. Bahasa Sehari-hari</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.bahasaSehariHari}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian II: Tempat Tinggal */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-1.5 border border-slate-300">
                II. KETERANGAN TEMPAT TINGGAL
              </h3>
              <table className="w-full mt-2 border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-48 py-1.5 font-medium">1. Alamat Tempat Tinggal</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.alamat}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">2. Kelurahan / Desa</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.kelurahan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">3. Kecamatan</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.kecamatan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">4. Kota / Kabupaten</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5">{currentStudent.kabupatenKota}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">5. No. Telepon / HP</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5 font-mono">{currentStudent.noHp || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian III: Asal Sekolah */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-1.5 border border-slate-300">
                III. KETERANGAN PENDIDIKAN SEBELUMNYA
              </h3>
              <table className="w-full mt-2 border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-48 py-1.5 font-medium">1. Asal Pendidikan Sebelumnya</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-semibold">{currentStudent.asalSekolah}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">2. Nomor Ijazah / Surat Keterangan</td>
                    <td className="py-1.5">:</td>
                    <td className="py-1.5 font-mono">{currentStudent.noIjazahSebelumnya || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian IV: Orang Tua Kandung */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase bg-slate-100 p-1.5 border border-slate-300">
                IV. KETERANGAN ORANG TUA KANDUNG
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-bold text-slate-800 underline mb-1">A. Data Ayah</h4>
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr>
                        <td className="w-28 py-1 text-slate-600">Nama</td>
                        <td className="py-1 font-semibold">: {currentStudent.dataAyah.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Pendidikan</td>
                        <td className="py-1">: {currentStudent.dataAyah.pendidikan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Pekerjaan</td>
                        <td className="py-1">: {currentStudent.dataAyah.pekerjaan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Penghasilan</td>
                        <td className="py-1">: {currentStudent.dataAyah.penghasilan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">No. HP</td>
                        <td className="py-1 font-mono">: {currentStudent.dataAyah.noHp}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 underline mb-1">B. Data Ibu</h4>
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr>
                        <td className="w-28 py-1 text-slate-600">Nama</td>
                        <td className="py-1 font-semibold">: {currentStudent.dataIbu.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Pendidikan</td>
                        <td className="py-1">: {currentStudent.dataIbu.pendidikan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Pekerjaan</td>
                        <td className="py-1">: {currentStudent.dataIbu.pekerjaan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">Penghasilan</td>
                        <td className="py-1">: {currentStudent.dataIbu.penghasilan}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600">No. HP</td>
                        <td className="py-1 font-mono">: {currentStudent.dataIbu.noHp}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs mt-6">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Panitia PPDB / Petugas Pendaftaran</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{schoolProfile.namaPetugasAdmin}</p>
                <p className="font-mono">NIP. {schoolProfile.nipPetugasAdmin}</p>
              </div>
              <div>
                <p>{schoolProfile.kabupatenKota}, {currentStudent.tanggalDiterima || schoolProfile.tanggalDokumen}</p>
                <p className="font-semibold">Orang Tua / Wali Murid</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{currentStudent.dataAyah.nama || '...........................................'}</p>
                <p className="text-[11px] text-slate-500">Tanda Tangan &amp; Nama Terang</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Belum ada data siswa untuk ditampilkan. Silakan pilih atau tambah data pendaftar baru.
          </div>
        )}
      </div>
    </div>
  );
};
