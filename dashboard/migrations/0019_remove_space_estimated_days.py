from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0018_designrequestspaceimage_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='space',
            name='estimated_days',
        ),
    ]
