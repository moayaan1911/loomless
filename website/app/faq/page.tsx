import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LoomLess FAQ",
  description:
    "Answers about LoomLess, including the recorder-only macOS alpha, the Chrome extension workflow, privacy, permissions, and local exports.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "LoomLess FAQ",
    description:
      "Get clear answers about the LoomLess Mac alpha, Chrome extension, privacy, and local-first recording workflow.",
    url: "https://loomless.fun/faq",
  },
};

const faqs = [
  {
    question: "What is LoomLess?",
    answer:
      "LoomLess is a free local-first screen recorder suite. Right now it ships as a recorder-only macOS alpha plus a Chrome extension flow for browser recording and local editing.",
  },
  {
    question: "Does LoomLess upload my recordings?",
    answer:
      "No. LoomLess is built around a local-first workflow, so your recordings stay on your device unless you choose to share them yourself.",
  },
  {
    question: "Do I need an account to use LoomLess?",
    answer:
      "No. LoomLess does not require sign-up, login, or cloud storage just to record your screen.",
  },
  {
    question: "What can I download today?",
    answer:
      "You can download the public macOS alpha DMG from the website and install the Chrome extension from the Chrome Web Store.",
  },
  {
    question: "Does the macOS app include editing right now?",
    answer:
      "No. The current public Mac build is intentionally recorder-only alpha. When you stop a recording, LoomLess saves the file directly instead of opening a desktop editor.",
  },
  {
    question: "Where is the richer edit and export flow right now?",
    answer:
      "The fuller trim, crop, speed, and local export workflow currently lives in the Chrome extension flow rather than the public macOS alpha.",
  },
  {
    question: "Does LoomLess support camera and microphone permissions?",
    answer:
      "Yes. The current tested website-download DMG flow has working permission prompts for camera and microphone when the selected recording mode needs them.",
  },
  {
    question: "Is LoomLess free?",
    answer:
      "Yes. LoomLess is positioned as a free screen recorder with a local-first workflow and no watermark-first pricing trap.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell py-8 sm:py-10">
        <section className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Image
              src="/loomless-icon.png"
              alt="LoomLess logo"
              width={72}
              height={72}
              className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-2"
            />
            <div>
              <p className="section-label">FAQ</p>
              <h1 className="mt-2 font-display text-4xl text-[var(--fg)] sm:text-5xl">
                Straight answers about LoomLess.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                This page covers the current public Mac alpha, the Chrome extension
                flow, privacy, permissions, and what the product actually ships today.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link href="/screen-recorder-for-mac" className="preview-card p-5">
              <p className="section-label">Mac</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--fg)]">
                Recorder-only alpha
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Download page for the current public DMG and install flow.
              </p>
            </Link>
            <Link href="/chrome-screen-recorder" className="preview-card p-5">
              <p className="section-label">Chrome</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--fg)]">
                Browser recorder flow
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Focused page for the extension and local edit/export workflow.
              </p>
            </Link>
            <Link href="/free-screen-recorder" className="preview-card p-5">
              <p className="section-label">Overview</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--fg)]">
                Free screen recorder guide
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Broad product overview for people comparing LoomLess to other tools.
              </p>
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5">
          {faqs.map((faq, index) => (
            <article key={faq.question} className="surface-card p-6 sm:p-7">
              <p className="section-label">Question {index + 1}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--fg)]">
                {faq.question}
              </h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                {faq.answer}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)]">
          <p>LoomLess. Free local screen recorder suite.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="transition hover:text-[var(--fg)]">
              Home
            </Link>
            <Link href="/screen-recorder-for-mac" className="transition hover:text-[var(--fg)]">
              Mac Download
            </Link>
            <Link href="/chrome-screen-recorder" className="transition hover:text-[var(--fg)]">
              Chrome Extension
            </Link>
            <Link
              href="/loomless-studio-privacy-policy"
              className="transition hover:text-[var(--fg)]"
            >
              Privacy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
