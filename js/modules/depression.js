/* Depression & Energy Module */

const affirmations = [
  "You are allowed to rest without feeling guilty. Taking a break is not giving up.",
  "Your existence is valuable even on the days you accomplish nothing.",
  "High school is a chapter, not your whole life story. Better days are ahead.",
  "Be gentle with yourself. You are navigating heavy things with courage.",
  "Small progress is still progress. Hydrating and getting up counts.",
  "You do not have to earn love or respect through constant academic performance.",
  "The version of you that survived last month is proud of the you today.",
  "Feelings are visitors — they don't get to move in permanently."
];

const congratsCopy = [
  "Huge win. That counted. 🎉",
  "That's you fighting back — noticed and celebrated. ✨",
  "Small steps stack. You just moved forward. 🌱",
  "That took effort. Proud of you. 💛",
  "Boom — one more win in the bank. 🏆",
  "Momentum unlocked. Keep this energy. ⚡",
  "You showed up for yourself. That's everything. 🌸",
  "That deserves a mini party. 🎊",
  "Legend behavior. Seriously. 👑",
  "Depression tried it — you did the thing anyway. 💪"
];

const athleteQuotes = [
  { quote: "You have to be able to accept failure to get better.", author: "LeBron James" },
  { quote: "I've missed more than 9,000 shots. I've lost almost 300 games. And that is why I succeed.", author: "Michael Jordan" },
  { quote: "I have no fear of failure. I really don't.", author: "Kobe Bryant" },
  { quote: "You gotta be able to smile through the bull. That's a skill nobody teaches you.", author: "Serena Williams" },
  { quote: "It's not whether you get knocked down; it's whether you get up.", author: "Vince Lombardi" },
  { quote: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { quote: "The more difficult the victory, the greater the happiness in winning.", author: "Pelé" },
  { quote: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { quote: "Pressure is a privilege — it only comes to those who earn it.", author: "Billie Jean King" },
  { quote: "Don't be afraid to fail. Be afraid not to try.", author: "Michael Jordan" },
  { quote: "The mind is the limit. As long as the mind can envision it, you can do it.", author: "Arnold Schwarzenegger" },
  { quote: "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.", author: "Rocky Balboa" },
  { quote: "The best way out is always through.", author: "Robert Frost (favorite of Kobe Bryant)" },
  { quote: "Great things come from hard work and perseverance. No excuses.", author: "Kobe Bryant" },
  { quote: "I always felt that my greatest asset was not my physical ability, it was my mental ability.", author: "Bruce Jenner" },
  { quote: "You have to expect things of yourself before you can do them.", author: "Michael Jordan" },
  { quote: "I never lose. I either win or I learn.", author: "Nelson Mandela (Serena's favorite)" },
  { quote: "Talent wins games, but teamwork and intelligence win championships.", author: "Michael Jordan" }
];

const occupiedTips = {
  movies: [
    { emoji: "🎬", text: "Put on a comfort movie you've seen a million times — no thinking, just vibes." },
    { emoji: "📺", text: "Binge one episode of your favorite sitcom (Community, The Office, Brooklyn 99)." },
    { emoji: "🍿", text: "Rewatch a Studio Ghibli film — Spirited Away, Ponyo, or Kiki's Delivery Service." },
    { emoji: "🎞️", text: "Watch a nostalgic movie from when you were a kid." },
    { emoji: "🎥", text: "Try a short documentary — 20-40 min is easier when you're low energy." }
  ],
  games: [
    { emoji: "🎮", text: "Pick up a cozy game — Stardew Valley, Animal Crossing, or Minecraft creative mode." },
    { emoji: "🧩", text: "Solve a puzzle: Wordle, Connections, or a jigsaw on your phone." },
    { emoji: "📱", text: "Play a chill mobile game for 15 min — Tetris, Two Dots, Alto's Odyssey." },
    { emoji: "🕹️", text: "Load up a game you've beaten before — no pressure, just familiar joy." },
    { emoji: "♟️", text: "Play 3 quick chess games online — Chess.com has 3-min blitz." }
  ],
  creative: [
    { emoji: "🎨", text: "Doodle for 5 minutes with no goal — it doesn't have to be good." },
    { emoji: "🖊️", text: "Write in your journal (Venting & AI tab) — bullet points count." },
    { emoji: "📸", text: "Take 10 photos of random things in your room." },
    { emoji: "🎧", text: "Make a playlist for a made-up moment (e.g., 'walking through a rainy city')." },
    { emoji: "🧵", text: "Try origami — one YouTube tutorial, one folded thing." },
    { emoji: "🎂", text: "Bake something simple — box brownies, mug cake, cookies." }
  ],
  active: [
    { emoji: "🚶", text: "Walk one block outside — even at night. Fresh air hits different." },
    { emoji: "🧘", text: "Do 5 min of stretching to a chill playlist." },
    { emoji: "💃", text: "Dance out one full song in your room. Ridiculous is the goal." },
    { emoji: "🏀", text: "Shoot hoops or kick a ball outside for 10 min." },
    { emoji: "🚴", text: "Ride a bike around the block or skate for 15 min." },
    { emoji: "🧹", text: "Clean one small thing — a drawer, your desk. Movement + reward." }
  ],
  social: [
    { emoji: "💬", text: "Text one friend a meme or 'you good?' — no pressure to talk long." },
    { emoji: "📞", text: "FaceTime a family member you haven't talked to in a while." },
    { emoji: "🎮", text: "Hop on a game with a friend — Fortnite, Roblox, Discord VC." },
    { emoji: "🍽️", text: "Eat a meal at the table with family — even without much talking." },
    { emoji: "🐕", text: "Play with a pet — yours or a neighbor's." }
  ],
  random: [
    { emoji: "🍵", text: "Make a warm drink slowly — tea, hot chocolate, matcha." },
    { emoji: "☕", text: "Try a new coffee/boba spot near you." },
    { emoji: "📚", text: "Read 1 chapter of a book you loved as a kid." },
    { emoji: "🧠", text: "Watch a YouTube video essay on something totally random." },
    { emoji: "🛁", text: "Take a warm shower with the lights dim." },
    { emoji: "🌸", text: "Rearrange one corner of your room." },
    { emoji: "🎤", text: "Sing loudly to one song — car, shower, closet, wherever." },
    { emoji: "🍜", text: "Make a snack you loved when you were 10." }
  ]
};

let currentAthleteIdx = 0;

function toggleMicroWin(checkbox) {
  const item = checkbox.closest('.micro-win-item');
  if (!item) return;
  if (checkbox.checked) {
    item.classList.add('completed', 'pop');
    setTimeout(() => item.classList.remove('pop'), 500);
    burstConfetti(item);
    playPartyPopper();
    showWinToast(item);
  } else {
    item.classList.remove('completed');
  }
}

function addMicroWin() {
  const input = document.getElementById('new-win-input');
  const container = document.getElementById('micro-wins-list');
  if (!input || !container || !input.value.trim()) return;

  const text = input.value.trim();
  const label = document.createElement('label');
  label.className = 'micro-win-item';
  label.innerHTML = `
    <input type="checkbox" onchange="toggleMicroWin(this)">
    <span>${escapeHtml(text)}</span>
  `;
  container.appendChild(label);
  input.value = '';
}

function showWinToast(item) {
  const msg = congratsCopy[Math.floor(Math.random() * congratsCopy.length)];
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#facc15,#f59e0b); color:#1e1b4b;
    padding:14px 24px; border-radius:9999px; font-weight:800;
    box-shadow:0 12px 30px rgba(245,158,11,0.45); z-index:9999;
    font-size:0.95rem; animation:winPop 0.6s cubic-bezier(0.34,1.56,0.64,1);
    max-width:90vw; text-align:center;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 1800);
  setTimeout(() => toast.remove(), 2400);
}

function burstConfetti(anchor) {
  let layer = document.getElementById('confetti-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'confetti-layer';
    document.body.appendChild(layer);
  }
  const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const colors = ['#f59e0b', '#facc15', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e', '#ec4899', '#4ade80'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 180;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + 120; // gravity bias downward
    piece.style.left = originX + 'px';
    piece.style.top = originY + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--dx', dx + 'px');
    piece.style.setProperty('--dy', dy + 'px');
    piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    piece.style.borderRadius = Math.random() < 0.5 ? '2px' : '50%';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (8 + Math.random() * 10) + 'px';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 1700);
  }
}

