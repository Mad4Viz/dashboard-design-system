# RAW Analytics Design System

Tableau-style BI dashboard design system. Tokens, layout grid, six component types, five Tweaks Panel surfaces. The product is a hand-built analytics dashboard for an analytics consultancy ("RAW"), packaged so it can be lifted onto a Claude Design canvas and re-skinned for any client.

## What this is

A canvas-locked dashboard frame (1440 x 1024) with:
- 12-column grid sitting inside a 240px sidebar shell
- 8px vertical rhythm, 24px gutters
- Six component types: KPI metric card, grouped horizontal bar, multi-line with annotation, combo bar+line dual-axis, ranked horizontal bar with row icons, plus the sidebar shell itself
- Five Tweaks Panel surfaces: grid overlay, snap to grid, show all dimensions, add component, padding toggle (16 / 24)
- Per-component inline title/subtitle editing, hover-revealed remove (x), drag, resize, localStorage persistence

Charts use d3 v7 from cdnjs. KPI card and ranked horizontal bar are HTML+CSS only.

## Sources

All inputs were local files attached via File System Access API at `outputs/` (read-only). Mirrored into this project under `reference/`:

| Source | Mirror | Role |
|---|---|---|
| `outputs/design_system_spec.md` | `reference/design_system_spec.md` | The contract. Tokens, layout, components, Tweaks surfaces. |
| `outputs/dashboard_demo_spec.md` | `reference/dashboard_demo_spec.md` | Shopify Overview demo: slot assignments, mock data. |
| `outputs/sandbox/functionality_demo.html` | `reference/functionality_demo.html` | Source of truth for interactive behaviour. Wherever spec and demo disagree, the demo wins. |
| `outputs/charts/*.html` | `reference/charts/*.html` | Five chart implementations, drop-in ready. |

The spec also references Figma node `1184:696` (sidebar structure) inside `Claude Input` 6342:276, Tableau workbook references, and the original reference images `Shopify Overview (3).png` and `Marketing Spend Overview (2).png`. None of those were attached; the demo HTML and spec are the working substitute.

## Index

| File | Purpose |
|---|---|
| `colors_and_type.css` | The full CSS variable contract from Section 7 of the spec. Drop into any artifact. |
| `template/` | The working dashboard template. `index.html` plus its CSS/JS. Drop-in canvas, six components, Tweaks Panel wired. |
| `assets/` | Logo wordmark (SVG, vector), reference iconography, package + helix icons used in components. |
| `preview/` | Design System tab cards: tokens, palette, type, spacing, components, Tweaks surfaces. |
| `reference/` | Read-only mirror of the source spec + demo + charts. |
| `SKILL.md` | Cross-compatible Agent Skill entry point. |

## CONTENT FUNDAMENTALS

Tone is set in the spec itself ("Voice: terse, technical, specificity over puffery. No em-dashes, no AI-isms.") and held throughout the source files. Specifics:

- **Terse.** Short sentences. The spec phrases functionality as contracts, not narratives: "Toggle (on/off). Default off."
- **Imperative for instructions.** "Paste this spec into Claude Design." "Drag the `outputs/charts/` folder." Not "you can paste..." or "we recommend..."
- **Technical specificity over puffery.** Numbers and identifiers everywhere: `1184:696`, `--chart-accent`, `(220, 80, 90, 0.18)`. No "delightful", "seamless", "powerful", "smart".
- **No em-dashes.** Hyphens only. Long thoughts use comma + clause or break into a new sentence.
- **No emoji. No AI-isms.** No "as an AI...", no bullet lists of three adjectives.
- **Honesty notes.** When data is approximate, the spec calls it out explicitly: "2025 values and delta % are verbatim from the reference. 2024 values are derived as `value_2025 / (1 + delta_pct/100)`." Copy this convention when documenting placeholder data.
- **First-person plural is rare.** The spec uses third-person facts ("The functionality contracts in Section 5 are not optional"). Avoid "we built" / "you'll love".
- **Numbers in figures, not words.** "8px rhythm", not "eight-pixel". "32 rows", not "thirty-two".
- **Lowercase casing for prose.** Title Case for section headers and brand strings ("Shopify Overview", "Last Update"). Sentence case for inline copy.
- **Currency symbol stays attached.** `£4.71M`, not `4.71M GBP` or `4.71 million pounds`.
- **Delta sign convention is part of the value.** `+9%` and `-2%`, not `9%` (up) and `2%` (down). The arrow is in addition, not instead.

