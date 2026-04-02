// Background service worker for LoomLess Studio extension

const recordingSession = {
  recorderTabId: null,
  state: "idle",
  mode: "screen",
  overlayPosition: null
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("LoomLess Studio extension installed");
  chrome.runtime.setUninstallURL("https://forms.gle/WUnpyQQartYc6y8a9");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_RECORDER") {
    openRecorderTab(sendResponse);
    return true;
  }

  if (message.action === "REGISTER_RECORDER") {
    handleRegisterRecorder(sender, sendResponse);
    return true;
  }

  if (message.action === "RECORDER_STATE_UPDATE") {
    handleRecorderStateUpdate(message, sender, sendResponse);
    return true;
  }

  if (message.action === "RECORDER_COMMAND") {
    forwardRecorderCommand(message, sendResponse);
    return true;
  }

  if (message.action === "GET_RECORDING_SESSION") {
    sendResponse({
      success: true,
      session: {
        state: recordingSession.state,
        mode: recordingSession.mode,
        overlayPosition: recordingSession.overlayPosition
      }
    });
    return false;
  }

  if (message.action === "SET_OVERLAY_POSITION") {
    handleOverlayPositionUpdate(message, sendResponse);
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === recordingSession.recorderTabId) {
    resetRecordingSession();
    broadcastSessionUpdate();
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (recordingSession.state === "idle") {
    return;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    await injectOverlayBridge(tab);
  } catch (error) {
    console.warn("Overlay injection on activate failed:", error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (recordingSession.state === "idle" || changeInfo.status !== "complete") {
    return;
  }

  try {
    await injectOverlayBridge(tab);
  } catch (error) {
    console.warn("Overlay injection on update failed:", error);
  }
});

async function openRecorderTab(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({
      url: chrome.runtime.getURL("recorder/recorder.html"),
    });

    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      sendResponse({ success: true, message: "Focused existing recorder tab" });
    } else {
      const tab = await chrome.tabs.create({
        url: chrome.runtime.getURL("recorder/recorder.html"),
        active: true,
      });
      sendResponse({
        success: true,
        message: "Opened new recorder tab",
        tabId: tab.id,
      });
    }
  } catch (error) {
    console.error("Error opening recorder tab:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRegisterRecorder(sender, sendResponse) {
  try {
    if (sender.tab?.id) {
      recordingSession.recorderTabId = sender.tab.id;
    }

    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRecorderStateUpdate(message, sender, sendResponse) {
  try {
    if (sender.tab?.id) {
      recordingSession.recorderTabId = sender.tab.id;
    }

    recordingSession.state = message.state || recordingSession.state;
    recordingSession.mode = message.mode || recordingSession.mode;

    if (recordingSession.state === "idle") {
      recordingSession.overlayPosition = null;
    }

    if (recordingSession.state !== "idle") {
      await injectOverlayBridgeIntoAllTabs();
    }

    broadcastSessionUpdate();
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error updating recorder state:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleOverlayPositionUpdate(message, sendResponse) {
  try {
    if (
      !message.position ||
      typeof message.position.left !== "number" ||
      typeof message.position.top !== "number"
    ) {
      sendResponse({ success: false, error: "Invalid overlay position" });
      return;
    }

    recordingSession.overlayPosition = {
      left: message.position.left,
      top: message.position.top
    };
    broadcastSessionUpdate();
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error updating overlay position:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function forwardRecorderCommand(message, sendResponse) {
  try {
    if (!recordingSession.recorderTabId) {
      sendResponse({ success: false, error: "No active recorder tab" });
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: "RECORDER_INTERNAL_COMMAND",
      targetTabId: recordingSession.recorderTabId,
      command: message.command
    });

    sendResponse({
      success: Boolean(response?.success),
      error: response?.error
    });
  } catch (error) {
    console.error("Error forwarding recorder command:", error);
    sendResponse({ success: false, error: error.message });
  }
}

function canInjectOverlay(tab) {
  const url = tab?.url || "";

  if (!tab?.id) {
    return false;
  }

  if (!url) {
    return false;
  }

  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://")
  );
}

async function injectOverlayBridge(tab) {
  if (!canInjectOverlay(tab)) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["recorder/page-overlay-bridge.js"]
  });
}

async function injectOverlayBridgeIntoAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      await injectOverlayBridge(tab);
    } catch (error) {
      console.warn("Overlay injection failed for tab:", tab.id, error);
    }
  }
}

function broadcastSessionUpdate() {
  chrome.runtime.sendMessage({
    action: "RECORDING_SESSION_UPDATE",
    session: {
      state: recordingSession.state,
      mode: recordingSession.mode,
      overlayPosition: recordingSession.overlayPosition
    }
  }).catch(() => {});

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) {
        return;
      }

      chrome.tabs.sendMessage(tab.id, {
        action: "RECORDING_SESSION_UPDATE",
        session: {
          state: recordingSession.state,
          mode: recordingSession.mode,
          overlayPosition: recordingSession.overlayPosition
        }
      }).catch(() => {});
    });
  });
}

function resetRecordingSession() {
  recordingSession.recorderTabId = null;
  recordingSession.mode = "screen";
  recordingSession.state = "idle";
  recordingSession.overlayPosition = null;
}

chrome.action.onClicked.addListener(() => {
  openRecorderTab(() => {});
});

chrome.runtime.onSuspend.addListener(() => {
  console.log("LoomLess Studio extension suspending");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("LoomLess Studio extension starting up");
});
