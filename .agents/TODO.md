# TODO List

- [x] Start implementing all the changes by the exact details in `report.docx`
  - [x] Multilingual Arabic (AR) & RTL support configured in `core/settings.py` and stylesheets.
  - [x] `ServicePricing` enhanced with percentage of project cost model (`percent_project_cost`), bounds (`percentage_rate`, `min_fee`, `max_fee`), and transactional single default enforcement.
  - [x] `ServiceTranslation` model with fallback strategy (`requested -> fr -> first -> base`).
  - [x] Comprehensive Commercial Quote System (`Quote`, `QuoteItem`, `QuoteSpace`, `QuoteAuditEvent`) with revision trees, financial audit logs, and origin tracking.
  - [x] Deterministic Pricing Engine functions in `dashboard/price_engine.py` (`calculate_service_fee`, `calculate_discount`, `calculate_quote_financials`).
  - [x] Admin Service Catalog Management UI with 3-language tabs (FR, EN, AR with RTL), percentage bounds configuration, and single default invariant.
  - [x] Customer Project Composer (Step 2 Services) with Details modal/drawer, live percentage of project cost budget input, stopPropagation handling, and single default preselection.
  - [x] Admin Quote Management (List, KPIs, Filter Toolbar, Detail Overview with revision history and audit log, Quote Builder, Discount Modal, Revision Generation, and Send/Resend via Email with PDF).
  - [x] Updated Facturation PDF template and generator to render discounts, client notes, and revision numbers.
  - [x] Multilingual translations updated for FR, EN, AR.
  - [x] Automated test suite in `dashboard/tests/test_services_and_quotes.py`.