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

/**
 * Format tanggal dalam format numerik Indonesia: DD/MM/YYYY
 * Contoh: "2026-03-06" -> "06/03/2026"
 */
export function formatDDMMYYYY(tanggalStr?: string | null): string {
  if (!tanggalStr || !tanggalStr.trim()) return '-';
  const clean = tanggalStr.trim();
  const match = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, '0');
    const d = match[3].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  return clean;
}

/**
 * Format bulan dan tahun Indonesia dari string 'YYYY-MM'
 * Contoh: "2026-06" -> "Juni 2026"
 */
export function formatBulanTahunIndo(monthStr?: string | null): string {
  if (!monthStr || !monthStr.trim()) return '-';
  const clean = monthStr.trim();
  const match = clean.match(/^(\d{4})[-/](\d{1,2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    if (m >= 0 && m < 12) {
      return `${NAMA_BULAN[m]} ${y}`;
    }
  }
  return clean;
}

/**
 * Format rentang tanggal resmi Indonesia
 * Contoh:
 * Jika tanggal sama: "06/03/2026 s.d. tanggal 06/03/2026 (Jumat, 6 Maret 2026)"
 * Jika rentang: "06/03/2026 s.d. tanggal 10/03/2026 (6 Maret 2026 s.d. 10 Maret 2026)"
 */
export function formatTanggalRentangIndo(startDate: string, endDate: string): string {
  const dmyStart = formatDDMMYYYY(startDate);
  const dmyEnd = formatDDMMYYYY(endDate);

  if (startDate === endDate) {
    const dateText = formatTanggalIndonesiaLengkap(startDate);
    return `${dmyStart} s.d. tanggal ${dmyEnd} (${dateText})`;
  }
  return `${dmyStart} s.d. tanggal ${dmyEnd} (${formatTanggalIndonesia(startDate)} s.d. ${formatTanggalIndonesia(endDate)})`;
}

/**
 * Format rentang bulan Indonesia
 * Contoh: "Juni 2026 s.d. Juni 2026"
 */
export function formatBulanRentangIndo(startMonth: string, endMonth: string): string {
  const startText = formatBulanTahunIndo(startMonth);
  const endText = formatBulanTahunIndo(endMonth);
  if (startMonth === endMonth) {
    return `${startText} s.d. ${endText}`;
  }
  return `${startText} s.d. ${endText}`;
}
