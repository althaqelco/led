// lib/firebase.ts
// Firebase Configuration for El Taiseer Real Estate

import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCbmgvmk35VHgzdpsZR8P4tdgfZRprIV40",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eltaiseer-properties.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eltaiseer-properties",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eltaiseer-properties.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "495642364898",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:495642364898:web:a39ed1d925f46d8fb5c7bb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RGJFHJZRTZ",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Admin UID - only this user can access dashboard
export const ADMIN_UID = "OaxywaxcdFNn3kTJeE7MJTq9M0L2";

export default app;
