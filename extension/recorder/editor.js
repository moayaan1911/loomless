/**
 * LoomLess Studio - Professional Video Editor
 * Handles video editing functionality including trim, crop, speed, and format conversion
 */

// videoStorage is available globally from storage.js

// DOM elements
let videoPlayer,
  videoLoading,
  timelineTrack,
  playhead,
  trimRegion,
  trimStartHandle,
  trimEndHandle,
  trimStartBtn,
  trimEndBtn,
  resetTrimBtn,
  downloadBtn,
  statusMessage,
  statusText,
  statusProgress,
  statusProgressBar,
  speedSlider,
  speedValue,
  presetButtons,
  formatButtons,
  infoDuration,
  infoSize,
  infoTrimmed,
  cropOverlay,
  cropSelection,
  cropModeBtn,
  cropDimensionsText,
  panelTabs,
  panelContents,
  currentTimeDisplay,
  totalTimeDisplay,
  playPauseBtn,
  playIcon,
  pauseIcon,
  stopBtn,
  skipBackBtn,
  skipForwardBtn;

// Video state
let currentRecording = null;
let videoBlob = null;
let trimStartTime = 0;
let trimEndTime = 0;
let playbackSpeed = 1.0;
let cropSettings = { aspect: "none", x: 0, y: 0, width: 0, height: 0 };
let exportFormat = "webm";
let isDraggingTrim = false;
let draggedHandle = null;

// Crop state
let isCropModeActive = false;
let isDraggingCrop = false;
let cropDragStart = { x: 0, y: 0 };
let cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
let cropResizeHandle = null;

// Theme toggle element
let themeToggle;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  initializeElements();
  setupEventListeners();
  initializeTheme();
  await loadVideoFromStorage();
});

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

/**
 * Initialize DOM element references
 */
function initializeElements() {
  videoPlayer = document.getElementById("videoPlayer");
  videoLoading = document.getElementById("videoLoading");
  timelineTrack = document.getElementById("timelineTrack");
  playhead = document.getElementById("playhead");
  trimRegion = document.getElementById("trimRegion");
  trimStartHandle = document.getElementById("trimStartHandle");
  trimEndHandle = document.getElementById("trimEndHandle");
  trimStartBtn = document.getElementById("trimStartBtn");
  trimEndBtn = document.getElementById("trimEndBtn");
  resetTrimBtn = document.getElementById("resetTrimBtn");
  downloadBtn = document.getElementById("downloadBtn");
  statusMessage = document.getElementById("statusMessage");
  statusText = document.getElementById("statusText");
  statusProgress = document.getElementById("statusProgress");
  statusProgressBar = document.getElementById("statusProgressBar");

  // Speed controls
  speedSlider = document.getElementById("speedSlider");
  speedValue = document.getElementById("speedValue");
  presetButtons = document.querySelectorAll(".preset-btn");

  // Format controls
  formatButtons = document.querySelectorAll(".format-option");

  // Video info
  infoDuration = document.getElementById("infoDuration");
  infoSize = document.getElementById("infoSize");
  infoTrimmed = document.getElementById("infoTrimmed");

  // Crop elements
  cropOverlay = document.getElementById("cropOverlay");
  cropSelection = document.getElementById("cropSelection");
  cropModeBtn = document.getElementById("cropModeBtn");
  cropDimensionsText = document.getElementById("cropDimensionsText");

  // Panel tabs
  panelTabs = document.querySelectorAll(".panel-tab");
  panelContents = {
    speed: document.getElementById("speedPanel"),
    crop: document.getElementById("cropPanel"),
    export: document.getElementById("exportPanel"),
  };

  // Time display
  currentTimeDisplay = document.getElementById("currentTime");
  totalTimeDisplay = document.getElementById("totalTime");

  // Playback controls
  playPauseBtn = document.getElementById("playPauseBtn");
  playIcon = document.getElementById("playIcon");
  pauseIcon = document.getElementById("pauseIcon");
  stopBtn = document.getElementById("stopBtn");
  skipBackBtn = document.getElementById("skipBackBtn");
  skipForwardBtn = document.getElementById("skipForwardBtn");

  // Theme toggle
  themeToggle = document.getElementById("themeToggle");
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Video events
  videoPlayer.addEventListener("loadedmetadata", handleVideoLoaded);
  videoPlayer.addEventListener("timeupdate", updateTimelineProgress);
  videoPlayer.addEventListener("ended", handleVideoEnded);
  videoPlayer.addEventListener("play", updatePlayPauseIcon);
  videoPlayer.addEventListener("pause", updatePlayPauseIcon);

  // Playback controls
  playPauseBtn.addEventListener("click", togglePlayPause);
  stopBtn.addEventListener("click", stopVideo);
  skipBackBtn.addEventListener("click", () => skipTime(-5));
  skipForwardBtn.addEventListener("click", () => skipTime(5));

  // Timeline interactions
  timelineTrack.addEventListener("click", handleTimelineClick);
  timelineTrack.addEventListener("mousedown", startTimelineScrub);
  document.addEventListener("mousemove", handleTimelineScrub);
  document.addEventListener("mouseup", stopTimelineScrub);

  // Trim handle dragging
  trimStartHandle.addEventListener("mousedown", startTrimDrag);
  trimEndHandle.addEventListener("mousedown", startTrimDrag);
  document.addEventListener("mousemove", handleTrimDrag);
  document.addEventListener("mouseup", stopTrimDrag);

  // Trim controls
  trimStartBtn.addEventListener("click", setTrimStart);
  trimEndBtn.addEventListener("click", setTrimEnd);
  resetTrimBtn.addEventListener("click", resetTrim);

  // Speed controls
  speedSlider.addEventListener("input", handleSpeedSlider);
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", handleSpeedPreset);
  });

  // Format controls
  formatButtons.forEach((btn) => {
    btn.addEventListener("click", handleFormatChange);
  });

  // Download
  downloadBtn.addEventListener("click", handleDownload);

  // Crop mode
  cropModeBtn.addEventListener("click", toggleCropMode);

  // Crop overlay interactions
  cropOverlay.addEventListener("mousedown", startCropSelection);
  document.addEventListener("mousemove", handleCropDrag);
  document.addEventListener("mouseup", stopCropDrag);

  // Panel tabs
  panelTabs.forEach((tab) => {
    tab.addEventListener("click", handlePanelTabClick);
  });

  // Window resize to update crop overlay size
  window.addEventListener("resize", () => {
    if (videoPlayer && videoPlayer.videoWidth) {
      initializeCropOverlay();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);

  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  // Don't trigger if typing in an input
  if (event.target.tagName === "INPUT") return;

  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePlayPause();
      break;
    case "ArrowLeft":
      skipTime(-5);
      break;
    case "ArrowRight":
      skipTime(5);
      break;
    case "KeyI":
      setTrimStart();
      break;
    case "KeyO":
      setTrimEnd();
      break;
  }
}

