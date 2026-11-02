/**
 * Utility Formatting Tanggal Indonesia Resmi
 * Standardisasi format tanggal Indonesia lengkap dengan nama hari, tanggal, nama bulan, dan tahun.
 */

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MAP_BULAN_INDO: Record<string, number> = {
  januari: 0,
  jan: 0,
  februari: 1,
  pebruari: 1,
  feb: 1,
  maret: 2,
  mar: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  juni: 5,
  jun: 5,
  juli: 6,
  jul: 6,
  agustus: 7,
  ags: 7,
  agu: 7,
  september: 8,
  sep: 8,
  sept: 8,
  oktober: 9,
  okt: 9,
  november: 10,
  nopember: 10,
  nov: 10,
  desember: 11,
  des: 11,
};

/**
 * Mengubah string tanggal (ISO YYYY-MM-DD, DD-MM-YYYY, atau textual)
 * menjadi format tanggal lengkap dengan hari, misal: "Senin, 14 Juli 2017"
 */
export function formatTanggalIndonesiaLengkap(tanggalStr?: string | null): string {
  if (!tanggalStr || !tanggalStr.trim()) return '-';
  const clean = tanggalStr.trim();

  // Pola YYYY-MM-DD atau YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      return `${NAMA_HARI[dateObj.getDay()]}, ${d} ${NAMA_BULAN[m]} ${y}`;
    }
  }

  // Pola DD-MM-YYYY atau DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      return `${NAMA_HARI[dateObj.getDay()]}, ${d} ${NAMA_BULAN[m]} ${y}`;
    }
  }

  // Pola misal "7 Oktober 2018" atau "Senin, 7 Oktober 2018"
  // Jika sudah ada nama hari di depan
  for (const hari of NAMA_HARI) {
    if (clean.toLowerCase().startsWith(hari.toLowerCase())) {
      return clean; // sudah diformat dengan hari
    }
  }

  const textMatch = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (textMatch) {
    const d = parseInt(textMatch[1], 10);
    const monthKey = textMatch[2].toLowerCase();
    const y = parseInt(textMatch[3], 10);
    if (monthKey in MAP_BULAN_INDO) {
      const m = MAP_BULAN_INDO[monthKey];
      const dateObj = new Date(y, m, d);
      if (!isNaN(dateObj.getTime())) {
        return `${NAMA_HARI[dateObj.getDay()]}, ${d} ${NAMA_BULAN[m]} ${y}`;
      }
    }
  }

  // Fallback melalui Date parser standar
  const fallback = new Date(clean);
  if (!isNaN(fallback.getTime())) {
    return `${NAMA_HARI[fallback.getDay()]}, ${fallback.getDate()} ${NAMA_BULAN[fallback.getMonth()]} ${fallback.getFullYear()}`;
  }

  return clean;
}

/**
 * Format Tempat dan Tanggal Lahir Lengkap:
 * Contoh: "Lebak, Minggu, 7 Oktober 2018" atau "Jakarta, Senin, 14 Juli 2017"
 */
export function formatTempatTanggalLahirLengkap(tempat?: string | null, tanggal?: string | null): string {
  const cleanTempat = (tempat || '').trim();
  const formattedDate = formatTanggalIndonesiaLengkap(tanggal);

  if (cleanTempat && formattedDate && formattedDate !== '-') {
    return `${cleanTempat}, ${formattedDate}`;
  }
  if (cleanTempat) return cleanTempat;
  return formattedDate || '-';
}

/**
 * Format Tanggal Indonesia Standar (tanpa hari):
 * Contoh: "7 Oktober 2018"
 */
export function formatTanggalIndonesia(tanggalStr?: string | null): string {
  if (!tanggalStr || !tanggalStr.trim()) return '-';
  const clean = tanggalStr.trim();

  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return `${d} ${NAMA_BULAN[m]} ${y}`;
  }

  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    return `${d} ${NAMA_BULAN[m]} ${y}`;
  }

  return clean;
}
