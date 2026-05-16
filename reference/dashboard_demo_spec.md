# Dashboard Demo Spec

Stage 2 paste-into-Claude-Design input. Defines the layout, data, and chart code references for the Shopify Overview demo built on top of the RAW Analytics Design System.

Pair with `design_system_spec.md` (Stage 1) and `functionality_demo.html` (functionality contracts). Source of truth for chart code is the five HTML files in `outputs/charts/`.

## How to use

Steps in order:

1. Paste `design_system_spec.md` into Claude Design. Creates the Design System object.
2. Paste this spec into Claude Design on top of the Design System. Creates the dashboard view.
3. Drag the `outputs/charts/` folder into Claude Design. Provides the five chart code files.
4. Place each component at the slot defined in Section 4 below.
5. Iterate via Tweaks Panel and direct edits, not re-prompts.

## 1. Setup form values for Claude Design

When pasting this dashboard demo into Claude Design's "Set up your design system" form:

**Company name and blurb:**

RAW Analytics Shopify Overview dashboard. Recreation of the Shopify Overview reference image, built on the RAW Analytics Design System. Four KPI cards across the top, four chart components in a 2x2 grid below.

**Link code from your computer:**

Drag the `outputs/charts/` folder. Contains five HTML files, one per chart type. Each file is the source of truth for that chart's code.

**Any other notes (critical, do not skip):**

The five chart files in `outputs/charts/` are the only source of truth for chart code. Do not let Claude Design regenerate charts. Use the files as drop-in components.

Every chart must live inside a `<div class="component chart-card">` wrapper. `.component` provides position, drag, resize, dim label, and remove behaviour from the Design System. `.chart-card` adds 16px padding and flex column layout.

KPI cards are the exception. They use `<div class="component kpi-card">`. `.kpi-card` adds 24px padding (locked at CP3, see Section 8).

d3 v7 must be loaded once in the canvas head. Use `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`. Loaded from cdnjs because the Cowork inline preview iframe blocks some external CDNs; cdnjs is the most widely allowed.

Read `functionality_demo.html` for HTML/CSS/JS contracts on drag, resize, edit, remove, and persistence.

Voice: terse, technical, specificity over puffery. No em-dashes, no AI-isms.

## 2. Library directive

Chart code uses d3 v7 where the chart is a true plot. Two of the five chart types are HTML+CSS only.

| Chart | Component type | Library | Reason |
|---|---|---|---|
| KPI metric card | 4.1 | None (HTML+CSS) | Pure layout, no plotting |
| Grouped horizontal bar | 4.3 | d3 v7 | Bars, scales, axes |
| Multi-line with annotation | 4.4 | d3 v7 | Time scale, line generator, callout |
| Combo bar + line dual-axis | 4.5 | d3 v7 | Two y-axes, bar + line composition |
| Ranked horizontal bar with row icons | 4.6 | None (HTML+CSS+JS) | Row layout (icon + name + subtitle + bar + value) is more natural as an HTML grid than as an SVG composition |

CSS variable contract: every chart reads variables from `design_system_spec.md` Section 7. No hardcoded colours, fonts, or sizes in chart code.

## 3. SVG sizing convention (Cowork preview fix)

Every SVG-based chart sets explicit `width` and `height` HTML attributes on the SVG element in addition to `viewBox`. CSS uses explicit pixel height plus `min-height: 0` on `.chart-svg`. This was discovered at CP3: the Cowork inline preview iframe needs explicit pixel dimensions on the SVG, otherwise the SVG element collapses and the d3 content renders into invisible space.

Pattern (Chart 2 example):

```html
<svg id="chart2-svg" class="chart-svg" width="532" height="172" viewBox="0 0 532 160" preserveAspectRatio="xMidYMid meet"></svg>
```

```css
.chart-svg {
  display: block;
  width: 100%;
  height: 172px;     /* card 240 - padding 32 - header 36 = 172 */
  min-height: 0;
}
```

## 4. Layout slot assignments

Eight component slots in the demo. Coordinates use the column-row grid from `design_system_spec.md` Section 2.4 and 2.5.

| Component | left | top | width | height |
|---|---|---|---|---|
| KPI: Profit | 264 | 128 | 270 | 160 |
| KPI: Revenue | 558 | 128 | 270 | 160 |
| KPI: Orders Fulfilled | 852 | 128 | 270 | 160 |
| KPI: Returning Customer Rate | 1146 | 128 | 270 | 160 |
| Grouped horizontal bar (4.3) | 264 | 312 | 564 | 240 |
| Multi-line with annotation (4.4) | 852 | 312 | 564 | 240 |
| Combo bar + line dual-axis (4.5) | 264 | 576 | 564 | 240 |
| Ranked horizontal bar (4.6) | 852 | 576 | 564 | 240 |

