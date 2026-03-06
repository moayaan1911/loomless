import * as pdfjsLib from "./vendor/pdf.mjs";

const iconApi =
  globalThis.LoomLessIconMap && typeof globalThis.LoomLessIconMap.html === "function"
    ? globalThis.LoomLessIconMap
    : null;

function iconHtml(name, className = "inline-icon-sm") {
  if (!iconApi) return "";
  return iconApi.html(name, className);
}

function labelWithIcon(name, label) {
  const icon = iconHtml(name, "inline-icon-sm");
  if (!icon) return `<span>${label}</span>`;
  return `${icon}<span>${label}</span>`;
}

const STORAGE_SELECTED_MODEL_PREFIX = "loomless_ai_chat_page_model";
const STORAGE_WEB_SEARCH = "loomless_ai_chat_web_search_enabled";
const STORAGE_CHAT_MODE = "loomless_ai_chat_mode";
const STORAGE_SUPABASE_URL = "loomless_ai_supabase_url";
const STORAGE_SUPABASE_KEY = "loomless_ai_supabase_key";
const STORAGE_AUTH_SESSION = "loomless_ai_auth_session";
const STORAGE_PROFILE_COMPLETED = "loomless_ai_profile_completed";
const STORAGE_CHAT_SESSION_ID = "loomless_ai_chat_active_session_id";
const DEFAULT_MODEL_API = "nvidia/nemotron-3-nano-30b-a3b";
const DEFAULT_CODE_MODEL_API = "nvidia/nemotron-3-nano-30b-a3b";
const DEFAULT_IMAGE_MODEL_API = "black-forest-labs/flux.1-dev";
const CHAT_MODES = {
  CHAT: "chat",
  CODE: "code",
  IMAGE: "image",
};
const CODE_MODE_MODELS = new Set([
  "minimaxai/minimax-m2.5",
  "zai/glm5",
  "zai/glm4.7",
  "nvidia/nemotron-3-nano-30b-a3b",
  "qwen/qwen3.5-397b-a17b",
  "moonshotai/kimi-k2.5",
]);
const IMAGE_MODE_MODELS = new Set([
  "black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-kontext-dev",
  "stabilityai/stable-diffusion-3.5-large",
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
    provider: "Black-forest-labs",
    name: "FLUX.1-dev",
    apiModel: "black-forest-labs/flux.1-dev",
    desc: "High-quality text-to-image model with strong detail and composition.",
    icon: "flux.png",
    badges: ["Image", "Default"],
  },
  {
    provider: "Black-forest-labs",
    name: "FLUX.1-schnell",
    apiModel: "black-forest-labs/flux.1-schnell",
    desc: "Fast distilled FLUX model optimized for low-latency image generation.",
    icon: "flux.png",
    badges: ["Image", "Fast"],
  },
  {
    provider: "Black-forest-labs",
    name: "FLUX.1-Kontext-dev",
    apiModel: "black-forest-labs/flux.1-kontext-dev",
    desc: "In-context multimodal image model for richer generation workflows.",
    icon: "flux.png",
    badges: ["Image"],
  },
  {
    provider: "Stability AI",
    name: "stable-diffusion-3.5-large",
    apiModel: "stabilityai/stable-diffusion-3.5-large",
    desc: "Popular text-to-image model with strong prompt adherence and quality.",
    icon: "stability.png",
    badges: ["Image"],
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
  "black-forest-labs/flux.1-dev": "High-quality image generation with strong visual fidelity.",
  "black-forest-labs/flux.1-schnell": "Faster FLUX variant for quick image generation.",
  "black-forest-labs/flux.1-kontext-dev": "Context-aware FLUX model for richer image creation.",
  "stabilityai/stable-diffusion-3.5-large": "Stable Diffusion 3.5 large model for text-to-image outputs.",
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
const chatPanelNode = document.querySelector(".chat-panel");
const authGateNode = document.getElementById("auth-gate");
const pinSessionBtn = document.getElementById("pin-session-btn");
const pinSessionLabelNode = document.getElementById("pin-session-label");
const messagesNode = document.getElementById("chat-messages");
const inputNode = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const statusNode = document.getElementById("chat-status");
const webSearchToggleNode = document.getElementById("web-search-toggle");
const uploadBtnNode = document.getElementById("upload-btn");
const uploadWrapNode = uploadBtnNode?.closest(".upload-wrap") || null;
const uploadMenuNode = document.getElementById("upload-menu");
const uploadImageOptionNode = document.getElementById("upload-image-option");
const uploadPdfOptionNode = document.getElementById("upload-pdf-option");
const uploadDocOptionNode = document.getElementById("upload-doc-option");
const uploadPptOptionNode = document.getElementById("upload-ppt-option");
const uploadSheetOptionNode = document.getElementById("upload-sheet-option");
const imageUploadInputNode = document.getElementById("image-upload-input");
const pdfUploadInputNode = document.getElementById("pdf-upload-input");
const docUploadInputNode = document.getElementById("doc-upload-input");
const pptUploadInputNode = document.getElementById("ppt-upload-input");
const sheetUploadInputNode = document.getElementById("sheet-upload-input");
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
const APP_NAME = "LoomLess GPT";
const APP_URL = "loomless.fun";

let sending = false;
let chatHistory = [];
let webSearchEnabled = loadWebSearchEnabled();
let latestUploadContext = "";
let pendingImageUploads = [];
let pendingDocumentUploads = [];
const missingIcons = new Set();
let activeMode = loadChatMode();
let selectedModel = loadSelectedModel(activeMode);
let currentSessionId = loadOrCreateSessionId();
let isSessionPinned = loadPinnedState(currentSessionId);
let supabaseReady = false;
let authSession = null;
let profileCompleted = false;
let pinActionBusy = false;
let pinSyncInFlight = false;
let pinSyncQueued = false;
let lastPinnedSnapshotHash = "";
let supabaseConfigCache = null;
let regenerateMenuTargetButton = null;
let regenerateMenuRequestMeta = null;
let regenerateMenuSourceRow = null;
const regenerateMenuNode = createRegenerateMenu();

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.mjs";
iconApi?.mount?.(document);

modelPickerBtn.setAttribute("aria-expanded", "false");

ensureSelectedModelForMode();
renderModelCards();
syncActiveModelUI();
syncModeTabs();
syncModeUI();
syncWebSearchUI();
syncPinSessionUI();
renderPendingUploadPreview();
appendMessage({
  role: "assistant",
  text: "Hey, I am LoomLess GPT. Ask anything.",
  includeInHistory: false,
});
initializeSupabaseState();

sendBtn.addEventListener("click", () => {
  runSend();
});

pinSessionBtn?.addEventListener("click", () => {
  handlePinSessionToggle();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(STORAGE_AUTH_SESSION in changes) && !(STORAGE_PROFILE_COMPLETED in changes)) return;
    if (STORAGE_AUTH_SESSION in changes) {
      authSession = normalizeAuthSession(changes[STORAGE_AUTH_SESSION].newValue);
    }
    if (STORAGE_PROFILE_COMPLETED in changes) {
      profileCompleted = changes[STORAGE_PROFILE_COMPLETED].newValue === true;
    }
    supabaseConfigCache = null;
    if ((!authSession || !profileCompleted) && isSessionPinned) {
      isSessionPinned = false;
      savePinnedState(currentSessionId, false);
    }
    void initializeSupabaseState();
  });
}

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

