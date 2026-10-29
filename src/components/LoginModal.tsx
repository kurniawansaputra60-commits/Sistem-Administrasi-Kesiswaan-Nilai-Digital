import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { LogIn, Shield, User, Award, CheckCircle2, Building, AlertCircle, X, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, loginWithNipAndPassword, loginWithDemoRole, loading } = useAuth();
  const [nipInput, setNipInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan Google. Silakan coba lagi atau gunakan Username & Password NIP / NIK.');
    }
  };

  const handleNipLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!nipInput.trim()) {
      setErrorMsg('Silakan masukkan Username NIP atau NIK Anda.');
      return;
    }
    const success = loginWithNipAndPassword(nipInput, passwordInput);
    if (success) {
      onClose();
    } else {
      setErrorMsg('NIP, NIK, atau Password tidak cocok dengan daftar GTK SD NEGERI 1 CEMPAKA.');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginWithDemoRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col my-auto relative">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-emerald-900/30 hover:bg-emerald-900/50 p-1.5 rounded-full cursor-pointer transition-colors"
            title="Tutup Modal Login"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/20 shadow-inner p-1">
            <img
              src="/assets/aistudio/llogo_06ce9f11.png"
              alt="Logo SDN 1 Cempaka"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <h2 className="text-base font-extrabold tracking-wide uppercase">
            SD NEGERI 1 CEMPAKA
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Pusat Administrasi &amp; Ringkasan Kesiswaan T.A. 2025/2026
          </p>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Opsi 1: Login NIP / NIK (Rombel Binaan) */}
          <form onSubmit={handleNipLoginSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Login GTK (NIP / NIK Guru / Wali Kelas / Kepsek)
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Akses Sesuai Rombel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Username NIP / NIK</label>
                <input
                  type="text"
                  placeholder="Masukkan NIP / NIK"
                  value={nipInput}
                  onChange={e => setNipInput(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Password NIP / NIK</label>
                <input
                  type="password"
                  placeholder="Masukkan Password (NIP / NIK)"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk Berdasarkan Rombel Binaan</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              Atau Google / Akses Cepat
            </span>
          </div>

          {/* Opsi 2: Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-emerald-600 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
          </button>

          {/* Opsi 3: Akses Cepat Peran */}
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

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terintegrasi Firebase Cloud Auth</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
