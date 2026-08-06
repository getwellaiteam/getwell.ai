/* Parental Pressure & Family Dynamics Module */

const parentScripts = {
  academic: `<strong>Script for Academic Pressure & Burnout:</strong><br><br>
    "Mom / Dad, I know you want me to succeed and get into a great college because you care about my future. But right now, the pressure is causing me extreme anxiety and burnout. I am trying my best, and I need your support and understanding rather than just focusing on my grades."`,
    
  privacy: `<strong>Script for Privacy & Personal Boundaries:</strong><br><br>
    "I appreciate how much you look out for me, but I'm growing up and need some privacy to process my thoughts and school stress. Having my own space helps me feel grounded and trusted."`,

  parenting: `<strong>Script for Sibling Care & Responsibility Load:</strong><br><br>
    "I love helping out with my brothers/sisters, but balancing taking care of them along with my schoolwork and mental health is becoming overwhelming. Can we figure out a schedule so I also have time for my studies and rest?"`,

  future: `<strong>Script for Career / Future Expectations:</strong><br><br>
    "I respect your experience and advice, but I'm trying to figure out what path genuinely fits my strengths and happiness. I'd love if we could talk about options without feeling like there's only one right path."`
};

function updateParentScript() {
  const select = document.getElementById('script-scenario-select');
  const box = document.getElementById('script-result-box');
  if (!select || !box) return;

  const val = select.value;
  box.innerHTML = parentScripts[val] || '';
}

function burnThought() {
  const input = document.getElementById('vent-input');
  if (!input || !input.value.trim()) {
    alert("Please write a thought to burn first!");
    return;
  }

  // Animation effect
  input.style.transition = 'all 0.8s ease-in-out';
  input.style.transform = 'scale(0.8) rotate(5deg)';
  input.style.opacity = '0.2';
  input.style.background = '#f43f5e';

  setTimeout(() => {
    input.value = '';
    input.style.transform = 'none';
    input.style.opacity = '1';
    input.style.background = 'var(--bg-surface-elevated)';
    alert('🔥 Your thought was shredded and burned. It no longer holds power over you.');
  }, 800);
}
