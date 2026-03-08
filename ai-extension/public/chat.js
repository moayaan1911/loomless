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
const STORAGE_CHAT_MODE = "loomless_ai_chat_mode";
const STORAGE_SUPABASE_URL = "loomless_ai_supabase_url";
const STORAGE_SUPABASE_KEY = "loomless_ai_supabase_key";
const STORAGE_AUTH_SESSION = "loomless_ai_auth_session";
const STORAGE_PROFILE_COMPLETED = "loomless_ai_profile_completed";
const STORAGE_CHAT_SESSION_ID = "loomless_ai_chat_active_session_id";
const STORAGE_SIDEBAR_COLLAPSED = "loomless_ai_chat_sidebar_collapsed";
const STORAGE_LOCAL_SESSIONS = "loomless_ai_chat_local_sessions_v1";
const STORAGE_LOCAL_SECTION_EXPANDED = "loomless_ai_chat_local_section_expanded";
const DEFAULT_MODEL_API = "nvidia/nemotron-3-nano-30b-a3b";
const DEFAULT_CODE_MODEL_API = "nvidia/nemotron-3-nano-30b-a3b";
const DEFAULT_WRITER_MODEL_API = "meta/llama-3.2-3b-instruct";
const DEFAULT_IMAGE_MODEL_API = "black-forest-labs/flux.1-dev";
const MAX_LOCAL_SESSIONS = 12;
const CHAT_MODES = {
  CHAT: "chat",
  WRITER: "writer",
  CODE: "code",
  IMAGE: "image",
};
const IMAGE_ONLY_MODELS = new Set([
  "black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-kontext-dev",
  "stabilityai/stable-diffusion-3-medium",
]);
const ENABLED_IMAGE_MODE_MODELS = new Set([
  "black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell",
]);
const IMAGE_MODE_MODEL_ORDER = [
  "black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell",
];

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
    name: "stable-diffusion-3-medium",
    apiModel: "stabilityai/stable-diffusion-3-medium",
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
    name: "llama-4-scout-17b-16e-instruct",
    apiModel: "meta/llama-4-scout-17b-16e-instruct",
    desc: "Multimodal multilingual MoE model with strong reasoning, rich context handling, and efficient inference.",
    icon: "meta.png",
    badges: ["New"],
  },
  {
    provider: "Meta",
    name: "llama-3.3-70b-instruct",
    apiModel: "meta/llama-3.3-70b-instruct",
    desc: "Advanced large instruct model for reasoning, coding, structured output, and general-purpose chat.",
    icon: "meta.png",
    badges: ["New"],
  },
  {
    provider: "Meta",
    name: "llama-3.2-3b-instruct",
    apiModel: "meta/llama-3.2-3b-instruct",
    desc: "Smaller Llama 3.2 model tuned for fast text generation, lightweight reasoning, and chat tasks.",
    icon: "meta.png",
    badges: ["New", "Fast"],
  },
  {
    provider: "Meta",
    name: "llama-3.2-11b-vision-instruct",
    apiModel: "meta/llama-3.2-11b-vision-instruct",
    desc: "Vision-language instruct model that also works well for strong text reasoning and multimodal workflows.",
    icon: "meta.png",
    badges: ["New"],
  },
  {
    provider: "Meta",
    name: "llama-3.2-90b-vision-instruct",
    apiModel: "meta/llama-3.2-90b-vision-instruct",
    desc: "High-capacity vision-language model for deeper multimodal reasoning and stronger long-form responses.",
    icon: "meta.png",
    badges: ["New"],
  },
  {
    provider: "Meta",
    name: "llama-3.2-1b-instruct",
    apiModel: "meta/llama-3.2-1b-instruct",
    desc: "Ultra-lightweight Llama 3.2 model for low-latency text generation and simple chat workflows.",
    icon: "meta.png",
    badges: ["New", "Fast"],
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
  "stabilityai/stable-diffusion-3-medium": "Stable Diffusion 3 medium model for text-to-image outputs.",
  "mistralai/devstral-2-123b-instruct-2512": "Code-first instruct model for developer-heavy tasks.",
  "mistralai/mistral-large-3-675b-instruct-2512": "Premium large model for high-quality long-form output.",
  "meta/llama-4-scout-17b-16e-instruct": "Meta MoE model for rich reasoning, chat, and multilingual tasks.",
  "meta/llama-3.3-70b-instruct": "Large Meta model for strong reasoning and high-quality responses.",
  "meta/llama-3.2-3b-instruct": "Fast lightweight Llama 3.2 model for everyday chat and coding.",
  "meta/llama-3.2-11b-vision-instruct": "Meta vision-language model that also works well for text tasks.",
  "meta/llama-3.2-90b-vision-instruct": "High-capacity Meta vision-language model for deeper reasoning.",
  "meta/llama-3.2-1b-instruct": "Ultra-fast tiny Llama 3.2 model for simple low-latency tasks.",
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
const chatShellNode = document.getElementById("chat-shell");
const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
const sidebarNewChatBtn = document.getElementById("sidebar-new-chat-btn");
const sidebarImageBtn = document.getElementById("sidebar-image-btn");
const sidebarSettingsBtn = document.getElementById("sidebar-settings-btn");
const savedSessionsListNode = document.getElementById("saved-sessions-list");
const sessionItemMenuNode = document.getElementById("session-item-menu");
const sessionMenuEditBtn = document.getElementById("session-menu-edit-btn");
const sessionMenuDeleteBtn = document.getElementById("session-menu-delete-btn");
const sessionMenuEditLabelNode = document.getElementById("session-menu-edit-label");
const sessionMenuDeleteLabelNode = document.getElementById("session-menu-delete-label");
const chatPanelNode = document.querySelector(".chat-panel");
const chatHeaderNode = document.querySelector(".chat-header");
const authGateNode = document.getElementById("auth-gate");
const pinSessionBtn = document.getElementById("pin-session-btn");
const pinSessionLabelNode = document.getElementById("pin-session-label");
const sessionSaveDisclaimerNode = document.getElementById("session-save-disclaimer");
const messagesNode = document.getElementById("chat-messages");
const imageModeStageNode = document.getElementById("image-mode-stage");
const inputNode = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const statusNode = document.getElementById("chat-status");
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
const imagePreviewModalNode = document.getElementById("image-preview-modal");
const imagePreviewBackdropNode = document.getElementById("image-preview-backdrop");
const imagePreviewCloseBtnNode = document.getElementById("image-preview-close-btn");
const imagePreviewModalImgNode = document.getElementById("image-preview-modal-img");
const settingsModalNode = document.getElementById("settings-modal");
const settingsModalBackdropNode = document.getElementById("settings-modal-backdrop");
const settingsCloseBtnNode = document.getElementById("settings-close-btn");
const settingsSaveBtnNode = document.getElementById("settings-save-btn");
const settingsProfileNameNode = document.getElementById("settings-profile-name");
const settingsProfileContactNode = document.getElementById("settings-profile-contact");
const settingsAgeValueNode = document.getElementById("settings-age-value");
const settingsLocationValueNode = document.getElementById("settings-location-value");
const settingsContactValueNode = document.getElementById("settings-contact-value");
const settingsSidebarModeValueNode = document.getElementById("settings-sidebar-mode-value");
const settingsContactChipEmailNode = document.getElementById("settings-contact-chip-email");
const settingsNameInputNode = document.getElementById("settings-name-input");
const settingsMemoryInputNode = document.getElementById("settings-memory-input");
const settingsMemoryCounterNode = document.getElementById("settings-memory-counter");
const settingsGenderButtons = Array.from(document.querySelectorAll("[data-settings-gender]"));
const settingsSidebarButtons = Array.from(document.querySelectorAll("[data-settings-sidebar]"));
const settingsLogoutBtnNode = document.getElementById("settings-logout-btn");
const settingsDeleteAccountBtnNode = document.getElementById("settings-delete-account-btn");
const modeTabNodes = Array.from(document.querySelectorAll("[data-chat-mode]"));
const modeTabsWrapNode = document.querySelector(".mode-tabs");
const modeNoteNode = document.getElementById("mode-note");
const composerActionsNode = document.querySelector(".composer-actions");
const modelSpeedDisclaimerNode = document.querySelector(".model-speed-disclaimer");

const INPUT_MIN_HEIGHT = 42;
const INPUT_MAX_HEIGHT = 140;
const APP_NAME = "LoomLess GPT";
const APP_URL = "loomless.fun";
const IMAGE_MODE_MODEL_COUNT = IMAGE_MODE_MODEL_ORDER.length;
const DEFAULT_MODEL_SPEED_DISCLAIMER =
  "<strong><em>Responses can take longer on some models. Keep this tab open while waiting. Use Default Model for faster responses.</em></strong>";
const IMAGE_MODE_SPEED_DISCLAIMER =
  `<strong><em>Open-weight image model inference can be slow. Keep this tab open while all ${IMAGE_MODE_MODEL_COUNT} models finish generating.</em></strong>`;

let sending = false;
let chatHistory = [];
let imageGenerationHistory = [];
let latestUploadContext = "";
let pendingImageUploads = [];
let pendingDocumentUploads = [];
const missingIcons = new Set();
let activeMode = loadChatMode();
let selectedModel = loadSelectedModel(activeMode);
let currentSessionId = loadOrCreateSessionId();
let isSessionPinned = loadPinnedState(currentSessionId);
let sidebarCollapsed = loadSidebarCollapsed();
let localSectionExpanded = loadLocalSectionExpanded();
let localSessions = loadLocalSessions();
let savedSessions = [];
let supabaseReady = false;
let authSession = null;
let profileCompleted = false;
let pinActionBusy = false;
let pinSyncInFlight = false;
let pinSyncQueued = false;
let lastPinnedSnapshotHash = "";
let supabaseConfigCache = null;
let savedSessionsLoading = false;
let activeSessionMenuSessionId = "";
let activeSessionMenuKind = "";
let regenerateMenuTargetButton = null;
let regenerateMenuRequestMeta = null;
let regenerateMenuSourceRow = null;
let activeRequestState = null;
let initialSessionHydrated = false;
const regenerateMenuNode = createRegenerateMenu();
const USER_ABORT_MESSAGE = "Request stopped by user.";
const SETTINGS_MEMORY_LIMIT = 800;
const SETTINGS_DEFAULT_AGE = "18+";
const SETTINGS_CONTACT_EMAIL = "ayaangames@gmail.com";
let settingsDraft = {
  name: "",
  age: SETTINGS_DEFAULT_AGE,
  location: "",
  memory: "",
  gender: "male",
  sidebarMode: "manual",
};
let settingsSavedSnapshot = "";
let settingsProfileHydrated = false;

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.mjs";
iconApi?.mount?.(document);

modelPickerBtn.setAttribute("aria-expanded", "false");

ensureSelectedModelForMode();
renderModelCards();
syncActiveModelUI();
syncModeTabs();
syncModeUI();
syncPinSessionUI();
syncSidebarUI();
syncSidebarFeatureButtons();
renderSavedSessions();
renderPendingUploadPreview();
renderImageModeStage();
appendInitialPanelState();
initializeSupabaseState();

sendBtn.addEventListener("click", () => {
  if (sending) {
    void stopActiveRequest();
    return;
  }
  runSend();
});

pinSessionBtn?.addEventListener("click", () => {
  handlePinSessionToggle();
});

sidebarNewChatBtn?.addEventListener("click", () => {
  void handleNewChat();
});

sidebarImageBtn?.addEventListener("click", () => {
  setActiveMode(CHAT_MODES.IMAGE);
  inputNode?.focus();
});

sidebarToggleBtn?.addEventListener("click", () => {
  sidebarCollapsed = !sidebarCollapsed;
  saveSidebarCollapsed(sidebarCollapsed);
  syncSidebarUI();
});

sidebarSettingsBtn?.addEventListener("click", () => {
  openSettingsModal();
});

savedSessionsListNode?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const sectionToggleBtn = target.closest("[data-session-section-toggle]");
  if (sectionToggleBtn) {
    event.stopPropagation();
    const section = sectionToggleBtn.getAttribute("data-session-section-toggle");
    if (section === "local") {
      localSectionExpanded = !localSectionExpanded;
      saveLocalSectionExpanded(localSectionExpanded);
      renderSavedSessions();
    }
    return;
  }

  const menuBtn = target.closest("[data-session-action='menu']");
  if (menuBtn) {
    event.stopPropagation();
    const sessionId = menuBtn.getAttribute("data-session-id");
    const sessionKind = menuBtn.getAttribute("data-session-kind");
    if (!sessionId) return;
    openSessionItemMenu(menuBtn, sessionId, sessionKind || "saved");
    return;
  }

  const row = target.closest("[data-session-id]");
  if (!row) return;
  const sessionId = row.getAttribute("data-session-id");
  if (!sessionId) return;
  const sessionKind = row.getAttribute("data-session-kind");
  if (sessionKind === "local") {
    openLocalSession(sessionId);
    return;
  }
  void openSavedSession(sessionId);
});

