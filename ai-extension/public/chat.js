const messagesNode = document.getElementById("chat-messages");
const inputNode = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-chat-btn");
const copyLastBtn = document.getElementById("copy-last-btn");
const statusNode = document.getElementById("chat-status");
const quickChips = Array.from(document.querySelectorAll(".quick-chip"));

let sending = false;
let lastAssistantMessage = "";
copyLastBtn.disabled = true;

appendMessage({
  role: "assistant",
  text: "Welcome to LoomLess AI.\n\nUse this as your general chat space for ideas, research-style prompts, and drafting help.",
});

quickChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    inputNode.value = chip.dataset.prompt || "";
    inputNode.focus();
  });
});

sendBtn.addEventListener("click", () => {
  runSend();
});

clearBtn.addEventListener("click", () => {
  messagesNode.innerHTML = "";
  lastAssistantMessage = "";
  copyLastBtn.disabled = true;
  setStatus("Ready");
  appendMessage({
    role: "assistant",
    text: "Chat cleared.\n\nAsk anything and I will help you think and draft faster.",
  });
});

copyLastBtn.addEventListener("click", async () => {
  if (!lastAssistantMessage.trim()) return;
  try {
    await navigator.clipboard.writeText(lastAssistantMessage);
    setStatus("Last reply copied.");
  } catch (_error) {
    setStatus("Could not copy. Please try again.");
  }
});

inputNode.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (!(event.metaKey || event.ctrlKey)) return;
  event.preventDefault();
  runSend();
});

async function runSend() {
  if (sending) return;

  const text = (inputNode.value || "").trim();
  if (!text) {
    setStatus("Type a message first.");
    return;
  }

  appendMessage({ role: "user", text });
  inputNode.value = "";
  setSending(true);
  setStatus("Thinking...");

  try {
    await delay(340);
    const reply = createPreviewReply(text);
    appendMessage({ role: "assistant", text: reply });
    lastAssistantMessage = reply;
    copyLastBtn.disabled = false;
    setStatus("Ready");
  } catch (_error) {
    appendMessage({
      role: "assistant",
      text: "Something went wrong while generating a response.",
    });
    setStatus("Response failed.");
  } finally {
    setSending(false);
  }
}

function setSending(next) {
  sending = next;
  sendBtn.disabled = next;
  sendBtn.textContent = next ? "Sending..." : "Send";
}

function setStatus(value) {
  statusNode.textContent = value;
}

function createPreviewReply(message) {
  const prompt = message.toLowerCase();

  if (prompt.includes("news") || prompt.includes("update") || prompt.includes("trending")) {
    return [
      "### Trending Prompt Idea",
      "- ✅ Ask for a category first: AI, startups, dev tools, or finance.",
      "- ✅ Then ask for top headlines, key impact, and what to watch next.",
      "- ✅ Keep outputs short with bullets for faster scanning.",
      "",
      "Try: `Give me top AI updates with one-line impact each.`",
    ].join("\n");
  }

  if (
    prompt.includes("write") ||
    prompt.includes("email") ||
    prompt.includes("linkedin") ||
    prompt.includes("x post") ||
    prompt.includes("post") ||
    prompt.includes("reply")
  ) {
    return [
      "### Writing Help",
      "- ✍️ I can draft email, X post, LinkedIn post, or short message.",
      "- 🎯 Tell me tone, audience, and desired length.",
      "- 🧩 If needed, ask for 2-3 versions and pick one.",
      "",
      "Tip: Use the radial `Write` action for direct write mode.",
    ].join("\n");
  }

  return [
    "I can help with:",
    "- 🔹 research-style prompts",
    "- 🔹 idea brainstorming",
    "- 🔹 polished writing drafts",
    "",
    "Tell me your goal and I will structure the response.",
  ].join("\n");
}

function appendMessage({ role, text }) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble";
  bubble.innerHTML = markdownToHtml(text);

  row.appendChild(bubble);
  messagesNode.appendChild(row);
  messagesNode.scrollTop = messagesNode.scrollHeight;
}

function markdownToHtml(markdownText) {
  const lines = String(markdownText || "").replace(/\r/g, "").split("\n");
  const html = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("### ")) {
      html.push(`<p><strong>${escapeHtml(trimmed.slice(4))}</strong></p>`);
      return;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      html.push(`<p>${escapeHtml(`• ${listMatch[1]}`)}</p>`);
      return;
    }

    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  return html.join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
