# HTML to PPTX

Turn HTML slides into an editable PowerPoint on your own machine.

## Credits

This is a thin wrapper. All the hard work is upstream:

- **[dom-to-pptx](https://github.com/atharva9167j/dom-to-pptx)** by Atharva Dharmendra Jagtap and contributors, MIT. The HTML to PPTX engine, the headless exporter (`dom-to-pptx-exporter`) and the original `dom-to-pptx-skills` package that this SKILL.md and `reference/STYLE_RULES.md` are condensed from.
- [PptxGenJS](https://github.com/gitbrent/PptxGenJS), [Puppeteer](https://pptr.dev) and [JSZip](https://stuk.github.io/jszip/), which dom-to-pptx builds on.

What this repo adds: a brand template, `check.mjs` (pre-export lint), `meta.mjs` (works around the ignored `--title/--author` flags in 2.1.2), a tested example deck, pinned versions, and the security notes below. Version 2.1.2 of dom-to-pptx was the basis; the skill and rules were tested against it on 16 Sep 2026.

## Install as a Claude skill

Zip this folder and upload it under Customize > Skills > + > Create skill > Upload a skill. Then ask Claude for a deck and it will follow `SKILL.md`.

## Use from the terminal

```bash
npm install                                     # once
node check.mjs examples/example-deck.html       # pre-flight
npx dom-to-pptx-exporter examples/example-deck.html -o example-deck.pptx
node meta.mjs example-deck.pptx "Example deck" "Your name"
```

Open `example-deck.pptx` in PowerPoint. Copy `examples/example-deck.html` as the starting point for a new deck.

## What is in here

| File | What it is |
|---|---|
| `SKILL.md` | The instructions Claude follows: brand rules, HTML rules, export command, security notes |
| `reference/BRAND_TEMPLATE.md` | Copy to `BRAND.md` and fill in your palette, type, logo and layout rules |
| `reference/STYLE_RULES.md` | What CSS converts and what does not |
| `meta.mjs` | Writes title and author into the .pptx (the exporter's flags are broken in 2.1.2) |
| `check.mjs` | Pre-export check for the things that break silently. `node check.test.mjs` runs its self-test |
| `examples/` | A three-slide example (HTML + the exported .pptx) in a neutral look |
| `package.json` | Pinned versions of the exporter and headless browser |

## Security in one paragraph

Everything runs locally; slide content is never uploaded. Only export HTML you or a colleague wrote, because the exporter opens it in a browser with local file access on. Use PNG/JPG/SVG images you own. Speaker notes and author metadata are stored inside the .pptx.
