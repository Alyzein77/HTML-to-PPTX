#!/usr/bin/env node
// Set the title and author stored inside a .pptx.
// dom-to-pptx 2.1.2 ignores its own --title/--author flags and writes "PptxGenJS", so export.mjs calls this after export.
// Standalone usage: node meta.mjs deck.pptx "Deck title" "Your name"
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const esc = (s) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

export async function setMeta(buffer, title, author) {
  const zip = await JSZip.loadAsync(buffer);
  const core = await zip.file('docProps/core.xml').async('string');
  zip.file('docProps/core.xml', core
    .replace(/<dc:title>[^<]*<\/dc:title>/, `<dc:title>${esc(title)}</dc:title>`)
    .replace(/<dc:creator>[^<]*<\/dc:creator>/, `<dc:creator>${esc(author)}</dc:creator>`)
    .replace(/<cp:lastModifiedBy>[^<]*<\/cp:lastModifiedBy>/, `<cp:lastModifiedBy>${esc(author)}</cp:lastModifiedBy>`));
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, title, author] = process.argv.slice(2);
  if (!file || !title || !author) { console.error('Usage: node meta.mjs deck.pptx "Title" "Author"'); process.exit(2); }
  writeFileSync(file, await setMeta(readFileSync(file), title, author));
  console.log(`${file}: title "${title}", author "${author}"`);
}
