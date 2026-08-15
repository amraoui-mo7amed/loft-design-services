from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.utils.translation import gettext as _

from ..decorator import admin_required, with_pagination
from ..models import Video
from ..utils import humanize_error


@admin_required
@with_pagination(per_page=12, template="dashboard/admin/video_list", queryset_name="videos")
def video_list(request):
    queryset = Video.objects.all().order_by("-created_at")
    query = request.GET.get("q", "").strip()
    if query:
        queryset = queryset.filter(title__icontains=query)
    return {
        "videos": queryset,
        "query": query,
        "title": _("Videos"),
    }


@admin_required
def video_create(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        link = request.POST.get("link", "").strip()
        url = request.POST.get("url", "").strip()
        description = request.POST.get("description", "").strip()

        if not title:
            return JsonResponse({"success": False, "errors": [_("Title is required.")]})

        try:
            video = Video.objects.create(title=title, link=link, url=url, description=description)
            return JsonResponse({
                "success": True,
                "message": _("Video created successfully."),
                "redirect_url": reverse("dash:video_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    return render(request, "dashboard/admin/video_form.html", {
        "video": None,
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

        if not video.title:
            return JsonResponse({"success": False, "errors": [_("Title is required.")]})

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