/**
 * LoomLess Studio - Professional Video Editor
 * Handles video editing functionality including trim, crop, speed, and format conversion
 */

// videoStorage is available globally from storage.js
const THEME_STORAGE_KEY = "loomless-theme";
const FLOATING_CONTROLS_STORAGE_KEY = "loomless-floating-controls";

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
  exportModal,
  exportModalProgressBar,
  exportModalText,
  presetButtons,
  formatButtons,
  infoDuration,
  infoSize,
  infoTrimmed,
  cropOverlay,
  cropSelection,
  cropModeBtn,
  cropDimensionsText,
  currentTimeDisplay,
  totalTimeDisplay,
  playPauseBtn,
  playIcon,
  pauseIcon,
  stopBtn,
  skipBackBtn,
  skipForwardBtn,
  settingsBtn,
  settingsModal,
  settingsCloseBtn,
  floatingControlsToggle,
  themeOptionButtons;

// Video state
let currentRecording = null;
let videoBlob = null;
let trimStartTime = 0;
let trimEndTime = 0;
let trimEdited = false;
let playbackSpeed = 1.0;
let cropSettings = { aspect: "none", x: 0, y: 0, width: 0, height: 0 };
let exportFormat = "mp4";
let isDraggingTrim = false;
let draggedHandle = null;

// Crop state
let isCropModeActive = false;
let isDraggingCrop = false;
let cropDragStart = { x: 0, y: 0 };
let cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
let cropResizeHandle = null;
const TRIM_PLAYBACK_EPSILON = 0.05;
const MIN_CROP_SELECTION_SIZE = 20;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  initializeElements();
  initializeExportFormat();
  setupEventListeners();
  setupRightClickDisable();
  initializeTheme();
  initializeSettings();
  await loadVideoFromStorage();
});

function isDesktopApp() {
  return typeof window !== "undefined" && !!window.__TAURI__;
}

function initializeExportFormat() {
  if (!isDesktopApp()) return;

  exportFormat = "mp4";

  formatButtons.forEach((btn) => {
    const isMp4 = btn.dataset.format === "mp4";
    btn.classList.toggle("active", isMp4);
    btn.removeAttribute("aria-disabled");
    btn.removeAttribute("title");
  });
}

function setupRightClickDisable() {
  let toastTimer = null;
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    let toast = document.getElementById("rightClickToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rightClickToast";
      toast.className = "right-click-toast";
      toast.textContent = "Right click disabled on this page";
      document.body.appendChild(toast);
    }
    toast.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
  });
}

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
  applyThemePreference(getStoredThemePreference());

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if (getStoredThemePreference() === "system") {
      applyThemePreference("system");
    }
  };

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", syncSystemTheme);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(syncSystemTheme);
  }
}

function initializeSettings() {
  const storedFloatingControls = localStorage.getItem(FLOATING_CONTROLS_STORAGE_KEY);
  if (floatingControlsToggle) {
    floatingControlsToggle.checked = storedFloatingControls !== "false";
  }
  updateThemeOptionButtons(getStoredThemePreference());
}

function getStoredThemePreference() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
    ? savedTheme
    : "system";
}

function applyThemePreference(preference) {
  const resolvedTheme = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;

  document.documentElement.setAttribute("data-theme", resolvedTheme);
  updateThemeOptionButtons(preference);
}

function setThemePreference(preference) {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
}

function updateThemeOptionButtons(preference) {
  themeOptionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.themePreference === preference);
  });
}

function handleFloatingControlsToggle() {
  if (!floatingControlsToggle) {
    return;
  }

  localStorage.setItem(FLOATING_CONTROLS_STORAGE_KEY, String(floatingControlsToggle.checked));
}

function openSettingsModal() {
  settingsModal?.classList.remove("hidden");
  settingsModal?.setAttribute("aria-hidden", "false");
}

function closeSettingsModal() {
  settingsModal?.classList.add("hidden");
  settingsModal?.setAttribute("aria-hidden", "true");
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
  exportModal = document.getElementById("exportModal");
  exportModalProgressBar = document.getElementById("exportModalProgressBar");
  exportModalText = document.getElementById("exportModalText");

  // Speed controls
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
  settingsBtn = document.getElementById("settingsBtn");
  settingsModal = document.getElementById("settingsModal");
  settingsCloseBtn = document.getElementById("settingsCloseBtn");
  floatingControlsToggle = document.getElementById("floatingControlsToggle");
  themeOptionButtons = document.querySelectorAll(".theme-option-btn");
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

  // Window resize to update crop overlay size
  window.addEventListener("resize", () => {
    if (videoPlayer && videoPlayer.videoWidth) {
      initializeCropOverlay();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);

  settingsBtn?.addEventListener("click", openSettingsModal);
  settingsCloseBtn?.addEventListener("click", closeSettingsModal);
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });
  floatingControlsToggle?.addEventListener("change", handleFloatingControlsToggle);
  themeOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setThemePreference(button.dataset.themePreference || "system");
    });
  });

  // Discard button
  const discardBtn = document.getElementById("discardBtn");
  if (discardBtn) {
    discardBtn.addEventListener("click", handleDiscard);
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  if (event.code === "Escape" && settingsModal && !settingsModal.classList.contains("hidden")) {
    closeSettingsModal();
    return;
  }

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
    if (
      trimEndTime > trimStartTime &&
      (videoPlayer.currentTime < trimStartTime ||
        videoPlayer.currentTime >= trimEndTime - TRIM_PLAYBACK_EPSILON)
    ) {
      videoPlayer.currentTime = trimStartTime;
    }
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
  const duration = getEditorDuration();
  const minTime = trimEndTime > trimStartTime ? trimStartTime : 0;
  const maxTime = trimEndTime > trimStartTime ? trimEndTime : duration;
  const newTime = Math.max(minTime, Math.min(maxTime, videoPlayer.currentTime + seconds));
  videoPlayer.currentTime = newTime;
}

