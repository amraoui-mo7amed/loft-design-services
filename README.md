# Loft Design — Interior Design Service Platform

A full-featured interior design service platform built on Django. Clients submit design requests through a multi-step wizard, designers manage deliverables, and admins orchestrate the entire workflow via a Kanban CRM. Includes a built-in marketplace for product recommendations tied to designed spaces.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema (28 Models)](#database-schema-28-models)
- [User Roles & Permissions](#user-roles--permissions)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Project Structure](#project-structure)
- [Design Service Wizard](#design-service-wizard)
- [Admin CRM (Kanban)](#admin-crm-kanban)
- [Marketplace](#marketplace)
- [360° Panorama Background](#360-panorama-background)
- [API Endpoints](#api-endpoints)
- [Real-Time Features](#real-time-features)
- [Email & Notifications](#email--notifications)
- [Translations & Multi-Language](#translations--multi-language)
- [Management Commands](#management-commands)
- [Development Guide](#development-guide)
- [Customization](#customization)

---

## Key Features

### Design Service Platform
- **Multi-Step Design Request Wizard**: Project type selection, floor configuration (add/rename/duplicate/reorder), space selection with live pricing, package selection, extra options, inspiration gallery with style filters, questionnaire, file uploads (drag-and-drop), summary review, and confirmation
- **Live Price Engine**: Real-time price calculation as users select spaces, packages, and options — updates without page refresh
- **Inspiration Gallery**: Browse and select reference images filtered by space
- **Inquiry System**: Quick inquiry form on landing page with automated admin notifications

### CRM & Workflow
- **Admin Kanban Board**: Drag-and-drop project management across status stages (New → Qualified → Quote Sent → Waiting Payment → In Progress → Revision → Delivered → Completed → Cancelled)
- **Designer Workspace**: Upload deliverables, add internal notes, track revisions, view client info
- **Customer Dashboard**: Track project progress, view/download deliverables, approve/reject, activity timeline
- **Activity Logs**: Full audit trail for every project action (creation, status changes, messages, deliverables, payments)

### Real-Time Communication
- **Real-Time Chat**: Project-level messaging between client and designer via EventStream (SSE)
- **In-App Notifications**: Bell dropdown with real-time updates via EventStream — supports info, success, warning, error types
- **Email Notifications**: Automated emails for project submission, designer credentials, status updates, inquiry updates

### Marketplace Integration
- **Product Catalog**: Browse/search products by category with space-based recommendations
- **Shopping Cart & Checkout**: Full e-commerce flow with quantity management, shipping address, payment method selection
- **Space-Product Recommendations**: Every room type can have curated product suggestions
- **Order History**: Track past purchases with order status

### Admin Catalog Management
- **Project Types**: Manage types (Residential, Commercial, Outdoor, etc.) with associated spaces
- **Spaces**: Manage rooms (Living Room, Kitchen, Bedroom, etc.) with base pricing
- **Space Categories**: Group spaces (Interior, Exterior)
- **Design Packages**: Essential, Premium, Luxury — with price multipliers and service inclusions
- **Design Options**: Extra services (3D Walkthrough, Furniture Procurement, Lighting Design, Landscape Concept)
- **Style Categories**: Design styles (Modern, Industrial, Scandinavian)
- **Inspiration Images**: Upload reference images per space
- **Service Categories**: Group options by type
- **Pricing Configuration**: Tax rate, revision count, currency symbol, default delivery days

### Infrastructure
- **Dockerized**: PostgreSQL, Redis, and Daphne (ASGI) — one-command setup
- **Multi-Language**: Arabic (RTL), English (LTR), French (LTR) with automatic layout switching
- **AJAX-First**: All forms use AJAX with SweetAlert2 feedback and inline error display
- **PDF Generation**: Quotes generated as PDF via WeasyPrint
- **360° Panorama Background**: Three.js-powered rotating panoramic background on the landing page
- **Glassmorphism UI**: Modern glass-effect cards with backdrop-filter on the landing page

---

## Tech Stack

| Layer             | Technology                                          |
|-------------------|-----------------------------------------------------|
| **Backend**       | Django 5.2+, ASGI via Daphne                        |
| **Database**      | PostgreSQL 16 (Docker) / SQLite (local fallback)    |
| **Cache/Real-time** | Redis 7 + Django EventStream (SSE)                |
| **Frontend**      | Bootstrap 5.3, Font Awesome 5, Three.js r128        |
| **Templating**    | Django Templates with i18n (`gettext`)              |
| **Environment**   | python-decouple                                     |
| **PDF**           | WeasyPrint                                          |
| **JS Libraries**  | SortableJS (Kanban drag-and-drop), SweetAlert2      |
| **Container**     | Docker + Docker Compose                             |
| **Languages**     | Arabic (`ar`), English (`en`), French (`fr`)        |

---

## Architecture Overview

### Application Structure

```
loft-design-services/
├── core/                   → Project settings, ASGI/WSGI, root URL routing, context processors
├── dashboard/              → All business logic (models, views, templates, static, services)
│   ├── models/             → 27 models across 8 files
│   ├── views/              → 15 view files (design, wizard, wizard_api, customer, designer,
│   │                         admin_crm, chat, file_manager, marketplace, notifications, etc.)
│   ├── templates/          → ~55 template files
│   ├── static/             → 10 CSS + 13 JS files
│   ├── price_engine.py     → Live price calculation engine
│   ├── pdf_generator.py    → WeasyPrint quote PDF generation
│   ├── email_service.py    → Email sending helpers
│   ├── signals.py          → Signal handlers for notifications + emails
│   ├── decorator.py        → Role-based access decorators + pagination utility
│   └── context_processors.py → Sidebar menu builder
├── frontend/               → Public-facing pages (home, order, design service landing)
│   ├── views/              → Home, Order, Inquiry, Design Service landing
│   ├── templates/          → Index, Home, Order, Design Service, components, partials
│   └── static/             → 5 CSS + 5 JS files (including Three.js 360° panorama)
├── user_auth/              → Authentication + UserProfile with role system
│   ├── models.py           → UserProfile (role, profile picture, bio, phone, etc.)
│   ├── views.py            → Login, logout, profile edit
│   └── templates/auth/     → Login, profile edit
├── locale/                 → Translation files (ar/, en/, fr/)
├── media/                  → User-uploaded files (design requests, deliverables)
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

### Three-Tier View Architecture

1. **Public Layer** (`frontend/`): Landing page with 360° panorama, space pricing cards, design service landing with project types/packages/styles/FAQs, inquiry form
2. **Auth Layer** (`user_auth/`): Login, profile management
3. **Dashboard Layer** (`dashboard/`): Full CRM with Kanban, admin catalog CRUD, designer workspace, customer project dashboard, marketplace, real-time chat

---

## Database Schema (28 Models)

### `user_auth` (1 model)

**`UserProfile`** — Extends Django `User` with role-based access
| Field | Type | Notes |
|-------|------|-------|
| `user` | OneToOneField(User) | CASCADE, related_name="profile" |
| `profile_picture` | ImageField | Nullable |
| `bio` | TextField | max_length=500 |
| `birth_date` | DateField | Nullable |
| `sex` | CharField(10) | Choices: male/female/other |
| `phone_number` | CharField(20) | |
| `address` | CharField(255) | |
| `role` | CharField(20) | Choices: customer/designer/admin, default=customer |
| `is_approved` | BooleanField | default=False |
| `created_at` | DateTimeField | auto_now_add |

### `dashboard` (27 models across 8 files)

#### `base.py` — Core Structure
- **`ProjectType`**: name, slug, description, image, active, sort_order
- **`SpaceCategory`**: name, description
- **`Space`**: name, slug, image, category (legacy), space_category (FK), base_price, active
- **`ProjectTypeSpace`** (M2M through): project_type ↔ space, sort_order

#### `catalog.py` — Packages & Options
- **`ServiceCategory`**: name, description
- **`DesignPackage`**: name, description, delivery_time_days, price_multiplier, services_after_payment, active
- **`DesignOption`**: name, slug, description, price, delivery_time_days, category (FK ServiceCategory), active
- **`PackageService`** (M2M through): package ↔ option, price, sort_order
- **`StyleCategory`**: name, slug, description
- **`InspirationImage`**: space (FK), image, title, active

#### `inquiry.py` — Lead Capture
- **`Inquiry`**: first_name, last_name, email, phone, spaces (JSON), total, status (pending/approved/declined), is_read

#### `requests.py` — Design Requests
- **`DesignRequest`**: uuid (unique), client (FK User), first_name, last_name, email, phone, project_name, project_type (FK), status, budget, total, designer (FK User), delivery_date, revision_count, package (FK DesignPackage), timestamps. Property: `project_number` = LOFT-YYYY-XXXX
- **`DesignRequestFloor`**: design_request (FK), name, level, order
- **`DesignRequestSpace`**: design_request (FK), floor (FK), space (FK), custom_name, price_at_time
- **`DesignRequestOption`**: design_request (FK), option (FK), price_at_time
- **`DesignRequestInspiration`**: design_request_space (FK), inspiration_image (FK)
- **`DesignRequestFile`**: design_request (FK), file, file_type, uploaded_by (FK User)

#### `communication.py` — Messaging & Deliverables
- **`DesignMessage`**: design_request (FK), sender (FK User), message, attachment, is_read
- **`DesignRevision`**: design_request (FK), revision_number, requested_by (FK User), reason, status (pending/in_progress/completed)
- **`DesignDeliverable`**: design_request (FK), title, file, file_type, version, uploaded_by (FK User), approved_at
- **`DesignNote`** (internal only): design_request (FK), author (FK User), note, is_internal
- **`DesignActivityLog`**: design_request (FK), actor (FK User), action, description

#### `payments.py`
- **`DesignPayment`**: design_request (FK), amount, payment_method (stripe/paypal/manual), transaction_id, status (pending/completed/failed/refunded)

#### `pricing.py`
- **`PricingConfig`** (singleton, pk=1): tax_rate (default 19%), default_revision_count (2), currency_symbol (DA), default_delivery_days (30)

#### `marketplace.py` — E-Commerce
- **`ProductCategory`**: name, slug, description, image
- **`Product`**: name, slug, description, price, image, category (FK), sku (unique), active
- **`SpaceProductRecommendation`**: space (FK) ↔ product (FK), priority
- **`Cart`**: user (FK User)
- **`CartItem`**: cart (FK), product (FK), quantity, price_at_time
- **`Order`**: user (FK User), status (pending/confirmed/shipped/delivered/cancelled), total, payment_method, shipping_address
- **`OrderItem`**: order (FK), product (FK), quantity, price_at_time

#### `notification.py`
- **`Notification`**: user (FK User), title, message, notification_type (info/success/warning/error), is_read, link

---

## User Roles & Permissions

Three roles defined as a `role` field on `UserProfile`:

| Role      | Permissions | Dashboard Access |
|-----------|-------------|-----------------|
| **Admin** | Full system access. Manage catalog (project types, spaces, packages, options, styles, inspirations, products, pricing). View all projects. Assign designers. Update statuses via Kanban. Manage users. Manage inquiries. | "Dashboard", "Design Catalog" (5 sub-items), "Project CRM", "Inquiries", "My Projects", "Designer" |
| **Designer** | View assigned projects. Upload deliverables. Add internal notes. Chat with clients. Track revisions. | "Dashboard", "Designer" |
| **Customer** | Create design requests via wizard. View own projects. Download deliverables. Approve/reject deliverables. Chat with designer. Browse marketplace, cart, checkout. | "Dashboard", "My Projects" |

### Decorators

```python
from dashboard.decorator import admin_required, designer_required, customer_required

@admin_required
def admin_view(request): ...

@designer_required
def designer_view(request): ...

@customer_required
def customer_view(request): ...
```

Superusers bypass all role checks.

---

## Getting Started

### Prerequisites

- Python 3.12+
- Docker & Docker Compose (recommended) OR PostgreSQL + Redis installed locally
- GNU gettext tools (for translations)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/loft-design-services
cd loft-design-services
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
| `APP_SECRET` | Django secret key | Required |
| `APP_ENV` | `development` or `production` | `development` |
| `APP_ALLOWED_HOSTS` | Comma-separated domains | `localhost,127.0.0.1` |
| `DB_ENGINE` | Database backend | `django.db.backends.postgresql` (Docker) / `sqlite3` (local) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL credentials | Pre-configured for Docker |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | `redis`, `6379` |
| `EMAIL_*` | SMTP settings | — |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Auto-created admin | `admin`, `admin@loftdesign.com`, `admin123` |

### 3. Database Setup

```bash
python manage.py migrate
```

### 4. Create Superuser & Seed Data

```bash
python manage.py init_admin    # Creates admin from .env vars
python manage.py seed_catalog  # Seeds 3 project types, 18 spaces, 3 packages, 4 options, 3 styles
```

Optional seed commands:
```bash
python manage.py seed_users          # Seeds random users
python manage.py seed_space_images   # Downloads real images for spaces
python manage.py seed_inspirations   # Downloads inspiration images
```

### 5. Run Development Server

```bash
python manage.py runserver
```

---

## Docker Setup

```bash
# One-time setup
cp .env.example .env
docker compose up -d

# The startup script automatically:
# 1. Runs makemigrations for user_auth + dashboard
# 2. Applies all migrations
# 3. Creates admin superuser (from .env)
# 4. Seeds catalog data
# 5. Starts Daphne ASGI server on port 8000
```

### Services

| Service | Image | Purpose |
|---------|-------|---------|
| `web` | *(builds from Dockerfile)* | Django ASGI (Daphne) on port 8000 |
| `db` | `postgres:16-alpine` | Persistent data storage with healthcheck |
| `redis` | `redis:7-alpine` | EventStream channels + caching with healthcheck |

### Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose logs -f web` | Follow web logs |
| `docker compose exec web python manage.py shell` | Django shell |
| `docker compose exec web python manage.py makemigrations` | Create migrations |
| `docker compose exec web python manage.py migrate` | Apply migrations |
| `docker compose exec web python manage.py makemessages -l fr` | Generate French translation file |
| `docker compose exec web python manage.py compilemessages` | Compile translations |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop + delete volumes (wipes DB) |
| `docker compose restart web` | Restart web service (picks up code changes) |

> **Note:** The project directory is mounted as a volume at `/app`, so code changes on the host are reflected immediately (Daphne auto-reloads).

---

## Project Structure

```
loft-design-services/
├── core/
│   ├── settings.py              # Django settings (DB, i18n, static, middleware)
│   ├── urls.py                  # Root URL routing (~35 URL patterns)
│   ├── asgi.py / wsgi.py        # ASGI (Daphne) + WSGI entry points
│   └── context_processors.py    # Site branding config (name, colors, SEO, social)
│
├── dashboard/                   # Main application (~92 view functions)
│   ├── models/                  # 27 models in 8 files
│   │   ├── __init__.py          # Re-exports all models
│   │   ├── base.py              # ProjectType, Space, SpaceCategory, ProjectTypeSpace
│   │   ├── catalog.py           # DesignPackage, PackageService, ServiceCategory, DesignOption, StyleCategory, InspirationImage
│   │   ├── communication.py     # DesignMessage, DesignRevision, DesignDeliverable, DesignNote, DesignActivityLog
│   │   ├── inquiry.py           # Inquiry
│   │   ├── marketplace.py       # ProductCategory, Product, SpaceProductRecommendation, Cart, CartItem, Order, OrderItem
│   │   ├── notification.py      # Notification
│   │   ├── payments.py          # DesignPayment
│   │   ├── pricing.py           # PricingConfig
│   │   └── requests.py          # DesignRequest, DesignRequestFloor, DesignRequestSpace, DesignRequestOption, DesignRequestInspiration, DesignRequestFile
│   ├── views/                   # 15 view files
│   │   ├── admin_crm.py         # Kanban board, project detail, inquiry list
│   │   ├── chat.py              # Real-time messaging (send + list)
│   │   ├── customer.py          # Customer project list, detail, deliverable approval
│   │   ├── dashboard.py         # Dashboard home with stats
│   │   ├── design.py            # Admin CRUD (project types, spaces, packages, options, styles, inspirations)
│   │   ├── designer.py          # Designer workspace, deliverable upload, notes
│   │   ├── file_manager.py      # File upload/list with type validation
│   │   ├── genric.py            # BaseDeleteView (AJAX deletion)
│   │   ├── marketplace.py       # Product catalog, cart, checkout, orders
│   │   ├── notifications.py     # SSE stream, unread count, mark read, delete
│   │   ├── pricing.py           # Pricing config CRUD
│   │   ├── users.py             # Designer management (list, create, approve, delete, assign)
│   │   ├── wizard.py            # Design request wizard (6 steps)
│   │   └── wizard_api.py        # JSON API for live pricing + catalog data
│   ├── templates/
│   │   ├── components/          # Reusable: action_buttons, custom_select, notification_dropdown, pagination, stat_card, table_search
│   │   ├── dash/                # Dashboard home pages
│   │   ├── dashboard/admin/     # Kanban board, project detail, pricing, inquiries
│   │   ├── dashboard/chat/      # Chat widget partial
│   │   ├── dashboard/customer/  # Customer project list + detail
│   │   ├── dashboard/design/    # CRUD forms for all catalog models
│   │   ├── dashboard/designer/  # Designer project list + detail
│   │   ├── dashboard/email/     # Email templates (project submitted, status update, inquiry, designer credentials)
│   │   ├── dashboard/marketplace/ # Product list/detail, cart, checkout, orders
│   │   ├── dashboard/pdf/       # Quote PDF template
│   │   ├── dashboard/wizard/    # 9 wizard step partials
│   │   ├── email/               # Account activation email
│   │   ├── partials/            # Sidebar item partial
│   │   └── users/               # User management (designers)
│   ├── static/
│   │   ├── css/                 # 10 files (wizard, kanban, notifications, inquiries, etc.)
│   │   └── js/                  # 13 files (wizard, kanban, chat, notifications, etc.)
│   ├── admin.py                 # 28 models registered (all except PricingConfig, PackageService, ServiceCategory)
│   ├── urls.py                  # ~50 URL patterns
│   ├── price_engine.py          # calculate_subtotal, calculate_package_price, calculate_options_total, calculate_tax, estimate_delivery, calculate_full_price
│   ├── pdf_generator.py         # generate_quote_pdf (WeasyPrint)
│   ├── email_service.py         # send_email, send_project_submitted_email, send_status_update_email, send_inquiry_status_update_email
│   ├── signals.py               # Signal handlers for DesignRequest, DesignMessage, DesignDeliverable, DesignPayment
│   ├── decorator.py             # admin_required, designer_required, customer_required, with_pagination
│   └── context_processors.py    # Dashboard sidebar menu builder
│
├── frontend/                    # Public-facing pages
│   ├── views/
│   │   ├── main.py              # home_view (landing), order_view
│   │   ├── inquiry.py           # submit_inquiry (AJAX)
│   │   └── design_service.py    # landing_view (design service page)
│   ├── templates/
│   │   ├── index.html           # Base template (navbar, sidebar, footer, blocks)
│   │   ├── home.html            # Landing page with 360° bg, space cards, floating buttons
│   │   ├── order.html           # Order page
│   │   ├── frontend/            # Design service landing page
│   │   ├── components/          # Logo component
│   │   └── partials/            # errorList, language_switcher, custom_file_input
│   └── static/
│       ├── css/                 # index.css (brand), home.css, design-service.css, three-sixty-bg.css
│       ├── js/                  # index.js, home.js, design-service.js, order.js, three-sixty-bg.js
│       └── imgs/                # bg.jpeg (panorama)
│
├── user_auth/                   # Authentication
│   ├── models.py                # UserProfile
│   ├── views.py                 # login_view, logout_view, profile_edit_view
│   ├── urls.py                  # login/, logout/, profile/
│   ├── utils.py                 # create_user_account, user_profile_upload_path
│   ├── templates/auth/          # login.html, profile_edit.html
│   └── static/                  # auth.css, profile_edit.css, auth.js, login.js, profile_edit.js
│
├── locale/                      # Translation files
│   ├── ar/LC_MESSAGES/          # Arabic (django.po + .mo)
│   ├── en/LC_MESSAGES/          # English (django.po + .mo)
│   └── fr/LC_MESSAGES/          # French (django.po + .mo)
│
├── media/                       # Uploaded files (design request files, deliverables, profile pictures)
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Python 3.12-slim + gcc + gettext + libpq-dev
├── docker-compose.yml           # web + db + redis services
└── manage.py
```

---

## Design Service Wizard

The wizard is the core user flow for submitting design requests. It uses a **hybrid approach**: server-rendered step partials loaded via AJAX, with live price updates via JSON API.

### Step-by-Step Flow

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/request/step/combined/` | Select project type + configure floors (add/rename/duplicate/reorder) + select spaces per floor with live subtotal |
| 2 | `/request/step/packages/` | Choose package (Essential/Premium/Luxury) with price breakdown |
| 3 | `/request/step/inspirations/` | Browse inspiration gallery filtered by selected spaces |
| 4 | `/request/step/questionnaire/` | Personal info, project details, preferences, budget |
| 5 | `/request/step/summary/` | Review all selections, price breakdown, accept terms, submit |

### Live Pricing API

The wizard queries `GET /api/design/calculate-price/` on every selection change. The price engine calculates:
- **Subtotal** = sum of selected space base prices
- **Package price** = subtotal × package `price_multiplier`
- **Options total** = sum of selected option prices
- **Tax** = `PricingConfig.tax_rate`% on (subtotal + package + options)
- **Total** = subtotal + package + options + tax

### File Uploads

The wizard accepts files via drag-and-drop with type validation:
- Documents: PDF, DOC, DOCX
- Design files: DWG, DXF, SKP, GLB
- Images: JPG, PNG, GIF, WEBP
- Archives: ZIP, RAR
- Video: MP4

---

## Admin CRM (Kanban)

The Kanban board provides visual project management with drag-and-drop status updates.

### Status Workflow

```
New → Qualified → Quote Sent → Waiting Payment → In Progress → Revision → Delivered → Completed
                                                                                      ↓
                                                                                 Cancelled
```

### Features
- **Search/Filter**: By project name, client, status, designer
- **Pagination**: Configurable items per page
- **Drag-and-Drop**: Update status by dragging cards between columns (via SortableJS)
- **Quick Actions**: Assign designer, view project detail, delete project
- **Inline Stats**: Project count per status column

### Inquiry Management
- List all inquiries with search/filter
- View inquiry details (selected spaces, total, contact info)
- Update inquiry status (pending → approved/declined)
- Status changes trigger email notifications to the inquirer

---

## Marketplace

Full e-commerce features tied to designed spaces.

### Product Catalog
- Category-based filtering
- Product detail page with description, price, SKU
- Space-based product recommendations (curated per room type)
- Add to cart functionality

### Shopping Cart
- View cart items with quantities and prices
- Update quantities or remove items
- Price recalculation on quantity change
- Persistent per user

### Checkout & Orders
- Shipping address form
- Payment method selection
- Order placement (creates Order from Cart)
- Order status tracking (pending → confirmed → shipped → delivered → cancelled)
- Order history page

---

## 360° Panorama Background

The landing page features an **auto-rotating 360° panoramic background** powered by Three.js.

### Implementation
- **Library**: Three.js r128 (loaded via CDN)
- **Image**: `frontend/static/imgs/bg.jpeg` (equirectangular panorama)
- **Renderer**: SphereGeometry (radius 500, 64 segments) with `THREE.BackSide` material
- **Auto-rotation**: Continuous slow spin (0.0015 radians/frame, direction reverses for RTL)
- **Overlay**: Dark gradient (`rgba(0,0,0,0.65) → transparent → rgba(0,0,0,0.45)`) for readability
- **Glassmorphism**: Space cards use `backdrop-filter: blur(12px)` over the panorama
- **Floating Actions**: Language switcher + login buttons fixed on the right edge (column layout, icon-only)

### Files
| File | Purpose |
|------|---------|
| `frontend/static/js/three-sixty-bg.js` | Three.js scene initialization, texture loading, animation loop, resize handler |
| `frontend/static/css/three-sixty-bg.css` | Panorama container, overlay, floating actions bar, glass card styles |
| `frontend/static/imgs/bg.jpeg` | 360° panoramic image (~24MB) |
| `frontend/templates/home.html` | Panorama container with `data-panorama-src` attribute |

To replace the image, swap `frontend/static/imgs/bg.jpeg` with another equirectangular panoramic JPEG.

---

## API Endpoints

### Wizard API (JSON)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/design/project-types/` | List active project types |
| GET | `/api/design/spaces/?project_type=slug` | List spaces (filtered by project type) |
| GET | `/api/design/packages/` | List active packages |
| GET | `/api/design/options/` | List active options |
| GET | `/api/design/inspirations/?space_id=X` | Filtered inspiration images |
| GET | `/api/design/calculate-price/?space_ids[]=X&package_id=Y&option_ids[]=Z` | Live price calculation |
| POST | `/api/design/requests/` | Submit design request (JSON body) |
| POST | `/api/design/inquiries/` | Submit inquiry from landing page |

### Chat API (JSON)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/design/chat/<uuid>/send/` | Send a message (with optional attachment) |
| GET | `/api/design/chat/<uuid>/messages/` | Get message history |

### File API (JSON)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/design/files/<uuid>/upload/` | Upload a file (validates type) |
| GET | `/api/design/files/<uuid>/` | List project files |

### Admin CRM
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/dashboard/crm/update-status/<pk>/` | Update project status (drag-and-drop) |
| POST | `/dashboard/crm/assign-designer/<pk>/` | Assign designer to project |

### EventStream (SSE)
| Endpoint | Purpose |
|----------|---------|
| `/events/` | Django EventStream endpoint |
| `/dashboard/notifications/stream/` | User-specific notification stream |

---

## Real-Time Features

### Django EventStream (SSE)

The project uses Server-Sent Events for real-time updates without WebSockets:

1. **Notifications Stream**: Users subscribe to `/dashboard/notifications/stream/` via EventSource
2. **Unread Count**: Polled via GET `/dashboard/notifications/unread-count/`
3. **Notification List**: GET `/dashboard/notifications/list/` returns last 50 notifications
4. **Mark Read**: POST `/dashboard/notifications/<id>/read/` or `/dashboard/notifications/mark-all-read/`

### Chat
- Project-level messaging via POST/GET API endpoints
- Messages stored in `DesignMessage` model with optional file attachments
- Activity logs created on new messages

---

## Email & Notifications

### Automated Emails

| Event | Template | Triggered By |
|-------|----------|-------------|
| Project Submitted | `dashboard/email/project_submitted.html` | `DesignRequest.post_save` |
| Status Update | `dashboard/email/status_update.html` | `DesignRequest.post_save` (on status change) |
| Designer Credentials | `dashboard/email/designer_credentials.html` | `add_designer` view |
| Inquiry Update | `dashboard/email/inquiry_status_update.html` | `inquiry_detail` view (on status change) |

### Signal Handlers

| Signal | Action |
|--------|--------|
| `DesignRequest.post_save` | Create ActivityLog, notify admins (new/status change), send email |
| `DesignMessage.post_save` | Create ActivityLog |
| `DesignDeliverable.post_save` | Create ActivityLog, notify client |
| `DesignPayment.post_save` | Create ActivityLog (if completed) |

---

## Translations & Multi-Language

The platform supports three languages with automatic RTL detection:

| Language | Code | Direction |
|----------|------|-----------|
| Arabic | `ar` | RTL (right-to-left) |
| English | `en` | LTR (left-to-right) |
| French | `fr` | LTR (left-to-right) |

### Workflow

1. Mark strings for translation: `{% trans "Hello" %}` in templates, `_("Hello")` in Python
2. Extract messages: `python manage.py makemessages -l fr`
3. Edit the `.po` file in `locale/fr/LC_MESSAGES/django.po`
4. Compile: `python manage.py compilemessages`
5. Language switcher in the UI (globe icon dropdown with flag emojis)

---

## Management Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `init_admin` | Creates admin superuser from `.env` vars | `python manage.py init_admin` |
| `seed_catalog` | Seeds 3 project types, 18 spaces, 3 packages, 4 options, 3 styles, 4 inspirations | `python manage.py seed_catalog` |
| `seed_inspirations` | Downloads real inspiration images from picsum.photos | `python manage.py seed_inspirations` |
| `seed_space_images` | Downloads real Unsplash images for spaces | `python manage.py seed_space_images` |
| `seed_users` | Seeds randomized users with Arabic/English names | `python manage.py seed_users` |

---

## Development Guide

### Running Tests

```bash
python manage.py test                    # Run all tests
python manage.py test dashboard          # Run tests for dashboard app
python manage.py test dashboard.tests.TestClass
python manage.py test dashboard.tests.TestClass.test_method
```

### Linting

```bash
pip install djlint
djlint .                                 # Lint all templates
djlint . --reformat                      # Reformat templates
```

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
4. Use the existing `components/custom_select.html`, `components/pagination.html`, `partials/errorList.html`

### Adding Email Templates

1. Create HTML file in `dashboard/templates/dashboard/email/`
2. Add send function in `dashboard/email_service.py`
3. Wire up in `dashboard/signals.py` if auto-triggered

### Adding Translations

1. Wrap strings: `{% trans "Hello" %}` or `_("Hello")`
2. Extract: `python manage.py makemessages -l fr`
3. Edit `.po` file
4. Compile: `python manage.py compilemessages`

---

## Customization

### 1. Branding

Edit `site_config` in `core/context_processors.py` to change:
- `name` / `ar_name` — Brand name in English/Arabic
- `tagline` — Brand tagline
- `contact_email`, `phone` — Contact information
- `social` — Social media links (Facebook, Instagram, Pinterest)
- `seo` — Meta description and keywords
- `branding` — Color palette (primary, secondary, accent, success, danger, dark, light)

### 2. Dashboard Navigation

Edit `dashboard_menu` in `dashboard/context_processors.py`. Add new menu items with role-based visibility (`admin_only` flag).

### 3. Pricing

- **Base prices**: Edit Spaces in Django admin
- **Package multipliers**: Edit Packages in Django admin (`price_multiplier` field)
- **Option prices**: Edit Design Options in Django admin
- **Tax rate / currency**: Edit through Admin UI at `/dashboard/pricing/` or directly via `PricingConfig` model

### 4. Catalog Colors / Icons

Edit the `category` choices on `DesignOption` in `dashboard/models/catalog.py` and corresponding admin form icons.

### 5. Email Settings

Configure SMTP via `.env` variables (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`).

### 6. 360° Panorama Image

Replace `frontend/static/imgs/bg.jpeg` with an equirectangular panoramic JPEG (recommended: 4096×2048px).

### 7. Landing Page Content

Edit `frontend/views/design_service.py` and `frontend/templates/frontend/design_service.html` to modify the design service landing page content, FAQs, and feature sections.

---

## License

This is a commercial interior design service platform boilerplate. Customize and extend as needed.
