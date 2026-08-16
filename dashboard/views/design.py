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
    SpaceImage,
    ProjectTypeSpace,
    DesignPackage,
    PackageService,
    DesignOption,
)


def _create_option(name, description=""):
    base_slug = slugify(name)
    if not base_slug:
        base_slug = "option"
    slug = base_slug
    counter = 1
    while DesignOption.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return DesignOption.objects.create(
        name=name, slug=slug,
        description=description,
    )


def _handle_space_gallery(space, files, delete_ids, thumbnail_image_id=None):
    existing_hashes = set(
        space.gallery_images.exclude(content_hash="").values_list("content_hash", flat=True)
    )
    for f in files:
        digest = SpaceImage.compute_hash(f)
        if not digest or digest in existing_hashes:
            continue
        try:
            SpaceImage.objects.create(space=space, image=f, content_hash=digest)
            existing_hashes.add(digest)
        except IntegrityError:
            continue
    if delete_ids:
        SpaceImage.objects.filter(space=space, pk__in=delete_ids).delete()
    if thumbnail_image_id and SpaceImage.objects.filter(space=space, pk=thumbnail_image_id).exists():
        space.gallery_images.update(is_thumbnail=False)
        SpaceImage.objects.filter(space=space, pk=thumbnail_image_id).update(is_thumbnail=True)
    elif not space.gallery_images.filter(is_thumbnail=True).exists():
        first = space.gallery_images.first()
        if first:
            first.is_thumbnail = True
            first.save(update_fields=["is_thumbnail"])


