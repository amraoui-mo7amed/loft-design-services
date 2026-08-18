import hashlib
import json
from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


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
        return list(
            SpaceCategoryImages.objects.filter(category__space=self)
            .select_related("category")
            .order_by("-is_default", "id")
        )

    @property
    def gallery_images(self):
        return SpaceCategoryImages.objects.filter(category__space=self).select_related("category")

    @property
    def thumbnail(self):
        for cat in self.categories.all():
            default_img = cat.images.filter(is_default=True).first()
            if default_img:
                return default_img.image
            first_img = cat.images.first()
            if first_img:
                return first_img.image
        return None

    @property
    def gallery_images_json(self):
        images = self._images()
        data = [
            {
                "id": img.pk,
                "url": img.image.url,
                "is_default": img.is_default,
                "is_thumbnail": img.is_default,
                "category_id": img.category_id,
                "category_name": img.category.category_name,
                "hash": img.content_hash,
                "description": img.description,
                "tags": img.tags,
                "reference": img.reference,
            }
            for img in images
        ]
        return json.dumps(data)

    def __str__(self):
        return self.name


class SpaceCategory(models.Model):
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="categories", verbose_name=_("Space")
    )
    category_name = models.CharField(max_length=150, verbose_name=_("Category Name"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Space Category")
        verbose_name_plural = _("Space Categories")
        ordering = ["category_name"]

    def __str__(self):
        return f"{self.space.name} - {self.category_name}"

    @property
    def name(self):
        return self.category_name


class SpaceCategoryImages(models.Model):
    category = models.ForeignKey(
        SpaceCategory, on_delete=models.CASCADE, related_name="images", verbose_name=_("Category")
    )
    image = models.ImageField(upload_to="spaces/gallery/", verbose_name=_("Image"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"))
    content_hash = models.CharField(max_length=64, blank=True, default="", editable=False, verbose_name=_("Content Hash"))
    description = models.TextField(blank=True, default="", verbose_name=_("Description"))
    tags = models.CharField(max_length=500, blank=True, default="", verbose_name=_("Tags"))
    reference = models.CharField(max_length=500, blank=True, default="", verbose_name=_("Reference"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Space Category Image")
        verbose_name_plural = _("Space Category Images")
        ordering = ["-is_default", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "content_hash"],
                condition=~Q(content_hash=""),
                name="unique_space_cat_image_content_hash",
            ),
        ]

    def __str__(self):
        return f"Image for {self.category.category_name} ({self.category.space.name})"

    @property
    def space(self):
        return self.category.space

    @property
    def is_thumbnail(self):
        return self.is_default

    @is_thumbnail.setter
    def is_thumbnail(self, value):
        self.is_default = value

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


# Aliases
SpaceImage = SpaceCategoryImages
SpaceCategoryImage = SpaceCategoryImages


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
        return f"{self.project_type} → {self.space}"
