from decimal import Decimal

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db import transaction

from ..utils import humanize_error
from ..decorator import admin_required, with_pagination
from ..models import (
    ProjectType,
    SpaceCategory,
    Space,
    ProjectTypeSpace,
    DesignPackage,
    PackageService,
    ServiceCategory,
    DesignOption,
    StyleCategory,
    InspirationImage,
)


def _create_option(name, price, category_id, description="", delivery_time_days=1):
    base_slug = slugify(name)
    if not base_slug:
        base_slug = "option"
    slug = base_slug
    counter = 1
    while DesignOption.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return DesignOption.objects.create(
        name=name, slug=slug, price=price,
        category_id=category_id, description=description,
        delivery_time_days=delivery_time_days,
    )


# ──────────────────────────────────────────────
# Project Type CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/project_type_list", queryset_name="project_types")
def project_type_list(request):
    queryset = ProjectType.objects.all()
    return { "project_types": queryset }


@admin_required
def project_type_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description", "")
        image = request.FILES.get("image")
        sort_order = request.POST.get("sort_order", 0)
        active = request.POST.get("active") == "on"
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            ProjectType.objects.create(
                name=name, description=description, image=image,
                sort_order=sort_order, active=active,
            )
            return JsonResponse({"success": True, "message": _("Project type created successfully."), "redirect_url": reverse("dash:project_type_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/project_type_form.html", {"form_title": _("New Project Type")})


@admin_required
def project_type_update(request, pk):
    obj = get_object_or_404(ProjectType, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.description = request.POST.get("description", obj.description)
        if request.FILES.get("image"):
            obj.image = request.FILES["image"]
        obj.sort_order = request.POST.get("sort_order", obj.sort_order)
        obj.active = request.POST.get("active") == "on"
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
# Space Category CRUD
# ──────────────────────────────────────────────

@admin_required
def space_category_list(request):
    categories = SpaceCategory.objects.all().order_by("name")
    data = [{"id": c.id, "name": c.name, "description": c.description, "space_count": c.spaces.count()} for c in categories]
    return JsonResponse({"categories": data})


@admin_required
def space_category_create(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        description = request.POST.get("description", "").strip()
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            SpaceCategory.objects.create(name=name, description=description)
            return JsonResponse({"success": True, "message": _("Category created successfully.")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_update(request, pk):
    obj = get_object_or_404(SpaceCategory, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name).strip()
        obj.description = request.POST.get("description", obj.description).strip()
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Category updated successfully.")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def space_category_delete(request, pk):
    obj = get_object_or_404(SpaceCategory, pk=pk)
    if request.method == "POST":
        try:
            name = obj.name
            obj.delete()
            return JsonResponse({"success": True, "message": _("Category \"%(name)s\" deleted.") % {"name": name}})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Space CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/space_list", queryset_name="spaces")
def space_list(request):
    queryset = Space.objects.select_related("space_category").all()
    categories = SpaceCategory.objects.all().order_by("name")
    category_choices = [("", _("No Category"))] + [(c.pk, c.name) for c in categories]
    return {"spaces": queryset, "categories": categories, "category_choices": category_choices}


@admin_required
def space_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        category = request.POST.get("category", "")
        space_category_id = request.POST.get("space_category_id") or None
        base_price = request.POST.get("base_price", 0)
        estimated_days = request.POST.get("estimated_days", 1)
        image = request.FILES.get("image")
        active = request.POST.get("active") == "on"
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            Space.objects.create(
                name=name, category=category, space_category_id=space_category_id,
                base_price=base_price, estimated_days=estimated_days, image=image, active=active,
            )
            return JsonResponse({"success": True, "message": _("Space created successfully."), "redirect_url": reverse("dash:space_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/space_form.html", {"form_title": _("New Space")})


@admin_required
def space_update(request, pk):
    obj = get_object_or_404(Space, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.category = request.POST.get("category", obj.category)
        space_category_id = request.POST.get("space_category_id") or None
        obj.space_category_id = space_category_id
        obj.base_price = request.POST.get("base_price", obj.base_price)
        obj.estimated_days = request.POST.get("estimated_days", obj.estimated_days)
        if request.FILES.get("image"):
            obj.image = request.FILES["image"]
        obj.active = request.POST.get("active") == "on"
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Space updated successfully."), "redirect_url": reverse("dash:space_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/space_form.html", {"form_title": _("Edit Space"), "object": obj})


@admin_required
def space_delete(request, pk):
    obj = get_object_or_404(Space, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Space deleted successfully."), "redirect_url": reverse("dash:space_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Design Package CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/package_list", queryset_name="packages")
def package_list(request):
    queryset = DesignPackage.objects.prefetch_related("package_services__option__category").all()
    categories = ServiceCategory.objects.all().order_by("name")
    category_choices = [("", _("Category"))] + [(c.pk, c.name) for c in categories]
    return {"packages": queryset, "categories": categories, "category_choices": category_choices}


@admin_required
def package_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description", "")
        active = request.POST.get("active") == "on"
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            pkg = DesignPackage.objects.create(
                name=name, description=description,
                active=active,
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
        obj.description = request.POST.get("description", obj.description)
        obj.active = request.POST.get("active") == "on"
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Package updated successfully."), "redirect_url": reverse("dash:package_detail", args=[obj.pk])})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:package_list")


@admin_required
def package_detail(request, pk):
    pkg = get_object_or_404(DesignPackage.objects.prefetch_related("package_services__option__category"), pk=pk)
    categories = ServiceCategory.objects.all().order_by("name")
    category_choices = [("", _("Category"))] + [(c.pk, c.name) for c in categories]
    return render(request, "dashboard/design/package_detail.html", {
        "pkg": pkg,
        "categories": categories,
        "category_choices": category_choices,
    })


@admin_required
def package_option_add(request, pk):
    pkg = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            return JsonResponse({"success": False, "errors": [_("Option name is required.")]})
        price = request.POST.get("price", 0)
        category_id = request.POST.get("category_id") or None
        description = request.POST.get("description", "")
        delivery_time_days = request.POST.get("delivery_time_days", 1)
        try:
            opt = _create_option(name=name, price=price, category_id=category_id, description=description, delivery_time_days=delivery_time_days)
            ps = PackageService.objects.create(package=pkg, option=opt, price=opt.price)
            opt_count = pkg.package_services.count()
            return JsonResponse({
                "success": True,
                "message": _("Option added."),
                "option": {
                    "id": opt.pk,
                    "name": opt.name,
                    "price": str(opt.price),
                    "delivery_time_days": opt.delivery_time_days,
                    "category_name": opt.category.name if opt.category else "",
                    "description": opt.description,
                },
                "option_count": opt_count,
            })
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
            return JsonResponse({"success": True, "message": _("Option removed."), "option_count": opt_count})
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


# ──────────────────────────────────────────────
# Service Category CRUD
# ──────────────────────────────────────────────

@admin_required
def service_category_list(request):
    categories = ServiceCategory.objects.all().order_by("name")
    data = [{"id": c.id, "name": c.name, "description": c.description, "option_count": c.design_options.count()} for c in categories]
    return JsonResponse({"categories": data})


@admin_required
def service_category_create(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        description = request.POST.get("description", "").strip()
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            ServiceCategory.objects.create(name=name, description=description)
            return JsonResponse({"success": True, "message": _("Category created successfully.")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def service_category_update(request, pk):
    obj = get_object_or_404(ServiceCategory, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name).strip()
        obj.description = request.POST.get("description", obj.description).strip()
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Category updated successfully.")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def service_category_delete(request, pk):
    obj = get_object_or_404(ServiceCategory, pk=pk)
    if request.method == "POST":
        try:
            name = obj.name
            obj.delete()
            return JsonResponse({"success": True, "message": _("Category \"%(name)s\" deleted.") % {"name": name}})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})





# ──────────────────────────────────────────────
# Style Category CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/style_list", queryset_name="styles")
def style_list(request):
    queryset = StyleCategory.objects.all()
    return {"styles": queryset}


@admin_required
def style_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description", "")
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            StyleCategory.objects.create(name=name, description=description)
            return JsonResponse({"success": True, "message": _("Style created successfully."), "redirect_url": reverse("dash:style_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/style_form.html", {"form_title": _("New Style")})


@admin_required
def style_update(request, pk):
    obj = get_object_or_404(StyleCategory, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.description = request.POST.get("description", obj.description)
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Style updated successfully."), "redirect_url": reverse("dash:style_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/style_form.html", {"form_title": _("Edit Style"), "object": obj})


@admin_required
def style_delete(request, pk):
    obj = get_object_or_404(StyleCategory, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Style deleted successfully."), "redirect_url": reverse("dash:style_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# ──────────────────────────────────────────────
# Inspiration Image CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/inspiration_list", queryset_name="inspirations")
def inspiration_list(request):
    queryset = InspirationImage.objects.select_related("space", "style_category").all()
    spaces_qs = Space.objects.filter(active=True)
    styles_qs = StyleCategory.objects.all()
    return {
        "inspirations": queryset,
        "spaces": spaces_qs,
        "styles": styles_qs,
        "space_choices": [("", _("Select Space"))] + [(s.pk, s.name) for s in spaces_qs],
        "style_choices": [("", _("Select Style"))] + [(s.pk, s.name) for s in styles_qs],
    }


@admin_required
def inspiration_create(request):
    if request.method == "POST":
        space_id = request.POST.get("space_id")
        style_id = request.POST.get("style_id")
        title = request.POST.get("title", "")
        active = request.POST.get("active") == "on"
        image = request.FILES.get("image")
        if not space_id or not style_id or not image:
            return JsonResponse({"success": False, "errors": [_("Space, style, and image are required.")]})
        try:
            InspirationImage.objects.create(
                space_id=space_id, style_category_id=style_id, title=title, image=image, active=active
            )
            return JsonResponse({"success": True, "message": _("Inspiration image created successfully."), "redirect_url": reverse("dash:inspiration_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    spaces_qs = Space.objects.filter(active=True)
    styles_qs = StyleCategory.objects.all()
    return render(request, "dashboard/design/inspiration_form.html", {
        "form_title": _("New Inspiration Image"),
        "spaces": spaces_qs,
        "styles": styles_qs,
        "space_choices": [("", _("Select Space"))] + [(s.pk, s.name) for s in spaces_qs],
        "style_choices": [("", _("Select Style"))] + [(s.pk, s.name) for s in styles_qs],
    })


@admin_required
def inspiration_update(request, pk):
    obj = get_object_or_404(InspirationImage, pk=pk)
    if request.method == "POST":
        obj.space_id = request.POST.get("space_id", obj.space_id)
        obj.style_category_id = request.POST.get("style_id", obj.style_category_id)
        obj.title = request.POST.get("title", obj.title)
        obj.active = request.POST.get("active") == "on"
        if request.FILES.get("image"):
            obj.image = request.FILES["image"]
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Inspiration image updated successfully."), "redirect_url": reverse("dash:inspiration_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    spaces_qs = Space.objects.filter(active=True)
    styles_qs = StyleCategory.objects.all()
    return render(request, "dashboard/design/inspiration_form.html", {
        "form_title": _("Edit Inspiration Image"),
        "object": obj,
        "spaces": spaces_qs,
        "styles": styles_qs,
        "space_choices": [("", _("Select Space"))] + [(s.pk, s.name) for s in spaces_qs],
        "style_choices": [("", _("Select Style"))] + [(s.pk, s.name) for s in styles_qs],
    })


@admin_required
def inspiration_delete(request, pk):
    obj = get_object_or_404(InspirationImage, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Inspiration image deleted successfully."), "redirect_url": reverse("dash:inspiration_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})
