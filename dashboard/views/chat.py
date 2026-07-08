from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _
from django_eventstream import send_event

from ..models import DesignRequest, DesignMessage, DesignActivityLog
from ..utils import notify_user


@login_required
@require_POST
def send_message(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid)
    can_access = (
        request.user == project.client
        or request.user == project.designer
        or request.user.is_superuser
    )
    if not can_access:
        return JsonResponse({"success": False, "errors": [_("Access denied.")]})

    message_text = request.POST.get("message", "").strip()
    attachment = request.FILES.get("attachment")

    if not message_text and not attachment:
        return JsonResponse({"success": False, "errors": [_("Message is empty.")]})

    msg = DesignMessage.objects.create(
        design_request=project,
        sender=request.user,
        message=message_text,
        attachment=attachment,
    )

    channel = f"design-request-{project.uuid}"
    event_data = {
        "id": msg.id,
        "sender": request.user.get_full_name() or request.user.username,
        "message": msg.message,
        "attachment_url": msg.attachment.url if msg.attachment else "",
        "created_at": msg.created_at.isoformat(),
    }
    send_event(channel, "new_message", event_data)

    DesignActivityLog.objects.create(
        design_request=project,
        actor=request.user,
        action=_("New Message"),
        description=_("Sent a message in the project chat"),
    )

    recipient = project.designer if request.user == project.client else project.client
    if recipient:
        notify_user(recipient, _("New Message"), _(f"New message on {project.project_number}"), "info")

    return JsonResponse({"success": True, "message": _("Message sent.")})


@login_required
def get_messages(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid)
    can_access = (
        request.user == project.client
        or request.user == project.designer
        or request.user.is_superuser
    )
    if not can_access:
        return JsonResponse({"success": False, "errors": [_("Access denied.")]})

    messages = project.messages.select_related("sender").all()
    data = []
    for msg in messages:
        data.append({
            "id": msg.id,
            "sender_id": msg.sender.id if msg.sender else None,
            "sender": msg.sender.get_full_name() or msg.sender.username if msg.sender else _("System"),
            "message": msg.message,
            "attachment_url": msg.attachment.url if msg.attachment else "",
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat(),
            "is_mine": msg.sender == request.user if msg.sender else False,
        })
    return JsonResponse({"data": data})
