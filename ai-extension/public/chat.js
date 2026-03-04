const STORAGE_SELECTED_MODEL = "loomless_ai_chat_page_model";

const MODEL_OPTIONS = [
  {
    provider: "Minimaxai",
    name: "minimax-m2.5",
    apiModel: "minimaxai/minimax-m2.5",
    desc: "MiniMax M2.5 is a 230B-parameter text-to-text model for coding, reasoning, and office tasks.",
    tags: ["coding", "+3"],
    age: "5d",
    icon: "minimax.png",
  },
  {
    provider: "Qwen",
    name: "qwen3.5-397b-a17b",
    apiModel: "qwen/qwen3.5-397b-a17b",
    desc: "Qwen 3.5 VLM MoE model with advanced vision, chat, RAG, and agentic capabilities.",
    tags: ["moe", "+4"],
    age: "2w",
    icon: "qwen.png",
  },
  {
    provider: "Z.ai",
    name: "glm5",
    apiModel: "zai/glm5",
    desc: "GLM-5 MoE model focused on efficient reasoning for complex, long-horizon tasks.",
    tags: ["moe", "+3"],
    age: "2w",
    icon: "zai.png",
  },
  {
    provider: "Minimaxai",
    name: "minimax-m2.1",
    apiModel: "minimaxai/minimax-m2.1",
    desc: "MiniMax M2.1 for multilingual coding, web/app workflows, office AI, and agent integrations.",
    tags: ["agentic", "+3"],
    age: "4w",
    icon: "minimax.png",
  },
  {
    provider: "Moonshotai",
    name: "kimi-k2.5",
    apiModel: "moonshotai/kimi-k2.5",
    desc: "High-capacity multimodal MoE for video and image understanding with efficient inference.",
    tags: ["multimodal", "+4"],
    age: "1mo",
    icon: "kimi.png",
  },
  {
    provider: "Stepfun-ai",
    name: "step-3.5-flash",
    apiModel: "stepfun-ai/step-3.5-flash",
    desc: "Open-source sparse MoE reasoning engine tuned for frontier agentic use-cases.",
    tags: ["agentic", "+3"],
    age: "1mo",
    icon: "stepfun.png",
  },
  {
    provider: "Z.ai",
    name: "glm4.7",
    apiModel: "zai/glm4.7",
    desc: "Multilingual agentic coding partner with stronger reasoning, tool use, and UI skills.",
    tags: ["tool calling", "+4"],
    age: "1mo",
    icon: "zai.png",
  },
  {
    provider: "DeepSeek AI",
    name: "deepseek-v3.2",
    apiModel: "deepseek/deepseek-v3.2",
    desc: "State-of-the-art sparse-attention reasoning model with long context and integrated tools.",
    tags: ["long context", "+3"],
    age: "2mo",
    icon: "deepseek.png",
  },
  {
    provider: "NVIDIA",
    name: "nemotron-3-nano-30b-a3b",
    apiModel: "nvidia/nemotron-3-nano-30b-a3b",
    desc: "Efficient MoE model with 1M context, strong instruction-following, and tool calling.",
    tags: ["moe", "+4"],
    age: "2mo",
    icon: "nvidia.png",
  },
  {
    provider: "Mistral AI",
    name: "devstral-2-123b-instruct-2512",
    apiModel: "mistralai/devstral-2-123b-instruct-2512",
    desc: "Code-heavy instruct model with deep reasoning, long context, and strong efficiency.",
    tags: ["coding", "+4"],
    age: "2mo",
    icon: "mistral.png",
  },
  {
    provider: "Mistral AI",
    name: "mistral-large-3-675b-instruct-2512",
    apiModel: "mistralai/mistral-large-3-675b-instruct-2512",
    desc: "General-purpose MoE model tuned for chat, agentic, and instruction-driven generation.",
    tags: ["language generation", "+4"],
    age: "3mo",
    icon: "mistral.png",
  },
  {
    provider: "Meta",
    name: "llama-3.1-70b-instruct",
    apiModel: "meta/llama-3.1-70b-instruct",
    desc: "High-quality model for complex conversations with strong reasoning and context handling.",
    tags: ["chat", "+3"],
    age: "8mo",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama-3.1-8b-instruct",
    apiModel: "meta/llama-3.1-8b-instruct",
    desc: "Fast and lightweight chat model with balanced quality for everyday conversations.",
    tags: ["chat", "+4"],
    age: "7mo",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama3-70b-instruct",
    apiModel: "meta/llama3-70b-instruct",
    desc: "Large general chat model for richer answers and broader contextual understanding.",
    tags: ["chat", "+4"],
    age: "9mo",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama3-8b-instruct",
    apiModel: "meta/llama3-8b-instruct",
    desc: "Compact Llama3 model for faster responses and lower-latency interactions.",
    tags: ["chat", "+4"],
    age: "9mo",
    icon: "meta.png",
  },
  {
    provider: "Microsoft",
    name: "phi-4-mini-instruct",
    apiModel: "microsoft/phi-4-mini-instruct",
    desc: "Lightweight multilingual LLM for low-latency AI apps in memory and compute constrained environments.",
    tags: ["chat", "+3"],
    age: "9mo",
    icon: "microsoft.png",
  },
  {
    provider: "OpenAI",
    name: "gpt-oss-20b",
    apiModel: "openai/gpt-oss-20b",
    desc: "Smaller MoE text model optimized for efficient reasoning and math workflows.",
    tags: ["text-to-text", "+3"],
    age: "7mo",
    icon: "openai.png",
  },
  {
    provider: "OpenAI",
    name: "gpt-oss-120b",
    apiModel: "openai/gpt-oss-120b",
    desc: "Larger MoE reasoning model designed for stronger depth and broader capability.",
    tags: ["text-to-text", "+3"],
    age: "7mo",
    icon: "openai.png",
  },
];