function playPartyPopper() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Pop: quick noise burst
    const bufSize = ctx.sampleRate * 0.08;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(nGain).connect(ctx.destination);
    noise.start(now);

    // Ascending triumphant arpeggio C-E-G-C
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const t0 = now + 0.05 + i * 0.09;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
    });

    // Sparkle high notes
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1568, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2093, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }, 350);

  } catch (e) { /* muted */ }
}

function generateAffirmation() {
  const elem = document.getElementById('affirmation-text');
  if (!elem) return;
  const randomIndex = Math.floor(Math.random() * affirmations.length);
  elem.textContent = `"${affirmations[randomIndex]}"`;
}

function nextAthleteQuote() {
  currentAthleteIdx = (currentAthleteIdx + 1) % athleteQuotes.length;
  const q = athleteQuotes[currentAthleteIdx];
  const qEl = document.getElementById('athlete-quote');
  const aEl = document.getElementById('athlete-name');
  if (qEl) qEl.textContent = `"${q.quote}"`;
  if (aEl) aEl.textContent = `— ${q.author}`;
}

function showOccupiedTip(category) {
  let pool;
  if (category === 'random') {
    pool = Object.values(occupiedTips).flat();
  } else {
    pool = occupiedTips[category] || occupiedTips.random;
  }
  const t = pool[Math.floor(Math.random() * pool.length)];
  const eEl = document.getElementById('occupied-emoji');
  const tEl = document.getElementById('occupied-tip');
  if (eEl) eEl.textContent = t.emoji;
  if (tEl) tEl.textContent = t.text;
}

