import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loomless.fun"),
  title: {
    default: "LoomLess | Free Screen Recorder & Editor",
    template: "%s | LoomLess",
  },
  applicationName: "LoomLess",
  description:
    "LoomLess is a free screen recorder and editor with a macOS app and Chrome extension. Download the DMG, install the extension, and keep your workflow local. Your video NEVER leaves your device.",
  keywords: [
    "free screen recorder",
    "screen recorder for mac",
    "screen recorder for macos",
    "screen recorder chrome extension",
    "screen recorder and editor",
    "private screen recorder",
    "local screen recorder",
    "loom alternative",
    "free loom alternative",
    "screen recorder no cloud",
    "screen recorder no signup",
    "screen recorder with editor",
    "screen recorder dmg download",
    "loomless",
  ],
  authors: [{ name: "Mohammad Ayaan Siddiqui", url: "https://moayaan.com" }],
  creator: "Mohammad Ayaan Siddiqui",
  publisher: "LoomLess",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
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
    icon: "/loomless-icon.png",
    shortcut: "/loomless-icon.png",
    apple: "/loomless-icon.png",
  },
  openGraph: {
    title: "LoomLess | Free Screen Recorder & Editor",
    description:
      "Download LoomLess for macOS or install the Chrome extension. Record, edit, and keep everything local. Your video NEVER leaves your device.",
    url: "https://loomless.fun",
    siteName: "LoomLess",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LoomLess - Free Screen Recorder & Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomLess | Free Screen Recorder & Editor",
    description:
      "Free screen recorder and editor for macOS plus Chrome extension. Local-first by default.",
    images: ["/opengraph-image"],
    creator: "@moayaan1911",
    site: "@moayaan1911",
  },
  other: {
    "ai:description":
      "LoomLess is a free screen recorder and editor with a macOS desktop app and Chrome extension. It emphasizes a local-first workflow, direct DMG download, clean previews, and privacy messaging built around the claim that your video never leaves your device.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
