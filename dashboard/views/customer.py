import json
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.utils.translation import gettext as _

from ..decorator import customer_required
from ..models import DesignRequest, DesignDeliverable, DesignMessage, DesignActivityLog
from ..utils import humanize_error


def _build_project_facturation_context(project):
    first_name = project.first_name or (project.client.first_name if project.client else "")
    last_name = project.last_name or (project.client.last_name if project.client else "")
    email = project.email or (project.client.email if project.client else "")
    phone = project.phone or (getattr(getattr(project.client, "profile", None), "phone", "") if project.client else "")

    floors = project.floors.all().order_by("level", "order")
    items = []
    total_surface = 0.0
    for f in floors:
        surf = float(f.surface or 0)
        total_surface += surf
        items.append({
            "description": f"{f.name}",
            "amount": f"{surf:g} m²",
        })

    services_list = []
    options = project.options.select_related("service").all()
    if options.exists():
        for opt in options:
            s_obj = opt.service
            calc_val = float(opt.price_at_time or 0)
            if s_obj and s_obj.pricing_type == "area" and total_surface > 0:
                rate_str = f"{float(s_obj.service_price):,.0f} DA / m²"
            elif s_obj and s_obj.pricing_type == "hourly":
                rate_str = f"{float(s_obj.service_price):,.0f} DA / hr"
            elif s_obj:
                rate_str = f"{float(s_obj.service_price):,.0f} DA"
            else:
                rate_str = f"{calc_val:,.0f} DA"

            services_list.append({
                "name": s_obj.service_name if s_obj else (opt.option.name if opt.option else _("Design Service")),
                "rate": rate_str,
                "amount": f"{calc_val:,.0f} DA",
            })
    elif project.service:
        s_obj = project.service
        calc_val = float(project.total or s_obj.service_price)
        rate_str = f"{float(s_obj.service_price):,.0f} DA"
        if s_obj.pricing_type == "area":
            rate_str = f"{float(s_obj.service_price):,.0f} DA / m²"
        services_list.append({
            "name": s_obj.service_name,
            "rate": rate_str,
            "amount": f"{calc_val:,.0f} DA",
        })

    try:
        date_str = project.created_at.strftime("%d/%m/%Y")
    except Exception:
        date_str = ""

    return {
        "studio_name": getattr(settings, "SITE_NAME", "LoftDesign"),
        "tagline": _("Haute Interior Architecture & Design Studio"),
        "doc_number": f"LOFT-FAC-{project.pk:04d}",
        "date": date_str,
        "client_name": f"{first_name} {last_name}".strip() or _("Client"),
        "email": email,
        "phone": phone,
        "project_name": project.project_name,
        "project_type": project.project_type.name if project.project_type else _("Architectural Design"),
        "total_surface": total_surface,
        "items": items,
        "services_list": services_list,
        "total": f"{float(project.total):,.0f}",
        "thank_you_message": _("Merci d'avoir choisi LOFT DESIGN !"),
    }


@login_required
def my_projects(request):
    projects = (
        DesignRequest.objects.filter(client=request.user)
        .select_related("project_type", "service", "designer")
        .prefetch_related("floors", "options")
        .order_by("-created_at")
    )
    paginator = Paginator(projects, 12)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "dashboard/customer/project_list.html", {
        "projects": page_obj,
        "page_obj": page_obj,
    })


@login_required
def project_detail(request, uuid):
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "designer", "service")
        .prefetch_related("floors", "options__service", "spaces", "files"),
        uuid=uuid,
        client=request.user,
    )
    deliverables = project.deliverables.all()
    messages = project.messages.all().select_related("sender")
    activity = project.activity_logs.all().select_related("actor")
    floors = project.floors.all().order_by("level", "order")
    options = project.options.select_related("service").all()

    total_surface = sum(float(f.surface or 0) for f in floors)

    return render(request, "dashboard/customer/project_detail.html", {
        "project": project,
        "floors": floors,
        "options": options,
        "total_surface": total_surface,
        "deliverables": deliverables,
        "messages": messages,
        "activity": activity,
    })


@login_required
def download_project_facture(request, uuid):
    """Download WeasyPrint-generated facture PDF for this project."""
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "service")
        .prefetch_related("floors", "options__service"),
        uuid=uuid,
        client=request.user,
    )
    from ..pdf_generator import render_facturation_pdf_bytes
    context = _build_project_facturation_context(project)
    pdf_bytes = render_facturation_pdf_bytes(context)
    filename = f"facture-{project.project_number}.pdf"
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@login_required
def email_project_facture(request, uuid):
    """Generate WeasyPrint facture PDF and email it to the user."""
    project = get_object_or_404(
        DesignRequest.objects.select_related("client", "project_type", "service")
        .prefetch_related("floors", "options__service"),
        uuid=uuid,
        client=request.user,
    )
    to_email = request.POST.get("email") or project.email or (project.client.email if project.client else "")
    if not to_email:
        return JsonResponse({"success": False, "errors": [_("No recipient email address available.")]})

    try:
        from ..pdf_generator import render_facturation_pdf_bytes
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
        return JsonResponse({"success": True, "message": _("Deliverable approved.")})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})
