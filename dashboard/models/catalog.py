from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify

from .base import Space


class DesignPackage(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    price_multiplier = models.DecimalField(
        max_digits=4, decimal_places=2, default=1.0, verbose_name=_("Price Multiplier")
    )
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Design Package")
        verbose_name_plural = _("Design Packages")

    def __str__(self):
        return self.name


class DesignOption(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Price"))
    category = models.CharField(max_length=100, blank=True, verbose_name=_("Category"))
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


class StyleCategory(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Style Category")
        verbose_name_plural = _("Style Categories")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InspirationImage(models.Model):
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="inspiration_images", verbose_name=_("Space")
    )
    style_category = models.ForeignKey(
        StyleCategory, on_delete=models.CASCADE, related_name="inspiration_images", verbose_name=_("Style Category")
    )
    image = models.ImageField(upload_to="inspirations/", verbose_name=_("Image"))
    title = models.CharField(max_length=200, blank=True, verbose_name=_("Title"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Inspiration Image")
        verbose_name_plural = _("Inspiration Images")

    def __str__(self):
        return self.title or f"Inspiration #{self.id}"