# ──────────────────────────────────────────────
# Project Type CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/project_type_list", queryset_name="project_types")
def project_type_list(request):
    queryset = ProjectType.objects.annotate(space_count=Count("default_spaces")).order_by("name")
    return { "project_types": queryset }


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
    spaces = Space.objects.prefetch_related("gallery_images").filter(project_types__project_type=pt).order_by("name")
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
        name = request.POST.get("name")
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
                _handle_space_gallery(space, gallery_files, [])
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
        obj.name = request.POST.get("name", obj.name)
        obj.base_price = request.POST.get("base_price", obj.base_price)
        gallery_files = request.FILES.getlist("gallery_images")
        delete_ids = [x for x in request.POST.getlist("delete_gallery_ids") if x.isdigit()]
        thumbnail_image_id = request.POST.get("thumbnail_image_id") or None
        project_type_id = request.POST.get("project_type_id") or None
        try:
            with transaction.atomic():
                obj.save()
                _handle_space_gallery(obj, gallery_files, delete_ids, thumbnail_image_id=thumbnail_image_id)
                for img in obj.gallery_images.all():
                    desc_key = f"description_{img.pk}"
                    tags_key = f"tags_{img.pk}"
                    updated = False
                    if desc_key in request.POST:
                        img.description = request.POST.get(desc_key, "").strip()
                        updated = True
                    if tags_key in request.POST:
                        img.tags = request.POST.get(tags_key, "").strip()
                        updated = True
                    if updated:
                        img.save()
            redirect_url = reverse("dash:project_type_detail", args=[project_type_id]) if project_type_id else reverse("dash:project_type_list")
            return JsonResponse({"success": True, "message": _("Space updated successfully."), "redirect_url": redirect_url})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_detail(request, pk):
    space = get_object_or_404(
        Space.objects.prefetch_related("gallery_images", "project_types__project_type"),
        pk=pk,
    )
    parent_link = space.project_types.first()
    pt = parent_link.project_type if parent_link else None

    if request.method == "POST":
        space.name = request.POST.get("name", space.name).strip()
        space.base_price = request.POST.get("base_price", space.base_price)
        gallery_files = request.FILES.getlist("gallery_images")

        if not space.name:
            return JsonResponse({"success": False, "errors": [_("Space name is required.")]})

        try:
            with transaction.atomic():
                space.save()
                if gallery_files:
                    _handle_space_gallery(space, gallery_files, [])
            return JsonResponse({
                "success": True,
                "message": _("Space details updated successfully."),
                "redirect_url": reverse("dash:space_detail", args=[space.pk]),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    return render(request, "dashboard/design/space_details.html", {
        "space": space,
        "pt": pt,
        "gallery_images": space.gallery_images.all().order_by("-is_thumbnail", "id"),
    })


@admin_required
def space_image_update(request, pk, img_pk):
    space = get_object_or_404(Space, pk=pk)
    img = get_object_or_404(SpaceImage, pk=img_pk, space=space)
    if request.method == "POST":
        img.tags = request.POST.get("tags", "").strip()
        img.description = request.POST.get("description", "").strip()
        try:
            img.save(update_fields=["tags", "description"])
            return JsonResponse({
                "success": True,
                "message": _("Image details updated successfully."),
                "tags": img.tags,
                "description": img.description,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


@admin_required
def space_image_set_thumbnail(request, pk, img_pk):
    space = get_object_or_404(Space, pk=pk)
    img = get_object_or_404(SpaceImage, pk=img_pk, space=space)
    if request.method == "POST":
        try:
            with transaction.atomic():
                space.gallery_images.update(is_thumbnail=False)
                img.is_thumbnail = True
                img.save(update_fields=["is_thumbnail"])
            return JsonResponse({
                "success": True,
                "message": _("Thumbnail updated successfully."),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


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


@admin_required
def space_image_delete(request):
    if request.method == "POST":
        img = get_object_or_404(SpaceImage, pk=request.POST.get("image_id"))
        space = img.space
        try:
            img.delete()
            if not space.gallery_images.filter(is_thumbnail=True).exists():
                first = space.gallery_images.first()
                if first:
                    first.is_thumbnail = True
                    first.save(update_fields=["is_thumbnail"])
            return JsonResponse({
                "success": True,
                "message": _("Image deleted successfully."),
                "gallery": json.loads(space.gallery_images_json),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


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
        .prefetch_related("space__gallery_images")
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
# Design Package CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/package_list", queryset_name="packages")
def package_list(request):
    queryset = DesignPackage.objects.prefetch_related("package_services__option__category").order_by("name")
    return {"packages": queryset}


@admin_required
def package_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            pkg = DesignPackage.objects.create(
                name=name,
                link=request.POST.get("link", ""),
            )
            return JsonResponse({"success": True, "message": _("Package created successfully."), "redirect_url": reverse("dash:package_detail", args=[pkg.pk])})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:package_list")


@admin_required
def package_update(request, pk):
    obj = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.link = request.POST.get("link", obj.link)
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Package updated successfully."), "redirect_url": reverse("dash:package_detail", args=[obj.pk])})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:package_list")


@admin_required
def package_detail(request, pk):
    pkg = get_object_or_404(DesignPackage.objects.prefetch_related("package_services__option__category"), pk=pk)
    return render(request, "dashboard/design/package_detail.html", {
        "pkg": pkg,
    })


@admin_required
def package_option_add(request, pk):
    pkg = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            return JsonResponse({"success": False, "errors": [_("Option name is required.")]})
        description = request.POST.get("description", "")
        try:
            opt = _create_option(name=name, description=description)
            opt_price = Decimal(request.POST.get("price", "0") or "0")
            ps = PackageService.objects.create(package=pkg, option=opt, price=opt_price)
            opt_count = pkg.package_services.count()
            return JsonResponse({
                "success": True,
                "message": _("Option added."),
                "option": {
                    "id": opt.pk,
                    "name": opt.name,
                    "description": opt.description,
                },
                "price": str(ps.price),
                "option_count": opt_count,
                "new_package_total": str(pkg.total_price),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def package_option_update(request, pk, opt_pk):
    pkg = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            return JsonResponse({"success": False, "errors": [_("Option name is required.")]})
        try:
            ps = pkg.package_services.get(option_id=opt_pk)
            ps.option.name = name
            ps.option.description = request.POST.get("description", "")
            ps.option.save()
            ps.price = Decimal(request.POST.get("price", "0") or "0")
            ps.save()
            return JsonResponse({
                "success": True,
                "message": _("Option updated."),
                "option": {
                    "id": ps.option_id,
                    "name": ps.option.name,
                    "description": ps.option.description,
                },
                "price": str(ps.price),
                "option_count": pkg.package_services.count(),
                "new_package_total": str(pkg.total_price),
            })
        except PackageService.DoesNotExist:
            return JsonResponse({"success": False, "errors": [_("This option is not part of the package.")]})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def package_option_delete(request, pk, opt_pk):
    pkg = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        try:
            pkg.package_services.filter(option_id=opt_pk).delete()
            DesignOption.objects.filter(pk=opt_pk, packages=None).delete()
            opt_count = pkg.package_services.count()
            return JsonResponse({"success": True, "message": _("Option removed."), "option_count": opt_count, "new_package_total": str(pkg.total_price)})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def package_delete(request, pk):
    obj = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Package deleted successfully."), "redirect_url": reverse("dash:package_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def package_set_default(request, pk):
    obj = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        action = request.POST.get("action")
        try:
            with transaction.atomic():
                if action == "set":
                    obj.is_default = True
                    obj.save()
                    message = _("“%(name)s” is now the default package.") % {"name": obj.name}
                else:
                    obj.is_default = False
                    obj.save(update_fields=["is_default"])
                    message = _("“%(name)s” is no longer the default package.") % {"name": obj.name}
            return JsonResponse({
                "success": True,
                "message": message,
                "is_default": obj.is_default,
                "default_pk": obj.pk if obj.is_default else None,
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})