const SHORT_MODEL_DESCRIPTIONS = {
  "minimaxai/minimax-m2.5": "Strong all-round model for chat, coding, and reasoning.",
  "qwen/qwen3.5-397b-a17b": "Advanced MoE model for rich chat and complex tasks.",
  "zai/glm5": "Efficient reasoning model for long and structured prompts.",
  "minimaxai/minimax-m2.1": "Lightweight multilingual model for daily productivity use.",
  "moonshotai/kimi-k2.5": "Multimodal model tuned for image and video understanding.",
  "stepfun-ai/step-3.5-flash": "Fast open model for low-latency agentic interactions.",
  "zai/glm4.7": "Reliable coding and tool-use model for practical workflows.",
  "deepseek/deepseek-v3.2": "High-context reasoning model for deep technical queries.",
  "nvidia/nemotron-3-nano-30b-a3b": "Balanced speed and quality with strong instruction following.",
  "mistralai/devstral-2-123b-instruct-2512": "Code-first instruct model for developer-heavy tasks.",
  "mistralai/mistral-large-3-675b-instruct-2512": "Premium large model for high-quality long-form output.",
  "meta/llama-3.1-70b-instruct": "Powerful Llama model for detailed and accurate chat.",
  "meta/llama-3.1-8b-instruct": "Fast Llama model for quick and lightweight conversations.",
  "meta/llama3-70b-instruct": "Large conversational model for nuanced responses.",
  "meta/llama3-8b-instruct": "Compact conversational model optimized for speed.",
  "microsoft/phi-4-mini-instruct": "Small, low-latency model for concise everyday assistance.",
  "openai/gpt-oss-20b": "Efficient open model for reasoning and general tasks.",
  "openai/gpt-oss-120b": "High-capability open model for advanced reasoning output.",
};

const modelListNode = document.getElementById("model-list");
const activeModelNode = document.getElementById("active-model-text");
const missingIconsNode = document.getElementById("missing-icons");
const modelPickerBtn = document.getElementById("model-picker-btn");
const activeModelIconNode = document.getElementById("active-model-icon");
const modelPickerLabelNode = document.getElementById("model-picker-label");
const modelPickerPopover = document.getElementById("model-picker-popover");
const messagesNode = document.getElementById("chat-messages");
const inputNode = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const statusNode = document.getElementById("chat-status");
const INPUT_MIN_HEIGHT = 42;
const INPUT_MAX_HEIGHT = 140;

let sending = false;
let chatHistory = [];
const missingIcons = new Set();
let selectedModel = loadSelectedModel();

