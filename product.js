const imgs = document.querySelectorAll('.img-select a');
const imgBtns = [...imgs];
let imgId = 1;

imgBtns.forEach((imgItem) => {
    imgItem.addEventListener('click', (event) => {
        event.preventDefault();
        imgId = imgItem.dataset.id;
        slideImage();
    });
});

function slideImage(){
    const displayWidth = document.querySelector('.img-showcase img:first-child').clientWidth;

    document.querySelector('.img-showcase').style.transform = `translateX(${- (imgId - 1) * displayWidth}px)`;
}

window.addEventListener('resize', slideImage);

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

// Firebase setup (make sure this is already initialized)
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// =======================
// ADD TO CART FUNCTION
// =======================
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

addToCartBtns.forEach(button => {
    button.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return alert('Please log in to add items to cart.');

        const productId = button.dataset.id;
        const title = button.dataset.title;
        const price = parseFloat(button.dataset.price);
        const image = button.dataset.image || '';

        const cartRef = collection(db, "carts");
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
});

// =======================
// UPDATE CART ICON COUNT
// =======================
async function updateCartIndicator() {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = collection(db, "carts");
    const q = query(cartRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const cartCount = querySnapshot.size;
    const bagIcon = document.querySelector('.bx-shopping-bag');

    // Add count indicator as badge
    if (bagIcon) {
        let badge = document.querySelector('.cart-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-count-badge';
            bagIcon.parentElement.appendChild(badge);
        }
        badge.innerText = cartCount;
    }
}

// Call it on page load (if user is logged in)
auth.onAuthStateChanged(user => {
    if (user) updateCartIndicator();
});

const buyNowBtn = document.querySelector('.buy-now-btn');

buyNowBtn?.addEventListener('click', () => {
    const productId = buyNowBtn.dataset.id;
    // Optionally pass ID or store in localStorage
    localStorage.setItem("buyNowProductId", productId);
    window.location.href = "/checkout.html"; // Adjust path as needed
});