function getEditorDuration() {
  if (Number.isFinite(videoPlayer.duration) && !Number.isNaN(videoPlayer.duration)) {
    return videoPlayer.duration;
  }

  if (Number.isFinite(trimEndTime) && trimEndTime > 0) {
    return trimEndTime;
  }

  return 0;
}

/**
 * Handle speed preset
 */
function handleSpeedPreset(event) {
  const speed = parseFloat(event.target.dataset.speed);
  playbackSpeed = speed;
  videoPlayer.playbackRate = speed;

  // Update preset buttons
  presetButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  updateTimeDisplays();
  updateVideoInfo();
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

  // Some browsers temporarily seek to a far timestamp during duration probing.
  // Normalize playback state so first user click reliably starts playback.
  videoPlayer.pause();
  videoPlayer.currentTime = 0;

  // Compute a reliable finite duration
  const duration = await getFiniteDuration(videoPlayer);

  // Initialize trim times
  trimStartTime = 0;
  trimEndTime = duration;
  trimEdited = false;
  videoPlayer.currentTime = trimStartTime;
  updatePlayPauseIcon();

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

  const current = getDisplayedOutputTimeSeconds();
  const total = getOutputDurationSeconds();

  currentTimeDisplay.textContent = formatTimePrecise(current);
  totalTimeDisplay.textContent = formatTimePrecise(total);
}

function getClipEndTime() {
  const sourceDuration = getEditorDuration();
  if (Number.isFinite(trimEndTime) && trimEndTime > trimStartTime) {
    return trimEndTime;
  }
  return sourceDuration;
}

function getOutputDurationSeconds() {
  const clipEnd = getClipEndTime();
  const trimmedDuration = Math.max(0, clipEnd - trimStartTime);
  return trimmedDuration / Math.max(0.1, playbackSpeed);
}

function getDisplayedOutputTimeSeconds() {
  const clipEnd = getClipEndTime();
  const currentTime = Number.isFinite(videoPlayer.currentTime) ? videoPlayer.currentTime : 0;
  const clampedCurrent = clampNumber(currentTime, trimStartTime, clipEnd);
  return Math.max(0, clampedCurrent - trimStartTime) / Math.max(0.1, playbackSpeed);
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

  const sourceDuration = getEditorDuration();
  const durationSeconds = getOutputDurationSeconds();

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
      : sourceDuration;
  const trimmedEnd = formatTime(endSeconds);

  if (trimStartTime === 0 && Math.abs(endSeconds - sourceDuration) < 0.01) {
    infoTrimmed.textContent = "Full";
  } else {
    infoTrimmed.textContent = `${trimmedStart} - ${trimmedEnd}`;
  }
}

/**
 * Initialize crop overlay to match video dimensions
 */
function initializeCropOverlay() {
  const videoRect = videoPlayer.getBoundingClientRect();

  cropOverlay.style.position = "absolute";
  cropOverlay.style.top = "0";
  cropOverlay.style.left = "0";
  cropOverlay.style.width = `${videoRect.width}px`;
  cropOverlay.style.height = `${videoRect.height}px`;

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
  const duration = getEditorDuration();
  if (!Number.isFinite(duration) || Number.isNaN(duration) || duration <= 0) return;

  if (
    trimEndTime > trimStartTime &&
    !videoPlayer.paused &&
    videoPlayer.currentTime >= trimEndTime - TRIM_PLAYBACK_EPSILON
  ) {
    videoPlayer.pause();
    videoPlayer.currentTime = trimEndTime;
  }

  const percentage = (videoPlayer.currentTime / duration) * 100;

  // Update playhead position
  if (playhead) {
    playhead.style.left = `${percentage}%`;
  }

  // Update trim region
  const startPercentage = (trimStartTime / duration) * 100;
  const endPercentage = (trimEndTime / duration) * 100;

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
  const duration = getEditorDuration();
  if (!isDraggingTrim || !duration) return;

  const rect = timelineTrack.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
  const time = percentage * duration;

  if (draggedHandle === "start") {
    trimStartTime = Math.max(0, Math.min(time, trimEndTime - 0.5));
  } else {
    trimEndTime = Math.min(
      duration,
      Math.max(time, trimStartTime + 0.5)
    );
  }
  trimEdited = true;

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
  const duration = getEditorDuration();
  if (!duration) return;
  trimStartTime = Math.max(
    0,
    Math.min(videoPlayer.currentTime, trimEndTime - 0.5)
  );
  trimEdited = true;
  updateVideoInfo();
  updateTimelineProgress();
  showStatus("Trim start set", "success");
}

