let timerDisplay = document.getElementById('timer-display');
let startButton = document.getElementById('start');
let resetButton = document.getElementById('reset');
let modeButtons = document.querySelectorAll('.mode-buttons button');

let countdown;
let timeLeft = 1500; // 25 minutes in seconds
let isRunning = false;

const modes = {
  pomodoro: 1500,      // 25 minutes
  'short-break': 300,  // 5 minutes
  'long-break': 1200   // 20 minutes
};

function updateDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  countdown = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdown);
      isRunning = false;
      return;
    }
    timeLeft--;
    updateDisplay(timeLeft);
  }, 1000);
}

function resetTimer() {
  clearInterval(countdown);
  isRunning = false;
  updateDisplay(timeLeft);
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    timeLeft = modes[button.id];
    resetTimer();
    updateDisplay(timeLeft);
  });
});

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);

updateDisplay(timeLeft);
