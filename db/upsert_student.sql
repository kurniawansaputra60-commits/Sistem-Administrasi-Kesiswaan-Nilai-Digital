-- Endpoint: POST /upsert_student
-- Description: Menambah atau memperbarui data siswa pada TiDB Cloud
-- Parameters:
--   ${id}, ${school_id}, ${nis}, ${nisn}, ${nama_lengkap}, ${nama_panggilan},
--   ${jenis_kelamin}, ${tempat_lahir}, ${tanggal_lahir}, ${agama}, ${kewarganegaraan},
--   ${alamat}, ${kelas_sekarang}, ${rombel}, ${status_siswa},
--   ${ayah_nama}, ${ayah_pekerjaan}, ${ibu_nama}, ${ibu_pekerjaan}

USE `db_kesiswaan_sekolah`;

INSERT INTO `students` (
  `id`, `school_id`, `nis`, `nisn`, `nama_lengkap`, `nama_panggilan`,
  `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `kewarganegaraan`,
  `alamat`, `kelas_sekarang`, `rombel`, `status_siswa`,
  `ayah_nama`, `ayah_pekerjaan`, `ibu_nama`, `ibu_pekerjaan`
) VALUES (
  ${id}, ${school_id}, ${nis}, ${nisn}, ${nama_lengkap}, ${nama_panggilan},
  ${jenis_kelamin}, ${tempat_lahir}, ${tanggal_lahir}, ${agama}, ${kewarganegaraan},
  ${alamat}, ${kelas_sekarang}, ${rombel}, ${status_siswa},
  ${ayah_nama}, ${ayah_pekerjaan}, ${ibu_nama}, ${ibu_pekerjaan}
)
ON DUPLICATE KEY UPDATE
  `nis` = VALUES(`nis`),
  `nisn` = VALUES(`nisn`),
  `nama_lengkap` = VALUES(`nama_lengkap`),
  `nama_panggilan` = VALUES(`nama_panggilan`),
  `jenis_kelamin` = VALUES(`jenis_kelamin`),
  `tempat_lahir` = VALUES(`tempat_lahir`),
  `tanggal_lahir` = VALUES(`tanggal_lahir`),
  `agama` = VALUES(`agama`),
  `alamat` = VALUES(`alamat`),
  `kelas_sekarang` = VALUES(`kelas_sekarang`),
  `rombel` = VALUES(`rombel`),
  `status_siswa` = VALUES(`status_siswa`),
  `ayah_nama` = VALUES(`ayah_nama`),
  `ayah_pekerjaan` = VALUES(`ayah_pekerjaan`),
  `ibu_nama` = VALUES(`ibu_nama`),
  `ibu_pekerjaan` = VALUES(`ibu_pekerjaan`),
  `updated_at` = CURRENT_TIMESTAMP;
