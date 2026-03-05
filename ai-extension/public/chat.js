const STORAGE_SELECTED_MODEL = "loomless_ai_chat_page_model";
const STORAGE_WEB_SEARCH = "loomless_ai_chat_web_search_enabled";
const STORAGE_CHAT_MODE = "loomless_ai_chat_mode";
const DEFAULT_MODEL_API = "nvidia/nemotron-3-nano-30b-a3b";
const CHAT_MODES = {
  CHAT: "chat",
  CODE: "code",
  IMAGE: "image",
};
const CODE_MODE_MODELS = new Set([
  "zai/glm5",
  "nvidia/nemotron-3-nano-30b-a3b",
  "qwen/qwen3.5-397b-a17b",
  "moonshotai/kimi-k2.5",
]);

const MODEL_OPTIONS = [
  {
    provider: "NVIDIA",
    name: "nemotron-3-nano-30b-a3b",
    apiModel: "nvidia/nemotron-3-nano-30b-a3b",
    desc: "Efficient MoE model with 1M context, strong instruction-following, and tool calling.",
    icon: "nvidia.png",
    badges: ["Recommended", "Default", "Fast"],
  },
  {
    provider: "Minimaxai",
    name: "minimax-m2.5",
    apiModel: "minimaxai/minimax-m2.5",
    desc: "MiniMax M2.5 is a 230B-parameter text-to-text model for coding, reasoning, and office tasks.",
    icon: "minimax.png",
    badges: ["Hot"],
  },
  {
    provider: "Qwen",
    name: "qwen3.5-397b-a17b",
    apiModel: "qwen/qwen3.5-397b-a17b",
    desc: "Qwen 3.5 VLM MoE model with advanced vision, chat, RAG, and agentic capabilities.",
    icon: "qwen.png",
    badges: ["Hot"],
  },
  {
    provider: "Z.ai",
    name: "glm5",
    apiModel: "zai/glm5",
    desc: "GLM-5 MoE model focused on efficient reasoning for complex, long-horizon tasks.",
    icon: "zai.png",
    badges: ["Hot"],
  },
  {
    provider: "Moonshotai",
    name: "kimi-k2.5",
    apiModel: "moonshotai/kimi-k2.5",
    desc: "High-capacity multimodal MoE for video and image understanding with efficient inference.",
    icon: "kimi.png",
    badges: ["Hot"],
  },
  {
    provider: "Minimaxai",
    name: "minimax-m2.1",
    apiModel: "minimaxai/minimax-m2.1",
    desc: "MiniMax M2.1 for multilingual coding, web/app workflows, office AI, and agent integrations.",
    icon: "minimax.png",
  },
  {
    provider: "Stepfun-ai",
    name: "step-3.5-flash",
    apiModel: "stepfun-ai/step-3.5-flash",
    desc: "Open-source sparse MoE reasoning engine tuned for frontier agentic use-cases.",
    icon: "stepfun.png",
  },
  {
    provider: "Z.ai",
    name: "glm4.7",
    apiModel: "zai/glm4.7",
    desc: "Multilingual agentic coding partner with stronger reasoning, tool use, and UI skills.",
    icon: "zai.png",
  },
  {
    provider: "DeepSeek AI",
    name: "deepseek-v3.2",
    apiModel: "deepseek/deepseek-v3.2",
    desc: "State-of-the-art sparse-attention reasoning model with long context and integrated tools.",
    icon: "deepseek.png",
  },
  {
    provider: "Mistral AI",
    name: "devstral-2-123b-instruct-2512",
    apiModel: "mistralai/devstral-2-123b-instruct-2512",
    desc: "Code-heavy instruct model with deep reasoning, long context, and strong efficiency.",
    icon: "mistral.png",
  },
  {
    provider: "Mistral AI",
    name: "mistral-large-3-675b-instruct-2512",
    apiModel: "mistralai/mistral-large-3-675b-instruct-2512",
    desc: "General-purpose MoE model tuned for chat, agentic, and instruction-driven generation.",
    icon: "mistral.png",
  },
  {
    provider: "Meta",
    name: "llama-3.1-70b-instruct",
    apiModel: "meta/llama-3.1-70b-instruct",
    desc: "High-quality model for complex conversations with strong reasoning and context handling.",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama-3.1-8b-instruct",
    apiModel: "meta/llama-3.1-8b-instruct",
    desc: "Fast and lightweight chat model with balanced quality for everyday conversations.",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama3-70b-instruct",
    apiModel: "meta/llama3-70b-instruct",
    desc: "Large general chat model for richer answers and broader contextual understanding.",
    icon: "meta.png",
  },
  {
    provider: "Meta",
    name: "llama3-8b-instruct",
    apiModel: "meta/llama3-8b-instruct",
    desc: "Compact Llama3 model for faster responses and lower-latency interactions.",
    icon: "meta.png",
  },
  {
    provider: "Microsoft",
    name: "phi-4-mini-instruct",
    apiModel: "microsoft/phi-4-mini-instruct",
    desc: "Lightweight multilingual LLM for low-latency AI apps in memory and compute constrained environments.",
    icon: "microsoft.png",
  },
  {
    provider: "OpenAI",
    name: "gpt-oss-20b",
    apiModel: "openai/gpt-oss-20b",
    desc: "Smaller MoE text model optimized for efficient reasoning and math workflows.",
    icon: "openai.png",
  },
  {
    provider: "OpenAI",
    name: "gpt-oss-120b",
    apiModel: "openai/gpt-oss-120b",
    desc: "Larger MoE reasoning model designed for stronger depth and broader capability.",
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
const webSearchToggleNode = document.getElementById("web-search-toggle");
const uploadBtnNode = document.getElementById("upload-btn");
const uploadMenuNode = document.getElementById("upload-menu");
const uploadImageOptionNode = document.getElementById("upload-image-option");
const imageUploadInputNode = document.getElementById("image-upload-input");
const uploadPreviewListNode = document.getElementById("upload-preview-list");
const sourcesModalNode = document.getElementById("sources-modal");
const sourcesBackdropNode = document.getElementById("sources-backdrop");
const sourcesCloseBtnNode = document.getElementById("sources-close-btn");
const sourcesQueryNode = document.getElementById("sources-query");
const sourcesListNode = document.getElementById("sources-list");
const imagePreviewModalNode = document.getElementById("image-preview-modal");
const imagePreviewBackdropNode = document.getElementById("image-preview-backdrop");
const imagePreviewCloseBtnNode = document.getElementById("image-preview-close-btn");
const imagePreviewModalImgNode = document.getElementById("image-preview-modal-img");
const modeTabNodes = Array.from(document.querySelectorAll("[data-chat-mode]"));
const modeNoteNode = document.getElementById("mode-note");

const INPUT_MIN_HEIGHT = 42;
const INPUT_MAX_HEIGHT = 140;

let sending = false;
let chatHistory = [];
let webSearchEnabled = loadWebSearchEnabled();
let latestUploadContext = "";
let pendingImageUploads = [];
const missingIcons = new Set();
let activeMode = loadChatMode();
let selectedModel = loadSelectedModel(activeMode);

modelPickerBtn.setAttribute("aria-expanded", "false");

ensureSelectedModelForMode();
renderModelCards();
syncActiveModelUI();
syncModeTabs();
syncModeUI();
syncWebSearchUI();
renderPendingImagePreview();
appendMessage({
  role: "assistant",
  text: "Hey 👋 I am LoomLess GPT. Ask anything.",
  includeInHistory: false,
});

sendBtn.addEventListener("click", () => {
  runSend();
});

modeTabNodes.forEach((node) => {
  node.addEventListener("click", () => {
    const nextMode = node.getAttribute("data-chat-mode");
    if (!nextMode) return;
    setActiveMode(nextMode);
  });
});

webSearchToggleNode.addEventListener("click", () => {
  if (isWebSearchLocked()) return;
  webSearchEnabled = !webSearchEnabled;
  saveWebSearchEnabled(webSearchEnabled);
  syncWebSearchUI();
});

uploadBtnNode.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleUploadMenu();
});

