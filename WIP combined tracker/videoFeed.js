// videoFeed.js

let model;
let video;
let canvas;
let ctx;
let reps = 0;
let duration = 0;
let isInPosition = false;
let timer;
let exerciseCompleted = false;
let exerciseMode = "pushup"; // Default mode

// Retrieve the current day's goals from localStorage with defaults
const dayGoals = JSON.parse(localStorage.getItem('dayGoals')) || { plank: 30, pushUps: 10 };
const targetReps = dayGoals.pushUps || 10; // Default to 10 if not found
const targetDuration = dayGoals.plank || 30; // Default to 30 seconds if not found

// Function to set the current exercise mode
function setExerciseMode() {
  const modeSelect = document.getElementById("exerciseMode");
  exerciseMode = modeSelect.value;
}

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

// Track exercise based on body keypoints and selected mode
async function trackExercise() {
  if (!model || !video) return;

  timer = setInterval(async () => {
    const poses = await model.estimatePoses(video);

    if (poses && poses.length > 0) {
      const keypoints = poses[0].keypoints;

      // Clear previous frame and draw current keypoints and skeleton
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawKeypointsAndSkeleton(keypoints);

      // Track exercise based on selected mode
      if (exerciseMode === "pushup") {
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
      } else if (exerciseMode === "plank") {
        // Detect plank
        if (detectPlank(keypoints)) {
          duration++;
          document.getElementById("plankDuration").textContent = `${duration} seconds`;
        }
      }

      // Check if exercise goals are met
      if ((exerciseMode === "pushup" && reps >= targetReps) ||
          (exerciseMode === "plank" && duration >= targetDuration)) {
        clearInterval(timer);
        exerciseCompleted = true;
        alert("Congratulations! You've completed today's exercise.");
      }
    }
  }, 500); // Run every 0.5 seconds
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

// Detect plank based on shoulder-hip-ankle alignment
function detectPlank(keypoints) {
  const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
  const leftHip = keypoints.find(k => k.name === "left_hip");
  const leftAnkle = keypoints.find(k => k.name === "left_ankle");

  const shoulderToHipDiff = Math.abs(leftShoulder.y - leftHip.y);
  const hipToAnkleDiff = Math.abs(leftHip.y - leftAnkle.y);

  console.log(`Shoulder-Hip Difference: ${shoulderToHipDiff}, Hip-Ankle Difference: ${hipToAnkleDiff}`);

  return shoulderToHipDiff < 80 && hipToAnkleDiff < 35;
}

// Initialize video feed and tracking
document.addEventListener("DOMContentLoaded", async () => {
  model = await loadMoveNetModel();
  await startVideoFeed();
  trackExercise();
});
