import requests
import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils.text import slugify
from dashboard.models import Space, SpaceCategory, SpaceCategoryImages


SPACE_IMAGES = [
    ("Living Room", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"),
    ("Kitchen", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"),
    ("Bedroom", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"),
    ("Bathroom", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"),
    ("Dining Room", "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80"),
    ("Home Office", "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80"),
    ("Garden", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80"),
    ("Terrace", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"),
    ("Balcony", "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80"),
    ("Corridor", "https://picsum.photos/seed/corridor/640/480"),
    ("Kids Room", "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80"),
    ("Guest Room", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"),
    ("Laundry Room", "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&q=80"),
    ("Storage Room", "https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?w=800&q=80"),
    ("Rooftop", "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80"),
    ("Entrance Hall", "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80"),
    ("Study Room", "https://picsum.photos/seed/studyroom/640/480"),
    ("Pool Area", "https://picsum.photos/seed/poolarea/640/480"),
]


class Command(BaseCommand):
    help = "Download real images for all spaces and store them as SpaceCategoryImages gallery records"

    def handle(self, *args, **options):
        media_dir = os.path.join(settings.MEDIA_ROOT, "spaces", "gallery")
        os.makedirs(media_dir, exist_ok=True)
        self.stdout.write(f"Media spaces dir: {media_dir}")

        name_to_url = dict(SPACE_IMAGES)
        qs = Space.objects.all()
        self.stdout.write(f"Found {qs.count()} spaces")

        for space in qs:
            url = name_to_url.get(space.name)
            if not url:
                self.stdout.write(self.style.WARNING(f"No URL for {space.name}"))
                continue

            cat, _ = SpaceCategory.objects.get_or_create(space=space, category_name="General")

            if cat.images.exists():
                self.stdout.write(f"  {space.name} already has gallery images, skipping")
                continue

            self.stdout.write(f"  Downloading {space.name} ... ", ending="")
            try:
                resp = requests.get(
                    url,
                    timeout=30,
                    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"},
                )
                self.stdout.write(f"HTTP {resp.status_code} ({len(resp.content)} bytes) ", ending="")

                if resp.status_code != 200 or len(resp.content) < 1000:
                    self.stdout.write(self.style.WARNING("SKIP"))
                    continue

                filename = f"{space.slug}.jpg"
                SpaceCategoryImages.objects.create(
                    category=cat,
                    image=ContentFile(resp.content, name=filename),
                    is_default=True,
                )
                self.stdout.write(self.style.SUCCESS("OK"))
            except requests.exceptions.ConnectionError as e:
                self.stdout.write(self.style.ERROR(f"ConnectionError: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"{type(e).__name__}: {e}"))

        self.stdout.write(self.style.SUCCESS("Done"))
