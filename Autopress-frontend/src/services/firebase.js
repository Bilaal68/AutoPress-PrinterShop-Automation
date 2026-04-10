// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQGlhynbeLmByWtA1Ks09uBhQ9VIcaFaQ",
  authDomain: "autopress-4ae7b.firebaseapp.com",
  projectId: "autopress-4ae7b",
  storageBucket: "autopress-4ae7b.firebasestorage.app",
  messagingSenderId: "206823065550",
  appId: "1:206823065550:web:d9b2a0c514735a05600d9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;