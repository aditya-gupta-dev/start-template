import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCL1UqSoHmTtp9q_RlNQYvTbS0kE2Mw93s",
  authDomain: "attendance-e6af1.firebaseapp.com",
  projectId: "attendance-e6af1",
  storageBucket: "attendance-e6af1.firebasestorage.app",
  messagingSenderId: "113986989217",
  appId: "1:113986989217:web:306858e057d7114384d4e0",
  measurementId: "G-T6FZM9071F"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)