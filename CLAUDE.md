# Sunder Construction website

Marketing site for Sunder Construction LLC, a general contractor specializing in well-crafted, high-quality home remodels. Three pages: About (`index.html`), Projects (`projects.html`), Contact (`contact.html`).

Built from "version G" of the Sunder design canvas in Claude. Keep changes faithful to that design.

## Stack

- Plain static HTML, CSS and JavaScript. No build step, no framework, no dependencies.
- Run locally: `python3 -m http.server 8000` and open http://localhost:8000.
- Deploys to any static host (Vercel, Netlify, GitHub Pages) with the repo root as the output directory.

## Files

- `css/tokens.css`: brand design tokens (colours, fonts, spacing, radii). Use these variables; don't hard-code hex values.
- `css/site.css`: all page and component styles, grouped by section.
- `js/site.js`: shared behaviour (sticky compact nav, sliding nav underline, scroll reveals, parallax, fixed background spiral, project galleries and lightbox, contact form).
- `assets/`: logo artwork. `sunder-spiral.svg` is the static spiral; `sunder-spiral-animated.svg` is a standalone animated version for use elsewhere (not used by the pages).

The header, nav and footer markup is repeated in each HTML file. If you change one, change all three.

## Brand

- Colours: orange-light `#bb5727`, orange-dark `#b04325`, orange-mark `#cd6328`, tan-light `#ebddc9` (page background), tan-dark `#dac6a9`, green-light `#a1a281` (accent sections), green-dark `#8d8954`, ink `#2e2119`, ink-muted `#5c4838`.
- Type: display headings are **BD Plakatbau**, always uppercase; body copy is **Stymie**. Both are licensed fonts that aren't loaded yet. The site currently falls back to Bowlby One and Rokkitt from Google Fonts. To use the real fonts, add `@font-face` rules (self-hosted woff2) in `css/tokens.css`; the font-family stacks already list them first.
- Two-colour headlines: first word orange-dark (`.accent`), the rest ink.

## Accessibility rules (WCAG 2.1 AA)

- White text only on the orange colours. Only ink-coloured text on green-light.
- Orange-dark text only at 24px and larger.
- Carousel dots stay at opacity .65 or higher (3:1 against tan).
- Every animation must be disabled under `prefers-reduced-motion: reduce` (see the end of `site.css` and the `reduce` flag in `site.js`).
- Keep visible focus outlines, 44px minimum touch targets and the skip link.

## Design details to preserve

- **Animated hero spiral** (About and Projects): an inline SVG that masks the static artwork with a stroked centerline path. The `.sp-*` CSS animations draw it from the center outward, pop in the five dots, then a fill rect completes the edges. It's inline on purpose: an animated SVG loaded via `<img>` only plays once per page, because browsers share one animation clock per image URL.
- **Fixed background spiral** (`.bg-mark`): 7% opacity behind content. On About and Projects it fades in once the first green section (`data-after=".slant"`) has scrolled past; on Contact it's always on.
- **Angled green sections** (`.slant`): opposite top and bottom angles via `clip-path`.
- **Sticky nav**: 82% tan with blur; it shrinks after 16px of scroll. The `.site` root uses `overflow-x: clip` (not `hidden`), which keeps `position: sticky` working.

## Content still to fill in

Placeholders are in square brackets: phone, email, service area, license number, founding year, state, Ky's quote, project names and descriptions, and photos.

- **Photos**: in `projects.html`, replace each placeholder `.gallery-slide` with `<div class="gallery-slide"><img src="..." alt="..." data-full="large.jpg"></div>`. Dots and the lightbox pick them up automatically. The owner portrait on About is a `.photo` placeholder: swap in `<img class="par" src="..." alt="...">` to keep the parallax.
- **Contact form**: `#estimate-form` has `action="#"`, which shows the thank-you state without sending anything. Set `action` to a form endpoint (Formspree, Basin, Netlify Forms, etc.) to receive submissions. `site.js` POSTs `FormData` and expects a 2xx response.
- The `tel:` and `mailto:` links on Contact use dummy values.
