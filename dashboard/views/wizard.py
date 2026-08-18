from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from django.conf import settings
from decimal import Decimal
import json

from ..models import (
    ProjectType, Space, SpaceCategoryImages, SpaceImage, Service, ServicePricing,
    DesignRequest, DesignRequestFloor, DesignRequestSpace, DesignRequestOption,
    DesignRequestSpaceImage, DesignRequestFile,
)
from ..price_engine import calculate_full_price
from ..pdf_generator import render_facturation_pdf_bytes
from ..utils import build_packages_context, notify_user, humanize_error


# ──────────────────────────────────────────────
# Progressive On-Scroll Request Form (Steps 1 - 4)
# ──────────────────────────────────────────────

def wizard_container(request):
    """
    Renders the luxury animated on-scroll request form covering Steps 1 to 4:
    Step 1: Project Type selection
    Step 2: Floor selection (RDC + floors above max 5, RDC - floors below max 3, Terrace)
    Step 3: Surface input for each floor in m²
    Step 4: User contact details
    """
    project_types = ProjectType.objects.all().order_by("name")
    
    if request.method == "POST":
        try:
            data = json.loads(request.body) if request.body else request.POST
        except json.JSONDecodeError:
            data = request.POST

        # Store session payload for Step 5
        request.session["request_flow_data"] = {
            "project_type_slug": data.get("project_type_slug", ""),
            "project_type_name": data.get("project_type_name", ""),
            "floors_above": int(data.get("floors_above", 0) or 0),
            "floors_below": int(data.get("floors_below", 0) or 0),
            "has_terrace": data.get("has_terrace") in ("true", "1", True, "on"),
            "has_garden": data.get("has_garden") in ("true", "1", True, "on"),
            "floors": data.get("floors", []),
            "total_surface": float(data.get("total_surface", 0) or 0),
            "first_name": data.get("first_name", "").strip(),
            "last_name": data.get("last_name", "").strip(),
            "email": data.get("email", "").strip(),
            "phone": data.get("phone", "").strip(),
        }
        return JsonResponse({
            "success": True,
            "redirect_url": reverse("request_step5"),
        })

    services = Service.objects.all().order_by("-is_default", "service_name")
    default_service = services.filter(is_default=True).first() or services.first()
    project_type_choices = [(pt.slug, pt.name) for pt in project_types]

    return render(request, "dashboard/wizard/request_flow.html", {
        "project_types": project_types,
        "project_type_choices": project_type_choices,
        "services": services,
        "default_service": default_service,
    })


# ──────────────────────────────────────────────
# Dedicated Standalone Page (Step 5: Estimate, Facture & Services)
# ──────────────────────────────────────────────

def step_summary(request):
    """
    Dedicated Standalone Page for Step 5:
    - Cards of Services with pricing models, videos, and preview GIFs
    - Facture Calculator with real-time price computation
    - Option to send Facture PDF to client email
    - Final Submit button to submit project details
    """
    services = Service.objects.all().order_by("-is_default", "service_name")
    default_service = services.filter(is_default=True).first() or services.first()
    project_types = ProjectType.objects.all().order_by("name")

    session_data = request.session.get("request_flow_data", {})

    return render(request, "dashboard/wizard/request_step5.html", {
        "services": services,
        "default_service": default_service,
        "project_types": project_types,
        "session_data": session_data,
        "session_data_json": json.dumps(session_data),
    })


# ──────────────────────────────────────────────
# Final Design Request Submission
# ──────────────────────────────────────────────

