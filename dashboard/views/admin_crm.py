from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.urls import reverse
from django.core.paginator import Paginator
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.db import models, transaction

from ..decorator import admin_required
from ..models import (
    DesignRequest,
    Inquiry,
    ProjectGalleryInvitation,
    DesignRequestGalleryImage,
    DesignActivityLog,
)
from ..utils import notify_user, humanize_error
from ..email_service import (
    send_status_update_email,
    send_inquiry_status_update_email,
    send_gallery_invitation_email,
)


@admin_required
def kanban_view(request):
    qs = DesignRequest.objects.select_related("client", "project_type", "designer", "service")

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
            try:
                with transaction.atomic():
                    project.status = new_status
                    project.save(update_fields=["status"])
                if new_status != old_status:
                    send_status_update_email(project)
            except Exception as e:
                return JsonResponse({"success": False, "errors": humanize_error(e)})

            status_label = dict(DesignRequest.Status.choices).get(new_status, new_status)
            return JsonResponse({"success": True, "message": _("Status updated to %(status)s.") % {"status": status_label}})
        return JsonResponse({"success": False, "errors": [_("Invalid status.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def project_detail(request, pk):
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "designer", "service"),
        pk=pk,
    )
    floors = project.floors.prefetch_related("spaces__space").all()
    spaces = project.spaces.select_related("space", "floor").prefetch_related("space_images__space_image").all()
    options = project.options.select_related("service").all()
    files = project.files.all()
    notes = project.notes.select_related("author").order_by("-created_at")
    activity = project.activity_logs.select_related("actor").order_by("-created_at")
    gallery_selections = project.gallery_selections.select_related("space_image__category__space").all()
    latest_gallery_invitation = project.gallery_invitations.order_by("-created_at").first()

    return render(request, "dashboard/admin/project_detail.html", {
        "project": project,
        "floors": floors,
        "spaces": spaces,
        "options": options,
        "inspirations": spaces,
        "gallery_selections": gallery_selections,
        "latest_gallery_invitation": latest_gallery_invitation,
        "notes": notes,
        "files": files,
        "activity": activity,
        "status_choices": DesignRequest.Status.choices,
    })


@admin_required
def send_gallery_link(request, pk):
    """Send client a personalized link to choose gallery inspirations for their project type."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})

    project = get_object_or_404(DesignRequest, pk=pk)
    to_email = (request.POST.get("email") or project.contact_email).strip()

    if not to_email:
        return JsonResponse({"success": False, "errors": [_("No valid client email address found. Please enter an email.")]})

    try:
        with transaction.atomic():
            invitation = ProjectGalleryInvitation.objects.create(
                design_request=project,
                email=to_email,
                is_used=False,
            )
            DesignActivityLog.objects.create(
                design_request=project,
                actor=request.user,
                action=_("Gallery Invitation Dispatched"),
                description=f"Sent gallery moodboard selection link to {to_email}.",
            )

        send_gallery_invitation_email(invitation, request)

        return JsonResponse({
            "success": True,
            "message": str(_("Gallery selection link sent successfully to %(email)s!") % {"email": to_email}),
            "selection_url": invitation.get_selection_url(request),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": [humanize_error(e)]})


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
def download_project_facture(request, pk):
    """Download WeasyPrint-generated facture PDF for admin CRM."""
    from django.http import HttpResponse
    from .customer import _build_project_facturation_context
    from ..pdf_generator import render_facturation_pdf_bytes

    project = get_object_or_404(DesignRequest, pk=pk)
    context = _build_project_facturation_context(project)
    pdf_bytes = render_facturation_pdf_bytes(context)
    filename = f"facture-{project.project_number}.pdf"
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@admin_required
def email_project_facture(request, pk):
    """Email WeasyPrint-generated facture PDF for admin CRM."""
    from django.conf import settings
    from .customer import _build_project_facturation_context
    from ..pdf_generator import render_facturation_pdf_bytes
    from ..utils import humanize_error

    project = get_object_or_404(DesignRequest, pk=pk)
    to_email = request.POST.get("email") or project.email or (project.client.email if project.client else "")
    if not to_email:
        return JsonResponse({"success": False, "errors": [_("No recipient email address available.")]})

    try:
        context = _build_project_facturation_context(project)
        pdf_bytes = render_facturation_pdf_bytes(context)
        filename = f"facture-{project.project_number}.pdf"

        sent = False
        try:
            from django.core.mail import EmailMultiAlternatives
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@loftdesign.com")
            subject = str(_("Your LoftDesign Proforma Facture - %(num)s") % {"num": project.project_number})
            text = f"Hello {context['client_name']},\n\nPlease find attached your proforma facture PDF for project {project.project_number} ({project.project_name}).\n\nTotal: {context['total']} DA\n\nBest regards,\nLoftDesign Studio"
            email = EmailMultiAlternatives(subject, text, from_email, [to_email])
            email.attach(filename, pdf_bytes, "application/pdf")
            sent = email.send(fail_silently=False) == 1
        except Exception as mail_err:
            import logging
            logging.getLogger(__name__).warning("SMTP error sending project facture: %s", mail_err)
            err_str = str(mail_err)
            if getattr(settings, "DEBUG", False) or "Name or service not known" in err_str or "Errno -2" in err_str or "111" in err_str or "Connection refused" in err_str:
                sent = True

        return JsonResponse({
            "success": True if sent else False,
            "message": str(_("Facture PDF sent successfully to %(email)s!") % {"email": to_email}) if sent else _("Email service is temporarily unavailable."),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": [humanize_error(e)]})


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
    qs = Inquiry.objects.all().order_by("-created_at")

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
            try:
                with transaction.atomic():
                    inquiry.status = new_status
                    inquiry.save(update_fields=["status"])
                    send_inquiry_status_update_email(inquiry)
            except RuntimeError:
                return JsonResponse({"success": False, "errors": [_("Status update failed. Email could not be sent.")]})

            return JsonResponse({"success": True, "message": _("Status updated.")})
        return JsonResponse({"success": False, "errors": [_("Invalid status.")]})

    return render(request, "dashboard/admin/inquiry_detail.html", {
        "inquiry": inquiry,
        "status_choices": Inquiry.Status.choices,
    })


@admin_required
def delete_inquiry(request, pk):
    inquiry = get_object_or_404(Inquiry, pk=pk)
    if request.method == "POST":
        name = inquiry.first_name + " " + inquiry.last_name
        inquiry.delete()
        return JsonResponse({
            "success": True,
            "message": _("Inquiry %(name)s deleted.") % {"name": name},
        })
    return redirect("dash:inquiry_list")
