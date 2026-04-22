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
let recordingState = "idle";
let recordingDuration = 0;
let pausedAt = null;
let pausedDuration = 0;
let recorderMimeType = "video/webm";
const THEME_STORAGE_KEY = "loomless-theme";
const FLOATING_CONTROLS_STORAGE_KEY = "loomless-floating-controls";
const SYSTEM_AUDIO_STORAGE_KEY = "loomless-record-system-audio";
const UPDATE_MANIFEST_URL = "https://github.com/moayaan1911/loomless/releases/latest/download/latest.json";
const UPDATE_CHECK_TIMEOUT_MS = 30000;

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
let recorderTabId = null;
let cameraOverlayVisible = false;
let overlayPosition = { x: 1, y: 1 };
const updateState = {
  currentVersion: "0.0.1",
  latestVersion: null,
  availableUpdate: null,
  isChecking: false,
  isInstalling: false,
  hasChecked: false,
  statusType: "muted",
  statusText: "Loading",
  statusCopy: "Automatic update checks run when the app launches.",
};

// DOM elements
let recordBtn,
  recordIcon,
  recordingLabel,
  timer,
  statusIndicator,
  statusText,
  studioContainer,
  initialInstructions,
  recordingInstructions,
  waveform,
  settingsBtn,
  settingsModal,
  settingsCloseBtn,
  settingsUpdateDot,
  floatingControlsToggle,
  systemAudioToggle,
  systemAudioCopy,
  themeOptionButtons,
  cameraPreviewContainer,
  cameraPreview,
  shortcutsHint,
  checkUpdatesBtn,
  installUpdateBtn,
  updateStatusBadge,
  updateStatusCopy,
  currentVersionValue,
  latestVersionRow,
  latestVersionValue;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeElements();
  setupEventListeners();
  initializeTheme();
  initializeSettings();
  initializeUpdater();
  configureCaptureHandle();
  setupTauriListeners();
  setupCustomContextMenu();
});

function setupCustomContextMenu() {
  const menuItems = [
    {
      label: "Built by Mohammad Ayaan Siddiqui",
      url: "https://moayaan.com",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    },
    {
      label: "Check Out PizBot",
      url: "https://pizbot.com",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
    },
    {
      label: "Check Out ImanVibes",
      url: "https://imanvibes.vercel.app",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6.72-4.35-9.33-8.19C.78 10.03 1.2 6.1 4.24 4.1c2.04-1.34 4.86-.94 6.76 1.03 1.9-1.97 4.72-2.37 6.76-1.03 3.04 2 3.46 5.93 1.57 8.71C18.72 16.65 12 21 12 21z"/></svg>`,
    },
    {
      label: "Check Out LoomLess",
      url: "https://loomless.fun",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    },
  ];

  const menu = document.createElement("div");
  menu.className = "custom-context-menu hidden";
  menu.innerHTML = menuItems
    .map(
      (item, i) => `
      <button class="custom-context-item" data-url="${item.url}" type="button">
        <span class="custom-context-icon">${item.icon}</span>
        <span class="custom-context-label">${item.label}</span>
      </button>
    `
    )
    .join("");
  document.body.appendChild(menu);

  const hideMenu = () => menu.classList.add("hidden");

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    menu.classList.remove("hidden");
    // Offset within viewport
    const maxX = window.innerWidth - menu.offsetWidth - 8;
    const maxY = window.innerHeight - menu.offsetHeight - 8;
    menu.style.left = Math.min(x, maxX) + "px";
    menu.style.top = Math.min(y, maxY) + "px";
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) hideMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideMenu();
  });
  window.addEventListener("blur", hideMenu);
  window.addEventListener("resize", hideMenu);

  menu.querySelectorAll(".custom-context-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.dataset.url;
      hideMenu();
      if (window.__TAURI__ && url) {
        try {
          const opener = window.__TAURI__.opener || window.__TAURI__.plugin?.opener;
          if (opener?.openUrl) {
            await opener.openUrl(url);
            return;
          }
          const invoke = window.__TAURI__?.core?.invoke;
          if (typeof invoke === "function") {
            await invoke("plugin:opener|open_url", { path: url });
          }
        } catch (err) {
          console.error("Failed to open url:", err);
          window.open(url, "_blank");
        }
      } else if (url) {
        window.open(url, "_blank");
      }
    });
  });
}

function initializeElements() {
  recordBtn = document.getElementById("startRecordBtn");
  recordIcon = document.getElementById("recordIcon");
  recordingLabel = document.getElementById("recordingLabel");
  timer = document.getElementById("timer");
  statusIndicator = document.getElementById("statusIndicator");
  statusText = document.getElementById("recordingStatus");
  studioContainer = document.querySelector(".studio-container");
  initialInstructions = document.getElementById("initialInstructions");
  recordingInstructions = document.getElementById("recordingInstructions");
  waveform = document.getElementById("waveform");
  settingsBtn = document.getElementById("settingsBtn");
  settingsModal = document.getElementById("settingsModal");
  settingsCloseBtn = document.getElementById("settingsCloseBtn");
  settingsUpdateDot = document.getElementById("settingsUpdateDot");
  floatingControlsToggle = document.getElementById("floatingControlsToggle");
  systemAudioToggle = document.getElementById("systemAudioToggle");
  systemAudioCopy = document.getElementById("systemAudioCopy");
  themeOptionButtons = document.querySelectorAll(".theme-option-btn");
  cameraPreviewContainer = document.getElementById("cameraPreviewContainer");
  cameraPreview = document.getElementById("cameraPreview");
  shortcutsHint = document.getElementById("shortcutsHint");
  checkUpdatesBtn = document.getElementById("checkUpdatesBtn");
  installUpdateBtn = document.getElementById("installUpdateBtn");
  updateStatusBadge = document.getElementById("updateStatusBadge");
  updateStatusCopy = document.getElementById("updateStatusCopy");
  currentVersionValue = document.getElementById("currentVersionValue");
  latestVersionRow = document.getElementById("latestVersionRow");
  latestVersionValue = document.getElementById("latestVersionValue");
}

