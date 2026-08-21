import json
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from dashboard.models import (
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    ProjectTypeSpace,
    ProjectGalleryInvitation,
    DesignRequestGalleryImage,
    DesignActivityLog,
)
from dashboard.utils import notify_user, humanize_error
from frontend.utils import build_gallery_data


def space_gallery(request, space_pk=None):
    """Render gallery for a single space or all spaces with search & filter options."""
    q = request.GET.get("q", "").strip()
    selected_space_ids = request.GET.getlist("spaces")
    space_param = request.GET.get("space")
    if not space_pk and space_param and space_param.isdigit():
        space_pk = int(space_param)

    spaces = Space.objects.prefetch_related("categories__images").order_by("name")
    active_space = None

    if space_pk:
        active_space = get_object_or_404(Space, pk=space_pk)
        images = (
            SpaceCategoryImages.objects.filter(category__space=active_space)
            .select_related("category", "category__space")
            .order_by("-is_default", "id")
        )
        if q:
            images = images.filter(
                Q(tags__icontains=q)
                | Q(description__icontains=q)
                | Q(category__category_name__icontains=q)
            )
    elif q or selected_space_ids:
        images = SpaceCategoryImages.objects.all().select_related("category", "category__space").order_by("-is_default", "id")
        if q:
            images = images.filter(
                Q(tags__icontains=q)
                | Q(description__icontains=q)
                | Q(category__category_name__icontains=q)
                | Q(category__space__name__icontains=q)
            )
        if selected_space_ids:
            images = images.filter(category__space_id__in=selected_space_ids)
    else:
        # Collect default/featured image of each space
        featured_img_ids = []
        for sp in spaces:
            thumb_img = None
            for cat in sp.categories.all():
                def_img = cat.images.filter(is_default=True).first()
                if def_img:
                    thumb_img = def_img
                    break
                if not thumb_img:
                    thumb_img = cat.images.first()
            if thumb_img:
                featured_img_ids.append(thumb_img.pk)

        images = (
            SpaceCategoryImages.objects.filter(pk__in=featured_img_ids)
            .select_related("category", "category__space")
            .order_by("category__space__name")
        )

    gallery_data = build_gallery_data(spaces)

    context = {
        "space": active_space,
        "active_space": active_space,
        "spaces": spaces,
        "images": images,
        "q": q,
        "selected_spaces": [int(x) for x in selected_space_ids if x.isdigit()],
        "is_single_space": bool(active_space),
        "gallery_data_json": json.dumps(gallery_data),
        "initial_space_id": (active_space.slug or str(active_space.id)) if active_space else (spaces[0].slug if spaces.exists() else ""),
    }
    return render(request, "gallery.html", context)


