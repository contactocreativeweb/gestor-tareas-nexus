import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAW9KULUb1kqmq2LOzH3ALARiBc3jKDrWE",
  authDomain: "nexus-c5b4a.firebaseapp.com",
  projectId: "nexus-c5b4a",
  storageBucket: "nexus-c5b4a.firebasestorage.app",
  messagingSenderId: "1049549940863",
  appId: "1:1049549940863:web:b1e01ee59cdbb37315774a",
  measurementId: "G-CF500FL90S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
