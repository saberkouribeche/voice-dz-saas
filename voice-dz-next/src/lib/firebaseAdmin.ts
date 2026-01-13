
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : null;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized");
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found in env. Firestore features will fail.");
        }
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

const db = admin.apps.length ? admin.firestore() : null; // Safety check
if (!db) console.warn("Firestore not initialized (Build mode or missing key)");
export { admin, db };
