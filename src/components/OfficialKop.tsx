import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { isKelasMatch, formatKelasName, normalizeKelas, toRomanClass, formatIndonesianDate } from '../utils/classUtils';

export interface OfficialKopProps {
  formatCode?: string;
  formatTitle?: string;
  title?: string;
  subTitle?: string;
  subtitle?: string;
  kelas?: string;
  rombel?: string;
  showSignature?: boolean;
}

export const OfficialKop: React.FC<OfficialKopProps> = ({
  formatCode,
  formatTitle,
  title,
  subTitle,
  subtitle,
  kelas,
}) => {
  const { schoolProfile } = useSchool();
  const displayTitle = formatTitle || title || 'DOKUMEN KESISWAAN RESMI';
  const displaySubtitle = subTitle || subtitle || `TAHUN AJARAN ${schoolProfile.tahunAjaranAktif} · SEMESTER ${schoolProfile.semesterAktif === '1' ? 'GANJIL' : 'GENAP'}`;

  // Cek apakah menggunakan banner kop resmi bergambar (seperti di KOP_SURAT_NEW_e0e5ed69.png)
  const bannerUrl = schoolProfile.kopBannerUrl || '/assets/aistudio/KOP_SURAT_NEW_e0e5ed69.png';
  const useBanner = schoolProfile.useBannerKop !== false && !!bannerUrl;

  return (
    <div className="mb-6">
      {/* Format Tag in Top Right for Official Kemdikbud / Depdiknas standard */}
      {formatCode && (
        <div className="flex justify-end mb-2">
          <div className="px-3 py-1 border border-slate-800 text-xs font-bold tracking-wider uppercase bg-white">
            {formatCode.startsWith('Format') ? formatCode : `Format : ${formatCode}`}
          </div>
        </div>
      )}

      {/* Official Letterhead (Kop Sekolah) */}
      {useBanner ? (
        <div className="w-full text-center pb-2">
          <img
            src={bannerUrl}
            alt="KOP SURAT RESMI SEKOLAH"
            className="w-full max-h-36 object-contain mx-auto block print:max-h-32"
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4 pb-2 text-slate-900">
            {/* Logo Kiri: Logo Pemda / Daerah */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {schoolProfile.logoDaerahUrl ? (
                <img
                  src={schoolProfile.logoDaerahUrl}
                  alt="Logo Daerah"
                  className="max-h-20 max-w-20 object-contain"
                />
              ) : (
                <div className="w-16 h-18 border-2 border-slate-700 flex flex-col items-center justify-center p-1 text-center rounded">
                  <div className="w-6 h-6 border border-slate-600 rounded-full mb-1 flex items-center justify-center text-[8px] font-bold">🏛️</div>
                  <span className="text-[7px] font-bold uppercase leading-tight">LEBAK</span>
                </div>
              )}
            </div>

            {/* Teks Kop Tengah */}
            <div className="flex-1 text-center">
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 uppercase">
                {schoolProfile.pemerintahDaerah || `PEMERINTAH KABUPATEN ${schoolProfile.kabupatenKota.toUpperCase()}`}
              </h3>
              <h4 className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 uppercase">
                {schoolProfile.dinasPendidikan || 'DINAS PENDIDIKAN'}
              </h4>
              <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-wide uppercase mt-0.5">
                {schoolProfile.uptdSatuanPendidikan || `UPTD SATUAN PENDIDIKAN ${schoolProfile.namaSekolah}`}
              </h1>
              <h2 className="text-xs font-bold text-slate-900 uppercase">
                KECAMATAN {schoolProfile.kecamatan.toUpperCase()}
              </h2>
              {schoolProfile.akreditasi && (
                <p className="text-[11px] font-semibold text-slate-800">
                  {schoolProfile.akreditasi}
                </p>
              )}
              <p className="text-[10px] sm:text-xs text-slate-700 mt-0.5">
                {schoolProfile.alamat} Kodepos: {schoolProfile.kodePos}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-700 italic">
                NPSN: <span className="font-mono font-semibold">{schoolProfile.npsn}</span> | NSS: <span className="font-mono font-semibold">{schoolProfile.nss}</span> | Email: {schoolProfile.email} {schoolProfile.website ? `| website: ${schoolProfile.website}` : ''}
              </p>
            </div>

            {/* Logo Kanan: Logo Sekolah */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {schoolProfile.logoSekolahUrl ? (
                <img
                  src={schoolProfile.logoSekolahUrl}
                  alt="Logo Sekolah"
                  className="max-h-20 max-w-20 object-contain"
                />
              ) : (
                <div className="w-16 h-18 border-2 border-amber-700 bg-amber-50 flex flex-col items-center justify-center p-1 text-center rounded">
                  <div className="w-6 h-6 bg-amber-600 text-white rounded-full mb-1 flex items-center justify-center text-[9px] font-bold">🏫</div>
                  <span className="text-[7px] font-bold text-amber-900 uppercase leading-tight">SDN 1 CEMPAKA</span>
                </div>
              )}
            </div>
          </div>

          {/* Garis Ganda Kop Surat Resmi Standar Pemerintah */}
          <div className="border-b-[3px] border-slate-950 mb-0.5"></div>
          <div className="border-b border-slate-950 mb-4"></div>
        </div>
      )}

      {/* Document Title Header */}
      <div className="text-center my-4">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-950 tracking-wider uppercase">
          {displayTitle}
        </h2>
        {kelas && (
          <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
            KELAS : {kelas}
          </p>
        )}
        <p className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5">
          {displaySubtitle}
        </p>
      </div>
    </div>
  );
};

export interface OfficialSignatureProps {
  kelas?: string;
  rombel?: string; // 'A', 'B', etc.
  waliKelasLabel?: string;
  waliKelasNama?: string;
  waliKelasNip?: string;
  waliKelasTtdUrl?: string;
  kepalaTtdUrl?: string;
  rightTitle?: string;
  rightName?: string;
  rightNip?: string;
  leftTitle?: string;
  leftName?: string;
  leftNip?: string;
  city?: string;
  date?: string;
  useAdminOfficer?: boolean;
}

export const OfficialSignature: React.FC<OfficialSignatureProps> = ({
  kelas,
  rombel,
  waliKelasLabel,
  waliKelasNama,
  waliKelasNip,
  waliKelasTtdUrl,
  kepalaTtdUrl,
  rightTitle,
  rightName,
  rightNip,
  leftTitle,
  leftName,
  leftNip,
  city,
  date,
  useAdminOfficer = false,
}) => {
  const { schoolProfile } = useSchool();
  const { userProfile } = useAuth();
  const isGuruKelas = userProfile?.role === 'guru_kelas';

  const formattedDate = formatIndonesianDate(date || schoolProfile.tanggalDokumen);

  const kepalaTitle = rightTitle || `Kepala ${schoolProfile.namaSekolah}`;
  const kepalaName = rightName || schoolProfile.namaKepalaSekolah;
  const kepalaNip = rightNip || schoolProfile.nipKepalaSekolah;
  const kepalaTtd = kepalaTtdUrl || schoolProfile.kepalaSekolahTtdUrl;

  // Active class & rombel resolution
  const activeKelas = kelas || (isGuruKelas ? userProfile?.kelasTugas : undefined) || '1';
  const activeRombel = rombel || (isGuruKelas ? userProfile?.rombelTugas : undefined) || 'A';

  // Otomatis deteksi Wali Kelas & TTD berdasarkan kelas & rombel jika tersedia
  let detectedWaliNama = (isGuruKelas && userProfile?.displayName) ? userProfile.displayName : schoolProfile.namaWaliKelas;
  let detectedWaliNip = (isGuruKelas && userProfile?.nip) ? userProfile.nip : schoolProfile.nipWaliKelas;
  let detectedWaliTtd: string | undefined = undefined;

  if (activeKelas && schoolProfile.waliKelasList) {
    const wk = (activeRombel
      ? schoolProfile.waliKelasList.find(w => isKelasMatch(w.kelas, activeKelas) && (w.rombel === activeRombel || (!w.rombel && activeRombel === 'A')))
      : null) || schoolProfile.waliKelasList.find(w => isKelasMatch(w.kelas, activeKelas));

    if (wk) {
      detectedWaliNama = wk.nama;
      detectedWaliNip = wk.nip;
      detectedWaliTtd = wk.ttdUrl;
    }
  }

  const romanCls = toRomanClass(activeKelas);
  const rombelSuffix = activeRombel ? ` ${activeRombel}` : '';
  const defaultStaffTitle = `Wali Kelas ${romanCls}${rombelSuffix}`;

  let staffTitle: string;
  let staffName: string;
  let staffNip: string;
  let staffTtd: string | undefined;

  if (useAdminOfficer) {
    staffTitle = leftTitle || waliKelasLabel || 'Petugas Administrasi / Pengelola Kesiswaan';
    staffName = leftName || waliKelasNama || schoolProfile.namaPetugasAdmin || 'KURNIAWAN SAPUTRA';
    staffNip = leftNip || waliKelasNip || schoolProfile.nipPetugasAdmin || '19890906 202521 1 004';
    staffTtd = waliKelasTtdUrl;
  } else {
    staffTitle = leftTitle || waliKelasLabel || defaultStaffTitle;
    staffName = leftName || waliKelasNama || detectedWaliNama;
    staffNip = leftNip || waliKelasNip || detectedWaliNip;
    staffTtd = waliKelasTtdUrl || detectedWaliTtd;
  }

  return (
    <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-slate-900 break-inside-avoid">
      <div>
        <p>Mengetahui,</p>
        <p className="font-semibold">{kepalaTitle}</p>
        <div className="h-16 flex items-center justify-center my-0.5">
          {kepalaTtd ? (
            <img
              src={kepalaTtd}
              alt="TTD Kepala Sekolah"
              className="h-14 max-w-[140px] object-contain mx-auto"
            />
          ) : (
            <div className="h-14"></div>
          )}
        </div>
        <p className="font-bold underline uppercase">{kepalaName}</p>
        <p className="font-mono">NIP. {kepalaNip}</p>
      </div>
      <div>
        <p>{city || schoolProfile.kabupatenKota}, {formattedDate}</p>
        <p className="font-semibold">{staffTitle}</p>
        <div className="h-16 flex items-center justify-center my-0.5">
          {staffTtd ? (
            <img
              src={staffTtd}
              alt={`TTD ${staffTitle}`}
              className="h-14 max-w-[140px] object-contain mx-auto"
            />
          ) : (
            <div className="h-14"></div>
          )}
        </div>
        <p className="font-bold underline uppercase">{staffName}</p>
        <p className="font-mono">NIP. {staffNip}</p>
      </div>
    </div>
  );
};
