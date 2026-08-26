from decimal import Decimal
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _, get_language


class ServicePricing(models.Model):
    class PricingType(models.TextChoices):
        FIXED = "fixed", _("Fixed Price")
        AREA = "area", _("Price per Square Metre (m²)")
        HOURLY = "hourly", _("Price per Hour")
        PERCENTAGE_PROJECT_COST = "percent_project_cost", _("Percentage of Estimated Total Project Cost")

    service_name = models.CharField(max_length=150, verbose_name=_("Service Name"))
    pricing_type = models.CharField(
        max_length=30,
        choices=PricingType.choices,
        default=PricingType.FIXED,
        verbose_name=_("Pricing Type"),
    )
    service_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Price (DA)"),
    )
    percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        null=True,
        blank=True,
        verbose_name=_("Percentage Rate (%)"),
    )
    min_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Minimum Fee (DA)"),
    )
    max_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Maximum Fee (DA)"),
    )

    # Base description fields (fallback / French default)
    short_description = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Short Description"),
    )
    detailed_description = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Detailed Description"),
    )
    included_items = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("What is Included"),
    )
    excluded_items = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("What is Not Included"),
    )
    deliverables = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Deliverables"),
    )
    included_revisions = models.CharField(
        max_length=50,
        blank=True,
        default="",
        verbose_name=_("Included Revisions"),
    )
    estimated_delivery_time = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name=_("Estimated Delivery Time"),
    )

    video_link = models.URLField(max_length=500, blank=True, null=True, verbose_name=_("Video Link"))
    gif_file = models.FileField(upload_to="services/gifs/", blank=True, null=True, verbose_name=_("GIF / Preview File"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Service Pricing")
        verbose_name_plural = _("Service Pricings")
        ordering = ["-is_default", "service_name"]

    def __str__(self):
        return self.service_name

    @property
    def name(self):
        return self.service_name

    def save(self, *args, **kwargs):
        if self.is_default:
            with transaction.atomic():
                ServicePricing.objects.exclude(pk=self.pk).filter(is_default=True).update(is_default=False)
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def get_translation(self, locale=None):
        target_locale = locale or get_language() or "fr"
        short_locale = target_locale.split("-")[0].lower()

        translations = list(self.translations.all())
        matched = next((t for t in translations if t.locale == short_locale), None)
        if not matched and short_locale != "fr":
            matched = next((t for t in translations if t.locale == "fr"), None)
        if not matched and translations:
            matched = translations[0]

        if matched:
            return {
                "locale": matched.locale,
                "name": matched.name or self.service_name,
                "short_description": matched.short_description or self.short_description,
                "detailed_description": matched.detailed_description or self.detailed_description,
                "included_items": matched.included_items if matched.included_items else self.included_items,
                "excluded_items": matched.excluded_items if matched.excluded_items else self.excluded_items,
                "deliverables": matched.deliverables if matched.deliverables else self.deliverables,
                "included_revisions": matched.included_revisions or self.included_revisions,
                "estimated_delivery_time": matched.estimated_delivery_time or self.estimated_delivery_time,
            }

        return {
            "locale": "fr",
            "name": self.service_name,
            "short_description": self.short_description,
            "detailed_description": self.detailed_description,
            "included_items": self.included_items,
            "excluded_items": self.excluded_items,
            "deliverables": self.deliverables,
            "included_revisions": self.included_revisions,
            "estimated_delivery_time": self.estimated_delivery_time,
        }

    @property
    def name_fr(self):
        return self.get_translation("fr")["name"]

    @property
    def name_en(self):
        return self.get_translation("en")["name"]

    @property
    def name_ar(self):
        return self.get_translation("ar")["name"]

    @property
    def short_description_fr(self):
        return self.get_translation("fr")["short_description"]

    @property
    def short_description_en(self):
        return self.get_translation("en")["short_description"]

    @property
    def short_description_ar(self):
        return self.get_translation("ar")["short_description"]

    @property
    def detailed_description_fr(self):
        return self.get_translation("fr")["detailed_description"]

    @property
    def detailed_description_en(self):
        return self.get_translation("en")["detailed_description"]

    @property
    def detailed_description_ar(self):
        return self.get_translation("ar")["detailed_description"]

    def calculate_service_fee(self, estimated_project_cost=0, total_surface=0, hours=0):
        cost = Decimal(str(estimated_project_cost or 0))
        surface = Decimal(str(total_surface or 0))
        h = Decimal(str(hours or 0))

        if self.pricing_type == self.PricingType.PERCENTAGE_PROJECT_COST:
            rate = self.percentage_rate or Decimal("0")
            fee = (cost * rate) / Decimal("100")
            if self.min_fee is not None:
                fee = max(fee, self.min_fee)
            if self.max_fee is not None:
                fee = min(fee, self.max_fee)
            return fee.quantize(Decimal("0.01"))
        elif self.pricing_type == self.PricingType.AREA:
            return (surface * self.service_price).quantize(Decimal("0.01"))
        elif self.pricing_type == self.PricingType.HOURLY:
            qty = h if h > 0 else Decimal("1")
            return (qty * self.service_price).quantize(Decimal("0.01"))
        else:
            return self.service_price


class ServiceTranslation(models.Model):
    class Locale(models.TextChoices):
        FRENCH = "fr", _("French")
        ENGLISH = "en", _("English")
        ARABIC = "ar", _("Arabic")

    service = models.ForeignKey(
        ServicePricing,
        on_delete=models.CASCADE,
        related_name="translations",
        verbose_name=_("Service"),
    )
    locale = models.CharField(
        max_length=10,
        choices=Locale.choices,
        verbose_name=_("Locale"),
    )
    name = models.CharField(
        max_length=150,
        verbose_name=_("Localized Name"),
    )
    short_description = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Short Description"),
    )
    detailed_description = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Detailed Description"),
    )
    included_items = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("What is Included"),
    )
    excluded_items = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("What is Not Included"),
    )
    deliverables = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Deliverables"),
    )
    included_revisions = models.CharField(
        max_length=50,
        blank=True,
        default="",
        verbose_name=_("Included Revisions"),
    )
    estimated_delivery_time = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name=_("Estimated Delivery Time"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Service Translation")
        verbose_name_plural = _("Service Translations")
        constraints = [
            models.UniqueConstraint(
                fields=["service", "locale"],
                name="unique_service_translation_locale",
            )
        ]
        ordering = ["locale"]

    def __str__(self):
        return f"{self.service.service_name} [{self.locale}]"


Service = ServicePricing
