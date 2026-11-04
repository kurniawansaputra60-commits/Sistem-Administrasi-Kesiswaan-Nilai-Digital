// Utility untuk Kalender Nasional (PHBN, PHBI, Hari Libur Nasional & Libur Sekolah)

export interface HolidayEvent {
  dateStr?: string; // YYYY-MM-DD
  monthDay?: string; // MM-DD
  name: string;
  category: 'PHBN' | 'PHBI' | 'LIBUR_NASIONAL' | 'LIBUR_SEMESTER';
  isDayOff: boolean;
}

// Daftar Hari Libur Nasional Tanggal Tetap (MM-DD)
export const FIXED_NATIONAL_HOLIDAYS: HolidayEvent[] = [
  { monthDay: '01-01', name: 'Tahun Baru Masehi', category: 'LIBUR_NASIONAL', isDayOff: true },
  { monthDay: '05-01', name: 'Hari Buruh Internasional', category: 'LIBUR_NASIONAL', isDayOff: true },
  { monthDay: '05-02', name: 'Hari Pendidikan Nasional (HARDIKNAS)', category: 'PHBN', isDayOff: false },
  { monthDay: '06-01', name: 'Hari Lahir Pancasila', category: 'PHBN', isDayOff: true },
  { monthDay: '08-17', name: 'Hari Kemerdekaan Republik Indonesia (PHBN)', category: 'PHBN', isDayOff: true },
  { monthDay: '10-01', name: 'Hari Kesaktian Pancasila', category: 'PHBN', isDayOff: false },
  { monthDay: '10-28', name: 'Hari Sumpah Pemuda', category: 'PHBN', isDayOff: false },
  { monthDay: '11-10', name: 'Hari Pahlawan', category: 'PHBN', isDayOff: false },
  { monthDay: '11-25', name: 'Hari Guru Nasional (HGN / PGRI)', category: 'PHBN', isDayOff: false },
  { monthDay: '12-25', name: 'Hari Raya Natal', category: 'LIBUR_NASIONAL', isDayOff: true },
];

// Hari Libur Keagamaan & Kalender Akademik Spesifik Tahun Ajaran 2025/2026 (YYYY-MM-DD)
export const SPECIFIC_ACADEMIC_HOLIDAYS: HolidayEvent[] = [
  // Semester 1 (Ganjil) 2025/2026
  { dateStr: '2025-07-07', name: 'Tahun Baru Hijriah 1447 H (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2025-08-17', name: 'HUT Proklamasi Kemerdekaan RI Ke-80 (PHBN)', category: 'PHBN', isDayOff: true },
  { dateStr: '2025-09-05', name: 'Maulid Nabi Muhammad SAW (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2025-12-22', name: 'Libur Semester Ganjil T.A. 2025/2026', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2025-12-23', name: 'Libur Semester Ganjil T.A. 2025/2026', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2025-12-24', name: 'Libur Semester Ganjil T.A. 2025/2026', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2025-12-25', name: 'Hari Raya Natal', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2025-12-26', name: 'Cuti Bersama Natal', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2025-12-29', name: 'Libur Akhir Semester Ganjil', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2025-12-30', name: 'Libur Akhir Semester Ganjil', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2025-12-31', name: 'Libur Akhir Semester Ganjil', category: 'LIBUR_SEMESTER', isDayOff: true },

  // Semester 2 (Genap) 2025/2026
  { dateStr: '2026-01-01', name: 'Tahun Baru Masehi 2026', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-01-16', name: 'Isra Mi\'raj Nabi Muhammad SAW 1447 H (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2026-02-17', name: 'Tahun Baru Imlek 2577', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-03-19', name: 'Hari Raya Nyepi Tahun Baru Saka 1948', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H Hari Ke-2 (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-05-01', name: 'Hari Buruh Internasional', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-05-14', name: 'Kenaikan Yesus Kristus', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H (PHBI)', category: 'PHBI', isDayOff: true },
  { dateStr: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', category: 'LIBUR_NASIONAL', isDayOff: true },
  { dateStr: '2026-06-01', name: 'Hari Lahir Pancasila', category: 'PHBN', isDayOff: true },
  { dateStr: '2026-06-22', name: 'Libur Akhir Semester Genap', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2026-06-23', name: 'Libur Akhir Semester Genap', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2026-06-24', name: 'Libur Akhir Semester Genap', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2026-06-25', name: 'Libur Akhir Semester Genap', category: 'LIBUR_SEMESTER', isDayOff: true },
  { dateStr: '2026-06-26', name: 'Libur Akhir Semester Genap', category: 'LIBUR_SEMESTER', isDayOff: true },
];

/**
 * Memeriksa apakah tanggal tergolong libur akhir pekan (Sabtu atau Minggu)
 */
export const isWeekend = (dateObj: Date): boolean => {
  const day = dateObj.getDay();
  return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
};

/**
 * Mendapatkan informasi libur nasional / PHBN / PHBI / Libur Semester untuk suatu tanggal
 */
export const getHolidayInfo = (dateObj: Date): HolidayEvent | null => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  const fullDateStr = `${year}-${month}-${day}`;
  const monthDayStr = `${month}-${day}`;

  // 1. Cek spesifik tanggal akademik tahun berjalan
  const specific = SPECIFIC_ACADEMIC_HOLIDAYS.find(h => h.dateStr === fullDateStr);
  if (specific) return specific;

  // 2. Cek libur nasional tetap
  const fixed = FIXED_NATIONAL_HOLIDAYS.find(h => h.monthDay === monthDayStr);
  if (fixed) return { ...fixed, dateStr: fullDateStr };

  return null;
};

/**
 * Cek apakah suatu hari adalah hari libur (Akhir Pekan ATAU Hari Libur Resmi)
 */
export const isDayOff = (dateObj: Date): { isLibur: boolean; reason?: string; isWeekendDay: boolean } => {
  const weekend = isWeekend(dateObj);
  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(dateObj);
  const holiday = getHolidayInfo(dateObj);

  if (weekend) {
    return {
      isLibur: true,
      reason: `Libur Akhir Pekan (${dayName})`,
      isWeekendDay: true,
    };
  }

  if (holiday && holiday.isDayOff) {
    return {
      isLibur: true,
      reason: holiday.name,
      isWeekendDay: false,
    };
  }

  return {
    isLibur: false,
    isWeekendDay: false,
  };
};
