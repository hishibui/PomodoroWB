let timer;
let timeRemaining = 25 * 60; // Initial time in seconds
let currentMode = "pomodoro";
let flowCount = 0;
let isPaused = true; // Track whether the timer is paused or running
const audio = new Audio("Ram Bell Sound.mp3");

const timerDisplay = document.getElementById("timer");
const modeButtons = document.querySelectorAll(".mode-button");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const flowCircles = document.querySelectorAll(".circle");

// Request notification permission when the page loads
document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.warn("Notification permission denied.");
      }
    });
  }
});

function showNotification(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else {
    console.warn("Notifications are disabled or not supported.");
  }
}

function playSound() {
  audio.play().catch((err) => {
    console.error("Error playing sound:", err);
  });
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function setMode(mode) {
  if (!isPaused) return; // Prevent mode change while timer is running

  modeButtons.forEach((btn) => btn.classList.remove("active"));
  document.getElementById(mode).classList.add("active");
  currentMode = mode;

  if (mode === "pomodoro") timeRemaining = 25 * 60;
  else if (mode === "short-break") timeRemaining = 5 * 60;
  else if (mode === "long-break") timeRemaining = 10 * 60;

  updateTimerDisplay();
}

function handleTimerEnd() {
  playSound(); // Play bell sound
  if (currentMode === "pomodoro") {
    showNotification("Good work! You deserve a break");
    flowCount++;
    updateFlowIndicator();
    setMode(flowCount % 4 === 0 ? "long-break" : "short-break");
  } else if (currentMode === "short-break") {
    showNotification("Good breather, back to work!");
    setMode("pomodoro");
  } else if (currentMode === "long-break") {
    showNotification("Hope you relaxed a bit, get back to your flow state now!");
    setMode("pomodoro");
  }
}

function updateFlowIndicator() {
  flowCircles.forEach((circle, index) => {
    circle.classList.toggle("active", index < flowCount);
  });
}

function startPauseTimer() {
  if (isPaused) {
    // Start the timer
    isPaused = false;
    startButton.textContent = "Pause";
    toggleModeButtons(false); // Disable mode buttons while the timer is running

    timer = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        clearInterval(timer);
        isPaused = true;
        startButton.textContent = "Start";
        toggleModeButtons(true); // Enable mode buttons after timer ends
        handleTimerEnd();
      }
    }, 1000);
  } else {
    // Pause the timer
    isPaused = true;
    clearInterval(timer);
    startButton.textContent = "Start";
    toggleModeButtons(true); // Enable mode buttons when paused
  }
}

function resetFlow() {
  clearInterval(timer);
  isPaused = true;
  timeRemaining = 25 * 60;
  currentMode = "pomodoro";
  flowCount = 0;
  setMode("pomodoro");
  updateFlowIndicator();
  updateTimerDisplay();
  startButton.textContent = "Start";
  toggleModeButtons(true); // Enable mode buttons after reset
}

function toggleModeButtons(enable) {
  modeButtons.forEach((btn) => {
    btn.disabled = !enable; // Disable or enable buttons
  });
}

// Event listeners
startButton.addEventListener("click", startPauseTimer);
resetButton.addEventListener("click", resetFlow);
modeButtons.forEach((btn) => btn.addEventListener("click", () => setMode(btn.id)));

// Initialize the timer display and flow indicator
updateTimerDisplay();
updateFlowIndicator();
