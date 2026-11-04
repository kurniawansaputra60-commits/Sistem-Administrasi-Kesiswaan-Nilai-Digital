import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Plus } from 'lucide-react';

export const FormatS14_TransferInConfirmation: React.FC = () => {
  const { schoolProfile, transferIns, addTransferIn } = useSchool();
  const [selectedConfId, setSelectedConfId] = useState<string>(transferIns[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [namaSiswa, setNamaSiswa] = useState('Olivia Zahra Salsabila');
  const [nisBaru, setNisBaru] = useState('2025098');
  const [nisn, setNisn] = useState('0151122334');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('P');
  const [diterimaDiKelas, setDiterimaDiKelas] = useState('IV (Empat)');
  const [tanggalDiterima, setTanggalDiterima] = useState('2026-01-08');
  const [sekolahAsal, setSekolahAsal] = useState('SD Negeri Ketabang 1 Surabaya');
  const [noSuratAsal, setNoSuratAsal] = useState('421.2/014/SDN-KTB/I/2026');
  const [tglSuratAsal, setTglSuratAsal] = useState('2026-01-04');
  const [nomorSurat, setNomorSurat] = useState(
    `421.2/${Math.floor(100 + Math.random() * 900)}/SDN-CP/MUT-IN/I/2026`
  );
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);

  const currentConf = transferIns.find(c => c.id === selectedConfId) || transferIns[0];

  const handleCreateConf = (e: React.FormEvent) => {
    e.preventDefault();

    addTransferIn({
      studentId: `stu-in-${Date.now()}`,
      studentName: namaSiswa,
      nisBaru,
      nisn,
      jenisKelamin,
      diterimaDiKelas,
      tanggalDiterima,
      sekolahAsal,
      nomorSuratPindahAsal: noSuratAsal,
      tanggalSuratPindahAsal: tglSuratAsal,
      nomorSuratKeterangan: nomorSurat,
      tanggalSurat,
      keterangan: 'Telah dicatat pada Buku Induk Siswa (Format S-4) dan Buku Klaper (Format S-5).',
    });

    setIsModalOpen(false);
  };

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentConf ? new Date(currentConf.tanggalSurat) : new Date());

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Pilih Surat Keterangan Diterima:</label>
          <select
            value={selectedConfId}
            onChange={e => setSelectedConfId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs truncate"
          >
            {transferIns.map(c => (
              <option key={c.id} value={c.id}>
                {c.studentName} ({c.diterimaDiKelas}) - Dari: {c.sekolahAsal}
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
            <span>Terbitkan Keterangan Telah Menerima (S-14)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Surat (Format S-14)</span>
          </button>
        </div>
      </div>

      {/* Official S-14 Document Sheet */}
      <div className="bg-white p-8 md:p-14 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs leading-relaxed">
        <OfficialKop
          formatCode="S-14"
          formatTitle="SURAT KETERANGAN TELAH MENERIMA SISWA PINDAHAN"
          subTitle=""
        />

        {currentConf ? (
          <div>
            <div className="text-center mb-6">
              <p className="font-mono text-xs font-bold">
                Nomor : {currentConf.nomorSuratKeterangan}
              </p>
            </div>

            <div className="space-y-4 text-justify">
              <p>
                Yang bertanda tangan di bawah ini, Kepala {schoolProfile.namaSekolah}, Kecamatan {schoolProfile.kecamatan}, Kota/Kabupaten {schoolProfile.kabupatenKota}, Provinsi {schoolProfile.provinsi}, menerangkan bahwa :
              </p>

              {/* Data Siswa Diterima */}
              <div className="pl-6 space-y-1.5 py-2 border-l-2 border-slate-300 my-2">
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="w-48 font-medium">1. Nama Peserta Didik</td>
                      <td className="w-4">:</td>
                      <td className="font-bold uppercase text-slate-900">{currentConf.studentName}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">2. Jenis Kelamin</td>
                      <td>:</td>
                      <td>{currentConf.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">3. Nomor Induk Siswa (NIS Baru)</td>
                      <td>:</td>
                      <td className="font-mono font-bold text-emerald-800">{currentConf.nisBaru}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">4. NISN</td>
                      <td>:</td>
                      <td className="font-mono">{currentConf.nisn}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">5. Diterima di Kelas</td>
                      <td>:</td>
                      <td className="font-bold">{currentConf.diterimaDiKelas}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">6. Terhitung Mulai Tanggal</td>
                      <td>:</td>
                      <td className="font-mono font-semibold">{currentConf.tanggalDiterima}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Siswa tersebut di atas benar-benar telah kami terima pindah belajar di {schoolProfile.namaSekolah} berdasarkan Surat Keterangan Pindah Sekolah (Format S-13) dari :
              </p>

              <div className="pl-6 space-y-1 py-1 font-medium bg-slate-50 p-3 rounded border border-slate-200">
                <table className="text-xs">
                  <tbody>
                    <tr>
                      <td className="w-48">Sekolah Asal</td>
                      <td className="w-4">:</td>
                      <td className="font-bold text-slate-900">{currentConf.sekolahAsal}</td>
                    </tr>
                    <tr>
                      <td>Nomor Surat Pindah Asal</td>
                      <td>:</td>
                      <td className="font-mono">{currentConf.nomorSuratPindahAsal}</td>
                    </tr>
                    <tr>
                      <td>Tanggal Surat Pindah Asal</td>
                      <td>:</td>
                      <td className="font-mono">{currentConf.tanggalSuratPindahAsal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Kepada Kepala Sekolah Asal dimohon untuk dapat mengirimkan berkas Buku Induk Siswa (Format S-4) lembar asli atau fotokopi yang telah dilegalisir beserta Surat Keterangan Validasi NISN dari Dapodik.
              </p>
              <p>
                Demikian surat keterangan telah menerima siswa pindahan ini kami buat dengan sebenarnya untuk diketahui dan dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs mt-6">
              <div></div>
              <div>
                <p>{schoolProfile.kabupatenKota}, {formattedDate}</p>
                <p className="font-semibold">Kepala {schoolProfile.namaSekolah}</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{schoolProfile.namaKepalaSekolah}</p>
                <p className="font-mono">NIP. {schoolProfile.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Belum ada arsip surat keterangan telah menerima siswa pindahan.
          </div>
        )}
      </div>

      {/* Modal Terbitkan S-14 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Terbitkan Keterangan Telah Menerima (Format S-14)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateConf} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa Pindahan *</label>
                <input
                  type="text"
                  required
                  value={namaSiswa}
                  onChange={e => setNamaSiswa(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIS Baru Dialokasikan *</label>
                  <input
                    type="text"
                    required
                    value={nisBaru}
                    onChange={e => setNisBaru(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={e => setNisn(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Diterima di Kelas *</label>
                  <input
                    type="text"
                    required
                    value={diterimaDiKelas}
                    onChange={e => setDiterimaDiKelas(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                    placeholder="Kelas IV"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Mulai Diterima *</label>
                  <input
                    type="date"
                    required
                    value={tanggalDiterima}
                    onChange={e => setTanggalDiterima(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Sekolah Asal *</label>
                <input
                  type="text"
                  required
                  value={sekolahAsal}
                  onChange={e => setSekolahAsal(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nomor Surat Pindah Asal</label>
                  <input
                    type="text"
                    value={noSuratAsal}
                    onChange={e => setNoSuratAsal(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Surat Asal</label>
                  <input
                    type="date"
                    value={tglSuratAsal}
                    onChange={e => setTglSuratAsal(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
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
                  Simpan &amp; Terbitkan S-14
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
