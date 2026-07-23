from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from django.db.models import Count
from django.utils import timezone
import json

from dashboard.models.requests import DesignRequest
from dashboard.models.inquiry import Inquiry


@login_required
def dash_home(request):
    today = timezone.now().date()

    total_projects = DesignRequest.objects.count()
    pending_projects = DesignRequest.objects.filter(status=DesignRequest.Status.PENDING).count()
    approved_projects = DesignRequest.objects.filter(status=DesignRequest.Status.APPROVED).count()
    declined_projects = DesignRequest.objects.filter(status=DesignRequest.Status.DECLINED).count()
    total_inquiries = Inquiry.objects.count()
    projects_today = DesignRequest.objects.filter(created_at__date=today).count()

    recent_projects = DesignRequest.objects.select_related("project_type", "package").order_by("-created_at")[:5]

    status_labels = json.dumps([
        str(_("Pending")),
        str(_("Approved")),
        str(_("Declined")),
    ])
    status_values = json.dumps([pending_projects, approved_projects, declined_projects])
    status_colors = json.dumps(["#f59e0b", "#10b981", "#ef4444"])

    context = {
        "total_projects": total_projects,
        "pending_projects": pending_projects,
        "approved_projects": approved_projects,
        "declined_projects": declined_projects,
        "total_inquiries": total_inquiries,
        "projects_today": projects_today,
        "recent_projects": recent_projects,
        "status_labels": status_labels,
        "status_values": status_values,
        "status_colors": status_colors,
    }

    return render(request, "dash/dash_home.html", context)