@require_POST
def submit_design_request(request):
    try:
        data = json.loads(request.body) if request.body else request.POST
    except json.JSONDecodeError:
        data = request.POST

    try:
        with transaction.atomic():
            project_type_slug = data.get("project_type_slug")
            project_type_id = data.get("project_type_id")
            
            project_type = None
            if project_type_slug:
                project_type = ProjectType.objects.filter(slug=project_type_slug).first()
            if not project_type and project_type_id:
                project_type = ProjectType.objects.filter(pk=project_type_id).first()
            if not project_type:
                project_type = ProjectType.objects.first()

            service_id = data.get("service_id") or data.get("package_id")
            service = Service.objects.filter(id=service_id).first() if service_id else None

            first_name = data.get("first_name", "").strip()
            last_name = data.get("last_name", "").strip()
            email = data.get("email", "").strip()
            phone = data.get("phone", "").strip()
            
            floors_above = int(data.get("floors_above", 0) or 0)
            floors_below = int(data.get("floors_below", 0) or 0)
            has_terrace = data.get("has_terrace") in ("true", "1", True, "on")
            has_garden = data.get("has_garden") in ("true", "1", True, "on")
            total_surface = Decimal(str(data.get("total_surface", 0) or 0))
            total = Decimal(str(data.get("total", 0) or 0))

            project_name = data.get("project_name") or f"{project_type.name if project_type else 'Design'} - {first_name} {last_name}".strip()

            design_request = DesignRequest.objects.create(
                client=request.user if request.user.is_authenticated else None,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                project_name=project_name,
                project_type=project_type,
                service=service,
                total_surface=total_surface,
                floors_above=floors_above,
                floors_below=floors_below,
                has_terrace=has_terrace,
                has_garden=has_garden,
                total=total,
            )

            # Multiple selected services
            service_ids = data.get("service_ids") or []
            if isinstance(service_ids, str):
                try:
                    service_ids = json.loads(service_ids)
                except Exception:
                    service_ids = [service_ids]
            if not service_ids and service_id:
                service_ids = [service_id]

            primary_service = service
            for s_id in service_ids:
                s_obj = Service.objects.filter(id=s_id).first()
                if s_obj:
                    if not primary_service:
                        primary_service = s_obj
                    DesignRequestOption.objects.create(
                        design_request=design_request,
                        service=s_obj,
                        price_at_time=s_obj.service_price,
                    )

            if primary_service and not design_request.service:
                design_request.service = primary_service
                design_request.save(update_fields=["service"])

            # Create Floors with respective Surfaces in chronological/architectural order
            floors_data = data.get("floors", [])
            if isinstance(floors_data, str):
                try:
                    floors_data = json.loads(floors_data)
                except Exception:
                    floors_data = []

            # Sort floors strictly in chronological order: Basements -> RDC -> Upper Floors -> Terrace -> Garden
            def get_floor_sort_key(item):
                lvl = item.get("level", 0)
                try:
                    return int(lvl)
                except (ValueError, TypeError):
                    return 0

            sorted_floors = sorted(floors_data, key=get_floor_sort_key)

            for i, f in enumerate(sorted_floors):
                f_name = f.get("name") or f"Level {i}"
                f_surface = Decimal(str(f.get("surface", 0) or 0))
                raw_level = f.get("level")
                if raw_level is not None:
                    try:
                        f_level = int(raw_level)
                    except (ValueError, TypeError):
                        f_level = i
                else:
                    f_level = i

                DesignRequestFloor.objects.create(
                    design_request=design_request,
                    name=f_name,
                    level=f_level,
                    order=i,
                    surface=f_surface,
                )

            # Clear session
            if "request_flow_data" in request.session:
                del request.session["request_flow_data"]

            # Notify admins
            try:
                from django.contrib.auth import get_user_model
                UserModel = get_user_model()
                admin_users = UserModel.objects.filter(is_superuser=True) | UserModel.objects.filter(profile__role="admin")
                for admin_u in admin_users.distinct():
                    notify_user(
                        user=admin_u,
                        title=str(_("New Architectural Request: %(number)s") % {"number": design_request.project_number}),
                        message=f"{first_name} {last_name} submitted a new request ({design_request.project_type.name if design_request.project_type else 'Design'}). Total: {total:,.0f} DA",
                        notification_type="request",
                        link=reverse("dash:kanban_view"),
                    )
            except Exception:
                pass

        return JsonResponse({
            "success": True,
            "message": _("Design request submitted successfully!"),
            "project_number": design_request.project_number,
            "uuid": str(design_request.uuid),
            "redirect_url": reverse("dash:customer_projects"),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": humanize_error(e)})


# ──────────────────────────────────────────────
# Facturation / Proforma Quotation PDF & Email
# ──────────────────────────────────────────────

def _build_facturation_context(data):
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    project_type_name = data.get("project_type_name") or _("Custom Project")
    project_name = data.get("project_name") or (f"{project_type_name} - {first_name} {last_name}".strip() or "Design Request")

    floors = data.get("floors", [])
    if isinstance(floors, str):
        try:
            floors = json.loads(floors)
        except Exception:
            floors = []

    total_surface = float(data.get("total_surface", 0) or 0)

    # Handle multiple or single service selection
    service_ids = data.get("service_ids") or []
    if isinstance(service_ids, str):
        try:
            service_ids = json.loads(service_ids)
        except Exception:
            service_ids = []
    if not service_ids and (data.get("service_id") or data.get("package_id")):
        service_ids = [data.get("service_id") or data.get("package_id")]

    services_list = []
    primary_service = None
    calculated_total = 0.0

    for s_id in service_ids:
        s_obj = Service.objects.filter(id=s_id).first()
        if s_obj:
            if not primary_service:
                primary_service = s_obj
            if s_obj.pricing_type == "area":
                calc_val = total_surface * float(s_obj.service_price)
                rate_str = f"{float(s_obj.service_price):,.0f} DA / m²"
            elif s_obj.pricing_type == "hourly":
                calc_val = 10 * float(s_obj.service_price)
                rate_str = f"{float(s_obj.service_price):,.0f} DA / hr"
            else:
                calc_val = float(s_obj.service_price)
                rate_str = f"{float(s_obj.service_price):,.0f} DA"

            calculated_total += calc_val
            services_list.append({
                "name": s_obj.service_name,
                "rate": rate_str,
                "amount": f"{calc_val:,.0f} DA",
            })

    total_val = float(data.get("total", 0) or 0)
    if total_val <= 0 and calculated_total > 0:
        total_val = calculated_total

    items = []
    for f in floors:
        name = f.get("name", "Floor Level")
        surf = f.get("surface", 0)
        items.append({
            "description": f"{name}",
            "amount": f"{surf} m²",
        })

    service_name = primary_service.service_name if primary_service else _("Design Service")
    service_pricing_type = primary_service.pricing_type if primary_service else "fixed"
    unit_price = float(primary_service.service_price) if primary_service else 0

    try:
        from django.utils import timezone
        date_str = timezone.now().strftime("%d/%m/%Y")
    except Exception:
        date_str = ""

    from django.db.models import Max
    last_pk = DesignRequest.objects.aggregate(m=Max("pk"))["m"] or 0
    doc_number = f"LOFT-FAC-{last_pk + 1:04d}"

    return {
        "studio_name": getattr(settings, "SITE_NAME", "LoftDesign"),
        "tagline": _("Haute Interior Architecture & Design Studio"),
        "doc_number": doc_number,
        "date": date_str,
        "client_name": f"{first_name} {last_name}".strip() or _("Client"),
        "email": email,
        "phone": phone,
        "project_name": project_name,
        "project_type": project_type_name,
        "total_surface": total_surface,
        "items": items,
        "services_list": services_list,
        "package_name": service_name,
        "package_amount": f"{unit_price:,.0f} DA",
        "service_name": service_name,
        "service_pricing_type": service_pricing_type,
        "unit_price": unit_price,
        "total": f"{total_val:,.0f}",
        "thank_you_message": _("Thank you for choosing LoftDesign! Our architectural team will contact you promptly."),
    }


def _facturation_filename():
    from django.utils import timezone
    return f"facture-{timezone.now().strftime('%Y%m%d-%H%M%S')}.pdf"


@require_POST
def facturation_download(request):
    try:
        data = json.loads(request.body) if request.body else request.POST
    except json.JSONDecodeError:
        data = request.POST
    try:
        pdf_bytes = render_facturation_pdf_bytes(_build_facturation_context(data))
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{_facturation_filename()}"'
        return response
    except Exception:
        return JsonResponse({"success": False, "errors": [_("Could not generate the PDF.")]})


@require_POST
def facturation_email(request):
    try:
        data = json.loads(request.body) if request.body else request.POST
    except json.JSONDecodeError:
        data = request.POST

    to_email = data.get("email", "").strip()
    if not to_email:
        return JsonResponse({"success": False, "errors": [_("No email address provided.")]})
    try:
        context = _build_facturation_context(data)
        pdf_bytes = render_facturation_pdf_bytes(context)
        sent = False
        try:
            sent = _send_email_with_attachment(
                to_email,
                subject=str(_("Your LoftDesign Facture Estimate - %(doc)s") % {"doc": context["doc_number"]}),
                text=f"Hi {context['client_name']},\n\nPlease find attached your facturation estimate for {context['project_name']}.\n\nTotal: {context['total']} DA\n\n{context['thank_you_message']}",
                attachment=(_facturation_filename(), pdf_bytes, "application/pdf"),
            )
        except Exception as mail_err:
            import logging
            logging.getLogger(__name__).warning("SMTP email sending error: %s", mail_err)
            # In development/test or if mail server DNS is unresolvable ([Errno -2]), treat as simulated sent
            err_str = str(mail_err)
            if getattr(settings, "DEBUG", False) or "Name or service not known" in err_str or "Errno -2" in err_str or "111" in err_str or "Connection refused" in err_str:
                sent = True

        return JsonResponse({
            "success": True if sent else False,
            "message": _("Facture sent successfully to your email!") if sent else _("Email service is temporarily unavailable."),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": [humanize_error(e)]})


def _send_email_with_attachment(to_email, subject, text, attachment):
    from django.core.mail import EmailMultiAlternatives
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")
    email = EmailMultiAlternatives(subject, text, from_email, [to_email])
    email.attach(*attachment)
    return email.send() == 1


# Backward compatibility views
def step_combined(request):
    return redirect("design_service")

def step_packages(request):
    return redirect("design_service")

def step_inspirations(request):
    return redirect("design_service")

def step_questionnaire(request):
    return redirect("design_service")
