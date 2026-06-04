'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../provider';
import { StaffMember } from '@/types/staff';

/**
 * @fileOverview A hook for tracking the authenticated user and their real-time profile.
 * Implements a dual-registry fallback to resolve profiles from both 'users' and 'customers' collections.
 */
export function useUser() {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeCustomer: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeCustomer) unsubscribeCustomer();

      if (firebaseUser) {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const customerRef = doc(firestore, 'customers', firebaseUser.uid);

        // Primary: Check Users collection (Staff and Enrolled Customers)
        unsubscribeProfile = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            setProfile({ ...userDoc.data(), userId: firebaseUser.uid } as StaffMember);
            setLoading(false);
          } else {
            // Secondary Fallback: Check Customers collection directly
            unsubscribeCustomer = onSnapshot(customerRef, (custDoc) => {
              if (custDoc.exists()) {
                const data = custDoc.data();
                setProfile({ 
                    ...data,
                    userId: firebaseUser.uid,
                    role: 'Customer', // Explicitly assign Customer role if found in this registry
                    status: data.status || 'Active'
                } as StaffMember);
              } else {
                setProfile(null);
              }
              setLoading(false);
            }, (error) => {
                console.error("Customer registry fallback error:", error);
                setLoading(false);
            });
          }
        }, (error) => {
            console.error("User profile sync error:", error);
            setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeCustomer) unsubscribeCustomer();
    };
  }, [auth, firestore]);

  return { user, profile, loading, isAuthenticated: !!user };
}
