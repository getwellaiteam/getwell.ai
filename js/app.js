/* Main Application Controller for getwell.ai */

/* Which sub-tabs belong to which top-level sidebar group */
const TAB_GROUPS = {
  home:      ['dashboard'],
  assistant: ['journal', 'capsule'],
  toolkits:  ['anxiety', 'depression', 'selfharm'],
  myspace:   ['safespace', 'pet', 'reminders']
};

/* Sub-tab display labels (icon + label). Used by the inner tab strip. */
const TAB_LABELS = {
  dashboard: { icon: '🏠', label: 'Home' },
  journal:   { icon: '💬', label: 'Chat & Journal' },
  capsule:   { icon: '⏳', label: 'Time Capsule' },
  anxiety:   { icon: '🌬️', label: 'Anxiety & Panic' },
  depression:{ icon: '☀️', label: 'Depression & Energy' },
  selfharm:  { icon: '🛡️', label: 'Safety Toolkit' },
  safespace: { icon: '🏡', label: 'Safe Space' },
  pet:       { icon: '🌱', label: 'Virtual Plant' },
  reminders: { icon: '🔔', label: 'Reminders' }
};

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('haven_theme') || 'light';
  setTheme(savedTheme);

  const savedBg = localStorage.getItem('haven_bg') || 'lavender';
  setBackground(savedBg, true);

  initScribbleCanvas();
  if (typeof initSnakeGame === 'function') initSnakeGame();
  loadSafetyPlan();
  loadJournalEntry();
  renderMoodChart();
  updateUrgeTimerDisplay();
  if (typeof startWaveAnimation === 'function') startWaveAnimation();
  if (typeof initChatAssistant === 'function') initChatAssistant();
  if (typeof initReminders === 'function') initReminders();
  if (typeof initPet === 'function') initPet();
  if (typeof initTimeCapsule === 'function') initTimeCapsule();
  if (typeof initSafeSpace === 'function') initSafeSpace();
  if (typeof renderMoodInsights === 'function') renderMoodInsights();

  // Render initial sub-nav for the default (dashboard) tab
  renderSubNav('home', 'dashboard');

  // Close theme picker on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('theme-picker-menu');
    const picker = document.querySelector('.theme-picker');
    if (menu && picker && !picker.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const spot = document.getElementById('spotify-modal');
      if (spot && spot.classList.contains('active')) {
        spot.classList.remove('active');
      }
    }
  });

  console.log("getwell.ai initialized.");
});

function getTabGroup(tabId) {
  for (const [group, tabs] of Object.entries(TAB_GROUPS)) {
    if (tabs.includes(tabId)) return group;
  }
  return 'home';
}

function switchTab(tabId) {
  const group = getTabGroup(tabId);

  // Highlight the correct sidebar group button
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-group') === group);
  });

  // Show the matching pane, hide the rest
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  renderSubNav(group, tabId);

  // Post-navigation hooks
  if (tabId === 'depression') {
    setTimeout(renderMoodChart, 100);
  }
  if (tabId === 'dashboard' && typeof renderMoodInsights === 'function') {
    setTimeout(renderMoodInsights, 100);
  }
  if (tabId === 'pet' && typeof initPet === 'function') {
    setTimeout(initPet, 50);
  }
  if (tabId === 'capsule' && typeof renderSavedCapsules === 'function') {
    setTimeout(renderSavedCapsules, 50);
  }
}

function renderSubNav(group, activeTab) {
  const container = document.getElementById('sub-nav');
  if (!container) return;
  const tabs = TAB_GROUPS[group] || [];

  // No inner strip when the group has only one section (Home)
  if (tabs.length <= 1) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = tabs.map(t => {
    const meta = TAB_LABELS[t] || { icon: '', label: t };
    return `
      <button class="sub-nav-item ${t === activeTab ? 'active' : ''}" onclick="switchTab('${t}')">
        <span class="sub-nav-icon">${meta.icon}</span>
        <span>${meta.label}</span>
      </button>
    `;
  }).join('');
}

function selectMood(moodKey, label) {
  const btns = document.querySelectorAll('.mood-btn');
  btns.forEach(btn => btn.classList.remove('selected'));

  const feedback = document.getElementById('mood-feedback');
  if (feedback) {
    feedback.textContent = `Logged: ${label}. Naming what you feel is real work. 🌟`;
  }

  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`haven_mood_${today}`, moodKey);
  if (typeof renderMoodChart === 'function') renderMoodChart();
  if (typeof renderMoodInsights === 'function') renderMoodInsights();
  if (typeof waterPlant === 'function') waterPlant('mood', true);
}

function submitCustomMood() {
  const input = document.getElementById('custom-mood-input');
  if (!input || !input.value.trim()) return;
  const val = input.value.trim().slice(0, 60);
  const feedback = document.getElementById('mood-feedback');
  if (feedback) {
    feedback.textContent = `Logged: "${val}". That takes self-awareness. 🌸`;
  }
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`haven_mood_${today}`, `custom:${val}`);
  input.value = '';

  const btns = document.querySelectorAll('.mood-btn');
  btns.forEach(btn => btn.classList.remove('selected'));
  if (typeof renderMoodChart === 'function') renderMoodChart();
  if (typeof renderMoodInsights === 'function') renderMoodInsights();
  if (typeof waterPlant === 'function') waterPlant('mood', true);
}

function handleCustomMoodKey(e) {
  if (e.key === 'Enter') submitCustomMood();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('haven_theme', theme);

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

function toggleThemePicker(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('theme-picker-menu');
  if (menu) menu.classList.toggle('open');
}

function setBackground(bg, skipPersist) {
  document.body.setAttribute('data-bg', bg);
  if (!skipPersist) localStorage.setItem('haven_bg', bg);

  document.querySelectorAll('.swatch').forEach(s => {
    if (s.getAttribute('data-bg') === bg) s.classList.add('active');
    else s.classList.remove('active');
  });
}
