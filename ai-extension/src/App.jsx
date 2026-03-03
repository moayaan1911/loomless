import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "loomless_ai_floating_enabled";
const hasChromeApi = typeof chrome !== "undefined" && Boolean(chrome?.storage?.local);

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasChromeApi) {
      setReady(true);
      return;
    }
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setEnabled(Boolean(result[STORAGE_KEY]));
      setReady(true);
    });

    const storageListener = (changes, areaName) => {
      if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
      setEnabled(Boolean(changes[STORAGE_KEY].newValue));
    };
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  function setFloatingState(nextState) {
    setEnabled(nextState);

    if (!hasChromeApi) return;

    chrome.storage.local.set({ [STORAGE_KEY]: nextState }, () => {
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
    </main>
  );
}
