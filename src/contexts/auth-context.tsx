'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, StaffMember } from '@/types/staff';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { useUser } from '@/firebase';
import { logoutUser, loginUser } from '@/services/auth-service';

interface AuthContextType {
  user: StaffMember | null;
  firebaseUser: User | null;
  role: UserRole | undefined;
  setRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @fileOverview Global Authorization Orchestrator.
 * Handles credential synchronization, role-based access control, and strict redirection protocols.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: firebaseUser, profile, loading: isLoading } = useUser();
  const [role, setRole] = useState<UserRole | undefined>(undefined);

  // Sync role from Firestore profile master registry
  useEffect(() => {
    if (profile) {
      setRole(profile.role);
    } else if (!isLoading && !firebaseUser) {
      setRole(undefined);
    }
  }, [profile, isLoading, firebaseUser]);

  // STRICT AUTHORIZATION PROTOCOL: Redirection Logic
  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser) {
        // Enforce login for all routes except the login terminal and landing page
        if (pathname !== '/login' && pathname !== '/') {
            router.push('/login');
        }
    } else if (profile) {
        // Handle Role-based redirection based on personnel/client classification
        if (profile.role === 'Customer' && (pathname === '/dashboard' || pathname === '/')) {
            router.push('/customer-portal');
        } else if (profile.role !== 'Customer' && pathname?.startsWith('/customer-portal')) {
            router.push('/dashboard');
        } else if (pathname === '/login' || pathname === '/') {
            router.push(profile.role === 'Customer' ? '/customer-portal' : '/dashboard');
        }
    }
  }, [firebaseUser, profile, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const logout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user: profile,
      firebaseUser,
      role, 
      setRole, 
      login, 
      logout, 
      isAuthenticated: !!firebaseUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
