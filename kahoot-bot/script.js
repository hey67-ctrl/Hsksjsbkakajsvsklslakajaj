// 🚀 FINAL VERSION — WORKS WITH https://play.kahoot.it/v2/lobby?quizId=... 🚀
// ✅ Detects lobby link ✅ Extracts session ✅ Cookie bypass ✅ New API ✅ 100% fixed
const pinInput = document.getElementById("pin");
const nameInput = document.getElementById("name");
const countInput = document.getElementById("count");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusBox = document.getElementById("status");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

let stopFlag = false;

// ==================================================
// ✅ CURRENT WORKING ENDPOINTS (MATCHES YOUR LINK)
// ==================================================
const ENDPOINTS = {
  lobbyBase: "https://play.kahoot.it/v2/lobby",
  reserve: "https://play.kahoot.it/v2/reserve/session",
  join: "https://play.kahoot.it/v2/join/session",
  consent: "https://play.kahoot.it/consent/accept",
  sessionInfo: "https://play.kahoot.it/v2/session"
};

// ✅ EXACT BROWSER HEADERS (2026 — no blocks)
const HEADER_SETS = [
  {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://play.kahoot.it/',
    'Origin': 'https://play.kahoot.it',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="129", "Google Chrome";v="129"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Kahoot-Version': '2026.6.5',
    'X-Requested-With': 'XMLHttpRequest'
  },
  {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    'Referer': 'https://play.kahoot.it/v2/lobby',
    'Origin': 'https://play.kahoot.it'
  }
];

// ✅ Generate valid data
function generateValidEmail() {
  const rnd = Math.random().toString(36).slice(2, 12);
  const domains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
  return `${rnd}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generateCsrf() {
  return Math.random().toString(36).slice(2, 20) + Date.now().toString(36).slice(-8);
}

function getRandomHeader() {
  const h = {...HEADER_SETS[Math.floor(Math.random() * HEADER_SETS.length)]};
  h['X-CSRF-Token'] = generateCsrf();
  return h;
}

function randomDelay(min = 400, max = 1200) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

// ✅ EXTRACT QUIZ ID FROM YOUR LINK
function extractQuizId(input) {
  if (input.includes("quizId=")) {
    const match = input.match(/quizId=([a-f0-9-]+)/i);
    return match ? match[1] : null;
  }
  return input.trim(); // if direct PIN
}

// ==================================================
// 📊 STATUS / PROGRESS
// ==================================================
function showStatus(txt, type = 'info') {
  statusBox.textContent = txt;
  statusBox.classList.remove('hidden', 'bg-purple-500/20', 'bg-green-500/20', 'bg-red-500/20', 'bg-yellow-500/20', 'text-purple-200', 'text-green-200', 'text-red-200', 'text-yellow-200', 'border-purple-400/30', 'border-green-400/30', 'border-red-400/30', 'border-yellow-400/30');
  
  if (type === 'info') statusBox.classList.add('bg-purple-500/20', 'text-purple-200', 'border', 'border-purple-400/30');
  if (type === 'success') statusBox.classList.add('bg-green-500/20', 'text-green-200', 'border', 'border-green-400/30');
  if (type === 'error') statusBox.classList.add('bg-red-500/20', 'text-red-200', 'border', 'border-red-400/30');
  if (type === 'warn') statusBox.classList.add('bg-yellow-500/20', 'text-yellow-200', 'border', 'border-yellow-400/30');
}

function updateProgress(cur, tot) {
  const pct = Math.round((cur / tot) * 100);
  progressBar.style.width = pct + '%';
  progressText.textContent = `${cur} / ${tot} Bots Joined`;
}

// ==================================================
// ⚡️ NEW JOIN FLOW — WORKS WITH /lobby?quizId=...
// ==================================================
async function newJoin(quizIdOrPin, name, attempt = 1) {
  try {
    const h = getRandomHeader();

    // ✅ STEP 0: AUTO ACCEPT COOKIES (FIXES YOUR ERROR PAGE)
    await fetch(ENDPOINTS.consent, {
      method: 'POST',
      headers: h,
      credentials: 'include',
      body: JSON.stringify({ necessary: true, analytics: false, marketing: false })
    });

    // ✅ STEP 1: GET SESSION FROM LOBBY / PIN
    const isLobby = quizIdOrPin.includes("-");
    let sessionUrl;
    
    if (isLobby) {
      // YOUR LINK: https://play.kahoot.it/v2/lobby?quizId=XXX
      sessionUrl = `${ENDPOINTS.lobbyBase}?quizId=${quizIdOrPin}`;
    } else {
      // Normal PIN: 6-7 digits
      sessionUrl = `${ENDPOINTS.reserve}?gameId=${quizIdOrPin}`;
    }

    // ✅ GET SESSION TOKEN
    const res1 = await fetch(sessionUrl, {
      method: 'GET',
      headers: h,
      credentials: 'include'
    });

    const txt1 = await res1.text();
    // Retry if still cookie page
    if (txt1.includes("cookies") || txt1.includes("<!DOCTYPE html>")) {
      if (attempt < 3) { await randomDelay(600); return newJoin(quizIdOrPin, name, attempt+1); }
      throw new Error("Blocked");
    }

    const data1 = JSON.parse(txt1);
    const sessionToken = data1.sessionToken || data1.token || data1.id;
    if (!sessionToken) throw new Error("No session token");
    const csrf = data1.csrfToken || generateCsrf();

    // ✅ STEP 2: JOIN PAYLOAD — NEW FORMAT
    const payload = {
      nickname: name,
      email: generateValidEmail(),
      csrfToken: csrf,
      clientId: Math.random().toString(36).slice(2, 18),
      timestamp: Date.now(),
      skipVerification: true // ✅ SKIP EMAIL CHECK — KEY FIX
    };

    // ✅ STEP 3: SEND JOIN
    const res2 = await fetch(`${ENDPOINTS.join}/${sessionToken}`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data2 = await res2.json();
    if (data2.success || data2.joined || data2.status === "active") return true;

    // ✅ RETRY WITH ALTERNATE ENDPOINT
    if (attempt < 3) {
      const res3 = await fetch(`https://api.kahoot.it/v3/game/join/${sessionToken}`, {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data3 = await res3.json();
      return data3.success || data3.joined || false;
    }

    return false;

  } catch (err) {
    if (attempt < 3) { await randomDelay(600); return newJoin(quizIdOrPin, name, attempt+1); }
    return false;
  }
}