Examples to match:

- KPI label: `Returning Customer Rate` (Title Case, short, no period)
- KPI delta: `+9%` then `Vs Last Year` (delta colored by direction, context in tertiary grey)
- Chart subtitle: `Jan 2024 - Oct 2025` (hyphen, not en-dash, not em-dash)
- Sidebar status: `Last Update | 14.10.25` (pipe separator, dd.mm.yy)

## VISUAL FOUNDATIONS

The visual language is restrained Tableau-style BI: white cards, hairline borders, almost-black ink, near-white canvas. Color is reserved for state (deltas, status dots) and chart accents. No gradients. No drop shadows. No skeumorphism.

### Colors

- **Ink:** near-black `#1f2937` (text primary, primary chart accent), grey `#6b7280` (secondary text, KPI labels), cool grey `#83899f` (tertiary, axis labels, subtitles).
- **Surfaces:** off-white canvas `#f9fafb`, white cards `#fefefe`, hairline borders `#e1e4e8`.
- **State color:** positive `#10b981` (emerald), negative `#800F2F` (deep wine, not red). Status dot `#2db463`.
- **Brand wordmark:** `#1d3557` (Yale blue placeholder). Swap per client.
- **Grid overlay:** translucent pink `rgba(220, 80, 90, 0.18)` for column bands, `rgba(220, 80, 90, 0.10)` for row stripes. Tableau-style overlay color, deliberately not aligned with the rest of the palette so it reads as a tool, not a design element.
- **Chart accent secondary:** `#D3D3D3` (light grey). Period-over-period comparison series uses this; primary series is the dark ink.
- **Annotation accent:** `#f59e0b` (amber). Used for peak/Max callouts in line charts only.

### Type

- **Open Sans** at 400 / 500 / 600. System fallback: `system-ui, sans-serif`.
- Scale: `12 / 14 / 16 / 18 / 24 / 32`. No 10, no 20.
- **Role mapping:** 32 = KPI value, 24 = page H1, 16 = page subtitle/body, 14 = card title, 12 = axis labels / KPI label / delta / subtitle / dim label.
- Font weight rarely above 600. KPI values use 600. Body and labels are 400. The 500 weight is used sparingly on value text inside charts.
- No italics. No all-caps.

### Spacing

- 8px rhythm. Every vertical position snaps to a multiple of 8.
- Tokens: `--space-1` through `--space-6` (8, 16, 24, 32, 40, 48).
- Component inner padding: 16 default, 24 for KPI cards (locked). The Tweaks Panel "padding" toggle flips non-KPI components between 16 and 24.

### Backgrounds

- Plain. Off-white canvas (`--canvas-bg`), no patterns, no textures, no images.
- Sidebar is white card surface against the off-white canvas, separated by a 1px right border.
- When the grid overlay toggle is on, the column area gets translucent pink column bands plus row stripes via stacked `repeating-linear-gradient`s, constrained to the area right of the sidebar. The header and sidebar are NOT covered.

### Borders, corners, shadow

- **Borders:** 1px solid `--card-border` (`#e1e4e8`) on every card and sidebar separator. No double borders. No accent borders.
- **Corner radius:** 8px on cards (`--radius-card`), 50% on the remove-x circle and status dot, 4px on dropdown chips and small overlays, 2px on chart bars.
- **Shadow:** none. The visual hierarchy is established by border + surface contrast, not elevation. `box-shadow: 0 0 0 1px var(--card-border)` is used on the canvas frame, but it's a hairline outline, not a real shadow.