modelPickerBtn.setAttribute("aria-expanded", "false");

renderModelCards();
syncActiveModelUI();
appendMessage({
  role: "assistant",
  text: "Hey 👋 I am LoomLess GPT. Ask anything.",
  includeInHistory: false,
});

sendBtn.addEventListener("click", () => {
  runSend();
});

inputNode.addEventListener("input", () => {
  autoResizeInput();
});

modelPickerBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleModelPicker();
});

document.addEventListener("click", (event) => {
  if (modelPickerPopover.hidden) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (modelPickerPopover.contains(target) || modelPickerBtn.contains(target)) return;
  closeModelPicker();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modelPickerPopover.hidden) {
    closeModelPicker();
  }
});

inputNode.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  runSend();
});
autoResizeInput();

async function runSend() {
  if (sending) return;

  const text = (inputNode.value || "").trim();
  if (!text) {
    setStatus("Type a message first.");
    return;
  }

  const historyForRequest = chatHistory.slice(-8);
  appendMessage({ role: "user", text });
  const loadingRow = appendLoadingMessage();
  inputNode.value = "";
  autoResizeInput();
  setSending(true);
  setStatus(`Thinking with ${selectedModel.name}...`);

  try {
    const response = await requestChat({
      prompt: text,
      history: historyForRequest,
      context: "",
      title: "",
      url: "",
      scope: "general",
      model: selectedModel.apiModel,
    });

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not generate response.");
    }

    removeMessageRow(loadingRow);
    appendMessage({ role: "assistant", text: response.reply });
    setStatus("Ready.");
  } catch (error) {
    removeMessageRow(loadingRow);
    const message = error instanceof Error ? error.message : "Request failed.";
    appendMessage({
      role: "assistant",
      text: `Model response failed.\n\n${message}`,
      includeInHistory: false,
    });
    setStatus("Response failed.");
  } finally {
    setSending(false);
  }
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

function setSending(next) {
  sending = next;
  sendBtn.disabled = next;
  sendBtn.textContent = next ? "Sending..." : "Send";
  modelPickerBtn.disabled = next;
}

function setStatus(value) {
  if (!statusNode) return;
  statusNode.textContent = value;
}

function appendMessage({ role, text, includeInHistory = true }) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble";
  bubble.innerHTML = markdownToHtml(text);

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

function appendLoadingMessage() {
  const row = document.createElement("div");
  row.className = "msg-row assistant";

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble loading";
  bubble.innerHTML = `
    <span class="loading-text">Thinking</span>
    <span class="loading-dots" aria-hidden="true">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </span>
  `;

  row.appendChild(bubble);
  messagesNode.appendChild(row);
  messagesNode.scrollTop = messagesNode.scrollHeight;
  return row;
}

function removeMessageRow(row) {
  if (row && row.parentNode === messagesNode) {
    messagesNode.removeChild(row);
  }
}

function renderModelCards() {
  modelListNode.innerHTML = "";
  missingIcons.clear();

  MODEL_OPTIONS.forEach((model) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `model-card ${model.apiModel === selectedModel.apiModel ? "active" : ""}`;
    card.addEventListener("click", () => {
      setSelectedModel(model);
      closeModelPicker();
    });

    const top = document.createElement("div");
    top.className = "model-top";

    const providerWrap = document.createElement("div");
    providerWrap.className = "provider-wrap";

    const icon = document.createElement("img");
    icon.className = "provider-icon";
    icon.src = `./${model.icon}`;
    icon.alt = model.provider;
    icon.addEventListener("error", () => {
      icon.src = "./icon.png";
      missingIcons.add(model.icon);
      renderMissingIconsNote();
    });

    const provider = document.createElement("span");
    provider.className = "provider";
    provider.textContent = model.provider;

    providerWrap.append(icon, provider);
    top.append(providerWrap);

    const modelName = document.createElement("h3");
    modelName.className = "model-name";
    modelName.textContent = model.name;

    const desc = document.createElement("p");
    desc.className = "model-desc";
    desc.textContent = getShortModelDescription(model);

    card.append(top, modelName, desc);
    modelListNode.appendChild(card);
  });

  renderMissingIconsNote();
}

