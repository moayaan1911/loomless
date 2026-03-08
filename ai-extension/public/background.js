const STORAGE_NIM_API_KEY = "loomless_ai_nim_api_key";
const PRIMARY_NIM_MODEL = "nvidia/nemotron-3-nano-30b-a3b";
const VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";
const FALLBACK_NIM_MODEL = "minimaxai/minimax-m2.5";
const WRITE_MODEL = "meta/llama-3.3-70b-instruct";
const CHAT_MODEL = PRIMARY_NIM_MODEL;
const CODE_CHAT_MAX_TOKENS = 100000;
const CODE_CHAT_FALLBACK_TOKENS = 12000;
const WRITER_CHAT_MAX_TOKENS = 100000;
const WRITER_CHAT_FALLBACK_TOKENS = 24000;
const WRITER_MODEL = "meta/llama-3.2-3b-instruct";
const IMAGE_GEN_MODEL = "black-forest-labs/flux.1-dev";
const CHAT_MODES = {
  CHAT: "chat",
  WRITER: "writer",
  CODE: "code",
};
const IMAGE_GEN_ALLOWED_MODELS = new Set([
  "black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-kontext-dev",
  "stabilityai/stable-diffusion-3-medium",
]);
const IMAGE_GEN_ENDPOINTS = {
  "black-forest-labs/flux.1-dev": "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev",
  "black-forest-labs/flux.1-schnell": "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-kontext-dev":
    "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev",
  "stabilityai/stable-diffusion-3-medium":
    "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium",
};
const CHAT_ALLOWED_MODELS = new Set([
  "minimaxai/minimax-m2.5",
  "qwen/qwen3.5-397b-a17b",
  "zai/glm5",
  "minimaxai/minimax-m2.1",
  "moonshotai/kimi-k2.5",
  "stepfun-ai/step-3.5-flash",
  "zai/glm4.7",
  "deepseek/deepseek-v3.2",
  "nvidia/nemotron-3-nano-30b-a3b",
  "mistralai/devstral-2-123b-instruct-2512",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "meta/llama-4-scout-17b-16e-instruct",
  "meta/llama-3.3-70b-instruct",
  "meta/llama-3.2-3b-instruct",
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-90b-vision-instruct",
  "meta/llama-3.2-1b-instruct",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama3-70b-instruct",
  "meta/llama3-8b-instruct",
  "microsoft/phi-4-mini-instruct",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
]);
const NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_OPENAI_IMAGE_ENDPOINT = "https://integrate.api.nvidia.com/v1/images/generations";
const NIM_CHAT_TIMEOUT_MS = 180000;
const NIM_VISION_TIMEOUT_MS = 150000;
const NIM_IMAGE_TIMEOUT_MS = 240000;
const USER_ABORT_MESSAGE = "Request stopped by user.";
const activeRequestControllers = new Map();
const canceledRequestIds = new Set();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "LOOMLESS_AI_ABORT_REQUEST") {
    const aborted = abortActiveRequest(message?.requestId);
    sendResponse({ ok: aborted });
    return false;
  }
  if (message?.type === "LOOMLESS_AI_SUMMARIZE") {
    summarizePage(message, sendResponse);
    return true;
  }
  if (message?.type === "LOOMLESS_AI_WRITE") {
    generateWriteDraft(message, sendResponse);
    return true;
  }
  if (message?.type === "LOOMLESS_AI_CHAT") {
    generateChatReply(message, sendResponse);
    return true;
  }
  if (message?.type === "LOOMLESS_AI_DESCRIBE_IMAGE") {
    describeUploadedImage(message, sendResponse);
    return true;
  }
  if (message?.type === "LOOMLESS_AI_IMAGE_GENERATE") {
    generateImage(message, sendResponse);
    return true;
  }
  return false;
});

async function summarizePage(message, sendResponse) {
  try {
    const { text, title, url, sourceType } = message || {};
    if (!text || typeof text !== "string") {
      sendResponse({ ok: false, error: "No readable content provided for summarization." });
      return;
    }

    const nimApiKey = await getStorageValue(STORAGE_NIM_API_KEY);
    if (!nimApiKey) {
      sendResponse({
        ok: false,
        error: "AI is not configured yet. Please add your API key and try again.",
      });
      return;
    }

    const prompt = buildSummaryPrompt({ title, url, text, sourceType });
    const result = await callNimWithFallback(nimApiKey, prompt);
    sendResponse({ ok: true, summary: result });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate summary.",
    });
  }
}

async function generateWriteDraft(message, sendResponse) {
  try {
    const { tone, format, prompt, context, title, url } = message || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      sendResponse({ ok: false, error: "Please enter what you want to write." });
      return;
    }

    const nimApiKey = await getStorageValue(STORAGE_NIM_API_KEY);
    if (!nimApiKey) {
      sendResponse({
        ok: false,
        error: "AI is not configured yet. Please add your API key and try again.",
      });
      return;
    }

    const writePrompt = buildWritePrompt({
      tone: sanitizeInput(tone, "professional"),
      format: sanitizeInput(format, "general"),
      prompt: prompt.trim(),
      context: typeof context === "string" ? context.slice(0, 8000) : "",
      title: typeof title === "string" ? title : "",
      url: typeof url === "string" ? url : "",
    });

    const rawOutput = await callModelWithConfig(nimApiKey, writePrompt, WRITE_MODEL, {
      temperature: 0.62,
      maxTokens: 520,
      systemPrompt:
        "You are an expert writing assistant. Follow tone and format exactly. Write naturally and human-like, with clean rhythm and specific wording. Never use em dashes. Do not include preambles, analysis, or meta commentary.",
      responseMode: "raw",
    });

    const cleaned = sanitizeWriteResponse(rawOutput);
    if (!cleaned) {
      sendResponse({ ok: false, error: "Could not generate writing output. Please try again." });
      return;
    }

    sendResponse({ ok: true, content: cleaned });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate writing output.",
    });
  }
}

