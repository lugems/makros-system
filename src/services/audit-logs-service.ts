'use client';

import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuditLog } from '@/types/audit-log';

const COLLECTION_NAME = 'auditLogs';

/**
 * Retrieves forensic trace logs from the immutable registry.
 */
export const getAuditLogs = async (maxResults = 100): Promise<AuditLog[]> => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), logId: doc.id } as AuditLog));
};
