(() => {
  if (window.__loomlessAiFloatingInitialized) return;
  window.__loomlessAiFloatingInitialized = true;

  const iconApi =
    globalThis.LoomLessIconMap && typeof globalThis.LoomLessIconMap.html === "function"
      ? globalThis.LoomLessIconMap
      : null;

  function iconHtml(name, className = "") {
    if (!iconApi) return "";
    return iconApi.html(name, className);
  }

  const STORAGE_FLOATING_KEY = "loomless_ai_floating_enabled";
  const STORAGE_AUTH_SESSION = "loomless_ai_auth_session";
  const STORAGE_PROFILE_COMPLETED = "loomless_ai_profile_completed";
  const BUTTON_ID = "loomless-ai-floating-icon";
  const MENU_ID = "loomless-ai-radial-menu";
  const TOAST_ID = "loomless-ai-toast";
  const SUMMARY_PANEL_ID = "loomless-ai-summary-panel";
  const SUMMARY_TITLE_ID = "loomless-ai-summary-title";
  const SUMMARY_TEXT_ID = "loomless-ai-summary-text";
  const SUMMARY_STATUS_ID = "loomless-ai-summary-status";
  const SUMMARY_COPY_ID = "loomless-ai-summary-copy";
  const WRITE_PANEL_ID = "loomless-ai-write-panel";
  const WRITE_STATUS_ID = "loomless-ai-write-status";
  const WRITE_OUTPUT_ID = "loomless-ai-write-output";
  const WRITE_COPY_ID = "loomless-ai-write-copy";
  const WRITE_TONE_ID = "loomless-ai-write-tone";
  const WRITE_FORMAT_ID = "loomless-ai-write-format";
  const WRITE_PROMPT_ID = "loomless-ai-write-prompt";
  const WRITE_GENERATE_ID = "loomless-ai-write-generate";
  const CHAT_PANEL_ID = "loomless-ai-chat-panel";
  const CHAT_STATUS_ID = "loomless-ai-chat-status";
  const CHAT_MESSAGES_ID = "loomless-ai-chat-messages";
  const CHAT_INPUT_ID = "loomless-ai-chat-input";
  const CHAT_SEND_ID = "loomless-ai-chat-send";
  let floatingEnabled = false;
  let floatingRequested = false;
  let authenticated = false;
  let profileCompleted = false;
  let chatLoading = false;
  let chatHistory = [];

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
      handleMainButtonClick();
    });

    button.appendChild(icon);
    document.documentElement.appendChild(button);
    return button;
  }

  function removeRadialMenu() {
    document.getElementById(MENU_ID)?.remove();
  }

  function closeAllOverlays() {
    removeRadialMenu();
    document.getElementById(SUMMARY_PANEL_ID)?.remove();
    document.getElementById(WRITE_PANEL_ID)?.remove();
    document.getElementById(CHAT_PANEL_ID)?.remove();
    document.getElementById(TOAST_ID)?.remove();
    document.removeEventListener("mousedown", closeMenuOnOutsideClick, true);
    chatHistory = [];
  }

  function hasOpenOverlay() {
    return Boolean(
      document.getElementById(MENU_ID) ||
        document.getElementById(SUMMARY_PANEL_ID) ||
        document.getElementById(WRITE_PANEL_ID) ||
        document.getElementById(CHAT_PANEL_ID) ||
        document.getElementById(TOAST_ID)
    );
  }

  function handleMainButtonClick() {
    if (hasOpenOverlay()) {
      closeAllOverlays();
      return;
    }
    toggleRadialMenu();
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
    window.setTimeout(() => toast.remove(), 2200);
  }

  function closeMenuOnOutsideClick(event) {
    const button = document.getElementById(BUTTON_ID);
    const menu = document.getElementById(MENU_ID);
    const target = event.target;
    if (button?.contains(target) || menu?.contains(target)) return;
    removeRadialMenu();
    document.removeEventListener("mousedown", closeMenuOnOutsideClick, true);
  }

  function createActionButton({ label, iconName, offsetX, offsetY, onClick }) {
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
    icon.innerHTML = iconHtml(iconName, "floating-action-icon");
    if (!icon.innerHTML) {
      icon.textContent = "*";
      icon.style.fontSize = "14px";
    } else {
      Object.assign(icon.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
      });
    }

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
    const nextState = !floatingRequested;
    chrome.storage.local.set({ [STORAGE_FLOATING_KEY]: nextState });
    setFloatingRequestedState(nextState);
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
        iconName: "summarize",
        offsetX: 0,
        offsetY: 68,
        onClick: async () => {
          removeRadialMenu();
          await runSummarizeFlow();
        },
      },
      {
        label: "Chat",
        iconName: "chat",
        offsetX: -60,
        offsetY: 34,
        onClick: () => {
          openChatPanel();
          removeRadialMenu();
        },
      },
      {
        label: floatingEnabled ? "Disable" : "Enable",
        iconName: floatingEnabled ? "power" : "bolt",
        offsetX: 0,
        offsetY: -68,
        onClick: () => {
          toggleFloatingFromMenu();
          removeRadialMenu();
        },
      },
      {
        label: "Write",
        iconName: "write",
        offsetX: -60,
        offsetY: -34,
        onClick: async () => {
          removeRadialMenu();
          openWritePanel();
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

  async function runSummarizeFlow() {
    closePanelsExcept(SUMMARY_PANEL_ID);
    let summaryPayload = null;
    try {
      summaryPayload = await buildSummaryPayload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not extract readable content.");
      return;
    }

    if (!summaryPayload?.text || summaryPayload.text.length < 200) {
      showToast("Not enough readable text found on this page.");
      return;
    }

    const panel = ensureSummaryPanel();
    setSummaryPanelTitle(summaryPayload.panelTitle);
    setSummaryState({
      status: summaryPayload.loadingStatus || "Summarizing...",
      text: "",
      loading: true,
      error: false,
      copyEnabled: false,
    });

    try {
      await trackUsage("summarize");
      const response = await requestSummary({
        text: summaryPayload.text,
        title: document.title,
        url: window.location.href,
        sourceType: summaryPayload.sourceType,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Failed to summarize this page.");
      }

      setSummaryState({
        status: "Summary ready",
        text: response.summary,
        loading: false,
        error: false,
        copyEnabled: true,
      });

      panel.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    } catch (error) {
      setSummaryState({
        status: "Summarization failed",
        text: error instanceof Error ? error.message : "Unknown error",
        loading: false,
        error: true,
        copyEnabled: false,
      });
    }
  }

  function requestSummary(payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "LOOMLESS_AI_SUMMARIZE", ...payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  function trackUsage(feature) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "LOOMLESS_AI_TRACK_USAGE", feature }, () => {
        resolve();
      });
    });
  }

  function requestWrite(payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "LOOMLESS_AI_WRITE", ...payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  function requestChat(payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "LOOMLESS_AI_CHAT", ...payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  function openWritePanel() {
    closePanelsExcept(WRITE_PANEL_ID);
    const panel = ensureWritePanel();
    panel.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  function openChatPage() {
    try {
      const chatUrl = chrome.runtime.getURL("chat.html");
      window.open(chatUrl, "_blank", "noopener,noreferrer");
    } catch (_error) {
      showToast("Could not open chat page.");
    }
  }

  function openChatPanel() {
    closePanelsExcept(CHAT_PANEL_ID);
    const panel = ensureChatPanel();
    panel.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  function closePanelsExcept(exceptId) {
    [SUMMARY_PANEL_ID, WRITE_PANEL_ID, CHAT_PANEL_ID].forEach((id) => {
      if (id === exceptId) return;
      const panel = document.getElementById(id);
      if (!panel) return;
      if (id === CHAT_PANEL_ID) {
        chatHistory = [];
      }
      panel.remove();
    });
  }

  async function runChatFlow() {
    if (chatLoading) return;

    const input = document.getElementById(CHAT_INPUT_ID);
    const prompt = (input?.value || "").trim();
    if (!prompt) {
      setChatState({
        status: "Type your message first.",
        loading: false,
        error: true,
      });
      return;
    }

    const historyForRequest = chatHistory.slice(-8);
    appendChatMessage({
      role: "user",
      text: prompt,
    });

    if (input) input.value = "";

    setChatState({
      status: "Thinking...",
      loading: true,
      error: false,
    });

    try {
      await trackUsage("chat_toggle");
      const response = await requestChat({
        prompt,
        history: historyForRequest,
        context: extractPageTextForModel().slice(0, 7000),
        title: document.title,
        url: window.location.href,
      });

      if (!response?.ok || !response?.reply) {
        throw new Error(response?.error || "Could not generate a response.");
      }

      const reply = response.reply;
      appendChatMessage({
        role: "assistant",
        text: reply,
      });

      setChatState({
        status: "Ready",
        loading: false,
        error: false,
      });
    } catch (error) {
      setChatState({
        status: "Chat failed",
        loading: false,
        error: true,
      });

      appendChatMessage({
        role: "assistant",
        text: error instanceof Error ? error.message : "Could not generate a response.",
        includeInHistory: false,
      });
    }
  }

  function ensureChatPanel() {
    let panel = document.getElementById(CHAT_PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = CHAT_PANEL_ID;

    Object.assign(panel.style, {
      position: "fixed",
      right: "74px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "360px",
      maxWidth: "min(360px, calc(100vw - 110px))",
      maxHeight: "76vh",
      background: "rgba(7, 14, 30, 0.97)",
      border: "1px solid rgba(118, 166, 255, 0.45)",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(3, 8, 18, 0.55)",
      color: "#eaf1ff",
      zIndex: "2147483646",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(10px)",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "12px 12px 10px",
      borderBottom: "1px solid rgba(118, 166, 255, 0.28)",
    });

    const title = document.createElement("h3");
    title.textContent = "Chat";
    Object.assign(title.style, {
      margin: "0",
      fontSize: "13px",
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      color: "#c7d8ff",
      fontWeight: "700",
    });

    const controls = document.createElement("div");
    Object.assign(controls.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear";
    stylePanelButton(clearBtn);
    clearBtn.addEventListener("click", () => {
      chatHistory = [];
      const messagesNode = document.getElementById(CHAT_MESSAGES_ID);
      if (messagesNode) {
        messagesNode.innerHTML = "";
      }
      appendChatMessage({
        role: "assistant",
        text: "Hey, I am LoomLess AI. Ask anything about this page.",
        includeInHistory: false,
      });
      setChatState({
        status: "Ready",
        loading: false,
        error: false,
      });
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    stylePanelButton(closeBtn);
    closeBtn.addEventListener("click", () => {
      chatHistory = [];
      panel.remove();
    });

    controls.append(clearBtn, closeBtn);
    header.append(title, controls);

    const status = document.createElement("p");
    status.id = CHAT_STATUS_ID;
    status.textContent = "Ready";
    Object.assign(status.style, {
      margin: "0",
      padding: "10px 12px 0",
      fontSize: "12px",
      color: "#9fb5e8",
      fontWeight: "600",
    });

    const messages = document.createElement("div");
    messages.id = CHAT_MESSAGES_ID;
    Object.assign(messages.style, {
      margin: "0",
      padding: "10px 12px 12px",
      overflowY: "scroll",
      scrollbarWidth: "thin",
      scrollbarColor: "#9fb1cc rgba(255, 255, 255, 0.08)",
      minHeight: "180px",
      maxHeight: "34vh",
      display: "grid",
      gap: "8px",
      alignContent: "start",
    });

    const composer = document.createElement("div");
    Object.assign(composer.style, {
      borderTop: "1px solid rgba(118, 166, 255, 0.18)",
      display: "grid",
      gap: "8px",
      padding: "10px 12px 12px",
    });

    const input = document.createElement("textarea");
    input.id = CHAT_INPUT_ID;
    input.placeholder = "Ask anything about this page...";
    Object.assign(input.style, {
      width: "100%",
      minHeight: "56px",
      maxHeight: "140px",
      overflowY: "auto",
      resize: "vertical",
      borderRadius: "10px",
      border: "1px solid rgba(118, 166, 255, 0.35)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "#ecf2ff",
      fontSize: "13px",
      padding: "10px",
      lineHeight: "1.4",
      outline: "none",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      runChatFlow();
    });

    const sendBtn = document.createElement("button");
    sendBtn.id = CHAT_SEND_ID;
    sendBtn.type = "button";
    sendBtn.textContent = "Send";
    stylePanelButton(sendBtn);
    sendBtn.style.justifySelf = "end";
    sendBtn.addEventListener("click", () => {
      runChatFlow();
    });

    composer.append(input, sendBtn);
    panel.append(header, status, messages, composer);
    document.documentElement.appendChild(panel);

    appendChatMessage({
      role: "assistant",
      text: "Hey, I am LoomLess AI. Ask anything about this page.",
      includeInHistory: false,
    });

    return panel;
  }

  function appendChatMessage({ role, text, includeInHistory = true }) {
    const messagesNode = document.getElementById(CHAT_MESSAGES_ID);
    if (!messagesNode) return;

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
    });

    const bubble = document.createElement("div");
    Object.assign(bubble.style, {
      maxWidth: "88%",
      borderRadius: "12px",
      padding: "8px 10px",
      border:
        role === "user"
          ? "1px solid rgba(125, 184, 255, 0.52)"
          : "1px solid rgba(110, 146, 220, 0.34)",
      background:
        role === "user"
          ? "linear-gradient(130deg, rgba(16, 49, 97, 0.95), rgba(18, 70, 131, 0.92))"
          : "rgba(255, 255, 255, 0.04)",
      fontSize: "12.5px",
      color: "#edf3ff",
      lineHeight: "1.5",
    });

    if (role === "assistant") {
      bubble.innerHTML = markdownToHtml(text);
    } else {
      bubble.textContent = text;
    }

    row.appendChild(bubble);
    messagesNode.appendChild(row);
    messagesNode.scrollTop = messagesNode.scrollHeight;

    if (includeInHistory) {
      chatHistory.push({ role, content: text });
      if (chatHistory.length > 16) {
        chatHistory = chatHistory.slice(-16);
      }
    }
  }

  function setChatState({ status, loading, error }) {
    chatLoading = loading;
    const statusNode = document.getElementById(CHAT_STATUS_ID);
    const sendBtn = document.getElementById(CHAT_SEND_ID);

    if (statusNode) {
      statusNode.textContent = status;
      statusNode.style.color = error ? "#ffb7b7" : "#9fb5e8";
    }

    if (sendBtn) {
      sendBtn.disabled = loading;
      sendBtn.style.opacity = loading ? "0.72" : "1";
      sendBtn.style.cursor = loading ? "not-allowed" : "pointer";
      sendBtn.textContent = loading ? "Sending..." : "Send";
    }
  }

  async function runWriteFlow() {
    const promptInput = document.getElementById(WRITE_PROMPT_ID);
    const toneSelect = document.getElementById(WRITE_TONE_ID);
    const formatSelect = document.getElementById(WRITE_FORMAT_ID);

    const prompt = (promptInput?.value || "").trim();
    if (!prompt) {
      setWriteState({
        status: "Please enter what you want to write.",
        output: "",
        loading: false,
        error: true,
        copyEnabled: false,
      });
      return;
    }

    const pageContext = extractPageTextForModel().slice(0, 7000);

    setWriteState({
      status: "Generating draft...",
      output: "",
      loading: true,
      error: false,
      copyEnabled: false,
    });

    try {
      await trackUsage("write_toggle");
      const response = await requestWrite({
        tone: toneSelect?.value || "professional",
        format: formatSelect?.value || "general",
        prompt,
        context: pageContext,
        title: document.title,
        url: window.location.href,
      });

      if (!response?.ok || !response?.content) {
        throw new Error(response?.error || "Could not generate draft.");
      }

      setWriteState({
        status: "Draft ready",
        output: response.content,
        loading: false,
        error: false,
        copyEnabled: true,
      });
    } catch (error) {
      setWriteState({
        status: "Write failed",
        output: error instanceof Error ? error.message : "Unknown error",
        loading: false,
        error: true,
        copyEnabled: false,
      });
    }
  }

  function extractPageTextForModel() {
    const overlayIds = [
      BUTTON_ID,
      MENU_ID,
      TOAST_ID,
      SUMMARY_PANEL_ID,
      WRITE_PANEL_ID,
      CHAT_PANEL_ID,
    ];
    const hiddenNodes = [];

    overlayIds.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;
      hiddenNodes.push([node, node.style.display]);
      node.style.display = "none";
    });

    const text = extractPageText();

    hiddenNodes.forEach(([node, previousDisplay]) => {
      node.style.display = previousDisplay;
    });

    return text;
  }

  function ensureWritePanel() {
    let panel = document.getElementById(WRITE_PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = WRITE_PANEL_ID;

    Object.assign(panel.style, {
      position: "fixed",
      right: "74px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "350px",
      maxWidth: "min(350px, calc(100vw - 110px))",
      maxHeight: "76vh",
      background: "rgba(7, 14, 30, 0.96)",
      border: "1px solid rgba(118, 166, 255, 0.45)",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(3, 8, 18, 0.55)",
      color: "#eaf1ff",
      zIndex: "2147483646",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(10px)",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "12px 12px 10px",
      borderBottom: "1px solid rgba(118, 166, 255, 0.28)",
    });

    const title = document.createElement("h3");
    title.textContent = "Write";
    Object.assign(title.style, {
      margin: "0",
      fontSize: "13px",
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      color: "#c7d8ff",
      fontWeight: "700",
    });

    const controls = document.createElement("div");
    Object.assign(controls.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    });

    const copyBtn = document.createElement("button");
    copyBtn.id = WRITE_COPY_ID;
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.disabled = true;
    stylePanelButton(copyBtn);
    copyBtn.addEventListener("click", async () => {
      const outputNode = document.getElementById(WRITE_OUTPUT_ID);
      const content = outputNode?.dataset?.rawWrite || outputNode?.textContent || "";
      if (!content.trim()) return;
      try {
        await navigator.clipboard.writeText(content);
        showToast("Draft copied");
      } catch (_error) {
        showToast("Could not copy draft");
      }
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    stylePanelButton(closeBtn);
    closeBtn.addEventListener("click", () => {
      panel.remove();
    });

    controls.append(copyBtn, closeBtn);
    header.append(title, controls);

    const status = document.createElement("p");
    status.id = WRITE_STATUS_ID;
    status.textContent = "Set tone, choose format, and generate.";
    Object.assign(status.style, {
      margin: "0",
      padding: "10px 12px 0",
      fontSize: "12px",
      color: "#9fb5e8",
      fontWeight: "600",
    });

    const formWrap = document.createElement("div");
    Object.assign(formWrap.style, {
      display: "grid",
      gap: "10px",
      padding: "10px 12px 8px",
      borderBottom: "1px solid rgba(118, 166, 255, 0.18)",
    });

    const selectors = document.createElement("div");
    Object.assign(selectors.style, {
      display: "grid",
      gap: "8px",
      gridTemplateColumns: "1fr 1fr",
    });

    const toneSelect = document.createElement("select");
    toneSelect.id = WRITE_TONE_ID;
    styleInputControl(toneSelect);
    [
      ["professional", "Professional"],
      ["friendly", "Friendly"],
      ["casual", "Casual"],
      ["confident", "Confident"],
      ["roast", "Roast"],
      ["persuasive", "Persuasive"],
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      toneSelect.appendChild(option);
    });

    const formatSelect = document.createElement("select");
    formatSelect.id = WRITE_FORMAT_ID;
    styleInputControl(formatSelect);
    [
      ["email", "Email"],
      ["x-post", "X Post"],
      ["linkedin-post", "LinkedIn Post"],
      ["message", "Message"],
      ["general", "Something Else"],
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      formatSelect.appendChild(option);
    });

    selectors.append(toneSelect, formatSelect);

    const promptInput = document.createElement("textarea");
    promptInput.id = WRITE_PROMPT_ID;
    promptInput.placeholder =
      "Example: Write an email to recruiter about interview reschedule. Keep it polite and concise.";
    Object.assign(promptInput.style, {
      width: "100%",
      minHeight: "76px",
      maxHeight: "140px",
      overflowY: "auto",
      resize: "vertical",
      borderRadius: "10px",
      border: "1px solid rgba(118, 166, 255, 0.35)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "#ecf2ff",
      fontSize: "13px",
      padding: "10px",
      lineHeight: "1.4",
      outline: "none",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });
    promptInput.addEventListener("keydown", (event) => {
      const isEnter = event.key === "Enter";
      const withModifier = event.metaKey || event.ctrlKey;
      if (!isEnter || !withModifier) return;
      event.preventDefault();
      runWriteFlow();
    });

    const actionRow = document.createElement("div");
    Object.assign(actionRow.style, {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear";
    stylePanelButton(clearBtn);
    clearBtn.addEventListener("click", () => {
      promptInput.value = "";
      setWriteState({
        status: "Set tone, choose format, and generate.",
        output: "",
        loading: false,
        error: false,
        copyEnabled: false,
      });
    });

    const generateBtn = document.createElement("button");
    generateBtn.id = WRITE_GENERATE_ID;
    generateBtn.type = "button";
    generateBtn.textContent = "Generate";
    stylePanelButton(generateBtn);
    generateBtn.addEventListener("click", () => {
      runWriteFlow();
    });

    actionRow.append(clearBtn, generateBtn);
    formWrap.append(selectors, promptInput, actionRow);

    const output = document.createElement("div");
    output.id = WRITE_OUTPUT_ID;
    Object.assign(output.style, {
      margin: "0",
      padding: "10px 12px 14px",
      overflowY: "scroll",
      scrollbarWidth: "thin",
      scrollbarColor: "#9fb1cc rgba(255, 255, 255, 0.08)",
      fontSize: "13px",
      lineHeight: "1.5",
      color: "#edf3ff",
      minHeight: "110px",
      maxHeight: "32vh",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });
    output.textContent = "Your generated draft will appear here.";

    panel.append(header, status, formWrap, output);
    document.documentElement.appendChild(panel);
    return panel;
  }

  function setWriteState({ status, output, loading, error, copyEnabled }) {
    ensureWritePanel();
    const statusNode = document.getElementById(WRITE_STATUS_ID);
    const outputNode = document.getElementById(WRITE_OUTPUT_ID);
    const copyBtn = document.getElementById(WRITE_COPY_ID);
    const generateBtn = document.getElementById(WRITE_GENERATE_ID);

    if (statusNode) {
      statusNode.textContent = status;
      statusNode.style.color = error ? "#ffb7b7" : "#9fb5e8";
    }

    if (outputNode) {
      if (loading) {
        outputNode.textContent = "Generating draft...";
      } else if (error) {
        outputNode.textContent = output;
      } else if (output) {
        outputNode.innerHTML = markdownToHtml(output);
      } else {
        outputNode.textContent = "Your generated draft will appear here.";
      }
      outputNode.dataset.rawWrite = loading ? "" : output;
      outputNode.style.opacity = loading ? "0.85" : "1";
    }

    if (copyBtn) {
      copyBtn.disabled = !copyEnabled;
      copyBtn.style.opacity = copyEnabled ? "1" : "0.55";
      copyBtn.style.cursor = copyEnabled ? "pointer" : "not-allowed";
    }

    if (generateBtn) {
      generateBtn.disabled = loading;
      generateBtn.style.opacity = loading ? "0.72" : "1";
      generateBtn.style.cursor = loading ? "not-allowed" : "pointer";
      generateBtn.textContent = loading ? "Generating..." : "Generate";
    }
  }

  function normalizeText(text) {
    if (!text) return "";
    const lines = text
      .replace(/\t+/g, " ")
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const deduped = [];
    for (const line of lines) {
      if (line.length < 2) continue;
      if (deduped[deduped.length - 1] === line) continue;
      deduped.push(line);
    }

    return deduped.join("\n").slice(0, 22000);
  }

  function getHostname() {
    return String(window.location.hostname || "").toLowerCase();
  }

  function isYouTubeVideoPage() {
    const host = getHostname();
    if (!(host.includes("youtube.com") || host === "youtu.be" || host.endsWith(".youtu.be"))) return false;
    return Boolean(
      document.querySelector("video") ||
        window.location.pathname.startsWith("/watch") ||
        window.location.pathname.startsWith("/shorts/") ||
        window.location.pathname.startsWith("/live/") ||
        window.location.search.includes("v=")
    );
  }

  function isOdyseeVideoPage() {
    return getHostname().includes("odysee.com") && Boolean(document.querySelector("video"));
  }

  function isDailymotionVideoPage() {
    const host = getHostname();
    return host.includes("dailymotion.com") && Boolean(document.querySelector("video") || window.location.pathname.includes("/video/"));
  }

  function shouldPreferVideoSummary() {
    return isYouTubeVideoPage() || isOdyseeVideoPage() || isDailymotionVideoPage();
  }

  function extractYouTubeTranscript() {
    if (!window.location.hostname.includes("youtube.com")) return "";

    const transcriptNodes = document.querySelectorAll(
      "ytd-transcript-segment-renderer .segment-text, ytd-engagement-panel-section-list-renderer .segment-text"
    );

    if (!transcriptNodes.length) return "";

    const transcript = Array.from(transcriptNodes)
      .map((node) => node.textContent || "")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");

    return normalizeText(transcript);
  }

  function parseJsonAssignmentFromScripts(variableName) {
    const scripts = Array.from(document.scripts || []);
    for (const script of scripts) {
      const text = script.textContent || "";
      if (!text.includes(variableName)) continue;

      const assignedObject = extractAssignedObjectLiteral(text, variableName);
      if (!assignedObject) continue;
      try {
        return JSON.parse(assignedObject);
      } catch (_error) {
        // Ignore malformed script blobs.
      }
    }
    return null;
  }

  function extractAssignedObjectLiteral(sourceText, variableName) {
    const source = String(sourceText || "");
    const markerIndex = source.indexOf(variableName);
    if (markerIndex === -1) return "";

    const equalsIndex = source.indexOf("=", markerIndex);
    if (equalsIndex === -1) return "";

    const objectStart = source.indexOf("{", equalsIndex);
    if (objectStart === -1) return "";

    let depth = 0;
    let inString = false;
    let stringQuote = "";
    let escaped = false;

    for (let index = objectStart; index < source.length; index += 1) {
      const char = source[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === stringQuote) {
          inString = false;
          stringQuote = "";
        }
        continue;
      }

      if (char === "\"" || char === "'") {
        inString = true;
        stringQuote = char;
        continue;
      }

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return source.slice(objectStart, index + 1);
        }
      }
    }

    return "";
  }

  function getYouTubePlayerResponse() {
    const direct = window.ytInitialPlayerResponse;
    if (direct && typeof direct === "object") {
      return direct;
    }
    return parseJsonAssignmentFromScripts("ytInitialPlayerResponse");
  }

  function buildCaptionTrackScore({ languageCode, label, isDefault }) {
    let score = 0;
    const cleanLang = String(languageCode || "").toLowerCase();
    const cleanLabel = String(label || "").toLowerCase();
    if (isDefault) score += 30;
    if (cleanLang === "en" || cleanLang.startsWith("en-")) score += 20;
    if (cleanLabel.includes("english")) score += 10;
    if (cleanLabel.includes("auto")) score -= 2;
    return score;
  }

  function collectYouTubeCaptionTracks() {
    const playerResponse = getYouTubePlayerResponse();
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(captionTracks)) return [];

    return captionTracks
      .map((track) => {
        const rawUrl = typeof track?.baseUrl === "string" ? track.baseUrl.trim() : "";
        if (!rawUrl) return null;

        let nextUrl = rawUrl;
        try {
          const url = new URL(rawUrl);
          if (!url.searchParams.get("fmt")) {
            url.searchParams.set("fmt", "json3");
          }
          nextUrl = url.toString();
        } catch (_error) {
          nextUrl = rawUrl;
        }

        return {
          url: nextUrl,
          languageCode: String(track?.languageCode || "").trim().toLowerCase(),
          label: String(track?.name?.simpleText || "").trim(),
          score: buildCaptionTrackScore({
            languageCode: track?.languageCode || "",
            label: track?.name?.simpleText || "",
            isDefault: track?.isDefault === true,
          }),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  }

  function collectDomCaptionTracks() {
    const tracks = [];
    document.querySelectorAll("track[src]").forEach((node) => {
      const kind = String(node.getAttribute("kind") || "").toLowerCase();
      if (kind && kind !== "captions" && kind !== "subtitles") return;

      const rawSrc = String(node.getAttribute("src") || "").trim();
      if (!rawSrc) return;

      let url = rawSrc;
      try {
        url = new URL(rawSrc, window.location.href).toString();
      } catch (_error) {
        url = rawSrc;
      }

      tracks.push({
        url,
        languageCode: String(node.getAttribute("srclang") || "").trim().toLowerCase(),
        label: String(node.getAttribute("label") || "").trim(),
        score: buildCaptionTrackScore({
          languageCode: node.getAttribute("srclang") || "",
          label: node.getAttribute("label") || "",
          isDefault: node.hasAttribute("default"),
        }),
      });
    });

    return tracks.sort((a, b) => b.score - a.score);
  }

  function extractLoadedTextTrackText() {
    const parts = [];
    const videos = Array.from(document.querySelectorAll("video"));

    videos.forEach((video) => {
      const textTracks = Array.from(video.textTracks || []);
      textTracks.forEach((track) => {
        const kind = String(track?.kind || "").toLowerCase();
        if (kind && kind !== "captions" && kind !== "subtitles") return;

        try {
          if (track.mode === "disabled") {
            track.mode = "hidden";
          }
        } catch (_error) {
          // Some players lock text track mode.
        }

        Array.from(track?.cues || []).forEach((cue) => {
          const text = typeof cue?.text === "string" ? cue.text : "";
          if (text) {
            parts.push(text);
          }
        });
      });
    });

    return normalizeText(parts.join("\n"));
  }

  async function fetchCaptionTrackText(url) {
    if (!url) return "";

    try {
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) return "";
      return parseCaptionPayload(await response.text());
    } catch (_error) {
      return "";
    }
  }

  function parseCaptionPayload(rawText) {
    const source = String(rawText || "").trim();
    if (!source) return "";
    if (source.startsWith("{") || source.startsWith("[")) {
      return parseJsonCaptionPayload(source);
    }
    if (source.startsWith("<")) {
      return parseXmlCaptionPayload(source);
    }
    return parseSubtitleTextPayload(source);
  }

  function parseJsonCaptionPayload(rawText) {
    try {
      const parsed = JSON.parse(rawText);
      const events = Array.isArray(parsed?.events) ? parsed.events : Array.isArray(parsed) ? parsed : [];
      const lines = [];

      events.forEach((event) => {
        const segments = Array.isArray(event?.segs) ? event.segs : [];
        const line = segments
          .map((segment) => String(segment?.utf8 || ""))
          .join("")
          .replace(/\s+/g, " ")
          .trim();
        if (line) {
          lines.push(line);
        }
      });

      return normalizeText(lines.join("\n"));
    } catch (_error) {
      return "";
    }
  }

  function parseXmlCaptionPayload(rawText) {
    try {
      const xml = new DOMParser().parseFromString(rawText, "text/xml");
      if (xml.querySelector("parsererror")) {
        return parseSubtitleTextPayload(rawText);
      }

      const text = Array.from(xml.querySelectorAll("text, p, span"))
        .map((node) => node.textContent || "")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join("\n");

      return normalizeText(text);
    } catch (_error) {
      return "";
    }
  }

  function parseSubtitleTextPayload(rawText) {
    return normalizeText(
      String(rawText || "")
        .replace(/^WEBVTT[^\n]*\n?/i, "")
        .replace(/^NOTE[^\n]*(?:\n(?!\n).*)*/gim, "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => {
          if (!line) return false;
          if (/^\d+$/.test(line)) return false;
          if (/^\d{1,2}:\d{2}(?::\d{2})?[\.,]\d{3}\s*-->\s*\d{1,2}:\d{2}(?::\d{2})?[\.,]\d{3}/.test(line)) {
            return false;
          }
          if (/^(kind|language|style|region):/i.test(line)) return false;
          return true;
        })
        .join("\n")
    );
  }

  function extractVisibleTranscriptText() {
    const selectors = [
      "[data-testid*='transcript']",
      "[class*='transcript']",
      "[id*='transcript']",
      "[class*='caption'] [class*='cue']",
      "[class*='subtitle'] [class*='cue']",
    ];

    let bestText = "";
    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      const text = normalizeText(element.innerText || "");
      if (text.length > bestText.length) {
        bestText = text;
      }
    });

    return bestText;
  }

  async function extractVideoText() {
    const youtubeTranscript = extractYouTubeTranscript();
    if (youtubeTranscript.length > 300) {
      return youtubeTranscript;
    }

    const loadedTrackText = extractLoadedTextTrackText();
    if (loadedTrackText.length > 300) {
      return loadedTrackText;
    }

    const captionTracks = [...collectYouTubeCaptionTracks(), ...collectDomCaptionTracks()];
    const seenUrls = new Set();
    for (const track of captionTracks) {
      if (!track?.url || seenUrls.has(track.url)) continue;
      seenUrls.add(track.url);
      const trackText = await fetchCaptionTrackText(track.url);
      if (trackText.length > 300) {
        return trackText;
      }
    }

    const visibleTranscript = extractVisibleTranscriptText();
    if (visibleTranscript.length > 300) {
      return visibleTranscript;
    }

    return "";
  }

  function extractMainDocumentText() {
    const selectors = [
      "article",
      "main",
      "[role='main']",
      ".article-content",
      ".post-content",
      "#content",
      ".content",
      ".markdown-body",
    ];

    let bestText = "";
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const text = normalizeText(element.innerText || "");
        if (text.length > bestText.length) {
          bestText = text;
        }
      });
    });

    if (bestText.length > 500) {
      return bestText;
    }

    return normalizeText(document.body?.innerText || "");
  }

  function extractPageText() {
    const pageText = extractMainDocumentText();
    return pageText.slice(0, 22000);
  }

  async function buildSummaryPayload() {
    if (shouldPreferVideoSummary()) {
      const videoText = await extractVideoText();
      if (videoText.length >= 200) {
        return {
          text: `Video transcript\n\n${videoText}`.slice(0, 22000),
          sourceType: "video",
          panelTitle: "Video Summary",
          loadingStatus: "Summarizing video...",
        };
      }

      const pageText = extractPageText();
      if (pageText.length < 200) {
        throw new Error(
          "No usable transcript, captions, or page details were found for this video."
        );
      }

      return {
        text: `Video page details\n\n${pageText}`.slice(0, 22000),
        sourceType: "video-fallback",
        panelTitle: "Video Summary",
        loadingStatus: "No transcript found. Using page details...",
      };
    }

    return {
      text: extractPageText(),
      sourceType: "page",
      panelTitle: "Page Summary",
      loadingStatus: "Summarizing...",
    };
  }

  function ensureSummaryPanel() {
    let panel = document.getElementById(SUMMARY_PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = SUMMARY_PANEL_ID;

    Object.assign(panel.style, {
      position: "fixed",
      right: "74px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "332px",
      maxWidth: "min(332px, calc(100vw - 110px))",
      maxHeight: "74vh",
      background: "rgba(7, 14, 30, 0.96)",
      border: "1px solid rgba(118, 166, 255, 0.45)",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(3, 8, 18, 0.55)",
      color: "#eaf1ff",
      zIndex: "2147483646",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(10px)",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "12px 12px 10px",
      borderBottom: "1px solid rgba(118, 166, 255, 0.28)",
    });

    const title = document.createElement("h3");
    title.id = SUMMARY_TITLE_ID;
    title.textContent = "Page Summary";
    Object.assign(title.style, {
      margin: "0",
      fontSize: "13px",
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      color: "#c7d8ff",
      fontWeight: "700",
    });

    const controls = document.createElement("div");
    Object.assign(controls.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    });

    const copyBtn = document.createElement("button");
    copyBtn.id = SUMMARY_COPY_ID;
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.disabled = true;
    stylePanelButton(copyBtn);
    copyBtn.addEventListener("click", async () => {
      const textNode = document.getElementById(SUMMARY_TEXT_ID);
      const content = textNode?.dataset?.rawSummary || textNode?.textContent || "";
      if (!content.trim()) return;
      try {
        await navigator.clipboard.writeText(content);
        showToast("Summary copied");
      } catch (_error) {
        showToast("Could not copy summary");
      }
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    stylePanelButton(closeBtn);
    closeBtn.addEventListener("click", () => {
      panel.remove();
    });

    controls.append(copyBtn, closeBtn);
    header.append(title, controls);

    const status = document.createElement("p");
    status.id = SUMMARY_STATUS_ID;
    status.textContent = "Preparing summary...";
    Object.assign(status.style, {
      margin: "0",
      padding: "10px 12px 0",
      fontSize: "12px",
      color: "#9fb5e8",
      fontWeight: "600",
    });

    const content = document.createElement("div");
    content.id = SUMMARY_TEXT_ID;
    Object.assign(content.style, {
      margin: "0",
      padding: "10px 12px 14px",
      overflowY: "scroll",
      scrollbarWidth: "thin",
      scrollbarColor: "#9fb1cc rgba(255, 255, 255, 0.08)",
      fontSize: "13px",
      lineHeight: "1.5",
      color: "#edf3ff",
      minHeight: "120px",
      maxHeight: "46vh",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });

    content.addEventListener("mouseenter", () => {
      content.style.overflowY = "auto";
    });

    panel.append(header, status, content);
    document.documentElement.appendChild(panel);
    return panel;
  }

  function setSummaryPanelTitle(value) {
    ensureSummaryPanel();
    const titleNode = document.getElementById(SUMMARY_TITLE_ID);
    if (titleNode) {
      titleNode.textContent = value || "Page Summary";
    }
  }

  function stylePanelButton(button) {
    Object.assign(button.style, {
      border: "1px solid rgba(118, 166, 255, 0.44)",
      borderRadius: "999px",
      padding: "4px 8px",
      background: "rgba(118, 166, 255, 0.14)",
      color: "#deebff",
      fontSize: "11px",
      fontWeight: "700",
      cursor: "pointer",
    });
  }

  function styleInputControl(element) {
    Object.assign(element.style, {
      width: "100%",
      borderRadius: "10px",
      border: "1px solid rgba(118, 166, 255, 0.35)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "#ecf2ff",
      fontSize: "13px",
      padding: "8px 10px",
      lineHeight: "1.3",
      outline: "none",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    });
  }

  function setSummaryState({ status, text, loading, error, copyEnabled }) {
    ensureSummaryPanel();
    const statusNode = document.getElementById(SUMMARY_STATUS_ID);
    const textNode = document.getElementById(SUMMARY_TEXT_ID);
    const copyBtn = document.getElementById(SUMMARY_COPY_ID);

    if (statusNode) {
      statusNode.textContent = status;
      statusNode.style.color = error ? "#ffb7b7" : "#9fb5e8";
    }

    if (textNode) {
      if (loading) {
        textNode.textContent = "Generating summary...";
      } else if (error) {
        textNode.textContent = text;
      } else {
        textNode.innerHTML = markdownToHtml(text);
      }
      textNode.dataset.rawSummary = loading ? "" : text;
      textNode.style.opacity = loading ? "0.85" : "1";
    }

    if (copyBtn) {
      copyBtn.disabled = !copyEnabled;
      copyBtn.style.opacity = copyEnabled ? "1" : "0.55";
      copyBtn.style.cursor = copyEnabled ? "pointer" : "not-allowed";
    }
  }

  function markdownToHtml(markdownText) {
    if (!markdownText) return "";

    const lines = markdownText.replace(/\r/g, "").split("\n");
    const html = [];
    let listType = null;

    const closeList = () => {
      if (!listType) return;
      html.push(listType === "ol" ? "</ol>" : "</ul>");
      listType = null;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        closeList();
        return;
      }

      if (trimmed.startsWith("### ")) {
        closeList();
        html.push(`<h3 style="margin: 8px 0 6px; font-size: 14px; color: #d8e6ff;">${formatInlineMarkdown(trimmed.slice(4))}</h3>`);
        return;
      }

      if (trimmed.startsWith("## ")) {
        closeList();
        html.push(`<h2 style="margin: 10px 0 6px; font-size: 15px; color: #e2eeff;">${formatInlineMarkdown(trimmed.slice(3))}</h2>`);
        return;
      }

      const unorderedMatch = /^[-*]\s+(.+)$/.exec(trimmed);
      if (unorderedMatch) {
        if (listType !== "ul") {
          closeList();
          html.push('<ul style="margin: 6px 0 8px 18px; padding: 0; display: grid; gap: 4px;">');
          listType = "ul";
        }
        html.push(`<li>${formatInlineMarkdown(unorderedMatch[1])}</li>`);
        return;
      }

      const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
      if (orderedMatch) {
        if (listType !== "ol") {
          closeList();
          html.push('<ol style="margin: 6px 0 8px 18px; padding: 0; display: grid; gap: 4px;">');
          listType = "ol";
        }
        html.push(`<li>${formatInlineMarkdown(orderedMatch[1])}</li>`);
        return;
      }

      closeList();
      html.push(`<p style="margin: 0 0 8px;">${formatInlineMarkdown(trimmed)}</p>`);
    });

    closeList();
    return html.join("");
  }

  function formatInlineMarkdown(value) {
    const escaped = escapeHtml(value);
    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code style=\"padding: 1px 4px; border-radius: 5px; background: rgba(255,255,255,0.08);\">$1</code>");
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function removeFloatingButton() {
    document.getElementById(BUTTON_ID)?.remove();
    closeAllOverlays();
  }

  function hasValidAuthSession(raw) {
    return Boolean(raw && typeof raw === "object" && raw.accessToken && raw.userId);
  }

  function applyFloatingState() {
    const nextEnabled = floatingRequested && authenticated && profileCompleted;
    floatingEnabled = nextEnabled;
    if (nextEnabled) {
      createFloatingButton();
      return;
    }
    removeFloatingButton();
  }

  function setFloatingRequestedState(enabled) {
    floatingRequested = Boolean(enabled);
    applyFloatingState();
  }

  function setAuthState(rawSession) {
    authenticated = hasValidAuthSession(rawSession);
    applyFloatingState();
  }

  function setProfileState(nextValue) {
    profileCompleted = nextValue === true;
    applyFloatingState();
  }

  chrome.storage.local.get([STORAGE_FLOATING_KEY, STORAGE_AUTH_SESSION, STORAGE_PROFILE_COMPLETED], (result) => {
    floatingRequested = Boolean(result[STORAGE_FLOATING_KEY]);
    authenticated = hasValidAuthSession(result[STORAGE_AUTH_SESSION]);
    profileCompleted = result[STORAGE_PROFILE_COMPLETED] === true;
    applyFloatingState();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (STORAGE_FLOATING_KEY in changes) {
      setFloatingRequestedState(Boolean(changes[STORAGE_FLOATING_KEY].newValue));
    }
    if (STORAGE_AUTH_SESSION in changes) {
      setAuthState(changes[STORAGE_AUTH_SESSION].newValue);
    }
    if (STORAGE_PROFILE_COMPLETED in changes) {
      setProfileState(changes[STORAGE_PROFILE_COMPLETED].newValue);
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "LOOMLESS_AI_SET_FLOATING") return;
    setFloatingRequestedState(Boolean(message.enabled));
  });
})();
