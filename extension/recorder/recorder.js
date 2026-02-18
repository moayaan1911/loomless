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

// Recording mode variables
let recordingMode = 'screen'; // 'screen' | 'screen-mic' | 'screen-cam' | 'screen-cam-mic'
let cameraStream = null;
let cameraSetupPromise = null;
let micStream = null;
let compositeCanvas = null;
let compositeCtx = null;
let animationFrameId = null;
let audioContext = null;
let cameraOverlayPosition = { x: 1, y: 1 };
let cameraDragState = {
  active: false,
  pointerId: null,
  offsetX: 0,
  offsetY: 0
};
const SELF_CAPTURE_HANDLE = "loomless-recorder";

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
  themeToggle,
  modeSelector,
  cameraPreviewContainer,
  cameraPreview;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeElements();
  setupEventListeners();
  initializeTheme();
  configureCaptureHandle();
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
  modeSelector = document.getElementById("modeSelector");
  cameraPreviewContainer = document.getElementById("cameraPreviewContainer");
  cameraPreview = document.getElementById("cameraPreview");
}

function setupEventListeners() {
  recordBtn.addEventListener("click", toggleRecording);
  themeToggle.addEventListener("click", toggleTheme);

  // Mode selector buttons
  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isRecording) {
        setRecordingMode(btn.dataset.mode);
      }
    });
  });

  setupCameraDragging();

  window.addEventListener("resize", () => {
    if (cameraPreviewContainer && !cameraPreviewContainer.classList.contains("hidden")) {
      applyCameraPreviewPosition();
    }
  });

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

function configureCaptureHandle() {
  try {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.setCaptureHandleConfig !== "function") {
      return;
    }

    const extensionOrigin = window.location.origin;
    navigator.mediaDevices.setCaptureHandleConfig({
      handle: SELF_CAPTURE_HANDLE,
      exposeOrigin: false,
      permittedOrigins: [extensionOrigin]
    });
  } catch (error) {
    console.warn("Capture-handle configuration is unavailable:", error);
  }
}

function isSelfCaptureTrack(track) {
  if (!track || typeof track.getCaptureHandle !== "function") {
    return false;
  }

  try {
    const captureHandle = track.getCaptureHandle();
    return captureHandle && captureHandle.handle === SELF_CAPTURE_HANDLE;
  } catch (error) {
    return false;
  }
}

function isLikelySelfTabCapture(track) {
  if (!track) {
    return false;
  }

  if (isSelfCaptureTrack(track)) {
    return true;
  }

  const settings = typeof track.getSettings === "function" ? track.getSettings() : {};
  const displaySurface = settings?.displaySurface;
  const isBrowserTab = displaySurface === "browser";

  if (!isBrowserTab) {
    return false;
  }

  const label = (track.label || "").toLowerCase();
  const title = (document.title || "").toLowerCase();
  const labelLooksLikeRecorderTab =
    (title && label.includes(title)) ||
    label.includes("loomless") ||
    label.includes("studio");

  // If tab capture starts and this page remains visible, it's usually the current tab.
  const recorderStillVisible = document.visibilityState === "visible";

  return labelLooksLikeRecorderTab || recorderStillVisible;
}

function isCameraModeEnabled(mode = recordingMode) {
  return mode === "screen-cam" || mode === "screen-cam-mic";
}

/**
 * Set the recording mode and update UI
 */
