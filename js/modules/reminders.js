/* Wellness Reminders — browser notifications for water, meditation, breath, check-ins.
   State persists in localStorage. Timers only run while the tab is open. */

const REMINDER_KEY = 'haven_reminders_v1';

const REMINDER_CONFIG = {
  water: {
    title: '💧 Hydration Nudge',
    bodies: [
      'Time for a sip of water. Your brain will thank you.',
      'Quick water break — even a few sips counts.',
      'Hydration check! Grab your bottle.'
    ]
  },
  meditate: {
    title: '🧘 Meditation Break',
    bodies: [
      'Try 2 minutes of stillness — eyes closed, slow breaths.',
      'Meditation reminder: pause, notice your breath, then keep going.',
      'A tiny mindfulness break — just 60 seconds counts.'
    ]
  },
  breath: {
    title: '🌬️ Box Breath Reminder',
    bodies: [
      'One round of 4-4-4-4 box breath. Reset your nervous system.',
      'Deep breath in for 4, hold, out for 4, hold. Repeat 4x.',
      'Give yourself 30 seconds to breathe.'
    ]
  },
  checkin: {
    title: '😌 Feelings Check-In',
    bodies: [
      'How are you actually feeling right now? Tap to log it.',
      'Mood check! Take 5 seconds to notice how you feel.',
      'Anything shifted in the last few hours? Log it.'
    ]
  }
};

let reminderTimers = {};

function loadReminderState() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveReminderState(state) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(state));
}

function initReminders() {
  const state = loadReminderState();
  Object.keys(REMINDER_CONFIG).forEach(key => {
    const s = state[key] || { on: false, interval: null };
    const onEl = document.getElementById(`rem-${key}-on`);
    const intEl = document.getElementById(`rem-${key}-interval`);
    if (onEl) onEl.checked = !!s.on;
    if (intEl && s.interval) intEl.value = String(s.interval);
    if (s.on) scheduleReminder(key);
  });
  updateNotifPermStatus();
}

function saveReminders() {
  const state = {};
  Object.keys(REMINDER_CONFIG).forEach(key => {
    const onEl = document.getElementById(`rem-${key}-on`);
    const intEl = document.getElementById(`rem-${key}-interval`);
    state[key] = {
      on: onEl ? onEl.checked : false,
      interval: intEl ? parseInt(intEl.value, 10) : null
    };
  });
  saveReminderState(state);
  // Restart any active timers with new intervals
  Object.keys(REMINDER_CONFIG).forEach(key => {
    if (state[key].on) scheduleReminder(key);
    else clearReminder(key);
  });
}

function toggleReminder(key) {
  const onEl = document.getElementById(`rem-${key}-on`);
  if (!onEl) return;

  if (onEl.checked) {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission().then(perm => {
        if (perm !== 'granted') {
          onEl.checked = false;
        }
        saveReminders();
        updateNotifPermStatus();
      });
      return;
    }
    scheduleReminder(key);
  } else {
    clearReminder(key);
  }
  saveReminders();
}

function scheduleReminder(key) {
  clearReminder(key);
  const intEl = document.getElementById(`rem-${key}-interval`);
  const minutes = intEl ? parseInt(intEl.value, 10) : 60;
  const ms = minutes * 60 * 1000;
  reminderTimers[key] = setInterval(() => {
    fireReminder(key);
  }, ms);
}

function clearReminder(key) {
  if (reminderTimers[key]) {
    clearInterval(reminderTimers[key]);
    delete reminderTimers[key];
  }
}

function fireReminder(key) {
  const cfg = REMINDER_CONFIG[key];
  if (!cfg) return;
  const body = cfg.bodies[Math.floor(Math.random() * cfg.bodies.length)];

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(cfg.title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>',
        silent: false
      });
    } catch (e) {
      // Some browsers reject constructing Notification from service-worker-less pages
      showInPageToast(cfg.title, body);
    }
  } else {
    showInPageToast(cfg.title, body);
  }
}

function showInPageToast(title, body) {
  const toast = document.createElement('div');
  toast.className = 'reminder-toast';
  toast.innerHTML = `<strong>${title}</strong><br><span>${body}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade');
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}

function requestNotifPermission() {
  if (typeof Notification === 'undefined') {
    alert('Your browser does not support notifications. In-page reminder toasts will still work.');
    updateNotifPermStatus();
    return;
  }
  Notification.requestPermission().then(() => updateNotifPermStatus());
}

function updateNotifPermStatus() {
  const el = document.getElementById('notif-perm-status');
  if (!el) return;
  if (typeof Notification === 'undefined') {
    el.textContent = '⚠️ Not supported — in-page toasts only.';
    el.style.color = 'var(--accent-yellow-dark)';
    return;
  }
  if (Notification.permission === 'granted') {
    el.textContent = '✅ Enabled';
    el.style.color = 'var(--accent-teal)';
  } else if (Notification.permission === 'denied') {
    el.textContent = '❌ Blocked — check browser settings.';
    el.style.color = 'var(--accent-rose)';
  } else {
    el.textContent = '⏳ Not enabled yet';
    el.style.color = 'var(--text-muted)';
  }
}
