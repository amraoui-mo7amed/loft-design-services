import json
from decimal import Decimal

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db import transaction
from django.db.models import Count
from django.db import IntegrityError

from ..utils import humanize_error
from ..decorator import admin_required, with_pagination
from ..models import (
    ProjectType,
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    SpaceImage,
    ProjectTypeSpace,
    Service,
    ServicePricing,
    ServiceTranslation,
)


def _handle_space_category_images(category, files, is_default=False):
    existing_hashes = set(
        category.images.exclude(content_hash="").values_list("content_hash", flat=True)
    )
    for f in files:
        digest = SpaceCategoryImages.compute_hash(f)
        if not digest or digest in existing_hashes:
            continue
        try:
            has_default = category.images.filter(is_default=True).exists()
            SpaceCategoryImages.objects.create(
                category=category,
                image=f,
                content_hash=digest,
                is_default=(not has_default and is_default),
            )
            existing_hashes.add(digest)
        except IntegrityError:
            continue


# ──────────────────────────────────────────────
# Project Type CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/project_type_list", queryset_name="project_types")
def project_type_list(request):
    queryset = ProjectType.objects.annotate(space_count=Count("default_spaces")).order_by("name")
    return {"project_types": queryset}


@admin_required
def project_type_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            ProjectType.objects.create(name=name)
            return JsonResponse({"success": True, "message": _("Project type created successfully."), "redirect_url": reverse("dash:project_type_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/project_type_form.html", {"form_title": _("New Project Type")})


@admin_required
def project_type_update(request, pk):
    obj = get_object_or_404(ProjectType, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Project type updated successfully."), "redirect_url": reverse("dash:project_type_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/project_type_form.html", {"form_title": _("Edit Project Type"), "object": obj})


@admin_required
def project_type_delete(request, pk):
    obj = get_object_or_404(ProjectType, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Project type deleted successfully."), "redirect_url": reverse("dash:project_type_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Project Type Detail - manages linked spaces
# ──────────────────────────────────────────────

@admin_required
def project_type_detail(request, pk):
    pt = get_object_or_404(ProjectType, pk=pk)
    spaces = Space.objects.prefetch_related("categories__images").filter(project_types__project_type=pt).order_by("name")
    featured_ids = set(
        ProjectTypeSpace.objects.filter(project_type=pt, show_on_home=True).values_list("space_id", flat=True)
    )
    return render(request, "dashboard/design/project_type_detail.html", {
        "pt": pt,
        "spaces": spaces,
        "featured_ids": featured_ids,
    })


# ──────────────────────────────────────────────
# Space CRUD (managed from project type detail)
# ──────────────────────────────────────────────

@admin_required
def space_create(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        base_price = request.POST.get("base_price", 0)
        project_type_id = request.POST.get("project_type_id") or None
        gallery_files = request.FILES.getlist("gallery_images")
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        if not project_type_id:
            return JsonResponse({"success": False, "errors": [_("Project type is required.")]})
        try:
            pt = ProjectType.objects.get(pk=project_type_id)
            with transaction.atomic():
                space = Space.objects.create(
                    name=name, base_price=base_price,
                )
                cat = SpaceCategory.objects.create(space=space, category_name=_("General"))
                if gallery_files:
                    _handle_space_category_images(cat, gallery_files, is_default=True)
                ProjectTypeSpace.objects.create(project_type=pt, space=space)
            redirect_url = reverse("dash:project_type_detail", args=[project_type_id])
            return JsonResponse({"success": True, "message": _("Space created successfully."), "redirect_url": redirect_url})
        except ProjectType.DoesNotExist:
            return JsonResponse({"success": False, "errors": [_("Project type is required.")]})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_update(request, pk):
    obj = get_object_or_404(Space, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name).strip()
        obj.base_price = request.POST.get("base_price", obj.base_price)
        project_type_id = request.POST.get("project_type_id") or None
        try:
            obj.save()
            redirect_url = reverse("dash:project_type_detail", args=[project_type_id]) if project_type_id else reverse("dash:project_type_list")
            return JsonResponse({"success": True, "message": _("Space updated successfully."), "redirect_url": redirect_url})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_detail(request, pk):
    space = get_object_or_404(
        Space.objects.prefetch_related("categories__images", "project_types__project_type"),
        pk=pk,
    )
    parent_link = space.project_types.first()
    pt = parent_link.project_type if parent_link else None
    all_project_types = ProjectType.objects.all().order_by("name")

    if request.method == "POST":
        space.name = request.POST.get("name", space.name).strip()
        space.base_price = request.POST.get("base_price", space.base_price)

        if not space.name:
            return JsonResponse({"success": False, "errors": [_("Space name is required.")]})

        new_pt_id = request.POST.get("project_type_id")

        try:
            with transaction.atomic():
                space.save()

                if new_pt_id:
                    new_pt = ProjectType.objects.filter(pk=new_pt_id).first()
                    if new_pt:
                        ProjectTypeSpace.objects.filter(space=space).delete()
                        ProjectTypeSpace.objects.create(
                            space=space,
                            project_type=new_pt,
                            sort_order=0,
                            show_on_home=False,
                        )

            return JsonResponse({
                "success": True,
                "message": _("Space details updated successfully."),
                "redirect_url": reverse("dash:space_detail", args=[space.pk]),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    categories = space.categories.prefetch_related("images").all().order_by("category_name")
    project_type_choices = [(p.pk, p.name) for p in all_project_types]

    return render(request, "dashboard/design/space_details.html", {
        "space": space,
        "pt": pt,
        "all_project_types": all_project_types,
        "project_type_choices": project_type_choices,
        "categories": categories,
    })


@admin_required
def space_delete(request, pk):
    obj = get_object_or_404(Space, pk=pk)
    if request.method == "POST":
        project_type_id = request.POST.get("project_type_id") or None
        try:
            obj.delete()
            redirect_url = reverse("dash:project_type_detail", args=[project_type_id]) if project_type_id else reverse("dash:project_type_list")
            return JsonResponse({"success": True, "message": _("Space deleted successfully."), "redirect_url": redirect_url})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Space Categories & Category Images
# ──────────────────────────────────────────────

@admin_required
def space_category_create(request, pk):
    space = get_object_or_404(Space, pk=pk)
    if request.method == "POST":
        category_name = request.POST.get("category_name", "").strip()
        if not category_name:
            return JsonResponse({"success": False, "errors": [_("Category name is required.")]})
        try:
            cat = SpaceCategory.objects.create(space=space, category_name=category_name)
            gallery_files = request.FILES.getlist("category_images")
            if gallery_files:
                _handle_space_category_images(cat, gallery_files, is_default=True)
            return JsonResponse({
                "success": True,
                "message": _("Category created successfully."),
                "redirect_url": reverse("dash:space_detail", args=[space.pk]),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_update(request, pk, cat_pk):
    space = get_object_or_404(Space, pk=pk)
    cat = get_object_or_404(SpaceCategory, pk=cat_pk, space=space)
    if request.method == "POST":
        category_name = request.POST.get("category_name", "").strip()
        if not category_name:
            return JsonResponse({"success": False, "errors": [_("Category name is required.")]})
        try:
            cat.category_name = category_name
            cat.save(update_fields=["category_name"])
            return JsonResponse({
                "success": True,
                "message": _("Category updated successfully."),
                "category_name": cat.category_name,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_delete(request, pk, cat_pk):
    space = get_object_or_404(Space, pk=pk)
    cat = get_object_or_404(SpaceCategory, pk=cat_pk, space=space)
    if request.method == "POST":
        try:
            cat.delete()
            return JsonResponse({
                "success": True,
                "message": _("Category deleted successfully."),
                "redirect_url": reverse("dash:space_detail", args=[space.pk]),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_image_upload(request, pk, cat_pk):
    space = get_object_or_404(Space, pk=pk)
    cat = get_object_or_404(SpaceCategory, pk=cat_pk, space=space)
    if request.method == "POST":
        gallery_files = request.FILES.getlist("gallery_images")
        if not gallery_files:
            return JsonResponse({"success": False, "errors": [_("Please select at least one image to upload.")]})
        try:
            _handle_space_category_images(cat, gallery_files)
            return JsonResponse({
                "success": True,
                "message": _("Images uploaded successfully."),
                "redirect_url": reverse("dash:space_detail", args=[space.pk]),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_image_update(request, pk, img_pk):
    space = get_object_or_404(Space, pk=pk)
    img = get_object_or_404(SpaceCategoryImages, pk=img_pk, category__space=space)
    if request.method == "POST":
        img.tags = request.POST.get("tags", "").strip()
        img.description = request.POST.get("description", "").strip()
        img.reference = request.POST.get("reference", "").strip()
        try:
            img.save(update_fields=["tags", "description", "reference"])
            return JsonResponse({
                "success": True,
                "message": _("Image details updated successfully."),
                "tags": img.tags,
                "description": img.description,
                "reference": img.reference,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


@admin_required
def space_category_image_set_default(request, pk, img_pk):
    space = get_object_or_404(Space, pk=pk)
    img = get_object_or_404(SpaceCategoryImages, pk=img_pk, category__space=space)
    if request.method == "POST":
        try:
            with transaction.atomic():
                SpaceCategoryImages.objects.filter(category__space=space).update(is_default=False)
                img.is_default = True
                img.save(update_fields=["is_default"])
            return JsonResponse({
                "success": True,
                "message": _("Default image updated successfully."),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


@admin_required
def space_category_image_delete(request):
    if request.method == "POST":
        img_id = request.POST.get("image_id")
        img = get_object_or_404(SpaceCategoryImages, pk=img_id)
        space = img.category.space
        try:
            was_default = img.is_default
            img.delete()
            if was_default:
                fallback = SpaceCategoryImages.objects.filter(category__space=space).first()
                if fallback:
                    fallback.is_default = True
                    fallback.save(update_fields=["is_default"])
            return JsonResponse({
                "success": True,
                "message": _("Image deleted successfully."),
                "gallery": json.loads(space.gallery_images_json),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# Compatibility aliases
space_image_update = space_category_image_update
space_image_set_thumbnail = space_category_image_set_default
space_image_delete = space_category_image_delete


# ──────────────────────────────────────────────
# Homepage featured project type & spaces
# ──────────────────────────────────────────────

@admin_required
def project_type_home_toggle(request, pk):
    pt = get_object_or_404(ProjectType, pk=pk)
    if request.method == "POST":
        action = request.POST.get("action")
        try:
            with transaction.atomic():
                if action == "feature":
                    ProjectType.objects.filter(featured_on_home=True).update(featured_on_home=False)
                    pt.featured_on_home = True
                    pt.save(update_fields=["featured_on_home"])
                    message = _("“%(name)s” is now featured on the homepage.") % {"name": pt.name}
                else:
                    pt.featured_on_home = False
                    pt.save(update_fields=["featured_on_home"])
                    message = _("“%(name)s” is no longer featured on the homepage.") % {"name": pt.name}
            return JsonResponse({
                "success": True,
                "message": message,
                "featured_pk": pt.pk if pt.featured_on_home else None,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
@with_pagination(per_page=12, template="dashboard/design/space_type_spaces", queryset_name="spaces")
def space_type_spaces(request, pk):
    pt = get_object_or_404(ProjectType, pk=pk)
    links = (
        ProjectTypeSpace.objects.select_related("space")
        .prefetch_related("space__categories__images")
        .filter(project_type=pt)
        .order_by("space__name")
    )
    spaces = [
        {
            "space": link.space,
            "show_on_home": link.show_on_home,
        }
        for link in links
    ]
    return {
        "pt": pt,
        "spaces": spaces,
        "featured_count": sum(1 for link in links if link.show_on_home),
    }


@admin_required
def space_home_save(request, pk):
    pt = get_object_or_404(ProjectType, pk=pk)
    if request.method == "POST":
        selected_ids = {x for x in request.POST.getlist("space_ids") if x.isdigit()}
        try:
            with transaction.atomic():
                links = ProjectTypeSpace.objects.filter(project_type=pt).select_related("space")
                for link in links:
                    link.show_on_home = str(link.space_id) in selected_ids
                    link.save(update_fields=["show_on_home"])
                count = links.filter(show_on_home=True).count()
            return JsonResponse({
                "success": True,
                "message": _("Featured spaces saved for “%(name)s”.") % {"name": pt.name},
                "total": count,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_home_toggle(request, pk):
    if request.method == "POST":
        link = get_object_or_404(ProjectTypeSpace, space_id=pk)
        action = request.POST.get("action")
        try:
            if action == "feature":
                link.show_on_home = True
                message = _("“%(name)s” is featured on the homepage.") % {"name": link.space.name}
            else:
                link.show_on_home = False
                message = _("“%(name)s” is no longer featured on the homepage.") % {"name": link.space.name}
            link.save(update_fields=["show_on_home"])
            return JsonResponse({
                "success": True,
                "message": message,
                "show_on_home": link.show_on_home,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Service CRUD (replaces Packages)
# ──────────────────────────────────────────────

def _parse_bullet_list(raw_val):
    if isinstance(raw_val, list):
        return [str(x).strip() for x in raw_val if str(x).strip()]
    if isinstance(raw_val, str):
        lines = [line.strip().lstrip("-•*").strip() for line in raw_val.splitlines()]
        return [line for line in lines if line]
    return []


# ──────────────────────────────────────────────
# Service CRUD (Multilingual Descriptions & Pricing Models)
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/service_list", queryset_name="services")
def service_list(request):
    q = request.GET.get("q", "").strip()
    queryset = Service.objects.prefetch_related("translations").all()
    if q:
        queryset = queryset.filter(service_name__icontains=q)
    queryset = queryset.order_by("-is_default", "service_name")

    total_count = Service.objects.count()
    default_service = Service.objects.filter(is_default=True).first()
    return {
        "services": queryset,
        "total_count": total_count,
        "default_service": default_service,
        "search_query": q,
    }


@admin_required
def service_create(request):
    if request.method == "POST":
        service_name_fr = request.POST.get("service_name_fr", "").strip() or request.POST.get("service_name", "").strip()
        service_name_en = request.POST.get("service_name_en", "").strip()
        service_name_ar = request.POST.get("service_name_ar", "").strip()

        pricing_type = request.POST.get("pricing_type", ServicePricing.PricingType.FIXED)
        service_price = request.POST.get("service_price", 0)
        percentage_rate = request.POST.get("percentage_rate", 0)
        min_fee = request.POST.get("min_fee")
        max_fee = request.POST.get("max_fee")

        video_link = request.POST.get("video_link", "").strip() or None
        is_default = request.POST.get("is_default") in ("true", "1", "on", True)
        gif_file = request.FILES.get("gif_file")

        if not service_name_fr:
            return JsonResponse({"success": False, "errors": [_("French service name is required as default.")]})

        try:
            try:
                service_price = Decimal(str(service_price or 0))
            except Exception:
                service_price = Decimal("0.00")

            try:
                percentage_rate = Decimal(str(percentage_rate or 0))
            except Exception:
                percentage_rate = Decimal("0.00")

            min_fee_val = Decimal(str(min_fee)) if (min_fee and str(min_fee).strip()) else None
            max_fee_val = Decimal(str(max_fee)) if (max_fee and str(max_fee).strip()) else None

            # Fallback descriptions for base model from FR
            short_desc_fr = request.POST.get("short_description_fr", "").strip() or request.POST.get("short_description", "").strip()
            detailed_desc_fr = request.POST.get("detailed_description_fr", "").strip() or request.POST.get("detailed_description", "").strip()
            included_fr = _parse_bullet_list(request.POST.get("included_items_fr") or request.POST.get("included_items", ""))
            excluded_fr = _parse_bullet_list(request.POST.get("excluded_items_fr") or request.POST.get("excluded_items", ""))
            deliverables_fr = _parse_bullet_list(request.POST.get("deliverables_fr") or request.POST.get("deliverables", ""))
            revisions_fr = request.POST.get("included_revisions_fr", "").strip() or request.POST.get("included_revisions", "").strip()
            delivery_time_fr = request.POST.get("estimated_delivery_time_fr", "").strip() or request.POST.get("estimated_delivery_time", "").strip()

            with transaction.atomic():
                if is_default:
                    ServicePricing.objects.filter(is_default=True).update(is_default=False)

                service = ServicePricing.objects.create(
                    service_name=service_name_fr,
                    pricing_type=pricing_type,
                    service_price=service_price,
                    percentage_rate=percentage_rate,
                    min_fee=min_fee_val,
                    max_fee=max_fee_val,
                    short_description=short_desc_fr,
                    detailed_description=detailed_desc_fr,
                    included_items=included_fr,
                    excluded_items=excluded_fr,
                    deliverables=deliverables_fr,
                    included_revisions=revisions_fr,
                    estimated_delivery_time=delivery_time_fr,
                    video_link=video_link,
                    gif_file=gif_file,
                    is_default=is_default,
                )

                # Save translations for FR, EN, AR
                locales_data = {
                    "fr": {
                        "name": service_name_fr,
                        "short_description": short_desc_fr,
                        "detailed_description": detailed_desc_fr,
                        "included_items": included_fr,
                        "excluded_items": excluded_fr,
                        "deliverables": deliverables_fr,
                        "included_revisions": revisions_fr,
                        "estimated_delivery_time": delivery_time_fr,
                    },
                    "en": {
                        "name": service_name_en or service_name_fr,
                        "short_description": request.POST.get("short_description_en", "").strip(),
                        "detailed_description": request.POST.get("detailed_description_en", "").strip(),
                        "included_items": _parse_bullet_list(request.POST.get("included_items_en", "")),
                        "excluded_items": _parse_bullet_list(request.POST.get("excluded_items_en", "")),
                        "deliverables": _parse_bullet_list(request.POST.get("deliverables_en", "")),
                        "included_revisions": request.POST.get("included_revisions_en", "").strip(),
                        "estimated_delivery_time": request.POST.get("estimated_delivery_time_en", "").strip(),
                    },
                    "ar": {
                        "name": service_name_ar or service_name_fr,
                        "short_description": request.POST.get("short_description_ar", "").strip(),
                        "detailed_description": request.POST.get("detailed_description_ar", "").strip(),
                        "included_items": _parse_bullet_list(request.POST.get("included_items_ar", "")),
                        "excluded_items": _parse_bullet_list(request.POST.get("excluded_items_ar", "")),
                        "deliverables": _parse_bullet_list(request.POST.get("deliverables_ar", "")),
                        "included_revisions": request.POST.get("included_revisions_ar", "").strip(),
                        "estimated_delivery_time": request.POST.get("estimated_delivery_time_ar", "").strip(),
                    },
                }

                for loc, l_data in locales_data.items():
                    ServiceTranslation.objects.create(
                        service=service,
                        locale=loc,
                        name=l_data["name"] or service.service_name,
                        short_description=l_data["short_description"],
                        detailed_description=l_data["detailed_description"],
                        included_items=l_data["included_items"],
                        excluded_items=l_data["excluded_items"],
                        deliverables=l_data["deliverables"],
                        included_revisions=l_data["included_revisions"],
                        estimated_delivery_time=l_data["estimated_delivery_time"],
                    )

            return JsonResponse({
                "success": True,
                "message": _("Service created successfully with translations."),
                "redirect_url": reverse("dash:service_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:service_list")


@admin_required
def service_update(request, pk):
    obj = get_object_or_404(ServicePricing.objects.prefetch_related("translations"), pk=pk)
    if request.method == "POST":
        service_name_fr = request.POST.get("service_name_fr", "").strip() or request.POST.get("service_name", "").strip() or obj.service_name
        service_name_en = request.POST.get("service_name_en", "").strip()
        service_name_ar = request.POST.get("service_name_ar", "").strip()

        pricing_type = request.POST.get("pricing_type", obj.pricing_type)
        service_price = request.POST.get("service_price", obj.service_price)
        percentage_rate = request.POST.get("percentage_rate", obj.percentage_rate)
        min_fee = request.POST.get("min_fee")
        max_fee = request.POST.get("max_fee")

        video_link = request.POST.get("video_link", "").strip() or None
        is_default = request.POST.get("is_default") in ("true", "1", "on", True)
        gif_file = request.FILES.get("gif_file")

        if not service_name_fr:
            return JsonResponse({"success": False, "errors": [_("Service name is required.")]})

        try:
            try:
                service_price = Decimal(str(service_price or 0))
            except Exception:
                service_price = obj.service_price

            try:
                percentage_rate = Decimal(str(percentage_rate or 0))
            except Exception:
                percentage_rate = obj.percentage_rate

            min_fee_val = Decimal(str(min_fee)) if (min_fee and str(min_fee).strip()) else None
            max_fee_val = Decimal(str(max_fee)) if (max_fee and str(max_fee).strip()) else None

            short_desc_fr = request.POST.get("short_description_fr", "").strip() or request.POST.get("short_description", "").strip()
            detailed_desc_fr = request.POST.get("detailed_description_fr", "").strip() or request.POST.get("detailed_description", "").strip()
            included_fr = _parse_bullet_list(request.POST.get("included_items_fr") or request.POST.get("included_items", ""))
            excluded_fr = _parse_bullet_list(request.POST.get("excluded_items_fr") or request.POST.get("excluded_items", ""))
            deliverables_fr = _parse_bullet_list(request.POST.get("deliverables_fr") or request.POST.get("deliverables", ""))
            revisions_fr = request.POST.get("included_revisions_fr", "").strip() or request.POST.get("included_revisions", "").strip()
            delivery_time_fr = request.POST.get("estimated_delivery_time_fr", "").strip() or request.POST.get("estimated_delivery_time", "").strip()

            with transaction.atomic():
                if is_default and not obj.is_default:
                    ServicePricing.objects.exclude(pk=obj.pk).filter(is_default=True).update(is_default=False)

                obj.service_name = service_name_fr
                obj.pricing_type = pricing_type
                obj.service_price = service_price
                obj.percentage_rate = percentage_rate
                obj.min_fee = min_fee_val
                obj.max_fee = max_fee_val
                obj.short_description = short_desc_fr
                obj.detailed_description = detailed_desc_fr
                obj.included_items = included_fr
                obj.excluded_items = excluded_fr
                obj.deliverables = deliverables_fr
                obj.included_revisions = revisions_fr
                obj.estimated_delivery_time = delivery_time_fr
                obj.video_link = video_link
                if gif_file:
                    obj.gif_file = gif_file
                obj.is_default = is_default
                obj.save()

                locales_data = {
                    "fr": {
                        "name": service_name_fr,
                        "short_description": short_desc_fr,
                        "detailed_description": detailed_desc_fr,
                        "included_items": included_fr,
                        "excluded_items": excluded_fr,
                        "deliverables": deliverables_fr,
                        "included_revisions": revisions_fr,
                        "estimated_delivery_time": delivery_time_fr,
                    },
                    "en": {
                        "name": service_name_en or service_name_fr,
                        "short_description": request.POST.get("short_description_en", "").strip(),
                        "detailed_description": request.POST.get("detailed_description_en", "").strip(),
                        "included_items": _parse_bullet_list(request.POST.get("included_items_en", "")),
                        "excluded_items": _parse_bullet_list(request.POST.get("excluded_items_en", "")),
                        "deliverables": _parse_bullet_list(request.POST.get("deliverables_en", "")),
                        "included_revisions": request.POST.get("included_revisions_en", "").strip(),
                        "estimated_delivery_time": request.POST.get("estimated_delivery_time_en", "").strip(),
                    },
                    "ar": {
                        "name": service_name_ar or service_name_fr,
                        "short_description": request.POST.get("short_description_ar", "").strip(),
                        "detailed_description": request.POST.get("detailed_description_ar", "").strip(),
                        "included_items": _parse_bullet_list(request.POST.get("included_items_ar", "")),
                        "excluded_items": _parse_bullet_list(request.POST.get("excluded_items_ar", "")),
                        "deliverables": _parse_bullet_list(request.POST.get("deliverables_ar", "")),
                        "included_revisions": request.POST.get("included_revisions_ar", "").strip(),
                        "estimated_delivery_time": request.POST.get("estimated_delivery_time_ar", "").strip(),
                    },
                }

                for loc, l_data in locales_data.items():
                    t_obj, _ = ServiceTranslation.objects.get_or_create(
                        service=obj,
                        locale=loc,
                        defaults={"name": l_data["name"] or obj.service_name},
                    )
                    t_obj.name = l_data["name"] or obj.service_name
                    t_obj.short_description = l_data["short_description"]
                    t_obj.detailed_description = l_data["detailed_description"]
                    t_obj.included_items = l_data["included_items"]
                    t_obj.excluded_items = l_data["excluded_items"]
                    t_obj.deliverables = l_data["deliverables"]
                    t_obj.included_revisions = l_data["included_revisions"]
                    t_obj.estimated_delivery_time = l_data["estimated_delivery_time"]
                    t_obj.save()

            return JsonResponse({
                "success": True,
                "message": _("Service updated successfully."),
                "redirect_url": reverse("dash:service_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:service_list")


@admin_required
def service_delete(request, pk):
    obj = get_object_or_404(ServicePricing, pk=pk)
    if request.method == "POST":
        try:
            with transaction.atomic():
                was_default = obj.is_default
                obj.delete()
                if was_default:
                    replacement = ServicePricing.objects.first()
                    if replacement:
                        replacement.is_default = True
                        replacement.save(update_fields=["is_default"])

            return JsonResponse({
                "success": True,
                "message": _("Service deleted successfully."),
                "redirect_url": reverse("dash:service_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def service_toggle_default(request, pk):
    obj = get_object_or_404(ServicePricing, pk=pk)
    if request.method == "POST":
        action = request.POST.get("action")
        try:
            with transaction.atomic():
                if action == "set":
                    ServicePricing.objects.exclude(pk=obj.pk).filter(is_default=True).update(is_default=False)
                    obj.is_default = True
                    message = _("“%(name)s” is now the single default service in the catalog.") % {"name": obj.service_name}
                else:
                    obj.is_default = False
                    message = _("“%(name)s” is no longer default.") % {"name": obj.service_name}
                obj.save(update_fields=["is_default"])

            return JsonResponse({
                "success": True,
                "message": message,
                "is_default": obj.is_default,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# Compatibility aliases for legacy package routes
package_list = service_list
package_create = service_create
package_update = service_update
package_delete = service_delete
package_set_default = service_toggle_default
