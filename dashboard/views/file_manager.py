import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _

from ..models import DesignRequest, DesignRequestFile


def get_file_path(project_uuid, category, filename):
    return f"design-requests/{project_uuid}/{category}/{filename}"


@login_required
@require_POST
def upload_file(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid)
    can_access = (
        request.user == project.client
        or request.user == project.designer
        or request.user.is_superuser
    )
    if not can_access:
        return JsonResponse({"success": False, "errors": [_("Access denied.")]})

    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"success": False, "errors": [_("No file provided.")]})

    ext = file.name.split(".")[-1].lower() if "." in file.name else ""
    allowed = {"pdf", "dwg", "dxf", "skp", "glb", "zip", "png", "jpg", "jpeg", "gif", "webp", "mp4", "mov", "avi"}
    if ext not in allowed:
        return JsonResponse({"success": False, "errors": [_("File type not supported.")]})

    DesignRequestFile.objects.create(
        design_request=project,
        file=file,
        file_type=ext,
        uploaded_by=request.user,
    )

    return JsonResponse({"success": True, "message": _("File uploaded successfully.")})


@login_required
def list_files(request, uuid):
    project = get_object_or_404(DesignRequest, uuid=uuid)
    can_access = (
        request.user == project.client
        or request.user == project.designer
        or request.user.is_superuser
    )
    if not can_access:
        return JsonResponse({"success": False, "errors": [_("Access denied.")]})

    files = project.files.all()
    data = []
    for f in files:
        data.append({
            "id": f.id,
            "name": os.path.basename(f.file.name),
            "file_type": f.file_type,
            "url": f.file.url if f.file else "",
            "uploaded_by": f.uploaded_by.get_full_name() or f.uploaded_by.username if f.uploaded_by else "",
            "uploaded_at": f.uploaded_at.isoformat(),
        })
    return JsonResponse({"data": data})
