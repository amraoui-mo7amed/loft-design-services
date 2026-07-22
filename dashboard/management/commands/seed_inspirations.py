import requests
import time
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from dashboard.models import Space, InspirationImage

IMAGES_PER_SPACE = 8
MAX_RETRIES = 2


class Command(BaseCommand):
    help = "Download real inspiration images for all spaces from picsum.photos"

    def _download(self, url, retries=MAX_RETRIES):
        for attempt in range(retries + 1):
            try:
                resp = requests.get(
                    url,
                    timeout=60,
                    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"},
                )
                if resp.status_code == 200 and len(resp.content) >= 1000:
                    return resp.content
            except Exception:
                pass
            if attempt < retries:
                time.sleep(2)
        return None

    def handle(self, *args, **options):
        spaces = Space.objects.filter(active=True)
        self.stdout.write(f"Found {spaces.count()} spaces")

        for space in spaces:
            existing = InspirationImage.objects.filter(space=space).count()
            needed = IMAGES_PER_SPACE - existing
            self.stdout.write(f"\n{space.name}: {existing} existing, {needed} needed")

            if needed <= 0:
                self.stdout.write(self.style.SUCCESS("  Already has enough images"))
                continue

            for n in range(1, needed + 1):
                seed = f"insp-{space.slug}-{existing + n}"
                url = f"https://picsum.photos/seed/{seed}/640/480"
                title = f"{space.name} Inspiration #{existing + n}"

                self.stdout.write(f"  [{n}/{needed}] {title} ... ", ending="")
                content = self._download(url)
                if content is None:
                    self.stdout.write(self.style.ERROR("FAILED after retries"))
                    continue

                filename = f"{seed}.jpg"
                img = InspirationImage(
                    space=space,
                    title=title,
                )
                img.image.save(filename, ContentFile(content), save=True)
                self.stdout.write(self.style.SUCCESS("OK"))

        self.stdout.write(self.style.SUCCESS("\nDone"))
