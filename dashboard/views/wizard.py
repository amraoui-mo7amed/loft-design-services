from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from django.conf import settings
import json

from ..models import (
    ProjectType, Space, SpaceImage, DesignPackage, DesignOption,
    DesignRequest, DesignRequestFloor, DesignRequestSpace, DesignRequestOption,
    DesignRequestSpaceImage, DesignRequestFile,
)
from ..price_engine import calculate_full_price
from ..pdf_generator import render_facturation_pdf_bytes


def wizard_container(request):
    project_types = ProjectType.objects.all()
    project_type_choices = [("", _("Choose project type"))] + [(pt.slug, pt.name) for pt in project_types]
    step_labels = [
        _("Project & Spaces"), _("Package"),
        _("Contact"), _("Summary"),
    ]
    timeline_choices = [
        ("", _("Select timeline")),
        ("urgent", _("ASAP (Within 2 weeks)")),
        ("normal", _("Normal (1-2 months)")),
        ("relaxed", _("Relaxed (2-3 months)")),
        ("flexible", _("Flexible (No deadline)")),
    ]
    property_type_choices = [
        ("", _("Select type")),
        ("new", _("New Construction")),
        ("renovation", _("Renovation")),
        ("occupied", _("Occupied")),
        ("vacant", _("Vacant")),
    ]
    return render(request, "dashboard/wizard/container.html", {
        "project_types": project_types,
        "project_type_choices": project_type_choices,
        "step_labels": step_labels,
        "timeline_choices": timeline_choices,
        "property_type_choices": property_type_choices,
    })


def step_combined(request):
    project_types = ProjectType.objects.all()
    project_type_choices = [("", _("Choose project type"))] + [(pt.slug, pt.name) for pt in project_types]
    spaces = Space.objects.all().prefetch_related("gallery_images")
    floor_count = int(request.GET.get("floor_count", 1))
    return render(request, "dashboard/wizard/step1_combined.html", {
        "project_types": project_types,
        "project_type_choices": project_type_choices,
        "spaces": spaces,
        "floor_count": range(floor_count),
    })


def step_packages(request):
    packages = DesignPackage.objects.prefetch_related("package_services__option__category")
    package_data = []
    for pkg in packages:
        total = sum(ps.price for ps in pkg.package_services.all())
        package_data.append({
            "pkg": pkg,
            "total_price": total,
        })
    return render(request, "dashboard/wizard/step4_packages.html", {
        "packages": packages,
        "package_data": package_data,
    })


def step_inspirations(request):
    space_ids_param = request.GET.get("space_ids")
    spaces_qs = Space.objects.all().prefetch_related("gallery_images")
    if space_ids_param:
        ids = [int(x) for x in space_ids_param.split(",") if x]
        if ids:
            spaces_qs = spaces_qs.filter(id__in=ids)
    spaces_list = list(spaces_qs)
    selected_ids = {s.id for s in spaces_list}
    galleries = SpaceImage.objects.filter(space_id__in=selected_ids)

    gallery_by_space = {}
    for img in galleries:
        sid = img.space_id
        if sid not in gallery_by_space:
            gallery_by_space[sid] = []
        gallery_by_space[sid].append(img)

    for sid in gallery_by_space:
        gallery_by_space[sid] = gallery_by_space[sid][-3:]

    return render(request, "dashboard/wizard/step6_inspirations.html", {
        "spaces_list": spaces_list,
        "gallery_by_space": gallery_by_space,
    })


def step_questionnaire(request):
    return render(request, "dashboard/wizard/step7_questionnaire.html")


def step_summary(request):
    return render(request, "dashboard/wizard/step9_summary.html")



