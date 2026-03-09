const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const stopBtn = document.getElementById("stopBtn");
const statusDot = document.getElementById("statusDot");
const statusTitle = document.getElementById("statusTitle");
const statusSubtitle = document.getElementById("statusSubtitle");

let currentState = "idle";
let currentMode = "screen";
let isSending = false;

document.addEventListener("DOMContentLoaded", async () => {
  await refreshSession();

  pauseResumeBtn.addEventListener("click", () => {
    sendRecorderCommand("pause-resume");
  });

  stopBtn.addEventListener("click", () => {
    sendRecorderCommand("stop");
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action !== "RECORDING_SESSION_UPDATE") {
      return false;
    }

    applySession(message.session);
    return false;
  });
});

async function refreshSession() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "GET_RECORDING_SESSION"
    });

    if (response?.success) {
      applySession(response.session);
    }
  } catch (error) {
    applySession({ state: "idle", mode: "screen" });
  }
}

function applySession(session) {
  currentState = session?.state || "idle";
  currentMode = session?.mode || "screen";

  if (currentState === "paused") {
    statusTitle.textContent = "Paused";
    statusSubtitle.textContent = formatModeLabel(currentMode);
    pauseResumeBtn.textContent = "Resume";
    pauseResumeBtn.disabled = false;
    stopBtn.disabled = false;
    statusDot.className = "status-dot paused";
    return;
  }

  if (currentState === "recording") {
    statusTitle.textContent = "Recording";
    statusSubtitle.textContent = formatModeLabel(currentMode);
    pauseResumeBtn.textContent = "Pause";
    pauseResumeBtn.disabled = false;
    stopBtn.disabled = false;
    statusDot.className = "status-dot";
    return;
  }

  if (currentState === "stopping") {
    statusTitle.textContent = "Saving";
    statusSubtitle.textContent = "Finalizing recording";
    pauseResumeBtn.textContent = "Pause";
    pauseResumeBtn.disabled = true;
    stopBtn.disabled = true;
    statusDot.className = "status-dot stopping";
    return;
  }

  statusTitle.textContent = "Waiting";
  statusSubtitle.textContent = "Recorder not active";
  pauseResumeBtn.textContent = "Pause";
  pauseResumeBtn.disabled = true;
  stopBtn.disabled = true;
  statusDot.className = "status-dot stopping";
}

async function sendRecorderCommand(command) {
  if (isSending || currentState === "idle" || currentState === "stopping") {
    return;
  }

  isSending = true;
  pauseResumeBtn.disabled = true;
  stopBtn.disabled = true;

  try {
    await chrome.runtime.sendMessage({
      action: "RECORDER_COMMAND",
      command
    });
  } catch (error) {
    pauseResumeBtn.disabled = false;
    stopBtn.disabled = false;
  } finally {
    isSending = false;
    window.setTimeout(() => {
      if (currentState !== "stopping") {
        applySession({ state: currentState, mode: currentMode });
      }
    }, 120);
  }
}

function formatModeLabel(mode) {
  if (mode === "screen-mic") {
    return "Screen + Mic";
  }

  if (mode === "screen-cam") {
    return "Screen + Cam";
  }

  if (mode === "screen-cam-mic") {
    return "Screen + Cam + Mic";
  }

  return "Screen";
}
