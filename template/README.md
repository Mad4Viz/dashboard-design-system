# Template — RAW Analytics Dashboard

Pixel-faithful Shopify Overview dashboard. Interactive: drag, resize, edit titles, remove components, persist across reload. Drop-in canvas built on the design system at the repo root.

## Files

| File | Purpose |
|---|---|
| `index.html` | The dashboard. Drop-in canvas + Tweaks Panel. Open this. |
| `dashboard.css` | Token contract + all component styles. Mirrors Section 7 of the spec at `../reference/design_system_spec.md`. |
| `dashboard.js` | Drag, resize, snap, dims, padding, add, edit, remove, persistence. Lifted from `../reference/functionality_demo.html` (the source of truth). |
| `charts.js` | d3 v7 renderers for the four chart components plus the HTML-only ranked list. Lifted verbatim from `../reference/charts/*.html`. |

## Components covered

All six per `design_system_spec.md` Section 4:

1. **KPI metric card (4.1)** — four instances populate the top row. `data-direction="up|down"` switches the arrow glyph and delta color.
2. **Sidebar shell (4.2)** — logo, status, Home group, Filters group, Export group. Structure mirrors Figma node `1184:696`.
3. **Grouped horizontal bar (4.3)** — Profit By Product Category, 2024 vs 2025, d3 v7.
4. **Multi-line with annotation (4.4)** — Profit Over Time | Protein, Max callout in amber.
5. **Combo bar + line dual-axis (4.5)** — Sessions and Conversion Rate, dual y-axes.
6. **Ranked horizontal bar with row icons (4.6)** — Top 5 Products | Profit. HTML+CSS+JS, no d3.

## Tweaks Panel surfaces

All five per spec Section 6:

| ID | Surface | Default |
|---|---|---|
| 5.1 | Grid overlay toggle | off |
| 5.2 | Snap to grid toggle | on |
| 5.3 | Show all dimensions toggle | off |
| 5.8 | Padding toggle (16 / 24) | 16 (KPI locked at 24) |
| 5.4 | Add component button | n/a |

## Behaviour contracts (5.5 / 5.6 / 5.7)

- **Inline editing:** click any title or subtitle. Enter or Escape commits.
- **Removal:** hover a component to reveal the (x) in the top-left.
- **Persistence:** `localStorage` key `raw_dashboard.v1`. Schema in `dashboard.js`. "(reset)" link in the Tweaks Panel clears it.

## How to extend

- Add a new chart type: drop the markup as `<div class="component chart-card" data-component-id="...">` inside the canvas, copy the chart code, give the SVG an id, call your renderer from `renderAllCharts()`.
- Re-skin: override CSS variables on the `.canvas` element (or `:root`). Per-chart accent: inline `style="--chart-accent: #..."` on the chart wrapper.
- Swap brand wordmark: change `--brand-text` and the text inside `.sidebar-logo`.
