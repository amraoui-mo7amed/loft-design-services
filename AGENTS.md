# AGENTS.md - Agentic Coding Guidelines

> **Canonical documentation lives in `.agent/`** — read `project-overview.md`,
> `architecture.md`, `design-system.md`, and `coding-guidelines.md` for the full picture.
> This file is the quick-reference index.

## Project Overview

LoftDesign is an **interior design service platform** built with Django 5.2.5. Customers
browse a public catalog of project types and spaces, build a design request through a
multi-step wizard, submit it, and track delivery through a client dashboard. Designers
deliver files and chat with clients. Admins manage the catalog, run a kanban CRM, handle
inquiries, portfolio, pricing and a product marketplace.

- Multi-language (English + French, Arabic/RTL supported).
- Dashboard UI uses a custom **dark liquid-glass** theme.
- Realtime notifications via django-eventstream + Redis.
- See `.agent/project-overview.md` for the full area/URL breakdown.

## Tech Stack

- Django 5.2.5 (ASGI via daphne), django-eventstream, Redis, PostgreSQL (SQLite in tests)
- Bootstrap 5.3.8 (RTL build for Arabic), Font Awesome 5.15.3, Google Font "Cairo",
  Chart.js, SweetAlert2 — **vanilla JavaScript only** (no frameworks, no jQuery)
- `python-decouple` for env config (see `.env.example`)

## Build/Lint/Test Commands

```bash
# Django Commands
python manage.py runserver              # Start development server (needs daphne)
python manage.py makemigrations         # Generate migrations
python manage.py migrate                # Apply migrations
python manage.py createsuperuser        # Create admin user
python manage.py init_admin             # Bootstrap admin user
python manage.py seed_catalog           # Seed project types/spaces/packages/options
python manage.py compilemessages        # Compile .po -> .mo translations

# Run Tests (tests force SQLite automatically)
python manage.py test                   # Run all tests
python manage.py test <app_name>        # Run tests for specific app
python manage.py test <app>.tests.<ClassName>  # Run specific test class
python manage.py test <app>.tests.<ClassName>.<method>  # Run single test

# Linting
pip install djlint                      # Install djlint if needed
djlint .                                 # Lint all templates
djlint . --reformat                     # Reformat templates

# Python Code Quality
python -m py_compile <file>.py         # Syntax check
python -m compileall .                  # Compile all .py files
```

Run the full stack with Docker/podman (`docker compose up --build`); assets are
cache-busted with `?v={{ ASSET_VERSION }}`, so hard-refresh the browser to see changes.

## Code Style Guidelines

### Python / Django

**Imports (PEP 8)**
```python
# Standard library imports first
import os
import json
from datetime import datetime

# Third-party / Django imports second
from django.db import models
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse

# Local app imports third
from ..models import ProjectType, Space
from ..utils import humanize_error
```

**Formatting**
- 4 spaces for indentation
- Max line length: 88 characters (Black-style)
- Double quotes for strings
- Trailing commas in multi-line structures

**Naming Conventions**
- Functions: `snake_case` (e.g., `calculate_full_price`, `notify_user`)
- Classes: `PascalCase` (e.g., `DesignRequest`, `PricingConfig`)
- Variables: `snake_case` (e.g., `page_context`, `space_ids`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `TAX_RATE`)
- URL names: `snake_case` in templates

**Models**
- Always define `__str__` and `related_name` for ForeignKeys
- Use `TextChoices` for choices fields
- Use `transaction.atomic()` for complex operations
- Money as `DecimalField`; snapshot quoted prices into `*_at_time` fields

```python
class DesignRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        APPROVED = "approved", _("Approved")
        DECLINED = "declined", _("Declined")

    project_name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"LOFT-{self.created_at.year}-{self.pk:04d}"
```

**Views**
- Function-based views, split by feature under `dashboard/views/`
- Protect with `@admin_required` / `@designer_required` / `@customer_required`
  (`dashboard/decorator.py`)
- Paginate list views with `@with_pagination(...)` + `components/pagination.html`
- Return `JsonResponse({"success": bool, "message"|"errors": ..., "redirect_url"?: ...})`
  for AJAX endpoints; humanize DB errors via `humanize_error`
