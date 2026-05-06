"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Section {
  icon: string;
  title: string;
  bullets: string[];
  footer?: string;
}

const studioSections: Section[] = [
  {
    icon: "🔒",
    title: "Core Privacy Principle",
    bullets: [
      "No account, signup, or login required",
      "Recordings are never uploaded to any server",
      "No browsing activity tracking or analytics",
      "No collection or sale of personal data",
    ],
  },
  {
    icon: "💻",
    title: "How Recordings Work",
    bullets: [
      "Screen, camera, and mic capture run locally via browser APIs",
      "Recordings stored temporarily on your device for editing",
      "Trim, crop, speed, and export happen entirely in your browser",
      "Final video files are saved only by you, to your device",
    ],
  },
  {
    icon: "📦",
    title: "Local Storage",
    bullets: [
      "Temporary storage used only to move from recording to editing",
      "Never shared, never used for analytics or profiling",
    ],
  },
  {
    icon: "🔑",
    title: "Permissions",
    bullets: [
      "tabs & activeTab — open and coordinate the recorder/editor tabs",
      "scripting — inject floating controls during recording",
      "Host permissions — only so controls appear on the page you record",
      "None of these read your page content or browsing history",
    ],
  },
  {
    icon: "🎤",
    title: "Camera & Microphone",
    bullets: [
      "Only accessed when you choose a camera/mic recording mode",
      "Data processed locally, never sent anywhere",
    ],
  },
  {
    icon: "📌",
    title: "Floating Controls",
    bullets: [
      "Pause, resume, and stop buttons shown during recording",
      "Purely functional — no page content is inspected or stored",
    ],
  },
  {
    icon: "🍪",
    title: "Cookies & Analytics",
    bullets: ["No cookies, no third-party analytics, no trackers"],
  },
  {
    icon: "👶",
    title: "Children's Privacy",
    bullets: ["No personal data knowingly collected from anyone"],
  },
  {
    icon: "📋",
    title: "Policy Changes",
    bullets: ["Updated when the extension materially changes"],
  },
  {
    icon: "✉️",
    title: "Contact",
    bullets: ["Reach out at moayaan.com or moayaan.eth@gmail.com"],
  },
];

const downloaderSections: Section[] = [
  {
    icon: "🔒",
    title: "Core Privacy Principle",
    bullets: [
      "One-click media downloader for Twitter/X and Reddit",
      "Completely client-side — no data ever leaves your browser",
      "No servers, no API keys, no signup, no telemetry",
      "Download button only appears on posts with downloadable media",
    ],
    footer: "Source: github.com/moayaan1911/loomless-downloader",
  },
  {
    icon: "🔑",
    title: "Permissions",
    bullets: [
      "downloads — save images and videos directly to your device",
      "storage — cache extracted video URLs and your preferences locally",
      "Host access (twitter.com, x.com, reddit.com) — detect posts and extract media URLs from page content",
    ],
  },
  {
    icon: "⬇️",
    title: "How Downloads Work",
    bullets: [
      "Click the download button on any tweet or post with media",
      "Files download directly from the source platform's CDN to your device",
      "No intermediate server — pure browser-to-source transfer",
      "Files saved with meaningful names from post content",
    ],
  },
  {
    icon: "🚫",
    title: "What We Don't Collect",
    bullets: [
      "No personal data, browsing history, or download history",
      "No analytics, crash reporting, or telemetry of any kind",
      "No communication with external servers besides source platforms",
    ],
  },
  {
    icon: "👶",
    title: "Children's Privacy",
    bullets: ["No personal data knowingly collected from anyone"],
  },
  {
    icon: "📋",
    title: "Policy Changes",
    bullets: ["Updated when the extension materially changes"],
  },
  {
    icon: "✉️",
    title: "Contact",
    bullets: ["Reach out at moayaan.com or moayaan.eth@gmail.com"],
  },
];

export default function PrivacyPolicyPage() {
  const [tab, setTab] = useState<"studio" | "downloader">("studio");
  const sections = tab === "studio" ? studioSections : downloaderSections;

  return (
    <main className="page-shell py-10 sm:py-14">
      <Link href="/" className="section-label mb-8 inline-block">
        &larr; Back home
      </Link>

      <div className="flex flex-col items-center text-center">
        <Image
          src="/loomless-icon.png"
          alt="LoomLess"
          width={52}
          height={52}
          className="rounded-[1.1rem] shadow-[0_10px_24px_rgba(110,92,219,0.2)]"
        />
        <h1 className="mt-4 font-display text-3xl text-[var(--fg)] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Last Updated: May 6, 2026
        </p>

        <div className="mt-8 inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-2)] p-1.5">
          <button
            type="button"
            onClick={() => setTab("studio")}
            className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              tab === "studio"
                ? "bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(110,92,219,0.32)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            LoomLess Studio
          </button>
          <button
            type="button"
            onClick={() => setTab("downloader")}
            className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              tab === "downloader"
                ? "bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(110,92,219,0.32)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            LoomLess Downloader
          </button>
        </div>
      </div>

      <hr className="section-divider my-8" />

      <div className="mx-auto max-w-2xl">
        {sections.map((section) => (
          <div key={section.title} className="mt-8 first:mt-0">
            <h2 className="flex items-center gap-2.5 font-display text-lg text-[var(--fg)] sm:text-xl">
              <span className="text-base">{section.icon}</span>
              {section.title}
            </h2>
            <ul className="mt-2 space-y-1.5 pl-8 text-sm leading-6 text-[var(--muted)]">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {section.footer ? (
              <p className="mt-2 pl-8 text-xs text-[var(--muted)] italic">
                {section.footer}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <hr className="section-divider my-10" />

      <footer className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>LoomLess. Built by moayaan.eth.</p>
        <Link href="/" className="text-link">Back home</Link>
      </footer>
    </main>
  );
}
