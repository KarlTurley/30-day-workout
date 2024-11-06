
const challenge = [
  { day: 1, plank: 35, pushUps: 7 },
  { day: 2, plank: 40, pushUps: 8 },
  { day: 3, plank: 45, pushUps: 9 },
  { day: 4, plank: 50, pushUps: 10 },
  { day: 5, plank: 55, pushUps: 11 },
  { day: 6, plank: 60, pushUps: 12 },
  { day: 7, plank: 65, pushUps: 13 },
  { day: 8, plank: 70, pushUps: 14 },
  { day: 9, plank: 75, pushUps: 15 },
  { day: 10, plank: 80, pushUps: 16 },
  { day: 11, plank: 85, pushUps: 17 },
  { day: 12, plank: 90, pushUps: 18 },
  { day: 13, plank: 95, pushUps: 19 },
  { day: 14, plank: 100, pushUps: 20 },
  { day: 15, plank: 105, pushUps: 21 },
  { day: 16, plank: 110, pushUps: 22 },
  { day: 17, plank: 115, pushUps: 23 },
  { day: 18, plank: 120, pushUps: 24 },
  { day: 19, plank: 125, pushUps: 25 },
  { day: 20, plank: 130, pushUps: 26 },
  { day: 21, plank: 135, pushUps: 27 },
  { day: 22, plank: 140, pushUps: 28 },
  { day: 23, plank: 145, pushUps: 29 },
  { day: 24, plank: 150, pushUps: 30 },
  { day: 25, plank: 155, pushUps: 31 },
  { day: 26, plank: 160, pushUps: 32 },
  { day: 27, plank: 165, pushUps: 33 },
  { day: 28, plank: 170, pushUps: 34 },
  { day: 29, plank: 175, pushUps: 35 },
  { day: 30, plank: 180, pushUps: 36 }
];

let currentDay = getSavedProgress();

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
}

function markComplete() {
  if (currentDay < challenge.length) {
    document.getElementById(`status-${currentDay}`).innerHTML = '<span class="completed">Completed</span>';
    currentDay++;
    saveProgress();
    updateDayGoal();
    updateDayText(); // Update day text when marking complete
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

function markComplete() {
  if (currentDay < challenge.length) {
    document.getElementById(`status-${currentDay}`).innerHTML = '<span class="completed">Completed</span>';
    currentDay++;
    saveProgress();
    updateDayGoal();
    updateDayText(); // Update day text when marking complete
    initializeCountdown(); 
    updateProgressBar(); // Update progress bar
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
    window.location.href = `30-day-workout/pushup.html?reps=${targetReps}`;
  } else {
    alert("Challenge completed!");
  }
}
