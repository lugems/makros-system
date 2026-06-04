'use client';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp,
  runTransaction,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobCard, JobTask, JobPart, JobCardStatus } from '@/types/job-card';
import { logAudit } from '@/lib/audit-logger';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const COLLECTION_NAME = 'jobCards';

/**
 * ATOMIC TRANSACTION: Initialize Job Card with AI Suggestions
 */
export const initializeJobCardWithAI = async (data: {
    customerId: string;
    vehicleId: string;
    bookingId?: string;
    assignedMechanicId?: string;
    reportedIssue: string;
    laborCost: number;
    userId: string;
    aiSuggestions?: {
        tasks: string[];
        parts: { name: string; quantity: number }[];
    }
}) => {
    return await runTransaction(db, async (transaction) => {
        const jobCardRef = doc(collection(db, COLLECTION_NAME));
        const jobCardId = jobCardRef.id;
        const now = serverTimestamp();

        const jobPayload = {
            jobCardId,
            customerId: data.customerId,
            vehicleId: data.vehicleId,
            bookingId: data.bookingId || null,
            assignedMechanicId: data.assignedMechanicId || null,
            reportedIssue: data.reportedIssue,
            status: JobCardStatus.InProgress,
            laborCost: data.laborCost,
            receivedAt: now,
            createdAt: now,
            updatedAt: now,
            createdBy: data.userId
        };

        transaction.set(jobCardRef, jobPayload);

        if (data.aiSuggestions?.tasks) {
            data.aiSuggestions.tasks.forEach((taskDesc) => {
                const taskRef = doc(collection(db, COLLECTION_NAME, jobCardId, 'tasks'));
                transaction.set(taskRef, {
                    jobCardId,
                    taskDescription: taskDesc,
                    estimatedHours: 1,
                    status: 'Pending',
                    createdAt: now,
                    updatedAt: now
                });
            });
        }

        if (data.aiSuggestions?.parts) {
            data.aiSuggestions.parts.forEach((part) => {
                const partRef = doc(collection(db, COLLECTION_NAME, jobCardId, 'partsUsed'));
                transaction.set(partRef, {
                    jobCardId,
                    itemId: part.name,
                    itemName: part.name,
                    quantityUsed: part.quantity,
                    unitPrice: 0,
                    createdAt: now
                });
            });
        }

        const auditRef = doc(collection(db, 'auditLogs'));
        transaction.set(auditRef, {
            userId: data.userId,
            action: 'CREATE_JOB_CARD',
            module: 'Job Cards',
            recordId: jobCardId,
            description: `Initialized forensic repair dossier for unit ${data.vehicleId} using AI roadmap.`,
            createdAt: now
        });

        return jobCardId;
    });
};

/**
 * Technical Task Management Logic
 */
export const updateJobTaskStatus = (jobCardId: string, taskId: string, status: JobTask['status'], userId: string) => {
    const taskRef = doc(db, COLLECTION_NAME, jobCardId, 'tasks', taskId);
    const payload = { status, updatedAt: serverTimestamp() };
    
    updateDoc(taskRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'UPDATE_TASK_STATUS', 'Job Cards', jobCardId, `Task status shifted to ${status}.`);
};

export const updateJobTask = (jobCardId: string, taskId: string, data: Partial<JobTask>, userId: string) => {
    const taskRef = doc(db, COLLECTION_NAME, jobCardId, 'tasks', taskId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(taskRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });
    
    logAudit(userId, 'UPDATE_TASK', 'Job Cards', jobCardId, `Synchronized technical specifications for task ${taskId}.`);
};

export const deleteJobTask = (jobCardId: string, taskId: string, userId: string) => {
    const taskRef = doc(db, COLLECTION_NAME, jobCardId, 'tasks', taskId);
    
    deleteDoc(taskRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: taskRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'DELETE_TASK', 'Job Cards', jobCardId, `Purged task record from repair dossier.`);
};

/**
 * ATOMIC TRANSACTION: Add Part to Job Card & Log Movement
 */