sessionMenuEditBtn?.addEventListener("click", () => {
  void handleEditSessionTitle();
});

sessionMenuDeleteBtn?.addEventListener("click", () => {
  void handleDeleteSession();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(STORAGE_AUTH_SESSION in changes) && !(STORAGE_PROFILE_COMPLETED in changes)) return;
    if (STORAGE_AUTH_SESSION in changes) {
      authSession = normalizeAuthSession(changes[STORAGE_AUTH_SESSION].newValue);
      settingsProfileHydrated = false;
      settingsSavedSnapshot = "";
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

imagePreviewCloseBtnNode.addEventListener("click", closeImagePreviewModal);
imagePreviewBackdropNode.addEventListener("click", closeImagePreviewModal);
settingsCloseBtnNode?.addEventListener("click", closeSettingsModal);
settingsSaveBtnNode?.addEventListener("click", () => {
  void handleSettingsSave();
});
settingsModalBackdropNode?.addEventListener("click", closeSettingsModal);

settingsNameInputNode?.addEventListener("input", () => {
  settingsDraft.name = String(settingsNameInputNode.value || "").replace(/\s+/g, " ").trim();
  syncSettingsModalUI();
});

settingsMemoryInputNode?.addEventListener("input", () => {
  settingsDraft.memory = String(settingsMemoryInputNode.value || "").slice(0, SETTINGS_MEMORY_LIMIT);
  if (settingsMemoryInputNode.value !== settingsDraft.memory) {
    settingsMemoryInputNode.value = settingsDraft.memory;
  }
  syncSettingsMemoryCounter();
});

settingsGenderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextGender = button.getAttribute("data-settings-gender");
    if (!nextGender) return;
    settingsDraft.gender = nextGender;
    syncSettingsModalUI();
  });
});

settingsSidebarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextMode = button.getAttribute("data-settings-sidebar");
    if (!nextMode) return;
    settingsDraft.sidebarMode = nextMode;
    syncSettingsChoiceButtons();
    syncSettingsModalUI();
  });
});

settingsLogoutBtnNode?.addEventListener("click", () => {
  setStatus("Settings UI only. Logout wiring comes next.");
});

settingsDeleteAccountBtnNode?.addEventListener("click", () => {
  setStatus("Settings UI only. Delete account wiring comes next.");
});

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

  if (sessionItemMenuNode && !sessionItemMenuNode.hidden) {
    const clickedSessionMenu =
      sessionItemMenuNode.contains(target) || Boolean(target instanceof Element && target.closest("[data-session-action='menu']"));
    if (!clickedSessionMenu) {
      closeSessionItemMenu();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (settingsModalNode && !settingsModalNode.hidden) {
      closeSettingsModal();
      return;
    }
    if (!imagePreviewModalNode.hidden) {
      closeImagePreviewModal();
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
    if (sessionItemMenuNode && !sessionItemMenuNode.hidden) {
      closeSessionItemMenu();
    }
  }
});

inputNode.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  runSend();
});

autoResizeInput();

function appendInitialPanelState() {
  if (activeMode === CHAT_MODES.IMAGE) {
    renderImageModeStage();
    return;
  }
  appendMessage({
    role: "assistant",
    text: getInitialAssistantMessage(activeMode),
    includeInHistory: false,
    showAssistantActions: false,
  });
}

function getInitialAssistantMessage(mode) {
  if (mode === CHAT_MODES.CODE) {
    return "Hey, I am LoomLess GPT. Ask for code, scripts, components, or full builds.";
  }
  if (mode === CHAT_MODES.WRITER) {
    return "Hey, I am LoomLess GPT. Ask me to write blogs, emails, captions, scripts, or long-form content.";
  }
  return "Hey, I am LoomLess GPT. Ask anything.";
}

function clearImageGenerationHistory() {
  imageGenerationHistory = [];
  renderImageModeStage();
}

