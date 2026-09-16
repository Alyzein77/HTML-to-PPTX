#!/usr/bin/env node
// Finds text that overflows its box. The browser lets it spill; PowerPoint wraps it onto a new line.
// Usage: node overflow.mjs deck.html      (exit 1 if anything overflows)
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';

// Puppeteer wants its own pinned Chrome build; dom-to-pptx may have installed a slightly newer one. Use whatever is there.
function chromePath() {
  try { const p = puppeteer.executablePath(); if (existsSync(p)) return p; } catch {}
  const root = resolve(homedir(), '.cache/puppeteer/chrome');
  for (const v of existsSync(root) ? readdirSync(root) : []) {
    for (const rel of ['chrome-linux64/chrome', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-win64/chrome.exe']) {
      const p = resolve(root, v, rel); if (existsSync(p)) return p;
    }
  }
  return undefined; // let puppeteer throw its own message
}

const file = process.argv[2];
if (!file) { console.error('Usage: node overflow.mjs deck.html'); process.exit(2); }
const browser = await puppeteer.launch({ executablePath: chromePath(), args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle0' });
const hits = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.slide').forEach((slide, i) => {
    slide.querySelectorAll('*').forEach((el) => {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own || el.closest('svg')) return;
      const w = el.scrollWidth - el.clientWidth, h = el.scrollHeight - el.clientHeight;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      // a few px of height is glyph overhang from a tight line-height; half a font-size means a real extra line
      if (w > 2 || h > fs / 2) out.push(`slide ${i + 1}: <${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).split(' ')[0] : ''}> "${el.textContent.trim().slice(0, 40)}" spills ${w > 2 ? w + 'px wide' : ''}${w > 2 && h > fs / 2 ? ', ' : ''}${h > fs / 2 ? h + 'px tall' : ''}`);
    });
  });
  return out;
});
await browser.close();
hits.forEach((h) => console.log('  ✗ ' + h));
console.log(hits.length ? `${hits.length} overflow(s). Widen the box or shrink the text.` : '  ✓ no text overflows its box');
process.exit(hits.length ? 1 : 0);
