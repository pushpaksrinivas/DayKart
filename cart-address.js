import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get user ID
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = `guest-${crypto.randomUUID()}`;
  localStorage.setItem("userId", userId);
}

const addressSelect = document.getElementById("addressSelect");

async function loadUserAddress() {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    addressSelect.innerHTML = ""; // Clear old options

    if (!userSnap.exists()) {
      addressSelect.innerHTML = `<option disabled selected>No address found</option>`;
      return;
    }

    const data = userSnap.data();

    if (!data.address || !data.address.line1) {
      addressSelect.innerHTML = `<option disabled selected>Address not available</option>`;
      return;
    }

    const addr = data.address;

    const fullAddress = `${addr.line1 || ""}, ${addr.line2 || ""}, ${addr.street || ""}, ${addr.city || ""}, ${addr.dist || ""}, ${addr.state || ""}, ${addr.pincode || ""}`;

    const option = document.createElement("option");
    option.value = "default";
    option.textContent = fullAddress;
    addressSelect.appendChild(option);
  } catch (error) {
    console.error("Error loading address:", error);
    addressSelect.innerHTML = `<option disabled selected>Error loading address</option>`;
  }
}

loadUserAddress();
