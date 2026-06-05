const API = "https://kahoot-api.joshuaj.co/api/join";

const pinInput = document.getElementById("pin");
const nameInput = document.getElementById("name");
const countInput = document.getElementById("count");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusBox = document.getElementById("status");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const clickSnd = document.getElementById("click");
const okSnd = document.getElementById("success");
const errSnd = document.getElementById("error");

let stopFlag = false;
const play = s => {s.currentTime=0;s.play().catch(()=>{})};

function showStatus(txt, type='info') {
  statusBox.textContent = txt;
  statusBox.classList.remove('hidden', 'bg-purple-500/20', 'bg-green-500/20', 'bg-red-500/20', 'bg-yellow-500/20', 'text-purple-200', 'text-green-200', 'text-red-200', 'text-yellow-200', 'border-purple-400/30', 'border-green-400/30', 'border-red-400/30', 'border-yellow-400/30');
  
  if(type==='info') statusBox.className += 'bg-purple-500/20 text-purple-200 border border-purple-400/30';
  if(type==='success') {statusBox.className += 'bg-green-500/20 text-green-200 border border-green-400/30'; play(okSnd);}
  if(type==='error') {statusBox.className += 'bg-red-500/20 text-red-200 border border-red-400/30'; play(errSnd);}
  if(type==='warn') statusBox.className += 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30';
}

function updateProgress(cur, tot) {
  const pct = Math.round(cur/tot*100);
  progressBar.style.width = pct+'%';
  progressText.textContent = `${cur} / ${tot} Bots Joined`;
}

async function joinBot(pin, name) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({gameId:pin,name})
    });
    const d = await res.json();
    return d.success;
  }catch{return false;}
}

startBtn.onclick = async () => {
  play(clickSnd);
  const pin = pinInput.value.trim();
  const base = nameInput.value.trim() || "L";
  const num = parseInt(countInput.value);

  if(!pin || isNaN(num) || num<1 || num>20) return showStatus("❌ Enter valid PIN & 1-20 bots!", "error");

  stopFlag = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressBox.classList.remove('hidden');
  updateProgress(0,num);
  showStatus(`🤖 Spawning ${num} Bots... GET REKT!`, "info");

  let good=0;
  for(let i=1;i<=num;i++){
    if(stopFlag) {showStatus(`⏹️ Stopped! Joined: ${good}/${num} 😴`, "warn");break;}
    const ok = await joinBot(pin, `${base} ${i}`);
    if(ok) good++;
    updateProgress(i,num);
    await new Promise(r=>setTimeout(r,250));
  }

  if(!stopFlag) {
    if(good>0) showStatus(`✅ DONE! ${good}/${num} JOINED 😈 KAHO00T SUCKS`, "success");
    else showStatus("❌ FAILED! Check PIN 😂", "error");
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

stopBtn.onclick = () => {
  play(clickSnd);
  stopFlag = true;
  stopBtn.disabled = true;
  showStatus("🛑 STOPPING...", "warn");
};