async function generateChatReply(message, sendResponse) {
  const requestId = normalizeRequestId(message?.requestId);
  try {
    const { prompt, history, context, title, url, model, scope, mode } = message || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      sendResponse({ ok: false, error: "Please enter a message." });
      return;
    }

    const nimApiKey = await getStorageValue(STORAGE_NIM_API_KEY);
    if (!nimApiKey) {
      sendResponse({
        ok: false,
        error: "AI is not configured yet. Please add your API key and try again.",
      });
      return;
    }

    const promptText = prompt.trim();
    const historyItems = Array.isArray(history) ? history : [];
    const pageTitle = typeof title === "string" ? title : "";
    const pageUrl = typeof url === "string" ? url : "";
    const pageContext = typeof context === "string" ? context : "";
    const chatMode = resolveChatMode(mode);
    const selectedModel = resolveChatModel(model, chatMode);
    const chatScope = scope === "general" ? "general" : "page";
    const rawOutput = await callChatModelWithRetry(nimApiKey, {
      prompt: promptText,
      history: historyItems,
      context: pageContext,
      title: pageTitle,
      url: pageUrl,
      model: selectedModel,
      scope: chatScope,
      mode: chatMode,
      requestId,
    });

    let cleaned = sanitizeChatResponse(rawOutput, chatMode);
    if (shouldForceIdentityRetry(promptText, cleaned)) {
      const retryOutput = await callChatModelWithRetry(nimApiKey, {
        prompt: buildDirectAnswerRetryPrompt(promptText),
        history: historyItems,
        context: pageContext,
        title: pageTitle,
        url: pageUrl,
        model: selectedModel,
        scope: chatScope,
        mode: chatMode,
        requestId,
      });
      cleaned = sanitizeChatResponse(retryOutput, chatMode);
    }

    if (!cleaned) {
      sendResponse({ ok: false, error: "Could not generate a response. Please try again." });
      return;
    }

    sendResponse({ ok: true, reply: cleaned });
  } catch (error) {
    if (isUserAbortError(error, requestId)) {
      sendResponse({
        ok: false,
        error: USER_ABORT_MESSAGE,
        aborted: true,
      });
      return;
    }
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate chat response.",
    });
  } finally {
    clearCanceledRequest(requestId);
  }
}

async function describeUploadedImage(message, sendResponse) {
  const requestId = normalizeRequestId(message?.requestId);
  try {
    const { imageDataUrl, prompt } = message || {};
    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      sendResponse({ ok: false, error: "Please upload a valid image (PNG/JPG/JPEG)." });
      return;
    }

    const nimApiKey = await getStorageValue(STORAGE_NIM_API_KEY);
    if (!nimApiKey) {
      sendResponse({
        ok: false,
        error: "AI is not configured yet. Please add your API key and try again.",
      });
      return;
    }

    const description = await callVisionModel(nimApiKey, {
      imageDataUrl,
      prompt:
        typeof prompt === "string" && prompt.trim()
          ? prompt.trim()
          : "Analyze this image and return only short factual bullet points.",
      requestId,
    });

    const cleaned = sanitizeChatResponse(description);
    if (!cleaned) {
      sendResponse({ ok: false, error: "Could not describe this image. Please try another image." });
      return;
    }

    sendResponse({ ok: true, reply: cleaned, model: VISION_MODEL });
  } catch (error) {
    if (isUserAbortError(error, requestId)) {
      sendResponse({
        ok: false,
        error: USER_ABORT_MESSAGE,
        aborted: true,
      });
      return;
    }
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to analyze image.",
    });
  } finally {
    clearCanceledRequest(requestId);
  }
}

async function generateImage(message, sendResponse) {
  const requestId = normalizeRequestId(message?.requestId);
  try {
    const { prompt, model, strictModel } = message || {};
    const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";
    if (!cleanPrompt) {
      sendResponse({ ok: false, error: "Please enter an image prompt." });
      return;
    }

    const nimApiKey = await getStorageValue(STORAGE_NIM_API_KEY);
    if (!nimApiKey) {
      sendResponse({
        ok: false,
        error: "AI is not configured yet. Please add your API key and try again.",
      });
      return;
    }

    const selectedModel = resolveImageModel(model);
    const imageResult = await callImageGenerationWithFallback(nimApiKey, {
      prompt: cleanPrompt,
      model: selectedModel,
      strictModel: strictModel === true,
      requestId,
    });

    sendResponse({
      ok: true,
      imageDataUrl: imageResult.imageDataUrl,
      model: imageResult.modelUsed || selectedModel,
    });
  } catch (error) {
    if (isUserAbortError(error, requestId)) {
      sendResponse({
        ok: false,
        error: USER_ABORT_MESSAGE,
        aborted: true,
      });
      return;
    }
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate image.",
    });
  } finally {
    clearCanceledRequest(requestId);
  }
}

