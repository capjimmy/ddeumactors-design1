// Firebase Configuration for 뜸 연기학원
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkzXMrEwf4XKFPEJQgUWDhGcplTPWtPDI",
  authDomain: "ddeumactors.firebaseapp.com",
  projectId: "ddeumactors",
  storageBucket: "ddeumactors.firebasestorage.app",
  messagingSenderId: "1066282693101",
  appId: "1:1066282693101:web:91e366814c81d83bb5b7e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other modules
export {
  db,
  storage,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