function setupEventListeners() {
  recordBtn.addEventListener("click", toggleRecording);
  settingsBtn?.addEventListener("click", openSettingsModal);
  settingsCloseBtn?.addEventListener("click", closeSettingsModal);
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });
  floatingControlsToggle?.addEventListener("change", handleFloatingControlsToggle);
  systemAudioToggle?.addEventListener("change", handleSystemAudioToggle);
  checkUpdatesBtn?.addEventListener("click", () => {
    void checkForUpdates({ silent: false });
  });
  installUpdateBtn?.addEventListener("click", () => {
    void installAvailableUpdate();
  });
  themeOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setThemePreference(button.dataset.themePreference || "system");
    });
  });

  // Mode selector cards
  const modeCards = document.querySelectorAll(".mode-card");
  modeCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (recordingState === "idle") {
        setRecordingMode(card.dataset.mode);
      }
    });
  });

  setupCameraDragging();

  window.addEventListener("resize", () => {
    if (cameraPreviewContainer && !cameraPreviewContainer.classList.contains("hidden")) {
      applyCameraPreviewPosition();
    }
  });
  window.addEventListener("beforeunload", handleAppUnload);
  window.addEventListener("unload", handleAppUnload);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && settingsModal && !settingsModal.classList.contains("hidden")) {
      closeSettingsModal();
      return;
    }

    if (e.code === "Space" && document.activeElement === document.body) {
      e.preventDefault();
      if (recordingState === "idle") {
        startRecording();
      }
    }
  });

  // Desktop app: no extension messaging needed

  // Handle external links in desktop app
  setupExternalLinkHandler();
}

function setupExternalLinkHandler() {
  // Only run in Tauri desktop app
  if (!window.__TAURI__) return;

  // Intercept clicks on external links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="http"], a[href^="https"]');
    if (link && link.target === '_blank') {
      e.preventDefault();
      e.stopPropagation();
      
      const url = link.href;
      
      // Use Tauri opener plugin
      const open = window.__TAURI__?.opener?.openUrl;
      if (typeof open === 'function') {
        open(url).catch(err => console.error('Failed to open URL:', err));
      } else {
        // Fallback: try using the shell plugin
        const invoke = window.__TAURI__?.core?.invoke;
        if (typeof invoke === 'function') {
          invoke('plugin:opener|open_url', { url }).catch(err => {
            console.error('Failed to open URL:', err);
            // Last resort: open in default browser via shell
            window.open(url, '_blank');
          });
        } else {
          window.open(url, '_blank');
        }
      }
    }
  });
}

function handleAppUnload() {
  if (!window.__TAURI__) return;

  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (typeof invoke === "function") {
      invoke("quit_camera_overlay");
    }
  } catch (error) {
    // App is already closing.
  }
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
  if (storedFloatingControls === null) {
    localStorage.setItem(FLOATING_CONTROLS_STORAGE_KEY, "true");
  }
  if (floatingControlsToggle) {
    floatingControlsToggle.checked = (storedFloatingControls ?? "true") !== "false";
  }
  if (systemAudioToggle) {
    systemAudioToggle.checked = localStorage.getItem(SYSTEM_AUDIO_STORAGE_KEY) === "true";
  }
  applySystemAudioAvailabilityState();
  updateThemeOptionButtons(getStoredThemePreference());
}

async function initializeUpdater() {
  updateState.currentVersion = await resolveCurrentAppVersion();
  renderUpdateState();
  await checkForUpdates({ silent: true });
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
  updateCameraOverlayControlsPreference();
}

function handleSystemAudioToggle() {
  if (!systemAudioToggle) {
    return;
  }

  if (!isSystemAudioSupportedInCurrentRuntime()) {
    systemAudioToggle.checked = false;
    localStorage.setItem(SYSTEM_AUDIO_STORAGE_KEY, "false");
    return;
  }

  localStorage.setItem(SYSTEM_AUDIO_STORAGE_KEY, String(systemAudioToggle.checked));
}

function shouldRecordSystemAudio() {
  return isSystemAudioSupportedInCurrentRuntime() && localStorage.getItem(SYSTEM_AUDIO_STORAGE_KEY) === "true";
}

function shouldShowFloatingControls() {
  return localStorage.getItem(FLOATING_CONTROLS_STORAGE_KEY) !== "false";
}

function openSettingsModal() {
  settingsModal?.classList.remove("hidden");
  settingsModal?.setAttribute("aria-hidden", "false");
}

function closeSettingsModal() {
  settingsModal?.classList.add("hidden");
  settingsModal?.setAttribute("aria-hidden", "true");
}

async function resolveCurrentAppVersion() {
  const getVersion = window.__TAURI__?.app?.getVersion;

  if (typeof getVersion === "function") {
    try {
      return await getVersion();
    } catch (error) {
      console.warn("Failed to read app version from Tauri:", error);
    }
  }

  return updateState.currentVersion;
}

function normalizeVersion(version) {
  return String(version || "")
    .trim()
    .replace(/^v/i, "");
}

function setUpdateState(statusType, statusText, statusCopy, latestVersion = null) {
  updateState.statusType = statusType;
  updateState.statusText = statusText;
  updateState.statusCopy = statusCopy;
  updateState.latestVersion = latestVersion ? normalizeVersion(latestVersion) : null;
  renderUpdateState();
}

