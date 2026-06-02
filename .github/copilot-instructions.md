# Copilot instructions for this repository

## Quick overview
- Static portfolio site: plain HTML, CSS and JavaScript (no package.json or build pipeline detected).
- Entry points: `index.html` (projects listing) and `project.html` (project detail).
- JS files: `js/script.js` (project list, filters, theme toggle, clock), `js/project-data.js` (projects database), `js/project-page.js` (renders project detail & gallery, lightbox).
- Styles: `css/style.css`, `css/project.css`. Tailwind is loaded via CDN in the HTML; `tailwind.config.js` exists but no build step was found.

## Build / test / lint commands
- No build, test, or lint scripts detected in the repository (no package.json or CI files).
- How to run locally:
  - Open `index.html` in a browser, or run a lightweight static server:
    - Python: `python -m http.server 8000` (then open http://localhost:8000)
    - Node: `npx http-server -c-1 .` (or add your own npm script)
- If you add Tailwind build later, recommended npm script examples to include in package.json:
  - "build:css": "tailwindcss -i ./css/input.css -o ./css/style.css --minify"
- No test runner or lint config found; single-test guidance is N/A.

## High-level architecture
- index.html
  - Uses `js/script.js` + `js/project-data.js` to render a horizontal list of projects and provide filter buttons.
  - Projects are links to `project.html?slug=<slug>`; `slug` must match an entry in `js/project-data.js`.
- project.html
  - Loads `js/project-data.js` then `js/project-page.js` to read the `slug` query parameter and render a project page.
  - Project objects use two separate arrays:
    - `images` — small indexed array for hero/feature images referenced directly (project-page expects specific indices)
    - `gallery` — an array of content blocks where items can be image blocks or textual blocks (project-page maps these into figures and text blocks; image items should provide `image` and optional `text`).
  - Lightbox is implemented by attaching a click handler to elements with class `project-image`.
- Styling
  - Tailwind utilities are used inline (CDN). Fonts live in the `Fonts/` folder and are referenced in `css/style.css`.

## Key conventions and repository-specific patterns
- Project objects in `js/project-data.js`:
  - Prefer including a `slug` for any project that should link to `project.html` (missing slugs produce broken links).
  - `category` values drive filters: use `social`, `uxui`, `merch`, `art-direction`, or `all`.
  - `images` array indices are used directly by `project-page.js`; keep ordering stable when editing.
  - `gallery` items:
    - Textual blocks: include `type: 'text'` or `textOnly: true` plus `title`/`text`/`html`.
    - Image blocks: include `image` (URL) and optional `text` (caption).
- DOM contract (IDs expected by scripts):
  - Project detail IDs: `project-title`, `project-category`, `project-intro`, `project-role`, `project-contribution`, `project-duration`, `project-tools`, `project-body-1`, `project-body-2`, `project-image-1`, `project-image-2`, `project-image-2-1`, `project-image-3`, `project-gallery`, `lightbox`, `lightbox-img`.
  - Script expects `themeToggle` button to exist for theme switching; it stores selection in localStorage under `theme` and toggles `theme-dark` class on body.
- Accessibility and behavior:
  - Lightbox closes on click and Escape key.
  - Images use `loading="lazy"` when inserted via gallery rendering.
- Tailwind config mismatch:
  - `tailwind.config.js` references `./src/**/*.{html,js}` but the site files are at the repo root. If adding a Tailwind build step, update the `content` paths to include the actual HTML/JS locations (e.g., `./**/*.{html,js}`).

## AI-assistant / agent files discovered
- No existing AI assistant configuration files found (CLAUDE.md, AGENTS.md, .cursorrules, .windsurfrules, AIDER_CONVENTIONS.md, .clinerules, etc.).
- This file (`.github/copilot-instructions.md`) has been added to provide repository-specific context for future Copilot sessions.

## When editing projects or pages
- Add or maintain `slug` values for projects that require individual pages.
- Keep `images` ordering and gallery item shapes stable to avoid runtime errors in `project-page.js`.
- If switching from CDN Tailwind to a build pipeline, update `tailwind.config.js` content paths and add a package.json with build scripts; ensure produced CSS is referenced by the HTML.

---

(End of Copilot instructions)
