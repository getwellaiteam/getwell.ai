/* Ellie — getwell.ai's Woebot / Youper-style guided CBT companion.
   Conversation is a state machine: each state has one or more bot messages,
   optional quick-reply chips, and either a `next` state key or a routing
   function that inspects free-text input. */

/* ============================================================================
   CONVERSATION STATE
   ============================================================================ */
let chatState = 'start';         // current node id
let chatHistory = [];            // {role: 'bot'|'user', text}
let chatAwaitingChip = false;    // if true, the input bar is dimmed but usable
let chatTypingId = null;         // guard so we don't stack indicators
let chatDone = false;            // set when the flow ends; free text uses fallback

/* ============================================================================
   HELPERS — bubbles, typing, chips
   ============================================================================ */
function appendUserBubble(text) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  chatHistory.push({ role: 'user', text });
}

function appendBotBubble(text) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = escapeHtml(text);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  chatHistory.push({ role: 'bot', text });
}

function showTyping() {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  hideTyping();
  const el = document.createElement('div');
  el.className = 'chat-typing';
  el.id = 'chat-typing-indicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('chat-typing-indicator');
  if (el) el.remove();
}

function clearChips() {
  const chips = document.getElementById('chat-chips');
  if (!chips) return;
  chips.innerHTML = '';
  chips.style.display = 'none';
  chatAwaitingChip = false;
  const bar = document.getElementById('chat-input-bar');
  if (bar) bar.classList.remove('awaiting-chip');
}

function showChips(chipList) {
  const container = document.getElementById('chat-chips');
  if (!container || !chipList || !chipList.length) {
    clearChips();
    return;
  }
  container.innerHTML = '';
  chipList.forEach(chip => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip' + (chip.primary ? ' chip-primary' : '') + (chip.danger ? ' chip-danger' : '');
    btn.textContent = chip.label;
    btn.onclick = () => onChipClick(chip);
    container.appendChild(btn);
  });
  container.style.display = 'flex';
  chatAwaitingChip = true;
  const bar = document.getElementById('chat-input-bar');
  if (bar) bar.classList.add('awaiting-chip');
}

function onChipClick(chip) {
  // Show the chip label as if the user typed it
  appendUserBubble(chip.label);
  clearChips();

  // Chip can trigger an action (navigate to a tab / open crisis modal) AND move to a next state
  if (chip.action) {
    try { chip.action(); } catch (e) { /* swallow */ }
  }
  if (chip.tab) {
    // Small delay so the user sees their choice appear first
    setTimeout(() => switchTab(chip.tab), 300);
  }
  if (chip.next) {
    goToState(chip.next);
  } else if (chip.end) {
    completeFlow();
  }
}

/* ============================================================================
   ENGINE — running a state
   ============================================================================ */
async function goToState(stateId) {
  const node = CHAT_FLOWS[stateId];
  if (!node) {
    console.warn('Unknown chat state:', stateId);
    return;
  }
  chatState = stateId;
  chatDone = false;

  const messages = (typeof node.messages === 'function') ? node.messages() : node.messages;

  for (let i = 0; i < messages.length; i++) {
    showTyping();
    // Longer pause on the first message so it doesn't feel like a canned dump
    const delay = 550 + Math.min(messages[i].length * 18, 900);
    await sleep(delay);
    hideTyping();
    appendBotBubble(messages[i]);
    if (i < messages.length - 1) await sleep(220);
  }

  if (node.chips) {
    const chipList = (typeof node.chips === 'function') ? node.chips() : node.chips;
    await sleep(150);
    showChips(chipList);
  } else if (node.end) {
    completeFlow();
  } else if (node.free) {
    // Awaiting free-text input; no chips
    clearChips();
  }
}

