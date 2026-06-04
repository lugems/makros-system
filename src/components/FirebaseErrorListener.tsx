'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview A global listener that catches Firestore permission errors and surfaces them as uncaught exceptions for the dev overlay.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, we want to trigger the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // In production, show a non-intrusive toast
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Technical clearance insufficient for this operation.",
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
