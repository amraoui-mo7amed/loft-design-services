from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from ..decorator import customer_required
from ..models import DesignRequest, DesignDeliverable, DesignMessage, DesignActivityLog


@login_required
def my_projects(request):
    projects = DesignRequest.objects.filter(client=request.user).select_related("project_type", "package", "designer")
    return render(request, "dashboard/customer/project_list.html", {"projects": projects})


@login_required
def project_detail(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid, client=request.user)
    deliverables = project.deliverables.all()
    messages = project.messages.all().select_related("sender")
    activity = project.activity_logs.all().select_related("actor")
    return render(request, "dashboard/customer/project_detail.html", {
        "project": project,
        "deliverables": deliverables,
        "messages": messages,
        "activity": activity,
    })


@login_required
def download_deliverable(request, pk):
    deliv = get_object_or_404(DesignDeliverable, pk=pk, design_request__client=request.user)
    return JsonResponse({"download_url": deliv.file.url if deliv.file else ""})


@login_required
def approve_deliverable(request, pk):
    if request.method == "POST":
        deliv = get_object_or_404(DesignDeliverable, pk=pk, design_request__client=request.user)
        from django.utils import timezone
        deliv.approved_at = timezone.now()
        deliv.save(update_fields=["approved_at"])
        return JsonResponse({"success": True, "message": "Deliverable approved."})
    return JsonResponse({"success": False, "errors": ["Invalid request."]})
