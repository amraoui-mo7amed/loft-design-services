from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext as _
import os
import logging

logger = logging.getLogger(__name__)


def normalize_facturation_context(context):
    """Ensure all expected keys exist with valid fallbacks for PDF templates."""
    ctx = dict(context or {})

    first_name = str(ctx.get("first_name") or "").strip()
    last_name = str(ctx.get("last_name") or "").strip()
    client_name = str(ctx.get("client_name") or "").strip()
    if not client_name:
        client_name = f"{first_name} {last_name}".strip() or str(_("Client"))

    doc_number = (
        ctx.get("doc_number")
        or ctx.get("quote_number")
        or (f"LOFT-QUO-{ctx.get('pk', 1):04d}" if ctx.get("pk") else "LOFT-DEV-001")
    )

    date_str = ctx.get("date") or timezone.now().strftime("%d/%m/%Y")

    project_type = (
        ctx.get("project_type")
        or ctx.get("project_type_name")
        or _("Architectural Design")
    )

    project_name = (
        ctx.get("project_name")
        or f"{project_type} - {client_name}".strip()
    )

    # Financial normalization
    try:
        final_tot = float(ctx.get("final_total") if ctx.get("final_total") is not None else (ctx.get("total") or 0))
    except (ValueError, TypeError):
        final_tot = 0.0

    try:
        subtotal_before = float(
            ctx.get("subtotal_before_discount")
            if ctx.get("subtotal_before_discount") is not None
            else final_tot
        )
    except (ValueError, TypeError):
        subtotal_before = final_tot

    try:
        discount_amount = float(ctx.get("discount_amount") or 0)
    except (ValueError, TypeError):
        discount_amount = 0.0

    try:
        subtotal_after = float(
            ctx.get("subtotal_after_discount")
            if ctx.get("subtotal_after_discount") is not None
            else (subtotal_before - discount_amount)
        )
    except (ValueError, TypeError):
        subtotal_after = subtotal_before - discount_amount

    try:
        tax_amount = float(ctx.get("tax_amount") or 0)
    except (ValueError, TypeError):
        tax_amount = 0.0

    try:
        est_proj_cost = float(ctx.get("estimated_total_project_cost") or 0)
    except (ValueError, TypeError):
        est_proj_cost = 0.0

    try:
        total_surface = float(ctx.get("total_surface") or 0)
    except (ValueError, TypeError):
        total_surface = 0.0

    # Ensure items, services, spaces are lists
    spaces = list(ctx.get("spaces") or [])
    services = list(ctx.get("services") or [])
    services_list = list(ctx.get("services_list") or [])
    items = list(ctx.get("items") or [])

    normalized = {
        "studio_name": getattr(settings, "SITE_NAME", "LoftDesign Studio"),
        "tagline": _("Haute Architecture d'Intérieur & Design"),
        "doc_number": doc_number,
        "quote_number": doc_number,
        "revision_number": ctx.get("revision_number", 1),
        "date": date_str,
        "client_name": client_name,
        "first_name": first_name,
        "last_name": last_name,
        "company_name": ctx.get("company_name", ""),
        "client_type": ctx.get("client_type", "particular"),
        "email": ctx.get("email", ""),
        "phone": ctx.get("phone", ""),
        "address": ctx.get("address", ""),
        "project_name": project_name,
        "project_type": project_type,
        "project_type_name": project_type,
        "total_surface": total_surface,
        "estimated_total_project_cost": est_proj_cost,
        "spaces": spaces,
        "services": services,
        "services_list": services_list,
        "items": items,
        "package_name": ctx.get("package_name", ""),
        "unit_price": ctx.get("unit_price", 0),
        "discount_type": ctx.get("discount_type"),
        "discount_value": ctx.get("discount_value", 0),
        "discount_amount": discount_amount,
        "client_discount_note": ctx.get("client_discount_note", ""),
        "subtotal_before_discount": subtotal_before,
        "subtotal_after_discount": subtotal_after,
        "tax_amount": tax_amount,
        "final_total": final_tot,
        "total": final_tot,
        "thank_you_message": ctx.get("thank_you_message") or _(
            "Thank you for choosing LoftDesign Studio! Our architectural team will contact you promptly."
        ),
        "company_nif": getattr(settings, "COMPANY_NIF", "002216089056427"),
        "company_nis": getattr(settings, "COMPANY_NIS", "002216010045189"),
        "company_rc": getattr(settings, "COMPANY_RC", "16/00-0982341B22"),
        "company_rib": getattr(settings, "COMPANY_RIB", "002 00012 1234567890 44"),
        "company_phone": getattr(settings, "COMPANY_PHONE", "+213 (0) 775 18 92 29"),
        "company_email": getattr(settings, "COMPANY_EMAIL", "contact@loftdesign.dz"),
        "company_address": getattr(settings, "COMPANY_ADDRESS", "Sidi Yahia, Hydra, Alger, Algérie"),
    }
    return normalized


def generate_quote_pdf(design_request):
    try:
        from weasyprint import HTML
        html = render_to_string("dashboard/pdf/quote.html", {
            "project": design_request,
            "site_url": settings.SITE_URL if hasattr(settings, "SITE_URL") else "http://localhost:8000",
        })
        pdf_dir = os.path.join(settings.MEDIA_ROOT, "pdf", "quotes")
        os.makedirs(pdf_dir, exist_ok=True)
        filename = f"quote-{design_request.project_number}.pdf"
        filepath = os.path.join(pdf_dir, filename)
        HTML(string=html).write_pdf(filepath)
        return os.path.join(settings.MEDIA_URL, "pdf", "quotes", filename)
    except Exception as e:
        logger.error("generate_quote_pdf error: %s", e)
        return None


def generate_invoice_pdf(payment):
    try:
        from weasyprint import HTML
        html = render_to_string("dashboard/pdf/invoice.html", {
            "payment": payment,
            "project": payment.design_request,
            "site_url": settings.SITE_URL if hasattr(settings, "SITE_URL") else "http://localhost:8000",
        })
        pdf_dir = os.path.join(settings.MEDIA_ROOT, "pdf", "invoices")
        os.makedirs(pdf_dir, exist_ok=True)
        filename = f"invoice-{payment.design_request.project_number}-{payment.pk}.pdf"
        filepath = os.path.join(pdf_dir, filename)
        HTML(string=html).write_pdf(filepath)
        return os.path.join(settings.MEDIA_URL, "pdf", "invoices", filename)
    except Exception as e:
        logger.error("generate_invoice_pdf error: %s", e)
        return None


def render_facturation_pdf_bytes(context):
    """Render the facturation (invoice/quote) to PDF bytes using WeasyPrint with robust normalization."""
    ctx = normalize_facturation_context(context)
    html = render_to_string("dashboard/pdf/facturation.html", ctx)
    try:
        from weasyprint import HTML
        return HTML(string=html).write_pdf()
    except Exception as e:
        logger.error("render_facturation_pdf_bytes WeasyPrint failed: %s", e)
        raise e
