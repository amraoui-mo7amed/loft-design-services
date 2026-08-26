import copy
from functools import lru_cache
from django.utils.translation import gettext_lazy as _, get_language


def build_section(title, items):
    out = []
    for item in items:
        entry = dict(item)
        entry["section"] = title
        if "children" in item:
            entry["children"] = [dict(c) for c in item["children"]]
        out.append(entry)
    return out


@lru_cache(maxsize=32)
def _build_menu(is_admin, is_designer, is_customer, lang=None):
    menu = []

    menu += build_section(
        _("Main"),
        [
            {
                "title": _("Dashboard"),
                "icon": "fas fa-th-large",
                "url_name": "dash:dash_home",
                "admin_only": False,
            },
        ],
    )

    if is_admin:
        menu += build_section(
            _("Management"),
            [
                {
                    "title": _("Design Catalog"),
                    "icon": "fas fa-pencil-ruler",
                    "url_name": "#",
                    "admin_only": True,
                    "children": [
                        {"title": _("Project Types"), "url_name": "dash:project_type_list"},
                        {"title": _("Packages"), "url_name": "dash:package_list"},
                    ],
                },
                {
                    "title": _("Projects"),
                    "icon": "fas fa-tasks",
                    "url_name": "dash:admin_crm",
                    "admin_only": True,
                },
                {
                    "title": _("Quotes"),
                    "icon": "fas fa-file-invoice-dollar",
                    "url_name": "dash:quote_list",
                    "admin_only": True,
                },
                {
                    "title": _("Portfolio"),
                    "icon": "fas fa-briefcase",
                    "url_name": "dash:portfolio_list",
                    "admin_only": True,
                },
                {
                    "title": _("Videos"),
                    "icon": "fas fa-video",
                    "url_name": "dash:video_list",
                    "admin_only": True,
                },
                {
                    "title": _("Contacts"),
                    "icon": "fas fa-envelope-open-text",
                    "url_name": "dash:contact_list",
                    "admin_only": True,
                },
                {
                    "title": _("Leads"),
                    "icon": "fas fa-user-plus",
                    "url_name": "dash:lead_list",
                    "admin_only": True,
                },
            ],
        )

    projects_items = []
    if is_customer:
        projects_items.append({
            "title": _("My Projects"),
            "icon": "fas fa-drafting-compass",
            "url_name": "dash:customer_projects",
            "admin_only": False,
        })

    if is_designer:
        projects_items.append({
            "title": _("Designer"),
            "icon": "fas fa-paint-brush",
            "url_name": "dash:designer_projects",
            "admin_only": False,
        })

    if projects_items:
        menu += build_section(_("Projects"), projects_items)

    return menu


def dashboard_sidebar(request):
    if not getattr(request, "user", None) or not request.user.is_authenticated:
        return {"dashboard_menu": []}

    profile = getattr(request.user, "profile", None)
    is_admin = bool(request.user.is_superuser or (profile and profile.is_admin_role))
    is_designer = bool(profile and profile.is_designer)
    is_customer = bool(profile and profile.is_customer)
    lang = get_language()

    # Deep copy cached menu so template tags or mutations don't alter the cache
    cached_menu = _build_menu(is_admin, is_designer, is_customer, lang)
    return {"dashboard_menu": [dict(m) for m in cached_menu]}
