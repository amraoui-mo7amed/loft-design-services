from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from django.db import models
from django.db.models import Count, Q
from django.utils import timezone
import json

from dashboard.models.requests import DesignRequest
from dashboard.models.inquiry import Inquiry
from dashboard.models.portfolio import Portfolio


@login_required
def dash_home(request):
    today = timezone.now().date()

    counts = DesignRequest.objects.aggregate(
        total=Count("id"),
        pending=Count("id", filter=models.Q(status=DesignRequest.Status.PENDING)),
        approved=Count("id", filter=models.Q(status=DesignRequest.Status.APPROVED)),
        declined=Count("id", filter=models.Q(status=DesignRequest.Status.DECLINED)),
        today=Count("id", filter=models.Q(created_at__date=today)),
    )
    total_projects = counts["total"] or 0
    pending_projects = counts["pending"] or 0
    approved_projects = counts["approved"] or 0
    declined_projects = counts["declined"] or 0
    projects_today = counts["today"] or 0

    total_inquiries = Inquiry.objects.count()
    total_portfolios = Portfolio.objects.count()

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
        "total_portfolios": total_portfolios,
        "projects_today": projects_today,
        "recent_projects": recent_projects,
        "status_labels": status_labels,
        "status_values": status_values,
        "status_colors": status_colors,
    }

    return render(request, "dash/dash_home.html", context)
