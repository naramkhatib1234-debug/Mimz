/* ================================================================
   ================================================================
   CUSTOMIZE ME — everything you'll probably want to change lives
   in this top section. The actual "engine" code is further below
   and you shouldn't need to touch it.
   ================================================================
   ================================================================ */

// ----------------------------------------------------------------
// 1) SILLY QUESTIONS
//    Add, remove, or edit as many as you like. Each one needs a
//    "question" string and a list of "options" strings.
//    The episode label at the top updates automatically.
// ----------------------------------------------------------------
const QUESTIONS = [
  {
    question: "Who is objectively more annoying?",
    options: ["Me", "You", "Obviously you", "This question is unfair 😭"],
  },
  {
    question: "If we were stuck in a zombie apocalypse, who would survive longer?",
    options: ["Me", "You", "We'd both be cooked 💀"],
  },
  {
    question: "Who would win an argument?",
    options: ["Me", "You", "Neither. We'd just keep arguing."],
  },
  {
    question: "If I stole your fries, what would you do?",
    options: ["Forgive me ❤️", "Fight me", "Steal mine back", "Cry dramatically"],
  },
  {
    question: "Important scientific question: are we cute together?",
    options: ["Yes", "Obviously", "Extremely", "Who made this questionnaire?"],
  },
];

// Little "episode" titles shown top-left, one per screen you reach (in order).
// Purely cosmetic — edit freely, or leave as-is.
const EPISODE_LABELS = {
  intro: "EPISODE 1: The Setup",
  questions: "EPISODE 2: The Interrogation",
  suspense: "EPISODE 3: The Build-Up",
  bigquestion: "EPISODE 4: The Verdict",
  celebration: "EPISODE 5: The Aftermath",
  countdown: "EPISODE 6: The Big Moment",
  cringewarning: "EPISODE 7: A Warning",
  final: "SEASON FINALE",
};

// Reactions shown briefly after ANY answer during the silly questions.
// One is picked at random each time.
const REACTIONS = [
  "Interesting answer...",
  "Noted. This information will be used later.",
  "Hmmm... suspicious.",
  "Duly recorded 📝",
  "The council will review this.",
  "Fascinating choice.",
  "That says a lot about you.",
  "We'll circle back to this.",
  "Okay, moving on...",
];

// ----------------------------------------------------------------
// 2) THE SUSPENSE SEQUENCE
//    Lines shown one at a time before the big question, each with
//    its own display duration (ms).
// ----------------------------------------------------------------
const SUSPENSE_LINES = [
  { text: "Okay...", duration: 1300 },
  { text: "One final question.", duration: 1700 },
  { text: "Are you ready?", duration: 1200 },
];

// ----------------------------------------------------------------
// 3) THE "NO" BUTTON TAUNTS
//    Shown one at a time (in order, then repeating/random) every
//    time the NO button is clicked on the big question.
// ----------------------------------------------------------------
const NO_MESSAGES = [
  "Are you sure? 🤨",
  "Think again.",
  "Wrong answer detected.",
  "That button seems to be shrinking...",
  "Interesting choice... try again 😭",
  "Girl please.",
  "The NO button is not feeling confident right now.",
  "This is starting to look like denial.",
  "Almost impossible to click now, huh?",
];

const NO_FINAL_MESSAGE = "Okay, we've run out of reasonable options.";

// How many taps of NO before it maxes out its shrinking/moving and
// just sits there, tiny, while YES becomes the obvious choice.
const NO_MAX_TAPS = 8;

// ----------------------------------------------------------------
// 4) CELEBRATION + FINAL SCENE TEXT
// ----------------------------------------------------------------
const CELEBRATE_TEXT = "I KNEW IT. ❤️";
const CELEBRATE_SUB = "Okay okay... ready?";

const FINAL_TEXT_1 = "Looks like you're stuck with me ❤️";
const FINAL_TEXT_2 = "Good choice.";

// ----------------------------------------------------------------
// 4b) THE "CRINGE WARNING" SCREEN
//    Shown right after the countdown, right before the song/montage
//    starts. Same timed-line format as SUSPENSE_LINES above.
// ----------------------------------------------------------------
const CRINGE_LINES = [
  { text: "Okay...", duration: 1100 },
  { text: "One more thing before we go.", duration: 1500 },
  { text: "This next part is extremely cringe.", duration: 1700 },
  { text: "But I had to do it. 😭❤️", duration: 1600 },
];

