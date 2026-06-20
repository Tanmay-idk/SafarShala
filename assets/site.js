/* ==========================================================================
   NOSTALGIA TREKS — Shared site behaviour
   Loaded on every page. Handles: nav toggle, scroll reveals, login state,
   and the booking "cart" (selected places + running total).

   NOTE FOR LATER: everything under "FAKE BACKEND" below uses localStorage
   and mailto: links so the site works with zero server. When you're ready
   for real accounts + automatic WhatsApp messages, swap those functions
   for real API calls — the rest of the site won't need to change.
   ========================================================================== */

/* ---------- Mobile nav ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && targets.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(el => obs.observe(el));
  } else {
    targets.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Update login/cart indicators on every page load ---------- */
  updateLoginUI();
  updateCartBadge();
});

/* ==========================================================================
   FAKE BACKEND (placeholder — replace with real server later)
   ========================================================================== */

const OWNER_EMAIL = 'astromeda13@gmail.com';

/* ---- Login (phone number only, no OTP yet — placeholder) ---- */
function fakeLogin(phone) {
  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit phone number.');
    return false;
  }
  localStorage.setItem('nt_user_phone', phone);
  updateLoginUI();
  return true;
}

function fakeLogout() {
  localStorage.removeItem('nt_user_phone');
  updateLoginUI();
}

function getLoggedInPhone() {
  return localStorage.getItem('nt_user_phone');
}

function updateLoginUI() {
  const phone = getLoggedInPhone();
  const loginLinks = document.querySelectorAll('[data-login-link]');
  loginLinks.forEach(el => {
    el.textContent = phone ? `My Account (${phone})` : 'Login';
  });
}

/* ---- Cart: selected places + price ---- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('nt_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('nt_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(place) {
  // place = { id, name, price, type }
  const cart = getCart();
  if (cart.find(p => p.id === place.id)) return; // already added
  cart.push(place);
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem('nt_cart');
  updateCartBadge();
}

function cartTotal() {
  return getCart().reduce((sum, p) => sum + Number(p.price || 0), 0);
}

function updateCartBadge() {
  const count = getCart().length;
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

/* ---- Toggle a place card's selected state + add/remove from cart ---- */
function togglePlaceSelect(btn, id, name, price, type) {
  const cart = getCart();
  const exists = cart.find(p => p.id === id);
  if (exists) {
    removeFromCart(id);
    btn.classList.remove('selected');
    btn.textContent = 'Select This Place';
  } else {
    addToCart({ id, name, price, type });
    btn.classList.add('selected');
    btn.textContent = '✓ Added to Trip';
  }
}

/* ---- Build a mailto: link summarising the booking request ---- */
function buildBookingEmail() {
  const phone = getLoggedInPhone() || '(not logged in)';
  const cart = getCart();
  const total = cartTotal();

  const lines = cart.map(p => `- ${p.name} (${p.type}) — ₹${Number(p.price).toLocaleString('en-IN')}`).join('\n');

  const subject = encodeURIComponent('New Trip Booking Request — Nostalgia Treks');
  const body = encodeURIComponent(
`New booking request from the website.

Customer phone (WhatsApp): ${phone}

Selected places:
${lines || '(none selected)'}

Estimated total: ₹${total.toLocaleString('en-IN')}

— Sent automatically from the booking page. Reply/confirm with the customer, then message them on WhatsApp to confirm.`
  );

  return `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
}
