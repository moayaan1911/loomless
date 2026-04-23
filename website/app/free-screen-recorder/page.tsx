import type { Metadata } from "next";
import Link from "next/link";
import { FaApple, FaChrome } from "react-icons/fa";

const links = {
  desktopDownload:
    "https://github.com/moayaan1911/loomless/releases/download/v0.0.1/LoomLess-alpha-0.0.1-aarch64.dmg",
  chrome:
    "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj",
};

export const metadata: Metadata = {
  title: "Free Screen Recorder",
  description:
    "LoomLess is a free screen recorder for Mac and Chrome with a local-first workflow, no sign-up, and no cloud upload.",
  alternates: {
    canonical: "/free-screen-recorder",
  },
  openGraph: {
    title: "Free Screen Recorder | LoomLess",
    description:
      "Compare the LoomLess Mac alpha and Chrome extension flow for local-first recording without sign-up or cloud uploads.",
    url: "https://loomless.fun/free-screen-recorder",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://loomless.fun/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Free Screen Recorder",
        item: "https://loomless.fun/free-screen-recorder",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "macOS, Chrome",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: "https://loomless.fun/free-screen-recorder",
    description:
      "Free screen recorder for Mac and Chrome. LoomLess keeps recordings local, skips account walls, and currently ships as a Mac alpha plus Chrome extension workflow.",
  },
];

export default function FreeScreenRecorderPage() {
  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell py-8 sm:py-10">
        <section className="surface-card p-6 sm:p-8">
          <p className="section-label">Free Screen Recorder</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl text-[var(--fg)] sm:text-6xl">
            A free screen recorder that stays local.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
            LoomLess is a free screen recorder for people who want a simple local
            workflow instead of cloud upload bait. You can download the current Mac
            alpha DMG or use the Chrome extension flow for browser-based recording and editing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={links.desktopDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              <FaApple className="text-[1.05rem]" />
              Download Mac Alpha
            </Link>
            <Link
              href={links.chrome}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              <FaChrome className="text-[1rem]" />
              Install Chrome Extension
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="preview-card p-5">
            <p className="section-label">No Sign-Up</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Start without account walls
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              LoomLess is meant to feel immediate: no forced registration, no wait for some cloud dashboard, no watermark funnel.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">Local-First</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Your video stays on your device
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The core promise is simple: record locally, save locally, and avoid uploading footage unless you decide to share it.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">Two Surfaces</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Mac alpha plus Chrome flow
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The Mac app is currently recorder-only alpha. The Chrome extension covers the richer browser edit/export workflow.
            </p>
          </article>
        </section>

        <section className="mt-8 surface-card p-6 sm:p-8">
          <p className="section-label">What Ships Today</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="preview-card p-5">
              <h2 className="text-2xl font-semibold text-[var(--fg)]">macOS alpha</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Recorder-only flow, one-time permissions, floating controls, camera and mic modes,
                and direct save when you stop.
              </p>
              <Link href="/screen-recorder-for-mac" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
                See the Mac page
              </Link>
            </div>
            <div className="preview-card p-5">
              <h2 className="text-2xl font-semibold text-[var(--fg)]">Chrome extension</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Browser recording plus the richer local trim, crop, speed, and export workflow.
              </p>
              <Link href="/chrome-screen-recorder" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
                See the Chrome page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