// ----------------------------------------------------------------
// 4c) THE COUPLE-EDIT MONTAGE (plays once the song starts)
//    Cycles through the illustrated "frames" in index.html
//    (search for "montage-frame") with a caption under each beat,
//    like a little TikTok-edit montage of cartoon couples.
//    MONTAGE_STEP_DURATION is how long each beat/caption lasts (ms).
//    MONTAGE_TOTAL_STEPS is how many beats play before it settles
//    on the closing message — tune both to match your song's vibe.
// ----------------------------------------------------------------
const MONTAGE_CAPTIONS = [
  "just us being ridiculous",
  "certified cute overload",
  "no thoughts, just this",
  "10/10, no notes",
];
const MONTAGE_STEP_DURATION = 2200; // ms per frame/caption
const MONTAGE_TOTAL_STEPS = 8; // cycles through the 4 frames twice

// ----------------------------------------------------------------
// 5) THE SONG
//    Drop your own legally-obtained audio file at assets/song.mp3.
//    SONG_START_TIME is the timestamp (in seconds) where playback
//    begins — set this to the exact moment/line of the song you
//    want to use.
//    SONG_DURATION is how many seconds to play before auto-stopping,
//    so the site plays ONLY that section instead of continuing into
//    the rest of the track. Match it to the length of the part
//    you're using, and to how long you want the couple montage
//    below to run for.
// ----------------------------------------------------------------
const SONG_START_TIME = 0; // <-- change this, e.g. 43.5 for 0:43.5
const SONG_DURATION = 17.6; // <-- seconds to play before auto-stopping

// ----------------------------------------------------------------
// 6) COLORS
//    All colors are CSS variables — edit them in style.css under
//    the ":root" section near the top of the file.
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// 7) COUPLE ILLUSTRATIONS
//    The illustrations are inline SVGs directly in index.html
//    (search for "couple-svg"). There are two: one for the intro/
//    final scenes, and a jumping version for the celebration
//    screen. Colors for hair/skin/outfits are set as SVG "fill"
//    attributes right there if you want to tweak them.
// ----------------------------------------------------------------


/* ================================================================
   ================================================================
   ENGINE — you probably don't need to edit below this line.
   ================================================================
   ================================================================ */

// ---------- Small guard so double-taps can't skip/break screens ----------
let isTransitioning = false;

// ---------- Screen elements ----------
const screens = document.querySelectorAll(".screen");
const episodeLabelEl = document.getElementById("episode-label");

function showScreen(name) {
  screens.forEach((s) => {
    if (s.dataset.screen === name) {
      s.classList.remove("leaving");
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });
  if (EPISODE_LABELS[name]) {
    episodeLabelEl.textContent = EPISODE_LABELS[name];
  }
}

function goToScreen(name, delay = 0) {
  if (isTransitioning) return;
  isTransitioning = true;
  const current = document.querySelector(".screen.active");
  if (current) current.classList.add("leaving");
  setTimeout(() => {
    showScreen(name);
    isTransitioning = false;
  }, delay);
}

/* ================================================================
   FLOATING BACKGROUND HEARTS
   ================================================================ */
const heartsBg = document.getElementById("hearts-bg");
const HEART_EMOJIS = ["💗", "💕", "💖", "✨", "💓"];

function spawnFloatingHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  const size = 12 + Math.random() * 18;
  const left = Math.random() * 100;
  const duration = 8 + Math.random() * 8;
  const drift = (Math.random() - 0.5) * 120;

  heart.style.left = left + "vw";
  heart.style.fontSize = size + "px";
  heart.style.animationDuration = duration + "s";
  heart.style.setProperty("--drift", drift + "px");

  heartsBg.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

// Keep a gentle stream of hearts going the whole time.
setInterval(spawnFloatingHeart, 900);
for (let i = 0; i < 4; i++) setTimeout(spawnFloatingHeart, i * 300);

/* ================================================================
   CONFETTI (canvas-based, no external libraries)
   ================================================================ */
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiRunning = false;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ["#ff6f91", "#ffb6c9", "#c9b6f0", "#ffd166", "#e8517a", "#fff"];

function launchConfetti(count = 90) {
  const w = confettiCanvas.width;
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      life: 0,
      maxLife: 240 + Math.random() * 80,
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.rotation += p.rotSpeed;
    p.life++;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.fillStyle = p.color;
    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  confettiParticles = confettiParticles.filter(
    (p) => p.life < p.maxLife && p.y < confettiCanvas.height + 60
  );

  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ================================================================
   TINY SOUND EFFECTS (Web Audio API — no external files needed)
   ================================================================ */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

function playBeep(freq = 440, duration = 0.12, volume = 0.06) {
  const ac = getAudioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.stop(ac.currentTime + duration + 0.02);
}

function playPop() {
  playBeep(520, 0.08, 0.05);
}

/* ================================================================
   SCREEN 1 -> 2: START BUTTON
   ================================================================ */
document.getElementById("btn-start").addEventListener("click", () => {
  playPop();
  getAudioCtx(); // unlock audio context early on first real user gesture
  startQuestions();
});

/* ================================================================
   SCREEN 2: SILLY QUESTIONS
   ================================================================ */
let currentQuestionIndex = 0;

const progressDotsEl = document.getElementById("progress-dots");
const questionTextEl = document.getElementById("question-text");
const optionsListEl = document.getElementById("options-list");
const reactionToastEl = document.getElementById("reaction-toast");

function buildProgressDots() {
  progressDotsEl.innerHTML = "";
  QUESTIONS.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "progress-dot";
    progressDotsEl.appendChild(dot);
  });
}

