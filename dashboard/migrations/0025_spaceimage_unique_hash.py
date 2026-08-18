# Generated manually to add unique constraint after deduping existing data
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0024_spaceimage_content_hash"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="spaceimage",
            constraint=models.UniqueConstraint(
                condition=~models.Q(content_hash=""),
                fields=("space", "content_hash"),
                name="unique_space_image_content_hash",
            ),
        ),
    ]