function renderUpdateState() {
  const currentVersion = `v${normalizeVersion(updateState.currentVersion)}`;
  if (currentVersionValue) {
    currentVersionValue.textContent = currentVersion;
  }

  if (updateStatusBadge) {
    updateStatusBadge.textContent = updateState.statusText;
    updateStatusBadge.className = `settings-status-badge is-${updateState.statusType}`;
  }

  if (updateStatusCopy) {
    updateStatusCopy.textContent = updateState.statusCopy;
  }

  if (latestVersionRow && latestVersionValue) {
    const hasLatestVersion = Boolean(updateState.latestVersion);
    latestVersionRow.classList.toggle("hidden", !hasLatestVersion);
    latestVersionValue.textContent = hasLatestVersion ? `v${updateState.latestVersion}` : "-";
  }

  const hasUpdate = Boolean(updateState.availableUpdate);
  settingsUpdateDot?.classList.toggle("hidden", !hasUpdate);
  installUpdateBtn?.classList.toggle("hidden", !hasUpdate);
  if (installUpdateBtn) {
    installUpdateBtn.disabled = !hasUpdate || updateState.isChecking || updateState.isInstalling;
    installUpdateBtn.textContent = updateState.isInstalling ? "Installing" : "Update";
  }

  if (checkUpdatesBtn) {
    checkUpdatesBtn.disabled = updateState.isChecking || updateState.isInstalling;
    checkUpdatesBtn.textContent = updateState.isChecking ? "Checking" : "Check";
  }
}

function getUpdaterApi() {
  return window.__TAURI__?.updater;
}

function getProcessApi() {
  return window.__TAURI__?.process;
}

function isMissingReleaseManifestError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("404") ||
    message.includes("valid release json") ||
    message.includes("latest.json") ||
    message.includes("release json")
  );
}

async function checkForUpdates({ silent }) {
  if (updateState.isChecking || updateState.isInstalling) return;

  const updaterApi = getUpdaterApi();
  if (!updaterApi?.check) {
    setUpdateState(
      "error",
      "Unavailable",
      "This build does not expose the native updater API."
    );
    return;
  }

  updateState.isChecking = true;
  updateState.availableUpdate = null;
  setUpdateState("checking", "Checking", "Looking for a newer LoomLess release on GitHub.");

  try {
    const update = await updaterApi.check({
      timeout: UPDATE_CHECK_TIMEOUT_MS,
    });
    updateState.hasChecked = true;

    if (update && update.available !== false) {
      const latestVersion = normalizeVersion(update.version);
      updateState.availableUpdate = update;
      setUpdateState(
        "update",
        "Available",
        `LoomLess v${latestVersion} is available and ready to install.`,
        latestVersion
      );
      return;
    }

    setUpdateState(
      "ready",
      "Current",
      `You're already on LoomLess v${normalizeVersion(updateState.currentVersion)}.`
    );
  } catch (error) {
    updateState.hasChecked = true;
    updateState.availableUpdate = null;

    if (isMissingReleaseManifestError(error)) {
      setUpdateState(
        "muted",
        "Waiting",
        "No updater manifest is published yet. Automatic detection will activate after the first GitHub release uploads latest.json."
      );
      return;
    }

    if (!silent) {
      setUpdateState(
        "error",
        "Check Failed",
        "LoomLess could not reach the signed update feed right now."
      );
      return;
    }

    setUpdateState(
      "muted",
      "Waiting",
      "Automatic checks are configured, but the update manifest is not reachable yet."
    );
  } finally {
    updateState.isChecking = false;
    renderUpdateState();
  }
}

async function installAvailableUpdate() {
  if (updateState.isInstalling) return;

  if (!updateState.availableUpdate) {
    await checkForUpdates({ silent: false });
    if (!updateState.availableUpdate) return;
  }

  const processApi = getProcessApi();
  if (!processApi?.relaunch) {
    setUpdateState(
      "error",
      "Restart Missing",
      "The updater installed the build, but this app cannot relaunch itself yet."
    );
    return;
  }

  updateState.isInstalling = true;
  renderUpdateState();

  try {
    let downloaded = 0;
    let contentLength = 0;

    setUpdateState(
      "checking",
      "Downloading",
      `Downloading LoomLess v${updateState.latestVersion || normalizeVersion(updateState.availableUpdate.version)}.`
    );

    await updateState.availableUpdate.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength || 0;
          downloaded = 0;
          setUpdateState(
            "checking",
            "Downloading",
            contentLength > 0
              ? `Downloading 0% of LoomLess v${normalizeVersion(updateState.availableUpdate.version)}.`
              : `Downloading LoomLess v${normalizeVersion(updateState.availableUpdate.version)}.`,
            normalizeVersion(updateState.availableUpdate.version)
          );
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          setUpdateState(
            "checking",
            "Downloading",
            contentLength > 0
              ? `Downloading ${Math.min(100, Math.round((downloaded / contentLength) * 100))}% of LoomLess v${normalizeVersion(updateState.availableUpdate.version)}.`
              : `Downloading LoomLess v${normalizeVersion(updateState.availableUpdate.version)}...`,
            normalizeVersion(updateState.availableUpdate.version)
          );
          break;
        case "Finished":
          setUpdateState(
            "checking",
            "Installing",
            `Installing LoomLess v${normalizeVersion(updateState.availableUpdate.version)}.`,
            normalizeVersion(updateState.availableUpdate.version)
          );
          break;
      }
    });

    setUpdateState(
      "ready",
      "Restarting",
      `LoomLess v${normalizeVersion(updateState.availableUpdate.version)} installed. Restarting now.`,
      normalizeVersion(updateState.availableUpdate.version)
    );

    await processApi.relaunch();
  } catch (error) {
    console.error("Failed to install update:", error);
    setUpdateState(
      "error",
      "Install Failed",
      "The signed update could not be installed. Try again after publishing the release assets.",
      updateState.latestVersion
    );
    showErrorToast("Update install failed.");
  } finally {
    updateState.isInstalling = false;
    renderUpdateState();
  }
}

