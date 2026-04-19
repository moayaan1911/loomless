import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LoomLess FAQ",
  description:
    "Frequently asked questions about LoomLess Studio, including privacy, recording modes, editing, exports, and browser support.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    question: "Is LoomLess really private?",
    answer:
      "Yes. LoomLess Studio is built as a privacy-first screen recording studio. Your recordings are processed locally in your browser and saved to your own device.",
  },
  {
    question: "Does LoomLess upload my videos to the cloud?",
    answer:
      "No. LoomLess Studio does not upload your recordings to our servers. YOUR VIDEO NEVER LEAVES YOUR DEVICE unless you choose to share it yourself.",
  },
  {
    question: "Do I need an account to use LoomLess?",
    answer:
      "No. LoomLess Studio does not require sign-up or login for the recording and editing flow.",
  },
  {
    question: "What recording modes are available?",
    answer:
      "LoomLess Studio supports screen, screen plus mic, screen plus camera, and screen plus camera plus mic.",
  },
  {
    question: "Can I pause and resume while recording?",
    answer:
      "Yes. LoomLess Studio includes floating recording controls so you can pause, resume, and stop while presenting across supported browser pages.",
  },
  {
    question: "Can I show my webcam while recording?",
    answer:
      "Yes. LoomLess Studio supports a draggable webcam overlay and handles compositing so the camera bubble behaves correctly across different capture scenarios.",
  },
  {
    question: "Can I edit videos inside LoomLess?",
    answer:
      "Yes. The built-in editor lets you trim, crop, change speed, preview your edits, and export locally.",
  },
  {
    question: "What export formats does LoomLess support?",
    answer:
      "LoomLess Studio supports local export to WebM and MP4, depending on browser capabilities and the export path used.",
  },
  {
    question: "Is LoomLess free?",
    answer:
      "Yes. LoomLess Studio is positioned as a free, local-first screen recording studio with no account walls and no hidden cloud workflow.",
  },
  {
    question: "Where can I install LoomLess?",
    answer:
      "You can install LoomLess from the Chrome Web Store today. Firefox availability is also listed on the site and can be expanded separately.",
  },
];

export default function FaqPage() {
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
              Frequently Asked Questions
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
              Quick answers about privacy, recording, editing, exports, and how LoomLess Studio works.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-(--line) bg-white/4 p-5 text-sm leading-7 text-(--muted)">
          LoomLess Studio is a privacy-first screen recording studio extension built for local recording, editing, and export without forced accounts or cloud uploads.
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {faqs.map((faq, index) => (
          <section key={faq.question} className="glass-card rounded-3xl p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.16em] text-(--accent) uppercase">
              Question {index + 1}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {faq.question}
            </h2>
            <p className="mt-4 text-sm leading-7 text-(--muted) sm:text-base">
              {faq.answer}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-(--muted)">
        <p>LoomLess Studio - Built by Mohammad Ayaan Siddiqui</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-(--accent)">
            Back to LoomLess
          </Link>
          <Link href="/loomless-studio-privacy-policy" className="text-(--accent)">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
