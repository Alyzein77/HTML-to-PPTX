#!/usr/bin/env node
// Export HTML slides to .pptx with SVG charts kept as vectors and the file properties set.
// Usage: node export.mjs deck.html deck.pptx "Deck title" "Author" [css-selector]
// Why not the dom-to-pptx-exporter CLI: it cannot switch on svgAsVector, and rasterised SVGs that are
// smaller than the slide come out cropped and scaled (seen 16 Sep 2026). Vector SVGs export correctly
// and become editable shapes in PowerPoint via right-click > Convert to Shape.
import { writeFileSync } from 'node:fs';
import { exportHtmlToPptx } from 'dom-to-pptx/node';
import { setMeta } from './meta.mjs';

const [input, output, title = 'Presentation', author = '', selector = '.slide'] = process.argv.slice(2);
if (!input || !output) { console.error('Usage: node export.mjs deck.html deck.pptx "Title" "Author" [selector]'); process.exit(2); }

const buf = await exportHtmlToPptx(input, { selector, pptxOptions: { svgAsVector: true } });
writeFileSync(output, await setMeta(buf, title, author));
console.log(`${output}: written, title "${title}", author "${author}"`);
