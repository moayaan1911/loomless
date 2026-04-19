const overlayShell = document.getElementById("overlayShell");
const cameraShell = document.getElementById("cameraShell");
const cameraPreview = document.getElementById("cameraPreview");
const controlsShell = document.querySelector(".controls-shell");
const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const stopBtn = document.getElementById("stopBtn");
const pauseIcon = document.getElementById("pauseIcon");
const playIcon = document.getElementById("playIcon");

let overlaySession = { state: "idle", mode: "screen" };
let overlayPreferences = { showFloatingControls: true };
let cameraStream = null;
let pageVisible = true;
let pendingCommand = false;
let dragging = false;

document.addEventListener("DOMContentLoaded", () => {
  stopBtn.addEventListener("click", () => {
    sendCommand("stop");
  });

  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "LOOMLESS_STUDIO_SESSION") {
      return;
    }

    overlaySession = event.data.session || { state: "idle", mode: "screen" };
    pageVisible = Boolean(event.data.pageVisible);
    overlayPreferences = {
      showFloatingControls: true,
      ...(event.data.preferences || {}),
    };
    updateOverlay();
  });

  postOverlaySize();
});

function isCameraMode(mode = overlaySession.mode) {
  return mode === "screen-cam" || mode === "screen-cam-mic";
}

function isRecordingActive() {
  return overlaySession.state === "recording" || overlaySession.state === "paused";
}

async function refreshSessionState() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "GET_RECORDING_SESSION"
    });

    if (response?.success && response.session) {
      overlaySession = response.session;
    }
  } catch (error) {
    // Ignore and keep the last known state.
  }

  updateOverlay();
}

function applyOptimisticCommandState(command) {
  if (command === "pause" && overlaySession.state === "recording") {
    overlaySession = { ...overlaySession, state: "paused" };
  } else if (command === "resume" && overlaySession.state === "paused") {
    overlaySession = { ...overlaySession, state: "recording" };
  } else if (command === "stop" && overlaySession.state !== "idle") {
    overlaySession = { ...overlaySession, state: "stopping" };
  }
}

async function updateOverlay() {
  if (isCameraMode() && isRecordingActive() && pageVisible) {
    await ensureCameraPreview();
  } else {
    stopCameraPreview();
  }

  const showControls = overlayPreferences.showFloatingControls !== false;
  controlsShell.classList.toggle("hidden", !showControls);
  const hasCamera = !cameraShell.classList.contains("hidden");
  overlayShell.classList.toggle("camera-active", hasCamera && showControls);

  if (overlaySession.state === "paused") {
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
  } else {
    pauseIcon.classList.remove("hidden");
    playIcon.classList.add("hidden");
  }

  const disableControls = pendingCommand || overlaySession.state === "stopping" || overlaySession.state === "idle";
  pauseResumeBtn.disabled = disableControls;
  stopBtn.disabled = disableControls;

  postOverlaySize();
}

async function ensureCameraPreview() {
  cameraShell.classList.remove("hidden");

  if (cameraStream) {
    cameraPreview.srcObject = cameraStream;
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      },
      audio: false
    });
    cameraPreview.srcObject = cameraStream;
  } catch (error) {
    cameraShell.classList.add("hidden");
    postOverlaySize();
  }
}

function stopCameraPreview() {
  cameraShell.classList.add("hidden");
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraPreview.srcObject = null;
}

async function sendCommand(command) {
  if (pendingCommand || overlaySession.state === "idle" || overlaySession.state === "stopping") {
    return;
  }

  pendingCommand = true;
  applyOptimisticCommandState(command);
  updateOverlay();

  try {
    const response = await chrome.runtime.sendMessage({
      action: "RECORDER_COMMAND",
      command
    });

    if (!response?.success) {
      await refreshSessionState();
    }
  } catch (error) {
    await refreshSessionState();
  } finally {
    window.setTimeout(() => {
      pendingCommand = false;
      updateOverlay();
    }, 150);
  }
}

pauseResumeBtn.addEventListener("click", () => {
  if (overlaySession.state === "paused") {
    sendCommand("resume");
  } else {
    sendCommand("pause");
  }
});

function postOverlaySize() {
  const hasCamera = !cameraShell.classList.contains("hidden");
  const showControls = overlayPreferences.showFloatingControls !== false;
  const width = showControls ? 172 : 112;
  const cameraOnlyWidth = 136;
  const height = hasCamera ? (showControls ? 204 : 136) : 88;
  window.parent.postMessage(
    {
      type: "LOOMLESS_STUDIO_OVERLAY_SIZE",
      width: hasCamera && !showControls ? cameraOnlyWidth : width,
      height
    },
    "*"
  );
}

overlayShell.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  dragging = true;
  overlayShell.setPointerCapture(event.pointerId);
  window.parent.postMessage(
    {
      type: "LOOMLESS_STUDIO_OVERLAY_DRAG_START",
    },
    "*"
  );
});

overlayShell.addEventListener("pointermove", (event) => {
  if (!dragging) {
    return;
  }

  window.parent.postMessage(
    {
      type: "LOOMLESS_STUDIO_OVERLAY_DRAG_MOVE",
      deltaX: event.movementX,
      deltaY: event.movementY
    },
    "*"
  );
});

const stopDragging = (event) => {
  if (!dragging) {
    return;
  }

  dragging = false;
  overlayShell.releasePointerCapture(event.pointerId);
  window.parent.postMessage(
    {
      type: "LOOMLESS_STUDIO_OVERLAY_DRAG_END"
    },
    "*"
  );
};

overlayShell.addEventListener("pointerup", stopDragging);
overlayShell.addEventListener("pointercancel", stopDragging);
