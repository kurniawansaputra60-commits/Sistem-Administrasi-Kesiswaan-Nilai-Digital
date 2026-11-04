import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, X, HardDrive, CheckCircle2 } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

interface QuotaNotificationBannerProps {
  onNavigateToDatabase?: () => void;
}

export const QuotaNotificationBanner: React.FC<QuotaNotificationBannerProps> = ({ onNavigateToDatabase }) => {
  const { isQuotaExhausted, firestoreUpgradeUrl } = useSchool();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isQuotaExhausted || isDismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 no-print print:hidden transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-200/80 rounded-lg text-amber-900 shrink-0 mt-0.5 md:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="font-bold text-amber-950 flex items-center gap-2 flex-wrap">
              <span>Batas Kuota Harian Gratis Firebase Firestore Tercapai</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Data Tersimpan Aman (Offline-First)
              </span>
            </div>
            <p className="text-amber-800 mt-0.5 leading-relaxed text-xs">
              Seluruh penambahan siswa, nilai, presensi, dan perubahan profil <strong>tetap tersimpan 100% aman</strong> di penyimpanan lokal perangkat &amp; cadangan server. Kuota harian gratis akan direset secara otomatis esok hari.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
          {onNavigateToDatabase && (
            <button
              type="button"
              onClick={onNavigateToDatabase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs text-xs whitespace-nowrap cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Gunakan TiDB Cloud (Bebas Kuota)</span>
            </button>
          )}
          <a
            href={firestoreUpgradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-colors shadow-xs text-xs whitespace-nowrap"
          >
            <span>Cek Konsol Firebase</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title="Tutup pemberitahuan ini"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
