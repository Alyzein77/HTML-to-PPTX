# Brand template

Copy this file to `reference/BRAND.md`, fill it in, and point to it from `SKILL.md` section 1. Claude reads it before designing a slide.

## Palette (five roles, hex only)

```css
:root {
  --base:      #ffffff;  /* slide background */
  --surface:   #f2f2f2;  /* bands, cards, table headers */
  --accent:    #e8590c;  /* one accent, used sparingly */
  --ink:       #111111;  /* headings and body */
  --ink-soft:  #777777;  /* footers, captions */
}
```

Rules worth writing down: where the accent may and may not go, minimum contrast for body text, whether full-bleed colour behind text is allowed.

## Type

Font family and the fallback stack. If it is a Google Font, the `<link>` needs `crossorigin="anonymous"` or PowerPoint falls back to Arial. If it is a system font (Arial, Helvetica, Georgia), say so; the HTML then makes no network requests at all.

Sizes that work at 1920 x 1080: kicker 26 px, title 64 to 80 px, body 26 to 34 px, footer 20 px.

## Logo

- File name and where it lives (`examples/images/logo.png` or a `data:` URI).
- Clear space and minimum size.
- What it may sit on (white band, dark band) and what it may not (photos, gradients).

## Layout recipe

Band height, page margins, footer content, slide number position. The example deck uses a 120 px top band, 100 px margins, footer at 1000 px.

## Voice

Three lines on tone. What words the brand does not use.
