import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaComments, FaRightFromBracket, FaToggleOn, FaUserCheck } from "react-icons/fa6";
import "./App.css";

const STORAGE_FLOATING_KEY = "loomless_ai_floating_enabled";
const STORAGE_NIM_API_KEY = "loomless_ai_nim_api_key";
const STORAGE_TAVILY_API_KEY = "loomless_ai_tavily_api_key";
const STORAGE_SUPABASE_URL = "loomless_ai_supabase_url";
const STORAGE_SUPABASE_KEY = "loomless_ai_supabase_key";
const STORAGE_AUTH_SESSION = "loomless_ai_auth_session";
const STORAGE_PROFILE_COMPLETED = "loomless_ai_profile_completed";

const hasChromeApi = typeof chrome !== "undefined" && Boolean(chrome?.storage?.local);

const envApiKey = String(import.meta.env.NVIDIA_API || import.meta.env.VITE_NVIDIA_API || "").trim();
const envTavilyApiKey = String(
  import.meta.env.TRAVILY_API ||
    import.meta.env.TAVILY_API ||
    import.meta.env.VITE_TRAVILY_API ||
    import.meta.env.VITE_TAVILY_API ||
    ""
).trim();
const envSupabaseUrl = String(import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "").trim();
const envSupabaseKey = String(
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ""
).trim();

function storageGet(keys) {
  if (!hasChromeApi) return Promise.resolve({});
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result || {});
    });
  });
}

function storageSet(payload) {
  if (!hasChromeApi) return Promise.resolve();
  return new Promise((resolve) => {
    chrome.storage.local.set(payload, () => resolve());
  });
}

