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
    default: "LoomLess | Free Screen Recorder for Mac & Chrome",
    template: "%s | LoomLess",
  },
  applicationName: "LoomLess",
  description:
    "LoomLess is a free local-first screen recorder for Mac and Chrome. Download the recorder-only macOS alpha DMG or install the Chrome extension. Your video NEVER leaves your device.",
  keywords: [
    "free screen recorder",
    "free screen recorder for mac",
    "free screen recorder chrome extension",
    "chrome screen recorder",
    "screen recorder for mac",
    "screen recorder for macos",
    "screen recorder for mac free",
    "screen recorder for chrome",
    "screen recorder chrome extension",
    "screen recorder without sign up",
    "screen recorder without watermark",
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
    title: "LoomLess | Free Screen Recorder for Mac & Chrome",
    description:
      "Download the recorder-only macOS alpha or install the Chrome screen recorder extension. Record locally and keep your video on your own device.",
    url: "https://loomless.fun",
    siteName: "LoomLess",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LoomLess - Free Screen Recorder for Mac and Chrome",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomLess | Free Screen Recorder for Mac & Chrome",
    description:
      "Free local-first screen recorder for macOS and Chrome. Recorder-only Mac alpha plus Chrome extension.",
    images: ["/opengraph-image"],
    creator: "@moayaan1911",
    site: "@moayaan1911",
  },
  other: {
    "ai:description":
      "LoomLess is a free local-first screen recorder for Mac and Chrome. The current macOS app is a recorder-only alpha DMG, and the Chrome extension covers the richer browser recording workflow. The core product promise is that your video never leaves your device.",
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
