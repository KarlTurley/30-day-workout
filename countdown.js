let countdownTimer;
let remainingTime = 0; // Initialize with a default value

// Function to update the display for countdown
function updateCountdownDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById("countdownDisplay").textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to start the countdown with the provided duration
function startCountdown(duration) {
  // Clear any existing countdown to prevent multiple intervals
  clearInterval(countdownTimer);
  
  remainingTime = parseInt(duration, 10); // Ensure duration is a number

  // If duration is NaN or zero, set to a default value and log a warning
  if (isNaN(remainingTime) || remainingTime <= 0) {
    console.warn("Invalid countdown duration provided. Setting to default 30 seconds.");
    remainingTime = 30;
  }

  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").disabled = false;

  updateCountdownDisplay(); // Initialize the display with the new duration

  countdownTimer = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateCountdownDisplay();
    } else {
      stopCountdown(); // Stop when the timer hits zero
      alert("Time's up!");
    }
  }, 1000);
}

// Function to stop the countdown
function stopCountdown() {
  clearInterval(countdownTimer);
  document.getElementById("startButton").disabled = false;
  document.getElementById("stopButton").disabled = true;
  updateCountdownDisplay();
}

// Function to initialize the countdown with the current day's plank duration
function initializeCountdown() {
  if (currentDay < challenge.length) {
    remainingTime = challenge[currentDay].plank; // Set remainingTime to today's plank duration
  } else {
    remainingTime = 0; // Set to 0 if the challenge is complete
  }
  updateCountdownDisplay(); // Show the initial value on load
}

// Initialize the countdown display with the current day's duration when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeCountdown();
});
