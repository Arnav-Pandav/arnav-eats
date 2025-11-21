import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// -------------------------------
//  Firebase Config (VITE ENV)
// -------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// -------------------------------
//  Initialize Firebase
// -------------------------------
const app = initializeApp(firebaseConfig);

// -------------------------------
//  Export Auth
// -------------------------------
export const auth = getAuth(app);

// -------------------------------
//  Export Firestore
// -------------------------------
export const db = getFirestore(app);

// -------------------------------
//  OPTIONAL DEV DEBUGGING
// -------------------------------
if (typeof window !== "undefined") {
  window.firebaseDebug = {
    auth,
    db,
    getCurrentUser: () => auth.currentUser,
  };
  console.log("%c🔥 Firebase Debug Active — window.firebaseDebug", "color: green;");
}
