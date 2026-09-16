#!/usr/bin/env node
// Pre-export check. Usage: node check.mjs deck.html
// Flags the things that silently break in the PowerPoint export. Exit 1 if any are found.
import { readFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';

export const rules = [
  [/transform\s*:\s*[^;"']*(translate|scale|skew|matrix)/i, 'transform translate/scale/skew is ignored. Use left/top or flex centring.'],
  [/\d+\s*(vh|vw|vmin|vmax)\b/i, 'vh/vw units break sizing. Use px.'],
  [/backdrop-filter|clip-path|mask-image|mix-blend-mode|conic-gradient/i, 'backdrop-filter, clip-path, mask-image, blend modes and conic-gradient are dropped.'],
  [/box-shadow\s*:\s*inset/i, 'inset box-shadow is ignored.'],
  [/(?:<t[dh][^>]*style="[^"]*|\bt[dh]\s*\{[^}]*)padding\s*:\s*[^;"}]*\b0(?:px)?\b/i, 'Cell padding with a 0 side (e.g. padding:0 24px 16px 0) exports as huge margins and hides the table. Use symmetric padding like 16px 24px.'],
  [/border-radius\s*:\s*[^;"}]+\s[^;"}]+/i, 'Per-corner border-radius (e.g. 6px 6px 0 0) turns the box into a picture, not an editable shape. Use one value.'],
  [/<t[dh][^>]*>(?:(?!<\/t[dh]>).)*<svg/is, 'An <svg> inside a table cell is dropped. Leave the cell empty and position the SVG over it.'],
  [/<tr[^>]*style="[^"]*background/i, 'background on <tr> is lost. Put the background on each <td>/<th> instead.'],
  [/<script[^>]*src="https?:\/\//i, 'External <script src="http..."> in the HTML. Not needed for export; remove it.'],
  [/@latest/i, '"@latest" pulls unpinned code from the internet. Pin the version or remove.'],
  [/src="http:\/\//i, 'Plain http:// image. Use https:// or, better, a local file or data: URI.'],
  [/fonts\.googleapis\.com(?![^>]*crossorigin="anonymous")/i, 'Google Fonts link without crossorigin="anonymous" falls back to Arial.'],
  [/loading="lazy"/i, 'loading="lazy" can export an empty image. Remove it.'],
  [/<(video|canvas|iframe|audio)\b/i, 'video/canvas/iframe/audio are not captured.'],
];

export function check(rawHtml) {
  const html = rawHtml.replace(/data:[^"')]+/g, 'data:'); // strip base64 so it cannot trip a rule
  const slides = (html.match(/class="[^"]*\bslide\b/g) || []).length;
  const issues = rules.filter(([re]) => re.test(html)).map(([, msg]) => msg);
  if (slides === 0) issues.unshift('No element with class="slide" found.');
  return { slides, issues };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('Usage: node check.mjs deck.html'); process.exit(2); }
  const { slides, issues } = check(readFileSync(file, 'utf8'));
  console.log(`${file}: ${slides} slide(s)`);
  issues.forEach((m) => console.log('  ✗ ' + m));
  if (!issues.length) console.log('  ✓ no known export blockers');
  process.exit(issues.length ? 1 : 0);
}

