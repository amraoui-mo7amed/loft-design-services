# LoftDesign — Design System

This is the single source of truth for visual styling. Everything the dashboard looks like
flows from `frontend/static/css/index.css` (brand tokens) + `dashboard/static/css/dash_index.css`
(dark liquid-glass dashboard theme). Reference the public `/` homepage as the design baseline.

## Brand tokens

CSS variables are injected per-request into `<html>` `:root` by
`frontend/templates/index.html` from `site_config.branding`, with hard fallbacks in
`frontend/static/css/index.css`.

```css
--brand-primary:   #FFD65A  (yellow – CTA / accent)
--brand-secondary: #212121  (near-black – text on yellow, dark surfaces)
--brand-accent:    #FFFFFF
--brand-success:   #28a745
--brand-danger:    #dc3545
--brand-dark:      #1a1a1a
--brand-light:     #f8f9fa
--bg-canvas, --white-accent, --text-main, --border-color
```

**Rule:** always reference these variables or the dark-glass tokens below. Never invent ad-hoc
brand colors in templates. Follow the color palette already defined in `index.css` only.

## The dark liquid-glass dashboard theme

The dashboard (`dash_index.html`) uses a dark, frosted-glass aesthetic. Shared styling lives
in `dashboard/static/css/dash_index.css`, scoped under **`.dashContent`** so it never leaks
into the public site.

### Core recipe

```css
/* glass surface */
background: linear-gradient(150deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
backdrop-filter: blur(18px) saturate(160%);
-webkit-backdrop-filter: blur(18px) saturate(160%);
border: 1px solid rgba(255,255,255,0.10);
```

```css
/* deep dropdown/menu surface */
background: linear-gradient(145deg, rgba(30,35,42,0.97), rgba(20,24,29,0.95));
box-shadow: 0 18px 44px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08);
```

### Text tiers (dark background)

| Token | Usage |
|-------|-------|
| `#f2f5f8` | Primary text, titles, headings, strong values |
| `#e6eaee` | Body text |
| `#a8b2bd` | Secondary / muted labels, table headers |
| `#8b95a1` | Tertiary / captions, placeholders |
| `var(--brand-primary)` | Links, active states, highlights on dark |

**Contrast rules:** on the dark dashboard never use dark-on-dark text. Where a light page
utility like `text-dark` (`!important` in Bootstrap) would fight the theme, override it at a
more specific selector or remove it. Always write CSS for **both** `[dir="ltr"]` and
`[dir="rtl"]` (box-shadows, padding sides, transforms must be mirrored).

### Buttons

- `.dash-btn-primary` — yellow (`var(--brand-primary)`) background, **dark** text
  (`var(--brand-secondary)`), with `!important` on color/bg so Bootstrap can't invert it.
  Used for primary/CTAs (e.g. "New Project Type", "Add Space").
- `.dash-btn-outline` — transparent, yellow border + yellow text.
- `.dash-btn-secondary` — near-black background, white text.
- Cancel/secondary-in-dashboard: `btn-outline-light`. Avoid `btn-primary`/`btn-light` on the
  dashboard (light-on-light issues).
- Icon-only controls (e.g. back button): small square `btn-outline-light rounded-3`, fixed
  `36px` size, with an `aria-label`.

### Status & badges

- `.status-badge` pills: `status-pending` (amber), `status-approved` (green),
  `status-declined` (red) — translucent `rgba(...)` backgrounds with bright text.
- Catalog badge `.pt-badge`: glass pill (`rgba(255,255,255,0.12)` bg, `#f2f5f8` text).

### Tables

- `.dash-table` base; `.dash-recent-table` variant on the dashboard home: yellow glass
  `<thead>` band (`rgba(255,214,90,0.88)`) with **dark** header text, zebra rows, glass
  row hover, project icon chip (`.dash-table-icon`) and client initials avatar
  (`.dash-avatar`).

### Cards

- `.dashboard-card` / `.dashContent .card` — glass panel; `.card-header` transparent with
  `border-bottom: rgba(255,255,255,0.1)`; card titles use light text. Use `.text-light` in
  card headers by default.

### Modals, alerts, SweetAlert, dropdowns

- Global glass overrides in `dash_index.css` for `.dashContent .modal-content`, `.alert-*`,
  SweetAlert (`body:has(.dashContent) .swal2-*`), and the shared `.custom-select-*`.
- Bootstrap dropdowns get dark glass menus (see Kanban `.crm-status-menu`, notification
  `.nt-menu`). Ensure `.dropdown-item` has no stray light background / bottom border and no
  unwanted border-radius on the dashboard.
- Notification items (`.nt-item`) have no border radius; hover = white lift + a yellow accent
  bar (`inset 3px 0 0 var(--brand-primary)`, mirrored for RTL), no translateX.

## CSS organization and load order (important)

In `frontend/templates/index.html` the load order is deliberate:

1. Bootstrap + Font Awesome + Cairo (CDN)
2. `{% block css %}` (dashboard base injects `dash_index.css`, `notifications.css` here)
3. Core: `css/index.css`, `css/three-sixty-bg.css`
4. `{% block extra_css %}` — page-specific css (e.g. `kanban.css`, `dash_home.css`,
   `project_type_list.css`)

Custom CSS always loads **after** Bootstrap so it wins the cascade; page-specific files load
last so the dashboard base theme can be tuned per page. Follow this ordering — do not move
core css after page css, and keep the `.dashContent` scope for dashboard-only rules.
Cache-bust every stylesheet/script with `?v={{ ASSET_VERSION }}`.

## Components and partials (reuse, don't reinvent)

`dashboard/templates/components/`:
- `custom_select.html` — **always use instead of a raw `<select>`**
  (classes `custom-select-wrapper/display/list`, styled glass on the dashboard, light on public).
- `pagination.html` — always used on list views (via `{% render_pagination page_obj %}` tag).
- `notification_dropdown.html`, `stat_card.html`, `action_buttons.html`, `table_search.html`.

`partials/`: `errorList.html` (form errors), `language_switcher.html`, `sidebar_item.html`.
Templatetags: `dashboard.templatetags.tags` (`render_pagination`, `get_item`, `split`,
`humanize_number`) and `frontend.templatetags.frontend_tags` (`website_name`).

## JavaScript conventions

- Vanilla JS only. Wrap in `document.addEventListener("DOMContentLoaded", ...)`.
- `const` / `let`; avoid `var`. No jQuery.
- Object actions go through **AJAX + SweetAlert2** (no page reloads).
- Keep JS in `dashboard/static/js/<feature>.js`, never inline in templates.
- Chart.js usage: donut on `dash_home` renders via `dash_home.js`; keep legend/label colors
  light (`#f2f5f8`) — set `Chart.defaults.color`, `labels.color` and item `color`/`fontColor`.

## i18n & RTL

- `LANGUAGE_CODE = "fr"`; registered `LANGUAGES = [en, fr]`; `locale/` ships ar/en/fr.
- Always translate strings: `{% trans %}` / `gettext`/`gettext_lazy` in Python; never hardcode
  English in user-facing UI.
- `{% get_current_language_bidi as IS_RTL %}` and the `<html dir>` control layout direction.
- RTL-aware CSS: prefix directional rules with `[dir="rtl"]`.

## Accessibility / quality bars

- Sufficient contrast on dark glass (use the text tiers above).
- Icons/icon-only buttons need `aria-label` or visible text.
- Forms use Bootstrap form controls + the `.form` class + `partials/errorList.html`.
- Be creative but stay within the brand palette and the liquid-glass recipe.