const STORAGE_SUPABASE_URL = "loomless_ai_supabase_url";
const STORAGE_SUPABASE_KEY = "loomless_ai_supabase_key";
const STORAGE_AUTH_SESSION = "loomless_ai_auth_session";
const STORAGE_PROFILE_COMPLETED = "loomless_ai_profile_completed";
const STORAGE_FLOATING_KEY = "loomless_ai_floating_enabled";

const iconApi =
  globalThis.LoomLessIconMap && typeof globalThis.LoomLessIconMap.mount === "function"
    ? globalThis.LoomLessIconMap
    : null;

const loginStageNode = document.getElementById("stage-login");
const profileStageNode = document.getElementById("stage-profile");
const successStageNode = document.getElementById("stage-success");
const statusWrapNode = document.querySelector(".status-wrap");
const statusNode = document.getElementById("status");

const loginFormNode = document.getElementById("login-form");
const emailStepNode = document.getElementById("email-step");
const loginEmailNode = document.getElementById("login-email");
const sendCodeBtnNode = document.getElementById("send-code-btn");
const otpStepNode = document.getElementById("otp-step");
const otpCodeNode = document.getElementById("otp-code");
const verifyCodeBtnNode = document.getElementById("verify-code-btn");
const resendCodeBtnNode = document.getElementById("resend-code-btn");

const profileFormNode = document.getElementById("profile-form");
const profileNameNode = document.getElementById("profile-name");
const profileAgeNode = document.getElementById("profile-age");
const profileSubmitNode = document.getElementById("profile-submit");
const closeBtnNode = document.getElementById("close-btn");

const confettiCanvasNode = document.getElementById("confetti-canvas");

let appConfig = null;
let currentSession = null;
let busy = false;
let pendingOtpEmail = "";

iconApi?.mount?.(document);

init().catch((error) => {
  setStatus(error instanceof Error ? error.message : "Setup failed.", "error");
});

loginFormNode?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  if (otpStepNode?.hidden) {
    sendCodeBtnNode?.click();
    return;
  }
  verifyCodeBtnNode?.click();
});

loginEmailNode?.addEventListener("input", () => {
  const email = String(loginEmailNode?.value || "").trim().toLowerCase();
  if (!pendingOtpEmail) return;
  if (email === pendingOtpEmail) return;
  resetLoginFlow();
});

sendCodeBtnNode?.addEventListener("click", async () => {
  if (busy) return;

  const email = String(loginEmailNode?.value || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    setStatus("Please enter a valid email.", "error");
    return;
  }

  setBusy(true);
  try {
    await sendOtp(email);
    pendingOtpEmail = email;
    revealOtpStep();
    setStatus("OTP sent. Check your inbox and enter the code.", "ok");
  } catch (error) {
    setStatus(getOtpErrorMessage(error), "error");
  } finally {
    setBusy(false);
  }
});

verifyCodeBtnNode?.addEventListener("click", async () => {
  if (busy) return;

  const email = String(pendingOtpEmail || loginEmailNode?.value || "")
    .trim()
    .toLowerCase();
  const token = sanitizeOtpCode(otpCodeNode?.value || "");

  if (!isValidEmail(email)) {
    setStatus("Please enter a valid email first.", "error");
    return;
  }
  if (!token.ok) {
    setStatus(token.error, "error");
    return;
  }

  setBusy(true);
  try {
    const verifyData = await authRequest("/auth/v1/verify", {
      email,
      token: token.value,
      type: "email",
    });

    const verifiedSession = await extractSessionFromAuthPayload(verifyData);
    if (!verifiedSession) {
      throw new Error("Invalid or expired OTP. Request a new code and try again.");
    }

    currentSession = verifiedSession;
    await storageSet({ [STORAGE_AUTH_SESSION]: currentSession });
    await continueWithSession(currentSession, {
      loggedInMessage: "Email verified. Signed in successfully.",
    });
  } catch (error) {
    setStatus(getOtpErrorMessage(error), "error");
  } finally {
    setBusy(false);
  }
});

