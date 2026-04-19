import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LoomLess Studio Privacy Policy",
  description:
    "Privacy Policy for LoomLess Studio. Learn how LoomLess handles recordings, permissions, local storage, and privacy.",
  alternates: {
    canonical: "/loomless-studio-privacy-policy",
  },
};

const sections = [
  {
    title: "1. Core Privacy Principle",
    body: [
      "LoomLess Studio is designed to be a privacy-first screen recording studio.",
    ],
    bullets: [
      "No account required: You do not need to sign up, log in, or provide personal information to use the extension.",
      "No cloud uploads: Your recordings are not uploaded to our servers.",
      "No tracking: We do not track your browsing activity, the websites you visit, or how you use the extension.",
      "No sale of data: We do not collect or sell personal data.",
    ],
  },
  {
    title: "2. How Recordings Are Handled",
    bullets: [
      "Screen, tab, window, camera, and microphone capture are processed locally by browser APIs.",
      "Recorded media is stored temporarily on your device so it can be opened in the built-in editor.",
      "Editing actions such as trim, crop, speed adjustment, and export are processed locally in your browser.",
      "Final video files are saved by you to your own device.",
    ],
    body: [
      "At no point are your recordings transmitted to us for storage or processing.",
    ],
  },
  {
    title: "3. Temporary Local Storage",
    body: [
      "LoomLess Studio may temporarily store recording data locally on your device while you move from recording to editing and export.",
    ],
    bullets: [
      "This local storage is used only to support the extension workflow.",
      "It is not shared with us.",
      "It is not used for analytics, profiling, or advertising.",
    ],
  },
  {
    title: "4. Permissions We Use and Why",
    body: [
      "LoomLess Studio requests only the permissions needed to provide recording and floating controls.",
    ],
    bullets: [
      "tabs: Used to open, focus, and coordinate the recorder and editor experience.",
      "activeTab: Used to interact with the active tab when needed for recording controls.",
      "scripting: Used to inject the floating recording controls on supported pages during recording.",
      "host permissions (<all_urls>): Used only so the floating recording controls can appear on the page you are recording.",
    ],
    footer:
      "These permissions are not used to read page content for profiling, collect browsing history, or monitor your activity beyond what is necessary to provide the recording controls you intentionally use.",
  },
  {
    title: "5. Camera and Microphone Access",
    body: ["If you choose a mode that uses camera or microphone:"],
    bullets: [
      "Access is requested at runtime by your browser.",
      "Access is only used for the recording session you start.",
      "Camera and microphone data are processed locally and are not sent to us.",
    ],
    footer:
      "If you do not choose those modes, LoomLess Studio does not access your camera or microphone.",
  },
  {
    title: "6. Floating Recording Controls",
    body: [
      "LoomLess Studio can display floating pause, resume, and stop controls on supported pages while you record.",
    ],
    bullets: [
      "These controls are provided for convenience during recording.",
      "Their purpose is to display the LoomLess Studio interface and handle your control actions.",
      "They are not intended to inspect, store, or analyze page content.",
    ],
  },
  {
    title: "7. Cookies and Analytics",
    body: [
      "LoomLess Studio does not use cookies for tracking inside the extension.",
      "LoomLess Studio does not include third-party analytics, advertising trackers, or profiling tools in the extension.",
    ],
  },
  {
    title: "8. Children's Privacy",
    body: [
      "LoomLess Studio is not designed to knowingly collect personal information from children. Because we do not require accounts or collect personal data for core extension use, we do not knowingly store such information.",
    ],
  },
  {
    title: "9. Changes to This Privacy Policy",
    body: [
      'We may update this Privacy Policy if the extension changes materially. If we do, we will update the "Last Updated" date at the top of this policy.',
    ],
  },
  {
    title: "10. Contact",
    body: [
      "If you have any questions about this Privacy Policy, you can contact the developer at:",
    ],
    footer: "https://moayaan.com",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 lg:px-10">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Image
            src="/loomless-icon.png"
            alt="LoomLess logo"
            width={72}
            height={72}
            className="rounded-2xl border border-white/20 bg-white/10 p-2"
          />
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-(--accent) uppercase">
              LoomLess Studio
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
              Privacy-first screen recording studio. YOUR VIDEO NEVER LEAVES YOUR DEVICE.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-(--line) bg-white/5 px-4 py-2 text-sm text-(--muted)">
              Last Updated: March 9, 2026
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-(--line) bg-white/4 p-5 text-sm leading-7 text-(--muted)">
          Thank you for using LoomLess Studio. This Privacy Policy explains how the
          LoomLess Studio browser extension handles your information. Our core
          principle is simple: your recordings stay on your device.
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <section key={section.title} className="glass-card rounded-3xl p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {section.title}
            </h2>
            {section.body?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-sm leading-7 text-(--muted) sm:text-base">
                {paragraph}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-(--muted) sm:text-base">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {section.footer ? (
              <p className="mt-4 text-sm leading-7 text-(--muted) sm:text-base">
                {section.footer.startsWith("https://") ? (
                  <Link
                    href={section.footer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--accent)"
                  >
                    {section.footer}
                  </Link>
                ) : (
                  section.footer
                )}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-(--muted)">
        <p>LoomLess Studio - Built by Mohammad Ayaan Siddiqui</p>
        <Link href="/" className="text-(--accent)">
          Back to LoomLess
        </Link>
      </div>
    </main>
  );
}
