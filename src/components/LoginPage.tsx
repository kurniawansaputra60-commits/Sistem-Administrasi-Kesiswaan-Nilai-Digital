import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initialSchoolProfile } from '../data/initialData';
import { Building, ShieldCheck, Award, User, Lock, Sparkles, AlertCircle, CheckCircle2, KeyRound, LogIn, ChevronDown } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loginWithNipAndPassword, loginWithDemoRole, loading } = useAuth();
  const [usernameNip, setUsernameNip] = useState('');
  const [passwordNip, setPasswordNip] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedQuickTeacherNip, setSelectedQuickTeacherNip] = useState<string>('');

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan Google. Silakan coba lagi atau gunakan login NIP Penugasan.');
    }
  };

  const handleNipLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = loginWithNipAndPassword(usernameNip, passwordNip);
    if (!result.success) {
      setErrorMsg(result.message || 'Gagal login NIP. Silakan periksa kembali NIP Anda.');
    }
  };

  const handleQuickTeacherSelect = (nip: string) => {
    setSelectedQuickTeacherNip(nip);
    setUsernameNip(nip);
    setPasswordNip(nip);
    setErrorMsg(null);
  };

  const waliList = initialSchoolProfile.waliKelasList || [];

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
              Sistem Administrasi Kesiswaan &amp; Buku Induk Terproteksi NIP Guru Binaan
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700/50 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Login Google &amp; Otentikasi NIP Binaan</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Privasi Terkunci: Rombel Binaan Lain Tidak Bisa Dilihat</span>
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
              Gunakan Akun Google atau Login NIP Penugasan untuk mengakses Rombel Binaan Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Opsi 1: Login dengan Username NIP & Password NIP */}
          <form onSubmit={handleNipLoginSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Masuk NIP Penugasan Rombel</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Bina Rombel
              </span>
            </div>

            {/* Quick Selector NIP Wali Kelas */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Pilih Nama Guru / Wali Kelas (Atau Ketik NIP):
              </label>
              <select
                value={selectedQuickTeacherNip}
                onChange={e => handleQuickTeacherSelect(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="">-- Pilih Penugasan NIP --</option>
                <option value={initialSchoolProfile.nipKepalaSekolah}>
                  🎓 Kepala Sekolah: {initialSchoolProfile.namaKepalaSekolah} (NIP: {initialSchoolProfile.nipKepalaSekolah})
                </option>
                {waliList.map(w => (
                  <option key={w.id} value={w.nip}>
                    👨‍🏫 Wali Kelas {w.kelas} {w.rombel || 'A'}: {w.nama} (NIP: {w.nip})
                  </option>
                ))}
                <option value="198001012005011001">
                  🛡️ Administrator Utama (Akses Penuh Sistem)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username NIP:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19850312 201001 2 021"
                  value={usernameNip}
                  onChange={e => setUsernameNip(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password NIP:
                </label>
                <input
                  type="password"
                  placeholder="Password NIP..."
                  value={passwordNip}
                  onChange={e => setPasswordNip(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:border-emerald-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Rombel Binaan Saya</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">
              Atau Google Sign-In
            </span>
          </div>

          {/* Opsi 2: Login Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-emerald-600 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );
};
