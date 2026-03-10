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
    default: "LoomLess: Free Private Screen Recorder with Local Editing",
    template: "%s | LoomLess",
  },
  applicationName: "LoomLess",
  description:
    "LoomLess is a free private screen recorder for Chrome that records your screen, tab, window, webcam, and audio with floating controls, built-in editing, and local export. Your video never leaves your device.",
  keywords: [
    "free screen recorder",
    "private screen recorder",
    "screen recorder extension",
    "screen recording studio",
    "local screen recorder",
    "browser screen recorder",
    "screen and webcam recorder",
    "screen recorder with audio",
    "screen recorder with editor",
    "webcam overlay screen recorder",
    "record screen browser tab",
    "chrome screen recorder extension",
    "firefox screen recorder extension",
    "no upload screen recorder",
    "privacy first screen recorder",
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
    title: "LoomLess: Free Private Screen Recorder with Local Editing",
    description:
      "Free private screen recorder for Chrome with webcam overlay, floating controls, built-in editing, and local export. Your video never leaves your device.",
    url: "https://loomless.fun",
    siteName: "LoomLess",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LoomLess" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoomLess: Free Private Screen Recorder with Local Editing",
    description:
      "Free private screen recorder for Chrome with local recording, built-in editing, floating controls, and webcam overlay.",
    images: ["/og-image.png"],
    creator: "@moayaan1911",
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
