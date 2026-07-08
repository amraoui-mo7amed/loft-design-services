import json
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.utils.translation import gettext_lazy as _
from django_eventstream import send_event

from ..decorator import admin_required
from ..models import Notification


@login_required
def notifications_stream(request):
    return {"channels": [f"user-{request.user.id}"]}


@login_required
def get_unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return JsonResponse({"success": True, "count": count})


@login_required
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user)[:50]
    data = []
    for notification in notifications:
        data.append({
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
            "link": notification.link,
        })
    return JsonResponse({"success": True, "notifications": data})


@login_required
def mark_as_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now()
        notification.save()
    return JsonResponse({"success": True, "message": _("Notification updated.")})


@login_required
def mark_all_as_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(
        is_read=True, read_at=datetime.now()
    )
    return JsonResponse({"success": True, "message": _("All notifications updated.")})


@login_required
def delete_notification(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.delete()
    return JsonResponse({"success": True, "message": _("Notification deleted.")})
