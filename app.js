let currentDay = getSavedProgress();

// Function to initialize the challenge based on user input
function initializeChallenge(startPlank, startPushUps, plankIncrement, pushUpsIncrement) {
  const challenge = [];

  for (let day = 1; day <= 30; day++) {
    challenge.push({
      day: day,
      plank: startPlank + (plankIncrement * (day - 1)),
      pushUps: startPushUps + (pushUpsIncrement * (day - 1))
    });
  }

  return challenge;
}

// Default challenge values
let challenge = initializeChallenge(35, 7, 5, 1);

function getSavedProgress() {
  const savedDay = localStorage.getItem('currentDay');
  return savedDay ? parseInt(savedDay, 10) : 0;
}

function saveProgress() {
  localStorage.setItem('currentDay', currentDay);
}

function loadProgress() {
  const progressBody = document.getElementById("progressBody");
  progressBody.innerHTML = '';

  challenge.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>Day ${entry.day}</td>
      <td>${entry.plank} sec</td>
      <td>${entry.pushUps}</td>
      <td id="status-${index}">${index < currentDay ? '<span class="completed">Completed</span>' : ''}</td>
    `;
    progressBody.appendChild(row);
  });
  
  updateDayGoal();
  updateDayText(); // Update day text when loading progress
  updatecountdownDisplay (); //Update countdown when loading progress
}

function markComplete() {
  if (currentDay < challenge.length) {
    document.getElementById(`status-${currentDay}`).innerHTML = '<span class="completed">Completed</span>';
    currentDay++;
    saveProgress();
    updateDayGoal();
    updateDayText(); // Update day text when marking complete
    updateProgressBar(); // Update progress bar
    updatecountdownDisplay (); //Update countdown display
  }
}

function updateDayGoal() {
  if (currentDay < challenge.length) {
    const todayGoal = challenge[currentDay];
    document.getElementById("dayGoal").textContent = `Day ${todayGoal.day}: ${todayGoal.plank} sec plank, ${todayGoal.pushUps} push-ups`;

    // Set the Start button to use today's plank duration
    document.getElementById("startButton").onclick = () => startCountdown(todayGoal.plank);
  } else {
    document.getElementById("dayGoal").textContent = "Challenge Completed!";
  }
}

function updateDayText() {
  if (currentDay < challenge.length) {
    const todayGoal = challenge[currentDay];
    document.getElementById("dayText").textContent = `Day ${todayGoal.day} Plank Countdown timer`;
  } else {
    document.getElementById("dayText").textContent = "Challenge Completed!";
  }
}


function updateProgressBar() {
  const progressPercentage = ((currentDay / challenge.length) * 100).toFixed(2);
  document.getElementById("progressBar").style.width = `${progressPercentage}%`;
}

function resetProgress() {
  localStorage.removeItem('currentDay');
  currentDay = 0;
  loadProgress();
  updateProgressBar();
}

//Function to display correct countdown
function updatecountdownDisplay() {if (currentDay < challenge.length) {
  const todayGoal = challenge[currentDay];
  document.getElementById("countdownDisplay").textContent = `${todayGoal.plank} secs`;
} else {
  document.getElementById("countdownDisplay").textContent = "Challenge Completed!";
}
}
  

// Function to handle the user input and generate the new challenge
function generateChallenge() {
  const startPlank = parseInt(document.getElementById("startPlank").value, 10);
  const startPushUps = parseInt(document.getElementById("startPushUps").value, 10);
  const plankIncrement = parseInt(document.getElementById("plankIncrement").value, 10);
  const pushUpsIncrement = parseInt(document.getElementById("pushUpsIncrement").value, 10);

  // Initialize the challenge with user-defined values
  challenge = initializeChallenge(startPlank, startPushUps, plankIncrement, pushUpsIncrement);

  // Reset progress to start the new challenge
  resetProgress();
  loadProgress();
}

// Call updateProgressBar when loading progress initially
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateProgressBar(); // Show initial progress on page load
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

function openPushupTracker() {
  if (currentDay < challenge.length) {
    // Retrieve today's target push-ups based on currentDay
    const targetReps = challenge[currentDay].pushUps;

    // Open pushup.html with target reps as a URL parameter
    window.location.href = `pushup.html?reps=${targetReps}`;
  } else {
    alert("Challenge completed!");
  }
}
// Open settings module//

function toggleCustomizeChallenge() {
  const customizeContainer = document.getElementById('customize-challenge');
  
  if (customizeContainer.style.display === 'none' || customizeContainer.style.display === '') {
    customizeContainer.style.display = 'flex';
  } else {
    customizeContainer.style.display = 'none';
  }
}
//Open progress view
function toggleProgressView() {
  const customizeContainer = document.getElementById('progressView');
  
  if (customizeContainer.style.display === 'none' || customizeContainer.style.display === '') {
    customizeContainer.style.display = 'flex';
  } else {
    customizeContainer.style.display = 'none';
  }
}
function resetProgress() {
  localStorage.removeItem('currentDay');
  currentDay = 0;
  loadProgress();
  initializeCountdown(); 
  updateProgressBar();
}

// Function to generate and download the .ics calendar file
function generateICSFile() {
  const challengeStartDate = new Date();
  const icsEvents = [];

  for (let i = 0; i < 30; i++) {
    const day = i + 1;
    const eventDate = new Date(challengeStartDate);
    eventDate.setDate(challengeStartDate.getDate() + i);

    const year = eventDate.getUTCFullYear();
    const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
    const dayDate = String(eventDate.getUTCDate()).padStart(2, '0');
    const hour = '08'; // Default start hour (e.g., 8 AM)
    const minute = '00';

    const event = `
BEGIN:VEVENT
SUMMARY:Day ${day} Plank and Push-Up Challenge
DTSTART:${year}${month}${dayDate}T${hour}${minute}00Z
DTEND:${year}${month}${dayDate}T${hour}${minute}30Z
DESCRIPTION:Day ${day} of the 30-Day Challenge: ${challenge[i].plank} seconds plank and ${challenge[i].pushUps} push-ups.
END:VEVENT
`;
    icsEvents.push(event);
  }
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
${icsEvents.join("\n")}
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  // Set the href for the download link in the modal
  const downloadLink = document.getElementById("downloadLink");
  downloadLink.href = url;
  downloadLink.download = "30_day_challenge.ics";

  // Show the modal
  document.getElementById("calendarModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("calendarModal").style.display = "none";
}
