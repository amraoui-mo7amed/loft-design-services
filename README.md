# Loft Design — Interior Design Service Platform

A full-featured interior design service platform built on Django. Clients submit design requests through a 10-step wizard, designers manage deliverables, and admins orchestrate the entire workflow via a Kanban CRM. Includes a built-in marketplace for product recommendations tied to designed spaces.

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [User Roles & Permissions](#user-roles--permissions)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Project Structure](#project-structure)
- [Design Service Wizard](#design-service-wizard)
- [API Endpoints](#api-endpoints)
- [Development Guide](#development-guide)
- [Customization](#customization)

---

## Key Features

### Design Service Platform
- **10-Step Design Request Wizard**: Project type selection, floor configuration, space selection with live pricing, package selection, extra options, inspiration gallery with style filters, questionnaire, file uploads (drag-and-drop), summary review, and confirmation
- **Live Price Engine**: Real-time price calculation as users select spaces, packages, and options — updates without page refresh
- **Inspiration Gallery**: Browse and select reference images filtered by space and design style

### CRM & Workflow
- **Admin Kanban Board**: Drag-and-drop project management across 9 status stages (New → Qualified → Quote Sent → Waiting Payment → Design → Revision → Delivered → Completed → Cancelled)
- **Designer Workspace**: Upload deliverables, add internal notes, track revisions, view client info
- **Customer Dashboard**: Track project progress, view/download deliverables, approve/reject, activity timeline

### Communication & Notifications
- **Real-Time Chat**: Project-level messaging between client and designer via EventStream (SSE)
- **In-App Notifications**: Bell dropdown with real-time updates via EventStream
- **Email Notifications**: Automated emails for project submission, quote ready, designer assignment, deliverable upload, project delivery
- **Activity Logs**: Full audit trail for every project action

### Marketplace Integration
- **Product Catalog**: Browse/search products by category with space-based recommendations
- **Shopping Cart & Checkout**: Full e-commerce flow with quantity management, address, payment method selection
- **Space-Product Recommendations**: Every room type can have curated product suggestions
- **Order History**: Track past purchases

### Infrastructure
- **Dockerized**: PostgreSQL, Redis, and Daphne (ASGI) — one-command setup
- **Multi-Language**: Arabic (RTL), English (LTR), French (LTR) with automatic layout switching
- **AJAX-First**: All form submissions use AJAX with SweetAlert2 feedback and inline error display
- **PDF Generation**: Quotes and invoices generated as PDF (weasyprint)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 5.2+, ASGI via Daphne |
| **Database** | PostgreSQL (Docker) / SQLite (local fallback) |
| **Cache/Real-time** | Redis + Django EventStream (SSE) |
| **Frontend** | Bootstrap 5.3, Font Awesome, AOS, SortableJS |
| **Templating** | Django Templates with i18n |
| **Environment** | python-decouple |
| **PDF** | WeasyPrint |
| **Payments** | Stripe / PayPal / Manual Transfer (pluggable) |

---

## Architecture Overview

### App Structure

```
core/                   → Project settings, ASGI/WSGI config, URL routing, context processors
dashboard/              → All business logic (models, views, templates, static files)
    models/             → 27 models across 8 files
    views/              → design (admin CRUD), wizard, wizard_api, customer, designer, admin_crm, chat, file_manager, marketplace
    templates/dashboard/→ design/, wizard/, customer/, designer/, admin/, chat/, marketplace/, email/, pdf/
    static/             → css/, js/ (wizard, kanban, chat, design-service)
frontend/               → Public-facing pages (home, design service landing)
user_auth/              → User model, auth views, role system
locale/                 → Translation files (ar/en/fr)
```

### Database Schema (27 Models)

**Catalog:**
`ProjectType` → `ProjectTypeSpace` (M2M through) ← `Space`
`DesignPackage`, `DesignOption`, `StyleCategory`, `InspirationImage`

**Requests:**
`DesignRequest` → `DesignRequestFloor` → `DesignRequestSpace` → `DesignRequestInspiration`
`DesignRequest` → `DesignRequestOption`
`DesignRequest` → `DesignRequestFile`

**Communication:**
`DesignRequest` → `DesignMessage`
`DesignRequest` → `DesignRevision`
`DesignRequest` → `DesignDeliverable`
`DesignRequest` → `DesignNote` (internal only)
`DesignRequest` → `DesignActivityLog`

**Payments:**
`DesignRequest` → `DesignPayment`

**Marketplace:**
`ProductCategory` → `Product`
`Space` ← `SpaceProductRecommendation` → `Product`
`User` → `Cart` → `CartItem` → `Product`
`User` → `Order` → `OrderItem` → `Product`

---

## User Roles & Permissions

The system has three roles defined as a `role` field on `UserProfile`:

| Role | Permissions | Dashboard Access |
|------|------------|-----------------|
| **Admin** | Full system access. Manage catalog (project types, spaces, packages, options, styles, inspirations, products). View all projects. Assign designers. Update statuses via Kanban. Manage users. | "Dashboard", "Users", "Design Catalog", "Project CRM", "My Projects", "Designer" |
| **Designer** | View assigned projects. Upload deliverables. Add internal notes. Chat with clients. Track revisions. | "Dashboard", "Designer" |
| **Customer** | Create design requests via wizard. View own projects. Download deliverables. Approve/reject deliverables. Chat with designer. Browse marketplace, cart, checkout. | "Dashboard", "My Projects" |

### Decorator Usage

```python
from dashboard.decorator import admin_required, designer_required, customer_required

@admin_required
def admin_view(request): ...

@designer_required
def designer_view(request): ...

@customer_required
def customer_view(request): ...
```

Role is checked against `UserProfile.role`. Superusers bypass all role checks and have admin access.

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/amraoui-mo7amed/dj-starter-kit
cd dj-starter-kit
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Generate a secure key for `APP_SECRET`:
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_SECRET` | Django secret key | *(auto-generated if empty)* |
| `APP_ENV` | `development` or `production` | `development` |
| `APP_ALLOWED_HOSTS` | Comma-separated domains | `localhost,127.0.0.1,*` |
| `DB_ENGINE` | Database backend | `django.db.backends.postgresql` (Docker) / `sqlite3` (local) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL credentials | Pre-configured for Docker |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | `redis`, `6379` |
| `EMAIL_*` | SMTP settings | — |

### 3. Database Setup

```bash
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Seed Catalog Data (Optional)

Log into Django admin (`/admin/`) and populate:
- Project Types (Villa, Apartment, Office, Restaurant, etc.)
- Spaces (Living Room, Kitchen, Bedroom, Bathroom, etc.)
- Design Packages (Essential, Premium, Executive)
- Design Options (Virtual Tour, Lighting Plan, etc.)
- Style Categories (Modern, Scandinavian, Japandi, etc.)
- Inspiration Images (upload per space + style combination)

---

## Docker Setup

```bash
# One-time setup
cp .env.example .env
docker compose up -d

# Run migrations
docker compose exec web python manage.py migrate

# Create superuser
docker compose exec web python manage.py createsuperuser
```

### Services

| Service | Image | Purpose |
|---------|-------|---------|
| `web` | *(builds from Dockerfile)* | Django ASGI (Daphne) on port 8000 |
| `db` | `postgres:16-alpine` | Persistent data storage |
| `redis` | `redis:7-alpine` | EventStream channels + caching |

### Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose logs -f web` | Follow web logs |
| `docker compose exec web python manage.py shell` | Django shell |
| `docker compose exec web python manage.py makemigrations` | Create migrations |
| `docker compose exec web python manage.py migrate` | Apply migrations |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop + delete volumes (wipes DB) |

> **Note:** When running locally (without Docker), the app auto-falls back to SQLite. No config changes needed.

---

## Project Structure

```
dj-starter-kit/
├── core/                       # Django project settings
│   ├── settings.py
│   ├── urls.py                 # Root URL configuration
│   ├── asgi.py                 # Daphne ASGI entry point
│   └── context_processors.py   # Site branding config
├── dashboard/                  # Main application
│   ├── models/                 # 27 models in 8 files
│   │   ├── __init__.py
│   │   ├── notification.py
│   │   ├── base.py             # ProjectType, Space, ProjectTypeSpace
│   │   ├── catalog.py          # Package, Option, StyleCategory, InspirationImage
│   │   ├── requests.py         # DesignRequest + floors/spaces/options/files
│   │   ├── communication.py    # Message, Revision, Deliverable, Note, ActivityLog
│   │   ├── payments.py         # DesignPayment
│   │   └── marketplace.py      # Product, Cart, Order
│   ├── views/
│   │   ├── design.py           # Admin CRUD for catalog
│   │   ├── wizard.py           # 10-step wizard + submission
│   │   ├── wizard_api.py       # JSON API endpoints
│   │   ├── customer.py         # Customer project dashboard
│   │   ├── designer.py         # Designer workspace
│   │   ├── admin_crm.py        # Kanban CRM
│   │   ├── chat.py             # Real-time messaging
│   │   ├── file_manager.py     # File upload/listing
│   │   └── marketplace.py      # Product catalog, cart, checkout
│   ├── templates/dashboard/
│   │   ├── design/             # Admin CRUD templates (12 files)
│   │   ├── wizard/             # 10 step partials
│   │   ├── customer/           # Customer project list + detail
│   │   ├── designer/           # Designer project list + detail
│   │   ├── admin/              # Kanban board
│   │   ├── chat/               # Chat widget
│   │   ├── marketplace/        # Product list, detail, cart, checkout, orders
│   │   ├── email/              # Email templates
│   │   └── pdf/                # Quote/invoice PDF templates
│   ├── static/
│   │   ├── css/                # wizard.css, kanban.css, etc.
│   │   └── js/                 # wizard.js, kanban.js, chat.js, etc.
│   ├── price_engine.py         # Price calculation logic
│   ├── pdf_generator.py        # weasyprint PDF generation
│   ├── email_service.py        # Email sending helpers
│   ├── signals.py              # Signal handlers for notifications + emails
│   ├── decorator.py            # Role-based access decorators
│   └── context_processors.py   # Sidebar menu
├── frontend/                   # Public-facing pages
│   ├── views/                  # Home + Design Service landing
│   ├── templates/              # base index.html, home, design_service.html
│   └── static/                 # CSS/JS for landing page
├── user_auth/                  # Authentication
│   ├── models.py               # UserProfile with role field
│   ├── views.py                # Login, signup, logout
│   └── templates/auth/         # Login/signup pages
├── locale/                     # Translations (ar, en, fr)
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## Design Service Wizard

The wizard is the core user flow for submitting design requests. It uses a **hybrid approach**: server-rendered step partials loaded via AJAX, with live price updates via JSON API.

### Step-by-Step Flow

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/design-service/request/step/project-type/` | Select project type (Villa, Apartment, Office, etc.) |
| 2 | `/design-service/request/step/floors/` | Add/rename/duplicate/reorder floors |
| 3 | `/design-service/request/step/spaces/` | Select rooms per floor with live subtotal |
| 4 | `/design-service/request/step/packages/` | Choose package (Essential/Premium/Executive) |
| 5 | `/design-service/request/step/options/` | Add extra services (Virtual Tour, Lighting Plan, etc.) |
| 6 | `/design-service/request/step/inspirations/` | Browse gallery filtered by space + style, select favorites |
| 7 | `/design-service/request/step/questionnaire/` | Personal info, project details, preferences |
| 8 | `/design-service/request/step/uploads/` | Drag-and-drop file uploads (PDF, DWG, DXF, SKP, images, etc.) |
| 9 | `/design-service/request/step/summary/` | Review all selections, price breakdown, accept terms |
| 10 | `/design-service/request/step/confirmation/` | Submission confirmation with project number |

### Live Pricing

The wizard queries `GET /api/design/calculate-price/` on every selection change. The price engine calculates:
- **Subtotal** = sum of selected space base prices
- **Package price** = subtotal × package multiplier
- **Options total** = sum of selected option prices
- **Tax** = 19% VAT on (subtotal + package + options)
- **Total** = subtotal + package + options + tax
- **Delivery estimate** = max estimated_days across selected spaces

---

## API Endpoints

### Wizard API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/design/project-types/` | List active project types |
| GET | `/api/design/spaces/?project_type=slug` | List spaces (optionally filtered by project type) |
| GET | `/api/design/packages/` | List active packages |
| GET | `/api/design/options/` | List active options |
| GET | `/api/design/inspirations/?space_id=X&style_id=Y` | Filtered inspiration images |
| GET | `/api/design/calculate-price/?space_ids[]=X&package_id=Y&option_ids[]=Z` | Live price calculation |
| POST | `/api/design/requests/` | Submit design request (JSON body) |

### Chat API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/design/chat/<uuid>/send/` | Send a message |
| GET | `/api/design/chat/<uuid>/messages/` | Get message history |

### File API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/design/files/<uuid>/upload/` | Upload a file |
| GET | `/api/design/files/<uuid>/` | List project files |

### Admin CRM
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/dashboard/crm/update-status/<pk>/` | Update project status (drag-and-drop) |
| POST | `/dashboard/crm/assign-designer/<pk>/` | Assign designer to project |

---

## Development Guide

### Creating an AJAX-Compatible View

The project uses a centralized JavaScript handler for forms with the `.form` class:

```python
from django.http import JsonResponse
from django.utils.translation import gettext_lazy as _

def your_view(request):
    if request.method == "POST":
        errors = []
        if not request.POST.get("name"):
            errors.append(_("Name is required."))
        if errors:
            return JsonResponse({"success": False, "errors": errors})
        return JsonResponse({
            "success": True,
            "message": _("Action completed successfully!"),
            "redirect_url": "/dashboard/success/"
        })
```

```html
{% include "partials/errorList.html" with form_id="yourFormId" %}
<form id="yourFormId" class="form" method="post">...</form>
```

### Adding a New Model

1. Create file in `dashboard/models/` (e.g., `features.py`)
2. Import in `dashboard/models/__init__.py`
3. Register in `dashboard/admin.py`
4. Run `python manage.py makemigrations dashboard && python manage.py migrate`

### Adding a New Admin CRUD

1. Add view functions in `dashboard/views/design.py`
2. Create list + form templates in `dashboard/templates/dashboard/design/`
3. Add URL patterns in `dashboard/urls.py`
4. Run `python manage.py makemigrations dashboard && python manage.py migrate`

### Adding Email Templates

1. Create HTML file in `dashboard/templates/dashboard/email/`
2. Add send function in `dashboard/email_service.py`
3. Wire up in `dashboard/signals.py` if auto-triggered

---

## Customization

### 1. Branding
Edit `site_config` in `core/context_processors.py` to change name, logo, tagline, colors, SEO, social links.

### 2. Dashboard Navigation
Edit `dashboard_menu` in `dashboard/context_processors.py`. Add new menu items with role-based visibility.

### 3. Pricing
- **Base prices**: Edit Spaces in Django admin
- **Package multipliers**: Edit Packages in Django admin
- **Option prices**: Edit Design Options in Django admin
- **Tax rate**: Edit `TAX_RATE` in `dashboard/price_engine.py`

### 4. Email Settings
Configure SMTP via `.env` variables (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`).

---

## License

This is a commercial design service platform boilerplate. Customize and extend as needed.
"# loft-design-services" 
