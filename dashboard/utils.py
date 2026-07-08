from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext as _
from django.db import IntegrityError
from django_eventstream import send_event
from .models import Notification
import re
import logging

logger = logging.getLogger(__name__)


from decouple import config


HUMAN_ERROR_MAP = {
    "dashboard_projecttype_slug_key": _("A project type with this name already exists."),
    "dashboard_projecttype_sort_order": _("This sort order is already taken."),
    "dashboard_space_slug_key": _("A space with this name already exists."),
    "dashboard_designoption_slug_key": _("A design option with this name already exists."),
    "dashboard_stylecategory_slug_key": _("A style category with this name already exists."),
    "dashboard_projecttypespace_project_type_id_space_id_": _("This space is already linked to this project type."),
    "dashboard_productcategory_slug_key": _("A product category with this name already exists."),
    "dashboard_product_slug_key": _("A product with this name already exists."),
    "dashboard_product_sku_key": _("A product with this SKU already exists."),
    "dashboard_spaceproductrecommendation_space_id_product_id_": _("This product is already recommended for this space."),
}

def humanize_error(e):
    if not isinstance(e, IntegrityError):
        return [str(e)]
    msg = str(e)
    for constraint, human_msg in HUMAN_ERROR_MAP.items():
        if constraint in msg:
            return [human_msg]
    # PostgreSQL: Key (field)=(value) already exists.
    pg_match = re.search(r'Key \(([^)]+)\)=', msg)
    if pg_match:
        field_name = pg_match.group(1).replace("_", " ").title()
        return [_("%(field)s already exists.") % {"field": field_name}]
    # SQLite: UNIQUE constraint failed: table.column
    sqlite_match = re.search(r'UNIQUE constraint failed: \w+\.(\w+)', msg)
    if sqlite_match:
        field_name = sqlite_match.group(1).replace("_", " ").title()
        return [_("%(field)s already exists.") % {"field": field_name}]
    return [_("A record with the same value already exists.")]


def send_account_activation_email(request, profile):
    """
    Sends an account activation email to the user after approval.
    """
    site_name = config("SITE_NAME", default="StarterKit")
    subject = _("Your %(site)s Account has been Activated!") % {"site": site_name}
    login_url = request.build_absolute_uri(reverse("user_auth:login"))

    context = {
        "profile": profile,
        "login_url": login_url,
        "LANGUAGE_CODE": getattr(request, "LANGUAGE_CODE", settings.LANGUAGE_CODE),
    }

    html_content = render_to_string("email/account_activation.html", context)
    text_content = strip_tags(html_content)

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")

    email = EmailMultiAlternatives(
        subject, text_content, from_email, [profile.user.email]
    )
    email.attach_alternative(html_content, "text/html")

    try:
        print(f"DEBUG: Attempting to send email to {profile.user.email}")
        print(f"DEBUG: Subject: {subject}")
        print(f"DEBUG: From: {from_email}")
        print(
            f"DEBUG: Email Backend: {settings.EMAIL_BACKEND if hasattr(settings, 'EMAIL_BACKEND') else 'Default'}"
        )

        email.send()
        print("DEBUG: Email sent successfully!")
        return True
    except Exception as e:
        # In a real production app, we would log this properly
        print(f"DEBUG: Failed to send email to {profile.user.email}")
        print(f"DEBUG: Exception type: {type(e).__name__}")
        print(f"DEBUG: Exception message: {str(e)}")
        import traceback

        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return False


def notify_user(user, title, message, notification_type="info", link=""):
    """
    Create a notification for a user and send it via eventstream.

    Args:
        user: The user to notify
        title: Notification title
        message: Notification message
        notification_type: One of 'info', 'success', 'warning', 'error'
        link: Optional link to navigate to when clicked

    Returns:
        The created Notification instance
    """
    try:
        # Create notification in database
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link,
        )

        # Send real-time event to user's channel
        channel = f"user-{user.id}"
        event_data = {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
            "link": notification.link,
        }

        send_event(channel, "notification", event_data)

        logger.info(f"Notification sent to user {user.username}: {title}")
        return notification

    except Exception as e:
        logger.error(
            f"Failed to create notification for user {user.username}: {str(e)}"
        )
        return None