/**
 * Set trim end to current time
 */
function setTrimEnd() {
  const duration = getEditorDuration();
  if (!duration) return;
  trimEndTime = Math.min(
    duration,
    Math.max(videoPlayer.currentTime, trimStartTime + 0.5)
  );
  trimEdited = true;
  updateVideoInfo();
  updateTimelineProgress();
  showStatus("Trim end set", "success");
}

/**
 * Reset trim to full video
 */
function resetTrim() {
  const duration = getEditorDuration();
  if (!duration) return;
  trimStartTime = 0;
  trimEndTime = duration;
  trimEdited = false;
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

  const activeButton = Array.from(formatButtons).find(
    (button) => button.dataset.format === format
  );
  (activeButton || btn).classList.add("active");

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
  const x = clampNumber(event.clientX - rect.left, 0, cropOverlay.clientWidth);
  const y = clampNumber(event.clientY - rect.top, 0, cropOverlay.clientHeight);

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
  const x = clampNumber(event.clientX - rect.left, 0, cropOverlay.clientWidth);
  const y = clampNumber(event.clientY - rect.top, 0, cropOverlay.clientHeight);

  if (cropResizeHandle) {
    // Resizing
    resizeCropSelection(x, y);
  } else if (cropSelectionRect.width > 0 || cropSelectionRect.height > 0) {
    // Moving existing selection
    moveCropSelection(x, y);
  } else {
    // Creating new selection
    const left = Math.min(cropDragStart.x, x);
    const top = Math.min(cropDragStart.y, y);
    const right = Math.max(cropDragStart.x, x);
    const bottom = Math.max(cropDragStart.y, y);
    cropSelectionRect.x = left;
    cropSelectionRect.y = top;
    cropSelectionRect.width = right - left;
    cropSelectionRect.height = bottom - top;
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

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * Resize crop selection
 */
function resizeCropSelection(x, y) {
  const overlayWidth = cropOverlay.clientWidth;
  const overlayHeight = cropOverlay.clientHeight;
  const clampedX = clampNumber(x, 0, overlayWidth);
  const clampedY = clampNumber(y, 0, overlayHeight);
  let left = cropSelectionRect.x;
  let top = cropSelectionRect.y;
  let right = cropSelectionRect.x + cropSelectionRect.width;
  let bottom = cropSelectionRect.y + cropSelectionRect.height;

  switch (cropResizeHandle) {
    case "nw":
      left = Math.min(clampedX, right - MIN_CROP_SELECTION_SIZE);
      top = Math.min(clampedY, bottom - MIN_CROP_SELECTION_SIZE);
      break;
    case "ne":
      right = Math.max(clampedX, left + MIN_CROP_SELECTION_SIZE);
      top = Math.min(clampedY, bottom - MIN_CROP_SELECTION_SIZE);
      break;
    case "sw":
      left = Math.min(clampedX, right - MIN_CROP_SELECTION_SIZE);
      bottom = Math.max(clampedY, top + MIN_CROP_SELECTION_SIZE);
      break;
    case "se":
      right = Math.max(clampedX, left + MIN_CROP_SELECTION_SIZE);
      bottom = Math.max(clampedY, top + MIN_CROP_SELECTION_SIZE);
      break;
    case "n":
      top = Math.min(clampedY, bottom - MIN_CROP_SELECTION_SIZE);
      break;
    case "e":
      right = Math.max(clampedX, left + MIN_CROP_SELECTION_SIZE);
      break;
    case "s":
      bottom = Math.max(clampedY, top + MIN_CROP_SELECTION_SIZE);
      break;
    case "w":
      left = Math.min(clampedX, right - MIN_CROP_SELECTION_SIZE);
      break;
  }

  left = clampNumber(left, 0, Math.max(0, overlayWidth - MIN_CROP_SELECTION_SIZE));
  top = clampNumber(top, 0, Math.max(0, overlayHeight - MIN_CROP_SELECTION_SIZE));
  right = clampNumber(right, left + MIN_CROP_SELECTION_SIZE, overlayWidth);
  bottom = clampNumber(bottom, top + MIN_CROP_SELECTION_SIZE, overlayHeight);

  cropSelectionRect.x = left;
  cropSelectionRect.y = top;
  cropSelectionRect.width = right - left;
  cropSelectionRect.height = bottom - top;

  cropDragStart = { x: clampedX, y: clampedY };
}

/**
 * Move crop selection
 */
function moveCropSelection(x, y) {
  const overlayWidth = cropOverlay.clientWidth;
  const overlayHeight = cropOverlay.clientHeight;
  const clampedX = clampNumber(x, 0, overlayWidth);
  const clampedY = clampNumber(y, 0, overlayHeight);
  const dx = clampedX - cropDragStart.x;
  const dy = clampedY - cropDragStart.y;

  cropSelectionRect.x += dx;
  cropSelectionRect.y += dy;

  // Keep within bounds
  const maxX = cropOverlay.clientWidth - cropSelectionRect.width;
  const maxY = cropOverlay.clientHeight - cropSelectionRect.height;
  cropSelectionRect.x = Math.max(0, Math.min(cropSelectionRect.x, maxX));
  cropSelectionRect.y = Math.max(0, Math.min(cropSelectionRect.y, maxY));

  cropDragStart = { x: clampedX, y: clampedY };
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
  cropSettings.x = clampNumber(Math.round(cropSelectionRect.x * scaleX), 0, videoPlayer.videoWidth);
  cropSettings.y = clampNumber(Math.round(cropSelectionRect.y * scaleY), 0, videoPlayer.videoHeight);
  cropSettings.width = clampNumber(
    Math.round(cropSelectionRect.width * scaleX),
    1,
    Math.max(1, videoPlayer.videoWidth - cropSettings.x)
  );
  cropSettings.height = clampNumber(
    Math.round(cropSelectionRect.height * scaleY),
    1,
    Math.max(1, videoPlayer.videoHeight - cropSettings.y)
  );
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
      "video/mp4",
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4;codecs=avc1.4d401f,mp4a.40.2",
      "video/mp4;codecs=avc1.640028,mp4a.40.2",
    ];

    const supportedMp4 = mp4Candidates.find(mediaRecorderSupported);
    if (supportedMp4) {
      return {
        mimeType: supportedMp4,
        extension: "mp4",
        needsDurationFix: false,
        warningMessage:
          "MP4 export is experimental on the desktop app right now.",
      };
    }

    throw new Error("MP4 export is not supported on this system.");
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
      warningMessage: "",
    };
  }

  throw new Error("No supported MediaRecorder formats available");
}

