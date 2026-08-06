/* Virtual Plant — grows with healthy habits, persisted to localStorage. */

const PET_KEY = 'haven_pet_v1';

/* Growth thresholds → stage. Each stage renders a slightly bigger, healthier plant. */
const PET_STAGES = [
  { min: 0,   name: '🌱 Sprout',      label: 'Sprout' },
  { min: 5,   name: '🌿 Seedling',    label: 'Seedling' },
  { min: 15,  name: '🍀 Young Plant', label: 'Young Plant' },
  { min: 30,  name: '🌾 Growing',     label: 'Growing Strong' },
  { min: 55,  name: '🌸 Blooming',    label: 'Blooming' },
  { min: 90,  name: '🌻 Flourishing', label: 'Flourishing' },
  { min: 140, name: '🌳 Thriving',    label: 'Thriving Tree' }
];

const ACTION_XP = {
  mood: 1,
  breath: 1,
  water: 1,
  meditate: 2,
  journal: 2
};

/* Debounce to avoid double-watering when a UI action triggers pet.js twice */
const PET_ACTION_COOLDOWN_MS = 1500;
let petLastActionAt = {};

function loadPet() {
  try {
    return JSON.parse(localStorage.getItem(PET_KEY)) || {
      xp: 0,
      name: 'Sprout',
      lastCareDate: null,
      streak: 0
    };
  } catch (e) {
    return { xp: 0, name: 'Sprout', lastCareDate: null, streak: 0 };
  }
}

function savePet(p) {
  localStorage.setItem(PET_KEY, JSON.stringify(p));
}

function initPet() {
  const p = loadPet();
  updatePetStreak(p);
  savePet(p);
  renderPet(p);

  const nameInput = document.getElementById('pet-name-input');
  if (nameInput && p.name && p.name !== 'Sprout') nameInput.value = p.name;
}

function updatePetStreak(p) {
  const today = new Date().toISOString().split('T')[0];
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split('T')[0];

  if (p.lastCareDate === today) return; // already counted today
  if (p.lastCareDate === yesterday) {
    // streak continues if we care today (handled by waterPlant)
  } else if (p.lastCareDate && p.lastCareDate !== today) {
    p.streak = 0; // gap in care resets streak
  }
}

function waterPlant(actionKey, silent) {
  const now = Date.now();
  if (petLastActionAt[actionKey] && (now - petLastActionAt[actionKey] < PET_ACTION_COOLDOWN_MS)) {
    return;
  }
  petLastActionAt[actionKey] = now;

  const xp = ACTION_XP[actionKey] || 1;
  const p = loadPet();
  const oldStage = getPetStage(p.xp);
  p.xp += xp;

  const today = new Date().toISOString().split('T')[0];
  if (p.lastCareDate !== today) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().split('T')[0];
    if (p.lastCareDate === yesterday) p.streak = (p.streak || 0) + 1;
    else p.streak = 1;
    p.lastCareDate = today;
  }

  savePet(p);
  renderPet(p);

  const newStage = getPetStage(p.xp);
  if (newStage.min > oldStage.min && !silent) {
    showPetLevelUp(newStage);
  }
}

function getPetStage(xp) {
  let stage = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (xp >= s.min) stage = s;
  }
  return stage;
}

function getNextStage(xp) {
  for (const s of PET_STAGES) {
    if (xp < s.min) return s;
  }
  return null;
}

function renderPet(p) {
  const stage = getPetStage(p.xp);
  const next = getNextStage(p.xp);

  const svgEl = document.getElementById('pet-plant');
  if (svgEl) svgEl.innerHTML = buildPlantSVG(stage);

  const tag = document.getElementById('pet-name-tag');
  if (tag) tag.textContent = `${stage.name.split(' ')[0]} ${escapePet(p.name || 'Sprout')}`;

  const level = document.getElementById('pet-level');
  if (level) level.textContent = stage.name;

  const fill = document.getElementById('pet-growth-fill');
  const text = document.getElementById('pet-growth-text');
  if (fill && text) {
    if (next) {
      const start = stage.min;
      const end = next.min;
      const progress = ((p.xp - start) / (end - start)) * 100;
      fill.style.width = Math.max(4, Math.min(100, progress)) + '%';
      text.textContent = `${p.xp - start} / ${end - start} to ${next.label}`;
    } else {
      fill.style.width = '100%';
      text.textContent = `MAX — ${p.xp} XP`;
    }
  }

  const streakEl = document.getElementById('pet-streak');
  if (streakEl) streakEl.textContent = p.streak || 0;
}

