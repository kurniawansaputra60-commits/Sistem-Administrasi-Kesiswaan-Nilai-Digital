import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Mail, Plus, Trash2, Calendar } from 'lucide-react';

export const FormatS10_AbsenceLetter: React.FC = () => {
  const { students, schoolProfile, warningLetters, addWarningLetter, deleteWarningLetter } = useSchool();
  const [selectedLetterId, setSelectedLetterId] = useState<string>(warningLetters[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
  const [nomorSurat, setNomorSurat] = useState<string>(
    `421.2/${Math.floor(100 + Math.random() * 900)}/SDN-CP/SP-ABS/VI/2026`
  );
  const [tanggalSurat, setTanggalSurat] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tanggalMenghadap, setTanggalMenghadap] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [waktuMenghadap, setWaktuMenghadap] = useState<string>('Pukul 08.30 WIB s.d. Selesai');
  const [tempatMenghadap, setTempatMenghadap] = useState<string>('Ruang Kepala Sekolah / Wali Kelas');
  const [jumlahAlfa, setJumlahAlfa] = useState<number>(3);
  const [jumlahSakit, setJumlahSakit] = useState<number>(0);
  const [jumlahIzin, setJumlahIzin] = useState<number>(0);
  const [catatan, setCatatan] = useState<string>(
    'Siswa bersangkutan tidak hadir di sekolah tanpa memberikan surat keterangan atau pemberitahuan resmi.'
  );

  const currentLetter = warningLetters.find(l => l.id === selectedLetterId) || warningLetters[0];

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    addWarningLetter({
      studentId: st.id,
      studentName: st.namaLengkap,
      kelas: st.kelasSekarang,
      namaOrangTua: st.dataAyah.nama || st.dataIbu.nama || 'Bapak/Ibu Orang Tua Murid',
      alamat: st.alamat,
      nomorSurat,
      tanggalSurat,
      tanggalMenghadap,
      waktuMenghadap,
      tempatMenghadap,
      jumlahAlfa,
      jumlahSakit,
      jumlahIzin,
      catatanWaliKelas: catatan,
    });

    setIsModalOpen(false);
  };

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentLetter ? new Date(currentLetter.tanggalSurat) : new Date());

  const formattedMeetingDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentLetter ? new Date(currentLetter.tanggalMenghadap) : new Date());

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Pilih Arsip Surat:</label>
          <select
            value={selectedLetterId}
            onChange={e => setSelectedLetterId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs truncate"
          >
            {warningLetters.map(l => (
              <option key={l.id} value={l.id}>
                {l.studentName} (Kelas {l.kelas}) - No: {l.nomorSurat}
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
            <span>Buat Surat Panggilan Baru</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Surat (Format S-10)</span>
          </button>
        </div>
      </div>

      {/* Official S-10 Document Sheet */}
      <div className="bg-white p-8 md:p-14 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs leading-relaxed">
        <OfficialKop
          formatCode="S-10"
          formatTitle="SURAT PERMOHONAN PENJELASAN KETIDAKHADIRAN"
          subTitle="(SURAT PANGGILAN ORANG TUA / WALI PESERTA DIDIK)"
        />

        {currentLetter ? (
          <div>
            {/* Metadata Surat */}
            <div className="flex justify-between items-start my-4">
              <table className="text-xs">
                <tbody>
                  <tr>
                    <td className="w-20 font-medium">Nomor</td>
                    <td className="w-4">:</td>
                    <td className="font-mono font-semibold">{currentLetter.nomorSurat}</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Lampiran</td>
                    <td>:</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Perihal</td>
                    <td>:</td>
                    <td className="font-bold underline">Permohonan Penjelasan Ketidakhadiran (Panggilan)</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-xs text-right">
                <p>{schoolProfile.kabupatenKota}, {formattedDate}</p>
                <p className="mt-2 text-left">
                  Kepada Yth.<br />
                  Bapak/Ibu Orang Tua / Wali dari :<br />
                  <strong className="text-slate-900 uppercase">{currentLetter.studentName}</strong><br />
                  di Tempat
                </p>
              </div>
            </div>

            {/* Isi Surat */}
            <div className="mt-6 space-y-4 text-justify">
              <p>Dengan hormat,</p>
              <p>
                Sehubungan dengan hasil pencatatan kehadiran peserta didik pada Buku Absensi Harian (Format S-8) dan Buku Rekapitulasi Absensi Bulanan (Format S-9) {schoolProfile.namaSekolah}, dengan ini kami beritahukan bahwa putra/putri Bapak/Ibu:
              </p>

              <div className="pl-6 space-y-1.5 py-2 border-l-2 border-slate-300 my-2">
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="w-44 font-medium">Nama Peserta Didik</td>
                      <td className="w-4">:</td>
                      <td className="font-bold uppercase">{currentLetter.studentName}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Kelas</td>
                      <td>:</td>
                      <td className="font-semibold">Kelas {currentLetter.kelas}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Jumlah Ketidakhadiran</td>
                      <td>:</td>
                      <td>
                        <span className="font-bold text-rose-700">{currentLetter.jumlahAlfa} Hari Alfa (Tanpa Keterangan)</span>
                        {currentLetter.jumlahSakit > 0 && `, ${currentLetter.jumlahSakit} Hari Sakit`}
                        {currentLetter.jumlahIzin > 0 && `, ${currentLetter.jumlahIzin} Hari Izin`}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-medium">Catatan Wali Kelas</td>
                      <td>:</td>
                      <td className="italic">{currentLetter.catatanWaliKelas}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Mengingat pentingnya proses belajar mengajar serta kedisiplinan peserta didik di sekolah, maka kami mengharapkan kehadiran Bapak/Ibu Orang Tua/Wali ke sekolah pada:
              </p>

              <div className="pl-6 space-y-1 py-1 font-medium">
                <table className="text-xs">
                  <tbody>
                    <tr>
                      <td className="w-36">Hari, Tanggal</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{formattedMeetingDate}</td>
                    </tr>
                    <tr>
                      <td>Waktu</td>
                      <td>:</td>
                      <td>{currentLetter.waktuMenghadap}</td>
                    </tr>
                    <tr>
                      <td>Tempat</td>
                      <td>:</td>
                      <td>{currentLetter.tempatMenghadap}</td>
                    </tr>
                    <tr>
                      <td>Keperluan</td>
                      <td>:</td>
                      <td>Konfirmasi dan Pembinaan Bersama mengenai Presensi Belajar Siswa</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Mengingat pentingnya hal tersebut demi kelancaran pendidikan putra/putri Bapak/Ibu, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.
              </p>
              <p>
                Demikian surat permohonan penjelasan ketidakhadiran ini kami sampaikan, atas perhatian dan kerja sama yang baik diucapkan terima kasih.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-10 grid grid-cols-2 text-center text-xs mt-8">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Wali Kelas / Guru BP</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{schoolProfile.namaWaliKelas}</p>
                <p className="font-mono">NIP. {schoolProfile.nipWaliKelas}</p>
              </div>
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
            Belum ada arsip surat panggilan orang tua. Silakan klik "Buat Surat Panggilan Baru".
          </div>
        )}
      </div>

      {/* Modal Buat Surat Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Buat Surat Panggilan Orang Tua (Format S-10)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLetter} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1">Pilih Peserta Didik *</label>
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
                <label className="block font-semibold mb-1">Nomor Surat Resmi *</label>
                <input
                  type="text"
                  required
                  value={nomorSurat}
                  onChange={e => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tanggal Surat *</label>
                  <input
                    type="date"
                    required
                    value={tanggalSurat}
                    onChange={e => setTanggalSurat(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Menghadap *</label>
                  <input
                    type="date"
                    required
                    value={tanggalMenghadap}
                    onChange={e => setTanggalMenghadap(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-rose-700">Jumlah Alfa *</label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahAlfa}
                    onChange={e => setJumlahAlfa(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-blue-700">Jumlah Sakit</label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahSakit}
                    onChange={e => setJumlahSakit(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-amber-700">Jumlah Izin</label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahIzin}
                    onChange={e => setJumlahIzin(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Waktu &amp; Tempat Menghadap</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={waktuMenghadap}
                    onChange={e => setWaktuMenghadap(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                    placeholder="Pukul 08.30 WIB"
                  />
                  <input
                    type="text"
                    value={tempatMenghadap}
                    onChange={e => setTempatMenghadap(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                    placeholder="Ruang Wali Kelas"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Catatan Pelanggaran / Penjelasan *</label>
                <textarea
                  rows={2}
                  required
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
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
                  Simpan &amp; Terbitkan Surat S-10
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
