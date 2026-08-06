/* Anxiety & Panic Module */

let breathingInterval = null;
let breathingState = 'idle';
let breathStep = 0;

const scrapScenarios = [
  {
    tag: "Grades",
    thought: "I bombed that test — my whole future is ruined.",
    reframe: "One test does not define my intelligence or where I'm headed. I can talk to my teacher, learn from it, and try again next time."
  },
  {
    tag: "Social",
    thought: "Everyone at school is judging how I look and act.",
    reframe: "Most people are busy worrying about themselves. I'm allowed to take up space and just be me."
  },
  {
    tag: "Panic",
    thought: "My heart is racing — I feel like I'm losing control.",
    reframe: "Panic is a wave. It peaks and passes. My body knows how to breathe and settle. This will not last forever."
  },
  {
    tag: "Perfectionism",
    thought: "If I'm not perfect at everything, I'm a failure.",
    reframe: "Perfection isn't real. Consistent effort and rest matter way more than a flawless track record."
  },
  {
    tag: "Family",
    thought: "My parents will be so disappointed if I don't get straight A's.",
    reframe: "My worth isn't a GPA. I can be honest about my stress and still be loved."
  },
  {
    tag: "College",
    thought: "If I don't get into a top college my life is over.",
    reframe: "There are thousands of paths to a good life. My future depends on choices ahead of me, not one acceptance letter."
  },
  {
    tag: "Friendship",
    thought: "My friends didn't text back — they must hate me.",
    reframe: "People get busy, tired, and distracted. One quiet day doesn't mean the friendship is broken."
  },
  {
    tag: "Body Image",
    thought: "I hate how I look — everyone must notice.",
    reframe: "My body carries me through hard days. I don't have to love it perfectly to treat it kindly."
  },
  {
    tag: "Public Speaking",
    thought: "I'll freeze up in front of the whole class — it'll be humiliating.",
    reframe: "Everyone gets nervous. Even if I stumble, people are rooting for me, and it'll be over in minutes."
  },
  {
    tag: "Sports",
    thought: "If I lose this game the coach will bench me forever.",
    reframe: "Every athlete has bad games. What matters is how I show up next practice — not one play."
  },
  {
    tag: "Sleep",
    thought: "I can't sleep — tomorrow is going to be a disaster.",
    reframe: "Even rest without sleep helps my body. I've had tough days before and gotten through them."
  },
  {
    tag: "Overthinking",
    thought: "I said something dumb hours ago and can't stop replaying it.",
    reframe: "Nobody is thinking about it as much as I am. This memory will fade — I can let this loop go."
  }
];

function renderScrapCards(list) {
  const grid = document.getElementById('scrap-grid');
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'scrap-card';
    card.innerHTML = `
      <div class="scrap-top">
        <span class="scrap-tag">${escapeScrap(item.tag)}</span>
        <div class="scrap-label">⚡ Common Anxious Thought</div>
        <p class="scrap-thought">"${escapeScrap(item.thought)}"</p>
      </div>
      <div class="scrap-bottom">
        <div class="scrap-label-good">🌱 Healthier Reframe</div>
        <p class="scrap-reframe">"${escapeScrap(item.reframe)}"</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function shuffleScrapCards() {
  const shuffled = [...scrapScenarios].sort(() => Math.random() - 0.5);
  renderScrapCards(shuffled.slice(0, 6));
}

function escapeScrap(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Auto-render on load
document.addEventListener('DOMContentLoaded', () => {
  shuffleScrapCards();
});

/* ---------- Box Breathing (light-green circle, grow/shrink/pause) ---------- */

function toggleBreathing() {
  const btn = document.getElementById('start-breath-btn');
  if (breathingState !== 'idle') {
    resetBreathing();
    return;
  }
  if (btn) btn.textContent = '⏹️ Stop Guided Breath';
  breathStep = 0;
  runBreathingCycle();
  breathingInterval = setInterval(runBreathingCycle, 4000);
}

function runBreathingCycle() {
  const circle = document.getElementById('breath-circle');
  const text = document.getElementById('breath-text');
  if (!circle || !text) return;

  if (breathStep === 0) {
    // Inhale — circle grows
    breathingState = 'inhale';
    circle.className = 'breathing-circle inhale';
    text.textContent = 'Inhale... (4s)';
    playGentleTone(320, 3.6);
    breathStep = 1;
  } else if (breathStep === 1) {
    // Hold full — freeze large
    breathingState = 'hold-full';
    circle.className = 'breathing-circle hold-full';
    text.textContent = 'Hold... (4s)';
    breathStep = 2;
  } else if (breathStep === 2) {
    // Exhale — circle shrinks
    breathingState = 'exhale';
    circle.className = 'breathing-circle exhale';
    text.textContent = 'Exhale slowly... (4s)';
    playGentleTone(220, 3.6);
    breathStep = 3;
  } else {
    // Hold empty — freeze small
    breathingState = 'hold-empty';
    circle.className = 'breathing-circle hold-empty';
    text.textContent = 'Hold... (4s)';
    breathStep = 0;
  }
}

function resetBreathing() {
  if (breathingInterval) clearInterval(breathingInterval);
  breathingInterval = null;
  breathingState = 'idle';
  breathStep = 0;

  const circle = document.getElementById('breath-circle');
  const text = document.getElementById('breath-text');
  const btn = document.getElementById('start-breath-btn');

  if (circle) circle.className = 'breathing-circle';
  if (text) text.textContent = 'Ready';
  if (btn) btn.textContent = '▶️ Start Guided Breath';
}

function playGentleTone(freq, duration) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* muted */ }
}
