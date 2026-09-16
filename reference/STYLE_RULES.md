# What converts to PowerPoint and what does not

Condensed from the dom-to-pptx 2.1.2 style whitelist plus what broke in testing on 16 Sep 2026.

## Slide container

Every `.slide` root: fixed px size (1920 x 1080), `position: relative`, `overflow: hidden`, a direct child of `<body>` or of a plain wrapper with no `transform` on it.

## Works

| Feature | Note |
|---|---|
| `position: absolute` + `left/top/width/height` in px | Most predictable |
| flex and grid | Final rectangles are measured, so layout method does not matter |
| solid colours, `rgba()`, `opacity` | |
| `linear-gradient(...)` any angle, many stops | `radial-gradient` only simple cases |
| `border`, per-side borders, `border-radius` with one value | dashed often becomes solid. A per-corner radius turns the element into a picture |
| one outer `box-shadow` | only the first shadow; no inset |
| `transform: rotate(Ndeg)` | the only transform that survives |
| font-size px, weight 100 to 900, italic, line-height, letter-spacing, text-transform, text-align, underline | |
| inline runs `<strong>`, `<em>`, `<span style>` | preserved, also inside table cells |
| `<table>` | becomes a native PowerPoint table. Backgrounds go on `<td>`/`<th>`, never on `<tr>`. Cell padding must be symmetric (`16px 24px`); a 0 side breaks the cell margins |
| `<ul>`, `<ol>` | native bullets |
| `<img>` local path, `data:` URI, or https with CORS | `object-fit: cover` and `border-radius` on images work |
| inline `<svg>` | vector with `export.mjs` (Convert to Shape in PowerPoint). The stock CLI rasterises it, and crops it if it is smaller than the slide |
| `filter: blur()` | becomes a soft edge |
| `data-pptx-notes="..."` on `.slide` | speaker notes |

## Breaks or is dropped

| Feature | Use instead |
|---|---|
| `transform: translate / scale / skew / matrix` | `left/top`, or flex centring |
| `vh`, `vw`, `vmin`, `vmax` | px |
| `background` on `<tr>` | background on each cell |
| `backdrop-filter` | a semi-transparent div over a solid background |
| `clip-path`, `mask-image` | `border-radius` |
| `filter: brightness/contrast/grayscale` | bake into the image, or overlay a tinted div |
| blend modes, `conic-gradient` | stacked divs, `linear-gradient` |
| inset `box-shadow`, `outline`, `text-shadow` | border, colour contrast |
| `:hover`, `:focus` | nothing; only the default state exports |
| `video`, `canvas`, `iframe`, `audio` | a screenshot as `<img>` |
| custom `@keyframes` | none needed for a business deck |
| Google Fonts link without `crossorigin="anonymous"` | Arial. Or a system font and no web fonts at all |
| `loading="lazy"` on images | remove it |
| a text element with no `width` | set one, or PowerPoint may wrap the line |

## Charts

See SKILL.md section 4. Short form: bars are divs, lines are one inline SVG, combos are layered (divs, then a full-slide SVG, then callout divs). Canvas-based chart libraries export nothing.

## Found in testing

- Footer line with no `width` wrapped onto two lines in PowerPoint. Fixed by adding `width`.
- Table header row styled on `<tr>` exported with a transparent fill and white text, so the header vanished. Fixed by moving the style to the `<th>` cells.
- Cell padding `0 24px 16px 0` exported as 9-inch cell margins, so the whole table vanished. Symmetric padding (`16px 24px`) fixed it.
- Relative image paths (`images/logo.png`) work with the command-line exporter. They do not work with the in-browser library, so keep using the exporter.
- Fonts embedded in the .pptx are honoured by PowerPoint. LibreOffice ignores them, so a LibreOffice preview can look wrong when the file is fine.
- A 1680 px wide inline SVG placed at left:120 came out cropped and 2x scaled in raster mode; a full-slide SVG at 0,0 was fine. Vector mode (`export.mjs`) renders both correctly.
- A bar with `border-radius:6px 6px 0 0` became a picture (five media files per bar). With `border-radius:4px` it is a native rounded rectangle.
- The exporter's `--title` and `--author` flags are silently ignored in 2.1.2; the file says "PptxGenJS". `meta.mjs` fixes the properties after export.