function updateProgressDots() {
  const dots = progressDotsEl.querySelectorAll(".progress-dot");
  dots.forEach((dot, i) => {
    dot.classList.remove("done", "current");
    if (i < currentQuestionIndex) dot.classList.add("done");
    if (i === currentQuestionIndex) dot.classList.add("current");
  });
}

function startQuestions() {
  currentQuestionIndex = 0;
  buildProgressDots();
  goToScreen("questions", 350);
  setTimeout(renderQuestion, 400);
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestionIndex];
  updateProgressDots();
  questionTextEl.textContent = q.question;
  optionsListEl.innerHTML = "";

  q.options.forEach((optionText) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.addEventListener("click", () => handleOptionClick(btn));
    optionsListEl.appendChild(btn);
  });
}

let answering = false;
function handleOptionClick(btn) {
  if (answering) return; // prevent double-click bugs
  answering = true;
  playPop();

  // mark chosen + disable all options briefly
  const allOptions = optionsListEl.querySelectorAll(".option-btn");
  allOptions.forEach((b) => (b.disabled = true));
  btn.classList.add("chosen");

  showReactionToast(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);

  setTimeout(() => {
    currentQuestionIndex++;
    answering = false;
    if (currentQuestionIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      startSuspense();
    }
  }, 1100);
}

let toastTimeout = null;
function showReactionToast(message) {
  clearTimeout(toastTimeout);
  reactionToastEl.textContent = message;
  reactionToastEl.classList.add("show");
  toastTimeout = setTimeout(() => {
    reactionToastEl.classList.remove("show");
  }, 1000);
}

/* ================================================================
   SCREEN 3: SUSPENSE
   ================================================================ */
const suspenseLineEl = document.getElementById("suspense-line");
const btnSuspenseReady = document.getElementById("btn-suspense-ready");

// Shared helper: fades through an array of {text, duration} lines inside
// a given element, then calls onDone. Used by both the suspense screen
// and the cringe-warning screen.
function playLineSequence(lines, index, textEl, onDone) {
  if (index >= lines.length) {
    onDone();
    return;
  }
  const line = lines[index];

  textEl.style.transition = "opacity 0.3s ease";
  textEl.style.opacity = 0;

  setTimeout(() => {
    textEl.textContent = line.text;
    textEl.style.opacity = 1;
    setTimeout(() => playLineSequence(lines, index + 1, textEl, onDone), line.duration);
  }, 300);
}

function startSuspense() {
  goToScreen("suspense", 350);
  btnSuspenseReady.style.display = "none";
  suspenseLineEl.style.opacity = 1;

  setTimeout(() => {
    playLineSequence(SUSPENSE_LINES, 0, suspenseLineEl, () => {
      btnSuspenseReady.style.display = "inline-block";
    });
  }, 500);
}

btnSuspenseReady.addEventListener("click", () => {
  playPop();
  goToScreen("bigquestion", 350);
  setTimeout(resetBigQuestion, 400);
});

/* ================================================================
   SCREEN 4: THE BIG QUESTION (with the NO-button dodge mechanic)
   ================================================================ */
const bigButtonsZone = document.getElementById("big-buttons-zone");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const tauntTextEl = document.getElementById("taunt-text");

let noTapCount = 0;

