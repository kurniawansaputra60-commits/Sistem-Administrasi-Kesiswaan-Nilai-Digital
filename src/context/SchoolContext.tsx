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
    path,
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

  cloudSyncStatus: 'initial_loading' | 'synced' | 'syncing' | 'error';
  lastSyncedAt: Date | null;
  forceSyncToCloud: () => Promise<boolean>;

  updateSchoolProfile: (updates: Partial<SchoolProfile>) => void;
  addStudent: (student: Omit<Student, 'id'>) => string;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  saveAttendance: (record: DailyAttendanceRecord) => void;
  addWarningLetter: (letter: Omit<AbsenceWarningLetter, 'id'>) => void;
  deleteWarningLetter: (id: string) => void;

  addTransferRequest: (req: Omit<TransferRequestLetter, 'id'>) => void;
  addTransferOut: (cert: Omit<TransferOutCertificate, 'id'>) => void;
  addTransferIn: (conf: Omit<TransferInConfirmation, 'id'>) => void;
  addMutation: (record: Omit<StudentMutationRecord, 'id'>) => void;
  deleteMutation: (id: string) => void;

  addExamCandidate: (cand: Omit<ExamCandidate, 'id'>) => void;
  updateExamCandidate: (id: string, updates: Partial<ExamCandidate>) => void;
  replaceExamCandidatesForClass: (className: string, rombel: string, candidates: ExamCandidate[]) => void;
  saveExamSession: (session: ExamSession) => void;
  updateExamScore: (record: ExamScoreRecord) => void;

  addGraduateStudy: (study: Omit<GraduateStudyRecord, 'id'>) => void;
  updateGraduateStudy: (id: string, updates: Partial<GraduateStudyRecord>) => void;
  updateStudentGrades: (studentId: string, semesterKey: string, grades: SubjectGrade[]) => void;
  updateStudentPromotion: (studentId: string, promotion: PromotionRecord) => void;
  batchPromoteClass: (fromClass: string, toClass: string, status: 'Naik ke Kelas' | 'Lulus') => void;

  addAchievement: (rec: Omit<AchievementRecord, 'id'>) => void;
  deleteAchievement: (id: string) => void;

  saveCurriculumTarget: (record: CurriculumTargetRecord) => void;

  importStudentsFromExcel: (imported: Partial<Student>[], mode: 'append' | 'replace') => { added: number; replaced: number };

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

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
};

const clearSchoolStorage = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

const cleanFirestoreData = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
};

