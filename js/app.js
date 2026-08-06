/* Main Application Controller for getwell.ai */

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('haven_theme') || 'light';
  setTheme(savedTheme);

  const savedBg = localStorage.getItem('haven_bg') || 'lavender';
  setBackground(savedBg, true);

  initScribbleCanvas();
  if (typeof initSnakeGame === 'function') initSnakeGame();
  loadSafetyPlan();
  loadStreak();
  loadJournalEntry();
  renderMoodChart();
  updateParentScript();
  updateUrgeTimerDisplay();
  if (typeof initChatAssistant === 'function') initChatAssistant();

  // Close theme picker on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('theme-picker-menu');
    const picker = document.querySelector('.theme-picker');
    if (menu && picker && !picker.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  // ESC toggles discreet mode (already in original app)
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

function switchTab(tabId) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'depression') {
    setTimeout(renderMoodChart, 100);
  }
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

  // Mark active swatch
  document.querySelectorAll('.swatch').forEach(s => {
    if (s.getAttribute('data-bg') === bg) s.classList.add('active');
    else s.classList.remove('active');
  });
}
