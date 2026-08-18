import json

from django.http import JsonResponse
from django.shortcuts import render
from django.core.validators import validate_email, ValidationError
from django.utils.translation import gettext as _
from django.utils.html import escape
from dashboard.models import Portfolio, ProjectType, Space, Service, Contact, Lead, Video
from dashboard.utils import build_packages_context


def home_view(request):
    featured = ProjectType.objects.filter(featured_on_home=True).first()
    if featured:
        spaces = (
            Space.objects.filter(project_types__project_type=featured, project_types__show_on_home=True)
            .distinct()
            .prefetch_related("categories__images")
            .order_by("name")
        )
    else:
        spaces = Space.objects.none()

    spaces_data = [{
        "id": space.id,
        "name": space.name,
        "slug": space.slug,
        "base_price": space.base_price,
        "thumbnail": space.thumbnail.url if space.thumbnail else None,
    } for space in spaces]

    services = Service.objects.all().order_by("-is_default", "service_name")
    package_data = []
    for s in services:
        package_data.append({
            "id": s.id,
            "name": s.service_name,
            "link": "",
            "delivery_days": 7,
            "services_count": 1,
            "total_price": s.service_price,
            "services": [
                {
                    "id": s.id,
                    "name": s.service_name,
                    "price": str(s.service_price),
                }
            ],
            "services_more": 0,
        })

    return render(request, "home.html", {
        "spaces": spaces_data,
        "packages": package_data,
        "projects": Portfolio.objects.prefetch_related("gallery_images").order_by("-created_at")[:12],
        "videos": Video.objects.all(),
    })


def submit_contact(request):
    """Create a Contact message (and optionally a Lead) from the homepage form."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Method not allowed.")]})

    first_name = request.POST.get("first_name", "").strip()
    last_name = request.POST.get("last_name", "").strip()
    full_name = f"{first_name} {last_name}".strip() or request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    phone = request.POST.get("phone", "").strip()
    message = request.POST.get("message", "").strip()

    errors = []
    if not full_name:
        errors.append(_("Name is required."))
    if not email:
        errors.append(_("Email is required."))
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors.append(_("Please provide a valid email address."))
    if not message:
        errors.append(_("Message cannot be empty."))

    if errors:
        return JsonResponse({"success": False, "errors": errors})

    contact = Contact.objects.create(
        name=full_name,
        email=email,
        phone=phone,
        message=message,
    )

    lead, lead_created = Lead.objects.get_or_create(
        email=email,
        defaults={
            "name": full_name,
        },
    )

    return JsonResponse({
        "success": True,
        "message": _("Thank you for reaching out! We will get back to you shortly."),
        "contact_id": contact.id,
    })


def order_view(request):
    selected = []
    total = 0

    space_ids = request.GET.get("spaces", "")
    if space_ids:
        ids = [s for s in space_ids.split(",") if s.isdigit()]
        selected = Space.objects.filter(id__in=ids)
        for s in selected:
            total += float(s.base_price)

    package = None
    pkg_id = request.GET.get("pkg", "")
    if pkg_id.isdigit():
        package = Service.objects.filter(id=int(pkg_id)).first()
        if package:
            total += float(package.service_price)

    total = round(total)

    return render(request, "order.html", {
        "selected_spaces": selected,
        "total": total,
        "package": package,
    })


inquiry_view = order_view


def pack_select_view(request):
    space_ids = [s for s in request.GET.get("spaces", "").split(",") if s.isdigit()]
    spaces = Space.objects.filter(id__in=space_ids)
    subtotal = sum(float(s.base_price) for s in spaces)
    spaces_data = [
        {"id": s.id, "name": s.name, "base_price": float(s.base_price)}
        for s in spaces
    ]
    context = build_packages_context()
    context.update({
        "spaces": spaces_data,
        "subtotal": subtotal,
        "space_ids": ",".join(space_ids),
    })
    return render(request, "pack_select.html", context)