/**
 * Toggle play/pause
 */
function togglePlayPause() {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
}

/**
 * Update play/pause icon
 */
function updatePlayPauseIcon() {
  if (videoPlayer.paused) {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
  } else {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
  }
}

/**
 * Stop video
 */
function stopVideo() {
  videoPlayer.pause();
  videoPlayer.currentTime = trimStartTime;
}

/**
 * Skip time
 */
function skipTime(seconds) {
  const newTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + seconds));
  videoPlayer.currentTime = newTime;
}

/**
 * Handle panel tab click
 */
function handlePanelTabClick(event) {
  const tabName = event.target.dataset.panel;

  // Update tab states
  panelTabs.forEach((tab) => tab.classList.remove("active"));
  event.target.classList.add("active");

  // Update panel visibility
  Object.entries(panelContents).forEach(([name, panel]) => {
    if (name === tabName) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });
}

/**
 * Handle speed slider
 */
function handleSpeedSlider(event) {
  const speed = parseFloat(event.target.value);
  playbackSpeed = speed;
  videoPlayer.playbackRate = speed;
  speedValue.textContent = `${speed.toFixed(1)}x`;

  // Update preset buttons
  presetButtons.forEach((btn) => {
    const btnSpeed = parseFloat(btn.dataset.speed);
    btn.classList.toggle("active", btnSpeed === speed);
  });
}

/**
 * Handle speed preset
 */
function handleSpeedPreset(event) {
  const speed = parseFloat(event.target.dataset.speed);
  playbackSpeed = speed;
  videoPlayer.playbackRate = speed;
  speedSlider.value = speed;
  speedValue.textContent = `${speed.toFixed(1)}x`;

  // Update preset buttons
  presetButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
}

/**
 * Load video from IndexedDB storage
 */
async function loadVideoFromStorage() {
  try {
    // Get recording ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const recordingId = urlParams.get("recording");

    if (!recordingId) {
      throw new Error("No recording ID provided");
    }

    showStatus("Loading video...", "info");

    // Load recording from storage
    currentRecording = await window.videoStorage.getRecording(recordingId);
    videoBlob = currentRecording.videoBlob;

    // Create video URL
    const videoUrl = URL.createObjectURL(videoBlob);
    videoPlayer.src = videoUrl;

    console.log("Video loaded successfully:", currentRecording);
  } catch (error) {
    console.error("Error loading video:", error);
    showStatus("Error loading video: " + error.message, "error");
  }
}

/**
 * Ensure we have a finite duration for videos produced by MediaRecorder (WebM duration can be Infinity).
 */
async function getFiniteDuration(video) {
  // If already finite, return it
  if (Number.isFinite(video.duration) && !Number.isNaN(video.duration)) {
    return video.duration;
  }

  // Try seekable range
  if (video.seekable && video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);
    if (Number.isFinite(end) && !Number.isNaN(end)) {
      return end;
    }
  }

  // Force browser to compute duration by seeking far
  await new Promise((resolve) => {
    const onChange = () => {
      if (Number.isFinite(video.duration) && !Number.isNaN(video.duration)) {
        cleanup();
        resolve();
      } else if (video.seekable && video.seekable.length > 0) {
        const end = video.seekable.end(video.seekable.length - 1);
        if (Number.isFinite(end) && !Number.isNaN(end)) {
          cleanup();
          resolve();
        }
      }
    };
    const cleanup = () => {
      video.removeEventListener("durationchange", onChange);
      video.removeEventListener("timeupdate", onChange);
    };
    video.addEventListener("durationchange", onChange);
    video.addEventListener("timeupdate", onChange);
    try {
      video.currentTime = Number.MAX_SAFE_INTEGER;
    } catch (e) {
      // ignore
    }
    // Safety check in case events don't fire
    setTimeout(onChange, 300);
  });

  if (Number.isFinite(video.duration) && !Number.isNaN(video.duration)) {
    return video.duration;
  }
  if (video.seekable && video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);
    if (Number.isFinite(end) && !Number.isNaN(end)) {
      return end;
    }
  }
  return 0;
}

