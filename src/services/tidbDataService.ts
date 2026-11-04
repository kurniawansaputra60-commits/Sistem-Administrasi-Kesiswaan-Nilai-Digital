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
    const headers = createAuthHeaders(config.publicKey, config.privateKey);

    // 1. Uji endpoint pertama: get_school_profile
    const urlProfile = `${cleanUrl}/get_school_profile?school_id=${encodeURIComponent(config.schoolId || '20602495')}`;
    const resProfile = await fetch(urlProfile, { method: 'GET', headers });
    const latencyMs = Date.now() - startTime;

    if (resProfile.status === 401 || resProfile.status === 403) {
      return {
        success: false,
        latencyMs,
        message: 'Autentikasi ditolak (HTTP 401/403). Periksa kembali Public Key & Private Key API TiDB Anda.',
      };
    }

    if (resProfile.ok) {
      const json = await resProfile.json();
      return {
        success: true,
        latencyMs,
        message: `Terhubung sukses ke TiDB Data Service via /get_school_profile (${latencyMs}ms)!`,
        data: json,
      };
    }

    // 2. Jika 404 pada get_school_profile, uji alternatif: school_data dan get_students
    if (resProfile.status === 404) {
      // Uji endpoint /school_data yang baru dikonfigurasi di /db/http_endpoints
      const urlSchoolData = `${cleanUrl}/school_data?key_name=main`;
      try {
        const resSchoolData = await fetch(urlSchoolData, { method: 'GET', headers });
        const latencyMs2 = Date.now() - startTime;
        if (resSchoolData.ok) {
          const jsonSchoolData = await resSchoolData.json();
          return {
            success: true,
            latencyMs: latencyMs2,
            message: `Endpoint /school_data berhasil diakses (${latencyMs2}ms)! Sinkronisasi data sekolah TiDB Cloud aktif.`,
            data: jsonSchoolData,
          };
        }
      } catch {}

      const urlStudents = `${cleanUrl}/get_students?school_id=${encodeURIComponent(config.schoolId || '20602495')}&kelas=VI`;
      try {
        const resStudents = await fetch(urlStudents, { method: 'GET', headers });
        const latencyMs3 = Date.now() - startTime;

        if (resStudents.ok) {
          const jsonStudents = await resStudents.json();
          return {
            success: true,
            latencyMs: latencyMs3,
            message: `Endpoint /get_students aktif dan berhasil diakses (${latencyMs3}ms)! Namun /get_school_profile masih 404. Silakan buka tab 'Deployments' di TiDB Cloud dan klik 'Deploy' untuk mengaktifkan seluruh endpoint.`,
            data: jsonStudents,
          };
        }
      } catch {}

      return {
        success: false,
        latencyMs,
        message: `Endpoint TiDB Data Service belum aktif (HTTP 404). Pastikan opsi 'Review Draft' disetujui di tab 'Deployments' pada dashboard TiDB Cloud.`,
      };
    }

    const errText = await resProfile.text();
    return {
      success: false,
      latencyMs,
      message: `TiDB Data Service merespons status ${resProfile.status}: ${errText.slice(0, 150)}`,
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

/**
 * Mengambil snapshot school_data via REST API TiDB Data Service (/school_data?key_name=main)
 */
export async function fetchSchoolDataSnapshot(keyName = 'main'): Promise<any | null> {
  const config = getTiDBDataServiceConfig();
  const cleanUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/school_data?key_name=${encodeURIComponent(keyName)}`;
  const headers = createAuthHeaders(config.publicKey, config.privateKey);

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
  }
  const result = await res.json();
  const rows = Array.isArray(result) ? result : result.data?.rows || result.data || result.rows || [];
  if (rows && rows.length > 0 && rows[0]?.data_json) {
    return typeof rows[0].data_json === 'string' ? JSON.parse(rows[0].data_json) : rows[0].data_json;
  }
  return null;
}

/**
 * Menyimpan snapshot school_data via REST API TiDB Data Service (PUT/POST /school_data)
 */
export async function saveSchoolDataSnapshot(data: any, keyName = 'main'): Promise<boolean> {
  const config = getTiDBDataServiceConfig();
  const cleanUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/school_data`;
  const headers = createAuthHeaders(config.publicKey, config.privateKey);
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);

  // Coba gunakan PUT terlebih dahulu
  try {
    const putRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ key_name: keyName, data_json: jsonStr }),
    });
    if (putRes.ok) return true;
  } catch {}

  // Fallback ke POST jika belum pernah ada data sebelumnya
  const postRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ key_name: keyName, data_json: jsonStr }),
  });
  return postRes.ok;
}
