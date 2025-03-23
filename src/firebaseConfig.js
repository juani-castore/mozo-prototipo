import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAu-R7BFVjWO9kXadUcuxwtds5x7S50BFA",
  authDomain: "prototipo-mozo.firebaseapp.com",
  projectId: "prototipo-mozo",
  storageBucket: "prototipo-mozo.appspot.com",
  messagingSenderId: "526254713949",
  appId: "1:526254713949:web:500f952641f89f769531b4",
  measurementId: "G-K7QEYLK4WS",
};

const app = initializeApp(firebaseConfig);

// ❌ No agregar host/ssl aquí
const db = getFirestore(app);

const analytics = getAnalytics(app);

export { db, analytics };
