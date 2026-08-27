# LoftDesign — Design System & Visual Architecture

> **Single Source of Truth** for UI/UX styling, color tokens, layout hierarchy, and component design.
> All public pages and dashboard interfaces flow from `frontend/static/css/home.css`, `frontend/static/css/index.css`, `dashboard/static/css/dash_index.css`, `dashboard/static/css/kanban.css`, and `dashboard/static/css/quotes.css`.

---

## 1. Brand Palette & Color Tokens

The visual identity is anchored on **Haute Architecture & Liquid Glass** aesthetics: deep architectural graphite night, crystal neon accents, and warm amber gold.

### Core Color Variables (`:root` in `frontend/static/css/home.css` & `index.css`)

```css
:root {
  /* Canvas & Base Layers */
  --bg: #070b0d;                 /* Deep architectural graphite-night canvas */
  --ink: #f4f1ea;                /* Warm off-white / ivory primary text */
  --muted: #a6afac;              /* Soft slate-sage for subtitles, captions, secondary text */
  --line: rgba(255, 255, 255, 0.16); /* Subtle crisp glass border */

  /* Vibrant Neon & Architectural Accents */
  --cyan: #55dcff;               /* Electric Cyan — Primary 360°, composer CTA, highlights */
  --violet: #aa7cff;             /* Electric Violet — VR immersion, creative actions */
  --amber: #f4b85f;              /* Warm Amber Gold — Haute design, quotes, pending status */
  --green: #7de5ae;              /* Soft Emerald Mint — Bilnov Store, success, approved */
  --danger: #ff7b73;             /* Coral Rose — Errors, declined, delete actions */

  /* Layout Constraints */
  --nav: 68px;                   /* Fixed glass navigation height */
  --max: 1500px;                 /* Maximum layout container width */
  --narrow: 1220px;              /* Focused / editorial reading width */
}
```

### Dynamic Site Branding Tokens (Mapped in `frontend/templates/index.html`)

```css
:root {
  --brand-primary: var(--primary-color, #FFD65A);   /* Amber Yellow — Brand CTA */
  --brand-secondary: var(--secondary-color, #212121); /* Near-black — Text on yellow */
  --brand-accent: var(--accent-color, #FFFFFF);     /* Pure White Accent */
  --brand-success: var(--success-color, #28a745);   /* Standard Success */
  --brand-danger: var(--danger-color, #dc3545);     /* Standard Danger */
  --brand-dark: var(--dark-color, #1a1a1a);         /* Deep Dark Surface */
  --brand-light: var(--light-color, #f8f9fa);       /* Off-white Light Surface */

  /* Legacy & Form Tokens */
  --bg-canvas: var(--brand-light);
  --white-accent: #FFFFFF;
  --text-main: #1A1A1A;
  --border-color: #e2e8f0;
}
```

> [!IMPORTANT]
> **Token Rule:** Always reference existing CSS variables (`var(--cyan)`, `var(--amber)`, `var(--ink)`, `var(--brand-primary)`). Never hardcode random hex colors or invent ad-hoc palettes in HTML templates.

---

## 2. Typography

The platform utilizes a dual-font architecture tailored for internationalization (French, English, and Arabic/RTL):

| Font Family | Usage | Weights | Notes |
|-------------|-------|---------|-------|
| **Inter** | Primary Western Typography (EN / FR) | `300`, `400`, `500`, `600`, `700`, `800`, `900` | Clean modernist geometric sans-serif for public & dashboard |
| **Cairo** | Arabic / RTL Typography (AR) | `300`, `400`, `600`, `700` | High-legibility Arabic glyphs loaded via Google Fonts |
| **Font Awesome 5 Free / Brands** | Iconography | `900` (Solid), `400` (Brands) | Explicit font definitions to prevent font stripping (`.fa`, `.fas`, `.fab`) |
| **Monospace** | Numbers, Prices, Quotes, Metres | `font-monospace` / `monospace` | Used for `LOFT-QUO-*` refs, DA currency tags, surfaces `m²`, financial totals |

### Text Hierarchy on Dark Glass Surfaces

