from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.urls import reverse
from django.core.paginator import Paginator
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from ..decorator import admin_required
from ..models import DesignRequest
from ..utils import notify_user
from user_auth.models import UserProfile


STATUS_ORDER = [
    "new", "qualified", "quote_sent", "waiting_payment",
    "design", "revision", "delivered", "completed", "cancelled",
]


@admin_required
def kanban_view(request):
    qs = DesignRequest.objects.select_related("client", "project_type", "designer", "package")

    status_filter = request.GET.get("status", "")
    if status_filter in dict(DesignRequest.Status.choices):
        qs = qs.filter(status=status_filter)

    client_query = request.GET.get("client", "").strip()
    if client_query:
        qs = qs.filter(client__username__icontains=client_query)

    designer_id = request.GET.get("designer", "")
    if designer_id.isdigit():
        qs = qs.filter(designer_id=designer_id)

    projects = qs.order_by("-created_at")

    paginator = Paginator(projects, 12)
    page_number = request.GET.get("page", 1)
    try:
        page_obj = paginator.page(page_number)
    except Exception:
        page_obj = paginator.page(1)

    designer_ids = UserProfile.objects.filter(role=UserProfile.Role.DESIGNER).values_list("user_id", flat=True)
    designers_qs = get_user_model().objects.filter(id__in=designer_ids).values("id", "username")
    designer_choices = [("", _("All Designers"))] + [(d["id"], d["username"]) for d in designers_qs]

    return render(request, "dashboard/admin/kanban.html", {
        "page_obj": page_obj,
        "projects": page_obj,
        "status_choices": DesignRequest.Status.choices,
        "designers": designers_qs,
        "designer_choices": designer_choices,
        "active_status": status_filter,
        "active_client": client_query,
        "active_designer": designer_id,
    })


@admin_required
def update_status(request, pk):
    if request.method == "POST":
        project = get_object_or_404(DesignRequest, pk=pk)
        new_status = request.POST.get("status")
        if new_status in dict(DesignRequest.Status.choices):
            project.status = new_status
            project.save(update_fields=["status"])
            return JsonResponse({"success": True, "message": _("Status updated.")})
        return JsonResponse({"success": False, "errors": [_("Invalid status.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def project_detail(request, pk):
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "designer", "package"),
        pk=pk,
    )
    spaces = project.spaces.select_related("space", "floor").all()
    options = project.options.select_related("option").all()
    files = project.files.all()
    notes = project.notes.select_related("author").order_by("-created_at")

    return render(request, "dashboard/admin/project_detail.html", {
        "project": project,
        "spaces": spaces,
        "options": options,
        "notes": notes,
        "files": files,
    })


@admin_required
def delete_project(request, pk):
    project = get_object_or_404(DesignRequest, pk=pk)
    if request.method == "POST":
        name = project.project_name
        project.delete()
        return JsonResponse({
            "success": True,
            "message": _("Project %(name)s deleted.") % {"name": name},
            "redirect_url": reverse("dash:admin_crm"),
        })
    return redirect("dash:admin_crm")


@admin_required
def assign_designer(request, pk):
    if request.method == "POST":
        project = get_object_or_404(DesignRequest, pk=pk)
        User = get_user_model()
        designer_id = request.POST.get("designer_id")
        if designer_id:
            designer = get_object_or_404(User, id=designer_id)
            project.designer = designer
            project.save(update_fields=["designer"])
            notify_user(
                designer,
                _("New Assignment"),
                _(f"You have been assigned to project {project.project_number}"),
                "success",
            )
            notify_user(
                project.client,
                _("Designer Assigned"),
                _(f"Designer {designer.get_full_name()} has been assigned to your project"),
                "info",
            )
            return JsonResponse({"success": True, "message": _("Designer assigned.")})
        return JsonResponse({"success": False, "errors": [_("Designer not specified.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})
