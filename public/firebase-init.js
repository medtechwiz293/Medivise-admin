import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB44B9jWHRFer_dIbPFA9XFfPc6_H8AD2Q",
  authDomain: "medivise-admin.firebaseapp.com",
  projectId: "medivise-admin",
  storageBucket: "medivise-admin.firebasestorage.app",
  messagingSenderId: "344782265100",
  appId: "1:344782265100:web:5080230dfec0e515344729",
  measurementId: "G-EHYMZ17WC9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ use default bucket

export { auth, db, storage };