uploadImageOptionNode.addEventListener("click", () => {
  closeUploadMenu();
  imageUploadInputNode.click();
});

imageUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(imageUploadInputNode.files || []);
  imageUploadInputNode.value = "";
  if (!files.length) return;
  await stageImageUploads(files);
});

uploadPreviewListNode.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const previewCard = target.closest("[data-upload-id]");
  if (!previewCard) return;
  const uploadId = previewCard.getAttribute("data-upload-id");
  if (!uploadId) return;

  if (target.closest("[data-upload-action='remove']")) {
    removePendingImageUpload(uploadId);
    setStatus("Attached image removed.");
    return;
  }

  if (target.closest("[data-upload-action='open']")) {
    const found = pendingImageUploads.find((item) => item.id === uploadId);
    if (found) {
      openImagePreviewModal(found.dataUrl);
    }
  }
});

inputNode.addEventListener("input", () => {
  autoResizeInput();
});

modelPickerBtn.addEventListener("click", (event) => {
  if (modelPickerBtn.disabled) return;
  event.stopPropagation();
  toggleModelPicker();
});

sourcesCloseBtnNode.addEventListener("click", closeSourcesModal);
sourcesBackdropNode.addEventListener("click", closeSourcesModal);
imagePreviewCloseBtnNode.addEventListener("click", closeImagePreviewModal);
imagePreviewBackdropNode.addEventListener("click", closeImagePreviewModal);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) return;

  if (!modelPickerPopover.hidden) {
    const clickedModelPicker = modelPickerPopover.contains(target) || modelPickerBtn.contains(target);
    if (!clickedModelPicker) {
      closeModelPicker();
    }
  }

  if (!uploadMenuNode.hidden) {
    const clickedUploadMenu = uploadMenuNode.contains(target) || uploadBtnNode.contains(target);
    if (!clickedUploadMenu) {
      closeUploadMenu();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!imagePreviewModalNode.hidden) {
      closeImagePreviewModal();
      return;
    }
    if (!sourcesModalNode.hidden) {
      closeSourcesModal();
      return;
    }
    if (!modelPickerPopover.hidden) {
      closeModelPicker();
    }
    if (!uploadMenuNode.hidden) {
      closeUploadMenu();
    }
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
  if (activeMode === CHAT_MODES.IMAGE) {
    setStatus("Image mode is coming soon.");
    appendMessage({
      role: "assistant",
      text: "Image mode is coming soon. Use Chat or Code mode for now.",
      includeInHistory: false,
    });
    return;
  }

  const text = (inputNode.value || "").trim();
  const uploadsForSend = pendingImageUploads.map((item) => ({ ...item }));
  const hasAttachments = uploadsForSend.length > 0;
  const effectiveWebSearch = webSearchEnabled && !hasAttachments;
  const finalPrompt = text || (uploadsForSend.length ? "Explain the attached image(s)." : "");

  if (!finalPrompt) {
    setStatus("Type a message first.");
    return;
  }

  const historyForRequest = chatHistory.slice(-8);
  const attachmentLine =
    uploadsForSend.length === 0
      ? ""
      : uploadsForSend.length === 1
        ? `📎 ${uploadsForSend[0].fileName}`
        : `📎 ${uploadsForSend.length} images attached`;
  const userText = attachmentLine ? `${attachmentLine}\n\n${finalPrompt}` : finalPrompt;
  appendMessage({ role: "user", text: userText });
  const loadingLabel = uploadsForSend.length
    ? `Analyzing ${uploadsForSend.length} image${uploadsForSend.length > 1 ? "s" : ""}`
    : activeMode === CHAT_MODES.CODE
      ? "Generating code"
    : effectiveWebSearch
      ? `Searching web: ${truncate(finalPrompt, 64)}`
      : "Thinking";
  const loadingRow = appendLoadingMessage(loadingLabel);

  inputNode.value = "";
  autoResizeInput();
  if (uploadsForSend.length) {
    clearPendingImageUploads();
  }
  setSending(true);

  try {
    if (uploadsForSend.length) {
      const analyses = [];
      for (let index = 0; index < uploadsForSend.length; index += 1) {
        const upload = uploadsForSend[index];
        updateLoadingMessage(
          loadingRow,
          `Analyzing ${index + 1}/${uploadsForSend.length}: ${truncate(upload.fileName, 42)}`
        );
        const visionResponse = await requestImageDescribe({
          imageDataUrl: upload.dataUrl,
          prompt:
            `Extract only visible facts relevant to answering this user query.\nUser query: ${finalPrompt}`,
        });
        if (!visionResponse?.ok || !visionResponse?.reply) {
          throw new Error(visionResponse?.error || `Could not analyze ${upload.fileName}.`);
        }
        analyses.push({
          fileName: upload.fileName,
          analysis: visionResponse.reply,
          model: visionResponse.model || "nvidia/nemotron-nano-12b-v2-vl",
        });
      }

      latestUploadContext = buildUploadContextSnapshot(analyses);

      if (effectiveWebSearch) {
        updateLoadingMessage(loadingRow, `Searching web: ${truncate(finalPrompt, 64)}`);
      } else {
        updateLoadingMessage(loadingRow, "Thinking");
      }
    }

    const attachedContext = buildAttachedContext();
    const response = await requestChat({
      prompt: finalPrompt,
      history: historyForRequest,
      context: attachedContext,
      title: "",
      url: "",
      scope: "general",
      mode: activeMode,
      model: selectedModel.apiModel,
      webSearch: effectiveWebSearch,
    });

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not generate response.");
    }

    removeMessageRow(loadingRow);
    appendMessage({
      role: "assistant",
      text: response.reply,
      sources: Array.isArray(response.sources) ? response.sources : [],
      searchQuery: typeof response.webQuery === "string" ? response.webQuery : "",
    });
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
  sendBtn.textContent = next ? "Sending..." : "Send";
  syncModeUI();
  syncWebSearchUI();
}

