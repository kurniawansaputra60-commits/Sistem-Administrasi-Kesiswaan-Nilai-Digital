import React, { useState } from 'react';
import { Printer, School, LogIn, LogOut, ShieldCheck, User } from 'lucide-react';
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
  onPrint,
}) => {
  const { schoolProfile } = useSchool();
  const { userProfile, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

        {/* Zone 2: School Year, Account & Print Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Badge Tahun Ajaran & Semester */}
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

          {/* User Profile Badge (Sama dan seragam untuk Wali Kelas, Kepala Sekolah, dan Administrator) */}
          {userProfile ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  userProfile.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-left hidden md:block max-w-[140px] leading-tight">
                <div className="font-bold text-slate-800 text-[11px] truncate">
                  {userProfile.displayName}
                </div>
                <div className="text-[9px] text-slate-500 font-semibold truncate">
                  {userProfile.role === 'guru_kelas' && userProfile.kelasTugas
                    ? `Wali Kelas ${userProfile.kelasTugas}${userProfile.rombelTugas || ''}`
                    : getRoleLabel(userProfile.role)}
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(userProfile.role)}`}>
                {userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'kepala_sekolah' ? 'Kepsek' : 'Wali Kelas'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-all shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Masuk Akun</span>
            </button>
          )}

          {/* Tombol Cetak Format Resmi */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title="Cetak format dokumen ini secara resmi"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Cetak Format</span>
          </button>

          {/* Tombol Log Out / Keluar (Seragam dan langsung untuk semua peran) */}
          {userProfile && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </header>

      {/* Modal Dialog Login jika dibutuhkan */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
