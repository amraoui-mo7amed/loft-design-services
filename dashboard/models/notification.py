from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

userModel = get_user_model()


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        INFO = "info", _("Info")
        SUCCESS = "success", _("Success")
        WARNING = "warning", _("Warning")
        ERROR = "error", _("Error")

    user = models.ForeignKey(
        userModel, on_delete=models.CASCADE, related_name="notifications", verbose_name=_("User")
    )
    title = models.CharField(max_length=255, verbose_name=_("Title"))
    message = models.TextField(verbose_name=_("Message"))
    notification_type = models.CharField(
        max_length=20, choices=NotificationType.choices, default=NotificationType.INFO, verbose_name=_("Notification Type")
    )
    is_read = models.BooleanField(default=False, verbose_name=_("Is Read"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    read_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Read At"))
    link = models.CharField(max_length=500, blank=True, verbose_name=_("Link"), help_text=_("Optional navigation link"))

    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
