from django.db import models
from django.core.validators import validate_email, ValidationError
from django.utils.translation import gettext_lazy as _


class Lead(models.Model):
    name = models.CharField(_("Name"), max_length=200)
    email = models.EmailField(_("Email"), max_length=254)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Lead")
        verbose_name_plural = _("Leads")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.email}"

    def save(self, *args, **kwargs):
        if self.email:
            try:
                validate_email(self.email)
            except ValidationError:
                raise ValidationError(_("Please provide a valid email address."))
        super().save(*args, **kwargs)