function setRecordingMode(mode) {
  recordingMode = mode;

  // Update button states
  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Show/hide camera preview based on mode
  const needsCamera = isCameraModeEnabled(mode);
  if (needsCamera) {
    setupCameraPreview();
  } else {
    hideCameraPreview();
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPreviewBounds() {
  const elementWidth = cameraPreviewContainer.offsetWidth || 160;
  const elementHeight = cameraPreviewContainer.offsetHeight || 160;
  const viewportPadding = 12;
  return {
    minLeft: viewportPadding,
    minTop: viewportPadding,
    maxLeft: Math.max(viewportPadding, window.innerWidth - elementWidth - viewportPadding),
    maxTop: Math.max(viewportPadding, window.innerHeight - elementHeight - viewportPadding)
  };
}

function applyCameraPreviewPosition() {
  if (!cameraPreviewContainer) return;
  const bounds = getPreviewBounds();
  const left = bounds.minLeft + (bounds.maxLeft - bounds.minLeft) * cameraOverlayPosition.x;
  const top = bounds.minTop + (bounds.maxTop - bounds.minTop) * cameraOverlayPosition.y;
  cameraPreviewContainer.style.left = `${left}px`;
  cameraPreviewContainer.style.top = `${top}px`;
  cameraPreviewContainer.style.right = "auto";
  cameraPreviewContainer.style.bottom = "auto";
}

function updateOverlayPositionFromPixels(left, top) {
  const bounds = getPreviewBounds();
  const spanX = Math.max(1, bounds.maxLeft - bounds.minLeft);
  const spanY = Math.max(1, bounds.maxTop - bounds.minTop);
  cameraOverlayPosition.x = clamp((left - bounds.minLeft) / spanX, 0, 1);
  cameraOverlayPosition.y = clamp((top - bounds.minTop) / spanY, 0, 1);
}

function setupCameraDragging() {
  if (!cameraPreviewContainer) return;

  cameraPreviewContainer.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;

    const rect = cameraPreviewContainer.getBoundingClientRect();
    cameraDragState.active = true;
    cameraDragState.pointerId = event.pointerId;
    cameraDragState.offsetX = event.clientX - rect.left;
    cameraDragState.offsetY = event.clientY - rect.top;
    cameraPreviewContainer.classList.add("dragging");
    cameraPreviewContainer.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  cameraPreviewContainer.addEventListener("pointermove", (event) => {
    if (!cameraDragState.active || event.pointerId !== cameraDragState.pointerId) return;

    const bounds = getPreviewBounds();
    const nextLeft = clamp(event.clientX - cameraDragState.offsetX, bounds.minLeft, bounds.maxLeft);
    const nextTop = clamp(event.clientY - cameraDragState.offsetY, bounds.minTop, bounds.maxTop);
    cameraPreviewContainer.style.left = `${nextLeft}px`;
    cameraPreviewContainer.style.top = `${nextTop}px`;
    cameraPreviewContainer.style.right = "auto";
    cameraPreviewContainer.style.bottom = "auto";
    updateOverlayPositionFromPixels(nextLeft, nextTop);
  });

  const stopDragging = (event) => {
    if (!cameraDragState.active || event.pointerId !== cameraDragState.pointerId) return;
    cameraDragState.active = false;
    cameraPreviewContainer.classList.remove("dragging");
    cameraPreviewContainer.releasePointerCapture(event.pointerId);
    cameraDragState.pointerId = null;
  };

  cameraPreviewContainer.addEventListener("pointerup", stopDragging);
  cameraPreviewContainer.addEventListener("pointercancel", stopDragging);
}

/**
 * Setup and show camera preview
 */
async function setupCameraPreview() {
  try {
    // Reuse any in-flight request to avoid creating multiple camera streams.
    if (!cameraStream) {
      if (!cameraSetupPromise) {
        cameraSetupPromise = navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
      }
      cameraStream = await cameraSetupPromise;
    }

    // If mode changed while awaiting permission, discard this preview stream.
    if (!isCameraModeEnabled()) {
      if (cameraStream && !isRecording) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }
      return;
    }

    cameraPreview.srcObject = cameraStream;
    cameraPreviewContainer.classList.remove("hidden");
    applyCameraPreviewPosition();
  } catch (error) {
    console.error("Error accessing camera:", error);
    handleCameraError(error);
  } finally {
    cameraSetupPromise = null;
  }
}

/**
 * Hide camera preview and stop stream
 */
function hideCameraPreview() {
  cameraPreviewContainer.classList.add("hidden");
  if (cameraStream && !isRecording) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraPreview.srcObject = null;
}

/**
 * Handle camera access errors
 */
function handleCameraError(error) {
  let message = "Could not access camera.";
  if (error.name === "NotAllowedError") {
    message = "Camera permission denied. Please allow camera access.";
  } else if (error.name === "NotFoundError") {
    message = "No camera found on this device.";
  }

  // Fall back to screen-only mode
  setRecordingMode('screen');

  // Show error toast
  showErrorToast(message);
}

/**
 * Get microphone stream
 */
async function getMicStream() {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
}

/**
 * Merge system audio with microphone audio
 */
function mergeAudioTracks(screenStream, micStream) {
  audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  // Add screen audio if present
  const screenAudioTracks = screenStream.getAudioTracks();
  if (screenAudioTracks.length > 0) {
    const screenSource = audioContext.createMediaStreamSource(
      new MediaStream([screenAudioTracks[0]])
    );
    screenSource.connect(destination);
  }

  // Add mic audio
  const micSource = audioContext.createMediaStreamSource(micStream);
  micSource.connect(destination);

  return destination.stream.getAudioTracks()[0];
}

/**
 * Create composite video stream with camera overlay
 */
function createCompositeStream(screenStream, cameraStream) {
  const screenTrack = screenStream.getVideoTracks()[0];
  const screenSettings = screenTrack.getSettings();

  const width = screenSettings.width || 1920;
  const height = screenSettings.height || 1080;

  // Create canvas for compositing
  compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  compositeCtx = compositeCanvas.getContext('2d');

  // Create video elements for drawing
  const screenVideo = document.createElement('video');
  screenVideo.srcObject = new MediaStream([screenTrack]);
  screenVideo.muted = true;
  screenVideo.play();

  const cameraVideo = document.createElement('video');
  cameraVideo.srcObject = cameraStream;
  cameraVideo.muted = true;
  cameraVideo.play();

  // Camera overlay size and position
  const camSize = Math.min(width, height) * 0.2; // 20% of smaller dimension
  const padding = 20;

  // Start compositing loop
  function drawFrame() {
    // Draw screen
    compositeCtx.drawImage(screenVideo, 0, 0, width, height);

    const camTravelX = Math.max(0, width - camSize - padding * 2);
    const camTravelY = Math.max(0, height - camSize - padding * 2);
    const camX = padding + camTravelX * cameraOverlayPosition.x;
    const camY = padding + camTravelY * cameraOverlayPosition.y;

    // Draw circular camera overlay
    compositeCtx.save();

    // Create circular clip path
    compositeCtx.beginPath();
    compositeCtx.arc(camX + camSize / 2, camY + camSize / 2, camSize / 2, 0, Math.PI * 2);
    compositeCtx.closePath();
    compositeCtx.clip();

    // Draw camera video (mirrored)
    compositeCtx.translate(camX + camSize, camY);
    compositeCtx.scale(-1, 1);
    compositeCtx.drawImage(cameraVideo, 0, 0, camSize, camSize);

    compositeCtx.restore();

    // Draw border around camera
    compositeCtx.beginPath();
    compositeCtx.arc(camX + camSize / 2, camY + camSize / 2, camSize / 2, 0, Math.PI * 2);
    compositeCtx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    compositeCtx.lineWidth = 3;
    compositeCtx.stroke();

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  drawFrame();

  // Capture canvas as video stream
  return compositeCanvas.captureStream(30);
}

/**
 * Show error toast notification
 */
function showErrorToast(message) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(239, 68, 68, 0.9);
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
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
    animation: toastIn 0.3s ease;
  `;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    ${message}
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

async function startRecording() {
  try {
    // Update UI immediately
    recordBtn.disabled = true;
    recordingLabel.textContent = "Requesting Permission...";
    statusText.textContent = "Requesting...";

    const needsMic = recordingMode === 'screen-mic' || recordingMode === 'screen-cam-mic';
    const needsCamera = isCameraModeEnabled();

    // Request screen capture
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
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
    if (!screenStream) {
      resetUIToInitial();
      return;
    }

    // Get microphone stream if needed
    if (needsMic) {
      try {
        micStream = await getMicStream();
      } catch (micError) {
        console.error("Mic access error:", micError);
        showErrorToast("Could not access microphone. Recording without mic.");
      }
    }

    // Get camera stream if needed (may already have it from preview)
    if (needsCamera && !cameraStream) {
      try {
        if (cameraSetupPromise) {
          cameraStream = await cameraSetupPromise;
        } else {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 }
            },
            audio: false
          });
        }
      } catch (camError) {
        console.error("Camera access error:", camError);
        showErrorToast("Could not access camera. Recording without camera overlay.");
      }
    }

    const screenTrack = screenStream.getVideoTracks()[0];
    const isSelfCapture = isLikelySelfTabCapture(screenTrack);

    // Build the final stream
    let finalVideoTrack;
    let finalAudioTrack;

    // Determine if the on-page camera preview is already visible in the capture.
    // - Self-tab capture: preview is in the stream (isSelfCapture === true)
    // - Entire-screen capture (displaySurface === "monitor"): recorder tab is on screen,
    //   so the preview circle is already captured — compositing would create a duplicate.
    // - Window/tab capture of a DIFFERENT target: preview is NOT in the stream,
    //   so we need to composite the camera overlay into the video.
    const screenSettings = screenTrack.getSettings ? screenTrack.getSettings() : {};
    const isEntireScreen = screenSettings.displaySurface === "monitor";
    const previewAlreadyCaptured = isSelfCapture || isEntireScreen;

    if (needsCamera && cameraStream && !previewAlreadyCaptured) {
      const compositeStream = createCompositeStream(screenStream, cameraStream);
      finalVideoTrack = compositeStream.getVideoTracks()[0];
    } else {
      finalVideoTrack = screenTrack;
    }

    // Handle audio: merge mic with system audio or use system audio only
    if (needsMic && micStream) {
      finalAudioTrack = mergeAudioTracks(screenStream, micStream);
    } else {
      const audioTracks = screenStream.getAudioTracks();
      finalAudioTrack = audioTracks.length > 0 ? audioTracks[0] : null;
    }

    // Create the final stream
    const tracks = [finalVideoTrack];
    if (finalAudioTrack) {
      tracks.push(finalAudioTrack);
    }
    stream = new MediaStream(tracks);

    // Store screen stream reference for cleanup
    stream._screenStream = screenStream;

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
    screenTrack.addEventListener("ended", function () {
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

    // Stop animation frame for compositing
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Close audio context
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    // Stop all tracks from main stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      // Also stop the original screen stream
      if (stream._screenStream) {
        stream._screenStream.getTracks().forEach((track) => track.stop());
      }
    }

    // Stop camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    // Stop mic stream
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      micStream = null;
    }

    // Hide camera preview
    hideCameraPreview();
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

  // Hide mode selector during recording
  if (modeSelector) {
    modeSelector.style.opacity = "0.3";
    modeSelector.style.pointerEvents = "none";
  }

  // Hide features during recording
  if (featuresSection) {
    featuresSection.style.opacity = "0.3";
    featuresSection.style.pointerEvents = "none";
  }

  // Keep local camera preview visible while recording so users can monitor placement.
  if (isCameraModeEnabled()) {
    cameraPreviewContainer.classList.remove("hidden");
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

  // Show mode selector
  if (modeSelector) {
    modeSelector.style.opacity = "1";
    modeSelector.style.pointerEvents = "auto";
  }

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

  // Stop animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Close audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  // Stop camera stream
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  // Stop mic stream
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  // Hide camera preview
  hideCameraPreview();

  // Reset variables
  isRecording = false;
  startTime = null;
  recordedChunks = [];

  // Restore camera preview if current mode still requires camera.
  if (isCameraModeEnabled()) {
    setupCameraPreview();
  }
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
