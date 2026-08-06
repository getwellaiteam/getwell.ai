/* Crisis & Privacy Shield Module */

function openCrisisModal() {
  const modal = document.getElementById('crisis-modal');
  if (modal) modal.classList.add('active');
}

function closeCrisisModal() {
  const modal = document.getElementById('crisis-modal');
  if (modal) modal.classList.remove('active');
}

function closeCrisisModalOnOverlay(event) {
  if (event.target.id === 'crisis-modal') {
    closeCrisisModal();
  }
}

function toggleDiscreetMode() {
  const discreet = document.getElementById('discreet-mode');
  if (!discreet) return;

  const isActive = discreet.classList.contains('active');
  if (isActive) {
    discreet.classList.remove('active');
    discreet.setAttribute('aria-hidden', 'true');
  } else {
    discreet.classList.add('active');
    discreet.setAttribute('aria-hidden', 'false');
  }
}

// Global Keyboard Listener for ESC (Discreet Mode)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleDiscreetMode();
  }
});
