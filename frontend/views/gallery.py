import json
from decimal import Decimal
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
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        phone = data.get("phone", "").strip()
        wilaya = data.get("wilaya", "").strip()
        commune = data.get("commune", "").strip()

        with transaction.atomic():
            images_to_add = SpaceCategoryImages.objects.filter(id__in=image_ids)
            for img_obj in images_to_add:
                DesignRequestGalleryImage.objects.get_or_create(
                    design_request=project,
                    space_image=img_obj,
                    defaults={"notes": notes},
                )

            # Update client and project details if provided
            update_fields = []
            if first_name and not project.first_name:
                project.first_name = first_name
                update_fields.append("first_name")
            if last_name and not project.last_name:
                project.last_name = last_name
                update_fields.append("last_name")
            if phone:
                project.phone = phone
                update_fields.append("phone")
            if wilaya:
                project.wilaya = wilaya
                update_fields.append("wilaya")
            if commune:
                project.commune = commune
                update_fields.append("commune")
            if notes:
                if project.message:
                    project.message += f"\n\n[Inspirations Moodboard]: {notes}"
                else:
                    project.message = notes
                update_fields.append("message")

            if update_fields:
                project.save(update_fields=update_fields)

            invitation.is_used = True
            invitation.used_at = timezone.now()
            invitation.save(update_fields=["is_used", "used_at"])

            # Activity log
            DesignActivityLog.objects.create(
                design_request=project,
                action=_("Gallery Moodboard Submitted"),
                description=f"Client submitted {len(image_ids)} gallery inspiration images and updated project details.",
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
        return JsonResponse({"success": False, "errors": humanize_error(e)})


def submit_public_gallery_selection(request):
    """Process public submission of chosen inspiration images/categories from the gallery."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Method not allowed.")]})

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else request.POST
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        notes = data.get("notes", "").strip()
        items = data.get("items", [])

        if not email:
            return JsonResponse({"success": False, "errors": [_("L'adresse e-mail est obligatoire.")]})

        if not items:
            return JsonResponse({"success": False, "errors": [_("Veuillez sélectionner au moins une inspiration.")]})

        from dashboard.models import (
            Lead,
            Contact,
            DesignRequest,
            DesignRequestFloor,
            DesignRequestSpace,
            DesignRequestGalleryImage,
            DesignActivityLog,
            SpaceCategory,
            SpaceCategoryImages,
            Space,
        )

        with transaction.atomic():
            name_parts = name.split(None, 1) if name else ["Client", "Galerie"]
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            lead = Lead.objects.filter(email=email).first()
            if not lead:
                lead = Lead.objects.create(
                    email=email,
                    name=name or "Client Galerie",
                )

            items_str = ", ".join(str(x) for x in items)
            contact = Contact.objects.create(
                name=name or email,
                email=email,
                phone=phone,
                message=f"Sélection galerie ({len(items)} éléments) : {items_str}. Observations : {notes}",
            )

            client_user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
            project = DesignRequest.objects.create(
                client=client_user,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                project_name=f"Inspirations Galerie - {name or email}",
                status=DesignRequest.Status.PENDING,
                message=f"Sélection de {len(items)} inspirations depuis la galerie.\nNotes client: {notes}" if notes else f"Sélection de {len(items)} inspirations depuis la galerie.",
                mode="gallery",
                total_surface=Decimal("0.00"),
                surface_interior=Decimal("0.00"),
                surface_exterior=Decimal("0.00"),
                floors_above=0,
                floors_below=0,
                has_terrace=False,
                has_garden=False,
                total=Decimal("0.00"),
            )

            # Link spaces and images to the project
            floor = None
            for item in items:
                cat = None
                target_space = None
                cat_name = ""

                if isinstance(item, dict):
                    item_id = str(item.get("id", "")).strip()
                    item_name = str(item.get("name", "")).strip()
                    space_id = str(item.get("spaceId", "")).strip()
                    space_name = str(item.get("spaceName", "")).strip()
                    cat_name = item_name

                    cat = SpaceCategory.objects.filter(
                        Q(category_name__iexact=item_name)
                        | Q(category_name__icontains=item_name)
                        | Q(id=int(item_id) if item_id.isdigit() else 0)
                    ).select_related("space").first()

                    if not cat and space_id:
                        target_space = Space.objects.filter(
                            Q(slug=space_id)
                            | Q(name__iexact=space_name)
                            | Q(id=int(space_id) if space_id.isdigit() else 0)
                        ).first()
                else:
                    item_str = str(item).strip()
                    cat_name = item_str
                    cat = SpaceCategory.objects.filter(
                        Q(category_name__iexact=item_str)
                        | Q(category_name__icontains=item_str)
                        | Q(id=int(item_str) if item_str.isdigit() else 0)
                    ).select_related("space").first()

                    if not cat and " - " in item_str:
                        parts = item_str.split(" - ", 1)
                        target_space = Space.objects.filter(
                            Q(name__iexact=parts[0].strip()) | Q(slug__iexact=parts[0].strip())
                        ).first()
                        if target_space:
                            cat = SpaceCategory.objects.filter(
                                space=target_space,
                                category_name__icontains=parts[1].strip(),
                            ).first()

                space_obj = (cat.space if cat else target_space)
                if not space_obj and Space.objects.exists():
                    for s in Space.objects.all():
                        if s.name.lower() in cat_name.lower():
                            space_obj = s
                            break

                if not space_obj and Space.objects.exists():
                    space_obj = Space.objects.first()

                if not space_obj:
                    space_title = (
                        item.get("spaceName") if isinstance(item, dict) and item.get("spaceName")
                        else (cat_name.split(" - ")[0].strip() if " - " in cat_name else (cat_name or "Espace"))
                    )
                    space_obj, space_created = Space.objects.get_or_create(
                        name=space_title,
                        defaults={"base_price": 0},
                    )

                if space_obj:
                    if not floor:
                        floor, floor_created = DesignRequestFloor.objects.get_or_create(
                            design_request=project,
                            name="Principal",
                            defaults={"level": 0, "order": 0, "surface": 0},
                        )
                    display_name = (
                        f"{space_obj.name} ({cat.category_name})"
                        if cat
                        else (cat_name or space_obj.name)
                    )
                    DesignRequestSpace.objects.get_or_create(
                        design_request=project,
                        floor=floor,
                        space=space_obj,
                        defaults={
                            "custom_name": display_name,
                            "price_at_time": getattr(space_obj, "base_price", Decimal("0.00")) or Decimal("0.00"),
                        },
                    )
                    if cat:
                        img_obj = cat.images.filter(is_default=True).first() or cat.images.first()
                        if img_obj:
                            DesignRequestGalleryImage.objects.get_or_create(
                                design_request=project,
                                space_image=img_obj,
                                defaults={"notes": notes},
                            )

            DesignActivityLog.objects.create(
                design_request=project,
                action=_("Gallery Inspirations Submitted"),
                description=f"Client submitted {len(items)} gallery inspiration items from the website.",
            )

            UserModel = get_user_model()
            admins = UserModel.objects.filter(
                Q(is_superuser=True) | Q(profile__role="admin")
            ).distinct()

            for adm in admins:
                try:
                    notify_user(
                        user=adm,
                        title=str(_("New Project from Gallery: %(name)s") % {"name": name or email}),
                        message=f"{len(items)} inspirations sélectionnées. Notes: {notes[:80]}",
                        notification_type="project",
                        link=reverse("dash:admin_project_detail", args=[project.pk]),
                    )
                except Exception:
                    pass

        return JsonResponse({
            "success": True,
            "message": str(_("Votre sélection d'inspirations a bien été enregistrée et transmise à nos architectes !")),
        })
    except Exception as e:
        import sys, traceback
        print(f"[SUBMIT_PUBLIC_GALLERY ERROR] {type(e).__name__}: {e}", file=sys.stderr, flush=True)
        traceback.print_exc()
        return JsonResponse({"success": False, "errors": humanize_error(e)})

