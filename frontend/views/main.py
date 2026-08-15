import json

from django.http import JsonResponse
from django.shortcuts import render
from django.core.validators import validate_email, ValidationError
from django.utils.translation import gettext as _
from django.utils.html import escape
from dashboard.models import Portfolio, ProjectType, Space, DesignPackage, Contact, Lead, Video
from dashboard.utils import build_packages_context


def home_view(request):
    featured = ProjectType.objects.filter(featured_on_home=True).first()
    if featured:
        spaces = (
            Space.objects.filter(project_types__project_type=featured, project_types__show_on_home=True)
            .distinct()
            .prefetch_related("gallery_images")
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

    packages = DesignPackage.objects.prefetch_related("package_services__option__category")
    package_data = []
    for p in packages:
        all_services = list(p.package_services.all())
        package_data.append({
            "id": p.id,
            "name": p.name,
            "link": p.link or "",
            "delivery_days": p.total_delivery_days,
            "services_count": len(all_services),
            "total_price": p.total_price,
            "services": [
                {
                    "id": ps.option_id,
                    "name": ps.option.name,
                    "price": str(ps.price),
                }
                for ps in all_services[:6]
            ],
            "services_more": max(0, len(all_services) - 6),
        })

    gallery_spaces = (
        Space.objects.prefetch_related("gallery_images")
        .order_by("name")
    )
    gallery_spaces_data = []
    for sp in gallery_spaces:
        thumb = sp.thumbnail
        if thumb:
            gallery_spaces_data.append({
                "id": sp.id,
                "name": sp.name,
                "thumbnail_url": thumb.url,
                "images_count": len(sp.gallery_images.all()),
            })

    return render(request, "home.html", {
        "spaces": spaces_data,
        "packages": package_data,
        "projects": Portfolio.objects.prefetch_related("gallery_images").order_by("-created_at")[:12],
        "videos": Video.objects.all(),
        "gallery_spaces": gallery_spaces_data,
    })


def submit_contact(request):
    """Create a Contact message (and optionally a Lead) from the homepage form."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request.")]})

    name = request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    phone = request.POST.get("phone", "").strip()
    message = request.POST.get("message", "").strip()
    join_lead = request.POST.get("join_lead") in ("1", "on", "true")

    errors = []
    if not name:
        errors.append(_("Name is required."))
    if not email:
        errors.append(_("Email is required."))
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors.append(_("Please provide a valid email address."))
    if not message:
        errors.append(_("Message is required."))

    if errors:
        return JsonResponse({"success": False, "errors": errors})

    try:
        contact = Contact.objects.create(
            name=name,
            email=email,
            phone=phone,
            message=message,
        )
        if join_lead:
            Lead.objects.create(name=name, email=email)
        return JsonResponse({
            "success": True,
            "message": _("Thank you! Your message has been sent successfully."),
            "contact_id": contact.pk,
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": [escape(str(e))]})


def order_view(request):
    space_ids = request.GET.get("spaces", "")
    selected = []
    total = 0
    if space_ids:
        ids = [s for s in space_ids.split(",") if s.isdigit()]
        selected = Space.objects.filter(id__in=ids)
        for s in selected:
            total += float(s.base_price)

    package = None
    pkg_id = request.GET.get("pkg", "")
    if pkg_id.isdigit():
        package = (
            DesignPackage.objects.filter(id=int(pkg_id))
            .prefetch_related("package_services__option__category")
            .first()
        )
        if package:
            total += float(package.total_price)

    total = round(total)

    return render(request, "order.html", {
        "selected_spaces": selected,
        "total": total,
        "package": package,
    })


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
