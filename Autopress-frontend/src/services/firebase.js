// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export auth functions
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
};

// Export Firestore functions
export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
};

// Enable offline persistence (optional)
enableIndexedDbPersistence(db).catch((err) => {
  console.log('Persistence error (can ignore):', err);
});

export default app;