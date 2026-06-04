import * as admin from 'firebase-admin';

/**
 * @fileOverview Administrative Firebase access layer.
 * Hardened to prevent runtime crashes if service account credentials are not provisioned.
 * Note: Use client-side SDK for all standard workshop operations.
 */

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : null;

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
  } catch (error) {
    console.warn("Firebase Admin could not initialize: Missing or invalid technical credentials.");
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
