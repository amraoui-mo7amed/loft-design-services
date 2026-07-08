from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.translation import gettext as _
import logging

logger = logging.getLogger(__name__)


def send_email(template_name, context, to_email, subject):
    context.setdefault("LANGUAGE_CODE", settings.LANGUAGE_CODE)
    context.setdefault("site_url", getattr(settings, "SITE_URL", "http://localhost:8000"))

    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")

    email = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    email.attach_alternative(html_content, "text/html")

    try:
        email.send()
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_project_submitted_email(design_request):
    subject = _("Design Request Submitted - %(number)s") % {"number": design_request.project_number}
    return send_email(
        "dashboard/email/project_submitted.html",
        {"project": design_request},
        design_request.client.email,
        subject,
    )


def send_quote_ready_email(design_request):
    subject = _("Your Quote is Ready - %(number)s") % {"number": design_request.project_number}
    return send_email(
        "dashboard/email/quote_ready.html",
        {"project": design_request},
        design_request.client.email,
        subject,
    )


def send_designer_assigned_email(design_request):
    subject = _("Designer Assigned - %(number)s") % {"number": design_request.project_number}
    return send_email(
        "dashboard/email/designer_assigned.html",
        {"project": design_request},
        design_request.client.email,
        subject,
    )


def send_project_delivered_email(design_request):
    subject = _("Project Delivered - %(number)s") % {"number": design_request.project_number}
    return send_email(
        "dashboard/email/project_delivered.html",
        {"project": design_request},
        design_request.client.email,
        subject,
    )
