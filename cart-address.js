import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  runTransaction,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Generate a 4-character alphanumeric order ID
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if it's the user's first order
async function isFirstOrder(uid) {
  const q = query(collection(db, "orders"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

// Prefill user details in form
async function prefillForm(uid) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const nameParts = data.name?.split(" ") || [];

    document.querySelector("input[placeholder='First name *']").value = nameParts[0] || "";
    document.querySelector("input[placeholder='Last name']").value = nameParts.slice(1).join(" ") || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("collegeName").value = data.collegeName || "";
    document.querySelector("input[placeholder='Phone *']").value = data.phone || "";
  }
}

// Save order and reduce product quantity
async function saveOrderToFirebase(uid) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const coupon = document.getElementById("couponCode").value.trim().toUpperCase();
  const subtotal = parseFloat(document.getElementById("subtotal").textContent.replace("₹", "")) || 0;
  let total = parseFloat(document.getElementById("total").textContent.replace("₹", "")) || 0;
  const saved = parseFloat(document.getElementById("youSaved")?.textContent.replace("₹", "") || 0);
  const discount = saved;

  if (cartItems.length === 0 || total <= 0) {
    alert("Your cart is empty or total is invalid.");
    return;
  }

  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  const email = userData.email || "";
  const college = userData.collegeName || "";
  const name = userData.name || "";
  const phone = userData.phone || "";

  const paymentMethod = document.querySelector("input[name='payment']:checked")?.value || "UPI";

  let shipping = 0;
  const firstOrder = await isFirstOrder(uid);
  if (!firstOrder) {
    if (total < 499) shipping = 59;
    else if (total < 1499) shipping = 99;
  }
  if (paymentMethod === "COD") shipping += 100;
  total += shipping;

  const shippingFeeEl = document.getElementById("shippingFee");
  if (shippingFeeEl) {
    shippingFeeEl.textContent = `₹${shipping}`;
  }

  const orderId = generateOrderId();

  const orderData = {
    orderId,
    userId: uid,
    name,
    email,
    college,
    phone,
    items: cartItems,
    subtotal,
    total,
    discount,
    saved,
    coupon,
    shipping,
    paymentMethod,
    firstOrder,
    timestamp: serverTimestamp()
  };

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Reduce product quantity
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const productData = productSnap.data();
        const currentQty = productData.quantity || 0;

        if (currentQty < item.qty) {
          throw new Error(`Not enough stock for: ${productData.name || item.productId}`);
        }

        transaction.update(productRef, {
          quantity: currentQty - item.qty
        });
      }

      // 2. Save the order
      const orderRef = doc(collection(db, "orders"));
      transaction.set(orderRef, orderData);
    });

    // 3. Clear Firestore cart after order placed
    const cartCollectionRef = collection(db, `users/${uid}/cart`);
    const cartSnapshot = await getDocs(cartCollectionRef);
    const deletePromises = cartSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    // 4. Clear local cart and redirect
    localStorage.removeItem("cart");

    alert(`Order placed successfully! Your Order ID is ${orderId}`);
    window.location.href = "/account/orders.html";

  } catch (err) {
    console.error("Error placing order:", err);
    alert(`Order failed: ${err.message}`);
  }
}


// Auth check and attach event listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    prefillForm(uid);
    document.getElementById("placeOrderBtn").addEventListener("click", () => {
      saveOrderToFirebase(uid);
    });
  } else {
    alert("Please log in to place an order.");
    window.location.href = "/login.html";
  }
});
