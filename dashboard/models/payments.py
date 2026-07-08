from django.db import models
from django.utils.translation import gettext_lazy as _

from .requests import DesignRequest


class DesignPayment(models.Model):
    class PaymentMethod(models.TextChoices):
        STRIPE = "stripe", _("Stripe")
        PAYPAL = "paypal", _("PayPal")
        MANUAL = "manual", _("Manual Transfer")

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", _("Pending")
        COMPLETED = "completed", _("Completed")
        FAILED = "failed", _("Failed")
        REFUNDED = "refunded", _("Refunded")

    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="payments", verbose_name=_("Design Request")
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_("Amount"))
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, verbose_name=_("Payment Method")
    )
    transaction_id = models.CharField(max_length=200, blank=True, verbose_name=_("Transaction ID"))
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, verbose_name=_("Status")
    )
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Paid At"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")

    def __str__(self):
        return f"{self.amount} - {self.design_request.project_number}"
