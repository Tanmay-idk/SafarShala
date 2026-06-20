/* ==========================================================================
   PRICE CALCULATOR — destination data + pricing logic
   ==========================================================================
   HOW TO EDIT THIS FILE:
   - Each destination below is one object inside DESTINATIONS.
   - type: "trek"  -> flat price per person (ignores nights)
   - type: "stay"  -> price per person PER NIGHT (domestic/international)
   - id must be unique and match what you use elsewhere (cart, booking).
   - price is in rupees, as a plain number (no commas, no ₹ symbol).
   Replace every placeholder name/price below with your real ones.
   ========================================================================== */

const DESTINATIONS = [
  // ---- TREKS (flat price per person) ----
  { id: 'hampta-pass',      name: 'Hampta Pass',           type: 'trek', price: 0, grade: 'MODERATE' },
  { id: 'kedarkantha',      name: 'Kedarkantha',           type: 'trek', price: 0, grade: 'EASY-MODERATE' },
  { id: 'stok-kangri',      name: 'Stok Kangri Base',      type: 'trek', price: 0, grade: 'STRENUOUS' },
  { id: 'valley-of-flowers',name: 'Valley of Flowers',     type: 'trek', price: 0, grade: 'EASY' },
  { id: 'roopkund',         name: 'Roopkund',              type: 'trek', price: 0, grade: 'STRENUOUS' },
  { id: 'brahmatal',        name: 'Brahmatal',             type: 'trek', price: 0, grade: 'MODERATE' },

  // ---- DOMESTIC (price per person, per night) ----
  { id: 'manali-solang',    name: 'Manali & Solang Valley',type: 'stay', price: 0, region: 'Domestic' },
  { id: 'rishikesh-ganges', name: 'Rishikesh & Ganges Valley', type: 'stay', price: 0, region: 'Domestic' },
  { id: 'goa-coastal',      name: 'Goa Coastal Circuit',   type: 'stay', price: 0, region: 'Domestic' },
  { id: 'udaipur-lakes',    name: 'Udaipur & Lake Palaces',type: 'stay', price: 0, region: 'Domestic' },
  { id: 'munnar-ghats',     name: 'Munnar & Western Ghats',type: 'stay', price: 0, region: 'Domestic' },
  { id: 'ladakh-plateau',   name: 'Ladakh Plateau',        type: 'stay', price: 0, region: 'Domestic' },

  // ---- INTERNATIONAL (price per person, per night) ----
  { id: 'nepal-himalaya',   name: 'Nepal Himalaya Crossing', type: 'stay', price: 0, region: 'International' },
  { id: 'swiss-alpine',     name: 'Swiss Alpine Trail',    type: 'stay', price: 0, region: 'International' },
  { id: 'bhutan-monastery', name: 'Bhutan Monastery Trek', type: 'stay', price: 0, region: 'International' },
];

/* ---------- Populate the dropdown on page load ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('destinationSelect');
  const optgroups = select.querySelectorAll('optgroup');
  const trekGroup = optgroups[0];
  const domesticGroup = optgroups[1];
  const intlGroup = optgroups[2];

  DESTINATIONS.forEach(dest => {
    const opt = document.createElement('option');
    opt.value = dest.id;
    opt.textContent = dest.name;

    if (dest.type === 'trek') {
      trekGroup.appendChild(opt);
    } else if (dest.region === 'Domestic') {
      domesticGroup.appendChild(opt);
    } else {
      intlGroup.appendChild(opt);
    }
  });
});

let currentDestination = null;

/* ---------- When user picks a destination ---------- */
function handleDestinationChange() {
  const id = document.getElementById('destinationSelect').value;
  currentDestination = DESTINATIONS.find(d => d.id === id) || null;

  const detailsBox = document.getElementById('destinationDetails');
  const datesField = document.getElementById('datesField');
  const pricingLabel = document.getElementById('pricingModelLabel');
  const gradeStamp = document.getElementById('gradeStamp');

  if (!currentDestination) {
    detailsBox.classList.add('hidden');
    datesField.classList.add('hidden');
    recalculate();
    return;
  }

  detailsBox.classList.remove('hidden');

  if (currentDestination.type === 'trek') {
    pricingLabel.textContent = `Flat price per person — fixed itinerary length`;
    gradeStamp.textContent = `GRADE: ${currentDestination.grade}`;
    gradeStamp.style.display = 'inline-block';
    datesField.classList.add('hidden');
  } else {
    pricingLabel.textContent = `Priced per person, per night`;
    gradeStamp.style.display = 'none';
    datesField.classList.remove('hidden');
  }

  recalculate();
}

