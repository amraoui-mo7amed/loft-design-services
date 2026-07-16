from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _
from django.db import transaction
import json

from ..models import (
    ProjectType, Space, DesignPackage, DesignOption,
    StyleCategory, InspirationImage, DesignRequest,
    DesignRequestFloor, DesignRequestSpace, DesignRequestOption,
    DesignRequestInspiration, DesignRequestFile,
)
from ..price_engine import calculate_full_price


def wizard_container(request):
    project_types = ProjectType.objects.filter(active=True)
    packages = DesignPackage.objects.filter(active=True).prefetch_related("package_services__option__category")
    options = DesignOption.objects.filter(active=True)
    styles = StyleCategory.objects.all()
    project_type_choices = [("", _("Choose project type"))] + [(pt.slug, pt.name) for pt in project_types]
    step_labels = [
        _("Project & Floors"), _("Spaces"), _("Package"),
        _("Inspirations"), _("Questionnaire"),
        _("Summary"), _("Confirmation"),
    ]
    return render(request, "dashboard/wizard/container.html", {
        "project_types": project_types,
        "project_type_choices": project_type_choices,
        "packages": packages,
        "options": options,
        "styles": styles,
        "step_labels": step_labels,
    })


def step_project_type(request):
    project_types = ProjectType.objects.filter(active=True)
    project_type_choices = [("", _("Choose project type"))] + [(pt.slug, pt.name) for pt in project_types]
    return render(request, "dashboard/wizard/step1_project_type.html", {
        "project_types": project_types,
        "project_type_choices": project_type_choices,
    })


def step_spaces(request):
    project_type_slug = request.GET.get("project_type")
    floor_count = int(request.GET.get("floor_count", 1))
    spaces = Space.objects.filter(active=True)
    if project_type_slug:
        pt = get_object_or_404(ProjectType, slug=project_type_slug)
        space_ids = pt.default_spaces.values_list("space_id", flat=True)
        spaces = spaces.filter(id__in=space_ids)
    return render(request, "dashboard/wizard/step3_spaces.html", {
        "spaces": spaces,
        "floor_count": range(floor_count),
    })


def step_packages(request):
    packages = DesignPackage.objects.filter(active=True).prefetch_related("package_services__option__category")
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
    spaces_list = Space.objects.filter(active=True)
    styles = StyleCategory.objects.all()
    inspirations = InspirationImage.objects.filter(active=True).select_related("space", "style_category")

    insp_by_space_cat = {}
    for img in inspirations:
        sid = img.space_id
        cid = img.style_category_id
        if sid not in insp_by_space_cat:
            insp_by_space_cat[sid] = {}
        if cid not in insp_by_space_cat[sid]:
            insp_by_space_cat[sid][cid] = {
                "category": img.style_category,
                "images": [],
            }
        insp_by_space_cat[sid][cid]["images"].append(img)

    for space_id, cats in insp_by_space_cat.items():
        for cid, data in cats.items():
            data["images"] = data["images"][-6:]

    return render(request, "dashboard/wizard/step6_inspirations.html", {
        "spaces_list": spaces_list,
        "styles": styles,
        "inspirations": inspirations,
        "insp_by_space_cat": insp_by_space_cat,
    })


def step_questionnaire(request):
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
    return render(request, "dashboard/wizard/step7_questionnaire.html", {
        "timeline_choices": timeline_choices,
        "property_type_choices": property_type_choices,
    })


def step_summary(request):
    return render(request, "dashboard/wizard/step9_summary.html")


def step_confirmation(request):
    return render(request, "dashboard/wizard/step10_confirmation.html")


@login_required
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

        design_request = DesignRequest.objects.create(
            client=request.user,
            project_name=data.get("project_name", "My Project"),
            project_type=project_type,
            package=package,
            budget=data.get("budget"),
            total=data.get("total", 0),
        )

        floor_names = json.loads(data.get("floors", "[]"))
        for i, name in enumerate(floor_names):
            DesignRequestFloor.objects.create(
                design_request=design_request, name=name, level=i, order=i
            )

        spaces_data = json.loads(data.get("spaces", "[]"))
        for item in spaces_data:
            floor = design_request.floors.filter(order=item.get("floor_index", 0)).first()
            space = Space.objects.filter(id=item.get("space_id")).first()
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
                for img_id in image_ids:
                    img = InspirationImage.objects.filter(id=img_id).first()
                    if img:
                        DesignRequestInspiration.objects.create(
                            design_request_space=drs, inspiration_image=img
                        )

        questionnaire = json.loads(data.get("questionnaire", "{}"))
        design_request.project_name = questionnaire.get("project_name", design_request.project_name)
        design_request.budget = questionnaire.get("budget") or design_request.budget
        design_request.save(update_fields=["project_name", "budget"])

    return JsonResponse({
        "success": True,
        "message": _("Design request submitted successfully!"),
        "project_number": design_request.project_number,
        "uuid": str(design_request.uuid),
        "redirect_url": f"/dashboard/my-projects/{design_request.uuid}/",
    })
