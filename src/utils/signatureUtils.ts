/**
 * Utility untuk membuat dan mengelola tanda tangan digital (TTD)
 * Menghasilkan visual tanda tangan kaligrafi autentik khas dokumen dinas/sekolah Indonesia (tinta biru resmi).
 */

export function generateDigitalSignatureSvg(name: string, initials?: string): string {
  const cleanName = name.replace(/^(Dr\.|Drs\.|Hj\.|H\.|Ir\.)\s*/i, '').replace(/,\s*[A-Za-z\.\s]+$/, '').trim();
  const shortInitials = initials || cleanName.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
  
  // Seed hash sederhana dari nama untuk variasi lengkungan
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const loopWidth = 40 + (absHash % 30);
  const flourishY = 35 + (absHash % 15);
  const underLineEnd = 160 + (absHash % 40);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90">
  <defs>
    <filter id="inkGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="0.4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <!-- Garis lengkungan tanda tangan utama (Tinta Biru Resmi Dinas #1d4ed8 / #1e3a8a) -->
  <path
    d="M 25,60 C 35,${flourishY - 20} 45,${flourishY + 25} 65,${flourishY} 
       C 80,18 ${80 + loopWidth},15 ${70 + loopWidth},45 
       C ${65 + loopWidth},65 ${100 + (absHash % 20)},50 ${120 + (absHash % 20)},42 
       C 135,35 140,55 155,40 
       C 165,30 170,48 185,38 
       C 195,30 200,42 215,35"
    fill="none"
    stroke="#1e40af"
    stroke-width="2.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#inkGlow)"
  />
  <!-- Guratan loop awal / huruf kapital -->
  <path
    d="M 30,55 C 20,40 25,25 40,25 C 55,25 50,55 35,68 C 25,75 18,65 30,50"
    fill="none"
    stroke="#1d4ed8"
    stroke-width="2.4"
    stroke-linecap="round"
  />
  <!-- Coretan bawah (flourish underline) -->
  <path
    d="M 35,72 C 85,68 135,76 ${underLineEnd},65 C ${underLineEnd + 15},62 ${underLineEnd - 10},58 ${underLineEnd + 8},60"
    fill="none"
    stroke="#1e40af"
    stroke-width="2.1"
    stroke-linecap="round"
  />
  <!-- Titik paraf dinas -->
  <circle cx="${underLineEnd + 18}" cy="60" r="2.2" fill="#1e40af" />
  <circle cx="${underLineEnd + 25}" cy="58" r="1.8" fill="#1e40af" />
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
