/**
 * firebase/admin.ts
 * ─────────────────────────────────────────────────────────
 * Firebase Admin SDK initialisation and token verification.
 *
 * Call `initFirebaseAdmin()` once at app startup.
 * Use `verifyFirebaseToken(idToken)` in any controller that needs
 * to validate a Firebase ID Token received from the client.
 */
import admin from "firebase-admin";
import { logger } from "../utils/logger";

let firebaseInitialized = false;

/**
 * Initialise the Firebase Admin SDK from environment variables.
 * Safe to call multiple times — subsequent calls are no-ops.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (newlines may be escaped as `\n`)
 */
export const initFirebaseAdmin = (): void => {
  if (firebaseInitialized) return;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    logger.warn(
      "Firebase Admin credentials not fully configured — " +
      "phone auth will be unavailable until FIREBASE_* env vars are set."
    );
    return;
  }

  // Guard against double-init when hot-reloading in development
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  firebaseInitialized = true;
  logger.info("Firebase Admin SDK initialised successfully");
};

/**
 * Verify a Firebase ID Token and return the decoded payload.
 *
 * @throws {Error} when Firebase Admin is not initialised
 * @throws {FirebaseAuthError} when the token is invalid / expired
 */
export const verifyFirebaseToken = async (
  idToken: string
): Promise<admin.auth.DecodedIdToken> => {
  if (!firebaseInitialized) {
    throw new Error(
      "Firebase Admin is not initialised. " +
      "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set."
    );
  }
  return admin.auth().verifyIdToken(idToken, /* checkRevoked */ true);
};

export default admin;