uploadPdfOptionNode.addEventListener("click", () => {
  closeUploadMenu();
  pdfUploadInputNode.click();
});

uploadDocOptionNode.addEventListener("click", () => {
  closeUploadMenu();
  docUploadInputNode.click();
});

uploadPptOptionNode.addEventListener("click", () => {
  closeUploadMenu();
  pptUploadInputNode.click();
});

uploadSheetOptionNode.addEventListener("click", () => {
  closeUploadMenu();
  sheetUploadInputNode.click();
});

imageUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(imageUploadInputNode.files || []);
  imageUploadInputNode.value = "";
  if (!files.length) return;
  await stageImageUploads(files);
});

pdfUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(pdfUploadInputNode.files || []);
  pdfUploadInputNode.value = "";
  if (!files.length) return;
  await stageDocumentUploads(files);
});

docUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(docUploadInputNode.files || []);
  docUploadInputNode.value = "";
  if (!files.length) return;
  await stageDocumentUploads(files);
});

pptUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(pptUploadInputNode.files || []);
  pptUploadInputNode.value = "";
  if (!files.length) return;
  await stageDocumentUploads(files);
});

sheetUploadInputNode.addEventListener("change", async () => {
  const files = Array.from(sheetUploadInputNode.files || []);
  sheetUploadInputNode.value = "";
  if (!files.length) return;
  await stageDocumentUploads(files);
});