function toggleRecording() {
  if (recordingState === "idle") {
    startRecording();
  } else if (recordingState === "recording" || recordingState === "paused") {
    stopRecording();
  }
}

function togglePauseResume() {
  if (recordingState === "recording") {
    return pauseRecording();
  } else if (recordingState === "paused") {
    return resumeRecording();
  }

  return false;
}

function applyPausedState(pausedTime = Date.now()) {
  if (recordingState === "paused") {
    return;
  }

  recordingState = "paused";
  pausedAt = pausedTime;
  updateTimerDisplay(pausedAt);
  stopTimer();
  updateUIForPausedRecording();
  updateCameraOverlayRecordingState("paused");
  syncRecordingState();
}

function applyRecordingState() {
  if (recordingState === "recording") {
    return;
  }

  recordingState = "recording";
  updateUIForRecording();
  updateTimerDisplay();
  startTimer();
  updateCameraOverlayRecordingState("recording");
  syncRecordingState();
}

function updateTimerDisplay(referenceTime = Date.now()) {
  const elapsed = getActiveRecordingDuration(referenceTime);
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getActiveRecordingDuration(referenceTime = Date.now()) {
  if (!startTime) {
    return 0;
  }

  let elapsed = referenceTime - startTime - pausedDuration;
  if (recordingState === "paused" && pausedAt) {
    elapsed -= referenceTime - pausedAt;
  }

  return Math.max(0, elapsed);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getTrackDimensions(videoTrack) {
  if (!videoTrack) {
    return { width: 1920, height: 1080 };
  }

  const settings = typeof videoTrack.getSettings === "function" ? videoTrack.getSettings() : {};
  const constraints =
    typeof videoTrack.getConstraints === "function" ? videoTrack.getConstraints() : {};

  return {
    width: settings.width || constraints.width?.ideal || constraints.width || 1920,
    height: settings.height || constraints.height?.ideal || constraints.height || 1080,
  };
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

function getRecorderOptions() {
  const desktopMp4Candidates = [
    "video/mp4",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1.42E01E",
  ];
  const videoTrack = stream?.getVideoTracks?.()[0];
  const { width, height } = getTrackDimensions(videoTrack);
  const videoBitsPerSecond = getRecommendedVideoBitrate(width, height);

  if (window.__TAURI__) {
    const supportedMp4 = desktopMp4Candidates.find((type) =>
      MediaRecorder.isTypeSupported(type)
    );

    if (supportedMp4) {
      return {
        mimeType: supportedMp4,
        videoBitsPerSecond,
        audioBitsPerSecond: 160000,
      };
    }
  }

  const options = {
    mimeType: "video/webm;codecs=vp9,opus",
    videoBitsPerSecond,
    audioBitsPerSecond: 160000,
  };

  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = "video/webm;codecs=vp8,opus";
  }
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = "video/webm";
  }

  return options;
}

function attachRecorderHandlers() {
  if (!mediaRecorder) {
    return;
  }

  mediaRecorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = function () {
    mediaRecorder = null;
    finalizeStoppedRecording();
  };

  mediaRecorder.onpause = function () {
    applyPausedState();
  };

  mediaRecorder.onresume = function () {
    if (pausedAt) {
      pausedDuration += Date.now() - pausedAt;
      pausedAt = null;
    }

    applyRecordingState();
  };
}

function startRecorderSegment() {
  if (!stream) {
    return false;
  }

  const options = getRecorderOptions();
  recorderMimeType = options.mimeType;
  mediaRecorder = new MediaRecorder(stream, options);
  attachRecorderHandlers();
  mediaRecorder.start(1000);
  return true;
}

function cleanupCaptureResources() {
  stopTimer();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    if (stream._screenStream) {
      stream._screenStream.getTracks().forEach((track) => track.stop());
    }
  }

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  hideCameraPreview();
  closeCameraOverlayWindow();
}

function finalizeStoppedRecording() {
  cleanupCaptureResources();
  sendOverlayState(false);
  handleRecordingComplete();
}

function registerRecorderTab() {
  // Desktop app: no tab registration needed
}

function syncRecordingState() {
  // Desktop app: no extension state sync needed
}

