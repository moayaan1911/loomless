"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ShieldCheck, Github, Check, Plus, Play,
  ArrowUpRight, Globe, Heart, User, Moon, Sun, ExternalLink, MessageCircle,
} from "lucide-react";
import { FaApple, FaChrome } from "react-icons/fa";

const Tick = () => <Check size={16} className="check" />;

const links = {
  desktopDownload:
    "https://github.com/moayaan1911/loomless/releases/download/v1.0.0/LoomLess_1.0.0_aarch64.dmg",
  chrome:
    "https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj",
  chromeDownloader:
    "https://chromewebstore.google.com/detail/loomless-downloader/oghfagmhgdinagefagjpamiggcofjmii",
  github: "https://github.com/moayaan1911/loomless",
  releases: "https://github.com/moayaan1911/loomless/releases/latest",
  donate: "https://moayaan.com/donate",
  author: "https://moayaan.com",
  privacy: "/loomless-studio-privacy-policy",
  faq: "/faq",
  freeRecorder: "/free-screen-recorder",
  chromeRecorder: "/chrome-screen-recorder",
  macRecorder: "/screen-recorder-for-mac",
  imanvibes: "https://imanvibes.vercel.app",
};

const faqItems = [
  {
    question: "What is LoomLess?",
    answer:
      "LoomLess is a free, open-source screen recording suite. We offer LoomLess Studio for macOS (full desktop screen recording + editing) and as a Chrome extension (browser recording with built-in editor). Everything is 100% local-first.",
  },
  {
    question: "Does LoomLess upload my recordings?",
    answer:
      "No. Your recordings never leave your device. Everything stays local. No cloud uploads, no servers, no privacy concerns.",
  },
  {
    question: "What can I download today?",
    answer:
      "You can download LoomLess Studio for macOS (DMG) and the LoomLess Studio Chrome extension from the Chrome Web Store. You can also install LoomLess Downloader, our separate extension for saving media from Twitter/X and Reddit.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes. LoomLess is completely free and open source. No paid tiers, no hidden costs. If you find it useful, you can support development via donations.",
  },
  {
    question: "What is LoomLess Downloader?",
    answer:
      "LoomLess Downloader is a separate free Chrome extension that adds one-click download buttons to Twitter/X and Reddit posts. It handles images, videos, and GIFs. Fully client-side with no tracking, and open source.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Never. No signup, no account, no email required. Just download and use. Your privacy is the point.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LoomLess",
    url: "https://loomless.fun",
    description:
      "Free screen recorder for Mac and Chrome. Local-first, privacy-focused, with a macOS desktop app and a Chrome extension recording flow.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess for macOS",
    operatingSystem: "macOS",
    applicationCategory: "MultimediaApplication",
    softwareVersion: "1.0.0",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: links.desktopDownload,
    url: "https://loomless.fun",
    image: "https://loomless.fun/loomless-icon.png",
    description:
      "Free screen recorder for Mac. The macOS desktop app records locally and saves directly after capture.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LoomLess Chrome Extension",
    operatingSystem: "Chrome",
    applicationCategory: "BrowserApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: links.chrome,
    url: "https://loomless.fun",
    image: "https://loomless.fun/loomless-icon.png",
    description:
      "Free Chrome screen recorder extension with a local-first recording and editing workflow.",
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "LoomLess desktop promo",
    description:
      "Short preview of LoomLess, the free local-first screen recorder for Mac and Chrome.",
    thumbnailUrl: ["https://loomless.fun/mac-preview-home.png"],
    contentUrl: "https://loomless.fun/loomless-desktop-demo.mp4",
    embedUrl: "https://loomless.fun",
    uploadDate: "2026-04-19",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

const features = [
  {
    num: "Preview 01",
    title: "Start in seconds",
    desc: "Pick a recording mode screen, window, or camera overlay and jump into capture without clutter. No setup, no config, just record.",
    tags: "Screen \u00B7 Window \u00B7 Camera \u00B7 Mic",
    image: "/mac-preview-home.png",
    alt: "LoomLess home screen with recording modes",
  },
  {
    num: "Preview 02",
    title: "Stay focused while recording",
    desc: "Minimal floating controls keep your attention on the content that matters. Record, pause, annotate, and stop without breaking flow.",
    tags: "Minimal UI \u00B7 Floating controls \u00B7 No distraction",
    image: "/mac-preview-recording.png",
    alt: "LoomLess recording screen with floating controls",
  },
  {
    num: "Preview 03",
    title: "Edit locally",
    desc: "Trim, refine, and export without ever leaving LoomLess. Your raw footage never touches a server. Full editor built into the extension.",
    tags: "Trim \u00B7 Crop \u00B7 Speed \u00B7 Export",
    image: "/mac-preview-editor.png",
    alt: "LoomLess editor interface with timeline and trim tools",
  },
];

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const extremeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setRevealRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    revealRefs.current[i] = el;
  }, []);

  const setExtremeRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    extremeRefs.current[i] = el;
  }, []);

  // Theme init
  useEffect(() => {
    const stored = window.localStorage.getItem("loomless-theme");
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("loomless-theme", theme);
  }, [theme, mounted]);

  // Scroll reveal observer
  useEffect(() => {
    const all = [
      ...revealRefs.current.filter(Boolean),
      ...extremeRefs.current.filter(Boolean),
    ];
    if (!all.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    all.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  // 3D tilt effect
  useEffect(() => {
    if (!mounted) return;
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasHover) return;

    const wrappers = document.querySelectorAll<HTMLDivElement>('[data-tilt]');
    const handlers: (() => void)[] = [];

    wrappers.forEach((wrapper) => {
      const inner = wrapper.querySelector(".feature-visual-inner") as HTMLElement;
      if (!inner) return;

      const onMove = (e: MouseEvent) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        inner.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg) scale3d(1.02,1.02,1.02)`;
      };
      const onLeave = () => {
        inner.style.transform = "";
      };

      wrapper.addEventListener("mousemove", onMove);
      wrapper.addEventListener("mouseleave", onLeave);
      handlers.push(() => {
        wrapper.removeEventListener("mousemove", onMove);
        wrapper.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => handlers.forEach((h) => h());
  }, [mounted]);

  // Scroll parallax on feature rows
  useEffect(() => {
    if (!mounted) return;
    const rows = document.querySelectorAll(".feature-row");
    if (!rows.length) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          rows.forEach((row) => {
            const rect = row.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const offset = (center - window.innerHeight / 2) / window.innerHeight;
            const visual = row.querySelector(".feature-visual");
            if (visual) {
              const inner = visual.querySelector(".feature-visual-inner") as HTMLElement;
              if (inner && !visual.matches(":hover")) {
                inner.style.transform = `perspective(800px) rotateX(${offset * 2}deg) rotateY(${offset * -1.5}deg)`;
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  // Header border color on scroll
  useEffect(() => {
    if (!mounted) return;
    const hero = document.getElementById("hero");
    const header = document.getElementById("main-header");
    if (!hero || !header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        (header as HTMLElement).style.borderBottomColor = entry.isIntersecting
          ? "var(--divider)"
          : "var(--accent-subtle)";
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [mounted]);

  // Structured data script
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  if (!mounted) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} />
    );
  }

  return (
    <>
      {/* Ambient background */}
      <div className="dot-pattern" />
      <div className="glow-1" />
      <div className="glow-2" />

      {/* ===== HEADER ===== */}
      <header className="l-header" id="main-header">
        <div className="container">
          <Link href="/" className="logo">
            <span className="logo-icon">
              <Image src="/loomless-icon.png" alt="L" width={22} height={22} />
            </span>
            LoomLess
          </Link>

          <div className="nav-minimal">
            <Link href={links.privacy} className="nav-minimal-link">
              <ShieldCheck size={14} />
              Privacy
            </Link>
            <Link href={links.releases} target="_blank" rel="noopener noreferrer" className="nav-minimal-link">
              <ExternalLink size={14} />
              Releases
            </Link>
            <Link href={links.donate} target="_blank" rel="noopener noreferrer" className="nav-minimal-link">
              <Heart size={14} />
              Support
            </Link>
            <Link href={links.author} target="_blank" rel="noopener noreferrer" className="nav-minimal-link">
              <User size={14} />
              Connect
            </Link>
            <Link href={links.github} target="_blank" rel="noopener noreferrer" className="nav-minimal-link">
              <Github size={14} />
              GitHub
            </Link>
            <Link href="https://x.com/moayaan1911" target="_blank" rel="noopener noreferrer" className="nav-minimal-link">
              <MessageCircle size={14} />
              X
            </Link>
          </div>

          <div className="nav-actions">
            <Link
              href={links.desktopDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FaApple size={16} />
              <span>Download for Mac</span>
            </Link>
            <Link
              href={links.chrome}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <FaChrome size={16} />
              <span>Add to Chrome</span>
            </Link>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="hero section" id="hero">
          <div className="container">
            <div className="reveal" ref={setRevealRef(0)}>
              <div className="hero-badge">
                <ShieldCheck size={14} />
                Your video never leaves your device
              </div>
            </div>

            <h1 className="reveal reveal-delay-1" ref={setRevealRef(1)}>
              <span className="word-reveal"><span>Clean</span></span>{' '}
              <span className="word-reveal"><span>capture.</span></span>{' '}
              <span className="word-reveal"><span><span className="accent-word">Local</span></span></span>{' '}
              <span className="word-reveal"><span><span className="accent-word">edits.</span></span></span>{' '}
              <span className="word-reveal"><span>Zero</span></span>{' '}
              <span className="word-reveal"><span>nonsense.</span></span>
            </h1>

            <p className="sub2 reveal reveal-delay-2" ref={setRevealRef(3)}>
              No sign up. No cloud upload. No forced account. Free and open-source, just record, edit, and export locally.
            </p>

            <div className="hero-actions reveal reveal-delay-3" ref={setRevealRef(4)}>
              <Link
                href={links.desktopDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <FaApple size={18} />
                Download for Mac
              </Link>
              <Link
                href={links.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <FaChrome size={18} />
                Add to Chrome
              </Link>
            </div>

            <div className="video-placeholder reveal reveal-delay-4" ref={setRevealRef(5)}>
              <video
                ref={videoRef}
                src="/loomless-desktop-demo.mp4"
                poster="/mac-preview-home.png"
                controls={isPlaying}
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "var(--radius-lg)",
                  zIndex: 1,
                }}
              />
              {!isPlaying && (
                <div
                  className="play-btn"
                  onClick={() => videoRef.current?.play()}
                  style={{ zIndex: 2, cursor: "pointer" }}
                >
                  <Play size={28} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="reveal reveal-delay-5" ref={setRevealRef(6)}>
              <Link href={links.github} target="_blank" rel="noopener noreferrer" className="hero-github">
                <Github size={18} />
                Star on GitHub
              </Link>
            </div>

            <div className="reveal reveal-delay-5" ref={setRevealRef(20)}>
              <div className="peerlist-badge">
                <a
                  href="https://peerlist.io/ayaaneth/project/loomless--screen-recorder-for-mac--chrome"
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://peerlist.io/api/v1/projects/embed/PRJHGNQ67R6NJRLLM38BOGGONDD8JQ?showUpvote=true&theme=${theme}`}
                    alt="LoomLess | Screen Recorder for Mac & Chrome"
                    style={{ width: "auto", height: "72px" }}
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-header reveal" ref={setRevealRef(7)}>
              <span className="section-label">Features</span>
              <h2>Capture, edit, export. All on your machine.</h2>
              <p>Everything you need for quick, private screen recordings. No cloud, no clutter.</p>
            </div>

            <div className="features-wrap">
              {features.map((feat, i) => (
                <div
                  key={feat.num}
                  className={`feature-row ${i % 2 === 1 ? "flipped" : ""}`}
                >
                  <div
                    className={`feature-visual extreme-reveal ${i % 2 === 1 ? "extreme-reveal-right" : "extreme-reveal-left"}`}
                    ref={setExtremeRef(i * 2)}
                    data-tilt
                  >
                    <div className="feature-visual-inner">
                      <div className="feature-screenshot">
                        <Image
                          src={feat.image}
                          alt={feat.alt}
                          width={720}
                          height={450}
                          style={{ width: "100%", height: "auto", objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`feature-text extreme-reveal ${i % 2 === 1 ? "extreme-reveal-left" : "extreme-reveal-right"}`}
                    ref={setExtremeRef(i * 2 + 1)}
                  >
                    <div className="feature-num">{feat.num}</div>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                    <span className="feature-tag">
                      <Check size={14} />
                      {feat.tags}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DOWNLOADS ===== */}
        <section className="section" id="downloads">
          <div className="container">
            <div className="section-header reveal" ref={setRevealRef(8)}>
              <span className="section-label">Downloads</span>
              <h2>Get LoomLess Studio</h2>
              <p>Available now for macOS and Chrome. Mobile (coming soon).</p>
            </div>

            <div className="reveal reveal-delay-1" ref={setRevealRef(9)}>
              <div className="dl-actions">
                <Link
                  href={links.desktopDownload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dl-card"
                >
                  <div className="dl-card-icon">
                    <FaApple size={24} />
                  </div>
                  <div className="dl-card-body">
                    <h3>Download Mac App</h3>
                    <p>LoomLess Studio v1.0.0 &middot; DMG download &middot; Tauri app</p>
                  </div>
                  <div className="dl-card-arrow">
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
                <Link
                  href={links.chrome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dl-card"
                >
                  <div className="dl-card-icon">
                    <FaChrome size={24} />
                  </div>
                  <div className="dl-card-body">
                    <h3>Chrome Extension</h3>
                    <p>LoomLess Studio &middot; Chrome Web Store &middot; MV3 with editor</p>
                  </div>
                  <div className="dl-card-arrow">
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              </div>
              <div className="dl-secondary">
                <Link href={links.releases} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Globe size={14} />
                  Releases
                </Link>
                <Link href={links.donate} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Heart size={14} />
                  Support Dev
                </Link>
                <Link href={links.author} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <User size={14} />
                  Connect with Dev
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHY LOOMLESS? ===== */}
        <section className="section" id="compare">
          <div className="container">
            <div className="section-header reveal" ref={setRevealRef(10)}>
              <span className="section-label">Why LoomLess?</span>
              <h2>Local-first. Free. Open source.</h2>
              <p>No subscription. No cloud dependency. Just a better way to record.</p>
            </div>

            <div className="compare-wrap reveal" ref={setRevealRef(11)}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>LoomLess</th>
                    <th>Loom</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price</td>
                    <td className="highlight-col">Free</td>
                    <td>Paid (higher tiers)</td>
                  </tr>
                  <tr>
                    <td>Storage</td>
                    <td className="highlight-col">Local, stays on your device</td>
                    <td>Cloud upload required</td>
                  </tr>
                  <tr>
                    <td>Account</td>
                    <td className="highlight-col">No account needed</td>
                    <td>Account required</td>
                  </tr>
                  <tr>
                    <td>Source</td>
                    <td className="highlight-col">Open source</td>
                    <td>Proprietary</td>
                  </tr>
                  <tr>
                    <td>Recording limit</td>
                    <td className="highlight-col">Unlimited</td>
                    <td>5 min (free tier)</td>
                  </tr>
                  <tr>
                    <td>Desktop app</td>
                    <td><Tick /> macOS</td>
                    <td><Tick /> macOS + Windows</td>
                  </tr>
                  <tr>
                    <td>Chrome extension</td>
                    <td><Tick /></td>
                    <td><Tick /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-header reveal" ref={setRevealRef(12)}>
              <span className="section-label">FAQ</span>
              <h2>Questions? We have answers.</h2>
            </div>

            <div className="faq-list">
              {faqItems.map((item, idx) => (
                <div
                  key={item.question}
                  className={`faq-item${openFaq === idx ? " open" : ""}`}
                  ref={setRevealRef(13 + idx)}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(idx)}
                  >
                    {item.question}
                    <Plus size={20} />
                  </button>
                  {openFaq === idx && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ALSO AVAILABLE ===== */}
        <section className="section" id="downloader" style={{ padding: 0 }}>
          <div className="container">
            <div className="also-card reveal" ref={setRevealRef(19)}>
              <div className="also-header">
                <span className="section-label">Also Available</span>
              </div>
              <div className="also-entries">
                <div className="also-entry">
                  <div className="also-entry-left">
                    <span className="also-entry-title">LoomLess Downloader</span>
                    <span className="also-entry-desc">Save media from Twitter/X and Reddit in one click. Free, open source, no tracking.</span>
                  </div>
                  <div className="also-entry-right">
                    <Link
                      href={links.chromeDownloader}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: ".8rem", padding: ".45rem 1rem" }}
                    >
                      <FaChrome size={13} />
                      Add to Chrome
                    </Link>
                  </div>
                </div>
                <div className="also-entry">
                  <div className="also-entry-left">
                    <span className="also-entry-title">ImanVibes</span>
                    <span className="also-entry-desc">Quranic Comfort for every Mood</span>
                  </div>
                  <div className="also-entry-right">
                    <Link
                      href={links.imanvibes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: ".8rem", padding: ".45rem 1rem" }}
                    >
                      <Globe size={13} />
                      Visit Site
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="l-footer">
        <div className="container">
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} LoomLess. Open source. Built with care.
          </div>
        </div>
      </footer>
    </>
  );
}
