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
  onAuthStateChanged
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadLeaflets();
  } else {
    window.location.href = "/login.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  uploadBtn.addEventListener("click", uploadLeaflet);
});