function getRecommendedVideoBitrate(width, height) {
  const safeWidth = Math.max(1, Math.round(width || 1920));
  const safeHeight = Math.max(1, Math.round(height || 1080));
  const pixels = safeWidth * safeHeight;

  if (pixels >= 3840 * 2160) return 28000000;
  if (pixels >= 2560 * 1440) return 18000000;
  if (pixels >= 1920 * 1080) return 12000000;
  if (pixels >= 1280 * 720) return 8000000;
  return 5000000;
}

function currentRecordingIsMp4() {
  const mimeType = currentRecording?.mimeType || videoBlob?.type || "";
  const filename = currentRecording?.filename || "";
  return mimeType.includes("mp4") || filename.toLowerCase().endsWith(".mp4");
}

function getCurrentRecordingExtension() {
  const filename = currentRecording?.filename || "";
  const mimeType = currentRecording?.mimeType || videoBlob?.type || "";

  if (filename.toLowerCase().endsWith(".mp4") || mimeType.includes("mp4")) {
    return "mp4";
  }

  return "webm";
}

function hasActiveCropSelection() {
  return (
    (cropSettings.aspect === "custom" &&
      cropSettings.width > 0 &&
      cropSettings.height > 0) ||
    (cropSettings.aspect !== "none" && cropSettings.aspect !== "custom")
  );
}

function canExportOriginalRecording(sourceDuration) {
  if (!videoBlob) return false;
  if (Math.abs(playbackSpeed - 1) > 0.001) return false;
  if (hasActiveCropSelection()) return false;
  if (trimEdited) return false;

  const duration = Number.isFinite(sourceDuration)
    ? sourceDuration
    : getEditorDuration();
  const fullTrimSelected =
    Math.abs(trimStartTime) < 0.01 &&
    Math.abs(trimEndTime - duration) < 0.05;

  return fullTrimSelected;
}

function cleanupCurrentRecordingLater() {
  setTimeout(async () => {
    try {
      await window.videoStorage.deleteRecording(currentRecording.id);
      console.log("Original recording cleaned up");
    } catch (error) {
      console.error("Error cleaning up:", error);
    }
  }, 1000);
}

