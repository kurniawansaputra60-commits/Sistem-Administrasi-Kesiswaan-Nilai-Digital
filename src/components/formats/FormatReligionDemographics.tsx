import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Religion } from '../../types';
import { ALL_ROMBELS, normalizeKelas } from '../../utils/classUtils';
import { Printer } from 'lucide-react';

export const FormatReligionDemographics: React.FC = () => {
  const { students, schoolProfile } = useSchool();

  const activeStudents = students.filter(s => s.statusSiswa === 'aktif');

  const religions: { key: Religion; label: string }[] = [
    { key: 'Islam', label: 'Islam' },
    { key: 'Kristen', label: 'Kristen' },
    { key: 'Katolik', label: 'Katolik' },
    { key: 'Hindu', label: 'Hindu' },
    { key: 'Buddha', label: 'Buddha' },
    { key: 'Khonghucu', label: 'Khonghucu' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-slate-800">
            Laporan Jumlah Siswa Menurut Rombel, Agama, dan Jenis Kelamin (Format PS-7a)
          </h2>
          <p className="text-[11px] text-slate-500">
            Digunakan untuk pemetaan guru Pendidikan Agama dan Budi Pekerti disusun per rombel (1A - 6B)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <span className="text-slate-500">Penandatangan:</span>
            <span className="text-emerald-800 font-bold">KURNIAWAN SAPUTRA</span>
            <span className="text-[10px] text-slate-500 font-mono">(Pengelola Statistik)</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Agama</span>
          </button>
        </div>
      </div>

      {/* Official Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="Format PS-7a"
          formatTitle="JUMLAH SISWA MENURUT KELAS, AGAMA, DAN JENIS KELAMIN"
          subTitle={`KEADAAN TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={3}>No.</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={3}>Kelas &amp; Rombel</th>
                <th className="border border-slate-800 p-2" colSpan={religions.length * 3}>
                  Agama yang Dianut
                </th>
                <th className="border border-slate-800 p-2" colSpan={3} rowSpan={2}>
                  Jumlah Seluruhnya
                </th>
              </tr>
              <tr>
                {religions.map(r => (
                  <th key={r.key} className="border border-slate-800 p-1.5" colSpan={3}>
                    {r.label}
                  </th>
                ))}
              </tr>
              <tr className="text-[10px]">
                {religions.map(r => (
                  <React.Fragment key={r.key}>
                    <th className="border border-slate-800 p-1 w-6">L</th>
                    <th className="border border-slate-800 p-1 w-6">P</th>
                    <th className="border border-slate-800 p-1 w-7 bg-slate-200">Jml</th>
                  </React.Fragment>
                ))}
                <th className="border border-slate-800 p-1 w-7">L</th>
                <th className="border border-slate-800 p-1 w-7">P</th>
                <th className="border border-slate-800 p-1 w-9 bg-slate-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {ALL_ROMBELS.map((rInfo, idx) => {
                const inClass = activeStudents.filter(s => {
                  const matchK = normalizeKelas(s.kelasSekarang) === rInfo.kelas;
                  const sRombel = s.rombel || 'A';
                  return matchK && sRombel === rInfo.rombel;
                });
                const totalL = inClass.filter(s => s.jenisKelamin === 'L').length;
                const totalP = inClass.filter(s => s.jenisKelamin === 'P').length;

                return (
                  <tr key={rInfo.code} className="hover:bg-slate-50 text-center">
                    <td className="border border-slate-800 p-1.5 font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-1.5 font-bold text-left pl-3">{rInfo.label}</td>
                    {religions.map(r => {
                      const match = inClass.filter(s => s.agama === r.key);
                      const l = match.filter(s => s.jenisKelamin === 'L').length;
                      const p = match.filter(s => s.jenisKelamin === 'P').length;
                      return (
                        <React.Fragment key={r.key}>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{l || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums">{p || '-'}</td>
                          <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold bg-slate-50">
                            {match.length || '-'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{totalL}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-semibold">{totalP}</td>
                    <td className="border border-slate-800 p-1 font-mono tabular-nums font-bold bg-slate-100">{inClass.length}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 text-center font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="border border-slate-800 p-2" colSpan={2}>Jumlah Seluruhnya</td>
                {religions.map(r => {
                  const matchAll = activeStudents.filter(s => s.agama === r.key);
                  const l = matchAll.filter(s => s.jenisKelamin === 'L').length;
                  const p = matchAll.filter(s => s.jenisKelamin === 'P').length;
                  return (
                    <React.Fragment key={r.key}>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{l || '-'}</td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums">{p || '-'}</td>
                      <td className="border border-slate-800 p-1.5 font-mono tabular-nums bg-slate-200">{matchAll.length || '-'}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {activeStudents.filter(s => s.jenisKelamin === 'L').length}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums">
                  {activeStudents.filter(s => s.jenisKelamin === 'P').length}
                </td>
                <td className="border border-slate-800 p-1.5 font-mono tabular-nums text-emerald-900 bg-slate-200 font-bold">
                  {activeStudents.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <OfficialSignature
          useAdminOfficer={true}
          leftTitle="Petugas Administrasi / Pengelola Statistik Kesiswaan"
          leftName="KURNIAWAN SAPUTRA"
          leftNip="19890906 202521 1 004"
        />
      </div>
    </div>
  );
};