@require_POST
def submit_design_request(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        data = request.POST

    with transaction.atomic():
        project_type = get_object_or_404(ProjectType, slug=data.get("project_type_slug"))
        package_id = data.get("package_id")
        package = DesignPackage.objects.filter(id=package_id).first() if package_id else None

        questionnaire = json.loads(data.get("questionnaire", "{}"))

        first_name = questionnaire.get("first_name", "")
        last_name = questionnaire.get("last_name", "")
        email = questionnaire.get("email", "")
        phone = questionnaire.get("phone", "")
        project_name = (first_name + " " + last_name).strip() or "Design Request"

        design_request = DesignRequest.objects.create(
            client=request.user if request.user.is_authenticated else None,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            project_name=project_name,
            project_type=project_type,
            package=package,
            total=data.get("total", 0),
        )

        floor_names = json.loads(data.get("floors", "[]"))
        floors = []
        for i, name in enumerate(floor_names):
            floor = DesignRequestFloor.objects.create(
                design_request=design_request, name=name, level=i, order=i
            )
            floors.append(floor)
        floors_by_order = {floor.order: floor for floor in floors}

        spaces_data = json.loads(data.get("spaces", "[]"))
        space_ids = {item.get("spaceId") for item in spaces_data if item.get("spaceId")}
        space_map = Space.objects.in_bulk(space_ids)
        for item in spaces_data:
            floor = floors_by_order.get(item.get("floorIndex", 0))
            space = space_map.get(item.get("spaceId"))
            if floor and space:
                DesignRequestSpace.objects.create(
                    design_request=design_request, floor=floor, space=space,
                    price_at_time=space.base_price
                )

        insp_data = json.loads(data.get("inspirations", "{}"))
        for space_id, image_ids in insp_data.items():
            drs = DesignRequestSpace.objects.filter(
                design_request=design_request, space_id=space_id
            ).first()
            if drs:
                img_ids = {int(x) for x in image_ids if x}
                img_map = SpaceImage.objects.in_bulk(img_ids)
                for img_id in img_ids:
                    img = img_map.get(img_id)
                    if img:
                        DesignRequestSpaceImage.objects.create(
                            design_request_space=drs, space_image=img
                        )

    return JsonResponse({
        "success": True,
        "message": _("Design request submitted successfully!"),
        "project_number": design_request.project_number,
        "uuid": str(design_request.uuid),
        "redirect_url": f"/dashboard/my-projects/{design_request.uuid}/",
    })


# ──────────────────────────────────────────────
# Facturation (step 4) - PDF download / email
# ──────────────────────────────────────────────

def _build_facturation_context(data):
    questionnaire = json.loads(data.get("questionnaire", "{}"))
    spaces = json.loads(data.get("spaces", "[]"))
    package_id = data.get("package_id")

    items = [
        {
            "description": s.get("name") or "Space",
            "amount": f"{float(s.get('price') or 0):g}",
        }
        for s in spaces
    ]

    package_amount = 0
    package_name = None
    if package_id:
        pkg = DesignPackage.objects.filter(id=package_id).first()
        if pkg:
            package_name = pkg.name
            package_amount = float(pkg.total_price)

    subtotal = sum(float(s.get("price") or 0) for s in spaces) + package_amount
    total = float(data.get("total") or subtotal)

    first = questionnaire.get("first_name", "")
    last = questionnaire.get("last_name", "")
    project_name = questionnaire.get("project_name") or (f"{first} {last}".strip() or "Design Request")

    try:
        from django.utils import timezone
        date_str = timezone.now().strftime("%Y-%m-%d")
    except Exception:
        date_str = ""

    from django.db.models import Max
    last_pk = DesignRequest.objects.aggregate(m=Max("pk"))["m"] or 0
    doc_number = f"LOFT-FAC-{last_pk + 1}"

    return {
        "studio_name": getattr(settings, "SITE_NAME", "LoftDesign"),
        "tagline": _("Interior Design Studio"),
        "doc_number": doc_number,
        "date": date_str,
        "client_name": f"{first} {last}".strip() or _("Client"),
        "email": questionnaire.get("email", ""),
        "phone": questionnaire.get("phone", ""),
        "project_name": project_name,
        "items": items,
        "package_name": package_name,
        "package_amount": f"{package_amount:g}",
        "total": f"{total:g}",
        "thank_you_message": _("Thank you for choosing our design service!"),
    }


def _facturation_filename():
    from django.utils import timezone
    return f"facturation-{timezone.now().strftime('%Y%m%d-%H%M%S')}.pdf"


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

    questionnaire = json.loads(data.get("questionnaire", "{}"))
    to_email = questionnaire.get("email", "")
    if not to_email:
        return JsonResponse({"success": False, "errors": [_("No email address provided.")]})
    try:
        context = _build_facturation_context(data)
        pdf_bytes = render_facturation_pdf_bytes(context)
        sent = _send_email_with_attachment(
            to_email,
            subject=_(f"Your LoftDesign Facturation - {context['doc_number']}"),
            text=f"Hi {context['client_name']},\n\nFind attached your facturation estimate.\n\n{context['thank_you_message']}",
            attachment=(_facturation_filename(), pdf_bytes, "application/pdf"),
        )
        return JsonResponse({
            "success": sent,
            "message": _("Facturation sent to your email") if sent else _("Failed to send the email."),
        })
    except Exception:
        return JsonResponse({"success": False, "errors": [_("Could not generate or send the PDF.")]})


def _send_email_with_attachment(to_email, subject, text, attachment):
    from django.core.mail import EmailMultiAlternatives
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")
    email = EmailMultiAlternatives(subject, text, from_email, [to_email])
    email.attach(*attachment)
    return email.send() == 1
