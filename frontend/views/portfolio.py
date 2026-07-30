import json

from django.core.paginator import Paginator
from django.shortcuts import render, get_object_or_404

from dashboard.models import Portfolio


def portfolio_list(request):
    all_portfolios = Portfolio.objects.all().order_by("-created_at")
    paginator = Paginator(all_portfolios, 6)
    page = request.GET.get("page", 1)
    portfolios = paginator.get_page(page)

    return render(request, "portfolio/portfolio_list.html", {
        "portfolios": portfolios,
    })


def portfolio_detail(request, pk):
    portfolio = get_object_or_404(Portfolio, pk=pk)
    gallery_qs = portfolio.gallery_images.all()

    gallery_urls = [img.image.url for img in gallery_qs]
    if portfolio.thumbnail:
        gallery_urls.insert(0, portfolio.thumbnail.url)

    tags = [t.strip() for t in (portfolio.tags or "").split(",") if t.strip()]

    return render(request, "portfolio/portfolio_detail.html", {
        "portfolio": portfolio,
        "gallery_images": gallery_urls,
        "gallery_json": json.dumps(gallery_urls),
        "tags": tags,
        "model_3d_url": portfolio.model_3d.url if portfolio.model_3d else None,
    })
