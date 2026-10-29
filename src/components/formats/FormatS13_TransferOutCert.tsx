import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Plus } from 'lucide-react';

export const FormatS13_TransferOutCert: React.FC = () => {
  const { students, schoolProfile, transferOuts, addTransferOut } = useSchool();
  const [selectedCertId, setSelectedCertId] = useState<string>(transferOuts[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
  const [sekolahTujuan, setSekolahTujuan] = useState('SD Negeri Menteng 01');
  const [desaTujuan, setDesaTujuan] = useState('Menteng');
  const [kecamatanTujuan, setKecamatanTujuan] = useState('Menteng');
  const [kotaTujuan, setKotaTujuan] = useState('Jakarta Pusat');
  const [provinsiTujuan, setProvinsiTujuan] = useState('DKI Jakarta');
  const [alasanPindah, setAlasanPindah] = useState('Mengikuti mutasi kerja dan perpindahan domisili orang tua');
  const [nomorSurat, setNomorSurat] = useState(
    `421.2/${Math.floor(100 + Math.random() * 900)}/SDN-CP/MUT-OUT/VI/2026`
  );
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);

  const currentCert = transferOuts.find(c => c.id === selectedCertId) || transferOuts[0];

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    addTransferOut({
      studentId: st.id,
      studentName: st.namaLengkap,
      nis: st.nis,
      nisn: st.nisn,
      jenisKelamin: st.jenisKelamin,
      tempatTanggalLahir: `${st.tempatLahir}, ${st.tanggalLahir}`,
      kelasDitinggalkan: `Kelas ${st.kelasSekarang}`,
      sekolahTujuan,
      desaKelurahanTujuan: desaTujuan,
      kecamatanTujuan,
      kabupatenKotaTujuan: kotaTujuan,
      provinsiTujuan,
      alasanPindah,
      nomorSurat,
      tanggalSurat,
      catatanKelakuan: 'Selama belajar di sekolah ini, siswa bersangkutan berkelakuan BAIK dan tidak memiliki tunggakan peminjaman buku perpustakaan.',
    });

    setIsModalOpen(false);
  };

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentCert ? new Date(currentCert.tanggalSurat) : new Date());

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Pilih Arsip Surat Keterangan:</label>
          <select
            value={selectedCertId}
            onChange={e => setSelectedCertId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs truncate"
          >
            {transferOuts.map(c => (
              <option key={c.id} value={c.id}>
                {c.studentName} ({c.kelasDitinggalkan}) - Ke: {c.sekolahTujuan}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Terbitkan Surat Pindah (S-13)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Surat (Format S-13)</span>
          </button>
        </div>
      </div>

      {/* Official S-13 Document Sheet */}
      <div className="bg-white p-8 md:p-14 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs leading-relaxed">
        <OfficialKop
          formatCode="S-13"
          formatTitle="SURAT KETERANGAN PINDAH SEKOLAH"
          subTitle=""
        />

        {currentCert ? (
          <div>
            <div className="text-center mb-6">
              <p className="font-mono text-xs font-bold">
                Nomor : {currentCert.nomorSurat}
              </p>
            </div>

            <div className="space-y-4 text-justify">
              <p>
                Yang bertanda tangan di bawah ini, Kepala {schoolProfile.namaSekolah}, Kecamatan {schoolProfile.kecamatan}, Kota/Kabupaten {schoolProfile.kabupatenKota}, Provinsi {schoolProfile.provinsi}, menerangkan bahwa :
              </p>

              {/* Data Siswa */}
              <div className="pl-6 space-y-1.5 py-2 border-l-2 border-slate-300 my-2">
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="w-48 font-medium">1. Nama Lengkap Peserta Didik</td>
                      <td className="w-4">:</td>
                      <td className="font-bold uppercase text-slate-900">{currentCert.studentName}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">2. Nomor Induk Siswa (NIS)</td>
                      <td>:</td>
                      <td className="font-mono font-semibold">{currentCert.nis}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">3. NISN</td>
                      <td>:</td>
                      <td className="font-mono">{currentCert.nisn}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">4. Jenis Kelamin</td>
                      <td>:</td>
                      <td>{currentCert.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">5. Tempat, Tanggal Lahir</td>
                      <td>:</td>
                      <td>{currentCert.tempatTanggalLahir}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">6. Kelas yang Ditinggalkan</td>
                      <td>:</td>
                      <td className="font-bold">{currentCert.kelasDitinggalkan}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">7. Diterima di Sekolah Ini Tanggal</td>
                      <td>:</td>
                      <td>14 Juli 2025 (Tahun Ajaran 2025/2026)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Sesuai dengan Surat Permohonan Pindah Sekolah (Format S-12) dari orang tua/wali murid tanggal {formattedDate}, telah mengajukan pindah belajar ke :
              </p>

              <div className="pl-6 space-y-1 py-1 font-medium bg-slate-50 p-3 rounded border border-slate-200">
                <table className="text-xs">
                  <tbody>
                    <tr>
                      <td className="w-44">Nama Sekolah yang Dituju</td>
                      <td className="w-4">:</td>
                      <td className="font-bold text-slate-900 underline">{currentCert.sekolahTujuan}</td>
                    </tr>
                    <tr>
                      <td>Kelurahan / Desa &amp; Kecamatan</td>
                      <td>:</td>
                      <td>Kel. {currentCert.desaKelurahanTujuan}, Kec. {currentCert.kecamatanTujuan}</td>
                    </tr>
                    <tr>
                      <td>Kabupaten / Kota &amp; Provinsi</td>
                      <td>:</td>
                      <td>{currentCert.kabupatenKotaTujuan}, {currentCert.provinsiTujuan}</td>
                    </tr>
                    <tr>
                      <td>Alasan Kepindahan</td>
                      <td>:</td>
                      <td className="italic">{currentCert.alasanPindah}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                {currentCert.catatanKelakuan} Bersama surat ini disertakan Buku Laporan Penilaian Hasil Belajar Siswa (Rapor) dan Surat Validasi Kesiswaan.
              </p>
              <p>
                Demikian surat keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs mt-6">
              <div>
                {/* Blank space or knowing note */}
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
        ) : (
          <div className="text-center py-12 text-slate-500">
            Belum ada arsip surat keterangan pindah sekolah.
          </div>
        )}
      </div>

      {/* Modal Terbitkan Surat Pindah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Terbitkan Surat Keterangan Pindah (Format S-13)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCert} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1">Pilih Siswa yang Pindah *</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} - Kelas {s.kelasSekarang} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nomor Surat Keterangan *</label>
                <input
                  type="text"
                  required
                  value={nomorSurat}
                  onChange={e => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Sekolah Tujuan *</label>
                <input
                  type="text"
                  required
                  value={sekolahTujuan}
                  onChange={e => setSekolahTujuan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  placeholder="SD Negeri ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kota / Kabupaten Tujuan</label>
                  <input
                    type="text"
                    value={kotaTujuan}
                    onChange={e => setKotaTujuan(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Provinsi Tujuan</label>
                  <input
                    type="text"
                    value={provinsiTujuan}
                    onChange={e => setProvinsiTujuan(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Alasan Pindah *</label>
                <input
                  type="text"
                  required
                  value={alasanPindah}
                  onChange={e => setAlasanPindah(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded"
                >
                  Simpan &amp; Terbitkan S-13
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
