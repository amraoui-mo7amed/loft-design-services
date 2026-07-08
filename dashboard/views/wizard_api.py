from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from ..models import ProjectType, Space, DesignPackage, DesignOption, InspirationImage, StyleCategory
from ..price_engine import calculate_full_price


def api_project_types(request):
    qs = ProjectType.objects.filter(active=True)
    data = []
    for pt in qs:
        data.append({
            "id": pt.id,
            "name": pt.name,
            "slug": pt.slug,
            "sort_order": pt.sort_order,
        })
    return JsonResponse({"data": data})


def api_spaces(request):
    project_type_slug = request.GET.get("project_type")
    qs = Space.objects.filter(active=True)
    if project_type_slug:
        pt = get_object_or_404(ProjectType, slug=project_type_slug)
        space_ids = pt.default_spaces.values_list("space_id", flat=True)
        qs = qs.filter(id__in=space_ids)
    data = []
    for s in qs:
        data.append({
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "category": s.category,
            "base_price": str(s.base_price),
            "estimated_days": s.estimated_days,
            "image_url": s.image.url if s.image else "",
        })
    return JsonResponse({"data": data})


def api_packages(request):
    qs = DesignPackage.objects.filter(active=True).values("id", "name", "description", "price_multiplier")
    return JsonResponse({"data": list(qs)})


def api_options(request):
    qs = DesignOption.objects.filter(active=True).values("id", "name", "slug", "description", "price", "category")
    return JsonResponse({"data": list(qs)})


def api_inspirations(request):
    space_id = request.GET.get("space_id")
    style_id = request.GET.get("style_id")
    qs = InspirationImage.objects.filter(active=True).select_related("space", "style_category")
    if space_id:
        qs = qs.filter(space_id=space_id)
    if style_id:
        qs = qs.filter(style_category_id=style_id)
    data = []
    for img in qs:
        data.append({
            "id": img.id,
            "title": img.title,
            "image_url": img.image.url if img.image else "",
            "space_id": img.space_id,
            "space_name": img.space.name,
            "style_id": img.style_category_id,
            "style_name": img.style_category.name,
        })
    return JsonResponse({"data": data})


def api_calculate_price(request):
    space_ids = request.GET.getlist("space_ids[]")
    package_id = request.GET.get("package_id")
    option_ids = request.GET.getlist("option_ids[]")
    package = DesignPackage.objects.filter(id=package_id).first() if package_id else None
    result = calculate_full_price(
        space_ids=[int(x) for x in space_ids if x],
        package=package,
        option_ids=[int(x) for x in option_ids if x],
    )
    return JsonResponse(result)