function setStatus(value) {
  if (!statusNode) return;
  statusNode.textContent = value;
}

function appendMessage({ role, text, includeInHistory = true, sources = [], searchQuery = "" }) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble";
  bubble.innerHTML = markdownToHtml(text);

  if (role === "assistant" && hasFencedCodeBlocks(text)) {
    const actionRow = document.createElement("div");
    actionRow.className = "msg-action-row";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "msg-copy-btn";
    copyBtn.innerHTML = '<span class="msg-action-icon" aria-hidden="true">⧉</span><span>Copy Code</span>';
    copyBtn.addEventListener("click", async () => {
      const payload = extractCopyPayloadFromMessage(text);
      if (!payload) return;
      const copied = await copyTextToClipboard(payload);
      copyBtn.innerHTML = copied
        ? '<span class="msg-action-icon" aria-hidden="true">✓</span><span>Copied</span>'
        : '<span class="msg-action-icon" aria-hidden="true">!</span><span>Copy Failed</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="msg-action-icon" aria-hidden="true">⧉</span><span>Copy Code</span>';
      }, 1400);
    });
    actionRow.appendChild(copyBtn);

    if (activeMode === CHAT_MODES.CODE) {
      const previewHtml = extractHtmlPreviewPayload(text);
      if (previewHtml) {
        const previewBtn = document.createElement("button");
        previewBtn.type = "button";
        previewBtn.className = "msg-preview-btn";
        previewBtn.innerHTML = '<span class="msg-action-icon" aria-hidden="true">↗</span><span>Preview</span>';
        previewBtn.addEventListener("click", () => {
          openPreviewInNewTab(previewHtml);
        });
        actionRow.appendChild(previewBtn);
      }
    }

    bubble.appendChild(actionRow);
  }

  if (role === "assistant" && Array.isArray(sources) && sources.length) {
    bubble.appendChild(createSourcesChip(sources, searchQuery));
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

function createSourcesChip(sources, query) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "sources-chip";

  const stack = document.createElement("span");
  stack.className = "source-stack";
  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = `source-dot dot-${i + 1}`;
    stack.appendChild(dot);
  }

  const label = document.createElement("span");
  const count = sources.length;
  label.textContent = `${count} web page${count > 1 ? "s" : ""}`;

  chip.append(stack, label);
  chip.addEventListener("click", () => {
    openSourcesModal(sources, query);
  });

  return chip;
}