function storageRemove(keys) {
  if (!hasChromeApi) return Promise.resolve();
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve());
  });
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

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isAuthenticated = Boolean(authSession?.accessToken && authSession?.userId);
  const hasExtensionAccess = useMemo(
    () => Boolean(isAuthenticated && profileCompleted),
    [isAuthenticated, profileCompleted]
  );

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!hasChromeApi) {
        if (mounted) setReady(true);
        return;
      }

      const result = await storageGet([
        STORAGE_FLOATING_KEY,
        STORAGE_NIM_API_KEY,
        STORAGE_TAVILY_API_KEY,
        STORAGE_SUPABASE_URL,
        STORAGE_SUPABASE_KEY,
        STORAGE_AUTH_SESSION,
        STORAGE_PROFILE_COMPLETED,
      ]);

      const existingNim = String(result[STORAGE_NIM_API_KEY] || "").trim();
      const existingTavily = String(result[STORAGE_TAVILY_API_KEY] || "").trim();
      const existingSupabaseUrl = String(result[STORAGE_SUPABASE_URL] || "").trim();
      const existingSupabaseKey = String(result[STORAGE_SUPABASE_KEY] || "").trim();

      const seedPayload = {};
      if (!existingNim && envApiKey) seedPayload[STORAGE_NIM_API_KEY] = envApiKey;
      if (!existingTavily && envTavilyApiKey) seedPayload[STORAGE_TAVILY_API_KEY] = envTavilyApiKey;
      if (!existingSupabaseUrl && envSupabaseUrl) seedPayload[STORAGE_SUPABASE_URL] = envSupabaseUrl;
      if (!existingSupabaseKey && envSupabaseKey) seedPayload[STORAGE_SUPABASE_KEY] = envSupabaseKey;
      if (Object.keys(seedPayload).length) {
        await storageSet(seedPayload);
      }

      const session = normalizeAuthSession(result[STORAGE_AUTH_SESSION]);
      const completed = result[STORAGE_PROFILE_COMPLETED] === true;
      const nextEnabled = Boolean(result[STORAGE_FLOATING_KEY]) && Boolean(session) && completed;

      if (!session || !completed) {
        await storageSet({ [STORAGE_FLOATING_KEY]: false });
      }

      if (!mounted) return;
      setAuthSession(session);
      setProfileCompleted(completed);
      setEnabled(nextEnabled);
      setReady(true);
    }

    init();

    if (hasChromeApi) {
      const storageListener = (changes, areaName) => {
        if (areaName !== "local") return;
        if (STORAGE_AUTH_SESSION in changes) {
          setAuthSession(normalizeAuthSession(changes[STORAGE_AUTH_SESSION].newValue));
        }
        if (STORAGE_PROFILE_COMPLETED in changes) {
          setProfileCompleted(changes[STORAGE_PROFILE_COMPLETED].newValue === true);
        }
        if (STORAGE_FLOATING_KEY in changes) {
          setEnabled(Boolean(changes[STORAGE_FLOATING_KEY].newValue));
        }
      };
      chrome.storage.onChanged.addListener(storageListener);
      return () => {
        mounted = false;
        chrome.storage.onChanged.removeListener(storageListener);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  function disableFloatingAcrossTabs() {
    if (!hasChromeApi) return;
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, { type: "LOOMLESS_AI_SET_FLOATING", enabled: false }, () => {
          void chrome.runtime?.lastError;
        });
      });
    });
  }

  function setFloatingState(nextState) {
    if (!hasExtensionAccess) {
      setFeedback("Complete login/setup first.");
      return;
    }

    setEnabled(nextState);
    if (!hasChromeApi) return;

    chrome.storage.local.set({ [STORAGE_FLOATING_KEY]: nextState }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(tabId, { type: "LOOMLESS_AI_SET_FLOATING", enabled: nextState }, () => {
        void chrome.runtime.lastError;
      });
    });
  }

  function openAuthPage() {
    if (!hasChromeApi) return;
    const authUrl = chrome.runtime.getURL("auth.html");
    window.open(authUrl, "_blank", "noopener,noreferrer");
  }

  function openChatPage() {
    if (!hasExtensionAccess) {
      setFeedback("Complete login/setup first.");
      return;
    }
    const chatUrl = hasChromeApi ? chrome.runtime.getURL("chat.html") : "/chat.html";
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  }

  async function handleLogout() {
    if (!hasChromeApi || busy) return;
    setBusy(true);
    setFeedback("");
    try {
      await storageSet({ [STORAGE_FLOATING_KEY]: false });
      await storageRemove([STORAGE_AUTH_SESSION, STORAGE_PROFILE_COMPLETED]);
      disableFloatingAcrossTabs();
      setEnabled(false);
      setAuthSession(null);
      setProfileCompleted(false);
      setFeedback("Logged out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <img src="/icon.png" alt="LoomLess AI" className="logo" />
      <h1>LoomLess AI</h1>

      {!hasExtensionAccess ? (
        <>
          <p className="subtitle">
            {isAuthenticated
              ? "Complete your setup to unlock LoomLess AI."
              : "Sign in required to use LoomLess AI features."}
          </p>

          <button type="button" className="chat-page-btn" onClick={openAuthPage} disabled={!ready || busy}>
            <FaArrowRight aria-hidden="true" />
            <span>Continue to LoomLess AI</span>
          </button>

          {isAuthenticated ? (
            <button type="button" className="logout-btn" onClick={handleLogout} disabled={busy}>
              <FaRightFromBracket aria-hidden="true" />
              <span>Log out</span>
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p className="subtitle">Signed in as {authSession?.email || "user"}.</p>

          <div className="toggle-row">
            <span className="toggle-label">
              <FaToggleOn aria-hidden="true" />
              <span>Floating Assistant</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Toggle floating assistant"
              className={`toggle-btn ${enabled ? "on" : "off"}`}
              onClick={() => setFloatingState(!enabled)}
              disabled={!ready || busy}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          <p className="hint">
            {enabled ? "Enabled on supported pages." : "Disabled. Turn on to show the right-side icon."}
          </p>

          <button type="button" className="chat-page-btn" onClick={openChatPage} disabled={busy}>
            <FaComments aria-hidden="true" />
            <span>Chat with LoomLess AI</span>
          </button>

          <button type="button" className="logout-btn" onClick={handleLogout} disabled={busy}>
            <FaRightFromBracket aria-hidden="true" />
            <span>Log out</span>
          </button>
        </>
      )}

      {feedback ? (
        <p className="auth-feedback ok">
          <FaUserCheck aria-hidden="true" />
          <span>{feedback}</span>
        </p>
      ) : null}
    </main>
  );
}
