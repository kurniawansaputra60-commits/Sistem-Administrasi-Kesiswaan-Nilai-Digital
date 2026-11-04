-- Endpoint: GET /report_rekap_absensi_s11
-- Description: Laporan Rekapitulasi Absensi Bulanan Format S-11 (Hadir, Sakit, Izin, Alpa, % Kehadiran)
-- Parameters:
--   ${school_id}  : ID NPSN Sekolah
--   ${kelas}      : Kelas (e.g. 'I', 'VI')
--   ${bulan_tahun}: Tahun dan Bulan (e.g. '2026-11' atau '2025-07')

USE `db_kesiswaan_sekolah`;

SELECT 
  s.id AS student_id,
  s.nis,
  s.nisn,
  s.nama_lengkap,
  s.jenis_kelamin,
  s.kelas_sekarang AS kelas,
  s.rombel,

  -- Akumulasi Kehadiran
  COUNT(CASE WHEN a.status = 'H' THEN 1 END) AS jumlah_hadir,
  COUNT(CASE WHEN a.status = 'S' THEN 1 END) AS jumlah_sakit,
  COUNT(CASE WHEN a.status = 'I' THEN 1 END) AS jumlah_izin,
  COUNT(CASE WHEN a.status = 'A' THEN 1 END) AS jumlah_alpa,
  COUNT(a.id) AS total_hari_efektif,

  -- Persentase Kehadiran
  CASE 
    WHEN COUNT(a.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN a.status = 'H' THEN 1 END) / COUNT(a.id)) * 100, 1)
    ELSE 100.0
  END AS persentase_kehadiran

FROM `students` s
LEFT JOIN `daily_attendances` a 
  ON s.id = a.student_id 
  AND s.school_id = a.school_id 
  AND DATE_FORMAT(a.tanggal, '%Y-%m') = ${bulan_tahun}
WHERE s.school_id = ${school_id}
  AND s.kelas_sekarang = ${kelas}
  AND s.status_siswa = 'aktif'
GROUP BY s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin, s.kelas_sekarang, s.rombel
ORDER BY s.nama_lengkap ASC;
