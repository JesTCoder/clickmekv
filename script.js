const showCakeBtn = document.getElementById("showCakeBtn");
const cakeContainer = document.getElementById("cakeContainer");
const partyDecor = document.getElementById("partyDecor");
const confetti = document.getElementById("confetti");
const cakeSvg = document.getElementById("cake");

const music1 = document.getElementById("music1");
const music2 = document.getElementById("music2");
const music3 = document.getElementById("music3");
const volumeSlider = document.getElementById("volumeSlider");

const confettiColors = ["#ff4d6d", "#ff8fa3", "#ffb3c6", "#fb6f92", "#ffc2d1", "#e91e63", "#ff6fb1", "#ffb347"];

const volIconSvg = {
  mute: '<path d="M11 5L6.6 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.6L11 19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" fill="currentColor"/><path d="M15.3 9.3a1 1 0 0 1 1.4 0L19 11.6l2.3-2.3a1 1 0 0 1 1.4 1.4L20.4 13l2.3 2.3a1 1 0 0 1-1.4 1.4L19 14.4l-2.3 2.3a1 1 0 1 1-1.4-1.4l2.3-2.3-2.3-2.3a1 1 0 0 1 0-1.4z" fill="currentColor"/>',
  low: '<path d="M11 5L6.6 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.6L11 19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" fill="currentColor"/><path d="M14.5 9.5a1 1 0 0 1 1.4 0 4 4 0 0 1 0 5.7 1 1 0 1 1-1.4-1.4 2 2 0 0 0 0-2.9 1 1 0 0 1 0-1.4z" fill="currentColor"/>',
  mid: '<path d="M11 5L6.6 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.6L11 19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" fill="currentColor"/><path d="M14.5 9.5a1 1 0 0 1 1.4 0 4 4 0 0 1 0 5.7 1 1 0 1 1-1.4-1.4 2 2 0 0 0 0-2.9 1 1 0 0 1 0-1.4z" fill="currentColor"/><path d="M16.9 7.1a1 1 0 0 1 1.4 0 7 7 0 0 1 0 9.8 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-7 1 1 0 0 1 0-1.4z" fill="currentColor"/>',
  high: '<path d="M11 5L6.6 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.6L11 19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" fill="currentColor"/><path d="M14.5 9.5a1 1 0 0 1 1.4 0 4 4 0 0 1 0 5.7 1 1 0 1 1-1.4-1.4 2 2 0 0 0 0-2.9 1 1 0 0 1 0-1.4z" fill="currentColor"/><path d="M16.9 7.1a1 1 0 0 1 1.4 0 7 7 0 0 1 0 9.8 1 1 0 0 1-1.4-1.4 5 5 0 0 0 0-7 1 1 0 0 1 0-1.4z" fill="currentColor"/><path d="M18.5 5.5a1 1 0 0 1 1.4 0 10 10 0 0 1 0 14.1 1 1 0 0 1-1.4-1.4 8 8 0 0 0 0-11.3 1 1 0 0 1 0-1.4z" fill="currentColor"/>'
};

let masterVolume = 0.85;

function resetAndPauseCakeAnimation() {
  if (!cakeSvg) return;
  // SMIL animations can keep progressing even when hidden; force them to start only on button click.
  cakeSvg.pauseAnimations?.();
  cakeSvg.setCurrentTime?.(0);
}

function startCakeAnimationFromBeginning() {
  if (!cakeSvg) return;
  cakeSvg.setCurrentTime?.(0);
  cakeSvg.unpauseAnimations?.();
}

function safePlay(audioEl) {
  if (!audioEl) return Promise.resolve();
  const result = audioEl.play?.();
  if (result && typeof result.catch === "function") {
    return result.catch(() => {});
  }
  return Promise.resolve();
}

function applyVolume() {
  const setVol = (el, base) => {
    if (!el) return;
    el.volume = base * masterVolume;
  };
  setVol(music1, 0.85);
  setVol(music2, 0.9);
  setVol(music3, 0.75);
}

