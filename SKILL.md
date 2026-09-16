---
name: html-to-pptx
description: Build slides in HTML and export them to a fully editable PowerPoint (.pptx) on your own machine with dom-to-pptx. Use when someone asks for a PowerPoint, a deck, slides, or to convert HTML slides to pptx.
license: MIT (built on dom-to-pptx 2.1.2 by Atharva Dharmendra Jagtap and contributors)
---

# HTML to PPTX: editable PowerPoint from HTML slides

Write each slide as a 1920x1080 HTML box, run one command, get a .pptx where every heading, card, table and note is editable in PowerPoint. Nothing is uploaded anywhere; the export runs on the local machine.

Tested 16 Sep 2026 with the two decks in `examples/`: a 14-slide Athr21 talk on building a company's second brain (converted from a scrolling web deck) and a three-slide chart set (bars, trend line, overlapping combo). Near pixel match, editable text and shapes, native table, vector charts, speaker notes and an embedded web font all carried over.

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

## 4. Charts

Tested 16 Sep 2026 (`examples/charts.html`). Three ways, pick by what the chart is:

- **Bars, columns, stacked bars, gantt blocks, legends: divs.** Each bar is an absolutely positioned div with a height in px; each label is a text div. Every bar arrives in PowerPoint as a native shape you can recolour or resize. Use one `border-radius` value or none; a per-corner radius (`6px 6px 0 0`) turns the bar into a picture.
- **Lines, areas, scatter, anything curved: one inline `<svg>`.** Use `polyline`, `path`, `circle`, `line`, `text`. `export.mjs` keeps it as a vector; in PowerPoint, right-click > Convert to Shape makes every line and point editable. Keep the `<svg>` at a fixed px size and position, with a matching `viewBox`.
- **Complex, overlapping charts: layer them.** Grid lines and bars as divs underneath, one full-slide SVG (`left:0;top:0;width:1920;height:1080`) for lines and shaded areas over them, callouts and annotation ticks as divs on top. DOM order is z-order. Transparency (`opacity`, `rgba`) and `transform: rotate()` on pointer lines both survive.
- **Never:** `<canvas>`, Chart.js, Recharts, Plotly, D3 rendering to canvas. Nothing is captured. If a chart already exists as a picture, embed it as a PNG `<img>` and accept it is not editable.
- Put axis labels, values and legends in HTML text divs rather than SVG `<text>` when you can: they are editable without converting anything.

## 5. Check, then export

```bash
node check.mjs deck.html                                            # flags known export breakers, exit 1 if any
node export.mjs deck.html deck.pptx "Deck title" "Your name"        # vector SVG on, file properties set
node export.mjs deck.html slide2.pptx "Deck title" "Your name" "#slide-2"   # one slide only
```

`export.mjs` wraps the dom-to-pptx exporter with two fixes: SVGs stay vectors (the CLI rasterises them, and a rasterised SVG smaller than the slide comes out cropped), and the title and author are written into the file (the CLI's `--title/--author` flags do nothing in 2.1.2). Use `npx dom-to-pptx-exporter` directly only for non-16:9 sizes (`--width 13.33 --height 7.5`), then `node meta.mjs` for the properties.

Open the .pptx in PowerPoint and look at every slide before it goes anywhere. If a text box wraps, add or widen its `width` in the HTML and export again.

## 6. Security and privacy

- **Local only.** Slide content never leaves the machine. The only downloads are `npm install` and the one-time Chrome fetch. Keep it that way: no external fonts, scripts or images in the HTML.
- **Only export HTML you or a colleague wrote.** The exporter opens the HTML in a headless browser with local file access switched on, so a malicious HTML file could read local files. Never export HTML received from an unknown sender or copied from a website.
- **Images:** PNG, JPG or SVG you own. The image library underneath has an unfixed denial-of-service issue with crafted ICNS, JXL and HEIF files.
- **Speaker notes and metadata ship inside the file.** Whatever you put in `data-pptx-notes` or pass as title and author is in the .pptx. Do not put anything there you would not hand to the recipient.
- **Versions are pinned** in `package.json`. Do not add `@latest` anything. `npm audit` on 16 Sep 2026 shows only the image-size issue above.
- Treat the .pptx like any other business document once it holds business data.
