-- Endpoint: GET /get_school_profile
-- Description: Mengambil data profil sekolah lengkap (KOP, Kepala Sekolah, Petugas Admin)
-- Parameters:
--   ${school_id} : ID NPSN Sekolah (e.g. '20602495')

USE `db_kesiswaan_sekolah`;

SELECT 
  id,
  nama_sekolah,
  pemerintah_daerah,
  dinas_pendidikan,
  uptd_satuan_pendidikan,
  akreditasi,
  npsn,
  nss,
  alamat,
  desa_kelurahan,
  kecamatan,
  kabupaten_kota,
  provinsi,
  kode_pos,
  telepon,
  email,
  website,
  nama_kepala_sekolah,
  nip_kepala_sekolah,
  kepala_sekolah_ttd_url,
  nama_wali_kelas,
  nip_wali_kelas,
  nama_petugas_admin,
  nip_petugas_admin,
  petugas_admin_ttd_url,
  logo_sekolah_url,
  logo_daerah_url,
  kop_banner_url,
  use_banner_kop,
  tahun_ajaran_aktif,
  semester_aktif,
  tanggal_dokumen,
  wali_kelas_list_json,
  updated_at
FROM `schools`
WHERE id = ${school_id} OR npsn = ${school_id}
LIMIT 1;
