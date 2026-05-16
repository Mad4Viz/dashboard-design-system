# Template

The working dashboard. Interactive: drag, resize, edit titles, remove components, persist across reload. Pixel-faithful Shopify Overview demo built on the design system at the repo root.

## Files

| File | Purpose |
|---|---|
| `index.html` | The dashboard. Drop-in canvas plus Tweaks Panel. Open this. |
| `dashboard.css` | Design tokens (`:root` block at the top) plus all component styles. Edit the tokens to re-skin. |
| `dashboard.js` | Drag, resize, snap, dims, padding, add, edit, remove, persistence. |
| `charts.js` | d3 v7 renderers for the four SVG chart components plus the HTML-only ranked list. Standalone versions live in `../reference/charts/`. |

## Components

Six types:

1. **KPI metric card.** Four instances populate the top row. `data-direction="up|down"` switches the arrow glyph and delta color.
2. **Sidebar shell.** Logo, status, Home group, Filters group, Export group.
3. **Grouped horizontal bar.** Profit By Product Category, 2024 vs 2025, d3 v7.
4. **Multi-line with annotation.** Profit Over Time, Max callout in amber.
5. **Combo bar plus line dual-axis.** Sessions and Conversion Rate, dual y-axes.
6. **Ranked horizontal bar with row icons.** Top 5 Products by Profit. HTML plus CSS plus JS, no d3.

## Tweaks Panel surfaces

Five:

| Surface | Default |
|---|---|
| Grid overlay toggle | off |
| Snap to grid toggle | on |
| Show all dimensions toggle | off |
| Padding toggle (16 / 24) | 16 (KPI locked at 24) |
| Add component button | n/a |

## Behaviour contracts

- **Inline editing.** Click any title or subtitle. Enter or Escape commits.
- **Removal.** Hover a component to reveal the (x) in the top-left.
- **Persistence.** `localStorage` key `raw_dashboard.v1`. Schema in `dashboard.js`. "(reset)" link in the Tweaks Panel clears it.

## How to extend

- Add a new chart type: drop the markup as `<div class="component chart-card" data-component-id="...">` inside the canvas, copy the chart code, give the SVG an id, call your renderer from `renderAllCharts()`.
- Re-skin: override CSS variables on the `.canvas` element (or `:root`). Per-chart accent: inline `style="--chart-accent: #..."` on the chart wrapper.
- Swap brand wordmark: change `--brand-text` and the text inside `.sidebar-logo`.
