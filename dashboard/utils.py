from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext as _
from django.db import IntegrityError
from django.core.files.base import ContentFile
from django_eventstream import send_event
from .models import Notification, Service
import os
import re
import json
import logging
from io import BytesIO

from PIL import Image, ImageOps

logger = logging.getLogger(__name__)


from decouple import config


HUMAN_ERROR_MAP = {
    "dashboard_projecttype_slug_key": _("A project type with this name already exists."),
    "dashboard_space_slug_key": _("A space with this name already exists."),
    "dashboard_service_slug_key": _("A service with this name already exists."),
    "dashboard_projecttypespace_project_type_id_space_id_": _("This space is already linked to this project type."),
    "unique_space_project_type": _("This space already belongs to another project type."),
    "dashboard_productcategory_slug_key": _("A product category with this name already exists."),
    "dashboard_product_slug_key": _("A product with this name already exists."),
    "dashboard_product_sku_key": _("A product with this SKU already exists."),
    "dashboard_spaceproductrecommendation_space_id_product_id_": _("This product is already recommended for this space."),
}

def build_packages_context():
    """Shared service payload used by the wizard and order pages."""
    services = Service.objects.all().order_by("-is_default", "service_name")
    default_pkg = services.filter(is_default=True).first()
    package_data = []
    for s in services:
        if default_pkg and s.pk == default_pkg.pk:
            continue
        package_data.append({
            "pkg": s,
            "id": s.id,
            "name": s.service_name,
            "total_price": s.service_price,
            "services_json": json.dumps([{"id": s.id, "name": s.service_name, "price": str(s.service_price)}]),
            "link": "",
        })
    default_services = []
    default_total = 0
    if default_pkg:
        default_services = [{"id": default_pkg.id, "name": default_pkg.service_name, "price": str(default_pkg.service_price)}]
        default_total = default_pkg.service_price
    return {
        "default_pkg": default_pkg,
        "default_total": default_total,
        "default_services_json": json.dumps(default_services),
        "default_link": "",
        "package_data": package_data,
        "services": services,
    }


def humanize_error(e):
    import sys
    print(f"[HUMANIZE_ERROR CALLED] {type(e).__name__}: {e}", file=sys.stderr, flush=True)
    logger.exception("Error handled by humanize_error: %s", e)
    if isinstance(e, list):
        return e
    if not isinstance(e, IntegrityError):
        return [str(e)]
    msg = str(e)
    for constraint, human_msg in HUMAN_ERROR_MAP.items():
        if constraint in msg:
            return [human_msg]

    # 1. PostgreSQL: Key (...) already exists
    pg_key_exists = re.search(r'Key \(([^)]+)\)=.*already exists', msg)
    if pg_key_exists:
        raw_field = pg_key_exists.group(1).split(",")[-1].strip()
        field_name = raw_field.replace("_", " ").title()
        return [_("%(field)s already exists.") % {"field": field_name}]

    # 2. PostgreSQL unique constraint violation by name
    pg_uniq_constr = re.search(r'violates unique constraint ["\']?([^"\'\s]+)["\']?', msg)
    if pg_uniq_constr:
        c_name = pg_uniq_constr.group(1).lower()
        if "quote_number" in c_name:
            return [_("A quote with this reference number already exists.")]
        if "uuid" in c_name:
            return [_("A record with this identifier already exists.")]
        if "email" in c_name:
            return [_("An entry with this email already exists.")]
        if "slug" in c_name or "name" in c_name:
            return [_("An item with this name already exists.")]
        return [_("A record with this value already exists (%(constraint)s).") % {"constraint": c_name}]

    # 3. PostgreSQL NOT NULL constraint violation
    pg_not_null = re.search(r'null value in column ["\']?([^"\'\s]+)["\']?.*violates not-null constraint', msg)
    if pg_not_null:
        col = pg_not_null.group(1).replace("_", " ").title()
        return [_("The field %(field)s is required.") % {"field": col}]

    # 4. PostgreSQL Foreign Key violation
    pg_fk_not_present = re.search(r'Key \(([^)]+)\)=.*is not present in table ["\']?([^"\'\s]+)["\']?', msg)
    if pg_fk_not_present:
        fk_field = pg_fk_not_present.group(1).replace("_id", "").replace("_", " ").title()
        return [_("The referenced %(field)s does not exist.") % {"field": fk_field}]

    # 5. SQLite: UNIQUE constraint failed: table.column
    sqlite_match = re.search(r'UNIQUE constraint failed: \w+\.(\w+)', msg)
    if sqlite_match:
        field_name = sqlite_match.group(1).replace("_", " ").title()
        return [_("%(field)s already exists.") % {"field": field_name}]

    # 6. SQLite: NOT NULL constraint failed: table.column
    sqlite_not_null = re.search(r'NOT NULL constraint failed: \w+\.(\w+)', msg)
    if sqlite_not_null:
        field_name = sqlite_not_null.group(1).replace("_", " ").title()
        return [_("The field %(field)s is required.") % {"field": field_name}]

    # 7. Check constraint
    pg_check = re.search(r'violates check constraint ["\']?([^"\'\s]+)["\']?', msg)
    if pg_check:
        return [_("A value violates database validation rules.")]

    # 8. Fallback: generic Key (field)=
    pg_generic_key = re.search(r'Key \(([^)]+)\)=', msg)
    if pg_generic_key:
        field_name = pg_generic_key.group(1).replace("_", " ").title()
        return [_("%(field)s already exists.") % {"field": field_name}]

    first_line = msg.splitlines()[0] if msg else ""
    return [_("A database constraint error occurred: %(detail)s") % {"detail": first_line}]


def optimize_image(uploaded_file, max_dimension=1920, quality=0.9):
    """
    Re-encode an uploaded image with Pillow preserving format/alpha and
    a high quality. Returns a ContentFile; falls back to the original file
    on any processing error.
    """
    try:
        img = Image.open(uploaded_file)
        img = ImageOps.exif_transpose(img)
        img.load()

        original_format = (img.format or "JPEG").upper()
        has_alpha = img.mode in ("RGBA", "LA") or (
            img.mode == "P" and "transparency" in img.info
        )

        if img.width > max_dimension or img.height > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.LANCZOS)

        buffer = BytesIO()
        if original_format == "PNG" or has_alpha:
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            img.save(buffer, "PNG", optimize=True)
            ext = ".png"
            content_type = "image/png"
        else:
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.save(buffer, "JPEG", quality=int(quality * 100), optimize=True, progressive=True)
            ext = ".jpg"
            content_type = "image/jpeg"

        buffer.seek(0)
        base = os.path.splitext(os.path.basename(uploaded_file.name or "image"))[0]
        return ContentFile(buffer.getvalue(), name=f"{base}{ext}")
    except Exception:
        uploaded_file.seek(0)
        return uploaded_file




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
