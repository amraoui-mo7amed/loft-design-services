from django.shortcuts import render, get_object_or_404
from django.db.models import Max
from dashboard.models import Space


def home_view(request):
    spaces = Space.objects.filter(active=True).order_by("name")
    max_price = Space.objects.filter(active=True).aggregate(Max("base_price"))["base_price__max"] or 1

    spaces_data = []
    for space in spaces:
        percentage = int(float(space.base_price) / float(max_price) * 100)
        spaces_data.append({
            "id": space.id,
            "name": space.name,
            "slug": space.slug,
            "base_price": space.base_price,
            "estimated_days": space.estimated_days,
            "category": space.category or space.space_category.name if space.space_category else "",
            "image": space.image.url if space.image else None,
            "percentage": percentage,
        })

    return render(request, "home.html", {
        "spaces": spaces_data,
    })


def order_view(request):
    space_ids = request.GET.get("spaces", "")
    selected = []
    total = 0
    if space_ids:
        ids = [s for s in space_ids.split(",") if s.isdigit()]
        selected = Space.objects.filter(id__in=ids, active=True)
        for s in selected:
            total += float(s.base_price)

    return render(request, "order.html", {
        "selected_spaces": selected,
        "total": total,
    })
