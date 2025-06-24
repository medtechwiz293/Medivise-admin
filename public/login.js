import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect to dashboard on successful login
    window.location.href = "/dashboard.html";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Optional: redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/dashboard.html";
  }
});