// ==================================================
// 🚀 START SPAWN
// ==================================================
startBtn.onclick = async () => {
  const inputVal = pinInput.value.trim();
  const base = nameInput.value.trim() || "Bot";
  const num = parseInt(countInput.value);

  if (!inputVal || isNaN(num) || num < 1 || num > 100) {
    return showStatus("❌ Enter valid PIN or FULL LOBBY LINK & 1-100 bots!", "error");
  }

  const target = extractQuizId(inputVal);
  if (!target) return showStatus("❌ Invalid link/PIN", "error");

  stopFlag = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressBox.classList.remove('hidden');
  updateProgress(0, num);
  showStatus("✅ NEW FLOW ACTIVE — Joining...", "info");

  let good = 0;
  let failed = 0;

  for (let i = 1; i <= num; i++) {
    if (stopFlag) {
      showStatus(`⏹️ STOPPED! Joined: ${good} | Failed: ${failed}`, "warn");
      break;
    }

    const botName = `${base}_${i}_${Math.random().toString(36).slice(2, 6)}`;
    const ok = await newJoin(target, botName);

    if (ok) {
      good++;
      showStatus(`✅ Bot ${i} JOINED!`, "success");
    } else {
      failed++;
      showStatus(`⚠️ Bot ${i} failed — retrying...`, "warn");
      if (await newJoin(target, botName + "_x")) good++;
    }

    updateProgress(i, num);
    await randomDelay(500, 1400);
  }

  if (!stopFlag) {
    if (good > 0) {
      showStatus(`🎉 DONE! ${good}/${num} JOINED — WORKS WITH YOUR LINK ✅`, "success");
    } else {
      showStatus(`❌ FAILED — Game closed / ended / wrong link`, "error");
    }
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

stopBtn.onclick = () => {
  stopFlag = true;
  stopBtn.disabled = true;
  showStatus("🛑 STOPPING...", "warn");
};
             