resendCodeBtnNode?.addEventListener("click", async () => {
  if (busy) return;

  const email = String(pendingOtpEmail || loginEmailNode?.value || "")
    .trim()
    .toLowerCase();
  if (!isValidEmail(email)) {
    setStatus("Please enter a valid email first.", "error");
    return;
  }

  setBusy(true);
  try {
    await sendOtp(email);
    pendingOtpEmail = email;
    revealOtpStep();
    setStatus("New OTP sent. Please check your inbox.", "ok");
  } catch (error) {
    setStatus(getOtpErrorMessage(error), "error");
  } finally {
    setBusy(false);
  }
});

profileFormNode?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;

  const fullName = sanitizeName(profileNameNode?.value || "");
  const age = sanitizeAge(profileAgeNode?.value || "");

  if (!fullName.ok) {
    setStatus(fullName.error, "error");
    return;
  }
  if (!age.ok) {
    setStatus(age.error, "error");
    return;
  }
  if (!currentSession) {
    setStatus("Session not found. Please sign in again.", "error");
    showStage("login");
    return;
  }

  setBusy(true);
  try {
    await restRequest("ai_user_profiles?on_conflict=user_id", {
      method: "POST",
      accessToken: currentSession.accessToken,
      body: [
        {
          user_id: currentSession.userId,
          full_name: fullName.value,
          age: age.value,
          metadata: {
            source: "loomless-ai-extension",
            setup_completed_at: new Date().toISOString(),
          },
        },
      ],
      prefer: "resolution=merge-duplicates,return=minimal",
    });

    await storageSet({
      [STORAGE_PROFILE_COMPLETED]: true,
      [STORAGE_FLOATING_KEY]: false,
    });

    showStage("success");
    fireConfetti();
    setStatus("Setup complete. You can now use LoomLess AI extension.", "ok");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not save profile.", "error");
  } finally {
    setBusy(false);
  }
});

closeBtnNode?.addEventListener("click", () => {
  window.close();
});

async function init() {
  appConfig = await getSupabaseConfig();
  if (!appConfig) {
    throw new Error("Supabase config missing. Please set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.");
  }

  const stored = await storageGet([STORAGE_AUTH_SESSION]);
  currentSession = normalizeAuthSession(stored[STORAGE_AUTH_SESSION]);

  await continueWithSession(currentSession, {
    loggedInMessage: "Signed in successfully.",
  });
}

async function continueWithSession(session, { loggedInMessage = "Signed in successfully." } = {}) {
  if (!session) {
    resetLoginFlow();
    showStage("login");
    setStatus("", "");
    return;
  }

  const refreshed = await refreshSessionIfNeeded(session);
  if (!refreshed) {
    await storageRemove([STORAGE_AUTH_SESSION, STORAGE_PROFILE_COMPLETED]);
    currentSession = null;
    resetLoginFlow();
    showStage("login");
    setStatus("Session expired. Please sign in again.", "error");
    return;
  }

  currentSession = refreshed;
  await storageSet({ [STORAGE_AUTH_SESSION]: currentSession });
  await storageSet({ [STORAGE_PROFILE_COMPLETED]: false, [STORAGE_FLOATING_KEY]: false });

  const existingProfile = await fetchCurrentProfile();
  if (existingProfile) {
    await storageSet({ [STORAGE_PROFILE_COMPLETED]: true });
    showStage("success");
    fireConfetti();
    setStatus(loggedInMessage, "ok");
    return;
  }

  showStage("profile");
  setStatus("Complete profile setup to unlock extension.", "");
}

async function sendOtp(email) {
  await authRequest("/auth/v1/otp", {
    email,
    create_user: true,
    shouldCreateUser: true,
  });
}

function revealOtpStep() {
  if (emailStepNode) {
    emailStepNode.hidden = true;
  }
  otpStepNode.hidden = false;
  if (otpCodeNode) {
    otpCodeNode.value = "";
    otpCodeNode.focus();
  }
}

function resetLoginFlow() {
  pendingOtpEmail = "";
  if (emailStepNode) {
    emailStepNode.hidden = false;
  }
  if (otpStepNode) {
    otpStepNode.hidden = true;
  }
  if (otpCodeNode) {
    otpCodeNode.value = "";
  }
}

