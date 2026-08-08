from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from ..models import ProjectType, Space, DesignPackage, DesignOption
from ..price_engine import calculate_full_price


def api_project_types(request):
    qs = ProjectType.objects.all()
    data = []
    for pt in qs:
        data.append({
            "id": pt.id,
            "name": pt.name,
            "slug": pt.slug,
        })
    return JsonResponse({"data": data})


def api_spaces(request):
    project_type_slug = request.GET.get("project_type")
    qs = Space.objects.all().prefetch_related("gallery_images")
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
            "base_price": str(s.base_price),
            "image_url": s.thumbnail.url if s.thumbnail else "",
        })
    return JsonResponse({"data": data})


def api_packages(request):
    qs = DesignPackage.objects.values("id", "name", "price_multiplier")
    return JsonResponse({"data": list(qs)})


def api_options(request):
    qs = DesignOption.objects.filter(active=True).values("id", "name", "slug", "description", "category")
    return JsonResponse({"data": list(qs)})


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
