-- Endpoint: GET /get_attendances
-- Description: Mengambil data presensi harian per kelas dan tanggal
-- Parameters:
--   ${school_id} : ID NPSN Sekolah
--   ${kelas}     : Kelas (e.g. 'I', 'II', etc.)
--   ${tanggal}   : Tanggal YYYY-MM-DD

USE `db_kesiswaan_sekolah`;

SELECT 
  a.id,
  a.school_id,
  a.tanggal,
  a.kelas,
  a.student_id,
  s.nis,
  s.nama_lengkap,
  a.status
FROM `daily_attendances` a
JOIN `students` s ON a.student_id = s.id
WHERE a.school_id = ${school_id}
  AND a.kelas = ${kelas}
  AND a.tanggal = ${tanggal}
ORDER BY s.nama_lengkap ASC;
