import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, KeyRound, LogIn, HelpCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithNipAndPassword } = useAuth();
  const [usernameNip, setUsernameNip] = useState('');
  const [passwordNip, setPasswordNip] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNipLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!usernameNip.trim()) {
      setErrorMsg('Silakan masukkan Username NIP, NIK, atau Akun Administrator Anda.');
      return;
    }
    const result = loginWithNipAndPassword(usernameNip, passwordNip);
    if (!result.success) {
      setErrorMsg(result.message || 'NIP, NIK, atau Password tidak cocok dengan daftar akun SD NEGERI 1 CEMPAKA.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 grid grid-cols-1 md:grid-cols-12 relative z-10 animate-in fade-in duration-300">
        
        {/* Left Branding Panel (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-5 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-6 shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem Kesiswaan Terpadu</span>
            </div>

            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-4 shadow-lg p-1.5">
              <img
                src="/assets/aistudio/llogo_06ce9f11.png"
                alt="Logo SDN 1 Cempaka"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <h1 className="text-xl font-black uppercase tracking-wider text-white leading-snug">
              SD NEGERI 1 CEMPAKA
            </h1>
            <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
              Sistem Administrasi Kesiswaan &amp; 28 Buku Pelaporan Resmi Kementerian
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700/50 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Login Terverifikasi NIP / NIK Guru &amp; Kepsek</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Guru Non-ASN Dapat Masuk Menggunakan NIK 16 Digit</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Akses Penuh Administrator untuk Mengontrol Semua Data &amp; Akun</span>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-emerald-300 font-mono">
            NPSN: 20602495 · T.A. 2025/2026 Sem. Genap
          </div>
        </div>

        {/* Right Authentication Form Panel (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white space-y-5">
          <div>
            <div className="flex items-center gap-2 text-slate-800 text-sm font-black uppercase tracking-wide">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Masuk Akun SD NEGERI 1 CEMPAKA</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan Username dan Password (NIP, NIK, atau Akun Administrator) untuk masuk ke sistem.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login Tunggal NIP / NIK / Admin */}
          <form onSubmit={handleNipLoginSubmit} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Form Masuk Pengguna</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Otorisasi GTK
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username (NIP / NIK / Akun):
                </label>
                <input
                  type="text"
                  placeholder="Masukkan NIP, NIK (16 digit), atau 'admin'"
                  value={usernameNip}
                  onChange={e => setUsernameNip(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  placeholder="Masukkan Password (NIP / NIK / 'admin')"
                  value={passwordNip}
                  onChange={e => setPasswordNip(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Sistem Administrasi</span>
            </button>
          </form>

          {/* Panduan Kredensial Login */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Petunjuk Masuk Akun:</span>
            </div>
            <p className="leading-relaxed">
              • <strong>Guru / Wali Kelas</strong>: Gunakan NIP (atau 16-digit NIK untuk Guru Non-ASN) sebagai Username &amp; Password.
            </p>
            <p className="leading-relaxed">
              • <strong>Kepala Sekolah</strong>: Gunakan NIP Kepala Sekolah sebagai Username &amp; Password.
            </p>
            <p className="leading-relaxed">
              • <strong>Administrator</strong>: Gunakan username <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-900">admin</code> dan password <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-900">admin</code> untuk kontrol penuh dashboard &amp; manajemen akun wali kelas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
