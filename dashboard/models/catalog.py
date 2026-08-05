from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class ServiceCategory(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Service Category")
        verbose_name_plural = _("Service Categories")

    def __str__(self):
        return self.name


class PackageService(models.Model):
    package = models.ForeignKey(
        "DesignPackage", on_delete=models.CASCADE, related_name="package_services", verbose_name=_("Package")
    )
    option = models.ForeignKey(
        "DesignOption", on_delete=models.CASCADE, related_name="package_services", verbose_name=_("Service")
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Price"))
    sort_order = models.IntegerField(default=0, verbose_name=_("Sort Order"))

    class Meta:
        verbose_name = _("Package Service")
        verbose_name_plural = _("Package Services")
        ordering = ["sort_order"]
        unique_together = ["package", "option"]

    def __str__(self):
        return f"{self.package.name} → {self.option.name}"


class DesignPackage(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    delivery_time_days = models.PositiveIntegerField(default=7, verbose_name=_("Delivery Time (days)"))
    price_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0, verbose_name=_("Price Multiplier"))
    services_after_payment = models.TextField(blank=True, verbose_name=_("Services After Payment"))
    services = models.ManyToManyField(
        "DesignOption", through="PackageService", blank=True, related_name="packages", verbose_name=_("Services")
    )
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Design Package")
        verbose_name_plural = _("Design Packages")

    def __str__(self):
        return self.name

    @property
    def total_delivery_days(self):
        return self.delivery_time_days


class DesignOption(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    category = models.ForeignKey(
        ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="design_options", verbose_name=_("Category")
    )
    active = models.BooleanField(default=True, verbose_name=_("Active"))

    class Meta:
        verbose_name = _("Design Option")
        verbose_name_plural = _("Design Options")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