function getOtpErrorMessage(error) {
  const rawMessage = error instanceof Error ? error.message : "Authentication failed.";
  const normalized = String(rawMessage || "").toLowerCase();

  if (normalized.includes("invalid") && normalized.includes("token")) {
    return "Invalid OTP. Please check the code and try again.";
  }
  if (normalized.includes("otp_expired") || normalized.includes("expired")) {
    return "OTP expired. Please request a new code.";
  }
  if (normalized.includes("invalid") || normalized.includes("token")) {
    return "Invalid or expired OTP. Please request a new code.";
  }
  if (normalized.includes("over_email_send_rate_limit")) {
    return "Too many OTP requests. Please wait a minute and try again.";
  }
  if (normalized.includes("signups not allowed") || normalized.includes("signup is disabled")) {
    return "Sign-up is disabled in Supabase settings. Enable Email sign-up first.";
  }

  return rawMessage;
}

async function getSupabaseConfig() {
  const result = await storageGet([STORAGE_SUPABASE_URL, STORAGE_SUPABASE_KEY]);
  const url = String(result[STORAGE_SUPABASE_URL] || "").trim().replace(/\/+$/, "");
  const key = String(result[STORAGE_SUPABASE_KEY] || "").trim();
  if (!url || !key) return null;
  return { url, key };
}

