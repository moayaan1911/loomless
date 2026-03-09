(function () {
  if (window.top !== window) {
    return;
  }

  if (window.__loomlessStudioOverlayBridgeLoaded) {
    return;
  }

  window.__loomlessStudioOverlayBridgeLoaded = true;

  const FRAME_ID = "loomless-studio-page-overlay";
  const FRAME_URL = chrome.runtime.getURL("recorder/page-overlay.html");
  const DEFAULT_MARGIN = 20;
  let overlayFrame = null;
  let session = { state: "idle", mode: "screen", overlayPosition: null };
  let frameWidth = 164;
  let frameHeight = 76;
  let dragState = null;
  let overlayPosition = null;

  function isOverlayActive(nextSession = session) {
    return nextSession.state === "recording" || nextSession.state === "paused" || nextSession.state === "stopping";
  }

  function ensureOverlayFrame() {
    if (overlayFrame && document.documentElement.contains(overlayFrame)) {
      return overlayFrame;
    }

    overlayFrame = document.createElement("iframe");
    overlayFrame.id = FRAME_ID;
    overlayFrame.src = FRAME_URL;
    overlayFrame.allow = "camera; microphone";
    overlayFrame.setAttribute("aria-label", "LoomLess Studio overlay");
    overlayFrame.style.cssText = [
      "position: fixed",
      `right: ${DEFAULT_MARGIN}px`,
      `bottom: ${DEFAULT_MARGIN}px`,
      `width: ${frameWidth}px`,
      `height: ${frameHeight}px`,
      "border: 0",
      "background: transparent",
      "z-index: 2147483647",
      "border-radius: 22px",
      "box-shadow: none",
      "display: none"
    ].join("; ");

    overlayFrame.addEventListener("load", () => {
      postSessionToFrame();
    });

    document.documentElement.appendChild(overlayFrame);
    return overlayFrame;
  }

  function getViewportBounds() {
    return {
      minLeft: 12,
      minTop: 12,
      maxLeft: Math.max(12, window.innerWidth - frameWidth - 12),
      maxTop: Math.max(12, window.innerHeight - frameHeight - 12)
    };
  }

  function applyOverlayPosition() {
    const frame = ensureOverlayFrame();

    if (session.overlayPosition && !dragState) {
      overlayPosition = {
        left: session.overlayPosition.left,
        top: session.overlayPosition.top
      };
    }

    if (!overlayPosition) {
      frame.style.left = "auto";
      frame.style.top = "auto";
      frame.style.right = `${DEFAULT_MARGIN}px`;
      frame.style.bottom = `${DEFAULT_MARGIN}px`;
      return;
    }

    const bounds = getViewportBounds();
    const left = Math.min(Math.max(overlayPosition.left, bounds.minLeft), bounds.maxLeft);
    const top = Math.min(Math.max(overlayPosition.top, bounds.minTop), bounds.maxTop);
    overlayPosition = { left, top };
    frame.style.left = `${left}px`;
    frame.style.top = `${top}px`;
    frame.style.right = "auto";
    frame.style.bottom = "auto";
  }

  function postSessionToFrame() {
    if (!overlayFrame?.contentWindow) {
      return;
    }

    overlayFrame.contentWindow.postMessage(
      {
        type: "LOOMLESS_STUDIO_SESSION",
        session,
        pageVisible: document.visibilityState === "visible"
      },
      "*"
    );
  }

  function applyOverlayVisibility() {
    const frame = ensureOverlayFrame();
    const showOverlay = isOverlayActive() && document.visibilityState === "visible";
    frame.style.display = showOverlay ? "block" : "none";
    applyOverlayPosition();
    postSessionToFrame();
  }

  async function refreshSession() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "GET_RECORDING_SESSION" });
      if (response?.success && response.session) {
        session = response.session;
      } else {
        session = { state: "idle", mode: "screen" };
      }
    } catch (error) {
      session = { state: "idle", mode: "screen" };
    }

    applyOverlayVisibility();
  }

  function startDragging() {
    const frame = ensureOverlayFrame();
    const rect = frame.getBoundingClientRect();
    dragState = {
      left: rect.left,
      top: rect.top
    };
    overlayPosition = {
      left: rect.left,
      top: rect.top
    };
    applyOverlayPosition();
  }

  function moveDragging(deltaX, deltaY) {
    if (!dragState) {
      return;
    }

    overlayPosition = {
      left: overlayPosition.left + deltaX,
      top: overlayPosition.top + deltaY
    };
    applyOverlayPosition();
  }

  function stopDragging() {
    if (overlayPosition) {
      chrome.runtime.sendMessage({
        action: "SET_OVERLAY_POSITION",
        position: overlayPosition
      }).catch(() => {});
    }

    dragState = null;
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action !== "RECORDING_SESSION_UPDATE") {
      return false;
    }

    session = message.session || { state: "idle", mode: "screen" };
    applyOverlayVisibility();
    return false;
  });

  document.addEventListener("visibilitychange", () => {
    applyOverlayVisibility();
  });

  window.addEventListener("resize", () => {
    applyOverlayPosition();
  });

  window.addEventListener("message", (event) => {
    if (event.source !== overlayFrame?.contentWindow || !event.data) {
      return;
    }

    if (event.data.type === "LOOMLESS_STUDIO_OVERLAY_SIZE") {
      frameWidth = event.data.width;
      frameHeight = event.data.height;
      overlayFrame.style.width = `${frameWidth}px`;
      overlayFrame.style.height = `${frameHeight}px`;
      applyOverlayPosition();
      return;
    }

    if (event.data.type === "LOOMLESS_STUDIO_OVERLAY_DRAG_START") {
      startDragging();
      return;
    }

    if (event.data.type === "LOOMLESS_STUDIO_OVERLAY_DRAG_MOVE") {
      moveDragging(event.data.deltaX, event.data.deltaY);
      return;
    }

    if (event.data.type === "LOOMLESS_STUDIO_OVERLAY_DRAG_END") {
      stopDragging();
    }
  });

  ensureOverlayFrame();
  refreshSession();
})();