function setupTauriListeners() {
  if (!window.__TAURI__) return;

  window.__TAURI__.event.listen("tray-action", (event) => {
    const action = event.payload;
    if (action === "pause-resume") {
      if (recordingState === "recording") {
        pauseRecording();
      } else if (recordingState === "paused") {
        resumeRecording();
      }
    } else if (action === "stop") {
      stopRecording();
    }
  });

  window.__TAURI__.event.listen("overlay-permission-denied", async (event) => {
    if (event.payload !== "camera") return;

    await closeCameraOverlayWindow();
    setRecordingMode("screen");
    showPermissionDeniedModal("camera");
  });
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

function isLikelyBrowserWindowCapture(track) {
  if (!track) {
    return false;
  }

  const settings = typeof track.getSettings === "function" ? track.getSettings() : {};
  if (settings?.displaySurface !== "window") {
    return false;
  }

  const label = (track.label || "").toLowerCase();
  return (
    label.includes("chrome") ||
    label.includes("brave") ||
    label.includes("edge") ||
    label.includes("firefox") ||
    label.includes("arc") ||
    label.includes("opera") ||
    label.includes("vivaldi") ||
    label.includes("browser")
  );
}

function isCameraModeEnabled(mode = recordingMode) {
  return mode === "screen-cam" || mode === "screen-cam-mic";
}

/**
 * Set the recording mode and update UI
 */
function setRecordingMode(mode) {
  recordingMode = mode;

  // Update card states
  const modeCards = document.querySelectorAll(".mode-card");
  modeCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.mode === mode);
  });

  // Show/hide camera preview based on mode
  const needsCamera = isCameraModeEnabled(mode);
  if (needsCamera) {
    setupCameraPreview();
  } else {
    hideCameraPreview();
    // Desktop app: also quit the sidecar so its camera handle is released
    // (green light turns off). hideCameraPreview only touches the WebView
    // side; without this the sidecar keeps the OS camera open after the
    // user switches back to a no-camera mode.
    if (window.__TAURI__ && cameraOverlayVisible && !isRecording) {
      closeCameraOverlayWindow();
    }
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
    // Desktop app: the floating sidecar window IS the preview. Do not open
    // the WebView's camera stream and do not show the in-page preview here,
    // or the user sees the in-page circle AND the sidecar at the same time
    // when switching between camera modes (cameraOverlayVisible stays true
    // so the old hide-on-create path never runs again).
    if (window.__TAURI__) {
      if (cameraPreviewContainer) cameraPreviewContainer.classList.add("hidden");
      if (cameraPreview) cameraPreview.srcObject = null;
      if (!cameraOverlayVisible) {
        await createCameraOverlayWindow();
      }
      return;
    }

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
 * Create floating camera overlay window.
 * The overlay opens its OWN camera stream (MediaStream can't cross windows).
 * It floats always-on-top so the camera circle is visible over other apps.
 */
async function createCameraOverlayWindow() {
  if (!window.__TAURI__) return null;

  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (typeof invoke !== 'function') throw new Error('Tauri invoke not available');
    await invoke('show_camera_overlay', {
      showControls: shouldShowFloatingControls(),
    });
    cameraOverlayVisible = true;

    // Hide the in-app camera preview since the overlay replaces it
    if (cameraPreviewContainer) {
      cameraPreviewContainer.classList.add('hidden');
    }

    return true;
  } catch (error) {
    console.error('Failed to create camera overlay window:', error);
    showErrorToast('Camera overlay error: ' + String(error));
    return null;
  }
}

async function updateCameraOverlayPosition(x, y) {
  // Position is handled by the overlay itself via dragging
}

async function updateCameraOverlayControlsPreference() {
  if (!window.__TAURI__ || !cameraOverlayVisible) return;

  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (typeof invoke !== 'function') return;
    await invoke('set_camera_overlay_controls', {
      showControls: shouldShowFloatingControls(),
    });
  } catch (error) {
    console.error('Failed to update overlay controls preference:', error);
  }
}

async function updateCameraOverlayRecordingState(state) {
  if (!window.__TAURI__) return;

  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (typeof invoke !== 'function') return;
    await invoke('set_camera_overlay_state', { state });
  } catch (error) {
    console.error('Failed to update overlay recording state:', error);
  }
}

/**
 * Close the camera overlay window
 */
async function closeCameraOverlayWindow() {
  if (!window.__TAURI__) return;
  try {
    const invoke = window.__TAURI__?.core?.invoke;
    // Use quit_camera_overlay to actually stop the camera, not just hide
    if (typeof invoke === 'function') await invoke('quit_camera_overlay');
  } catch (e) {
    // Panel might already be closed
  }
  cameraOverlayVisible = false;
}

/**
 * Send recording state to overlay window
 */
async function sendOverlayState(isRecordingState) {
  await updateCameraOverlayRecordingState(isRecordingState ? 'recording' : 'idle');
}

/**
 * Handle camera access errors
 */