### Math verification

KPI row horizontal: 264 + 270 + 24 = 558 (start of KPI 2). 558 + 270 + 24 = 852 (start of KPI 3). 852 + 270 + 24 = 1146 (start of KPI 4). 1146 + 270 + 24 = 1440 (canvas right edge). OK.

Chart row horizontal: 264 + 564 + 24 = 852 (start of right chart). 852 + 564 + 24 = 1440 (canvas right edge). OK.

Vertical: header 100 + 24 inset to reach the next snap line at 128 (top of KPI row). 128 + 160 + 24 = 312 (top of chart row 1). 312 + 240 + 24 = 576 (top of chart row 2). 576 + 240 = 816 (bottom of chart row 2; 208px clearance to canvas bottom 1024). OK.

All values snap to multiples of 8 per the snap rule in `design_system_spec.md` Section 2.6.

## 5. Mock data blocks

Below are the demo data values that each chart file already contains. Reproduced here so the values can be reviewed and swapped without opening the chart files.

### 5.1 KPI metric cards (4 instances)

Verbatim from Shopify Overview (3).png:

| Card | label | value | delta_direction | delta_value | delta_context |
|---|---|---|---|---|---|
| 1 | Profit | £4.71M | up | +9% | Vs Last Year |
| 2 | Revenue | £8.20M | up | +15% | Vs Last Year |
| 3 | Orders Fulfilled | 94K | up | +23% | Vs Last Year |
| 4 | Returning Customer Rate | 66% | down | -2% | Vs Last Year |

Sign prefix `+` on positive deltas and `-` on negative deltas is part of the slot value (CP3 lock). Arrow icon is `north_east` for up and `south_east` for down (Material Symbols).

### 5.2 Grouped horizontal bar (4.3)

Title: `Profit By Product Category`. Subtitle: `2024 Vs 2025`.

Legend: `2025` (primary swatch), `2024` (secondary swatch).

| category | value_2025 | value_2024 | delta_pct |
|---|---|---|---|
| Protein | £2.23M | £2.05M | +9% |
| Pre-Workout | £1.63M | £1.50M | +9% |
| Endurance | £0.55M | £0.51M | +8% |
| Recovery | £0.29M | £0.26M | +11% |

Honesty note: 2025 values and delta % are verbatim from the reference. 2024 values are derived as `value_2025 / (1 + delta_pct/100)` because the reference doesn't print 2024 figures. Swap in real 2024 numbers when available.

### 5.3 Multi-line with annotation (4.4)

Title: `Profit Over Time | Protein`. Subtitle: `Jan 2024 - Oct 2025`.

Legend: `Highlighted Category` (line swatch), `Max Value` (amber dot).

Series: Protein (primary), Endurance (secondary).

Annotation: `Max: £317.36K` at March 2024.

Honesty note: monthly values are visual approximations of the line shapes in the reference. Only the Max value (£317.36K at March 2024) is exact, from the user prompt. See `outputs/charts/multi_line_annotation.html` for the full 22-month data arrays for both series. Swap in real monthly values when available.

### 5.4 Combo bar + line dual-axis (4.5)

Title: `No. of Sessions and Conversion Rate`. Subtitle: `2025`.

Left y-axis: `Number of Sessions`. Ticks at 0, 200K, 400K.

Right y-axis: `Conversion Rate`. Ticks at 0%, 15%, 30%.

| platform | sessions | rate |
|---|---|---|
| Instagram | 400,000 | 22% |
| TikTok | 230,000 | 15% |
| Facebook | 110,000 | 11% |

Honesty note: conversion rates (22, 15, 11) are exact from the user prompt and printed on the reference. Session counts are visual estimates because the reference doesn't print specific session counts, only bar heights. Swap in real session counts when available.

### 5.5 Ranked horizontal bar (4.6)

Title: `Top 5 Products | Profit`. Subtitle: `2025`.

Filter labels (top-right of card, two stacked info blocks):
- `Toggle Top/Bottom 5` -> `Top 5`
- `Select a Metric` -> `Profit`