/* ---------- Calculate nights between two dates ---------- */
function calculateNights() {
  const checkin = document.getElementById('checkinInput').value;
  const checkout = document.getElementById('checkoutInput').value;
  const readout = document.getElementById('nightsReadout');

  if (!checkin || !checkout) {
    readout.textContent = '';
    return 0;
  }

  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  const diffMs = outDate - inDate;
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    readout.textContent = 'Check-out must be after check-in.';
    readout.classList.add('error');
    return 0;
  }

  readout.classList.remove('error');
  readout.textContent = `${nights} night${nights === 1 ? '' : 's'}`;
  return nights;
}

/* ---------- Main recalculation, runs on every input change ---------- */
function recalculate() {
  const breakdown = document.getElementById('calcBreakdown');
  const totalAmount = document.getElementById('calcTotalAmount');
  const addBtn = document.getElementById('addToTripBtn');
  const people = Math.max(1, parseInt(document.getElementById('peopleInput').value) || 1);

  if (!currentDestination) {
    breakdown.innerHTML = `<p class="placeholder-text">Choose a destination above to see your price breakdown.</p>`;
    totalAmount.textContent = '₹0';
    addBtn.disabled = true;
    return;
  }

  let total = 0;
  let rows = [];

  if (currentDestination.type === 'trek') {
    total = currentDestination.price * people;
    rows.push(`<div class="bd-row"><span>${escapeHtml(currentDestination.name)} × ${people} ${people === 1 ? 'person' : 'people'}</span><span>₹${currentDestination.price.toLocaleString('en-IN')} × ${people}</span></div>`);
  } else {
    const nights = calculateNights();
    total = currentDestination.price * people * nights;
    rows.push(`<div class="bd-row"><span>${escapeHtml(currentDestination.name)} × ${people} ${people === 1 ? 'person' : 'people'} × ${nights} ${nights === 1 ? 'night' : 'nights'}</span><span>₹${currentDestination.price.toLocaleString('en-IN')}/night</span></div>`);

    if (nights === 0) {
      breakdown.innerHTML = `<p class="placeholder-text">Select your check-in and check-out dates to see the total.</p>`;
      totalAmount.textContent = '₹0';
      addBtn.disabled = true;
      return;
    }
  }

  breakdown.innerHTML = rows.join('');
  totalAmount.textContent = '₹' + total.toLocaleString('en-IN');
  addBtn.disabled = false;
}

/* ---------- Add the calculated result into the shared cart ---------- */
function addCalculatedTripToCart() {
  if (!currentDestination) return;

  const people = Math.max(1, parseInt(document.getElementById('peopleInput').value) || 1);
  let total = 0;
  let typeLabel = '';

  if (currentDestination.type === 'trek') {
    total = currentDestination.price * people;
    typeLabel = `Trek · ${people} ${people === 1 ? 'person' : 'people'}`;
  } else {
    const nights = calculateNights();
    if (nights === 0) {
      alert('Please select valid check-in and check-out dates first.');
      return;
    }
    total = currentDestination.price * people * nights;
    typeLabel = `${currentDestination.region} · ${people} ${people === 1 ? 'person' : 'people'} · ${nights} ${nights === 1 ? 'night' : 'nights'}`;
  }

  // Uses the same addToCart() function defined in assets/site.js,
  // so this plugs straight into the existing Booking page cart.
  addToCart({
    id: currentDestination.id + '-' + Date.now(), // unique even if added twice
    name: currentDestination.name,
    price: total,
    type: typeLabel
  });

  const addBtn = document.getElementById('addToTripBtn');
  addBtn.textContent = '✓ Added — go to Booking to review';
  addBtn.disabled = true;
  setTimeout(() => {
    addBtn.textContent = 'Add This to My Trip →';
    addBtn.disabled = false;
  }, 2500);
}

/* ---------- Utility ---------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
