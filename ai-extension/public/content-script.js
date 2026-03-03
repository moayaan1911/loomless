(() => {
  if (window.__loomlessAiFloatingInitialized) return;
  window.__loomlessAiFloatingInitialized = true;

  const STORAGE_KEY = "loomless_ai_floating_enabled";
  const BUTTON_ID = "loomless-ai-floating-icon";
  const MENU_ID = "loomless-ai-radial-menu";
  const TOAST_ID = "loomless-ai-toast";
  let floatingEnabled = false;

  function createFloatingButton() {
    let button = document.getElementById(BUTTON_ID);
    if (button) return button;

    button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.title = "LoomLess AI";
    button.setAttribute("aria-label", "Open LoomLess AI");

    Object.assign(button.style, {
      position: "fixed",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "50px",
      height: "50px",
      borderRadius: "999px",
      border: "1px solid rgba(255, 255, 255, 0.38)",
      background: "linear-gradient(155deg, #0c1630 0%, #16284c 100%)",
      boxShadow:
        "0 12px 26px rgba(8, 15, 32, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: "2147483647",
      padding: "0",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    });

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("icon.png");
    icon.alt = "LoomLess AI";
    Object.assign(icon.style, {
      width: "42px",
      height: "42px",
      borderRadius: "999px",
      pointerEvents: "none",
    });

    icon.addEventListener("error", () => {
      icon.remove();
      button.textContent = "AI";
      Object.assign(button.style, {
        color: "#e7f1ff",
        fontSize: "13px",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        fontWeight: "700",
      });
    });

    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-50%) scale(1.05)";
      button.style.boxShadow =
        "0 16px 32px rgba(8, 15, 32, 0.52), inset 0 0 0 1px rgba(255, 255, 255, 0.16)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(-50%) scale(1)";
      button.style.boxShadow =
        "0 12px 26px rgba(8, 15, 32, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.1)";
    });

    button.addEventListener("click", () => {
      toggleRadialMenu();
    });

    button.appendChild(icon);
    document.documentElement.appendChild(button);
    return button;
  }

  function removeRadialMenu() {
    document.getElementById(MENU_ID)?.remove();
  }

  function showToast(message) {
    document.getElementById(TOAST_ID)?.remove();
    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      right: "78px",
      top: "50%",
      transform: "translateY(-50%)",
      maxWidth: "240px",
      padding: "10px 12px",
      borderRadius: "12px",
      color: "#e8f1ff",
      font: "600 12px/1.4 system-ui, -apple-system, Segoe UI, sans-serif",
      background: "rgba(8, 16, 35, 0.92)",
      border: "1px solid rgba(130, 178, 255, 0.45)",
      zIndex: "2147483647",
      boxShadow: "0 14px 28px rgba(6, 10, 20, 0.45)",
      pointerEvents: "none",
    });
    document.documentElement.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  function closeMenuOnOutsideClick(event) {
    const button = document.getElementById(BUTTON_ID);
    const menu = document.getElementById(MENU_ID);
    const target = event.target;
    if (button?.contains(target) || menu?.contains(target)) return;
    removeRadialMenu();
    document.removeEventListener("mousedown", closeMenuOnOutsideClick, true);
  }

  function createActionButton({ label, emoji, offsetX, offsetY, onClick }) {
    const action = document.createElement("button");
    action.type = "button";
    action.title = label;

    Object.assign(action.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "58px",
      height: "58px",
      transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
      borderRadius: "999px",
      border: "1px solid rgba(152, 186, 255, 0.62)",
      background: "linear-gradient(150deg, rgba(10, 22, 46, 0.98), rgba(20, 43, 88, 0.98))",
      color: "#ebf2ff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      cursor: "pointer",
      boxShadow: "0 12px 20px rgba(5, 10, 21, 0.45)",
      font: "600 8.5px/1.1 system-ui, -apple-system, Segoe UI, sans-serif",
      textAlign: "center",
      padding: "3px",
    });

    const icon = document.createElement("span");
    icon.textContent = emoji;
    icon.style.fontSize = "14px";

    const text = document.createElement("span");
    text.textContent = label;
    text.style.maxWidth = "52px";

    action.appendChild(icon);
    action.appendChild(text);
    action.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });

    return action;
  }

  function toggleFloatingFromMenu() {
    const nextState = !floatingEnabled;
    chrome.storage.local.set({ [STORAGE_KEY]: nextState });
    setFloatingState(nextState);
  }

  function toggleRadialMenu() {
    const existing = document.getElementById(MENU_ID);
    if (existing) {
      existing.remove();
      document.removeEventListener("mousedown", closeMenuOnOutsideClick, true);
      return;
    }

    const button = createFloatingButton();
    const rect = button.getBoundingClientRect();
    const menu = document.createElement("div");
    menu.id = MENU_ID;

    Object.assign(menu.style, {
      position: "fixed",
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top + rect.height / 2}px`,
      width: "210px",
      height: "210px",
      transform: "translate(-50%, -50%)",
      zIndex: "2147483646",
      pointerEvents: "none",
    });

    const actions = [
      {
        label: "Summarize",
        emoji: "📝",
        offsetX: 0,
        offsetY: 68,
        onClick: () => {
          showToast("Summarize is next. Wiring NIM in next step.");
          removeRadialMenu();
        },
      },
      {
        label: "Chat",
        emoji: "💬",
        offsetX: -60,
        offsetY: 34,
        onClick: () => {
          showToast("Chat coming next.");
          removeRadialMenu();
        },
      },
      {
        label: floatingEnabled ? "Disable" : "Enable",
        emoji: floatingEnabled ? "⏻" : "⚡",
        offsetX: 0,
        offsetY: -68,
        onClick: () => {
          toggleFloatingFromMenu();
          removeRadialMenu();
        },
      },
      {
        label: "Write",
        emoji: "✍️",
        offsetX: -60,
        offsetY: -34,
        onClick: () => {
          showToast("Write action coming next.");
          removeRadialMenu();
        },
      },
    ];

    actions.forEach((item) => {
      const action = createActionButton(item);
      action.style.pointerEvents = "auto";
      menu.appendChild(action);
    });

    document.documentElement.appendChild(menu);
    window.setTimeout(() => {
      document.addEventListener("mousedown", closeMenuOnOutsideClick, true);
    }, 0);
  }

  function removeFloatingButton() {
    document.getElementById(BUTTON_ID)?.remove();
    removeRadialMenu();
    document.removeEventListener("mousedown", closeMenuOnOutsideClick, true);
  }

  function setFloatingState(enabled) {
    floatingEnabled = enabled;
    if (enabled) {
      createFloatingButton();
      return;
    }
    removeFloatingButton();
  }

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    setFloatingState(Boolean(result[STORAGE_KEY]));
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
    setFloatingState(Boolean(changes[STORAGE_KEY].newValue));
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "LOOMLESS_AI_SET_FLOATING") return;
    setFloatingState(Boolean(message.enabled));
  });
})();
