# LoftDesign — Project Overview

## What it is

LoftDesign is a full-stack **interior design service platform** built with Django 5.2.5.
Customers browse a public catalog of project types and spaces, build a design request through
a multi-step wizard, submit it, and then track delivery through a client dashboard. Designers
deliver files and chat with clients. Admins manage the catalog, run a kanban CRM, handle
inquiries, portfolio, pricing and a product marketplace.

The site is **multi-language** (English + French registered, Arabic content present, RTL
supported) and the admin/dashboard UI uses a custom **"dark liquid glass"** theme.

## Product areas

| Area | Where | URL (prefix) |
|------|-------|--------------|
| Public landing + order | `frontend` | `/` |
| Design request wizard | `dashboard.views.wizard` (mounted in `frontend/urls_design.py`) | `/request/` |
| Wizard JSON APIs | `dashboard.views.wizard_api` | `/api/design/*` |
| Admin CRM kanban | `dashboard.views.admin_crm` | `/dashboard/crm/` |
| Catalog CRUD (project types, spaces, packages, options) | `dashboard.views.design` | `/dashboard/design/*` |
| Pricing settings | `dashboard.views.pricing` | `/dashboard/pricing/` |
| Customer dashboard | `dashboard.views.customer` | `/dashboard/my-projects/*` |
| Designer dashboard | `dashboard.views.designer` | `/dashboard/designer/*` |
| Portfolio (public + admin) | `frontend.views.portfolio`, `dashboard.views.portfolio` | `/portfolio/` |
| Marketplace | `dashboard.views.marketplace` | `/marketplace/*` |
| Inquiries | `frontend.views.inquiry`, `dashboard.views.admin_crm` | `/dashboard/inquiries/` |
| Chat + files per request | `dashboard.views.chat`, `dashboard.views.file_manager` | `/api/design/chat/*`, `/api/design/files/*` |
| Auth (login/logout/profile) | `user_auth` | `/auth/` |

## Tech stack

- **Backend**: Django 5.2.5, ASGI via `daphne`, `django_eventstream` (SSE realtime).
- **DB**: PostgreSQL (docker-compose) with SQLite fallback; tests always run on SQLite.
- **Realtime**: Redis + django-eventstream; storage via `DjangoModelStorage`.
- **Frontend**: Bootstrap 5.3.8 (RTL build for Arabic), Font Awesome 5.15.3, Google Font
  "Cairo", **vanilla JavaScript only** (no frameworks), Chart.js (dash home donut),
  SweetAlert2 (dashboard confirmations).
- **Config**: `python-decouple` reads `.env` (never commit it). See `.env.example`.
- **Emails**: Django SMTP (`core/settings.py` EMAIL_*).
- **PDF**: `dashboard/pdf_generator.py`.

## Repo layout

```
core/         Project settings, root URLs, context processors, WSGI/ASGI
dashboard/    The bulk: models, views, price_engine, signals, utils, email/pdf,
              templatetags, static (css/js), templates (dash + dashboard/<role>)
frontend/     Public templates (index.html base, home, portfolio), views, static,
              templatetags; hosts the wizard URLs (frontend/urls_design.py)
user_auth/    User + UserProfile (role system), login/logout/profile, auth templates
locale/       en/fr/ar compiled messages (.po/.mo)
media/        User uploads (spaces, portfolio, designs)
static/       Empty top-level static dir; real static lives in each app's static/
staticfiles/  collectstatic output (gitignored)
requirements.txt / Dockerfile / docker-compose.yml
AGENTS.md     Root-level agent rules (kept in sync with .agent/coding-guidelines.md)
.agent/       Canonical documentation for coding agents (this directory)
```

## Running the app

```bash
# With docker/podman (recommended, matches prod services: db + redis + web)
docker compose up --build          # or: podman-compose up
# Web container auto-runs: makemigrations → migrate → init_admin → seed_catalog → runserver :8000

# Local, without containers (requires daphne for ASGI)
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py init_admin && .venv/bin/python manage.py seed_catalog
.venv/bin/python manage.py runserver

# URLs
#   http://localhost:8000/            public site
#   http://localhost:8000/dashboard/home/   dashboard home
#   http://localhost:8000/admin/       Django admin
```

## Key conventions that must never be broken

- **Multi-language & RTL**: every user-facing string goes through the i18n framework
  (`{% trans %}` / `gettext_lazy`), and CSS supports both `[dir="ltr"]` and `[dir="rtl"]`.
- **Dark liquid glass dashboard**: all dashboard UI follows the theme defined in
  `dashboard/static/css/dash_index.css` (see `design-system.md`).
- **AJAX + SweetAlert**: object actions (create/update/delete/approve/status) use AJAX
  returning `JsonResponse` and SweetAlert2 confirmations — never plain form redirects.
- **Reusable components**: custom selects, pagination, notification dropdown, stat cards
  are shared components, not copy-pasted markup.
