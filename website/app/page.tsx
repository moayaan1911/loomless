"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CirclePlay,
  Github,
  HeartHandshake,
  Lock,
  ShieldQuestion,
  UserRound,
} from "lucide-react";
import { FaApple, FaChrome } from "react-icons/fa";

const links = {
  desktopDownload:
    "https://github.com/moayaan1911/loomless/releases/download/v0.0.1/LoomLess-alpha-0.0.1-aarch64.dmg",
  chrome:
    "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj",
  github: "https://github.com/moayaan1911/loomless",
  releases: "https://github.com/moayaan1911/loomless/releases/latest",
  donate: "https://moayaan.com/donate",
  author: "https://moayaan.com",
  privacy: "/loomless-studio-privacy-policy",
  faq: "/faq",
  freeRecorder: "/free-screen-recorder",
  chromeRecorder: "/chrome-screen-recorder",
  macRecorder: "/screen-recorder-for-mac",
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
    title: "Keep the edit flow local",
    description: "The Chrome extension flow keeps trimming and export on your device too.",
    image: "/mac-preview-editor.png",
    alt: "LoomLess interface preview showing the local editor flow",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LoomLess",
    url: "https://loomless.fun",
    description:
      "Free screen recorder for Mac and Chrome. Local-first, privacy-focused, with a recorder-only macOS alpha and a Chrome extension recording flow.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess for macOS",
    operatingSystem: "macOS",
    applicationCategory: "MultimediaApplication",
    softwareVersion: "0.0.1",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl: links.desktopDownload,
    url: "https://loomless.fun",
    image: "https://loomless.fun/loomless-icon.png",
    description:
      "Free screen recorder for Mac. The current public macOS build is a recorder-only alpha that records locally and saves directly after capture.",
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
      "Free Chrome screen recorder extension with a local-first recording and editing workflow.",
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "LoomLess desktop promo",
    description:
      "Short preview of LoomLess, the free local-first screen recorder for Mac and Chrome.",
    thumbnailUrl: ["https://loomless.fun/mac-preview-home.png"],
    contentUrl: "https://loomless.fun/loomless-desktop-demo.mp4",
    embedUrl: "https://loomless.fun",
    uploadDate: "2026-04-19",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="dot-matrix pointer-events-none absolute inset-0" />
      <div className="hero-glow hero-glow-a pointer-events-none absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem]" />
      <div className="hero-glow hero-glow-b pointer-events-none absolute right-[-10%] bottom-[-10%] h-[36rem] w-[36rem]" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell">
        <header className="flex items-center py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <Image
              src="/loomless-icon.png"
              alt="LoomLess"
              width={48}
              height={48}
              className="rounded-[1.1rem] shadow-[0_12px_28px_rgba(110,92,219,0.28)]"
            />
            <div>
              <h1 className="text-xl font-bold leading-tight text-[var(--fg)] sm:text-2xl">
                LoomLess
              </h1>
              <p className="text-sm leading-tight text-[var(--muted)]">
                Free Screen Recorder &amp; Editor
              </p>
            </div>
          </div>
        </header>

        <section className="grid items-center gap-10 py-4 lg:grid-cols-[1fr_1.1fr] lg:py-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[0.65rem] font-bold tracking-[0.14em] text-[var(--accent)] uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Your video never leaves your device
            </span>

            <p className="mt-5 max-w-md text-[1.1rem] leading-7 text-[var(--muted)] sm:text-[1.18rem] sm:leading-8">
              An <span className="italic font-semibold text-[var(--accent)]">open-source</span> and privacy-first screen recorder that keeps everything local.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={links.desktopDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
              >
                <FaApple className="text-[1.1rem]" />
                Download for Mac
              </Link>
              <Link
                href={links.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-button"
              >
                <FaChrome className="text-[1.05rem]" />
                Add to Chrome
              </Link>
            </div>
          </div>

          <video
            src="/loomless-desktop-demo.mp4"
            poster="/mac-preview-home.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="hero-video aspect-[16/10] w-full object-cover"
          />
        </section>

        <hr className="section-divider my-8 lg:my-14" />

        <section className="py-6 lg:py-8">
          {previewCards.map((card, i) => (
            <div
              key={card.label}
              className={`feature-row ${i < previewCards.length - 1 ? "mb-16 lg:mb-24" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <p className="section-label mb-2">{card.label}</p>
                <h3 className="font-display text-2xl text-[var(--fg)] sm:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-3 text-[1rem] leading-7 text-[var(--muted)] max-w-md">
                  {card.description}
                </p>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={1440}
                  height={900}
                  className="feature-image"
                />
              </div>
            </div>
          ))}
        </section>

        <hr className="section-divider my-8 lg:my-14" />

        {/* ---- Ecosystem ---- */}
        <section className="py-8 lg:py-10">
          <div className="mb-8 text-center">
            <p className="section-label mb-2">Ecosystem</p>
            <h3 className="font-display text-2xl text-[var(--fg)] sm:text-3xl">
              More from LoomLess.
            </h3>
          </div>
          <div className="mx-auto max-w-lg rounded-2xl border border-[var(--line)] bg-white/50 p-6">
            <div className="flex items-start gap-5">
              <Image
                src="/loomless-downloader.png"
                alt="LoomLess Downloader"
                width={48}
                height={48}
                className="rounded-xl shrink-0"
              />
              <div>
                <h4 className="text-lg font-semibold text-[var(--fg)]">LoomLess Downloader</h4>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  One-click media downloader for Twitter/X and Reddit. Save images and videos instantly, no signup.
                </p>
                <div className="mt-3">
                  <a href="https://chromewebstore.google.com/detail/loomless-downloader/oghfagmhgdinagefagjpamiggcofjmii" target="_blank" rel="noopener noreferrer" className="secondary-button text-xs py-1.5 px-3">
                    <FaChrome className="text-xs" /> Add to Chrome
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-[var(--line)] py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/loomless-icon.png"
              alt="LoomLess"
              width={30}
              height={30}
              className="rounded-[0.8rem]"
            />
            <p>LoomLess. Free local screen recorder suite.</p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href={links.privacy} className="text-link">
              <span className="inline-flex items-center gap-2">
                <Lock size={14} />
                Privacy
              </span>
            </Link>
            <Link href={links.faq} className="text-link">
              <span className="inline-flex items-center gap-2">
                <ShieldQuestion size={14} />
                FAQ
              </span>
            </Link>
            <Link href={links.github} target="_blank" rel="noopener noreferrer" className="text-link">
              <span className="inline-flex items-center gap-2">
                <Github size={14} />
                GitHub
              </span>
            </Link>
            <Link href={links.releases} target="_blank" rel="noopener noreferrer" className="text-link">
              <span className="inline-flex items-center gap-2">
                <CirclePlay size={14} />
                Releases
              </span>
            </Link>
            <Link href={links.donate} target="_blank" rel="noopener noreferrer" className="text-link">
              <span className="inline-flex items-center gap-2">
                <HeartHandshake size={14} />
                Support
              </span>
            </Link>
            <Link href={links.author} target="_blank" rel="noopener noreferrer" className="text-link">
              <span className="inline-flex items-center gap-2">
                <UserRound size={14} />
                Connect
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
