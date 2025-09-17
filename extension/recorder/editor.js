/**
 * LoomLess Video Editor
 * Handles video editing functionality including trim, crop, speed, and format conversion
 */

// videoStorage is available globally from storage.js

// DOM elements
let videoPlayer,
  videoLoading,
  timelineTrack,
  timelineProgress,
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
  speedButtons,
  cropButtons,
  formatButtons,
  videoInfo,
  infoDuration,
  infoSize,
  infoTrimmed,
  cropOverlay,
  cropSelection,
  cropModeBtn;

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

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  initializeElements();
  setupEventListeners();
  await loadVideoFromStorage();
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
  videoPlayer = document.getElementById("videoPlayer");
  videoLoading = document.getElementById("videoLoading");
  timelineTrack = document.getElementById("timelineTrack");
  timelineProgress = document.getElementById("timelineProgress");
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
  speedButtons = document.querySelectorAll(".speed-btn");

  // Crop controls
  cropButtons = document.querySelectorAll(".crop-btn");

  // Format controls
  formatButtons = document.querySelectorAll(".format-btn");

  // Video info
  infoDuration = document.getElementById("infoDuration");
  infoSize = document.getElementById("infoSize");
  infoTrimmed = document.getElementById("infoTrimmed");

  // Crop elements
  cropOverlay = document.getElementById("cropOverlay");
  cropSelection = document.getElementById("cropSelection");
  cropModeBtn = document.getElementById("cropModeBtn");
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Video events
  videoPlayer.addEventListener("loadedmetadata", handleVideoLoaded);
  videoPlayer.addEventListener("timeupdate", updateTimelineProgress);
  videoPlayer.addEventListener("ended", handleVideoEnded);

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
  speedButtons.forEach((btn) => {
    btn.addEventListener("click", handleSpeedChange);
  });

  // Crop controls
  cropButtons.forEach((btn) => {
    btn.addEventListener("click", handleCropChange);
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

  // Show success message
  showStatus("Video loaded successfully!", "success");

  console.log("Video duration:", duration);
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
  infoTrimmed.textContent = `${trimmedStart} to ${trimmedEnd}`;
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

  // Create a centered square that's 70% of the smaller dimension
  const size = Math.min(overlayRect.width, overlayRect.height) * 0.7;
  const x = (overlayRect.width - size) / 2;
  const y = (overlayRect.height - size) / 2;

  cropSelectionRect = {
    x: x,
    y: y,
    width: size,
    height: size,
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
  timelineProgress.style.width = `${percentage}%`;

  // Update trim handle positions
  const startPercentage = (trimStartTime / videoPlayer.duration) * 100;
  const endPercentage = (trimEndTime / videoPlayer.duration) * 100;

  trimStartHandle.style.left = `${startPercentage}%`;
  trimEndHandle.style.right = `${100 - endPercentage}%`;
}

/**
 * Start trim handle drag
 */
function startTrimDrag(event) {
  isDraggingTrim = true;
  draggedHandle = event.target.id === "trimStartHandle" ? "start" : "end";
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
    trimStartTime = Math.max(0, Math.min(time, trimEndTime - 1));
  } else {
    trimEndTime = Math.min(
      videoPlayer.duration,
      Math.max(time, trimStartTime + 1)
    );
  }

  updateVideoInfo();
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
    Math.min(videoPlayer.currentTime, trimEndTime - 1)
  );
  updateVideoInfo();
  showStatus("Trim start set", "success");
}

/**
 * Set trim end to current time
 */
function setTrimEnd() {
  if (!videoPlayer.duration) return;
  trimEndTime = Math.min(
    videoPlayer.duration,
    Math.max(videoPlayer.currentTime, trimStartTime + 1)
  );
  updateVideoInfo();
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
  showStatus("Trim reset", "success");
}

/**
 * Handle playback speed change
 */
function handleSpeedChange(event) {
  const speed = parseFloat(event.target.dataset.speed);

  // Update UI
  speedButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Update video speed
  playbackSpeed = speed;
  videoPlayer.playbackRate = speed;

  showStatus(`Playback speed set to ${speed}x`, "success");
}

/**
 * Toggle crop mode
 */