const readTimestamp = (value: any): number => {
  if (!value) return 0;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const applyRemoteSnapshot = (data: any, setters: {
  setSchoolProfile: React.Dispatch<React.SetStateAction<SchoolProfile>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setAttendances: React.Dispatch<React.SetStateAction<DailyAttendanceRecord[]>>;
  setWarningLetters: React.Dispatch<React.SetStateAction<AbsenceWarningLetter[]>>;
  setTransferRequests: React.Dispatch<React.SetStateAction<TransferRequestLetter[]>>;
  setTransferOuts: React.Dispatch<React.SetStateAction<TransferOutCertificate[]>>;
  setTransferIns: React.Dispatch<React.SetStateAction<TransferInConfirmation[]>>;
  setMutations: React.Dispatch<React.SetStateAction<StudentMutationRecord[]>>;
  setExamCandidates: React.Dispatch<React.SetStateAction<ExamCandidate[]>>;
  setExamSessions: React.Dispatch<React.SetStateAction<ExamSession[]>>;
  setExamScores: React.Dispatch<React.SetStateAction<ExamScoreRecord[]>>;
  setGradStudies: React.Dispatch<React.SetStateAction<GraduateStudyRecord[]>>;
  setAchievements: React.Dispatch<React.SetStateAction<AchievementRecord[]>>;
  setCurriculumTargets: React.Dispatch<React.SetStateAction<CurriculumTargetRecord[]>>;
}) => {
  const remoteUpdatedAt = readTimestamp(data?.updatedAt);
  const localUpdatedAt = readTimestamp(safeRead<Record<string, any>>(STORAGE_KEYS.PROFILE, {}).updatedAt);

  if (remoteUpdatedAt > 0 && localUpdatedAt > 0 && remoteUpdatedAt < localUpdatedAt) {
    return false;
  }

  if (data.schoolProfile) {
    setters.setSchoolProfile((prev) => ({
      ...prev,
      ...data.schoolProfile,
      logoSekolahUrl: data.schoolProfile.logoSekolahUrl || prev.logoSekolahUrl,
      updatedAt: data.schoolProfile.updatedAt || data.updatedAt || prev.updatedAt,
    }));
  }
  if (Array.isArray(data.students)) setters.setStudents(data.students);
  if (Array.isArray(data.attendances)) setters.setAttendances(data.attendances);
  if (Array.isArray(data.warningLetters)) setters.setWarningLetters(data.warningLetters);
  if (Array.isArray(data.transferRequests)) setters.setTransferRequests(data.transferRequests);
  if (Array.isArray(data.transferOuts)) setters.setTransferOuts(data.transferOuts);
  if (Array.isArray(data.transferIns)) setters.setTransferIns(data.transferIns);
  if (Array.isArray(data.mutations)) setters.setMutations(data.mutations);
  if (Array.isArray(data.examCandidates)) setters.setExamCandidates(data.examCandidates);
  if (Array.isArray(data.examSessions)) setters.setExamSessions(data.examSessions);
  if (Array.isArray(data.examScores)) setters.setExamScores(data.examScores);
  if (Array.isArray(data.gradStudies)) setters.setGradStudies(data.gradStudies);
  if (Array.isArray(data.achievements)) setters.setAchievements(data.achievements);
  if (Array.isArray(data.curriculumTargets)) setters.setCurriculumTargets(data.curriculumTargets);

  try {
    if (data.schoolProfile) safeWrite(STORAGE_KEYS.PROFILE, data.schoolProfile);
    if (Array.isArray(data.students)) safeWrite(STORAGE_KEYS.STUDENTS, data.students);
    if (Array.isArray(data.attendances)) safeWrite(STORAGE_KEYS.ATTENDANCE, data.attendances);
    if (Array.isArray(data.warningLetters)) safeWrite(STORAGE_KEYS.WARNING_LETTERS, data.warningLetters);
    if (Array.isArray(data.transferRequests)) safeWrite(STORAGE_KEYS.TRANSFER_REQ, data.transferRequests);
    if (Array.isArray(data.transferOuts)) safeWrite(STORAGE_KEYS.TRANSFER_OUT, data.transferOuts);
    if (Array.isArray(data.transferIns)) safeWrite(STORAGE_KEYS.TRANSFER_IN, data.transferIns);
    if (Array.isArray(data.mutations)) safeWrite(STORAGE_KEYS.MUTATIONS, data.mutations);
    if (Array.isArray(data.examCandidates)) safeWrite(STORAGE_KEYS.EXAM_CANDIDATES, data.examCandidates);
    if (Array.isArray(data.examSessions)) safeWrite(STORAGE_KEYS.EXAM_SESSIONS, data.examSessions);
    if (Array.isArray(data.examScores)) safeWrite(STORAGE_KEYS.EXAM_SCORES, data.examScores);
    if (Array.isArray(data.gradStudies)) safeWrite(STORAGE_KEYS.GRAD_STUDIES, data.gradStudies);
    if (Array.isArray(data.achievements)) safeWrite(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
    if (Array.isArray(data.curriculumTargets)) safeWrite(STORAGE_KEYS.CURRICULUM, data.curriculumTargets);
  } catch (e) {
    console.warn('LocalStorage backup sync:', e);
  }

  return true;
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!saved) return initialSchoolProfile;
      const parsed = JSON.parse(saved);
      const logoUrl = parsed.logoSekolahUrl && !parsed.logoSekolahUrl.includes('KOP_SURAT_NEW')
        ? parsed.logoSekolahUrl
        : '/assets/aistudio/llogo_06ce9f11.png';

      const validWaliList = Array.isArray(parsed.waliKelasList)
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
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch {
      return initialSchoolProfile;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => safeRead(STORAGE_KEYS.STUDENTS, initialStudents));
  const [attendances, setAttendances] = useState<DailyAttendanceRecord[]>(() => safeRead(STORAGE_KEYS.ATTENDANCE, initialDailyAttendance));
  const [warningLetters, setWarningLetters] = useState<AbsenceWarningLetter[]>(() => safeRead(STORAGE_KEYS.WARNING_LETTERS, initialWarningLetters));
  const [transferRequests, setTransferRequests] = useState<TransferRequestLetter[]>(() => safeRead(STORAGE_KEYS.TRANSFER_REQ, initialTransferRequests));
  const [transferOuts, setTransferOuts] = useState<TransferOutCertificate[]>(() => safeRead(STORAGE_KEYS.TRANSFER_OUT, initialTransferOuts));
  const [transferIns, setTransferIns] = useState<TransferInConfirmation[]>(() => safeRead(STORAGE_KEYS.TRANSFER_IN, initialTransferIns));
  const [mutations, setMutations] = useState<StudentMutationRecord[]>(() => safeRead(STORAGE_KEYS.MUTATIONS, initialStudentMutations));
  const [examCandidates, setExamCandidates] = useState<ExamCandidate[]>(() => safeRead(STORAGE_KEYS.EXAM_CANDIDATES, initialExamCandidates));
  const [examSessions, setExamSessions] = useState<ExamSession[]>(() => safeRead(STORAGE_KEYS.EXAM_SESSIONS, initialExamSessions));
  const [examScores, setExamScores] = useState<ExamScoreRecord[]>(() => safeRead(STORAGE_KEYS.EXAM_SCORES, initialExamScores));
  const [gradStudies, setGradStudies] = useState<GraduateStudyRecord[]>(() => safeRead(STORAGE_KEYS.GRAD_STUDIES, initialGradStudies));
  const [achievements, setAchievements] = useState<AchievementRecord[]>(() => safeRead(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements));
  const [curriculumTargets, setCurriculumTargets] = useState<CurriculumTargetRecord[]>(() => safeRead(STORAGE_KEYS.CURRICULUM, initialCurriculumTargets));
  const [mysqlConfig, setMysqlConfig] = useState<MySQLConfig>(() => safeRead(STORAGE_KEYS.MYSQL_CONFIG, initialMySQLConfig));

  const schoolProfileRef = useRef<SchoolProfile>(schoolProfile);
  const studentsRef = useRef<Student[]>(students);
  const attendancesRef = useRef<DailyAttendanceRecord[]>(attendances);
  const warningLettersRef = useRef<AbsenceWarningLetter[]>(warningLetters);
  const transferRequestsRef = useRef<TransferRequestLetter[]>(transferRequests);
  const transferOutsRef = useRef<TransferOutCertificate[]>(transferOuts);
  const transferInsRef = useRef<TransferInConfirmation[]>(transferIns);
  const mutationsRef = useRef<StudentMutationRecord[]>(mutations);
  const examCandidatesRef = useRef<ExamCandidate[]>(examCandidates);
  const examSessionsRef = useRef<ExamSession[]>(examSessions);
  const examScoresRef = useRef<ExamScoreRecord[]>(examScores);
  const gradStudiesRef = useRef<GraduateStudyRecord[]>(gradStudies);
  const achievementsRef = useRef<AchievementRecord[]>(achievements);
  const curriculumTargetsRef = useRef<CurriculumTargetRecord[]>(curriculumTargets);

  useEffect(() => { schoolProfileRef.current = schoolProfile; }, [schoolProfile]);
  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { attendancesRef.current = attendances; }, [attendances]);
  useEffect(() => { warningLettersRef.current = warningLetters; }, [warningLetters]);
  useEffect(() => { transferRequestsRef.current = transferRequests; }, [transferRequests]);
  useEffect(() => { transferOutsRef.current = transferOuts; }, [transferOuts]);
  useEffect(() => { transferInsRef.current = transferIns; }, [transferIns]);
  useEffect(() => { mutationsRef.current = mutations; }, [mutations]);
  useEffect(() => { examCandidatesRef.current = examCandidates; }, [examCandidates]);
  useEffect(() => { examSessionsRef.current = examSessions; }, [examSessions]);
  useEffect(() => { examScoresRef.current = examScores; }, [examScores]);
  useEffect(() => { gradStudiesRef.current = gradStudies; }, [gradStudies]);
  useEffect(() => { achievementsRef.current = achievements; }, [achievements]);
  useEffect(() => { curriculumTargetsRef.current = curriculumTargets; }, [curriculumTargets]);

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'initial_loading' | 'synced' | 'syncing' | 'error'>('initial_loading');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isCloudLoadedRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);
  const writeTimeoutRef = useRef<any>(null);
  const lastLocalWriteAtRef = useRef<number>(0);

  const markLocalWrite = () => {
    lastLocalWriteAtRef.current = Date.now();
  };

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'school_data', 'main'),
      (snap) => {
        if (!snap.exists()) {
          isCloudLoadedRef.current = true;
          setCloudSyncStatus('synced');
          return;
        }

        const data = snap.data() as Record<string, any>;
        const remoteUpdatedAt = readTimestamp(data?.updatedAt);
        const localUpdatedAt = readTimestamp(safeRead<Record<string, any>>(STORAGE_KEYS.PROFILE, {}).updatedAt);

        const canApplyRemote = !(
          remoteUpdatedAt > 0 &&
          localUpdatedAt > 0 &&
          remoteUpdatedAt < localUpdatedAt
        );

        if (!canApplyRemote) {
          isCloudLoadedRef.current = true;
          setCloudSyncStatus('synced');
          return;
        }

        isRemoteUpdateRef.current = true;

        const applied = applyRemoteSnapshot(data, {
          setSchoolProfile,
          setStudents,
          setAttendances,
          setWarningLetters,
          setTransferRequests,
          setTransferOuts,
          setTransferIns,
          setMutations,
          setExamCandidates,
          setExamSessions,
          setExamScores,
          setGradStudies,
          setAchievements,
          setCurriculumTargets,
        });

        isCloudLoadedRef.current = true;
        setCloudSyncStatus(applied ? 'synced' : 'error');
        setLastSyncedAt(new Date());

        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 150);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'school_data/main');
        setCloudSyncStatus('error');
        isCloudLoadedRef.current = true;
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (isRemoteUpdateRef.current) return;
    if (!isCloudLoadedRef.current) return;

    markLocalWrite();

    safeWrite(STORAGE_KEYS.PROFILE, schoolProfile);
    safeWrite(STORAGE_KEYS.STUDENTS, students);
    safeWrite(STORAGE_KEYS.ATTENDANCE, attendances);
    safeWrite(STORAGE_KEYS.WARNING_LETTERS, warningLetters);
    safeWrite(STORAGE_KEYS.TRANSFER_REQ, transferRequests);
    safeWrite(STORAGE_KEYS.TRANSFER_OUT, transferOuts);
    safeWrite(STORAGE_KEYS.TRANSFER_IN, transferIns);
    safeWrite(STORAGE_KEYS.MUTATIONS, mutations);
    safeWrite(STORAGE_KEYS.EXAM_CANDIDATES, examCandidates);
    safeWrite(STORAGE_KEYS.EXAM_SESSIONS, examSessions);
    safeWrite(STORAGE_KEYS.EXAM_SCORES, examScores);
    safeWrite(STORAGE_KEYS.GRAD_STUDIES, gradStudies);
    safeWrite(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    safeWrite(STORAGE_KEYS.CURRICULUM, curriculumTargets);
    safeWrite(STORAGE_KEYS.MYSQL_CONFIG, mysqlConfig);

    setCloudSyncStatus('syncing');

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
    }

    writeTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = cleanFirestoreData({
          schoolProfile: {
            ...schoolProfileRef.current,
            updatedAt: new Date().toISOString(),
          },
          students: studentsRef.current,
          attendances: attendancesRef.current,
          warningLetters: warningLettersRef.current,
          transferRequests: transferRequestsRef.current,
          transferOuts: transferOutsRef.current,
          transferIns: transferInsRef.current,
          mutations: mutationsRef.current,
          examCandidates: examCandidatesRef.current,
          examSessions: examSessionsRef.current,
          examScores: examScoresRef.current,
          gradStudies: gradStudiesRef.current,
          achievements: achievementsRef.current,
          curriculumTargets: curriculumTargetsRef.current,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'school_data', 'main'), payload, { merge: true });
        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'school_data/main');
        setCloudSyncStatus('error');
      }
    }, 600);

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

  const forceSyncToCloud = async (customPayload?: Record<string, any>): Promise<boolean> => {
    try {
      setCloudSyncStatus('syncing');
      markLocalWrite();
      const payload = cleanFirestoreData({
        schoolProfile: {
          ...(customPayload?.schoolProfile || schoolProfileRef.current),
          updatedAt: new Date().toISOString(),
        },
        students: customPayload?.students || studentsRef.current,
        attendances: customPayload?.attendances || attendancesRef.current,
        warningLetters: customPayload?.warningLetters || warningLettersRef.current,
        transferRequests: customPayload?.transferRequests || transferRequestsRef.current,
        transferOuts: customPayload?.transferOuts || transferOutsRef.current,
        transferIns: customPayload?.transferIns || transferInsRef.current,
        mutations: customPayload?.mutations || mutationsRef.current,
        examCandidates: customPayload?.examCandidates || examCandidatesRef.current,
        examSessions: customPayload?.examSessions || examSessionsRef.current,
        examScores: customPayload?.examScores || examScoresRef.current,
        gradStudies: customPayload?.gradStudies || gradStudiesRef.current,
        achievements: customPayload?.achievements || achievementsRef.current,
        curriculumTargets: customPayload?.curriculumTargets || curriculumTargetsRef.current,
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
    const nextProfile: SchoolProfile = { ...schoolProfileRef.current, ...updates, updatedAt: new Date().toISOString() };
    schoolProfileRef.current = nextProfile;
    setSchoolProfile((prev) => {
      const merged = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      schoolProfileRef.current = merged;
      safeWrite(STORAGE_KEYS.PROFILE, merged);
      return merged;
    });

    forceSyncToCloud({ schoolProfile: nextProfile }).catch((err) => console.warn('Sync profile error:', err));
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
    setStudents((prev) => [newStudent, ...prev]);
    return newId;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const saveAttendance = (record: DailyAttendanceRecord) => {
    setAttendances((prev) => {
      const idx = prev.findIndex((a) => a.tanggal === record.tanggal && a.kelas === record.kelas);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const addWarningLetter = (letterData: Omit<AbsenceWarningLetter, 'id'>) => {
    const newLetter: AbsenceWarningLetter = { ...letterData, id: `letter-${Date.now()}` };
    setWarningLetters((prev) => [newLetter, ...prev]);
  };

  const deleteWarningLetter = (id: string) => {
    setWarningLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const addTransferRequest = (reqData: Omit<TransferRequestLetter, 'id'>) => {
    const newReq: TransferRequestLetter = { ...reqData, id: `treq-${Date.now()}` };
    setTransferRequests((prev) => [newReq, ...prev]);
  };

  const addTransferOut = (certData: Omit<TransferOutCertificate, 'id'>) => {
    const newCert: TransferOutCertificate = { ...certData, id: `tout-${Date.now()}` };
    setTransferOuts((prev) => [newCert, ...prev]);
    if (certData.studentId) updateStudent(certData.studentId, { statusSiswa: 'mutasi_keluar' });
  };

  const addTransferIn = (confData: Omit<TransferInConfirmation, 'id'>) => {
    const newConf: TransferInConfirmation = { ...confData, id: `tin-${Date.now()}` };
    setTransferIns((prev) => [newConf, ...prev]);
  };

  const addMutation = (record: Omit<StudentMutationRecord, 'id'>) => {
    const newRecord: StudentMutationRecord = { ...record, id: `mut-${Date.now()}` };
    setMutations((prev) => [newRecord, ...prev]);
  };

  const deleteMutation = (id: string) => {
    setMutations((prev) => prev.filter((m) => m.id !== id));
  };

  const addExamCandidate = (candData: Omit<ExamCandidate, 'id'>) => {
    const newCand: ExamCandidate = { ...candData, id: `cand-${Date.now()}` };
    setExamCandidates((prev) => [newCand, ...prev]);
  };

  const updateExamCandidate = (id: string, updates: Partial<ExamCandidate>) => {
    setExamCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const replaceExamCandidatesForClass = (className: string, rombel: string, newCandidates: ExamCandidate[]) => {
    setExamCandidates((prev) => {
      const remaining = prev.filter((c) => {
        const matchClass = String(c.kelas).trim().toUpperCase() === String(className).trim().toUpperCase();
        const st = students.find((s) => s.id === c.studentId);
        const matchRombel = (st?.rombel || 'A') === rombel;
        return !(matchClass && matchRombel);
      });
      return [...newCandidates, ...remaining];
    });
  };

  const saveExamSession = (session: ExamSession) => {
    setExamSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [...prev, session];
    });
  };

  const updateExamScore = (record: ExamScoreRecord) => {
    setExamScores((prev) => {
      const idx = prev.findIndex((s) => s.studentId === record.studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const addGraduateStudy = (studyData: Omit<GraduateStudyRecord, 'id'>) => {
    const newStudy: GraduateStudyRecord = { ...studyData, id: `grad-${Date.now()}` };
    setGradStudies((prev) => [newStudy, ...prev]);
  };

  const updateGraduateStudy = (id: string, updates: Partial<GraduateStudyRecord>) => {
    setGradStudies((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const updateStudentGrades = (studentId: string, semesterKey: string, grades: SubjectGrade[]) => {
    setStudents((prev) =>
      prev.map((s) => {
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
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return { ...s, riwayatKenaikan: promotion };
      })
    );
  };

  const batchPromoteClass = (fromClass: string, toClass: string, status: 'Naik ke Kelas' | 'Lulus') => {
    const currentYear = schoolProfile.tahunAjaranAktif;
    setStudents((prev) =>
      prev.map((s) => {
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
    const newAch: AchievementRecord = { ...rec, id: `ach-${Date.now()}` };
    setAchievements((prev) => [newAch, ...prev]);
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const saveCurriculumTarget = (record: CurriculumTargetRecord) => {
    setCurriculumTargets((prev) => {
      const idx = prev.findIndex((c) => c.id === record.id);
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
    }

    const existingNisSet = new Set(students.map((s) => s.nis));
    const newlyAdded = formattedStudents.filter((s) => !existingNisSet.has(s.nis));
    setStudents((prev) => [...prev, ...newlyAdded]);
    return { added: newlyAdded.length, replaced: 0 };
  };

  const updateMySQLConfig = (updates: Partial<MySQLConfig>) => {
    setMysqlConfig((prev) => ({ ...prev, ...updates }));
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
      }
      updateMySQLConfig({ isConnected: false });
      return { success: false, message: data.message };
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
    clearSchoolStorage();
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
