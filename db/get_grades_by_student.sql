-- Endpoint: GET /get_grades_by_student
-- Description: Mengambil nilai mata pelajaran siswa berdasarkan semester
-- Parameters:
--   ${school_id}    : ID NPSN Sekolah
--   ${student_id}   : ID UUID Siswa
--   ${semester_key} : Kunci Semester (e.g. '2025/2026-1' atau '2025/2026-2')

USE `db_kesiswaan_sekolah`;

SELECT 
  id,
  school_id,
  student_id,
  semester_key,
  subject_id,
  subject_name,
  kkm,
  tugas,
  uts,
  uas,
  nilai_akhir,
  predikat
FROM `student_grades`
WHERE school_id = ${school_id}
  AND student_id = ${student_id}
  AND semester_key = ${semester_key}
ORDER BY subject_name ASC;
