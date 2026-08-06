/* Time Capsule — a letter from future you about a current stressor.
   Fully offline: generates a warm, context-aware letter using pattern matching. */

const CAPSULE_KEY = 'haven_capsule_letters_v1';

/* Categories with tailored future-perspective openers and encouragements. */
const CAPSULE_THEMES = [
  {
    key: 'school',
    keywords: ['test', 'exam', 'final', 'midterm', 'quiz', 'grade', 'gpa', 'homework', 'essay', 'project', 'ap', 'class', 'teacher', 'school', 'assignment'],
    reframes: [
      "I know it feels like this grade is your whole future — I promise it isn't. I don't even remember what score I got. What stuck with me was learning I could push through hard weeks.",
      "That test that felt life-or-death? It became one line in a transcript nobody ever asked to see. But the way you handled the pressure — the studying anyway, the crying and continuing — that shaped how I handle grown-up stress now.",
      "You wanted a perfect grade. I ended up somewhere better: I learned how to be okay with a B and still like myself."
    ]
  },
  {
    key: 'family',
    keywords: ['mom', 'dad', 'parents', 'family', 'sister', 'brother', 'sibling', 'yelling', 'strict', 'grounded', 'divorce', 'stepdad', 'stepmom'],
    reframes: [
      "The fight you're having with them right now becomes something you both barely mention later. People soften, or you build a life that has room for them at the size they can handle. Both are okay.",
      "You feel like they'll never understand. Some of them will surprise you. Some won't — and you'll find chosen family who do.",
      "Loving them and needing space from them was never the contradiction they told you it was. You figured that out. It saved you."
    ]
  },
  {
    key: 'friends',
    keywords: ['friend', 'friends', 'drama', 'left out', 'clique', 'popular', 'ghosted', 'group chat', 'lonely', 'alone'],
    reframes: [
      "The friend group you're panicking about doesn't stay a group for long — high school scatters. The people who become your real people don't all come from that group.",
      "You'll look back and realize almost nobody who was cool in high school stayed cool. The kind, weird, thoughtful you? That's what actually ages well.",
      "The loneliness you're feeling right now leads you to find one really good person later. It's worth the wait."
    ]
  },
  {
    key: 'breakup',
    keywords: ['breakup', 'broke up', 'ex', 'dumped', 'heartbreak', 'boyfriend', 'girlfriend', 'crush', 'rejected'],
    reframes: [
      "I know the whole world feels colorless right now. It's not. You just can't see color yet. In three months it comes back. In a year, you'll be surprised how much lighter you feel.",
      "You wondered if you'd ever love or be loved like that again. Yes. And better — because now you know what actually matters to you.",
      "The pain you're feeling isn't wasted. It taught me what to look for and what not to accept. Every good relationship I have now built on that."
    ]
  },
  {
    key: 'body',
    keywords: ['fat', 'ugly', 'body', 'weight', 'skin', 'acne', 'appearance', 'hate my body'],
    reframes: [
      "The body you're at war with right now becomes the body that carries you through hikes, hugs, cold mornings, first jobs, dancing. You stop being at war with it. That peace was possible all along.",
      "I remember hating so many things about how I looked. I couldn't tell you what most of them were now. You outgrow the cruelty you have for yourself — mostly.",
      "That perfect version you were chasing wasn't real. The version of you people actually love is already here."
    ]
  },
  {
    key: 'substance',
    keywords: ['vape', 'weed', 'drink', 'drunk', 'alcohol', 'nicotine', 'quit', 'cravings', 'addicted', 'pills'],
    reframes: [
      "Every time you didn't use, even when it was hard, added up. You couldn't feel it in the moment. You can feel it now — like clean lungs and a clear head.",
      "The cravings that felt endless were actually short. 15 minutes each. You beat a lot of 15-minute waves, and it changed the shape of your whole life.",
      "You worried you'd feel like this forever. You didn't. It got quieter. It's really quiet now."
    ]
  },
  {
    key: 'future',
    keywords: ['future', 'career', 'college', 'university', 'major', 'purpose', 'lost', "don't know", 'what am i', 'what to do'],
    reframes: [
      "You were panicking about not knowing what you wanted. Turns out nobody your age actually knew — the confident ones were just performing. I figured it out by trying things I was curious about.",
      "The path I took was NOT the one I was planning at your age. It's better than what you're imagining because it's actually mine.",
      "You'll take a job or major that feels like a mistake, and it will teach you what you actually want. Nothing was wasted."
    ]
  },
  {
    key: 'stress',
    keywords: ['stress', 'overwhelmed', 'burnout', 'exhausted', 'too much', 'drowning', 'anxious', 'anxiety', 'panic'],
    reframes: [
      "The week you're inside right now blurs into a hard month, and then a story. You survive every 'I can't get through this' moment ahead of you. Every single one.",
      "Your nervous system is loud right now for a reason — you're carrying a lot at once. You learn to put pieces down. Not all at once. But you learn.",
      "You'll look back and be amazed at how much you were holding while barely sleeping. Give yourself credit now, please. I do."
    ]
  }
];

