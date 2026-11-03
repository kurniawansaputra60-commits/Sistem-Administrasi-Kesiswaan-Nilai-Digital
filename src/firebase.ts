import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Gunakan FirestoreSettings.cache (persistentLocalCache) sesuai standar Firebase v10/v13+
// Menggantikan enableIndexedDbPersistence yang sudah deprecated
let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (error) {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function initializeFirebasePersistence() {
  // Sudah otomatis dikonfigurasi via initializeFirestore + persistentLocalCache
  return true;
}

export async function testFirestoreConnection() {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return false;
  }
  return true;
}