| Token / Color | Role |
|---------------|------|
| `var(--ink)` (`#f4f1ea` / `#ffffff`) | Primary headings (`h1`–`h6`), card titles, critical stats |
| `var(--muted)` (`#a6afac` / `#94a3b8`) | Body copy, secondary metadata, table column headers |
| `var(--cyan)` (`#55dcff`) | Interactive links, active tab indicator, 360° badges |
| `var(--amber)` (`#f4b85f`) | Pricing highlights, prominent currency amounts, quotes |
| `var(--green)` (`#7de5ae`) | Positive indicators, commercial discount amounts |

> [!CAUTION]
> **Contrast Rules:** On dark liquid glass surfaces, never use dark-on-dark text (`.text-dark` on dark background). When Bootstrap utilities clash, override with `.text-light` or scoped CSS rules. Always support both `[dir="ltr"]` and `[dir="rtl"]`.

---

## 3. Dark Liquid-Glass Design Recipes

The liquid-glass design language combines semi-translucent dark surfaces, multi-stop radial backdrops, backdrop blur, and luminous borders.

### Standard Glass Card Recipe (`.crm-glass-card`, `.quote-grid-card`, `.admin-glass-card`)

```css
background: linear-gradient(150deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)) !important;
backdrop-filter: blur(20px) saturate(180%) !important;
-webkit-backdrop-filter: blur(20px) saturate(180%) !important;
border: 1px solid rgba(255, 255, 255, 0.12) !important;
border-radius: 20px !important;
box-shadow: 0 14px 38px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
```

### Detail Hero Header Recipe (`.admin-detail-hero`)

```css
background: linear-gradient(135deg, rgba(26, 32, 44, 0.98), rgba(15, 20, 30, 0.95));
border: 1.5px solid rgba(255, 255, 255, 0.14);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border-radius: 20px;
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
```

### Modal & Dropdown Surface Recipe (`.modal-content`, `.dropdown-menu`)

```css
background: rgba(22, 27, 34, 0.96);
border: 1.5px solid rgba(255, 255, 255, 0.14);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border-radius: 20px;
box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
```

### Multi-Layer Background System (`frontend/templates/home.html`)

- **`.bgLayer`**: Fixed full-viewport image layer with dynamic cross-fade transitions and visual enhancement filter (`filter: brightness(.44) saturate(.96) contrast(1.05)`).
- **`.bgVeil`**: Non-blocking radial and linear gradient veil (`radial-gradient(circle at 50% 28%, rgba(7, 11, 13, .02), rgba(7, 11, 13, .36) 54%, rgba(7, 11, 13, .74)), linear-gradient(180deg, rgba(7, 11, 13, .18), rgba(7, 11, 13, .48))`).

---

## 4. Button & Control Hierarchy

### Primary Neon Buttons (Public & Composer)

- **Neon Cyan Button (`.btn.neonCyan` / `.btn-neon-cyan`)**:
  - Background: `var(--cyan)` (`#55dcff`), Text: `#03141a` (Dark navy), Radius: `999px`.
  - Ambient glow: `box-shadow: 0 4px 18px rgba(85, 220, 255, 0.28)`.
  - Hover: `transform: translateY(-2px); box-shadow: 0 6px 24px rgba(85, 220, 255, 0.42)`.
- **Neon Violet Button (`.btn.neonViolet` / `.btn-neon-violet`)**:
  - Background: `var(--violet)` (`#aa7cff`), Text: `#16062b`, Radius: `999px`.
  - Ambient glow: `box-shadow: 0 4px 18px rgba(170, 124, 255, 0.28)`.
  - Hover: `transform: translateY(-2px); box-shadow: 0 6px 24px rgba(170, 124, 255, 0.42)`.
- **Store Bilnov Button (`.btn.storeTop`)**:
  - Subtle dark glass pill with SVG cart icon badge and white text.

### Dashboard Action Buttons

