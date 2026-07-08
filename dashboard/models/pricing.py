from django.db import models
from django.utils.translation import gettext_lazy as _


class PricingConfig(models.Model):
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=19.00, verbose_name=_("Tax Rate (%)"))
    default_revision_count = models.PositiveIntegerField(default=2, verbose_name=_("Default Revision Count"))
    currency_symbol = models.CharField(max_length=10, default="DA", verbose_name=_("Currency Symbol"))
    default_delivery_days = models.PositiveIntegerField(default=30, verbose_name=_("Default Delivery Days"))

    class Meta:
        verbose_name = _("Pricing Configuration")
        verbose_name_plural = _("Pricing Configuration")

    def __str__(self):
        return _("Pricing Configuration")

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