function tryStartMusic1() {
  if (!music1) return;
  applyVolume();
  if (music1.paused) safePlay(music1);
}

function crossfade(fromEl, toEl, toTarget, durationMs = 1600) {
  if (!toEl) return;

  toEl.loop = true;

  const from = fromEl ?? null;
  const to = toEl;

  const fromStart = from ? from.volume : 0;
  const effectiveTarget = toTarget * masterVolume;

  to.volume = 0;
  safePlay(to);

  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / durationMs);

    const eased = 0.5 - Math.cos(t * Math.PI) / 2;

    if (from) from.volume = fromStart * (1 - eased);
    to.volume = effectiveTarget * eased;

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    if (from) {
      from.volume = 0;
      from.pause?.();
      from.currentTime = 0;
    }
    to.volume = effectiveTarget;
  };

  requestAnimationFrame(tick);
}

function launchConfetti() {
  if (!confetti) return;

  confetti.innerHTML = "";

  for (let i = 0; i < 200; i += 1) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 140 + Math.random() * 280;
    const duration = 1.2 + Math.random() * 0.8;
    const delay = Math.random() * 0.25;
    const size = 5 + Math.random() * 10;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    piece.className = "confetti-piece";
    piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.6}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;

    confetti.appendChild(piece);
  }

  setTimeout(() => {
    confetti.innerHTML = "";
  }, 2500);
}

if (showCakeBtn && cakeContainer) {
  showCakeBtn.addEventListener("click", () => {
    // Prevent any single-frame flash of SVG parts:
    // reset/pause first, show container, then start animation next frame.
    resetAndPauseCakeAnimation();
    cakeContainer.hidden = false;

    cakeContainer.classList.add("show");
    partyDecor?.classList.add("show");
    showCakeBtn.classList.add("is-fading-out");
    window.setTimeout(() => {
      showCakeBtn.style.display = "none";
    }, 340);

    crossfade(music1, music2, 0.9, 1600);

    // Fade out the "Happy Birthday!" banner after click.
    const banner = document.querySelector(".banner");
    banner?.classList.add("banner-fade-out");

    requestAnimationFrame(() => {
      startCakeAnimationFromBeginning();
    });

    setTimeout(() => {
      launchConfetti();
    }, 6800);

    // Show blow hint after cake animation finishes
    setTimeout(() => {
      const hint = document.getElementById("blowHint");
      if (hint) hint.classList.add("reveal");
    }, 6800);
  });
}

// Attempt to start music1 on entry; if autoplay is blocked,
// this will succeed on the first user interaction.
tryStartMusic1();
window.addEventListener("pageshow", tryStartMusic1);
document.addEventListener("pointerdown", tryStartMusic1, { once: true });
document.addEventListener("keydown", tryStartMusic1, { once: true });

const volIcon = document.getElementById("volIcon");

function updateVolumeIcon(val) {
  if (!volIcon) return;
  const v = Number(val);
  if (v === 0) volIcon.innerHTML = volIconSvg.mute;
  else if (v <= 33) volIcon.innerHTML = volIconSvg.low;
  else if (v <= 66) volIcon.innerHTML = volIconSvg.mid;
  else volIcon.innerHTML = volIconSvg.high;
}

if (volumeSlider) {
  updateVolumeIcon(volumeSlider.value);
  volumeSlider.addEventListener("input", () => {
    masterVolume = volumeSlider.value / 100;
    applyVolume();
    updateVolumeIcon(volumeSlider.value);
  });
}

let prevVolume = 85;

if (volIcon) {
  volIcon.style.cursor = "pointer";
  volIcon.addEventListener("click", () => {
    const current = Number(volumeSlider.value);
    if (current === 0) {
      volumeSlider.value = String(prevVolume);
      masterVolume = prevVolume / 100;
    } else {
      prevVolume = current;
      volumeSlider.value = "0";
      masterVolume = 0;
    }
    applyVolume();
    updateVolumeIcon(volumeSlider.value);
  });
}

resetAndPauseCakeAnimation();