async function tryNativeDesktopTrimExport(hasCrop, clipEnd) {
  // Native desktop trim export is temporarily disabled until the macOS
  // avconvert path is stable again. Fall back to the proven in-browser export.
  if (true || !window.__TAURI__ || hasCrop || Math.abs(playbackSpeed - 1) > 0.001) {
    return false;
  }

  if (!currentRecordingIsMp4()) {
    hideExportModal();
    restoreExportControls();
    showStatus(
      "This recording was captured as WebM. Make a new desktop recording after this update so native MP4 trim export can work.",
      "error"
    );
    return true;
  }

  const { save } = window.__TAURI__.dialog;
  const { writeFile } = window.__TAURI__.fs;
  const { BaseDirectory } = window.__TAURI__.path;
  const invoke = window.__TAURI__.core.invoke;

  const fileName = `loomless-edited-${Date.now()}.mp4`;
  const outputPath = await save({
    defaultPath: fileName,
    filters: [
      {
        name: "MP4",
        extensions: ["mp4"],
      },
    ],
  });

  if (!outputPath) {
    hideExportModal();
    restoreExportControls();
    return true;
  }

  if (exportModalText) {
    exportModalText.textContent = "Preparing native export...";
  }
  if (exportModalProgressBar) {
    exportModalProgressBar.style.width = "25%";
  }

  const tempSourceName = `loomless-native-source-${Date.now()}.mp4`;
  const sourceBytes = new Uint8Array(await videoBlob.arrayBuffer());
  await writeFile(tempSourceName, sourceBytes, {
    baseDir: BaseDirectory.Temp,
  });

  if (exportModalText) {
    exportModalText.textContent = "Trimming with native exporter...";
  }
  if (exportModalProgressBar) {
    exportModalProgressBar.style.width = "70%";
  }

  // Add timeout for native export (30 seconds max)
  const exportPromise = invoke("native_trim_export_video", {
    tempSourceName,
    outputPath,
    trimStart: trimStartTime,
    trimEnd: clipEnd,
  });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Export timed out after 30 seconds")), 30000);
  });
  
  try {
    await Promise.race([exportPromise, timeoutPromise]);
  } catch (error) {
    console.error("Native export failed:", error);
    // Clean up temp file
    try {
      const { remove } = window.__TAURI__.fs;
      const { BaseDirectory } = window.__TAURI__.path;
      await remove(tempSourceName, { baseDir: BaseDirectory.Temp });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    // Return false to fall back to canvas-based export
    return false;
  }

  if (exportModalProgressBar) {
    exportModalProgressBar.style.width = "100%";
  }
  if (exportModalText) {
    exportModalText.textContent = "Export complete";
  }

  hideExportModal();
  showStatus("Video exported successfully!", "success");
  showExportSuccessAndReturn();
  cleanupCurrentRecordingLater();
  return true;
}

function showExportModal() {
  if (exportModal) {
    exportModal.classList.remove("hidden");
  }
  if (exportModalProgressBar) {
    exportModalProgressBar.style.width = "0%";
  }
}

function hideExportModal() {
  if (exportModal) {
    exportModal.classList.add("hidden");
  }
}

function getProcessingStageStyle() {
  // WKWebView may stop rendering media that is fully off-screen, so keep the
  // export elements technically visible while making them effectively invisible.
  return [
    "position:fixed",
    "right:8px",
    "bottom:8px",
    "width:2px",
    "height:2px",
    "opacity:0.01",
    "pointer-events:none",
    "z-index:-1",
    "overflow:hidden",
  ].join(";");
}

function getMediaElementCaptureStream(element) {
  if (typeof element.captureStream === "function") {
    return element.captureStream();
  }

  if (typeof element.mozCaptureStream === "function") {
    return element.mozCaptureStream();
  }

  return null;
}

async function waitForCapturedElementAudio(video, waitMs = 0) {
  const capturedElementStream = getMediaElementCaptureStream(video);

  if (!capturedElementStream) {
    return { capturedElementStream: null, capturedAudioTracks: [] };
  }

  const getLiveTracks = () =>
    (capturedElementStream.getAudioTracks?.() || []).filter(
      (track) => track.readyState === "live"
    );

  let capturedAudioTracks = getLiveTracks();

  if (capturedAudioTracks.length > 0 || waitMs <= 0) {
    return { capturedElementStream, capturedAudioTracks };
  }

  const deadline = performance.now() + waitMs;
  while (performance.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 16));
    capturedAudioTracks = getLiveTracks();
    if (capturedAudioTracks.length > 0) {
      break;
    }
  }

  return { capturedElementStream, capturedAudioTracks };
}

async function attachElementAudioTrackToStream(video, stream, options = {}) {
  const { captureWaitMs = 0 } = options;
  const { capturedElementStream, capturedAudioTracks } =
    await waitForCapturedElementAudio(video, captureWaitMs);

  if (capturedAudioTracks.length > 0) {
    const addedTracks = [];

    for (const sourceTrack of capturedAudioTracks) {
      try {
        const trackToAdd =
          typeof sourceTrack.clone === "function"
            ? sourceTrack.clone()
            : sourceTrack;
        stream.addTrack(trackToAdd);
        addedTracks.push(trackToAdd);
      } catch (error) {
        console.warn("[EXPORT] Could not attach captured element audio track:", error);
      }
    }

    if (addedTracks.length > 0) {
      return async () => {
        addedTracks.forEach((track) => {
          try {
            stream.removeTrack(track);
          } catch (error) {}
          try {
            track.stop();
          } catch (error) {}
        });

        capturedElementStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {}
        });
      };
    }
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  try {
    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    const sinkGain = audioContext.createGain();

    sinkGain.gain.value = 0;

    source.connect(destination);
    source.connect(sinkGain);
    sinkGain.connect(audioContext.destination);

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const [audioTrack] = destination.stream.getAudioTracks();
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }

    return async () => {
      try {
        source.disconnect();
      } catch (error) {}
      try {
        sinkGain.disconnect();
      } catch (error) {}

      destination.stream.getTracks().forEach((track) => track.stop());

      try {
        await audioContext.close();
      } catch (error) {}
    };
  } catch (error) {
    console.warn("[EXPORT] Could not attach audio track to export stream:", error);
    return null;
  }
}

