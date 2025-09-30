import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChq6YyhkxSHVxkpdIqBnZb6O_fz5vGGjg",
  authDomain: "chatbotpostgrado.firebaseapp.com",
  projectId: "chatbotpostgrado",
  storageBucket: "chatbotpostgrado.firebasestorage.app",
  messagingSenderId: "527973133251",
  appId: "1:527973133251:web:4dedd856d30a1da9d7ab76",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);