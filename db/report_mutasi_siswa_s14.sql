-- Endpoint: GET /report_mutasi_siswa_s14
-- Description: Laporan Rekapitulasi Buku Mutasi Siswa Format S-14 (Masuk & Keluar)
-- Parameters:
--   ${school_id} : ID NPSN Sekolah
--   ${semester}  : Semester '1' atau '2'
--   ${tahun}     : Tahun (e.g. '2025' atau '2026')

USE `db_kesiswaan_sekolah`;

SELECT 
  m.id,
  m.tanggal_mutasi,
  m.jenis_mutasi,
  m.nis,
  m.student_name,
  m.jenis_kelamin,
  m.kelas,
  m.rombel,
  m.sekolah_asal_tujuan,
  m.alasan_mutasi,
  m.nomor_surat,
  m.keterangan
FROM `student_mutations` m
WHERE m.school_id = ${school_id}
  AND m.semester = ${semester}
  AND YEAR(m.tanggal_mutasi) = ${tahun}
ORDER BY m.tanggal_mutasi ASC;
