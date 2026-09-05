import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .base import ProjectType, Space
from .catalog import ServicePricing
from .requests import DesignRequest

userModel = get_user_model()


class Quote(models.Model):
    class Origin(models.TextChoices):
        CUSTOMER = "customer", _("Customer Created")
        ADMIN = "admin", _("Admin Created")

    class Status(models.TextChoices):
        DRAFT = "draft", _("Draft")
        READY_TO_SEND = "ready_to_send", _("Ready to Send")
        SENT = "sent", _("Sent")
        VIEWED = "viewed", _("Viewed")
        ACCEPTED = "accepted", _("Accepted")
        REJECTED = "rejected", _("Rejected")
        EXPIRED = "expired", _("Expired")
        SUPERSEDED = "superseded", _("Superseded")
        ARCHIVED = "archived", _("Archived")

    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", _("Percentage (%)")
        FIXED = "fixed", _("Fixed Amount (DA)")

    class ClientType(models.TextChoices):
        PARTICULAR = "particular", _("Particulier")
        PROFESSIONAL = "professional", _("Professionnel")

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name=_("UUID"))
    quote_number = models.CharField(max_length=50, verbose_name=_("Quote Number"), db_index=True)
    revision_number = models.PositiveIntegerField(default=1, verbose_name=_("Revision Number"))
    parent_quote = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revisions",
        verbose_name=_("Parent Quote Revision"),
    )
    is_current_revision = models.BooleanField(default=True, verbose_name=_("Is Current Revision"))

    design_request = models.ForeignKey(
        DesignRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotes",
        verbose_name=_("Associated Design Request"),
    )
    client = models.ForeignKey(
        userModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotes",
        verbose_name=_("Client"),
    )
    created_by = models.ForeignKey(
        userModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_quotes",
        verbose_name=_("Created By User"),
    )

    origin = models.CharField(
        max_length=20,
        choices=Origin.choices,
        default=Origin.CUSTOMER,
        verbose_name=_("Origin"),
    )
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name=_("Status"),
    )

    # Client details snapshot
    first_name = models.CharField(max_length=100, blank=True, default="", verbose_name=_("First Name"))
    last_name = models.CharField(max_length=100, blank=True, default="", verbose_name=_("Last Name"))
    email = models.EmailField(blank=True, default="", verbose_name=_("Email"))
    phone = models.CharField(max_length=40, blank=True, default="", verbose_name=_("Phone"))
    company_name = models.CharField(max_length=200, blank=True, default="", verbose_name=_("Company Name"))
    client_type = models.CharField(
        max_length=20,
        choices=ClientType.choices,
        default=ClientType.PARTICULAR,
        verbose_name=_("Client Type"),
    )
    wilaya = models.CharField(max_length=100, blank=True, default="", verbose_name=_("Wilaya"))
    commune = models.CharField(max_length=100, blank=True, default="", verbose_name=_("Commune"))

    # Project metadata
    project_name = models.CharField(max_length=200, verbose_name=_("Project Name"))
    project_type = models.ForeignKey(
        ProjectType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotes",
        verbose_name=_("Project Type"),
    )
    total_surface = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Total Surface (m²)"),
    )
    surface_interior = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Surface Intérieure (m²)"),
    )
    surface_exterior = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Surface Extérieure (m²)"),
    )
    estimated_total_project_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Estimated Total Project Cost (DA)"),
    )

    # Financial breakdown
    subtotal_before_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Subtotal Before Discount (DA)"),
    )
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        null=True,
        blank=True,
        verbose_name=_("Discount Type"),
    )
    discount_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Discount Value"),
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Discount Amount (DA)"),
    )
    subtotal_after_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Subtotal After Discount (DA)"),
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Tax Amount (DA)"),
    )
    final_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Final Total (DA)"),
    )
    currency = models.CharField(max_length=10, default="DA", verbose_name=_("Currency"))

    # Discount notes & audit visibility
    internal_discount_reason = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Internal Discount Reason (Audit Only)"),
    )
    client_discount_note = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Client-facing Discount Note"),
    )
    client_notes = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Client Notes / Terms"),
    )
    html_snapshot = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Devis HTML Snapshot"),
        help_text=_("Exact rendered devis + contract HTML, saved from the composer and served at the public dossier link."),
    )
    pdf_snapshot = models.FileField(
        upload_to="quotes/pdf-snapshots/",
        blank=True,
        null=True,
        verbose_name=_("Devis PDF Snapshot"),
        help_text=_("Exact unified devis + contract PDF generated by the composer, attached when this quote is sent."),
    )

    valid_until = models.DateField(null=True, blank=True, verbose_name=_("Valid Until"))
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Sent At"))
    last_sent_by = models.ForeignKey(
        userModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_quotes",
        verbose_name=_("Last Sent By User"),
    )
    viewed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Viewed At"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Quote")
        verbose_name_plural = _("Quotes")
        ordering = ["-created_at"]

    def __str__(self):
        rev = f" (Rev {self.revision_number})" if self.revision_number > 1 else ""
        return f"{self.quote_number}{rev} - {self.project_name}"

    @property
    def full_client_name(self):
        if self.client_type == self.ClientType.PROFESSIONAL and self.company_name:
            return self.company_name
        full = f"{self.first_name} {self.last_name}".strip()
        if full:
            return full
        if self.client:
            return self.client.get_full_name() or self.client.username
        return str(_("Client"))

    @property
    def is_locked(self):
        return self.status in [self.Status.ACCEPTED, self.Status.SUPERSEDED, self.Status.ARCHIVED]