- **`.dash-btn-primary`**: Yellow/amber background (`var(--brand-primary)`), dark text (`var(--brand-secondary)`), font-weight: 700.
- **`.btn-outline-primary`**: Glass outline button with primary accent border.
- **`.quote-action-btn` / `.btn-text-pill`**: 34x34px square icon buttons with rounded corners (`10px`), glass border, and contextual hover glows (`.btn-cyan`, `.btn-gold`, `.btn-red`).

---

## 5. Stat Badge Chips & KPI Components

Used across CRM Kanban, Quotes, and Project Details for glanceable metrics:

```html
<div class="stat-badge-chip">
    <div class="stat-badge-icon gold">
        <i class="fas fa-file-invoice-dollar"></i>
    </div>
    <div class="min-w-0">
        <div class="text-muted small text-uppercase fw-bold">Total Quotes</div>
        <div class="fs-4 fw-bold text-light font-monospace">42</div>
    </div>
</div>
```

- **Icon Glow Modifiers**:
  - `.stat-badge-icon.gold`: Amber yellow background (`rgba(255, 214, 90, 0.18)`), border & icon `#FFD65A`.
  - `.stat-badge-icon.blue`: Cyan/sky background (`rgba(56, 189, 248, 0.18)`), border & icon `#38bdf8`.
  - `.stat-badge-icon.green`: Mint emerald background (`rgba(52, 211, 153, 0.18)`), border & icon `#34d399`.
  - `.stat-badge-icon.purple`: Electric violet background (`rgba(168, 85, 247, 0.18)`), border & icon `#c084fc`.

---

## 6. Status Pills & Badges

Status badges utilize translucent tinted backgrounds with luminous text and dots:

| Status Code | Badge Class | Color | Meaning |
|-------------|-------------|-------|---------|
| `pending` / `draft` | `.crm-badge-pending` / `.quote-badge--draft` | Amber (`#FFD65A` / `#f4b85f`) | En attente / Brouillon |
| `sent` / `in_progress` | `.crm-badge-sent` / `.quote-badge--sent` | Electric Cyan (`#55dcff` / `#38bdf8`) | Envoyé au client / En cours |
| `viewed` | `.crm-badge-viewed` / `.quote-badge--viewed` | Electric Violet (`#aa7cff` / `#c084fc`) | Devis consulté par le client |
| `approved` / `accepted` | `.crm-badge-approved` / `.quote-badge--accepted` | Soft Emerald (`#7de5ae` / `#34d399`) | Validé / Accepté |
| `declined` / `cancelled`| `.crm-badge-declined` / `.quote-badge--declined` | Coral Rose (`#ff7b73` / `#f87171`) | Refusé / Annulé |
| `superseded` | `.quote-badge--superseded` | Slate Gray (`#94a3b8`) | Révision précédente remplacée |

---

## 7. Component Guidelines & Reusability Rules

### 1. Custom Selects
- **Rule**: Never use unstyled raw `<select>` tags in public or dashboard views.
- **Public & Dashboard Forms**: Use `dashboard/templates/components/custom_select.html` or `.form-select.svc-input` with `.custom-select-wrapper` classes.

### 2. Forms & Error Handling
- **Form Class**: Always add `class="form"` to forms expecting AJAX handling.
- **Form Errors**: Always render errors with `partials/errorList.html`.
- **Modals**: Style with dark liquid-glass backdrops (`.modal-content`), dismissible buttons (`btn-close btn-close-white`), and translatable SweetAlert2 responses.

### 3. Pagination
- **Rule**: List views must use `@with_pagination(per_page=..., ...)` in Python views and render via `{% render_pagination page_obj %}` in Django templates.

### 4. Multilingual Language Switcher
- Language tabs inside modals and forms must be presented in a single horizontal row (`.svc-lang-btn` / `.nav-pills`).
- Switching language must isolate and display strictly the selected language content, hiding all others, and apply `dir="rtl"` when Arabic is chosen.

### 5. Proforma PDF Facturation
- Rendered via WeasyPrint using [`dashboard/templates/dashboard/pdf/facturation.html`](file:///C:/sites/loft-design-services/dashboard/templates/dashboard/pdf/facturation.html).
- Embeds crisp vector SVG logo, structured client and project spatial cards, itemized services with pricing models, financial summary, and validation signature blocks.