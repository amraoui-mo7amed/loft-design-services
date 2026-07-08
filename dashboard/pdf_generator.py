from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import os


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
        return None
