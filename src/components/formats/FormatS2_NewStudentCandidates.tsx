import React, { useState } from 'react';
import { OfficialKop, OfficialSignature } from '../OfficialKop';
import { useSchool } from '../../context/SchoolContext';
import { Check, CheckCircle2, UserCheck, Plus, Filter } from 'lucide-react';

interface FormatS2Props {
  onOpenAddStudent?: () => void;
}

export const FormatS2_NewStudentCandidates: React.FC<FormatS2Props> = ({ onOpenAddStudent }) => {
  const { students, schoolProfile, updateStudent } = useSchool();
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'calon' | 'aktif'>('ALL');

  // Calon dan siswa baru kelas I
  const candidateStudents = students.filter(
    s => s.statusSiswa === 'calon' || (s.kelasSekarang === 'I' && s.diterimaDiKelas === 'I')
  );

  const filtered = candidateStudents.filter(s => {
    if (filterDecision === 'calon') return s.statusSiswa === 'calon';
    if (filterDecision === 'aktif') return s.statusSiswa === 'aktif';
    return true;
  });

  const handleAcceptCandidate = (id: string) => {
    updateStudent(id, {
      statusSiswa: 'aktif',
      kelasSekarang: 'I',
      diterimaDiKelas: 'I',
    });
  };

  const calculateAgeOnJuly1 = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const target = new Date(2026, 6, 1); // 1 Juli 2026
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} th ${months} bl`;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterDecision('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterDecision === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({candidateStudents.length})
            </button>
            <button
              onClick={() => setFilterDecision('calon')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterDecision === 'calon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu Seleksi ({candidateStudents.filter(s => s.statusSiswa === 'calon').length})
            </button>
            <button
              onClick={() => setFilterDecision('aktif')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterDecision === 'aktif' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sudah Diterima ({candidateStudents.filter(s => s.statusSiswa === 'aktif').length})
            </button>
          </div>
        </div>

        {onOpenAddStudent && (
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Daftarkan Calon Siswa Baru</span>
          </button>
        )}
      </div>

      {/* Official S-2 Ledger Sheet */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 text-xs">
        <OfficialKop
          formatCode="S-2"
          formatTitle="DAFTAR CALON SISWA BARU KELAS I / BUKU PENERIMAAN SISWA BARU"
          subTitle={`PENERIMAAN PESERTA DIDIK BARU TAHUN AJARAN ${schoolProfile.tahunAjaranAktif}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px]">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>No.</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={2}>No. Pendaftaran</th>
                <th className="border border-slate-800 p-2 min-w-[140px]" rowSpan={2}>Nama Lengkap Calon Siswa</th>
                <th className="border border-slate-800 p-2 w-10" rowSpan={2}>L/P</th>
                <th className="border border-slate-800 p-2 min-w-[130px]" rowSpan={2}>Tempat &amp; Tanggal Lahir</th>
                <th className="border border-slate-800 p-2 w-20" rowSpan={2}>Usia (per 1 Juli)</th>
                <th className="border border-slate-800 p-2 w-16" rowSpan={2}>Agama</th>
                <th className="border border-slate-800 p-2 min-w-[120px]" colSpan={2}>Orang Tua / Wali</th>
                <th className="border border-slate-800 p-2 min-w-[140px]" rowSpan={2}>Alamat Tempat Tinggal</th>
                <th className="border border-slate-800 p-2 min-w-[110px]" rowSpan={2}>Asal TK / PAUD</th>
                <th className="border border-slate-800 p-2 w-24" rowSpan={2}>Keputusan Seleksi</th>
                <th className="border border-slate-800 p-2 w-20 no-print" rowSpan={2}>Tindakan</th>
              </tr>
              <tr>
                <th className="border border-slate-800 p-1.5">Nama Orang Tua</th>
                <th className="border border-slate-800 p-1.5">Pekerjaan</th>
              </tr>
              <tr className="bg-slate-200 text-[9px] font-mono text-slate-600">
                <th className="border border-slate-800 p-0.5">1</th>
                <th className="border border-slate-800 p-0.5">2</th>
                <th className="border border-slate-800 p-0.5">3</th>
                <th className="border border-slate-800 p-0.5">4</th>
                <th className="border border-slate-800 p-0.5">5</th>
                <th className="border border-slate-800 p-0.5">6</th>
                <th className="border border-slate-800 p-0.5">7</th>
                <th className="border border-slate-800 p-0.5">8</th>
                <th className="border border-slate-800 p-0.5">9</th>
                <th className="border border-slate-800 p-0.5">10</th>
                <th className="border border-slate-800 p-0.5">11</th>
                <th className="border border-slate-800 p-0.5">12</th>
                <th className="border border-slate-800 p-0.5 no-print">13</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => {
                const isAccepted = student.statusSiswa === 'aktif';
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-800 p-2 font-mono font-semibold">{student.nis}</td>
                    <td className="border border-slate-800 p-2 font-bold">{student.namaLengkap}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">{student.jenisKelamin}</td>
                    <td className="border border-slate-800 p-2">
                      {student.tempatLahir}, {student.tanggalLahir}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-mono">
                      {calculateAgeOnJuly1(student.tanggalLahir)}
                    </td>
                    <td className="border border-slate-800 p-2 text-center">{student.agama}</td>
                    <td className="border border-slate-800 p-2">{student.dataAyah.nama}</td>
                    <td className="border border-slate-800 p-2">{student.dataAyah.pekerjaan}</td>
                    <td className="border border-slate-800 p-2 text-[10px]">{student.alamat}</td>
                    <td className="border border-slate-800 p-2">{student.asalSekolah}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      {isAccepted ? (
                        <span className="text-emerald-700">DITERIMA</span>
                      ) : (
                        <span className="text-amber-700">PROSES PPDB</span>
                      )}
                    </td>
                    <td className="border border-slate-800 p-2 text-center no-print">
                      {!isAccepted ? (
                        <button
                          onClick={() => handleAcceptCandidate(student.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                          title="Terima sebagai Siswa Baru Kelas I"
                        >
                          Terima Siswa
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Kelas I</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <OfficialSignature
          useAdminOfficer={true}
          leftTitle="Ketua Panitia PPDB"
          leftName="KURNIAWAN SAPUTRA"
          leftNip="19890906 202521 1 004"
        />
      </div>
    </div>
  );
};
