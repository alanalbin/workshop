import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyB6GB5wpErKZpFk2f7ZUOfxS5fwzJI6GHU',
  authDomain: 'workshop-4892b.firebaseapp.com',
  projectId: 'workshop-4892b',
  storageBucket: 'workshop-4892b.firebasestorage.app',
  messagingSenderId: '304438348712',
  appId: '1:304438348712:web:54f7c3ca912fff00fcab9d',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase client initialization note:', error);
  }
}

export function getClientAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!auth) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (e) {
      console.warn('Firebase Auth init error:', e);
    }
  }
  return auth || null;
}

export { app, auth, db };
