from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils.translation import gettext as _

from ..decorator import admin_required
from ..models import PricingConfig


@admin_required
def pricing_settings(request):
    config = PricingConfig.get_instance()
    if request.method == "POST":
        config.tax_rate = request.POST.get("tax_rate", config.tax_rate)
        config.default_revision_count = request.POST.get("default_revision_count", config.default_revision_count)
        config.currency_symbol = request.POST.get("currency_symbol", config.currency_symbol)
        config.default_delivery_days = request.POST.get("default_delivery_days", config.default_delivery_days)
        config.save()
        return JsonResponse({
            "success": True,
            "message": _("Pricing settings updated successfully."),
            "redirect_url": reverse("dash:pricing_settings"),
        })
    return render(request, "dashboard/admin/pricing.html", {"config": config})
