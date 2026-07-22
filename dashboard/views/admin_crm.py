from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.urls import reverse
from django.core.paginator import Paginator
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.db import models
from django.core.mail import send_mail
from django.conf import settings

from ..decorator import admin_required
from ..models import DesignRequest, Inquiry
from ..utils import notify_user
from ..email_service import send_status_update_email


@admin_required
def kanban_view(request):
    qs = DesignRequest.objects.select_related("client", "project_type", "designer", "package")

    status_filter = request.GET.get("status", "")
    if status_filter in dict(DesignRequest.Status.choices):
        qs = qs.filter(status=status_filter)

    search_query = request.GET.get("q", "").strip()
    if search_query:
        qs = qs.filter(
            models.Q(first_name__icontains=search_query)
            | models.Q(last_name__icontains=search_query)
            | models.Q(email__icontains=search_query)
            | models.Q(project_name__icontains=search_query)
            | models.Q(pk__icontains=search_query)
        )

    projects = qs.order_by("-created_at")

    paginator = Paginator(projects, 12)
    page_number = request.GET.get("page", 1)
    try:
        page_obj = paginator.page(page_number)
    except Exception:
        page_obj = paginator.page(1)

    return render(request, "dashboard/admin/kanban.html", {
        "page_obj": page_obj,
        "projects": page_obj,
        "status_choices": DesignRequest.Status.choices,
        "active_status": status_filter,
        "active_search": search_query,
    })


@admin_required
def update_status(request, pk):
    if request.method == "POST":
        project = get_object_or_404(DesignRequest, pk=pk)
        new_status = request.POST.get("status")
        if new_status in dict(DesignRequest.Status.choices):
            old_status = project.status
            project.status = new_status
            project.save(update_fields=["status"])

            if new_status != old_status:
                send_status_update_email(project)

            status_label = dict(DesignRequest.Status.choices).get(new_status, new_status)
            return JsonResponse({"success": True, "message": _("Status updated to %(status)s.") % {"status": status_label}})
        return JsonResponse({"success": False, "errors": [_("Invalid status.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def project_detail(request, pk):
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "designer", "package"),
        pk=pk,
    )
    floors = project.floors.prefetch_related("spaces__space").all()
    spaces = project.spaces.select_related("space", "floor").all()
    options = project.options.select_related("option").all()
    inspirations = project.spaces.prefetch_related("inspirations__inspiration_image").all()
    files = project.files.all()
    notes = project.notes.select_related("author").order_by("-created_at")
    activity = project.activity_logs.select_related("actor").order_by("-created_at")

    return render(request, "dashboard/admin/project_detail.html", {
        "project": project,
        "floors": floors,
        "spaces": spaces,
        "options": options,
        "inspirations": inspirations,
        "notes": notes,
        "files": files,
        "activity": activity,
        "status_choices": DesignRequest.Status.choices,
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
            if project.client:
                notify_user(
                    project.client,
                    _("Designer Assigned"),
                    _(f"Designer {designer.get_full_name()} has been assigned to your project"),
                    "info",
                )
            return JsonResponse({"success": True, "message": _("Designer assigned.")})
        return JsonResponse({"success": False, "errors": [_("Designer not specified.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def inquiry_list(request):
    qs = Inquiry.objects.all()

    status_filter = request.GET.get("status", "")
    if status_filter in dict(Inquiry.Status.choices):
        qs = qs.filter(status=status_filter)

    search_query = request.GET.get("q", "").strip()
    if search_query:
        qs = qs.filter(
            models.Q(first_name__icontains=search_query)
            | models.Q(last_name__icontains=search_query)
            | models.Q(email__icontains=search_query)
            | models.Q(phone__icontains=search_query)
        )

    paginator = Paginator(qs, 12)
    page_number = request.GET.get("page", 1)
    try:
        page_obj = paginator.page(page_number)
    except Exception:
        page_obj = paginator.page(1)

    return render(request, "dashboard/admin/inquiry_list.html", {
        "page_obj": page_obj,
        "inquiries": page_obj,
        "status_choices": Inquiry.Status.choices,
        "active_status": status_filter,
        "active_search": search_query,
    })


@admin_required
def inquiry_detail(request, pk):
    inquiry = get_object_or_404(Inquiry, pk=pk)

    if not inquiry.is_read:
        inquiry.is_read = True
        inquiry.save(update_fields=["is_read"])

    if request.method == "POST":
        new_status = request.POST.get("status")
        if new_status in dict(Inquiry.Status.choices):
            old_status = inquiry.status
            inquiry.status = new_status
            inquiry.save(update_fields=["status"])

            try:
                space_names = ", ".join(s.get("name", "") for s in inquiry.spaces or [])
                subject = _("Inquiry Status Update - %(name)s") % {"name": inquiry.first_name + " " + inquiry.last_name}
                message = _(
                    "Dear %(name)s,\n\n"
                    "Your design inquiry status has been updated from %(old)s to %(new)s.\n\n"
                    "Selected Spaces: %(spaces)s\n"
                    "Total Estimate: %(total)s DZD\n\n"
                    "Thank you for choosing Loft Design."
                ) % {
                    "name": inquiry.first_name,
                    "old": dict(Inquiry.Status.choices).get(old_status, old_status),
                    "new": dict(Inquiry.Status.choices).get(new_status, new_status),
                    "spaces": space_names,
                    "total": inquiry.total,
                }
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL or "noreply@loftdesign.com",
                    [inquiry.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            return JsonResponse({"success": True, "message": _("Status updated.")})
        return JsonResponse({"success": False, "errors": [_("Invalid status.")]})

    return render(request, "dashboard/admin/inquiry_detail.html", {
        "inquiry": inquiry,
        "status_choices": Inquiry.Status.choices,
    })
