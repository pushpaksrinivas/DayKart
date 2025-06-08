document.addEventListener("DOMContentLoaded", () => {
  const { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, setDoc, doc } = window.firebaseService;

  // Signup
  if (window.location.pathname.includes("signup")) {
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const [nameInput, emailInput, passwordInput] = e.target.elements;
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), { name, email });
        alert("Account created! You can now log in.");
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Login
  if (window.location.pathname.includes("index")) {
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const [emailInput, passwordInput] = e.target.elements;
      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        // Redirect or load user dashboard
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Forgot Password
  if (window.location.pathname.includes("forgot")) {
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const [emailInput] = e.target.elements;
      const email = emailInput.value;

      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent!");
      } catch (err) {
        alert(err.message);
      }
    });
  }
});


 const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginForm = document.getElementById('loginForm');

// Get Firebase services from window
const { auth, signInWithEmailAndPassword } = window.firebaseService;

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    // Sign in with Firebase Authentication
    await signInWithEmailAndPassword(auth, email, password);

    // Redirect on success
    window.location.href = 'index.html';
  } catch (error) {
    alert("Login failed: " + error.message);
    console.error("Login Error:", error);
  }
});
