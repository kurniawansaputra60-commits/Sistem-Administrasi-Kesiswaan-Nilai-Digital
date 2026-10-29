import React, { useState } from 'react';
import { Printer, Plus, School, Settings, LogIn, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

interface HeaderProps {
  currentTitle: string;
  formatTag?: string;
  onOpenSettings?: () => void;
  onOpenAddStudent?: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTitle,
  formatTag,
  onOpenSettings,
  onOpenAddStudent,
  onPrint,
}) => {
  const { schoolProfile } = useSchool();
  const { userProfile, logout, loginWithDemoRole } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'kepala_sekolah':
        return 'Kepala Sekolah';
      case 'guru_kelas':
        return 'Guru / Wali Kelas';
      default:
        return 'Pengguna Sekolah';
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'kepala_sekolah':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'guru_kelas':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const isGuruKelas = userProfile?.role === 'guru_kelas';

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0 no-print print:hidden sticky top-0 z-20">
        {/* Zone 1: Breadcrumb and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/assets/aistudio/llogo_06ce9f11.png"
            alt="Logo SDN 1 Cempaka"
            className="w-8 h-8 object-contain shrink-0 drop-shadow-xs"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
            <span className="font-bold text-slate-800 truncate max-w-[160px]">
              {schoolProfile.namaSekolah}
            </span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{currentTitle}</span>
          </div>
          {formatTag && (
            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold whitespace-nowrap">
              Format : {formatTag}
            </span>
          )}
        </div>

        {/* Zone 2: School Year, Account & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 whitespace-nowrap">
            <School className="w-3.5 h-3.5 text-slate-500" />
            <span>
              T.A. <strong className="font-semibold text-slate-800">{schoolProfile.tahunAjaranAktif}</strong>
            </span>
            <span>·</span>
            <span>
              Sem. <strong className="font-semibold text-slate-800">{schoolProfile.semesterAktif === '1' ? 'Ganjil' : 'Genap'}</strong>
            </span>
          </div>

          {/* User Account / Role Widget */}
          {!isGuruKelas && (
            <div className="relative">
              {userProfile ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs cursor-pointer transition-colors"
                  title="Kelola Akun & Hak Akses"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      userProfile.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden md:block max-w-[130px] leading-tight">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {userProfile.displayName}
                    </div>
                    <div className="text-[9px] text-slate-500 font-semibold truncate">
                      {getRoleLabel(userProfile.role)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(userProfile.role)}`}>
                    {userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'kepala_sekolah' ? 'Kepsek' : 'Wali Kelas'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Masuk Akun</span>
                </button>
              )}

              {/* Dropdown User Profile Popover */}
              {isUserMenuOpen && userProfile && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-3 animate-in fade-in duration-100">
                  <div className="pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{userProfile.displayName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{userProfile.email}</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Peran: {getRoleLabel(userProfile.role)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ganti Peran Cepat
                    </span>
                    <button
                      onClick={() => {
                        loginWithDemoRole('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between cursor-pointer ${
                        userProfile.role === 'admin' ? 'bg-purple-50 text-purple-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Administrator</span>
                      {userProfile.role === 'admin' && <span className="text-[10px] text-purple-700">✓ Aktif</span>}
                    </button>
                    <button
                      onClick={() => {
                        loginWithDemoRole('kepala_sekolah');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between cursor-pointer ${
                        userProfile.role === 'kepala_sekolah' ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Kepala Sekolah</span>
                      {userProfile.role === 'kepala_sekolah' && <span className="text-[10px] text-amber-700">✓ Aktif</span>}
                    </button>
                    <button
                      onClick={() => {
                        loginWithDemoRole('guru_kelas');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between cursor-pointer ${
                        userProfile.role === 'guru_kelas' ? 'bg-blue-50 text-blue-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Guru / Wali Kelas</span>
                      {userProfile.role === 'guru_kelas' && <span className="text-[10px] text-blue-700">✓ Aktif</span>}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                    >
                      Ganti NIP / Akun
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isGuruKelas ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              title="Keluar dari akun Guru / Wali Kelas"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              title="Cetak format dokumen ini secara resmi"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak Format</span>
            </button>
          )}

          {!isGuruKelas && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              title="Buka Pengaturan Kop Surat, Logo Sekolah, dan Data Wali Kelas"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Kop &amp; Wali Kelas</span>
            </button>
          )}

          {onOpenAddStudent && (
            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Siswa</span>
            </button>
          )}
        </div>
      </header>

      {/* Modal Dialog Login */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
