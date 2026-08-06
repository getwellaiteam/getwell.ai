/* getwell.ai Assistant + Private Journal */

/* Each topic has several reply variants (so it doesn't feel like a canned
   keyword bot) plus optional quick-action chips linking to real tools. */
const botResponses = [
  // Anxiety / Panic
  {
    category: 'anxiety',
    keywords: ['anxious', 'anxiety', 'panic', 'freaking out', 'racing heart', 'chest tight', 'nervous', 'jittery', 'on edge'],
    replies: [
      "That racing feeling is your body's alarm — it's real but it's not dangerous. Try box breathing or the 5-4-3-2-1 grounding to anchor back to right now. Name 5 things you see out loud. Panic peaks around 10 min then fades.",
      "Okay, let's slow this down together. Your nervous system thinks there's danger, but you're safe right now. Four seconds in, four seconds out — box breathing can bring your heart rate down fast.",
      "That's a lot to carry. Anxiety spikes feel endless in the moment but they're short — usually under 10-15 minutes if you don't fight it. Want to try a grounding exercise together?"
    ],
    chips: [{ label: '🌬️ Try Box Breathing', tab: 'anxiety' }]
  },
  {
    category: 'sleep',
    keywords: ["can't sleep", 'cant sleep', 'insomnia', 'sleep', 'up at night', 'tired but wired', 'wide awake'],
    replies: [
      "Sleep struggles are super common in high school. Try: dim your screen 30 min before bed, no doomscrolling in bed, and if your brain won't shut up, dump every thought into the journal — get it OUT of your head. Resting still counts.",
      "A wired brain at 1am is the worst. Try writing down everything looping in your head so it's on paper instead of in your skull. Your body still recovers even if actual sleep takes a while."
    ],
    chips: [{ label: '📓 Brain-dump in Journal', tab: 'journal' }]
  },
  // Depression / low mood
  {
    category: 'depression',
    keywords: ['depressed', 'depression', 'empty', 'numb', 'nothing matters', "don't care", 'no motivation', 'no energy', 'exhausted', 'burned out', 'burnt out', 'hopeless'],
    replies: [
      "Heavy days are real. On these days, the goal isn't productivity — it's survival with softness. Try one micro-win (drank water, opened a window). Existing counts. You're not lazy — you're carrying something.",
      "That flatness is exhausting in a way people don't always get. You don't have to fix today, just get through it gently. One tiny win logged can actually shift momentum a little.",
      "Depression lies and says nothing you do matters. It's not true, it's just loud right now. Pick literally the smallest possible thing and do just that one thing."
    ],
    chips: [{ label: '☀️ Log a Micro-Win', tab: 'depression' }]
  },
  {
    category: 'sadLonely',
    keywords: ['sad', 'crying', 'cried', 'lonely', 'alone', 'isolated', 'nobody cares', 'no one likes me'],
    replies: [
      "That loneliness is heavy. It doesn't mean you're unlovable — it usually means you're going through something bigger than the people around you know. Texting one person a meme today counts, even if you don't feel like talking.",
      "Feeling alone in a full building of people is its own specific kind of awful. You're allowed to be sad about it without having to explain it perfectly to anyone."
    ],
    chips: [{ label: '🏆 Athlete Affirmations', tab: 'depression' }]
  },
  // Self harm / suicide - HIGHEST priority, kept serious and consistent
  {
    category: 'crisis',
    keywords: ['hurt myself', 'self harm', 'self-harm', 'cutting', 'cut myself', 'urge', 'kill myself', 'kms', 'suicide', 'suicidal', 'end it', 'not worth living', 'want to die'],
    replies: [
      "I'm really glad you told me. Your safety matters more than anything right now. Please tap the red 🆘 24/7 Crisis Help button and call/text 988 — real people, no judgment, free. The Self-Harm Safety tab has a 15-min 'Ride the Wave' urge timer that can help you get through the peak.",
      "Thank you for saying that out loud — that takes real courage. Please reach out right now to 988 (call or text) or tap 🆘 Crisis Help above. You deserve support from a real person tonight, and the urge timer in Self-Harm Safety can help you get through this next stretch of time."
    ],
    chips: [{ label: '🆘 Crisis Help', action: 'openCrisisModal()' }, { label: '🛡️ Ride the Wave', tab: 'selfharm' }]
  },
  // Family
  {
    category: 'family',
    keywords: ['parents', 'family', 'mom', 'dad', 'mother', 'father', 'strict', 'controlling', 'yelling', 'arguing', 'fight with', 'kicked out', 'grounded'],
    replies: [
      "Family pressure is one of the heaviest things — it's the people who are supposed to be safe. There are conversation scripts built for this, and the Venting Vault lets you write it out and burn it. You're allowed to set boundaries with people you love.",
      "That sounds exhausting to carry at home. You can love your family and still need space from them — that's not a contradiction. Want a script for how to bring this up calmly?"
    ],
    chips: [{ label: '💬 Conversation Scripts', tab: 'parental' }]
  },
  {
    category: 'sibling',
    keywords: ['sibling', 'brother', 'sister', 'babysit', 'take care of', 'responsible for'],
    replies: [
      "Being a built-in caretaker at your age is a lot, and it's not fair. You're allowed to feel resentment AND love them at the same time. Take breaks when you can.",
      "Carrying that much responsibility for siblings at your age is genuinely a lot of unpaid labor. It's okay to feel tired of it — that doesn't make you a bad sibling."
    ],
    chips: [{ label: '💬 Family Scripts', tab: 'parental' }]
  },
  // School / grades
  {
    category: 'school',
    keywords: ['grade', 'grades', 'gpa', 'test', 'exam', 'finals', 'midterm', 'quiz', 'homework', 'assignment', 'essay', 'project', 'ap', 'sat', 'act'],
    replies: [
      "School stress is real. Grades feel like they're everything right now but they truly aren't — colleges care about growth, and adults barely look at GPA past 22. Pick ONE assignment, set a 25-min timer, do just that.",
      "Grades pressure is brutal because it feels permanent when it isn't. Perfectionism is usually the actual enemy here, not your ability — done beats perfect every time."
    ],
    chips: [{ label: '🌬️ Reframe the Thought', tab: 'anxiety' }]
  },
  {
    category: 'college',
    keywords: ['college', 'university', 'application', 'college app', 'apply', 'get into', 'rejection', 'rejected', 'ivy'],
    replies: [
      "College anxiety is legit but the process lies to you — there's no ONE right school. Almost everyone ends up happy at their eventual college. Focus on 2-3 controllable things this week.",
      "The college process makes a lot of noise about scarcity that isn't really true. Thousands of paths lead to a good life — this isn't a one-shot deal."
    ],
    chips: [{ label: '🌬️ Ground Yourself', tab: 'anxiety' }]
  },
  {
    category: 'teacher',
    keywords: ['teacher', 'unfair', 'strict teacher', 'hate school', 'hate class', 'bad teacher'],
    replies: [
      "Unfair teachers are genuinely infuriating and you're not being dramatic. Document what happens (dates + what was said), talk to a counselor if it's serious, and don't let one class define your energy."
    ]
  },
  // Social / friends
  {
    category: 'friends',
    keywords: ['friend', 'friends', 'friendship', 'no friends', 'fake friends', 'drama', 'left out', 'ghosted', 'ghosting', 'popular', 'clique', 'group chat'],
    replies: [
      "Friendship stuff in high school is BRUTAL. Cliques, group chats, being left out — it all messes with your head. Real friends make you feel calmer, not anxious. Quality over quantity, always.",
      "Feeling on the outside of a friend group hurts in a very specific way. It says more about the dynamic than it does about you being unlikeable."
    ]
  },
  {
    category: 'bully',
    keywords: ['bully', 'bullied', 'bullying', 'picked on', 'made fun', 'mean girls', 'harass'],
    replies: [
      "Being bullied is not something to just 'get over.' Please tell an adult you trust — counselor, coach, parent. Document with screenshots. This is not your fault and there ARE adults who will take it seriously."
    ]
  },
  // Breakup
  {
    category: 'breakup',
    keywords: ['breakup', 'broke up', 'break up', 'dumped', 'heartbreak', 'heartbroken', 'my ex', 'ghosted me'],
    replies: [
      "Breakups genuinely feel like grief — that's real, not dramatic. Your brain treats them like a loss. Cry, listen to sad music, then slowly reintroduce your favorite non-them things.",
      "That kind of hurt takes real time, there's no shortcut. Be extra gentle with yourself this week."
    ],
    chips: [{ label: '☀️ Something Uplifting', tab: 'depression' }]
  },
  {
    category: 'rejection',
    keywords: ['rejected', 'not interested', 'unrequited', 'said no'],
    replies: [
      "Rejection stings HARD and it's not because something is wrong with you. Their 'no' is about their preferences, not your worth."
    ]
  },
  // Romantic (general)
  {
    category: 'romance',
    keywords: ['crush', 'boyfriend', 'girlfriend', 'partner', 'dating', 'in love'],
    replies: [
      "Feelings are wild at this age. If someone's making you happier and more like yourself, that's a good sign. If they're making you anxious or jealous — that's info too."
    ]
  },
  // Identity / LGBTQ
  {
    category: 'identity',
    keywords: ['gay', 'lesbian', 'bisexual', 'bi ', 'queer', 'lgbtq', 'lgbt', 'trans', 'transgender', 'nonbinary', 'non-binary', 'coming out', 'closeted', 'gender', 'pronouns'],
    replies: [
      "You're valid however you identify, and figuring it out doesn't need a deadline. The Trevor Project (1-866-488-7386 or text START to 678-678) has 24/7 free confidential counselors trained in LGBTQ youth support — it's in the 🆘 Crisis Help modal too."
    ],
    chips: [{ label: '🆘 Crisis & Support Lines', action: 'openCrisisModal()' }]
  },
  // Substance
  {
    category: 'substance',
    keywords: ['vape', 'vaping', 'nicotine', 'juul', 'weed', 'marijuana', 'edible', 'drunk', 'drink', 'alcohol', 'shots', 'pills', 'xan', 'addicted', 'addiction', 'quit', 'cravings'],
    replies: [
      "Zero judgment. Substance stuff is really common at your age and it doesn't make you a bad person. There's a streak tracker + refusal scripts for when someone hands you something at a party. SAMHSA (1-800-662-4357) is free, confidential, 24/7."
    ],
    chips: [{ label: '🌱 Streak Tracker', tab: 'substance' }]
  },
  // Body / eating
  {
    category: 'body',
    keywords: ['fat', 'ugly', 'body', 'weight', 'skinny', 'starve', 'binge', 'purge', 'anorex', 'bulim', 'eating disorder', 'restrict', 'calories', 'appearance', 'hate my body'],
    replies: [
      "The way you feel about your body isn't the same as what's real — mirrors and mood lie to each other. If eating stuff is getting hard to control, that's worth telling someone. NEDA hotline: 1-800-931-2237."
    ]
  },
  {
    category: 'appearance',
    keywords: ['acne', 'skin', 'pimple', 'breakout', 'hair', 'ugly face'],
    replies: [
      "Skin and appearance stuff hits hardest at your age and you're not being shallow for caring. Most people are way less focused on how you look than you think."
    ]
  },
  // Stress / overwhelm
  {
    category: 'stressed',
    keywords: ['stressed', 'stress', 'overwhelmed', 'too much', 'drowning', "can't handle", 'cant handle', 'breaking down'],
    replies: [
      "Overwhelm usually means you're carrying too many mental tabs open. Write down every single thing on your mind, then circle ONE thing you can do in 15 min. Do that. Ignore the rest for tonight.",
      "That drowning feeling is a signal you're carrying too much at once, not that you're failing. Let's shrink it down to one single next step."
    ],
    chips: [{ label: '🌬️ Grounding Tools', tab: 'anxiety' }]
  },
  {
    category: 'procrastination',
    keywords: ['procrastinate', 'procrastinating', "can't start", 'cant start', 'avoiding', 'putting off'],
    replies: [
      "Procrastination is usually anxiety in disguise — your brain trying to avoid something scary. Trick it: set a 5-min timer and start the tiniest version of the task. Even opening the doc counts."
    ]
  },
  {
    category: 'angry',
    keywords: ['angry', 'anger', 'mad', 'furious', 'rage', 'want to scream', 'hate everyone'],
    replies: [
      "Anger is valid — it usually means something you care about got hurt. Get it out of your body first: run, punch a pillow, use the scribble canvas, or write in the Venting Vault. Cool down THEN act."
    ],
    chips: [{ label: '🎨 Scribble Canvas', tab: 'selfharm' }]
  },
  // Existential / meaning
  {
    category: 'existential',
    keywords: ['pointless', "what's the point", 'meaningless', 'why bother', 'why try', 'giving up'],
    replies: [
      "That flatness is a symptom, not the truth. Depression whispers 'nothing matters' but you probably still care about at least one thing — a friend, a song, a pet, a show. Start there."
    ],
    chips: [{ label: '☀️ Depression Toolkit', tab: 'depression' }]
  },
  {
    category: 'future',
    keywords: ['future', 'what am i doing', 'lost', "don't know what i want", 'career', 'major', 'purpose'],
    replies: [
      "Not knowing what you want at 15-18 is the ACTUAL normal — the confident ones are usually faking it. Pay attention to what you're curious about, not what impresses people."
    ]
  },
  // General help / how do I use this
  {
    category: 'howto',
    keywords: ['how do i', 'how to', 'help me', 'what can', 'what should i do', "don't know what to do", 'dont know what to do'],
    replies: [
      "You can tell me anything and I'll point you somewhere useful. What's actually on your mind right now?"
    ],
    chips: [
      { label: '🌬️ Anxiety Tools', tab: 'anxiety' },
      { label: '☀️ Depression Tools', tab: 'depression' },
      { label: '🛡️ Self-Harm Safety', tab: 'selfharm' }
    ]
  },
  {
    category: 'thanks',
    keywords: ['thanks', 'thank you', 'ty', 'thx', 'appreciate'],
    replies: ["Any time. Seriously. Come back whenever. 🌸", "Of course — that's what I'm here for."]
  },
  {
    category: 'whoAreYou',
    keywords: ['who are you', 'what are you', 'are you real', 'are you a bot', 'are you ai'],
    replies: [
      "I'm the getwell.ai assistant — a supportive tool built for high schoolers. I'm not a replacement for a therapist or friend, but I'm here 24/7, no judgment, and everything you type stays in your browser. For real crises, tap 🆘 Crisis Help."
    ]
  },
  {
    category: 'greeting',
    keywords: ['hi', 'hey', 'hello', 'yo', 'sup'],
    replies: ["Hey! Glad you're here. How's your day actually going — not the surface answer?", "Hi! What's actually on your mind today?"]
  }
];

