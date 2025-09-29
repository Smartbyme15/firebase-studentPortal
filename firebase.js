import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoR4eL6F3W2Bn5Pa90hrlW5vOl76cDKKE",
  authDomain: "loginpage-83ed2.firebaseapp.com",
  projectId: "loginpage-83ed2",
  storageBucket: "loginpage-83ed2.firebasestorage.app",
  messagingSenderId: "754970984557",
  appId: "1:754970984557:web:db5a3df12e4e6dfc937f64",
  measurementId: "G-R4G9603VXW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc
};