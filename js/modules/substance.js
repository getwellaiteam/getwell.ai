/* Substance & Drug Support Module */

let streakDays = 0;

const streakMessages = [
  "🎉 One week clean! The first 7 days are legit the hardest — you did it.",
  "🌱 Two weeks! Your body is already recovering. Notice anything different yet?",
  "🌟 3 weeks. Habits reshape around 21 days — you're literally rewiring.",
  "🔥 4 weeks strong! A full month is a MASSIVE deal. Be seriously proud.",
  "💪 5 weeks! You're proving to yourself who you actually are.",
  "🏆 6 weeks — you've outlasted most people who try. Keep going.",
  "✨ 7 weeks! You are BUILT for this. Feel that momentum?",
  "🚀 8 weeks — 2 months! Your future self is fist-pumping.",
  "👑 9 weeks. You are a whole different person than you were 60 days ago.",
  "💎 10 weeks — you're an inspiration whether you know it or not.",
  "🌸 11 weeks. This is who you are now. Not 'trying' — DOING.",
  "🏔️ 12 weeks! A full quarter of a year. Wild. You're a legend.",
  "🎊 Another week! You keep showing up — that IS the win.",
  "🕊️ One more week banked. Small steps, huge journey. Proud of you.",
  "⚡ Another 7 days in the bag. Momentum is real and you're riding it.",
  "🌊 Another week ridden out. The waves get smaller from here."
];

function loadStreak() {
  const saved = localStorage.getItem('haven_substance_streak');
  if (saved !== null) {
    streakDays = parseInt(saved, 10) || 0;
  }
  updateStreakDisplay();
}

function incrementStreak() {
  streakDays++;
  localStorage.setItem('haven_substance_streak', streakDays);
  updateStreakDisplay();

  if (streakDays % 7 === 0 && streakDays > 0) {
    const weekIdx = Math.floor(streakDays / 7) - 1;
    const msg = weekIdx < streakMessages.length
      ? streakMessages[weekIdx]
      : streakMessages[12 + (weekIdx % 4)]; // rotate the generic tail
    showStreakCelebration(msg, streakDays);
  }
}

function showStreakCelebration(msg, days) {
  // Reuse confetti + popper if depression.js is loaded
  const anchor = document.getElementById('streak-days-count');
  if (typeof burstConfetti === 'function') burstConfetti(anchor);
  if (typeof playPartyPopper === 'function') playPartyPopper();

  const banner = document.createElement('div');
  banner.style.cssText = `
    position:fixed; top:80px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#fef3c7,#fde68a); color:#78350f;
    padding:18px 28px; border-radius:20px; font-weight:800;
    box-shadow:0 20px 40px rgba(245,158,11,0.4); z-index:9999;
    font-size:1rem; max-width:90vw; text-align:center;
    border:2px solid #f59e0b; line-height:1.4;
  `;
  banner.innerHTML = `<div style="font-size:1.15rem; margin-bottom:4px;">${days} days!</div>${msg}`;
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.transition = 'opacity 0.4s, transform 0.4s';
    banner.style.opacity = '0';
    banner.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 3500);
  setTimeout(() => banner.remove(), 4000);
}

function resetStreak() {
  if (confirm("Are you sure you want to reset your counter? Remember: Relapses or setbacks are part of the journey. Be kind to yourself.")) {
    streakDays = 0;
    localStorage.setItem('haven_substance_streak', streakDays);
    updateStreakDisplay();
  }
}

function updateStreakDisplay() {
  const elem = document.getElementById('streak-days-count');
  if (elem) {
    elem.textContent = streakDays;
  }
}
