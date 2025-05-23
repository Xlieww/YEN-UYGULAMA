import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFrl1LUdJnvApUO_7yfJDHOLR8jaupYJA",
  authDomain: "pastborrrrr.firebaseapp.com",
  projectId: "pastborrrrr",
  storageBucket: "pastborrrrr.firebasestorage.app",
  messagingSenderId: "68907111223",
  appId: "1:68907111223:web:bb8e2d2f46344786e740b2",
  measurementId: "G-RWXYWXEG2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Kullanılan Firebase servislerini export et
// const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app);

// export { auth, db, storage };
export { app, analytics, db }; 