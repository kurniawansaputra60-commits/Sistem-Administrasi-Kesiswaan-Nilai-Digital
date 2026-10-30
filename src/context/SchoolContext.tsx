import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  SchoolProfile,
  Student,
  DailyAttendanceRecord,
  PromotionRecord,
  SubjectGrade,
  AbsenceWarningLetter,
  TransferRequestLetter,
  TransferOutCertificate,
  TransferInConfirmation,
  ExamCandidate,
  ExamSession,
  GraduateStudyRecord,
  MySQLConfig,
  StudentMutationRecord,
  AchievementRecord,
  CurriculumTargetRecord,
  ExamScoreRecord,
} from '../types';
import {
  initialSchoolProfile,
  initialStudents,
  initialDailyAttendance,
  initialWarningLetters,
  initialTransferRequests,
  initialTransferOuts,
  initialTransferIns,
  initialExamCandidates,
  initialExamSessions,
  initialGradStudies,
  initialMySQLConfig,
  initialStudentMutations,
  initialAchievements,
  initialCurriculumTargets,
  initialExamScores,
  generateGrades,
} from '../data/initialData';
import { generateMySQLDump } from '../utils/mysqlSchema';

export { initialSchoolProfile };

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

interface SchoolContextType {
  schoolProfile: SchoolProfile;
  students: Student[];
  attendances: DailyAttendanceRecord[];
  warningLetters: AbsenceWarningLetter[];
  transferRequests: TransferRequestLetter[];
  transferOuts: TransferOutCertificate[];
  transferIns: TransferInConfirmation[];
  mutations: StudentMutationRecord[];
  examCandidates: ExamCandidate[];
  examSessions: ExamSession[];
  examScores: ExamScoreRecord[];
  gradStudies: GraduateStudyRecord[];
  achievements: AchievementRecord[];
  curriculumTargets: CurriculumTargetRecord[];
  mysqlConfig: MySQLConfig;

  // Real-time Cloud Firebase Firestore Status
  cloudSyncStatus: 'initial_loading' | 'synced' | 'syncing' | 'error';
  lastSyncedAt: Date | null;
  forceSyncToCloud: () => Promise<boolean>;
  
  // Actions
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => void;
  addStudent: (student: Omit<Student, 'id'>) => string;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Absensi & S-10 Panggilan Ortu
  saveAttendance: (record: DailyAttendanceRecord) => void;
  addWarningLetter: (letter: Omit<AbsenceWarningLetter, 'id'>) => void;
  deleteWarningLetter: (id: string) => void;
  
  // Mutasi S-12, S-13, S-14, PS-14a
  addTransferRequest: (req: Omit<TransferRequestLetter, 'id'>) => void;
  addTransferOut: (cert: Omit<TransferOutCertificate, 'id'>) => void;
  addTransferIn: (conf: Omit<TransferInConfirmation, 'id'>) => void;
  addMutation: (record: Omit<StudentMutationRecord, 'id'>) => void;
  deleteMutation: (id: string) => void;
  
  // Ujian S-15, S-16, S-17
  addExamCandidate: (cand: Omit<ExamCandidate, 'id'>) => void;
  updateExamCandidate: (id: string, updates: Partial<ExamCandidate>) => void;
  replaceExamCandidatesForClass: (className: string, rombel: string, candidates: ExamCandidate[]) => void;
  saveExamSession: (session: ExamSession) => void;
  updateExamScore: (record: ExamScoreRecord) => void;
  
  // Kelulusan & Lanjutan Studi S-18, S-19, S-20
  addGraduateStudy: (study: Omit<GraduateStudyRecord, 'id'>) => void;
  updateGraduateStudy: (id: string, updates: Partial<GraduateStudyRecord>) => void;
  updateStudentGrades: (studentId: string, semesterKey: string, grades: SubjectGrade[]) => void;
  updateStudentPromotion: (studentId: string, promotion: PromotionRecord) => void;
  batchPromoteClass: (fromClass: string, toClass: string, status: 'Naik ke Kelas' | 'Lulus') => void;

