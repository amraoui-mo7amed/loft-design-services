from django.db import models
from django.utils.translation import gettext_lazy as _


class ServicePricing(models.Model):
    class PricingType(models.TextChoices):
        FIXED = "fixed", _("Fixed Price")
        AREA = "area", _("Price per Square Metre (m²)")
        HOURLY = "hourly", _("Price per Hour")

    service_name = models.CharField(max_length=150, verbose_name=_("Service Name"))
    pricing_type = models.CharField(
        max_length=20,
        choices=PricingType.choices,
        default=PricingType.FIXED,
        verbose_name=_("Pricing Type"),
    )
    service_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_("Price (DA)"),
    )
    video_link = models.URLField(max_length=500, blank=True, null=True, verbose_name=_("Video Link"))
    gif_file = models.FileField(upload_to="services/gifs/", blank=True, null=True, verbose_name=_("GIF / Preview File"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Service Pricing")
        verbose_name_plural = _("Service Pricings")
        ordering = ["service_name"]

    def __str__(self):
        return self.service_name

    @property
    def name(self):
        return self.service_name


Service = ServicePricing
