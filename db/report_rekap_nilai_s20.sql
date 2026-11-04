-- Endpoint: GET /report_rekap_nilai_s20
-- Description: Laporan Rekapitulasi Nilai Rapor / Buku Induk Format S-20 secara mendatar (Pivot Kolom per Mata Pelajaran)
-- Parameters:
--   ${school_id}    : ID NPSN Sekolah (e.g. '20602495')
--   ${kelas}        : Kelas (e.g. 'VI', 'V', dll)
--   ${semester_key} : Kunci Semester (e.g. '2025/2026-2')

USE `db_kesiswaan_sekolah`;

SELECT 
  s.id AS student_id,
  s.nis,
  s.nisn,
  s.nama_lengkap,
  s.jenis_kelamin,
  s.kelas_sekarang AS kelas,
  s.rombel,
  
  -- 1. Pendidikan Agama dan Budi Pekerti
  MAX(CASE WHEN g.subject_id IN ('pai', 'agama', 'pendidikan_agama') THEN g.nilai_akhir ELSE NULL END) AS nilai_agama,
  MAX(CASE WHEN g.subject_id IN ('pai', 'agama', 'pendidikan_agama') THEN g.predikat ELSE NULL END) AS predikat_agama,

  -- 2. Pendidikan Pancasila / PKn
  MAX(CASE WHEN g.subject_id IN ('pkn', 'pancasila', 'ppkn') THEN g.nilai_akhir ELSE NULL END) AS nilai_pkn,
  MAX(CASE WHEN g.subject_id IN ('pkn', 'pancasila', 'ppkn') THEN g.predikat ELSE NULL END) AS predikat_pkn,

  -- 3. Bahasa Indonesia
  MAX(CASE WHEN g.subject_id IN ('bindo', 'bahasa_indonesia') THEN g.nilai_akhir ELSE NULL END) AS nilai_bindo,
  MAX(CASE WHEN g.subject_id IN ('bindo', 'bahasa_indonesia') THEN g.predikat ELSE NULL END) AS predikat_bindo,

  -- 4. Matematika
  MAX(CASE WHEN g.subject_id IN ('mtk', 'matematika') THEN g.nilai_akhir ELSE NULL END) AS nilai_mtk,
  MAX(CASE WHEN g.subject_id IN ('mtk', 'matematika') THEN g.predikat ELSE NULL END) AS predikat_mtk,

  -- 5. Ilmu Pengetahuan Alam dan Sosial (IPAS)
  MAX(CASE WHEN g.subject_id IN ('ipas', 'ipa', 'ips') THEN g.nilai_akhir ELSE NULL END) AS nilai_ipas,
  MAX(CASE WHEN g.subject_id IN ('ipas', 'ipa', 'ips') THEN g.predikat ELSE NULL END) AS predikat_ipas,

  -- 6. Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
  MAX(CASE WHEN g.subject_id IN ('pjok', 'penjas') THEN g.nilai_akhir ELSE NULL END) AS nilai_pjok,
  MAX(CASE WHEN g.subject_id IN ('pjok', 'penjas') THEN g.predikat ELSE NULL END) AS predikat_pjok,

  -- 7. Seni dan Budaya (SBdP)
  MAX(CASE WHEN g.subject_id IN ('sbdp', 'seni_budaya', 'seni') THEN g.nilai_akhir ELSE NULL END) AS nilai_sbdp,
  MAX(CASE WHEN g.subject_id IN ('sbdp', 'seni_budaya', 'seni') THEN g.predikat ELSE NULL END) AS predikat_sbdp,

  -- 8. Muatan Lokal / Bahasa Daerah
  MAX(CASE WHEN g.subject_id IN ('mulok', 'bahasa_daerah', 'bahasa_sunda', 'bahasa_jawa') THEN g.nilai_akhir ELSE NULL END) AS nilai_mulok,
  MAX(CASE WHEN g.subject_id IN ('mulok', 'bahasa_daerah', 'bahasa_sunda', 'bahasa_jawa') THEN g.predikat ELSE NULL END) AS predikat_mulok,

  -- Statistik Akumulatif
  ROUND(SUM(COALESCE(g.nilai_akhir, 0)), 1) AS total_nilai,
  ROUND(AVG(COALESCE(g.nilai_akhir, 0)), 2) AS rata_rata,
  COUNT(g.subject_id) AS jumlah_mapel,

  -- Ranking Kelas otomatis menggunakan window function
  DENSE_RANK() OVER (
    PARTITION BY s.school_id, s.kelas_sekarang 
    ORDER BY AVG(COALESCE(g.nilai_akhir, 0)) DESC
  ) AS peringkat_kelas

FROM `students` s
LEFT JOIN `student_grades` g 
  ON s.id = g.student_id 
  AND s.school_id = g.school_id 
  AND g.semester_key = ${semester_key}
WHERE s.school_id = ${school_id}
  AND s.kelas_sekarang = ${kelas}
  AND s.status_siswa = 'aktif'
GROUP BY s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin, s.kelas_sekarang, s.rombel
ORDER BY rata_rata DESC, s.nama_lengkap ASC;