function renamePlant() {
  const input = document.getElementById('pet-name-input');
  if (!input || !input.value.trim()) return;
  const p = loadPet();
  p.name = input.value.trim().slice(0, 20);
  savePet(p);
  renderPet(p);
}

function showPetLevelUp(stage) {
  const toast = document.createElement('div');
  toast.className = 'pet-levelup-toast';
  toast.innerHTML = `${stage.name} <br><span>Your plant leveled up!</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

function buildPlantSVG(stage) {
  // Scale grows with stage index
  const idx = PET_STAGES.findIndex(s => s.min === stage.min);
  const scale = 0.55 + idx * 0.09;
  const bloom = idx >= 4;
  const flourish = idx >= 5;
  const tree = idx >= 6;

  const leaves = idx >= 2 ? `
    <ellipse cx="130" cy="${200 - idx * 8}" rx="${18 + idx * 3}" ry="${9 + idx}" fill="#4ade80" transform="rotate(-30 130 ${200 - idx * 8})"/>
    <ellipse cx="170" cy="${210 - idx * 6}" rx="${18 + idx * 3}" ry="${9 + idx}" fill="#22c55e" transform="rotate(30 170 ${210 - idx * 6})"/>
  ` : '';

  const extraLeaves = idx >= 3 ? `
    <ellipse cx="115" cy="${170 - idx * 4}" rx="${16 + idx * 2}" ry="${8 + idx}" fill="#4ade80" transform="rotate(-45 115 ${170 - idx * 4})"/>
    <ellipse cx="185" cy="${180 - idx * 3}" rx="${16 + idx * 2}" ry="${8 + idx}" fill="#22c55e" transform="rotate(45 185 ${180 - idx * 3})"/>
  ` : '';

  const flower = bloom ? `
    <circle cx="150" cy="${125 - idx * 5}" r="12" fill="#fbcfe8"/>
    <circle cx="140" cy="${138 - idx * 5}" r="10" fill="#f9a8d4"/>
    <circle cx="160" cy="${138 - idx * 5}" r="10" fill="#f9a8d4"/>
    <circle cx="145" cy="${115 - idx * 5}" r="10" fill="#fbcfe8"/>
    <circle cx="155" cy="${115 - idx * 5}" r="10" fill="#fbcfe8"/>
    <circle cx="150" cy="${128 - idx * 5}" r="6" fill="#f59e0b"/>
  ` : '';

  const extraBlooms = flourish ? `
    <circle cx="105" cy="145" r="8" fill="#c4b5fd"/>
    <circle cx="195" cy="150" r="8" fill="#fde68a"/>
    <circle cx="120" cy="180" r="7" fill="#fbcfe8"/>
    <circle cx="180" cy="175" r="7" fill="#a7f3d0"/>
  ` : '';

  const treeCanopy = tree ? `
    <circle cx="150" cy="90" r="55" fill="#22c55e" opacity="0.9"/>
    <circle cx="115" cy="105" r="35" fill="#4ade80" opacity="0.9"/>
    <circle cx="185" cy="110" r="35" fill="#16a34a" opacity="0.9"/>
    <circle cx="150" cy="70" r="30" fill="#4ade80" opacity="0.85"/>
  ` : '';

  return `
    <svg viewBox="0 0 300 320" preserveAspectRatio="xMidYMax meet" style="width:100%; max-width:260px;">
      <g transform="translate(0, ${(1 - scale) * 60}) scale(${scale}) translate(0, ${(1 - scale) * -20})">
        <!-- Pot -->
        <path d="M110,285 L190,285 L180,320 L120,320 Z" fill="#c2410c"/>
        <ellipse cx="150" cy="285" rx="40" ry="6" fill="#9a3412"/>
        <!-- Soil -->
        <ellipse cx="150" cy="285" rx="36" ry="4" fill="#78350f"/>
        <!-- Stem -->
        <rect x="147" y="${200 - idx * 15}" width="6" height="${85 + idx * 15}" fill="#16a34a" rx="3"/>
        ${leaves}
        ${extraLeaves}
        ${treeCanopy}
        ${flower}
        ${extraBlooms}
      </g>
    </svg>
  `;
}

function escapePet(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
