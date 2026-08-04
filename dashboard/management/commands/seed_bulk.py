from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from dashboard.models import (
    DesignRequest,
    Portfolio,
    ProjectType,
    ProjectTypeSpace,
    Space,
)

PT_COUNT = 100
SPACES_PER_PT = 20
PORTFOLIO_COUNT = 100
INQUIRY_COUNT = 100

SPACE_WORDS = [
    "Living", "Kitchen", "Bedroom", "Bathroom", "Dining", "Office",
    "Garden", "Terrace", "Balcony", "Corridor", "Kids", "Guest",
    "Laundry", "Storage", "Rooftop", "Entrance", "Study", "Pool",
    "Library", "Gym", "Playroom", "Cellar", "Garage", "Pantry",
    "Spa", "Theatre", "Veranda", "Atrium", "Studio", "Conservatory",
]

FIRST_NAMES = [
    "Ahmed", "Sara", "Karim", "Yasmine", "Omar", "Lina", "Mehdi",
    "Amira", "Yacine", "Nour", "Riad", "Ines", "Sofiane", "Walid",
    "Houda", "Zakaria", "Malik", "Dounia", "Anis", "Fares", "Nadia",
    "Samir", "Rania", "Adel", "Selma", "Bilal", "Meriem", "Tarek",
]

LAST_NAMES = [
    "Benali", "Cherif", "Mansouri", "Haddad", "Bouzid", "Khelifi",
    "Saidi", "Amrani", "Belkacem", "Guerroudj", "Medjebeur", "Ouahrani",
]

PROJECT_ADJECTIVES = [
    "Modern", "Classic", "Minimalist", "Luxury", "Cozy", "Contemporary",
    "Rustic", "Elegant", "Urban", "Zen", "Mediterranean", "Scandinavian",
    "Industrial", "Bohemian", "Art Deco", "Coastal",
]

PROJECT_NOUNS = [
    "Villa", "Apartment", "Penthouse", "Office", "Cafe", "Boutique",
    "Residence", "Loft", "Showroom", "Guesthouse", "Townhouse", "Studio",
]

DESCRIPTIONS = [
    "A carefully curated interior design project focused on balance, light and texture.",
    "Full redesign blending comfort and style with bespoke furniture and warm materials.",
    "Complete space transformation with a bold, modern concept and premium finishes.",
    "Elegant makeover featuring custom joinery, layered lighting and refined decor.",
    "Functional yet stylish layout designed around the client's daily routines.",
    "A unique concept mixing tradition and contemporary elements for a timeless result.",
]


class Command(BaseCommand):
    help = "Seeds bulk demo data: 100 project types (20 spaces each), 100 portfolios, 100 design requests."

    def handle(self, *args, **kwargs):
        counts = {"project_types": 0, "spaces": 0, "portfolios": 0, "inquiries": 0}

        with transaction.atomic():
            # ── Project Types + 20 unique spaces each ─────────────
            for pt_idx in range(1, PT_COUNT + 1):
                pt_name = f"Project Type {pt_idx:03d}"
                pt, pt_created = ProjectType.objects.get_or_create(
                    slug=slugify(pt_name),
                    defaults={"name": pt_name},
                )
                if pt_created:
                    counts["project_types"] += 1

                for sp_idx in range(1, SPACES_PER_PT + 1):
                    word = SPACE_WORDS[(pt_idx + sp_idx) % len(SPACE_WORDS)]
                    sp_name = f"{word} Room {pt_idx:03d}-{sp_idx:02d}"
                    sp, sp_created = Space.objects.get_or_create(
                        slug=slugify(sp_name),
                        defaults={
                            "name": sp_name,
                            "base_price": 3000 + (sp_idx * 750) + (pt_idx % 5) * 500,
                        },
                    )
                    if sp_created:
                        counts["spaces"] += 1
                    ProjectTypeSpace.objects.get_or_create(
                        project_type=pt,
                        space=sp,
                        defaults={"sort_order": sp_idx, "show_on_home": sp_idx <= 3},
                    )

            # ── Portfolios ─────────────────────────────────────────
            existing_pt = list(ProjectType.objects.order_by("pk")[:PT_COUNT])
            for p_idx in range(1, PORTFOLIO_COUNT + 1):
                adj = PROJECT_ADJECTIVES[(p_idx - 1) % len(PROJECT_ADJECTIVES)]
                noun = PROJECT_NOUNS[(p_idx - 1) % len(PROJECT_NOUNS)]
                title = f"{adj} {noun} {p_idx:03d}"
                tags = ", ".join({
                    adj.lower(),
                    noun.lower(),
                    "interior",
                    "design",
                    "renovation",
                })
                Portfolio.objects.get_or_create(
                    title=title,
                    defaults={
                        "description": DESCRIPTIONS[(p_idx - 1) % len(DESCRIPTIONS)],
                        "tags": tags,
                        "is_featured": p_idx % 9 == 0,
                    },
                )
                counts["portfolios"] += 1

            # ── Design Requests (inquiries) ────────────────────────
            User = get_user_model()
            base_dt = timezone.now()
            for i in range(1, INQUIRY_COUNT + 1):
                pt = existing_pt[(i - 1) % len(existing_pt)]
                adj = PROJECT_ADJECTIVES[(i - 1) % len(PROJECT_ADJECTIVES)]
                noun = PROJECT_NOUNS[(i - 1) % len(PROJECT_NOUNS)]
                status = DesignRequest.Status.choices[(i - 1) % 3][0]
                DesignRequest.objects.create(
                    client=None,
                    first_name=FIRST_NAMES[(i - 1) % len(FIRST_NAMES)],
                    last_name=LAST_NAMES[(i - 1) % len(LAST_NAMES)],
                    email=f"client{i:03d}@example.com",
                    phone=f"+213-555-{i:04d}",
                    project_name=f"{adj} {noun} - Client {i:03d}",
                    project_type=pt,
                    status=status,
                    budget=20000 + i * 1000,
                    total=30000 + i * 1500,
                    created_at=base_dt - timedelta(hours=i * 3),
                )
                counts["inquiries"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {counts['project_types']} project types, "
                f"{counts['spaces']} spaces, "
                f"{counts['portfolios']} portfolios, "
                f"{counts['inquiries']} design requests."
            )
        )
