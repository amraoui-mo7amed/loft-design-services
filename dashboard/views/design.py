from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from ..utils import humanize_error
from ..decorator import admin_required, with_pagination
from ..models import (
    ProjectType,
    SpaceCategory,
    Space,
    ProjectTypeSpace,
    DesignPackage,
    DesignOption,
    StyleCategory,
    InspirationImage,
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
    queryset = DesignPackage.objects.all()
    return {"packages": queryset}


@admin_required
def package_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description", "")
        price_multiplier = request.POST.get("price_multiplier", 1.0)
        active = request.POST.get("active") == "on"
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            DesignPackage.objects.create(name=name, description=description, price_multiplier=price_multiplier, active=active)
            return JsonResponse({"success": True, "message": _("Package created successfully."), "redirect_url": reverse("dash:package_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/package_form.html", {"form_title": _("New Package")})


@admin_required
def package_update(request, pk):
    obj = get_object_or_404(DesignPackage, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.description = request.POST.get("description", obj.description)
        obj.price_multiplier = request.POST.get("price_multiplier", obj.price_multiplier)
        obj.active = request.POST.get("active") == "on"
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Package updated successfully."), "redirect_url": reverse("dash:package_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/package_form.html", {"form_title": _("Edit Package"), "object": obj})


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
# Design Option CRUD
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=12, template="dashboard/design/option_list", queryset_name="options")
def option_list(request):
    queryset = DesignOption.objects.all()
    return {"options": queryset}


@admin_required
def option_create(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description", "")
        price = request.POST.get("price", 0)
        category = request.POST.get("category", "")
        active = request.POST.get("active") == "on"
        if not name:
            return JsonResponse({"success": False, "errors": [_("Name is required.")]})
        try:
            DesignOption.objects.create(name=name, description=description, price=price, category=category, active=active)
            return JsonResponse({"success": True, "message": _("Option created successfully."), "redirect_url": reverse("dash:option_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/option_form.html", {"form_title": _("New Option")})


@admin_required
def option_update(request, pk):
    obj = get_object_or_404(DesignOption, pk=pk)
    if request.method == "POST":
        obj.name = request.POST.get("name", obj.name)
        obj.description = request.POST.get("description", obj.description)
        obj.price = request.POST.get("price", obj.price)
        obj.category = request.POST.get("category", obj.category)
        obj.active = request.POST.get("active") == "on"
        try:
            obj.save()
            return JsonResponse({"success": True, "message": _("Option updated successfully."), "redirect_url": reverse("dash:option_list")})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return render(request, "dashboard/design/option_form.html", {"form_title": _("Edit Option"), "object": obj})


@admin_required
def option_delete(request, pk):
    obj = get_object_or_404(DesignOption, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
            return JsonResponse({"success": True, "message": _("Option deleted successfully."), "redirect_url": reverse("dash:option_list")})
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
