from django.shortcuts import render
from django.db.models import Max
from dashboard.models import Portfolio, ProjectType, Space


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

    max_price = spaces.aggregate(Max("base_price"))["base_price__max"] or 1

    spaces_data = []
    for space in spaces:
        percentage = int(float(space.base_price) / float(max_price) * 100)
        spaces_data.append({
            "id": space.id,
            "name": space.name,
            "slug": space.slug,
            "base_price": space.base_price,
            "thumbnail": space.thumbnail.url if space.thumbnail else None,
            "percentage": percentage,
        })

    return render(request, "home.html", {
        "spaces": spaces_data,
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

    return render(request, "order.html", {
        "selected_spaces": selected,
        "total": total,
    })
