from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from decouple import config
from user_auth.models import UserProfile


class Command(BaseCommand):
    help = "Creates or updates the admin superuser from .env settings"

    def handle(self, *args, **options):
        username = config("ADMIN_USERNAME", default="admin")
        email = config("ADMIN_EMAIL", default="admin@loftdesign.com")
        password = config("ADMIN_PASSWORD", default="admin123")
        first_name = config("ADMIN_FIRST_NAME", default="Admin")
        last_name = config("ADMIN_LAST_NAME", default="Loft")

        with transaction.atomic():
            user, created = User.objects.update_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_staff": True,
                    "is_superuser": True,
                },
            )
            if created:
                user.set_password(password)
                user.save()

            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "role": UserProfile.Role.ADMIN,
                    "is_approved": True,
                },
            )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Admin '{username}' created successfully."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Admin '{username}' updated successfully."))