/* ============================================== Blow detection & letter
*/
const letterContainer = document.getElementById("letterContainer");
const closeLetterBtn = document.getElementById("closeLetterBtn");
let blowDetectionReady = false;
let isBlown = false;

function createSmokePuff(parent) {
  const puff = document.createElement("div");
  puff.className = "smoke-puff";
  const size = 14 + Math.random() * 20;
  puff.style.width = size + "px";
  puff.style.height = size + "px";
  puff.style.animationDuration = (0.6 + Math.random() * 0.5) + "s";
  puff.style.marginLeft = (-size / 2) + "px";
  parent.appendChild(puff);
  setTimeout(() => puff.remove(), 1200);
}

function blowOutCandle() {
  if (isBlown) return;
  isBlown = true;

  const velas = document.querySelector(".velas");
  const fuegos = document.querySelectorAll(".fuego");

  fuegos.forEach((el) => {
    el.style.animation = "none";
    el.style.opacity = "0";
  });

  velas.classList.add("blown");

  for (let i = 0; i < 6; i++) {
    setTimeout(() => createSmokePuff(velas), i * 120);
  }

  const blowHint = document.getElementById("blowHint");
  if (blowHint) blowHint.classList.add("hidden");

  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
  }

  // Crossfade from music2 to music3
  if (music2 && music3) {
    crossfade(music2, music3, 0.75, 1600);
  } else if (music3) {
    music3.volume = 0.75 * masterVolume;
    music3.loop = true;
    safePlay(music3);
  }

  showLetter();
}

function formatLetterLines() {
  const container = document.querySelector(".letter-content");
  if (!container) return;
  const paragraphs = container.querySelectorAll("p");
  paragraphs.forEach((p) => {
    const text = p.innerHTML;
    const blocks = text.split(/\n\s*\n/);
    if (blocks.length > 1) {
      const frag = document.createDocumentFragment();
      blocks.forEach((block) => {
        const lines = block.trim().split("\n");
        const newP = document.createElement("p");
        newP.innerHTML = lines.map((l) => l.trim()).join("<br>");
        frag.appendChild(newP);
      });
      p.replaceWith(frag);
    } else if (text.includes("\n")) {
      p.innerHTML = text.split("\n").map((l) => l.trim()).join("<br>");
    }
  });
}

function showLetter() {
  if (!letterContainer) return;
  formatLetterLines();
  letterContainer.hidden = false;
  requestAnimationFrame(() => {
    letterContainer.classList.add("show");
  });
}

function hideLetter() {
  if (!letterContainer) return;
  letterContainer.classList.remove("show");
  // Crossfade from music3 back to music2
  if (music2 && music3) {
    crossfade(music3, music2, 0.9, 1200);
  } else if (music3) {
    music3.volume = 0;
    music3.pause();
    music3.currentTime = 0;
  }
  setTimeout(() => {
    letterContainer.hidden = true;
  }, 400);
}

// -- Blow detection via microphone --
let audioContext = null;
let analyser = null;
let mediaStream = null;

function listenForBlow() {
  if (!analyser || isBlown) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let blowFrames = 0;
  const threshold = 0.28;
  const frameThreshold = 8;

  function check() {
    if (isBlown) return;
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = (dataArray[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    if (rms > threshold) {
      blowFrames++;
      if (blowFrames >= frameThreshold) {
        blowOutCandle();
        return;
      }
    } else {
      blowFrames = 0;
    }

    requestAnimationFrame(check);
  }

  check();
}

async function setupBlowDetection() {
  if (blowDetectionReady || isBlown) return;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    blowDetectionReady = true;
    listenForBlow();
  } catch {
    // Microphone not available or denied — user can still close letter manually
  }
}

// Start blow detection after cake is fully animated (hint appears at 8s)
if (showCakeBtn) {
  showCakeBtn.addEventListener("click", () => {
    setTimeout(setupBlowDetection, 6500);
  }, { once: true });
}

if (closeLetterBtn) {
  closeLetterBtn.addEventListener("click", hideLetter);
}