| rank | name | subtitle | value |
|---|---|---|---|
| 1 | Protein \| Milk & Cookies | Brand Range | £797.72K |
| 2 | Protein \| Red Velvet | Brand Range | £656.92K |
| 3 | Pre-Workout \| South Beach Slush | Brand Range | £261.50K |
| 4 | Pre-Workout \| Cherry Berry | Brand Range | £220.56K |
| 5 | Pre-Workout \| 6PEAT | Brand Range | £213.14K |

Honesty note: names and values are exact from the user prompt. Subtitles are `Brand Range` placeholders because the reference shows a sub-line under each name that isn't readable at image resolution. Swap in real subtitles when available.

Row icon is a generic package outline (inline SVG). Reference shows product-specific icons that aren't clear enough to copy. Easy to swap to Material Symbols `inventory_2` or per-product icons later.

## 6. Chart code file references

All five chart files live in `outputs/charts/`. Each is a standalone HTML file you can open in a browser to test the chart in isolation. To drop into Claude Design, copy the relevant markup and script block into a `.component` wrapper on the canvas.

| File | Component type | Size | d3? |
|---|---|---|---|
| `kpi_card.html` | 4.1 KPI metric card | 270x160 | No |
| `grouped_horizontal_bar.html` | 4.3 Grouped horizontal bar | 564x240 | Yes |
| `multi_line_annotation.html` | 4.4 Multi-line with annotation | 564x240 | Yes |
| `combo_dual_axis.html` | 4.5 Combo bar + line dual-axis | 564x240 | Yes |
| `ranked_horizontal_bar.html` | 4.6 Ranked horizontal bar with row icons | 564x240 | No |

Each file uses CSS variables defined in `design_system_spec.md` Section 7. When the spec is updated (per Section 8 below), the files inherit automatically.

The KPI card file shows all four instances (Profit, Revenue, Orders Fulfilled, Returning Customer Rate) in one HTML page so the layout proves in isolation.

## 7. How to use with design_system_spec.md and functionality_demo.html

Three files, three roles:

1. `design_system_spec.md` defines tokens, layout, components, and Tweaks Panel surfaces. Paste into Claude Design first. Creates the Design System object.
2. `functionality_demo.html` proves the four Tweaks Panel functionalities work in real HTML/CSS/JS. Open in a browser to test drag, resize, edit, remove, and persistence. Source of truth for HTML/CSS/JS behaviour contracts.
3. `dashboard_demo_spec.md` (this file) plus the five chart files in `outputs/charts/` produce the Shopify Overview view on top of the Design System.

When the three disagree: `functionality_demo.html` wins on interactive behaviour, the spec wins on tokens and layout, this file wins on demo-specific data and slot assignments.

## 8. CP3 decisions baked into this spec

Locked during CP3:

- **Library**: d3 v7 from cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`). Switched from jsdelivr at CP3 after the Cowork inline preview blocked jsdelivr in a local file context.
- **`--annotation-accent`**: `#f59e0b` (amber, used for the Max callout marker in Chart 4.4).
- **`--chart-accent-secondary`**: `#D3D3D3` (revised from `#d0d5dd` at CP2). Affects: 2024 bars in 4.3, Endurance line in 4.4, bars in 4.5, bars in 4.6.
- **Uniform chart-component size**: 564 width by 240 height for all four chart-bearing components (4.3, 4.4, 4.5, 4.6).
- **KPI value size**: 32px (revised from 18px in CP2 spec Section 1.2 Type role map).
- **KPI padding**: 24px (revised from 16px in CP2 spec Section 4.1).
- **Delta sign convention**: `+` for positive, `-` for negative, prefixed to the percentage value. Combined with the arrow icon (`north_east` for up, `south_east` for down).
- **Chart 5 (ranked horizontal bar)** uses HTML+CSS+JS, not d3. Departs from the original CP3 plan ("all chart-bearing components use d3 v7") because the row layout is more natural as an HTML grid.
- **SVG sizing convention**: explicit `width` and `height` HTML attributes on the SVG element plus `min-height: 0` in CSS. Discovered when the Cowork inline preview rendered chart files blank.

Updates to apply in `design_system_spec.md` (deferred to Task 7 in CP3 task list):

- Section 1.2 Type role map: KPI value `18` -> `32`.
- Section 4.1: KPI padding `16` -> `24`. Add delta sign prefix convention.
- Section 7: update `--chart-accent-secondary` default to `#D3D3D3`. Add `--annotation-accent` at `#f59e0b`.
- Section 9 (open items for CP3): close all three (annotation accent, secondary accent rule, default chart sizes).
