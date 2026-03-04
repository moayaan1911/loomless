const STORAGE_NIM_API_KEY = "loomless_ai_nim_api_key";
const STORAGE_TAVILY_API_KEY = "loomless_ai_tavily_api_key";
const PRIMARY_NIM_MODEL = "nvidia/nemotron-3-nano-30b-a3b";
const FALLBACK_NIM_MODEL = "minimaxai/minimax-m2.5";
const WRITE_MODEL = "meta/llama-3.3-70b-instruct";
const CHAT_MODEL = PRIMARY_NIM_MODEL;
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
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama3-70b-instruct",
  "meta/llama3-8b-instruct",
  "microsoft/phi-4-mini-instruct",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
]);
const NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const TAVILY_SEARCH_ENDPOINT = "https://api.tavily.com/search";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
  return false;
});

async function summarizePage(message, sendResponse) {
  try {
    const { text, title, url } = message || {};
    if (!text || typeof text !== "string") {
      sendResponse({ ok: false, error: "No page text provided for summarization." });
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

    const prompt = buildSummaryPrompt({ title, url, text });
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
  try {
    const { prompt, history, context, title, url, model, scope, webSearch } = message || {};
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
    const selectedModel = resolveChatModel(model);
    const chatScope = scope === "general" ? "general" : "page";
    const wantsWebSearch = Boolean(webSearch);

    let rawOutput = "";
    let sources = [];
    let webQuery = "";

    if (wantsWebSearch) {
      const tavilyApiKey = await getStorageValue(STORAGE_TAVILY_API_KEY);
      if (!tavilyApiKey) {
        sendResponse({
          ok: false,
          error: "Web Search is ON but Tavily API key is missing. Add TRAVILY_API/TAVILY_API and rebuild.",
        });
        return;
      }

      const webPayload = await runTavilySearch(tavilyApiKey, promptText);
      const webPrompt = buildWebSearchPrompt({
        prompt: promptText,
        history: historyItems,
        model: selectedModel,
        scope: chatScope,
        sources: webPayload.sources,
      });

      rawOutput = await callModelWithConfig(nimApiKey, webPrompt, selectedModel, {
        temperature: 0.25,
        maxTokens: 480,
        systemPrompt:
          "You are LoomLess GPT, an AI assistant developed by LoomLess AI. Use provided web sources only. For factual claims, add citation numbers like [1], [2]. Do not invent sources.",
        responseMode: "raw",
      });
      sources = webPayload.sources;
      webQuery = webPayload.query;
    } else {
      rawOutput = await callChatModelWithRetry(nimApiKey, {
        prompt: promptText,
        history: historyItems,
        context: pageContext,
        title: pageTitle,
        url: pageUrl,
        model: selectedModel,
        scope: chatScope,
      });
    }

    const cleaned = sanitizeChatResponse(rawOutput);
    if (!cleaned) {
      sendResponse({ ok: false, error: "Could not generate a response. Please try again." });
      return;
    }

    sendResponse({ ok: true, reply: cleaned, sources, webQuery });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate chat response.",
    });
  }
}

