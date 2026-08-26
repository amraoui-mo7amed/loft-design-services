import json
import re

from django.http import JsonResponse
from django.shortcuts import render
from django.core.validators import validate_email, ValidationError
from django.utils.translation import gettext as _
from django.utils.html import escape
from dashboard.models import Portfolio, ProjectType, Space, Service, Contact, Lead, Video
from dashboard.utils import build_packages_context
from frontend.utils import build_gallery_data


def home_view(request):
    all_spaces = Space.objects.prefetch_related("categories__images").order_by("name")
    
    PRIMARY_SPACES_MAP = [
        {"slug": "living-room", "alt_slugs": ["living", "salon"], "name": "Living room", "price": 8000.0, "img": "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg"},
        {"slug": "bedroom", "alt_slugs": ["bed", "chambre"], "name": "Bedroom", "price": 6000.0, "img": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg"},
        {"slug": "kitchen", "alt_slugs": ["cuisine"], "name": "Kitchen", "price": 12000.0, "img": "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg"},
        {"slug": "bathroom", "alt_slugs": ["bath", "sdb"], "name": "Bathroom", "price": 7000.0, "img": "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg"},
        {"slug": "kids-room", "alt_slugs": ["kids", "children-room", "enfant"], "name": "Children room", "price": 6500.0, "img": "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg"},
    ]
    
    spaces_by_slug = {sp.slug or str(sp.id): sp for sp in all_spaces}
    spaces_data = []
    for default_sp in PRIMARY_SPACES_MAP:
        matched = None
        for s_candidate in [default_sp["slug"]] + default_sp["alt_slugs"]:
            if s_candidate in spaces_by_slug:
                matched = spaces_by_slug[s_candidate]
                break
        if not matched:
            for sp in all_spaces:
                if sp.name.lower() == default_sp["name"].lower():
                    matched = sp
                    break

        if matched:
            thumb = matched.thumbnail.url if (matched.thumbnail and not str(matched.thumbnail).endswith('.gif')) else ""
            if not thumb:
                for cat in matched.categories.all():
                    first_img = cat.images.first()
                    if first_img:
                        thumb = first_img.image.url
                        break
            spaces_data.append({
                "id": matched.slug or str(matched.id),
                "slug": matched.slug or str(matched.id),
                "name": matched.name,
                "price": float(matched.base_price) if matched.base_price > 0 else default_sp["price"],
                "base_price": float(matched.base_price) if matched.base_price > 0 else default_sp["price"],
                "img": thumb or default_sp["img"],
                "thumbnail": thumb or default_sp["img"],
            })
        else:
            spaces_data.append({
                "id": default_sp["slug"],
                "slug": default_sp["slug"],
                "name": default_sp["name"],
                "price": default_sp["price"],
                "base_price": default_sp["price"],
                "img": default_sp["img"],
                "thumbnail": default_sp["img"],
            })

    from django.utils.translation import get_language
    cur_lang = get_language() or "fr"
    services_qs = Service.objects.prefetch_related("translations").all().order_by("-is_default", "service_name")
    if services_qs.exists():
        has_default = False
        services_data = []
        for s in services_qs:
            t = s.get_translation(cur_lang)
            t_fr = s.get_translation("fr")
            t_en = s.get_translation("en")
            t_ar = s.get_translation("ar")
            is_def = bool(s.is_default and not has_default)
            if is_def:
                has_default = True
            services_data.append({
                "id": s.id,
                "slug": s.id,
                "name": t.get("name") or s.service_name,
                "short_description": t.get("short_description") or s.short_description,
                "detailed_description": t.get("detailed_description") or s.detailed_description,
                "included_items": t.get("included_items") or s.included_items or [],
                "excluded_items": t.get("excluded_items") or s.excluded_items or [],
                "deliverables": t.get("deliverables") or s.deliverables or [],
                "included_revisions": t.get("included_revisions") or s.included_revisions or "",
                "estimated_delivery_time": t.get("estimated_delivery_time") or s.estimated_delivery_time or "",
                "price": float(s.service_price),
                "pricing_type": s.pricing_type,
                "percentage_rate": float(s.percentage_rate or 0),
                "min_fee": float(s.min_fee) if s.min_fee is not None else None,
                "max_fee": float(s.max_fee) if s.max_fee is not None else None,
                "video_link": s.video_link or "",
                "gif_url": s.gif_file.url if s.gif_file else "",
                "is_default": is_def,
                "translations": {
                    "fr": t_fr,
                    "en": t_en,
                    "ar": t_ar,
                },
            })
        if not has_default and services_data:
            services_data[0]["is_default"] = True
    else:
        services_data = [
            {
                "id": "3d",
                "slug": "3d",
                "name": _("3D Modeling & Rendering"),
                "short_description": _("Detailed photorealistic 3D visualization of your project."),
                "detailed_description": _("Full 3D modeling and photorealistic rendering adapted to your dimensions."),
                "included_items": [_("3D layout"), _("Texture and lighting selection"), _("High-resolution renders")],
                "excluded_items": [_("On-site supervision"), _("Furniture purchasing")],
                "deliverables": [_("4K JPG Renders"), _("PDF Concept Presentation")],
                "included_revisions": "2",
                "estimated_delivery_time": "5-7 days",
                "price": 750.0,
                "pricing_type": "area",
                "percentage_rate": 0.0,
                "min_fee": None,
                "max_fee": None,
                "video_link": "",
                "gif_url": "",
                "is_default": True,
                "translations": {
                    "fr": {
                        "name": "Conception & Modélisation 3D",
                        "short_description": "Visualisation 3D photoréaliste et détaillée de votre projet.",
                        "detailed_description": "Modélisation 3D complète et rendus photoréalistes adaptés à vos dimensions exactes.",
                        "included_items": ["Agencement 3D", "Sélection textures et éclairage", "Rendus haute résolution"],
                        "excluded_items": ["Suivi de chantier", "Achat mobilier"],
                        "deliverables": ["Rendus 4K JPG", "Dossier de présentation PDF"],
                        "included_revisions": "2 révisions",
                        "estimated_delivery_time": "5 à 7 jours",
                    },
                    "en": {
                        "name": "3D Modeling & Rendering",
                        "short_description": "Detailed photorealistic 3D visualization of your project.",
                        "detailed_description": "Full 3D modeling and photorealistic rendering adapted to your exact dimensions.",
                        "included_items": ["3D layout", "Texture and lighting selection", "High-resolution renders"],
                        "excluded_items": ["On-site supervision", "Furniture purchasing"],
                        "deliverables": ["4K JPG Renders", "PDF Concept Presentation"],
                        "included_revisions": "2 revisions",
                        "estimated_delivery_time": "5 to 7 days",
                    },
                    "ar": {
                        "name": "التصميم والنمذجة ثلاثية الأبعاد 3D",
                        "short_description": "تصور ثلاثي الأبعاد واقعي ومفصل لمشروعك.",
                        "detailed_description": "نمذجة 3D متكاملة ورندرات فائقة الواقعية مصممة خصيصاً لمقاسات مشروعك.",
                        "included_items": ["تخطيط الفضاء 3D", "اختيار المواد والإضاءة", "صور عالية الدقة 4K"],
                        "excluded_items": ["الإشراف الميداني", "شراء الأثاث"],
                        "deliverables": ["رندرات 4K بدقة عالية", "ملف عرض تقديمي PDF"],
                        "included_revisions": "تعديلان",
                        "estimated_delivery_time": "5 إلى 7 أيام",
                    },
                },
            },
            {
                "id": "360",
                "slug": "360",
                "name": _("360° Virtual Tour"),
                "short_description": _("Immersive panoramic 360 tour for interactive walkthroughs."),
                "detailed_description": _("Interactive 360 degree panoramic walkthrough viewable on mobile and VR."),
                "included_items": [_("Interactive 360 tour"), _("Mobile and browser compatibility")],
                "excluded_items": [_("Physical execution")],
                "deliverables": [_("Web link + VR tour files")],
                "included_revisions": "1",
                "estimated_delivery_time": "3-5 days",
                "price": 8000.0,
                "pricing_type": "fixed",
                "percentage_rate": 0.0,
                "min_fee": None,
                "max_fee": None,
                "video_link": "",
                "gif_url": "",
                "is_default": False,
                "translations": {
                    "fr": {
                        "name": "Visite Virtuelle 360°",
                        "short_description": "Visite panoramique 360° immersive pour une exploration interactive.",
                        "detailed_description": "Visite virtuelle panoramique 360 degrés fluide et interactive, accessible sur smartphone, PC et casque VR.",
                        "included_items": ["Visite 360° interactive", "Compatibilité mobile et navigateur"],
                        "excluded_items": ["Exécution physique"],
                        "deliverables": ["Lien web + Fichiers visite VR"],
                        "included_revisions": "1 révision",
                        "estimated_delivery_time": "3 à 5 jours",
                    },
                    "en": {
                        "name": "360° Virtual Tour",
                        "short_description": "Immersive panoramic 360 tour for interactive walkthroughs.",
                        "detailed_description": "Interactive 360 degree panoramic walkthrough viewable on mobile and VR.",
                        "included_items": ["Interactive 360 tour", "Mobile and browser compatibility"],
                        "excluded_items": ["Physical execution"],
                        "deliverables": ["Web link + VR tour files"],
                        "included_revisions": "1 revision",
                        "estimated_delivery_time": "3 to 5 days",
                    },
                    "ar": {
                        "name": "الجولة الافتراضية 360 درجة",
                        "short_description": "جولة بانورامية تفاعلية 360 درجة لاستكشاف كامل للمساحة.",
                        "detailed_description": "جولة افتراضية تفاعلية بانورامية متوافقة مع الهواتف الذكية وأجهزة الكمبيوتر ونظارات الواقع الافتراضي VR.",
                        "included_items": ["جولة 360° تفاعلية", "توافق مع الأجهزة والمتصفحات"],
                        "excluded_items": ["التنفيذ الميداني"],
                        "deliverables": ["رابط ويب + ملفات الجولة VR"],
                        "included_revisions": "تعديل واحد",
                        "estimated_delivery_time": "3 إلى 5 أيام",
                    },
                },
            },
        ]

    PORTFOLIO_DEFAULT_IMAGES = [
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg",
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png",
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png",
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png",
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png",
        "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png",
    ]
    portfolios_qs = Portfolio.objects.prefetch_related("gallery_images").order_by("-created_at")[:15]
    portfolio_data = []
    for i, p in enumerate(portfolios_qs):
        g_imgs = [g.image.url for g in p.gallery_images.all()]
        def_img = PORTFOLIO_DEFAULT_IMAGES[i % len(PORTFOLIO_DEFAULT_IMAGES)]
        t_url = p.thumbnail.url if p.thumbnail else (g_imgs[0] if g_imgs else def_img)
        if not g_imgs:
            g_imgs = [t_url, PORTFOLIO_DEFAULT_IMAGES[(i+1) % len(PORTFOLIO_DEFAULT_IMAGES)], PORTFOLIO_DEFAULT_IMAGES[(i+2) % len(PORTFOLIO_DEFAULT_IMAGES)]]
        portfolio_data.append({
            "id": p.id,
            "name": p.title,
            "img": t_url,
            "vr": p.external_link or "/gallery/",
            "gallery": g_imgs,
        })
    if not portfolio_data:
        default_names = [
            'Appartement Chéraga', 'Suite contemporaine', 'Épure urbaine',
            'Maison Sidi Aïch', 'Séjour Béjaïa', 'Triplex Béjaïa'
        ]
        for i, name in enumerate(default_names):
            img = PORTFOLIO_DEFAULT_IMAGES[i % len(PORTFOLIO_DEFAULT_IMAGES)]
            portfolio_data.append({
                "id": f"demo-{i+1}",
                "name": name,
                "img": img,
                "vr": "/gallery/",
                "gallery": [img, PORTFOLIO_DEFAULT_IMAGES[(i+1) % len(PORTFOLIO_DEFAULT_IMAGES)], PORTFOLIO_DEFAULT_IMAGES[(i+2) % len(PORTFOLIO_DEFAULT_IMAGES)]],
            })

    videos_qs = Video.objects.all().order_by("-created_at")
    video_data = []
    for v in videos_qs:
        yt_id = "66qSJ4EIIdM"
        if v.play_link:
            match = re.search(r"(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})", v.play_link)
            if match:
                yt_id = match.group(1)
        video_data.append({
            "id": v.id,
            "title": v.title,
            "youtube_id": yt_id,
            "thumbnail": v.thumbnail_url or f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
        })
    if not video_data:
        video_data = [
            {"id": "v1", "title": "LOFT DESIGN · immersion & projet", "youtube_id": "66qSJ4EIIdM", "thumbnail": "https://img.youtube.com/vi/66qSJ4EIIdM/hqdefault.jpg"},
            {"id": "v2", "title": "Conception · matières · expérience", "youtube_id": "66qSJ4EIIdM", "thumbnail": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png"},
            {"id": "v3", "title": "Projet résidentiel · détails & lumière", "youtube_id": "66qSJ4EIIdM", "thumbnail": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"},
        ]

    project_types_qs = ProjectType.objects.all().order_by("name")
    if project_types_qs.exists():
        project_types_data = [{
            "id": pt.id,
            "slug": pt.slug,
            "name": pt.name,
        } for pt in project_types_qs]
    else:
        project_types_data = [
            {"id": 1, "slug": "residence", "name": "Résidence"},
            {"id": 2, "slug": "villa", "name": "Villa"},
            {"id": 3, "slug": "appartement", "name": "Appartement"},
            {"id": 4, "slug": "commercial", "name": "Commercial"},
            {"id": 5, "slug": "bureau", "name": "Bureau"},
            {"id": 6, "slug": "hotel", "name": "Hôtel"},
        ]

    gallery_data = build_gallery_data(all_spaces)

    return render(request, "home.html", {
        "project_types": project_types_data,
        "project_types_json": json.dumps(project_types_data),
        "spaces": spaces_data,
        "spaces_json": json.dumps(spaces_data),
        "services": services_data,
        "services_json": json.dumps(services_data),
        "projects": portfolios_qs,
        "portfolio_list": portfolio_data,
        "portfolio_data_json": json.dumps(portfolio_data),
        "videos": videos_qs,
        "video_list": video_data,
        "video_data_json": json.dumps(video_data),
        "gallery_data_json": json.dumps(gallery_data),
    })


def submit_contact(request):
    """Create a Contact, Lead, and Inquiry from the homepage form under transaction.atomic with admin notification."""
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Method not allowed.")]})

    first_name = request.POST.get("first_name", "").strip()
    last_name = request.POST.get("last_name", "").strip()
    full_name = f"{first_name} {last_name}".strip() or request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    phone = request.POST.get("phone", "").strip()
    message = request.POST.get("message", "").strip()

    errors = []
    if not full_name:
        errors.append(_("Name is required."))
    if not email:
        errors.append(_("Email is required."))
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors.append(_("Please provide a valid email address."))
    if not message:
        errors.append(_("Message cannot be empty."))

    if errors:
        return JsonResponse({"success": False, "errors": errors})

    try:
        from django.db import transaction
        from django.db.models import Q
        from django.contrib.auth import get_user_model
        from django.urls import reverse
        from dashboard.utils import notify_user

        with transaction.atomic():
            contact = Contact.objects.create(
                name=full_name,
                email=email,
                phone=phone,
                message=message,
            )

            lead = Lead.objects.filter(email=email).first()
            if not lead:
                lead = Lead.objects.create(
                    email=email,
                    name=full_name,
                )

            UserModel = get_user_model()
            admin_users = UserModel.objects.filter(
                Q(is_superuser=True) | Q(profile__role="admin")
            ).distinct()

            for admin_u in admin_users:
                notify_user(
                    user=admin_u,
                    title=_("New Contact Message: %(name)s") % {"name": full_name},
                    message=message[:120],
                    notification_type="contact",
                    link=reverse("dash:contact_detail", args=[contact.pk]),
                )

        return JsonResponse({
            "success": True,
            "message": _("Thank you for reaching out! We will get back to you shortly."),
            "contact_id": contact.id,
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": [str(e)]})


def order_view(request):
    selected = []
    total = 0

    space_ids = request.GET.get("spaces", "")
    if space_ids:
        ids = [s for s in space_ids.split(",") if s.isdigit()]
        selected = Space.objects.filter(id__in=ids)
        for s in selected:
            total += float(s.base_price)

    package = None
    pkg_id = request.GET.get("pkg", "")
    if pkg_id.isdigit():
        package = Service.objects.filter(id=int(pkg_id)).first()
        if package:
            total += float(package.service_price)

    total = round(total)

    return render(request, "order.html", {
        "selected_spaces": selected,
        "total": total,
        "package": package,
    })


inquiry_view = order_view


def pack_select_view(request):
    space_ids = [s for s in request.GET.get("spaces", "").split(",") if s.isdigit()]
    spaces = Space.objects.filter(id__in=space_ids)
    subtotal = sum(float(s.base_price) for s in spaces)
    spaces_data = [
        {"id": s.id, "name": s.name, "base_price": float(s.base_price)}
        for s in spaces
    ]
    context = build_packages_context()
    context.update({
        "spaces": spaces_data,
        "subtotal": subtotal,
        "space_ids": ",".join(space_ids),
    })
    return render(request, "pack_select.html", context)
