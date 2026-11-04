-- Endpoint: GET /get_student_by_id
-- Description: Mengambil data detail seorang siswa lengkap beserta orang tua
-- Parameters:
--   ${school_id}  : ID NPSN Sekolah
--   ${student_id} : ID UUID Siswa

USE `db_kesiswaan_sekolah`;

SELECT 
  s.*
FROM `students` s
WHERE s.school_id = ${school_id}
  AND s.id = ${student_id}
LIMIT 1;