const CAPSULE_GENERIC_REFRAMES = [
  "You survive this. That's the biggest thing I want you to hear. And not just barely — you become someone who's proud of how they handled it.",
  "This thing you're stressed about? It doesn't turn out how you think it will. It ends up smaller than you feared, and you end up bigger than you knew.",
  "I know none of the 'it gets better' stuff feels true from where you are. Just borrow a little belief from me for tonight. I've already lived past this."
];

const TIMEFRAME_LABELS = {
  '1w': 'a week',
  '1m': 'a month',
  '6m': 'six months',
  '1y': 'a year',
  '5y': 'five years'
};

function initTimeCapsule() {
  renderSavedCapsules();
}

function generateTimeCapsule() {
  const input = document.getElementById('capsule-worry-input');
  const timeframeEl = document.getElementById('capsule-timeframe');
  const card = document.getElementById('capsule-letter-card');
  const body = document.getElementById('capsule-letter-body');
  if (!input || !body) return;

  const worry = input.value.trim();
  if (!worry) {
    input.focus();
    return;
  }

  const timeframe = timeframeEl ? timeframeEl.value : '6m';
  const letter = composeLetter(worry, timeframe);

  body.innerHTML = letter;
  if (card) card.style.display = 'block';

  // Reward pet — journaling counts
  if (typeof waterPlant === 'function') waterPlant('journal', true);

  setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function composeLetter(worry, timeframeKey) {
  const themes = detectThemes(worry);
  const timeLabel = TIMEFRAME_LABELS[timeframeKey] || 'a while';

  const reframes = themes.length
    ? themes.flatMap(t => t.reframes)
    : CAPSULE_GENERIC_REFRAMES;

  // Pick 2 distinct reframes
  const shuffled = [...reframes].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 2);

  const dateStamp = futureDateFor(timeframeKey);

  const escaped = escapeCap(worry);

  return `
    <div class="capsule-letter-inner">
      <div class="capsule-letter-header">
        <span>📮 From: Future You</span>
        <span>📅 ${dateStamp}</span>
      </div>
      <p class="capsule-hey">Hey — it's me. Us. From ${timeLabel} from now.</p>
      <blockquote class="capsule-quote">"${escaped}"</blockquote>
      <p>I remember writing this. I remember exactly the tight feeling in your chest right now.</p>
      ${chosen.map(c => `<p>${escapeCap(c)}</p>`).join('')}
      <p>Please be gentle with yourself tonight. Drink some water. Text one person who makes you feel a little less alone. Sleep if you can.</p>
      <p class="capsule-sign">— You, but a little older 🌸</p>
    </div>
  `;
}

function detectThemes(text) {
  const lower = text.toLowerCase();
  const matches = [];
  CAPSULE_THEMES.forEach(theme => {
    for (const k of theme.keywords) {
      if (lower.includes(k)) { matches.push(theme); break; }
    }
  });
  return matches;
}

function futureDateFor(key) {
  const d = new Date();
  const add = { '1w': 7, '1m': 30, '6m': 183, '1y': 365, '5y': 365 * 5 };
  d.setDate(d.getDate() + (add[key] || 183));
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function saveTimeCapsule() {
  const input = document.getElementById('capsule-worry-input');
  const body = document.getElementById('capsule-letter-body');
  const tf = document.getElementById('capsule-timeframe');
  if (!input || !body || !body.innerHTML.trim()) return;

  const list = loadCapsules();
  list.unshift({
    id: Date.now(),
    worry: input.value.trim(),
    timeframe: tf ? tf.value : '6m',
    letter: body.innerHTML,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem(CAPSULE_KEY, JSON.stringify(list.slice(0, 20)));
  renderSavedCapsules();
  alert('💾 Letter saved. Open it anytime.');
}

function loadCapsules() {
  try {
    return JSON.parse(localStorage.getItem(CAPSULE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function renderSavedCapsules() {
  const container = document.getElementById('capsule-saved-list');
  if (!container) return;
  const list = loadCapsules();

  if (!list.length) {
    container.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">No saved letters yet. Save one to reread later.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="capsule-saved-item">
      <div>
        <strong>${escapeCap(item.worry.slice(0, 80))}${item.worry.length > 80 ? '…' : ''}</strong>
        <p style="font-size:0.78rem; color:var(--text-muted);">Saved ${new Date(item.savedAt).toLocaleDateString()}</p>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn-secondary" style="padding:5px 12px; font-size:0.78rem;" onclick="reopenCapsule(${item.id})">📖 Reopen</button>
        <button class="btn-secondary" style="padding:5px 12px; font-size:0.78rem;" onclick="deleteCapsule(${item.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function reopenCapsule(id) {
  const list = loadCapsules();
  const item = list.find(c => c.id === id);
  if (!item) return;
  const body = document.getElementById('capsule-letter-body');
  const card = document.getElementById('capsule-letter-card');
  if (body) body.innerHTML = item.letter;
  if (card) card.style.display = 'block';
  const worryInput = document.getElementById('capsule-worry-input');
  if (worryInput) worryInput.value = item.worry;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteCapsule(id) {
  const list = loadCapsules().filter(c => c.id !== id);
  localStorage.setItem(CAPSULE_KEY, JSON.stringify(list));
  renderSavedCapsules();
}

function escapeCap(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
