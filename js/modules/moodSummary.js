/* AI Mood Summaries — pattern insights from the user's mood log history.
   Runs entirely on-device from localStorage `haven_mood_YYYY-MM-DD` keys. */

const HEAVY_MOODS = ['overwhelmed', 'anxious', 'stressed', 'sad', 'lonely', 'exhausted', 'angry'];
const LIGHT_MOODS = ['calm', 'happy', 'hopeful', 'proud', 'okay'];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function collectMoodHistory(days) {
  const entries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const raw = localStorage.getItem(`haven_mood_${key}`);
    if (raw) {
      let mood = raw.startsWith('custom:') ? raw.slice(7).toLowerCase() : raw;
      entries.push({ date: key, day: d.getDay(), mood, isCustom: raw.startsWith('custom:') });
    }
  }
  return entries;
}

function classifyMood(mood, isCustom) {
  if (isCustom) {
    if (HEAVY_MOODS.some(m => mood.includes(m))) return 'heavy';
    if (LIGHT_MOODS.some(m => mood.includes(m))) return 'light';
    // Word-based backup
    if (/bad|awful|tired|down|numb|hate|meh|burn/.test(mood)) return 'heavy';
    if (/good|great|fine|chill|better|excited|grateful/.test(mood)) return 'light';
    return 'neutral';
  }
  if (HEAVY_MOODS.includes(mood)) return 'heavy';
  if (LIGHT_MOODS.includes(mood)) return 'light';
  return 'neutral';
}

function computeInsights() {
  const entries = collectMoodHistory(30);
  const insights = [];

  if (entries.length === 0) {
    return [{
      icon: '📝',
      text: "No check-ins logged yet. Tap a mood above to start building your pattern picture."
    }];
  }

  if (entries.length < 3) {
    return [{
      icon: '🌱',
      text: `You've logged ${entries.length} mood${entries.length === 1 ? '' : 's'} so far. A few more and I can start spotting patterns.`
    }];
  }

  // 1) Weekday heaviness ranking
  const byDay = {};
  for (let i = 0; i < 7; i++) byDay[i] = { heavy: 0, light: 0, total: 0 };
  entries.forEach(e => {
    const c = classifyMood(e.mood, e.isCustom);
    byDay[e.day].total++;
    if (c === 'heavy') byDay[e.day].heavy++;
    if (c === 'light') byDay[e.day].light++;
  });

  // Find heaviest weekday (with at least 2 samples)
  let heaviestDay = null;
  let heaviestRatio = 0;
  Object.entries(byDay).forEach(([d, s]) => {
    if (s.total >= 2) {
      const r = s.heavy / s.total;
      if (r > heaviestRatio && r >= 0.5) {
        heaviestRatio = r;
        heaviestDay = parseInt(d, 10);
      }
    }
  });

  if (heaviestDay !== null) {
    insights.push({
      icon: '📅',
      text: `You seem more stressed on <strong>${DAY_NAMES[heaviestDay]}s</strong>. Want to plan a recovery ritual for that day?`
    });
  }

  // Find brightest weekday
  let brightestDay = null;
  let brightestRatio = 0;
  Object.entries(byDay).forEach(([d, s]) => {
    if (s.total >= 2) {
      const r = s.light / s.total;
      if (r > brightestRatio && r >= 0.5) {
        brightestRatio = r;
        brightestDay = parseInt(d, 10);
      }
    }
  });

  if (brightestDay !== null && brightestDay !== heaviestDay) {
    insights.push({
      icon: '✨',
      text: `You tend to feel lighter on <strong>${DAY_NAMES[brightestDay]}s</strong>. Whatever you're doing there — keep doing it.`
    });
  }

  // 2) Trend (last 7 vs prior 7)
  const last7 = entries.filter((e, i) => i < 7);
  const prior7 = entries.filter((e, i) => i >= 7 && i < 14);
  if (last7.length >= 3 && prior7.length >= 3) {
    const heavy7 = last7.filter(e => classifyMood(e.mood, e.isCustom) === 'heavy').length / last7.length;
    const heavyPrev = prior7.filter(e => classifyMood(e.mood, e.isCustom) === 'heavy').length / prior7.length;
    if (heavy7 > heavyPrev + 0.2) {
      insights.push({
        icon: '📈',
        text: "This week has been noticeably harder than last week. Extra kindness with yourself, please."
      });
    } else if (heavyPrev > heavy7 + 0.2) {
      insights.push({
        icon: '📉',
        text: "This week's actually been lighter than last. That took work — noticed and counted."
      });
    }
  }

  // 3) Streak of check-ins
  const streak = countCheckinStreak();
  if (streak >= 3) {
    insights.push({
      icon: '🔥',
      text: `You've checked in <strong>${streak} days in a row</strong>. Consistency at this level is genuinely a skill.`
    });
  }

  // 4) Most common mood
  const moodCounts = {};
  entries.forEach(e => {
    const k = e.isCustom ? `custom` : e.mood;
    moodCounts[k] = (moodCounts[k] || 0) + 1;
  });
  const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3 && top[0] !== 'custom') {
    const displayMood = top[0];
    insights.push({
      icon: '🔎',
      text: `"${escapeMs(displayMood)}" has come up ${top[1]} times recently. Worth noticing that pattern.`
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: '🌤️',
      text: "Your moods have been pretty mixed lately — no strong pattern yet. Keep logging and I'll spot more."
    });
  }

  return insights;
}

function countCheckinStreak() {
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (localStorage.getItem(`haven_mood_${key}`)) {
      streak++;
    } else if (i > 0) {
      break; // gap ends streak; today missing is okay
    }
  }
  return streak;
}

function renderMoodInsights() {
  const container = document.getElementById('mood-insights-list');
  if (!container) return;
  const insights = computeInsights();
  container.innerHTML = insights.map(ins => `
    <div class="mood-insight-item">
      <span class="mood-insight-icon">${ins.icon}</span>
      <span class="mood-insight-text">${ins.text}</span>
    </div>
  `).join('');
}

function refreshMoodInsights() {
  renderMoodInsights();
}

function escapeMs(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
