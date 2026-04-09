# Design Brief

## Purpose & Tone
Professional operations dashboard for solar energy company. Precision-focused, utilitarian, confidence-assured. Data density prioritized over decoration.

## Differentiation
Compact status badge system (4-state: OPEN/blue, ONGOING/amber, CLOSED/green, REJECT/red). Summary stat cards with icon + metric. Side drawer detail view. Minimal shadows, tight 6px border radius.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Purpose |
|-------|-----------|-----------|---------|
| Primary | 0.35 0.1 260 | 0.72 0.14 260 | Deep navy — trust, professionalism |
| Accent | 0.6 0.19 39 | 0.68 0.22 39 | Warm orange — solar energy, action, pending amounts |
| Success | 0.55 0.18 130 | 0.62 0.22 130 | Forest green — project completion |
| Warning | 0.65 0.25 252 | 0.68 0.28 252 | Warm amber — ONGOING status |
| Destructive | 0.55 0.22 25 | 0.65 0.19 22 | Red — REJECT status |
| Neutral | 0.98 0 0 | 0.12 0 0 | Light/dark backgrounds |

## Typography
**Display**: GeneralSans (headers, table titles) — space-efficient, clear hierarchy. **Body**: DM Sans (data labels, descriptions) — professional, high scan-ability. **Mono**: System monospace (numeric values if needed).

## Structural Zones
1. **Header**: Navy bg (primary), logo + title, compact spacing
2. **Stat Cards**: White/light bg, 4 cards in row showing OPEN/ONGOING/CLOSED/REJECT counts, icon + number + label
3. **Table**: Alternating subtle grey rows (muted/40), 7 columns max, compact 40px row height
4. **Side Drawer**: Right-edge overlay, elevated card bg, full project details, action buttons

## Shape Language
Border radius: 6px (cards, badges, inputs) | 3px (tight elements) | 12px (drawer). No rounded pills except status badges. Minimal shadows (sm only on cards).

## Spacing & Rhythm
Base unit 4px. Compact density: 8px gaps between columns, 12px padding in cards, 16px section margins. Table row height 40px for data density.

## Component Patterns
Status badges: 24px height, 4-color system (blue/amber/green/red). Stat cards: 120px width, icon + metric stack. Table: hover state (muted bg). Side drawer: 360px width.

## Motion
Smooth transitions on all interactive states (0.3s cubic-bezier). Drawer slides from right. No decorative animations.

## Constraints
Light mode only (no dark mode toggle required). Maximize data visibility. One accent color for highlights. No decorative gradients or full-page effects. Icon set: 16px/24px system icons (e.g., solar, chart, check).

## Signature Detail
Status badge system — compact, semantic color coding. Pending amounts highlighted in orange accent throughout dashboard. Alternating table rows for visual scan-ability in data-dense context.