function handleCameraError(error) {
  if (error.name === "NotAllowedError" && window.__TAURI__) {
    // On macOS, show modal with link to System Settings
    setRecordingMode('screen');
    showPermissionDeniedModal("camera");
    return;
  }

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
 * Build display-capture constraints.
 * System audio is controlled via top-level display options, not a custom
 * `mediaSource: "system"` audio constraint.
 */
function getDisplayMediaOptions(shouldCaptureSystemAudio) {
  const options = {
    video: {
      mediaSource: "screen",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
    audio: false,
  };

  if (!shouldCaptureSystemAudio) {
    return options;
  }

  if (isWebKitScreenCaptureRuntime()) {
    options.audio = true;
    return options;
  }

  options.audio = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    suppressLocalAudioPlayback: false,
  };
  options.systemAudio = "include";
  options.windowAudio = "system";

  return options;
}

function isWebKitScreenCaptureRuntime() {
  const userAgent = navigator.userAgent || "";
  return (
    userAgent.includes("AppleWebKit") &&
    !userAgent.includes("Chrome") &&
    !userAgent.includes("Chromium")
  );
}

function getScreenAudioTracks(screenStream) {
  if (!screenStream) {
    return [];
  }

  return screenStream
    .getAudioTracks()
    .filter((track) => track && track.readyState === "live");
}

/**
 * Merge system audio with microphone audio
 */
async function ensureAudioContextRunning(context) {
  if (!context || typeof context.resume !== "function" || context.state === "running") {
    return;
  }

  try {
    await context.resume();
  } catch (error) {
    console.warn("Failed to resume audio context for recording mix:", error);
  }
}

function isSystemAudioLikelyUnsupported() {
  return isWebKitScreenCaptureRuntime() && !!window.__TAURI__;
}

function isSystemAudioSupportedInCurrentRuntime() {
  return !isSystemAudioLikelyUnsupported();
}

function applySystemAudioAvailabilityState() {
  if (!systemAudioToggle) {
    return;
  }

  if (isSystemAudioSupportedInCurrentRuntime()) {
    systemAudioToggle.disabled = false;
    if (systemAudioCopy) {
      systemAudioCopy.textContent = "Includes shared app/tab audio when macOS provides it. Off by default.";
    }
    return;
  }

  systemAudioToggle.checked = false;
  systemAudioToggle.disabled = true;
  localStorage.setItem(SYSTEM_AUDIO_STORAGE_KEY, "false");

  if (systemAudioCopy) {
    systemAudioCopy.textContent = "Temporarily unavailable in the current macOS desktop build. Requires a native capture path.";
  }
}

async function mergeAudioTracks(screenStream, micStream) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    const fallbackTrack = getScreenAudioTracks(screenStream)[0];
    return fallbackTrack || micStream?.getAudioTracks?.()[0] || null;
  }

  audioContext = new AudioContextClass();
  const destination = audioContext.createMediaStreamDestination();

  // Add every live screen-audio track the share source provides.
  const screenAudioTracks = getScreenAudioTracks(screenStream);
  screenAudioTracks.forEach((track) => {
    const screenSource = audioContext.createMediaStreamSource(new MediaStream([track]));
    screenSource.connect(destination);
  });

  // Add mic audio
  if (micStream?.getAudioTracks?.().length) {
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(destination);
  }

  await ensureAudioContextRunning(audioContext);

  return destination.stream.getAudioTracks()[0] || null;
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
    recordingState = "starting";

    // Update UI immediately
    recordBtn.disabled = true;
    recordingLabel.textContent = "Requesting Permission...";
    statusText.textContent = "Requesting...";

    const needsMic = recordingMode === 'screen-mic' || recordingMode === 'screen-cam-mic';
    const needsCamera = isCameraModeEnabled();
    const shouldCaptureSystemAudio = shouldRecordSystemAudio();

    // Request screen capture
    const screenStream = await navigator.mediaDevices.getDisplayMedia(
      getDisplayMediaOptions(shouldCaptureSystemAudio)
    );

    // Check if user cancelled the screen share
    if (!screenStream) {
      resetUIToInitial();
      return;
    }

    const screenAudioTracks = getScreenAudioTracks(screenStream);
    if (shouldCaptureSystemAudio && screenAudioTracks.length === 0) {
      showErrorToast(
        isSystemAudioLikelyUnsupported()
          ? needsMic
            ? "System audio was requested, but macOS WebKit did not expose a system-audio track. This recording will include mic only."
            : "System audio was requested, but macOS WebKit did not expose a system-audio track."
          : needsMic
            ? "System audio was requested, but this share source provided no audio track. This recording will include mic only."
            : "System audio was requested, but this share source provided no audio track."
      );
    }

    // Get microphone stream if needed
    if (needsMic) {
      try {
        micStream = await getMicStream();
      } catch (micError) {
        console.error("Mic access error:", micError);
        if (micError.name === "NotAllowedError" && window.__TAURI__) {
          showPermissionDeniedModal("microphone");
          resetUIToInitial();
          return;
        }
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
        if (camError.name === "NotAllowedError" && window.__TAURI__) {
          await closeCameraOverlayWindow();
          showPermissionDeniedModal("camera");
          resetUIToInitial();
          return;
        }
        showErrorToast("Could not access camera. Recording without camera overlay.");
      }
    }

    const screenTrack = screenStream.getVideoTracks()[0];
    const isSelfCapture = isLikelySelfTabCapture(screenTrack);

    // Determine if the on-page camera preview is already visible in the capture.
    // - Self-tab capture: preview is in the stream (isSelfCapture === true)
    // - Entire-screen capture (displaySurface === "monitor"): recorder tab is on screen,
    //   so the preview circle is already captured — compositing would create a duplicate.
    // - Window/tab capture of a DIFFERENT target: preview is NOT in the stream,
    //   so we need to composite the camera overlay into the video.
    const screenSettings = screenTrack.getSettings ? screenTrack.getSettings() : {};
    const isEntireScreen = screenSettings.displaySurface === "monitor";
    const isBrowserSurface = screenSettings.displaySurface === "browser";
    const isBrowserWindow = isLikelyBrowserWindowCapture(screenTrack);
    const previewAlreadyCaptured = isSelfCapture || isEntireScreen || isBrowserSurface || isBrowserWindow;

    // Create floating overlay window for camera whenever in camera mode.
    // This overlay floats on top of ALL other apps so the camera circle
    // is visible even when the user switches to another window.
    if (needsCamera && cameraStream && window.__TAURI__) {
      createCameraOverlayWindow(cameraStream);
    }

    // Build the final stream
    let finalVideoTrack;
    let finalAudioTrack;

    // Composite camera into the recording ONLY when the in-app preview
    // would NOT already be captured in the screen stream.
    // (Self-tab, entire screen, or browser window = already visible = no composite)
    if (needsCamera && cameraStream && !previewAlreadyCaptured) {
      const compositeStream = createCompositeStream(screenStream, cameraStream);
      finalVideoTrack = compositeStream.getVideoTracks()[0];
    } else {
      finalVideoTrack = screenTrack;
    }

    // Handle audio: merge mic with system audio or use system audio only
    if (needsMic && micStream) {
      finalAudioTrack = await mergeAudioTracks(screenStream, micStream);
    } else {
      finalAudioTrack = screenAudioTracks.length > 0 ? screenAudioTracks[0] : null;
    }

    // Create the final stream
    const tracks = [finalVideoTrack];
    if (finalAudioTrack) {
      tracks.push(finalAudioTrack);
    }
    stream = new MediaStream(tracks);

    // Store screen stream reference for cleanup
    stream._screenStream = screenStream;

    recordedChunks = [];

    // Handle stream ending (user stops sharing from system)
    screenTrack.addEventListener("ended", function () {
      if (isRecording) {
        stopRecording();
      }
    });

    // Start recording
    if (!startRecorderSegment()) {
      throw new Error("Unable to start recorder segment");
    }
    isRecording = true;
    recordingState = "recording";
    startTime = Date.now();
    pausedAt = null;
    pausedDuration = 0;

    // Update UI for recording state
    updateUIForRecording();
    startTimer();
    syncRecordingState();
  } catch (error) {
    console.error("Error starting recording:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    handleRecordingError(error);
  }
}

