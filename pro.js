// Add at the bottom of your script (after Firebase is initialized):
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Firebase config (add yours here)
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const discount = Math.round(((data.mrp - data.offerPrice) / data.mrp) * 100);

        productList.innerHTML += `
        <article class="product">
            <img src="${data.image}" alt="${data.name}" class="product-img">
            <span class="product-name">${data.name}</span>
            <span class="product-price">₹${data.offerPrice} <span style="text-decoration:line-through; font-size: 0.8em;">₹${data.mrp}</span> <span style="color: green;">(${discount}% OFF)</span></span>
            <span class="product-stock">Available: ${data.quantity}</span>
            <a href="view.html?id=${doc.id}" class="button-light">View <i class="bx bx-right-arrow-alt button-icon"></i></a>
            <a href="#" class="button-light" style="margin-top: 10px;">Add to Cart <i class="bx bx-cart button-icon"></i></a>
        </article>
        `;
    });
}

loadProducts();

const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId);
    const nav = document.getElementById(navId);

    if(toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show');
        })
    }
}

