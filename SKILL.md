---
name: html-to-pptx
description: Build slides in HTML and export them to a fully editable PowerPoint (.pptx) on your own machine with dom-to-pptx. Use when someone asks for a PowerPoint, a deck, slides, or to convert HTML slides to pptx.
license: MIT (built on dom-to-pptx 2.1.2 by Atharva Dharmendra Jagtap and contributors)
---

# HTML to PPTX: editable PowerPoint from HTML slides

Write each slide as a 1920x1080 HTML box, run one command, get a .pptx where every heading, card, table and note is editable in PowerPoint. Nothing is uploaded anywhere; the export runs on the local machine.

Tested 16 Sep 2026 with the two decks in `examples/` (a 14-slide Athr21 talk converted from a scrolling web deck, and a three-slide chart set) plus a private ten-slide financial forecast: KPI tiles, stacked bars, a waterfall, three-series lines over a shaded band, a 42-cell heatmap, a donut, a table with negatives, bullets and a gradient callout. Near pixel match, editable text and shapes, native table, vector charts, speaker notes and an embedded web font all carried over.

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
- Give every text element an explicit `width`, or PowerPoint may wrap it differently. Text that spills out of its box in the browser gets wrapped onto a new line in PowerPoint; `overflow.mjs` finds these before you export.
- Keep the top 440 px for the mark, the kicker and a two-line title. Charts, cards and tables start at 440 or lower, footers sit at 960.
- A filled or bordered box with text inside it (a KPI tile, a heatmap cell, a pill) is fine; `export.mjs` switches off PowerPoint's "resize shape to fit text" so the box keeps its size.
- Logos and images: local files (`images/logo.png`) or base64 `data:` URIs. Both work with the exporter. No hotlinked images from the internet.
- Tables: put background colours on `<td>` and `<th>`, not on `<tr>`, and use symmetric cell padding (`16px 24px`). A `<tr>` background is lost; a padding with a 0 side breaks the cell margins and the table vanishes.
- Solid colours, linear gradients, borders, border-radius, one outer shadow and `transform: rotate()` all export. Blur, blend modes, clip-path, inset shadows and hover states do not.

## 4. Charts

Tested 16 Sep 2026 across `examples/charts.html`, `examples/charts-gallery.html` and a private 12-slide gallery. Three building blocks cover every chart a business deck needs:

- **Divs** for anything rectangular: bars, columns, stacked and 100% stacked bars, waterfalls, tornados, bullets, gantt bars, marimekko blocks, treemaps, heatmap cells, KPI tiles, axis rules, grid lines, legends, connectors. Each becomes a native PowerPoint shape. One `border-radius` value or none; a per-corner radius turns the box into a picture.
- **One inline `<svg>`** for anything with a curve or a diagonal: lines, areas, scatter connectors, donuts, gauges, Harvey balls, radar polygons, funnels, slope charts, sparklines. `export.mjs` keeps it as a vector; right-click > Convert to Shape in PowerPoint makes it editable. Fixed px size and position, matching `viewBox`.
- **HTML text divs** for every label, value, axis tick and legend entry, so they are editable without converting anything. Format numbers in the HTML (`12,200`, `-1,331`, `+16%`); nothing formats them later.

Recipes that worked, by chart type:

| Chart | Build |
|---|---|
| Bar, column, stacked, 100% stacked | One div per segment, height in px from the value. 60 segments on a slide is fine |
| Waterfall / bridge | Totals in the brand colour, increases green, decreases red, a 2 px grey div as the connector at the running level, every bar labelled with its sign, 7 to 10 bars, group the rest as Other |
| P&L / income statement | One positioned text div per cell (not a `<table>`, so rows can carry bars); subtotal rows bold with a 3 px rule; variance as signed number plus a horizontal bar div, green when good for the business |
| Line, area, stacked area | `<polyline>` / `<polygon>` in one SVG; markers as small round divs on top |
| Combo, dual axis | Bars as divs, the line in a full-slide SVG placed after them in the DOM, right-axis ticks as text divs |
| Donut, pie, gauge, Harvey ball | `<path>` arcs (`A r r 0 large sweep x y`). Never `stroke-dasharray` on a circle: it lost a segment |
| Tornado | Paired divs left and right of a centre rule |
| Bullet | Nested divs: range band, target band, actual bar, a 4 px tick for the target |
| Gantt | One div per bar on a month grid of 1 px rules, a red rule for a milestone |
| Marimekko | Column width from one measure, stacked heights from the other, all divs |
| Treemap | Divs; compute the areas yourself |
| Bubble / 2x2 scatter | Round divs (`border-radius:50%`) positioned by the two measures, diameter from the third |
| Radar | SVG polygons for rings and series, text divs for axis names |
| Funnel | SVG polygons (trapezoids), labels as text divs placed after the SVG |
| Slope | SVG lines and circles, text divs at each end |
| Sparkline in a table | An SVG inside a `<td>` is dropped. Leave the cell empty and place a small positioned SVG over it |
| Rotated axis labels | `transform: rotate(-45deg)` on the text div works |

Rules that bite:

- **DOM order is z-order.** A full-slide SVG covers every div written before it. Write backgrounds and bars first, the SVG next, labels and callouts last.
- Never `<canvas>`, Chart.js, Recharts, Plotly, D3-to-canvas. Nothing is captured. A chart that exists only as a picture goes in as a PNG `<img>` and stays a picture.
- Colour by meaning: increases and good variances green, decreases and bad variances red, totals in the brand colour, one accent per slide.

## 5. Check, then export

```bash
node check.mjs deck.html                                            # flags known export breakers, exit 1 if any
node overflow.mjs deck.html                                         # opens the HTML in headless Chrome, lists text that spills out of its box
node export.mjs deck.html deck.pptx "Deck title" "Your name"        # vector SVG on, autofit off, file properties set
node export.mjs deck.html slide2.pptx "Deck title" "Your name" "#slide-2"   # one slide only
```

`export.mjs` wraps the dom-to-pptx exporter with three fixes: SVGs stay vectors (the CLI rasterises them, and a rasterised SVG smaller than the slide comes out cropped); every text shape's "resize to fit text" flag is switched off (otherwise filled boxes collapse to their text height on the first edit); and the title and author are written into the file (the CLI's `--title/--author` flags do nothing in 2.1.2). Use `npx dom-to-pptx-exporter` directly only for non-16:9 sizes (`--width 13.33 --height 7.5`), then `node meta.mjs` for the properties.

Open the .pptx in PowerPoint and look at every slide before it goes anywhere. If a text box wraps, add or widen its `width` in the HTML and export again.

## 6. Security and privacy

- **Local only.** Slide content never leaves the machine. The only downloads are `npm install` and the one-time Chrome fetch. Keep it that way: no external fonts, scripts or images in the HTML.
- **Only export HTML you or a colleague wrote.** The exporter opens the HTML in a headless browser with local file access switched on, so a malicious HTML file could read local files. Never export HTML received from an unknown sender or copied from a website.
- **Images:** PNG, JPG or SVG you own. The image library underneath has an unfixed denial-of-service issue with crafted ICNS, JXL and HEIF files.
- **Speaker notes and metadata ship inside the file.** Whatever you put in `data-pptx-notes` or pass as title and author is in the .pptx. Do not put anything there you would not hand to the recipient.
- **Versions are pinned** in `package.json`. Do not add `@latest` anything. `npm audit` on 16 Sep 2026 shows only the image-size issue above.
- Treat the .pptx like any other business document once it holds business data.
