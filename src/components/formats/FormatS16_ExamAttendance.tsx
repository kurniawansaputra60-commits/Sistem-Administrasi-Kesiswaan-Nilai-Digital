import React, { useState } from 'react';
import { OfficialKop } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Check, X, ClipboardCheck } from 'lucide-react';
import { ExamSession } from '../../types';

export const FormatS16_ExamAttendance: React.FC = () => {
  const { schoolProfile, examSessions, saveExamSession, examCandidates } = useSchool();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(examSessions[0]?.id || '');
  const [activeSubject, setActiveSubject] = useState('Bahasa Indonesia');

  const currentSession = examSessions.find(s => s.id === selectedSessionId) || examSessions[0];

  const handleToggleAttendance = (participantId: string) => {
    if (!currentSession) return;
    const updatedParticipants = currentSession.participants.map(p => {
      if (p.id === participantId) {
        const nextStatus: 'HADIR' | 'TIDAK_HADIR' = p.statusHadir === 'HADIR' ? 'TIDAK_HADIR' : 'HADIR';
        return {
          ...p,
          statusHadir: nextStatus,
          tandaTangan: nextStatus === 'HADIR',
        };
      }
      return p;
    });

    saveExamSession({
      ...currentSession,
      participants: updatedParticipants,
    });
  };

  const hadirCount = currentSession?.participants.filter(p => p.statusHadir === 'HADIR').length || 0;
  const absenCount = currentSession?.participants.filter(p => p.statusHadir === 'TIDAK_HADIR').length || 0;
  const totalCount = currentSession?.participants.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Pilih Sesi Ujian:</span>
            <select
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium max-w-xs"
            >
              {examSessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.mataPelajaran} - {s.ruangUjian} ({s.tanggalUjian})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Presensi &amp; Berita Acara (Format S-16)</span>
        </button>
      </div>

      {/* Official S-16 Document Sheet */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-16"
          formatTitle="DAFTAR HADIR PESERTA UJIAN &amp; BERITA ACARA UJIAN"
          subTitle={`UJIAN SEKOLAH / ASESMEN SUMATIF AKHIR TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        {currentSession ? (
          <div className="space-y-4">
            {/* Header Sesi Ujian */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Mata Pelajaran:</span>
                <strong className="text-slate-900">{currentSession.mataPelajaran}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Hari / Tanggal:</span>
                <strong>{currentSession.tanggalUjian}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Waktu Ujian:</span>
                <strong className="font-mono">{currentSession.waktuUjian}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Ruang Ujian:</span>
                <strong>{currentSession.ruangUjian}</strong>
              </div>
            </div>

            {/* Tabel Presensi Peserta Ujian */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-800 text-[11px]">
                <thead className="bg-slate-100 text-slate-900 text-center font-bold">
                  <tr>
                    <th className="border border-slate-800 p-2 w-10">No.</th>
                    <th className="border border-slate-800 p-2 w-28">Nomor Peserta</th>
                    <th className="border border-slate-800 p-2 min-w-[160px] text-left">Nama Lengkap Peserta Didik</th>
                    <th className="border border-slate-800 p-2 w-10">L/P</th>
                    <th className="border border-slate-800 p-2 w-14">Meja</th>
                    <th className="border border-slate-800 p-2 w-24">Status Kehadiran</th>
                    <th className="border border-slate-800 p-2 w-32">Tanda Tangan Peserta</th>
                    <th className="border border-slate-800 p-2 min-w-[120px] text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSession.participants.map((p, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 text-center">
                        <td className="border border-slate-800 p-2 font-mono">{idx + 1}</td>
                        <td className="border border-slate-800 p-2 font-mono font-bold text-slate-900">{p.nomorPeserta}</td>
                        <td className="border border-slate-800 p-2 text-left font-bold">{p.namaLengkap}</td>
                        <td className="border border-slate-800 p-2 font-semibold">{p.jenisKelamin}</td>
                        <td className="border border-slate-800 p-2 font-mono">{p.nomorMeja}</td>
                        <td
                          className="border border-slate-800 p-2 cursor-pointer no-print font-bold"
                          onClick={() => handleToggleAttendance(p.id)}
                          title="Klik untuk mengubah status hadir/tidak hadir"
                        >
                          {p.statusHadir === 'HADIR' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                              HADIR
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                              ABSEN
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-2 print-only font-bold">
                          {p.statusHadir === 'HADIR' ? 'HADIR' : 'ABSEN'}
                        </td>
                        <td className="border border-slate-800 p-2 text-left font-mono text-[10px] h-9">
                          {p.statusHadir === 'HADIR' ? (
                            <div className={`${isEven ? 'text-right pr-4' : 'text-left pl-2'} font-serif italic text-slate-800`}>
                              {idx + 1}. ....................
                            </div>
                          ) : (
                            <span className="text-rose-700 italic">Tidak Hadir</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-2 text-left text-[10px]">
                          {p.statusHadir === 'HADIR' ? 'Tertib' : p.alasanAbsen || 'Izin/Sakit'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bagian Berita Acara Ujian Resmi */}
            <div className="mt-6 p-4 border border-slate-800 rounded space-y-2 text-xs bg-slate-50">
              <h4 className="font-bold text-slate-900 underline uppercase text-center">
                BERITA ACARA PELAKSANAAN UJIAN
              </h4>
              <p className="text-justify leading-relaxed">
                Pada hari ini, <strong className="font-semibold">{currentSession.tanggalUjian}</strong>, telah diselenggarakan Ujian Sekolah untuk mata pelajaran <strong className="font-semibold">{currentSession.mataPelajaran}</strong> bertempat di <strong className="font-semibold">{currentSession.ruangUjian}</strong> {schoolProfile.namaSekolah}.
              </p>
              <div className="grid grid-cols-3 gap-2 py-1 font-semibold">
                <div>Jumlah Peserta Seharusnya : <span className="font-mono">{totalCount}</span> orang</div>
                <div>Jumlah Peserta Hadir : <span className="font-mono text-emerald-800">{hadirCount}</span> orang</div>
                <div>Jumlah Peserta Tidak Hadir : <span className="font-mono text-rose-800">{absenCount}</span> orang</div>
              </div>
              <p className="italic text-slate-600 text-[11px]">
                Catatan Pengawasan: Ujian berlangsung dengan tertib, lancar, dan berintegritas tanpa ditemukan kecurangan.
              </p>
            </div>

            {/* Tanda Tangan Pengawas Ruang */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs mt-6">
              <div>
                <p>Pengawas Ruang I,</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{currentSession.pengawas1}</p>
                <p className="font-mono">NIP. 19800412 200501 2 008</p>
              </div>
              <div>
                <p>Pengawas Ruang II,</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{currentSession.pengawas2}</p>
                <p className="font-mono">NIP. 19830918 200801 1 012</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Pilih sesi ujian untuk melihat lembar presensi dan berita acara.
          </div>
        )}
      </div>
    </div>
  );
};