/**
 * Handle video loaded event
 */
async function handleVideoLoaded() {
  // Hide loading indicator
  videoLoading.style.display = "none";

  // Compute a reliable finite duration
  const duration = await getFiniteDuration(videoPlayer);

  // Initialize trim times
  trimStartTime = 0;
  trimEndTime = duration;

  // Initialize crop overlay size to match video
  initializeCropOverlay();

  // Update video info
  updateVideoInfo();

  // Update time displays
  updateTimeDisplays();

  // Generate timeline visualization
  generateTimelineRuler(duration);

  // Show success message
  showStatus("Video loaded successfully!", "success");

  console.log("Video duration:", duration);
}

/**
 * Generate timeline ruler marks
 */
function generateTimelineRuler(duration) {
  const rulerMarks = document.getElementById("rulerMarks");
  if (!rulerMarks) return;

  rulerMarks.innerHTML = "";

  // Create marks at regular intervals
  const markCount = Math.min(10, Math.ceil(duration));
  for (let i = 0; i <= markCount; i++) {
    const time = (duration / markCount) * i;
    const mark = document.createElement("span");
    mark.textContent = formatTimePrecise(time);
    mark.style.fontSize = "10px";
    mark.style.color = "var(--text-muted)";
    rulerMarks.appendChild(mark);
  }
}

/**
 * Update time displays
 */
function updateTimeDisplays() {
  if (!videoPlayer) return;

  const current = videoPlayer.currentTime || 0;
  const total = Number.isFinite(videoPlayer.duration) ? videoPlayer.duration : trimEndTime;

  currentTimeDisplay.textContent = formatTimePrecise(current);
  totalTimeDisplay.textContent = formatTimePrecise(total);
}

/**
 * Format time with centiseconds
 */
function formatTimePrecise(seconds) {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) {
    return "00:00.00";
  }
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  const cs = Math.floor((safeSeconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

/**
 * Update video information display
 */
function updateVideoInfo() {
  if (!currentRecording) return;

  // Choose a finite duration if possible
  let durationSeconds =
    Number.isFinite(videoPlayer.duration) && !Number.isNaN(videoPlayer.duration)
      ? videoPlayer.duration
      : Number.isFinite(trimEndTime)
      ? trimEndTime
      : 0;

  // Duration
  infoDuration.textContent = formatTime(durationSeconds);

  // Size
  const sizeMB = (currentRecording.size / (1024 * 1024)).toFixed(2);
  infoSize.textContent = `${sizeMB} MB`;

  // Trimmed range
  const trimmedStart = formatTime(trimStartTime);
  const endSeconds =
    Number.isFinite(trimEndTime) && !Number.isNaN(trimEndTime)
      ? trimEndTime
      : durationSeconds;
  const trimmedEnd = formatTime(endSeconds);

  if (trimStartTime === 0 && trimEndTime === durationSeconds) {
    infoTrimmed.textContent = "Full";
  } else {
    infoTrimmed.textContent = `${trimmedStart} - ${trimmedEnd}`;
  }
}

/**
 * Initialize crop overlay to match video dimensions
 */
function initializeCropOverlay() {
  const videoContainer = videoPlayer.parentElement;
  const containerRect = videoContainer.getBoundingClientRect();

  cropOverlay.style.position = "absolute";
  cropOverlay.style.top = "0";
  cropOverlay.style.left = "0";
  cropOverlay.style.width = `${containerRect.width}px`;
  cropOverlay.style.height = `${containerRect.height}px`;

  // Reset crop selection
  cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
  updateCropSelectionDisplay();
}

/**
 * Create a default crop selection when crop mode is activated
 */
function createDefaultCropSelection() {
  const overlayRect = cropOverlay.getBoundingClientRect();

  // Create a centered rectangle that's 70% of the dimensions
  const width = overlayRect.width * 0.7;
  const height = overlayRect.height * 0.7;
  const x = (overlayRect.width - width) / 2;
  const y = (overlayRect.height - height) / 2;

  cropSelectionRect = {
    x: x,
    y: y,
    width: width,
    height: height,
  };

  updateCropSelectionDisplay();
  updateCropSettingsFromSelection();
}

/**
 * Handle timeline click
 */
function handleTimelineClick(event) {
  if (!videoPlayer.duration) return;

  const rect = timelineTrack.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / rect.width));
  const time = percentage * videoPlayer.duration;

  videoPlayer.currentTime = time;
}

/**
 * Handle timeline scrubbing (dragging to seek)
 */
let isScrubbing = false;