function resetBigQuestion() {
  noTapCount = 0;
  btnYes.style.transform = "translateX(-50%) scale(1)";
  btnNo.style.transform = "translate(-50%, 0) scale(1)";
  btnNo.style.left = "50%";
  btnNo.style.top = "140px";
  tauntTextEl.textContent = " "; // non-breaking space keeps layout stable
}

function handleNoClick() {
  noTapCount++;
  playBeep(220 - noTapCount * 8, 0.1, 0.05);

  const cappedTaps = Math.min(noTapCount, NO_MAX_TAPS);

  // NO shrinks down to a minimum of ~28% size
  const noScale = Math.max(1 - cappedTaps * 0.09, 0.28);
  // YES grows up to ~2.4x size
  const yesScale = Math.min(1 + cappedTaps * 0.16, 2.4);

  btnYes.style.transform = `translateX(-50%) scale(${yesScale})`;

  // Move NO to a random spot inside the zone (kept away from the very edges)
  const zoneRect = bigButtonsZone.getBoundingClientRect();
  const btnRect = btnNo.getBoundingClientRect();
  const maxLeft = Math.max(zoneRect.width - btnRect.width - 10, 10);
  const maxTop = Math.max(zoneRect.height - btnRect.height - 10, 10);
  const randomLeft = 10 + Math.random() * maxLeft;
  const randomTop = 10 + Math.random() * maxTop;

  btnNo.style.left = randomLeft + "px";
  btnNo.style.top = randomTop + "px";
  btnNo.style.transform = `scale(${noScale})`;

  if (noTapCount >= NO_MAX_TAPS) {
    tauntTextEl.textContent = NO_FINAL_MESSAGE;
  } else {
    tauntTextEl.textContent = NO_MESSAGES[(noTapCount - 1) % NO_MESSAGES.length];
  }
}

btnNo.addEventListener("click", handleNoClick);
// Playful bonus: on desktop, dodge slightly on hover too (still fully clickable).
btnNo.addEventListener("mouseenter", () => {
  if (noTapCount > 0 && noTapCount < NO_MAX_TAPS) {
    handleNoClick();
  }
});

let bigQuestionAnswered = false;
btnYes.addEventListener("click", () => {
  if (bigQuestionAnswered) return;
  bigQuestionAnswered = true;
  playPop();
  goToCelebration();
});

/* ================================================================
   SCREEN 5: CELEBRATION
   ================================================================ */
const celebrateSubEl = document.getElementById("celebrate-sub");
const btnReady = document.getElementById("btn-ready");

function goToCelebration() {
  goToScreen("celebration", 350);
  celebrateSubEl.style.opacity = 0;
  btnReady.style.opacity = 0;
  btnReady.style.pointerEvents = "none";

  setTimeout(() => {
    launchConfetti(120);
    for (let i = 0; i < 10; i++) setTimeout(spawnFloatingHeart, i * 90);
  }, 400);

  setTimeout(() => {
    celebrateSubEl.style.opacity = 1;
  }, 1500);

  setTimeout(() => {
    btnReady.style.opacity = 1;
    btnReady.style.pointerEvents = "auto";
  }, 2200);

  bigQuestionAnswered = false; // reset for potential replay
}

let readyClicked = false;
btnReady.addEventListener("click", () => {
  if (readyClicked) return;
  readyClicked = true;
  playPop();
  goToScreen("countdown", 350);
  setTimeout(() => startCountdown(), 500);
});

/* ================================================================
   SCREEN 6: COUNTDOWN
   ================================================================ */
const countdownNumberEl = document.getElementById("countdown-number");

function startCountdown() {
  const sequence = ["3", "2", "1", "GO! 💗"]; // 💗
  runCountdownStep(sequence, 0);
}

function runCountdownStep(sequence, index) {
  if (index >= sequence.length) {
    setTimeout(startCringeWarning, 500);
    return;
  }

  const value = sequence[index];
  countdownNumberEl.textContent = value;
  countdownNumberEl.classList.remove("pop", "go");
  void countdownNumberEl.offsetWidth; // restart CSS animation
  countdownNumberEl.classList.add("pop");

  if (value.startsWith("GO")) {
    countdownNumberEl.classList.add("go");
    playBeep(660, 0.25, 0.07);
  } else {
    playBeep(300 + index * 90, 0.15, 0.06);
  }

  setTimeout(() => runCountdownStep(sequence, index + 1), 850);
}

/* ================================================================
   SCREEN 7: CRINGE WARNING
   ================================================================ */
const cringeLineEl = document.getElementById("cringe-line");
const btnCringeReady = document.getElementById("btn-cringe-ready");

