import type { Metadata } from "next";
import Link from "next/link";
import { FaApple, FaChrome } from "react-icons/fa";

const desktopDownload =
  "https://github.com/moayaan1911/loomless/releases/download/v0.0.1/LoomLess-alpha-0.0.1-aarch64.dmg";

export const metadata: Metadata = {
  title: "Screen Recorder for Mac",
  description:
    "Download LoomLess for Mac, a free recorder-only alpha screen recorder DMG with local save flow, camera and microphone support, and no sign-up.",
  alternates: {
    canonical: "/screen-recorder-for-mac",
  },
  openGraph: {
    title: "Screen Recorder for Mac | LoomLess",
    description:
      "Download the current LoomLess Mac alpha DMG for local screen recording with direct save on stop.",
    url: "https://loomless.fun/screen-recorder-for-mac",
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
        name: "Screen Recorder for Mac",
        item: "https://loomless.fun/screen-recorder-for-mac",
      },
    ],
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
    downloadUrl: desktopDownload,
    url: "https://loomless.fun/screen-recorder-for-mac",
    description:
      "Free screen recorder for Mac. LoomLess currently ships as a recorder-only alpha that records locally and saves directly after capture.",
  },
];

export default function ScreenRecorderForMacPage() {
  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="page-shell py-8 sm:py-10">
        <section className="surface-card p-6 sm:p-8">
          <p className="section-label">Screen Recorder for Mac</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl text-[var(--fg)] sm:text-6xl">
            Download LoomLess for Mac.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
            LoomLess for Mac is currently a recorder-only alpha DMG. It is built for
            the clean capture path: open the app, grant the permissions you need, record locally,
            then save the file directly when you stop.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={desktopDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              <FaApple className="text-[1.05rem]" />
              Download Mac Alpha DMG
            </Link>
            <Link href="/chrome-screen-recorder" className="secondary-button">
              <FaChrome className="text-[1rem]" />
              Need editing? Use Chrome flow
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="preview-card p-5">
            <p className="section-label">Current Scope</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Recorder-only alpha
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The public Mac app focuses on recording, permissions, floating controls, and direct save on stop.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">Permissions</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              Camera and mic prompts
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The current tested website-download DMG flow correctly shows the needed permission prompts for the selected recording mode.
            </p>
          </article>
          <article className="preview-card p-5">
            <p className="section-label">What is not in scope</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--fg)]">
              No desktop editor yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The richer desktop trim, crop, and speed workflow is intentionally not part of this public Mac alpha release.
            </p>
          </article>
        </section>

        <section className="mt-8 surface-card p-6 sm:p-8">
          <p className="section-label">Need More Than Recorder-Only?</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--fg)]">
            Use the Chrome extension flow for the fuller local workflow.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            If you specifically want the richer local edit/export path today, the Chrome extension
            is the better LoomLess surface right now.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/chrome-screen-recorder" className="secondary-button">
              Chrome screen recorder page
            </Link>
            <Link href="/faq" className="secondary-button">
              FAQ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
