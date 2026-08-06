/* My Safe Space — fully customizable room. Auto-saves to localStorage on every change. */

const SAFESPACE_KEY = 'haven_safespace_v1';
const SAFESPACE_PHOTO_LIMIT = 12;         // cap on stored photos (localStorage is small)
const SAFESPACE_PHOTO_MAX_SIDE = 800;     // downscale to keep storage manageable
const SAFESPACE_STORAGE_HARD_CAP = 4 * 1024 * 1024; // ~4MB soft budget

function defaultSafeSpace() {
  return {
    music: '',
    photos: [],       // { id, dataUrl }
    affirmations: [],
    coping: [],
    contacts: []      // { id, name, num }
  };
}

function loadSafeSpace() {
  try {
    const raw = localStorage.getItem(SAFESPACE_KEY);
    if (!raw) return defaultSafeSpace();
    return { ...defaultSafeSpace(), ...JSON.parse(raw) };
  } catch (e) {
    return defaultSafeSpace();
  }
}

function persistSafeSpace(state) {
  try {
    localStorage.setItem(SAFESPACE_KEY, JSON.stringify(state));
  } catch (e) {
    alert("⚠️ Your safe space is full — try removing an old photo to save room.");
  }
}

function initSafeSpace() {
  const state = loadSafeSpace();

  const music = document.getElementById('ss-music-input');
  if (music) music.value = state.music || '';

  renderSafeSpacePhotos(state);
  renderSafeSpaceAffirms(state);
  renderSafeSpaceCope(state);
  renderSafeSpaceContacts(state);
  if (state.music) renderSafeSpaceMusic();

  // Auto-save every visible input on any interaction (also fires on blur)
  ['ss-music-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', saveSafeSpace);
  });

  // Save before leaving the page — belt & suspenders (every change also saves)
  window.addEventListener('beforeunload', saveSafeSpace);
}

function saveSafeSpace() {
  const state = loadSafeSpace();
  const music = document.getElementById('ss-music-input');
  if (music) state.music = music.value;
  persistSafeSpace(state);
}

/* ---------- Photos ---------- */
function addSafeSpacePhotos(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const state = loadSafeSpace();

  const remainingSlots = SAFESPACE_PHOTO_LIMIT - state.photos.length;
  const toProcess = files.slice(0, remainingSlots);
  if (files.length > remainingSlots) {
    alert(`You can have up to ${SAFESPACE_PHOTO_LIMIT} photos. Adding the first ${remainingSlots}.`);
  }

  let done = 0;
  toProcess.forEach(file => {
    downscaleImage(file, SAFESPACE_PHOTO_MAX_SIDE, dataUrl => {
      state.photos.push({ id: Date.now() + Math.floor(Math.random() * 1000), dataUrl });
      done++;
      if (done === toProcess.length) {
        persistSafeSpace(state);
        renderSafeSpacePhotos(state);
        // Photos count as a wellness action for the plant
        if (typeof waterPlant === 'function') waterPlant('journal', true);
      }
    });
  });

  // Reset file input so same file can be picked again
  e.target.value = '';
}