function createImageGenerationBatch(prompt) {
  return {
    id: `image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    prompt,
    createdAt: new Date().toISOString(),
    results: IMAGE_MODE_MODEL_ORDER.map((modelApi) => ({
      modelApi,
      status: "loading",
      imageDataUrl: "",
      error: "",
    })),
  };
}

function updateImageGenerationResult(batchId, modelApi, nextResult) {
  const entry = imageGenerationHistory.find((item) => item.id === batchId);
  if (!entry) return;
  const result = entry.results.find((item) => item.modelApi === modelApi);
  if (!result) return;
  Object.assign(result, nextResult);
  renderImageModeStage();
}

function renderImageModeStage() {
  if (!imageModeStageNode) return;
  imageModeStageNode.innerHTML = "";

  imageGenerationHistory.forEach((entry) => {
    const batchNode = document.createElement("section");
    batchNode.className = "image-batch";

    const promptWrap = document.createElement("div");
    const promptLabel = document.createElement("p");
    promptLabel.className = "image-batch-prompt-label";
    promptLabel.textContent = "Prompt";

    const promptText = document.createElement("p");
    promptText.className = "image-batch-prompt";
    promptText.textContent = entry.prompt;
    promptWrap.append(promptLabel, promptText);

    const gridNode = document.createElement("div");
    gridNode.className = "image-grid";

    entry.results.forEach((result) => {
      gridNode.appendChild(createImageResultCard(entry, result));
    });

    batchNode.append(promptWrap, gridNode);
    imageModeStageNode.appendChild(batchNode);
  });

  imageModeStageNode.scrollTop = 0;
}

function createImageResultCard(entry, result) {
  const card = document.createElement("article");
  card.className = `image-result-card ${result.status}`;

  const media = document.createElement("div");
  media.className = "image-result-media";

  if (result.status === "done" && result.imageDataUrl) {
    const image = document.createElement("img");
    image.src = result.imageDataUrl;
    image.alt = `${getModelDisplayName(result.modelApi)} image for: ${entry.prompt}`;
    image.loading = "lazy";
    media.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "image-result-placeholder";
    placeholder.textContent =
      result.status === "error" ? truncate(result.error || "Generation failed.", 160) : "Generating...";
    media.appendChild(placeholder);
  }

  const footer = document.createElement("div");
  footer.className = "image-result-footer";

  const textWrap = document.createElement("div");
  const modelName = document.createElement("p");
  modelName.className = "image-result-model";
  modelName.textContent = getModelDisplayName(result.modelApi);

  const statusText = document.createElement("p");
  statusText.className = "image-result-status";
  statusText.textContent =
    result.status === "done" ? "Ready to download" : result.status === "error" ? "Generation failed" : "Generating";
  textWrap.append(modelName, statusText);

  footer.appendChild(textWrap);

  if (result.status === "done" && result.imageDataUrl) {
    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "msg-download-btn";
    downloadBtn.innerHTML = labelWithIcon("download", "Download");
    downloadBtn.addEventListener("click", () => {
      downloadImageResult({
        imageDataUrl: result.imageDataUrl,
        modelApi: result.modelApi,
        prompt: entry.prompt,
      });
    });
    footer.appendChild(downloadBtn);
  }

  card.append(media, footer);
  return card;
}

function getModelDisplayName(modelApi) {
  return MODEL_OPTIONS.find((item) => item.apiModel === modelApi)?.name || modelApi;
}

function downloadImageResult({ imageDataUrl, modelApi, prompt }) {
  const anchor = document.createElement("a");
  anchor.href = imageDataUrl;
  anchor.download = buildImageDownloadFileName(modelApi, prompt);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function buildImageDownloadFileName(modelApi, prompt) {
  const modelSlug = String(modelApi || "")
    .split("/")
    .pop()
    ?.replace(/[^a-z0-9.-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const promptSlug = String(prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `loomless-${modelSlug || "image"}-${promptSlug || "prompt"}.png`;
}

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

    inputNode.value = "";
    autoResizeInput();
    setSending(true);

    try {
      const generation = createImageGenerationBatch(prompt);
      imageGenerationHistory = [generation, ...imageGenerationHistory].slice(0, 8);
      renderImageModeStage();

      const requests = IMAGE_MODE_MODEL_ORDER.map(async (modelApi) => {
        try {
          const response = await requestImageGenerate({
            prompt,
            model: modelApi,
            strictModel: true,
          });

          if (!response?.ok || !response?.imageDataUrl) {
            throw new Error(response?.error || "Could not generate image.");
          }

          updateImageGenerationResult(generation.id, modelApi, {
            status: "done",
            imageDataUrl: response.imageDataUrl,
            error: "",
          });
        } catch (error) {
          updateImageGenerationResult(generation.id, modelApi, {
            status: "error",
            imageDataUrl: "",
            error: error instanceof Error ? error.message : "Image generation failed.",
          });
        }
      });

      await Promise.all(requests);

      const completedEntry = imageGenerationHistory.find((item) => item.id === generation.id);
      const successCount = Array.isArray(completedEntry?.results)
        ? completedEntry.results.filter((item) => item.status === "done").length
        : 0;
      setStatus(
        successCount === IMAGE_MODE_MODEL_COUNT
          ? `All ${IMAGE_MODE_MODEL_COUNT} image generations are ready.`
          : successCount > 0
            ? `${successCount} of ${IMAGE_MODE_MODEL_COUNT} image generations completed.`
            : "Image generation failed for all models."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed.";
      setStatus(message);
    } finally {
      setSending(false);
    }
    return;
  }

  const text = (inputNode.value || "").trim();
  const attachmentsForSend = getPendingAttachmentsSnapshot();
  const hasAttachments = attachmentsForSend.length > 0;
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
  const userRow = appendMessage({
    role: "user",
    text: userText,
    historyMeta: {
      model: selectedModel.apiModel,
      mode: activeMode,
      metadata: {
        attachmentCount: attachmentsForSend.length,
      },
    },
  });
  const loadingLabel = attachmentsForSend.length
    ? `Analyzing ${attachmentsForSend.length} file${attachmentsForSend.length > 1 ? "s" : ""}`
    : activeMode === CHAT_MODES.WRITER
      ? "Writing"
    : activeMode === CHAT_MODES.CODE
      ? "Generating code"
      : "Thinking";
  const loadingRow = appendLoadingMessage(loadingLabel);
  const requestState = beginActiveRequest({
    kind: "chat-send",
    userRow,
    loadingRow,
    restoreInputValue: text,
    restoreAttachments: attachmentsForSend,
  });

  inputNode.value = "";
  autoResizeInput();
  if (attachmentsForSend.length) {
    clearPendingAttachments();
  }

  try {
    if (attachmentsForSend.length) {
      const analyses = [];
      for (let index = 0; index < attachmentsForSend.length; index += 1) {
        if (requestState.stopped) {
          throw createUserAbortError();
        }
        const upload = attachmentsForSend[index];
        updateLoadingMessage(
          loadingRow,
          `Analyzing ${index + 1}/${attachmentsForSend.length}: ${truncate(upload.fileName, 42)}`
        );
        if (upload.kind === "image") {
          const requestId = registerActiveRequestId(createRequestId(), requestState);
          const visionResponse = await requestImageDescribe({
            imageDataUrl: upload.dataUrl,
            prompt:
              `Extract only visible facts relevant to answering this user query.\nUser query: ${finalPrompt}`,
          }, requestId);
          if (requestState.stopped || visionResponse?.aborted) {
            throw createUserAbortError();
          }
          if (!visionResponse?.ok || !visionResponse?.reply) {
            throw new Error(visionResponse?.error || `Could not analyze ${upload.fileName}.`);
          }
          analyses.push({
            kind: "image",
            fileName: upload.fileName,
            analysis: visionResponse.reply,
            model: visionResponse.model || "meta/llama-3.2-11b-vision-instruct",
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

      updateLoadingMessage(loadingRow, "Thinking");
    }

    if (requestState.stopped) {
      throw createUserAbortError();
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
    };

    let response = await requestChat(requestPayload, registerActiveRequestId(createRequestId(), requestState));

    if (requestState.stopped || response?.aborted) {
      throw createUserAbortError();
    }

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not generate response.");
    }

    // If files were attached and model asks for missing context, retry once with strict context-use instruction.
    if (hasAttachments && shouldRetryForMissingFileContext(response.reply)) {
      const retryResponse = await requestChat({
        ...requestPayload,
        prompt: buildAttachmentRetryPrompt(finalPrompt),
      }, registerActiveRequestId(createRequestId(), requestState));
      if (requestState.stopped || retryResponse?.aborted) {
        throw createUserAbortError();
      }
      if (retryResponse?.ok && retryResponse?.reply) {
        response = retryResponse;
      }
    }

    removeMessageRow(loadingRow);
    appendMessage({
      role: "assistant",
      text: response.reply,
      historyMeta: {
        model: selectedModel.apiModel,
        mode: activeMode,
        metadata: {
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
            }
          : null,
    });
    setStatus("Ready.");
  } catch (error) {
    if (isUserAbortError(error)) {
      handleStoppedRequest(requestState);
      return;
    }
    removeMessageRow(loadingRow);
    const message = error instanceof Error ? error.message : "Request failed.";
    appendMessage({
      role: "assistant",
      text: `Model response failed.\n\n${message}`,
      includeInHistory: false,
    });
    setStatus("Response failed.");
  } finally {
    finishActiveRequest(requestState);
  }
}

function requestChat(payload, requestId = createRequestId()) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_CHAT", requestId, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

function requestImageGenerate(payload, requestId = createRequestId()) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_IMAGE_GENERATE", requestId, ...payload }, (response) => {
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
  const showStop = next && activeRequestState?.stopEnabled === true;
  sendBtn.classList.toggle("stop-btn", showStop);
  sendBtn.innerHTML = showStop
    ? `${iconHtml("stop", "inline-icon-sm")}<span>Stop</span>`
    : next
      ? "<span>Sending...</span>"
      : `${iconHtml("send", "inline-icon-sm")}<span>Send</span>`;
  syncModeUI();
  syncPinSessionUI();
}

function setStatus(value) {
  if (!statusNode) return;
  statusNode.textContent = value;
}

function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function beginActiveRequest(state) {
  activeRequestState = {
    ...state,
    stopped: false,
    requestIds: new Set(),
    stopEnabled: state?.stopEnabled !== false,
  };
  setSending(true);
  return activeRequestState;
}

function finishActiveRequest(state) {
  if (activeRequestState !== state) return;
  activeRequestState = null;
  setSending(false);
}

function registerActiveRequestId(requestId, state = activeRequestState) {
  if (state?.requestIds && requestId) {
    state.requestIds.add(requestId);
  }
  return requestId;
}

async function stopActiveRequest() {
  if (!activeRequestState || activeRequestState.stopped) return;
  activeRequestState.stopped = true;
  setStatus("Stopping request...");

  const requestIds = Array.from(activeRequestState.requestIds || []);
  await Promise.all(requestIds.map((requestId) => abortExtensionRequest(requestId)));
}

function abortExtensionRequest(requestId) {
  if (!requestId) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_ABORT_REQUEST", requestId }, (response) => {
      if (chrome.runtime.lastError) {
        resolve(false);
        return;
      }
      resolve(Boolean(response?.ok));
    });
  });
}

function createUserAbortError() {
  const error = new Error(USER_ABORT_MESSAGE);
  error.name = "LoomLessUserAbortError";
  return error;
}

function isUserAbortError(error) {
  return Boolean(error instanceof Error && error.name === "LoomLessUserAbortError");
}

function handleStoppedRequest(state) {
  if (state?.loadingRow) {
    removeMessageRow(state.loadingRow);
  }
  if (state?.userRow) {
    removeHistoryEntryForRow(state.userRow);
    removeMessageRow(state.userRow);
  }
  if (typeof state?.restoreInputValue === "string") {
    inputNode.value = state.restoreInputValue;
    autoResizeInput();
  }
  if (Array.isArray(state?.restoreAttachments) && state.restoreAttachments.length) {
    restorePendingAttachments(state.restoreAttachments);
  }
  latestUploadContext = "";
  setStatus(
    state?.kind === "regenerate"
      ? "Request stopped. Pick another model and regenerate again."
      : "Request stopped. Pick another model and send again."
  );
}

function restorePendingAttachments(attachments) {
  pendingImageUploads = attachments.filter((item) => item.kind === "image").map((item) => ({ ...item }));
  pendingDocumentUploads = attachments.filter((item) => item.kind === "document").map((item) => ({ ...item }));
  renderPendingUploadPreview();
  syncWebSearchUI();
}

function loadOrCreateSessionId() {
  const existing = String(localStorage.getItem(STORAGE_CHAT_SESSION_ID) || "").trim();
  if (existing) return existing;
  const nextId = createSessionId();
  localStorage.setItem(STORAGE_CHAT_SESSION_ID, nextId);
  return nextId;
}

function createSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadLocalSessions() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_LOCAL_SESSIONS) || "[]");
  } catch (_error) {
    parsed = [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const normalized = parsed.map(normalizeLocalSessionRecord).filter(Boolean);
  normalized.sort(compareSessionRecency);
  return normalized.slice(0, MAX_LOCAL_SESSIONS);
}

function saveLocalSessions() {
  if (!localSessions.length) {
    localStorage.removeItem(STORAGE_LOCAL_SESSIONS);
    return;
  }
  localStorage.setItem(STORAGE_LOCAL_SESSIONS, JSON.stringify(localSessions.slice(0, MAX_LOCAL_SESSIONS)));
}

function normalizeLocalSessionRecord(raw) {
  if (!raw || typeof raw !== "object") return null;

  const sessionId = String(raw.session_id || "").trim();
  if (!sessionId) return null;

  const messages = Array.isArray(raw.messages) ? raw.messages.map(normalizeLocalSessionMessage).filter(Boolean) : [];
  const createdAt = normalizeIsoTimestamp(raw.created_at) || messages[0]?.createdAt || new Date().toISOString();
  const updatedAt =
    normalizeIsoTimestamp(raw.updated_at) ||
    normalizeIsoTimestamp(raw.last_message_at) ||
    messages[messages.length - 1]?.createdAt ||
    createdAt;
  const messageCount = Number.isFinite(Number(raw.message_count)) ? Number(raw.message_count) : messages.length;

  return {
    session_id: sessionId,
    title:
      String(raw.title || "").replace(/\s+/g, " ").trim() ||
      buildSessionTitleFromHistory(messages.map((item) => ({ role: item.role, content: item.content }))),
    custom_title: raw.custom_title === true,
    last_model: typeof raw.last_model === "string" && raw.last_model.trim() ? raw.last_model.trim() : null,
    message_count: Math.max(messageCount, messages.length),
    created_at: createdAt,
    updated_at: updatedAt,
    last_message_at: normalizeIsoTimestamp(raw.last_message_at) || updatedAt,
    mode: resolveMode(raw.mode),
    messages,
  };
}

function normalizeLocalSessionMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const content = String(raw.content || "");
  if (!content.trim()) return null;

  return {
    role: normalizeMessageRole(raw.role),
    content,
    model: typeof raw.model === "string" && raw.model.trim() ? raw.model.trim() : null,
    mode: resolveMode(raw.mode),
    createdAt: normalizeIsoTimestamp(raw.createdAt || raw.created_at) || new Date().toISOString(),
    metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
  };
}

function normalizeIsoTimestamp(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw).getTime();
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return new Date(parsed).toISOString();
}

function compareSessionRecency(a, b) {
  const aTime = new Date(a?.updated_at || a?.last_message_at || a?.created_at || 0).getTime();
  const bTime = new Date(b?.updated_at || b?.last_message_at || b?.created_at || 0).getTime();
  return bTime - aTime;
}

function sortLocalSessions() {
  localSessions.sort(compareSessionRecency);
}

function findLocalSessionById(sessionId) {
  return localSessions.find((item) => item.session_id === sessionId) || null;
}

function upsertLocalSessionCache(payload, { render = true } = {}) {
  if (!payload?.session_id) return;
  const normalized = normalizeLocalSessionRecord(payload);
  if (!normalized) return;

  const index = localSessions.findIndex((item) => item.session_id === normalized.session_id);
  if (index >= 0) {
    localSessions[index] = { ...localSessions[index], ...normalized };
  } else {
    localSessions.push(normalized);
  }

  sortLocalSessions();
  localSessions = localSessions.slice(0, MAX_LOCAL_SESSIONS);
  saveLocalSessions();
  if (render) {
    renderSavedSessions();
  }
}

function removeLocalSessionById(sessionId, { render = true } = {}) {
  const next = localSessions.filter((item) => item.session_id !== sessionId);
  if (next.length === localSessions.length) return;
  localSessions = next;
  saveLocalSessions();
  if (render) {
    renderSavedSessions();
  }
}

function persistCurrentLocalSession({ render = true } = {}) {
  if (isSessionPinned || resolveMode(activeMode) === CHAT_MODES.IMAGE) {
    removeLocalSessionById(currentSessionId, { render });
    return;
  }

  const messages = getChatHistoryForPersistence();
  if (!messages.length) {
    removeLocalSessionById(currentSessionId, { render });
    return;
  }

  const existing = findLocalSessionById(currentSessionId);
  const nowIso = new Date().toISOString();

  upsertLocalSessionCache(
    {
      session_id: currentSessionId,
      title: existing?.custom_title ? existing.title : buildSessionTitleFromHistory(messages),
      custom_title: existing?.custom_title === true,
      last_model: selectedModel?.apiModel || existing?.last_model || null,
      message_count: messages.length,
      created_at: existing?.created_at || messages[0]?.createdAt || nowIso,
      updated_at: nowIso,
      last_message_at: nowIso,
      mode: resolveMode(activeMode),
      messages,
    },
    { render }
  );
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
  if (supabaseReady && authSession && profileCompleted) {
    await refreshSavedSessions();
  } else {
    savedSessions = [];
    renderSavedSessions();
    closeSessionItemMenu();
  }
  await restoreInitialSessionIfNeeded();
}

async function restoreInitialSessionIfNeeded() {
  if (initialSessionHydrated) return;

  const localSession = !isSessionPinned ? findLocalSessionById(currentSessionId) : null;
  if (localSession) {
    initialSessionHydrated = true;
    openLocalSession(currentSessionId, {
      forceReload: true,
      skipPersistCurrent: true,
    });
    return;
  }

  if (isSessionPinned) {
    if (!supabaseReady || !authSession || !profileCompleted) {
      return;
    }
    initialSessionHydrated = true;
    await openSavedSession(currentSessionId, {
      forceReload: true,
      skipPersistCurrent: true,
    });
    return;
  }

  initialSessionHydrated = true;
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
  const saveSupportedMode = activeMode !== CHAT_MODES.IMAGE;
  pinSessionBtn.hidden = !saveSupportedMode;
  pinSessionBtn.setAttribute("aria-pressed", isSessionPinned ? "true" : "false");
  pinSessionLabelNode.textContent = pinActionBusy ? "Working..." : isSessionPinned ? "Saved" : "Save";
  pinSessionBtn.disabled =
    !saveSupportedMode || sending || pinActionBusy || !supabaseReady || !authSession || !profileCompleted;
  if (sidebarNewChatBtn) {
    sidebarNewChatBtn.disabled = sending || pinActionBusy;
  }
  if (!saveSupportedMode) {
    pinSessionBtn.title = "Save is available only in Chat and Code modes.";
    syncSessionSaveDisclaimer();
    return;
  }
  if (!supabaseReady) {
    pinSessionBtn.title = "Supabase config missing in extension storage.";
    syncSessionSaveDisclaimer();
    return;
  }
  if (!authSession) {
    pinSessionBtn.title = "Sign in from extension popup to enable cloud save.";
    syncSessionSaveDisclaimer();
    return;
  }
  if (!profileCompleted) {
    pinSessionBtn.title = "Complete setup from extension popup to enable cloud save.";
    syncSessionSaveDisclaimer();
    return;
  }
  pinSessionBtn.title = isSessionPinned
    ? "Saved to Supabase. Click to unsave."
    : "Save this chat to Supabase.";
  syncSessionSaveDisclaimer();
}

function syncSessionSaveDisclaimer() {
  if (!sessionSaveDisclaimerNode) return;
  if (activeMode === CHAT_MODES.IMAGE) {
    sessionSaveDisclaimerNode.hidden = true;
    return;
  }
  sessionSaveDisclaimerNode.hidden = false;

  const textNode =
    sessionSaveDisclaimerNode.querySelector(":scope > span:last-child") || sessionSaveDisclaimerNode.children[1];
  if (!(textNode instanceof HTMLElement)) return;

  if (isSessionPinned) {
    sessionSaveDisclaimerNode.classList.add("saved");
    textNode.textContent = "Saved chat. This one syncs to your account.";
    return;
  }

  sessionSaveDisclaimerNode.classList.remove("saved");
  textNode.textContent = "Unsaved chat. It stays only on this device unless you save it.";
}

function loadSidebarCollapsed() {
  return localStorage.getItem(STORAGE_SIDEBAR_COLLAPSED) === "1";
}

function saveSidebarCollapsed(collapsed) {
  localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
}

function loadLocalSectionExpanded() {
  return localStorage.getItem(STORAGE_LOCAL_SECTION_EXPANDED) !== "0";
}

function saveLocalSectionExpanded(expanded) {
  localStorage.setItem(STORAGE_LOCAL_SECTION_EXPANDED, expanded ? "1" : "0");
}

function syncSidebarUI() {
  if (chatShellNode) {
    chatShellNode.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  }
  if (sidebarToggleBtn) {
    const iconName = sidebarCollapsed ? "sidebarExpand" : "sidebarCollapse";
    sidebarToggleBtn.innerHTML = iconHtml(iconName, "inline-icon-sm");
    sidebarToggleBtn.title = sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";
  }
}

function syncSidebarFeatureButtons() {
  if (sidebarImageBtn) {
    sidebarImageBtn.classList.toggle("active", activeMode === CHAT_MODES.IMAGE);
    sidebarImageBtn.disabled = sending;
  }
}

function openSettingsModal() {
  closeModelPicker();
  closeUploadMenu();
  closeRegenerateMenu();
  closeSessionItemMenu();
  closeImagePreviewModal();
  ensureSettingsDraftDefaults();
  syncSettingsModalUI();
  if (settingsModalNode) {
    settingsModalNode.hidden = false;
  }
  void hydrateSettingsProfileFromSupabase();
  settingsNameInputNode?.focus();
}

function closeSettingsModal() {
  if (settingsModalNode) {
    settingsModalNode.hidden = true;
  }
}

function ensureSettingsDraftDefaults() {
  if (!settingsDraft.name) {
    settingsDraft.name = deriveSettingsName();
  }
  if (!settingsDraft.age) {
    settingsDraft.age = SETTINGS_DEFAULT_AGE;
  }
  if (!settingsDraft.location) {
    settingsDraft.location = deriveSettingsLocation();
  }
  if (!settingsDraft.memory) {
    settingsDraft.memory = "";
  }
  if (settingsDraft.gender !== "female") {
    settingsDraft.gender = "male";
  }
  if (settingsDraft.sidebarMode !== "auto") {
    settingsDraft.sidebarMode = "manual";
  }
  if (!settingsSavedSnapshot) {
    settingsSavedSnapshot = getSettingsSnapshot();
  }
}

function deriveSettingsName() {
  const email = String(authSession?.email || "").trim();
  if (!email.includes("@")) {
    return "LoomLess User";
  }
  const localPart = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!localPart) {
    return "LoomLess User";
  }
  return localPart
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveSettingsLocation() {
  const timeZone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || "").trim();
  if (!timeZone) {
    return "This device";
  }
  return timeZone
    .split("/")
    .map((part) => part.replace(/_/g, " "))
    .join(" / ");
}

function getSettingsContactEmail() {
  const authEmail = String(authSession?.email || "").trim().toLowerCase();
  return authEmail || SETTINGS_CONTACT_EMAIL;
}

function getSettingsSnapshot() {
  return JSON.stringify({
    name: String(settingsDraft.name || "").trim(),
    age: String(settingsDraft.age || SETTINGS_DEFAULT_AGE).trim(),
    location: String(settingsDraft.location || "").trim(),
    memory: String(settingsDraft.memory || ""),
    gender: settingsDraft.gender === "female" ? "female" : "male",
    sidebarMode: settingsDraft.sidebarMode === "auto" ? "auto" : "manual",
  });
}

function extractProfileLocationEstimate(profileRow) {
  if (!profileRow || typeof profileRow !== "object") {
    return "";
  }

  const directCandidates = [
    profileRow.location_estimate,
    profileRow.location,
    profileRow.city,
    profileRow.region,
    profileRow.country,
    profileRow.timezone,
  ];

  for (const candidate of directCandidates) {
    const clean = String(candidate || "").trim();
    if (clean) return clean;
  }

  const metadata = profileRow.metadata && typeof profileRow.metadata === "object" ? profileRow.metadata : {};
  const metadataCandidates = [
    metadata.location_estimate,
    metadata.location,
    metadata.location_text,
    metadata.locationLabel,
    metadata.ip_location,
    metadata.ipLocation,
    metadata.city && metadata.country ? `${metadata.city}, ${metadata.country}` : "",
    metadata.city && metadata.region ? `${metadata.city}, ${metadata.region}` : "",
    metadata.city,
    metadata.region,
    metadata.country,
    metadata.timezone,
  ];

  for (const candidate of metadataCandidates) {
    const clean = String(candidate || "").trim();
    if (clean) return clean;
  }

  return "";
}

async function hydrateSettingsProfileFromSupabase() {
  if (settingsProfileHydrated) return;
  if (!authSession || !profileCompleted) return;

  try {
    const config = await getSupabaseConfig();
    if (!config) return;
    const encodedUserId = encodeURIComponent(config.userId);
    const rows = await supabaseRestRequest(
      `ai_user_profiles?select=*&user_id=eq.${encodedUserId}&limit=1`,
      {
        method: "GET",
        prefer: "return=representation",
      }
    );

    if (!Array.isArray(rows) || !rows.length) return;
    const profileRow = rows[0];
    const metadata = profileRow?.metadata && typeof profileRow.metadata === "object" ? profileRow.metadata : {};

    settingsDraft.name = String(profileRow?.full_name || settingsDraft.name || deriveSettingsName()).trim();
    settingsDraft.age = String(profileRow?.age || settingsDraft.age || SETTINGS_DEFAULT_AGE).trim();
    settingsDraft.gender = metadata.gender === "female" ? "female" : "male";
    settingsDraft.location = extractProfileLocationEstimate(profileRow) || deriveSettingsLocation();
    settingsSavedSnapshot = getSettingsSnapshot();
    settingsProfileHydrated = true;
    syncSettingsModalUI();
  } catch (_error) {
    settingsProfileHydrated = false;
  }
}

async function handleSettingsSave() {
  if (!settingsSaveBtnNode || settingsSaveBtnNode.disabled) return;
  if (!authSession || !profileCompleted) {
    closeSettingsModal();
    return;
  }

  settingsSaveBtnNode.disabled = true;
  try {
    const config = await getSupabaseConfig();
    if (!config) {
      throw new Error("Supabase config missing.");
    }

    const encodedUserId = encodeURIComponent(config.userId);
    const existingRows = await supabaseRestRequest(
      `ai_user_profiles?select=age,metadata&user_id=eq.${encodedUserId}&limit=1`,
      {
        method: "GET",
        prefer: "return=representation",
      }
    ).catch(() => []);

    const existingRow = Array.isArray(existingRows) && existingRows.length ? existingRows[0] : null;
    const existingMetadata =
      existingRow?.metadata && typeof existingRow.metadata === "object" ? { ...existingRow.metadata } : {};

    await supabaseRestRequest("ai_user_profiles?on_conflict=user_id", {
      method: "POST",
      body: [
        {
          user_id: config.userId,
          full_name: String(settingsDraft.name || "").trim() || deriveSettingsName(),
          age: Number.parseInt(String(existingRow?.age || settingsDraft.age || SETTINGS_DEFAULT_AGE), 10) || 18,
          metadata: {
            ...existingMetadata,
            gender: settingsDraft.gender === "female" ? "female" : "male",
            updated_from: "loomless-ai-settings",
            updated_at: new Date().toISOString(),
          },
        },
      ],
      prefer: "resolution=merge-duplicates,return=representation",
    });

    settingsSavedSnapshot = getSettingsSnapshot();
    settingsProfileHydrated = true;
    syncSettingsModalUI();
    setStatus("Settings saved.");
    window.setTimeout(() => {
      closeSettingsModal();
    }, 550);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not save settings.");
    syncSettingsModalUI();
  }
}

function syncSettingsModalUI() {
  const displayName = String(settingsDraft.name || deriveSettingsName()).trim() || "LoomLess User";
  const email = getSettingsContactEmail();

  if (settingsProfileNameNode) {
    settingsProfileNameNode.textContent = displayName;
  }
  if (settingsProfileContactNode) {
    settingsProfileContactNode.textContent = email;
  }
  if (settingsAgeValueNode) {
    settingsAgeValueNode.textContent = settingsDraft.age || SETTINGS_DEFAULT_AGE;
  }
  if (settingsLocationValueNode) {
    settingsLocationValueNode.textContent = settingsDraft.location || deriveSettingsLocation();
  }
  if (settingsNameInputNode && settingsNameInputNode.value !== settingsDraft.name) {
    settingsNameInputNode.value = settingsDraft.name;
  }
  if (settingsMemoryInputNode && settingsMemoryInputNode.value !== settingsDraft.memory) {
    settingsMemoryInputNode.value = settingsDraft.memory;
  }

  syncSettingsChoiceButtons();
  syncSettingsMemoryCounter();
  syncSettingsSaveButton();
}

function syncSettingsChoiceButtons() {
  settingsGenderButtons.forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-settings-gender") === settingsDraft.gender);
  });

  settingsSidebarButtons.forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-settings-sidebar") === settingsDraft.sidebarMode);
  });
}

function syncSettingsMemoryCounter() {
  if (!settingsMemoryCounterNode) return;
  const count = String(settingsDraft.memory || "").length;
  settingsMemoryCounterNode.textContent = `${count} / ${SETTINGS_MEMORY_LIMIT}`;
}

function syncSettingsSaveButton() {
  if (!settingsSaveBtnNode) return;
  settingsSaveBtnNode.disabled = getSettingsSnapshot() === settingsSavedSnapshot;
}

function renderSavedSessions() {
  if (!savedSessionsListNode) return;
  savedSessionsListNode.innerHTML = "";

  const hasLocalSessions = localSessions.length > 0;
  const canShowSavedSessions = supabaseReady && authSession && profileCompleted;

  if (hasLocalSessions) {
    const localSectionNode = createSessionSection({
      label: "Local",
      count: localSessions.length,
      collapsible: true,
      expanded: localSectionExpanded,
    });
    const bodyNode = localSectionNode.querySelector(".session-section-body");
    if (bodyNode && localSectionExpanded) {
      localSessions.forEach((session) => {
        bodyNode.appendChild(createSessionListItem(session, { kind: "local" }));
      });
    }
    savedSessionsListNode.appendChild(localSectionNode);
  }

  if (canShowSavedSessions) {
    savedSessionsListNode.appendChild(createSessionSectionTitle("Saved"));

    if (savedSessionsLoading) {
      savedSessionsListNode.appendChild(createSessionEmptyState("Loading saved chats..."));
      return;
    }

    if (!savedSessions.length) {
      savedSessionsListNode.appendChild(createSessionEmptyState("No saved chats yet. Use Save in the header."));
    } else {
      savedSessions.forEach((session) => {
        savedSessionsListNode.appendChild(createSessionListItem(session, { kind: "saved" }));
      });
    }
    return;
  }

  if (!hasLocalSessions) {
    savedSessionsListNode.appendChild(createSessionEmptyState("No chats yet. Start a new chat."));
  }

  savedSessionsListNode.appendChild(createSessionEmptyState("Saved chats sync after sign-in."));
}

function createSessionSectionTitle(label) {
  const title = document.createElement("p");
  title.className = "session-section-title";
  title.textContent = label;
  return title;
}

function createSessionSection({ label, count = 0, collapsible = false, expanded = true }) {
  const section = document.createElement("section");
  section.className = "session-section";

  if (collapsible) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "session-section-toggle";
    toggle.setAttribute("data-session-section-toggle", label.toLowerCase());
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.innerHTML = `
      <span class="session-section-toggle-main">
        <span class="session-section-toggle-label">${label}</span>
        <span class="session-section-toggle-count">${count}</span>
      </span>
      ${iconHtml("chevronDown", "session-section-toggle-icon inline-icon-sm")}
    `;
    section.appendChild(toggle);
  } else {
    section.appendChild(createSessionSectionTitle(label));
  }

  const body = document.createElement("div");
  body.className = "session-section-body";
  body.hidden = collapsible ? !expanded : false;
  section.appendChild(body);

  return section;
}

function createSessionEmptyState(text) {
  const empty = document.createElement("p");
  empty.className = "saved-sessions-empty";
  empty.textContent = text;
  return empty;
}

function createSessionListItem(session, { kind }) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "saved-session-item";
  item.setAttribute("data-session-id", session.session_id);
  item.setAttribute("data-session-kind", kind);
  item.classList.toggle("active", session.session_id === currentSessionId);

  const content = document.createElement("div");
  content.className = "saved-session-content";

  const title = document.createElement("p");
  title.className = "saved-session-title";
  title.textContent = getSessionTitle(session);

  const meta = document.createElement("p");
  meta.className = "saved-session-meta";
  meta.textContent = kind === "local" ? formatLocalSessionMeta(session) : formatSessionMeta(session);
  content.append(title, meta);
  item.appendChild(content);

  const menuBtn = document.createElement("button");
  menuBtn.type = "button";
  menuBtn.className = "saved-session-menu-btn";
  menuBtn.setAttribute("data-session-action", "menu");
  menuBtn.setAttribute("data-session-id", session.session_id);
  menuBtn.setAttribute("data-session-kind", kind);
  menuBtn.title = kind === "local" ? "Local chat actions" : "Saved chat actions";
  menuBtn.innerHTML = iconHtml("menuMore", "inline-icon-sm");
  item.appendChild(menuBtn);

  return item;
}

function getSessionTitle(session) {
  const raw = String(session?.title || "").replace(/\s+/g, " ").trim();
  return raw || "LoomLess Chat";
}

function formatSessionMeta(session) {
  const count = Number(session?.message_count || 0);
  const stamp = String(session?.updated_at || session?.last_message_at || session?.created_at || "").trim();
  const time = stamp ? formatRelativeTime(stamp) : "recent";
  return `${count} msg${count === 1 ? "" : "s"} · ${time}`;
}

function formatLocalSessionMeta(session) {
  const count = Number(session?.message_count || 0);
  const stamp = String(session?.updated_at || session?.last_message_at || session?.created_at || "").trim();
  const time = stamp ? formatRelativeTime(stamp) : "recent";
  return `Local · ${count} msg${count === 1 ? "" : "s"} · ${time}`;
}

function formatRelativeTime(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time) || time <= 0) return "recent";
  const diff = Date.now() - time;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(time).toLocaleDateString();
}

async function refreshSavedSessions() {
  if (!supabaseReady || !authSession || !profileCompleted) {
    savedSessions = [];
    renderSavedSessions();
    return;
  }

  savedSessionsLoading = true;
  renderSavedSessions();

  try {
    const config = await getSupabaseConfig();
    if (!config) {
      savedSessions = [];
      return;
    }
    const encodedUserId = encodeURIComponent(config.userId);
    const rows = await supabaseRestRequest(
      `ai_chat_sessions?user_id=eq.${encodedUserId}&pinned=eq.true&select=session_id,title,pinned,last_model,message_count,created_at,updated_at,last_message_at,metadata&order=updated_at.desc`,
      {
        method: "GET",
      }
    );
    savedSessions = Array.isArray(rows) ? rows : [];
    sortSavedSessions();
  } catch (error) {
    savedSessions = [];
    const message = error instanceof Error ? error.message : "Could not load saved chats.";
    setStatus(message);
  } finally {
    savedSessionsLoading = false;
    renderSavedSessions();
  }
}

function sortSavedSessions() {
  savedSessions.sort((a, b) => {
    const aTime = new Date(a?.updated_at || a?.last_message_at || a?.created_at || 0).getTime();
    const bTime = new Date(b?.updated_at || b?.last_message_at || b?.created_at || 0).getTime();
    return bTime - aTime;
  });
}

function upsertSavedSessionCache(payload) {
  if (!payload?.session_id) return;
  const next = {
    session_id: payload.session_id,
    title: payload.title || "LoomLess Chat",
    pinned: true,
    last_model: payload.last_model || null,
    message_count: Number(payload.message_count || 0),
    created_at: payload.created_at || payload.last_message_at || new Date().toISOString(),
    updated_at: payload.updated_at || payload.last_message_at || new Date().toISOString(),
    last_message_at: payload.last_message_at || payload.updated_at || new Date().toISOString(),
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
  };

  const index = savedSessions.findIndex((item) => item.session_id === next.session_id);
  if (index >= 0) {
    savedSessions[index] = { ...savedSessions[index], ...next };
  } else {
    savedSessions.push(next);
  }
  sortSavedSessions();
}

function openSessionItemMenu(anchorButton, sessionId, kind = "saved") {
  if (!sessionItemMenuNode) return;
  const exists =
    kind === "local"
      ? localSessions.some((item) => item.session_id === sessionId)
      : savedSessions.some((item) => item.session_id === sessionId);
  if (!exists) return;

  activeSessionMenuSessionId = sessionId;
  activeSessionMenuKind = kind === "local" ? "local" : "saved";
  if (sessionMenuEditLabelNode) {
    sessionMenuEditLabelNode.textContent = activeSessionMenuKind === "local" ? "Rename local chat" : "Edit title";
  }
  if (sessionMenuDeleteLabelNode) {
    sessionMenuDeleteLabelNode.textContent =
      activeSessionMenuKind === "local" ? "Delete local chat" : "Unsave/Delete";
  }
  const rect = anchorButton.getBoundingClientRect();
  const menuWidth = 220;
  const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, rect.right - menuWidth));
  const top = Math.min(window.innerHeight - 120, Math.max(12, rect.bottom + 6));
  sessionItemMenuNode.style.left = `${left}px`;
  sessionItemMenuNode.style.top = `${top}px`;
  sessionItemMenuNode.hidden = false;
}

function closeSessionItemMenu() {
  if (!sessionItemMenuNode) return;
  sessionItemMenuNode.hidden = true;
  activeSessionMenuSessionId = "";
  activeSessionMenuKind = "";
}

function resolveSessionModeFromMessages(messages) {
  return Array.isArray(messages) && messages.some((item) => resolveMode(item?.mode) === CHAT_MODES.CODE)
    ? CHAT_MODES.CODE
    : CHAT_MODES.CHAT;
}

function clearSessionViewState() {
  latestUploadContext = "";
  clearPendingAttachments();
  clearImageGenerationHistory();
  closeModelPicker();
  closeUploadMenu();
  closeRegenerateMenu();
  closeImagePreviewModal();
  closeSettingsModal();
}

function buildHydratedRequestMeta(messages, messageIndex, messageMode, metadata) {
  if (messageMode !== CHAT_MODES.CHAT) return null;
  if (metadata?.requestMeta && typeof metadata.requestMeta === "object") {
    return metadata.requestMeta;
  }

  let userIndex = -1;
  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    if (normalizeMessageRole(messages[index]?.role) === "user") {
      userIndex = index;
      break;
    }
  }

  if (userIndex === -1) return null;

  return {
    prompt: String(messages[userIndex]?.content || ""),
    history: messages.slice(Math.max(0, userIndex - 8), userIndex).map((item) => ({
      role: normalizeMessageRole(item?.role),
      content: String(item?.content || ""),
    })),
    context: "",
    title: "",
    url: "",
    scope: "general",
    mode: CHAT_MODES.CHAT,
  };
}

function hydrateMessagesIntoView(messages) {
  chatHistory = [];
  messagesNode.innerHTML = "";

  if (!Array.isArray(messages) || !messages.length) {
    appendInitialPanelState();
    return;
  }

  messages.forEach((item, index) => {
    const role = normalizeMessageRole(item?.role);
    const metadata = item?.metadata && typeof item.metadata === "object" ? item.metadata : {};
    const messageMode = typeof item?.mode === "string" ? item.mode : CHAT_MODES.CHAT;
    appendMessage({
      role,
      text: String(item?.content || ""),
      includeInHistory: false,
      showAssistantActions: role === "assistant",
      historyMeta: {
        model: typeof item?.model === "string" ? item.model : null,
        mode: messageMode,
        createdAt:
          typeof item?.createdAt === "string"
            ? item.createdAt
            : typeof item?.created_at === "string"
              ? item.created_at
              : new Date().toISOString(),
        metadata,
      },
      requestMeta: role === "assistant" ? buildHydratedRequestMeta(messages, index, messageMode, metadata) : null,
    });
    chatHistory.push({
      role,
      content: String(item?.content || ""),
      model: typeof item?.model === "string" ? item.model : null,
      mode: messageMode,
      createdAt:
        typeof item?.createdAt === "string"
          ? item.createdAt
          : typeof item?.created_at === "string"
            ? item.created_at
            : new Date().toISOString(),
      metadata,
    });
  });
}

function applyLoadedSession({ sessionId, pinned, messages, statusText = "Chat loaded." }) {
  currentSessionId = sessionId;
  localStorage.setItem(STORAGE_CHAT_SESSION_ID, currentSessionId);
  isSessionPinned = pinned === true;
  savePinnedState(currentSessionId, isSessionPinned);
  lastPinnedSnapshotHash = "";

  clearSessionViewState();
  setActiveMode(resolveSessionModeFromMessages(messages));
  hydrateMessagesIntoView(messages);

  if (isSessionPinned && chatHistory.length > 0) {
    lastPinnedSnapshotHash = buildPinnedSnapshotHash(getChatHistoryForPersistence());
  }

  inputNode.value = "";
  autoResizeInput();
  syncPinSessionUI();
  renderSavedSessions();
  setStatus(statusText);
}

function openLocalSession(sessionId, { forceReload = false, skipPersistCurrent = false } = {}) {
  if (!sessionId || sending || pinActionBusy) return;
  closeSessionItemMenu();
  const existing = findLocalSessionById(sessionId);
  if (!existing) return;
  if (sessionId === currentSessionId && !forceReload) return;

  if (!skipPersistCurrent) {
    persistCurrentLocalSession({ render: false });
  }

  applyLoadedSession({
    sessionId,
    pinned: false,
    messages: existing.messages,
    statusText: "Local chat loaded.",
  });
}

async function openSavedSession(sessionId, { forceReload = false, skipPersistCurrent = false } = {}) {
  if (!sessionId || sending || pinActionBusy || savedSessionsLoading) return;
  closeSessionItemMenu();

  if (sessionId === currentSessionId && !forceReload) {
    return;
  }

  if (!skipPersistCurrent) {
    persistCurrentLocalSession({ render: false });
  }

  setStatus("Opening saved chat...");

  try {
    const config = await getSupabaseConfig();
    if (!config) {
      setStatus("Supabase config missing.");
      return;
    }
    const encodedSessionId = encodeURIComponent(sessionId);
    const encodedUserId = encodeURIComponent(config.userId);
    const rows = await supabaseRestRequest(
      `ai_chat_messages?session_id=eq.${encodedSessionId}&user_id=eq.${encodedUserId}&select=role,content,model,mode,created_at,message_index,metadata&order=message_index.asc`,
      {
        method: "GET",
      }
    );

    const normalizedRows = Array.isArray(rows) ? rows : [];
    applyLoadedSession({
      sessionId,
      pinned: true,
      messages: normalizedRows,
      statusText: "Saved chat loaded.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open saved chat.";
    setStatus(message);
  }
}

function normalizeMessageRole(role) {
  if (role === "assistant") return "assistant";
  if (role === "system") return "assistant";
  return "user";
}

async function handleEditSessionTitle() {
  const sessionId = activeSessionMenuSessionId;
  const sessionKind = activeSessionMenuKind;
  closeSessionItemMenu();
  if (!sessionId) return;

  if (sessionKind === "local") {
    handleEditLocalSessionTitle(sessionId);
    return;
  }

  const existing = savedSessions.find((item) => item.session_id === sessionId);
  if (!existing) return;
  const currentTitle = getSessionTitle(existing);
  const nextTitleRaw = window.prompt("Edit saved chat title:", currentTitle);
  if (nextTitleRaw === null) return;

  const nextTitle = String(nextTitleRaw).replace(/\s+/g, " ").trim();
  if (!nextTitle) {
    setStatus("Title cannot be empty.");
    return;
  }
  if (nextTitle.length > 120) {
    setStatus("Title must be 120 characters or less.");
    return;
  }

  try {
    const config = await getSupabaseConfig();
    if (!config) throw new Error("Supabase config missing.");
    const encodedSessionId = encodeURIComponent(sessionId);
    const encodedUserId = encodeURIComponent(config.userId);
    const nowIso = new Date().toISOString();

    await supabaseRestRequest(
      `ai_chat_sessions?session_id=eq.${encodedSessionId}&user_id=eq.${encodedUserId}`,
      {
        method: "PATCH",
        body: {
          title: nextTitle,
          updated_at: nowIso,
        },
        prefer: "return=minimal",
      }
    );

    upsertSavedSessionCache({
      ...existing,
      title: nextTitle,
      updated_at: nowIso,
    });
    renderSavedSessions();
    setStatus("Saved chat title updated.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update title.";
    setStatus(message);
  }
}

function handleEditLocalSessionTitle(sessionId) {
  const existing = findLocalSessionById(sessionId);
  if (!existing) return;

  const currentTitle = getSessionTitle(existing);
  const nextTitleRaw = window.prompt("Rename local chat:", currentTitle);
  if (nextTitleRaw === null) return;

  const nextTitle = String(nextTitleRaw).replace(/\s+/g, " ").trim();
  if (!nextTitle) {
    setStatus("Title cannot be empty.");
    return;
  }
  if (nextTitle.length > 120) {
    setStatus("Title must be 120 characters or less.");
    return;
  }

  const index = localSessions.findIndex((item) => item.session_id === sessionId);
  if (index === -1) return;

  localSessions[index] = {
    ...localSessions[index],
    title: nextTitle,
    custom_title: true,
    updated_at: new Date().toISOString(),
  };
  sortLocalSessions();
  saveLocalSessions();
  renderSavedSessions();
  setStatus("Local chat renamed.");
}

async function handleDeleteSession() {
  if (activeSessionMenuKind === "local") {
    handleDeleteLocalSession();
    return;
  }
  await handleDeleteSavedSession();
}

function handleDeleteLocalSession() {
  const sessionId = activeSessionMenuSessionId;
  closeSessionItemMenu();
  if (!sessionId) return;

  const existing = findLocalSessionById(sessionId);
  if (!existing) return;

  const title = getSessionTitle(existing);
  const confirmed = window.confirm(`Delete local chat "${title}" from this device?`);
  if (!confirmed) return;

  removeLocalSessionById(sessionId, { render: false });

  if (sessionId === currentSessionId) {
    startNewChatSession({ persistCurrent: false });
  } else {
    renderSavedSessions();
  }

  setStatus("Local chat deleted.");
}

async function handleDeleteSavedSession() {
  const sessionId = activeSessionMenuSessionId;
  closeSessionItemMenu();
  if (!sessionId) return;

  const existing = savedSessions.find((item) => item.session_id === sessionId);
  if (!existing) return;

  const title = getSessionTitle(existing);
  const firstConfirm = window.confirm(`Unsave "${title}"?`);
  if (!firstConfirm) return;
  const secondConfirm = window.confirm("This will permanently delete this saved chat from cloud. Continue?");
  if (!secondConfirm) return;

  try {
    await deleteSavedSessionFromSupabaseById(sessionId);
    savedSessions = savedSessions.filter((item) => item.session_id !== sessionId);
    if (sessionId === currentSessionId) {
      isSessionPinned = false;
      savePinnedState(currentSessionId, false);
      lastPinnedSnapshotHash = "";
      persistCurrentLocalSession({ render: false });
      syncPinSessionUI();
    }
    renderSavedSessions();
    setStatus("Saved chat deleted.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete saved chat.";
    setStatus(message);
  }
}

async function handleNewChat() {
  if (sending || pinActionBusy) return;

  if (activeMode === CHAT_MODES.IMAGE) {
    setActiveMode(CHAT_MODES.CHAT);
  }
  startNewChatSession();
}

function startNewChatSession({ persistCurrent = true } = {}) {
  if (persistCurrent) {
    persistCurrentLocalSession({ render: false });
  }
  closeModelPicker();
  closeUploadMenu();
  closeRegenerateMenu();
  closeSessionItemMenu();
  closeImagePreviewModal();
  clearPendingAttachments();
  clearImageGenerationHistory();

  chatHistory = [];
  latestUploadContext = "";
  lastPinnedSnapshotHash = "";

  currentSessionId = createSessionId();
  localStorage.setItem(STORAGE_CHAT_SESSION_ID, currentSessionId);
  isSessionPinned = loadPinnedState(currentSessionId);

  messagesNode.innerHTML = "";
  appendInitialPanelState();

  inputNode.value = "";
  autoResizeInput();
  syncPinSessionUI();
  renderSavedSessions();
  setStatus("Started a new chat.");
}

async function handlePinSessionToggle() {
  if (sending || pinActionBusy) return;
  if (activeMode === CHAT_MODES.IMAGE) {
    setStatus("Save is disabled in Image mode.");
    return;
  }
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
    setStatus("Sign in required for cloud save.");
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
      removeLocalSessionById(currentSessionId, { render: false });
      await refreshSavedSessions();
      setStatus("Chat saved to Supabase.");
    } else {
      await deletePinnedSessionFromSupabase();
      isSessionPinned = false;
      savePinnedState(currentSessionId, false);
      lastPinnedSnapshotHash = "";
      persistCurrentLocalSession({ render: false });
      await refreshSavedSessions();
      setStatus("Chat unsaved.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save action failed.";
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
  return chatHistory
    .filter((item) => resolveMode(item?.mode) !== CHAT_MODES.IMAGE)
    .map((item, index) => ({
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
      const message = error instanceof Error ? error.message : "Save sync failed.";
      setStatus(`Save sync failed: ${message}`);
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

  upsertSavedSessionCache(sessionPayload);

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
  renderSavedSessions();
}

async function deletePinnedSessionFromSupabase() {
  await deleteSavedSessionFromSupabaseById(currentSessionId);
  savedSessions = savedSessions.filter((item) => item.session_id !== currentSessionId);
  renderSavedSessions();
}

async function deleteSavedSessionFromSupabaseById(sessionId) {
  const config = await getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase config missing.");
  }
  const encodedSessionId = encodeURIComponent(sessionId);
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
  historyMeta = null,
  requestMeta = null,
  showAssistantActions = includeInHistory,
}) {
  const messageMode = historyMeta?.mode || activeMode;
  const shouldRenderAssistantActions = role === "assistant" && showAssistantActions;
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const bubble = document.createElement("article");
  bubble.className = "msg-bubble";
  bubble.innerHTML = markdownToHtml(text);

  if (shouldRenderAssistantActions && hasFencedCodeBlocks(text)) {
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

    if (messageMode === CHAT_MODES.CODE) {
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

  if (shouldRenderAssistantActions && messageMode === CHAT_MODES.CHAT) {
    bubble.appendChild(createChatModeActionRow({ answerText: text, requestMeta }));
  }

  if (shouldRenderAssistantActions && messageMode === CHAT_MODES.WRITER) {
    bubble.appendChild(createWriterModeActionRow({ answerText: text }));
  }

  row.appendChild(bubble);
  messagesNode.appendChild(row);
  messagesNode.scrollTop = messagesNode.scrollHeight;

  if (includeInHistory) {
    const persistedMetadata =
      historyMeta?.metadata && typeof historyMeta.metadata === "object" ? { ...historyMeta.metadata } : {};
    if (role === "assistant" && requestMeta && messageMode === CHAT_MODES.CHAT) {
      persistedMetadata.requestMeta = requestMeta;
    }

    row.setAttribute("data-history-index", String(chatHistory.length));
    chatHistory.push({
      role,
      content: text,
      model: historyMeta?.model || null,
      mode: historyMeta?.mode || activeMode,
      createdAt: historyMeta?.createdAt || new Date().toISOString(),
      metadata: persistedMetadata,
    });
    if (chatHistory.length > 16) {
      chatHistory = chatHistory.slice(-16);
    }
    requestPinnedSessionSync();
    persistCurrentLocalSession();
  }

  return row;
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

  actionRow.append(copyBtn, downloadBtn);

  if (requestMeta) {
    const regenerateBtn = document.createElement("button");
    regenerateBtn.type = "button";
    regenerateBtn.className = "msg-regenerate-btn";
    regenerateBtn.innerHTML = labelWithIcon("regenerate", "Regenerate");
    regenerateBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openRegenerateMenu(regenerateBtn, requestMeta);
    });
    actionRow.appendChild(regenerateBtn);
  }

  return actionRow;
}

function createWriterModeActionRow({ answerText }) {
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

  const pdfBtn = document.createElement("button");
  pdfBtn.type = "button";
  pdfBtn.className = "msg-download-btn";
  pdfBtn.innerHTML = labelWithIcon("download", "PDF");
  pdfBtn.addEventListener("click", async () => {
    pdfBtn.disabled = true;
    try {
      await downloadWriterDocumentPdf(answerText);
      setStatus("Writer document exported as PDF.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not export PDF.";
      appendMessage({
        role: "assistant",
        text: `Writer PDF export failed.\n\n${message}`,
        includeInHistory: false,
      });
      setStatus("Writer PDF export failed.");
    } finally {
      pdfBtn.disabled = false;
    }
  });

  const docxBtn = document.createElement("button");
  docxBtn.type = "button";
  docxBtn.className = "msg-docx-btn";
  docxBtn.innerHTML = labelWithIcon("download", "DOCX");
  docxBtn.addEventListener("click", async () => {
    docxBtn.disabled = true;
    try {
      await downloadWriterDocumentDocx(answerText);
      setStatus("Writer document exported as DOCX.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not export DOCX.";
      appendMessage({
        role: "assistant",
        text: `Writer DOCX export failed.\n\n${message}`,
        includeInHistory: false,
      });
      setStatus("Writer DOCX export failed.");
    } finally {
      docxBtn.disabled = false;
    }
  });

  actionRow.append(copyBtn, pdfBtn, docxBtn);
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
  persistCurrentLocalSession();
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
  const requestState = beginActiveRequest({
    kind: "regenerate",
    loadingRow,
  });

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
    }, registerActiveRequestId(createRequestId(), requestState));

    if (requestState.stopped || response?.aborted) {
      throw createUserAbortError();
    }

    if (!response?.ok || !response?.reply) {
      throw new Error(response?.error || "Could not regenerate response.");
    }

    removeMessageRow(loadingRow);
    appendMessage({
      role: "assistant",
      text: response.reply,
      requestMeta,
    });
    setStatus(`Regenerated with ${model?.name || modelApi}.`);
  } catch (error) {
    if (isUserAbortError(error)) {
      handleStoppedRequest(requestState);
      return;
    }
    removeMessageRow(loadingRow);
    const message = error instanceof Error ? error.message : "Regenerate failed.";
    appendMessage({
      role: "assistant",
      text: `Regenerate failed.\n\n${message}`,
      includeInHistory: false,
    });
    setStatus("Regenerate failed.");
  } finally {
    finishActiveRequest(requestState);
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

async function downloadWriterDocumentPdf(rawText) {
  const content = String(rawText || "").trim();
  if (!content) {
    throw new Error("No writer document available to export.");
  }

  const jsPdfCtor = window.jspdf?.jsPDF;
  if (typeof jsPdfCtor !== "function") {
    throw new Error("PDF engine is not loaded.");
  }

  const doc = new jsPdfCtor({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const logoDataUrl = await loadAssetAsDataUrl("./icon.png").catch(() => "");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, y - 6, 24, 24);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(18, 31, 58);
  doc.text("LoomLess Writer", margin + 32, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 118, 170);
  doc.text(APP_URL, margin + 32, y + 27);
  doc.text(`Exported: ${new Date().toLocaleString()}`, pageWidth - margin, y + 27, { align: "right" });
  y += 44;

  const blocks = parseMarkdownDocumentBlocks(content);
  for (const block of blocks) {
    if (block.type === "blank") {
      y += 8;
      continue;
    }

    if (block.type === "table") {
      const tableLines = flattenTableForPdf(block);
      for (const line of tableLines) {
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(44, 58, 84);
        const lines = doc.splitTextToSize(sanitizePdfText(line), contentWidth);
        for (const entry of lines) {
          y = ensurePdfRoom(doc, y, pageHeight, margin, 12);
          doc.text(entry, margin, y);
          y += 12;
        }
      }
      y += 6;
      continue;
    }

    const flattenedLines = flattenWriterBlockForPdf(block);
    const fontName = block.type === "code" ? "courier" : "helvetica";
    const fontStyle = block.type === "heading" ? "bold" : "normal";
    const fontSize = block.type === "heading" ? Math.max(13, 18 - block.level * 2) : block.type === "code" ? 9 : 10;
    const lineHeight = block.type === "heading" ? fontSize + 3 : block.type === "code" ? 12 : 14;

    doc.setFont(fontName, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(block.type === "heading" ? 18 : 32, block.type === "heading" ? 31 : 45, block.type === "heading" ? 58 : 72);

    for (const line of flattenedLines) {
      const rendered = doc.splitTextToSize(sanitizePdfText(line), contentWidth);
      for (const entry of rendered) {
        y = ensurePdfRoom(doc, y, pageHeight, margin, lineHeight);
        doc.text(entry, margin, y);
        y += lineHeight;
      }
    }
    y += block.type === "heading" ? 6 : 4;
  }

  doc.save(`${buildWriterFileBaseName(content)}.pdf`);
}

async function downloadWriterDocumentDocx(rawText) {
  const content = String(rawText || "").trim();
  if (!content) {
    throw new Error("No writer document available to export.");
  }
  if (!window.JSZip || typeof window.JSZip !== "function") {
    throw new Error("DOCX engine is not loaded.");
  }

  const zip = new window.JSZip();
  const blocks = parseMarkdownDocumentBlocks(content);
  const hyperlinkMap = new Map();
  let nextRelationshipId = 2;

  const getHyperlinkId = (url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return "";
    if (hyperlinkMap.has(safeUrl)) return hyperlinkMap.get(safeUrl);
    const relationshipId = `rId${nextRelationshipId}`;
    nextRelationshipId += 1;
    hyperlinkMap.set(safeUrl, relationshipId);
    return relationshipId;
  };

  const bodyXml = blocks
    .map((block) => buildDocxBlockXml(block, getHyperlinkId))
    .filter(Boolean)
    .join("");

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  const wordFolder = zip.folder("word");
  wordFolder?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml || buildDocxParagraphXml(" ")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  wordFolder?.file(
    "styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:eastAsia="Aptos" w:cs="Aptos"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:b/><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:b/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
</w:styles>`
  );

  const relationshipXml = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`,
    `  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
    ...Array.from(hyperlinkMap.entries()).map(
      ([url, relationshipId]) =>
        `  <Relationship Id="${xmlEscapeAttribute(relationshipId)}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscapeAttribute(url)}" TargetMode="External"/>`
    ),
    `</Relationships>`,
  ].join("\n");
  wordFolder?.folder("_rels")?.file("document.xml.rels", relationshipXml);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  triggerBlobDownload(blob, `${buildWriterFileBaseName(content)}.docx`);
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

