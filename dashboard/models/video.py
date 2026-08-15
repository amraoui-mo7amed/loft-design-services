from django.db import models
from django.core.validators import URLValidator, ValidationError
from django.utils.translation import gettext_lazy as _
import re


class Video(models.Model):
    title = models.CharField(_("Title"), max_length=255)
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
        super().save(*args, **kwargs)

    @property
    def play_link(self):
        """The URL used to open the video player."""
        return self.link or self.url or ""

    @property
    def thumbnail_url(self):
        """A poster image for the slider card (YouTube only)."""
        match = re.search(r"(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})", self.play_link)
        if match:
            return f"https://img.youtube.com/vi/{match.group(1)}/hqdefault.jpg"
        return ""