function startTimelineScrub(event) {
  if (!videoPlayer.duration) return;
  isScrubbing = true;
  handleTimelineScrub(event);
}

function handleTimelineScrub(event) {
  if (!isScrubbing || !videoPlayer.duration) return;

  const rect = timelineTrack.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
  const time = percentage * videoPlayer.duration;

  videoPlayer.currentTime = time;
}

function stopTimelineScrub() {
  isScrubbing = false;
}

/**
 * Update timeline progress
 */
function updateTimelineProgress() {
  if (
    !Number.isFinite(videoPlayer.duration) ||
    Number.isNaN(videoPlayer.duration)
  )
    return;

  const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;

  // Update playhead position
  if (playhead) {
    playhead.style.left = `${percentage}%`;
  }

  // Update trim region
  const startPercentage = (trimStartTime / videoPlayer.duration) * 100;
  const endPercentage = (trimEndTime / videoPlayer.duration) * 100;

  if (trimRegion) {
    trimRegion.style.left = `${startPercentage}%`;
    trimRegion.style.right = `${100 - endPercentage}%`;
  }

  if (trimStartHandle) {
    trimStartHandle.style.left = `${startPercentage}%`;
  }
  if (trimEndHandle) {
    trimEndHandle.style.right = `${100 - endPercentage}%`;
  }

  // Update time displays
  updateTimeDisplays();
}

/**
 * Start trim handle drag
 */
function startTrimDrag(event) {
  isDraggingTrim = true;
  draggedHandle = event.target.closest(".trim-handle").id === "trimStartHandle" ? "start" : "end";
  event.preventDefault();
}

/**
 * Handle trim handle drag
 */
function handleTrimDrag(event) {
  if (!isDraggingTrim || !videoPlayer.duration) return;

  const rect = timelineTrack.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
  const time = percentage * videoPlayer.duration;

  if (draggedHandle === "start") {
    trimStartTime = Math.max(0, Math.min(time, trimEndTime - 0.5));
  } else {
    trimEndTime = Math.min(
      videoPlayer.duration,
      Math.max(time, trimStartTime + 0.5)
    );
  }

  updateVideoInfo();
  updateTimelineProgress();
}

/**
 * Stop trim handle drag
 */
function stopTrimDrag() {
  isDraggingTrim = false;
  draggedHandle = null;
}

/**
 * Set trim start to current time
 */
function setTrimStart() {
  if (!videoPlayer.duration) return;
  trimStartTime = Math.max(
    0,
    Math.min(videoPlayer.currentTime, trimEndTime - 0.5)
  );
  updateVideoInfo();
  updateTimelineProgress();
  showStatus("Trim start set", "success");
}

/**
 * Set trim end to current time
 */
function setTrimEnd() {
  if (!videoPlayer.duration) return;
  trimEndTime = Math.min(
    videoPlayer.duration,
    Math.max(videoPlayer.currentTime, trimStartTime + 0.5)
  );
  updateVideoInfo();
  updateTimelineProgress();
  showStatus("Trim end set", "success");
}

/**
 * Reset trim to full video
 */
function resetTrim() {
  if (!videoPlayer.duration) return;
  trimStartTime = 0;
  trimEndTime = videoPlayer.duration;
  updateVideoInfo();
  updateTimelineProgress();
  showStatus("Trim reset", "success");
}

/**
 * Toggle crop mode
 */
function toggleCropMode() {
  isCropModeActive = !isCropModeActive;

  if (isCropModeActive) {
    cropModeBtn.classList.add("active");
    cropOverlay.classList.add("active");

    // Update button text
    cropModeBtn.querySelector("span").textContent = "Disable Crop";

    // Create default crop selection immediately
    createDefaultCropSelection();

    showStatus("Adjust the crop area using the handles", "info");
  } else {
    cropModeBtn.classList.remove("active");
    cropOverlay.classList.remove("active");

    // Reset button text
    cropModeBtn.querySelector("span").textContent = "Enable Free Crop";

    // Clear crop selection
    cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
    cropSettings = { aspect: "none", x: 0, y: 0, width: 0, height: 0 };
    updateCropSelectionDisplay();

    showStatus("Crop mode disabled", "info");
  }
}

/**
 * Handle format change
 */
function handleFormatChange(event) {
  const btn = event.target.closest(".format-option");
  if (!btn) return;

  const format = btn.dataset.format;

  // Update UI
  formatButtons.forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  // Update export format
  exportFormat = format;

  showStatus(`Export format set to ${format.toUpperCase()}`, "success");
}

/**
 * Start crop selection
 */
function startCropSelection(event) {
  if (!isCropModeActive) return;

  const rect = cropOverlay.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if clicking on a handle for resizing
  const handle = getCropHandleAtPosition(x, y);
  if (handle) {
    cropResizeHandle = handle;
    cropDragStart = { x, y };
    isDraggingCrop = true;
    event.preventDefault();
    return;
  }

  // Check if clicking inside selection for moving
  if (isPointInCropSelection(x, y)) {
    cropResizeHandle = null; // Moving, not resizing
    cropDragStart = { x, y };
    isDraggingCrop = true;
    event.preventDefault();
    return;
  }

  // Start new selection
  cropSelectionRect = { x, y, width: 0, height: 0 };
  cropResizeHandle = null;
  cropDragStart = { x, y };
  isDraggingCrop = true;
  updateCropSelectionDisplay();
  event.preventDefault();
}