function openSourcesModal(sources, query) {
  if (!Array.isArray(sources) || !sources.length) return;
  sourcesModalNode.hidden = false;
  sourcesQueryNode.textContent = query ? `Query: ${query}` : "Web search results";
  sourcesListNode.innerHTML = "";

  sources.forEach((source, index) => {
    const item = document.createElement("article");
    item.className = "source-item";

    const head = document.createElement("div");
    head.className = "source-item-head";

    const id = document.createElement("span");
    id.className = "source-id";
    id.textContent = `[${source.id || index + 1}]`;

    const domain = document.createElement("span");
    domain.className = "source-domain";
    domain.textContent = getDomain(source.url);

    head.append(id, domain);

    const link = document.createElement("a");
    link.className = "source-link";
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = source.title || source.url;

    const snippet = document.createElement("p");
    snippet.className = "source-snippet";
    snippet.textContent = source.snippet || "";

    item.append(head, link);
    if (snippet.textContent) {
      item.appendChild(snippet);
    }

    sourcesListNode.appendChild(item);
  });
}

function closeSourcesModal() {
  sourcesModalNode.hidden = true;
}

function appendLoadingMessage(label = "Thinking") {
  const row = document.createElement("div");
  row.className = "msg-row assistant";

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble loading";
  bubble.innerHTML = `
    <span class="loading-text">${escapeHtml(label)}</span>
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

function updateLoadingMessage(row, label) {
  if (!row) return;
  const textNode = row.querySelector(".loading-text");
  if (textNode) {
    textNode.textContent = label;
  }
}

function removeMessageRow(row) {
  if (row && row.parentNode === messagesNode) {
    messagesNode.removeChild(row);
  }
}

function renderModelCards() {
  modelListNode.innerHTML = "";
  missingIcons.clear();
  const visibleModels = getVisibleModelsForMode(activeMode);

  if (!visibleModels.length) {
    const empty = document.createElement("p");
    empty.className = "model-empty";
    empty.textContent = "No model selection in Image mode yet.";
    modelListNode.appendChild(empty);
    renderMissingIconsNote();
    return;
  }

  visibleModels.forEach((model) => {
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

    if (Array.isArray(model.badges) && model.badges.length) {
      const badges = document.createElement("div");
      badges.className = "model-badges";
      model.badges.forEach((badgeText) => {
        const badge = document.createElement("span");
        badge.className = `model-badge ${String(badgeText || "").toLowerCase()}`;
        badge.textContent = badgeText;
        badges.appendChild(badge);
      });
      top.append(badges);
    }

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
  if (activeMode === CHAT_MODES.IMAGE) {
    if (activeModelNode) {
      activeModelNode.textContent = "Image mode";
    }
    modelPickerLabelNode.textContent = "Mode: Image (Soon)";
    activeModelIconNode.src = "./icon.png";
    activeModelIconNode.alt = "Image mode";
    modelPickerBtn.title = "Image mode has no model selection yet.";
    return;
  }

  ensureSelectedModelForMode();
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

function syncModeTabs() {
  modeTabNodes.forEach((node) => {
    const mode = node.getAttribute("data-chat-mode");
    const active = mode === activeMode;
    node.classList.toggle("active", active);
    node.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function syncModeUI() {
  const isImageMode = activeMode === CHAT_MODES.IMAGE;
  const isChatMode = activeMode === CHAT_MODES.CHAT;
  const modePlaceholder =
    activeMode === CHAT_MODES.CODE
      ? "Ask for code, scripts, components, or full templates..."
      : isImageMode
        ? "Image mode coming soon..."
        : "Ask anything...";

  inputNode.placeholder = modePlaceholder;
  modeTabNodes.forEach((node) => {
    node.disabled = sending;
  });
  inputNode.disabled = sending || isImageMode;
  sendBtn.disabled = sending || isImageMode;
  uploadBtnNode.disabled = sending || isImageMode;
  modelPickerBtn.disabled = sending || isImageMode;
  webSearchToggleNode.hidden = !isChatMode;

  if (!isChatMode && webSearchEnabled) {
    webSearchEnabled = false;
    saveWebSearchEnabled(false);
  }

  if (isImageMode) {
    modeNoteNode.hidden = false;
    modeNoteNode.textContent = "Image mode is reserved for upcoming media workflows.";
  } else if (activeMode === CHAT_MODES.CODE) {
    modeNoteNode.hidden = false;
    modeNoteNode.textContent =
      "Code mode uses high-output generation and code-focused model selection.";
  } else {
    modeNoteNode.hidden = true;
    modeNoteNode.textContent = "";
  }
}

function setActiveMode(mode) {
  const normalized = resolveMode(mode);
  if (normalized === activeMode) return;
  activeMode = normalized;
  saveChatMode(activeMode);
  closeModelPicker();
  closeUploadMenu();
  ensureSelectedModelForMode();
  syncModeTabs();
  syncModeUI();
  renderModelCards();
  syncActiveModelUI();
  syncWebSearchUI();
}

function syncWebSearchUI() {
  const lockedByMode = activeMode === CHAT_MODES.IMAGE;
  if (hasPendingAttachments() && webSearchEnabled) {
    webSearchEnabled = false;
    saveWebSearchEnabled(false);
  }

  const lockedByAttachments = hasPendingAttachments();
  const lockedBySend = sending;
  const isLocked = lockedByAttachments || lockedBySend || lockedByMode;

  webSearchToggleNode.disabled = isLocked;
  webSearchToggleNode.setAttribute("aria-pressed", webSearchEnabled ? "true" : "false");

  if (lockedByMode) {
    webSearchToggleNode.title = "Web search is unavailable in Image mode.";
    return;
  }
  if (lockedByAttachments) {
    webSearchToggleNode.title = "Web search is disabled while files are attached.";
    return;
  }
  if (lockedBySend) {
    webSearchToggleNode.title = "Web search is locked while response is generating.";
    return;
  }
  webSearchToggleNode.title = webSearchEnabled ? "Disable Web Search" : "Enable Web Search";
}

function loadSelectedModel(mode = activeMode) {
  const stored = localStorage.getItem(STORAGE_SELECTED_MODEL);
  const visible = getVisibleModelsForMode(mode);
  const found = visible.find((model) => model.apiModel === stored);
  if (found && stored !== "minimaxai/minimax-m2.5") {
    return found;
  }
  return getDefaultModelOptionForMode(mode);
}

function saveSelectedModel(model) {
  localStorage.setItem(STORAGE_SELECTED_MODEL, model);
}

function loadChatMode() {
  const stored = localStorage.getItem(STORAGE_CHAT_MODE);
  return resolveMode(stored);
}

function saveChatMode(mode) {
  localStorage.setItem(STORAGE_CHAT_MODE, resolveMode(mode));
}

function loadWebSearchEnabled() {
  return localStorage.getItem(STORAGE_WEB_SEARCH) === "1";
}

function saveWebSearchEnabled(enabled) {
  localStorage.setItem(STORAGE_WEB_SEARCH, enabled ? "1" : "0");
}

function setSelectedModel(model) {
  if (activeMode === CHAT_MODES.IMAGE) return;
  const switched = selectedModel.apiModel !== model.apiModel;
  selectedModel = model;
  saveSelectedModel(model.apiModel);
  syncActiveModelUI();
  renderModelCards();
  if (switched) {
    chatHistory = [];
  }
}

function toggleUploadMenu() {
  if (uploadMenuNode.hidden) {
    openUploadMenu();
    return;
  }
  closeUploadMenu();
}

function openUploadMenu() {
  if (activeMode === CHAT_MODES.IMAGE) return;
  closeModelPicker();
  uploadMenuNode.hidden = false;
}

function closeUploadMenu() {
  uploadMenuNode.hidden = true;
}

function toggleModelPicker() {
  if (modelPickerPopover.hidden) {
    openModelPicker();
    return;
  }
  closeModelPicker();
}

function openModelPicker() {
  if (activeMode === CHAT_MODES.IMAGE) return;
  closeUploadMenu();
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
    const trimmed = lines[index].trim();

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
      if (!current || isBlockStarter(current)) break;
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
  const escaped = escapeHtml(String(text || ""));

  const linksApplied = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, rawUrl) => {
    const safeUrl = sanitizeUrl(rawUrl);
    if (!safeUrl) return label;
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer noopener">${label}</a>`;
  });

  return linksApplied
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
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

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (_error) {
    return "unknown";
  }
}

