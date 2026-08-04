import uuid

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .base import ProjectType, Space, SpaceImage
from .catalog import DesignPackage, DesignOption

userModel = get_user_model()


class DesignRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        APPROVED = "approved", _("Approved")
        DECLINED = "declined", _("Declined")

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name=_("UUID"))
    client = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, blank=True, related_name="design_requests", verbose_name=_("Client")
    )
    first_name = models.CharField(max_length=100, blank=True, verbose_name=_("First Name"))
    last_name = models.CharField(max_length=100, blank=True, verbose_name=_("Last Name"))
    email = models.EmailField(blank=True, verbose_name=_("Email"))
    phone = models.CharField(max_length=30, blank=True, verbose_name=_("Phone"))
    project_name = models.CharField(max_length=200, verbose_name=_("Project Name"))
    project_type = models.ForeignKey(
        ProjectType, on_delete=models.SET_NULL, null=True, related_name="requests", verbose_name=_("Project Type")
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name=_("Status")
    )
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_("Budget"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name=_("Total"))
    designer = models.ForeignKey(
        userModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests",
        verbose_name=_("Designer"),
    )
    delivery_date = models.DateField(null=True, blank=True, verbose_name=_("Delivery Date"))
    revision_count = models.PositiveIntegerField(default=2, verbose_name=_("Revision Count"))
    package = models.ForeignKey(
        DesignPackage, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests", verbose_name=_("Package")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Design Request")
        verbose_name_plural = _("Design Requests")
        ordering = ["-created_at"]

    def __str__(self):
        return f"LOFT-{self.created_at.year}-{self.pk:04d}"

    @property
    def project_number(self):
        return str(self)


class DesignRequestFloor(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="floors", verbose_name=_("Design Request")
    )
    name = models.CharField(max_length=100, verbose_name=_("Name"))
    level = models.IntegerField(default=0, verbose_name=_("Level"))
    order = models.IntegerField(default=0, verbose_name=_("Order"))

    class Meta:
        verbose_name = _("Floor")
        verbose_name_plural = _("Floors")
        ordering = ["design_request", "order"]

    def __str__(self):
        return f"{self.design_request.project_number} - {self.name}"


class DesignRequestSpace(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="spaces", verbose_name=_("Design Request")
    )
    floor = models.ForeignKey(
        DesignRequestFloor, on_delete=models.CASCADE, related_name="spaces", verbose_name=_("Floor")
    )
    space = models.ForeignKey(
        Space, on_delete=models.SET_NULL, null=True, related_name="request_spaces", verbose_name=_("Space")
    )
    custom_name = models.CharField(max_length=200, blank=True, verbose_name=_("Custom Name"))
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Price at Time"))

    class Meta:
        verbose_name = _("Request Space")
        verbose_name_plural = _("Request Spaces")

    def __str__(self):
        name = self.custom_name or (self.space.name if self.space else "N/A")
        return f"{self.design_request.project_number} - {name}"


class DesignRequestOption(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="options", verbose_name=_("Design Request")
    )
    option = models.ForeignKey(
        DesignOption, on_delete=models.SET_NULL, null=True, related_name="request_options", verbose_name=_("Option")
    )
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Price at Time"))

    class Meta:
        verbose_name = _("Request Option")
        verbose_name_plural = _("Request Options")

    def __str__(self):
        return f"{self.design_request.project_number} - {self.option.name if self.option else 'N/A'}"


class DesignRequestSpaceImage(models.Model):
    design_request_space = models.ForeignKey(
        DesignRequestSpace, on_delete=models.CASCADE, related_name="space_images", verbose_name=_("Request Space")
    )
    space_image = models.ForeignKey(
        SpaceImage, on_delete=models.SET_NULL, null=True, related_name="request_space_images", verbose_name=_("Gallery Image")
    )

    class Meta:
        verbose_name = _("Request Gallery Image")
        verbose_name_plural = _("Request Gallery Images")

    def __str__(self):
        return f"Gallery image for {self.design_request_space}"


class DesignRequestFile(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="files", verbose_name=_("Design Request")
    )
    file = models.FileField(upload_to="design-requests/files/", verbose_name=_("File"))
    file_type = models.CharField(max_length=50, blank=True, verbose_name=_("File Type"))
    uploaded_by = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="uploaded_files", verbose_name=_("Uploaded By")
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Uploaded At"))

    class Meta:
        verbose_name = _("Request File")
        verbose_name_plural = _("Request Files")

    def __str__(self):
        return f"File for {self.design_request.project_number}"