### Animation

- Minimal. Grid overlay opacity transitions 120ms on toggle. Resize-handle opacity transitions on hover. Remove-handle opacity transitions 100ms.
- No bounce, no spring, no parallax, no scroll-linked animation.
- Default easing is the browser default (ease). Snap-to-grid is instantaneous (no animation; the position jumps).

### Hover and press states

- **Sidebar nav items:** active row gets `#f8f9fa` background and `font-weight: 600`. No hover treatment on inactive rows in the current demo (would be the same `#f8f9fa` if added).
- **Remove handle (x):** default opacity 0, transitions to 1 on `.component:hover`. On the button hover itself, background swaps to `--card-border` and color to `--text-primary`.
- **Resize handle:** default opacity 0.35, hover 0.7.
- **Buttons (Tweaks Panel "+ Add component"):** background swaps from `--card-bg` to `--canvas-bg` on hover. No scale, no shadow.
- **Editable text (title/subtitle):** focus state adds `background: var(--canvas-bg)` and `box-shadow: inset 0 0 0 1px var(--card-border)`. Click-to-edit, no separate "edit" mode.

### Transparency and blur

- Used only for the grid overlay (translucent pink). No frosted glass. No backdrop blur. No modals.
- Dim labels have a solid `--canvas-bg` background, not translucent.

### Imagery

- Tableau-style: no photography, no illustration. Icons only.
- If imagery is added later (e.g. product thumbnails in the ranked list), it should be muted, square, with a thin border, not full-bleed.

### Layout rules

- **Canvas is hard-locked at 1440 x 1024.** Do not respond to viewport size. The dashboard renders at native size and the user scrolls if the viewport is smaller.
- **Sidebar is fixed-width 240px.** Content area starts at left=264 (sidebar + 24 inset).
- **Header is 100px tall.** Content area starts at top=128 (next snap line below 100).
- **Snap step is 8px vertical, column-edge horizontal.** Every multiple of 8 is a valid snap target. Snap threshold is 8px.
- **Minimum gap between components is 24px.** Add Component drops new cards at `lowest_bottom + 24`, rounded up to the next multiple of 8.

### Iconography

See ICONOGRAPHY section below.

## ICONOGRAPHY

- **Primary icon set: Material Symbols Outlined.** Variable font, loaded from Google Fonts CDN. Axes pinned to `opsz=24, wght=300, FILL=0, GRAD=0` to match the Figma asset weight.
- Render via `<span class="material-symbols-outlined">grid_view</span>` with `font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24` on the span.
- **Locked icons in use:**
  - Sidebar nav: `grid_view`, `browse_activity`, `person`
  - Sidebar export: `picture_as_pdf`, `image`
  - KPI delta: `north_east` (up), `south_east` (down)
  - Header cluster: `info`, `settings` (LinkedIn and GitHub use external SVG because Material Symbols does not include brand logos)
- **Inline SVG icons** used where a generic outline is enough: the ranked-list row icon is a generic package outline (2px stroke, `currentColor`, no fill). Stored in `assets/icons/package.svg` for reuse.
- **No emoji.** Anywhere. Sidebar status uses a CSS pill (`<span class="sidebar-status-dot">`), not a green-circle emoji.
- **No unicode glyphs as icons** except the small dropdown caret `&#9662;` (▾) which is intentional and matches the demo. Arrows in copy use `&uarr;` / `&darr;` only inside delta lines.
- **Substitutions:** None required. Material Symbols and Open Sans are both Google-Fonts-CDN reachable.

## SKILL.md note

If this design system is downloaded and used as a Claude Code Agent Skill, `SKILL.md` is the entry point. See that file.