function truncate(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

async function stageImageUploads(files) {
  if (sending) return;
  const allowed = new Set(["image/png", "image/jpeg", "image/jpg"]);
  const validFiles = files.filter((file) => allowed.has(file.type));
  const invalidCount = files.length - validFiles.length;

  if (invalidCount) {
    appendMessage({
      role: "assistant",
      text: `Skipped ${invalidCount} file(s). Only PNG/JPG/JPEG is enabled right now.`,
      includeInHistory: false,
    });
  }

  if (!validFiles.length) {
    return;
  }

  const slotsLeft = Math.max(0, 10 - pendingImageUploads.length);
  if (slotsLeft <= 0) {
    appendMessage({
      role: "assistant",
      text: "Attachment limit reached. You can attach up to 10 images at a time.",
      includeInHistory: false,
    });
    return;
  }

  const accepted = validFiles.slice(0, slotsLeft);
  const dropped = validFiles.length - accepted.length;
  if (dropped > 0) {
    appendMessage({
      role: "assistant",
      text: `Added first ${accepted.length} images. Max 10 attachments allowed.`,
      includeInHistory: false,
    });
  }

  for (const file of accepted) {
    try {
      const imageDataUrl = await fileToDataUrl(file);
      pendingImageUploads.push({
        id: createUploadId(),
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        dataUrl: imageDataUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not read selected file.";
      appendMessage({
        role: "assistant",
        text: `Could not attach ${file.name}: ${message}`,
        includeInHistory: false,
      });
    }
  }

  renderPendingImagePreview();
  syncWebSearchUI();
  setStatus(
    `${pendingImageUploads.length} image attachment(s) ready. Web search is disabled in attachment mode.`
  );
}

function requestImageDescribe(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_DESCRIBE_IMAGE", ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read selected file."));
    reader.readAsDataURL(file);
  });
}