uploadPreviewListNode.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const previewCard = target.closest("[data-upload-id]");
  if (!previewCard) return;
  const uploadId = previewCard.getAttribute("data-upload-id");
  if (!uploadId) return;

  if (target.closest("[data-upload-action='remove']")) {
    removePendingAttachment(uploadId);
    setStatus("Attachment removed.");
    return;
  }

  if (target.closest("[data-upload-action='open']")) {
    const found = findPendingAttachmentById(uploadId);
    if (found && found.kind === "image") {
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

  if (!regenerateMenuNode.hidden) {
    const clickedRegenerate = regenerateMenuNode.contains(target) || regenerateMenuTargetButton?.contains(target);
    if (!clickedRegenerate) {
      closeRegenerateMenu();
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
    if (!regenerateMenuNode.hidden) {
      closeRegenerateMenu();
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
  if (!authSession || !profileCompleted) {
    setStatus("Sign in + setup required. Open extension popup and continue.");
    syncAuthGateUI();
    return;
  }
  if (activeMode === CHAT_MODES.IMAGE) {
    const prompt = (inputNode.value || "").trim();
    if (!prompt) {
      setStatus("Type an image prompt first.");
      return;
    }

    appendMessage({
      role: "user",
      text: prompt,
      historyMeta: {
        model: selectedModel.apiModel,
        mode: CHAT_MODES.IMAGE,
      },
    });
    const loadingRow = appendLoadingMessage(`Generating image: ${truncate(prompt, 64)}`);

    inputNode.value = "";
    autoResizeInput();
    setSending(true);

    try {
      const response = await requestImageGenerate({
        prompt,
        model: selectedModel.apiModel,
      });

      if (!response?.ok || !response?.imageDataUrl) {
        throw new Error(response?.error || "Could not generate image.");
      }

      removeMessageRow(loadingRow);
      appendGeneratedImageMessage({
        prompt,
        imageDataUrl: response.imageDataUrl,
        model: response.model || selectedModel.apiModel,
      });
      setStatus("Image ready.");
    } catch (error) {
      removeMessageRow(loadingRow);
      const message = error instanceof Error ? error.message : "Image generation failed.";
      appendMessage({
        role: "assistant",
        text: `Image generation failed.\n\n${message}`,
        includeInHistory: false,
      });
      setStatus("Image generation failed.");
    } finally {
      setSending(false);
    }
    return;
  }

  const text = (inputNode.value || "").trim();
  const attachmentsForSend = getPendingAttachmentsSnapshot();
  const hasAttachments = attachmentsForSend.length > 0;
  const effectiveWebSearch = webSearchEnabled && !hasAttachments;
  const finalPrompt = text || (hasAttachments ? "Analyze the attached files." : "");

  if (!finalPrompt) {
    setStatus("Type a message first.");
    return;
  }

  const historyForRequest = chatHistory.slice(-8).map((item) => ({
    role: item.role,
    content: item.content,
  }));
  const attachmentLine =
    attachmentsForSend.length === 0
      ? ""
      : attachmentsForSend.length === 1
        ? `Attachment: ${attachmentsForSend[0].fileName}`
        : `Attachments: ${attachmentsForSend.length} files attached`;
  const userText = attachmentLine ? `${attachmentLine}\n\n${finalPrompt}` : finalPrompt;
  appendMessage({
    role: "user",
    text: userText,
    historyMeta: {
      model: selectedModel.apiModel,
      mode: activeMode,
      metadata: {
        attachmentCount: attachmentsForSend.length,
        webSearch: effectiveWebSearch,
      },
    },
  });
  const loadingLabel = attachmentsForSend.length
    ? `Analyzing ${attachmentsForSend.length} file${attachmentsForSend.length > 1 ? "s" : ""}`
    : activeMode === CHAT_MODES.CODE
      ? "Generating code"
    : effectiveWebSearch
      ? `Searching web: ${truncate(finalPrompt, 64)}`
      : "Thinking";
  const loadingRow = appendLoadingMessage(loadingLabel);

  inputNode.value = "";
  autoResizeInput();
  if (attachmentsForSend.length) {
    clearPendingAttachments();
  }
  setSending(true);

  try {
    if (attachmentsForSend.length) {
      const analyses = [];
      for (let index = 0; index < attachmentsForSend.length; index += 1) {
        const upload = attachmentsForSend[index];
        updateLoadingMessage(
          loadingRow,
          `Analyzing ${index + 1}/${attachmentsForSend.length}: ${truncate(upload.fileName, 42)}`
        );
        if (upload.kind === "image") {
          const visionResponse = await requestImageDescribe({
            imageDataUrl: upload.dataUrl,
            prompt:
              `Extract only visible facts relevant to answering this user query.\nUser query: ${finalPrompt}`,
          });
          if (!visionResponse?.ok || !visionResponse?.reply) {
            throw new Error(visionResponse?.error || `Could not analyze ${upload.fileName}.`);
          }
          analyses.push({
            kind: "image",
            fileName: upload.fileName,
            analysis: visionResponse.reply,
            model: visionResponse.model || "nvidia/nemotron-nano-12b-v2-vl",
          });
          continue;
        }

        if (!upload.extractedText) {
          throw new Error(`Could not extract readable content from ${upload.fileName}.`);
        }
        analyses.push({
          kind: "document",
          fileName: upload.fileName,
          analysis: upload.extractedText,
          model: "local-parser",
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
    const requestPayload = {
      prompt: finalPrompt,
      history: historyForRequest,
      context: attachedContext,
      title: "",
      url: "",
      scope: "general",
      mode: activeMode,
      model: selectedModel.apiModel,
      webSearch: effectiveWebSearch,
    };

    let response = await requestChat(requestPayload);

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not generate response.");
    }

    // If files were attached and model asks for missing context, retry once with strict context-use instruction.
    if (hasAttachments && shouldRetryForMissingFileContext(response.reply)) {
      const retryResponse = await requestChat({
        ...requestPayload,
        prompt: buildAttachmentRetryPrompt(finalPrompt),
      });
      if (retryResponse?.ok && retryResponse?.reply) {
        response = retryResponse;
      }
    }

    removeMessageRow(loadingRow);
    appendMessage({
      role: "assistant",
      text: response.reply,
      sources: Array.isArray(response.sources) ? response.sources : [],
      searchQuery: typeof response.webQuery === "string" ? response.webQuery : "",
      historyMeta: {
        model: selectedModel.apiModel,
        mode: activeMode,
        metadata: {
          webSearch: effectiveWebSearch,
          sourceCount: Array.isArray(response.sources) ? response.sources.length : 0,
        },
      },
      requestMeta:
        activeMode === CHAT_MODES.CHAT
          ? {
              prompt: finalPrompt,
              history: historyForRequest,
              context: attachedContext,
              title: "",
              url: "",
              scope: "general",
              mode: CHAT_MODES.CHAT,
              webSearch: effectiveWebSearch,
            }
          : null,
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

function requestImageGenerate(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_IMAGE_GENERATE", ...payload }, (response) => {
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
  sendBtn.innerHTML = next ? "<span>Sending...</span>" : `${iconHtml("send", "inline-icon-sm")}<span>Send</span>`;
  syncModeUI();
  syncWebSearchUI();
  syncPinSessionUI();
}

function setStatus(value) {
  if (!statusNode) return;
  statusNode.textContent = value;
}

function loadOrCreateSessionId() {
  const existing = String(localStorage.getItem(STORAGE_CHAT_SESSION_ID) || "").trim();
  if (existing) return existing;
  const nextId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(STORAGE_CHAT_SESSION_ID, nextId);
  return nextId;
}

function getPinnedStorageKey(sessionId) {
  return `loomless_ai_chat_pinned_${sessionId}`;
}

function loadPinnedState(sessionId) {
  return localStorage.getItem(getPinnedStorageKey(sessionId)) === "1";
}

function savePinnedState(sessionId, pinned) {
  localStorage.setItem(getPinnedStorageKey(sessionId), pinned ? "1" : "0");
}

async function initializeSupabaseState() {
  let config = null;
  try {
    config = await getSupabaseConfig();
  } catch (_error) {
    config = null;
  }
  supabaseReady = Boolean(config);
  authSession = config?.authSession || null;
  profileCompleted = Boolean(config?.profileCompleted);
  if ((!supabaseReady || !authSession || !profileCompleted) && isSessionPinned) {
    isSessionPinned = false;
    savePinnedState(currentSessionId, false);
  }
  syncAuthGateUI();
  syncPinSessionUI();
}

function syncAuthGateUI() {
  const locked = !authSession || !profileCompleted;
  if (chatPanelNode) {
    chatPanelNode.classList.toggle("auth-locked", locked);
  }
  if (authGateNode) {
    authGateNode.hidden = !locked;
    const titleNode = authGateNode.querySelector("h3");
    const textNode = authGateNode.querySelector("p");
    if (titleNode && textNode) {
      if (!authSession) {
        titleNode.textContent = "Sign in required";
        textNode.textContent = "Open LoomLess AI extension popup and login to use chat.";
      } else {
        titleNode.textContent = "Complete setup required";
        textNode.textContent =
          "Open LoomLess AI extension popup, click Continue, and complete name/age setup.";
      }
    }
  }
}

function syncPinSessionUI() {
  if (!pinSessionBtn || !pinSessionLabelNode) return;
  pinSessionBtn.setAttribute("aria-pressed", isSessionPinned ? "true" : "false");
  pinSessionLabelNode.textContent = pinActionBusy ? "Working..." : isSessionPinned ? "Pinned" : "Pin";
  pinSessionBtn.disabled = sending || pinActionBusy || !supabaseReady || !authSession || !profileCompleted;
  if (!supabaseReady) {
    pinSessionBtn.title = "Supabase config missing in extension storage.";
    return;
  }
  if (!authSession) {
    pinSessionBtn.title = "Sign in from extension popup to enable pinning.";
    return;
  }
  if (!profileCompleted) {
    pinSessionBtn.title = "Complete setup from extension popup to enable pinning.";
    return;
  }
  pinSessionBtn.title = isSessionPinned
    ? "Unpin this chat and remove it from cloud storage."
    : "Pin this chat to Supabase.";
}

async function handlePinSessionToggle() {
  if (sending || pinActionBusy) return;
  if (!authSession || !profileCompleted || !supabaseReady) {
    let refreshed = null;
    try {
      refreshed = await getSupabaseConfig({ refresh: true });
    } catch (_error) {
      refreshed = null;
    }
    supabaseReady = Boolean(refreshed);
    authSession = refreshed?.authSession || null;
    profileCompleted = Boolean(refreshed?.profileCompleted);
    syncAuthGateUI();
    syncPinSessionUI();
  }
  if (!authSession) {
    setStatus("Sign in required for cloud pin.");
    return;
  }
  if (!supabaseReady) {
    setStatus("Supabase is not configured yet.");
    return;
  }
  if (!profileCompleted) {
    setStatus("Complete setup first from extension popup.");
    return;
  }

  pinActionBusy = true;
  syncPinSessionUI();

  try {
    if (!isSessionPinned) {
      await upsertPinnedSessionToSupabase({ skipIfUnchanged: false });
      isSessionPinned = true;
      savePinnedState(currentSessionId, true);
      setStatus("Chat pinned to Supabase.");
    } else {
      await deletePinnedSessionFromSupabase();
      isSessionPinned = false;
      savePinnedState(currentSessionId, false);
      lastPinnedSnapshotHash = "";
      setStatus("Chat unpinned.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pin action failed.";
    setStatus(message);
  } finally {
    pinActionBusy = false;
    syncPinSessionUI();
  }
}

function buildSessionTitleFromHistory(messages) {
  const firstUser = messages.find((item) => item.role === "user" && String(item.content || "").trim());
  const base = firstUser ? String(firstUser.content || "") : "LoomLess Chat";
  const singleLine = base.replace(/\s+/g, " ").trim();
  return singleLine.slice(0, 120) || "LoomLess Chat";
}

function getChatHistoryForPersistence() {
  return chatHistory.map((item, index) => ({
    role: item.role === "assistant" ? "assistant" : item.role === "system" ? "system" : "user",
    content: String(item.content || ""),
    model: typeof item.model === "string" && item.model.trim() ? item.model.trim() : null,
    mode: typeof item.mode === "string" && item.mode.trim() ? item.mode.trim() : null,
    createdAt:
      typeof item.createdAt === "string" && item.createdAt.trim() ? item.createdAt : new Date().toISOString(),
    messageIndex: index,
    metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {},
  }));
}

function buildPinnedSnapshotHash(messages) {
  return JSON.stringify(
    messages.map((item) => [item.role, item.content, item.model || "", item.mode || "", item.messageIndex])
  );
}

function requestPinnedSessionSync() {
  if (!isSessionPinned || !supabaseReady || !authSession || !profileCompleted) return;
  pinSyncQueued = true;
  if (pinSyncInFlight) return;
  void flushPinnedSessionSyncQueue();
}

async function flushPinnedSessionSyncQueue() {
  pinSyncInFlight = true;
  while (pinSyncQueued) {
    pinSyncQueued = false;
    try {
      await upsertPinnedSessionToSupabase({ skipIfUnchanged: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pinned sync failed.";
      setStatus(`Pinned sync failed: ${message}`);
      break;
    }
  }
  pinSyncInFlight = false;
}

async function upsertPinnedSessionToSupabase({ skipIfUnchanged = true } = {}) {
  const config = await getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase config missing.");
  }

  const messages = getChatHistoryForPersistence();
  const snapshotHash = buildPinnedSnapshotHash(messages);
  if (skipIfUnchanged && snapshotHash === lastPinnedSnapshotHash) {
    return;
  }

  const nowIso = new Date().toISOString();
  const sessionPayload = {
    user_id: config.userId,
    session_id: currentSessionId,
    title: buildSessionTitleFromHistory(messages),
    pinned: true,
    last_model: selectedModel?.apiModel || null,
    message_count: messages.length,
    last_message_at: nowIso,
    metadata: {
      mode: activeMode,
      source: "loomless-ai-extension",
      updated_at: nowIso,
    },
  };

  await supabaseRestRequest("ai_chat_sessions?on_conflict=user_id,session_id", {
    method: "POST",
    body: [sessionPayload],
    prefer: "resolution=merge-duplicates,return=minimal",
  });

  const encodedSessionId = encodeURIComponent(currentSessionId);
  const encodedUserId = encodeURIComponent(config.userId);
  await supabaseRestRequest(
    `ai_chat_messages?session_id=eq.${encodedSessionId}&user_id=eq.${encodedUserId}`,
    {
      method: "DELETE",
      prefer: "return=minimal",
    }
  );

  if (messages.length) {
    const rows = messages.map((item) => ({
      user_id: config.userId,
      session_id: currentSessionId,
      role: item.role,
      content: item.content,
      model: item.model,
      mode: item.mode,
      message_index: item.messageIndex,
      created_at: item.createdAt,
      metadata: item.metadata,
    }));

    await supabaseRestRequest("ai_chat_messages", {
      method: "POST",
      body: rows,
      prefer: "return=minimal",
    });
  }

  lastPinnedSnapshotHash = snapshotHash;
}

async function deletePinnedSessionFromSupabase() {
  const config = await getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase config missing.");
  }
  const encodedSessionId = encodeURIComponent(currentSessionId);
  const encodedUserId = encodeURIComponent(config.userId);
  await supabaseRestRequest(
    `ai_chat_sessions?session_id=eq.${encodedSessionId}&user_id=eq.${encodedUserId}`,
    {
      method: "DELETE",
      prefer: "return=minimal",
    }
  );
}

async function supabaseRestRequest(path, { method = "GET", body, prefer = "return=representation" } = {}) {
  const config = await getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase config missing.");
  }

  const url = `${config.url}/rest/v1/${path}`;
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.accessToken}`,
    Prefer: prefer,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const json = await response.json();
      detail = json?.message || json?.error || detail;
    } catch (_error) {
      // ignore JSON parse failure
    }
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

async function getSupabaseConfig({ refresh = false } = {}) {
  if (!refresh && supabaseConfigCache) {
    return supabaseConfigCache;
  }

  const result = await chromeStorageGet([
    STORAGE_SUPABASE_URL,
    STORAGE_SUPABASE_KEY,
    STORAGE_AUTH_SESSION,
    STORAGE_PROFILE_COMPLETED,
  ]);

  const url = sanitizeSupabaseUrl(result[STORAGE_SUPABASE_URL]);
  const key = String(result[STORAGE_SUPABASE_KEY] || "").trim();
  const storedAuth = normalizeAuthSession(result[STORAGE_AUTH_SESSION]);
  const storedProfileCompleted = result[STORAGE_PROFILE_COMPLETED] === true;

  if (!url || !key || !storedAuth) {
    supabaseConfigCache = null;
    return null;
  }

  let activeAuth = storedAuth;
  if (activeAuth.expiresAt && activeAuth.expiresAt <= Date.now() + 60_000) {
    let refreshed = null;
    try {
      refreshed = await refreshAuthSession(activeAuth, url, key);
    } catch (_error) {
      refreshed = null;
    }
    if (!refreshed) {
      supabaseConfigCache = null;
      await chromeStorageRemove([STORAGE_AUTH_SESSION, STORAGE_PROFILE_COMPLETED]);
      return null;
    }
    activeAuth = refreshed;
    await chromeStorageSet({ [STORAGE_AUTH_SESSION]: activeAuth });
  }

  supabaseConfigCache = {
    url,
    key,
    accessToken: activeAuth.accessToken,
    userId: activeAuth.userId,
    authSession: activeAuth,
    profileCompleted: storedProfileCompleted,
  };
  return supabaseConfigCache;
}

function sanitizeSupabaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

function normalizeAuthSession(raw) {
  if (!raw || typeof raw !== "object") return null;
  const accessToken = String(raw.accessToken || "").trim();
  const refreshToken = String(raw.refreshToken || "").trim();
  const userId = String(raw.userId || "").trim();
  const email = String(raw.email || "").trim();
  const expiresAt = Number(raw.expiresAt || 0);
  if (!accessToken || !refreshToken || !userId) return null;
  return {
    accessToken,
    refreshToken,
    userId,
    email,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
  };
}

async function refreshAuthSession(session, url, key) {
  if (!session?.refreshToken) return null;
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") return null;
  const accessToken = String(payload.access_token || "").trim();
  const refreshToken = String(payload.refresh_token || "").trim();
  const userId = String(payload.user?.id || "").trim();
  if (!accessToken || !refreshToken || !userId) return null;
  const expiresAtSeconds = Number(payload.expires_at || 0);
  const expiresInSeconds = Number(payload.expires_in || 0);
  const expiresAt =
    Number.isFinite(expiresAtSeconds) && expiresAtSeconds > 0
      ? expiresAtSeconds * 1000
      : Date.now() + (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : 3600) * 1000;

  return {
    accessToken,
    refreshToken,
    userId,
    email: String(payload.user?.email || "").trim(),
    expiresAt,
  };
}

function chromeStorageGet(keys) {
  if (!chrome?.storage?.local) {
    return Promise.resolve({});
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime?.lastError) {
        resolve({});
        return;
      }
      resolve(result || {});
    });
  });
}

function chromeStorageSet(payload) {
  if (!chrome?.storage?.local) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    chrome.storage.local.set(payload, () => {
      resolve();
    });
  });
}

function chromeStorageRemove(keys) {
  if (!chrome?.storage?.local) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => {
      resolve();
    });
  });
}

function appendMessage({
  role,
  text,
  includeInHistory = true,
  sources = [],
  searchQuery = "",
  historyMeta = null,
  requestMeta = null,
}) {
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
    copyBtn.innerHTML = labelWithIcon("copy", "Copy Code");
    copyBtn.addEventListener("click", async () => {
      const payload = extractCopyPayloadFromMessage(text);
      if (!payload) return;
      const copied = await copyTextToClipboard(payload);
      copyBtn.innerHTML = copied ? labelWithIcon("check", "Copied") : "<span>Copy Failed</span>";
      setTimeout(() => {
        copyBtn.innerHTML = labelWithIcon("copy", "Copy Code");
      }, 1400);
    });
    actionRow.appendChild(copyBtn);

    if (activeMode === CHAT_MODES.CODE) {
      const downloadPayload = buildDownloadPayload(text);
      if (downloadPayload) {
        const downloadBtn = document.createElement("button");
        downloadBtn.type = "button";
        downloadBtn.className = "msg-download-btn";
        downloadBtn.innerHTML = labelWithIcon("download", "Download");
        downloadBtn.addEventListener("click", () => {
          downloadGeneratedFile(downloadPayload);
        });
        actionRow.appendChild(downloadBtn);
      }

      const previewHtml = extractHtmlPreviewPayload(text);
      if (previewHtml) {
        const previewBtn = document.createElement("button");
        previewBtn.type = "button";
        previewBtn.className = "msg-preview-btn";
        previewBtn.innerHTML = labelWithIcon("preview", "Preview");
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

  if (role === "assistant" && activeMode === CHAT_MODES.CHAT && requestMeta) {
    bubble.appendChild(createChatModeActionRow({ answerText: text, requestMeta }));
  }

  row.appendChild(bubble);
  messagesNode.appendChild(row);
  messagesNode.scrollTop = messagesNode.scrollHeight;

  if (includeInHistory) {
    row.setAttribute("data-history-index", String(chatHistory.length));
    chatHistory.push({
      role,
      content: text,
      model: historyMeta?.model || null,
      mode: historyMeta?.mode || activeMode,
      createdAt: historyMeta?.createdAt || new Date().toISOString(),
      metadata: historyMeta?.metadata || {},
    });
    if (chatHistory.length > 16) {
      chatHistory = chatHistory.slice(-16);
    }
    requestPinnedSessionSync();
  }
}

function createChatModeActionRow({ answerText, requestMeta }) {
  const actionRow = document.createElement("div");
  actionRow.className = "msg-action-row chat-mode-action-row";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "msg-copy-btn";
  copyBtn.innerHTML = labelWithIcon("copy", "Copy");
  copyBtn.addEventListener("click", async () => {
    const copied = await copyTextToClipboard(answerText);
    copyBtn.innerHTML = copied ? labelWithIcon("check", "Copied") : "<span>Copy Failed</span>";
    setTimeout(() => {
      copyBtn.innerHTML = labelWithIcon("copy", "Copy");
    }, 1300);
  });

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "msg-download-btn";
  downloadBtn.innerHTML = labelWithIcon("download", "Download");
  downloadBtn.addEventListener("click", async () => {
    downloadBtn.disabled = true;
    try {
      await downloadChatTranscriptPdf();
      setStatus("Chat exported as PDF.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not export PDF.";
      appendMessage({
        role: "assistant",
        text: `PDF export failed.\n\n${message}`,
        includeInHistory: false,
      });
      setStatus("PDF export failed.");
    } finally {
      downloadBtn.disabled = false;
    }
  });

  const regenerateBtn = document.createElement("button");
  regenerateBtn.type = "button";
  regenerateBtn.className = "msg-regenerate-btn";
  regenerateBtn.innerHTML = labelWithIcon("regenerate", "Regenerate");
  regenerateBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openRegenerateMenu(regenerateBtn, requestMeta);
  });

  actionRow.append(copyBtn, downloadBtn, regenerateBtn);
  return actionRow;
}

function appendGeneratedImageMessage({ prompt, imageDataUrl, model }) {
  const row = document.createElement("div");
  row.className = "msg-row assistant";

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble generated-image-bubble";

  const title = document.createElement("p");
  title.className = "generated-image-title";
  title.textContent = "Image generated";

  const image = document.createElement("img");
  image.className = "generated-image";
  image.src = imageDataUrl;
  image.alt = `Generated image for: ${prompt}`;
  image.loading = "lazy";

  const meta = document.createElement("p");
  meta.className = "generated-image-meta";
  meta.textContent = `Model: ${model}`;

  const actionRow = document.createElement("div");
  actionRow.className = "msg-action-row";

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "msg-download-btn";
  downloadBtn.innerHTML = labelWithIcon("download", "Download");
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `loomless-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  actionRow.append(downloadBtn);
  bubble.append(title, image, meta, actionRow);
  row.appendChild(bubble);
  messagesNode.appendChild(row);
  messagesNode.scrollTop = messagesNode.scrollHeight;

  chatHistory.push({
    role: "assistant",
    content: `Generated image for prompt: ${prompt}`,
    model: model || selectedModel.apiModel,
    mode: CHAT_MODES.IMAGE,
    createdAt: new Date().toISOString(),
    metadata: {
      prompt,
      image: true,
    },
  });
  if (chatHistory.length > 16) {
    chatHistory = chatHistory.slice(-16);
  }
  requestPinnedSessionSync();
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

function createRegenerateMenu() {
  const menu = document.createElement("div");
  menu.className = "regenerate-menu";
  menu.hidden = true;
  document.body.appendChild(menu);
  return menu;
}

function openRegenerateMenu(anchorButton, requestMeta) {
  if (!anchorButton || !requestMeta) return;
  regenerateMenuTargetButton = anchorButton;
  regenerateMenuRequestMeta = requestMeta;
  regenerateMenuSourceRow = anchorButton.closest(".msg-row");

  regenerateMenuNode.innerHTML = "";
  const title = document.createElement("p");
  title.className = "regenerate-menu-title";
  title.textContent = "Regenerate with model";
  regenerateMenuNode.appendChild(title);

  const models = getVisibleModelsForMode(CHAT_MODES.CHAT);
  models.forEach((model) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "regenerate-menu-option";
    option.innerHTML = `
      <img class="regenerate-menu-icon" src="./${model.icon}" alt="${model.provider}" />
      <span class="regenerate-menu-text">${model.name}</span>
    `;
    option.addEventListener("click", () => {
      handleRegenerateSelection(model.apiModel);
    });
    regenerateMenuNode.appendChild(option);
  });

  const rect = anchorButton.getBoundingClientRect();
  regenerateMenuNode.style.left = `${Math.max(16, rect.left - 180)}px`;
  regenerateMenuNode.style.top = `${rect.bottom + 8}px`;
  regenerateMenuNode.hidden = false;
}

function closeRegenerateMenu() {
  regenerateMenuNode.hidden = true;
  regenerateMenuNode.innerHTML = "";
  regenerateMenuTargetButton = null;
  regenerateMenuRequestMeta = null;
  regenerateMenuSourceRow = null;
}

async function handleRegenerateSelection(modelApi) {
  const requestMeta = regenerateMenuRequestMeta;
  closeRegenerateMenu();
  if (!requestMeta || sending) return;

  const model = MODEL_OPTIONS.find((item) => item.apiModel === modelApi);
  const loadingRow = appendLoadingMessage(`Regenerating with ${model?.name || modelApi}`);
  setSending(true);

  try {
    const response = await requestChat({
      prompt: requestMeta.prompt,
      history: Array.isArray(requestMeta.history) ? requestMeta.history : [],
      context: typeof requestMeta.context === "string" ? requestMeta.context : "",
      title: typeof requestMeta.title === "string" ? requestMeta.title : "",
      url: typeof requestMeta.url === "string" ? requestMeta.url : "",
      scope: requestMeta.scope || "general",
      mode: CHAT_MODES.CHAT,
      model: modelApi,
      webSearch: Boolean(requestMeta.webSearch),
    });

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not regenerate response.");
    }

    removeMessageRow(loadingRow);
    appendMessage({
      role: "assistant",
      text: response.reply,
      sources: Array.isArray(response.sources) ? response.sources : [],
      searchQuery: typeof response.webQuery === "string" ? response.webQuery : "",
      requestMeta,
    });
    setStatus(`Regenerated with ${model?.name || modelApi}.`);
  } catch (error) {
    removeMessageRow(loadingRow);
    const message = error instanceof Error ? error.message : "Regenerate failed.";
    appendMessage({
      role: "assistant",
      text: `Regenerate failed.\n\n${message}`,
      includeInHistory: false,
    });
    setStatus("Regenerate failed.");
  } finally {
    setSending(false);
  }
}

async function downloadChatTranscriptPdf() {
  const transcript = getTranscriptEntriesForExport();
  if (!transcript.length) {
    throw new Error("No chat messages available to export.");
  }

  const jsPdfCtor = window.jspdf?.jsPDF;
  if (typeof jsPdfCtor !== "function") {
    throw new Error("PDF engine is not loaded.");
  }

  const doc = new jsPdfCtor({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const maxWidth = pageWidth - margin * 2;
  const bubbleWidth = Math.min(430, maxWidth * 0.78);
  let y = margin;

  const logoDataUrl = await loadAssetAsDataUrl("./icon.png").catch(() => "");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, y - 6, 26, 26);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(APP_NAME, margin + 34, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 118, 170);
  doc.text(APP_URL, margin + 34, y + 27);
  doc.text(`Exported: ${new Date().toLocaleString()}`, pageWidth - margin, y + 27, { align: "right" });

  y += 42;
  doc.setTextColor(24, 34, 52);

  for (const item of transcript) {
    const isUser = item.role === "user";
    const x = isUser ? pageWidth - margin - bubbleWidth : margin;
    const contentWidth = bubbleWidth - 20;
    const blocks = parseMarkdownForPdf(item.text, isUser);

    let blockHeight = 28;
    for (const block of blocks) {
      const fontSize = block.style === "heading" ? 11 : block.style === "code" ? 9 : 10;
      const lineHeight = block.style === "code" ? 12 : 13;
      const lines = block.text
        ? doc.splitTextToSize(sanitizePdfText(block.text), contentWidth)
        : [""];
      blockHeight += Math.max(1, lines.length) * lineHeight;
      if (block.style !== "blank") {
        blockHeight += 2;
      }
    }
    blockHeight += 8;

    if (y + blockHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setDrawColor(151, 179, 232);
    doc.setFillColor(isUser ? 231 : 245, isUser ? 240 : 248, isUser ? 255 : 255);
    doc.roundedRect(x, y, bubbleWidth, blockHeight, 8, 8, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(63, 89, 146);
    if (isUser) {
      doc.text("User", x + bubbleWidth - 10, y + 14, { align: "right" });
    } else {
      doc.text("Assistant", x + 10, y + 14);
    }

    let contentY = y + 28;
    for (const block of blocks) {
      if (block.style === "blank") {
        contentY += 5;
        continue;
      }

      const fontName = block.style === "code" ? "courier" : "helvetica";
      const fontStyle = block.style === "heading" ? "bold" : "normal";
      const fontSize = block.style === "heading" ? 11 : block.style === "code" ? 9 : 10;
      const lineHeight = block.style === "code" ? 12 : 13;
      const lines = doc.splitTextToSize(sanitizePdfText(block.text), contentWidth);

      doc.setFont(fontName, fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(30, 40, 60);

      for (const line of lines) {
        if (isUser) {
          doc.text(line, x + bubbleWidth - 10, contentY, { align: "right" });
        } else {
          doc.text(line, x + 10, contentY);
        }
        contentY += lineHeight;
      }
      contentY += 2;
    }

    y += blockHeight + 10;
  }

  doc.save(`loomless-chat-${Date.now()}.pdf`);
}

function getTranscriptEntriesForExport() {
  return chatHistory
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const role = item.role === "assistant" ? "assistant" : "user";
      const text = typeof item.content === "string" ? item.content.trim() : "";
      if (!text) return null;
      return { role, text };
    })
    .filter(Boolean);
}

function sanitizePdfText(input) {
  return String(input || "")
    .replace(/\r/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseMarkdownForPdf(rawText, isUser = false) {
  const source = String(rawText || "").replace(/\r/g, "");
  if (!source.trim()) return [{ style: "paragraph", text: "" }];
  if (isUser) {
    return [{ style: "paragraph", text: stripInlineMarkdownForPdf(source.replace(/\n+/g, " ").trim()) }];
  }

  const lines = source.split("\n");
  const blocks = [];
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      inCode = !inCode;
      continue;
    }
    if (!trimmed) {
      blocks.push({ style: "blank", text: "" });
      continue;
    }
    if (inCode) {
      blocks.push({ style: "code", text: trimmed });
      continue;
    }
    if (/^#{1,3}\s+/.test(trimmed)) {
      blocks.push({ style: "heading", text: stripInlineMarkdownForPdf(trimmed.replace(/^#{1,3}\s+/, "")) });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ style: "paragraph", text: `- ${stripInlineMarkdownForPdf(trimmed.replace(/^[-*]\s+/, ""))}` });
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push({ style: "paragraph", text: stripInlineMarkdownForPdf(trimmed) });
      continue;
    }
    blocks.push({ style: "paragraph", text: stripInlineMarkdownForPdf(trimmed) });
  }

  return blocks;
}

function stripInlineMarkdownForPdf(text) {
  return String(text || "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 ($2)")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

async function loadAssetAsDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load app icon.");
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read app icon."));
    reader.readAsDataURL(blob);
  });
}

function shouldRetryForMissingFileContext(reply) {
  const text = String(reply || "").toLowerCase();
  if (!text) return false;
  return (
    text.includes("not able to evaluate") ||
    text.includes("without a specific") ||
    text.includes("without specific") ||
    text.includes("could you clarify") ||
    text.includes("need more context") ||
    text.includes("cannot assess")
  );
}

function buildAttachmentRetryPrompt(prompt) {
  return [
    prompt,
    "",
    "Important:",
    "- Use the uploaded-file context already provided above.",
    "- Do not ask for more context.",
    "- Give a direct answer in concise bullet points.",
  ].join("\n");
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
        ? "Describe the image you want to generate..."
        : "Ask anything...";

  inputNode.placeholder = modePlaceholder;
  modeTabNodes.forEach((node) => {
    node.disabled = sending;
  });
  inputNode.disabled = sending;
  sendBtn.disabled = sending;
  uploadBtnNode.disabled = sending;
  uploadBtnNode.hidden = !isChatMode;
  if (uploadWrapNode) {
    uploadWrapNode.hidden = !isChatMode;
  }
  modelPickerBtn.disabled = sending;
  webSearchToggleNode.hidden = !isChatMode;
  syncPinSessionUI();

  if (!isChatMode && webSearchEnabled) {
    webSearchEnabled = false;
    saveWebSearchEnabled(false);
  }
  if (!isChatMode) {
    closeUploadMenu();
  }

  if (!isChatMode && hasPendingAttachments()) {
    clearPendingAttachments();
    latestUploadContext = "";
  }

  if (isImageMode) {
    modeNoteNode.hidden = false;
    modeNoteNode.textContent = "Image mode generates images from prompt text using NVIDIA image models.";
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
  selectedModel = loadSelectedModel(activeMode);
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
  const stored = localStorage.getItem(getModelStorageKey(mode));
  const visible = getVisibleModelsForMode(mode);
  const found = visible.find((model) => model.apiModel === stored);
  if (found) return found;
  return getDefaultModelOptionForMode(mode);
}

function saveSelectedModel(model, mode = activeMode) {
  localStorage.setItem(getModelStorageKey(mode), model);
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
  selectedModel = model;
  saveSelectedModel(model.apiModel, activeMode);
  syncActiveModelUI();
  renderModelCards();
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

  const slotsLeft = Math.max(0, 10 - getPendingAttachmentCount());
  if (slotsLeft <= 0) {
    appendMessage({
      role: "assistant",
      text: "Attachment limit reached. You can attach up to 10 files at a time.",
      includeInHistory: false,
    });
    return;
  }

  const accepted = validFiles.slice(0, slotsLeft);
  const dropped = validFiles.length - accepted.length;
  if (dropped > 0) {
    appendMessage({
      role: "assistant",
      text: `Added first ${accepted.length} files. Max 10 attachments allowed.`,
      includeInHistory: false,
    });
  }

  for (const file of accepted) {
    try {
      const imageDataUrl = await fileToDataUrl(file);
      pendingImageUploads.push({
        id: createUploadId(),
        kind: "image",
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

  renderPendingUploadPreview();
  syncWebSearchUI();
  setStatus(
    `${getPendingAttachmentCount()} attachment(s) ready. Web search is disabled in attachment mode.`
  );
}

async function stageDocumentUploads(files) {
  if (sending) return;
  const allowedExtensions = new Set(["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"]);
  const validFiles = files.filter((file) => allowedExtensions.has(getFileExtension(file.name)));
  const invalidCount = files.length - validFiles.length;

  if (invalidCount) {
    appendMessage({
      role: "assistant",
      text: `Skipped ${invalidCount} file(s). Supported formats: PDF, DOCX, TXT, PPTX, XLSX/XLS.`,
      includeInHistory: false,
    });
  }

  if (!validFiles.length) {
    return;
  }

  const slotsLeft = Math.max(0, 10 - getPendingAttachmentCount());
  if (slotsLeft <= 0) {
    appendMessage({
      role: "assistant",
      text: "Attachment limit reached. You can attach up to 10 files at a time.",
      includeInHistory: false,
    });
    return;
  }

  const accepted = validFiles.slice(0, slotsLeft);
  const dropped = validFiles.length - accepted.length;
  if (dropped > 0) {
    appendMessage({
      role: "assistant",
      text: `Added first ${accepted.length} files. Max 10 attachments allowed.`,
      includeInHistory: false,
    });
  }

  for (const file of accepted) {
    try {
      const extractedText = await extractDocumentText(file);
      if (!extractedText) {
        throw new Error("No readable text found in this file.");
      }
      pendingDocumentUploads.push({
        id: createUploadId(),
        kind: "document",
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        size: file.size,
        extractedText,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not parse selected file.";
      appendMessage({
        role: "assistant",
        text: `Could not attach ${file.name}: ${message}`,
        includeInHistory: false,
      });
    }
  }

  renderPendingUploadPreview();
  syncWebSearchUI();
  setStatus(
    `${getPendingAttachmentCount()} attachment(s) ready. Web search is disabled in attachment mode.`
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

async function extractDocumentText(file) {
  const extension = getFileExtension(file.name);
  if (extension === "txt") {
    const text = await file.text();
    return compactExtractedText(text);
  }
  if (extension === "docx") {
    return extractDocxText(file);
  }
  if (extension === "pdf") {
    return extractPdfText(file);
  }
  if (extension === "pptx") {
    return extractPptxText(file);
  }
  if (extension === "xlsx" || extension === "xls") {
    return extractSheetText(file);
  }
  if (extension === "doc" || extension === "ppt") {
    throw new Error("Legacy .doc/.ppt is not supported yet. Use .docx/.pptx.");
  }
  throw new Error("Unsupported file format.");
}

async function extractDocxText(file) {
  if (!window.mammoth || typeof window.mammoth.extractRawText !== "function") {
    throw new Error("DOCX parser not loaded.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return compactExtractedText(result?.value || "");
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const documentTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  const pdf = await documentTask.promise;

  const pageCount = Math.min(pdf.numPages, 20);
  const parts = [];
  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => (typeof item?.str === "string" ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    if (line) {
      parts.push(line);
    }
  }

  return compactExtractedText(parts.join("\n"));
}

async function extractPptxText(file) {
  if (!window.JSZip || typeof window.JSZip.loadAsync !== "function") {
    throw new Error("PPTX parser not loaded.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const zip = await window.JSZip.loadAsync(arrayBuffer);

  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const aNum = Number((a.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      const bNum = Number((b.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      return aNum - bNum;
    });

  const parts = [];
  for (const slideName of slideNames.slice(0, 40)) {
    const xml = await zip.file(slideName)?.async("string");
    if (!xml) continue;
    const matches = Array.from(xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi));
    const text = matches.map((m) => decodeXmlEntities(m[1] || "")).join(" ");
    if (text.trim()) {
      parts.push(text.trim());
    }
  }

  return compactExtractedText(parts.join("\n"));
}

async function extractSheetText(file) {
  if (!window.XLSX || typeof window.XLSX.read !== "function") {
    throw new Error("Sheet parser not loaded.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
  const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];
  if (!sheetNames.length) {
    return "";
  }

  const sections = [];
  for (const sheetName of sheetNames.slice(0, 8)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows = window.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
      defval: "",
    });

    const rowLines = rows
      .slice(0, 200)
      .map((row) => (Array.isArray(row) ? row.map((cell) => String(cell || "").trim()).join(" | ") : ""))
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (rowLines.length) {
      sections.push(`Sheet: ${sheetName}\n${rowLines.join("\n")}`);
    }
  }

  return compactExtractedText(sections.join("\n\n"));
}

function decodeXmlEntities(value) {
  const element = document.createElement("textarea");
  element.innerHTML = String(value || "");
  return element.value;
}

function buildUploadContextSnapshot(analyses) {
  const blocks = analyses.map((item, index) => {
    const cleanAnalysis =
      item.kind === "document" ? compactExtractedText(item.analysis) : compactImageAnalysis(item.analysis);
    const label = item.kind === "document" ? "Document" : "Image";
    return [
      `${label} ${index + 1}: ${item.fileName}`,
      `Extracted facts: ${cleanAnalysis}`,
    ].join("\n");
  });

  return ["Uploaded file context:", ...blocks].join("\n\n");
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

function compactExtractedText(input) {
  const normalized = String(input || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  return normalized.slice(0, 5000);
}

function renderPendingUploadPreview() {
  const attachments = getPendingAttachmentsSnapshot();
  if (!attachments.length) {
    uploadPreviewListNode.hidden = true;
    uploadPreviewListNode.innerHTML = "";
    return;
  }

  uploadPreviewListNode.hidden = false;
  uploadPreviewListNode.innerHTML = "";

  attachments.forEach((upload) => {
    const card = document.createElement("article");
    card.className = "upload-preview-card";
    card.setAttribute("data-upload-id", upload.id);

    let previewNode;
    if (upload.kind === "image") {
      const thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.className = "upload-preview-thumb";
      thumbBtn.setAttribute("data-upload-action", "open");
      thumbBtn.title = "Open image preview";

      const img = document.createElement("img");
      img.src = upload.dataUrl;
      img.alt = upload.fileName;
      thumbBtn.appendChild(img);
      previewNode = thumbBtn;
    } else {
      const docNode = document.createElement("div");
      docNode.className = "upload-preview-thumb upload-preview-thumb-doc";
      docNode.textContent = getAttachmentGlyph(upload.fileName);
      previewNode = docNode;
    }

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
    removeBtn.title = "Remove attachment";
    removeBtn.innerHTML = iconHtml("remove", "inline-icon-sm");

    card.append(previewNode, meta, removeBtn);
    uploadPreviewListNode.appendChild(card);
  });
}

function clearPendingAttachments() {
  pendingImageUploads = [];
  pendingDocumentUploads = [];
  renderPendingUploadPreview();
  syncWebSearchUI();
}

function removePendingAttachment(uploadId) {
  pendingImageUploads = pendingImageUploads.filter((item) => item.id !== uploadId);
  pendingDocumentUploads = pendingDocumentUploads.filter((item) => item.id !== uploadId);
  renderPendingUploadPreview();
  syncWebSearchUI();
}

function findPendingAttachmentById(uploadId) {
  return (
    pendingImageUploads.find((item) => item.id === uploadId) ||
    pendingDocumentUploads.find((item) => item.id === uploadId) ||
    null
  );
}

function getPendingAttachmentsSnapshot() {
  return [...pendingImageUploads.map((item) => ({ ...item })), ...pendingDocumentUploads.map((item) => ({ ...item }))];
}

function getPendingAttachmentCount() {
  return pendingImageUploads.length + pendingDocumentUploads.length;
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

function getFileExtension(fileName) {
  const name = String(fileName || "").toLowerCase();
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

function getAttachmentGlyph(fileName) {
  const extension = getFileExtension(fileName);
  if (extension === "pdf") return "PDF";
  if (extension === "docx" || extension === "doc" || extension === "txt") return "DOC";
  if (extension === "pptx" || extension === "ppt") return "PPT";
  if (extension === "xlsx" || extension === "xls") return "XLS";
  return "FILE";
}

function hasPendingAttachments() {
  return getPendingAttachmentCount() > 0;
}

function isWebSearchLocked() {
  return sending || hasPendingAttachments() || activeMode !== CHAT_MODES.CHAT;
}

function getDefaultModelOptionForMode(mode = activeMode) {
  const visible = getVisibleModelsForMode(mode);
  if (!visible.length) {
    return MODEL_OPTIONS.find((model) => model.apiModel === DEFAULT_MODEL_API) || MODEL_OPTIONS[0];
  }
  if (resolveMode(mode) === CHAT_MODES.CODE) {
    return visible.find((model) => model.apiModel === DEFAULT_CODE_MODEL_API) || visible[0];
  }
  if (resolveMode(mode) === CHAT_MODES.IMAGE) {
    return visible.find((model) => model.apiModel === DEFAULT_IMAGE_MODEL_API) || visible[0];
  }
  return visible.find((model) => model.apiModel === DEFAULT_MODEL_API) || visible[0];
}

function getVisibleModelsForMode(mode = activeMode) {
  const resolvedMode = resolveMode(mode);
  if (resolvedMode === CHAT_MODES.IMAGE) {
    return MODEL_OPTIONS.filter((model) => IMAGE_MODE_MODELS.has(model.apiModel));
  }
  if (resolvedMode === CHAT_MODES.CODE) {
    return MODEL_OPTIONS.filter((model) => CODE_MODE_MODELS.has(model.apiModel));
  }
  return MODEL_OPTIONS.filter((model) => !IMAGE_MODE_MODELS.has(model.apiModel));
}

function ensureSelectedModelForMode() {
  const visible = getVisibleModelsForMode(activeMode);
  if (!visible.length) return;
  if (!selectedModel || !visible.some((item) => item.apiModel === selectedModel.apiModel)) {
    selectedModel = getDefaultModelOptionForMode(activeMode);
    saveSelectedModel(selectedModel.apiModel, activeMode);
  }
}

function getModelStorageKey(mode = activeMode) {
  const resolved = resolveMode(mode);
  return `${STORAGE_SELECTED_MODEL_PREFIX}_${resolved}`;
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
  const blocks = extractCodeBlocksFromMessage(source).map((block) => block.body);
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

  const blocks = extractCodeBlocksFromMessage(source);
  for (const block of blocks) {
    const lang = block.lang;
    const body = block.body;
    if (lang === "html" || lang === "htm" || /<!doctype html>|<html[\s>]|<body[\s>]/i.test(body)) {
      return body;
    }
  }

  if (/<!doctype html>|<html[\s>]|<body[\s>]/i.test(source)) {
    return source.trim();
  }
  return "";
}

function extractCodeBlocksFromMessage(text) {
  const source = String(text || "");
  const blocks = [];
  const regex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let match = regex.exec(source);
  while (match) {
    const lang = String(match[1] || "").trim().toLowerCase();
    const body = String(match[2] || "").trim();
    if (body) {
      blocks.push({ lang, body });
    }
    match = regex.exec(source);
  }
  return blocks;
}

function buildDownloadPayload(text) {
  const blocks = extractCodeBlocksFromMessage(text);
  if (!blocks.length) {
    const plain = String(text || "").trim();
    if (!plain) return null;
    return {
      content: plain,
      fileName: `loomless-output-${Date.now()}.txt`,
      mimeType: "text/plain;charset=utf-8",
    };
  }

  if (blocks.length === 1) {
    const type = resolveFileType(blocks[0].lang, blocks[0].body);
    return {
      content: blocks[0].body,
      fileName: `loomless-code-${Date.now()}.${type.ext}`,
      mimeType: type.mime,
    };
  }

  const merged = blocks
    .map((block, index) => `// ----- Block ${index + 1} (${block.lang || "text"}) -----\n${block.body}`)
    .join("\n\n");
  return {
    content: merged,
    fileName: `loomless-code-${Date.now()}.txt`,
    mimeType: "text/plain;charset=utf-8",
  };
}

function resolveFileType(lang, body) {
  const cleanLang = String(lang || "").trim().toLowerCase();
  if (cleanLang === "html" || cleanLang === "htm" || /<!doctype html>|<html[\s>]/i.test(body)) {
    return { ext: "html", mime: "text/html;charset=utf-8" };
  }
  if (cleanLang === "css") return { ext: "css", mime: "text/css;charset=utf-8" };
  if (cleanLang === "javascript" || cleanLang === "js") {
    return { ext: "js", mime: "text/javascript;charset=utf-8" };
  }
  if (cleanLang === "typescript" || cleanLang === "ts") {
    return { ext: "ts", mime: "text/typescript;charset=utf-8" };
  }
  if (cleanLang === "python" || cleanLang === "py") return { ext: "py", mime: "text/x-python;charset=utf-8" };
  if (cleanLang === "json") return { ext: "json", mime: "application/json;charset=utf-8" };
  if (cleanLang === "sql") return { ext: "sql", mime: "text/sql;charset=utf-8" };
  if (cleanLang === "markdown" || cleanLang === "md") return { ext: "md", mime: "text/markdown;charset=utf-8" };
  return { ext: "txt", mime: "text/plain;charset=utf-8" };
}

function downloadGeneratedFile(payload) {
  if (!payload || !payload.content || !payload.fileName) return;
  const blob = new Blob([payload.content], {
    type: payload.mimeType || "text/plain;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = payload.fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

function openPreviewInNewTab(html) {
  const payload = String(html || "").trim();
  if (!payload) return;
  const blob = new Blob([payload], { type: "text/html;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
