// public/firebase-init.js

const firebaseConfig = {
    apiKey: "AIzaSyB44B9jWHRFer_dIbPFA9XFfPc6_H8AD2Q",
    authDomain: "medivise-admin.firebaseapp.com",
    projectId: "medivise-admin",
    storageBucket: "medivise-admin.appspot.com", // FIXED: ".app" → ".appspot.com"
    messagingSenderId: "344782265100",
    appId: "1:344782265100:web:5080230dfec0e515344729",
    measurementId: "G-EHYMZ17WC9"
  };
  
  firebase.initializeApp(firebaseConfig);
  