function completeFlow() {
  clearChips();
  chatDone = true;
  chatState = 'freeform';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ============================================================================
   FLOWS — the actual conversation content
   Each node: { messages, chips? (or free/end), next? }
   ============================================================================ */
const CHAT_FLOWS = {
  'start': {
    messages: [
      "Hey — I'm Ellie 🌸",
      "I'm your CBT-inspired support buddy. Everything you say stays on your device.",
      "What's going on right now? Pick whatever feels closest — or type your own."
    ],
    chips: [
      { label: '😰 Anxious or panicking', next: 'anxiety:intensity' },
      { label: '😔 Feeling low or empty', next: 'depression:intro' },
      { label: '😩 Overwhelmed by everything', next: 'overwhelmed:name' },
      { label: '🏠 Family or parents', next: 'family:intro' },
      { label: '📚 School, grades, college', next: 'school:intro' },
      { label: '👥 Friends or relationships', next: 'friends:intro' },
      { label: '🌱 Substance stuff', next: 'substance:intro' },
      { label: '🛡️ Self-harm urges', next: 'safety:check' },
      { label: '💬 Just want to talk', next: 'freeform:open' }
    ]
  },

  /* ---------- ANXIETY ---------- */
  'anxiety:intensity': {
    messages: [
      "Anxiety is really hard. Let's work through it together.",
      "On a scale of 1 to 10, how loud is it right now?"
    ],
    chips: [
      { label: '1–3 · Manageable', next: 'anxiety:low' },
      { label: '4–6 · Uncomfortable', next: 'anxiety:mid' },
      { label: '7–10 · Overwhelming', next: 'anxiety:high' }
    ]
  },
  'anxiety:high': {
    messages: [
      "Okay — that's a lot. Your nervous system is in alarm mode.",
      "First: you're safe in this moment. This spike will peak and pass, usually within 10-15 minutes.",
      "Let's do one concrete thing to bring you down. What sounds doable?"
    ],
    chips: [
      { label: '🌬️ Box breathing', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: '🖐️ 5-4-3-2-1 grounding', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: 'Just keep talking', next: 'anxiety:body' }
    ]
  },
  'anxiety:mid': {
    messages: [
      "Okay — uncomfortable but not overwhelming. That's a workable spot.",
      "Is it more in your body (racing heart, tight chest, shaky) or in your head (looping thoughts, worst-case scenarios)?"
    ],
    chips: [
      { label: '💓 Mostly body', next: 'anxiety:body' },
      { label: '🧠 Mostly thoughts', next: 'anxiety:thoughts' },
      { label: 'Both', next: 'anxiety:body' }
    ]
  },
  'anxiety:low': {
    messages: [
      "Good — catching it while it's still small is exactly the right move.",
      "Do you want a technique to knock it down further, or just talk it out?"
    ],
    chips: [
      { label: '🌬️ Give me a technique', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: '💬 Just talk it out', next: 'anxiety:thoughts' }
    ]
  },
  'anxiety:body': {
    messages: [
      "Body anxiety needs a body fix. Breathing changes your heart rate faster than any thought ever will.",
      "Box breathing is 4 in, 4 hold, 4 out, 4 hold — for 2 minutes."
    ],
    chips: [
      { label: '🌬️ Open Box Breathing', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: 'Show me 5-4-3-2-1', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: 'Just keep talking', next: 'anxiety:thoughts' }
    ]
  },
  'anxiety:thoughts': {
    messages: [
      "Anxious thoughts feel like facts. They're usually predictions your brain made too confidently.",
      "What's the loudest thought right now? Type it in one sentence if you can."
    ],
    free: true
  },
  'anxiety:reframe': {
    messages: () => [
      "Okay, let's put that thought on trial for a second.",
      "Is there real evidence it's true, or is it your brain assuming the worst?",
      "Would you tell a friend the exact same thing if THEY were in your shoes?"
    ],
    chips: [
      { label: "It's probably my brain assuming", next: 'anxiety:validate' },
      { label: "There's some real evidence", next: 'anxiety:evidence' },
      { label: "I'd be kinder to a friend", next: 'anxiety:validate' }
    ]
  },
  'anxiety:validate': {
    messages: [
      "That's the whole game — you just did the hardest part of CBT.",
      "Your brain isn't lying on purpose. It's trying to protect you. But you don't have to believe every prediction it makes.",
      "Want to try a technique or keep talking?"
    ],
    chips: [
      { label: '🌬️ Try Box Breathing', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: '📓 Write it in my journal', next: 'freeform:journal-nudge' },
      { label: 'Something else is on my mind', next: 'start' },
      { label: "I'm good for now", next: 'freeform:closeout' }
    ]
  },
  'anxiety:evidence': {
    messages: [
      "That's fair — sometimes the fear is pointing at something real.",
      "If some of it is true, what's ONE thing you could do about it in the next 24 hours? Just one.",
      "You don't have to solve the whole thing tonight."
    ],
    free: true
  },
  'anxiety:tool-suggested': {
    messages: [
      "The toolkit's open in another tab — come back here whenever you're done.",
      "Want to keep talking now, or check back in later?"
    ],
    chips: [
      { label: '💬 Keep talking', next: 'start' },
      { label: "I'll come back later", next: 'freeform:closeout' }
    ]
  },

  /* ---------- DEPRESSION ---------- */
  'depression:intro': {
    messages: [
      "Heavy days are real. I'm glad you came here.",
      "When you say low or empty — is it more like sadness, or more like nothing, numb?"
    ],
    chips: [
      { label: '😢 Sad or tearful', next: 'depression:sad' },
      { label: '🌫️ Numb / nothing', next: 'depression:numb' },
      { label: '😴 Just exhausted', next: 'depression:tired' }
    ]
  },
  'depression:sad': {
    messages: [
      "Sad is exhausting because you still care — the caring is what hurts.",
      "Can you name one thing that made today (or yesterday) worse than usual?"
    ],
    free: true
  },
  'depression:numb': {
    messages: [
      "Numb is depression's default setting. It's a symptom, not the truth.",
      "The trick isn't to feel better right now — it's to do one micro-thing anyway. Existing counts.",
      "What sounds most doable?"
    ],
    chips: [
      { label: '💧 Drink some water', next: 'depression:tiny-win' },
      { label: '🌞 Step outside for 2 min', next: 'depression:tiny-win' },
      { label: '🚿 Wash my face', next: 'depression:tiny-win' },
      { label: '☀️ Open the Micro-Wins tracker', tab: 'depression', next: 'anxiety:tool-suggested' }
    ]
  },
  'depression:tired': {
    messages: [
      "Exhausted is also depression, not weakness. Your body's working overtime carrying this.",
      "Have you eaten and drunk water today? Not asking to guilt-trip — just checking.",
    ],
    chips: [
      { label: 'Yes to both', next: 'depression:momentum' },
      { label: "Water yes, food no", next: 'depression:eat' },
      { label: "Not really", next: 'depression:eat' }
    ]
  },
  'depression:tiny-win': {
    messages: [
      "Okay — do that thing. Take five minutes.",
      "When you come back, log it in the Micro-Wins tracker. That's not silly — it's how you rebuild momentum.",
      "Come find me whenever."
    ],
    chips: [
      { label: '☀️ Open Micro-Wins', tab: 'depression', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'depression:eat': {
    messages: [
      "Start there. Anything counts — cereal, a granola bar, leftover pizza. Fuel first, feelings after.",
      "Also: your virtual plant would like a sip. Tap 💧 I Drank Water when you do."
    ],
    chips: [
      { label: '🌱 Take me to my Plant', tab: 'pet', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'depression:momentum': {
    messages: [
      "Good — your body's got fuel. That's step one.",
      "Depression lies and says nothing you do matters. Pick literally the smallest possible thing and do that one thing.",
      "What sounds like the least painful next step?"
    ],
    chips: [
      { label: '🚶 Move for 5 min', next: 'depression:tiny-win' },
      { label: '📱 Text one person', next: 'depression:tiny-win' },
      { label: '🎧 Play a comfort song', next: 'depression:tiny-win' },
      { label: '📓 Write in journal', next: 'freeform:journal-nudge' }
    ]
  },

  /* ---------- OVERWHELMED ---------- */
  'overwhelmed:name': {
    messages: [
      "When everything piles up at once, it drowns out any next step.",
      "Type just ONE thing on your list that keeps coming back."
    ],
    free: true
  },
  'overwhelmed:emotion': {
    messages: () => [
      "Got it. When you think about that specifically, what's the loudest emotion?"
    ],
    chips: [
      { label: '😰 Anxious', next: 'overwhelmed:action' },
      { label: '😤 Angry', next: 'overwhelmed:action' },
      { label: '😔 Sad', next: 'overwhelmed:action' },
      { label: '🌫️ Numb', next: 'overwhelmed:action' }
    ]
  },
  'overwhelmed:action': {
    messages: [
      "That's real. Feelings are data — they're telling you this matters to you.",
      "If you had 15 minutes right now to make it 1% better, what would you do?"
    ],
    free: true
  },
  'overwhelmed:capsule': {
    messages: () => [
      "That's a real next step. Please do just that one thing tonight.",
      "One more thing that might help: the Time Capsule lets Future You write a letter about how this turned out.",
      "It's weirdly comforting when you're in the thick of it."
    ],
    chips: [
      { label: '⏳ Open Time Capsule', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' },
      { label: "I'm good", next: 'freeform:closeout' }
    ]
  },

  /* ---------- FAMILY ---------- */
  'family:intro': {
    messages: [
      "Family stuff is heavy because they're supposed to be the safe people.",
      "Is this a right-now fight, or something that's been building?"
    ],
    chips: [
      { label: '🔥 Right-now fight', next: 'family:acute' },
      { label: '⏳ Been building', next: 'family:chronic' },
      { label: '💬 Just need to vent', next: 'family:vent' }
    ]
  },
  'family:acute': {
    messages: [
      "First: get physical distance if you can. Bedroom, bathroom, outside. Regulate your body before you say anything else.",
      "Nothing productive happens mid-fight. Both of you are in fight-or-flight.",
      "When you're calmer, what do you actually want them to hear?"
    ],
    free: true
  },
  'family:chronic': {
    messages: [
      "Chronic stuff needs a different tool — a script for a calm moment, not a fix in the heat.",
      "What's the theme? Pick the closest one."
    ],
    chips: [
      { label: '📚 Grades / academic pressure', next: 'family:script:academic' },
      { label: '🚪 Privacy or independence', next: 'family:script:privacy' },
      { label: '👶 Sibling responsibility', next: 'family:script:sibling' },
      { label: '🎯 Career / future path', next: 'family:script:future' }
    ]
  },
  'family:script:academic': {
    messages: [
      "Try something like: \"I know you want the best for me. Right now the pressure is making me shut down instead of do more. Can we talk about what 'trying hard' actually looks like, without it being about grades alone?\"",
      "Bring it up when nobody's already upset. Say it once, not five times."
    ],
    chips: [
      { label: '📓 Save that to journal', next: 'freeform:journal-nudge' },
      { label: '⏳ Time Capsule this', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'family:script:privacy': {
    messages: [
      "Try: \"I love you and I'm not hiding anything. I just need my room / phone / friend group to be mine. Trust is built by giving me some room to make small choices.\"",
      "Ask for ONE specific thing (not everything at once), at a calm moment."
    ],
    chips: [
      { label: '📓 Save that to journal', next: 'freeform:journal-nudge' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'family:script:sibling': {
    messages: [
      "Try: \"I love [sibling]. And I'm 17 [or whatever], not their parent. I need one afternoon a week that's mine.\"",
      "You're allowed to feel both love AND resentment. Both are true. That's not being a bad sibling."
    ],
    chips: [
      { label: '📓 Save that to journal', next: 'freeform:journal-nudge' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'family:script:future': {
    messages: [
      "Try: \"I appreciate the path you had in mind for me. I'm figuring out what fits me too, and that might look different. It doesn't mean I'm rejecting you.\"",
      "You don't have to know your whole life plan to push back on someone else's plan for you."
    ],
    chips: [
      { label: '⏳ Time Capsule this fear', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'family:vent': {
    messages: [
      "Go ahead. Type whatever you'd say if you didn't have to filter."
    ],
    free: true
  },

  /* ---------- SCHOOL ---------- */
  'school:intro': {
    messages: [
      "School stress is real. Grades feel permanent but they aren't.",
      "What's the specific thing that's spiraling?"
    ],
    chips: [
      { label: '📝 An upcoming test / final', next: 'school:test' },
      { label: '📄 An assignment I haven\'t started', next: 'school:procrastination' },
      { label: '📊 My overall grade', next: 'school:overall' },
      { label: '🎓 College apps / future', next: 'school:college' }
    ]
  },
  'school:test': {
    messages: [
      "Studying anxious = studying inefficient. Fix the anxiety first, then the studying.",
      "Do 5 min of box breathing, then pick ONE topic and set a 25-min timer. Just that one topic.",
      "Momentum > perfection."
    ],
    chips: [
      { label: '🌬️ Box breathing first', tab: 'anxiety', next: 'anxiety:tool-suggested' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'school:procrastination': {
    messages: [
      "Procrastination is usually anxiety in disguise. Your brain avoids scary things.",
      "Trick it: set a 5-min timer. Open the doc. Type ONE line. That's the whole goal.",
      "Almost always, you'll keep going once the door is open."
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "I'm gonna go do it", next: 'freeform:closeout' }
    ]
  },
  'school:overall': {
    messages: [
      "Grades feel like your whole future. They aren't. Nobody at 25 looks at their transcript.",
      "But: is there a real gap you can close, or is this more of a perfectionism spiral?"
    ],
    chips: [
      { label: '📉 Real gap', next: 'school:gap' },
      { label: '🌀 Perfectionism', next: 'school:perfectionism' }
    ]
  },
  'school:gap': {
    messages: [
      "Okay. Pick ONE class and email the teacher this week asking what's the highest-impact way to bring the grade up.",
      "Teachers respect students who ask. They don't respect students who pretend everything's fine and crash."
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "I'm good", next: 'freeform:closeout' }
    ]
  },
  'school:perfectionism': {
    messages: [
      "Perfectionism protects you from ever finding out where your ceiling is. That's what makes it so sticky.",
      "Practice: turn something in at 90%. On purpose. Watch the world not end.",
      "That skill is worth more than any grade."
    ],
    chips: [
      { label: '⏳ Letter from Future Me', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'school:college': {
    messages: [
      "College anxiety lies about scarcity. Thousands of paths lead to a good life.",
      "Almost everyone ends up happy at their eventual school — because YOU make it good.",
      "Want a Time Capsule letter from Future You about how it actually turned out?"
    ],
    chips: [
      { label: '⏳ Yes, open Time Capsule', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Just keep talking', next: 'freeform:open' }
    ]
  },

  /* ---------- FRIENDS ---------- */
  'friends:intro': {
    messages: [
      "Social stuff at your age is brutal. Cliques, group chats, being left out — it all messes with your head.",
      "What's the flavor of what happened?"
    ],
    chips: [
      { label: '👻 Ghosted or left out', next: 'friends:leftout' },
      { label: '💔 Someone hurt me', next: 'friends:hurt' },
      { label: '💘 Crush / relationship', next: 'friends:romance' },
      { label: '💭 I feel really lonely', next: 'friends:lonely' }
    ]
  },
  'friends:leftout': {
    messages: [
      "Being left out hurts in a really specific, visceral way — humans are wired to detect it.",
      "It usually says more about the group's dynamic than about you being unlikeable.",
      "Real friends make you feel calmer. Not anxious about whether they'll flake.",
      "Is there one person you'd feel safer with even one-on-one?"
    ],
    free: true
  },
  'friends:hurt': {
    messages: [
      "That kind of hurt takes real time. Don't rush past it.",
      "Do you want to repair the friendship, or do you want to protect yourself and step back?"
    ],
    chips: [
      { label: '🔧 Try to repair', next: 'friends:repair' },
      { label: '🚶 Step back', next: 'friends:distance' },
      { label: 'Not sure', next: 'friends:think' }
    ]
  },
  'friends:repair': {
    messages: [
      "Repair usually starts with owning your part first, then naming theirs.",
      "\"Hey — the thing yesterday hurt. I don't want to fight, I want to fix it. Can we talk?\"",
      "If they respond well, you have real info. If they blow you off, that's also real info."
    ],
    chips: [
      { label: '📓 Save that to journal', next: 'freeform:journal-nudge' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'friends:distance': {
    messages: [
      "Stepping back doesn't have to be dramatic. You just do it. Reply less, hang out less, spend that time on people who feel easier.",
      "You don't owe anyone an announcement about it.",
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "That's helpful", next: 'freeform:closeout' }
    ]
  },
  'friends:think': {
    messages: [
      "Sit with it for a couple of days. Big friendship decisions almost never need to happen tonight.",
      "In the meantime — write it out in the journal so it's not just looping in your head."
    ],
    chips: [
      { label: '📓 Open journal', next: 'freeform:journal-nudge' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'friends:romance': {
    messages: [
      "Romantic stuff is wild at this age — your brain treats it like life-or-death.",
      "Is this a crush, a real relationship, or a breakup / rejection?"
    ],
    chips: [
      { label: '💘 Crush', next: 'friends:crush' },
      { label: '❤️ In a relationship', next: 'friends:in-relationship' },
      { label: '💔 Breakup / rejection', next: 'friends:breakup' }
    ]
  },
  'friends:crush': {
    messages: [
      "Crushes feel intense — that intensity is real, it just isn't information about the future.",
      "A useful question: do you know this person, or do you know the IDEA of this person?",
      "If it's the idea, sometimes just meeting them once dissolves it. Either way you learn."
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "Good, that helped", next: 'freeform:closeout' }
    ]
  },
  'friends:in-relationship': {
    messages: [
      "Two quick check-ins: does this person make you feel more like yourself, or less like yourself?",
      "Do they make you feel calmer, or more anxious?",
      "If it's more/calmer — good sign. If it's less/anxious — that's real information."
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "I need to think about that", next: 'freeform:closeout' }
    ]
  },
  'friends:breakup': {
    messages: [
      "Breakups genuinely feel like grief — your brain treats them like a real loss. It IS a real loss.",
      "Rules for the first two weeks: cry when you need to. Sad playlist. Sleep. No stalking their profiles.",
      "In a month you'll feel colors again. In three, most of your life will feel yours again."
    ],
    chips: [
      { label: '☀️ Something uplifting', tab: 'depression', next: 'anxiety:tool-suggested' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'friends:lonely': {
    messages: [
      "Loneliness in a full building of people is its own specific kind of awful.",
      "It doesn't mean you're unlovable. It usually means you're going through something bigger than the people around you know.",
      "Micro-step: text ONE person a meme today. No pressure to have a conversation. Just a signal."
    ],
    chips: [
      { label: '🏡 Add them to My Space', tab: 'safespace', next: 'anxiety:tool-suggested' },
      { label: '💬 Something else', next: 'start' }
    ]
  },

  /* ---------- SUBSTANCE ---------- */
  'substance:intro': {
    messages: [
      "Zero judgment here. Substance stuff is common at your age and doesn't make you a bad person.",
      "What's this about?"
    ],
    chips: [
      { label: "🔥 I'm dealing with a craving", next: 'substance:craving' },
      { label: "🤔 I'm trying to cut back", next: 'substance:cutback' },
      { label: "👥 Someone in my life is using", next: 'substance:family' },
      { label: "❓ Peer pressure at parties", next: 'substance:peer' }
    ]
  },
  'substance:craving': {
    messages: [
      "Cravings peak in about 15-20 minutes and then fade. Even the strongest ones.",
      "The Ride the Wave visualizer on the Safety tab literally works for this — cravings ARE waves.",
      "Right now: chew gum, cold water, one push-up. Give your body a competing signal."
    ],
    chips: [
      { label: '🛡️ Open Ride the Wave', tab: 'selfharm', next: 'anxiety:tool-suggested' },
      { label: '💬 Just keep talking', next: 'freeform:open' }
    ]
  },
  'substance:cutback': {
    messages: [
      "Cutting back is real work. Every time you didn't use — even when it was hard — that adds up in ways you can't feel yet.",
      "What are you cutting back on? (nicotine / weed / alcohol / other)"
    ],
    free: true
  },
  'substance:family': {
    messages: [
      "That's a lot to carry. You're not responsible for their choices, even when it feels like you should be able to fix it.",
      "Alateen is free, confidential, and specifically for teens whose family members are using. al-anon.org/teen",
      "It's for you, not them."
    ],
    chips: [
      { label: '🆘 Show me hotlines', action: () => openCrisisModal(), next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]
  },
  'substance:peer': {
    messages: [
      "Refusal scripts for when someone hands you a vape/drink/pill:",
      "Casual: \"Nah I'm good, got a drug test coming up for [sport / job].\"",
      "Direct: \"My stomach can't handle it.\" or \"Meds don't mix with it.\"",
      "Deflect: \"I'm already on my third energy drink.\" You don't owe anyone a real reason."
    ],
    chips: [
      { label: '📓 Save these to journal', next: 'freeform:journal-nudge' },
      { label: '💬 Something else', next: 'start' }
    ]
  },

  /* ---------- SAFETY (self-harm / suicidal ideation) ---------- */
  'safety:check': {
    messages: [
      "Thank you for saying that out loud. That takes real courage.",
      "First — are you safe right now? Meaning: no immediate plan to hurt yourself in the next few hours?"
    ],
    chips: [
      { label: "✅ Safe for now, just struggling", next: 'safety:urge' },
      { label: "⚠️ Not sure", danger: true, next: 'safety:not-sure' },
      { label: "🚨 I'm not safe", danger: true, action: () => openCrisisModal(), next: 'safety:crisis' }
    ]
  },
  'safety:urge': {
    messages: [
      "Okay. Urges peak within 10-20 minutes and then fade. You can outlast this one.",
      "The Ride the Wave visualizer is literally built for this. Tap the water, breathe with the orb, watch the wave calm.",
      "Or we can keep talking. Whatever feels doable."
    ],
    chips: [
      { label: '🛡️ Open Ride the Wave', tab: 'selfharm', primary: true, next: 'safety:aftercare' },
      { label: '🆘 Show me hotlines', action: () => openCrisisModal(), next: 'safety:aftercare' },
      { label: '💬 Keep talking', next: 'safety:talk' }
    ]
  },
  'safety:not-sure': {
    messages: [
      "That's really honest. Uncertainty here is a signal that this needs a real person, not just me.",
      "988 is free, confidential, 24/7 — call OR text. They talk to teens all the time and they don't send police for just talking.",
      "Please open the crisis panel right now."
    ],
    chips: [
      { label: '🆘 Open Crisis Help', primary: true, action: () => openCrisisModal(), next: 'safety:aftercare' },
      { label: '💬 I need to talk more first', next: 'safety:talk' }
    ]
  },
  'safety:crisis': {
    messages: [
      "I'm really glad you're telling me. Please stay with the Crisis Help panel that just opened.",
      "Call OR text 988 right now. If you can't, text HOME to 741741.",
      "You matter. This gets survivable. Real people are on the other side of that number tonight."
    ],
    chips: [
      { label: '🆘 Reopen Crisis Help', action: () => openCrisisModal() },
      { label: "I'm on the phone with them", next: 'safety:on-call' }
    ]
  },
  'safety:on-call': {
    messages: [
      "Good. Stay with them. I'll be here whenever you come back.",
      "Take care of you. 🌸"
    ],
    end: true
  },
  'safety:talk': {
    messages: [
      "Okay. Tell me what's going on. I'm listening."
    ],
    free: true
  },
  'safety:aftercare': {
    messages: [
      "When you're back from that, come tell me you're okay. I'll be here.",
      "Also: your safety plan lives on the Safety tab if you want to fill it in for next time."
    ],
    chips: [
      { label: "🛡️ Fill in safety plan", tab: 'selfharm', next: 'freeform:closeout' },
      { label: "I'm back and safer", next: 'safety:safer' },
      { label: "Just want to be done", end: true }
    ]
  },
  'safety:safer': {
    messages: [
      "That's huge. Seriously.",
      "How about we water your plant for making it through this? 🌱"
    ],
    chips: [
      { label: '🌱 Take me to my plant', tab: 'pet', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' },
      { label: "I'm good", end: true }
    ]
  },

  /* ---------- FREEFORM / OPEN-ENDED ---------- */
  'freeform:open': {
    messages: [
      "Okay — I'm here. Tell me what's on your mind."
    ],
    free: true
  },
  'freeform:journal-nudge': {
    messages: [
      "That belongs on paper (metaphorically). Type it in your journal below — it'll save automatically.",
      "Getting it out of your head is half the work."
    ],
    chips: [
      { label: '💬 Something else', next: 'start' },
      { label: "I'll write it now", end: true }
    ]
  },
  'freeform:closeout': {
    messages: [
      "Anytime. I'm always here.",
      "Come back whenever — I don't get tired. 🌸"
    ],
    chips: [
      { label: '💬 Actually, one more thing', next: 'start' },
      { label: '🌱 Check on my plant', tab: 'pet', end: true },
      { label: "I'm good", end: true }
    ]
  }
};

/* ============================================================================
   FREE-TEXT HANDLING — keyword-routing when the user types instead of tapping
   ============================================================================ */

/* Simple category detection for free-text (fallback / freeform state) */
const FREETEXT_ROUTES = [
  { keywords: ['hurt myself', 'self harm', 'self-harm', 'cutting', 'kill myself', 'kms', 'suicide', 'suicidal', 'end it', 'want to die', 'not worth living'], next: 'safety:check' },
  { keywords: ['panic', 'anxious', 'anxiety', 'racing heart', 'chest tight', 'freaking out'], next: 'anxiety:intensity' },
  { keywords: ['depressed', 'empty', 'numb', 'hopeless', 'no motivation'], next: 'depression:intro' },
  { keywords: ['overwhelmed', 'too much', 'drowning', 'stressed', 'stress'], next: 'overwhelmed:name' },
  { keywords: ['parents', 'family', 'mom', 'dad', 'mother', 'father', 'sibling'], next: 'family:intro' },
  { keywords: ['test', 'exam', 'final', 'grade', 'gpa', 'homework', 'school', 'college'], next: 'school:intro' },
  { keywords: ['friend', 'lonely', 'ghosted', 'crush', 'breakup', 'boyfriend', 'girlfriend'], next: 'friends:intro' },
  { keywords: ['vape', 'weed', 'drunk', 'alcohol', 'craving', 'addicted', 'quit smoking'], next: 'substance:intro' }
];

/* Warm fallback if we can't detect a topic */
const FREETEXT_FALLBACKS = [
  "I hear you. Tell me a little more — what's the heaviest part right now?",
  "Thank you for trusting me with that. If you had to name the loudest feeling, what would you call it?",
  "That sounds like a lot. Do you want practical steps, or just to be heard first?",
  "I'm listening. Keep going — what happened right before you noticed this?",
  "Okay. If a friend was telling YOU this exact thing, what would you say back to them?"
];

/* Special handling for free-text responses to specific bot questions */
function handleFreeText(text) {
  const lower = text.toLowerCase();

  // Route by current state — some free-text nodes have specific follow-ups
  if (chatState === 'anxiety:thoughts') {
    goToState('anxiety:reframe');
    return;
  }
  if (chatState === 'depression:sad') {
    // Just validate + offer next steps
    respondAndReturn([
      "That's a lot to carry. Naming it is real work — most people don't get that far.",
      "What sounds like it would help even 1% right now?"
    ], [
      { label: '💬 Keep talking', next: 'freeform:open' },
      { label: '📓 Write it in journal', next: 'freeform:journal-nudge' },
      { label: '🌱 Water my plant', tab: 'pet', next: 'freeform:closeout' }
    ]);
    return;
  }
  if (chatState === 'overwhelmed:name') {
    goToState('overwhelmed:emotion');
    return;
  }
  if (chatState === 'overwhelmed:action') {
    goToState('overwhelmed:capsule');
    return;
  }
  if (chatState === 'anxiety:evidence') {
    respondAndReturn([
      "Good — that's a concrete lever. Do just that thing. The rest can wait.",
      "Once it's done, come back and tell me how it went."
    ], [
      { label: '⏳ Time Capsule this', tab: 'capsule', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]);
    return;
  }
  if (chatState === 'family:acute' || chatState === 'family:vent') {
    respondAndReturn([
      "That's real. Get it all out — no filter needed here.",
      "Do you want a script for what to say to them, or do you just want to keep venting?"
    ], [
      { label: '💬 Give me a script', next: 'family:chronic' },
      { label: '💬 Just vent more', next: 'family:vent' },
      { label: '📓 Save to journal', next: 'freeform:journal-nudge' }
    ]);
    return;
  }
  if (chatState === 'friends:leftout') {
    respondAndReturn([
      "That's a real person to lean on. Text them today — even just a meme.",
      "One connection at a time. That's how it rebuilds."
    ], [
      { label: '🏡 Add them to My Space', tab: 'safespace', next: 'freeform:closeout' },
      { label: '💬 Something else', next: 'start' }
    ]);
    return;
  }
  if (chatState === 'safety:talk') {
    respondAndReturn([
      "I hear you. Please stay with me here — and please open the crisis panel too.",
      "Real people are trained for exactly this. You don't have to handle it alone tonight."
    ], [
      { label: '🆘 Open Crisis Help', primary: true, action: () => openCrisisModal(), next: 'safety:aftercare' },
      { label: '💬 Keep talking', next: 'safety:talk' }
    ]);
    return;
  }
  if (chatState === 'substance:cutback') {
    respondAndReturn([
      "Respect for even trying. Cravings are 15-min waves — they always fade.",
      "The Ride the Wave visualizer on Safety works for this too."
    ], [
      { label: '🛡️ Ride the Wave', tab: 'selfharm', next: 'freeform:closeout' },
      { label: '💬 Keep talking', next: 'freeform:open' }
    ]);
    return;
  }

  // Global keyword routing — pick the best matching topic and jump into its flow
  for (const route of FREETEXT_ROUTES) {
    if (route.keywords.some(k => lower.includes(k))) {
      goToState(route.next);
      return;
    }
  }

  // Freeform continuation — warm fallback + offer chips
  const reply = FREETEXT_FALLBACKS[Math.floor(Math.random() * FREETEXT_FALLBACKS.length)];
  respondAndReturn([reply], [
    { label: '💬 Show me topics again', next: 'start' },
    { label: '📓 Write it in journal', next: 'freeform:journal-nudge' },
    { label: '🌬️ Try a technique', tab: 'anxiety', next: 'freeform:closeout' }
  ]);
}

async function respondAndReturn(messages, chips) {
  for (let i = 0; i < messages.length; i++) {
    showTyping();
    await sleep(600 + Math.min(messages[i].length * 15, 800));
    hideTyping();
    appendBotBubble(messages[i]);
    if (i < messages.length - 1) await sleep(200);
  }
  if (chips) {
    await sleep(150);
    showChips(chips);
  }
}

/* ============================================================================
   PUBLIC API — called from the outside
   ============================================================================ */
function initChatAssistant() {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  messages.innerHTML = '';
  clearChips();
  chatState = 'start';
  chatHistory = [];
  chatDone = false;
  goToState('start');
}

function resetChat() {
  initChatAssistant();
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';

  appendUserBubble(text);
  clearChips();
  handleFreeText(text);
}

/* ============================================================================
   JOURNAL (unchanged)
   ============================================================================ */
function saveJournalEntry() {
  const input = document.getElementById('journal-input');
  if (!input) return;
  localStorage.setItem('haven_journal_text', input.value);
  alert('💾 Your private journal entry was saved securely to your browser.');
}

function loadJournalEntry() {
  const input = document.getElementById('journal-input');
  if (!input) return;
  const saved = localStorage.getItem('haven_journal_text');
  if (saved) input.value = saved;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
