// Renders public/icon.svg into the PNG sizes the web app manifest needs, using
// the locally installed Chrome in headless mode (no image libraries required).
//   node scripts/make-icons.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const chromes = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
];
const chrome = chromes.find(existsSync);
if (!chrome) throw new Error("Chrome not found — install it or render the icons another way.");

const svg = readFileSync("public/icon.svg", "utf8");
const outDir = "public/icons";
mkdirSync(outDir, { recursive: true });
const tmp = path.join(os.tmpdir(), "cc-icon.html");

// Maskable icons need the artwork inside the central 80% "safe zone", on a full-bleed background.
const variants = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon.png", size: 180, maskable: true },
];

for (const v of variants) {
  const art = v.maskable ? svg.replace('rx="112"', 'rx="0"') : svg;
  const inner = v.maskable ? `<div style="width:80%;height:80%;margin:10%">${art.replace(/<rect[^>]*\/>/, "")}</div>` : art;
  const bg = v.maskable ? "#3B2A20" : "transparent";
  writeFileSync(
    tmp,
    `<html><body style="margin:0;background:${bg};width:${v.size}px;height:${v.size}px;overflow:hidden">
      <style>svg{width:100%;height:100%;display:block}</style>${inner}</body></html>`
  );
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--default-background-color=00000000",
    `--window-size=${v.size},${v.size}`, `--screenshot=${path.resolve(outDir, v.name)}`, `file:///${tmp.replace(/\\/g, "/")}`,
  ], { stdio: "ignore" });
  console.log(`wrote ${outDir}/${v.name}`);
}
rmSync(tmp);
