import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBboe4dSO51doXv6sqcST6eKx0zXq72erU",
  authDomain: "mozo-ai.firebaseapp.com",
  projectId: "mozo-ai",
  storageBucket: "mozo-ai.firebasestorage.app",
  messagingSenderId: "62531286386",
  appId: "1:62531286386:web:c4513c3b441a698d28d9eb",
  measurementId: "G-HJEZ98CVHW",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa Firestore
const analytics = getAnalytics(app); // Inicializa Analytics

// Exporta db y analytics por separado
export { db, analytics };