async function callChatModelWithRetry(apiKey, payload) {
  const contextAttempts = [4200, 2200, 900];
  const modelAttempts = uniqueModelAttempts(payload.model);
  const chatMode = resolveChatMode(payload.mode);
  let lastError = null;

  for (const contextLimit of contextAttempts) {
    for (const modelToTry of modelAttempts) {
      try {
        const isGeneral = payload.scope === "general";
        const trimmedContext = (payload.context || "").slice(0, contextLimit);
        const chatPrompt = buildChatPrompt({
          prompt: payload.prompt,
          history: payload.history,
          context: trimmedContext,
          title: isGeneral ? "" : payload.title,
          url: isGeneral ? "" : payload.url,
          model: modelToTry,
          scope: payload.scope,
          mode: chatMode,
        });

        return await callModelWithTokenBudgetRetry(apiKey, {
          prompt: chatPrompt,
          model: modelToTry,
          temperature: chatMode === CHAT_MODES.WRITER ? 0.72 : 0.35,
          maxTokens:
            chatMode === CHAT_MODES.WRITER
              ? WRITER_CHAT_MAX_TOKENS
              : chatMode === CHAT_MODES.CODE
                ? CODE_CHAT_MAX_TOKENS
                : 2200,
          fallbackMaxTokens:
            chatMode === CHAT_MODES.WRITER
              ? WRITER_CHAT_FALLBACK_TOKENS
              : CODE_CHAT_FALLBACK_TOKENS,
          systemPrompt: isGeneral
            ? buildGeneralSystemPrompt(chatMode)
            : buildPageAssistantSystemPrompt(chatMode),
          responseMode: "raw",
          requestId: payload.requestId,
        });
      } catch (error) {
        if (isUserAbortError(error, payload.requestId)) {
          throw error;
        }
        lastError = error;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const shouldRetryContext = message.includes("status 400") || message.includes("too long");
        const shouldRetryModel = shouldRetryWithFallbackModel(error, modelToTry);
        if (shouldRetryModel) {
          continue;
        }
        if (shouldRetryContext) {
          break;
        }
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error("Failed to generate chat response.");
}

async function callModelWithFallbackModel(apiKey, prompt, preferredModel, config) {
  const models = uniqueModelAttempts(preferredModel);
  let lastError = null;

  for (const model of models) {
    try {
      return await callModelWithTokenBudgetRetry(apiKey, {
        ...config,
        prompt,
        model,
      });
    } catch (error) {
      if (isUserAbortError(error, config?.requestId)) {
        throw error;
      }
      lastError = error;
      if (!shouldRetryWithFallbackModel(error, model)) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("Could not generate a response.");
}

async function callModelWithTokenBudgetRetry(apiKey, config) {
  const fallbackMaxTokens =
    Number(config?.fallbackMaxTokens) > 0 ? Number(config.fallbackMaxTokens) : CODE_CHAT_FALLBACK_TOKENS;
  try {
    return await callModelWithConfig(apiKey, config.prompt, config.model, config);
  } catch (error) {
    if (isUserAbortError(error, config?.requestId)) {
      throw error;
    }
    if (!shouldRetryWithLowerTokenBudget(error, config.maxTokens, fallbackMaxTokens)) {
      throw error;
    }
    return callModelWithConfig(apiKey, config.prompt, config.model, {
      ...config,
      maxTokens: fallbackMaxTokens,
    });
  }
}

function uniqueModelAttempts(preferredModel) {
  const models = [];
  if (preferredModel && typeof preferredModel === "string") {
    models.push(preferredModel.trim());
  }
  models.push(CHAT_MODEL);
  return Array.from(new Set(models.filter(Boolean)));
}

function shouldRetryWithLowerTokenBudget(error, attemptedTokens, fallbackTokens = CODE_CHAT_FALLBACK_TOKENS) {
  if (!error || attemptedTokens <= fallbackTokens) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("status 400") ||
    message.includes("max_tokens") ||
    message.includes("maximum") ||
    message.includes("too long") ||
    message.includes("token")
  );
}

function shouldRetryWithFallbackModel(error, attemptedModel) {
  if (!error || attemptedModel === CHAT_MODEL) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("status 404") || message.includes("model") || message.includes("not found");
}

async function callVisionModel(apiKey, payload) {
  const requestId = normalizeRequestId(payload?.requestId);
  const controller = createRequestAbortController(requestId);
  const timeout = setTimeout(() => controller.abort(), NIM_VISION_TIMEOUT_MS);

  try {
    const response = await fetch(NIM_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.15,
        max_tokens: 220,
        top_p: 0.9,
        messages: [
          {
            role: "system",
            content:
              "You are LoomLess GPT Vision. Return only visible facts in 4-6 concise bullet points. Keep each bullet under 18 words. No speculation.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: payload.prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: payload.imageDataUrl,
                },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `AI request failed with status ${response.status}`;
      throw new Error(message);
    }

    const content = extractContent(data);
    if (!content || typeof content !== "string") {
      throw new Error("AI returned an empty image analysis response.");
    }
    return content.trim();
  } catch (error) {
    if (isAbortError(error)) {
      if (isRequestCanceled(requestId)) {
        throw createUserAbortError();
      }
      throw new Error(
        "Image analysis timed out on this model. Please retry, use fewer/lighter images, or switch to a faster model."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    releaseRequestAbortController(requestId, controller);
  }
}

async function callImageGenerationWithFallback(apiKey, payload) {
  const requestedModel = resolveImageModel(payload?.model);
  const cleanPayload = {
    prompt: String(payload?.prompt || "").trim(),
    model: requestedModel,
    strictModel: payload?.strictModel === true,
    requestId: normalizeRequestId(payload?.requestId),
  };

  let primaryError = null;
  try {
    const imageDataUrl = await callModelSpecificImageEndpoint(apiKey, cleanPayload);
    return {
      imageDataUrl,
      modelUsed: cleanPayload.model,
    };
  } catch (error) {
    if (isUserAbortError(error, payload?.requestId)) {
      throw error;
    }
    primaryError = error;
  }

  if (cleanPayload.strictModel) {
    if (shouldRetryImageWithFallback(primaryError)) {
      const imageDataUrl = await callOpenAiImageEndpoint(apiKey, cleanPayload);
      return {
        imageDataUrl,
        modelUsed: cleanPayload.model,
      };
    }
    throw primaryError;
  }

  const directFallbackModel = pickDirectImageFallbackModel(cleanPayload.model, primaryError);
  if (directFallbackModel && directFallbackModel !== cleanPayload.model) {
    try {
      const imageDataUrl = await callModelSpecificImageEndpoint(apiKey, {
        ...cleanPayload,
        model: directFallbackModel,
      });
      return {
        imageDataUrl,
        modelUsed: directFallbackModel,
      };
    } catch (_fallbackModelError) {
      // Keep trying with OpenAI-compatible endpoint below.
    }
  }

  if (shouldRetryImageWithFallback(primaryError)) {
    try {
      const imageDataUrl = await callOpenAiImageEndpoint(apiKey, cleanPayload);
      return {
        imageDataUrl,
        modelUsed: cleanPayload.model,
      };
    } catch (openAiError) {
      if (cleanPayload.model !== IMAGE_GEN_MODEL) {
        try {
          const imageDataUrl = await callModelSpecificImageEndpoint(apiKey, {
            ...cleanPayload,
            model: IMAGE_GEN_MODEL,
          });
          return {
            imageDataUrl,
            modelUsed: IMAGE_GEN_MODEL,
          };
        } catch (_finalFallbackError) {
          throw openAiError;
        }
      }
      throw openAiError;
    }
  }

  throw primaryError;
}

function pickDirectImageFallbackModel(model, error) {
  const activeModel = resolveImageModel(model);
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || "").toLowerCase();
  const needsInputImage =
    message.includes("field required") ||
    message.includes("missing") ||
    message.includes("body.image") ||
    message.includes("match_input_image");

  if (activeModel === "black-forest-labs/flux.1-kontext-dev" && needsInputImage) {
    return "black-forest-labs/flux.1-dev";
  }

  if (
    activeModel === "stabilityai/stable-diffusion-3-medium" &&
    (message.includes("status 404") || message.includes("not found") || message.includes("unsupported"))
  ) {
    return "black-forest-labs/flux.1-dev";
  }

  return "";
}

async function callModelSpecificImageEndpoint(apiKey, payload) {
  const endpoint = IMAGE_GEN_ENDPOINTS[payload.model];
  if (!endpoint) {
    throw new Error("Selected image model is not supported.");
  }

  const requestId = normalizeRequestId(payload?.requestId);
  const controller = createRequestAbortController(requestId);
  const timeout = setTimeout(() => controller.abort(), NIM_IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json, image/*",
      },
      body: JSON.stringify({
        prompt: payload.prompt,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(parseImageApiError(errorText, response.status));
    }

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (contentType.startsWith("image/")) {
      const blob = await response.blob();
      return blobToDataUrl(blob);
    }

    const data = await response.json().catch(() => ({}));
    const imageDataUrl = extractImageDataUrlFromResponseData(data);
    if (!imageDataUrl) {
      throw new Error("Image model returned no image payload.");
    }
    return imageDataUrl;
  } catch (error) {
    if (isAbortError(error)) {
      if (isRequestCanceled(requestId)) {
        throw createUserAbortError();
      }
      throw new Error("Image generation timed out. Please retry with a shorter prompt.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    releaseRequestAbortController(requestId, controller);
  }
}

async function callOpenAiImageEndpoint(apiKey, payload) {
  const requestId = normalizeRequestId(payload?.requestId);
  const controller = createRequestAbortController(requestId);
  const timeout = setTimeout(() => controller.abort(), NIM_IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(NIM_OPENAI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model,
        prompt: payload.prompt,
        response_format: "b64_json",
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `Image request failed with status ${response.status}`;
      throw new Error(String(message));
    }

    const imageDataUrl = extractImageDataUrlFromResponseData(data);
    if (!imageDataUrl) {
      throw new Error("Image model returned no image payload.");
    }
    return imageDataUrl;
  } catch (error) {
    if (isAbortError(error)) {
      if (isRequestCanceled(requestId)) {
        throw createUserAbortError();
      }
      throw new Error("Image generation timed out. Please retry with a shorter prompt.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    releaseRequestAbortController(requestId, controller);
  }
}

function extractImageDataUrlFromResponseData(data) {
  if (!data || typeof data !== "object") return "";

  if (typeof data.image === "string") {
    return coerceBase64ToDataUrl(data.image);
  }

  if (Array.isArray(data.data) && data.data.length) {
    for (const item of data.data) {
      if (!item || typeof item !== "object") continue;
      if (typeof item.b64_json === "string") {
        return coerceBase64ToDataUrl(item.b64_json);
      }
      if (typeof item.image === "string") {
        return coerceBase64ToDataUrl(item.image);
      }
      if (typeof item.url === "string" && item.url.trim()) {
        return item.url.trim();
      }
    }
  }

  if (Array.isArray(data.artifacts) && data.artifacts.length) {
    for (const artifact of data.artifacts) {
      if (!artifact || typeof artifact !== "object") continue;
      if (typeof artifact.base64 === "string") {
        return coerceBase64ToDataUrl(artifact.base64);
      }
      if (typeof artifact.b64_json === "string") {
        return coerceBase64ToDataUrl(artifact.b64_json);
      }
    }
  }

  if (Array.isArray(data.images) && data.images.length) {
    for (const item of data.images) {
      if (typeof item === "string") {
        return coerceBase64ToDataUrl(item);
      }
      if (item && typeof item === "object") {
        if (typeof item.base64 === "string") {
          return coerceBase64ToDataUrl(item.base64);
        }
        if (typeof item.url === "string" && item.url.trim()) {
          return item.url.trim();
        }
      }
    }
  }

  return "";
}

function coerceBase64ToDataUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image/")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `data:image/png;base64,${raw}`;
}

function parseImageApiError(errorText, status) {
  if (!errorText) return `Image request failed with status ${status}`;
  try {
    const parsed = JSON.parse(errorText);
    const message = parsed?.error?.message || parsed?.error || parsed?.message || parsed?.detail;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  } catch (_error) {
    // Fall through to raw text.
  }
  return errorText.slice(0, 240) || `Image request failed with status ${status}`;
}

function blobToDataUrl(blob) {
  return blob
    .arrayBuffer()
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      const mimeType = blob.type || "image/png";
      return `data:${mimeType};base64,${btoa(binary)}`;
    })
    .catch(() => {
      throw new Error("Could not read generated image.");
    });
}

function buildSummaryPrompt({ title, url, text, sourceType }) {
  const isVideoSummary = sourceType === "video";
  const isVideoFallbackSummary = sourceType === "video-fallback";
  const treatAsVideo = isVideoSummary || isVideoFallbackSummary;
  const cleanTitle =
    typeof title === "string" && title.trim() ? title.trim() : treatAsVideo ? "Untitled video" : "Untitled page";
  const cleanUrl = typeof url === "string" ? url : "";
  const trimmedText = text.slice(0, 18000);

  return [
    "You are an expert summarizer.",
    "Return ONLY concise markdown summary.",
    isVideoSummary
      ? "Summarize the video's spoken content from the transcript/captions provided."
      : isVideoFallbackSummary
        ? "Summarize what the video appears to be about using only the page details provided below."
      : "Summarize the page content provided below.",
    isVideoSummary
      ? "Do not summarize page layout, channel info, comments, or description unless the transcript explicitly mentions them."
      : isVideoFallbackSummary
        ? "Be explicit that this is based on page/video metadata, title, and visible details. Do not invent spoken content or scene-by-scene events."
      : "",
    "Hard rules:",
    "1) Do not include analysis, thinking, preamble, or explanations.",
    "2) Use exactly this output format and nothing else:",
    "### TL;DR",
    "<one or two short lines>",
    "",
    "### Key Points",
    "- <short point 1>",
    "- <short point 2>",
    "- <short point 3>",
    "- <short point 4>",
    "- <short point 5>",
    "- <short point 6>",
    "... up to 10 points total",
    "3) Return between 6 and 10 bullet points in Key Points.",
    "4) Every bullet must be one line and concise.",
    "5) Use relevant emojis if useful, but keep the summary readable.",
    "",
    `${treatAsVideo ? "Video" : "Page"} title: ${cleanTitle}`,
    cleanUrl ? `${treatAsVideo ? "Video" : "Page"} URL: ${cleanUrl}` : "",
    "",
    isVideoSummary ? "Video transcript/captions:" : isVideoFallbackSummary ? "Video page details:" : "Page content:",
    trimmedText,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callNimApi(apiKey, prompt) {
  return callModel(apiKey, prompt, PRIMARY_NIM_MODEL);
}

async function callNimWithFallback(apiKey, prompt) {
  try {
    return await callModel(apiKey, prompt, PRIMARY_NIM_MODEL);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const shouldFallback =
      message.includes("empty response") ||
      message.includes("no usable summary") ||
      message.includes("no content");

    if (!shouldFallback) {
      throw error;
    }

    return callModel(apiKey, prompt, FALLBACK_NIM_MODEL);
  }
}

async function callModel(apiKey, prompt, model) {
  return callModelWithConfig(apiKey, prompt, model, {
    temperature: 0,
    maxTokens: 3000,
    systemPrompt:
      "You summarize text faithfully. Keep the response short and structured markdown only.",
    responseMode: "summary",
  });
}

async function callModelWithConfig(apiKey, prompt, model, config) {
  const requestId = normalizeRequestId(config?.requestId);
  const controller = createRequestAbortController(requestId);
  const timeoutMs =
    Number(config?.maxTokens || 0) > CODE_CHAT_FALLBACK_TOKENS ? 420000 : NIM_CHAT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(NIM_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: config.temperature,
        top_p: 0.9,
        max_tokens: config.maxTokens,
        chat_template_kwargs: {
          enable_thinking: false,
        },
        messages: [
          {
            role: "system",
            content: config.systemPrompt,
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `AI request failed with status ${response.status}`;
      throw new Error(message);
    }

    const content = extractContent(data);
    if (!content || typeof content !== "string") {
      throw new Error("AI returned an empty response.");
    }

    const sanitized = sanitizeModelResponse(
      content,
      config.responseMode === "summary" ? "summary" : "write"
    );
    if (!sanitized) {
      throw new Error(
        config.responseMode === "summary"
          ? "The model returned no usable summary."
          : "The model returned no usable response."
      );
    }

    if (config.responseMode === "summary") {
      return formatStrictShortSummary(sanitized);
    }
    return sanitized;
  } catch (error) {
    if (isAbortError(error)) {
      if (isRequestCanceled(requestId)) {
        throw createUserAbortError();
      }
      throw new Error(
        "Model response timed out. Open-weight models can be slow right now. Please retry or switch to a faster model."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    releaseRequestAbortController(requestId, controller);
  }
}

function normalizeRequestId(value) {
  const requestId = typeof value === "string" ? value.trim() : "";
  return requestId || "";
}

function createRequestAbortController(requestId) {
  const controller = new AbortController();
  if (!requestId) {
    return controller;
  }

  let controllers = activeRequestControllers.get(requestId);
  if (!controllers) {
    controllers = new Set();
    activeRequestControllers.set(requestId, controllers);
  }
  controllers.add(controller);

  if (canceledRequestIds.has(requestId)) {
    controller.abort();
  }

  return controller;
}

function releaseRequestAbortController(requestId, controller) {
  if (!requestId) return;
  const controllers = activeRequestControllers.get(requestId);
  if (!controllers) return;
  controllers.delete(controller);
  if (!controllers.size) {
    activeRequestControllers.delete(requestId);
  }
}

function abortActiveRequest(requestId) {
  const normalized = normalizeRequestId(requestId);
  if (!normalized) return false;

  canceledRequestIds.add(normalized);
  const controllers = activeRequestControllers.get(normalized);
  if (!controllers || !controllers.size) {
    return true;
  }

  controllers.forEach((controller) => {
    try {
      controller.abort();
    } catch (_error) {
      // ignore controller abort failures
    }
  });

  return true;
}

function clearCanceledRequest(requestId) {
  const normalized = normalizeRequestId(requestId);
  if (!normalized) return;
  canceledRequestIds.delete(normalized);
}

function isRequestCanceled(requestId) {
  const normalized = normalizeRequestId(requestId);
  return normalized ? canceledRequestIds.has(normalized) : false;
}

function createUserAbortError() {
  const error = new Error(USER_ABORT_MESSAGE);
  error.name = "LoomLessUserAbortError";
  return error;
}

function isUserAbortError(error, requestId = "") {
  if (!error) return false;
  if (error instanceof Error && error.name === "LoomLessUserAbortError") {
    return true;
  }
  return isRequestCanceled(requestId);
}

function extractContent(data) {
  const choice = data?.choices?.[0];
  if (!choice) return "";

  const messageContent = choice?.message?.content;
  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.text === "string") return item.text;
        if (item && typeof item.content === "string") return item.content;
        return "";
      })
      .join("\n")
      .trim();
  }

  if (typeof choice?.text === "string") {
    return choice.text;
  }

  return "";
}

function sanitizeModelResponse(content, mode = "summary") {
  if (!content || typeof content !== "string") return "";

  const withoutThinkTags = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (mode !== "summary") {
    return withoutThinkTags.trim();
  }

  return withoutThinkTags
    .split("\n")
    .filter((line) => {
      const lower = line.trim().toLowerCase();
      if (!lower) return false;
      if (lower.startsWith("<think")) return false;
      if (lower.startsWith("let me ")) return false;
      if (lower.startsWith("i will ")) return false;
      if (lower.includes("structure requested")) return false;
      return true;
    })
    .join("\n")
    .trim();
}

function formatStrictShortSummary(text) {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let tldr = "";
  const bullets = [];
  const sentenceCandidates = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (!tldr && (lower.startsWith("tl;dr") || lower.startsWith("tldr"))) {
      const cleaned = line.replace(/^tl;?dr[:\-\s]*/i, "").trim();
      if (cleaned) tldr = cleaned;
      continue;
    }

    if (!tldr && isLikelySentence(line) && !isMetaLine(lower)) {
      tldr = line;
      continue;
    }

    if ((/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line) || hasEmoji(line)) && !isMetaLine(lower)) {
      const cleaned = line
        .replace(/^[-*•]\s+/, "")
        .replace(/^\d+\.\s+/, "")
        .trim();
      if (cleaned && bullets.length < 10) {
        bullets.push(cleaned);
      }
      continue;
    }

    if (isLikelySentence(line) && !isMetaLine(lower)) {
      sentenceCandidates.push(line);
    }
  }

  if (!tldr) {
    tldr = "Quick page summary generated.";
  }

  const dedupe = new Set();
  const finalBullets = [];
  const allCandidates = [...bullets, ...sentenceCandidates]
    .map((item) => stripLeadingDecoration(item))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  for (const candidate of allCandidates) {
    const key = candidate.toLowerCase();
    if (key === stripLeadingDecoration(tldr).toLowerCase()) continue;
    if (dedupe.has(key)) continue;
    dedupe.add(key);
    finalBullets.push(candidate);
    if (finalBullets.length >= 10) break;
  }

  while (finalBullets.length < 6) {
    finalBullets.push(
      finalBullets.length % 2 === 0
        ? "More context and examples are present in the page details."
        : "Additional key details can be explored directly on the page."
    );
  }

  const formatted = [
    "### TL;DR",
    `${normalizeModelEmojiLine(tldr)}`,
    "",
    "### Key Points",
    ...finalBullets.map((point) => `- ${normalizeModelEmojiLine(point)}`),
  ].join("\n");

  return formatted;
}

function isLikelySentence(line) {
  return line.length > 16 && line.length < 180;
}

function isMetaLine(lower) {
  return (
    lower.includes("structure requested") ||
    lower.includes("let me") ||
    lower.includes("i will") ||
    lower.includes("under 120 words") ||
    lower.includes("key points:")
  );
}

function hasEmoji(value) {
  return /\p{Extended_Pictographic}/u.test(value);
}

function stripLeadingDecoration(text) {
  if (!text || typeof text !== "string") return "";

  let clean = text.trim();
  clean = clean.replace(/^[-*•\d.)\s]+/, "").trim();
  return clean;
}

function normalizeModelEmojiLine(text) {
  const clean = stripLeadingDecoration(text);
  if (!clean) return "";
  return clean;
}

function sanitizeInput(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildWritePrompt({ tone, format, prompt, context, title, url }) {
  const formatRules = getFormatRules(format);
  const toneRules = getToneRules(tone);

  return [
    "Create polished writing output based on the user request.",
    "Hard requirements:",
    `- Tone: ${tone}`,
    `- Format: ${format}`,
    "- Write naturally and human-like.",
    "- STRICT: Do NOT use em dashes (—) anywhere.",
    "- Avoid robotic phrasing and avoid sounding like AI.",
    "- Output only the final content, no commentary.",
    "- Keep language clear and specific.",
    ...toneRules.map((rule) => `- ${rule}`),
    ...formatRules.map((rule) => `- ${rule}`),
    "",
    title ? `Page title: ${title}` : "",
    url ? `Page URL: ${url}` : "",
    context ? `Page context:\n${context}` : "",
    "",
    `User request:\n${prompt}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function getToneRules(tone) {
  switch ((tone || "").toLowerCase()) {
    case "friendly":
      return ["Use warm, approachable wording.", "Keep sentences natural and easy to read."];
    case "casual":
      return ["Use simple conversational language.", "Keep it relaxed but still clear."];
    case "confident":
      return ["Use direct, assertive phrasing.", "Avoid hedging words unless needed."];
    case "roast":
      return [
        "Write a witty roast with sharp humor and punchy phrasing.",
        "Roast the content or behavior from context, not protected traits.",
        "No slurs, hate speech, threats, or dehumanizing language.",
      ];
    case "persuasive":
      return ["Use clear benefits and a strong call-to-action.", "Sound convincing, not pushy."];
    default:
      return ["Keep a professional and polished voice."];
  }
}

function getFormatRules(format) {
  switch ((format || "").toLowerCase()) {
    case "email":
      return [
        "Use a clear subject line as the first line: Subject: ...",
        "Use short paragraphs and a professional close.",
      ];
    case "x-post":
      return [
        "Return exactly one X post.",
        "Keep it under 280 characters.",
        "No hashtags unless explicitly requested.",
      ];
    case "linkedin-post":
      return [
        "Use 4-8 short lines.",
        "Include one clear hook in the first line.",
      ];
    case "message":
      return [
        "Keep it concise and conversational.",
        "Use 2-4 short lines.",
      ];
    default:
      return ["Match the requested format exactly and keep it concise."];
  }
}

function sanitizeWriteResponse(content) {
  const sanitized = sanitizeModelResponse(content, "write")
    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/—/g, "-")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!sanitized) return "";

  const lines = sanitized.split("\n");
  while (lines.length) {
    const first = lines[0].trim().toLowerCase();
    if (!first) {
      lines.shift();
      continue;
    }

    const isMetaLead =
      first.startsWith("here's ") ||
      first.startsWith("here is ") ||
      first.startsWith("sure,") ||
      first.startsWith("absolutely,") ||
      first.startsWith("of course,") ||
      first.startsWith("draft:");

    if (!isMetaLead) break;
    lines.shift();
  }

  return lines.join("\n").trim();
}

function sanitizeChatResponse(content, mode = CHAT_MODES.CHAT) {
  const sanitized = sanitizeModelResponse(content, "write")
    .replace(mode === CHAT_MODES.WRITER ? /—/g : /$^/, "-")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!sanitized) return "";

  const lines = sanitized.split("\n");
  while (lines.length) {
    const first = lines[0].trim().toLowerCase();
    if (!first) {
      lines.shift();
      continue;
    }

    const isMetaLead =
      first.startsWith("here's ") ||
      first.startsWith("here is ") ||
      first.startsWith("sure,") ||
      first.startsWith("absolutely,") ||
      first.startsWith("of course,") ||
      first.startsWith("assistant:");

    if (!isMetaLead) break;
    lines.shift();
  }

  const cleaned = lines.join("\n").trim();
  if (!cleaned) return "";
  if (mode === CHAT_MODES.CODE) {
    return ensureFencedCodeOutput(cleaned, true);
  }
  return ensureFencedCodeOutput(cleaned, false);
}

function buildChatPrompt({ prompt, history, context, title, url, model, scope, mode }) {
  const cleanHistory = history
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const role = item.role === "assistant" ? "Assistant" : "User";
      const text =
        typeof item.content === "string"
          ? item.content.trim()
          : typeof item.text === "string"
            ? item.text.trim()
            : "";
      if (!text) return "";
      return `${role}: ${text.slice(0, 1200)}`;
    })
    .filter(Boolean)
    .slice(-8);

  const isGeneral = scope === "general";
  const isCodeMode = mode === CHAT_MODES.CODE;
  const isWriterMode = mode === CHAT_MODES.WRITER;
  const wantsIdentity = isIdentityPrompt(prompt);
  const wantsTableOutput = shouldUseTableFormat(prompt);
  const base = isGeneral
    ? [
        "You are LoomLess GPT, an AI assistant developed by LoomLess AI.",
        model ? `Current serving model ID: ${model}` : "",
        "Rules:",
        "- This is general chat mode, not page mode.",
        "- Reply in clean markdown when useful.",
        isWriterMode
          ? "- WRITER mode: produce polished, human-sounding long-form writing unless user explicitly asks for short copy."
          : isCodeMode
            ? "- CODE mode: return complete, runnable output where possible. Use fenced code blocks with language tags."
            : "- Provide complete answers. If user asks for code/HTML, return full usable output unless user asks for a short version.",
        isWriterMode ? "- Write like a strong human editor. Use natural rhythm, varied sentence length, and specific wording." : "",
        isWriterMode ? "- Never use em dashes." : "",
        isWriterMode ? "- Do not start with preambles like 'Here is', 'Sure', 'Absolutely', or 'Certainly'." : "",
        isWriterMode ? "- If the user asks for a blog, article, essay, newsletter, email, caption, or script, deliver the finished draft, not just an outline." : "",
        isWriterMode ? "- Use headings, bullets, tables, and markdown links only when they genuinely improve readability." : "",
        isWriterMode ? "- Avoid AI-sounding filler, repetition, clichés, and meta commentary." : "",
        wantsTableOutput
          ? "- If the user asks for a comparison or table format, return a valid markdown table with a header row and alignment separator row."
          : "",
        wantsTableOutput ? "- Keep table cells concise and readable. Do not fake columns with plain text pipes outside markdown table syntax." : "",
        wantsIdentity
          ? "- Identity line must be exactly: I am LoomLess GPT, an AI assistant developed by LoomLess AI."
          : "- Do not introduce yourself unless user explicitly asks identity.",
        "- Always answer the latest user message first. Do not repeat old greeting/identity unless asked now.",
        "- If additional uploaded-file context is provided, use it as high-priority context.",
        "- If uploaded-file context exists, answer the user task from that context first.",
        "- If user asks which model you are, answer with the exact current serving model ID only.",
        "- Never claim you are GPT-4 or any different model.",
        "- Never include chain-of-thought or internal analysis.",
        "",
      ]
    : [
        "You are answering in an on-page assistant chat panel.",
        model ? `Current serving model ID: ${model}` : "",
        "Rules:",
        "- Reply in clean markdown when useful.",
        isWriterMode
          ? "- WRITER mode: write polished, human-sounding copy grounded in the provided context."
          : "- Be concise by default (around 3-8 lines) unless user asks for detail.",
        isWriterMode ? "- Never use em dashes or AI-style preambles." : "",
        isWriterMode ? "- If long-form writing is requested, deliver the full draft with useful structure." : "",
        "- If the answer depends on page context, use the provided context first.",
        "- If user asks which model you are, answer with the exact current serving model ID only.",
        "- Never claim you are GPT-4 or any different model.",
        "- Never include chain-of-thought or internal analysis.",
        "",
      ];

  return [
    ...base,
    title ? `Page title: ${title}` : "",
    url ? `Page URL: ${url}` : "",
    context ? `${isGeneral ? "Additional user-provided context" : "Page context"}:\n${context}` : "",
    cleanHistory.length ? `Chat history:\n${cleanHistory.join("\n")}` : "",
    "",
    `User message:\n${prompt}`,
    ]
    .filter(Boolean)
    .join("\n");
}

function shouldUseTableFormat(prompt) {
  const text = String(prompt || "").toLowerCase();
  if (!text) return false;
  return (
    text.includes("table") ||
    text.includes("tabular") ||
    text.includes("compare") ||
    text.includes("comparison") ||
    text.includes("vs")
  );
}

function ensureFencedCodeOutput(text, forceWrap) {
  if (!text) return "";
  if (/```/.test(text)) return text;
  if (!forceWrap && !looksLikeCode(text)) return text;
  const lang = detectCodeLanguage(text);
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

function looksLikeCode(text) {
  const sample = String(text || "").trim();
  if (!sample) return false;
  return (
    /<!doctype html>/i.test(sample) ||
    /<html[\s>]/i.test(sample) ||
    /^\s*(import|export|def |class |function |const |let |var )/m.test(sample) ||
    /^\s*#include\s+</m.test(sample) ||
    /^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i.test(sample) ||
    /{[\s\S]*}/.test(sample)
  );
}

function detectCodeLanguage(text) {
  const sample = String(text || "").trim();
  if (/<!doctype html>|<html[\s>]|<head[\s>]|<body[\s>]/i.test(sample)) return "html";
  if (/<\?php/i.test(sample)) return "php";
  if (/^\s*(def |import |from .+ import )/m.test(sample)) return "python";
  if (/^\s*(function |const |let |var |import |export )/m.test(sample)) return "javascript";
  if (/^\s*(public class |class .+\{|System\.out\.println)/m.test(sample)) return "java";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/im.test(sample)) return "sql";
  if (/^\s*(#include <|int main\()/m.test(sample)) return "cpp";
  if (/^\s*package main|fmt\./m.test(sample)) return "go";
  if (/^\s*(apiVersion:|kind:|metadata:)/m.test(sample)) return "yaml";
  return "text";
}

function isAbortError(error) {
  if (!error) return false;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("abort");
}

function shouldRetryImageWithFallback(error) {
  if (!error) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("status 404") ||
    message.includes("status 405") ||
    message.includes("status 415") ||
    message.includes("not found") ||
    message.includes("unsupported") ||
    message.includes("no image payload")
  );
}

function resolveImageModel(model) {
  if (typeof model !== "string") return IMAGE_GEN_MODEL;
  const clean = model.trim();
  if (!clean) return IMAGE_GEN_MODEL;
  return IMAGE_GEN_ALLOWED_MODELS.has(clean) ? clean : IMAGE_GEN_MODEL;
}

function resolveChatModel(model, mode = CHAT_MODES.CHAT) {
  if (typeof model !== "string") return mode === CHAT_MODES.WRITER ? WRITER_MODEL : CHAT_MODEL;
  const clean = model.trim();
  if (!clean) return mode === CHAT_MODES.WRITER ? WRITER_MODEL : CHAT_MODEL;
  if (mode === CHAT_MODES.WRITER) {
    return CHAT_ALLOWED_MODELS.has(clean) && clean.startsWith("meta/") ? clean : WRITER_MODEL;
  }
  return CHAT_ALLOWED_MODELS.has(clean) ? clean : CHAT_MODEL;
}

function resolveChatMode(mode) {
  if (mode === CHAT_MODES.CODE) return CHAT_MODES.CODE;
  if (mode === CHAT_MODES.WRITER) return CHAT_MODES.WRITER;
  return CHAT_MODES.CHAT;
}

function buildGeneralSystemPrompt(mode) {
  if (mode === CHAT_MODES.WRITER) {
    return "You are LoomLess GPT, an AI assistant developed by LoomLess AI. This is WRITER mode. Write polished, natural, human-sounding prose. Never use em dashes. Never add preambles, apologies, analysis, or self-reference. If the user asks for long-form writing, deliver the full finished draft. Use markdown structure only when it improves readability. Preserve tables as valid markdown tables and preserve useful links as markdown links.";
  }
  if (mode === CHAT_MODES.CODE) {
    return "You are LoomLess GPT, an AI assistant developed by LoomLess AI. This is CODE mode. Prioritize complete outputs. Wrap code/markup/config in fenced markdown code blocks with explicit language tags. Avoid partial stubs unless user asks.";
  }
  return "You are LoomLess GPT, an AI assistant developed by LoomLess AI. This is general chat mode. Reply directly and clearly, and never describe yourself as a page-specific assistant. Only provide identity line when the latest user message explicitly asks identity.";
}

function buildPageAssistantSystemPrompt(mode) {
  if (mode === CHAT_MODES.WRITER) {
    return "You are LoomLess AI in WRITER mode. Use provided context when relevant and write polished, human-sounding copy. Never use em dashes. Do not add AI-style preambles or commentary. Deliver complete drafts when the user requests writing.";
  }
  if (mode === CHAT_MODES.CODE) {
    return "You are LoomLess AI in CODE mode. Use provided context when relevant. Return code/markup/config in fenced markdown code blocks with explicit language tags and prefer complete outputs.";
  }
  return "You are LoomLess AI in page-assistant mode. Reply directly and clearly. Keep responses concise by default. Use page context only when provided. Never claim to be a different model than the current one.";
}

function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        resolve("");
        return;
      }
      resolve(typeof result[key] === "string" ? result[key].trim() : "");
    });
  });
}

function isIdentityPrompt(prompt) {
  const text = String(prompt || "").toLowerCase();
  return (
    text.includes("who are you") ||
    text.includes("what are you") ||
    text.includes("introduce yourself") ||
    text.includes("tell me about yourself")
  );
}

function shouldForceIdentityRetry(prompt, response) {
  if (isIdentityPrompt(prompt)) return false;
  const normalized = String(response || "").trim().toLowerCase();
  if (!normalized) return false;
  const identityLine = "i am loomless gpt, an ai assistant developed by loomless ai.";
  if (normalized === identityLine) return true;
  if (normalized.startsWith(identityLine) && normalized.length < 190) return true;
  return false;
}

function buildDirectAnswerRetryPrompt(prompt) {
  return [
    prompt,
    "",
    "Important:",
    "- Answer the user request directly.",
    "- Do not introduce yourself unless user explicitly asks identity.",
  ].join("\n");
}
