import os
import time
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
    return {
        "site_config": _get_site_config(),
        "ASSET_VERSION": _compute_asset_version(),
    }


def _static_base_dirs():
    dirs = list(settings.STATICFILES_DIRS)
    static_root = getattr(settings, "STATIC_ROOT", None)
    if static_root:
        dirs.append(static_root)
    for app_config in settings.INSTALLED_APPS:
        if isinstance(app_config, str):
            try:
                module = __import__(app_config, fromlist=["__file__"])
                dirs.append(os.path.join(os.path.dirname(module.__file__), "static"))
            except (ImportError, AttributeError, TypeError):
                continue
    return dirs


def _compute_asset_version():
    version = settings.ASSET_VERSION or ""
    if version:
        return version

    if settings.DEBUG:
        return str(int(time.time()))

    latest = 0.0
    for directory in _static_base_dirs():
        if not directory or not os.path.isdir(directory):
            continue
        for _root, _dirs, files in os.walk(directory):
            for filename in files:
                if not filename.endswith((".css", ".js", ".svg", ".png")):
                    continue
                try:
                    mtime = os.path.getmtime(os.path.join(_root, filename))
                except OSError:
                    continue
                if mtime > latest:
                    latest = mtime

    return str(int(latest)) if latest else "1"
