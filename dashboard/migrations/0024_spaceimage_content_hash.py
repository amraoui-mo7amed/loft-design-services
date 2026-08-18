# Generated manually for unique SpaceImage content hashing
import hashlib

from django.db import migrations, models


def backfill_hashes(apps, schema_editor):
    SpaceImage = apps.get_model("dashboard", "SpaceImage")
    for img in SpaceImage.objects.all().iterator():
        if img.content_hash:
            continue
        try:
            img.image.seek(0)
            digest = hashlib.sha256(img.image.read()).hexdigest()
            img.image.seek(0)
        except Exception:
            digest = ""
        if digest:
            img.content_hash = digest
            img.save(update_fields=["content_hash"])


def dedupe_images(apps, schema_editor):
    SpaceImage = apps.get_model("dashboard", "SpaceImage")
    seen = {}
    to_delete = []
    thumb_override = {}
    for img in SpaceImage.objects.order_by("id").all().iterator():
        key = (img.space_id, img.content_hash)
        if not img.content_hash:
            continue
        if key in seen:
            to_delete.append(img.pk)
            if img.is_thumbnail:
                thumb_override[seen[key]] = True
        else:
            seen[key] = img.pk
    SpaceImage.objects.filter(pk__in=to_delete).delete()
    for img_id in thumb_override:
        SpaceImage.objects.filter(pk=img_id).update(is_thumbnail=True)


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0023_alter_portfolio_description_alter_portfolio_title"),
    ]

    operations = [
        migrations.AddField(
            model_name="spaceimage",
            name="content_hash",
            field=models.CharField(
                blank=True,
                default="",
                editable=False,
                max_length=64,
                verbose_name="Content Hash",
            ),
        ),
        migrations.RunPython(backfill_hashes, migrations.RunPython.noop),
        migrations.RunPython(dedupe_images, migrations.RunPython.noop),
    ]
