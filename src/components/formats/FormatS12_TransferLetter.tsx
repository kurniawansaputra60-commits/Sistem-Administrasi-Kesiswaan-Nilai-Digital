import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, FileText } from 'lucide-react';

export const FormatS12_TransferLetter: React.FC = () => {
  const { students, schoolProfile } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [targetSchool, setTargetSchool] = useState<string>('SD Negeri 05 Pagi Balikpapan Baru');
  const [reason, setReason] = useState<string>('Mengikuti kepindahan tugas kedinasan orang tua');
  const [letterNo, setLetterNo] = useState<string>(`421.2/${Math.floor(100 + Math.random() * 900)}/SDN-CP/VI/2026`);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Top Configuration Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Pilih Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs truncate"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.namaLengkap} - Kelas {s.kelasSekarang} (NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">No. Surat:</span>
            <input
              type="text"
              value={letterNo}
              onChange={e => setLetterNo(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md font-mono w-52"
            />
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Surat Permohonan (Format S-12)</span>
        </button>
      </div>

      {/* Inputs for target school & reason (hidden in print) */}
      <div className="no-print bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Parameter Surat Permohonan Pindah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Sekolah yang Dituju *</label>
            <input
              type="text"
              value={targetSchool}
              onChange={e => setTargetSchool(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
              placeholder="Nama Sekolah Tujuan Lengkap & Kota"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Alasan Pindah Sekolah *</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
              placeholder="Alasan kepindahan sekolah"
            />
          </div>
        </div>
      </div>

      {/* Official S-12 Letter Document */}
      <div className="bg-white p-8 md:p-14 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs leading-relaxed">
        <OfficialKop
          formatCode="S-12"
          formatTitle="SURAT KETERANGAN / PERMOHONAN PINDAH SEKOLAH"
          subTitle=""
        />

        <div className="flex justify-between items-start my-4">
          <table className="text-xs">
            <tbody>
              <tr>
                <td className="w-20 font-medium">Nomor</td>
                <td className="w-4">:</td>
                <td className="font-mono font-semibold">{letterNo}</td>
              </tr>
              <tr>
                <td className="font-medium">Lampiran</td>
                <td>:</td>
                <td>1 (satu) Berkas Rapor &amp; Buku Induk</td>
              </tr>
              <tr>
                <td className="font-medium">Perihal</td>
                <td>:</td>
                <td className="font-bold underline">Permohonan Pindah Sekolah (Mutasi Keluar)</td>
              </tr>
            </tbody>
          </table>

          <div className="text-xs text-right">
            <p>{schoolProfile.kabupatenKota}, {formattedDate}</p>
            <p className="mt-2 text-left">
              Kepada Yth.<br />
              Kepala Sekolah Tujuan :<br />
              <strong className="text-slate-900">{targetSchool}</strong><br />
              di Tempat
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p>Dengan hormat,</p>
          <p>
            Yang bertanda tangan di bawah ini, Kepala {schoolProfile.namaSekolah}, menerangkan bahwa orang tua / wali dari peserta didik berikut ini telah mengajukan permohonan pindah sekolah :
          </p>

          {/* Student Identitas */}
          <div className="pl-6 space-y-1 py-2 border-l-2 border-slate-300 my-2">
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="w-48 font-medium">1. Nama Lengkap Siswa</td>
                  <td className="w-4">:</td>
                  <td className="font-bold uppercase">{currentStudent?.namaLengkap}</td>
                </tr>
                <tr>
                  <td className="font-medium">2. Nomor Induk Siswa (NIS)</td>
                  <td>:</td>
                  <td className="font-mono font-semibold">{currentStudent?.nis}</td>
                </tr>
                <tr>
                  <td className="font-medium">3. NISN</td>
                  <td>:</td>
                  <td className="font-mono">{currentStudent?.nisn}</td>
                </tr>
                <tr>
                  <td className="font-medium">4. Jenis Kelamin</td>
                  <td>:</td>
                  <td>{currentStudent?.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                </tr>
                <tr>
                  <td className="font-medium">5. Tempat, Tanggal Lahir</td>
                  <td>:</td>
                  <td>{currentStudent?.tempatLahir}, {currentStudent?.tanggalLahir}</td>
                </tr>
                <tr>
                  <td className="font-medium">6. Kelas Saat Ini</td>
                  <td>:</td>
                  <td className="font-bold">Kelas {currentStudent?.kelasSekarang} ({schoolProfile.tahunAjaranAktif})</td>
                </tr>
                <tr>
                  <td className="font-medium">7. Nama Orang Tua / Wali</td>
                  <td>:</td>
                  <td>{currentStudent?.dataAyah.nama || currentStudent?.dataIbu.nama}</td>
                </tr>
                <tr>
                  <td className="font-medium">8. Alamat Rumah</td>
                  <td>:</td>
                  <td>{currentStudent?.alamat}</td>
                </tr>
                <tr>
                  <td className="font-medium">9. Sekolah yang Dituju</td>
                  <td>:</td>
                  <td className="font-bold underline">{targetSchool}</td>
                </tr>
                <tr>
                  <td className="font-medium">10. Alasan Pindah Sekolah</td>
                  <td>:</td>
                  <td className="italic">{reason}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Bersama ini kami sertakan Buku Laporan Penilaian Hasil Belajar (Rapor) siswa yang bersangkutan serta salinan lembar Buku Induk Siswa (Format S-4) untuk dipergunakan sebagaimana mestinya.
          </p>
          <p>
            Demikian surat permohonan / keterangan pindah sekolah ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Dual Signature Block */}
        <div className="pt-10 grid grid-cols-2 text-center text-xs mt-8">
          <div>
            <p>Mengetahui / Mengajukan,</p>
            <p className="font-semibold">Orang Tua / Wali Siswa</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">
              {currentStudent?.dataAyah.nama || '...........................................'}
            </p>
            <p className="text-[11px] text-slate-500">Pemohon</p>
          </div>
          <div>
            <p>{schoolProfile.kabupatenKota}, {formattedDate}</p>
            <p className="font-semibold">Kepala {schoolProfile.namaSekolah}</p>
            <div className="h-20 flex items-center justify-center my-1">
              {schoolProfile.kepalaSekolahTtdUrl ? (
                <img
                  src={schoolProfile.kepalaSekolahTtdUrl}
                  alt="TTD Kepala Sekolah"
                  className="max-h-20 max-w-[150px] object-contain"
                />
              ) : (
                <div className="h-20"></div>
              )}
            </div>
            <p className="font-bold underline uppercase">{schoolProfile.namaKepalaSekolah}</p>
            <p className="font-mono">NIP. {schoolProfile.nipKepalaSekolah}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
