'use client';

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Standardized Storage Service for Workshop Technical Imagery and Documents.
 */

export const uploadVehiclePhoto = async (vehicleId: string, file: File) => {
  const fileRef = ref(storage, `vehicle-photos/${vehicleId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

export const uploadJobCardPhoto = async (jobCardId: string, file: File) => {
  const fileRef = ref(storage, `job-card-photos/${jobCardId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

export const uploadStaffPhoto = async (userId: string, file: File) => {
  const fileRef = ref(storage, `staff-profile-photos/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

export const uploadWorkshopLogo = async (file: File) => {
  const fileRef = ref(storage, `workshop/logo/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

export const uploadInvoiceFile = async (invoiceId: string, file: File) => {
  const fileRef = ref(storage, `invoice-files/${invoiceId}/${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
};

export const deleteFile = async (path: string) => {
  const fileRef = ref(storage, path);
  return deleteObject(fileRef);
};