function handleDiscard() {
  try {
    if (window.videoStorage && currentRecordingId) {
      window.videoStorage.deleteRecording(currentRecordingId);
    }
  } catch (e) {
    console.warn("Could not delete recording:", e);
  }

  window.location.href = "recorder.html";
}

/**
 * Handle download button click
 */
async function handleDownload() {
  try {
    showExportModal();
    showStatus("Processing video...", "info", true);

    const trimmedDuration = trimEndTime - trimStartTime;

    if (trimmedDuration <= 0) {
      hideExportModal();
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

    // Disable speed presets
    presetButtons.forEach((btn) => (btn.disabled = true));

    // Disable crop button
    cropModeBtn.disabled = true;

    // Disable format buttons
    formatButtons.forEach((btn) => (btn.disabled = true));

    const sourceDuration = getEditorDuration();

    if (canExportOriginalRecording(sourceDuration)) {
      const originalExtension = getCurrentRecordingExtension();
      await finalizeExportDownload(videoBlob, originalExtension);
      hideExportModal();
      showStatus("Video exported successfully!", "success");
      return;
    }

    // Determine if crop is active
    const hasCrop = hasActiveCropSelection();

    // Create MediaRecorder with appropriate settings
    const exportSettings = selectExportSettings(exportFormat);
    const {
      mimeType,
      extension: downloadExtension,
      needsDurationFix,
      warningMessage,
    } = exportSettings;

    if (warningMessage) {
      showStatus(warningMessage, "warning");
      showStatus("Processing video...", "info", true);
    }

    // Create a new video element for processing (must be in DOM for WKWebView to render frames)
    const processingVideo = document.createElement("video");
    processingVideo.src = videoPlayer.src;
    processingVideo.muted = false;
    processingVideo.defaultMuted = false;
    processingVideo.volume = 1;
    processingVideo.playsInline = true;
    processingVideo.preload = "auto";
    processingVideo.style.cssText = getProcessingStageStyle();
    document.body.appendChild(processingVideo);

    // Wait for video to load
    await new Promise((resolve, reject) => {
      processingVideo.onloadedmetadata = resolve;
      processingVideo.onerror = reject;
    });

    const clipEnd = Number.isFinite(trimEndTime)
      ? trimEndTime
      : processingVideo.duration;
    const rawDuration = Math.max(0, clipEnd - trimStartTime);

    if (await tryNativeDesktopTrimExport(hasCrop, clipEnd)) {
      try {
        processingVideo.remove();
      } catch (error) {}
      return;
    }

    console.log("[EXPORT] Video dimensions:", processingVideo.videoWidth, "x", processingVideo.videoHeight);
    console.log("[EXPORT] Clip range:", trimStartTime, "to", clipEnd, "duration:", rawDuration);
    console.log("[EXPORT] hasCrop:", hasCrop, "playbackSpeed:", playbackSpeed);

    let canvasWidth = processingVideo.videoWidth;
    let canvasHeight = processingVideo.videoHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = canvasWidth;
    let sourceHeight = canvasHeight;

    if (hasCrop) {
      if (cropSettings.aspect === "custom" && cropSettings.width > 0 && cropSettings.height > 0) {
        sourceX = cropSettings.x;
        sourceY = cropSettings.y;
        sourceWidth = cropSettings.width;
        sourceHeight = cropSettings.height;
        canvasWidth = cropSettings.width;
        canvasHeight = cropSettings.height;
      } else if (cropSettings.aspect !== "none") {
        const aspectRatios = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1 };
        const targetAspect = aspectRatios[cropSettings.aspect];
        const videoAspect = canvasWidth / canvasHeight;
        if (videoAspect > targetAspect) {
          sourceWidth = canvasHeight * targetAspect;
          sourceX = (canvasWidth - sourceWidth) / 2;
          canvasWidth = sourceWidth;
        } else {
          sourceHeight = canvasWidth / targetAspect;
          sourceY = (canvasHeight - sourceHeight) / 2;
          canvasHeight = sourceHeight;
        }
      }
    }

    let stream = null;
    let cleanupAudioPassthrough = null;
    let stopDrawingLoop = () => {};
    const exportFrameRate = 30;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not initialize export canvas");
    }

    canvas.style.cssText = getProcessingStageStyle();
    document.body.appendChild(canvas);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    console.log("[EXPORT] Canvas size:", canvasWidth, "x", canvasHeight);
    stream = canvas.captureStream(exportFrameRate);

    if (!stream) {
      throw new Error("Could not create export capture stream");
    }

    console.log(
      "[EXPORT] Stream tracks:",
      stream.getTracks().map((t) => t.kind + ":" + t.readyState)
    );

    const targetVideoBitrate = getRecommendedVideoBitrate(canvasWidth, canvasHeight);
    console.log("[EXPORT] Using mimeType:", mimeType);
    console.log("[EXPORT] MediaRecorder.isTypeSupported:", MediaRecorder.isTypeSupported(mimeType));
    console.log("[EXPORT] Target video bitrate:", targetVideoBitrate);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: targetVideoBitrate,
      audioBitsPerSecond: 160000,
    });
    console.log("[EXPORT] MediaRecorder state:", mediaRecorder.state);

    const chunks = [];
    let processingProgress = 0;
    const playbackDurationMs =
      Math.max(0.1, rawDuration / Math.max(0.1, playbackSpeed)) * 1000;
    let stopRequested = false;
    let fallbackStopTimeout = null;

    mediaRecorder.ondataavailable = (event) => {
      console.log("[EXPORT] Data chunk received, size:", event.data.size);
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error("[EXPORT] MediaRecorder error:", event.error);
    };

    mediaRecorder.onstop = async () => {
      try {
        console.log("[EXPORT] MediaRecorder stopped. Total chunks:", chunks.length, "Total size:", chunks.reduce((s, c) => s + c.size, 0));
        const processedBlob = new Blob(chunks, { type: mimeType });
        console.log("[EXPORT] Final blob size:", processedBlob.size);

        if (fallbackStopTimeout) {
          clearTimeout(fallbackStopTimeout);
          fallbackStopTimeout = null;
        }

        let downloadBlob = processedBlob;

        if (needsDurationFix) {
          const playbackDuration = Math.max(0.1, rawDuration / playbackSpeed);
          downloadBlob = await fixWebmDuration(processedBlob, playbackDuration);
        }

        if (downloadBlob.size <= 0) {
          console.error("[EXPORT] Final encoded blob empty:", downloadBlob.size);
          hideExportModal();
          restoreExportControls();
          showStatus(
            `Desktop ${downloadExtension.toUpperCase()} export failed to encode correctly.`,
            "error"
          );
          return;
        }

        if (statusProgress && statusProgressBar) {
          statusProgressBar.style.width = `100%`;
        }
        if (exportModalProgressBar) {
          exportModalProgressBar.style.width = `100%`;
        }
        if (exportModalText) {
          exportModalText.textContent = "Download starting...";
        }

        await finalizeExportDownload(downloadBlob, downloadExtension);
        hideExportModal();
        showStatus("Video exported successfully!", "success");
      } finally {
        try { processingVideo.remove(); } catch (error) {}
        try { canvas.remove(); } catch (error) {}
        stopDrawingLoop();
        await cleanupAudioPassthrough?.();
      }
    };

    const frameRate = exportFrameRate;
    const EPS = 1 / frameRate;

    const updateProgressFromTime = () => {
      const elapsed = Math.max(0, Math.min(rawDuration, processingVideo.currentTime - trimStartTime));
      processingProgress = Math.min(100, Math.round((elapsed / rawDuration) * 100));
      if (statusProgress && statusProgressBar) {
        statusProgress.classList.remove("hidden");
        statusProgressBar.style.width = `${processingProgress}%`;
      }
      if (exportModalProgressBar) {
        exportModalProgressBar.style.width = `${processingProgress}%`;
      }
    };

    const stopProcessing = () => {
      if (stopRequested) {
        return;
      }
      stopRequested = true;

      try {
        processingVideo.pause();
      } catch (e) {}
      try {
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
      } catch (e) {}
      if (statusProgress && statusProgressBar) {
        statusProgressBar.style.width = `100%`;
      }
      if (exportModalProgressBar) {
        exportModalProgressBar.style.width = `100%`;
      }
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 150);
    };

    // Seek to start, set speed, and play
    await new Promise((resolve) => {
      processingVideo.onseeked = () => resolve();
      processingVideo.currentTime = trimStartTime;
    });
    processingVideo.playbackRate = Math.max(0.1, playbackSpeed);
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

    // Always draw video frames to canvas (required for WKWebView compatibility)
    let frameCount = 0;
    let rvfcId = null;
    let intervalId = null;

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
      frameCount++;
      if (frameCount % 30 === 1) {
        console.log(
          "[EXPORT] Frame",
          frameCount,
          "time:",
          processingVideo.currentTime.toFixed(2),
          "paused:",
          processingVideo.paused
        );
      }
      updateProgressFromTime();
    };

    const maybeStopAtTrimEnd = () => {
      if (processingVideo.currentTime >= clipEnd - EPS) {
        stopProcessing();
      }
    };

    processingVideo.addEventListener("timeupdate", updateProgressFromTime);
    processingVideo.addEventListener("timeupdate", maybeStopAtTrimEnd);
    processingVideo.addEventListener("ended", stopProcessing);

    if (typeof processingVideo.requestVideoFrameCallback === "function") {
      const onFrame = () => {
        if (stopRequested) {
          return;
        }
        if (processingVideo.currentTime >= clipEnd - EPS) {
          stopProcessing();
          return;
        }
        drawCurrentFrame();
        rvfcId = processingVideo.requestVideoFrameCallback(onFrame);
      };
      rvfcId = processingVideo.requestVideoFrameCallback(onFrame);
      stopDrawingLoop = () => {
        if (
          rvfcId !== null &&
          typeof processingVideo.cancelVideoFrameCallback === "function"
        ) {
          try {
            processingVideo.cancelVideoFrameCallback(rvfcId);
          } catch (error) {}
          rvfcId = null;
        }
      };
    } else {
      intervalId = setInterval(() => {
        if (stopRequested) {
          clearInterval(intervalId);
          intervalId = null;
          return;
        }
        if (processingVideo.currentTime >= clipEnd - EPS) {
          clearInterval(intervalId);
          intervalId = null;
          stopProcessing();
          return;
        }
        drawCurrentFrame();
      }, 1000 / frameRate);
      stopDrawingLoop = () => {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    }

    cleanupAudioPassthrough = await attachElementAudioTrackToStream(
      processingVideo,
      stream,
      {
        captureWaitMs: 0,
      }
    );
    console.log(
      "[EXPORT] Audio tracks before start:",
      stream.getAudioTracks().map((track) => `${track.kind}:${track.readyState}`)
    );
    mediaRecorder.start(1000);

    // Play the video to start processing
    console.log(
      "[EXPORT] About to play. currentTime:",
      processingVideo.currentTime,
      "readyState:",
      processingVideo.readyState
    );
    await processingVideo.play();
    console.log("[EXPORT] Playing! paused:", processingVideo.paused);
    fallbackStopTimeout = setTimeout(() => {
      console.log("[EXPORT] Fallback stop timer fired after", playbackDurationMs, "ms");
      stopProcessing();
    }, playbackDurationMs + 300);
  } catch (error) {
    console.error("Error processing video:", error);
    // Clean up processing video if it was added to DOM
    const staleVideo = document.querySelector("video[style*='right:8px']");
    if (staleVideo) staleVideo.remove();
    const staleCanvas = document.querySelector("canvas[style*='right:8px']");
    if (staleCanvas) staleCanvas.remove();
    hideExportModal();
    restoreExportControls();

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
  if (trimEndTime > trimStartTime) {
    videoPlayer.currentTime = trimEndTime;
    videoPlayer.pause();
  }
}

