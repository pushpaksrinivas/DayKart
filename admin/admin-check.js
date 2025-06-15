import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Only allow access to a specific admin email
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== "admin@example.com") {
    alert("Access denied. Admins only.");
    window.location.href = "/login.html";
  }
});
