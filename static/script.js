/* =========================================================
   Animals World Bank – Loan ATM
   Talks to the FastAPI /predict endpoint (same origin).
   All sounds are synthesised with the Web Audio API,
   so no audio files are needed.
   ========================================================= */

const $ = (id) => document.getElementById(id);
const form = $("loan-form");
const vault = $("vault");
const padlock = $("padlock");
const note = $("note");
const noteResult = $("note-result");
const noteDetail = $("note-detail");
const rushMsg = $("rush-msg");
const errorMsg = $("error-msg");
const submitBtn = $("submit-btn");
const resetBtn = $("reset-btn");
const screen = $("screen");

const RUSH_DELAY_MS = 10000; // "customers behind you" message
let rushTimer = null;
let ctx = null;        // AudioContext
let sirenNodes = null; // running siren

/* ---------- audio helpers ---------- */
function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
}

function tone(freq, start, dur, { type = "sine", vol = 0.2, endFreq = null } = {}) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(start, dur, vol = 0.15) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.buffer = buf;
  src.connect(gain).connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

const sounds = {
  welcome() { // bright bank-lobby chime
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.18, 0.7, { vol: 0.18 }));
  },
  clunk() { tone(120, 0, 0.18, { type: "square", vol: 0.25, endFreq: 60 }); noise(0, 0.08, 0.2); },
  unlock() { tone(900, 0, 0.08, { type: "square", vol: 0.15 }); tone(1300, 0.1, 0.12, { type: "square", vol: 0.15 }); },
  gates() { // grinding rails
    for (let i = 0; i < 8; i++) noise(i * 0.14, 0.12, 0.12);
    tone(70, 0, 1.2, { type: "sawtooth", vol: 0.12, endFreq: 50 });
  },
  printer() { for (let i = 0; i < 12; i++) tone(1800 + (i % 2) * 300, i * 0.1, 0.05, { type: "square", vol: 0.05 }); },
  stamp() { tone(90, 0, 0.2, { type: "triangle", vol: 0.4, endFreq: 40 }); noise(0, 0.1, 0.25); },
  tick() { tone(1000, 0, 0.1, { vol: 0.12 }); },
  approved() {
    [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, i * 0.14, 0.5, { vol: 0.2 }));
    setTimeout(() => speak("Low risk. The loan can be given."), 700);
  },
  hurry() { tone(880, 0, 0.15, { vol: 0.15 }); tone(880, 0.25, 0.15, { vol: 0.15 }); },
};

function startSiren(seconds = 5) {
  if (!ctx) return;
  stopSiren();
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 850;
  lfo.frequency.value = 1.6;   // sweeps per second
  lfoGain.gain.value = 300;    // sweep depth (Hz)
  gain.gain.value = 0.18;
  lfo.connect(lfoGain).connect(osc.frequency);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); lfo.start();
  sirenNodes = { osc, lfo, gain };
  document.body.classList.add("alarm");
  screen.classList.add("flash-red");
  setTimeout(stopSiren, seconds * 1000);
}

function stopSiren() {
  if (sirenNodes) {
    try { sirenNodes.osc.stop(); sirenNodes.lfo.stop(); } catch (_) { }
    sirenNodes = null;
  }
  document.body.classList.remove("alarm");
  screen.classList.remove("flash-red");
}

/* ---------- monkey greeter ---------- */
const monkey = $("monkey");
const bubble = $("bubble");
const bubbleText = $("bubble-text");
const lineSign = $("line-sign");
const atm = document.querySelector(".atm");
let typer = null;

function speakAsync(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return setTimeout(resolve, text.length * 60);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
    setTimeout(resolve, 8000); // safety net
  });
}

// Monkey types the line into the bubble (and speaks it unless voice:false)
function say(text, { voice = true } = {}) {
  bubble.classList.add("show");
  clearInterval(typer);
  bubbleText.textContent = "";
  let i = 0;
  typer = setInterval(() => {
    bubbleText.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typer);
  }, 35);
  monkey.classList.add("talking");
  const done = voice ? speakAsync(text) : new Promise((r) => setTimeout(r, text.length * 35 + 800));
  return done.then(() => monkey.classList.remove("talking"));
}

async function monkeyIntro() {
  monkey.classList.add("enter", "walking");   // walks in from the right
  await new Promise((r) => setTimeout(r, 2300));
  monkey.classList.remove("walking");         // stops and waves
  await say("Welcome to the bank! How may we help you with the loan today?");
  armRushTimer();                             // 10-second clock starts after he finishes
}