class QuoteItem(models.Model):
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name=_("Quote"),
    )
    service = models.ForeignKey(
        ServicePricing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_items",
        verbose_name=_("Catalog Service"),
    )
    service_name = models.CharField(max_length=150, verbose_name=_("Service Name"))
    pricing_model = models.CharField(max_length=40, default="fixed", verbose_name=_("Pricing Model"))
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Unit Price (DA)"),
    )
    percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Percentage Rate (%)"),
    )
    estimated_project_cost_base = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Estimated Project Cost Base (DA)"),
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("1.00"),
        verbose_name=_("Quantity / Surface"),
    )
    unit = models.CharField(max_length=30, default="FORFAIT", verbose_name=_("Unit"))
    line_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Line Total (DA)"),
    )
    details_snapshot = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Commercial Details Snapshot"),
    )

    class Meta:
        verbose_name = _("Quote Item")
        verbose_name_plural = _("Quote Items")

    def __str__(self):
        return f"{self.quote.quote_number} - {self.service_name}"


class QuoteSpace(models.Model):
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name="spaces",
        verbose_name=_("Quote"),
    )
    space = models.ForeignKey(
        Space,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_spaces",
        verbose_name=_("Space"),
    )
    space_name = models.CharField(max_length=150, verbose_name=_("Space Name"))
    floor_name = models.CharField(max_length=100, blank=True, default="", verbose_name=_("Floor / Level"))
    price_at_time = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name=_("Price at Time (DA)"),
    )

    class Meta:
        verbose_name = _("Quote Space")
        verbose_name_plural = _("Quote Spaces")

    def __str__(self):
        return f"{self.quote.quote_number} - {self.space_name}"


class QuoteAuditEvent(models.Model):
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name="audit_logs",
        verbose_name=_("Quote"),
    )
    actor = models.ForeignKey(
        userModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_audit_logs",
        verbose_name=_("Actor"),
    )
    action = models.CharField(max_length=80, verbose_name=_("Action"))
    previous_value = models.TextField(blank=True, default="", verbose_name=_("Previous Value"))
    new_value = models.TextField(blank=True, default="", verbose_name=_("New Value"))
    reason = models.TextField(blank=True, default="", verbose_name=_("Reason / Note"))
    metadata = models.JSONField(default=dict, blank=True, verbose_name=_("Metadata"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Timestamp"))

    class Meta:
        verbose_name = _("Quote Audit Event")
        verbose_name_plural = _("Quote Audit Events")
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {self.quote.quote_number} - {self.action}"
