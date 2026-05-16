# Dashboard Design System Spec

Stage 1 paste-into-Claude-Design input. Defines the tokens, layout, components, and Tweaks Panel functionalities for the RAW dashboard system. Paired with `functionality_demo.html` which is the working code reference for interactive functionality.

How to use: paste this file into Claude Design as the input for the Design System object. The demo file is the source of truth wherever this spec references behaviour.

Sources of truth:
- Brand tokens, palette, type scale: Figma OVM shell `Claude Input` 6342:276, Tableau workbook references, Shopify Overview (3).png, Marketing Spend Overview (2).png.
- Sidebar structure: Figma node 1184:696 in All-Tableau-Projects.
- Functionality contracts: `functionality_demo.html`.

CP1 locks revised during CP2 work:
- Row count: 100 to 32. 100 rows did not fit the locked 1024 canvas height. 32 cycles of 32px fit exactly.
- Row gutter: 20 to 24. Required for clean 8px baseline rhythm.
- Snap step: every 32 (row cycle) to every 8 (every multiple of 8 is a valid snap target).
- KPI default height: not previously locked, now 160. All four KPI slots in the top row use this height.
- Functionality 5.4 (per-chart colour via Tweaks Panel) dropped. Per-chart accents edited directly inside Claude Design on each chart wrapper. CSS variable `--chart-accent` still exists for per-chart overrides via inline style.

## Setup form values for Claude Design

When pasting this design system into Claude Design's "Set up your design system" form:

**Company name and blurb:**
RAW Analytics dashboard design system. Tableau-style data dashboards for analytics consultancy. Tokens, layout grid, six component types, four Tweaks Panel functionalities.

**Link code from your computer:**
Drag the `outputs/sandbox/` folder. Contains `functionality_demo.html`, the working implementation of every functionality described in Section 5.

**Any other notes (critical, do not skip):**

The functionality contracts in Section 5 are not optional. The Design System object must expose four Tweaks Panel surfaces:

1. Grid overlay toggle (on/off, default off)
2. Snap to grid toggle (on/off, default on, snap step 8px vertical and column-edge horizontal)
3. Show all dimensions toggle (on/off, default off)
4. Add component button (drops a 270x160 editable card below the lowest existing component, minimum 24px gap, snapped to next multiple of 8)

Every component must support:
- Inline editing of title and subtitle. Click to edit, Enter or Escape to commit. Saves automatically.
- Removal via hover-revealed x button in top-left. Removals persist across reload.
- Position and size persistence across reloads (localStorage).

Read `functionality_demo.html` as the source of truth for how each functionality behaves. The spec describes the system. The HTML proves it works. Do not skip the demo file.

Voice: terse, technical, specificity over puffery. No em-dashes, no AI-isms.

## Using this with the demo file

This spec and `functionality_demo.html` describe the same system. The spec prescribes (tokens, layout, components, Tweaks Panel surfaces). The HTML implements (working code for every functionality). When the two disagree, the HTML wins because it is tested.

## 1. Brand tokens

### 1.1 Palette

| Token | Value | Use |
|---|---|---|
| Primary text | `#1f2937` | Headings, KPI values |
| Secondary text | `#6b7280` | Card labels, body |
| Tertiary text | `#83899f` | Axis labels, subtitles, supporting |
| Canvas background | `#f9fafb` | Dashboard background, header bar |
| Card surface | `#fefefe` | Card and sidebar fill |
| Border / divider | `#e1e4e8` | Card borders, sidebar separator, grid lines |
| Positive delta | `#10b981` | Up-arrow delta text and icon |
| Negative delta | `#800F2F` | Down-arrow delta text and icon |
| Status indicator | `#2db463` | Sidebar "Last Update" dot |
| Active nav row | `#f8f9fa` | Sidebar selected item background |
| Brand text placeholder | `#1d3557` | RAW wordmark. Swap per client. |
| Grid overlay band | `rgba(220, 80, 90, 0.18)` | Column band fill in grid overlay |
| Grid overlay row | `rgba(220, 80, 90, 0.10)` | Row stripe fill in grid overlay |

### 1.2 Typography

- Font family: Open Sans. Fallback: system-ui, sans-serif.
- Icon family: Material Symbols Outlined (variable font, opsz=24, wght=300, FILL=0, GRAD=0). Loaded via Google Fonts CDN.
- Type scale: 12 / 14 / 16 / 18 / 24 / 32.

Role mapping:

| Size | Used by |
|---|---|
| 32 | KPI value (revised at CP3 from 18 to match Shopify reference visual weight) |
| 24 | Page title (e.g., "Shopify Overview") |
| 18 | Reserved (formerly KPI value; moved to 32 at CP3) |
| 16 | Page subtitle, body |
| 14 | Card title, chart title, sidebar Home section label, KPI label |
| 12 | Axis labels, delta text, sidebar nav rows, sidebar Filters/Export labels, subtitles, dim labels |

### 1.3 Spacing (8px rhythm)

All vertical spacing values are multiples of 8.

| Token | Value |
|---|---|
| `--space-1` | 8 |
| `--space-2` | 16 |
| `--space-3` | 24 |
| `--space-4` | 32 |
| `--space-5` | 40 |
| `--space-6` | 48 |

### 1.4 Geometry

- Card corner radius: 8px.
- Card border width: 1px.
- Default component inner padding: 16px.
- Sidebar inner padding: 24px vertical, 16px horizontal.

### 1.5 Iconography

Material Symbols Outlined via Google Fonts CDN.

Import in `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" />
```

Sidebar icon set:

| Nav item | Material Symbol |
|---|---|
| Shopify Overview | `grid_view` |
| Social Media | `browse_activity` |
| Customer Analysis | `person` |
| PDF (export) | `picture_as_pdf` |
| Image (export) | `image` |

Header icon cluster (top-right, 4x 24px with 25px gaps at x=1245 y=28): `info`, LinkedIn SVG, GitHub SVG, `settings`. Material Symbols does not include brand logos, so LinkedIn and GitHub stay as external SVG.

## 2. Dashboard layout

### 2.1 Canvas

