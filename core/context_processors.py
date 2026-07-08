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
            "primary_color": "#2a5a5a",
            "secondary_color": "#b8946b",
            "accent_color": "#d47b5a",
            "success_color": "#5a7a5a",
            "danger_color": "#a84444",
            "dark_color": "#2c2c3a",
            "light_color": "#f5f0ea",
        },
    }


def site_settings(request):
    return {"site_config": _get_site_config()}
