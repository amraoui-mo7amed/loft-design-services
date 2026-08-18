from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.text import slugify
from dashboard.models import (
    ProjectType,
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    ProjectTypeSpace,
    Service,
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

SERVICES = [
    {
        "service_name": "3D Architectural Visualization",
        "service_price": 15000,
        "is_default": True,
    },
    {
        "service_name": "Full Interior Design & Execution Plans",
        "service_price": 25000,
        "is_default": False,
    },
    {
        "service_name": "Custom Furniture Procurement & Staging",
        "service_price": 20000,
        "is_default": False,
    },
    {
        "service_name": "Lighting & Electrical Engineering Plan",
        "service_price": 12000,
        "is_default": False,
    },
]


class Command(BaseCommand):
    help = "Seeds catalog data: ProjectTypes, Spaces, Categories, and Services"

    def handle(self, *args, **kwargs):
        counts = {
            "project_types": 0,
            "spaces": 0,
            "categories": 0,
            "services": 0,
        }

        with transaction.atomic():
            # ── Spaces & Categories ──────────────────────────────
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
                
                # Ensure default category
                cat, cat_created = SpaceCategory.objects.get_or_create(
                    space=space,
                    category_name="General",
                )
                if cat_created:
                    counts["categories"] += 1
                    gif_bytes = _make_gif()
                    SpaceCategoryImages.objects.create(
                        category=cat,
                        image=ContentFile(gif_bytes, name=f"{space.slug}.gif"),
                        is_default=True,
                    )

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

            # ── Services ──────────────────────────────────────────
            for s_data in SERVICES:
                _, was = Service.objects.get_or_create(
                    service_name=s_data["service_name"],
                    defaults={
                        "service_price": s_data["service_price"],
                        "is_default": s_data["is_default"],
                    },
                )
                if was:
                    counts["services"] += 1

        total = sum(counts.values())
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {total} items: "
                f"{counts['project_types']} project types · "
                f"{counts['spaces']} spaces · "
                f"{counts['categories']} categories · "
                f"{counts['services']} services"
            )
        )