  // Prestasi PS-21 & PS-22
  addAchievement: (rec: Omit<AchievementRecord, 'id'>) => void;
  deleteAchievement: (id: string) => void;

  // Kurikulum PS-23 & PS-24
  saveCurriculumTarget: (record: CurriculumTargetRecord) => void;

  // Excel Import & Export
  importStudentsFromExcel: (imported: Partial<Student>[], mode: 'append' | 'replace') => { added: number; replaced: number };
  
  // MySQL & Backup
  updateMySQLConfig: (updates: Partial<MySQLConfig>) => void;
  testMySQLConnection: () => Promise<{ success: boolean; message: string }>;
  getMySQLDumpText: () => string;
  downloadMySQLDump: () => void;
  resetToDefaultData: () => void;
  exportDataToJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'adm_sekolah_profile_v3',
  STUDENTS: 'adm_sekolah_students_v3',
  ATTENDANCE: 'adm_sekolah_attendance_v3',
  WARNING_LETTERS: 'adm_sekolah_warning_letters_v3',
  TRANSFER_REQ: 'adm_sekolah_transfer_req_v3',
  TRANSFER_OUT: 'adm_sekolah_transfer_out_v3',
  TRANSFER_IN: 'adm_sekolah_transfer_in_v3',
  MUTATIONS: 'adm_sekolah_mutations_v3',
  EXAM_CANDIDATES: 'adm_sekolah_exam_cand_v3',
  EXAM_SESSIONS: 'adm_sekolah_exam_sessions_v3',
  EXAM_SCORES: 'adm_sekolah_exam_scores_v3',
  GRAD_STUDIES: 'adm_sekolah_grad_studies_v3',
  ACHIEVEMENTS: 'adm_sekolah_achievements_v3',
  CURRICULUM: 'adm_sekolah_curriculum_v3',
  MYSQL_CONFIG: 'adm_sekolah_mysql_config_v3',
};

