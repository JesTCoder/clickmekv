const showCakeBtn = document.getElementById("showCakeBtn");
const cakeContainer = document.getElementById("cakeContainer");
const partyDecor = document.getElementById("partyDecor");
const confetti = document.getElementById("confetti");
const cakeSvg = document.getElementById("cake");

const music1 = document.getElementById("music1");
const music2 = document.getElementById("music2");
const muteBtn = document.getElementById("muteBtn");

const confettiColors = ["#ff4d6d", "#ff8fa3", "#ffb3c6", "#fb6f92", "#ffc2d1", "#e91e63", "#ff6fb1", "#ffb347"];

let isMuted = false;

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

function setMuted(nextMuted) {
  isMuted = Boolean(nextMuted);
  if (music1) music1.muted = isMuted;
  if (music2) music2.muted = isMuted;

  if (muteBtn) {
    muteBtn.setAttribute("aria-pressed", String(isMuted));
    muteBtn.setAttribute("aria-label", isMuted ? "Unmute background music" : "Mute background music");
  }
}

function isAnyMusicPlaying() {
  const isPlaying = (el) => Boolean(el && !el.paused && !el.ended && el.readyState >= 2);
  return isPlaying(music1) || isPlaying(music2);
}

function updatePlayingUI() {
  if (!muteBtn) return;
  muteBtn.dataset.playing = isAnyMusicPlaying() ? "true" : "false";
}

function tryStartMusic1() {
  if (!music1) return;
  if (music1.volume === 1) music1.volume = 0.85;
  music1.muted = isMuted;
  if (music1.paused) safePlay(music1);
  updatePlayingUI();
}

function crossfade(fromEl, toEl, durationMs = 1600) {
  if (!toEl) return;

  toEl.muted = isMuted;
  toEl.loop = true;

  const from = fromEl ?? null;
  const to = toEl;

  const fromStart = from ? from.volume : 0;
  const toTarget = 0.9;

  to.volume = 0;
  safePlay(to);
  updatePlayingUI();

  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / durationMs);

    // cosine-ish ease
    const eased = 0.5 - Math.cos(t * Math.PI) / 2;

    if (from) from.volume = fromStart * (1 - eased);
    to.volume = toTarget * eased;

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    if (from) {
      // Force music1 to be inaudible even if pause is delayed/blocked.
      from.volume = 0;
      from.pause?.();
      from.currentTime = 0;
    }
    to.volume = toTarget;
    updatePlayingUI();
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

    crossfade(music1, music2, 1600);

    // Fade out the "Happy Birthday!" banner after click.
    const banner = document.querySelector(".banner");
    banner?.classList.add("banner-fade-out");

    requestAnimationFrame(() => {
      startCakeAnimationFromBeginning();
    });

    setTimeout(() => {
      launchConfetti();
    }, 6800);
  });
}

// Attempt to start music1 on entry; if autoplay is blocked,
// this will succeed on the first user interaction.
tryStartMusic1();
window.addEventListener("pageshow", tryStartMusic1);
document.addEventListener("pointerdown", tryStartMusic1, { once: true });
document.addEventListener("keydown", tryStartMusic1, { once: true });

if (muteBtn) {
  const stopEvt = (e) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    e.stopImmediatePropagation?.();
  };

  muteBtn.addEventListener("pointerdown", stopEvt);
  muteBtn.addEventListener("click", (e) => {
    stopEvt(e);
    setMuted(!isMuted);
    // If unmuting, try to ensure something is playing.
    if (!isMuted) {
      if (music2 && !music2.paused) safePlay(music2);
      else tryStartMusic1();
    }
    updatePlayingUI();
  });
}

setMuted(false);
updatePlayingUI();
resetAndPauseCakeAnimation();

[music1, music2].forEach((el) => {
  if (!el) return;
  el.addEventListener("play", updatePlayingUI);
  el.addEventListener("pause", updatePlayingUI);
  el.addEventListener("ended", updatePlayingUI);
});
