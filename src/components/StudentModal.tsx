import React, { useState, useEffect } from 'react';
import { X, Save, User, Upload, Trash2, Camera } from 'lucide-react';
import { Student, Gender, Religion, StudentStatus } from '../types';
import { useSchool } from '../context/SchoolContext';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  defaultStatus?: StudentStatus;
  defaultClass?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  defaultStatus = 'aktif',
  defaultClass = '1',
}) => {
  const { addStudent, updateStudent, schoolProfile } = useSchool();

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    namaLengkap: '',
    namaPanggilan: '',
    jenisKelamin: 'L' as Gender,
    tempatLahir: '',
    tanggalLahir: '2019-01-01',
    agama: 'Islam' as Religion,
    kewarganegaraan: 'WNI',
    anakKe: 1,
    jumlahSaudara: 1,
    bahasaSehariHari: 'Indonesia',
    alamat: '',
    kelurahan: 'Cempaka Putih Timur',
    kecamatan: 'Cempaka Putih',
    kabupatenKota: 'Jakarta Pusat',
    provinsi: 'DKI Jakarta',
    noHp: '',
    statusSiswa: defaultStatus,
    kelasSekarang: defaultClass,
    rombel: 'A',
    tanggalDiterima: new Date().toISOString().split('T')[0],
    diterimaDiKelas: 'I',
    asalSekolah: '',
    noIjazahSebelumnya: '',
    // Data Ayah
    ayahNama: '',
    ayahPendidikan: 'SMA',
    ayahPekerjaan: 'Karyawan Swasta',
    ayahPenghasilan: 'Rp 5.000.000 - Rp 10.000.000',
    ayahHp: '',
    fotoUrl: '',
    // Data Ibu
    ibuNama: '',
    ibuPendidikan: 'SMA',
    ibuPekerjaan: 'Ibu Rumah Tangga',
    ibuPenghasilan: 'Tidak Berpenghasilan',
    ibuHp: '',
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        nis: studentToEdit.nis || '',
        nisn: studentToEdit.nisn || '',
        namaLengkap: studentToEdit.namaLengkap || '',
        namaPanggilan: studentToEdit.namaPanggilan || '',
        jenisKelamin: studentToEdit.jenisKelamin || 'L',
        tempatLahir: studentToEdit.tempatLahir || '',
        tanggalLahir: studentToEdit.tanggalLahir || '2019-01-01',
        agama: studentToEdit.agama || 'Islam',
        kewarganegaraan: studentToEdit.kewarganegaraan || 'WNI',
        anakKe: studentToEdit.anakKe || 1,
        jumlahSaudara: studentToEdit.jumlahSaudara || 1,
        bahasaSehariHari: studentToEdit.bahasaSehariHari || 'Indonesia',
        alamat: studentToEdit.alamat || '',
        kelurahan: studentToEdit.kelurahan || schoolProfile.desaKelurahan,
        kecamatan: studentToEdit.kecamatan || schoolProfile.kecamatan,
        kabupatenKota: studentToEdit.kabupatenKota || schoolProfile.kabupatenKota,
        provinsi: studentToEdit.provinsi || schoolProfile.provinsi,
        noHp: studentToEdit.noHp || '',
        statusSiswa: studentToEdit.statusSiswa || defaultStatus,
        kelasSekarang: studentToEdit.kelasSekarang || defaultClass,
        rombel: studentToEdit.rombel || 'A',
        fotoUrl: studentToEdit.fotoUrl || '',
        tanggalDiterima: studentToEdit.tanggalDiterima || new Date().toISOString().split('T')[0],
        diterimaDiKelas: studentToEdit.diterimaDiKelas || 'I',
        asalSekolah: studentToEdit.asalSekolah || '',
        noIjazahSebelumnya: studentToEdit.noIjazahSebelumnya || '',
        ayahNama: studentToEdit.dataAyah?.nama || '',
        ayahPendidikan: studentToEdit.dataAyah?.pendidikan || 'SMA',
        ayahPekerjaan: studentToEdit.dataAyah?.pekerjaan || 'Karyawan Swasta',
        ayahPenghasilan: studentToEdit.dataAyah?.penghasilan || 'Rp 5.000.000 - Rp 10.000.000',
        ayahHp: studentToEdit.dataAyah?.noHp || '',
        ibuNama: studentToEdit.dataIbu?.nama || '',
        ibuPendidikan: studentToEdit.dataIbu?.pendidikan || 'SMA',
        ibuPekerjaan: studentToEdit.dataIbu?.pekerjaan || 'Ibu Rumah Tangga',
        ibuPenghasilan: studentToEdit.dataIbu?.penghasilan || 'Tidak Berpenghasilan',
        ibuHp: studentToEdit.dataIbu?.noHp || '',
      });
    } else {
      // Auto generate next NIS
      const randomNis = `${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`;
      setFormData(prev => ({
        ...prev,
        nis: randomNis,
        nisn: `01${Math.floor(10000000 + Math.random() * 90000000)}`,
        statusSiswa: defaultStatus,
        kelasSekarang: defaultClass,
      }));
    }
  }, [studentToEdit, defaultStatus, defaultClass, isOpen, schoolProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap.trim()) return;

    const studentPayload: Omit<Student, 'id'> = {
      nis: formData.nis,
      nisn: formData.nisn,
      namaLengkap: formData.namaLengkap,
      namaPanggilan: formData.namaPanggilan || formData.namaLengkap.split(' ')[0],
      jenisKelamin: formData.jenisKelamin,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      agama: formData.agama,
      kewarganegaraan: formData.kewarganegaraan,
      anakKe: Number(formData.anakKe) || 1,
      jumlahSaudara: Number(formData.jumlahSaudara) || 1,
      bahasaSehariHari: formData.bahasaSehariHari,
      alamat: formData.alamat,
      kelurahan: formData.kelurahan,
      kecamatan: formData.kecamatan,
      kabupatenKota: formData.kabupatenKota,
      provinsi: formData.provinsi,
      noHp: formData.noHp,
      statusSiswa: formData.statusSiswa,
      kelasSekarang: formData.kelasSekarang,
      rombel: formData.rombel || 'A',
      fotoUrl: formData.fotoUrl,
      tanggalDiterima: formData.tanggalDiterima,
      diterimaDiKelas: formData.diterimaDiKelas,
      asalSekolah: formData.asalSekolah,
      noIjazahSebelumnya: formData.noIjazahSebelumnya,
      dataAyah: {
        nama: formData.ayahNama,
        pendidikan: formData.ayahPendidikan,
        pekerjaan: formData.ayahPekerjaan,
        penghasilan: formData.ayahPenghasilan,
        noHp: formData.ayahHp,
      },
      dataIbu: {
        nama: formData.ibuNama,
        pendidikan: formData.ibuPendidikan,
        pekerjaan: formData.ibuPekerjaan,
        penghasilan: formData.ibuPenghasilan,
        noHp: formData.ibuHp,
      },
      nilaiSemester: studentToEdit?.nilaiSemester || {},
      riwayatKenaikan: studentToEdit?.riwayatKenaikan,
    };

    if (studentToEdit) {
      updateStudent(studentToEdit.id, studentPayload);
    } else {
      addStudent(studentPayload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-800">
              {studentToEdit ? 'Edit Data Induk Siswa' : 'Tambah Data Siswa Baru (Format S-1 / S-4)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Bagian A: Identitas Siswa */}
          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              A. Identitas Peserta Didik
            </h3>

            {/* Foto Profil & Pas Foto Siswa (3x4) */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-20 h-26 bg-white border-2 border-dashed border-slate-300 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
                {formData.fotoUrl ? (
                  <img src={formData.fotoUrl} alt="Pas Foto Siswa" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <User className="w-7 h-7 mx-auto opacity-40 mb-1" />
                    <span className="text-[9px] font-semibold block leading-tight">Foto 3x4</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="font-bold text-slate-800 text-xs block">Pas Foto Peserta Didik (Resmi 3x4)</span>
                <p className="text-[11px] text-slate-500">
                  Foto akan tertera di Buku Induk (Format S-4), Kartu UAS (Format S-16), dan berkas kesiswaan resmi lainnya.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload Pas Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setFormData(prev => ({ ...prev, fotoUrl: ev.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {formData.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fotoUrl: '' }))}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded font-medium cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Nomor Induk Siswa (NIS) *</label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={e => setFormData({ ...formData, nis: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  placeholder="2026001"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  placeholder="0181234567"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Status Kesiswaan *</label>
                <select
                  value={formData.statusSiswa}
                  onChange={e => setFormData({ ...formData, statusSiswa: e.target.value as StudentStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="calon">Calon Siswa Baru (Format S-1/S-2)</option>
                  <option value="aktif">Siswa Aktif (Format S-3/S-4)</option>
                  <option value="mutasi_keluar">Mutasi Keluar (Format S-14)</option>
                  <option value="lulus">Lulus (Format S-20)</option>
                  <option value="tinggal_kelas">Tinggal Kelas</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formData.namaLengkap}
                  onChange={e => setFormData({ ...formData, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-medium"
                  placeholder="Contoh: Muhammad Rizki Pratama"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.namaPanggilan}
                  onChange={e => setFormData({ ...formData, namaPanggilan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Rizki"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jenis Kelamin *</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={e => setFormData({ ...formData, jenisKelamin: e.target.value as Gender })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  required
                  value={formData.tempatLahir}
                  onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Jakarta"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  required
                  value={formData.tanggalLahir}
                  onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Agama *</label>
                <select
                  value={formData.agama}
                  onChange={e => setFormData({ ...formData, agama: e.target.value as Religion })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Kewarganegaraan</label>
                <input
                  type="text"
                  value={formData.kewarganegaraan}
                  onChange={e => setFormData({ ...formData, kewarganegaraan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Anak Ke- / Jml Saudara</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.anakKe}
                    onChange={e => setFormData({ ...formData, anakKe: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Ke"
                  />
                  <input
                    type="number"
                    min="0"
                    value={formData.jumlahSaudara}
                    onChange={e => setFormData({ ...formData, jumlahSaudara: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Dari"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Bagian B: Kelas & Sekolah Asal */}
          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              B. Penempatan Kelas &amp; Riwayat Sekolah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Kelas Saat Ini *</label>
                <select
                  value={formData.kelasSekarang}
                  onChange={e => setFormData({ ...formData, kelasSekarang: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold"
                >
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Rombel (Rombongan Belajar) *</label>
                <select
                  value={formData.rombel || 'A'}
                  onChange={e => setFormData({ ...formData, rombel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold"
                >
                  <option value="A">Rombel A</option>
                  <option value="B">Rombel B</option>
                  <option value="C">Rombel C</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Sekolah Asal (TK / PAUD / RA / SD Asal) *</label>
                <input
                  type="text"
                  required
                  value={formData.asalSekolah}
                  onChange={e => setFormData({ ...formData, asalSekolah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Contoh: TK Pertiwi 01"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nomor Ijazah / Surat Keterangan</label>
                <input
                  type="text"
                  value={formData.noIjazahSebelumnya}
                  onChange={e => setFormData({ ...formData, noIjazahSebelumnya: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  placeholder="TK-01/123/2026"
                />
              </div>
            </div>
          </section>

          {/* Bagian C: Alamat & Kontak */}
          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              C. Alamat Tempat Tinggal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Alamat Jalan / RT / RW *</label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Jl. Cempaka Putih Tengah No. 10 RT 03/RW 04"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">No. HP / Telepon</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={e => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  placeholder="08123456789"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={formData.kelurahan}
                  onChange={e => setFormData({ ...formData, kelurahan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={e => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={formData.kabupatenKota}
                  onChange={e => setFormData({ ...formData, kabupatenKota: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Provinsi *</label>
                <input
                  type="text"
                  value={formData.provinsi}
                  onChange={e => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Banten"
                />
              </div>
            </div>
          </section>

          {/* Bagian D: Data Orang Tua */}
          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              D. Data Orang Tua (Ayah &amp; Ibu Kandung)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {/* Ayah */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Data Ayah</h4>
                <div>
                  <label className="block font-medium mb-1">Nama Ayah Kandung *</label>
                  <input
                    type="text"
                    required
                    value={formData.ayahNama}
                    onChange={e => setFormData({ ...formData, ayahNama: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    placeholder="Nama Lengkap Ayah"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1">Pendidikan</label>
                    <select
                      value={formData.ayahPendidikan}
                      onChange={e => setFormData({ ...formData, ayahPendidikan: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    >
                      <option>SD/Sederajat</option>
                      <option>SMP/Sederajat</option>
                      <option>SMA/SMK</option>
                      <option>D3</option>
                      <option>S1</option>
                      <option>S2</option>
                      <option>S3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      value={formData.ayahPekerjaan}
                      onChange={e => setFormData({ ...formData, ayahPekerjaan: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Penghasilan Ayah</label>
                  <select
                    value={formData.ayahPenghasilan}
                    onChange={e => setFormData({ ...formData, ayahPenghasilan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                  >
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    <option value="Kurang dari 1.000.000">Kurang dari 1.000.000</option>
                    <option value="1.000.000 - 3.000.000">1.000.000 - 3.000.000</option>
                    <option value="3.000.000 - 5.000.000">3.000.000 - 5.000.000</option>
                    <option value="5.000.000 - 10.000.000">5.000.000 - 10.000.000</option>
                    <option value="Lebih dari 10.000.000">Lebih dari 10.000.000</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">No. Kontak / HP Ayah</label>
                  <input
                    type="text"
                    value={formData.ayahHp}
                    onChange={e => setFormData({ ...formData, ayahHp: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-xs"
                    placeholder="081234..."
                  />
                </div>
              </div>

              {/* Ibu */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Data Ibu</h4>
                <div>
                  <label className="block font-medium mb-1">Nama Ibu Kandung *</label>
                  <input
                    type="text"
                    required
                    value={formData.ibuNama}
                    onChange={e => setFormData({ ...formData, ibuNama: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                    placeholder="Nama Lengkap Ibu"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1">Pendidikan</label>
                    <select
                      value={formData.ibuPendidikan}
                      onChange={e => setFormData({ ...formData, ibuPendidikan: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    >
                      <option>SD/Sederajat</option>
                      <option>SMP/Sederajat</option>
                      <option>SMA/SMK</option>
                      <option>D3</option>
                      <option>S1</option>
                      <option>S2</option>
                      <option>S3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      value={formData.ibuPekerjaan}
                      onChange={e => setFormData({ ...formData, ibuPekerjaan: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Penghasilan Ibu</label>
                  <select
                    value={formData.ibuPenghasilan}
                    onChange={e => setFormData({ ...formData, ibuPenghasilan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                  >
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    <option value="Kurang dari 1.000.000">Kurang dari 1.000.000</option>
                    <option value="1.000.000 - 3.000.000">1.000.000 - 3.000.000</option>
                    <option value="3.000.000 - 5.000.000">3.000.000 - 5.000.000</option>
                    <option value="5.000.000 - 10.000.000">5.000.000 - 10.000.000</option>
                    <option value="Lebih dari 10.000.000">Lebih dari 10.000.000</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">No. Kontak / HP Ibu</label>
                  <input
                    type="text"
                    value={formData.ibuHp}
                    onChange={e => setFormData({ ...formData, ibuHp: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-xs"
                    placeholder="081234..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