def client_gallery_selection(request, token):
    """Render inspiration gallery selection interface for a client invitation token."""
    invitation = get_object_or_404(
        ProjectGalleryInvitation.objects.select_related("design_request__project_type", "design_request__client"),
        token=token,
    )
    project = invitation.design_request

    # If already submitted, show confirmation & preview
    if invitation.is_used:
        selected_gallery = project.gallery_selections.select_related(
            "space_image__category__space"
        ).all()
        return render(
            request,
            "gallery_client_submitted.html",
            {
                "invitation": invitation,
                "project": project,
                "selected_gallery": selected_gallery,
            },
        )

    # Render only the spaces that the user chose while submitting the project
    chosen_space_ids = project.spaces.values_list("space_id", flat=True).distinct()
    spaces = (
        Space.objects.filter(id__in=chosen_space_ids)
        .prefetch_related("categories__images")
        .distinct()
    )

    # Fallback to project type spaces if no spaces were attached to project
    if not spaces.exists():
        if project.project_type:
            spaces = (
                Space.objects.filter(project_types__project_type=project.project_type)
                .prefetch_related("categories__images")
                .distinct()
            )
        if not spaces.exists():
            spaces = Space.objects.prefetch_related("categories__images").all()

    # Handle active space filter
    space_pk = request.GET.get("space")
    active_space = None
    if space_pk and str(space_pk).isdigit():
        active_space = spaces.filter(pk=int(space_pk)).first()

    # Search filter
    q = request.GET.get("q", "").strip()

    if active_space:
        images_qs = SpaceCategoryImages.objects.filter(category__space=active_space)
    else:
        images_qs = SpaceCategoryImages.objects.filter(category__space__in=spaces)

    if q:
        images_qs = images_qs.filter(
            Q(category__category_name__icontains=q)
            | Q(description__icontains=q)
            | Q(tags__icontains=q)
            | Q(reference__icontains=q)
            | Q(category__space__name__icontains=q)
        )

    images = (
        images_qs.select_related("category", "category__space")
        .order_by("category__space__name", "-is_default", "id")
        .distinct()
    )

    gallery_data = build_gallery_data(spaces)

    return render(
        request,
        "gallery_client_select.html",
        {
            "invitation": invitation,
            "project": project,
            "spaces": spaces,
            "active_space": active_space,
            "images": images,
            "q": q,
            "gallery_data_json": json.dumps(gallery_data),
            "initial_space_id": (active_space.slug or str(active_space.id)) if active_space else (spaces[0].slug if spaces.exists() else ""),
        },
    )


def submit_client_gallery_selection(request, token):
    """Process client submission of chosen moodboard inspiration images."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})

    invitation = get_object_or_404(
        ProjectGalleryInvitation.objects.select_related("design_request"),
        token=token,
    )

    if invitation.is_used:
        return JsonResponse({
            "success": False,
            "errors": [_("This gallery selection link has already been submitted.")],
        })

    project = invitation.design_request

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else request.POST
        image_ids = data.get("image_ids", [])
        if isinstance(image_ids, str):
            image_ids = [int(x.strip()) for x in image_ids.split(",") if x.strip().isdigit()]
        elif isinstance(image_ids, list):
            image_ids = [int(x) for x in image_ids if str(x).isdigit()]

        if not image_ids:
            return JsonResponse({
                "success": False,
                "errors": [_("Please select at least one inspiration image before submitting.")],
            })

        notes = data.get("notes", "").strip()

        with transaction.atomic():
            images_to_add = SpaceCategoryImages.objects.filter(id__in=image_ids)
            for img_obj in images_to_add:
                DesignRequestGalleryImage.objects.get_or_create(
                    design_request=project,
                    space_image=img_obj,
                    defaults={"notes": notes},
                )

            invitation.is_used = True
            invitation.used_at = timezone.now()
            invitation.save(update_fields=["is_used", "used_at"])

            # Activity log
            DesignActivityLog.objects.create(
                design_request=project,
                action=_("Gallery Moodboard Submitted"),
                description=f"Client submitted {len(image_ids)} gallery inspiration images.",
            )

            # Realtime Notification to Admins
            UserModel = get_user_model()
            admins = UserModel.objects.filter(
                Q(is_superuser=True) | Q(profile__role="admin")
            ).distinct()

            for adm in admins:
                try:
                    notify_user(
                        user=adm,
                        title=str(_("Gallery Selected: %(num)s") % {"num": project.project_number}),
                        message=f"{project.contact_name} submitted {len(image_ids)} gallery inspiration images for {project.project_name}.",
                        notification_type="gallery",
                        link=reverse("dash:admin_project_detail", args=[project.pk]),
                    )
                except Exception:
                    pass

        return JsonResponse({
            "success": True,
            "message": str(_("Your inspiration gallery has been received! Our architects will incorporate them into your concept.")),
            "redirect_url": reverse("frontend:gallery_client_selection", kwargs={"token": str(invitation.token)}),
        })

    except Exception as e:
        return JsonResponse({"success": False, "errors": [humanize_error(e)]})
