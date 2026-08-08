import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Firestore is optional — it only records chat transcripts.
 *
 * Initialising it with a blank config produces a client whose writes never
 * settle: they retry an unreachable backend forever rather than rejecting.
 * Anything that awaited such a write would hang for good, so when the config
 * is missing we hand back null and let callers skip logging entirely.
 */
const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let app = null;
let db = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else if (import.meta.env.DEV) {
  console.info(
    "[firebase] No credentials set — chat transcript logging is disabled. " +
      "The assistant itself is unaffected.",
  );
}

export { db };
export default app;
