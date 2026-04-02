"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaFirefoxBrowser } from "react-icons/fa6";
import {
  ArrowRight,
  Camera,
  Chrome,
  CircleHelp,
  CloudOff,
  Copyright,
  Crop,
  Download,
  Github,
  MoonStar,
  Rocket,
  Scissors,
  Sun,
  Video,
  Waves,
  UserRound,
} from "lucide-react";

type Theme = "dark" | "light";

const THEME_KEY = "loomless-theme";

const highlights = [
  {
    title: "Screen + Audio Capture",
    description: "Record screens, tabs, or windows with optional audio.",
    icon: Video,
  },
  {
    title: "Smart Camera Overlay",
    description: "Draggable webcam bubble with no duplicate circles.",
    icon: Camera,
  },
  {
    title: "Floating Recording Control",
    description: "Pause, resume, and stop across browser pages.",
    icon: Waves,
  },
  {
    title: "Built-in Editor",
    description: "Trim, crop, speed-tune, and export locally.",
    icon: Scissors,
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
  pizbot: "https://pizbot.com",
  twitter: "https://x.com/moayaan1911",
};

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LoomLess: Free Screen Recorder & Editor",
  alternateName: "LoomLess",
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Screen Recorder Extension",
  operatingSystem: "Chrome, Firefox",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: "https://loomless.fun",
  image: "https://loomless.fun/og-image-v2.jpg",
  description:
    "LoomLess is a free private screen recorder for Chrome with local recording, webcam overlay, floating recording controls, built-in editing, and export to WebM or MP4.",
  keywords:
    "free screen recorder, private screen recorder, screen recorder extension, local screen recorder, webcam overlay screen recorder, screen recorder with audio, screen recorder with editor",
  author: {
    "@type": "Person",
    name: "Mohammad Ayaan Siddiqui",
    url: "https://moayaan.com",
  },
};

const webSiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LoomLess",
  alternateName: ["LoomLess", "loomless.fun"],
  url: "https://loomless.fun",
  description:
    "Free private screen recorder for Chrome with local recording, floating controls, webcam overlay, and built-in editing.",
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is LoomLess?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LoomLess is a free private screen recorder extension for recording your screen, browser tab, window, webcam, and audio with built-in local editing.",
      },
    },
    {
      "@type": "Question",
      name: "Does LoomLess upload my recordings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. LoomLess processes recordings locally so your video never leaves your device.",
      },
    },
    {
      "@type": "Question",
      name: "Can LoomLess record screen and webcam together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. LoomLess supports screen, screen plus microphone, screen plus webcam, and screen plus webcam plus microphone recording modes.",
      },
    },
  ],
};

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] fill-current"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-7.39L5.6 22H2.5l7.24-8.28L.8 2h6.4l4.42 6.76L18.9 2Zm-1.09 18h1.72L6.25 3.9H4.4Z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1 1.8-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-.9 2.5-2" />
      <path d="M12 6.5v11" />
    </svg>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "dark";
  });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden">
      <div className="holo-grid pointer-events-none fixed inset-0 -z-20 opacity-55" />
      <div className="orb orb-a pointer-events-none fixed -top-20 -left-16 -z-20 h-72 w-72 rounded-full blur-3xl" />
      <div className="orb orb-b pointer-events-none fixed right-0 bottom-0 -z-20 h-96 w-96 rounded-full blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 lg:px-10">
        <Link
          href={ctaLinks.author}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt="LoomLess logo"
            width={56}
            height={56}
            className="rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-lg shadow-cyan-300/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
          />
          <p className="text-2xl font-bold tracking-wide sm:text-3xl">LoomLess</p>
        </Link>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="glass-card flex cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
        >
          {isDark ? <Sun size={24} /> : <MoonStar size={24} />}
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 lg:px-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <section className="section-appear mb-20 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div
              className={`inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] shadow-[0_0_0_1px_rgba(125,224,255,0.08),0_14px_40px_rgba(54,193,255,0.14)] ${
                isDark
                  ? "border border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                  : "border border-sky-400/45 bg-sky-200/55 text-sky-700"
              }`}
            >
              <Waves size={18} />
              YOUR VIDEO NEVER LEAVES YOUR DEVICE
            </div>
            <h1 className="neon-title mt-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              <span className="block">LoomLess: Private Screen Recorder</span>
              <span className="block text-(--accent)">with Local Editing</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-3 xl:flex-nowrap">
              <Link
                href={ctaLinks.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-primary"
              >
                <Chrome size={18} />
                Install on Chrome
                <ArrowRight size={18} />
              </Link>
              <div className="group relative">
                <button
                  type="button"
                  disabled
                  className="action-btn action-btn-firefox cursor-not-allowed opacity-50"
                >
                  <FaFirefoxBrowser size={18} />
                  Install on Firefox
                </button>
                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/85 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Coming Soon
                </span>
              </div>
              <Link
                href={ctaLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-muted"
              >
                <Github size={18} />
                Explore Source
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <article
                  key={item.title}
                  className={`glass-card section-appear rounded-2xl px-4 py-3.5 delay-${index + 1}`}
                >
                  <item.icon size={18} className="mb-2 text-(--accent)" />
                  <h2 className="mb-1.5 text-sm font-semibold">{item.title}</h2>
                  <p className="text-sm leading-5.5 text-(--muted)">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="section-appear delay-2">
            <div className="glass-card relative overflow-hidden rounded-3xl p-4">
              <div className="absolute -top-16 -right-8 h-36 w-36 rounded-full bg-cyan-400/25 blur-3xl" />
              <video
                src="/loomless-promo.mp4"
                poster="/ui-preview-1-v2.png"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="floaty aspect-[16/11] w-full rounded-2xl border border-white/12 object-cover"
              />
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
            <Link
              href={ctaLinks.donate}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-btn-muted"
            >
              Support Project
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="glass-card rounded-2xl p-5">
              <CloudOff size={18} className="mb-3 text-(--accent)" />
              <h4 className="mb-2 text-base font-semibold">No Cloud Uploads</h4>
              <p className="text-sm text-(--muted)">
                IndexedDB handoff keeps recorder and editor local. YOUR VIDEO NEVER LEAVES YOUR DEVICE.
              </p>
            </article>
            <article className="glass-card rounded-2xl p-5">
              <Waves size={18} className="mb-3 text-(--accent)" />
              <h4 className="mb-2 text-base font-semibold">Floating Recording Control</h4>
              <p className="text-sm text-(--muted)">
                Pause, resume, and stop recordings from a draggable control that follows across browser pages.
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
          <div className="grid gap-5 md:grid-cols-3">
            {[
              "/ui-preview-2-v2.png",
              "/ui-preview-3-v2.png",
              "/ui-preview-4-v2.png",
            ].map((src, index) => (
              <article key={src} className="glass-card group rounded-2xl p-3">
                <Image
                  src={src}
                  alt={`LoomLess screenshot ${index + 1}`}
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
        <p className="flex items-center gap-2">
          <Copyright size={15} />
          {currentYear} LoomLess.Fun Built by Mohammad Ayaan Siddiqui
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={ctaLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <Github size={17} />
            GitHub
          </Link>
          <Link
            href="/loomless-studio-privacy-policy"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <CloudOff size={17} />
            Privacy Policy
          </Link>
          <Link
            href="/faq"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <CircleHelp size={17} />
            FAQ
          </Link>
          <Link
            href={ctaLinks.author}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <UserRound size={17} />
            Connect with Dev
          </Link>
          <Link
            href={ctaLinks.pizbot}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <Image
              src="/pizbot.webp"
              alt="Pizbot"
              width={17}
              height={17}
              className="rounded-sm"
            />
            Pizbot
          </Link>
          <Link
            href={ctaLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <XIcon />
            X
          </Link>
          <Link
            href={ctaLinks.donate}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link flex cursor-pointer items-center gap-2"
          >
            <SupportIcon />
            Donate
          </Link>
        </div>
      </footer>
    </div>
  );
}
