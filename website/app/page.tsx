 "use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CirclePlay,
  Github,
  HeartHandshake,
  Lock,
  MoonStar,
  ShieldQuestion,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  UserRound,
} from "lucide-react";
import { FaApple, FaChrome } from "react-icons/fa";

const links = {
  desktopDownload:
    "https://github.com/moayaan1911/loomless/releases/download/v1.0.0/LoomLess_1.0.0_aarch64.dmg",
  chrome:
    "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj",
  github: "https://github.com/moayaan1911/loomless",
  releases: "https://github.com/moayaan1911/loomless/releases/latest",
  donate: "https://moayaan.com/donate",
  author: "https://moayaan.com",
  privacy: "/loomless-studio-privacy-policy",
  faq: "/faq",
};

const previewCards = [
  {
    label: "Preview 01",
    title: "Start in seconds",
    description: "Pick a recording mode and jump into capture without clutter.",
    image: "/mac-preview-home.png",
    alt: "LoomLess interface preview showing the recorder home screen",
  },
  {
    label: "Preview 02",
    title: "Stay focused while recording",
    description: "Minimal controls keep the attention on what you are showing.",
    image: "/mac-preview-recording.png",
    alt: "LoomLess interface preview showing the recording screen",
  },
  {
    label: "Preview 03",
    title: "Edit locally",
    description: "Trim, refine, and export without leaving LoomLess.",
    image: "/mac-preview-editor.png",
    alt: "LoomLess interface preview showing the editor screen",
  },
];

