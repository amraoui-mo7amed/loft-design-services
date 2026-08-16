import io
import json
from PIL import Image
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

from user_auth.models import UserProfile
from dashboard.models import (
    ProjectType, Space, SpaceImage, ProjectTypeSpace,
    Invitation, DesignPackage, DesignRequest
)


def create_test_image(name="test.jpg", color=(255, 214, 90)):
    file_obj = io.BytesIO()
    image = Image.new("RGB", (100, 100), color=color)
    image.save(file_obj, format="JPEG")
    file_obj.seek(0)
    return SimpleUploadedFile(name, file_obj.read(), content_type="image/jpeg")


class SpaceDetailAndGalleryTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser("admin", "admin@test.com", "pass123")
        self.profile = UserProfile.objects.create(
            user=self.admin, role=UserProfile.Role.ADMIN, is_approved=True
        )
        self.client.force_login(self.admin)

        self.pt = ProjectType.objects.create(name="Modern Living")
        self.space = Space.objects.create(name="Living Room", base_price=25000)
        ProjectTypeSpace.objects.create(project_type=self.pt, space=self.space)

        self.img1 = SpaceImage.objects.create(
            space=self.space,
            image=create_test_image("test1.jpg", color=(255, 214, 90)),
            is_thumbnail=True,
            tags="modern luxury",
            description="Warm wooden textures",
        )
        self.img2 = SpaceImage.objects.create(
            space=self.space,
            image=create_test_image("test2.jpg", color=(74, 222, 128)),
            is_thumbnail=False,
            tags="minimalist",
            description="Soft evening ambient light",
        )

    def test_space_detail_get_view(self):
        response = self.client.get(reverse("dash:space_detail", args=[self.space.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/design/space_details.html")
        self.assertEqual(response.context["space"], self.space)
        self.assertEqual(len(response.context["gallery_images"]), 2)

    def test_space_detail_post_update(self):
        response = self.client.post(
            reverse("dash:space_detail", args=[self.space.pk]),
            {
                "name": "Updated Living Room",
                "base_price": "30000.00",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.space.refresh_from_db()
        self.assertEqual(self.space.name, "Updated Living Room")
        self.assertEqual(self.space.base_price, 30000)

    def test_space_image_update_tags_and_description(self):
        response = self.client.post(
            reverse("dash:space_image_update", args=[self.space.pk, self.img2.pk]),
            {
                "tags": "contemporary, bright",
                "description": "Floor-to-ceiling glass panoramic view",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.img2.refresh_from_db()
        self.assertEqual(self.img2.tags, "contemporary, bright")
        self.assertEqual(self.img2.description, "Floor-to-ceiling glass panoramic view")

    def test_space_image_set_thumbnail(self):
        self.assertTrue(self.img1.is_thumbnail)
        self.assertFalse(self.img2.is_thumbnail)

        response = self.client.post(
            reverse("dash:space_image_set_thumbnail", args=[self.space.pk, self.img2.pk]),
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

        self.img1.refresh_from_db()
        self.img2.refresh_from_db()
        self.assertFalse(self.img1.is_thumbnail)
        self.assertTrue(self.img2.is_thumbnail)


class InvitationFeatureTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser("admin", "admin@test.com", "pass123")
        self.profile = UserProfile.objects.create(
            user=self.admin, role=UserProfile.Role.ADMIN, is_approved=True
        )
        self.client.force_login(self.admin)

    def test_invitation_list_view(self):
        Invitation.objects.create(
            email="invited1@example.com", name="Client One", created_by=self.admin
        )
        response = self.client.get(reverse("dash:invitation_list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/admin/invitation_list.html")
        self.assertEqual(response.context["total_count"], 1)

    def test_invitation_create_ajax(self):
        response = self.client.post(
            reverse("dash:invitation_create"),
            {
                "email": "sarah.benali@example.com",
                "name": "Sarah Benali",
                "phone_number": "+213550123456",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertTrue(Invitation.objects.filter(email="sarah.benali@example.com").exists())

    def test_invitation_signup_flow(self):
        invitation = Invitation.objects.create(
            email="client.onboarding@example.com",
            name="Nadia Karim",
            phone_number="+213770987654",
            created_by=self.admin,
        )
        self.assertFalse(invitation.is_accepted)

        # Anonymous client accesses the invitation link
        anon_client = Client()
        signup_url = reverse("user_auth:invitation_signup", kwargs={"uuid": invitation.uuid})
        get_res = anon_client.get(signup_url)
        self.assertEqual(get_res.status_code, 200)
        self.assertTemplateUsed(get_res, "auth/invitation_signup.html")

        # Submit signup
        post_res = anon_client.post(
            signup_url,
            {
                "first_name": "Nadia",
                "last_name": "Karim",
                "password": "SecurePassword123",
                "confirm_password": "SecurePassword123",
                "phone_number": "+213770987654",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(post_res.status_code, 200)
        data = post_res.json()
        self.assertTrue(data.get("success"), msg=str(data))

        # Verify user & profile created with role Customer (client)
        user = User.objects.get(email="client.onboarding@example.com")
        self.assertEqual(user.profile.role, UserProfile.Role.CUSTOMER)
        self.assertTrue(user.profile.is_approved)

        # Verify invitation marked accepted
        invitation.refresh_from_db()
        self.assertTrue(invitation.is_accepted)
        self.assertIsNotNone(invitation.accepted_at)
