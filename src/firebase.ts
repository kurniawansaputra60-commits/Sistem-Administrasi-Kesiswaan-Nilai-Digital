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
    return true;
  } catch (error: any) {
    // Graceful handling without throwing
    return false;
  }
}

if (typeof window !== 'undefined') {
  initializeFirebasePersistence().catch(() => undefined);
}

export async function testFirestoreConnection() {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return false;
  }
  // Safe check that does not throw or burn quota
  return true;
}
