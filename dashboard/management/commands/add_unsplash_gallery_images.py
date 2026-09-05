import hashlib
import time
import urllib.request

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from dashboard.models import Space, SpaceCategory, SpaceCategoryImages

# Real Unsplash photo IDs (from images.unsplash.com/photo-<id>), spread across
# the site's core "General" gallery categories. Sourced by browsing Unsplash
# search results for each room type and verifying the resulting CDN URLs.
GALLERY_IMAGES = {
    "living-room": [
        "1564078516393-cf04bd966897",
        "1724582586529-62622e50c0b3",
        "1705321963943-de94bb3f0dd3",
        "1646987916641-1f3c8992daa2",
        "1720247520862-7e4b14176fa8",
        "1705326701287-346fc37a2c86",
    ],
    "kitchen": [
        "1722605090433-41d1183a792d",
        "1502005097973-6a7082348e28",
        "1725257928373-dc6d2ac7b145",
        "1663811396777-05505d999151",
        "1671197244266-73129c97c096",
        "1656402887556-e727ffe1f6d7",
    ],
    "bedroom": [
        "1616594039964-ae9021a400a0",
        "1750420556288-d0e32a6f517b",
        "1720420021124-4e18564e070f",
        "1696762932825-2737db830bbe",
        "1642541070065-3912f347e7c6",
        "1604580040660-f0a7f9abaea6",
    ],
    "bathroom": [
        "1661107259637-4e1c55462428",
        "1576698483491-8c43f0862543",
        "1733426107854-ee00a25d72a7",
        "1650894622076-e09ab837c502",
        "1643949700215-e61cdca053f7",
        "1642755622932-d1e0cb783dc5",
    ],
    "dining-room": [
        "1656403002413-2ac6137237d6",
        "1600488999806-8efb986d87b1",
        "1752004028694-72610be3604e",
        "1706820229870-f9a8c6dac193",
        "1684928365214-5392bfb8a57e",
        "1685644201646-9e836c398c92",
    ],
    "home-office": [
        "1600494603989-9650cf6ddd3d",
        "1518455027359-f3f8164ba6bd",
        "1595846723416-99a641e1231a",
        "1595846519845-68e298c2edd8",
        "1666876644556-05f782fe49da",
        "1657757996603-acec063f1d9b",
    ],
    "garden": [
        "1597201278257-3687be27d954",
        "1668120089662-42642838cfef",
        "1700689807667-82630348b301",
        "1695616827909-6f147f22d40f",
        "1663185777390-d44a6f4724b9",
        "1686663048931-6df69f577a2f",
    ],
    "terrace": [
        "1600210492090-a159ffa3aeaf",
        "1637267283847-99de76bddeeb",
        "1637267286334-745a8bb11003",
        "1637267286338-068462128026",
        "1637267285101-7816ee8b6bd0",
        "1613317447829-eea2ed59640f",
    ],
    "balcony": [
        "1524549207884-e7d1130ae2f3",
        "1551583996-f0a1d53f5bfd",
        "1644786764518-619ac6e74a51",
        "1551776587-3f857ade004d",
        "1635933036183-d1f250072745",
        "1629655003719-55860b5a1dcf",
    ],
    "corridor": [
        "1696986324639-caa0590be25f",
        "1628744876657-abd5086695dc",
        "1527781277828-b91cf323503a",
        "1765766599489-fd53df7f8724",
        "1739172586862-80edb0432fba",
        "1768836180171-24c727a594b8",
    ],
    "kids-room": [
        "1600493505500-afac3fc363e6",
        "1763478958800-3a2a6321f645",
        "1600493504483-8df7098b5792",
        "1769690399035-2f4e60edf2ea",
        "1771862956412-6ce9a725eb22",
        "1769690398773-7bd5122ab719",
    ],
    "guest-room": [
        "1765547090903-348b711f0eee",
        "1661351240151-fa45627490ef",
        "1661351267283-5ccf58695e6d",
        "1621215052063-6ed29c948b31",
        "1626031449324-ad0bd02c16d0",
        "1765464184843-105e144bd54b",
    ],
    "laundry-room": [
        "1626806819282-2c1dc01a5e0c",
        "1626806787461-102c1bfaaea1",
        "1655041448985-f6666cba2d6c",
        "1646592474094-342fbc28736c",
        "1701421048900-e0adbde9b90c",
        "1682888818612-1c18ebecf3ec",
    ],
    "storage-room": [
        "1649361811423-a55616f7ab11",
        "1708397016786-8916880649b8",
        "1611048268330-53de574cae3b",
        "1687953413905-731f620177ae",
        "1640357154220-9775b0f31dec",
        "1532646195885-5c09e5c45934",
    ],
    "rooftop": [
        "1786520404178-67b82d4dc7c9",
        "1766938979504-6172139eefd5",
        "1777950797674-8d73d0352d13",
        "1762195804066-2fece9b24496",
        "1693035647475-f1a27bdade28",
        "1772817259738-941b9f5f30b2",
    ],
    "entrance-hall": [
        "1704383014646-2123f9dc8137",
        "1670897014295-addc0dadf8f3",
        "1696158773201-b726a0ce6d6e",
        "1665285255745-f1d9453d109c",
        "1712063680618-c1883afb1a5a",
        "1758194090785-8e09b7288199",
    ],
    "study-room": [
        "1739918075668-fc7844c6d921",
        "1761834520785-ca17a0275f6d",
        "1783835541984-23466153e819",
        "1774215915219-0daacf6e5977",
        "1758762296609-6b78f0ebbcce",
        "1780245996299-debc9e1d4c1d",
    ],
    "pool-area": [
        "1729866097380-88243b1d90ad",
        "1717404719828-a443f37235ae",
        "1615280238397-0011ad88a682",
        "1711114435495-76503f9f3181",
        "1749224725848-a450483cd75d",
        "1544984243-ec57ea16fe25",
    ],
}


