/**
 * LoomLess Studio - Screen Recorder
 * Professional screen recording interface
 */

let mediaRecorder = null;
let recordedChunks = [];
let stream = null;
let startTime = null;
let timerInterval = null;
let isRecording = false;
let recordingDuration = 0;

// DOM elements
let recordBtn,
  recordIcon,
  stopIcon,
  recordingLabel,
  timer,
  statusIndicator,
  statusText,
  studioContainer,
  initialInstructions,
  recordingInstructions,
  featuresSection,
  waveform,
  themeToggle;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeElements();
  setupEventListeners();
  initializeTheme();
});

function initializeElements() {
  recordBtn = document.getElementById("startRecordBtn");
  recordIcon = document.getElementById("recordIcon");
  stopIcon = document.getElementById("stopIcon");
  recordingLabel = document.getElementById("recordingLabel");
  timer = document.getElementById("timer");
  statusIndicator = document.getElementById("statusIndicator");
  statusText = document.getElementById("recordingStatus");
  studioContainer = document.querySelector(".studio-container");
  initialInstructions = document.getElementById("initialInstructions");
  recordingInstructions = document.getElementById("recordingInstructions");
  featuresSection = document.getElementById("featuresSection");
  waveform = document.getElementById("waveform");
  themeToggle = document.getElementById("themeToggle");
}

function setupEventListeners() {
  recordBtn.addEventListener("click", toggleRecording);
  themeToggle.addEventListener("click", toggleTheme);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement === document.body) {
      e.preventDefault();
      toggleRecording();
    }
  });
}

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem("loomless-theme");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("loomless-theme", newTheme);
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  try {
    // Update UI immediately
    recordBtn.disabled = true;
    recordingLabel.textContent = "Requesting Permission...";
    statusText.textContent = "Requesting...";

    // Request screen capture
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: "screen",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: {
        mediaSource: "system",
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    // Check if user cancelled the screen share
    if (!stream) {
      resetUIToInitial();
      return;
    }

    // Set up MediaRecorder
    const options = {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
    };

    // Fallback for older browsers
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "video/webm;codecs=vp8,opus";
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "video/webm";
    }

    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    // Set up MediaRecorder event handlers
    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function () {
      handleRecordingComplete();
    };

    // Handle stream ending (user stops sharing from system)
    stream.getVideoTracks()[0].addEventListener("ended", function () {
      if (isRecording) {
        stopRecording();
      }
    });

    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    isRecording = true;
    startTime = Date.now();

    // Update UI for recording state
    updateUIForRecording();
    startTimer();
  } catch (error) {
    console.error("Error starting recording:", error);
    handleRecordingError(error);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    isRecording = false;

    // Update UI
    recordBtn.disabled = true;
    recordingLabel.textContent = "Processing...";
    statusText.textContent = "Processing";

    // Stop recording
    mediaRecorder.stop();

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}

async function handleRecordingComplete() {
  try {
    // Update UI for processing
    statusText.textContent = "Saving...";

    // Create blob from recorded chunks
    const blob = new Blob(recordedChunks, {
      type: mediaRecorder.mimeType || "video/webm",
    });

    // Calculate recording duration
    recordingDuration = startTime ? Date.now() - startTime : 0;

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `loomless-recording-${timestamp}.webm`;

    // Store recording in IndexedDB
    const recordingId = await window.videoStorage.storeRecording(
      blob,
      mediaRecorder.mimeType || "video/webm",
      {
        filename,
        duration: recordingDuration,
        timestamp: now.toISOString(),
      }
    );

    console.log(`Recording stored with ID: ${recordingId}`);

    // Update UI
    statusText.textContent = "Opening Editor...";
    recordingLabel.textContent = "Opening Editor...";

    // Open editing tab
    setTimeout(() => {
      openEditingTab(recordingId);
    }, 800);
  } catch (error) {
    console.error("Error processing recording:", error);
    handleRecordingError(error);
  }
}

function openEditingTab(recordingId) {
  // Create the editing tab URL with the recording ID
  const editUrl =
    chrome.runtime.getURL("recorder/editor.html") + `?recording=${recordingId}`;

  // Open editing tab
  chrome.tabs.create(
    {
      url: editUrl,
      active: true,
    },
    (tab) => {
      console.log("Opened editing tab:", tab.id);

      // Close the current recorder tab after a short delay
      setTimeout(() => {
        chrome.tabs.getCurrent((currentTab) => {
          if (currentTab) {
            chrome.tabs.remove(currentTab.id);
          }
        });
      }, 500);
    }
  );
}

function updateUIForRecording() {
  // Add recording class to container
  studioContainer.classList.add("recording");

  // Update button
  recordBtn.disabled = false;
  recordIcon.classList.add("hidden");
  stopIcon.classList.remove("hidden");

  // Update label
  recordingLabel.textContent = "Click to Stop Recording";

  // Update status
  statusIndicator.classList.add("recording");
  statusText.textContent = "Recording";

  // Switch instruction panels
  initialInstructions.classList.add("hidden");
  recordingInstructions.classList.remove("hidden");

  // Hide features during recording
  if (featuresSection) {
    featuresSection.style.opacity = "0.3";
    featuresSection.style.pointerEvents = "none";
  }
}

function resetUIToInitial() {
  // Remove recording class
  studioContainer.classList.remove("recording");

  // Reset button
  recordBtn.disabled = false;
  recordIcon.classList.remove("hidden");
  stopIcon.classList.add("hidden");

  // Reset label
  recordingLabel.textContent = "Click to Start Recording";

  // Reset status
  statusIndicator.classList.remove("recording");
  statusText.textContent = "Ready";
  timer.textContent = "00:00";

  // Reset instruction panels
  initialInstructions.classList.remove("hidden");
  recordingInstructions.classList.add("hidden");

  // Show features
  if (featuresSection) {
    featuresSection.style.opacity = "1";
    featuresSection.style.pointerEvents = "auto";
  }

  // Clear timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reset variables
  isRecording = false;
  startTime = null;
  recordedChunks = [];
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }, 1000);
}

function handleRecordingError(error) {
  console.error("Recording error:", error);

  let errorMessage = "Failed";

  if (error.name === "NotAllowedError") {
    errorMessage = "Permission Denied";
    recordingLabel.textContent = "Screen sharing permission denied. Try again.";
  } else if (error.name === "NotSupportedError") {
    errorMessage = "Not Supported";
    recordingLabel.textContent = "Screen recording not supported in this browser.";
  } else if (error.name === "NotFoundError") {
    errorMessage = "Not Found";
    recordingLabel.textContent = "No screen to capture found.";
  } else {
    recordingLabel.textContent = "An error occurred. Please try again.";
  }

  statusText.textContent = errorMessage;

  // Reset UI after error
  setTimeout(() => {
    resetUIToInitial();
  }, 3000);
}

function showSuccessMessage() {
  // Create success notification
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(16, 185, 129, 0.9);
    backdrop-filter: blur(10px);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
    animation: toastIn 0.3s ease;
  `;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    Recording saved!
  `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS for toast animations
const style = document.createElement("style");
style.textContent = `
  @keyframes toastIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes toastOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
