import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldCheck, Award, User, Lock, AlertCircle, CheckCircle2, KeyRound, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loginWithNipAndPassword, loginWithDemoRole, loading } = useAuth();
  const [usernameNip, setUsernameNip] = useState('');
  const [passwordNip, setPasswordNip] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan Google. Silakan coba lagi atau gunakan login NIP / NIK.');
    }
  };

  const handleNipLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!usernameNip.trim()) {
      setErrorMsg('Silakan masukkan Username NIP atau NIK Anda.');
      return;
    }
    const result = loginWithNipAndPassword(usernameNip, passwordNip);
    if (!result.success) {
      setErrorMsg(result.message || 'NIP, NIK, atau Password tidak cocok dengan daftar GTK SD NEGERI 1 CEMPAKA.');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginWithDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 grid grid-cols-1 md:grid-cols-12 relative z-10 animate-in fade-in duration-300">
        
        {/* Left Branding Panel (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-6 shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Akses Terproteksi Rombel Binaan</span>
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
              Sistem Administrasi Kesiswaan &amp; Buku Induk Terproteksi NIP / NIK Guru Binaan
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700/50 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Login Google &amp; Otentikasi NIP / NIK Guru</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Guru Non-ASN Dapat Masuk Menggunakan NIK 16 Digit</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Otorisasi Resmi Kepala Sekolah &amp; Wali Kelas</span>
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
              Masukkan Username dan Password (NIP atau NIK) untuk mengakses Rombel Binaan Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login: Username & Password NIP / NIK */}
          <form onSubmit={handleNipLoginSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Login GTK (NIP / NIK)</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Akses Sesuai Rombel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username NIP / NIK:
                </label>
                <input
                  type="text"
                  placeholder="Masukkan NIP atau 16-Digit NIK"
                  value={usernameNip}
                  onChange={e => setUsernameNip(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password NIP / NIK:
                </label>
                <input
                  type="password"
                  placeholder="Masukkan Password (NIP / NIK)"
                  value={passwordNip}
                  onChange={e => setPasswordNip(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 italic">
              * Guru Non-ASN / Honorer yang belum memiliki NIP dapat masuk menggunakan 16 digit NIK.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Berdasarkan Rombel Binaan</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">
              Atau Google / Akses Cepat Peran
            </span>
          </div>

          {/* Opsi 2: Login Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-emerald-600 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan...' : 'Masuk Menggunakan Akun Google'}</span>
            </button>
          </div>

          {/* Opsi 3: Akses Cepat Peran (Hanya Kepala Sekolah & Guru / Wali Kelas) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pilihan Akses Peran Cepat:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('kepala_sekolah')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px] mb-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kepala Sekolah</span>
                </div>
                <p className="text-[9px] text-amber-900 font-semibold">Otorisasi &amp; SK</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('guru_kelas')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-950 text-[11px] mb-0.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Guru / Wali Kelas</span>
                </div>
                <p className="text-[9px] text-blue-900 font-semibold">Rombel &amp; Nilai</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