function toggleCropMode() {
  isCropModeActive = !isCropModeActive;

  const cropControls = document.querySelector(".crop-controls");

  if (isCropModeActive) {
    cropModeBtn.classList.add("active");
    cropOverlay.classList.add("active");
    cropControls.classList.add("crop-mode-active");

    // Update button text to indicate it's active
    cropModeBtn.innerHTML =
      '<span class="btn-icon">✂️</span><span class="btn-text">Crop Active - Adjust Area</span>';

    // Show instructions overlay
    const instructions = cropOverlay.querySelector(
      ".crop-instructions-overlay"
    );
    if (instructions) instructions.style.display = "block";

    // Create default crop selection immediately
    createDefaultCropSelection();

    showStatus(
      "Adjust the crop area using the handles or drag to move",
      "info"
    );
  } else {
    cropModeBtn.classList.remove("active");
    cropOverlay.classList.remove("active");
    cropControls.classList.remove("crop-mode-active");

    // Reset button text
    cropModeBtn.innerHTML =
      '<span class="btn-icon">✂️</span><span class="btn-text">Free Crop</span>';

    // Hide instructions overlay
    const instructions = cropOverlay.querySelector(
      ".crop-instructions-overlay"
    );
    if (instructions) instructions.style.display = "none";

    // Clear crop selection
    cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
    updateCropSelectionDisplay();

    showStatus("Crop mode deactivated", "info");
  }
}

/**
 * Handle crop change
 */
function handleCropChange(event) {
  const aspect = event.target.dataset.aspect;

  // Update UI
  cropButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Update crop settings
  cropSettings.aspect = aspect;

  // Reset free crop selection if using presets
  if (aspect !== "none") {
    cropSelectionRect = { x: 0, y: 0, width: 0, height: 0 };
    updateCropSelectionDisplay();
  }

  showStatus(`Crop set to ${aspect}`, "success");
}

/**
 * Handle format change
 */
function handleFormatChange(event) {
  const format = event.target.dataset.format;

  // Update UI
  formatButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

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
  const overlayRect = cropOverlay.getBoundingClientRect();

  // Calculate scale factors
  const scaleX = videoPlayer.videoWidth / videoRect.width;
  const scaleY = videoPlayer.videoHeight / videoRect.height;

  // Convert overlay coordinates to video coordinates
  cropSettings.x = Math.round(cropSelectionRect.x * scaleX);
  cropSettings.y = Math.round(cropSelectionRect.y * scaleY);
  cropSettings.width = Math.round(cropSelectionRect.width * scaleX);
  cropSettings.height = Math.round(cropSelectionRect.height * scaleY);
  cropSettings.aspect = "custom";

  // Update UI to show custom crop is selected
  // Note: No preset crop buttons to update since we use free-form cropping

  showStatus("Custom crop area selected", "success");
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
    downloadBtn.innerHTML =
      '<span class="btn-icon">⏳</span><span class="btn-text">Processing...</span>';

    // Disable trim buttons
    trimStartBtn.disabled = true;
    trimEndBtn.disabled = true;
    resetTrimBtn.disabled = true;

    // Disable speed buttons
    speedButtons.forEach((btn) => (btn.disabled = true));

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
        downloadBtn.innerHTML =
          '<span class="btn-icon">⬇️</span><span class="btn-text">Download</span>';

        // Re-enable trim buttons
        trimStartBtn.disabled = false;
        trimEndBtn.disabled = false;
        resetTrimBtn.disabled = false;

        // Re-enable speed buttons
        speedButtons.forEach((btn) => (btn.disabled = false));

        // Re-enable crop button
        cropModeBtn.disabled = false;

        // Re-enable format buttons
        formatButtons.forEach((btn) => (btn.disabled = false));
      }, 1000);

      showStatus("Video downloaded successfully!", "success");

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
    downloadBtn.innerHTML =
      '<span class="btn-icon">⬇️</span><span class="btn-text">Download</span>';

    // Re-enable trim buttons
    trimStartBtn.disabled = false;
    trimEndBtn.disabled = false;
    resetTrimBtn.disabled = false;

    // Re-enable speed buttons
    speedButtons.forEach((btn) => (btn.disabled = false));

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
  statusMessage.className = `status-message ${type}`;
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
