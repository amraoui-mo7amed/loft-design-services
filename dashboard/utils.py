from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext as _
from django.db import IntegrityError
from django.core.files.base import ContentFile
from django_eventstream import send_event
from .models import Notification, DesignPackage
import os
import re
import json
import logging
from io import BytesIO

from PIL import Image, ImageOps

logger = logging.getLogger(__name__)


from decouple import config


HUMAN_ERROR_MAP = {    "dashboard_projecttype_slug_key": _("A project type with this name already exists."),
    "dashboard_space_slug_key": _("A space with this name already exists."),
    "dashboard_designoption_slug_key": _("A design option with this name already exists."),
    "dashboard_stylecategory_slug_key": _("A style category with this name already exists."),
    "dashboard_projecttypespace_project_type_id_space_id_": _("This space is already linked to this project type."),
    "unique_space_project_type": _("This space already belongs to another project type."),
    "dashboard_productcategory_slug_key": _("A product category with this name already exists."),
    "dashboard_product_slug_key": _("A product with this name already exists."),
    "dashboard_product_sku_key": _("A product with this SKU already exists."),
    "dashboard_spaceproductrecommendation_space_id_product_id_": _("This product is already recommended for this space."),
}

def build_packages_context():
    """Shared package payload used by the wizard step 4 and the public pack page."""
    packages = DesignPackage.objects.prefetch_related("package_services__option__category")
    default_pkg = packages.filter(is_default=True).first()
    package_data = []
    for pkg in packages:
        if default_pkg and pkg.pk == default_pkg.pk:
            continue
        services = [
            {"id": ps.option_id, "name": ps.option.name, "price": str(ps.price or 0)}
            for ps in pkg.package_services.all()
        ]
        package_data.append({
            "pkg": pkg,
            "total_price": sum(ps.price or 0 for ps in pkg.package_services.all()),
            "services_json": json.dumps(services),
        })
    default_services = []
    default_total = 0
    if default_pkg:
        default_services = [
            {"id": ps.option_id, "name": ps.option.name, "price": str(ps.price or 0)}
            for ps in default_pkg.package_services.all()
        ]
        default_total = sum(ps.price or 0 for ps in default_pkg.package_services.all())
    return {
        "default_pkg": default_pkg,
        "default_total": default_total,
        "default_services_json": json.dumps(default_services),
        "package_data": package_data,
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
