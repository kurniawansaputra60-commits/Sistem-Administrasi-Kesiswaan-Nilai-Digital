import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, CreditCard } from 'lucide-react';

export const FormatS17_ExamCard: React.FC = () => {
  const { students, schoolProfile, examCandidates } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    examCandidates[0]?.studentId || students[0]?.id || ''
  );
  const [printAllMode, setPrintAllMode] = useState(false);

  const candidate = examCandidates.find(c => c.studentId === selectedStudentId) || examCandidates[0];
  const student = students.find(s => s.id === (candidate ? candidate.studentId : selectedStudentId)) || students[0];

  const examSchedules = [
    { hariTanggal: 'Senin, 18 Mei 2026', waktu: '08.00 - 10.00 WIB', mapel: 'Bahasa Indonesia' },
    { hariTanggal: 'Selasa, 19 Mei 2026', waktu: '08.00 - 10.00 WIB', mapel: 'Matematika' },
    { hariTanggal: 'Rabu, 20 Mei 2026', waktu: '08.00 - 10.00 WIB', mapel: 'Ilmu Pengetahuan Alam (IPA)' },
    { hariTanggal: 'Kamis, 21 Mei 2026', waktu: '08.00 - 09.30 WIB', mapel: 'Pendidikan Agama & Budi Pekerti' },
    { hariTanggal: 'Jumat, 22 Mei 2026', waktu: '08.00 - 09.30 WIB', mapel: 'Pendidikan Pancasila (PPKn)' },
  ];

  const renderSingleCard = (cand: typeof examCandidates[0], st: typeof student, index: number) => {
    return (
      <div
        key={cand ? cand.id : index}
        className="border-2 border-slate-900 p-5 rounded-lg bg-white relative max-w-xl mx-auto break-inside-avoid mb-6 shadow-xs text-xs"
      >
        {/* Format Tag & Kop Mini */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2 mb-3">
          <div className="text-left">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase">
              DINAS PENDIDIKAN KOTA {schoolProfile.kabupatenKota}
            </h4>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase">
              {schoolProfile.namaSekolah}
            </h2>
            <p className="text-[9px] text-slate-500 font-mono">
              NPSN: {schoolProfile.npsn} · T.A. {schoolProfile.tahunAjaranAktif}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold border border-slate-900 px-1.5 py-0.5 uppercase bg-slate-50">
              Format : S-17
            </span>
          </div>
        </div>

        {/* Card Title */}
        <div className="text-center mb-3">
          <h3 className="font-extrabold text-xs tracking-wider uppercase underline">
            KARTU TANDA PESERTA UJIAN SEKOLAH
          </h3>
        </div>

        {/* Student Identitas & Photo */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1 space-y-1 text-[11px]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-32 text-slate-600 font-medium">Nomor Peserta</td>
                  <td className="w-3">:</td>
                  <td className="font-mono font-bold text-sm text-slate-900">
                    {cand ? cand.nomorPesertaUjian : `01-04-20-${st?.nis.slice(-3)}-8`}
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium">Nama Peserta</td>
                  <td>:</td>
                  <td className="font-bold uppercase text-slate-900">{st?.namaLengkap}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium">NIS / NISN</td>
                  <td>:</td>
                  <td className="font-mono">{st?.nis} / {st?.nisn}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium">Tempat, Tgl Lahir</td>
                  <td>:</td>
                  <td>{st?.tempatLahir}, {st?.tanggalLahir}</td>
                </tr>
                <tr>
                  <td className="text-slate-600 font-medium">Kelas / Ruang</td>
                  <td>:</td>
                  <td className="font-semibold">Kelas {st?.kelasSekarang} / Ruang 01</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="w-20 h-24 border border-slate-400 bg-slate-50 flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono shrink-0">
            <span>Pas Foto</span>
            <span>2 x 3 cm</span>
          </div>
        </div>

        {/* Jadwal Ujian & Paraf Pengawas */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-800 uppercase mb-1">
            Jadwal Mata Pelajaran &amp; Verifikasi Kehadiran:
          </p>
          <table className="w-full border-collapse border border-slate-800 text-[10px]">
            <thead className="bg-slate-100 font-bold text-center">
              <tr>
                <th className="border border-slate-800 p-1 w-6">No</th>
                <th className="border border-slate-800 p-1">Hari, Tanggal</th>
                <th className="border border-slate-800 p-1">Waktu</th>
                <th className="border border-slate-800 p-1 text-left">Mata Pelajaran</th>
                <th className="border border-slate-800 p-1 w-16">Paraf Pengawas</th>
              </tr>
            </thead>
            <tbody>
              {examSchedules.map((sch, i) => (
                <tr key={i} className="text-center">
                  <td className="border border-slate-800 p-1 font-mono">{i + 1}</td>
                  <td className="border border-slate-800 p-1 text-left">{sch.hariTanggal}</td>
                  <td className="border border-slate-800 p-1 font-mono">{sch.waktu}</td>
                  <td className="border border-slate-800 p-1 text-left font-semibold">{sch.mapel}</td>
                  <td className="border border-slate-800 p-1 text-slate-300">......</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Signature */}
        <div className="flex justify-between items-end text-[10px] pt-1">
          <div className="italic text-slate-500">
            * Harap dibawa setiap sesi ujian berlangsung.
          </div>
          <div className="text-center">
            <p>{schoolProfile.kabupatenKota}, 15 Mei 2026</p>
            <p className="font-semibold">Kepala Sekolah,</p>
            <div className="h-12"></div>
            <p className="font-bold underline uppercase">{schoolProfile.namaKepalaSekolah}</p>
            <p className="font-mono">NIP. {schoolProfile.nipKepalaSekolah}</p>
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
            <span className="text-xs font-semibold text-slate-700">Pilih Peserta Ujian:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs truncate"
              disabled={printAllMode}
            >
              {examCandidates.map(c => (
                <option key={c.studentId} value={c.studentId}>
                  {c.nomorPesertaUjian} - {c.namaLengkap} (Kelas {c.kelas})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={printAllMode}
              onChange={e => setPrintAllMode(e.target.checked)}
              className="rounded"
            />
            <span>Mode Cetak Seluruh Peserta ({examCandidates.length} Siswa)</span>
          </label>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Kartu Ujian (Format S-17)</span>
        </button>
      </div>

      {/* Printable Area */}
      <div className="print:border-none print:shadow-none print:p-0 print:m-0">
        {printAllMode ? (
          <div className="space-y-6">
            {examCandidates.map((cand, idx) => {
              const st = students.find(s => s.id === cand.studentId) || student;
              return renderSingleCard(cand, st, idx);
            })}
          </div>
        ) : (
          renderSingleCard(candidate, student, 0)
        )}
      </div>
    </div>
  );
};
