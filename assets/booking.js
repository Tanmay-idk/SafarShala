/* ==========================================================================
   BOOKING PAGE — step flow logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const phone = getLoggedInPhone();

  if (phone) {
    showStep('reviewStep');
    document.getElementById('loggedInStamp').textContent = `Logged in as ${phone}`;
  } else {
    showStep('loginStep');
  }

  renderCart();
});

function showStep(stepId) {
  document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
  document.getElementById(stepId).classList.remove('hidden');

  window.scrollTo({
    top: document.querySelector('.booking-section').offsetTop - 40,
    behavior: 'smooth'
  });
}

/* ---------- Step 1: Login ---------- */
function handleLoginSubmit(e) {
  e.preventDefault();

  const phone = document.getElementById('phoneInput').value.trim();

  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  localStorage.setItem('loggedInPhone', phone);

  document.getElementById('loggedInStamp').textContent =
    `Logged in as ${phone}`;

  showStep('reviewStep');
  renderCart();
}

function getLoggedInPhone() {
  return localStorage.getItem('loggedInPhone');
}

/* ---------- Step 3: Final submit ---------- */
function handleFinalSubmit(e) {
  e.preventDefault();

  const cart = getCart();

  const fullName = document.getElementById('fullName').value;
  const travellers = document.getElementById('travellers').value;
  const travelDates = document.getElementById('travelDates').value;
  const notes = document.getElementById('notes').value;

  const phone = getLoggedInPhone();

  const destinations = cart
    .map(item => `${item.name} (₹${item.price})`)
    .join(', ');

  const total = cartTotal();

  emailjs.send(
    "service_SafarShala",
    "template_pj05v2q",
    {
      name: fullName,
      contact: phone,
      message:
`Destinations: ${destinations}

Travellers: ${travellers}

Travel Dates: ${travelDates}

Total Package Cost: ₹${total}

Special Notes:
${notes}`
    }
  )
  .then(() => {
    showStep('doneStep');
  })
  .catch((error) => {
    console.error(error);
    alert("Failed to send booking request.");
  });
}

/* ---------- Step 2: Cart review ---------- */
function renderCart() {
  const cart = getCart();
  const listEl = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotalDisplay');
  const proceedBtn = document.getElementById('proceedBtn');

  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty">
        You haven't selected any places yet.
        Browse Domestic, International or Trekking Routes and tap
        "Select This Place" on the ones you want.
      </div>
    `;

    if (proceedBtn) proceedBtn.disabled = true;
  } else {
    listEl.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div class="cart-row-info">
          <h4>${escapeHtml(item.name)}</h4>
          <span>${escapeHtml(item.type)}</span>
        </div>

        <div class="cart-row-right">
          <span class="cart-row-price">
            ₹${Number(item.price).toLocaleString('en-IN')}
          </span>

          <button class="cart-row-remove"
                  onclick="handleRemove('${item.id}')">
            Remove
          </button>
        </div>
      </div>
    `).join('');

    if (proceedBtn) proceedBtn.disabled = false;
  }

  totalEl.textContent = '₹' + cartTotal().toLocaleString('en-IN');
}

function handleRemove(id) {
  removeFromCart(id);
  renderCart();
}

function goToStep3() {
  if (getCart().length === 0) {
    alert('Please select at least one place before proceeding.');
    return;
  }

  showStep('detailsStep');
}

/* ---------- Utility ---------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}