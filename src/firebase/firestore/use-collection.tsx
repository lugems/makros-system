
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  onSnapshot, 
  Query, 
  QuerySnapshot, 
  DocumentData, 
  FirestoreError,
  queryEqual
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * @fileOverview A standardized hook for real-time Firestore collection streams.
 * Utilizes internal stabilization to prevent infinite loops from unstable query references.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Stabilize the query reference using Firebase's native queryEqual method.
  // This prevents the useEffect from re-running if a new query object with the same
  // logic is passed in (a common cause of infinite loops in Firestore hooks).
  const memoQuery = useRef<Query<T> | null>(null);
  if (query && (!memoQuery.current || !queryEqual(query, memoQuery.current))) {
    memoQuery.current = query;
  }
  const stableQuery = query ? memoQuery.current : null;

  useEffect(() => {
    if (!stableQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      stableQuery,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        setData(items);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("useCollection error:", err);
        setError(err);
        setLoading(false);

        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: (stableQuery as any)._query?.path?.toString() || 'unknown',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );

    return () => unsubscribe();
  }, [stableQuery]);

  return { data, loading, error };
}
