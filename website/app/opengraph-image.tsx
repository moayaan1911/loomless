import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FaApple, FaChrome } from "react-icons/fa";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const iconPath = join(process.cwd(), "public", "loomless-icon.png");
const iconData = readFileSync(iconPath).toString("base64");

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 15% 10%, rgba(108,124,255,0.22), transparent 50%), radial-gradient(circle at 85% 90%, rgba(125,195,255,0.18), transparent 45%), linear-gradient(180deg, #f6f7fb 0%, #eceffa 100%)",
          color: "#0b1020",
          padding: "72px 80px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <img
            src={`data:image/png;base64,${iconData}`}
            width="88"
            height="88"
            alt="LoomLess icon"
            style={{
              borderRadius: "24px",
              boxShadow: "0 24px 60px rgba(87, 105, 255, 0.35)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0b1020",
            }}
          >
            LoomLess
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                borderRadius: "999px",
                border: "1px solid rgba(11,16,32,0.12)",
                background: "rgba(255,255,255,0.8)",
                fontSize: "22px",
                fontWeight: 600,
                color: "#0b1020",
              }}
            >
              <FaApple size={22} color="#0b1020" />
              macOS
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                borderRadius: "999px",
                border: "1px solid rgba(11,16,32,0.12)",
                background: "rgba(255,255,255,0.8)",
                fontSize: "22px",
                fontWeight: 600,
                color: "#0b1020",
              }}
            >
              <FaChrome size={22} color="#0b1020" />
              Chrome
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "104px",
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              background: "linear-gradient(90deg, #1a1f3a 0%, #4a55c9 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Free Screen Recorder
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "104px",
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              background: "linear-gradient(90deg, #4a55c9 0%, #7d8cff 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            &amp; Editor.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              color: "#3a4268",
              fontWeight: 500,
              marginTop: "12px",
            }}
          >
            No sign up. No payment. No cloud. 100% local.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(11,16,32,0.08)",
            paddingTop: "22px",
            fontSize: "24px",
            color: "#5a638a",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", letterSpacing: "0.08em" }}>
            loomless.fun
          </div>
          <div style={{ display: "flex", letterSpacing: "0.04em" }}>
            Open source · Privacy-first
          </div>
        </div>
      </div>
    ),
    size,
  );
}