async function authRequest(path, body) {
  const response = await fetch(`${appConfig.url}${path}`, {
    method: "POST",
    headers: {
      apikey: appConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const json = text ? safeParseJson(text) : {};
  if (!response.ok) {
    const message =
      json?.error_description || json?.msg || json?.message || json?.error || response.statusText || "Auth failed";
    throw new Error(message);
  }
  return json;
}

async function restRequest(path, { method = "GET", body, accessToken, prefer = "return=representation" } = {}) {
  const headers = {
    apikey: appConfig.key,
    Authorization: `Bearer ${accessToken}`,
    Prefer: prefer,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${appConfig.url}/rest/v1/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    const json = text ? safeParseJson(text) : {};
    const message = json?.message || json?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  return safeParseJson(text);
}

async function extractSessionFromAuthPayload(payload) {
  const accessToken = String(payload?.access_token || "").trim();
  const refreshToken = String(payload?.refresh_token || "").trim();
  if (!accessToken || !refreshToken) return null;

  let userId = String(payload?.user?.id || "").trim();
  let email = String(payload?.user?.email || "").trim();

  if (!userId) {
    const fetchedUser = await fetchUser(accessToken);
    userId = String(fetchedUser?.id || "").trim();
    if (!email) {
      email = String(fetchedUser?.email || "").trim();
    }
  }

  if (!userId) return null;

  const expiresAtSeconds = Number(payload?.expires_at || 0);
  const expiresInSeconds = Number(payload?.expires_in || 0);
  const expiresAt =
    Number.isFinite(expiresAtSeconds) && expiresAtSeconds > 0
      ? expiresAtSeconds * 1000
      : Date.now() + (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : 3600) * 1000;

  return {
    accessToken,
    refreshToken,
    userId,
    email,
    expiresAt,
  };
}

async function fetchUser(accessToken) {
  const response = await fetch(`${appConfig.url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: appConfig.key,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) return null;
  return response.json().catch(() => null);
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

async function refreshSessionIfNeeded(session) {
  const normalized = normalizeAuthSession(session);
  if (!normalized) return null;

  if (normalized.expiresAt > Date.now() + 60_000) {
    return normalized;
  }

  const refreshed = await authRequest("/auth/v1/token?grant_type=refresh_token", {
    refresh_token: normalized.refreshToken,
  }).catch(() => null);
  if (!refreshed) return null;

  const accessToken = String(refreshed.access_token || "").trim();
  const refreshToken = String(refreshed.refresh_token || "").trim();
  const userId = String(refreshed.user?.id || "").trim();
  if (!accessToken || !refreshToken || !userId) return null;

  const expiresAtSeconds = Number(refreshed.expires_at || 0);
  const expiresInSeconds = Number(refreshed.expires_in || 0);
  const expiresAt =
    Number.isFinite(expiresAtSeconds) && expiresAtSeconds > 0
      ? expiresAtSeconds * 1000
      : Date.now() + (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : 3600) * 1000;

  return {
    accessToken,
    refreshToken,
    userId,
    email: String(refreshed.user?.email || "").trim(),
    expiresAt,
  };
}

async function fetchCurrentProfile() {
  if (!currentSession) return null;
  const encodedUserId = encodeURIComponent(currentSession.userId);
  const data = await restRequest(
    `ai_user_profiles?select=user_id,full_name,age&user_id=eq.${encodedUserId}&limit=1`,
    {
      method: "GET",
      accessToken: currentSession.accessToken,
      prefer: "return=representation",
    }
  ).catch(() => null);

  if (!Array.isArray(data) || !data.length) return null;
  return data[0];
}

function sanitizeName(rawValue) {
  const value = String(rawValue || "").replace(/\s+/g, " ").trim();
  if (!value) {
    return { ok: false, error: "Name is required." };
  }
  if (value.length < 2 || value.length > 60) {
    return { ok: false, error: "Name must be between 2 and 60 characters." };
  }
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(value)) {
    return { ok: false, error: "Name can only contain letters, spaces, apostrophe, dot, and hyphen." };
  }
  return { ok: true, value };
}

function sanitizeAge(rawValue) {
  const num = Number(rawValue);
  if (!Number.isInteger(num)) {
    return { ok: false, error: "Age must be a whole number." };
  }
  if (num < 13 || num > 100) {
    return { ok: false, error: "Age must be between 13 and 100." };
  }
  return { ok: true, value: num };
}

function sanitizeOtpCode(rawValue) {
  const value = String(rawValue || "")
    .trim()
    .replace(/\s+/g, "");
  if (!/^\d{4,12}$/.test(value)) {
    return { ok: false, error: "OTP must be numeric (4 to 12 digits)." };
  }
  return { ok: true, value };
}

function isValidEmail(value) {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showStage(stage) {
  loginStageNode.hidden = stage !== "login";
  profileStageNode.hidden = stage !== "profile";
  successStageNode.hidden = stage !== "success";
}

function setStatus(text, tone = "") {
  statusNode.textContent = text || "";
  statusNode.classList.remove("ok", "error");
  if (statusWrapNode) {
    statusWrapNode.setAttribute("data-empty", text ? "false" : "true");
  }
  if (tone === "ok") {
    statusNode.classList.add("ok");
  } else if (tone === "error") {
    statusNode.classList.add("error");
  }
}

function setBusy(next) {
  busy = next;
  if (sendCodeBtnNode) sendCodeBtnNode.disabled = next;
  if (verifyCodeBtnNode) verifyCodeBtnNode.disabled = next;
  if (resendCodeBtnNode) resendCodeBtnNode.disabled = next;
  if (profileSubmitNode) profileSubmitNode.disabled = next;
  if (closeBtnNode) closeBtnNode.disabled = next;
  if (loginEmailNode) loginEmailNode.disabled = next;
  if (otpCodeNode) otpCodeNode.disabled = next;
  if (profileNameNode) profileNameNode.disabled = next;
  if (profileAgeNode) profileAgeNode.disabled = next;
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result || {});
    });
  });
}

function storageSet(payload) {
  return new Promise((resolve) => {
    chrome.storage.local.set(payload, () => resolve());
  });
}

function storageRemove(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve());
  });
}

function fireConfetti() {
  if (!confettiCanvasNode) return;

  const canvas = confettiCanvasNode;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = window.innerWidth || document.documentElement.clientWidth || 1200;
  const height = window.innerHeight || document.documentElement.clientHeight || 800;
  canvas.width = width;
  canvas.height = height;

  const particles = Array.from({ length: 100 }, () => {
    const palette = ["#7fd2ff", "#4da3ff", "#87ffce", "#ffe18a", "#c7c8ff"];
    return {
      x: Math.random() * width,
      y: -20 - Math.random() * 80,
      size: 4 + Math.random() * 6,
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: -0.2 + Math.random() * 0.4,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 70 + Math.floor(Math.random() * 45),
    };
  });

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, width, height);
    frame += 1;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    const alive = particles.some((p) => p.life > 0 && p.y < height + 30);
    if (alive && frame < 180) {
      requestAnimationFrame(tick);
      return;
    }
    ctx.clearRect(0, 0, width, height);
  }

  requestAnimationFrame(tick);
}
