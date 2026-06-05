const API_URL = "https://kahoot-api.joshuaj.co/api/join";

const gameIdInput = document.getElementById('gameId');
const botNameInput = document.getElementById('botName');
const botCountInput = document.getElementById('botCount');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const startSound = document.getElementById('startSound');

let stopSpawning = false;

function playSound(audioElement) {
  audioElement.currentTime = 0;
  audioElement.play().catch(e => {});
}

function showStatus(text, type = 'info') {
  statusDiv.textContent = text;
  statusDiv.classList.remove('hidden', 'bg-blue-500/20', 'text-blue-200', 'bg-green-500/20', 'text-green-200', 'bg-red-500/20', 'text-red-200', 'bg-yellow-500/20', 'text-yellow-200', 'bg-purple-500/20', 'text-purple-200');
  
  if (type === 'info') {
    statusDiv.classList.add('bg-purple-500/20', 'text-purple-200', 'border', 'border-purple-400/30');
  } else if (type === 'success') {
    statusDiv.classList.add('bg-green-500/20', 'text-green-200', 'border', 'border-green-400/30');
    playSound(successSound);
  } else if (type === 'error') {
    statusDiv.classList.add('bg-red-500/20', 'text-red-200', 'border', 'border-red-400/30');
    playSound(errorSound);
  } else if (type === 'warning') {
    statusDiv.classList.add('bg-yellow-500/20', 'text-yellow-200', 'border', 'border-yellow-400/30');
  }
  
  statusDiv.classList.remove('hidden');
}

function updateProgress(current, total) {
  const percent = Math.round((current / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${current} / ${total} bots joined`;
  
  if (percent > 80) {
    progressBar.classList.add('shadow-glow-purple');
  } else {
    progressBar.classList.remove('shadow-glow-purple');
  }
}

async function spawnBot(gameId, name) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, name })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

startBtn.addEventListener('click', async () => {
  playSound(clickSound);
  
  const gameId = gameIdInput.value.trim();
  const baseName = botNameInput.value.trim();
  const count = parseInt(botCountInput.value);

  if (!gameId || !baseName || isNaN(count) || count < 1 || count > 20) {
    showStatus('⚠️ Please fill all fields correctly (max 20 bots)', 'error');
    return;
  }

  stopSpawning = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressContainer.classList.remove('hidden');
  updateProgress(0, count);
  showStatus(`🚀 Starting to spawn ${count} bots...`, 'info');
  playSound(startSound);

  let success = 0;

  for (let i = 1; i <= count; i++) {
    if (stopSpawning) {
      showStatus(`⏹️ Stopped early. Joined ${success}/${count}`, 'warning');
      break;
    }

    const botName = `${baseName} ${i}`;
    const joined = await spawnBot(gameId, botName);
    
    if (joined) success++;
    updateProgress(i, count);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  if (success > 0 && !stopSpawning) {
    showStatus(`✅ Done! Successfully joined ${success}/${count} bots!`, 'success');
  } else if (!stopSpawning) {
    showStatus('❌ Failed. Check PIN or try again later.', 'error');
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

stopBtn.addEventListener('click', () => {
  playSound(clickSound);
  stopSpawning = true;
  stopBtn.disabled = true;
  showStatus('⏹️ Stop requested... finishing current bot...', 'warning');
});

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', () => playSound(clickSound));
});
