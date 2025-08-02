// Background service worker for LoomLess extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("LoomLess extension installed");
});

// Handle messages from popup and other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_RECORDER") {
    openRecorderTab(sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function openRecorderTab(sendResponse) {
  try {
    // Check if recorder tab is already open
    const tabs = await chrome.tabs.query({
      url: chrome.runtime.getURL("recorder/recorder.html"),
    });

    if (tabs.length > 0) {
      // Focus existing recorder tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      sendResponse({ success: true, message: "Focused existing recorder tab" });
    } else {
      // Create new recorder tab
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

// Handle extension icon click (optional - mainly handled by popup)
chrome.action.onClicked.addListener(async (tab) => {
  // This will only fire if no popup is defined in manifest
  // Since we have a popup, this is just a fallback
  openRecorderTab(() => {});
});

// Clean up when extension is disabled/removed
chrome.runtime.onSuspend.addListener(() => {
  console.log("LoomLess extension suspending");
});

// Handle when extension context is invalidated
chrome.runtime.onStartup.addListener(() => {
  console.log("LoomLess extension starting up");
});
