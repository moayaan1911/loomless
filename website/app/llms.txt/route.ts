const body = `# LoomLess

> Free local-first screen recorder for Mac and Chrome.

LoomLess is a screen recording suite built around one core promise: your video never leaves your device unless you choose to share it.

Current product state:
- macOS app: public recorder-only alpha DMG
- Chrome extension: local-first browser recording flow with the richer edit/export experience

Useful URLs:
- Home: https://loomless.fun/
- Free screen recorder overview: https://loomless.fun/free-screen-recorder
- Chrome screen recorder: https://loomless.fun/chrome-screen-recorder
- Screen recorder for Mac: https://loomless.fun/screen-recorder-for-mac
- FAQ: https://loomless.fun/faq
- Privacy policy: https://loomless.fun/loomless-studio-privacy-policy
- GitHub: https://github.com/moayaan1911/loomless
- Chrome Web Store: https://chromewebstore.google.com/detail/loomless/hpblkhdjmbiokmnemdmccpppjeoddecj

macOS alpha notes:
- current public version: 0.0.1
- recorder-only scope
- direct save/download when recording stops
- no desktop editor in the current public Mac alpha

Chrome extension notes:
- local-first recording workflow
- richer browser-based trim, crop, speed, and export flow

Keywords:
- free screen recorder
- screen recorder for mac
- chrome screen recorder
- free screen recorder for mac
- local screen recorder
- loom alternative
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
