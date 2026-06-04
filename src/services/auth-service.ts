'use client';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole } from '@/types/staff';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Standardized Auth Service for Session Management and User Registry Enrollment.
 */

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    logAudit(userCredential.user.uid, 'LOGIN', 'Auth', userCredential.user.uid, 'Personnel session initialized.');
    return userCredential.user;
  } catch (error) {
    // Re-throw to be handled by the UI layer (LoginPage)
    throw error;
  }
};

export const registerUser = async (email: string, password: string, fullName: string, role: UserRole, phone: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  const userRef = doc(db, 'users', uid);
  const userData = {
    userId: uid,
    fullName,
    email,
    phone,
    role,
    status: 'Active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Atomically create user document in Firestore without blocking
  setDoc(userRef, userData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'create',
      requestResourceData: userData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });

  logAudit(uid, 'SIGNUP', 'Auth', uid, `New personnel enrollment: ${fullName} (${role})`);
  return uid;
};

export const logoutUser = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    logAudit(currentUser.uid, 'LOGOUT', 'Auth', currentUser.uid, 'Personnel session terminated.');
  }
  return await signOut(auth);
};
