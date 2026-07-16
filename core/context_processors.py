from functools import lru_cache
from django.conf import settings
from django.utils.translation import gettext_lazy as _, get_language


@lru_cache(maxsize=1)
def _get_site_config():
    return {
        "name": _("Loft Design"),
        "ar_name": "لوفت ديزاين",
        "tagline": _("Interior Design That Inspires"),
        "logo": None,
        "favicon": None,
        "contact_email": "info@loftdesign.com",
        "phone": "+213 555 000 000",
        "social": {
            "facebook": "https://facebook.com/loftdesign",
            "instagram": "https://instagram.com/loftdesign",
            "pinterest": "https://pinterest.com/loftdesign",
        },
        "seo": {
            "description": _(
                "Professional interior design services — from concept to completion, delivered by expert designers."
            ),
            "keywords": _(
                "interior design, home design, room design, loft, decoration, design service"
            ),
        },
        "branding": {
                 "primary_color": "#FFD65A",
                "secondary_color": "#212121",
                "accent_color": "#FFFFFF",
                "success_color": "#28a745",
                "danger_color": "#dc3545",
                "dark_color": "#1a1a1a",
                "light_color": "#f8f9fa",
        },
    }


def site_settings(request):
    return {"site_config": _get_site_config()}
