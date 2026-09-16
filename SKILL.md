---
name: html-to-pptx
description: Build slides in HTML and export them to a fully editable PowerPoint (.pptx) on your own machine with dom-to-pptx. Use when someone asks for a PowerPoint, a deck, slides, or to convert HTML slides to pptx.
license: MIT (built on dom-to-pptx 2.1.2 by Atharva Dharmendra Jagtap and contributors)
---

# HTML to PPTX: editable PowerPoint from HTML slides

Write each slide as a 1920x1080 HTML box, run one command, get a .pptx where every heading, card, table and note is editable in PowerPoint. Nothing is uploaded anywhere; the export runs on the local machine.

Tested 16 Sep 2026 with the 14-slide example deck in `examples/` (an Athr21 talk on building a company's second brain, converted from a scrolling web deck): near pixel match, editable text, native table, speaker notes and an embedded web font carried over.

## 1. Brand first

If `reference/BRAND.md` exists, read it before designing anything and follow it. If it does not, ask for the brand (palette, font, logo) or fall back to the neutral look in `examples/example-deck.html`: white base, one dark ink, one accent, Arial. `reference/BRAND_TEMPLATE.md` shows what to capture.

Deck habits that keep a deck credible: a title slide carries no body text; the proposed way forward goes at the end; a number on a slide has its source in the report behind it; about 15 words per text block; three cards in a row, never three stacked.

## 2. Set up once

Needs Node 20 or newer. From the skill folder:

```bash
npm install
```

The first export downloads a headless Chrome (about 200 MB, one time, into `~/.cache/puppeteer`). If your machine already has Chrome, set `PUPPETEER_EXECUTABLE_PATH` to it and nothing is downloaded.

## 3. Write the HTML

Start from `examples/example-deck.html`. Each slide:

```html
<div class="slide" data-pptx-notes="Speaker notes go here"
     style="width:1920px;height:1080px;position:relative;overflow:hidden;background:#ffffff;font-family:Arial,Helvetica,sans-serif">
  ...
</div>
```

Rules that matter (the full list is in `reference/STYLE_RULES.md`):

- Use px everywhere. Position with `left/top` or flex/grid. Never `transform: translate()`.
- Give every text element an explicit `width`, or PowerPoint may wrap it differently.
- Logos and images: local files (`images/logo.png`) or base64 `data:` URIs. Both work with the exporter. No hotlinked images from the internet.
- Tables: put background colours on `<td>` and `<th>`, not on `<tr>`, and use symmetric cell padding (`16px 24px`). A `<tr>` background is lost; a padding with a 0 side breaks the cell margins and the table vanishes.
- Solid colours, linear gradients, borders, border-radius, one outer shadow and `transform: rotate()` all export. Blur, blend modes, clip-path, inset shadows and hover states do not.

## 4. Check, then export

```bash
node check.mjs deck.html                      # flags known export breakers, exit 1 if any
npx dom-to-pptx-exporter deck.html -o deck.pptx
node meta.mjs deck.pptx "Deck title" "Your name or company"   # sets file properties; the exporter's own --title/--author flags do nothing in 2.1.2
npx dom-to-pptx-exporter deck.html -s "#slide-2" -o slide2.pptx   # one slide only
```

Open the .pptx in PowerPoint and look at every slide before it goes anywhere. If a text box wraps, add or widen its `width` in the HTML and export again.

## 5. Security and privacy

- **Local only.** Slide content never leaves the machine. The only downloads are `npm install` and the one-time Chrome fetch. Keep it that way: no external fonts, scripts or images in the HTML.
- **Only export HTML you or a colleague wrote.** The exporter opens the HTML in a headless browser with local file access switched on, so a malicious HTML file could read local files. Never export HTML received from an unknown sender or copied from a website.
- **Images:** PNG, JPG or SVG you own. The image library underneath has an unfixed denial-of-service issue with crafted ICNS, JXL and HEIF files.
- **Speaker notes and metadata ship inside the file.** Whatever you put in `data-pptx-notes` or pass to `meta.mjs` is in the .pptx. Do not put anything there you would not hand to the recipient.
- **Versions are pinned** in `package.json`. Do not add `@latest` anything. `npm audit` on 16 Sep 2026 shows only the image-size issue above.
- Treat the .pptx like any other business document once it holds business data.
