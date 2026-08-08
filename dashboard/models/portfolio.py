from django.db import models
from django.utils.translation import gettext_lazy as _


class Portfolio(models.Model):
    title = models.CharField(max_length=1000, verbose_name=_("Title"), blank=True)
    thumbnail = models.ImageField(upload_to="portfolio/thumbnails/", verbose_name=_("Thumbnail"), blank=True, null=True)
    description = models.TextField(verbose_name=_("Description"), blank=True)
    tags = models.CharField(max_length=100000, verbose_name=_("Tags"), help_text=_("Comma separated tags"), blank=True)
    external_link = models.URLField(verbose_name=_("External Link"), blank=True, null=True)
    is_featured = models.BooleanField(default=False, verbose_name=_("Is Featured"))
    model_3d = models.FileField(
        upload_to="portfolio/models/",
        verbose_name=_("3D Model"),
        blank=True, null=True,
        help_text=_("Upload a GLB/GLTF 3D model")
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        verbose_name = _("Portfolio")
        verbose_name_plural = _("Portfolios")
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class PortfolioGallery(models.Model):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name="gallery_images",
        verbose_name=_("Portfolio")
    )
    image = models.ImageField(upload_to="portfolio/gallery/", verbose_name=_("Image"))

    class Meta:
        verbose_name = _("Portfolio Image")
        verbose_name_plural = _("Portfolio Images")

    def __str__(self):
        return f"Image for {self.portfolio.title}"