/**
 * Handle crop drag
 */
function handleCropDrag(event) {
  if (!isDraggingCrop || !isCropModeActive) return;

  const rect = cropOverlay.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (cropResizeHandle) {
    // Resizing
    resizeCropSelection(x, y);
  } else if (cropSelectionRect.width > 0 || cropSelectionRect.height > 0) {
    // Moving existing selection
    moveCropSelection(x, y);
  } else {
    // Creating new selection
    const width = x - cropSelectionRect.x;
    const height = y - cropSelectionRect.y;
    cropSelectionRect.width = Math.abs(width);
    cropSelectionRect.height = Math.abs(height);
    cropSelectionRect.x = width < 0 ? x : cropSelectionRect.x;
    cropSelectionRect.y = height < 0 ? y : cropSelectionRect.y;
  }

  updateCropSelectionDisplay();
}

/**
 * Stop crop drag
 */
function stopCropDrag() {
  if (!isDraggingCrop) return;

  isDraggingCrop = false;
  cropResizeHandle = null;

  // Update crop settings from visual selection
  if (cropSelectionRect.width > 0 && cropSelectionRect.height > 0) {
    updateCropSettingsFromSelection();
  }
}

/**
 * Check if point is in crop selection
 */
function isPointInCropSelection(x, y) {
  return (
    x >= cropSelectionRect.x &&
    x <= cropSelectionRect.x + cropSelectionRect.width &&
    y >= cropSelectionRect.y &&
    y <= cropSelectionRect.y + cropSelectionRect.height
  );
}

/**
 * Get crop handle at position
 */
function getCropHandleAtPosition(x, y) {
  const handles = ["nw", "ne", "sw", "se", "n", "e", "s", "w"];
  const handleSize = 12;

  for (const handle of handles) {
    const handleRect = getCropHandleRect(handle, handleSize);
    if (
      x >= handleRect.x &&
      x <= handleRect.x + handleSize &&
      y >= handleRect.y &&
      y <= handleRect.y + handleSize
    ) {
      return handle;
    }
  }
  return null;
}

/**
 * Get crop handle rectangle
 */
function getCropHandleRect(handle, size) {
  const rect = cropSelection.getBoundingClientRect();
  const overlayRect = cropOverlay.getBoundingClientRect();

  switch (handle) {
    case "nw":
      return {
        x: rect.left - overlayRect.left - size / 2,
        y: rect.top - overlayRect.top - size / 2,
      };
    case "ne":
      return {
        x: rect.right - overlayRect.left - size / 2,
        y: rect.top - overlayRect.top - size / 2,
      };
    case "sw":
      return {
        x: rect.left - overlayRect.left - size / 2,
        y: rect.bottom - overlayRect.top - size / 2,
      };
    case "se":
      return {
        x: rect.right - overlayRect.left - size / 2,
        y: rect.bottom - overlayRect.top - size / 2,
      };
    case "n":
      return {
        x: rect.left - overlayRect.left + rect.width / 2 - size / 2,
        y: rect.top - overlayRect.top - size / 2,
      };
    case "e":
      return {
        x: rect.right - overlayRect.left - size / 2,
        y: rect.top - overlayRect.top + rect.height / 2 - size / 2,
      };
    case "s":
      return {
        x: rect.left - overlayRect.left + rect.width / 2 - size / 2,
        y: rect.bottom - overlayRect.top - size / 2,
      };
    case "w":
      return {
        x: rect.left - overlayRect.left - size / 2,
        y: rect.top - overlayRect.top + rect.height / 2 - size / 2,
      };
  }
}

/**
 * Resize crop selection
 */
function resizeCropSelection(x, y) {
  const dx = x - cropDragStart.x;
  const dy = y - cropDragStart.y;

  switch (cropResizeHandle) {
    case "nw":
      cropSelectionRect.x += dx;
      cropSelectionRect.y += dy;
      cropSelectionRect.width -= dx;
      cropSelectionRect.height -= dy;
      break;
    case "ne":
      cropSelectionRect.y += dy;
      cropSelectionRect.width += dx;
      cropSelectionRect.height -= dy;
      break;
    case "sw":
      cropSelectionRect.x += dx;
      cropSelectionRect.width -= dx;
      cropSelectionRect.height += dy;
      break;
    case "se":
      cropSelectionRect.width += dx;
      cropSelectionRect.height += dy;
      break;
    case "n":
      cropSelectionRect.y += dy;
      cropSelectionRect.height -= dy;
      break;
    case "e":
      cropSelectionRect.width += dx;
      break;
    case "s":
      cropSelectionRect.height += dy;
      break;
    case "w":
      cropSelectionRect.x += dx;
      cropSelectionRect.width -= dx;
      break;
  }

  // Ensure minimum size
  if (cropSelectionRect.width < 20) cropSelectionRect.width = 20;
  if (cropSelectionRect.height < 20) cropSelectionRect.height = 20;

  // Keep within bounds
  const maxX = cropOverlay.clientWidth - cropSelectionRect.width;
  const maxY = cropOverlay.clientHeight - cropSelectionRect.height;
  cropSelectionRect.x = Math.max(0, Math.min(cropSelectionRect.x, maxX));
  cropSelectionRect.y = Math.max(0, Math.min(cropSelectionRect.y, maxY));

  cropDragStart = { x, y };
}

