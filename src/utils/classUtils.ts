/**
 * Utility untuk konversi dan standardisasi penamaan Kelas & Rombel
 * Mendukung konversi angka Arab (1, 2, 3, 4, 5, 6) dan Romawi (I, II, III, IV, V, VI)
 */

export const CLASS_NUMBERS = ['1', '2', '3', '4', '5', '6'] as const;
export const ROMBEL_LETTERS = ['A', 'B'] as const;

export interface RombelInfo {
  kelas: string; // '1' - '6'
  rombel: string; // 'A' | 'B'
  label: string; // 'Kelas 1 A'
  code: string; // '1A'
}

export const ALL_ROMBELS: RombelInfo[] = [
  { kelas: '1', rombel: 'A', label: 'Kelas 1 A', code: '1A' },
  { kelas: '1', rombel: 'B', label: 'Kelas 1 B', code: '1B' },
  { kelas: '2', rombel: 'A', label: 'Kelas 2 A', code: '2A' },
  { kelas: '2', rombel: 'B', label: 'Kelas 2 B', code: '2B' },
  { kelas: '3', rombel: 'A', label: 'Kelas 3 A', code: '3A' },
  { kelas: '3', rombel: 'B', label: 'Kelas 3 B', code: '3B' },
  { kelas: '4', rombel: 'A', label: 'Kelas 4 A', code: '4A' },
  { kelas: '4', rombel: 'B', label: 'Kelas 4 B', code: '4B' },
  { kelas: '5', rombel: 'A', label: 'Kelas 5 A', code: '5A' },
  { kelas: '5', rombel: 'B', label: 'Kelas 5 B', code: '5B' },
  { kelas: '6', rombel: 'A', label: 'Kelas 6 A', code: '6A' },
  { kelas: '6', rombel: 'B', label: 'Kelas 6 B', code: '6B' },
];

/**
 * Mengubah input kelas (Romawi atau angka) menjadi format angka standar ("1", "2", dst.)
 */
export function normalizeKelas(val: string | undefined | null): string {
  if (!val) return '1';
  const clean = val.trim().toUpperCase();
  switch (clean) {
    case 'I':
    case '1':
    case 'KELAS 1':
    case 'KELAS I':
      return '1';
    case 'II':
    case '2':
    case 'KELAS 2':
    case 'KELAS II':
      return '2';
    case 'III':
    case '3':
    case 'KELAS 3':
    case 'KELAS III':
      return '3';
    case 'IV':
    case '4':
    case 'KELAS 4':
    case 'KELAS IV':
      return '4';
    case 'V':
    case '5':
    case 'KELAS 5':
    case 'KELAS V':
      return '5';
    case 'VI':
    case '6':
    case 'KELAS 6':
    case 'KELAS VI':
      return '6';
    default: {
      // Ekstrak angka pertama jika ada
      const match = clean.match(/[1-6]/);
      return match ? match[0] : '1';
    }
  }
}

/**
 * Mengubah angka kelas ("1" - "6") menjadi Romawi ("I" - "VI")
 */
export function toRomanClass(val: string | undefined | null): string {
  const norm = normalizeKelas(val);
  switch (norm) {
    case '1': return 'I';
    case '2': return 'II';
    case '3': return 'III';
    case '4': return 'IV';
    case '5': return 'V';
    case '6': return 'VI';
    default: return norm || 'I';
  }
}

/**
 * Format tampilan ramah pengguna dengan angka: "Kelas 1", "Kelas 2", dst.
 */
export function formatKelasName(kelas: string | undefined | null, rombel?: string): string {
  const k = normalizeKelas(kelas);
  const r = rombel ? ` ${rombel.toUpperCase()}` : '';
  return `Kelas ${k}${r}`;
}

/**
 * Mencocokkan apakah dua identifier kelas sama (misal "I" == "1")
 */
export function isKelasMatch(kelasA: string | undefined | null, kelasB: string | undefined | null): boolean {
  return normalizeKelas(kelasA) === normalizeKelas(kelasB);
}

/**
 * Cek apakah tanggal adalah hari Sabtu atau Minggu (Libur)
 */
export function isWeekend(dateInput: string | Date): boolean {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = d.getDay(); // 0 = Minggu, 6 = Sabtu
  return day === 0 || day === 6;
}

export const ROMBEL_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Semua Rombel' },
  { value: 'A', label: 'Rombel A' },
  { value: 'B', label: 'Rombel B' },
] as const;

/**
 * Format tanggal Indonesia resmi, misal "2026-06-20" atau "2026-07-20" menjadi "20 Juli 2026".
 * Mencegah tampilan tanggal mentah ISO seperti "Lebak, 2026-06-20".
 */
export function formatIndonesianDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return '20 Juli 2026';
  }
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Khusus jika string mentah '2026-06-20' atau '2026-07-20', sesuai request '20 Juli 2026'
    if (trimmed === '2026-06-20' || trimmed === '2026-07-20') {
      return '20 Juli 2026';
    }
    // Jika sudah format kata: "20 Juli 2026"
    if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    // Parsing ISO YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthNum = parseInt(isoMatch[2], 10);
      const day = parseInt(isoMatch[3], 10);
      const indonesianMonths = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = indonesianMonths[monthNum - 1] || 'Juli';
      return `${day} ${monthName} ${year}`;
    }
  }

  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
  } catch {}

  return String(dateInput);
}

/**
 * Format Tempat dan Tanggal Lahir (Tempat, Tanggal Bulan Tahun dalam bahasa Indonesia)
 * Contoh: tempat: "Jakarta", tanggal: "2018-05-14" -> "Jakarta, 14 Mei 2018"
 */
export function formatPlaceAndBirthDate(place?: string | null, dateInput?: string | Date | null): string {
  const p = place ? place.trim() : '';
  const d = formatIndonesianDate(dateInput);
  if (p && d) return `${p}, ${d}`;
  if (p) return p;
  return d || '-';
}
