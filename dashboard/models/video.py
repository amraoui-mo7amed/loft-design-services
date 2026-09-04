from django.db import models
from django.core.validators import URLValidator, ValidationError
from django.utils.translation import gettext_lazy as _
import re


class Video(models.Model):
    class Placement(models.TextChoices):
        SERVICE_INFO = "service_info", _("Service Info (.serviceInfo)")
        INFO_CARD = "info_card", _("About Info (.infoCard)")
        VIDEOS = "videos", _("Videos Section (#videos)")

    class Role(models.TextChoices):
        # Service info cards (.serviceInfo)
        SERVICE_DESIGN = "service_design", _("Design (Usage & optimisation)")
        SERVICE_360 = "service_360", _("360° (Visite immersive)")
        SERVICE_VR = "service_vr", _("VR (Immersion à l’échelle)")
        SERVICE_BILNOV = "service_bilnov", _("Bilnov (Projet collaboratif)")
        SERVICE_STORE = "service_store", _("Store Bilnov (Produits · 3D · AR · budget)")

        # About info cards (.infoCard)
        INFO_USAGE = "info_usage", _("Usage réel")
        INFO_OPTIMIZATION = "info_optimization", _("Optimisation")
        INFO_SMART_LIVING = "info_smart_living", _("Smart living")
        INFO_IMMERSION = "info_immersion", _("Immersion")

        # Videos section (#videos)
        VIDEOS_RAIL = "videos_rail", _("Videos Rail Item")

    title = models.CharField(_("Title"), max_length=255)
    placement = models.CharField(
        _("Placement"),
        max_length=50,
        choices=Placement.choices,
        default=Placement.VIDEOS,
        help_text=_("Choose where to put the video on the homepage."),
    )
    role = models.CharField(
        _("Role / Target Card"),
        max_length=50,
        choices=Role.choices,
        default=Role.VIDEOS_RAIL,
        help_text=_("Specify the exact card role for this video."),
    )
    link = models.URLField(_("Video Link"), blank=True, help_text=_("Playable video URL (YouTube / Vimeo / MP4)."))
    url = models.URLField(_("External URL"), blank=True, help_text=_("Optional destination link (e.g. portfolio project)."))
    description = models.TextField(_("Description"), blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Video")
        verbose_name_plural = _("Videos")
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def validate_links(self):
        validator = URLValidator()
        for field_name in ["link", "url"]:
            value = getattr(self, field_name)
            if value:
                try:
                    validator(value)
                except ValidationError:
                    raise ValidationError(
                        _("%(field)s must be a valid URL.") % {"field": self._meta.get_field(field_name).verbose_name}
                    )

    def save(self, *args, **kwargs):
        self.validate_links()
        if self.placement == self.Placement.SERVICE_INFO and not self.role.startswith("service_"):
            self.role = self.Role.SERVICE_DESIGN
        elif self.placement == self.Placement.INFO_CARD and not self.role.startswith("info_"):
            self.role = self.Role.INFO_USAGE
        elif self.placement == self.Placement.VIDEOS and (self.role.startswith("service_") or self.role.startswith("info_")):
            self.role = self.Role.VIDEOS_RAIL
        super().save(*args, **kwargs)

    @property
    def play_link(self):
        """The URL used to open the video player."""
        return self.link or self.url or ""

    @property
    def youtube_id(self):
        """YouTube 11-char ID if play_link is a YouTube video."""
        match = re.search(r"(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})", self.play_link)
        if match:
            return match.group(1)
        return ""

    @property
    def thumbnail_url(self):
        """A poster image for the slider card (YouTube only)."""
        yt_id = self.youtube_id
        if yt_id:
            return f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg"
        return ""