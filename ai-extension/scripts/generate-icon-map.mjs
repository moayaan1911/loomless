import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaRegCommentDots,
  FaRegFileLines,
  FaPenNib,
  FaPowerOff,
  FaBoltLightning,
  FaThumbtack,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCode,
  FaImage,
  FaPaperclip,
  FaGlobe,
  FaTriangleExclamation,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaCopy,
  FaCheck,
  FaDownload,
  FaArrowsRotate,
  FaArrowUpRightFromSquare,
  FaPaperPlane,
  FaXmark,
  FaEnvelope,
  FaUser,
  FaUserPlus,
  FaCircleCheck,
  FaLink,
  FaRocket,
  FaCircleInfo,
  FaCakeCandles,
  FaWandMagicSparkles,
  FaClockRotateLeft,
  FaPlus,
  FaEllipsisVertical,
  FaPenToSquare,
  FaTrashCan,
  FaGear,
} from "react-icons/fa6";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outFile = path.resolve(__dirname, "../public/icon-map.js");

const icons = {
  summarize: FaRegFileLines,
  chat: FaRegCommentDots,
  newChat: FaPlus,
  history: FaClockRotateLeft,
  write: FaPenNib,
  power: FaPowerOff,
  bolt: FaBoltLightning,
  pin: FaThumbtack,
  sidebarCollapse: FaChevronLeft,
  sidebarExpand: FaChevronRight,
  menuMore: FaEllipsisVertical,
  edit: FaPenToSquare,
  delete: FaTrashCan,
  settings: FaGear,
  chevronDown: FaChevronDown,
  modeChat: FaRegCommentDots,
  modeCode: FaCode,
  modeImage: FaImage,
  upload: FaPaperclip,
  attachment: FaPaperclip,
  web: FaGlobe,
  warning: FaTriangleExclamation,
  uploadImage: FaFileImage,
  uploadPdf: FaFilePdf,
  uploadDoc: FaFileWord,
  uploadPpt: FaFilePowerpoint,
  uploadSheet: FaFileExcel,
  copy: FaCopy,
  check: FaCheck,
  download: FaDownload,
  regenerate: FaArrowsRotate,
  preview: FaArrowUpRightFromSquare,
  send: FaPaperPlane,
  remove: FaXmark,
  email: FaEnvelope,
  user: FaUser,
  userPlus: FaUserPlus,
  success: FaCircleCheck,
  verify: FaLink,
  rocket: FaRocket,
  info: FaCircleInfo,
  age: FaCakeCandles,
  sparkle: FaWandMagicSparkles,
};

function svgFor(Component) {
  return renderToStaticMarkup(
    React.createElement(Component, {
      "aria-hidden": "true",
      focusable: "false",
      size: "1em",
    })
  );
}

const rendered = Object.fromEntries(Object.entries(icons).map(([name, Component]) => [name, svgFor(Component)]));

const output = [
  "(() => {",
  `  const ICONS = ${JSON.stringify(rendered, null, 2)};`,
  "",
  "  function svg(name) {",
  "    return ICONS[name] || \"\";",
  "  }",
  "",
  "  function html(name, className = \"\") {",
  "    const icon = svg(name);",
  "    if (!icon) return \"\";",
  "    const cls = className ? \"ll-icon-wrap \" + className : \"ll-icon-wrap\";",
  "    return '<span class=\\\"' + cls + '\\\" aria-hidden=\\\"true\\\">' + icon + '</span>';",
  "  }",
  "",
  "  function mount(root = document) {",
  "    if (!root || typeof root.querySelectorAll !== \"function\") return;",
  "    const nodes = root.querySelectorAll(\"[data-ll-icon]\");",
  "    nodes.forEach((node) => {",
  "      const name = node.getAttribute(\"data-ll-icon\");",
  "      const className = node.getAttribute(\"data-ll-icon-class\") || \"\";",
  "      if (!name) return;",
  "      node.innerHTML = html(name, className);",
  "    });",
  "  }",
  "",
  "  globalThis.LoomLessIconMap = {",
  "    svg,",
  "    html,",
  "    has(name) {",
  "      return Boolean(ICONS[name]);",
  "    },",
  "    mount,",
  "  };",
  "})();",
  "",
].join("\n");

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, output, "utf8");
console.log(`Wrote ${outFile}`);