- Width: 1440px (hard locked).
- Height: 1024px (hard locked).
- Background: `--canvas-bg` (#f9fafb).

### 2.2 Header

- Full width, height 100px, background `--canvas-bg`.
- Contents: page title (24px) plus subtitle (16px) at left; icon cluster at right.

### 2.3 Sidebar

- Width: 240px.
- Height: 100% (1024px).
- Background: `--card-bg` (#fefefe).
- Right border: 1px solid `--card-border`.
- Padding: 24px vertical, 16px horizontal.
- Section order top to bottom: logo (centered horizontally), status row, Navigation group, Filters group, Export group.
- Structure matches Figma node 1184:696.

### 2.4 Column grid

- 12 columns, each 74px wide.
- Gutter: 24px.
- Left offset: 264 (sidebar 240 + 24 inset).
- Right margin: 24.
- Math: 240 + 24 + 12 x 74 + 11 x 24 + 24 = 1440.

### 2.5 Row grid (revised from CP1)

- 32 rows of 8 tall.
- Gutter: 24px.
- Top offset: 0.
- Row cycle: 32 (8 row + 24 gutter).
- Math: 32 x 32 = 1024.

### 2.6 Vertical rhythm

- Snap step: 8px (every multiple of 8 is a valid snap target).
- Visual grid overlay shows the 8 row + 24 gutter pattern (column bands + row stripes). Snap is independent of the overlay and finer than what is visible.
- Minimum gap between components: 24px rule. Add Component drops new cards at `lowest_bottom + 24`, rounded up to the next multiple of 8.

## 3. Pain-to-functionality map

| ID | Pain | Owner | Success criterion |
|---|---|---|---|
| P1 | Mocking realistic charts in Figma is slow | Stage 2 chart code (CP3) | Pasting one chart's code into Claude Design renders a working chart that reads brand tokens |
| P2 | No "show all dimensions at once" toggle in Figma | Functionality 5.3 | Toggling on overlays a W x H label on every component without selecting them |
| P3 | Never built a real design system, just copy-paste | The Design System object itself plus 5.1 + 5.2 as discipline tools | Brand tokens, type scale, grid, components, padding rules all live in one object; duplicating preserves all of them |
| P4 | Inspiration from other dashboards does not translate | Lift-and-shift duplicate-and-swap loop (CP5) + per-chart direct edit inside Claude Design | Duplicating the Design System and swapping accent + type re-skins the dashboard without rebuilding charts |
| F1 | Can a Figma grid transfer into Claude Design and keep white space consistent? | Section 2 layout grid + 5.1 + 5.2 | Column grid math holds; grid overlay visible; components snap; white-space rhythm at 8px |

## 4. Component definitions

All components share the editable-card pattern (title + subtitle, click to edit). Standard inner padding is 16px unless noted.

### 4.1 KPI metric card

Used for top-row metrics. Reference: Profit, Revenue, Orders Fulfilled, Returning Customer Rate.

- Default size: 270 x 160. Spans 3 columns x 5 row cycles.
- Padding: 24px all sides (revised at CP3 from 16 to give the 32px value room).
- Border: 1px solid `--card-border`, radius 8px.
- Background: `--card-bg`.

Slots:
- `{label}`: 14px, `--text-secondary`.
- `{value}`: 32px, `--text-primary`, semibold. Vertically centred via `margin: auto 0` (revised at CP3 from 18px).
- `{delta_direction}`: up or down arrow icon. Material Symbols `north_east` for up, `south_east` for down (locked at CP3).
- `{delta_value}`: 12px text with explicit sign prefix. `+9%` for positive direction, `-2%` for negative direction (locked at CP3). Colour follows direction.
- `{delta_context}`: 12px, `--text-tertiary`, e.g., "Vs Last Year".

Delta colour: `--positive-delta` if up, `--negative-delta` if down.

### 4.2 Sidebar

Matches Figma node 1184:696. See Section 2.3 for container.

Slots:
- `{logo}`: text or image at top, centered horizontally.
- `{status}`: `{dot, label, value}`. Green dot plus "Last Update | <date>". 12px, `--text-tertiary`.
- `{nav_items[]}`: array of `{icon, label, active_state}`. Icons 24px Material Symbols. Labels 12px. Row height 44px, horizontal padding 12px. Active row: bg `#f8f9fa`, font-weight 600.
- `{filter_controls[]}`: array of `{label, dropdown}`. Label 12px `--text-tertiary`. Dropdown 24px tall, 1px `#c4c4c4` border, white bg.
- `{export_items[]}`: same row treatment as nav_items.

### 4.3 Grouped horizontal bar

Used for Profit By Product Category.

- Padding: 16px.
- Default size: TBD at CP3.

Slots:
- `{title}` 14px (editable). `{subtitle}` 12px `--text-tertiary` (editable).
- `{legend[]}`: array of `{series_name, swatch_colour}`, top-right.
- `{data[]}`: array of `{category_label, value_a, value_b, delta_pct}`.
- `{value_formatter}` e.g. "£2.23M". `{delta_formatter}` e.g. "+9%".

Bar colours: `--chart-accent` primary, `--chart-accent-secondary` secondary.

### 4.4 Multi-line with annotation

Used for Profit Over Time. Demo example: "Profit Over Time | Protein", subtitle "Jan 2024 - Oct 2025".

- Padding: 16px.
- Default size in demo: 564 x 192 (6 columns x 6 row cycles).

Slots:
- `{title}` 14px (editable). `{subtitle}` 12px `--text-tertiary` (editable).
- `{legend[]}`: series + annotation marker.
- `{data[]}`: time-series.
- `{annotation}`: `{x_value, y_value, label}` e.g., `{2024-03, 317360, "Max: £317.36K"}`.
- `{axis_format_x}`, `{axis_format_y}`.

Line colours: `--chart-accent`, `--chart-accent-secondary`. Annotation marker colour TBD at CP3 (reference amber).

### 4.5 Combo bar + line dual-axis

Used for Sessions and Conversion Rate.

- Padding: 16px.

Slots:
- `{title}` 14px (editable). `{subtitle}` 12px (editable).
- `{bar_data[]}`, `{line_data[]}`.
- `{axis_left_label}`, `{axis_right_label}`.
- `{axis_format_left}`, `{axis_format_right}`.
- `{point_labels[]}`: line point values shown above points.

### 4.6 Ranked horizontal bar with row icons

Used for Top 5 Products | Profit.

- Padding: 16px.
- Row vertical spacing: 16px.

Slots:
- `{title}` 14px (editable). `{subtitle}` 12px (editable).
- `{rank_filter_label}` e.g., "Toggle Top/Bottom 5".
- `{metric_filter_label}` e.g., "Select a Metric".
- `{data[]}`: array of `{rank, icon, product_name, category, value}`.
- `{value_formatter}` e.g., "£797.72K".

Row layout left to right: rank, icon (16x16), name block (product name + category in 2 lines), bar, value text.

### 4.7 Editable card pattern (system-wide)

Every component with title and/or subtitle follows this pattern. Reference implementation: `makeEditable(field)` in `functionality_demo.html`.

- Title: 14px, `--text-primary`. Click to edit.
- Subtitle: 12px, `--text-tertiary`. Click to edit.
- Press Enter or click outside to commit. Escape also commits.
- Mousedown stops propagation so drag does not start during edit.
- On blur, edits save to localStorage automatically.

## 5. Functionality contracts

The demo file is the source of truth for HTML/CSS/JS contracts. This section names each functionality and where to read it.

### 5.1 Grid overlay (Pain P3, F1)

Tweaks Panel control: toggle (on/off). Default off.

Visual: shaded column bands (pink, 74 wide) plus row stripes (pink, 8 tall) with transparent 24px gutters between. Implementation uses repeating-linear-gradient on a constrained inner div positioned over the column area.

DOM contract:
- `<div class="canvas" data-grid-visible="true|false">`
- `.grid-overlay` z-index 10, pointer-events none.
- CSS transitions opacity on `data-grid-visible` change.

### 5.2 Snap to grid (Pain P3, F1)

Tweaks Panel control: toggle (on/off). Default on.

Vertical: every multiple of 8 is a snap target. Snap if within 8px threshold.
Horizontal: snap to column-left positions (drag) or column-edges (resize) in `columnLeftPositions()` / `allColumnEdges()` lists.

Applies to drag (top, left edges) and resize (bottom, right edges).

Functions in demo: `ySnapPositions()`, `columnLeftPositions()`, `columnRightPositions()`, `allColumnEdges()`, `snapToNearest()`.

### 5.3 Show all dimensions (Pain P2)

Tweaks Panel control: toggle (on/off). Default off.

DOM contract:
- `<div class="canvas" data-dims-visible-all="true|false">`
- Each `.component` has `<span class="dim-label">W x H</span>`.
- CSS reveals the label when component `data-dims-visible="true"`.
- JS updates label content live on drag and resize.

### 5.4 Add component (post-plan addition)

Tweaks Panel control: button "+ Add component". No state.

Behaviour:
- Creates a new editable card.
- Default size: 270 x 160 (matches KPI proportions).
- Position: below the lowest existing component, plus 24px gap, rounded up to the next multiple of 8.
- Title auto-numbered: "Component 1", "Component 2", continues from highest existing N.
- Default subtitle: "Subtitle".
- Each new component has editable title and subtitle, hover-revealed x remove button, standard drag and resize.

Function in demo: `addComponent()` calling `createExtraComponent(id, title, subtitle)`.

### 5.5 Inline editing (post-plan addition)

Applies to any element with class `card-title`, `card-subtitle`, `chart-title`, or `chart-subtitle`.

- `contenteditable="true"`.
- Click to focus, type to edit.
- Enter or Escape blurs (commits).
- Mousedown stops propagation so drag does not start.
- On blur, `saveState()` runs.

Function in demo: `makeEditable(field)`. Idempotent (will not double-wire).

### 5.6 Component removal (post-plan addition)

Every component has a hover-revealed x button (top-left, 20x20, white bg with light border).

- Default opacity 0, transitions to 1 on `.component:hover` or `.remove-handle:focus`.
- Click to remove.
- For added extras: removal is immediate, gone unless Reset.
- For baselines: removal tracked in `state.removed`, persists across reload.

Function in demo: `addRemoveButton(el)`. Baseline IDs in `BASELINE_IDS` constant.

### 5.7 Persistence model (localStorage)

Key: `functionality_demo.v1`.

Schema:

```json
{
  "toggles": {
    "grid": "true|false",
    "snap": "true|false",
    "dims": "true|false"
  },
  "components": {
    "<id>": {
      "left": "<px>",
      "top": "<px>",
      "width": "<px>",
      "height": "<px>",
      "title": "<text>",
      "subtitle": "<text>"
    }
  },
  "extras": [
    {"id": "extra-<timestamp>", "title": "<text>", "subtitle": "<text>"}
  ],
  "removed": ["<baseline-id>", "..."]
}
```

Save triggers: every toggle change, every mouseup (covers drag and resize end), every editable blur. Load triggers: page load via `loadState()`.

Reset link in Tweaks Panel clears the key and reloads.

### 5.8 Padding toggle (CP3 addition)

Tweaks Panel control: toggle. Default 16 (off). When on, switches to 24.

When off, non-KPI components use 16px padding (default). When on, non-KPI components use 24px padding. KPI cards are always 24px regardless (CP3 lock, Section 4.1).

DOM contract:
- `<div class="canvas" data-padding="16|24">`.
- CSS rule: `.canvas[data-padding="24"] .chart-placeholder, .canvas[data-padding="24"] .extra-card, .canvas[data-padding="24"] .placeholder { padding: var(--space-3); }`.
- Persisted in `state.toggles.padding` (localStorage). Restored on page load with a string-typed apply (values are '16' or '24', not 'true' or 'false').

Function wiring in `functionality_demo.html`: `document.getElementById('toggle-padding').addEventListener('change', ...)`.

## 6. Tweaks Panel mapping summary

| Functionality | Control | State space | Default | Scope |
|---|---|---|---|---|
| 5.1 Grid overlay | Toggle | on / off | off | Canvas |
| 5.2 Snap to grid | Toggle | on / off | on | Canvas |
| 5.3 Show all dimensions | Toggle | on / off | off | Canvas (renders per-component label) |
| 5.4 Add component | Button | n/a | n/a | Canvas |
| 5.8 Padding toggle | Toggle | 16 / 24 | 16 | Non-KPI components (CP3 addition). KPI locked at 24. |

5.5 inline editing, 5.6 removal, and 5.7 persistence are not Tweaks Panel surfaces. They live on the components directly.

## 7. CSS variable contract

Names are fixed so chart code at CP3 is portable. Override per-chart via inline style on the chart wrapper.

### Required starting set (locked at CP2 brief)

| Variable | Default | Purpose |
|---|---|---|
| `--chart-accent` | `#1f2937` | Primary chart series colour. Overridable per chart. |
| `--axis-colour` | `#83899f` | Axis line and tick colour. |
| `--label-font` | Open Sans | Chart label font family. |
| `--positive-delta` | `#10b981` | Positive delta colour. |
| `--negative-delta` | `#800F2F` | Negative delta colour. |

### Palette extensions

| Variable | Default |
|---|---|
| `--canvas-bg` | `#f9fafb` |
| `--card-bg` | `#fefefe` |
| `--card-border` | `#e1e4e8` |
| `--text-primary` | `#1f2937` |
| `--text-secondary` | `#6b7280` |
| `--text-tertiary` | `#83899f` |
| `--grid-band-colour` | `rgba(220, 80, 90, 0.18)` |
| `--grid-row-colour` | `rgba(220, 80, 90, 0.10)` |
| `--chart-accent-secondary` | `#D3D3D3` (locked at CP3; revised from CP2's #d0d5dd) |
| `--annotation-accent` | `#f59e0b` (locked at CP3; amber, used in Chart 4.4 Max callout) |

### Type

| Variable | Default |
|---|---|
| `--font-family` | Open Sans |
| `--size-xs` | 12px |
| `--size-sm` | 14px |
| `--size-base` | 16px |
| `--size-kpi` | 32px (revised at CP3 from 18) |
| `--size-h1` | 24px |
| `--size-display` | 32px |

### Spacing (8px rhythm)

| Variable | Default |
|---|---|
| `--space-1` | 8px |
| `--space-2` | 16px |
| `--space-3` | 24px |
| `--space-4` | 32px |
| `--space-5` | 40px |
| `--space-6` | 48px |

### Geometry

| Variable | Default |
|---|---|
| `--radius-card` | 8px |
| `--card-border-width` | 1px |

### Layout

| Variable | Default |
|---|---|
| `--canvas-width` | 1440px |
| `--canvas-height` | 1024px |
| `--sidebar-width` | 240px |
| `--header-height` | 100px |
| `--col-count` | 12 |
| `--col-width` | 74px |
| `--col-gutter` | 24px |
| `--row-height` | 8px |
| `--row-gutter` | 24px |
| `--snap-threshold` | 8px |

## 8. Implementation reference

`functionality_demo.html` is the source of truth for interactive behaviour. Open it for:
- Working examples of all six functionalities (5.1 through 5.7).
- HTML/CSS/JS contracts for each.
- Live layout math verification in the values panel.
- localStorage schema in action.

This spec describes the system. The demo proves it works.

## 9. Open items (status after CP3)

Closed at CP3:
- `--chart-accent-secondary`: locked at `#D3D3D3`. Closes the derivation rule question.
- `--annotation-accent`: locked at `#f59e0b` (amber). Closes the Max callout colour question.
- Default sizes for chart components 4.3, 4.5, 4.6: locked at 564 x 240 (uniform with 4.4).

Still deferred:
- Configurable minimum-gap input (deferred from CP2).
- Tableau-style verdict callout from Marketing Spend Overview (out of v1 scope, may surface later).

Pending CP3 task #5 (padding toggle in functionality_demo.html):
- Tweaks Panel needs a fifth surface for padding (binary global 16 / 24). Sections 5 and 6 of this spec will be updated when the toggle is implemented.