const fallbackReplies = [
  "I hear you. Tell me more — what's the heaviest part right now?",
  "That sounds like a lot. If you want, we can try grounding, a micro-win, or you can just keep venting here — your call.",
  "Thank you for trusting me with that. What would feel like even 1% relief right now?",
  "You're doing the hard thing — actually naming what's going on. What do you wish someone would say back?",
  "That's real. I'm here. Do you want practical steps or just to be heard?"
];

/* ---------- Conversation state (name capture + light memory) ---------- */
let chatUserName = null;
let chatAwaitingName = false;
let chatLastCategory = null;
let chatLastReplyIdx = {};

function initChatAssistant() {
  chatUserName = localStorage.getItem('haven_user_name') || null;
  const messages = document.getElementById('chat-messages');
  if (!messages) return;

  messages.innerHTML = '';
  if (chatUserName) {
    chatAwaitingName = false;
    appendBotBubble(`👋 Hey ${escapeHtml(chatUserName)}, welcome back. I'm here to listen, share coping tools, and support you without judgment. What's going on today?`);
  } else {
    chatAwaitingName = true;
    appendBotBubble("👋 Hi! I'm your getwell.ai assistant — here to listen and help you find tools that actually fit what you're dealing with, no judgment. First: what should I call you? (First name or a nickname is totally fine.)");
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  if (!input || !messages || !input.value.trim()) return;

  const userText = input.value.trim();
  appendUserBubble(userText);
  input.value = '';

  setTimeout(() => {
    if (chatAwaitingName) {
      handleNameCapture(userText);
      return;
    }
    // Allow an explicit rename any time — kept to unambiguous phrases only
    // ("I'm anxious" / "I'm done" must NOT be mistaken for a name introduction).
    const renameMatch = userText.match(/\b(?:call me|my name(?:'s| is)|name's)\s+([a-zA-Z][a-zA-Z'-]{0,19})\b/i);
    if (renameMatch) {
      setChatUserName(renameMatch[1]);
      appendBotBubble(`Got it, ${escapeHtml(chatUserName)} — good to meet you. What's going on?`);
      return;
    }

    const { html, chips, category } = getBotReply(userText);
    appendBotBubble(html, chips);
    chatLastCategory = category;
  }, 500);
}

const NAME_CAPTURE_STOPWORDS = ['i', 'im', "i'm", 'hey', 'hi', 'hello', 'yo', 'sup', 'well', 'so', 'idk', 'uh', 'um', 'ok', 'okay', 'no', 'not', 'nothing', 'nvm', 'skip'];

function handleNameCapture(text) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  const firstTokenClean = words[0].replace(/[^a-zA-Z']/g, '').toLowerCase();
  const looksLikeName = words.length <= 3 && !/[.?!]/.test(trimmed) && !NAME_CAPTURE_STOPWORDS.includes(firstTokenClean);

  chatAwaitingName = false;

  if (!looksLikeName) {
    // They skipped the name or just started venting — that's fine, respond to
    // what they actually said instead of misreading it as a name.
    appendBotBubble("No worries, you don't need to share a name — I'm here either way.");
    const { html, chips, category } = getBotReply(trimmed);
    appendBotBubble(html, chips);
    chatLastCategory = category;
    return;
  }

  const clean = trimmed.replace(/[^a-zA-Z' -]/g, '').trim().split(/\s+/)[0] || 'friend';
  setChatUserName(clean);
  appendBotBubble(
    `Nice to meet you, ${escapeHtml(chatUserName)}! I'll remember that. You can tell me anything — school stress, family stuff, anxiety, feeling low, whatever's real right now.`,
    [
      { label: '🌬️ Anxiety Tools', tab: 'anxiety' },
      { label: '☀️ Depression Tools', tab: 'depression' },
      { label: '🛡️ Self-Harm Safety', tab: 'selfharm' }
    ]
  );
}

function setChatUserName(name) {
  const trimmed = (name || '').trim().slice(0, 20) || 'friend';
  chatUserName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  localStorage.setItem('haven_user_name', chatUserName);
}

function appendUserBubble(text) {
  const messages = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function appendBotBubble(html, chips) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = html;

  if (chips && chips.length) {
    const chipRow = document.createElement('div');
    chipRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;';
    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'btn-secondary';
      btn.style.cssText = 'padding:6px 12px; font-size:0.78rem;';
      btn.textContent = chip.label;
      btn.onclick = () => {
        if (chip.action === 'openCrisisModal()') {
          openCrisisModal();
        } else if (chip.tab) {
          switchTab(chip.tab);
        }
      };
      chipRow.appendChild(btn);
    });
    bubble.appendChild(chipRow);
  }

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function getBotReply(userText) {
  const textLower = userText.toLowerCase();

  // Score-based match: multi-word keywords use substring; single words match on word boundaries
  // so "boyfriend" doesn't trigger "friend" and "friends" doesn't trigger via "friend".
  let bestScore = 0;
  let bestItem = null;
  for (const item of botResponses) {
    let score = 0;
    for (const k of item.keywords) {
      const kNorm = k.trim();
      const hasSpace = kNorm.includes(' ');
      if (hasSpace) {
        if (textLower.includes(kNorm)) score++;
      } else {
        const re = new RegExp('\\b' + kNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (re.test(textLower)) score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  let replyText;
  let category;
  let chips;

  if (bestItem) {
    category = bestItem.category;
    chips = bestItem.chips;
    const idxKey = category;
    let idx = Math.floor(Math.random() * bestItem.replies.length);
    // Avoid repeating the exact same variant twice in a row on the same topic
    if (bestItem.replies.length > 1 && chatLastReplyIdx[idxKey] === idx) {
      idx = (idx + 1) % bestItem.replies.length;
    }
    chatLastReplyIdx[idxKey] = idx;
    replyText = bestItem.replies[idx];
  } else {
    category = 'fallback';
    replyText = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  }

  // Occasionally personalize with the user's name (skip for crisis — keep that message clean/serious)
  if (chatUserName && category !== 'crisis' && Math.random() < 0.4) {
    replyText = `${chatUserName}, ${replyText.charAt(0).toLowerCase()}${replyText.slice(1)}`;
  }

  return { html: escapeHtml(replyText), chips, category };
}

/* Journal */
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
