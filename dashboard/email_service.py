import logging
import threading
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.translation import gettext as _

logger = logging.getLogger(__name__)


def _send_email_worker(template_name, context, to_email, subject):
    """
    Background worker function that performs the actual network I/O
    without blocking the calling web thread or database transactions.
    """
    try:
        context.setdefault("LANGUAGE_CODE", settings.LANGUAGE_CODE)
        context.setdefault("site_url", getattr(settings, "SITE_URL", "http://localhost:8000"))

        html_content = render_to_string(template_name, context)
        text_content = strip_tags(html_content)
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")

        email = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"Email sent successfully to {to_email}: {subject}")
    except Exception as e:
        logger.warning(f"Background email delivery to {to_email} skipped or failed: {str(e)}")


def send_email(template_name, context, to_email, subject, async_send=True):
    """
    Dispatch an email. When async_send=True (default), sends in a background
    thread to prevent worker blocking and socket timeout freezes.
    """
    if not to_email:
        return False

    if async_send:
        thread = threading.Thread(
            target=_send_email_worker,
            args=(template_name, context, to_email, subject),
            daemon=True,
        )
        thread.start()
        return True
    else:
        _send_email_worker(template_name, context, to_email, subject)
        return True


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
    return send_email(
        "dashboard/email/status_update.html",
        {"project": design_request},
        to_email,
        subject,
    )


def send_inquiry_status_update_email(inquiry):
    to_email = inquiry.email
    if not to_email:
        return False

    subject = _("Inquiry Status Update - %(name)s") % {"name": f"{inquiry.first_name} {inquiry.last_name}".strip()}
    return send_email(
        "dashboard/email/inquiry_status_update.html",
        {"inquiry": inquiry},
        to_email,
        subject,
    )
