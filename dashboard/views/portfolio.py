from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.utils.translation import gettext as _
from django.db import transaction

from ..decorator import admin_required, with_pagination
from ..models import Portfolio, PortfolioGallery


@admin_required
@with_pagination(per_page=10, template="portfolio/list", queryset_name="portfolios")
def portfolio_list(request):
    queryset = Portfolio.objects.all().prefetch_related("gallery_images").order_by("-created_at")
    query = request.GET.get("q", "").strip()
    if query:
        queryset = queryset.filter(title__icontains=query)
    return {
        "portfolios": queryset,
        "query": query,
        "title": _("Portfolios"),
    }


@admin_required
def portfolio_create(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        description = request.POST.get("description", "").strip()
        tags = request.POST.get("tags", "").strip()
        external_link = request.POST.get("external_link", "").strip() or None
        is_featured = request.POST.get("is_featured") == "on"
        thumbnail = request.FILES.get("thumbnail")
        model_3d = request.FILES.get("model_3d")

        if not thumbnail:
            return JsonResponse({"success": False, "message": _("Thumbnail is required.")})

        try:
            with transaction.atomic():
                portfolio = Portfolio.objects.create(
                    title=title,
                    description=description,
                    tags=tags,
                    external_link=external_link,
                    is_featured=is_featured,
                    model_3d=model_3d,
                    thumbnail=thumbnail,
                )

                gallery_images = request.FILES.getlist("gallery_images")
                for image in gallery_images:
                    PortfolioGallery.objects.create(portfolio=portfolio, image=image)

            return JsonResponse({
                "success": True,
                "message": _("Portfolio created successfully."),
                "redirect_url": reverse("dash:portfolio_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return render(request, "portfolio/create.html", {
        "title": _("New Portfolio"),
    })


@admin_required
def portfolio_update(request, pk):
    portfolio = get_object_or_404(Portfolio, pk=pk)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        description = request.POST.get("description", "").strip()
        tags = request.POST.get("tags", "").strip()
        external_link = request.POST.get("external_link", "").strip() or None
        is_featured = request.POST.get("is_featured") == "on"
        thumbnail = request.FILES.get("thumbnail")
        model_3d = request.FILES.get("model_3d")
        clear_model_3d = request.POST.get("clear_model_3d") == "1"

        if not thumbnail and not portfolio.thumbnail:
            return JsonResponse({"success": False, "message": _("Thumbnail is required.")})

        try:
            with transaction.atomic():
                portfolio.title = title
                portfolio.description = description
                portfolio.tags = tags
                portfolio.external_link = external_link
                portfolio.is_featured = is_featured
                if thumbnail:
                    portfolio.thumbnail = thumbnail
                if model_3d:
                    portfolio.model_3d = model_3d
                elif clear_model_3d and portfolio.model_3d:
                    portfolio.model_3d.delete(save=False)
                    portfolio.model_3d = None
                portfolio.save()

                delete_ids = request.POST.getlist("delete_images")
                if delete_ids:
                    PortfolioGallery.objects.filter(pk__in=delete_ids, portfolio=portfolio).delete()

                gallery_images = request.FILES.getlist("gallery_images")
                for image in gallery_images:
                    PortfolioGallery.objects.create(portfolio=portfolio, image=image)

            return JsonResponse({
                "success": True,
                "message": _("Portfolio updated successfully."),
                "redirect_url": reverse("dash:portfolio_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    existing_gallery = portfolio.gallery_images.all()

    return render(request, "portfolio/edit.html", {
        "portfolio": portfolio,
        "existing_gallery": existing_gallery,
        "title": _("Edit Portfolio"),
    })


@admin_required
def portfolio_delete(request, pk):
    if request.method == "POST":
        portfolio = get_object_or_404(Portfolio, pk=pk)
        try:
            portfolio.delete()
            return JsonResponse({"success": True, "message": _("Portfolio deleted successfully.")})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": _("Invalid request method.")})
