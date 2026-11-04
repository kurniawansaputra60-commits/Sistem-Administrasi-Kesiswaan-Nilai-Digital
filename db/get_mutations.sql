-- Endpoint: GET /get_mutations
-- Description: Mengambil data mutasi siswa masuk dan keluar (Format S-14)
-- Parameters:
--   ${school_id} : ID NPSN Sekolah
--   ${semester}  : Semester '1' atau '2' (atau '%' untuk semua)

USE `db_kesiswaan_sekolah`;

SELECT 
  id,
  school_id,
  student_id,
  student_name,
  nis,
  jenis_kelamin,
  jenis_mutasi,
  tanggal_mutasi,
  kelas,
  rombel,
  semester,
  sekolah_asal_tujuan,
  alasan_mutasi,
  nomor_surat,
  keterangan
FROM `student_mutations`
WHERE school_id = ${school_id}
  AND (${semester} = '%' OR semester = ${semester})
ORDER BY tanggal_mutasi DESC;
