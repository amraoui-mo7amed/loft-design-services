from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from decouple import config
from user_auth.models import UserProfile


class Command(BaseCommand):
    help = "Creates or updates the admin superuser and profile from .env settings"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-password",
            action="store_true",
            help="Reset the admin password to the configured password",
        )

    def handle(self, *args, **options):
        username = config("ADMIN_USERNAME", default="admin")
        email = config("ADMIN_EMAIL", default="admin@loftdesign.com")
        password = config("ADMIN_PASSWORD", default="admin123")
        first_name = config("ADMIN_FIRST_NAME", default="Admin")
        last_name = config("ADMIN_LAST_NAME", default="Loft")

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                },
            )
            if created or options.get("reset_password"):
                user.set_password(password)

            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()

            profile, prof_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    "role": UserProfile.Role.ADMIN,
                    "is_approved": True,
                },
            )
            if not prof_created and (profile.role != UserProfile.Role.ADMIN or not profile.is_approved):
                profile.role = UserProfile.Role.ADMIN
                profile.is_approved = True
                profile.save()

        action = "created" if created else "initialized/updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"Admin user '{username}' successfully {action} (staff=True, superuser=True, role=ADMIN, approved=True)."
            )
        )
