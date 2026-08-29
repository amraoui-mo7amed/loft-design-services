import requests
import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils.text import slugify
from dashboard.models import Space, SpaceCategory, SpaceCategoryImages


UNSPLASH_SPACE_GALLERY = [
    # ── Living Room (Salon / Séjour) ──
    {"space": "Living Room", "cat": "General", "tag": "Modern Living", "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80"},
    {"space": "Living Room", "cat": "General", "tag": "Japandi Style", "url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80"},
    {"space": "Living Room", "cat": "General", "tag": "Scandinavian", "url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"},
    {"space": "Living Room", "cat": "General", "tag": "Luxury Open Plan", "url": "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=80"},

    # ── Kitchen (Cuisine) ──
    {"space": "Kitchen", "cat": "General", "tag": "Modern Island", "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"},
    {"space": "Kitchen", "cat": "General", "tag": "White Minimalist", "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80"},
    {"space": "Kitchen", "cat": "General", "tag": "Marble Luxury", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"},
    {"space": "Kitchen", "cat": "General", "tag": "Dark Scandinavian", "url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80"},

    # ── Bedroom (Chambre) ──
    {"space": "Bedroom", "cat": "General", "tag": "Master Suite", "url": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80"},
    {"space": "Bedroom", "cat": "General", "tag": "Cozy Neutral", "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80"},
    {"space": "Bedroom", "cat": "General", "tag": "Contemporary Bed", "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"},
    {"space": "Bedroom", "cat": "General", "tag": "Wood Accent", "url": "https://images.unsplash.com/photo-1540518614846-7ede433c457b?w=1200&q=80"},

    # ── Bathroom (Salle de bain) ──
    {"space": "Bathroom", "cat": "General", "tag": "Freestanding Tub", "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80"},
    {"space": "Bathroom", "cat": "General", "tag": "Black & Gold", "url": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80"},
    {"space": "Bathroom", "cat": "General", "tag": "Terrazzo Shower", "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80"},
    {"space": "Bathroom", "cat": "General", "tag": "Spa Marble", "url": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&q=80"},

    # ── Dining Room (Salle à manger) ──
    {"space": "Dining Room", "cat": "General", "tag": "Oak Dining", "url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80"},
    {"space": "Dining Room", "cat": "General", "tag": "Contemporary Table", "url": "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&q=80"},
    {"space": "Dining Room", "cat": "General", "tag": "Sunlit Dining", "url": "https://images.unsplash.com/photo-1533779283484-8da4946aa3e8?w=1200&q=80"},

    # ── Home Office (Bureau) ──
    {"space": "Home Office", "cat": "General", "tag": "Minimalist Desk", "url": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&q=80"},
    {"space": "Home Office", "cat": "General", "tag": "Studio Office", "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80"},
    {"space": "Home Office", "cat": "General", "tag": "Tech Workspace", "url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&q=80"},

    # ── Kids Room (Chambre d'enfant) ──
    {"space": "Kids Room", "cat": "General", "tag": "Pastel Bedroom", "url": "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&q=80"},
    {"space": "Kids Room", "cat": "General", "tag": "Scandinavian Nursery", "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80"},
    {"space": "Kids Room", "cat": "General", "tag": "Playful Space", "url": "https://images.unsplash.com/photo-1596464716127-f2a829822301?w=1200&q=80"},

    # ── Guest Room (Chambre d'amis) ──
    {"space": "Guest Room", "cat": "General", "tag": "Guest Suite", "url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80"},
    {"space": "Guest Room", "cat": "General", "tag": "Boutique Room", "url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80"},
    {"space": "Guest Room", "cat": "General", "tag": "Comfort Corner", "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80"},

    # ── Balcony (Balcon) ──
    {"space": "Balcony", "cat": "General", "tag": "City Balcony", "url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80"},
    {"space": "Balcony", "cat": "General", "tag": "Green Balcony", "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80"},

    # ── Terrace (Terrasse) ──
    {"space": "Terrace", "cat": "General", "tag": "Luxury Terrace", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"},
    {"space": "Terrace", "cat": "General", "tag": "Outdoor Lounge", "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80"},

    # ── Garden (Jardin) ──
    {"space": "Garden", "cat": "General", "tag": "Zen Landscape", "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80"},
    {"space": "Garden", "cat": "General", "tag": "Modern Courtyard", "url": "https://images.unsplash.com/photo-1590725140246-20af57a3e748?w=1200&q=80"},
    {"space": "Garden", "cat": "General", "tag": "Villa Patio", "url": "https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=1200&q=80"},

    # ── Entrance Hall (Hall d'entrée) ──
    {"space": "Entrance Hall", "cat": "General", "tag": "Grand Foyer", "url": "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80"},
    {"space": "Entrance Hall", "cat": "General", "tag": "Console & Mirror", "url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80"},

    # ── Corridor (Couloir) ──
    {"space": "Corridor", "cat": "General", "tag": "Modern Hallway", "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80"},
    {"space": "Corridor", "cat": "General", "tag": "Gallery Corridor", "url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80"},

    # ── Dressing Room (Dressing) ──
    {"space": "Dressing Room", "cat": "General", "tag": "Walk-in Wardrobe", "url": "https://images.unsplash.com/photo-1558997519-83ea9252def8?w=1200&q=80"},
    {"space": "Dressing Room", "cat": "General", "tag": "Custom Dressing", "url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80"},
    {"space": "Dressing Room", "cat": "General", "tag": "Glass Wardrobe", "url": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&q=80"},

    # ── Laundry Room (Buanderie) ──
    {"space": "Laundry Room", "cat": "General", "tag": "Utility Room", "url": "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200&q=80"},
    {"space": "Laundry Room", "cat": "General", "tag": "Clean Laundry", "url": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&q=80"},

    # ── Storage Room (Rangement / Cellier) ──
    {"space": "Storage Room", "cat": "General", "tag": "Pantry Storage", "url": "https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?w=1200&q=80"},
    {"space": "Storage Room", "cat": "General", "tag": "Built-in Units", "url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80"},

    # ── Rooftop (Toit-terrasse) ──
    {"space": "Rooftop", "cat": "General", "tag": "Sunset Rooftop", "url": "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&q=80"},
    {"space": "Rooftop", "cat": "General", "tag": "Panoramic Terrace", "url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80"},

    # ── Study Room (Bibliothèque / Étude) ──
    {"space": "Study Room", "cat": "General", "tag": "Home Library", "url": "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&q=80"},
    {"space": "Study Room", "cat": "General", "tag": "Reading Nook", "url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80"},

    # ── Pool Area (Piscine) ──
    {"space": "Pool Area", "cat": "General", "tag": "Infinity Pool", "url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80"},
    {"space": "Pool Area", "cat": "General", "tag": "Resort Sunbeds", "url": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80"},
    {"space": "Pool Area", "cat": "General", "tag": "Indoor Pool", "url": "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1200&q=80"},

    # ── Master Suite (Suite parentale) ──
    {"space": "Master Suite", "cat": "General", "tag": "Presidential Suite", "url": "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200&q=80"},
    {"space": "Master Suite", "cat": "General", "tag": "Luxury Master", "url": "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=1200&q=80"},

    # ── Lounge & Bar ──
    {"space": "Lounge", "cat": "General", "tag": "Private Cocktail Bar", "url": "https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1200&q=80"},
    {"space": "Lounge", "cat": "General", "tag": "Bespoke Bar", "url": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80"},
    {"space": "Lounge", "cat": "General", "tag": "Modern Villa Interior", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"},
    {"space": "Lounge", "cat": "General", "tag": "Architectural Living", "url": "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&q=80"},
]


class Command(BaseCommand):
    help = "Download 50+ real high-resolution images for all spaces from Unsplash and store them as SpaceCategoryImages gallery records"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Force download even if space category already has images")

    def handle(self, *args, **options):
        force = options.get("force", False)
        media_dir = os.path.join(settings.MEDIA_ROOT, "spaces", "gallery")
        os.makedirs(media_dir, exist_ok=True)
        self.stdout.write(f"Media spaces dir: {media_dir}")

        total_items = len(UNSPLASH_SPACE_GALLERY)
        self.stdout.write(f"Processing {total_items} curated Unsplash interior images...")

        downloaded = 0
        skipped = 0
        failed = 0

        # Ensure all spaces exist
        for idx, item in enumerate(UNSPLASH_SPACE_GALLERY, 1):
            space_name = item["space"]
            cat_name = item.get("cat", "General")
            tag_name = item.get("tag", "")
            url = item["url"]

            space, _ = Space.objects.get_or_create(
                name=space_name,
                defaults={
                    "slug": slugify(space_name),
                    "base_price": 6000.0,
                },
            )

            cat, _ = SpaceCategory.objects.get_or_create(
                space=space,
                category_name=cat_name,
            )

            # Check if this exact image tag/reference already exists
            ref_id = f"{space.slug}-{idx}"
            if not force and SpaceCategoryImages.objects.filter(category=cat, reference=ref_id).exists():
                skipped += 1
                continue

            self.stdout.write(f"[{idx}/{total_items}] Downloading {space.name} ({tag_name}) ... ", ending="")
            try:
                resp = requests.get(
                    url,
                    timeout=30,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
                )
                if resp.status_code == 200 and len(resp.content) >= 1000:
                    filename = f"{space.slug}_{idx}.jpg"
                    is_first = not SpaceCategoryImages.objects.filter(category=cat).exists()
                    SpaceCategoryImages.objects.create(
                        category=cat,
                        image=ContentFile(resp.content, name=filename),
                        is_default=is_first,
                        tags=tag_name,
                        reference=ref_id,
                    )
                    downloaded += 1
                    self.stdout.write(self.style.SUCCESS(f"OK ({len(resp.content)} bytes)"))
                else:
                    failed += 1
                    self.stdout.write(self.style.WARNING(f"HTTP {resp.status_code}"))
            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"Error: {e}"))

        total_images = SpaceCategoryImages.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Downloaded: {downloaded}, Skipped: {skipped}, Failed: {failed}. Total images in database: {total_images}"
        ))