- Validate all user inputs before database operations

**Error Handling**
- Use try/except for external/fallible calls (emails, SSE, third-party)
- Return JsonResponse with `success` flag for AJAX
- Put shared helpers in `<app>/utils.py` (e.g., `notify_user`, `humanize_error`)

### Templates / HTML

- Use Django template inheritance; define blocks with matching
  `{% block name %}` / `{% endblock name %}` tags
- Public pages extend `index.html`; dashboard pages extend `dash/dash_index.html`
- **Always** use `components/custom_select.html` instead of raw `<select>` tags
- **Always** use `components/pagination.html` with list views
- **Always** add the `.form` class to forms
- **Always** use `partials/errorList.html` to render `form` errors
- Load static with `{% load static %}` and version assets: `?v={{ ASSET_VERSION }}`
- Use Bootstrap form controls
- Multi-language: always use the i18n framework (`{% trans %}` in templates,
  `gettext`/`gettext_lazy` in views)

### JavaScript

- Vanilla JavaScript only (no frameworks/jQuery)
- Wrap in `document.addEventListener("DOMContentLoaded", ...)`
- Use `const` and `let`, avoid `var`
- Object actions (delete, update, approve, status, assign) **must** use AJAX + SweetAlert2
  with translatable responses — never plain form redirects

### Environment Configuration

- Use `python-decouple` for environment variables
- Never commit `.env` file (see `.gitignore`)

## Architecture

**App Structure**
```
core/         # Project settings, root URLs, context processors, WSGI/ASGI
frontend/     # Public templates/views (home, portfolio), hosts wizard routes
dashboard/    # Domain app: models, views, price_engine, signals, utils, static, templates
user_auth/    # User + UserProfile role system, login/logout/profile
locale/       # Compiled translations (en/fr/ar)
```

**Key Patterns**
- Service layer: `dashboard/price_engine.py` (pure pricing functions),
  `dashboard/email_service.py`, `dashboard/pdf_generator.py`, `dashboard/utils.py`
- Wizard-based design requests (AJAX steps orchestrated by `wizard.js`, submitted via
  `submit_design_request` under `transaction.atomic()`)
- Realtime notifications: `notify_user()` → `Notification` row + EventStream channel
- Kanban CRM with AJAX status updates and a filter modal (custom_select + search)

**IMPORTANT:** `Space` has no duration/delivery field — `estimated_days` was deliberately
removed (migration `dashboard/0019`). Do not reintroduce it. `DesignPackage` /
`DesignOption` keep their own `delivery_time_days`.

## Dependencies

See `requirements.txt`: Django 5.2.5, daphne, django-eventstream, redis,
python-decouple, djlint, pillow, psycopg2, twisted, and related ASGI deps.

## Testing Guidelines

- Place tests in `<app>/tests.py`
- Test model methods and view responses (including AJAX JsonResponse shapes)
- Run single test: `python manage.py test app.tests.TestClass.test_method`

## Development Guidelines

You must strictly apply these rules:
- Always use `dashboard/templates/components/custom_select.html` instead of generic `<select>`
- Always use `dashboard/templates/components/pagination.html` on list views
- Always add the `.form` class to forms
- Always use `partials/errorList.html` to deal with form errors
- Always use `{% block <name> %}` / `{% endblock <name> %}` to define blocks
- Send a system-level notification when you finish a task
- Keep brand consistency based on `frontend/static/css/index.css` tokens — do not re-declare
  the color palette, reference the existing variables
- Dashboard pages follow the dark liquid-glass theme in `dashboard/static/css/dash_index.css`
  (scoped to `.dashContent`) — never apply light backgrounds or dark-on-dark text there
- Be creative with your design
- Separate JS and CSS from template files
- Use Bootstrap form controls
- It's a multi-language website: always use the i18n framework in templates and views
- When writing CSS, always target both `[dir="ltr"]` and `[dir="rtl"]`
- Write helper functions in `<app>/utils.py`
- All imports at the top of the Python file
- Use `TextChoices` for choices fields
- Always use SweetAlert for confirmation when deleting/updating an object
- Always use AJAX instead of standard form redirects for object actions (delete, update,
  approve, etc.) to provide dynamic and translatable SweetAlert responses
