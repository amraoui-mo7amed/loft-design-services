# LoftDesign — Coding Guidelines

These are **mandatory** rules for any agent working in this repository. Follow them strictly.
Where this document and `AGENTS.md` overlap, treat this file as canonical.

## Build / lint / test / dev commands

```bash
# Django
python manage.py runserver                 # dev server (ASGI – needs daphne installed)
python manage.py makemigrations            # after model changes
python manage.py migrate
python manage.py createsuperuser
python manage.py init_admin                # bootstrap admin user
python manage.py seed_catalog              # seed project types/spaces/packages/options
python manage.py compilemessages           # compile .po → .mo after editing translations

# Tests (tests force SQLite automatically)
python manage.py test                      # all
python manage.py test <app>                # per app
python manage.py test <app>.tests.<Class>.<method>

# Lint / quality
djlint .                                   # lint templates
djlint . --reformat                        # auto-format templates
python -m py_compile <file>.py             # quick syntax check
python -m compileall .                     # compile all python

# Run the full stack (recommended)
docker compose up --build                  # db + redis + web (or podman-compose)
```

Verify changes by hitting the podman/docker stack at `http://localhost:8000` and hard-refreshing
(`Cmd+Shift+R`) — asset URLs are cache-busted by `ASSET_VERSION`.

## Python / Django style

**Imports (PEP 8, all at the top of the file)**
1. Standard library (`os`, `json`, `datetime`)
2. Third-party / Django (`django.db.models`, `django.shortcuts`, `django.http`)
3. Local app imports (`from ..models import ...`, `from ..utils import ...`)

**Formatting** — 4-space indent, max line 88 chars (Black-style), double quotes, trailing
commas in multiline structures.

**Naming** — functions/vars `snake_case`, classes `PascalCase`, constants `UPPER_SNAKE_CASE`.
URL names are `snake_case` and referenced in templates via `{% url %}`.

**Models**
- Always define `__str__` and `related_name` on every ForeignKey.
- Choices fields **must** use `TextChoices`.
- Complex multi-write operations go inside `transaction.atomic()`.
- Money = `DecimalField`; quote time-sensitive prices into `*_at_time` snapshots.
- Slugs auto-generate in `save()`.
- **Never reintroduce `estimated_days` on `Space`** (removed by design, migration `0019`).

**Views**
- Function-based views, grouped by feature under `dashboard/views/`.
- Protect with role decorators from `dashboard.decorator`: `@admin_required`,
  `@designer_required`, `@customer_required`.
- Paginate list views with `@with_pagination(...)` and render `components/pagination.html`.
- AJAX endpoints return `JsonResponse({"success": bool, "message" | "errors": ...,
  "redirect_url"?: ...})`. Errors go through `humanize_error()` (translated IntegrityError
  messages) and validation errors are lists of translated strings.
- Wrap external/fallible calls in try/except; log and return `{"success": False}` on failure.
- Validate all user input before DB writes.

**Helpers** — put shared helper functions in `<app>/utils.py` (`dashboard/utils.py`,
`user_auth/utils.py`), never inline them in views.

## Templates

- Always define blocks with matching open/close tags: `{% block name %}` / `{% endblock name %}`.
- Extend `index.html` (public) or `dash/dash_index.html` (dashboard); dashboard pages override
  `dashTitle` and `dashContent`.
- **Always** use `components/custom_select.html` instead of raw `<select>` tags.
- **Always** use `components/pagination.html` on list views.
- **Always** add the `.form` class to forms.
- **Always** render form errors via `partials/errorList.html`.
- Load static with `{% load static %}`; version every asset `?v={{ ASSET_VERSION }}`.
- Use Bootstrap form controls for inputs.
- Keep JS and CSS out of templates — separate files under the app's `static/` dir.

## Internationalization & RTL

- The site is multilingual: translate every user-facing string with `{% trans %}` (templates)
  and `gettext_lazy` / `gettext` (Python). Never hardcode English UI text.
- Write all CSS for **both** `[dir="ltr"]` and `[dir="rtl"]` (mirror padding, borders,
  box-shadows, transforms as needed).

## JavaScript

- Vanilla JS only; wrap in `document.addEventListener("DOMContentLoaded", ...)`.
- `const` / `let` only. No `var`, no jQuery, no frameworks.
- Object actions (create/update/delete/approve/status/assign) **must** use AJAX
  (`fetch`/`XMLHttpRequest`) + **SweetAlert2** confirmations and responses — never plain
  form redirects. SweetAlert messages must be translatable.
- Realtime notifications via `dashboard/static/js/notifications.js` + EventStream.

## Brand & design

- Keep brand consistency with `frontend/static/css/index.css` tokens. Don't re-declare the
  color palette; reference the existing variables.
- Dashboard pages follow the **dark liquid-glass** theme (`dash_index.css`, scoped to
  `.dashContent`) — see `design-system.md`. Never apply light-theme backgrounds to the
  dashboard, and never introduce dark-on-dark text.
- Be creative with layout/design but stay inside the palette and the glass recipe.

## Notifications

- Create in-app notifications via `dashboard.utils.notify_user(...)`; it persists a
  `Notification` and pushes a realtime event to the user's channel.
- Send a system-level notification when a task finishes (per AGENTS.md).

## Testing

- Tests live in `<app>/tests.py`. Cover model methods and view responses (including AJAX
  JsonResponse shapes). API/integration tests are welcome.
- Run the single test: `python manage.py test <app>.tests.<Class>.<method>`.

## Git / workflow

- Only commit when explicitly asked.
- Never commit `.env` or secrets; check `.gitignore`.
- Match the repo's commit-message style; stage only intended files.
