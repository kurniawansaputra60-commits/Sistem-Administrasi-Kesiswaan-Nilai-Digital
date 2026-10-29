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
    const result = loginWithNipAndPassword(nipInput, passwordInput);
    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message || 'NIP, NIK, atau Password tidak cocok dengan daftar GTK SD NEGERI 1 CEMPAKA.');
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

          {/* Petunjuk Masuk Akun */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 text-[11px] text-slate-700">
            <p className="leading-relaxed">
              • <strong>Guru / Wali Kelas</strong>: Gunakan NIP (atau 16-digit NIK bagi Non-ASN) sebagai Username &amp; Password.
            </p>
            <p className="leading-relaxed">
              • <strong>Kepala Sekolah</strong>: Gunakan NIP Kepala Sekolah sebagai Username &amp; Password.
            </p>
            <p className="leading-relaxed">
              • <strong>Administrator</strong>: Gunakan username <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-900">admin</code> dan password <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-900">admin</code>.
            </p>
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