const faqItems = [
  {
    question: "What is LoomLess?",
    answer:
      "LoomLess is a free screen recorder and editor with a macOS desktop app and a Chrome extension.",
  },
  {
    question: "Does LoomLess upload my recordings?",
    answer:
      "No. LoomLess is built around a local-first workflow, so your video stays on your device.",
  },
  {
    question: "What can I download right now?",
    answer:
      "You can download the macOS desktop app directly as a DMG and also install the Chrome extension.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LoomLess",
    url: "https://loomless.fun",
    description:
      "Free Screen Recorder & Editor with a macOS desktop app and Chrome extension. Local-first, privacy-focused, and built for fast capture and clean exports.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess for macOS",
    operatingSystem: "macOS",
    applicationCategory: "MultimediaApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl: links.desktopDownload,
    url: "https://loomless.fun",
    image: "https://loomless.fun/loomless-icon.png",
    description:
      "Free Screen Recorder & Editor for macOS. Record, edit, and export locally with LoomLess.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess Chrome Extension",
    operatingSystem: "Chrome",
    applicationCategory: "BrowserApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl: links.chrome,
    url: "https://loomless.fun",
    image: "https://loomless.fun/loomless-icon.png",
    description:
      "Free LoomLess Chrome extension for screen recording with a local-first workflow.",
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "LoomLess desktop promo",
    description:
      "Short preview of LoomLess, the free screen recorder and editor for macOS.",
    thumbnailUrl: ["https://loomless.fun/mac-preview-home.png"],
    contentUrl: "https://loomless.fun/loomless-desktop-demo.mp4",
    embedUrl: "https://loomless.fun",
    uploadDate: "2026-04-19",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
];

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMacModalOpen, setIsMacModalOpen] = useState(false);

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined" ? window.localStorage.getItem("loomless-theme") : null;
    const nextTheme =
      storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("loomless-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = isMacModalOpen ? "hidden" : "";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMacModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMacModalOpen]);

  return (
    <main className="relative overflow-hidden">
      <div className="dot-matrix pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-glow hero-glow-a pointer-events-none absolute top-0 left-0 h-[32rem] w-[32rem]" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute right-0 bottom-0 h-[34rem] w-[34rem]" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell">
        <header className="flex flex-col gap-5 py-6 sm:py-8">
          <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] px-5 py-4 shadow-[0_24px_70px_rgba(17,24,39,0.08)] backdrop-blur md:flex-row md:items-center md:px-7">
            <div className="flex items-center gap-4">
              <Image
                src="/loomless-icon.png"
                alt="LoomLess icon"
                width={60}
                height={60}
                className="rounded-[1.25rem] shadow-[0_14px_30px_rgba(84,110,255,0.2)]"
              />
              <div>
                <p className="section-label">LoomLess</p>
                <h1 className="font-display text-[2rem] leading-none text-[var(--fg)] sm:text-[2.3rem]">
                  Free Screen Recorder &amp; Editor
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsMacModalOpen(true)}
                className="primary-button"
              >
                <FaApple className="text-[1.05rem]" />
                Download on Mac
              </button>
              <Link
                href={links.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-button"
              >
                <FaChrome className="text-[1rem]" />
                Add to Chrome
              </Link>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle dark mode"
                className="icon-button"
              >
                {theme === "dark" ? <Sun size={17} /> : <MoonStar size={17} />}
              </button>
            </div>
          </div>
        </header>

        <section className="grid items-center gap-10 py-8 lg:grid-cols-[1.02fr_1fr] lg:py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--accent-soft)] px-4 py-2 text-[0.73rem] font-semibold tracking-[0.22em] text-[var(--accent)] uppercase">
              <ShieldCheck size={15} />
              Your video NEVER leaves your device
            </div>

            <h2 className="mt-6 max-w-xl font-display text-5xl leading-[0.94] text-[var(--fg)] sm:text-6xl lg:text-7xl">
              Clean capture.
              <span className="block text-[var(--accent)]">Local edits.</span>
              <span className="block">Zero nonsense.</span>
            </h2>

            <p className="mt-5 max-w-xl text-[1.05rem] leading-8 text-[var(--muted)] sm:text-[1.12rem]">
              LoomLess gives you a calm, local-first way to record and refine your
              work. Download the macOS app, grab the Chrome extension, and keep the
              whole flow on your own device.
            </p>

            <p className="mt-8 max-w-xl text-[0.98rem] leading-7 text-[var(--muted)]">
              No sign up. No cloud upload. No forced account. Just record, edit, and export locally.
            </p>
          </div>

          <div className="surface-card overflow-hidden p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="section-label">Preview</p>
              <Link
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
              >
                <Github size={16} />
                GitHub
              </Link>
            </div>
            <video
              src="/loomless-desktop-demo.mp4"
              poster="/mac-preview-home.png"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="hero-video aspect-[16/10] w-full rounded-[1.6rem] object-cover"
            />
          </div>
        </section>

        <section className="py-6 lg:py-10">
          <div className="mb-8 flex flex-col gap-2">
            <p className="section-label">Previews</p>
            <h3 className="font-display text-4xl leading-none text-[var(--fg)] sm:text-5xl">
              A quieter interface, built to feel fast.
            </h3>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {previewCards.map((card) => (
              <article key={card.label} className="preview-card">
                <div className="mb-3 flex items-center justify-between">
                  <p className="section-label">{card.label}</p>
                  <Sparkles size={15} className="text-[var(--accent)]" />
                </div>
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={1440}
                  height={900}
                  className="rounded-[1.25rem] border border-[var(--line)] bg-white object-cover"
                />
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-[var(--fg)]">{card.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="surface-card p-6 sm:p-7">
            <div className="mb-6 flex flex-col gap-2">
              <p className="section-label">Quick Links</p>
              <h3 className="font-display text-3xl text-[var(--fg)] sm:text-4xl">
                Everything important, one tap away.
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <button
                type="button"
                onClick={() => setIsMacModalOpen(true)}
                className="quick-link secondary-button"
              >
                <FaApple className="text-[1.05rem]" />
                Mac
              </button>
              <Link
                href={links.releases}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link secondary-button"
              >
                <CirclePlay size={16} />
                Releases
              </Link>
              <Link
                href={links.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link secondary-button"
              >
                <FaChrome className="text-[1rem]" />
                Chrome
              </Link>
              <Link
                href={links.donate}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link primary-button"
              >
                <HeartHandshake size={16} />
                Support Dev
              </Link>
              <Link
                href={links.author}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link primary-button"
              >
                <UserRound size={16} />
                Connect with Dev
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 flex flex-col gap-2">
            <p className="section-label">FAQ</p>
            <h3 className="font-display text-4xl leading-none text-[var(--fg)] sm:text-5xl">
              Straight answers.
            </h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="surface-card p-5">
                <h4 className="text-lg font-semibold text-[var(--fg)]">{item.question}</h4>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-[var(--line)] py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/loomless-icon.png"
              alt="LoomLess icon"
              width={34}
              height={34}
              className="rounded-[0.9rem]"
            />
            <p>LoomLess. Free Screen Recorder &amp; Editor.</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href={links.privacy} className="transition hover:text-[var(--fg)]">
              <span className="inline-flex items-center gap-2">
                <Lock size={15} />
                Privacy
              </span>
            </Link>
            <Link href={links.faq} className="transition hover:text-[var(--fg)]">
              <span className="inline-flex items-center gap-2">
                <ShieldQuestion size={15} />
                FAQ
              </span>
            </Link>
            <Link
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--fg)]"
            >
              <span className="inline-flex items-center gap-2">
                <Github size={15} />
                GitHub
              </span>
            </Link>
            <Link
              href={links.releases}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--fg)]"
            >
              <span className="inline-flex items-center gap-2">
                <CirclePlay size={15} />
                Releases
              </span>
            </Link>
          </div>
        </footer>
      </div>

      {isMacModalOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setIsMacModalOpen(false)}
        >
          <div
            className="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label="Mac alpha install steps"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close download modal"
              className="icon-button modal-close"
              onClick={() => setIsMacModalOpen(false)}
            >
              <X size={17} />
            </button>

            <div className="pr-14">
              <p className="section-label">Mac Alpha Install</p>
              <p className="mt-3 max-w-2xl text-[1rem] leading-7 text-[var(--muted)] sm:text-[1.04rem]">
                LoomLess for macOS is still in alpha, so it is not signed with an
                Apple Developer ID yet. macOS may block the first launch. Follow
                these steps once, then you are good.
              </p>
            </div>

            <ul className="modal-steps">
              <li>Download the DMG, then move LoomLess into your Applications folder.</li>
              <li>Open LoomLess once so macOS shows the security warning.</li>
              <li>Go to System Settings, then open Privacy &amp; Security.</li>
              <li>Scroll down and press Open Anyway.</li>
              <li>Open LoomLess again and confirm the final Open prompt.</li>
            </ul>

            <div className="modal-shot">
              <Image
                src="/mac-install-warning.png"
                alt="macOS warning flow showing where to allow LoomLess to open"
                width={1788}
                height={1536}
                className="modal-shot-image rounded-[1.1rem]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={links.desktopDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
                onClick={() => setIsMacModalOpen(false)}
              >
                <FaApple className="text-[1.05rem]" />
                Download Alpha for Mac
              </Link>
              <Link
                href={links.releases}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-button"
              >
                <CirclePlay size={16} />
                View release
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
