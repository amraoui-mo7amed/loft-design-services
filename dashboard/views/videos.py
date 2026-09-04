import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.utils.translation import gettext as _

from ..decorator import admin_required, with_pagination
from ..models import Video
from ..utils import humanize_error


def _get_roles_by_placement():
    return {
        Video.Placement.SERVICE_INFO: [
            {"value": Video.Role.SERVICE_DESIGN, "label": str(_("Design (Usage & optimisation)"))},
            {"value": Video.Role.SERVICE_360, "label": str(_("360° (Visite immersive)"))},
            {"value": Video.Role.SERVICE_VR, "label": str(_("VR (Immersion à l’échelle)"))},
            {"value": Video.Role.SERVICE_BILNOV, "label": str(_("Bilnov (Projet collaboratif)"))},
            {"value": Video.Role.SERVICE_STORE, "label": str(_("Store Bilnov (Produits · 3D · AR · budget)"))},
        ],
        Video.Placement.INFO_CARD: [
            {"value": Video.Role.INFO_USAGE, "label": str(_("Usage réel"))},
            {"value": Video.Role.INFO_OPTIMIZATION, "label": str(_("Optimisation"))},
            {"value": Video.Role.INFO_SMART_LIVING, "label": str(_("Smart living"))},
            {"value": Video.Role.INFO_IMMERSION, "label": str(_("Immersion"))},
        ],
        Video.Placement.VIDEOS: [
            {"value": Video.Role.VIDEOS_RAIL, "label": str(_("Videos Section (#videos)"))},
        ],
    }


@admin_required
@with_pagination(per_page=12, template="dashboard/admin/video_list", queryset_name="videos")
def video_list(request):
    queryset = Video.objects.all().order_by("-created_at")
    query = request.GET.get("q", "").strip()
    placement_filter = request.GET.get("placement", "").strip()

    if query:
        queryset = queryset.filter(title__icontains=query)
    if placement_filter:
        queryset = queryset.filter(placement=placement_filter)

    return {
        "videos": queryset,
        "query": query,
        "placement_filter": placement_filter,
        "placement_choices": Video.Placement.choices,
        "role_choices": Video.Role.choices,
        "roles_by_placement_json": json.dumps(_get_roles_by_placement()),
        "title": _("Videos"),
    }


@admin_required
def video_create(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        link = request.POST.get("link", "").strip()
        url = request.POST.get("url", "").strip()
        description = request.POST.get("description", "").strip()
        placement = request.POST.get("placement", Video.Placement.VIDEOS).strip()
        role = request.POST.get("role", Video.Role.VIDEOS_RAIL).strip()

        if not title:
            return JsonResponse({"success": False, "errors": [_("Title is required.")]})

        if placement not in Video.Placement.values:
            placement = Video.Placement.VIDEOS
        if role not in Video.Role.values:
            role = Video.Role.VIDEOS_RAIL

        try:
            video = Video.objects.create(
                title=title,
                link=link,
                url=url,
                description=description,
                placement=placement,
                role=role,
            )
            return JsonResponse({
                "success": True,
                "message": _("Video created successfully."),
                "redirect_url": reverse("dash:video_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    return render(request, "dashboard/admin/video_form.html", {
        "video": None,
        "placement_choices": Video.Placement.choices,
        "role_choices": Video.Role.choices,
        "roles_by_placement_json": json.dumps(_get_roles_by_placement()),
        "title": _("New Video"),
    })


@admin_required
def video_update(request, pk):
    video = get_object_or_404(Video, pk=pk)

    if request.method == "POST":
        video.title = request.POST.get("title", "").strip()
        video.link = request.POST.get("link", "").strip()
        video.url = request.POST.get("url", "").strip()
        video.description = request.POST.get("description", "").strip()
        placement = request.POST.get("placement", video.placement).strip()
        role = request.POST.get("role", video.role).strip()

        if not video.title:
            return JsonResponse({"success": False, "errors": [_("Title is required.")]})

        if placement in Video.Placement.values:
            video.placement = placement
        if role in Video.Role.values:
            video.role = role

        try:
            video.save()
            return JsonResponse({
                "success": True,
                "message": _("Video updated successfully."),
                "redirect_url": reverse("dash:video_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    return render(request, "dashboard/admin/video_form.html", {
        "video": video,
        "placement_choices": Video.Placement.choices,
        "role_choices": Video.Role.choices,
        "roles_by_placement_json": json.dumps(_get_roles_by_placement()),
        "title": _("Edit Video"),
    })


@admin_required
def video_delete(request, pk):
    if request.method == "POST":
        video = get_object_or_404(Video, pk=pk)
        try:
            title = video.title
            video.delete()
            return JsonResponse({"success": True, "message": _("Video “%(title)s” deleted.") % {"title": title}})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:video_list")