class Command(BaseCommand):
    help = "Populate each core space's 'General' gallery category with real photos hotlinked-then-downloaded from Unsplash."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="List what would be added without writing to the DB.")

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        total_created, total_skipped, total_failed = 0, 0, 0

        for slug, photo_ids in GALLERY_IMAGES.items():
            space = Space.objects.filter(slug=slug).first()
            if not space:
                self.stdout.write(self.style.WARNING(f"Space not found, skipping: {slug}"))
                continue

            category, _ = SpaceCategory.objects.get_or_create(space=space, category_name="General")
            existing_count = category.images.count()

            for idx, photo_id in enumerate(photo_ids, start=1):
                url = f"https://images.unsplash.com/photo-{photo_id}?w=1400&q=80&auto=format&fit=crop"
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=25) as resp:
                        img_bytes = resp.read()
                except Exception as e:
                    total_failed += 1
                    self.stdout.write(self.style.ERROR(f"  [{space.name}] failed to fetch {photo_id}: {e}"))
                    continue

                content_hash = hashlib.sha256(img_bytes).hexdigest()
                if SpaceCategoryImages.objects.filter(category=category, content_hash=content_hash).exists():
                    total_skipped += 1
                    self.stdout.write(f"  [{space.name}] already have {photo_id}, skipping")
                    continue

                if dry_run:
                    self.stdout.write(f"  [{space.name}] would add {photo_id} ({len(img_bytes)} bytes)")
                    total_created += 1
                    continue

                filename = f"{slug}-unsplash-{existing_count + idx:02d}.jpg"
                SpaceCategoryImages.objects.create(
                    category=category,
                    image=ContentFile(img_bytes, name=filename),
                    is_default=False,
                    content_hash=content_hash,
                    description=f"{space.name} — inspiration",
                    tags=f"{space.name}, Design d'intérieur, Loft Design",
                    reference=f"unsplash-{photo_id}",
                )
                total_created += 1
                self.stdout.write(self.style.SUCCESS(f"  [{space.name}] added {photo_id}"))
                time.sleep(0.2)

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Created: {total_created}, skipped (duplicate): {total_skipped}, failed: {total_failed}."
        ))
