from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
import hashlib
import json


class ProjectType(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    featured_on_home = models.BooleanField(default=False, verbose_name=_("Featured on Home"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Project Type")
        verbose_name_plural = _("Project Types")
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Space(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Base Price"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Space")
        verbose_name_plural = _("Spaces")
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def _images(self):
        return list(self.gallery_images.all())

    @property
    def thumbnail(self):
        images = self._images()
        if not images:
            return None
        flagged = next((img for img in images if img.is_thumbnail), None)
        return flagged.image if flagged else images[0].image

    @property
    def gallery_images_json(self):
        images = self._images()
        thumb = next((img for img in images if img.is_thumbnail), None)
        thumb_id = thumb.pk if thumb else (images[0].pk if images else None)
        data = [
            {
                "id": img.pk,
                "url": img.image.url,
                "is_thumbnail": img.pk == thumb_id,
                "hash": img.content_hash,
            }
            for img in images
        ]
        return json.dumps(data)

    def __str__(self):
        return self.name


class SpaceImage(models.Model):
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="gallery_images",
        verbose_name=_("Space")
    )
    image = models.ImageField(upload_to="spaces/gallery/", verbose_name=_("Image"))
    is_thumbnail = models.BooleanField(default=False, verbose_name=_("Is Thumbnail"))
    content_hash = models.CharField(max_length=64, blank=True, default="", editable=False, verbose_name=_("Content Hash"))

    class Meta:
        verbose_name = _("Space Image")
        verbose_name_plural = _("Space Images")
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["space", "content_hash"],
                condition=~Q(content_hash=""),
                name="unique_space_image_content_hash",
            ),
        ]

    def __str__(self):
        return f"Image for {self.space.name}"

    def save(self, *args, **kwargs):
        if not self.content_hash and self.image:
            try:
                self.image.seek(0)
                self.content_hash = hashlib.sha256(self.image.read()).hexdigest()
                self.image.seek(0)
            except Exception:
                pass
        super().save(*args, **kwargs)

    @staticmethod
    def compute_hash(uploaded_file):
        try:
            uploaded_file.seek(0)
            digest = hashlib.sha256(uploaded_file.read()).hexdigest()
            uploaded_file.seek(0)
            return digest
        except Exception:
            return ""


class ProjectTypeSpace(models.Model):
    project_type = models.ForeignKey(
        ProjectType, on_delete=models.CASCADE, related_name="default_spaces", verbose_name=_("Project Type")
    )
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="project_types", verbose_name=_("Space")
    )
    sort_order = models.IntegerField(default=0, verbose_name=_("Sort Order"))
    show_on_home = models.BooleanField(default=False, verbose_name=_("Show on Home"))

    class Meta:
        verbose_name = _("Default Space for Type")
        verbose_name_plural = _("Default Spaces for Types")
        ordering = ["project_type", "sort_order"]
        constraints = [
            models.UniqueConstraint(
                fields=["space"], name="unique_space_project_type",
            ),
        ]

    def __str__(self):
        return f"{self.project_type} \u2192 {self.space}"
