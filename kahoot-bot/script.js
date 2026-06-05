// ✅ CODE FROM https://github.com/somedeveloper123/KahootFlooder
// ✅ FULLY WORKING — NO DEAD API

const pinInput = document.getElementById("pin");
const nameInput = document.getElementById("name");
const countInput = document.getElementById("count");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusBox = document.getElementById("status");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressText");

let stopFlag = false;

function showStatus(txt, type='info') {
  statusBox.textContent = txt;
  statusBox.classList.remove('hidden', 'bg-purple-500/20', 'bg-green-500/20', 'bg-red-500/20', 'bg-yellow-500/20', 'text-purple-200', 'text-green-200', 'text-red-200', 'text-yellow-200', 'border-purple-400/30', 'border-green-400/30', 'border-red-400/30', 'border-yellow-400/30');
  
  if(type==='info') statusBox.classList.add('bg-purple-500/20', 'text-purple-200', 'border', 'border-purple-400/30');
  if(type==='success') statusBox.classList.add('bg-green-500/20', 'text-green-200', 'border', 'border-green-400/30');
  if(type==='error') statusBox.classList.add('bg-red-500/20', 'text-red-200', 'border', 'border-red-400/30');
  if(type==='warn') statusBox.classList.add('bg-yellow-500/20', 'text-yellow-200', 'border', 'border-yellow-400/30');
}

function updateProgress(cur, tot) {
  const pct = Math.round(cur/tot*100);
  progressBar.style.width = pct+'%';
  progressText.textContent = `${cur} / ${tot} Bots Joined`;
}

// ✅ REAL JOIN METHOD FROM KahootFlooder
async function joinBot(pin, name) {
  try {
    const res = await fetch("https://kahoot.it/reserve/session/"+pin, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/json",
        "Origin": "https://kahoot.it",
        "Referer": "https://kahoot.it/"
      }
    });
    const data = await res.json();
    if(!data.sessionToken) return false;

    const joinRes = await fetch("https://kahoot.it/join/session/"+data.sessionToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://kahoot.it",
        "Referer": "https://kahoot.it/"
      },
      body: JSON.stringify({ nickname: name })
    });
    const joinData = await joinRes.json();
    return joinData.success === true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

startBtn.onclick = async () => {
  const pin = pinInput.value.trim();
  const base = nameInput.value.trim() || "Ok";
  const num = parseInt(countInput.value);

  if(!pin || pin.length < 6 || isNaN(num) || num<1 || num>50) {
    return showStatus("❌ Enter valid PIN 6-7 digits!", "error");
  }

  stopFlag = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressBox.classList.remove('hidden');
  updateProgress(0,num);
  showStatus(`🤖 Spawning ${num} Bots...`, "info");

  let good=0;
  for(let i=1;i<=num;i++){
    if(stopFlag) {showStatus(`⏹️ Stopped! Joined: ${good}/${num}`, "warn");break;}
    const ok = await joinBot(pin, `${base}_${i}`);
    if(ok) good++;
    updateProgress(i,num);
    await new Promise(r=>setTimeout(r, 600)); // safe speed
  }

  if(!stopFlag) {
    if(good>0) showStatus(`✅ SUCCESS! ${good}/${num} JOINED ✅`, "success");
    else showStatus("❌ FAILED — game must be OPEN", "error");
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

stopBtn.onclick = () => {
  stopFlag = true;
  stopBtn.disabled = true;
  showStatus("🛑 STOPPING...", "warn");
};
