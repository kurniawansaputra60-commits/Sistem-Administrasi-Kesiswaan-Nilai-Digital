/**
 * TiDB Data Service Client
 * Terhubung langsung ke TiDB Cloud Data Service REST API
 * Base URL & Kredensial sesuai konfigurasi GitHub /db & TiDB Cloud Console
 */

export interface TiDBDataServiceConfig {
  baseUrl: string;
  publicKey: string;
  privateKey: string;
  schoolId: string;
  enabled: boolean;
}

const STORAGE_KEY = 'adm_tidb_dataservice_config_v1';

export const defaultTiDBDataServiceConfig: TiDBDataServiceConfig = {
  baseUrl: 'https://ap-southeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-xepxutFs/endpoint',
  publicKey: 'S3JJGQO0',
  privateKey: '', // Diisi dari environment variable atau input user
  schoolId: '20602495',
  enabled: false,
};

export const getTiDBDataServiceConfig = (): TiDBDataServiceConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultTiDBDataServiceConfig, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultTiDBDataServiceConfig;
};

export const saveTiDBDataServiceConfig = (updates: Partial<TiDBDataServiceConfig>) => {
  try {
    const current = getTiDBDataServiceConfig();
    const next = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return defaultTiDBDataServiceConfig;
  }
};

/**
 * Helper untuk membuat header Basic Authentication
 */
function createAuthHeaders(publicKey: string, privateKey: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (publicKey && privateKey) {
    // Basic Auth RFC 7617
    const token = typeof btoa !== 'undefined' 
      ? btoa(`${publicKey}:${privateKey}`)
      : Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }

  return headers;
}

/**
 * Uji koneksi ke TiDB Data Service endpoint
 */
export async function testTiDBDataService(cfg?: Partial<TiDBDataServiceConfig>): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  data?: any;
}> {
  const config = { ...getTiDBDataServiceConfig(), ...cfg };
  const startTime = Date.now();

  if (!config.baseUrl) {
    return { success: false, message: 'Base URL TiDB Data Service belum diisi.' };
  }

  try {
    const cleanUrl = config.baseUrl.replace(/\/+$/, '');
    const url = `${cleanUrl}/get_school_profile?school_id=${encodeURIComponent(config.schoolId || '20602495')}`;
    const headers = createAuthHeaders(config.publicKey, config.privateKey);

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        latencyMs,
        message: 'Autentikasi ditolak (HTTP 401/403). Periksa kembali Public Key & Private Key API TiDB Anda.',
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        latencyMs,
        message: `Endpoint /get_school_profile belum aktif di TiDB Data Service (HTTP 404). Pastikan folder /db telah di-commit ke GitHub dan status 'Deployments' di TiDB Cloud sudah 'Active'.`,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        latencyMs,
        message: `TiDB Data Service merespons status ${res.status}: ${errText}`,
      };
    }

    const json = await res.json();
    return {
      success: true,
      latencyMs,
      message: `Terhubung sukses ke TiDB Data Service (${latencyMs}ms)!`,
      data: json,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal memanggil TiDB Data Service: ${err.message}`,
    };
  }
}

/**
 * Mengambil data siswa dari TiDB Data Service (/get_students)
 */
export async function fetchStudentsFromTiDBDataService(options?: {
  schoolId?: string;
  kelas?: string;
  search?: string;
}) {
  const config = getTiDBDataServiceConfig();
  const schoolId = options?.schoolId || config.schoolId || '20602495';
  const kelas = options?.kelas || '%';
  const search = options?.search || '%';

  const cleanUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/get_students?school_id=${encodeURIComponent(schoolId)}&kelas=${encodeURIComponent(kelas)}&search=${encodeURIComponent(search)}`;
  const headers = createAuthHeaders(config.publicKey, config.privateKey);

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
  }
  const result = await res.json();
  // Format TiDB Data Service biasanya data: [] atau result: []
  return Array.isArray(result) ? result : result.data?.rows || result.data || result.rows || [];
}

/**
 * Mengambil Laporan S-20 Rekap Nilai Pivot (/report_rekap_nilai_s20)
 */
export async function fetchReportS20FromTiDBDataService(options: {
  schoolId?: string;
  kelas: string;
  semesterKey: string;
}) {
  const config = getTiDBDataServiceConfig();
  const schoolId = options.schoolId || config.schoolId || '20602495';
  const cleanUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/report_rekap_nilai_s20?school_id=${encodeURIComponent(schoolId)}&kelas=${encodeURIComponent(options.kelas)}&semester_key=${encodeURIComponent(options.semesterKey)}`;
  const headers = createAuthHeaders(config.publicKey, config.privateKey);

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result : result.data?.rows || result.data || result.rows || [];
}

/**
 * Mengambil Laporan S-11 Rekap Presensi Bulanan (/report_rekap_absensi_s11)
 */
export async function fetchReportS11FromTiDBDataService(options: {
  schoolId?: string;
  kelas: string;
  bulanTahun: string; // YYYY-MM
}) {
  const config = getTiDBDataServiceConfig();
  const schoolId = options.schoolId || config.schoolId || '20602495';
  const cleanUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/report_rekap_absensi_s11?school_id=${encodeURIComponent(schoolId)}&kelas=${encodeURIComponent(options.kelas)}&bulan_tahun=${encodeURIComponent(options.bulanTahun)}`;
  const headers = createAuthHeaders(config.publicKey, config.privateKey);

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result : result.data?.rows || result.data || result.rows || [];
}
