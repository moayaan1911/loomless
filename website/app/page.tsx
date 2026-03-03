"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  Chrome,
  CloudOff,
  Crop,
  Download,
  Github,
  MoonStar,
  Rocket,
  Scissors,
  ShieldCheck,
  Sun,
  Video,
  Waves,
} from "lucide-react";

type Theme = "dark" | "light";

const THEME_KEY = "loomless-theme";

const highlights = [
  {
    title: "Screen + Audio Capture",
    description:
      "Record full screen, tabs, or windows with system audio and optional mic narration.",
    icon: Video,
  },
  {
    title: "Smart Camera Overlay",
    description:
      "Draggable webcam bubble with intelligent compositing to avoid duplicate camera circles.",
    icon: Camera,
  },
  {
    title: "Built-in Editor",
    description:
      "Trim, crop, adjust speed, and export to WebM or MP4 directly in-browser.",
    icon: Scissors,
  },
  {
    title: "100% Local Processing",
    description:
      "No sign-up, no cloud upload, no tracking. Your recordings stay on your device.",
    icon: ShieldCheck,
  },
];

const workflow = [
  "Choose mode: Screen, Screen + Mic, Screen + Cam, or Screen + Cam + Mic.",
  "Pick source: Entire Screen, Window, or Browser Tab from native Chrome prompt.",
  "Record naturally with optional camera overlay and microphone.",
  "Trim, crop, speed-tune, then export your final video.",
];

const modes = [
  "screen",
  "screen-mic",
  "screen-cam",
  "screen-cam-mic",
] as const;

const ctaLinks = {
  chrome:
    "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj",
  github: "https://github.com/moayaan1911/loomless",
  donate: "https://moayaan.com/donate",
  author: "https://moayaan.com",
};

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const nextTheme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [mounted, theme]);

  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden">
      <div className="holo-grid pointer-events-none fixed inset-0 -z-20 opacity-55" />
      <div className="orb orb-a pointer-events-none fixed -top-20 -left-16 -z-20 h-72 w-72 rounded-full blur-3xl" />
      <div className="orb orb-b pointer-events-none fixed right-0 bottom-0 -z-20 h-96 w-96 rounded-full blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 lg:px-10">
        <a
          href={ctaLinks.author}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt="LoomLess logo"
            width={40}
            height={40}
            className="rounded-xl border border-white/20 bg-white/10 p-1.5 shadow-lg shadow-cyan-300/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
          />
          <div>
            <p className="font-semibold tracking-wide">LoomLess</p>
            <p className="text-xs text-(--muted)">Privacy-first screen recorder</p>
          </div>
        </a>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
        >
          {mounted && isDark ? <Sun size={16} /> : <MoonStar size={16} />}
          {mounted && isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 lg:px-10">
        <section className="section-appear mb-20 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-(--muted)">
              <Waves size={14} />
              Zero Cloud. Zero Tracking.
            </div>
            <h1 className="neon-title mt-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              Futuristic screen recording
              <span className="block text-(--accent)">without sacrificing privacy.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-(--muted) sm:text-lg">
              LoomLess is a local-first Chrome extension for recording and editing.
              No account walls, no uploads, no watermark, and no hidden pricing.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={ctaLinks.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-primary"
              >
                <Chrome size={18} />
                Install on Chrome
                <ArrowRight size={18} />
              </a>
              <a
                href={ctaLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-muted"
              >
                <Github size={18} />
                Explore Source
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <article
                  key={item.title}
                  className={`glass-card section-appear rounded-2xl p-4 delay-${index + 1}`}
                >
                  <item.icon size={18} className="mb-3 text-(--accent)" />
                  <h2 className="mb-2 text-sm font-semibold">{item.title}</h2>
                  <p className="text-sm leading-6 text-(--muted)">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="section-appear delay-2">
            <div className="glass-card relative overflow-hidden rounded-3xl p-4">
              <div className="absolute -top-16 -right-8 h-36 w-36 rounded-full bg-cyan-400/25 blur-3xl" />
              <Image
                src="/1.png"
                alt="LoomLess recorder interface screenshot"
                width={1050}
                height={700}
                priority
                className="floaty rounded-2xl border border-white/12"
              />
              <div className="absolute top-8 left-8 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-xs font-medium text-emerald-100">
                Local Processing Active
              </div>
              <div className="glass-card absolute right-6 bottom-6 rounded-xl px-3 py-2 text-xs">
                No Account Required
              </div>
            </div>
          </div>
        </section>

        <section className="section-appear mb-20 rounded-3xl border border-(--line) bg-white/4 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-(--muted)">
            <Rocket size={14} />
            Workflow
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div key={step} className="glass-card rounded-2xl p-4">
                <p className="mb-2 text-xs text-(--accent)">STEP 0{index + 1}</p>
                <p className="text-sm leading-6 text-(--muted)">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-appear mb-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">
                Feature Snapshot
              </p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Everything you need. Nothing you do not.
              </h3>
            </div>
            <a
              href={ctaLinks.donate}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-btn-muted"
            >
              Support Project
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="glass-card rounded-2xl p-5">
              <CloudOff size={18} className="mb-3 text-(--accent)" />
              <h4 className="mb-2 text-base font-semibold">No Cloud Uploads</h4>
              <p className="text-sm text-(--muted)">
                IndexedDB handoff keeps recorder and editor local. Files stay on-device.
              </p>
            </article>
            <article className="glass-card rounded-2xl p-5">
              <Crop size={18} className="mb-3 text-(--accent)" />
              <h4 className="mb-2 text-base font-semibold">Precision Editing</h4>
              <p className="text-sm text-(--muted)">
                Free-form crop, timeline trim, speed controls, and export fallback handling.
              </p>
            </article>
            <article className="glass-card rounded-2xl p-5">
              <Download size={18} className="mb-3 text-(--accent)" />
              <h4 className="mb-2 text-base font-semibold">Flexible Exports</h4>
              <p className="text-sm text-(--muted)">
                Save in WebM or MP4 depending on browser capabilities with quality preserved.
              </p>
            </article>
          </div>
        </section>

        <section className="section-appear mb-20">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-(--muted)">UI Preview</p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">Recorder + Editor Screens</h3>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((num) => (
              <article key={num} className="glass-card group rounded-2xl p-3">
                <Image
                  src={`/${num}.png`}
                  alt={`LoomLess screenshot ${num}`}
                  width={1250}
                  height={820}
                  className="rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-[1.015]"
                />
              </article>
            ))}
          </div>
        </section>

        <section className="section-appear mb-16 rounded-3xl border border-(--line) bg-white/4 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold sm:text-3xl">Recording Modes</h3>
            <p className="text-xs uppercase tracking-[0.15em] text-(--muted)">Current Support</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modes.map((mode) => (
              <div
                key={mode}
                className="glass-card rounded-2xl border border-(--line) px-4 py-5 text-center"
              >
                <p className="font-mono text-sm text-(--accent)">{mode}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-8 text-center text-sm text-(--muted) sm:flex-row sm:text-left lg:px-10">
        <p>Built by moayaan.eth. Open-source and forever free.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={ctaLinks.github} target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <a href={ctaLinks.author} target="_blank" rel="noopener noreferrer" className="footer-link">
            Website
          </a>
          <a href={ctaLinks.donate} target="_blank" rel="noopener noreferrer" className="footer-link">
            Donate
          </a>
        </div>
      </footer>
    </div>
  );
}
