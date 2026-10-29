import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testFirestoreConnection } from '../firebase';
import { initialSchoolProfile } from '../data/initialData';

export type UserRole = 'kepala_sekolah' | 'guru_kelas' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  nip?: string;
  kelasTugas?: string;
  rombelTugas?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoAccount: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithNipAndPassword: (usernameNip: string, passwordNip: string) => { success: boolean; message?: string };
  loginWithDemoRole: (role: UserRole, customName?: string, customNip?: string, kelasTugas?: string, rombelTugas?: string) => void;
  logout: () => Promise<void>;
  updateRole: (newRole: UserRole, extra?: { nip?: string; kelasTugas?: string; rombelTugas?: string }) => Promise<void>;
  setKelasRombelTugas: (kelas: string, rombel: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_PROFILE_STORAGE_KEY = 'adm_sekolah_user_profile_v3';

const getActiveSchoolProfile = (): typeof initialSchoolProfile => {
  try {
    const saved = localStorage.getItem('adm_sekolah_profile_v3');
    if (saved) return JSON.parse(saved);
  } catch {}
  return initialSchoolProfile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isDemoAccount, setIsDemoAccount] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
      return !!saved;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    }
  }, [userProfile]);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoAccount(false);
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // Profil awal baru
            const initialRole: UserRole = user.email?.includes('headmaster') || user.email?.includes('kepala') ? 'kepala_sekolah' : 'guru_kelas';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'user@sdn1cempaka.sch.id',
              displayName: user.displayName || 'Pengguna Terdaftar',
              role: initialRole,
              photoURL: user.photoURL || undefined,
              kelasTugas: '1',
              rombelTugas: 'A',
            };
            await setDoc(ref, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
          if (!userProfile) {
            setUserProfile({
              uid: user.uid,
              email: user.email || 'user@sdn1cempaka.sch.id',
              displayName: user.displayName || 'Guru SD NEGERI 1 CEMPAKA',
              role: 'guru_kelas',
              kelasTugas: '1',
              rombelTugas: 'A',
            });
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanNip = (str: string) => str ? str.replace(/\s+/g, '').trim().toLowerCase() : '';

  const loginWithNipAndPassword = (usernameNip: string, passwordNip: string): { success: boolean; message?: string } => {
    const userNipClean = cleanNip(usernameNip);
    const passNipClean = cleanNip(passwordNip);
    const activeSchoolProfile = getActiveSchoolProfile();

    if (!userNipClean) {
      return { success: false, message: 'Harap masukkan Username NIP!' };
    }
    if (!passNipClean) {
      return { success: false, message: 'Harap masukkan Password NIP!' };
    }
    if (userNipClean !== passNipClean) {
      return { success: false, message: 'Username NIP dan Password NIP tidak cocok! (Pastikan menginputkan NIP yang sama pada Username dan Password)' };
    }

    // 1. Cek NIP / NIK Kepala Sekolah
    const kepsekNipClean = cleanNip(activeSchoolProfile.nipKepalaSekolah);
    if (userNipClean === kepsekNipClean || userNipClean === 'kepsek' || userNipClean === 'kepala') {
      setIsDemoAccount(true);
      const profile: UserProfile = {
        uid: `nip-kepsek-${Date.now()}`,
        email: `kepsek@sdn1cempaka.sch.id`,
        displayName: activeSchoolProfile.namaKepalaSekolah,
        role: 'kepala_sekolah',
        nip: activeSchoolProfile.nipKepalaSekolah,
      };
      setUserProfile(profile);
      setLoading(false);
      return { success: true };
    }

    // 2. Cek NIP / NIK Wali Kelas (Termasuk Guru Non-ASN / Honorer menggunakan NIK 16 Digit)
    const matchedTeacher = (activeSchoolProfile.waliKelasList || []).find(
      w =>
        (w.nip && cleanNip(w.nip) === userNipClean) ||
        (w.nik && cleanNip(w.nik) === userNipClean) ||
        cleanNip(w.nama).includes(userNipClean)
    );

    if (matchedTeacher) {
      setIsDemoAccount(true);
      const profile: UserProfile = {
        uid: `nip-guru-${matchedTeacher.id}-${Date.now()}`,
        email: `guru.${matchedTeacher.kelas}${matchedTeacher.rombel || 'A'}@sdn1cempaka.sch.id`,
        displayName: matchedTeacher.nama,
        role: 'guru_kelas',
        nip: matchedTeacher.nip || matchedTeacher.nik,
        kelasTugas: matchedTeacher.kelas,
        rombelTugas: matchedTeacher.rombel || 'A',
      };
      setUserProfile(profile);
      setLoading(false);
      return { success: true };
    }

    return {
      success: false,
      message: `NIP / NIK '${usernameNip}' tidak terdaftar sebagai Wali Kelas atau Kepala Sekolah di SD NEGERI 1 CEMPAKA. Silakan periksa kembali NIP / NIK Anda.`,
    };
  };

  const loginWithDemoRole = (
    role: UserRole,
    customName?: string,
    customNip?: string,
    kelasTugas?: string,
    rombelTugas?: string
  ) => {
    setIsDemoAccount(true);
    let name = customName;
    let nip = customNip;
    let k = kelasTugas || '1';
    let r = rombelTugas || 'A';

    if (!name) {
      switch (role) {
        case 'kepala_sekolah':
          name = initialSchoolProfile.namaKepalaSekolah;
          nip = initialSchoolProfile.nipKepalaSekolah;
          break;
        case 'guru_kelas':
          const wk1a = initialSchoolProfile.waliKelasList?.[0];
          name = wk1a ? wk1a.nama : 'Siti Khadijah, S.Pd.';
          nip = wk1a ? wk1a.nip : '19850312 201001 2 021';
          k = wk1a ? wk1a.kelas : '1';
          r = wk1a ? (wk1a.rombel || 'A') : 'A';
          break;
        default:
          name = 'Administrator Utama';
          nip = '19800101 200501 1 001';
      }
    }

    const demoProfile: UserProfile = {
      uid: `demo-${role}-${Date.now()}`,
      email: `${role}@sdn1cempaka.sch.id`,
      displayName: name,
      role,
      nip,
      kelasTugas: role === 'guru_kelas' ? k : undefined,
      rombelTugas: role === 'guru_kelas' ? r : undefined,
    };

    setUserProfile(demoProfile);
    setLoading(false);
  };

  const setKelasRombelTugas = (kelas: string, rombel: string) => {
    setUserProfile(prev => (prev ? { ...prev, kelasTugas: kelas, rombelTugas: rombel } : null));
  };

  const updateRole = async (newRole: UserRole, extra?: { nip?: string; kelasTugas?: string; rombelTugas?: string }) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      role: newRole,
      ...extra,
    };
    setUserProfile(updated);

    if (currentUser && !isDemoAccount) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.error('Error updating profile in Firestore:', e);
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    setIsDemoAccount(false);
    setUserProfile(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isDemoAccount,
        signInWithGoogle,
        loginWithNipAndPassword,
        loginWithDemoRole,
        logout,
        updateRole,
        setKelasRombelTugas,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
