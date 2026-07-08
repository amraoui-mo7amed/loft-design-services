from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .requests import DesignRequest

userModel = get_user_model()


class DesignMessage(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="messages", verbose_name=_("Design Request")
    )
    sender = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="design_messages", verbose_name=_("Sender")
    )
    message = models.TextField(verbose_name=_("Message"))
    attachment = models.FileField(upload_to="design-requests/messages/", null=True, blank=True, verbose_name=_("Attachment"))
    is_read = models.BooleanField(default=False, verbose_name=_("Is Read"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Message")
        verbose_name_plural = _("Messages")
        ordering = ["created_at"]

    def __str__(self):
        return f"Message by {self.sender} on {self.design_request.project_number}"


class DesignRevision(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="revisions", verbose_name=_("Design Request")
    )
    revision_number = models.PositiveIntegerField(verbose_name=_("Revision Number"))
    requested_by = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="requested_revisions", verbose_name=_("Requested By")
    )
    reason = models.TextField(verbose_name=_("Reason"))
    status = models.CharField(
        max_length=20,
        choices=[("pending", _("Pending")), ("in_progress", _("In Progress")), ("completed", _("Completed"))],
        default="pending",
        verbose_name=_("Status"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Revision")
        verbose_name_plural = _("Revisions")
        ordering = ["design_request", "-revision_number"]

    def __str__(self):
        return f"Revision #{self.revision_number} - {self.design_request.project_number}"


class DesignDeliverable(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="deliverables", verbose_name=_("Design Request")
    )
    title = models.CharField(max_length=200, verbose_name=_("Title"))
    file = models.FileField(upload_to="design-requests/deliverables/", verbose_name=_("File"))
    file_type = models.CharField(max_length=50, blank=True, verbose_name=_("File Type"))
    version = models.PositiveIntegerField(default=1, verbose_name=_("Version"))
    uploaded_by = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="uploaded_deliverables", verbose_name=_("Uploaded By")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Approved At"))

    class Meta:
        verbose_name = _("Deliverable")
        verbose_name_plural = _("Deliverables")
        ordering = ["design_request", "-version"]

    def __str__(self):
        return f"{self.title} v{self.version} - {self.design_request.project_number}"


class DesignNote(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="notes", verbose_name=_("Design Request")
    )
    author = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="design_notes", verbose_name=_("Author")
    )
    note = models.TextField(verbose_name=_("Note"))
    is_internal = models.BooleanField(default=True, verbose_name=_("Is Internal"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Note")
        verbose_name_plural = _("Notes")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note by {self.author} on {self.design_request.project_number}"


class DesignActivityLog(models.Model):
    design_request = models.ForeignKey(
        DesignRequest, on_delete=models.CASCADE, related_name="activity_logs", verbose_name=_("Design Request")
    )
    actor = models.ForeignKey(
        userModel, on_delete=models.SET_NULL, null=True, related_name="design_activities", verbose_name=_("Actor")
    )
    action = models.CharField(max_length=100, verbose_name=_("Action"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Activity Log")
        verbose_name_plural = _("Activity Logs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} on {self.design_request.project_number}"
