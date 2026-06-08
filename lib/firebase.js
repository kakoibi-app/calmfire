import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfCsw8HoTG8-TfiLXIcSl8-bFe5XHLkSU",
  authDomain: "calmfire-9168d.firebaseapp.com",
  projectId: "calmfire-9168d",
  storageBucket: "calmfire-9168d.firebasestorage.app",
  messagingSenderId: "912463455907",
  appId: "1:912463455907:web:76796aea221536a7cb8116"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);