---
name: raw-analytics-design
description: Use this skill to generate well-branded interfaces and assets for RAW Analytics, a Tableau-style BI dashboard system. Contains essential design guidelines, colors, type, fonts, assets, and a working UI kit for analytics-dashboard prototyping. Pulls every token, chart, and Tweaks-Panel behaviour from the source spec.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files. The system has four layers:

1. **Token contract** in `colors_and_type.css` — palette, type, spacing, geometry, layout. Drop into any artifact.
2. **Six component types** documented in `reference/design_system_spec.md` Section 4. Implemented in `ui_kits/dashboard/`.
3. **Five Tweaks Panel surfaces** in `reference/design_system_spec.md` Section 6. Wired in `ui_kits/dashboard/dashboard.js`.
4. **Source-of-truth demo** at `reference/functionality_demo.html`. Wherever the spec and the demo disagree, the demo wins.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. Lift the chart code from `reference/charts/*.html` verbatim rather than regenerating. If working on production code, you can copy assets and read the rules to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask some questions (target audience, which component types, mock data shape, whether to re-skin via `--chart-accent` override), and act as an expert designer who outputs HTML artifacts or production code as needed.

Voice: terse, technical, specificity over puffery. No em-dashes. No emoji. No AI-isms.