function pauseRecording() {
  if (!mediaRecorder || mediaRecorder.state !== "recording") {
    return false;
  }

  try {
    mediaRecorder.pause();
    return true;
  } catch (error) {
    console.error("Error pausing recording:", error);
    showErrorToast("Pause failed. Please try again.");
    return false;
  }
}

function resumeRecording() {
  if (!mediaRecorder || mediaRecorder.state !== "paused") {
    return false;
  }

  try {
    mediaRecorder.resume();
    return true;
  } catch (error) {
    console.error("Error resuming recording:", error);
    showErrorToast("Resume failed. Please try again.");
    return false;
  }
}

function stopRecording() {
  if (mediaRecorder && (mediaRecorder.state === "recording" || mediaRecorder.state === "paused")) {
    const stoppedAt = Date.now();
    if (pausedAt) {
      pausedDuration += stoppedAt - pausedAt;
      pausedAt = null;
    }

    recordingDuration = getActiveRecordingDuration(stoppedAt);
    isRecording = false;
    recordingState = "stopping";

    // Update UI
    recordBtn.disabled = true;
    recordingLabel.textContent = "Processing...";
    recordIcon.classList.remove("hidden");
    statusText.textContent = "Processing";
    statusIndicator.classList.remove("recording", "paused");
    studioContainer.classList.remove("paused");
    syncRecordingState();

    mediaRecorder.stop();
    return true;
  }

  return false;
}

async function handleRecordingComplete() {
  try {
    // Update UI for processing
    statusText.textContent = "Downloading...";
    recordingLabel.textContent = "Preparing Download...";
    recordingLabel.style.display = "";

    // Create blob from recorded chunks
    const blob = new Blob(recordedChunks, {
      type: recorderMimeType || "video/webm",
    });

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const fileExtension = (recorderMimeType || "").includes("mp4") ? "mp4" : "webm";
    const filename = `loomless-recording-${timestamp}.${fileExtension}`;

    if (window.__TAURI__) {
      const { save } = window.__TAURI__.dialog;
      const { writeFile } = window.__TAURI__.fs;
      const filePath = await save({
        defaultPath: filename,
        filters: [
          {
            name: fileExtension.toUpperCase(),
            extensions: [fileExtension],
          },
        ],
      });

      if (!filePath) {
        resetUIToInitial();
        return;
      }

      const arrayBuffer = await blob.arrayBuffer();
      await writeFile(filePath, new Uint8Array(arrayBuffer));
    } else {
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }

    showSuccessMessage();
    resetUIToInitial();
  } catch (error) {
    console.error("Error processing recording:", error);
    handleRecordingError(error);
  }
}

function openEditingTab(recordingId) {
  // Desktop app: navigate to editor in same window
  window.location.href = `editor.html?recording=${recordingId}`;
}

function updateUIForRecording() {
  // Add recording class to container
  studioContainer.classList.add("recording");
  studioContainer.classList.remove("paused");

  // Update button - change icon to STOP (square)
  recordBtn.disabled = false;
  recordIcon.classList.remove("hidden");
  recordIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2"></rect>';

  // Clear the main label during recording (info shown in recording panel instead)
  recordingLabel.textContent = "";
  recordingLabel.style.display = "none";

  // Hide shortcuts hint during recording
  if (shortcutsHint) shortcutsHint.style.display = "none";

  // Update status
  statusIndicator.classList.remove("paused");
  statusIndicator.classList.add("recording");
  statusText.textContent = "Recording";

  if (initialInstructions) initialInstructions.classList.add("hidden");
  if (recordingInstructions) recordingInstructions.classList.remove("hidden");

  // Dim mode cards during recording
  const modeCards = document.querySelectorAll(".mode-card");
  modeCards.forEach((card) => {
    card.style.opacity = "0.4";
    card.style.pointerEvents = "none";
  });

  // Notify overlay window that recording started
  if (window.__TAURI__) {
    sendOverlayState(true);
  }

  // In Tauri desktop app, the floating overlay handles camera preview.
  // Hide the in-app preview to avoid duplicate camera circles.
  if (isCameraModeEnabled() && !cameraOverlayVisible) {
    cameraPreviewContainer.classList.remove("hidden");
  } else if (cameraPreviewContainer) {
    cameraPreviewContainer.classList.add("hidden");
  }
}

function updateUIForPausedRecording() {
  studioContainer.classList.add("recording", "paused");

  recordBtn.disabled = false;
  recordIcon.classList.remove("hidden");
  
  // Clear the main label during paused state
  recordingLabel.textContent = "";
  recordingLabel.style.display = "none";

  // Hide shortcuts hint during paused state
  if (shortcutsHint) shortcutsHint.style.display = "none";

  statusIndicator.classList.remove("recording");
  statusIndicator.classList.add("paused");
  statusText.textContent = "Paused";

  if (initialInstructions) initialInstructions.classList.add("hidden");
  if (recordingInstructions) recordingInstructions.classList.remove("hidden");

  if (isCameraModeEnabled()) {
    if (!cameraOverlayVisible) {
      cameraPreviewContainer.classList.remove("hidden");
    }
  }
}

