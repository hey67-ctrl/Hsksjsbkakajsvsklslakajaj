const API_URL = "https://kahoot-api.joshuaj.co/api/join";

// Elements
const gameIdInput = document.getElementById('gameId');
const botNameInput = document.getElementById('botName');
const botCountInput = document.getElementById('botCount');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Sounds
const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const startSound = document.getElementById('startSound');

// Control variable
let stopSpawning = false;

// Play sound helper
function playSound(audioElement) {
  audioElement.currentTime = 0;
  audioElement.play().catch(() => {});
}

// Status handler
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

// Update progress bar
function updateProgress(current, total) {
  const percent = Math.round((current / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${current} / ${total} bots joined`;
}

// Spawn single bot
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

// Start button logic
startBtn.addEventListener('click', async () => {
  playSound(clickSound);
  
  const gameId = gameIdInput.value.trim();
  const baseName = botNameInput.value.trim();
  const count = parseInt(botCountInput.value);

  // Validation
  if (!gameId || !baseName || isNaN(count) || count < 1 || count > 20) {
    showStatus('⚠️ Please fill all fields correctly (max 20 bots)', 'error');
    return;
  }

  // Reset state
  stopSpawning = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  progressContainer.classList.remove('hidden');
  updateProgress(0, count);
  showStatus(`🚀 Starting to spawn ${count} bots...`, 'info');
  playSound(startSound);

  let success = 0;

  // Spawn loop
  for (let i = 1; i <= count; i++) {
    if (stopSpawning) {
      showStatus(`⏹️ Stopped early. Joined ${success}/${count}`, 'warning');
      break;
    }

    const botName = `${baseName} ${i}`;
    const joined = await spawnBot(gameId, botName);
    
    if (joined) success++;
    updateProgress(i, count);
    
    // Delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Final result
  if (success > 0 && !stopSpawning) {
    showStatus(`✅ Done! Successfully joined ${success}/${count} bots!`, 'success');
  } else if (!stopSpawning) {
    showStatus('❌ Failed. Check PIN or try again later.', 'error');
  }

  // Reset buttons
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// Stop button logic
stopBtn.addEventListener('click', () => {
  playSound(clickSound);
  stopSpawning = true;
  stopBtn.disabled = true;
  showStatus('⏹️ Stop requested... finishing current bot...', 'warning');
});

// Input sound
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', () => playSound(clickSound));
});
                          
