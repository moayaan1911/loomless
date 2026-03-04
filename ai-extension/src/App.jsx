import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_FLOATING_KEY = "loomless_ai_floating_enabled";
const STORAGE_NIM_API_KEY = "loomless_ai_nim_api_key";
const STORAGE_TAVILY_API_KEY = "loomless_ai_tavily_api_key";
const hasChromeApi = typeof chrome !== "undefined" && Boolean(chrome?.storage?.local);
const envApiKey = String(
  import.meta.env.NVIDIA_API || import.meta.env.VITE_NVIDIA_API || ""
).trim();
const envTavilyApiKey = String(
  import.meta.env.TRAVILY_API ||
    import.meta.env.TAVILY_API ||
    import.meta.env.VITE_TRAVILY_API ||
    import.meta.env.VITE_TAVILY_API ||
    ""
).trim();

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasChromeApi) {
      setReady(true);
      return;
    }

    chrome.storage.local.get([STORAGE_FLOATING_KEY, STORAGE_NIM_API_KEY, STORAGE_TAVILY_API_KEY], (result) => {
      const existingKey = typeof result[STORAGE_NIM_API_KEY] === "string" ? result[STORAGE_NIM_API_KEY].trim() : "";
      const existingTavilyKey =
        typeof result[STORAGE_TAVILY_API_KEY] === "string" ? result[STORAGE_TAVILY_API_KEY].trim() : "";

      if (!existingKey && envApiKey) {
        chrome.storage.local.set({ [STORAGE_NIM_API_KEY]: envApiKey });
      }
      if (!existingTavilyKey && envTavilyApiKey) {
        chrome.storage.local.set({ [STORAGE_TAVILY_API_KEY]: envTavilyApiKey });
      }

      setEnabled(Boolean(result[STORAGE_FLOATING_KEY]));
      setReady(true);
    });

    const storageListener = (changes, areaName) => {
      if (areaName !== "local") return;
      if (STORAGE_FLOATING_KEY in changes) {
        setEnabled(Boolean(changes[STORAGE_FLOATING_KEY].newValue));
      }
    };
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  function setFloatingState(nextState) {
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
      chrome.tabs.sendMessage(
        tabId,
        { type: "LOOMLESS_AI_SET_FLOATING", enabled: nextState },
        () => {
          void chrome.runtime.lastError;
        }
      );
    });
  }

  function openChatPage() {
    const chatUrl = hasChromeApi ? chrome.runtime.getURL("chat.html") : "/chat.html";
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="app-shell">
      <img src="/icon.png" alt="LoomLess AI" className="logo" />
      <h1>LoomLess AI</h1>
      <p className="subtitle">Toggle floating icon on current web pages.</p>

      <div className="toggle-row">
        <span className="toggle-label">Floating Assistant</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle floating assistant"
          className={`toggle-btn ${enabled ? "on" : "off"}`}
          onClick={() => setFloatingState(!enabled)}
          disabled={!ready}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      <p className="hint">
        {enabled ? "Enabled on supported pages." : "Disabled. Turn on to show the right-side icon."}
      </p>

      <button type="button" className="chat-page-btn" onClick={openChatPage}>
        Chat with LoomLess AI
      </button>
    </main>
  );
}