function startCringeWarning() {
  goToScreen("cringewarning", 350);
  btnCringeReady.style.display = "none";
  cringeLineEl.style.opacity = 1;

  setTimeout(() => {
    playLineSequence(CRINGE_LINES, 0, cringeLineEl, () => {
      btnCringeReady.style.display = "inline-block";
    });
  }, 500);
}

btnCringeReady.addEventListener("click", () => {
  playPop();
  startFinalScene();
});

/* ================================================================
   SCREEN 8: FINAL SCENE — couple-edit montage + song + closing text
   ================================================================ */
const songEl = document.getElementById("song");

// Pauses the song once SONG_DURATION seconds of the clip have played,
// so playback never continues past the part you set up above.
function stopSongAfterClip() {
  if (songEl.currentTime >= SONG_START_TIME + SONG_DURATION) {
    songEl.pause();
    songEl.removeEventListener("timeupdate", stopSongAfterClip);
  }
}

const montageCaptionEl = document.getElementById("montage-caption");
const montageFrames = document.querySelectorAll(".montage-frame");
const finalText1El = document.getElementById("final-text-1");
const finalText2El = document.getElementById("final-text-2");
const btnReplayEl = document.getElementById("btn-replay");

function startFinalScene() {
  goToScreen("final", 350);

  // Reset the montage + closing text so replays start clean.
  montageCaptionEl.style.opacity = 1;
  montageCaptionEl.textContent = MONTAGE_CAPTIONS[0];
  montageFrames.forEach((f, i) => f.classList.toggle("active", i === 0));
  finalText1El.style.opacity = 0;
  finalText2El.style.opacity = 0;
  btnReplayEl.style.opacity = 0;
  btnReplayEl.style.pointerEvents = "none";

  // Try to play the song starting at SONG_START_TIME, and auto-stop it
  // after SONG_DURATION seconds so only that clip plays.
  // If assets/song.mp3 doesn't exist yet, this fails silently —
  // the site still works perfectly without it.
  try {
    songEl.currentTime = SONG_START_TIME;
    const playPromise = songEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        /* Autoplay might be blocked, or file missing — that's okay. */
      });
    }
    songEl.removeEventListener("timeupdate", stopSongAfterClip);
    songEl.addEventListener("timeupdate", stopSongAfterClip);
  } catch (e) {
    /* assets/song.mp3 not found yet — that's okay, silently continue. */
  }

  launchConfetti(140);
  for (let i = 0; i < 14; i++) setTimeout(spawnFloatingHeart, i * 80);

  // A gentle extra sparkle of hearts every so often during the final scene.
  const finalHeartInterval = setInterval(() => {
    if (!document.querySelector('.screen[data-screen="final"]').classList.contains("active")) {
      clearInterval(finalHeartInterval);
      return;
    }
    spawnFloatingHeart();
  }, 1400);

  // Kick off the couple-edit montage; it settles into the closing text on its own.
  setTimeout(() => runMontageStep(1), MONTAGE_STEP_DURATION);
}

function runMontageStep(step) {
  if (step >= MONTAGE_TOTAL_STEPS) {
    revealFinalText();
    return;
  }

  const frameIndex = step % montageFrames.length;
  montageFrames.forEach((f, i) => f.classList.toggle("active", i === frameIndex));

  montageCaptionEl.style.opacity = 0;
  setTimeout(() => {
    montageCaptionEl.textContent = MONTAGE_CAPTIONS[step % MONTAGE_CAPTIONS.length];
    montageCaptionEl.style.opacity = 1;
  }, 250);

  setTimeout(() => runMontageStep(step + 1), MONTAGE_STEP_DURATION);
}

function revealFinalText() {
  montageCaptionEl.style.opacity = 0;
  launchConfetti(80);

  setTimeout(() => {
    finalText1El.style.opacity = 1;
  }, 300);
  setTimeout(() => {
    finalText2El.style.opacity = 1;
  }, 1000);
  setTimeout(() => {
    btnReplayEl.style.opacity = 1;
    btnReplayEl.style.pointerEvents = "auto";
  }, 1700);
}

/* ================================================================
   REPLAY BUTTON — resets everything back to the intro
   ================================================================ */
document.getElementById("btn-replay").addEventListener("click", () => {
  songEl.pause();
  songEl.currentTime = 0;
  currentQuestionIndex = 0;
  bigQuestionAnswered = false;
  readyClicked = false;
  resetBigQuestion();
  goToScreen("intro", 0);
});