async function finalizeExportDownload(downloadBlob, downloadExtension) {
  const fileName = `loomless-edited-${Date.now()}.${downloadExtension}`;

  // Use Tauri native save dialog for desktop app
  if (window.__TAURI__) {
    try {
      const { save } = window.__TAURI__.dialog;
      const { writeFile } = window.__TAURI__.fs;

      const filePath = await save({
        defaultPath: fileName,
        filters: [{
          name: downloadExtension.toUpperCase(),
          extensions: [downloadExtension]
        }]
      });

      if (filePath) {
        const arrayBuffer = await downloadBlob.arrayBuffer();
        await writeFile(filePath, new Uint8Array(arrayBuffer));

        // Show success modal and return to recorder
        showExportSuccessAndReturn();
      } else {
        restoreExportControls();
      }
    } catch (error) {
      console.error("Tauri save error:", error);
      showStatus("Error saving file: " + error.message, "error");
      restoreExportControls();
    }
  } else {
    // Browser fallback (for extension)
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    restoreExportControls();
  }

  cleanupCurrentRecordingLater();
}

function showExportSuccessAndReturn() {
  // Hide export modal if visible
  hideExportModal();

  // Create success overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  overlay.innerHTML = `
    <div style="
      background: var(--bg-secondary, #111114);
      border: 1px solid var(--border-default, rgba(255,255,255,0.1));
      border-radius: 20px;
      padding: 48px;
      text-align: center;
      max-width: 400px;
    ">
      <div style="
        width: 64px;
        height: 64px;
        background: rgba(16, 185, 129, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      ">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2 style="color: var(--text-primary, #f4f4f5); font-size: 22px; margin-bottom: 8px;">Video Exported!</h2>
      <p style="color: var(--text-muted, #71717a); font-size: 14px;">Returning to recorder...</p>
    </div>
  `;

  // Add fadeIn animation
  const style = document.createElement("style");
  style.textContent = "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }";
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  // Return to recorder after 2.5 seconds
  setTimeout(() => {
    window.location.href = "recorder.html";
  }, 2500);
}

function restoreExportControls() {
  downloadBtn.disabled = false;
  downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Export</span>';
  trimStartBtn.disabled = false;
  trimEndBtn.disabled = false;
  resetTrimBtn.disabled = false;
  presetButtons.forEach((btn) => (btn.disabled = false));
  cropModeBtn.disabled = false;
  formatButtons.forEach((btn) => (btn.disabled = false));
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

  return blob;
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
