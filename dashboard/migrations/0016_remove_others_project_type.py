from django.db import migrations


def remove_others_type(apps, schema_editor):
    ProjectType = apps.get_model("dashboard", "ProjectType")
    ProjectType.objects.filter(slug="others").delete()


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0015_alter_projecttypespace_unique_together_and_more'),
    ]

    operations = [
        migrations.RunPython(remove_others_type, migrations.RunPython.noop),
    ]