function resetUIToInitial() {
  // Remove recording class
  studioContainer.classList.remove("recording");
  studioContainer.classList.remove("paused");

  // Reset button - change icon back to PLAY (triangle)
  recordBtn.disabled = false;
  recordIcon.classList.remove("hidden");
  recordIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';

  // Reset label
  recordingLabel.textContent = "Quick Record";
  recordingLabel.style.display = "";

  // Show shortcuts hint again
  if (shortcutsHint) shortcutsHint.style.display = "";

  // Reset status
  statusIndicator.classList.remove("recording", "paused");
  statusText.textContent = "Ready";
  timer.textContent = "00:00";

  // Reset instruction panels
  if (initialInstructions) initialInstructions.classList.remove("hidden");
  if (recordingInstructions) recordingInstructions.classList.add("hidden");

  // Restore mode cards
  const modeCards = document.querySelectorAll(".mode-card");
  modeCards.forEach((card) => {
    card.style.opacity = "1";
    card.style.pointerEvents = "auto";
  });

  // Clear timer
  stopTimer();

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
  closeCameraOverlayWindow();

  // Reset variables
  isRecording = false;
  recordingState = "idle";
  startTime = null;
  pausedAt = null;
  pausedDuration = 0;
  recordingDuration = 0;
  recordedChunks = [];
  mediaRecorder = null;
  stream = null;
  recorderMimeType = "video/webm";
  syncRecordingState();

  // Restore camera preview if current mode still requires camera.
  if (isCameraModeEnabled()) {
    setupCameraPreview();
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    if (startTime && recordingState === "recording") {
      updateTimerDisplay();
    }
  }, 1000);
}

function handleRecordingError(error) {
  console.error("Recording error:", error);

  let errorMessage = "Failed";

  if (error.name === "NotAllowedError") {
    errorMessage = "Permission Denied";
    // On macOS Tauri app, show a detailed modal with button to open System Settings
    if (window.__TAURI__) {
      showPermissionDeniedModal("screen");
    } else {
      recordingLabel.textContent = "Screen sharing permission denied. Try again.";
    }
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

  // Reset UI after error (skip if modal is shown)
  if (!(error.name === "NotAllowedError" && window.__TAURI__)) {
    setTimeout(() => {
      resetUIToInitial();
    }, 3000);
  }
}

/**
 * Show a modal when macOS permission is denied, with a button to open System Settings.
 * @param {"screen"|"camera"|"microphone"} permissionType
 */
function showPermissionDeniedModal(permissionType) {
  const settingsMap = {
    screen: {
      title: "Screen Recording Permission Required",
      description: "macOS has blocked screen recording for LoomLess. You need to enable it in System Settings to continue.",
      settingsUrl: "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
      settingsLabel: "Open Screen Recording Settings",
    },
    camera: {
      title: "Camera Permission Required",
      description: "macOS has blocked camera access for LoomLess. You need to enable it in System Settings to continue.",
      settingsUrl: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
      settingsLabel: "Open Camera Settings",
    },
    microphone: {
      title: "Microphone Permission Required",
      description: "macOS has blocked microphone access for LoomLess. You need to enable it in System Settings to continue.",
      settingsUrl: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
      settingsLabel: "Open Microphone Settings",
    },
  };

  const info = settingsMap[permissionType];
  if (!info) return;

  // Remove existing modal if any
  const existing = document.getElementById("permissionDeniedModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "permissionDeniedModal";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background: var(--bg-secondary, #111114);
      border: 1px solid var(--border-default, rgba(255,255,255,0.12));
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      max-width: 440px;
      width: 90%;
    ">
      <div style="
        width: 56px;
        height: 56px;
        background: rgba(239, 68, 68, 0.12);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        </svg>
      </div>
      <h2 style="color: var(--text-primary, #f4f4f5); font-size: 20px; margin-bottom: 10px; font-weight: 700;">${info.title}</h2>
      <p style="color: var(--text-muted, #a1a1aa); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${info.description}</p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="openSettingsBtn" style="
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        ">${info.settingsLabel}</button>
        <button id="dismissPermissionModal" style="
          background: transparent;
          color: var(--text-muted, #a1a1aa);
          border: 1px solid var(--border-default, rgba(255,255,255,0.12));
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
        ">Dismiss</button>
      </div>
      <p style="color: var(--text-muted, #71717a); font-size: 12px; margin-top: 16px; line-height: 1.5;">After enabling the permission, you may need to restart LoomLess for the change to take effect.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Open Settings button
  document.getElementById("openSettingsBtn").addEventListener("click", async () => {
    try {
      const invoke = window.__TAURI__?.core?.invoke;
      if (typeof invoke === "function") {
        await invoke("open_system_preferences_panel", { panel: permissionType });
        return;
      }

      const { openUrl } = window.__TAURI__?.opener || {};
      if (typeof openUrl === "function") {
        await openUrl(info.settingsUrl);
        return;
      }

      throw new Error("No native settings opener is available");
    } catch (e) {
      console.error("Failed to open settings:", e);
      showErrorToast("Could not open System Settings automatically.");
    }
  });

  // Dismiss button
  document.getElementById("dismissPermissionModal").addEventListener("click", () => {
    overlay.remove();
    resetUIToInitial();
  });
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
    Recording downloaded!
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