function shakeMachine() {
  atm.classList.remove("shake");
  void atm.offsetWidth;
  atm.classList.add("shake");
  setTimeout(() => atm.classList.remove("shake"), 1500);
}

/* ---------- start / clock / rush timer ---------- */
$("start-btn").addEventListener("click", () => {
  initAudio();
  sounds.welcome();
  $("start-overlay").classList.add("gone");
  monkeyIntro();
});

function armRushTimer() {
  clearTimeout(rushTimer);
  rushMsg.hidden = true;
  lineSign.classList.remove("hurry");
  rushTimer = setTimeout(() => {
    rushMsg.hidden = false;
    lineSign.classList.add("hurry");
    sounds.hurry();
    speak("Other customers are behind you. Could you please be a little quick?");
  }, RUSH_DELAY_MS);
}

function updateClock() {
  $("clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 30000);

/* ---------- auto-calculate loan % of income ---------- */
function updatePercent() {
  const income = parseFloat(form.person_income.value);
  const amount = parseFloat(form.loan_amnt.value);
  form.loan_percent_income.value = income > 0 && amount >= 0 ? (amount / income).toFixed(2) : "";
}
form.person_income.addEventListener("input", updatePercent);
form.loan_amnt.addEventListener("input", updatePercent);
updatePercent();

/* ---------- submit ---------- */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function buildPayload() {
  const f = new FormData(form);
  const intFields = ["person_age", "cb_person_cred_hist_length"];
  const floatFields = ["person_income", "person_emp_length", "loan_amnt", "loan_int_rate", "loan_percent_income"];
  const out = {};
  for (const [k, v] of f.entries()) {
    out[k] = intFields.includes(k) ? parseInt(v, 10) : floatFields.includes(k) ? parseFloat(v) : v;
  }
  return out;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  initAudio();
  clearTimeout(rushTimer);
  rushMsg.hidden = true;
  errorMsg.hidden = true;
  submitBtn.disabled = true;
  lineSign.classList.remove("hurry");
  say("Let me check your file...", { voice: false });

  // 1. locks rattle while we "process"
  padlock.classList.add("shake");
  sounds.clunk();
  const ticker = setInterval(sounds.tick, 450);

  let result = null;
  try {
    const [res] = await Promise.all([
      fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      }),
      wait(2000), // minimum suspense
    ]);
    if (!res.ok) throw new Error(`Server replied ${res.status}. Check your entries and try again.`);
    result = await res.json();
  } catch (err) {
    clearInterval(ticker);
    padlock.classList.remove("shake");
    errorMsg.textContent = err.message || "Could not reach the bank server.";
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    return;
  }
  clearInterval(ticker);

  // 2. unlock → gates open → note drops → stamp
  const high = result.default_prediction === 1;
  const pct = (result.default_probability * 100).toFixed(1);
  const cut = (result.threshold * 100).toFixed(1);

  padlock.classList.remove("shake");
  sounds.unlock();
  padlock.textContent = "🔓";
  await wait(500);
  padlock.classList.add("fall");
  sounds.gates();
  shakeMachine();
  vault.classList.add("open");
  await wait(1300);

  noteResult.textContent = high ? "HIGH RISK" : "LOW RISK";
  noteResult.className = "note-result " + (high ? "high" : "low");
  noteDetail.textContent = `Default chance: ${pct}%  (cut-off ${cut}%)\n` +
    (high ? "Loan NOT recommended." : "Loan can be given.");
  noteDetail.style.whiteSpace = "pre-line";
  note.classList.add("drop");
  sounds.printer();
  await wait(1700);

  noteResult.classList.add("stamp");
  sounds.stamp();
  noteDetail.classList.add("show");
  await wait(600);

  if (high) {
    startSiren(5);
    speak("Emergency. High risk. The loan cannot be given.");
    say("Uh oh! High risk. We cannot give this loan.", { voice: false });
  } else {
    sounds.approved();
    say("Congratulations! Low risk. The loan can be given.", { voice: false });
  }
  resetBtn.hidden = false;
});

/* ---------- next customer ---------- */
resetBtn.addEventListener("click", () => {
  window.speechSynthesis && window.speechSynthesis.cancel();
  stopSiren();
  vault.classList.remove("open");
  note.classList.remove("drop");
  noteResult.className = "note-result";
  noteResult.textContent = "";
  noteDetail.className = "note-detail";
  noteDetail.textContent = "";
  padlock.classList.remove("fall");
  padlock.textContent = "🔒";
  resetBtn.hidden = true;
  submitBtn.disabled = false;
  sounds.clunk();
  say("Next customer, please! How may we help you with the loan?", { voice: false });
  armRushTimer();
});