async function callChatModelWithRetry(apiKey, payload) {
  const contextAttempts = [4200, 2200, 900];
  let lastError = null;

  for (const contextLimit of contextAttempts) {
    try {
      const isGeneral = payload.scope === "general";
      const chatPrompt = buildChatPrompt({
        prompt: payload.prompt,
        history: payload.history,
        context: isGeneral ? "" : (payload.context || "").slice(0, contextLimit),
        title: isGeneral ? "" : payload.title,
        url: isGeneral ? "" : payload.url,
        model: payload.model,
        scope: payload.scope,
      });

      return await callModelWithConfig(apiKey, chatPrompt, payload.model || CHAT_MODEL, {
        temperature: 0.35,
        maxTokens: 340,
        systemPrompt: isGeneral
          ? "You are LoomLess GPT, an AI assistant developed by LoomLess AI. This is general chat mode. Reply directly and clearly, and never describe yourself as a page-specific assistant. If asked identity, answer: I am LoomLess GPT, an AI assistant developed by LoomLess AI."
          : "You are LoomLess AI in page-assistant mode. Reply directly and clearly. Keep responses concise by default. Use page context only when provided. Never claim to be a different model than the current one.",
        responseMode: "raw",
      });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const shouldRetry = message.includes("status 400") || message.includes("too long");
      if (!shouldRetry) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error("Failed to generate chat response.");
}

async function runTavilySearch(apiKey, query) {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new Error("Web search query is empty.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(TAVILY_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: cleanQuery,
        search_depth: "advanced",
        max_results: 6,
        include_answer: false,
        include_images: false,
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error || data?.detail || `Web search failed with status ${response.status}`;
      throw new Error(String(message));
    }

    const rawResults = Array.isArray(data?.results) ? data.results : [];
    const sources = rawResults
      .filter((item) => item && typeof item.url === "string")
      .slice(0, 6)
      .map((item, index) => ({
        id: index + 1,
        title: sanitizeSourceText(item.title) || `Source ${index + 1}`,
        url: item.url,
        snippet: sanitizeSourceText(item.content || item.snippet || ""),
      }));

    if (!sources.length) {
      throw new Error("No web results found for this query.");
    }

    return {
      query: typeof data?.query === "string" && data.query.trim() ? data.query.trim() : cleanQuery,
      sources,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeSourceText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function buildWebSearchPrompt({ prompt, history, sources, model, scope }) {
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
      return `${role}: ${text.slice(0, 900)}`;
    })
    .filter(Boolean)
    .slice(-6);

  const sourceBlocks = sources
    .map((source) => {
      return [
        `[${source.id}] ${source.title}`,
        `URL: ${source.url}`,
        source.snippet ? `Snippet: ${source.snippet}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const modeLine =
    scope === "general"
      ? "Mode: General chat with web search."
      : "Mode: Page assistant chat with web search.";

  return [
    "You are LoomLess GPT, an AI assistant developed by LoomLess AI.",
    modeLine,
    model ? `Current serving model ID: ${model}` : "",
    "Rules:",
    "- Use ONLY the provided web sources for factual statements.",
    "- Add citation numbers like [1], [2] for factual lines.",
    "- If sources are insufficient, say so clearly.",
    "- Keep answer concise and useful.",
    "- Never mention hidden reasoning.",
    "",
    cleanHistory.length ? `Chat history:\n${cleanHistory.join("\n")}` : "",
    "Web sources:",
    sourceBlocks,
    "",
    `User message:\n${prompt}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSummaryPrompt({ title, url, text }) {
  const cleanTitle = typeof title === "string" && title.trim() ? title.trim() : "Untitled page";
  const cleanUrl = typeof url === "string" ? url : "";
  const trimmedText = text.slice(0, 18000);

  return [
    "You are an expert summarizer.",
    "Return ONLY concise markdown summary.",
    "Hard rules:",
    "1) Keep total output <= 80 words.",
    "2) Do not include analysis, thinking, preamble, or explanations.",
    "3) Use exactly this output format and nothing else:",
    "### TL;DR",
    "<one short sentence>",
    "",
    "### Key Points",
    "- <short point 1>",
    "- <short point 2>",
    "- <short point 3>",
    "- <short point 4>",
    "4) Every bullet must be one line.",
    "5) Put exactly one relevant emoji at the start of TL;DR line and each bullet.",
    "6) Do not repeat the same emoji across lines.",
    "",
    `Page title: ${cleanTitle}`,
    cleanUrl ? `Page URL: ${cleanUrl}` : "",
    "",
    "Page content:",
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
    maxTokens: 180,
    systemPrompt:
      "You summarize text faithfully. Keep the response short and structured markdown only.",
    responseMode: "summary",
  });
}

async function callModelWithConfig(apiKey, prompt, model, config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70000);

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
  } finally {
    clearTimeout(timeout);
  }
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
      if (cleaned && bullets.length < 4) {
        bullets.push(cleaned);
      }
    }
  }

  if (!tldr) {
    tldr = "Quick page summary generated.";
  }

  const finalBullets = bullets.length
    ? bullets.slice(0, 4)
    : ["Key points extracted from this page."];

  while (finalBullets.length < 4) {
    finalBullets.push("More details available in the full page content.");
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

function sanitizeChatResponse(content) {
  const sanitized = sanitizeModelResponse(content, "write")
    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/```/g, "")
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

  return lines.join("\n").trim();
}

function buildChatPrompt({ prompt, history, context, title, url, model, scope }) {
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
  const base = isGeneral
    ? [
        "You are LoomLess GPT, an AI assistant developed by LoomLess AI.",
        model ? `Current serving model ID: ${model}` : "",
        "Rules:",
        "- This is general chat mode, not page mode.",
        "- Reply in clean markdown when useful.",
        "- Be concise by default (around 3-8 lines) unless user asks for detail.",
        "- If user asks who you are, answer exactly: I am LoomLess GPT, an AI assistant developed by LoomLess AI.",
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
        "- Be concise by default (around 3-8 lines) unless user asks for detail.",
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
    context ? `Page context:\n${context}` : "",
    cleanHistory.length ? `Chat history:\n${cleanHistory.join("\n")}` : "",
    "",
    `User message:\n${prompt}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function resolveChatModel(model) {
  if (typeof model !== "string") return CHAT_MODEL;
  const clean = model.trim();
  if (!clean) return CHAT_MODEL;
  return CHAT_ALLOWED_MODELS.has(clean) ? clean : CHAT_MODEL;
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
