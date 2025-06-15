// js/orders.js
import { auth, db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const container = document.getElementById("ordersContainer");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const ordersRef = collection(db, "users", user.uid, "orders");
    const ordersSnap = await getDocs(ordersRef);

    if (ordersSnap.empty) {
      container.innerHTML = `<p>No orders till now.</p>`;
    } else {
      container.innerHTML = "";
      ordersSnap.forEach(doc => {
        const order = doc.data();
        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
          <h3>Order ID: ${order.orderId || doc.id}</h3>
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Price:</strong> ₹${order.price}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${order.orderDate}</p>
        `;
        container.appendChild(card);
      });
    }
  } else {
    window.location.href = "login.html";
  }
});
