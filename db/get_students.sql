-- Endpoint: GET /get_students
-- Description: Mengambil daftar siswa berdasarkan school_id dengan filter opsional kelas dan pencarian nama/NISN
-- Parameters:
--   ${school_id} : ID NPSN Sekolah (e.g. '20602495')
--   ${kelas}     : Kelas siswa (e.g. 'I', 'II', atau '%' untuk semua kelas)
--   ${search}    : Kata kunci pencarian (e.g. 'Andi' atau '%' untuk semua siswa)

USE `db_kesiswaan_sekolah`;

SELECT 
  s.id,
  s.school_id,
  s.nis,
  s.nisn,
  s.nama_lengkap,
  s.nama_panggilan,
  s.jenis_kelamin,
  s.tempat_lahir,
  s.tanggal_lahir,
  s.agama,
  s.kewarganegaraan,
  s.anak_ke,
  s.jumlah_saudara,
  s.bahasa_sehari_hari,
  s.alamat,
  s.kelurahan,
  s.kecamatan,
  s.kabupaten_kota,
  s.provinsi,
  s.telepon,
  s.no_hp,
  s.status_siswa,
  s.kelas_sekarang,
  s.rombel,
  s.tanggal_diterima,
  s.diterima_di_kelas,
  s.asal_sekolah,
  s.no_ijazah_sebelumnya,
  s.tahun_ijazah,
  s.ayah_nama,
  s.ayah_pendidikan,
  s.ayah_pekerjaan,
  s.ayah_penghasilan,
  s.ayah_hp,
  s.ibu_nama,
  s.ibu_pendidikan,
  s.ibu_pekerjaan,
  s.ibu_penghasilan,
  s.ibu_hp,
  s.created_at,
  s.updated_at
FROM `students` s
WHERE s.school_id = ${school_id}
  AND (${kelas} = '%' OR s.kelas_sekarang = ${kelas})
  AND (${search} = '%' OR s.nama_lengkap LIKE CONCAT('%', ${search}, '%') OR s.nisn LIKE CONCAT('%', ${search}, '%') OR s.nis LIKE CONCAT('%', ${search}, '%'))
ORDER BY s.kelas_sekarang ASC, s.nama_lengkap ASC;
