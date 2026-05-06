"use client";

import { useState } from "react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const studioFaq: FaqItem[] = [
  {
    question: "What is LoomLess?",
    answer: "LoomLess is a free local-first screen recorder suite. Right now it ships as a recorder-only macOS alpha plus a Chrome extension flow for browser recording and local editing.",
  },
  {
    question: "Does LoomLess upload my recordings?",
    answer: "No. LoomLess is built around a local-first workflow, so your recordings stay on your device unless you choose to share them yourself.",
  },
  {
    question: "Do I need an account to use LoomLess?",
    answer: "No. LoomLess does not require sign-up, login, or cloud storage just to record your screen.",
  },
  {
    question: "What can I download today?",
    answer: "You can download the public macOS alpha DMG from the website and install the Chrome extension from the Chrome Web Store.",
  },
  {
    question: "Does the macOS app include editing right now?",
    answer: "No. The current public Mac build is intentionally recorder-only alpha. When you stop a recording, LoomLess saves the file directly instead of opening a desktop editor.",
  },
  {
    question: "Where is the richer edit and export flow right now?",
    answer: "The fuller trim, crop, speed, and local export workflow currently lives in the Chrome extension flow rather than the public macOS alpha.",
  },
  {
    question: "Does LoomLess support camera and microphone permissions?",
    answer: "Yes. The current tested website-download DMG flow has working permission prompts for camera and microphone when the selected recording mode needs them.",
  },
  {
    question: "Is LoomLess free?",
    answer: "Yes. LoomLess is positioned as a free screen recorder with a local-first workflow and no watermark-first pricing trap.",
  },
];

const downloaderFaq: FaqItem[] = [
  {
    question: "What is LoomLess Downloader?",
    answer: "LoomLess Downloader is a free browser extension that adds a one-click download button to Twitter/X and Reddit posts so you can save images and videos directly to your computer.",
  },
  {
    question: "Which platforms does it support?",
    answer: "Twitter / X (timelines, tweet detail pages, infinite scroll) and Reddit (www.reddit.com, old.reddit.com, feeds, subreddits, profiles, post detail pages).",
  },
  {
    question: "Does it download all media from a post?",
    answer: "Yes. It handles single images, multiple images (up to 4 on Twitter, 20+ on Reddit), videos, GIFs, and mixed media posts all in one click.",
  },
  {
    question: "Is it free? Do I need an account?",
    answer: "Completely free. No account, no signup, no API keys required. Everything runs locally in your browser.",
  },
  {
    question: "Does it send my data anywhere?",
    answer: "No. The extension is fully client-side. No telemetry, no tracking, no external servers. Media downloads directly from the source platform to your device.",
  },
  {
    question: "Is it open source?",
    answer: "Yes. Source code is available at github.com/moayaan1911/loomless-downloader.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...studioFaq, ...downloaderFaq].map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FaqPage() {
  const [tab, setTab] = useState<"studio" | "downloader">("studio");
  const faqs = tab === "studio" ? studioFaq : downloaderFaq;

  return (
    <main className="page-shell py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Link href="/" className="section-label mb-8 inline-block">
        &larr; Back home
      </Link>

      <div className="flex flex-col items-center text-center">
        <h1 className="font-display text-3xl text-[var(--fg)] sm:text-4xl">
          Frequently asked questions
        </h1>

        <div className="mt-6 inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-2)] p-1.5">
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
        {faqs.map((faq, i) => (
          <div key={faq.question} className="mt-6 first:mt-0">
            <h2 className="font-semibold text-[var(--fg)]">
              {faq.question}
            </h2>
            <p className="mt-1 text-sm leading-7 text-[var(--muted)]">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <hr className="section-divider my-10" />

      <footer className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>LoomLess. Free local screen recorder suite.</p>
        <Link href="/" className="text-link">Back home</Link>
      </footer>
    </main>
  );
}
