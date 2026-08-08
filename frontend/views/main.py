from django.shortcuts import render
from dashboard.models import Portfolio, ProjectType, Space, DesignPackage


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
    package_data = [
        {
            "id": p.id,
            "name": p.name,
            "delivery_days": p.total_delivery_days,
            "services_count": p.package_services.count(),
            "total_price": p.total_price,
            "services": [
                {
                    "id": ps.option_id,
                    "name": ps.option.name,
                    "price": str(ps.price),
                }
                for ps in p.package_services.all()[:6]
            ],
            "services_more": max(0, p.package_services.count() - 6),
        }
        for p in packages
    ]

    return render(request, "home.html", {
        "spaces": spaces_data,
        "packages": package_data,
        "projects": Portfolio.objects.prefetch_related("gallery_images").order_by("-created_at")[:12],
    })


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
