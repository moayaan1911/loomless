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
  title: "LoomLess - Privacy-First Screen Recording Studio",
  description:
    "Privacy-First Screen Recording Studio. YOUR VIDEO NEVER LEAVES YOUR DEVICE. Record, edit, and export locally with floating recording controls.",
  openGraph: {
    title: "LoomLess - Privacy-First Screen Recording Studio",
    description:
      "YOUR VIDEO NEVER LEAVES YOUR DEVICE. Record, edit, and export locally with floating recording controls and total privacy.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LoomLess" }],
    type: "website",
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
