let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;
let offerTotal = 0;

// DOM elements
const orderSummary = document.getElementById("orderSummary");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const subtotalRow = document.getElementById("subtotalRow");
const couponMsg = document.getElementById("couponMessage");

// Apply Coupon
document.getElementById("applyCoupon").addEventListener("click", () => {
  const code = document.getElementById("couponCode").value.trim().toUpperCase();
  discount = 0;

  if (code === "NDAY10" && offerTotal >= 1999) {
    discount = Math.floor(offerTotal * (Math.random() * 8.5) / 100);
    couponMsg.textContent = `NDAY10 applied! You saved ₹${discount}`;
    couponMsg.style.color = "green";
  } else if (code === "ODAY5" && offerTotal >= 499) {
    discount = Math.floor(offerTotal * 5 / 100);
    couponMsg.textContent = `ODAY5 applied! You saved ₹${discount}`;
    couponMsg.style.color = "green";
  } else {
    couponMsg.textContent = "Invalid or ineligible coupon.";
    couponMsg.style.color = "red";
    return;
  }

  updateTotals();
});

function renderCartItems() {
  // Clean up old product rows
  document.querySelectorAll(".order-row.dynamic").forEach(row => row.remove());

  offerTotal = 0;

  cartItems.forEach(item => {
    const itemTotal = item.offerPrice * item.qty;
    offerTotal += itemTotal;

    const row = document.createElement("div");
    row.className = "order-row dynamic";
    row.innerHTML = `
      <span>${item.title} × ${item.qty}</span>
      <span>₹${itemTotal.toFixed(2)}</span>
    `;
    orderSummary.insertBefore(row, subtotalRow); // insert above the Subtotal row
  });

  updateTotals();
}

function updateTotals() {
  subtotalEl.textContent = `₹${offerTotal.toFixed(2)}`;
  totalEl.textContent = `₹${(offerTotal - discount).toFixed(2)}`;
}

// Toggle coupon visibility
document.getElementById("toggleCoupon").addEventListener("click", () => {
  document.getElementById("couponForm").classList.toggle("hidden");
});

// Auto-fill email
const userEmail = localStorage.getItem("userEmail");
if (userEmail) {
  document.getElementById("email").value = userEmail;
}

// On load
renderCartItems();