function downscaleImage(file, maxSide, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderSafeSpacePhotos(state) {
  const grid = document.getElementById('ss-photos-grid');
  if (!grid) return;
  state = state || loadSafeSpace();
  if (!state.photos.length) {
    grid.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">No photos yet. Add a few that make you feel calm.</p>';
    return;
  }
  grid.innerHTML = state.photos.map(p => `
    <div class="ss-photo">
      <img src="${p.dataUrl}" alt="Comfort photo" />
      <button class="ss-photo-remove" onclick="removeSafeSpacePhoto(${p.id})" title="Remove">✕</button>
    </div>
  `).join('');
}

function removeSafeSpacePhoto(id) {
  const state = loadSafeSpace();
  state.photos = state.photos.filter(p => p.id !== id);
  persistSafeSpace(state);
  renderSafeSpacePhotos(state);
}

/* ---------- Affirmations ---------- */
function addSafeSpaceAffirm() {
  const input = document.getElementById('ss-affirm-input');
  if (!input || !input.value.trim()) return;
  const state = loadSafeSpace();
  state.affirmations.push({ id: Date.now(), text: input.value.trim() });
  persistSafeSpace(state);
  input.value = '';
  renderSafeSpaceAffirms(state);
}

function removeSafeSpaceAffirm(id) {
  const state = loadSafeSpace();
  state.affirmations = state.affirmations.filter(a => a.id !== id);
  persistSafeSpace(state);
  renderSafeSpaceAffirms(state);
}

function renderSafeSpaceAffirms(state) {
  const list = document.getElementById('ss-affirms-list');
  if (!list) return;
  state = state || loadSafeSpace();
  if (!state.affirmations.length) {
    list.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">Add reminders you can reread later.</p>';
    return;
  }
  list.innerHTML = state.affirmations.map(a => `
    <div class="ss-list-item">
      <span>"${escapeSS(a.text)}"</span>
      <button class="ss-remove" onclick="removeSafeSpaceAffirm(${a.id})">✕</button>
    </div>
  `).join('');
}

/* ---------- Coping ---------- */
function addSafeSpaceCope() {
  const input = document.getElementById('ss-cope-input');
  if (!input || !input.value.trim()) return;
  const state = loadSafeSpace();
  state.coping.push({ id: Date.now(), text: input.value.trim() });
  persistSafeSpace(state);
  input.value = '';
  renderSafeSpaceCope(state);
}

function removeSafeSpaceCope(id) {
  const state = loadSafeSpace();
  state.coping = state.coping.filter(c => c.id !== id);
  persistSafeSpace(state);
  renderSafeSpaceCope(state);
}

function renderSafeSpaceCope(state) {
  const list = document.getElementById('ss-cope-list');
  if (!list) return;
  state = state || loadSafeSpace();
  if (!state.coping.length) {
    list.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">The stuff that actually works for you.</p>';
    return;
  }
  list.innerHTML = state.coping.map(c => `
    <div class="ss-list-item">
      <span>✅ ${escapeSS(c.text)}</span>
      <button class="ss-remove" onclick="removeSafeSpaceCope(${c.id})">✕</button>
    </div>
  `).join('');
}

/* ---------- Trusted contacts ---------- */
function addSafeSpaceContact() {
  const name = document.getElementById('ss-contact-name');
  const num = document.getElementById('ss-contact-num');
  if (!name || !num || !name.value.trim()) return;
  const state = loadSafeSpace();
  state.contacts.push({
    id: Date.now(),
    name: name.value.trim(),
    num: num.value.trim()
  });
  persistSafeSpace(state);
  name.value = '';
  num.value = '';
  renderSafeSpaceContacts(state);
}

function removeSafeSpaceContact(id) {
  const state = loadSafeSpace();
  state.contacts = state.contacts.filter(c => c.id !== id);
  persistSafeSpace(state);
  renderSafeSpaceContacts(state);
}

function renderSafeSpaceContacts(state) {
  const list = document.getElementById('ss-contacts-list');
  if (!list) return;
  state = state || loadSafeSpace();
  if (!state.contacts.length) {
    list.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">People you can reach out to.</p>';
    return;
  }
  list.innerHTML = state.contacts.map(c => {
    const digits = (c.num || '').replace(/[^0-9+]/g, '');
    const callable = digits.length >= 5;
    return `
      <div class="ss-list-item">
        <span>
          <strong>${escapeSS(c.name)}</strong>
          ${c.num ? `<br><small style="color:var(--text-muted);">${escapeSS(c.num)}</small>` : ''}
        </span>
        <span style="display:flex; gap:6px;">
          ${callable ? `<a href="tel:${digits}" class="ss-quick-btn">📞</a>` : ''}
          ${callable ? `<a href="sms:${digits}" class="ss-quick-btn">💬</a>` : ''}
          <button class="ss-remove" onclick="removeSafeSpaceContact(${c.id})">✕</button>
        </span>
      </div>
    `;
  }).join('');
}

/* ---------- Music player (Spotify embed) ---------- */
function renderSafeSpaceMusic() {
  const input = document.getElementById('ss-music-input');
  const container = document.getElementById('ss-music-embed');
  if (!input || !container) return;

  const val = input.value.trim();
  saveSafeSpace();
  if (!val) {
    container.innerHTML = '';
    return;
  }
  const parsed = (typeof parseSpotifyUrl === 'function') ? parseSpotifyUrl(val) : null;
  if (parsed) {
    container.innerHTML = `<iframe
      style="border-radius:12px; border:0;"
      src="https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=getwell"
      width="100%" height="152" frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"></iframe>`;
  } else {
    container.innerHTML = `<p style="font-size:0.78rem; color:var(--text-muted);">Not a recognizable Spotify link — paste an open.spotify.com URL to embed a player.</p>`;
  }
}

/* ---------- Mini breathing tool ---------- */
let miniBreathActive = false;
let miniBreathTimer = null;
let miniBreathPhase = 0;

function toggleMiniBreath() {
  const orb = document.getElementById('ss-mini-breath');
  if (!orb) return;
  miniBreathActive = !miniBreathActive;
  if (miniBreathActive) {
    miniBreathPhase = 0;
    runMiniBreath();
  } else {
    if (miniBreathTimer) clearTimeout(miniBreathTimer);
    miniBreathTimer = null;
    orb.textContent = 'Ready';
    orb.style.transform = 'scale(1)';
  }
}

function runMiniBreath() {
  const orb = document.getElementById('ss-mini-breath');
  if (!orb || !miniBreathActive) return;
  const labels = ['Breathe in…', 'Hold…', 'Breathe out…', 'Hold…'];
  orb.textContent = labels[miniBreathPhase];
  orb.style.transform = (miniBreathPhase === 0)
    ? 'scale(1.35)'
    : (miniBreathPhase === 2 ? 'scale(0.85)' : orb.style.transform);
  miniBreathTimer = setTimeout(() => {
    miniBreathPhase = (miniBreathPhase + 1) % 4;
    runMiniBreath();
  }, 4000);
}

function escapeSS(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
