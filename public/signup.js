// signup.js
import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const secondName = document.getElementById("second-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const practiceName = document.getElementById("practice-name").value.trim();

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user personal info in /users collection
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      secondName,
      email,
      createdAt: new Date()
    });

    // Save practice info in /practices collection
    await setDoc(doc(db, "practices", user.uid), {
      name: practiceName,
      adminUserId: user.uid,
      createdAt: new Date()
    });

    // Redirect to dashboard
    window.location.href = "/dashboard.html";

  } catch (error) {
    alert("Error: " + error.message);
  }
});