function buildUploadContextSnapshot(analyses) {
  const blocks = analyses.map((item, index) => {
    const cleanAnalysis = compactImageAnalysis(item.analysis);
    return [
      `Image ${index + 1}: ${item.fileName}`,
      `Visible facts: ${cleanAnalysis}`,
    ].join("\n");
  });

  return ["Uploaded image context:", ...blocks].join("\n\n");
}

function buildAttachedContext() {
  return (latestUploadContext || "").slice(0, 3600);
}

function compactImageAnalysis(input) {
  const lines = String(input || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!lines.length) {
    return "No clear visual details extracted.";
  }

  return lines.join(" | ").slice(0, 900);
}

function renderPendingImagePreview() {
  if (!pendingImageUploads.length) {
    uploadPreviewListNode.hidden = true;
    uploadPreviewListNode.innerHTML = "";
    return;
  }

  uploadPreviewListNode.hidden = false;
  uploadPreviewListNode.innerHTML = "";

  pendingImageUploads.forEach((upload) => {
    const card = document.createElement("article");
    card.className = "upload-preview-card";
    card.setAttribute("data-upload-id", upload.id);

    const thumbBtn = document.createElement("button");
    thumbBtn.type = "button";
    thumbBtn.className = "upload-preview-thumb";
    thumbBtn.setAttribute("data-upload-action", "open");
    thumbBtn.title = "Open image preview";

    const img = document.createElement("img");
    img.src = upload.dataUrl;
    img.alt = upload.fileName;
    thumbBtn.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "upload-preview-meta";
    const name = document.createElement("p");
    name.className = "upload-preview-name";
    name.textContent = upload.fileName;
    const size = document.createElement("p");
    size.className = "upload-preview-size";
    size.textContent = formatBytes(upload.size || 0);
    meta.append(name, size);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "upload-preview-remove";
    removeBtn.setAttribute("data-upload-action", "remove");
    removeBtn.title = "Remove image";
    removeBtn.textContent = "✕";

    card.append(thumbBtn, meta, removeBtn);
    uploadPreviewListNode.appendChild(card);
  });
}

