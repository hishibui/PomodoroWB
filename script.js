let timer;
let timeRemaining = 25 * 60; // Initial time in seconds
let currentMode = "pomodoro";
let flowCount = 0;
let isPaused = true; // Track whether the timer is paused or running
const audio = new Audio("Ram Bell Sound.mp3");
let isWaitingForContinue = false;
let todos = JSON.parse(localStorage.getItem('todos')) || [];

const timerDisplay = document.getElementById("timer");
const modeButtons = document.querySelectorAll(".mode-button");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const flowCircles = document.querySelectorAll(".circle");

// Request notification permission when the page loads
document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  initializeTodoList();
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
  playSound();
  isWaitingForContinue = true;
  
  if (currentMode === "pomodoro") {
    showNotificationWithContinue("Time's up! Click to take a break");
  } else if (currentMode === "short-break") {
    showNotificationWithContinue("Break's over! Click to start working");
  } else if (currentMode === "long-break") {
    showNotificationWithContinue("Long break finished! Click to get back to work");
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

function showNotificationWithContinue(message) {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification("Pomo-Bloom", {
      body: message,
      requireInteraction: true
    });

    notification.onclick = () => {
      notification.close();
      if (isWaitingForContinue) {
        isWaitingForContinue = false;
        proceedToNextPhase();
      }
    };
  }
}

function proceedToNextPhase() {
  if (currentMode === "pomodoro") {
    flowCount++;
    updateFlowIndicator();
    setMode(flowCount % 4 === 0 ? "long-break" : "short-break");
  } else {
    setMode("pomodoro");
  }
}

function initializeTodoList() {
  const todoInput = document.querySelector('.todo-input');
  const addTodoBtn = document.querySelector('.add-todo-btn');
  const todoList = document.querySelector('.todo-list');

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const todoItem = document.createElement('div');
      todoItem.className = `todo-item ${todo.done ? 'done' : ''}`;
      todoItem.innerHTML = `
        <div class="todo-checkbox" onclick="toggleTodo(${index})"></div>
        <div class="todo-text">${todo.text}</div>
        <div class="todo-actions">
          <button class="todo-edit-btn" onclick="editTodo(${index})">✎</button>
          <button class="todo-delete-btn" onclick="deleteTodo(${index})">×</button>
        </div>
      `;
      todoList.appendChild(todoItem);
    });
  }

  window.toggleTodo = (index) => {
    todos[index].done = !todos[index].done;
    saveTodos();
    renderTodos();
  };

  window.editTodo = (index) => {
    const newText = prompt('Edit task:', todos[index].text);
    if (newText !== null) {
      todos[index].text = newText;
      saveTodos();
      renderTodos();
    }
  };

  window.deleteTodo = (index) => {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
  };

  addTodoBtn.addEventListener('click', () => {
    const text = todoInput.value.trim();
    if (text) {
      todos.push({ text, done: false });
      todoInput.value = '';
      saveTodos();
      renderTodos();
    }
  });

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodoBtn.click();
    }
  });

  renderTodos();
}
