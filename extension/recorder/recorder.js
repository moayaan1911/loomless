let mediaRecorder = null;
let recordedChunks = [];
let stream = null;
let startTime = null;
let timerInterval = null;
let isRecording = false;
let recordingDuration = 0;

// DOM elements
let startBtn,
  stopBtn,
  timer,
  status,
  initialInstructions,
  recordingInstructions;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  startBtn = document.getElementById("startRecordBtn");
  stopBtn = document.getElementById("stopRecordBtn");
  timer = document.getElementById("timer");
  status = document.getElementById("recordingStatus");
  initialInstructions = document.getElementById("initialInstructions");
  recordingInstructions = document.getElementById("recordingInstructions");

  // Event listeners
  startBtn.addEventListener("click", startRecording);
  stopBtn.addEventListener("click", stopRecording);
});

async function startRecording() {
  try {
    // Update UI immediately
    startBtn.disabled = true;
    startBtn.innerHTML =
      '<span class="btn-icon">⏳</span><span class="btn-text">Requesting Permission...</span>';
    status.textContent = "Requesting screen access...";

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
    stopBtn.disabled = true;
    stopBtn.innerHTML =
      '<span class="btn-icon">⏹️</span><span class="btn-text">Stop Recording</span>';
    status.textContent = "Processing recording...";

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
    status.textContent = "Processing recording...";

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
    status.textContent = "Recording processed! Opening editor...";

    // Open editing tab
    setTimeout(() => {
      openEditingTab(recordingId);
    }, 1000);
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

function downloadRecording(url, filename) {
  // Create a temporary anchor element for download
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function updateUIForRecording() {
  // Hide start button, show stop button
  startBtn.style.display = "none";
  stopBtn.style.display = "flex";
  stopBtn.disabled = false;

  // Update status
  status.textContent = "🔴 Recording";
  document.body.classList.add("recording");

  // Switch instruction sets
  initialInstructions.classList.add("hidden");
  recordingInstructions.classList.remove("hidden");
}

function resetUIToInitial() {
  // Reset buttons
  startBtn.style.display = "flex";
  startBtn.disabled = false;
  startBtn.innerHTML =
    '<span class="btn-icon">⚫</span><span class="btn-text">Start Recording</span>';

  stopBtn.style.display = "none";
  stopBtn.disabled = true;
  stopBtn.innerHTML =
    '<span class="btn-icon">⏹️</span><span class="btn-text">Stop Recording</span>';

  // Reset status and timer
  status.textContent = "Ready to Record";
  timer.textContent = "00:00";
  document.body.classList.remove("recording");

  // Reset instruction sets
  initialInstructions.classList.remove("hidden");
  recordingInstructions.classList.add("hidden");

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

  let errorMessage = "Failed to start recording. ";

  if (error.name === "NotAllowedError") {
    errorMessage += "Please allow screen sharing and try again.";
  } else if (error.name === "NotSupportedError") {
    errorMessage += "Screen recording is not supported in this browser.";
  } else if (error.name === "NotFoundError") {
    errorMessage += "No screen to capture found.";
  } else {
    errorMessage += "Please try again.";
  }

  status.textContent = errorMessage;

  // Reset UI after error
  setTimeout(() => {
    resetUIToInitial();
  }, 3000);
}

function showSuccessMessage() {
  // Create success notification
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(34, 197, 94, 0.9);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 1000;
    backdrop-filter: blur(10px);
    animation: slideIn 0.3s ease;
  `;
  successDiv.innerHTML = "✅ Recording saved to Downloads!";

  document.body.appendChild(successDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Add CSS for success notification animation
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
