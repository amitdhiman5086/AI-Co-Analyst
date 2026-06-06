# AI Co-Analyst Design System Reference

This document details the colors, typography, spacing, and component specifications for the AI Co-Analyst warm-canvas editorial design system. Refer to this when building or modifying frontend components.

---

## 1. Color Palette

### Brand & Accent
*   **Coral / Primary** (`#cc785c`): Signature warm coral. Used for primary CTAs, full-bleed coral callout cards, and brand wordmark accents.
*   **Coral Active** (`#a9583e`): Press/hover state for coral elements.
*   **Coral Disabled** (`#e6dfd8`): Desaturated cream-tinted disabled state.
*   **Accent Teal** (`#5db8a6`): Used sparingly on secondary product surfaces (status indicators, active connections).
*   **Accent Amber** (`#e8a55a`): Small companion warm-tone for badges and highlights.

### Surfaces
*   **Canvas** (`#faf9f5`): Default page floor. Tinted warm cream.
*   **Surface Soft** (`#f5f0e8`): Section dividers, soft band backgrounds.
*   **Surface Card** (`#efe9de`): Feature cards, content cards.
*   **Surface Cream Strong** (`#e8e0d2`): Selected tabs, highlighted sections.
*   **Surface Dark** (`#181715`): Code editor mockups, model cards, footer.
*   **Surface Dark Elevated** (`#252320`): Elevated cards inside dark bands.
*   **Surface Dark Soft** (`#1f1e1b`): Inner code blocks inside dark cards.
*   **Hairline** (`#e6dfd8`): 1px borders on cream surfaces.
*   **Hairline Soft** (`#ebe6df`): Divider line inside the same band.

### Text
*   **Ink** (`#141413`): Headlines and primary text. Warm dark, slightly off-black.
*   **Body Strong** (`#252523`): Emphasized paragraphs, lead text.
*   **Body** (`#3d3d3a`): Default body text.
*   **Muted** (`#6c6a64`): Sub-headings, breadcrumbs, secondary footer links.
*   **Muted Soft** (`#8e8b82`): Captions, fine print, copyrights.
*   **On Primary** (`#ffffff`): Text on coral buttons.
*   **On Dark** (`#faf9f5`): Cream-tinted white text on dark surfaces.
*   **On Dark Soft** (`#a09d96`): Footer body text, secondary labels on dark mockups.

### Semantic
*   **Success**: `#5db872` (green)
*   **Warning**: `#d4a017` (yellow)
*   **Error**: `#c64545` (red)

---

## 2. Typography

*   **Display Font**: Tiempos Headline, Cormorant Garamond, EB Garamond (serif, weight 400 with negative tracking).
*   **Sans Font**: StyreneB, Inter (humanist sans, weight 400/500).
*   **Mono Font**: JetBrains Mono (code, weight 400).

### Type Scale

| Token | Family / Font | Size | Weight | Line Height | Letter Spacing | Use Case |
|---|---|---|---|---|---|---|
| `display-xl` | Serif | 64px | 400 | 1.05 | -1.5px | Homepage h1 |
| `display-lg` | Serif | 48px | 400 | 1.1 | -1px | Section heads |
| `display-md` | Serif | 36px | 400 | 1.15 | -0.5px | Sub-section heads |
| `display-sm` | Serif | 28px | 400 | 1.2 | -0.3px | Pricing tier names, callout heads |
| `title-lg` | Sans | 22px | 500 | 1.3 | 0px | Plan size labels |
| `title-md` | Sans | 18px | 500 | 1.4 | 0px | Feature card titles, intro paras |
| `title-sm` | Sans | 16px | 500 | 1.4 | 0px | Connector tile titles, list labels |
| `body-md` | Sans | 16px | 400 | 1.55 | 0px | Default body running text |
| `body-sm` | Sans | 14px | 400 | 1.55 | 0px | Footer body, fine print |
| `caption` | Sans | 13px | 500 | 1.4 | 0px | Badge labels, captions |
| `caption-uppercase` | Sans | 12px | 500 | 1.4 | 1.5px | Category tags, "NEW" badges |
| `code` | Mono | 14px | 400 | 1.6 | 0px | Code blocks, inline code |
| `button` | Sans | 14px | 500 | 1.0 | 0px | Button labels |
| `nav-link` | Sans | 14px | 500 | 1.4 | 0px | Top navigation items |

---

## 3. Shapes & Spacing

### Border Radius Scale
*   `xs` (4px): Badge accents, tiny dropdowns.
*   `sm` (6px): Small inline buttons, dropdown items.
*   `md` (8px): Standard CTA buttons, text inputs, category tabs.
*   `lg` (12px): Content cards (feature, pricing, code-window, model-comparison).
*   `xl` (16px): Hero illustration container, marquee components.
*   `pill` (9999px): Badge pills, "NEW" tags.
*   `full` (9999px / 50%): Avatars, icon buttons.

### Spacing Scale
*   `xxs`: 4px
*   `xs`: 8px
*   `sm`: 12px
*   `md`: 16px
*   `lg`: 24px
*   `xl`: 32px
*   `xxl`: 48px
*   `section`: 96px

---

## 4. Layout Rules
1.  **Whitespace**: Maintain `spacing.section` (96px) between major page bands, and `spacing.xl` (32px) for card internal padding.
2.  **Rhythm**: Alternating bands to pacing the content (e.g. Cream → Cream Card → Dark Mockup → Cream → Coral Callout → Dark Footer). Never repeat the same surface mode in two consecutive bands.
3.  **Borders**: Prefer color blocks for depth. Soft hairline (`1px border-hairline`) is used only when boundary clarification is needed. Shadows are rare (`0 1px 3px rgba(20,20,19,0.08)`).
