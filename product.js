// Firebase imports
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth();
const dbRef = getFirestore();

// Showing Menu

const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId);
    const nav = document.getElementById(navId);

    if(toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show');
        })
    }
}

showMenu('nav-toggle', 'nav-menu');

//Removing Menu by clicking links

const navLink = document.querySelectorAll('.nav-link');
const navMenu = document.getElementById('nav-menu');

function linkAction() {
    navMenu.classList.remove('show');
}

navLink.forEach(n => n.addEventListener('click', linkAction));

//Changing Active Link by scrolling

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', scrollActive);

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        const sectionId = current.getAttribute('id');

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-menu a[href*='+ sectionId +']').classList.add('active');
        }else {
            document.querySelector('.nav-menu a[href*='+ sectionId +']').classList.remove('active');
        }
    })
}

//Changing Color Header

window.onscroll = () => {
    const nav = document.getElementById('header');
    if(this.scrollY >= 200) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header');
}

// ========== IMAGE SLIDER ==========
let imgId = 1;
function slideImage() {
  const displayWidth = document.querySelector('.img-showcase img:first-child')?.clientWidth || 0;
  document.querySelector('.img-showcase').style.transform = `translateX(-₹{(imgId - 1) * displayWidth}px)`;
}
window.addEventListener('resize', slideImage);

// ========== PRODUCT DATA LOADING ==========
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return alert("No product ID found");

  const docRef = doc(dbRef, "products", productId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return alert("Product not found");

  const data = docSnap.data();
  document.getElementById('product-name').textContent = data.name;
  document.getElementById('offer-price').textContent = data.offerPrice;
  document.getElementById('mrp').textContent = data.mrp;
  document.getElementById('available-qty').textContent = data.quantity;
  document.getElementById('product-description').textContent = data.description;

  const discount = Math.round(((data.mrp - data.offerPrice) / data.mrp) * 100);
  document.getElementById('discount').textContent = discount;

  const imgShowcase = document.querySelector('.img-showcase');
  const imgSelect = document.querySelector('.img-select');
  imgShowcase.innerHTML = '';
  imgSelect.innerHTML = '';

  data.images.forEach((imgUrl, index) => {
    imgShowcase.innerHTML += `<img src="₹{imgUrl}" alt="product image">`;
    imgSelect.innerHTML += `
      <div class="img-item">
        <a href="#" data-id="₹{index + 1}">
          <img src="₹{imgUrl}" alt="product thumbnail">
        </a>
      </div>`;
  });

  // Update image slider
  document.querySelectorAll('.img-select a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      imgId = parseInt(a.dataset.id);
      slideImage();
    });
  });

  slideImage();

  // Add product ID to buttons
  document.querySelector('.add-to-cart-btn')?.setAttribute('data-id', productId);
  document.querySelector('.buy-now-btn')?.setAttribute('data-id', productId);
});

// ========== ADD TO CART ==========
document.querySelector('.add-to-cart-btn')?.addEventListener('click', async (e) => {
  const user = auth.currentUser;
  if (!user) return alert("Please log in to add items to cart.");

  const button = e.currentTarget;
  const productId = button.dataset.id;
  const title = document.getElementById('product-name').textContent;
  const price = parseFloat(document.getElementById('offer-price').textContent);
  const image = document.querySelector('.img-showcase img')?.src || "";

  const cartRef = collection(dbRef, "carts");
  await addDoc(cartRef, {
    userId: user.uid,
    productId,
    title,
    price,
    image,
    quantity: 1,
    addedAt: new Date()
  });

  updateCartIndicator();
  alert("Product added to cart!");
});

// ========== BUY NOW ==========
document.querySelector('.buy-now-btn')?.addEventListener('click', () => {
  const productId = document.querySelector('.buy-now-btn').dataset.id;
  localStorage.setItem("buyNowProductId", productId);
  window.location.href = "checkout.html?id=" + productId;
});

// ========== UPDATE CART INDICATOR ==========
async function updateCartIndicator() {
  const user = auth.currentUser;
  if (!user) return;
  const q = query(collection(dbRef, "carts"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  const count = querySnapshot.size;
  const bagIcon = document.querySelector('.bx-shopping-bag');
  if (bagIcon) {
    let badge = document.querySelector('.cart-count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-count-badge';
      bagIcon.parentElement.appendChild(badge);
    }
    badge.textContent = count;
  }
}
auth.onAuthStateChanged(user => {
  if (user) updateCartIndicator();
});

// ========== REDUCE PRODUCT QUANTITY ==========
async function reduceQuantity(productId, quantityToReduce) {
  const productRef = doc(dbRef, 'products', productId);
  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) return;

  const currentQty = productSnap.data().quantity;
  const newQty = Math.max(currentQty - quantityToReduce, 0);
  await updateDoc(productRef, { quantity: newQty });
}