/* Maps a logged mood key to a 1(heavy)–5(bright) chart value. */
const MOOD_VALUE_MAP = {
  overwhelmed: 1, anxious: 1.5, exhausted: 1.6, stressed: 2, angry: 2,
  sad: 1.5, lonely: 1.6, okay: 3, calm: 3.9, happy: 4.6, hopeful: 4.3, proud: 4.7
};
const MOOD_EMOJI_MAP = {
  overwhelmed: '😣', anxious: '😰', exhausted: '😮‍💨', stressed: '😩', angry: '😤',
  sad: '😔', lonely: '🥺', okay: '😐', calm: '😌', happy: '😊', hopeful: '✨', proud: '💪'
};
const POSITIVE_WORDS = ['good', 'great', 'happy', 'excited', 'fine', 'ok', 'okay', 'ready', 'hopeful', 'proud', 'calm', 'relieved', 'better', 'chill', 'excited', 'grateful'];
const NEGATIVE_WORDS = ['bad', 'sad', 'tired', 'angry', 'anxious', 'stressed', 'awful', 'terrible', 'exhausted', 'lonely', 'hate', 'worse', 'meh', 'burnt', 'burned', 'down', 'numb'];

function moodEntryToValue(raw) {
  if (!raw) return null;
  if (raw.startsWith('custom:')) {
    const text = raw.slice(7).toLowerCase();
    const pos = POSITIVE_WORDS.some(w => text.includes(w));
    const neg = NEGATIVE_WORDS.some(w => text.includes(w));
    if (pos && !neg) return 4;
    if (neg && !pos) return 1.8;
    return 3; // neutral guess
  }
  return MOOD_VALUE_MAP[raw] !== undefined ? MOOD_VALUE_MAP[raw] : 3;
}

function moodEntryToLabel(raw) {
  if (!raw) return null;
  if (raw.startsWith('custom:')) return raw.slice(7);
  return `${MOOD_EMOJI_MAP[raw] || ''} ${raw}`.trim();
}

function renderMoodChart() {
  const container = document.getElementById('mood-chart-container');
  if (!container) return;

  // Build the last 7 calendar days, oldest -> newest, using local dates.
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const raw = localStorage.getItem(`haven_mood_${key}`);
    const value = moodEntryToValue(raw);
    points.push({ label: dayLabels[d.getDay()], value, rawLabel: moodEntryToLabel(raw) });
  }

  const hasAnyData = points.some(p => p.value !== null);

  if (!hasAnyData) {
    container.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--text-muted); gap:6px;">
        <span style="font-size:1.8rem;">📈</span>
        <p style="font-size:0.86rem; font-weight:700;">No moods logged yet this week.</p>
        <p style="font-size:0.78rem;">Tap an emoji on the Dashboard to start your graph.</p>
      </div>`;
    return;
  }

  const svgWidth = 500;
  const svgHeight = 170;
  const padding = 32;
  const xStep = (svgWidth - padding * 2) / (points.length - 1);
  const yFor = (v) => svgHeight - padding - (v / 5) * (svgHeight - padding * 2);

  // Build separate polyline segments so gaps (no entry that day) don't connect.
  let segments = [];
  let current = [];
  points.forEach((p, i) => {
    const x = padding + i * xStep;
    if (p.value !== null) {
      current.push(`${x},${yFor(p.value)}`);
    } else if (current.length) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) segments.push(current);

  let svgHtml = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" style="overflow:visible;">
      <line x1="${padding}" y1="${padding}" x2="${svgWidth - padding}" y2="${padding}" stroke="rgba(0,0,0,0.06)" stroke-width="1" />
      <line x1="${padding}" y1="${svgHeight/2}" x2="${svgWidth - padding}" y2="${svgHeight/2}" stroke="rgba(0,0,0,0.06)" stroke-width="1" />
      <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="rgba(0,0,0,0.06)" stroke-width="1" />
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </linearGradient>
      </defs>
  `;

  segments.forEach(seg => {
    if (seg.length > 1) {
      const first = seg[0].split(',');
      const last = seg[seg.length - 1].split(',');
      svgHtml += `<polygon points="${first[0]},${svgHeight - padding} ${seg.join(' ')} ${last[0]},${svgHeight - padding}" fill="url(#chartGrad)" />`;
    }
    svgHtml += `<polyline points="${seg.join(' ')}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />`;
  });

  points.forEach((p, index) => {
    const x = padding + index * xStep;
    if (p.value !== null) {
      const y = yFor(p.value);
      svgHtml += `
        <circle cx="${x}" cy="${y}" r="5" fill="#8b5cf6" stroke="#ffffff" stroke-width="2">
          <title>${p.label}: ${escapeHtml(p.rawLabel || '')}</title>
        </circle>
      `;
    } else {
      svgHtml += `<circle cx="${x}" cy="${svgHeight - padding}" r="3" fill="none" stroke="#d1d5db" stroke-width="1.5" />`;
    }
    svgHtml += `<text x="${x}" y="${svgHeight - 8}" fill="#6b7280" font-size="12" text-anchor="middle" font-weight="700">${p.label}</text>`;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
