from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404, render

from dashboard.models import Space, SpaceImage


def space_gallery(request, space_pk=None):
    """Render gallery for a single space or all spaces with search & filter options."""
    q = request.GET.get("q", "").strip()
    selected_space_ids = request.GET.getlist("spaces")

    if space_pk:
        space = get_object_or_404(Space, pk=space_pk)
        images = SpaceImage.objects.filter(space=space).select_related("space")
        if q:
            images = images.filter(Q(tags__icontains=q) | Q(description__icontains=q))

        context = {
            "space": space,
            "images": images,
            "q": q,
            "is_single_space": True,
        }
        return render(request, "gallery.html", context)

    spaces = Space.objects.prefetch_related(
        Prefetch(
            "gallery_images",
            queryset=SpaceImage.objects.order_by("-is_thumbnail", "id"),
        )
    ).order_by("name")

    if q or selected_space_ids:
        images = SpaceImage.objects.all().select_related("space")
        if q:
            images = images.filter(Q(tags__icontains=q) | Q(description__icontains=q))
        if selected_space_ids:
            images = images.filter(space_id__in=selected_space_ids)
    else:
        # Collect the featured / thumbnail image of each space using prefetched memory cache
        featured_img_ids = []
        for sp in spaces:
            imgs = list(sp.gallery_images.all())
            if imgs:
                featured_img_ids.append(imgs[0].pk)

        images = (
            SpaceImage.objects.filter(pk__in=featured_img_ids)
            .select_related("space")
            .order_by("space__name")
        )

    context = {
        "spaces": spaces,
        "images": images,
        "q": q,
        "selected_spaces": [int(x) for x in selected_space_ids if x.isdigit()],
        "is_single_space": False,
    }
    return render(request, "gallery.html", context)