/**
 * Move crop selection
 */
function moveCropSelection(x, y) {
  const dx = x - cropDragStart.x;
  const dy = y - cropDragStart.y;

  cropSelectionRect.x += dx;
  cropSelectionRect.y += dy;

  // Keep within bounds
  const maxX = cropOverlay.clientWidth - cropSelectionRect.width;
  const maxY = cropOverlay.clientHeight - cropSelectionRect.height;
  cropSelectionRect.x = Math.max(0, Math.min(cropSelectionRect.x, maxX));
  cropSelectionRect.y = Math.max(0, Math.min(cropSelectionRect.y, maxY));

  cropDragStart = { x, y };
}

/**
 * Update crop selection display
 */
function updateCropSelectionDisplay() {
  if (cropSelectionRect.width > 0 && cropSelectionRect.height > 0) {
    cropSelection.style.left = `${cropSelectionRect.x}px`;
    cropSelection.style.top = `${cropSelectionRect.y}px`;
    cropSelection.style.width = `${cropSelectionRect.width}px`;
    cropSelection.style.height = `${cropSelectionRect.height}px`;
    cropSelection.style.display = "block";

    // Update dimensions display
    if (cropDimensionsText && videoPlayer.videoWidth) {
      const scaleX = videoPlayer.videoWidth / cropOverlay.clientWidth;
      const scaleY = videoPlayer.videoHeight / cropOverlay.clientHeight;
      const w = Math.round(cropSelectionRect.width * scaleX);
      const h = Math.round(cropSelectionRect.height * scaleY);
      cropDimensionsText.textContent = `${w} x ${h}`;
    }

    // Update input fields
    const cropX = document.getElementById("cropX");
    const cropY = document.getElementById("cropY");
    const cropWidth = document.getElementById("cropWidth");
    const cropHeight = document.getElementById("cropHeight");

    if (cropX && videoPlayer.videoWidth) {
      const scaleX = videoPlayer.videoWidth / cropOverlay.clientWidth;
      const scaleY = videoPlayer.videoHeight / cropOverlay.clientHeight;
      cropX.value = Math.round(cropSelectionRect.x * scaleX);
      cropY.value = Math.round(cropSelectionRect.y * scaleY);
      cropWidth.value = Math.round(cropSelectionRect.width * scaleX);
      cropHeight.value = Math.round(cropSelectionRect.height * scaleY);
    }
  } else {
    cropSelection.style.display = "none";
  }
}

/**
 * Update crop settings from visual selection
 */
function updateCropSettingsFromSelection() {
  // Convert pixel coordinates to video coordinates
  const videoRect = videoPlayer.getBoundingClientRect();

  // Calculate scale factors
  const scaleX = videoPlayer.videoWidth / videoRect.width;
  const scaleY = videoPlayer.videoHeight / videoRect.height;

  // Convert overlay coordinates to video coordinates
  cropSettings.x = Math.round(cropSelectionRect.x * scaleX);
  cropSettings.y = Math.round(cropSelectionRect.y * scaleY);
  cropSettings.width = Math.round(cropSelectionRect.width * scaleX);
  cropSettings.height = Math.round(cropSelectionRect.height * scaleY);
  cropSettings.aspect = "custom";
}

/**
 * Decide encoding settings for the selected export format.
 * Ensures extension matches the actual container produced by MediaRecorder.
 * @param {string} format - Desired export format (`webm` or `mp4`).
 * @returns {{mimeType:string, extension:string, needsDurationFix:boolean, warned:boolean}}
 */
function selectExportSettings(format) {
  const mediaRecorderSupported = (type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch (error) {
      console.warn("MediaRecorder support check failed for", type, error);
      return false;
    }
  };

  if (format === "mp4") {
    const mp4Candidates = [
      "video/mp4;codecs=avc1.640028,mp4a.40.2",
      "video/mp4;codecs=avc1.4d401f,mp4a.40.2",
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
    ];

    const supportedMp4 = mp4Candidates.find(mediaRecorderSupported);
    if (supportedMp4) {
      return {
        mimeType: supportedMp4,
        extension: "mp4",
        needsDurationFix: false,
        warningMessage: "",
      };
    }

    console.warn(
      "MP4 encoding not supported on this platform, falling back to WebM"
    );
  }

  const webmCandidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  const supportedWebm = webmCandidates.find(mediaRecorderSupported);
  if (supportedWebm) {
    return {
      mimeType: supportedWebm,
      extension: "webm",
      needsDurationFix: supportedWebm.startsWith("video/webm"),
      warningMessage:
        format === "mp4"
          ? "MP4 export not supported by this browser. Falling back to WebM."
          : "",
    };
  }

  throw new Error("No supported MediaRecorder formats available");
}

/**
 * Handle download button click
 */
