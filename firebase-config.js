// ============================================================
//  TECH FEST 2026 – Firebase Configuration & Helpers
//  Uses Firebase v9 Modular SDK (CDN)
// ============================================================

// All Firebase imports are loaded via CDN in the HTML <head>.
// This file assumes the following globals are available:
//   - firebase (compat layer) OR named exports from the modules

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";
import { getAnalytics }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

// ─── Your Firebase Project Config ──────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBpSoibPJ3uMce_gRZVi_x4wr43WHsBLr8",
    authDomain: "tech-feast-c5124.firebaseapp.com",
    projectId: "tech-feast-c5124",
    storageBucket: "tech-feast-c5124.firebasestorage.app",
    messagingSenderId: "427845639730",
    appId: "1:427845639730:web:bf2a1768754794be69e62b",
    measurementId: "G-QEH72S11X8"
};

// ─── Initialize Firebase ────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// ─── Collection paths ───────────────────────────────────────
const COLLECTIONS = {
    general: "registrations",
    coding: "registrations_coding",
    quiz: "registrations_quiz",
    robotics: "registrations_robotics",
    exhibition: "registrations_exhibition",
};

// ─── Generate a readable Registration ID ───────────────────
export function generateRegId(prefix = "TF") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = `${prefix}26-`;
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

// ─── Upload file to Firebase Storage ───────────────────────
// Returns the public download URL or null if no file
export async function uploadFile(file, folder = "uploads") {
    if (!file) return null;
    const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${safeName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

// ─── Save Registration to Firestore ────────────────────────
// formData: plain object of field values
// collectionKey: key in COLLECTIONS map (default "general")
// Returns { regId, docId }
export async function saveRegistration(formData, collectionKey = "general") {
    const regId = generateRegId();
    const col = COLLECTIONS[collectionKey] || COLLECTIONS.general;

    const docRef = await addDoc(collection(db, col), {
        ...formData,
        regId,
        createdAt: serverTimestamp(),
        event: collectionKey,
        status: "confirmed",
    });

    return { regId, docId: docRef.id };
}

// ─── Named exports for use in register.js ──────────────────
export { db, storage, analytics };
