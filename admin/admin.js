import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, collection, addDoc, getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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

// Product Add/Edit
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = productForm.productName.value;
  const mrp = parseFloat(productForm.productMRP.value);
  const offerPrice = parseFloat(productForm.productOfferPrice.value);
  const stock = parseInt(productForm.productStock.value);
  const category = productForm.productCategory.value;
  const imageFiles = productForm.productImages.files;

  if (!imageFiles.length) {
    alert("Please select at least one image.");
    return;
  }

  const imageUrls = [];

  try {
    // Upload all images to Firebase Storage
    for (let file of imageFiles) {
      const storageRef = ref(storage, `product-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }

    // Store product in Firestore with multiple image URLs
    await addDoc(collection(db, "products"), {
      name,
      mrp,
      offerPrice,
      stock,
      category,
      imageUrls
    });

    alert("Product uploaded successfully!");
    productForm.reset();
  } catch (err) {
    console.error(err);
    alert("Failed to upload product: " + err.message);
  }
});