async function handleDownload() {
  try {
    showStatus("Processing video...", "info", true);

    const trimmedDuration = trimEndTime - trimStartTime;

    if (trimmedDuration <= 0) {
      showStatus("Invalid trim range", "error");
      return;
    }

    // Disable ALL buttons during processing
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"></circle></svg><span>Processing...</span>';

    // Disable trim buttons
    trimStartBtn.disabled = true;
    trimEndBtn.disabled = true;
    resetTrimBtn.disabled = true;

    // Disable speed slider and presets
    speedSlider.disabled = true;
    presetButtons.forEach((btn) => (btn.disabled = true));

    // Disable crop button
    cropModeBtn.disabled = true;

    // Disable format buttons
    formatButtons.forEach((btn) => (btn.disabled = true));

    // Create a new video element for processing
    const processingVideo = document.createElement("video");
    processingVideo.src = videoPlayer.src;
    processingVideo.muted = true; // Prevent audio playback during processing
    processingVideo.playsInline = true;

    // Wait for video to load
    await new Promise((resolve, reject) => {
      processingVideo.onloadedmetadata = resolve;
      processingVideo.onerror = reject;
    });

    // Create canvas for rendering
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions based on crop settings
    let canvasWidth = processingVideo.videoWidth;
    let canvasHeight = processingVideo.videoHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = canvasWidth;
    let sourceHeight = canvasHeight;

    // Apply crop settings
    if (
      cropSettings.aspect === "custom" &&
      cropSettings.width > 0 &&
      cropSettings.height > 0
    ) {
      // Use custom crop coordinates
      sourceX = cropSettings.x;
      sourceY = cropSettings.y;
      sourceWidth = cropSettings.width;
      sourceHeight = cropSettings.height;
      canvasWidth = cropSettings.width;
      canvasHeight = cropSettings.height;
    } else if (cropSettings.aspect !== "none") {
      const aspectRatios = {
        "16:9": 16 / 9,
        "4:3": 4 / 3,
        "1:1": 1,
      };

      const targetAspect = aspectRatios[cropSettings.aspect];
      const videoAspect = canvasWidth / canvasHeight;

      if (videoAspect > targetAspect) {
        // Video is wider, crop width
        sourceWidth = canvasHeight * targetAspect;
        sourceX = (canvasWidth - sourceWidth) / 2;
        canvasWidth = sourceWidth;
      } else {
        // Video is taller, crop height
        sourceHeight = canvasWidth / targetAspect;
        sourceY = (canvasHeight - sourceHeight) / 2;
        canvasHeight = sourceHeight;
      }
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Create MediaRecorder with appropriate settings
    const exportSettings = selectExportSettings(exportFormat);
    const {
      mimeType,
      extension: downloadExtension,
      needsDurationFix,
      warningMessage,
    } =
      exportSettings;

    if (warningMessage) {
      showStatus(warningMessage, "warning");
      showStatus("Processing video...", "info", true);
    }

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
    });

    const chunks = [];
    let processingProgress = 0;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const processedBlob = new Blob(chunks, {
        type: mimeType,
      });

      let downloadBlob = processedBlob;

      if (needsDurationFix) {
        const playbackDuration = Math.max(0.1, rawDuration / playbackSpeed);
        try {
          downloadBlob = await fixWebmDuration(processedBlob, playbackDuration);
        } catch (durationError) {
          console.warn("Unable to patch WebM duration", durationError);
        }
      }

      // Set progress bar to 100% - download will happen after this
      if (statusProgress && statusProgressBar) {
        statusProgressBar.style.width = `100%`;
      }

      // Download the file
      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `loomless-edited-${Date.now()}.${downloadExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Now hide progress bar and re-enable buttons
      setTimeout(() => {
        if (statusProgress) {
          statusProgress.classList.add("hidden");
        }

        // Re-enable ALL buttons
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Export</span>';

        // Re-enable trim buttons
        trimStartBtn.disabled = false;
        trimEndBtn.disabled = false;
        resetTrimBtn.disabled = false;

        // Re-enable speed controls
        speedSlider.disabled = false;
        presetButtons.forEach((btn) => (btn.disabled = false));

        // Re-enable crop button
        cropModeBtn.disabled = false;

        // Re-enable format buttons
        formatButtons.forEach((btn) => (btn.disabled = false));
      }, 1000);

      showStatus("Video exported successfully!", "success");

      // Clean up storage
      setTimeout(async () => {
        try {
          await window.videoStorage.deleteRecording(currentRecording.id);
          console.log("Original recording cleaned up");
        } catch (error) {
          console.error("Error cleaning up:", error);
        }
      }, 1000);
    };

    // Start recording
    mediaRecorder.start(1000); // Collect data every second

    // Prepare playback-based rendering
    const frameRate = 30;
    const clipEnd = Number.isFinite(trimEndTime)
      ? trimEndTime
      : processingVideo.duration;
    const rawDuration = Math.max(0, clipEnd - trimStartTime);
    const EPS = 1 / frameRate;

    let processedFrames = 0;

    const updateProgressFromTime = () => {
      const elapsed = Math.max(
        0,
        Math.min(rawDuration, processingVideo.currentTime - trimStartTime)
      );
      processingProgress = Math.min(
        100,
        Math.round((elapsed / rawDuration) * 100)
      );
      if (statusProgress && statusProgressBar) {
        statusProgress.classList.remove("hidden");
        statusProgressBar.style.width = `${processingProgress}%`;
      }
    };

    const drawCurrentFrame = () => {
      ctx.drawImage(
        processingVideo,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      processedFrames += 1;
      updateProgressFromTime();
    };

    const stopProcessing = () => {
      try {
        processingVideo.pause();
      } catch (e) {}
      if (statusProgress && statusProgressBar) {
        statusProgressBar.style.width = `100%`;
      }
      mediaRecorder.stop();
    };

    // Seek to start, set speed, and play
    await new Promise((resolve) => {
      processingVideo.onseeked = () => resolve();
      processingVideo.currentTime = trimStartTime;
    });
    processingVideo.playbackRate = Math.max(0.1, playbackSpeed);

    // Use requestVideoFrameCallback when available for precise frame timing
    if (typeof processingVideo.requestVideoFrameCallback === "function") {
      const onFrame = () => {
        if (processingVideo.currentTime >= clipEnd - EPS) {
          stopProcessing();
          return;
        }
        drawCurrentFrame();
        processingVideo.requestVideoFrameCallback(onFrame);
      };
      processingVideo.requestVideoFrameCallback(onFrame);
      processingVideo.play().catch(() => {});
    } else {
      // Fallback: draw at fixed interval while video plays
      const interval = setInterval(() => {
        if (processingVideo.currentTime >= clipEnd - EPS) {
          clearInterval(interval);
          stopProcessing();
          return;
        }
        drawCurrentFrame();
        updateProgressFromTime();
      }, 1000 / frameRate);
      processingVideo.play().catch(() => {});
    }
  } catch (error) {
    console.error("Error processing video:", error);

    // Re-enable ALL buttons on error
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Export</span>';

    // Re-enable trim buttons
    trimStartBtn.disabled = false;
    trimEndBtn.disabled = false;
    resetTrimBtn.disabled = false;

    // Re-enable speed controls
    speedSlider.disabled = false;
    presetButtons.forEach((btn) => (btn.disabled = false));

    // Re-enable crop button
    cropModeBtn.disabled = false;

    // Re-enable format buttons
    formatButtons.forEach((btn) => (btn.disabled = false));

    // Hide progress bar
    if (statusProgress) {
      statusProgress.classList.add("hidden");
    }

    showStatus("Error processing video: " + error.message, "error");
  }
}

/**
 * Handle video ended
 */
function handleVideoEnded() {
  // Loop within trim range if trimmed
  if (trimEndTime > trimStartTime && videoPlayer.currentTime >= trimEndTime) {
    videoPlayer.currentTime = trimStartTime;
  }
}

/**
 * Show status message
 */
function showStatus(message, type = "info", withProgress = false) {
  statusText.textContent = message;
  statusMessage.className = `status-toast ${type}`;
  statusMessage.classList.remove("hidden");

  if (withProgress && statusProgress) {
    statusProgress.classList.remove("hidden");
  }

  // Only auto-hide if no progress bar is shown
  if (!withProgress) {
    setTimeout(() => {
      statusMessage.classList.add("hidden");
    }, 3000);
  }
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) {
    return "--:--";
  }
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Patch WebM duration metadata so external players display correct runtime.
 * @param {Blob} blob - Original WebM blob
 * @param {number} durationSeconds - Expected playback duration in seconds
 * @returns {Promise<Blob>} Blob with updated duration metadata
 */
async function fixWebmDuration(blob, durationSeconds) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return blob;
  }

  const buffer = await blob.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const durationElementId = [0x44, 0x89];

  for (let i = 0; i < bytes.length - durationElementId.length; i++) {
    if (bytes[i] !== durationElementId[0] || bytes[i + 1] !== durationElementId[1]) {
      continue;
    }

    const sizeInfo = readVint(bytes, i + 2);
    if (!sizeInfo) {
      continue;
    }

    const { length: sizeLength, value: dataLength } = sizeInfo;
    const dataStart = i + 2 + sizeLength;

    if (dataStart + dataLength > bytes.length) {
      continue;
    }

    if (dataLength !== 4 && dataLength !== 8) {
      continue;
    }

    if (dataLength === 4) {
      view.setFloat32(dataStart, durationSeconds, false);
    } else {
      view.setFloat64(dataStart, durationSeconds, false);
    }
    return new Blob([buffer], { type: blob.type });
  }

  throw new Error("Duration element not found in WebM");
}

/**
 * Read a variable-length integer (VINT) from EBML data.
 * @param {Uint8Array} bytes - EBML byte array
 * @param {number} index - Byte index to read from
 * @returns {{length:number,value:number}|null}
 */
function readVint(bytes, index) {
  if (index >= bytes.length) {
    return null;
  }

  const firstByte = bytes[index];
  let mask = 0x80;
  let length = 1;

  while (length <= 8 && (firstByte & mask) === 0) {
    mask >>= 1;
    length += 1;
  }

  if (length > 8) {
    return null;
  }

  let value = firstByte & (mask - 1);
  for (let i = 1; i < length; i++) {
    value = (value << 8) | bytes[index + i];
  }

  return { length, value };
}
