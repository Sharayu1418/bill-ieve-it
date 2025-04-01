import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Use the device's language for authentication UI

// Configure persistence properly using the correct method
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export const db = getFirestore(app);

// User-related functions
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Bill tracking functions
export const getTrackedBills = async (userId: string) => {
  try {
    const trackedBillsRef = collection(db, `users/${userId}/trackedBills`);
    const querySnapshot = await getDocs(trackedBillsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tracked bills:', error);
    throw error;
  }
};

export const trackBill = async (userId: string, billId: string, billData: any) => {
  try {
    const docRef = doc(db, `users/${userId}/trackedBills`, billId);
    await setDoc(docRef, {
      ...billData,
      trackedAt: serverTimestamp(),
      notifications: true,
      notes: ''
    });
    return true;
  } catch (error) {
    console.error('Error tracking bill:', error);
    throw error;
  }
};

export const untrackBill = async (userId: string, billId: string) => {
  try {
    const docRef = doc(db, `users/${userId}/trackedBills`, billId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error untracking bill:', error);
    throw error;
  }
};

export const updateBillNotes = async (userId: string, billId: string, notes: string) => {
  try {
    const docRef = doc(db, `users/${userId}/trackedBills`, billId);
    await setDoc(docRef, { notes }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating bill notes:', error);
    throw error;
  }
};

export const toggleBillNotifications = async (userId: string, billId: string, enabled: boolean) => {
  try {
    const docRef = doc(db, `users/${userId}/trackedBills`, billId);
    await setDoc(docRef, { notifications: enabled }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error toggling bill notifications:', error);
    throw error;
  }
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const adminRef = collection(db, 'admins');
    const q = query(adminRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Type definitions for Firestore
export interface TrackedBill {
  billId: string;
  trackedAt: Timestamp;
  notifications?: boolean;
  notes?: string;
  congress: string;
  type: string;
  number: string;
  title?: string;
  status?: string;
  introducedDate?: string;
  lastAction?: {
    text: string;
    date: string;
  };
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences?: {
    emailNotifications: boolean;
    theme: 'light' | 'dark';
    interests?: string[];
    state?: string;
    district?: string;
  };
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: {
    searchTerm?: string;
    year?: string;
    status?: string;
    chamber?: string;
  };
  createdAt: Timestamp;
}