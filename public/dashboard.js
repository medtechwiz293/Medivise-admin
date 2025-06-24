import { auth, db, storage } from "./firebase-init.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

async function uploadLeaflet() {
  const fileInput = document.getElementById("leafletFile");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file.");

  const user = auth.currentUser;
  if (!user) return alert("User not authenticated.");

  const fileRef = ref(storage, `leaflets/${user.uid}/${file.name}`);
  await uploadBytes(fileRef, file);

  const url = await getDownloadURL(fileRef);

  await addDoc(collection(db, "practices", user.uid, "leaflets"), {
    name: file.name,
    url: url,
    uploadedAt: new Date()
  });

  alert("Uploaded!");
  fileInput.value = "";
  loadLeaflets();
}
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

async function getPracticeName(userId) {
  const docRef = doc(db, "practices", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().name;
  } else {
    return null;
  }
}

async function loadLeaflets() {
  const user = auth.currentUser;
  if (!user) return;

  const list = document.getElementById("leafletList");
  list.innerHTML = "";

  const snapshot = await getDocs(collection(db, "practices", user.uid, "leaflets"));
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<a href="${data.url}" target="_blank">${data.name}</a>`;
    list.appendChild(li);
  });
}

// Add this function to fetch the user's first name
async function getUserFirstName(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    return userDoc.data().firstName || null;
  }
  return null;
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    const practiceName = await getPracticeName(user.uid);
    const firstName = await getUserFirstName(user.uid);
    console.log("Fetched practice name:", practiceName, "First name:", firstName);

    const welcomeElem = document.getElementById("welcomeMessage");
    if (practiceName && firstName) {
      welcomeElem.textContent = `Welcome ${firstName}. This is the dashboard for ${practiceName}`;
    } else if (practiceName) {
      welcomeElem.textContent = `Welcome to the dashboard for ${practiceName}`;
    } else {
      welcomeElem.textContent = "Welcome to your dashboard";
    }
    loadLeaflets();
  } else {
    window.location.href = "/login.html";
  }
});

  
  

// Logout handler
document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  uploadBtn.addEventListener("click", uploadLeaflet);

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
});

window.uploadLeaflet = uploadLeaflet;
