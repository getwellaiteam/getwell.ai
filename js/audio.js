/* Web Audio API Synthesizer for Haven Ambient Soundscapes */

let audioCtx = null;
let activeNodes = {
  rain: null,
  waves: null,
  binaural: null,
  piano: null
};

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function toggleAudioSound(type) {
  const btn = document.querySelector(`.btn-audio[data-sound="${type}"]`);
  
  if (activeNodes[type]) {
    // Stop sound
    stopSound(type);
    if (btn) btn.classList.remove('active');
  } else {
    // Start sound
    startSound(type);
    if (btn) btn.classList.add('active');
  }
}

function startSound(type) {
  const ctx = getAudioContext();
  
  if (type === 'rain') {
    // Realistic rain: high-passed white noise (hiss) + random droplet clicks
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Bright hiss with subtle amplitude flicker
      const flicker = 0.85 + Math.sin(i / 800) * 0.15;
      data[i] = (Math.random() * 2 - 1) * 0.6 * flicker;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // High-pass to remove low rumble (rain is bright)
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;

    // Low-pass to soften harsh highs
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6500;

    // Peak filter to give rain that "shhhh" splash character
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 3000;
    peak.Q.value = 0.7;
    peak.gain.value = 4;

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    noise.connect(hp);
    hp.connect(lp);
    lp.connect(peak);
    peak.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    // Droplet transients — periodic click bursts
    const dropletTimer = setInterval(() => {
      const dropCtx = getAudioContext();
      const bufS = Math.floor(dropCtx.sampleRate * 0.04);
      const dBuf = dropCtx.createBuffer(1, bufS, dropCtx.sampleRate);
      const dd = dBuf.getChannelData(0);
      for (let i = 0; i < bufS; i++) {
        dd[i] = (Math.random() * 2 - 1) * (1 - i / bufS);
      }
      const dSrc = dropCtx.createBufferSource();
      dSrc.buffer = dBuf;
      const dHP = dropCtx.createBiquadFilter();
      dHP.type = 'bandpass';
      dHP.frequency.value = 2800 + Math.random() * 2200;
      dHP.Q.value = 8;
      const dG = dropCtx.createGain();
      dG.gain.value = 0.08 + Math.random() * 0.06;
      dSrc.connect(dHP).connect(dG).connect(dropCtx.destination);
      dSrc.start();
    }, 45);

    activeNodes.rain = { source: noise, gain: gain, dropletTimer };

  } else if (type === 'waves') {
    // Ocean waves: filtered noise with slow LFO for surf swell rhythm
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Wave "roar" — bandpass around low-mid
    const bp = ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.7;

    // Slight rumble
    const lowBoost = ctx.createBiquadFilter();
    lowBoost.type = 'lowshelf';
    lowBoost.frequency.value = 250;
    lowBoost.gain.value = 5;

    const gain = ctx.createGain();
    gain.gain.value = 0.001; // start silent, LFO swells it

    // LFO on gain — the "wave rolls in" swell
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.13; // ~8 sec cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.22;

    // Bias gain up so it's not silent
    const biasGain = ctx.createConstantSource();
    biasGain.offset.value = 0.28;

    biasGain.connect(gain.gain);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    // Second LFO on filter cutoff — makes the wave "breathe"
    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.13;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 500;
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(bp.frequency);

    noise.connect(lowBoost);
    lowBoost.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    lfo.start();
    lfo2.start();
    biasGain.start();

    activeNodes.waves = { source: noise, lfo: lfo, lfo2: lfo2, bias: biasGain, gain: gain };

  } else if (type === 'binaural') {
    // 432 Hz calming focus tone
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);
    const gain = ctx.createGain();
    
    oscL.frequency.value = 216; // 432 Hz harmonic
    oscR.frequency.value = 222; // 6 Hz delta binaural beat
    
    gain.gain.value = 0.12;
    
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(ctx.destination);
    
    oscL.start();
    oscR.start();
    activeNodes.binaural = { oscL: oscL, oscR: oscR, gain: gain };
    
  } else if (type === 'piano') {
    // Warm ambient sine chord synth
    const freqs = [130.81, 164.81, 196.00, 246.94]; // C major 7 chord
    const oscs = freqs.map(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      return osc;
    });
    
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    
    oscs.forEach(osc => {
      osc.connect(gain);
      osc.start();
    });
    
    gain.connect(ctx.destination);
    activeNodes.piano = { oscs: oscs, gain: gain };
  }
}

function stopSound(type) {
  if (!activeNodes[type]) return;

  const node = activeNodes[type];
  if (type === 'rain') {
    if (node.source) node.source.stop();
    if (node.dropletTimer) clearInterval(node.dropletTimer);
  } else if (type === 'waves') {
    if (node.source) node.source.stop();
    if (node.lfo) node.lfo.stop();
    if (node.lfo2) node.lfo2.stop();
    if (node.bias) node.bias.stop();
  } else if (type === 'binaural') {
    if (node.oscL) node.oscL.stop();
    if (node.oscR) node.oscR.stop();
  } else if (type === 'piano' && node.oscs) {
    node.oscs.forEach(o => o.stop());
  }

  activeNodes[type] = null;
}

/* ===== Spotify Modal ===== */
function openSpotifyModal() {
  const modal = document.getElementById('spotify-modal');
  if (modal) modal.classList.add('active');
}
function closeSpotifyModal() {
  const modal = document.getElementById('spotify-modal');
  if (modal) modal.classList.remove('active');
}
function closeSpotifyOnOverlay(e) {
  if (e.target && e.target.id === 'spotify-modal') closeSpotifyModal();
}

function parseSpotifyUrl(input) {
  if (!input) return null;
  const s = input.trim();
  // Match track/playlist/album/episode/show URLs
  const m = s.match(/open\.spotify\.com\/(track|playlist|album|episode|show)\/([a-zA-Z0-9]+)/);
  if (m) return { type: m[1], id: m[2] };
  // Match URI form: spotify:track:xxx
  const uri = s.match(/spotify:(track|playlist|album|episode|show):([a-zA-Z0-9]+)/);
  if (uri) return { type: uri[1], id: uri[2] };
  return null;
}

function loadSpotify() {
  const input = document.getElementById('spotify-input');
  const container = document.getElementById('spotify-embed-container');
  if (!input || !container) return;

  const parsed = parseSpotifyUrl(input.value);
  if (parsed) {
    container.innerHTML = `<iframe
      style="border-radius:12px; border:0;"
      src="https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=getwell"
      width="100%" height="352" frameBorder="0" allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"></iframe>`;
  } else {
    // Fall back to search
    const q = encodeURIComponent(input.value.trim() || 'lofi');
    container.innerHTML = `
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">Not a Spotify link — opening search on Spotify web:</p>
      <a href="https://open.spotify.com/search/${q}" target="_blank" rel="noopener"
         class="btn-primary" style="background:linear-gradient(135deg,#1DB954,#1ed760); display:inline-flex;">
         🔍 Search "${input.value.trim()}" on Spotify
      </a>`;
  }
}

function openSpotifyExternal() {
  const input = document.getElementById('spotify-input');
  if (!input || !input.value.trim()) return;
  const parsed = parseSpotifyUrl(input.value);
  const url = parsed
    ? `https://open.spotify.com/${parsed.type}/${parsed.id}`
    : `https://open.spotify.com/search/${encodeURIComponent(input.value.trim())}`;
  window.open(url, '_blank', 'noopener');
}
