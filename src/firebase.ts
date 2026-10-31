import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Gunakan databaseId dari config agar terhubung ke Firestore Enterprise instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function initializeFirebasePersistence() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return false;
  }

  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore offline persistence enabled');
    return true;
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      console.warn('Firestore persistence gagal: aplikasi dibuka di beberapa tab sekaligus.');
    } else if (error?.code === 'unimplemented') {
      console.warn('Firestore persistence tidak didukung browser ini.');
    } else {
      console.warn('Firestore persistence unavailable:', error);
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  initializeFirebasePersistence().catch(() => undefined);
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection OK');
  } catch (err) {
    console.warn('Firestore connectivity check:', err);
  }
}