// Helper to safely strip undefined values and sanitize payload for Firestore
const cleanFirestoreData = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!saved) return initialSchoolProfile;
      const parsed = JSON.parse(saved);
      // Pastikan logoSekolahUrl terisi logo resmi baru
      const logoUrl = parsed.logoSekolahUrl && !parsed.logoSekolahUrl.includes('KOP_SURAT_NEW')
        ? parsed.logoSekolahUrl
        : '/assets/aistudio/llogo_06ce9f11.png';

      // Pertahankan secara utuh data waliKelasList yang telah diatur oleh pengguna
      const validWaliList = Array.isArray(parsed.waliKelasList) && parsed.waliKelasList.length > 0
        ? parsed.waliKelasList
        : initialSchoolProfile.waliKelasList;

      return {
        ...initialSchoolProfile,
        ...parsed,
        logoSekolahUrl: logoUrl,
        namaPetugasAdmin: parsed.namaPetugasAdmin || 'KURNIAWAN SAPUTRA',
        nipPetugasAdmin: parsed.nipPetugasAdmin || '19890906 202521 1 004',
        petugasAdminTtdUrl: parsed.petugasAdminTtdUrl || initialSchoolProfile.petugasAdminTtdUrl,
        waliKelasList: validWaliList,
      };
    } catch {
      return initialSchoolProfile;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [attendances, setAttendances] = useState<DailyAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : initialDailyAttendance;
    } catch {
      return initialDailyAttendance;
    }
  });

  const [warningLetters, setWarningLetters] = useState<AbsenceWarningLetter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WARNING_LETTERS);
      return saved ? JSON.parse(saved) : initialWarningLetters;
    } catch {
      return initialWarningLetters;
    }
  });

  const [transferRequests, setTransferRequests] = useState<TransferRequestLetter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFER_REQ);
      return saved ? JSON.parse(saved) : initialTransferRequests;
    } catch {
      return initialTransferRequests;
    }
  });

  const [transferOuts, setTransferOuts] = useState<TransferOutCertificate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFER_OUT);
      return saved ? JSON.parse(saved) : initialTransferOuts;
    } catch {
      return initialTransferOuts;
    }
  });

  const [transferIns, setTransferIns] = useState<TransferInConfirmation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFER_IN);
      return saved ? JSON.parse(saved) : initialTransferIns;
    } catch {
      return initialTransferIns;
    }
  });

  const [mutations, setMutations] = useState<StudentMutationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
      return saved ? JSON.parse(saved) : initialStudentMutations;
    } catch {
      return initialStudentMutations;
    }
  });

  const [examCandidates, setExamCandidates] = useState<ExamCandidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_CANDIDATES);
      return saved ? JSON.parse(saved) : initialExamCandidates;
    } catch {
      return initialExamCandidates;
    }
  });

  const [examSessions, setExamSessions] = useState<ExamSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS);
      return saved ? JSON.parse(saved) : initialExamSessions;
    } catch {
      return initialExamSessions;
    }
  });

  const [examScores, setExamScores] = useState<ExamScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_SCORES);
      return saved ? JSON.parse(saved) : initialExamScores;
    } catch {
      return initialExamScores;
    }
  });

  const [gradStudies, setGradStudies] = useState<GraduateStudyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRAD_STUDIES);
      return saved ? JSON.parse(saved) : initialGradStudies;
    } catch {
      return initialGradStudies;
    }
  });

  const [achievements, setAchievements] = useState<AchievementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch {
      return initialAchievements;
    }
  });

  const [curriculumTargets, setCurriculumTargets] = useState<CurriculumTargetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
      return saved ? JSON.parse(saved) : initialCurriculumTargets;
    } catch {
      return initialCurriculumTargets;
    }
  });

  const [mysqlConfig, setMysqlConfig] = useState<MySQLConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MYSQL_CONFIG);
      return saved ? JSON.parse(saved) : initialMySQLConfig;
    } catch {
      return initialMySQLConfig;
    }
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'initial_loading' | 'synced' | 'syncing' | 'error'>('initial_loading');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Critical guards to prevent initial state from overwriting cloud data and avoid ping-pong loops
  const isCloudLoadedRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);
  const writeTimeoutRef = useRef<any>(null);

  // 1. Real-time Listener from Firebase Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'school_data', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          isRemoteUpdateRef.current = true;

          if (data.schoolProfile) {
            setSchoolProfile(prev => ({
              ...prev,
              ...data.schoolProfile,
              // Pastikan logo tetap valid jika kosong
              logoSekolahUrl: data.schoolProfile.logoSekolahUrl || prev.logoSekolahUrl,
            }));
          }
          if (Array.isArray(data.students)) setStudents(data.students);
          if (Array.isArray(data.attendances)) setAttendances(data.attendances);
          if (Array.isArray(data.warningLetters)) setWarningLetters(data.warningLetters);
          if (Array.isArray(data.transferRequests)) setTransferRequests(data.transferRequests);
          if (Array.isArray(data.transferOuts)) setTransferOuts(data.transferOuts);
          if (Array.isArray(data.transferIns)) setTransferIns(data.transferIns);
          if (Array.isArray(data.mutations)) setMutations(data.mutations);
          if (Array.isArray(data.examCandidates)) setExamCandidates(data.examCandidates);
          if (Array.isArray(data.examSessions)) setExamSessions(data.examSessions);
          if (Array.isArray(data.examScores)) setExamScores(data.examScores);
          if (Array.isArray(data.gradStudies)) setGradStudies(data.gradStudies);
          if (Array.isArray(data.achievements)) setAchievements(data.achievements);
          if (Array.isArray(data.curriculumTargets)) setCurriculumTargets(data.curriculumTargets);

          // Update local storage backup
          try {
            if (data.schoolProfile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.schoolProfile));
            if (Array.isArray(data.students)) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
            if (Array.isArray(data.attendances)) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendances));
            if (Array.isArray(data.warningLetters)) localStorage.setItem(STORAGE_KEYS.WARNING_LETTERS, JSON.stringify(data.warningLetters));
            if (Array.isArray(data.transferRequests)) localStorage.setItem(STORAGE_KEYS.TRANSFER_REQ, JSON.stringify(data.transferRequests));
            if (Array.isArray(data.transferOuts)) localStorage.setItem(STORAGE_KEYS.TRANSFER_OUT, JSON.stringify(data.transferOuts));
            if (Array.isArray(data.transferIns)) localStorage.setItem(STORAGE_KEYS.TRANSFER_IN, JSON.stringify(data.transferIns));
            if (Array.isArray(data.mutations)) localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(data.mutations));
            if (Array.isArray(data.examCandidates)) localStorage.setItem(STORAGE_KEYS.EXAM_CANDIDATES, JSON.stringify(data.examCandidates));
            if (Array.isArray(data.examSessions)) localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(data.examSessions));
            if (Array.isArray(data.examScores)) localStorage.setItem(STORAGE_KEYS.EXAM_SCORES, JSON.stringify(data.examScores));
            if (Array.isArray(data.gradStudies)) localStorage.setItem(STORAGE_KEYS.GRAD_STUDIES, JSON.stringify(data.gradStudies));
            if (Array.isArray(data.achievements)) localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
            if (Array.isArray(data.curriculumTargets)) localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(data.curriculumTargets));
          } catch (e) {
            console.warn('LocalStorage backup sync:', e);
          }

          isCloudLoadedRef.current = true;
          setCloudSyncStatus('synced');
          setLastSyncedAt(new Date());

          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 150);
        } else {
          // Cloud document does not exist yet (first time initialization)
          isCloudLoadedRef.current = true;
          setCloudSyncStatus('synced');
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'school_data/main');
        setCloudSyncStatus('error');
        // If offline, still allow user to work with local data
        isCloudLoadedRef.current = true;
      }
    );

    return () => unsub();
  }, []);

  // 2. Debounced push to Cloud Firebase Firestore when local state changes
  useEffect(() => {
    // Selalu simpan di LocalStorage sebagai cadangan lokal instan
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(schoolProfile));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendances));
    localStorage.setItem(STORAGE_KEYS.WARNING_LETTERS, JSON.stringify(warningLetters));
    localStorage.setItem(STORAGE_KEYS.TRANSFER_REQ, JSON.stringify(transferRequests));
    localStorage.setItem(STORAGE_KEYS.TRANSFER_OUT, JSON.stringify(transferOuts));
    localStorage.setItem(STORAGE_KEYS.TRANSFER_IN, JSON.stringify(transferIns));
    localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(mutations));
    localStorage.setItem(STORAGE_KEYS.EXAM_CANDIDATES, JSON.stringify(examCandidates));
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(examSessions));
    localStorage.setItem(STORAGE_KEYS.EXAM_SCORES, JSON.stringify(examScores));
    localStorage.setItem(STORAGE_KEYS.GRAD_STUDIES, JSON.stringify(gradStudies));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(curriculumTargets));
    localStorage.setItem(STORAGE_KEYS.MYSQL_CONFIG, JSON.stringify(mysqlConfig));

    // GUARD 1: JANGAN TIMPA CLOUD sebelum data awal dari Firestore berhasil termuat!
    if (!isCloudLoadedRef.current) {
      return;
    }

    // GUARD 2: JANGAN kirim balik data yang baru saja diterima dari onSnapshot!
    if (isRemoteUpdateRef.current) {
      return;
    }

    setCloudSyncStatus('syncing');

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
    }

    writeTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = cleanFirestoreData({
          schoolProfile,
          students,
          attendances,
          warningLetters,
          transferRequests,
          transferOuts,
          transferIns,
          mutations,
          examCandidates,
          examSessions,
          examScores,
          gradStudies,
          achievements,
          curriculumTargets,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'school_data', 'main'), payload, { merge: true });

        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'school_data/main');
        setCloudSyncStatus('error');
      }
    }, 600); // 600ms debounce

    // Sync juga ke backend server jika aktif
    try {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolProfile,
          students,
          attendances,
          warningLetters,
          transferRequests,
          transferOuts,
          transferIns,
          mutations,
          examCandidates,
          examSessions,
          examScores,
          gradStudies,
          achievements,
          curriculumTargets,
        }),
      }).catch(() => {});
    } catch {}

    return () => {
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
      }
    };
  }, [
    schoolProfile,
    students,
    attendances,
    warningLetters,
    transferRequests,
    transferOuts,
    transferIns,
    mutations,
    examCandidates,
    examSessions,
    examScores,
    gradStudies,
    achievements,
    curriculumTargets,
    mysqlConfig,
  ]);

  const forceSyncToCloud = async (): Promise<boolean> => {
    try {
      setCloudSyncStatus('syncing');
      const payload = cleanFirestoreData({
        schoolProfile,
        students,
        attendances,
        warningLetters,
        transferRequests,
        transferOuts,
        transferIns,
        mutations,
        examCandidates,
        examSessions,
        examScores,
        gradStudies,
        achievements,
        curriculumTargets,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'school_data', 'main'), payload, { merge: true });
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'school_data/main');
      setCloudSyncStatus('error');
      return false;
    }
  };

  const updateSchoolProfile = (updates: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving updated schoolProfile to localStorage:', err);
      }
      return next;
    });
    // Immediately trigger forceSyncToCloud
    setTimeout(() => {
      forceSyncToCloud().catch(err => console.warn('Sync profile error:', err));
    }, 50);
  };

  const addStudent = (studentData: Omit<Student, 'id'>): string => {
    const newId = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      nilaiSemester: studentData.nilaiSemester || {
        '2025/2026-1': generateGrades(students.length),
        '2025/2026-2': generateGrades(students.length + 1),
      },
    };
    setStudents(prev => [newStudent, ...prev]);
    return newId;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const saveAttendance = (record: DailyAttendanceRecord) => {
    setAttendances(prev => {
      const idx = prev.findIndex(a => a.tanggal === record.tanggal && a.kelas === record.kelas);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const addWarningLetter = (letterData: Omit<AbsenceWarningLetter, 'id'>) => {
    const newLetter: AbsenceWarningLetter = {
      ...letterData,
      id: `letter-${Date.now()}`,
    };
    setWarningLetters(prev => [newLetter, ...prev]);
  };

  const deleteWarningLetter = (id: string) => {
    setWarningLetters(prev => prev.filter(l => l.id !== id));
  };

  const addTransferRequest = (reqData: Omit<TransferRequestLetter, 'id'>) => {
    const newReq: TransferRequestLetter = {
      ...reqData,
      id: `treq-${Date.now()}`,
    };
    setTransferRequests(prev => [newReq, ...prev]);
  };

  const addTransferOut = (certData: Omit<TransferOutCertificate, 'id'>) => {
    const newCert: TransferOutCertificate = {
      ...certData,
      id: `tout-${Date.now()}`,
    };
    setTransferOuts(prev => [newCert, ...prev]);

    // Also update student status to mutasi_keluar
    if (certData.studentId) {
      updateStudent(certData.studentId, { statusSiswa: 'mutasi_keluar' });
    }
  };

  const addTransferIn = (confData: Omit<TransferInConfirmation, 'id'>) => {
    const newConf: TransferInConfirmation = {
      ...confData,
      id: `tin-${Date.now()}`,
    };
    setTransferIns(prev => [newConf, ...prev]);
  };

  const addMutation = (record: Omit<StudentMutationRecord, 'id'>) => {
    const newRecord: StudentMutationRecord = {
      ...record,
      id: `mut-${Date.now()}`,
    };
    setMutations(prev => [newRecord, ...prev]);
  };

  const deleteMutation = (id: string) => {
    setMutations(prev => prev.filter(m => m.id !== id));
  };

  const addExamCandidate = (candData: Omit<ExamCandidate, 'id'>) => {
    const newCand: ExamCandidate = {
      ...candData,
      id: `cand-${Date.now()}`,
    };
    setExamCandidates(prev => [newCand, ...prev]);
  };

  const updateExamCandidate = (id: string, updates: Partial<ExamCandidate>) => {
    setExamCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const replaceExamCandidatesForClass = (className: string, rombel: string, newCandidates: ExamCandidate[]) => {
    setExamCandidates(prev => {
      // Hilangkan data lama untuk kelas & rombel yang bersangkutan
      const remaining = prev.filter(c => {
        const matchClass = String(c.kelas).trim().toUpperCase() === String(className).trim().toUpperCase();
        const st = students.find(s => s.id === c.studentId);
        const matchRombel = (st?.rombel || 'A') === rombel;
        return !(matchClass && matchRombel);
      });
      return [...newCandidates, ...remaining];
    });
  };

  const saveExamSession = (session: ExamSession) => {
    setExamSessions(prev => {
      const idx = prev.findIndex(s => s.id === session.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [...prev, session];
    });
  };

  const updateExamScore = (record: ExamScoreRecord) => {
    setExamScores(prev => {
      const idx = prev.findIndex(s => s.studentId === record.studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const addGraduateStudy = (studyData: Omit<GraduateStudyRecord, 'id'>) => {
    const newStudy: GraduateStudyRecord = {
      ...studyData,
      id: `grad-${Date.now()}`,
    };
    setGradStudies(prev => [newStudy, ...prev]);
  };

  const updateGraduateStudy = (id: string, updates: Partial<GraduateStudyRecord>) => {
    setGradStudies(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const updateStudentGrades = (studentId: string, semesterKey: string, grades: SubjectGrade[]) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          nilaiSemester: {
            ...s.nilaiSemester,
            [semesterKey]: grades,
          },
        };
      })
    );
  };

  const updateStudentPromotion = (studentId: string, promotion: PromotionRecord) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          riwayatKenaikan: promotion,
        };
      })
    );
  };

  const batchPromoteClass = (fromClass: string, toClass: string, status: 'Naik ke Kelas' | 'Lulus') => {
    const currentYear = schoolProfile.tahunAjaranAktif;
    setStudents(prev =>
      prev.map(s => {
        if (s.kelasSekarang === fromClass && s.statusSiswa === 'aktif') {
          return {
            ...s,
            riwayatKenaikan: {
              tahunAjaran: currentYear,
              status,
              kelasTujuan: toClass,
            },
          };
        }
        return s;
      })
    );
  };

  const addAchievement = (rec: Omit<AchievementRecord, 'id'>) => {
    const newAch: AchievementRecord = {
      ...rec,
      id: `ach-${Date.now()}`,
    };
    setAchievements(prev => [newAch, ...prev]);
  };

  const deleteAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const saveCurriculumTarget = (record: CurriculumTargetRecord) => {
    setCurriculumTargets(prev => {
      const idx = prev.findIndex(c => c.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const importStudentsFromExcel = (
    importedList: Partial<Student>[],
    mode: 'append' | 'replace'
  ): { added: number; replaced: number } => {
    const formattedStudents: Student[] = importedList.map((item, idx) => {
      const id = item.id || `stu-imp-${Date.now()}-${idx}`;
      return {
        id,
        nis: item.nis || `${2025000 + idx + 1}`,
        nisn: item.nisn || `${1000000000 + idx}`,
        namaLengkap: item.namaLengkap || 'Siswa Baru',
        namaPanggilan: item.namaPanggilan || (item.namaLengkap ? item.namaLengkap.split(' ')[0] : 'Siswa'),
        jenisKelamin: item.jenisKelamin || 'L',
        tempatLahir: item.tempatLahir || 'Jakarta',
        tanggalLahir: item.tanggalLahir || '2018-06-01',
        agama: item.agama || 'Islam',
        kewarganegaraan: item.kewarganegaraan || 'Indonesia',
        anakKe: item.anakKe || 1,
        jumlahSaudara: item.jumlahSaudara || 2,
        bahasaSehariHari: item.bahasaSehariHari || 'Bahasa Indonesia',
        alamat: item.alamat || 'Jl. Raya Pendidikan No. 1',
        kelurahan: item.kelurahan || 'Cempaka Putih Timur',
        kecamatan: item.kecamatan || 'Cempaka Putih',
        kabupatenKota: item.kabupatenKota || 'Jakarta Pusat',
        provinsi: item.provinsi || 'DKI Jakarta',
        telepon: item.telepon || '',
        noHp: item.noHp || '',
        statusSiswa: item.statusSiswa || 'aktif',
        kelasSekarang: item.kelasSekarang || 'I',
        rombel: item.rombel || (item as any).rombel || 'A',
        tanggalDiterima: item.tanggalDiterima || '2025-07-14',
        diterimaDiKelas: item.diterimaDiKelas || item.kelasSekarang || 'I',
        asalSekolah: item.asalSekolah || 'TK Pertiwi',
        noIjazahSebelumnya: item.noIjazahSebelumnya || '',
        tahunIjazah: item.tahunIjazah || '2025',
        dataAyah: item.dataAyah || {
          nama: (item as any).namaAyah || 'Bapak Siswa',
          pendidikan: (item as any).pendidikanAyah || 'SMA',
          pekerjaan: (item as any).pekerjaanAyah || 'Swasta',
          penghasilan: (item as any).penghasilanAyah || '3.000.000 - 5.000.000',
          noHp: (item as any).noHpAyah || (item as any).noHp || '08123456789',
        },
        dataIbu: item.dataIbu || {
          nama: (item as any).namaIbu || 'Ibu Siswa',
          pendidikan: (item as any).pendidikanIbu || 'SMA',
          pekerjaan: (item as any).pekerjaanIbu || 'Ibu Rumah Tangga',
          penghasilan: (item as any).penghasilanIbu || 'Tidak Berpenghasilan',
          noHp: (item as any).noHpIbu || (item as any).noHpAyah || (item as any).noHp || '08123456789',
        },
        nilaiSemester: item.nilaiSemester || {
          '2025/2026-1': generateGrades(idx),
          '2025/2026-2': generateGrades(idx + 1),
        },
      };
    });

    if (mode === 'replace') {
      setStudents(formattedStudents);
      return { added: formattedStudents.length, replaced: students.length };
    } else {
      // Append: avoid duplicating NIS
      const existingNisSet = new Set(students.map(s => s.nis));
      const newlyAdded = formattedStudents.filter(s => !existingNisSet.has(s.nis));
      setStudents(prev => [...prev, ...newlyAdded]);
      return { added: newlyAdded.length, replaced: 0 };
    }
  };

  const updateMySQLConfig = (updates: Partial<MySQLConfig>) => {
    setMysqlConfig(prev => ({ ...prev, ...updates }));
  };

  const testMySQLConnection = async () => {
    try {
      const res = await fetch('/api/mysql/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mysqlConfig),
      });
      const data = await res.json();
      if (data.success) {
        updateMySQLConfig({ isConnected: true, lastSync: new Date().toLocaleTimeString('id-ID') });
        return { success: true, message: data.message };
      } else {
        updateMySQLConfig({ isConnected: false });
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      updateMySQLConfig({ isConnected: false });
      return {
        success: false,
        message: `Tidak dapat menghubungi server MySQL: ${err.message}. Anda tetap dapat mengunduh file dump .sql lengkap untuk dieksekusi di MySQL/phpMyAdmin.`,
      };
    }
  };

  const getMySQLDumpText = () => {
    return generateMySQLDump(
      schoolProfile,
      students,
      attendances,
      warningLetters,
      transferRequests,
      transferOuts,
      transferIns,
      examCandidates,
      examSessions,
      gradStudies
    );
  };

  const downloadMySQLDump = () => {
    const sqlText = getMySQLDumpText();
    const blob = new Blob([sqlText], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database_mysql_kesiswaan_${schoolProfile.npsn}_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaultData = () => {
    setSchoolProfile(initialSchoolProfile);
    setStudents(initialStudents);
    setAttendances(initialDailyAttendance);
    setWarningLetters(initialWarningLetters);
    setTransferRequests(initialTransferRequests);
    setTransferOuts(initialTransferOuts);
    setTransferIns(initialTransferIns);
    setMutations(initialStudentMutations);
    setExamCandidates(initialExamCandidates);
    setExamSessions(initialExamSessions);
    setExamScores(initialExamScores);
    setGradStudies(initialGradStudies);
    setAchievements(initialAchievements);
    setCurriculumTargets(initialCurriculumTargets);
    setMysqlConfig(initialMySQLConfig);
    localStorage.clear();
  };

  const exportDataToJson = () => {
    return JSON.stringify(
      {
        version: '3.0',
        exportedAt: new Date().toISOString(),
        schoolProfile,
        students,
        attendances,
        warningLetters,
        transferRequests,
        transferOuts,
        transferIns,
        mutations,
        examCandidates,
        examSessions,
        examScores,
        gradStudies,
        achievements,
        curriculumTargets,
      },
      null,
      2
    );
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.schoolProfile) setSchoolProfile(data.schoolProfile);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.attendances)) setAttendances(data.attendances);
      if (Array.isArray(data.warningLetters)) setWarningLetters(data.warningLetters);
      if (Array.isArray(data.transferRequests)) setTransferRequests(data.transferRequests);
      if (Array.isArray(data.transferOuts)) setTransferOuts(data.transferOuts);
      if (Array.isArray(data.transferIns)) setTransferIns(data.transferIns);
      if (Array.isArray(data.mutations)) setMutations(data.mutations);
      if (Array.isArray(data.examCandidates)) setExamCandidates(data.examCandidates);
      if (Array.isArray(data.examSessions)) setExamSessions(data.examSessions);
      if (Array.isArray(data.examScores)) setExamScores(data.examScores);
      if (Array.isArray(data.gradStudies)) setGradStudies(data.gradStudies);
      if (Array.isArray(data.achievements)) setAchievements(data.achievements);
      if (Array.isArray(data.curriculumTargets)) setCurriculumTargets(data.curriculumTargets);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        schoolProfile,
        students,
        attendances,
        warningLetters,
        transferRequests,
        transferOuts,
        transferIns,
        mutations,
        examCandidates,
        examSessions,
        examScores,
        gradStudies,
        achievements,
        curriculumTargets,
        mysqlConfig,
        cloudSyncStatus,
        lastSyncedAt,
        forceSyncToCloud,
        updateSchoolProfile,
        addStudent,
        updateStudent,
        deleteStudent,
        saveAttendance,
        addWarningLetter,
        deleteWarningLetter,
        addTransferRequest,
        addTransferOut,
        addTransferIn,
        addMutation,
        deleteMutation,
        addExamCandidate,
        updateExamCandidate,
        replaceExamCandidatesForClass,
        saveExamSession,
        updateExamScore,
        addGraduateStudy,
        updateGraduateStudy,
        updateStudentGrades,
        updateStudentPromotion,
        batchPromoteClass,
        addAchievement,
        deleteAchievement,
        saveCurriculumTarget,
        importStudentsFromExcel,
        updateMySQLConfig,
        testMySQLConnection,
        getMySQLDumpText,
        downloadMySQLDump,
        resetToDefaultData,
        exportDataToJson,
        importDataFromJson,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