export const addPartToJobCardTransaction = async (
    jobCardId: string,
    itemId: string,
    quantity: number,
    userId: string
) => {
    return await runTransaction(db, async (transaction) => {
        const inventoryRef = doc(db, 'inventory', itemId);
        const inventorySnap = await transaction.get(inventoryRef);
        
        if (!inventorySnap.exists()) throw new Error("Inventory item not found.");
        
        const invData = inventorySnap.data();
        if (invData.quantity < quantity) {
            throw new Error(`Insufficient stock for ${invData.itemName}. Available: ${invData.quantity}`);
        }

        const partRef = doc(collection(db, 'jobCards', jobCardId, 'partsUsed'));
        const movementRef = doc(collection(db, 'stockMovements'));
        const now = serverTimestamp();

        // 1. Deduct Stock
        transaction.update(inventoryRef, {
            quantity: invData.quantity - quantity,
            updatedAt: now
        });

        // 2. Add to Job Parts
        transaction.set(partRef, {
            jobCardId,
            itemId,
            itemName: invData.itemName,
            quantityUsed: quantity,
            unitPrice: invData.sellingPrice || 0,
            createdAt: now
        });

        // 3. Log Stock Movement
        transaction.set(movementRef, {
            itemId,
            itemName: invData.itemName,
            type: 'Out',
            quantityChange: -quantity,
            reason: `Allocated to Repair Dossier #${jobCardId.slice(-6).toUpperCase()}`,
            recordId: jobCardId,
            date: now,
            userId: userId
        });

        // 4. Audit Trail
        const auditRef = doc(collection(db, 'auditLogs'));
        transaction.set(auditRef, {
            userId: userId,
            action: 'ADD_PART',
            module: 'Job Cards',
            recordId: jobCardId,
            description: `Allocated ${quantity} units of ${invData.itemName} to job dossier.`,
            createdAt: now
        });

        return partRef.id;
    });
};

/**
 * ATOMIC TRANSACTION: Remove Part from Job Card & Log Movement
 */
export const removePartFromJobCardTransaction = async (
    jobCardId: string,
    partId: string,
    userId: string
) => {
    return await runTransaction(db, async (transaction) => {
        const partRef = doc(db, 'jobCards', jobCardId, 'partsUsed', partId);
        const partSnap = await transaction.get(partRef);
        
        if (!partSnap.exists()) throw new Error("Part usage record not found.");
        
        const partData = partSnap.data();
        const inventoryRef = doc(db, 'inventory', partData.itemId);
        const movementRef = doc(collection(db, 'stockMovements'));
        const now = serverTimestamp();
        
        const inventorySnap = await transaction.get(inventoryRef).catch(() => null);
        if (inventorySnap && inventorySnap.exists()) {
            const invData = inventorySnap.data();
            
            // 1. Restore Stock
            transaction.update(inventoryRef, {
                quantity: invData.quantity + (partData.quantityUsed || 0),
                updatedAt: now
            });

            // 2. Log Movement (In)
            transaction.set(movementRef, {
                itemId: partData.itemId,
                itemName: invData.itemName,
                type: 'In',
                quantityChange: partData.quantityUsed,
                reason: `Revoked from Repair Dossier #${jobCardId.slice(-6).toUpperCase()}`,
                recordId: jobCardId,
                date: now,
                userId: userId
            });
        }

        // 3. Delete usage record
        transaction.delete(partRef);

        // 4. Audit Trail
        const auditRef = doc(collection(db, 'auditLogs'));
        transaction.set(auditRef, {
            userId,
            action: 'REMOVE_PART',
            module: 'Job Cards',
            recordId: jobCardId,
            description: `Revoked allocation of ${partData.quantityUsed} units from job dossier.`,
            createdAt: now
        });
    });
};

/**
 * General Record Synchronization
 */
export const updateJobCard = (jobCardId: string, data: Partial<JobCard>, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, jobCardId);
    const payload = { ...data, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload,
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'UPDATE', 'Job Cards', jobCardId, `Synchronized technical dossier parameters.`);
};

/**
 * Workflow State Transitions
 */
export const updateJobStatus = (jobCardId: string, status: JobCardStatus, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, jobCardId);
    const updateData: any = { status, updatedAt: serverTimestamp() };
    
    if (status === JobCardStatus.Completed) {
        updateData.completedAt = serverTimestamp();
    }

    updateDoc(docRef, updateData).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData,
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'UPDATE_STATUS', 'Job Cards', jobCardId, `Workflow state transition to: ${status}`);
};

/**
 * Forensic Decommissioning
 */
export const deleteJobCard = (jobCardId: string, userId: string) => {
    const docRef = doc(db, COLLECTION_NAME, jobCardId);
    
    deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext));
    });

    logAudit(userId, 'DELETE', 'Job Cards', jobCardId, `Forensically purged repair operation from registry.`);
};