function renderMissingIconsNote() {
  if (!missingIcons.size) {
    missingIconsNode.hidden = true;
    missingIconsNode.textContent = "";
    return;
  }

  missingIconsNode.hidden = false;
  missingIconsNode.textContent = `Missing icon files: ${Array.from(missingIcons).join(", ")}`;
}

function getShortModelDescription(model) {
  const mapped = SHORT_MODEL_DESCRIPTIONS[model.apiModel];
  if (mapped) return mapped;

  const clean = String(model?.desc || "").trim();
  if (!clean) return "General purpose chat model.";
  const firstSentence = clean.split(".")[0]?.trim();
  if (!firstSentence) return "General purpose chat model.";
  return firstSentence.length > 74 ? `${firstSentence.slice(0, 71).trim()}...` : firstSentence;
}

function syncActiveModelUI() {
  if (activeModelNode) {
    activeModelNode.textContent = `${selectedModel.provider} · ${selectedModel.name}`;
  }
  modelPickerLabelNode.textContent = `Model: ${selectedModel.name}`;
  activeModelIconNode.src = `./${selectedModel.icon}`;
  activeModelIconNode.alt = `${selectedModel.provider} icon`;
  activeModelIconNode.onerror = () => {
    activeModelIconNode.src = "./icon.png";
    activeModelIconNode.onerror = null;
  };
  modelPickerBtn.title = `${selectedModel.provider} · ${selectedModel.name}`;
}

function loadSelectedModel() {
  const stored = localStorage.getItem(STORAGE_SELECTED_MODEL);
  const found = MODEL_OPTIONS.find((model) => model.apiModel === stored);
  return found || MODEL_OPTIONS[0];
}

function saveSelectedModel(model) {
  localStorage.setItem(STORAGE_SELECTED_MODEL, model);
}

function setSelectedModel(model) {
  const switched = selectedModel.apiModel !== model.apiModel;
  selectedModel = model;
  saveSelectedModel(model.apiModel);
  syncActiveModelUI();
  renderModelCards();
  if (switched) {
    chatHistory = [];
  }
}

function toggleModelPicker() {
  if (modelPickerPopover.hidden) {
    openModelPicker();
    return;
  }
  closeModelPicker();
}

function openModelPicker() {
  modelPickerPopover.hidden = false;
  modelPickerBtn.setAttribute("aria-expanded", "true");
}

function closeModelPicker() {
  modelPickerPopover.hidden = true;
  modelPickerBtn.setAttribute("aria-expanded", "false");
}

function autoResizeInput() {
  inputNode.style.height = "auto";
  const nextHeight = Math.max(INPUT_MIN_HEIGHT, Math.min(INPUT_MAX_HEIGHT, inputNode.scrollHeight));
  inputNode.style.height = `${nextHeight}px`;
  inputNode.style.overflowY = inputNode.scrollHeight > INPUT_MAX_HEIGHT ? "auto" : "hidden";
}

function markdownToHtml(markdownText) {
  const source = String(markdownText || "").replace(/\r/g, "").trim();
  if (!source) return "";

  const lines = source.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${formatInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${quoteLines.map((item) => formatInlineMarkdown(item)).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current) break;
      if (isBlockStarter(current)) break;
      paragraph.push(current);
      index += 1;
    }
    blocks.push(`<p>${formatInlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return blocks.join("");
}

function isBlockStarter(text) {
  return (
    /^```/.test(text) ||
    /^(#{1,3})\s+/.test(text) ||
    /^>\s?/.test(text) ||
    /^[-*]\s+/.test(text) ||
    /^\d+\.\s+/.test(text)
  );
}

function formatInlineMarkdown(text) {
  const withLinks = String(text || "").replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label, url) => {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) return escapeHtml(label);
      return `<a href="${safeUrl}" target="_blank" rel="noreferrer noopener">${escapeHtml(label)}</a>`;
    }
  );

  let html = escapeHtml(withLinks);
  html = html
    .replace(/&lt;a href="([^"]+)" target="_blank" rel="noreferrer noopener"&gt;([^<]+)&lt;\/a&gt;/g, '<a href="$1" target="_blank" rel="noreferrer noopener">$2</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
}

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return "";
  } catch (_error) {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
