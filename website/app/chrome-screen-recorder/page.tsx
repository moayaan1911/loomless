import type { Metadata } from "next";
import Link from "next/link";
import { FaChrome } from "react-icons/fa";

const chromeLink =
  "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj";

export const metadata: Metadata = {
  title: "Chrome Screen Recorder",
  description:
    "Install the LoomLess Chrome screen recorder for a local-first browser recording workflow with trimming, cropping, speed controls, and local export.",
  alternates: {
    canonical: "/chrome-screen-recorder",
  },
  openGraph: {
    title: "Chrome Screen Recorder | LoomLess",
    description:
      "LoomLess gives Chrome users a local-first screen recorder with editing and export that stays on-device.",
    url: "https://loomless.fun/chrome-screen-recorder",
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
        name: "Chrome Screen Recorder",
        item: "https://loomless.fun/chrome-screen-recorder",
      },
    ],
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
    downloadUrl: chromeLink,
    url: "https://loomless.fun/chrome-screen-recorder",
    description:
      "Chrome screen recorder extension with a local-first recording, trimming, crop, speed, and export workflow.",
  },
];

export default function ChromeScreenRecorderPage() {
  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell py-8 sm:py-10">
        <section className="surface-card p-6 sm:p-8">
          <p className="section-label">Chrome Screen Recorder</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl text-[var(--fg)] sm:text-6xl">
            A Chrome screen recorder with local editing.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
            If you want the fuller LoomLess workflow today, the Chrome extension is the
            stronger path. It keeps recording, trimming, cropping, speed control, and exports on your own device.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={chromeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              <FaChrome className="text-[1rem]" />
              Add to Chrome
            </Link>
            <Link href="/free-screen-recorder" className="secondary-button">
              Compare LoomLess surfaces
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="preview-card p-5">
            <p className="section-label">Recording</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Browser-native capture
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Record screen-only, screen plus mic, screen plus cam, or all together while staying inside the browser flow.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">Editing</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Trim, crop, speed, export
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The extension covers the richer local editing workflow that is not part of the current public Mac alpha.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">Privacy</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              No forced cloud workflow
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              LoomLess is built around a local-first promise, so your recording is not auto-uploaded to some remote dashboard.
            </p>
          </article>
        </section>

        <section className="mt-8 surface-card p-6 sm:p-8">
          <p className="section-label">Useful Links</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/" className="secondary-button">
              Home
            </Link>
            <Link href="/faq" className="secondary-button">
              FAQ
            </Link>
            <Link href="/screen-recorder-for-mac" className="secondary-button">
              Mac alpha page
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
