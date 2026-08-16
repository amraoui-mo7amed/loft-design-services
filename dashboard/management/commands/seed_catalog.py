from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.text import slugify
from dashboard.models import (
    ProjectType,
    Space,
    SpaceImage,
    ProjectTypeSpace,
    DesignPackage,
    PackageService,
    ServiceCategory,
    DesignOption,
)


def _make_gif():
    return (
        b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff"
        b"\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00"
        b",\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
    )


SPACES = [
    ("Living Room", 8000),
    ("Kitchen", 12000),
    ("Bedroom", 6000),
    ("Bathroom", 7000),
    ("Dining Room", 9000),
    ("Home Office", 5000),
    ("Garden", 15000),
    ("Terrace", 10000),
    ("Balcony", 4000),
    ("Corridor", 3000),
    ("Kids Room", 6500),
    ("Guest Room", 7000),
    ("Laundry Room", 3500),
    ("Storage Room", 2500),
    ("Rooftop", 18000),
    ("Entrance Hall", 5500),
    ("Study Room", 6000),
    ("Pool Area", 22000),
]

PROJECT_TYPES = [
    {
        "name": "Residential",
        "spaces": ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Dining Room", "Kids Room", "Guest Room", "Study Room", "Laundry Room", "Storage Room"],
    },
    {
        "name": "Commercial",
        "spaces": ["Home Office", "Corridor", "Entrance Hall"],
    },
    {
        "name": "Outdoor",
        "spaces": ["Garden", "Terrace", "Balcony", "Rooftop", "Pool Area"],
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
        "category_name": "visualisation",
    },
    {
        "name": "Furniture Procurement",
        "description": "We source and procure all furniture items at trade prices and coordinate delivery.",
        "category_name": "procurement",
    },
    {
        "name": "Lighting Design",
        "description": "Custom lighting plan with fixture selection, placement diagrams, and dimming schedules.",
        "category_name": "electrical",
    },
    {
        "name": "Landscape Concept",
        "description": "Outdoor space concept including planting plans, hardscape materials, and terrace layouts.",
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


class Command(BaseCommand):
    help = "Seeds catalog data: ProjectTypes, Spaces, Packages, Options, ServiceCategories"

    def handle(self, *args, **kwargs):
        counts = {
            "project_types": 0,
            "spaces": 0,
            "packages": 0,
            "options": 0,
        }

        with transaction.atomic():
            # ── Spaces ────────────────────────────────────────────
            space_map = {}
            for s_name, price in SPACES:
                space, created = Space.objects.get_or_create(
                    name=s_name,
                    defaults={
                        "slug": slugify(s_name),
                        "base_price": price,
                    },
                )
                space_map[s_name] = space
                if created:
                    counts["spaces"] += 1
                    gif_bytes = _make_gif()
                    SpaceImage.objects.create(space=space, image=ContentFile(gif_bytes, name=f"{space.slug}.gif"))

            # ── ProjectTypes + ProjectTypeSpace ───────────────────
            for pt_data in PROJECT_TYPES:
                pt, pt_created = ProjectType.objects.get_or_create(
                    slug=slugify(pt_data["name"]),
                    defaults={
                        "name": pt_data["name"],
                    },
                )
                if pt_created:
                    counts["project_types"] += 1
                for idx, space_name in enumerate(pt_data["spaces"]):
                    if space_name in space_map:
                        space_obj = space_map[space_name]
                        ProjectTypeSpace.objects.filter(space=space_obj).delete()
                        ProjectTypeSpace.objects.create(
                            project_type=pt, space=space_obj, sort_order=idx,
                        )

            # ── Packages ──────────────────────────────────────────
            for data in PACKAGES:
                _, was = DesignPackage.objects.get_or_create(
                    name=data["name"],
                    defaults={
                        "delivery_time_days": data.get("delivery_time_days", 7),
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

        total = sum(counts.values())
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {total} items: "
                f"{counts['project_types']} project types \u00b7 "
                f"{counts['spaces']} spaces \u00b7 "
                f"{counts['packages']} packages \u00b7 "
                f"{counts.get('service_categories', 0)} service categories \u00b7 "
                f"{counts['options']} options"
            )
        )
