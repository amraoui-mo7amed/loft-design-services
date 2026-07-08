from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class ProjectType(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    image = models.ImageField(upload_to="project_types/", blank=True, null=True, verbose_name=_("Image"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    sort_order = models.IntegerField(default=0, unique=True, verbose_name=_("Sort Order"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Project Type")
        verbose_name_plural = _("Project Types")
        ordering = ["sort_order"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SpaceCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Space Category")
        verbose_name_plural = _("Space Categories")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Space(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    image = models.ImageField(upload_to="spaces/", blank=True, null=True, verbose_name=_("Image"))
    category = models.CharField(max_length=100, blank=True, verbose_name=_("Category"))
    space_category = models.ForeignKey(
        SpaceCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="spaces", verbose_name=_("Space Category")
    )
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Base Price"))
    estimated_days = models.PositiveIntegerField(default=1, verbose_name=_("Estimated Days"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
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

    def __str__(self):
        return self.name


class ProjectTypeSpace(models.Model):
    project_type = models.ForeignKey(
        ProjectType, on_delete=models.CASCADE, related_name="default_spaces", verbose_name=_("Project Type")
    )
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="project_types", verbose_name=_("Space")
    )
    sort_order = models.IntegerField(default=0, verbose_name=_("Sort Order"))

    class Meta:
        verbose_name = _("Default Space for Type")
        verbose_name_plural = _("Default Spaces for Types")
        ordering = ["project_type", "sort_order"]
        unique_together = ["project_type", "space"]

    def __str__(self):
        return f"{self.project_type} \u2192 {self.space}"
