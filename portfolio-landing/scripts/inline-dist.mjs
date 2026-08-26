// Inlines the built JS/CSS into a single self-contained HTML file so the
// page can be opened directly via file:// (e.g. for headless screenshots).
// Usage: node scripts/inline-dist.mjs   → writes dist-inline.html
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const htmlPath = resolve(dist, "index.html");

if (!existsSync(htmlPath)) {
  console.error("dist/index.html not found — run `npm run build` first.");
  process.exit(1);
}

let html = readFileSync(htmlPath, "utf8");

html = html.replace(
  /<script type="module"[^>]*src="([^"]+\.js)"[^>]*><\/script>/,
  (_, src) => {
    const js = readFileSync(resolve(dist, "." + src), "utf8");
    return `<script type="module">${js}</script>`;
  }
);

html = html.replace(
  /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/,
  (_, href) => {
    const css = readFileSync(resolve(dist, "." + href), "utf8");
    return `<style>${css}</style>`;
  }
);

const out = resolve(root, "dist-inline.html");
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
