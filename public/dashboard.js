import { auth, db, storage } from "./firebase-init.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    deleteDoc
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
  
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Upload a leaflet file with metadata
async function uploadLeaflet(file, leafletName, specialty) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  // Upload file to storage
  const fileRef = ref(storage, `leaflets/${user.uid}/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Save leaflet info in Firestore
  await addDoc(collection(db, "practices", user.uid, "leaflets"), {
    name: leafletName,
    url: url,
    specialty: specialty,
    uploadedAt: new Date()
  });
}

// Get practice name by userId
async function getPracticeName(userId) {
  const docRef = doc(db, "practices", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().name : null;
}

// Get user first name by userId (optional)
async function getUserFirstName(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? (userDoc.data().firstName || null) : null;
}

// Load leaflets for the current user and display
async function loadLeaflets() {
    const user = auth.currentUser;
    if (!user) return;
  
    const tableBody = document.getElementById("leafletTableBody");
    tableBody.innerHTML = "";
  
    const snapshot = await getDocs(collection(db, "practices", user.uid, "leaflets"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const docId = docSnap.id;  // needed for deletion
  
      const row = document.createElement("tr");
  
      const nameCell = document.createElement("td");
      nameCell.textContent = data.name;
      nameCell.style.padding = "0.5rem";
  
      const dateCell = document.createElement("td");
      const date = data.uploadedAt?.toDate ? data.uploadedAt.toDate() : new Date();
      dateCell.textContent = date.toLocaleDateString();
      dateCell.style.padding = "0.5rem";
  
      const specialtyCell = document.createElement("td");
      specialtyCell.textContent = data.specialty;
      specialtyCell.style.padding = "0.5rem";
  
      const linkCell = document.createElement("td");
      const link = document.createElement("a");
      link.href = data.url;
      link.target = "_blank";
      link.textContent = "View";
      link.style.color = "#007acc";
      link.style.textDecoration = "none";
      linkCell.appendChild(link);
      linkCell.style.padding = "0.5rem";
  
      const deleteCell = document.createElement("td"); // NEW
      const deleteBtn = document.createElement("button"); // NEW
      deleteBtn.textContent = "Delete"; // NEW
      deleteBtn.style.cssText = "padding: 0.3rem 0.6rem; color: white; background:rgb(88, 47, 224); border: none; border-radius: 4px; cursor: pointer;"; // NEW
      deleteBtn.onclick = async () => {
        if (confirm(`Are you sure you want to delete "${data.name}"?`)) {
          await deleteLeaflet(user.uid, docId, data.url);
          await loadLeaflets(); // Refresh table
        }
      }; // NEW
      deleteCell.appendChild(deleteBtn); // NEW
      deleteCell.style.padding = "0.5rem"; // NEW
  
      row.appendChild(nameCell);
      row.appendChild(dateCell);
      row.appendChild(specialtyCell);
      row.appendChild(linkCell);
      row.appendChild(deleteCell); // NEW
  
      tableBody.appendChild(row);
    });
  }


import { deleteObject, ref as storageRef } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Delete leaflet from Firestore and Storage
async function deleteLeaflet(userId, leafletId, fileUrl) {
  try {
    // Delete Firestore document
    await deleteDoc(doc(db, "practices", userId, "leaflets", leafletId));

    // Delete from Firebase Storage
    const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
    const pathStart = fileUrl.indexOf("/o/") + 3;
    const pathEnd = fileUrl.indexOf("?alt=");
    const encodedPath = fileUrl.substring(pathStart, pathEnd);
    const decodedPath = decodeURIComponent(encodedPath);
    const fileRef = storageRef(storage, decodedPath);
    await deleteObject(fileRef);

    alert("Leaflet deleted successfully.");
  } catch (error) {
    alert("Error deleting leaflet: " + error.message);
  }
}


  document.getElementById("leafletSearch").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#leafletTableBody tr");
  
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });
  

// Populate specialties dropdown from Firestore
async function populateSpecialtyDropdown(dropdownElement) {
    dropdownElement.innerHTML = "";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a specialty";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdownElement.appendChild(defaultOption);
  
    const snapshot = await getDocs(collection(db, "specialties"));
    snapshot.forEach(doc => {
      const specialty = doc.data().name;
      const option = document.createElement("option");
      option.value = specialty;
      option.textContent = specialty;
      dropdownElement.appendChild(option);
    });
  }
  

// Main DOM ready initialization
document.addEventListener("DOMContentLoaded", () => {
  // Grab all needed DOM elements here
  const modal = document.getElementById("uploadModal");
  const openModalBtn = document.getElementById("openUploadModalBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelUploadBtn = document.getElementById("cancelUploadBtn");
  const uploadForm = document.getElementById("uploadForm");
  const specialtyDropdown = document.getElementById("modalSpecialtyDropdown");
  const leafletNameInput = document.getElementById("leafletNameInput");
  const fileInput = document.getElementById("modalFileInput");
  const welcomeElem = document.getElementById("welcomeMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const leafletList = document.getElementById("leafletList");

  // Show modal handler
  openModalBtn.addEventListener("click", () => {
    modal.classList.add("show");
});

  // Close modal handlers
  function closeModal() {
    modal.classList.remove("show");
    uploadForm.reset();
  }
  closeModalBtn.addEventListener("click", closeModal);
  cancelUploadBtn.addEventListener("click", closeModal);
  window.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  // Upload form submission
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const leafletName = leafletNameInput.value.trim();
    const specialty = specialtyDropdown.value;

    if (!file) return alert("Please select a PDF file.");
    if (!leafletName) return alert("Please enter a leaflet name.");
    if (!specialty) return alert("Please select a specialty.");

    try {
      await uploadLeaflet(file, leafletName, specialty);
      alert("Uploaded successfully!");
      closeModal();
      await loadLeaflets();
    } catch (error) {
      alert("Upload failed: " + error.message);
    }
  });

  // Logout button
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });

  // Monitor auth state and update UI accordingly
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const practiceName = await getPracticeName(user.uid);
      const firstName = await getUserFirstName(user.uid);

      if (practiceName && firstName) {
        welcomeElem.textContent = `Welcome ${firstName}. This is the dashboard for ${practiceName}`;
      } else if (practiceName) {
        welcomeElem.textContent = `Welcome to the dashboard for ${practiceName}`;
      } else {
        welcomeElem.textContent = "Welcome to your dashboard";
      }

      await loadLeaflets();
      await populateSpecialtyDropdown(specialtyDropdown);

    } else {
      window.location.href = "/login.html";
    }
  });
});
