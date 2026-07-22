from django.db import models
from django.utils.translation import gettext_lazy as _


class Inquiry(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        APPROVED = "approved", _("Approved")
        DECLINED = "declined", _("Declined")

    first_name = models.CharField(_("First Name"), max_length=100)
    last_name = models.CharField(_("Last Name"), max_length=100)
    email = models.EmailField(_("Email"), max_length=254)
    phone = models.CharField(_("Phone Number"), max_length=20)
    spaces = models.JSONField(_("Spaces"), default=list, blank=True)
    total = models.DecimalField(_("Total"), max_digits=12, decimal_places=2, default=0)
    status = models.CharField(_("Status"), max_length=20, choices=Status.choices, default=Status.PENDING)
    is_read = models.BooleanField(_("Is Read"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Inquiry")
        verbose_name_plural = _("Inquiries")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"
