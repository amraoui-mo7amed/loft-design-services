import uuid

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .base import ProjectType, Space, SpaceCategoryImages, SpaceImage
from .catalog import Service

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
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests", verbose_name=_("Service")
    )
    total_surface = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name=_("Total Surface (m²)")
    )
    has_terrace = models.BooleanField(default=False, verbose_name=_("Has Terrace"))
    has_garden = models.BooleanField(default=False, verbose_name=_("Has Garden"))
    floors_above = models.IntegerField(default=0, verbose_name=_("Floors Above RDC"))
    floors_below = models.IntegerField(default=0, verbose_name=_("Floors Below RDC"))

    class ClientType(models.TextChoices):
        PARTICULAR = "particular", _("Particulier")
        PROFESSIONAL = "professional", _("Professionnel")

    client_type = models.CharField(
        max_length=20,
        choices=ClientType.choices,
        default=ClientType.PARTICULAR,
        verbose_name=_("Client Type"),
    )
    company_name = models.CharField(
        max_length=200, blank=True, verbose_name=_("Company Name")
    )
    wilaya = models.CharField(
        max_length=100, blank=True, verbose_name=_("Wilaya")
    )
    commune = models.CharField(
        max_length=100, blank=True, verbose_name=_("Commune")
    )
    message = models.TextField(blank=True, verbose_name=_("Message / Notes"))
    mode = models.CharField(
        max_length=20, default="quick", blank=True, verbose_name=_("Composer Mode")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    @property
    def contact_email(self):
        return self.email or (self.client.email if self.client else "")

    @property
    def contact_name(self):
        full = f"{self.first_name} {self.last_name}".strip()
        if full:
            return full
        if self.client:
            return self.client.get_full_name() or self.client.username
        return str(_("Client"))

    @property
    def contact_phone(self):
        if self.phone:
            return self.phone
        if self.client and hasattr(self.client, "profile"):
            return getattr(self.client.profile, "phone_number", None) or getattr(self.client.profile, "phone", "") or ""
        return ""

    class Meta:
        verbose_name = _("Design Request")
        verbose_name_plural = _("Design Requests")
        ordering = ["-created_at"]

    def __str__(self):
        return f"LOFT-{self.created_at.year}-{self.pk:04d}"

    @property
    def project_number(self):
        return str(self)

    @property
    def package(self):
        return self.service

    @package.setter
    def package(self, val):
        self.service = val


class DesignRequestFloor(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="floors", verbose_name=_("Design Request")
    )
    name = models.CharField(max_length=100, verbose_name=_("Name"))
    level = models.IntegerField(default=0, verbose_name=_("Level"))
    order = models.IntegerField(default=0, verbose_name=_("Order"))
    surface = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name=_("Surface (m²)")
    )

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
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, related_name="request_options", verbose_name=_("Service")
    )
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Price at Time"))

    @property
    def name(self):
        return self.service.service_name if self.service else str(_("Design Service"))

    class Meta:
        verbose_name = _("Request Option")
        verbose_name_plural = _("Request Options")

    def __str__(self):
        return f"{self.design_request.project_number} - {self.name}"


class DesignRequestSpaceImage(models.Model):
    design_request_space = models.ForeignKey(
        DesignRequestSpace, on_delete=models.CASCADE, related_name="space_images", verbose_name=_("Request Space")
    )
    space_image = models.ForeignKey(
        SpaceCategoryImages, on_delete=models.SET_NULL, null=True, related_name="request_space_images", verbose_name=_("Gallery Image")
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


class ProjectGalleryInvitation(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name=_("Token"))
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="gallery_invitations", verbose_name=_("Design Request")
    )
    email = models.EmailField(verbose_name=_("Recipient Email"))
    is_used = models.BooleanField(default=False, verbose_name=_("Is Used"))
    used_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Used At"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Project Gallery Invitation")
        verbose_name_plural = _("Project Gallery Invitations")
        ordering = ["-created_at"]

    def __str__(self):
        status = "Used" if self.is_used else "Pending"
        return f"{self.design_request.project_number} - {self.email} ({status})"

    def get_selection_url(self, request=None):
        from django.urls import reverse, NoReverseMatch
        from django.conf import settings
        try:
            path = reverse("frontend:gallery_client_selection", kwargs={"token": str(self.token)})
        except NoReverseMatch:
            path = reverse("gallery_client_selection", kwargs={"token": str(self.token)})
        if request:
            return request.build_absolute_uri(path)
        site_url = getattr(settings, "SITE_URL", "http://localhost:8000")
        return f"{site_url.rstrip('/')}{path}"


class DesignRequestGalleryImage(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="gallery_selections", verbose_name=_("Design Request")
    )
    space_image = models.ForeignKey(
        SpaceCategoryImages, on_delete=models.CASCADE, related_name="request_gallery_selections", verbose_name=_("Gallery Image")
    )
    notes = models.TextField(blank=True, default="", verbose_name=_("Client Notes"))
    selected_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Selected At"))

    class Meta:
        verbose_name = _("Design Request Gallery Selection")
        verbose_name_plural = _("Design Request Gallery Selections")
        ordering = ["selected_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["design_request", "space_image"], name="unique_request_gallery_image"
            )
        ]

    def __str__(self):
        return f"{self.design_request.project_number} - Image #{self.space_image_id}"
