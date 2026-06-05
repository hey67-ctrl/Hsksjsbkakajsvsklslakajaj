const API = "https://kahoot-api.joshuaj.co/api/join";

const $ = sel => document.querySelector(sel);
const gameId = $('#gameId');
const botName = $('#botName');
const botCount = $('#botCount');
const startBtn = $('#startBtn');
const stopBtn = $('#stopBtn');
const status = $('#status');
const progressBox = $('#progressBox');
const progressBar = $('#progressBar');
const progressText = $('#progressText');

const click = $('#click');
const okSnd = $('#ok');
const errSnd = $('#err');

let stopFlag = false;
const play = s => {s.currentTime=0;s.play().catch(()=>{})};

function showStatus(txt, type='info') {
  status.textContent = txt;
  status.className = 'mt-4 p-3 rounded-lg text-sm ';
  if (type==='info') status.className += 'bg-purple-500/20 text-purple-200 border border-purple-400/30';
  if (type==='success') {status.className += 'bg-green-500/20 text-green-200 border border-green-400/30'; play(okSnd);}
  if (type==='error') {status.className += 'bg-red-500/20 text-red-200 border border-red-400/30'; play(errSnd);}
  if (type==='warn') status.className += 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30';
  status.classList.remove('hidden');
}

function updateProg(cur, tot) {
  progressBar.style.width = `${Math.round(cur/tot*100)}%`;
  progressText.textContent = `${cur} / ${tot} joined`;
}

async function joinBot(pin, name) {
  try {
    const r = await fetch(API, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({gameId:pin,name})
    });
    const d = await r.json();
    return d.success;
  }catch{return false;}
}

startBtn.onclick = async () => {
  play(click);
  const pin = gameId.value.trim();
  const name = botName.value.trim();
  const num = parseInt(botCount.value);
  if (!pin || !name || isNaN(num) || num<1 || num>20) return showStatus('Fill all fields correctly (max 20)','error');

  stopFlag = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressBox.classList.remove('hidden');
  updateProg(0,num);
  showStatus(`Spawning ${num} bots...`,'info');

  let good=0;
  for(let i=1;i<=num;i++){
    if(stopFlag) {showStatus(`Stopped — joined ${good}/${num}`,'warn');break;}
    const ok = await joinBot(pin,`${name} ${i}`);
    if(ok) good++;
    updateProg(i,num);
    await new Promise(r=>setTimeout(r,300));
  }

  if(good>0 && !stopFlag) showStatus(`✅ Done! ${good}/${num} joined`,'success');
  else if(!stopFlag) showStatus('❌ Failed — check PIN','error');

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

stopBtn.onclick = () => {
  play(click);
  stopFlag = true;
  stopBtn.disabled = true;
  showStatus('Stopping...','warn');
};
