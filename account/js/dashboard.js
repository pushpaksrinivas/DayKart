// js/dashboard.js
import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const address = data.address || {};

      document.getElementById("name").textContent = data.name || "";
      document.getElementById("phone").textContent = data.phone || "";
      document.getElementById("email").textContent = data.email || "";
      document.getElementById("regno").textContent = data.regno || "";
      document.getElementById("collegeName").textContent = data.collegeName || "";
      document.getElementById("referral").textContent = data.referralCode || "";

      document.getElementById("line1").textContent = address.line1 || "";
      document.getElementById("line2").textContent = address.line2 || "";
      document.getElementById("street").textContent = address.street || "";
      document.getElementById("city").textContent = address.city || "";
      document.getElementById("dist").textContent = address.dist || "";
      document.getElementById("state").textContent = address.state || "";
      document.getElementById("pincode").textContent = address.pincode || "";
    } else {
      document.getElementById("userDetails").textContent = "User data not found.";
    }
  } else {
    window.location.href = "login.html";
  }
});
