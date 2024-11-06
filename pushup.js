// pushup.js

let model;
let video;
let canvas;
let ctx;
let reps = 0;
let isInPosition = false;
let isInNeutralPosition = false; // To track if user starts in a neutral position
let timer;

// Load MoveNet model
async function loadMoveNetModel() {
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );
  return detector;
}

// Start video feed and configure canvas
async function startVideoFeed() {
  video = document.getElementById('videoFeed');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  // Wait for the video metadata to load to set the canvas size
  video.onloadedmetadata = () => {
    canvas = document.getElementById('output');
    resizeCanvasToVideo();
    video.play();
  };

  // Adjust canvas size if the window is resized
  window.addEventListener('resize', resizeCanvasToVideo);
}

// Function to match canvas to video dimensions
function resizeCanvasToVideo() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx = canvas.getContext('2d');
}

function startCountdown(callback) {
  let countdown = 5;
  const countdownElement = document.getElementById("countdownOverlay");
  countdownElement.style.display = "block"; // Make overlay visible

  const countdownInterval = setInterval(() => {
    countdownElement.textContent = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownInterval);
      countdownElement.style.display = "none"; // Hide overlay after countdown
      callback();
    }
  }, 1000);
}

// Track push-ups based on body keypoints
async function trackExercise() {
  if (!model || !video) return;

  // Start countdown and begin tracking after delay
  startCountdown(() => {
    timer = setInterval(async () => {
      const poses = await model.estimatePoses(video);

      if (poses && poses.length > 0) {
        const keypoints = poses[0].keypoints;

        // Clear previous frame and draw current keypoints and skeleton
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawKeypointsAndSkeleton(keypoints);

        // Check for neutral (arms extended) position initially
        if (!isInNeutralPosition) {
          if (checkNeutralPosition(keypoints)) {
            isInNeutralPosition = true;
            console.log("Neutral position detected. Ready to start counting push-ups.");
          }
          return; // Don't start counting until neutral position is reached
        }

        // Detect push-up
        if (detectPushUp(keypoints)) {
          if (!isInPosition) {
            isInPosition = true;
            reps++;
            document.getElementById("repCount").textContent = reps;
          }
        } else {
          isInPosition = false;
        }
      }
    }, 500); // Run every 0.5 seconds
  });
}

// Draw keypoints and skeleton on canvas
function drawKeypointsAndSkeleton(keypoints) {
  const relevantParts = [
    "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow",
    "left_wrist", "right_wrist",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle"
  ];

  const connections = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"]
  ];

  keypoints.forEach(point => {
    if (point.score > 0.3 && relevantParts.includes(point.name)) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  });

  connections.forEach(([partA, partB]) => {
    const pointA = keypoints.find(point => point.name === partA);
    const pointB = keypoints.find(point => point.name === partB);

    if (pointA && pointB && pointA.score > 0.3 && pointB.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
  });
}

// Check if user is in neutral (arms extended) position
function checkNeutralPosition(keypoints) {
  const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
  const rightShoulder = keypoints.find(k => k.name === "right_shoulder");
  const leftWrist = keypoints.find(k => k.name === "left_wrist");
  const rightWrist = keypoints.find(k => k.name === "right_wrist");

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const wristY = (leftWrist.y + rightWrist.y) / 2;

  // Check if wrists are sufficiently lower than shoulders to indicate an extended position
  return wristY > shoulderY + 250; // 250 threshold for neutral position
}

// Detect push-up based on shoulder and wrist alignment
function detectPushUp(keypoints) {
  const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
  const rightShoulder = keypoints.find(k => k.name === "right_shoulder");
  const leftWrist = keypoints.find(k => k.name === "left_wrist");
  const rightWrist = keypoints.find(k => k.name === "right_wrist");

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const wristY = (leftWrist.y + rightWrist.y) / 2;

  console.log(`ShoulderY: ${shoulderY}, WristY: ${wristY}, Difference: ${wristY - shoulderY}`);

  return wristY < shoulderY + 300; // Adjust threshold based on testing
}

// Stop the exercise tracking when the user chooses
function stopTracking() {
  clearInterval(timer);
  alert(`Tracking stopped. You completed ${reps} push-ups.`);
}

// Initialize video feed and tracking
document.addEventListener("DOMContentLoaded", async () => {
  model = await loadMoveNetModel();
  await startVideoFeed();
  trackExercise();
});
