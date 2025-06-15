import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsP80XFSykRlteD8LTQaw76TD8AJItMFw",
  authDomain: "daykart-77771.firebaseapp.com",
  databaseURL: "https://daykart-77771-default-rtdb.firebaseio.com",
  projectId: "daykart-77771",
  storageBucket: "daykart-77771.firebasestorage.app",
  messagingSenderId: "533666061468",
  appId: "1:533666061468:web:a40c38b11a93a18e776159",
  measurementId: "G-X1FCYK4XR1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('productForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const images = document.getElementById('images').value.split(',').map(url => url.trim());
  const mrp = parseFloat(document.getElementById('mrp').value);
  const offerPrice = parseFloat(document.getElementById('offerPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const category = document.getElementById('category').value;
  const link = document.getElementById('link').value;

  try {
    await addDoc(collection(db, "products"), {
      title,
      description,
      images,
      mrp,
      offerPrice,
      discountPercent: Math.round(((mrp - offerPrice) / mrp) * 100),
      quantity,
      category,
      link,
      createdAt: serverTimestamp()
    });

    form.reset();
    status.textContent = "✅ Product added successfully!";
  } catch (error) {
    console.error("Error adding product: ", error);
    status.textContent = "❌ Error adding product.";
  }
});
