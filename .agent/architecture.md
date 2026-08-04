# LoftDesign — Architecture

## Django apps and responsibilities

```
core/         Settings (i18n, DB, static/media, EventStream/Redis, email),
              root URLconf, context processors, WSGI/ASGI entrypoints.
frontend/     Public-facing site. Models are minimal; it mainly renders templates
              and hosts the wizard routes (frontend/urls_design.py) which point at
              dashboard.views.wizard. Templatetag: {% website_name %}.
dashboard/    The domain app. All business models + views + services.
user_auth/    User + UserProfile role system, login/logout/profile views and templates.
```

## URL namespaces

- `user_auth:` — `login`, `logout`, `profile_edit`
- `dash:` — everything under `/dashboard/` (`dashboard/urls.py`)
- `frontend:` — `home`, `order`, `portfolio_list`, `portfolio_detail`
- Wizard and `/api/design/*` routes are **unnamespaced** and defined in `core/urls.py`
  (plus `frontend/urls_design.py` for the wizard steps).

## Data model (grouped)

All models live in `dashboard/models/` and are re-exported through `dashboard/models/__init__.py`.
Import models from `dashboard.models`, not from individual files.

- **Catalog** (`base.py`, `catalog.py`)
  - `ProjectType`, `Space`, `SpaceImage`, `ProjectTypeSpace` (M2M link + `show_on_home`)
  - `ServiceCategory`, `DesignOption` (a la carte service), `DesignPackage`,
    `PackageService` (through-model holding the per-package price)
- **Requests** (`requests.py`) — `DesignRequest` (the central entity, `uuid` key, project
  number `LOFT-YYYY-####`), plus `DesignRequestFloor`, `DesignRequestSpace` (snapshot
  `price_at_time`), `DesignRequestOption`, `DesignRequestSpaceImage`, `DesignRequestFile`
- **Communication** (`communication.py`) — `DesignMessage`, `DesignRevision`,
  `DesignDeliverable`, `DesignNote`, `DesignActivityLog`
- **Billing** — `DesignPayment` (`payments.py`), `PricingConfig` (`pricing.py`, singleton,
  `get_instance()`, tax default 19%)
- **Marketplace** (`marketplace.py`) — `ProductCategory`, `Product`, `SpaceProductRecommendation`,
  `Cart`, `CartItem`, `Order`, `OrderItem`
- **Extras** — `Notification` (`notification.py`), `Inquiry` (`inquiry.py`),
  `Portfolio`, `PortfolioGallery` (`portfolio.py`)

### Model rules (enforced by convention)

- Every model defines `__str__` and `related_name` on ForeignKeys.
- Status/choice fields use Django `TextChoices` (per project rule).
- Slug fields auto-slugify on `save()`.
- Money is stored as `DecimalField`; quoted amounts are snapshotted into `*_at_time`
  fields so later price changes don't alter historical requests.
- **Do not reintroduce a duration/delivery field on `Space`** — `Space.estimated_days`
  was deliberately removed (migration `dashboard/0019`). `DesignPackage.delivery_time_days`
  and `DesignOption.delivery_time_days` are separate and correct.

## Pricing engine (`dashboard/price_engine.py`)

Pure functions, no imports of views:

- `calculate_subtotal(spaces_qs)`, `calculate_package_price(subtotal, package)`,
  `calculate_options_total(options_qs)`, `calculate_tax(subtotal, package_price, options_total)`,
  `calculate_total(...)`, and the umbrella `calculate_full_price(space_ids, package, option_ids)`
  returning `{subtotal, package_price, options_total, tax, total}` (floats).

`TAX_RATE = 0.19`. The wizard calls it via `wizard_api.api_calculate_price`.

## Wizard flow (public design request)

```
/request/                  wizard_container (mounts steps + sidebar)
  ├─ step_combined         (project type + spaces selection)   step1_combined.html
  ├─ step_packages         packages + a-la-carte options        step4_packages.html
  ├─ step_inspirations     inspiration images                   step6_inspirations.html
  ├─ step_questionnaire    Q&A modal                             step7_questionnaire.html
  └─ step_summary          review + submit                       step9_summary.html
```

- Steps are fetched as partials via AJAX and orchestrated by `dashboard/static/js/wizard.js`.
- Data is staged client-side and POSTed once. Submit endpoint:
  `api_submit_request` → `wizard.submit_design_request` (transaction.atomic).
- Live price preview uses `api_calculate_price`.

## Admin CRM kanban

- `admin_crm.kanban_view` groups `DesignRequest`s by status into columns
  (`pending` / `approved` / `declined`).
- `?status=` and `?q=` filters live in a **filter modal** (search input + `custom_select`
  for status) that updates the list via AJAX (`kanban.js`); active filter chips are shown.
- Status change: `crm_update_status` (AJAX → `JsonResponse`, re-renders card), designer
  assignment `crm_assign_designer`, delete `crm_delete_project`.
- Each card has a per-card Bootstrap status dropdown (`.crm-status-menu`) styled as glass.

## Realtime notifications

- `django_eventstream` + Redis; SSE endpoint `/events/` (`EVENTSTREAM_CHANNELMANAGER_CLASS =
  dashboard.channelmanager.NotificationChannelManager`, storage `DjangoModelStorage`).
- `dashboard/utils.py::notify_user(user, title, message, type, link)` creates a
  `Notification` row and `send_event(f"user-{user.id}", "notification", {...})`.
- Dashboard header includes `components/notification_dropdown.html`; `notifications.js`
  maintains SSE, unread badge (`#notification-badge`), list and mark-read/all-read.
- Endpoints: `notifications_stream`, `notifications_unread_count`, `notifications_list`,
  `notification_mark_read`, `notifications_mark_all_read`, `notification_delete`.

## Signals (`dashboard/signals.py`)

- `post_save` on `DesignRequest`: activity log + notify all superusers + submit email;
  status-change email. On `DesignMessage`, `DesignDeliverable`, `DesignPayment` (completed):
  activity logs and/or notifications.

## Permissions

- `dashboard/decorator.py`: `@admin_required`, `@designer_required`, `@customer_required`
  (redirect to login if anonymous, `PermissionDenied` otherwise) and
  `@with_pagination(per_page, template, queryset_name)` — a paginating render decorator
  that expects the view to return a context **dict** (not a rendered response).
- Roles come from `UserProfile.role` (`customer`/`designer`/`admin`); superuser implies admin.
- Sidebar menu is built by `dashboard.context_processors.dashboard_sidebar` and grouped by
  `section` in `dash_index.html`.

## Utilities and services

- `dashboard/utils.py` — `notify_user`, `humanize_error` (maps IntegrityError constraint
  names in `HUMAN_ERROR_MAP` to translated messages), email helpers. **All helper functions
  live here**, not scattered in views.
- `user_auth/utils.py` — `create_user_account` (transactional User+Profile), `validate_algerian_phone`.
- `dashboard/email_service.py`, `dashboard/pdf_generator.py` — emails and PDF generation.
- `frontend/utils.py` — `get_website_name()` (localized site name).
- Management commands: `init_admin`, `seed_catalog`, `seed_space_images` (see
  `dashboard/management/commands/`).

## Cross-cutting conventions

- Views are function-based, split per feature module under `dashboard/views/`.
- AJAX endpoints return `JsonResponse({"success": bool, "message"|"errors": ...,
  "redirect_url"?: ...})`; errors are humanized via `humanize_error` and translated.
- `transaction.atomic()` for anything that writes multiple rows (wizard submit,
  `create_user_account`).
- New migrations are generated with `python manage.py makemigrations`; tests force SQLite.
