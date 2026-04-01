# CLAUDE.md

## Project Overview
Personal website for Zian (Andy) Wang — a portfolio/resume site hosted on GitHub Pages at `spirituslab.github.io`.

## Design Philosophy
**Tufte-inspired academic aesthetic** — named after Edward Tufte. Principles:
- High data-ink ratio: every visual element should convey information
- Minimal chartjunk: no decorative clutter
- Clean serif typography (Crimson Pro), monospace accents (JetBrains Mono)
- Generous whitespace, restrained color palette (cream background `#fffff8`, teal accent `#1a5c6b`)
- Content speaks for itself — structure and typography do the heavy lifting

## Structure
- `index.html` — Main page with header, metrics strip, about section, projects, background, skills
- `projects/` — Individual project detail pages
- `css/main.css` — All styles, CSS custom properties for the design system
- `js/main.js` — Metric animations, smooth scroll, active nav, GBM canvas animation

## Key Features
- Geometric Brownian Motion canvas animation behind the hero area (correlated asset price paths)
- Animated metric counters on scroll
- Responsive layout (breakpoints at 768px and 480px)

## Change Log

### 2026-03-11 — Interactive hero, subtitle rewrite, about section
1. **GBM canvas animation** (`js/main.js`, `css/main.css`, `index.html`): Added a `<canvas>` behind the header/metrics area that renders 7 correlated Geometric Brownian Motion price paths as thin semi-transparent teal lines. Purpose: reinforce the quant finance identity with a subtle, domain-relevant visual — not decoration, but a signal that this person thinks in stochastic processes. Uses `IntersectionObserver` to pause when off-screen for performance.

2. **Subtitle rewrite** (`index.html`): Changed from "Quantitative finance professional. Building systems at the intersection of credit risk, factor investing, and machine learning." to "Finance, mathematics, and machine learning. Looking for what comes next." Purpose: shorter, more honest for someone applying to grad programs rather than presenting as an established professional.

3. **About section** (`index.html`, `css/main.css`): Added a 3-sentence paragraph between the metrics strip and Projects. Purpose: give a scanning reader immediate context — who Andy is, how he works, what he's looking for — without requiring them to read project details.

## How to Add a New Project

Two things need to be created/updated:

### 1. Add a card to `index.html`
Inside `<div class="projects-grid">`, add a new block following this template. Increment the project number.

```html
<!-- Project N -->
<div class="project-card">
  <div class="project-card-inner">
    <div>
      <div class="project-number">03</div>
      <h3><a href="projects/your-project-slug.html">Project Title</a></h3>
      <p class="project-origin">Origin story — e.g. "Evolved from coursework at X"</p>
      <p class="project-desc">
        2-3 sentence description of what it does and why it matters.
      </p>
      <div class="project-result">
        Key metric 1 &nbsp;&middot;&nbsp; Key metric 2
      </div>
      <div class="project-stack">
        Tool1 &middot; Tool2 &middot; Tool3
      </div>
    </div>
    <div class="project-link">
      <a href="projects/your-project-slug.html">Details &rarr;</a>
    </div>
  </div>
</div>
```

### 2. Create a detail page at `projects/your-project-slug.html`
Follow the structure in `projects/private-credit-intel.html` as a template. Key sections:
- **project-header**: title + meta (year, origin, GitHub link)
- **abstract**: 2-3 sentence overview
- **architecture**: optional flow diagram using `.arch-flow` / `.arch-layer` classes
- **results-table**: quantitative results
- **decision-block** `<details>`: collapsible key design decisions
- **stack-list**: tech stack pills
- **back-link**: `<a href="../" class="back-link">&larr; Back</a>` at top

Note: detail pages link CSS as `../css/main.css` (one level up).

### 3. Update metrics strip (if applicable)
If the new project has a standout metric worth featuring, update or swap one of the 5 metrics in the `.metrics-strip` section of `index.html`.

## Future Improvements
- **Dark mode toggle**: the color palette is already defined via CSS custom properties, so adding a dark theme would be straightforward — define alternate values and toggle a class on `<html>`
- **Project filtering/tags**: if the project count grows beyond 5-6, add tag-based filtering (e.g. ML, finance, systems)
- **Blog/writing section**: a Tufte-style long-form writing section for technical write-ups or notes
- **PDF resume download**: a link to a downloadable resume alongside the site content
- **GBM canvas tuning**: adjust drift/volatility parameters or add more visual variety (e.g. mean-reverting paths, jump diffusion)
- **SEO / Open Graph tags**: add og:image, og:title, twitter:card meta tags for better link previews when shared

## Local Development
```
python3 -m http.server 8000
# Open http://localhost:8000
```