function parseMarkdownDocumentBlocks(rawText) {
  const source = String(rawText || "").replace(/\r/g, "");
  if (!source.trim()) return [];

  const lines = source.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = String(lines[index] || "");
    const trimmed = currentLine.trim();

    if (!trimmed) {
      blocks.push({ type: "blank" });
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const lang = trimmed.replace(/^```/, "").trim().toLowerCase();
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(String(lines[index] || "").trim())) {
        codeLines.push(String(lines[index] || ""));
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({
        type: "code",
        lang,
        text: codeLines.join("\n").trim(),
      });
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];
      while (index < lines.length && /^>\s?/.test(String(lines[index] || "").trim())) {
        quoteLines.push(String(lines[index] || "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({
        type: "quote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(String(lines[index] || "").trim())) {
        items.push(String(lines[index] || "").trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({
        type: "list",
        ordered: false,
        items,
      });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(String(lines[index] || "").trim())) {
        items.push(String(lines[index] || "").trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({
        type: "list",
        ordered: true,
        items,
      });
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const tableLines = [String(lines[index] || ""), String(lines[index + 1] || "")];
      index += 2;
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(String(lines[index] || "").trim())) {
        tableLines.push(String(lines[index] || ""));
        index += 1;
      }
      blocks.push({
        type: "table",
        headers: splitMarkdownTableRow(tableLines[0]),
        rows: tableLines.slice(2).map(splitMarkdownTableRow),
      });
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const line = String(lines[index] || "");
      const lineTrimmed = line.trim();
      if (!lineTrimmed) break;
      if (paragraphLines.length > 0 && isBlockStarter(lineTrimmed)) break;
      paragraphLines.push(lineTrimmed);
      index += 1;
    }
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
  }

  return blocks;
}

function flattenTableForPdf(block) {
  const headers = Array.isArray(block?.headers) ? block.headers : [];
  const rows = Array.isArray(block?.rows) ? block.rows : [];
  const lines = [];
  if (headers.length) {
    lines.push(headers.map((item) => stripInlineMarkdownForPdf(item)).join(" | "));
    lines.push(headers.map(() => "---").join(" | "));
  }
  rows.forEach((row) => {
    lines.push(headers.map((_, index) => stripInlineMarkdownForPdf(row[index] || "")).join(" | "));
  });
  return lines;
}

function flattenWriterBlockForPdf(block) {
  if (!block || typeof block !== "object") return [];
  if (block.type === "heading") return [stripInlineMarkdownForPdf(block.text)];
  if (block.type === "code") return String(block.text || "").split("\n");
  if (block.type === "list") {
    return (Array.isArray(block.items) ? block.items : []).map((item, index) =>
      block.ordered ? `${index + 1}. ${stripInlineMarkdownForPdf(item)}` : `- ${stripInlineMarkdownForPdf(item)}`
    );
  }
  if (block.type === "quote") return [`> ${stripInlineMarkdownForPdf(block.text)}`];
  return [stripInlineMarkdownForPdf(block.text)];
}

function ensurePdfRoom(doc, y, pageHeight, margin, nextHeight) {
  if (y + nextHeight <= pageHeight - margin) {
    return y;
  }
  doc.addPage();
  return margin;
}

function buildWriterFileBaseName(rawText) {
  const blocks = parseMarkdownDocumentBlocks(rawText);
  const firstHeading = blocks.find((item) => item.type === "heading" && item.text);
  const fallbackText =
    firstHeading?.text ||
    blocks.find((item) => typeof item.text === "string" && item.text.trim())?.text ||
    "writer-document";
  const slug = String(fallbackText || "")
    .toLowerCase()
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `loomless-${slug || "writer-document"}`;
}

function buildDocxBlockXml(block, getHyperlinkId) {
  if (!block || typeof block !== "object") return "";
  if (block.type === "blank") return "<w:p/>";
  if (block.type === "heading") {
    return buildDocxParagraphXml(block.text, { styleId: `Heading${Math.min(3, Math.max(1, Number(block.level) || 1))}` }, getHyperlinkId);
  }
  if (block.type === "paragraph") return buildDocxParagraphXml(block.text, {}, getHyperlinkId);
  if (block.type === "quote") return buildDocxParagraphXml(`> ${block.text}`, {}, getHyperlinkId);
  if (block.type === "list") {
    return (Array.isArray(block.items) ? block.items : [])
      .map((item, index) =>
        buildDocxParagraphXml(block.ordered ? `${index + 1}. ${item}` : `• ${item}`, {}, getHyperlinkId)
      )
      .join("");
  }
  if (block.type === "code") {
    return String(block.text || "")
      .split("\n")
      .map((line) => buildDocxParagraphXml(line || " ", { monospace: true }, getHyperlinkId))
      .join("");
  }
  if (block.type === "table") return buildDocxTableXml(block, getHyperlinkId);
  return "";
}

function buildDocxTableXml(block, getHyperlinkId) {
  const headers = Array.isArray(block?.headers) ? block.headers : [];
  if (!headers.length) return "";
  const rows = Array.isArray(block?.rows) ? block.rows : [];
  const allRows = [headers, ...rows];
  const rowXml = allRows
    .map((row, rowIndex) => {
      const cells = headers.map((_, cellIndex) => {
        const cellText = row[cellIndex] || "";
        return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${buildDocxParagraphXml(cellText, rowIndex === 0 ? { bold: true } : {}, getHyperlinkId)}</w:tc>`;
      });
      return `<w:tr>${cells.join("")}</w:tr>`;
    })
    .join("");

  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="8EA9D8"/><w:left w:val="single" w:sz="8" w:space="0" w:color="8EA9D8"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="8EA9D8"/><w:right w:val="single" w:sz="8" w:space="0" w:color="8EA9D8"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="C7D8F2"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="C7D8F2"/></w:tblBorders></w:tblPr>${rowXml}</w:tbl>`;
}

function buildDocxParagraphXml(text, options = {}, getHyperlinkId = () => "") {
  const runs = buildDocxRunsXml(text, options, getHyperlinkId) || `<w:r><w:t xml:space="preserve"> </w:t></w:r>`;
  const styleXml = options.styleId ? `<w:pStyle w:val="${xmlEscapeAttribute(options.styleId)}"/>` : "";
  return `<w:p>${styleXml ? `<w:pPr>${styleXml}</w:pPr>` : ""}${runs}</w:p>`;
}

function buildDocxRunsXml(text, options = {}, getHyperlinkId = () => "") {
  const segments = parseDocxInlineSegments(text);
  return segments
    .map((segment) => {
      if (segment.type === "link") {
        const relationshipId = getHyperlinkId(segment.url);
        if (!relationshipId) return buildDocxTextRunXml(segment.text, options);
        return `<w:hyperlink r:id="${xmlEscapeAttribute(relationshipId)}"><w:r><w:rPr><w:color w:val="2D66FF"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${xmlEscapeText(segment.text)}</w:t></w:r></w:hyperlink>`;
      }
      return buildDocxTextRunXml(segment.text, options);
    })
    .join("");
}

function buildDocxTextRunXml(text, options = {}) {
  const props = [];
  if (options.bold) props.push("<w:b/>");
  if (options.monospace) {
    props.push('<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:eastAsia="Courier New" w:cs="Courier New"/>');
  }
  const propsXml = props.length ? `<w:rPr>${props.join("")}</w:rPr>` : "";
  return `<w:r>${propsXml}<w:t xml:space="preserve">${xmlEscapeText(text || " ")}</w:t></w:r>`;
}

function parseDocxInlineSegments(text) {
  const source = String(text || "");
  const segments = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match = regex.exec(source);

  while (match) {
    if (match.index > lastIndex) {
      const plain = stripDocxInlineDecorators(source.slice(lastIndex, match.index));
      if (plain) segments.push({ type: "text", text: plain });
    }
    const label = stripDocxInlineDecorators(match[1] || "");
    const safeUrl = sanitizeUrl(match[2] || "");
    if (label) {
      if (safeUrl) segments.push({ type: "link", text: label, url: safeUrl });
      else segments.push({ type: "text", text: label });
    }
    lastIndex = regex.lastIndex;
    match = regex.exec(source);
  }

  if (lastIndex < source.length) {
    const tail = stripDocxInlineDecorators(source.slice(lastIndex));
    if (tail) segments.push({ type: "text", text: tail });
  }

  return segments.length ? segments : [{ type: "text", text: stripDocxInlineDecorators(source) }];
}

function stripDocxInlineDecorators(text) {
  return String(text || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function xmlEscapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function xmlEscapeAttribute(value) {
  return xmlEscapeText(value).replace(/"/g, "&quot;");
}

function triggerBlobDownload(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
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

function removeHistoryEntryForRow(row) {
  if (!(row instanceof HTMLElement)) return;
  const rawIndex = row.getAttribute("data-history-index");
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 0 || index >= chatHistory.length) {
    return;
  }

  chatHistory.splice(index, 1);

  let nextIndex = 0;
  Array.from(messagesNode.querySelectorAll(".msg-row[data-history-index]")).forEach((node) => {
    if (node === row) return;
    node.setAttribute("data-history-index", String(nextIndex));
    nextIndex += 1;
  });

  requestPinnedSessionSync();
  persistCurrentLocalSession();
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
  const isWriterMode = activeMode === CHAT_MODES.WRITER;
  const modePlaceholder =
    activeMode === CHAT_MODES.WRITER
      ? "Describe the blog, article, email, script, or copy you want written..."
      : activeMode === CHAT_MODES.CODE
      ? "Ask for code, scripts, components, or full templates..."
      : isImageMode
        ? "Describe the image you want to generate..."
        : "Ask anything...";

  inputNode.placeholder = modePlaceholder;
  if (chatPanelNode) {
    chatPanelNode.classList.toggle("image-mode", isImageMode);
  }
  if (chatHeaderNode) {
    chatHeaderNode.hidden = isImageMode;
  }
  if (messagesNode) {
    messagesNode.hidden = isImageMode;
  }
  if (imageModeStageNode) {
    imageModeStageNode.hidden = !isImageMode;
  }
  if (modeTabsWrapNode) {
    modeTabsWrapNode.hidden = isImageMode;
  }
  if (composerActionsNode) {
    composerActionsNode.hidden = isImageMode;
  }
  modeTabNodes.forEach((node) => {
    node.disabled = sending;
  });
  inputNode.disabled = sending;
  sendBtn.disabled = sending ? activeRequestState?.stopEnabled !== true : false;
  uploadBtnNode.disabled = sending;
  uploadBtnNode.hidden = !isChatMode;
  if (uploadWrapNode) {
    uploadWrapNode.hidden = !isChatMode;
  }
  modelPickerBtn.hidden = isImageMode;
  modelPickerBtn.disabled = sending || isImageMode;
  syncPinSessionUI();
  if (!isChatMode) {
    closeUploadMenu();
  }

  if (!isChatMode && hasPendingAttachments()) {
    clearPendingAttachments();
    latestUploadContext = "";
  }

  if (isImageMode) {
    modeNoteNode.hidden = true;
    modeNoteNode.textContent = "";
  } else if (isWriterMode) {
    modeNoteNode.hidden = false;
    modeNoteNode.textContent =
      "Writer mode is tuned for long-form, humanized writing with Meta Llama models only.";
  } else if (activeMode === CHAT_MODES.CODE) {
    modeNoteNode.hidden = false;
    modeNoteNode.textContent =
      "Code mode uses high-output generation and code-focused model selection.";
  } else {
    modeNoteNode.hidden = true;
    modeNoteNode.textContent = "";
  }
  const disclaimerTextNode =
    modelSpeedDisclaimerNode?.querySelector(":scope > span:last-child") || modelSpeedDisclaimerNode?.children?.[1];
  if (disclaimerTextNode instanceof HTMLElement) {
    disclaimerTextNode.innerHTML = isImageMode ? IMAGE_MODE_SPEED_DISCLAIMER : DEFAULT_MODEL_SPEED_DISCLAIMER;
  }
  syncSidebarFeatureButtons();
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
  if (chatHistory.length === 0) {
    messagesNode.innerHTML = "";
    appendInitialPanelState();
  }
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
  if (activeMode === CHAT_MODES.IMAGE || activeMode === CHAT_MODES.WRITER) return;
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

    if (isMarkdownTableStart(lines, index)) {
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index].trim())) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderMarkdownTable(tableLines));
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
    /^\d+\.\s+/.test(text) ||
    /^\s*\|.*\|\s*$/.test(text)
  );
}

function isMarkdownTableStart(lines, index) {
  if (index + 1 >= lines.length) return false;
  const header = String(lines[index] || "").trim();
  const separator = String(lines[index + 1] || "").trim();
  return /^\|.*\|$/.test(header) && /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(separator);
}

function splitMarkdownTableRow(line) {
  return String(line || "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return "";
  const headerCells = splitMarkdownTableRow(lines[0]);
  if (!headerCells.length) return "";

  const bodyRows = lines.slice(2).map(splitMarkdownTableRow).filter((row) => row.some((cell) => cell));
  const headHtml = `<thead><tr>${headerCells.map((cell) => `<th>${formatInlineMarkdown(cell)}</th>`).join("")}</tr></thead>`;
  const bodyHtml = bodyRows.length
    ? `<tbody>${bodyRows
        .map(
          (row) =>
            `<tr>${headerCells
              .map((_, cellIndex) => `<td>${formatInlineMarkdown(row[cellIndex] || "")}</td>`)
              .join("")}</tr>`
        )
        .join("")}</tbody>`
    : "";

  return `<div class="markdown-table-wrap"><table class="markdown-table">${headHtml}${bodyHtml}</table></div>`;
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
  setStatus(`${getPendingAttachmentCount()} attachment(s) ready.`);
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
  setStatus(`${getPendingAttachmentCount()} attachment(s) ready.`);
}

function requestImageDescribe(payload, requestId = createRequestId()) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "LOOMLESS_AI_DESCRIBE_IMAGE", requestId, ...payload }, (response) => {
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
}

function removePendingAttachment(uploadId) {
  pendingImageUploads = pendingImageUploads.filter((item) => item.id !== uploadId);
  pendingDocumentUploads = pendingDocumentUploads.filter((item) => item.id !== uploadId);
  renderPendingUploadPreview();
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

function getDefaultModelOptionForMode(mode = activeMode) {
  const visible = getVisibleModelsForMode(mode);
  if (!visible.length) {
    return MODEL_OPTIONS.find((model) => model.apiModel === DEFAULT_MODEL_API) || MODEL_OPTIONS[0];
  }
  if (resolveMode(mode) === CHAT_MODES.WRITER) {
    return visible.find((model) => model.apiModel === DEFAULT_WRITER_MODEL_API) || visible[0];
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
    return MODEL_OPTIONS.filter((model) => ENABLED_IMAGE_MODE_MODELS.has(model.apiModel));
  }
  if (resolvedMode === CHAT_MODES.WRITER) {
    return MODEL_OPTIONS.filter((model) => !IMAGE_ONLY_MODELS.has(model.apiModel) && model.apiModel.startsWith("meta/"));
  }
  return MODEL_OPTIONS.filter((model) => !IMAGE_ONLY_MODELS.has(model.apiModel));
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
  if (mode === CHAT_MODES.WRITER) return CHAT_MODES.WRITER;
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
