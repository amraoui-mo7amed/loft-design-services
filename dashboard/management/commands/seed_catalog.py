from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.text import slugify
from dashboard.models import (
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


def _make_gif():
    return (
        b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff"
        b"\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00"
        b",\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
    )


SPACE_CATEGORIES = ["Interior", "Exterior"]
SPACES = [
    ("Living Room", "Interior", 8000, 7),
    ("Kitchen", "Interior", 12000, 10),
    ("Bedroom", "Interior", 6000, 5),
    ("Bathroom", "Interior", 7000, 6),
    ("Dining Room", "Interior", 9000, 8),
    ("Home Office", "Interior", 5000, 4),
    ("Garden", "Exterior", 15000, 14),
    ("Terrace", "Exterior", 10000, 10),
]

PROJECT_TYPES = [
    {
        "name": "Residential",
        "description": "Complete interior design for apartments, villas, and houses \u2014 from a single room to the entire home.",
        "sort_order": 1,
        "spaces": ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Dining Room"],
    },
    {
        "name": "Commercial",
        "description": "Professional design for offices, retail spaces, and restaurants that impress clients and boost productivity.",
        "sort_order": 2,
        "spaces": ["Home Office", "Kitchen", "Bathroom"],
    },
    {
        "name": "Outdoor",
        "description": "Landscape and exterior design \u2014 gardens, terraces, and outdoor living areas for year-round enjoyment.",
        "sort_order": 3,
        "spaces": ["Garden", "Terrace"],
    },
]

PACKAGES = [
    {
        "name": "Essential",
        "description": "Core design package \u2014 floor plans, mood boards, and material selection. Perfect for a single room refresh.",
        "delivery_time_days": 7,
    },
    {
        "name": "Premium",
        "description": "Full design experience with 3D renderings, detailed construction drawings, and personalised consultations.",
        "delivery_time_days": 14,
    },
    {
        "name": "Luxury",
        "description": "White-glove service covering every detail \u2014 custom furniture design, art curation, project management, and on-site supervision.",
        "delivery_time_days": 21,
    },
]

OPTIONS = [
    {
        "name": "3D Walkthrough",
        "description": "Interactive 3D tour of your designed space so you can experience it before it\u2019s built.",
        "price": 15000,
        "category_name": "visualisation",
    },
    {
        "name": "Furniture Procurement",
        "description": "We source and procure all furniture items at trade prices and coordinate delivery.",
        "price": 25000,
        "category_name": "procurement",
    },
    {
        "name": "Lighting Design",
        "description": "Custom lighting plan with fixture selection, placement diagrams, and dimming schedules.",
        "price": 12000,
        "category_name": "electrical",
    },
    {
        "name": "Landscape Concept",
        "description": "Outdoor space concept including planting plans, hardscape materials, and terrace layouts.",
        "price": 18000,
        "category_name": "outdoor",
    },
]

# Package → Services mapping: (package_name, option_name, price)
PACKAGE_SERVICES = [
    ("Essential", "3D Walkthrough", 12000),
    ("Essential", "Furniture Procurement", 20000),
    ("Essential", "Lighting Design", 10000),
    ("Premium", "3D Walkthrough", 15000),
    ("Premium", "Furniture Procurement", 25000),
    ("Premium", "Lighting Design", 12000),
    ("Luxury", "3D Walkthrough", 15000),
    ("Luxury", "Furniture Procurement", 25000),
    ("Luxury", "Lighting Design", 12000),
    ("Luxury", "Landscape Concept", 18000),
]

STYLES = [
    {
        "name": "Modern",
        "description": "Clean lines, neutral palettes, and a focus on function over ornament. Minimalist yet warm.",
    },
    {
        "name": "Industrial",
        "description": "Raw materials, exposed structures, and an urban loft vibe. Brick, steel, and concrete meet comfort.",
    },
    {
        "name": "Scandinavian",
        "description": "Light-filled spaces, natural textures, and understated elegance. Hygge-inspired living.",
    },
]

INSPIRATIONS = [
    ("Modern Living Room", "Living Room", "Modern"),
    ("Industrial Kitchen", "Kitchen", "Industrial"),
    ("Scandi Bedroom", "Bedroom", "Scandinavian"),
    ("Garden Lounge", "Garden", "Modern"),
]


class Command(BaseCommand):
    help = "Seeds catalog data: 3 ProjectTypes, 8 Spaces, 3 Packages, 4 Options, 3 Styles, 4 Inspirations"

    def handle(self, *args, **kwargs):
        counts = {
            "project_types": 0,
            "spaces": 0,
            "packages": 0,
            "options": 0,
            "styles": 0,
            "inspirations": 0,
        }

        with transaction.atomic():
            # ── SpaceCategories ───────────────────────────────────
            cat_map = {}
            for cat_name in SPACE_CATEGORIES:
                cat, _ = SpaceCategory.objects.get_or_create(name=cat_name)
                cat_map[cat_name] = cat

            # ── Spaces ────────────────────────────────────────────
            space_map = {}
            for s_name, cat_name, price, days in SPACES:
                space, created = Space.objects.get_or_create(
                    name=s_name,
                    defaults={
                        "slug": slugify(s_name),
                        "space_category": cat_map[cat_name],
                        "base_price": price,
                        "estimated_days": days,
                        "category": cat_name,
                    },
                )
                space_map[s_name] = space
                if created:
                    counts["spaces"] += 1

            # ── ProjectTypes + ProjectTypeSpace ───────────────────
            for pt_data in PROJECT_TYPES:
                pt, pt_created = ProjectType.objects.get_or_create(
                    slug=slugify(pt_data["name"]),
                    defaults={
                        "name": pt_data["name"],
                        "description": pt_data["description"],
                        "sort_order": pt_data["sort_order"],
                    },
                )
                if pt_created:
                    counts["project_types"] += 1
                for idx, space_name in enumerate(pt_data["spaces"]):
                    if space_name in space_map:
                        ProjectTypeSpace.objects.get_or_create(
                            project_type=pt,
                            space=space_map[space_name],
                            defaults={"sort_order": idx},
                        )

            # ── Packages ──────────────────────────────────────────
            for data in PACKAGES:
                _, was = DesignPackage.objects.get_or_create(
                    name=data["name"],
                    defaults={
                        "description": data["description"],
                        "delivery_time_days": data["delivery_time_days"],
                    },
                )
                if was:
                    counts["packages"] += 1

            # ── ServiceCategories ──────────────────────────────────
            cat_names = set()
            for data in OPTIONS:
                cat_names.add(data["category_name"])
            for cn in sorted(cat_names):
                _, was = ServiceCategory.objects.get_or_create(name=cn)
                if was:
                    counts.setdefault("service_categories", 0)
                    counts["service_categories"] += 1

            # ── Options ───────────────────────────────────────────
            cat_map = {sc.name: sc for sc in ServiceCategory.objects.all()}
            for data in OPTIONS:
                slug = slugify(data["name"])
                category_fk = cat_map.get(data["category_name"])
                _, was = DesignOption.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "name": data["name"],
                        "description": data["description"],
                        "price": data["price"],
                        "category": category_fk,
                    },
                )
                if was:
                    counts["options"] += 1

            # ── PackageService ─────────────────────────────────────
            for pkg_name, opt_name, price in PACKAGE_SERVICES:
                try:
                    pkg = DesignPackage.objects.get(name=pkg_name)
                    opt = DesignOption.objects.get(name=opt_name)
                    _, was = PackageService.objects.get_or_create(
                        package=pkg, option=opt,
                        defaults={"price": price},
                    )
                except (DesignPackage.DoesNotExist, DesignOption.DoesNotExist):
                    pass

            # ── StyleCategories ───────────────────────────────────
            for data in STYLES:
                slug = slugify(data["name"])
                _, was = StyleCategory.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "name": data["name"],
                        "description": data["description"],
                    },
                )
                if was:
                    counts["styles"] += 1

            # ── InspirationImages ─────────────────────────────────
            gif_bytes = _make_gif()
            for title, space_name, style_name in INSPIRATIONS:
                style = StyleCategory.objects.get(slug=slugify(style_name))
                space = space_map[space_name]
                insp, was = InspirationImage.objects.get_or_create(
                    title=title,
                    defaults={
                        "space": space,
                        "style_category": style,
                        "active": True,
                    },
                )
                if was:
                    insp.image.save(
                        f"{slugify(title)}.gif",
                        ContentFile(gif_bytes),
                        save=True,
                    )
                    counts["inspirations"] += 1

        total = sum(counts.values())
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {total} items: "
                f"{counts['project_types']} project types \u00b7 "
                f"{counts['spaces']} spaces \u00b7 "
                f"{counts['packages']} packages \u00b7 "
                f"{counts.get('service_categories', 0)} service categories \u00b7 "
                f"{counts['options']} options \u00b7 "
                f"{counts['styles']} styles \u00b7 "
                f"{counts['inspirations']} inspirations"
            )
        )
