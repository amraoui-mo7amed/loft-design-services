import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.urls import reverse


class Invitation(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name=_("UUID"))
    email = models.EmailField(verbose_name=_("Email Address"))
    name = models.CharField(max_length=200, blank=True, default="", verbose_name=_("Full Name"))
    phone_number = models.CharField(max_length=50, blank=True, default="", verbose_name=_("Phone Number"))
    is_accepted = models.BooleanField(default=False, verbose_name=_("Is Accepted"))
    accepted_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Accepted At"))
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_invitations",
        verbose_name=_("Created By")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Invitation")
        verbose_name_plural = _("Invitations")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invitation for {self.email} ({self.uuid})"

    def get_signup_url(self, request=None):
        path = reverse("user_auth:invitation_signup", kwargs={"uuid": self.uuid})
        if request:
            return request.build_absolute_uri(path)
        return path
