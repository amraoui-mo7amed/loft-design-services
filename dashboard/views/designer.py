from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db import transaction

from ..decorator import designer_required
from ..models import DesignRequest, DesignDeliverable, DesignNote, DesignRevision


@login_required
def designer_projects(request):
    projects = DesignRequest.objects.filter(designer=request.user).select_related("client", "project_type", "package").order_by("-created_at")
    paginator = Paginator(projects, 12)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "dashboard/designer/project_list.html", {
        "projects": page_obj,
        "page_obj": page_obj,
    })


@login_required
def designer_project_detail(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid, designer=request.user)
    deliverables = project.deliverables.all()
    notes = project.notes.filter(is_internal=True).select_related("author")
    revisions = project.revisions.all()
    return render(request, "dashboard/designer/project_detail.html", {
        "project": project,
        "deliverables": deliverables,
        "notes": notes,
        "revisions": revisions,
    })


@login_required
def upload_deliverable(request, uuid):
    if request.method == "POST":
        project = get_object_or_404(DesignRequest, uuid=uuid, designer=request.user)
        title = request.POST.get("title", "Deliverable")
        file = request.FILES.get("file")
        if not file:
            return JsonResponse({"success": False, "errors": ["File is required."]})
        ext = file.name.split(".")[-1].lower() if "." in file.name else ""
        DesignDeliverable.objects.create(
            design_request=project,
            title=title,
            file=file,
            file_type=ext,
            uploaded_by=request.user,
        )
        return JsonResponse({"success": True, "message": "Deliverable uploaded successfully."})
    return JsonResponse({"success": False, "errors": ["Invalid request."]})


@login_required
def add_note(request, uuid):
    if request.method == "POST":
        project = get_object_or_404(DesignRequest, uuid=uuid, designer=request.user)
        note_text = request.POST.get("note", "")
        if note_text:
            DesignNote.objects.create(
                design_request=project,
                author=request.user,
                note=note_text,
                is_internal=True,
            )
            return JsonResponse({"success": True, "message": "Note added."})
        return JsonResponse({"success": False, "errors": ["Note is empty."]})
    return JsonResponse({"success": False, "errors": ["Invalid request."]})
