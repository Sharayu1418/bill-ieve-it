import type { User } from 'firebase/auth';

export interface FirebaseUser extends User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  uid: string;
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface UserPreferences {
  emailNotifications: boolean;
  theme: 'light' | 'dark';
}

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: FirestoreTimestamp;
  lastLoginAt: FirestoreTimestamp;
  preferences?: UserPreferences;
}

export interface TrackedBill {
  id: string;
  congress: string;
  type: string;
  number: string;
  title?: string;
  status?: string;
  trackedAt: string;
  lastNotifiedAt?: string;
  notifications?: boolean;
  notes?: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: FirestoreTimestamp;
}