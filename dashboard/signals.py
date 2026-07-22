from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

from django.contrib.auth import get_user_model

from .models import DesignRequest, DesignMessage, DesignDeliverable, DesignPayment, DesignActivityLog
from .utils import notify_user
from .email_service import (
    send_project_submitted_email,
    send_status_update_email,
)


@receiver(post_save, sender=DesignRequest)
def handle_design_request_created(sender, instance, created, **kwargs):
    if created:
        DesignActivityLog.objects.create(
            design_request=instance,
            actor=instance.client if instance.client else None,
            action=_("Project Created"),
            description=_("Design request submitted"),
        )
        if instance.client:
            notify_user(
                instance.client,
                _("Project Submitted"),
                _("Your design request has been submitted successfully."),
                "success",
                link=f"/dashboard/my-projects/{instance.uuid}/",
            )
        User = get_user_model()
        for admin in User.objects.filter(is_superuser=True):
            notify_user(
                admin,
                _("New Design Request"),
                _("New project submitted: %(project)s") % {"project": instance.project_name},
                "info",
                link="/dashboard/crm/",
            )
        send_project_submitted_email(instance)
        return

    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if old.status != instance.status:
        send_status_update_email(instance)


@receiver(post_save, sender=DesignMessage)
def handle_new_message(sender, instance, created, **kwargs):
    if created:
        DesignActivityLog.objects.create(
            design_request=instance.design_request,
            actor=instance.sender,
            action=_("Message Sent"),
            description=_("New message in project chat"),
        )


@receiver(post_save, sender=DesignDeliverable)
def handle_deliverable_uploaded(sender, instance, created, **kwargs):
    if created:
        DesignActivityLog.objects.create(
            design_request=instance.design_request,
            actor=instance.uploaded_by,
            action=_("Deliverable Uploaded"),
            description=f"{instance.title} v{instance.version}",
        )
        notify_user(
            instance.design_request.client,
            _("New Deliverable"),
            _(f"New deliverable available: {instance.title}"),
            "success",
            link=f"/dashboard/my-projects/{instance.design_request.uuid}/",
        )


@receiver(post_save, sender=DesignPayment)
def handle_payment_received(sender, instance, created, **kwargs):
    if created and instance.status == DesignPayment.PaymentStatus.COMPLETED:
        DesignActivityLog.objects.create(
            design_request=instance.design_request,
            actor=instance.design_request.client,
            action=_("Payment Received"),
            description=f"{instance.amount} DA via {instance.get_payment_method_display()}",
        )
