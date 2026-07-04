import admin from "firebase-admin";
import { logger } from "../utils/logger";

let firebaseInitialized = false;

export const initFirebaseAdmin = (): void => {
  if (firebaseInitialized) return;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Validate that the private key looks like a real PEM block before attempting init.
  // A placeholder / hash value will be silently skipped so the server still boots.
  const isPem = privateKey?.includes("-----BEGIN");

  if (!projectId || !clientEmail || !privateKey || !isPem) {
    logger.warn(
      "Firebase Admin: credentials missing or FIREBASE_PRIVATE_KEY is not a valid PEM key — " +
      "phone auth via Firebase will be unavailable until real credentials are supplied."
    );
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    firebaseInitialized = true;
    logger.info("Firebase Admin SDK initialized");
  } catch (err) {
    logger.warn(`Firebase Admin init failed (phone auth unavailable): ${(err as Error).message}`);
  }
};

/**
 * Verify a Firebase ID token and return the decoded payload.
 * Throws if the token is invalid or Firebase is not initialised.
 */
export const verifyFirebaseToken = async (
  idToken: string
): Promise<admin.auth.DecodedIdToken> => {
  if (!firebaseInitialized) {
    throw new Error("Firebase Admin is not initialised");
  }
  return admin.auth().verifyIdToken(idToken);
};

export default admin;