function clearPendingImageUploads() {
  pendingImageUploads = [];
  renderPendingImagePreview();
  syncWebSearchUI();
}

function removePendingImageUpload(uploadId) {
  pendingImageUploads = pendingImageUploads.filter((item) => item.id !== uploadId);
  renderPendingImagePreview();
  syncWebSearchUI();
}

function openImagePreviewModal(dataUrl) {
  if (!dataUrl) return;
  imagePreviewModalImgNode.src = dataUrl;
  imagePreviewModalNode.hidden = false;
}

function closeImagePreviewModal() {
  imagePreviewModalNode.hidden = true;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function createUploadId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function hasPendingAttachments() {
  return pendingImageUploads.length > 0;
}

function isWebSearchLocked() {
  return sending || hasPendingAttachments() || activeMode === CHAT_MODES.IMAGE;
}

function getDefaultModelOptionForMode(mode = activeMode) {
  const visible = getVisibleModelsForMode(mode);
  if (!visible.length) {
    return MODEL_OPTIONS.find((model) => model.apiModel === DEFAULT_MODEL_API) || MODEL_OPTIONS[0];
  }
  return visible.find((model) => model.apiModel === DEFAULT_MODEL_API) || visible[0];
}

function getVisibleModelsForMode(mode = activeMode) {
  const resolvedMode = resolveMode(mode);
  if (resolvedMode === CHAT_MODES.IMAGE) {
    return [];
  }
  if (resolvedMode === CHAT_MODES.CODE) {
    return MODEL_OPTIONS.filter((model) => CODE_MODE_MODELS.has(model.apiModel));
  }
  return MODEL_OPTIONS;
}

function ensureSelectedModelForMode() {
  const visible = getVisibleModelsForMode(activeMode);
  if (!visible.length) return;
  if (!selectedModel || !visible.some((item) => item.apiModel === selectedModel.apiModel)) {
    selectedModel = getDefaultModelOptionForMode(activeMode);
    saveSelectedModel(selectedModel.apiModel);
  }
}

function resolveMode(mode) {
  if (mode === CHAT_MODES.CODE) return CHAT_MODES.CODE;
  if (mode === CHAT_MODES.IMAGE) return CHAT_MODES.IMAGE;
  return CHAT_MODES.CHAT;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasFencedCodeBlocks(text) {
  return /```/.test(String(text || ""));
}

function extractCopyPayloadFromMessage(text) {
  const source = String(text || "");
  const blocks = [];
  const regex = /```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g;
  let match = regex.exec(source);
  while (match) {
    const body = String(match[1] || "").trim();
    if (body) blocks.push(body);
    match = regex.exec(source);
  }
  if (blocks.length) {
    return blocks.join("\n\n");
  }
  return source.trim();
}

async function copyTextToClipboard(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_error) {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "readonly");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch (_fallbackError) {
      return false;
    }
  }
}

function extractHtmlPreviewPayload(text) {
  const source = String(text || "");
  if (!source.trim()) return "";

  const regex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let match = regex.exec(source);
  while (match) {
    const lang = String(match[1] || "").trim().toLowerCase();
    const body = String(match[2] || "").trim();
    if (!body) {
      match = regex.exec(source);
      continue;
    }
    if (lang === "html" || lang === "htm" || /<!doctype html>|<html[\s>]|<body[\s>]/i.test(body)) {
      return body;
    }
    match = regex.exec(source);
  }

  if (/<!doctype html>|<html[\s>]|<body[\s>]/i.test(source)) {
    return source.trim();
  }
  return "";
}

function openPreviewInNewTab(html) {
  const payload = String(html || "").trim();
  if (!payload) return;
  const blob = new Blob([payload], { type: "text/html;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
