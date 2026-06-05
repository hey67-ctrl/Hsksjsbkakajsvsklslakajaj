const API = "https://kahoot-api.joshuaj.co/api/join";

const pinInput = document.getElementById("pin");
const nameInput = document.getElementById("name");
const countInput = document.getElementById("count");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusBox = document.getElementById("status");

let stop = false;

function showStatus(text, ok) {
  statusBox.style.display = "block";
  statusBox.textContent = text;
  statusBox.className = ok ? "success" : "error";
}

async function joinBot(pin, name) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({gameId: pin, name: name})
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

startBtn.onclick = async () => {
  const pin = pinInput.value.trim();
  const base = nameInput.value.trim();
  const num = parseInt(countInput.value);

  if (!pin || !base || isNaN(num) || num < 1 || num > 20) {
    return showStatus("Fill all fields correctly!", false);
  }

  stop = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  showStatus("Spawning bots...", true);

  let ok = 0;
  for (let i = 1; i <= num; i++) {
    if (stop) {
      showStatus(`Stopped — joined ${ok}/${num}`, true);
      break;
    }
    const joined = await joinBot(pin, `${base} ${i}`);
    if (joined) ok++;
    await new Promise(r => setTimeout(r, 300));
  }

  if (!stop) showStatus(`Done! ${ok}/${num} joined`, ok > 0);

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

stopBtn.onclick = () => {
  stop = true;
  stopBtn.disabled = true;
  showStatus("Stopping...", true);
};
