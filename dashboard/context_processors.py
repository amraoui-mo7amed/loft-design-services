from functools import lru_cache
from django.utils.translation import gettext_lazy as _


def build_section(title, items):
    for item in items:
        item["section"] = title
    return items


@lru_cache(maxsize=8)
def _build_menu(is_admin, is_designer, is_customer):
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
                        {"title": _("Spaces"), "url_name": "dash:space_list"},
                        {"title": _("Packages"), "url_name": "dash:package_list"},
                        {"title": _("Style Categories"), "url_name": "dash:style_list"},
                        {"title": _("Inspiration Images"), "url_name": "dash:inspiration_list"},
                    ],
                },
                {
                    "title": _("Projects"),
                    "icon": "fas fa-tasks",
                    "url_name": "dash:admin_crm",
                    "admin_only": True,
                },
                {
                    "title": _("Inquiries"),
                    "icon": "fas fa-inbox",
                    "url_name": "dash:inquiry_list",
                    "admin_only": True,
                },
                {
                    "title": _("Portfolio"),
                    "icon": "fas fa-briefcase",
                    "url_name": "dash:portfolio_list",
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
    profile = getattr(request.user, "profile", None)
    is_admin = request.user.is_superuser or (profile and profile.is_admin_role)
    is_designer = profile and profile.is_designer
    is_customer = profile and profile.is_customer

    return {"dashboard_menu": _build_menu(is_admin, is_designer, is_customer)}
