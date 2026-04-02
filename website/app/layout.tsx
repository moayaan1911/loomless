import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loomless.fun"),
  title: {
    default: "LoomLess - Free Screen Recorder & Editor | No Sign Up, No Cloud",
    template: "%s | LoomLess",
  },
  applicationName: "LoomLess: Free Screen Recorder & Editor",
  description:
    "LoomLess is a free screen recorder for Chrome. Record your screen, webcam, and audio with no sign up, no payment, and no cloud upload. Built-in video editor with trim, crop, and export. Your video never leaves your device.",
  keywords: [
    // High-volume generic terms
    "free screen recorder",
    "screen recorder",
    "screen recording",
    "screen capture",
    "record screen",
    "screen recorder free",
    "best free screen recorder",
    "screen recorder no watermark",
    "screen recorder no sign up",
    "screen recorder no download",
    // Browser/extension specific
    "screen recorder chrome",
    "chrome screen recorder extension",
    "chrome extension screen recorder",
    "browser screen recorder",
    "record screen in browser",
    "record screen without software",
    "screen recorder online free",
    "screen recorder web",
    // Privacy/no cloud intent
    "private screen recorder",
    "screen recorder no upload",
    "screen recorder no account",
    "screen recorder no cloud",
    "offline screen recorder",
    "local screen recorder",
    "privacy first screen recorder",
    "secure screen recorder",
    // Feature-specific
    "screen recorder with editor",
    "screen recorder with webcam",
    "screen recorder with audio",
    "screen recorder with microphone",
    "screen and webcam recorder",
    "screen recorder webcam overlay",
    "screen recorder camera overlay",
    "screen recorder with face cam",
    "screen recorder trim video",
    "screen recorder crop video",
    "screen recorder export mp4",
    "screen recorder export webm",
    // Use case terms
    "record browser tab",
    "record entire screen",
    "record window",
    "record screen and audio free",
    "record screen and camera",
    "record tutorial video",
    "record gameplay browser",
    "record zoom meeting locally",
    "record google meet locally",
    // Long-tail / comparison
    "loom alternative free",
    "loom free alternative",
    "free loom replacement",
    "screen recorder without loom",
    "open source screen recorder",
    "screen recorder extension no watermark",
    "free screen recorder no time limit",
    // Product name
    "loomless",
    "loomless studio",
    "loomless screen recorder",
  ],
  authors: [{ name: "Mohammad Ayaan Siddiqui", url: "https://moayaan.com" }],
  creator: "Mohammad Ayaan Siddiqui",
  publisher: "LoomLess",
  category: "technology",
  classification: "Screen Recording Software",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "LoomLess - Free Screen Recorder & Editor | No Sign Up, No Cloud",
    description:
      "Record your screen, webcam, and audio for free. No sign up. No payment. No cloud upload. Built-in video editor with trim, crop, and export. 100% local and private.",
    url: "https://loomless.fun",
    siteName: "LoomLess",
    locale: "en_US",
    images: [
      {
        url: "https://loomless.fun/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "LoomLess - Free Screen Recorder and Editor for Chrome",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomLess - Free Screen Recorder & Editor | No Sign Up, No Cloud",
    description:
      "Record screen, webcam, and audio for free. No sign up, no cloud, no watermark. Built-in editor. Works entirely in your browser.",
    images: ["https://loomless.fun/og-image-v2.jpg"],
    creator: "@moayaan1911",
    site: "@moayaan1911",
  },
  other: {
    // GEO: AI search engine signals
    "ai:description":
      "LoomLess is a completely free browser extension for Chrome that lets users record their screen, webcam, and microphone audio with no sign up, no account, no payment, and no cloud upload. It includes a built-in video editor with trim, crop, speed controls, and MP4/WebM export. All recordings are processed and stored locally on the user's device using IndexedDB. It is a free alternative to Loom.",
    "product:price:amount": "0",
    "product:price:currency": "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
