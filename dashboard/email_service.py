from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import translation
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
    to_email = design_request.email or (design_request.client.email if design_request.client else None)
    if not to_email:
        return False
    return send_email(
        "dashboard/email/project_submitted.html",
        {"project": design_request},
        to_email,
        subject,
    )


def send_status_update_email(design_request):
    to_email = design_request.email or (design_request.client.email if design_request.client else None)
    if not to_email:
        return False

    subject = _("Project Status Update - %(number)s") % {"number": design_request.project_number}

    sent = send_email(
        "dashboard/email/status_update.html",
        {"project": design_request},
        to_email,
        subject,
    )
    if not sent:
        raise RuntimeError(f"Failed to send status update email for project {design_request.project_number}")
    return True


def send_inquiry_status_update_email(inquiry):
    to_email = inquiry.email
    if not to_email:
        return False

    subject = _("Inquiry Status Update - %(name)s") % {"name": inquiry.first_name + " " + inquiry.last_name}

    sent = send_email(
        "dashboard/email/inquiry_status_update.html",
        {"inquiry": inquiry},
        to_email,
        subject,
    )
    if not sent:
        raise RuntimeError(f"Failed to send status update email for inquiry {inquiry.pk}")
    return True
