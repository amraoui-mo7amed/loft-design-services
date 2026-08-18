import io
import json
from decimal import Decimal
from PIL import Image
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

from user_auth.models import UserProfile
from dashboard.models import (
    ProjectType, Space, SpaceCategory, SpaceCategoryImages, ProjectTypeSpace,
    Invitation, Service, DesignRequest
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
        self.cat = SpaceCategory.objects.create(space=self.space, category_name="General")

        self.img1 = SpaceCategoryImages.objects.create(
            category=self.cat,
            image=create_test_image("test1.jpg", color=(255, 214, 90)),
            is_default=True,
            tags="modern luxury",
            description="Warm wooden textures",
        )
        self.img2 = SpaceCategoryImages.objects.create(
            category=self.cat,
            image=create_test_image("test2.jpg", color=(74, 222, 128)),
            is_default=False,
            tags="minimalist",
            description="Soft evening ambient light",
        )

    def test_space_detail_get_view(self):
        response = self.client.get(reverse("dash:space_detail", args=[self.space.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/design/space_details.html")
        self.assertEqual(response.context["space"], self.space)
        self.assertEqual(len(response.context["categories"]), 1)

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

    def test_space_category_create(self):
        response = self.client.post(
            reverse("dash:space_category_create", args=[self.space.pk]),
            {"category_name": "Scandinavian"},
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertTrue(SpaceCategory.objects.filter(space=self.space, category_name="Scandinavian").exists())

    def test_space_image_update_tags_and_description(self):
        response = self.client.post(
            reverse("dash:space_image_update", args=[self.space.pk, self.img2.pk]),
            {
                "reference": "REF-LIV-990",
                "tags": "contemporary, bright",
                "description": "Floor-to-ceiling glass panoramic view",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["reference"], "REF-LIV-990")
        self.img2.refresh_from_db()
        self.assertEqual(self.img2.reference, "REF-LIV-990")
        self.assertEqual(self.img2.tags, "contemporary, bright")
        self.assertEqual(self.img2.description, "Floor-to-ceiling glass panoramic view")

    def test_space_image_set_default(self):
        self.assertTrue(self.img1.is_default)
        self.assertFalse(self.img2.is_default)

        response = self.client.post(
            reverse("dash:space_category_image_set_default", args=[self.space.pk, self.img2.pk]),
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

        self.img1.refresh_from_db()
        self.img2.refresh_from_db()
        self.assertFalse(self.img1.is_default)
        self.assertTrue(self.img2.is_default)


class ServiceFeatureTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser("admin", "admin@test.com", "pass123")
        self.profile = UserProfile.objects.create(
            user=self.admin, role=UserProfile.Role.ADMIN, is_approved=True
        )
        self.client.force_login(self.admin)

    def test_service_list_view(self):
        Service.objects.create(service_name="3D Renders", service_price=15000, is_default=True)
        response = self.client.get(reverse("dash:service_list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/design/service_list.html")

    def test_service_create(self):
        response = self.client.post(
            reverse("dash:service_create"),
            {
                "service_name": "Execution Plans",
                "pricing_type": "area",
                "service_price": "2500",
                "video_link": "https://youtube.com/watch?v=12345",
                "is_default": "1",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        svc = Service.objects.get(service_name="Execution Plans")
        self.assertEqual(svc.pricing_type, "area")
        self.assertEqual(svc.service_price, Decimal("2500"))
        self.assertEqual(svc.video_link, "https://youtube.com/watch?v=12345")
        self.assertTrue(svc.is_default)

    def test_dash_home_view(self):
        service = Service.objects.create(service_name="3D Renders", service_price=15000, is_default=True)
        pt = ProjectType.objects.create(name="Modern Villa")
        DesignRequest.objects.create(
            client=self.admin,
            project_name="Villa Project",
            project_type=pt,
            service=service,
            total=45000,
        )
        response = self.client.get(reverse("dash:dash_home"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dash/dash_home.html")


class RequestFlowFeatureTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.pt = ProjectType.objects.create(name="Modern Villa", slug="modern-villa")
        self.svc = Service.objects.create(
            service_name="Complete Design",
            pricing_type=Service.PricingType.AREA,
            service_price=Decimal("2000"),
            is_default=True,
        )

    def test_request_flow_get(self):
        response = self.client.get(reverse("design_service"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/wizard/request_flow.html")

    def test_request_flow_post_session(self):
        payload = {
            "project_type_slug": "modern-villa",
            "project_type_name": "Modern Villa",
            "floors_above": 2,
            "floors_below": 1,
            "has_terrace": True,
            "floors": [
                {"name": "Sous-sol S-1", "surface": 100},
                {"name": "Rez-de-Chaussée (RDC)", "surface": 150},
                {"name": "Étage R+1", "surface": 120},
                {"name": "Étage R+2", "surface": 120},
                {"name": "Terrasse", "surface": 80},
            ],
            "total_surface": 570,
            "first_name": "Samir",
            "last_name": "Dahmani",
            "email": "samir@example.com",
            "phone": "+213555123456",
        }
        response = self.client.post(
            reverse("design_service"),
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["redirect_url"], reverse("request_step5"))

    def test_request_step5_standalone_page(self):
        session = self.client.session
        session["request_flow_data"] = {
            "project_type_slug": "modern-villa",
            "project_type_name": "Modern Villa",
            "total_surface": 350,
            "first_name": "Samir",
            "last_name": "Dahmani",
        }
        session.save()

        response = self.client.get(reverse("request_step5"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "dashboard/wizard/request_step5.html")
        self.assertIn("services", response.context)

    def test_submit_design_request_endpoint(self):
        payload = {
            "project_type_slug": "modern-villa",
            "project_type_name": "Modern Villa",
            "floors_above": 1,
            "floors_below": 0,
            "has_terrace": False,
            "floors": [
                {"name": "Rez-de-Chaussée (RDC)", "surface": 150, "level": 0},
                {"name": "Étage R+1", "surface": 120, "level": 1},
            ],
            "total_surface": 270,
            "service_id": self.svc.pk,
            "total": 540000,
            "first_name": "Amine",
            "last_name": "Meziane",
            "email": "amine@example.com",
            "phone": "+213661123456",
        }
        response = self.client.post(
            reverse("request_submit"),
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

        req = DesignRequest.objects.get(email="amine@example.com")
        self.assertEqual(req.first_name, "Amine")
        self.assertEqual(req.total_surface, Decimal("270"))
        self.assertEqual(req.total, Decimal("540000"))
        self.assertEqual(req.service, self.svc)
        self.assertEqual(req.floors.count(), 2)
        rdc_floor = req.floors.get(level=0)
        self.assertEqual(rdc_floor.surface, Decimal("150"))


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

        anon_client = Client()
        signup_url = reverse("user_auth:invitation_signup", kwargs={"uuid": invitation.uuid})
        get_res = anon_client.get(signup_url)
        self.assertEqual(get_res.status_code, 200)
        self.assertTemplateUsed(get_res, "auth/invitation_signup.html")

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

        user = User.objects.get(email="client.onboarding@example.com")
        self.assertEqual(user.profile.role, UserProfile.Role.CUSTOMER)
        self.assertTrue(user.profile.is_approved)

        invitation.refresh_from_db()
        self.assertTrue(invitation.is_accepted)
        self.assertIsNotNone(invitation.accepted_at)


class ProjectGalleryInvitationAndSelectionTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser("admin_user", "admin@loftdesign.com", "pass123")
        UserProfile.objects.create(user=self.admin, role=UserProfile.Role.ADMIN, is_approved=True)

        self.pt = ProjectType.objects.create(name="Luxury Villa")
        self.space = Space.objects.create(name="Living Area", base_price=30000)
        ProjectTypeSpace.objects.create(project_type=self.pt, space=self.space)
        self.cat = SpaceCategory.objects.create(space=self.space, category_name="Modern Art")
        self.img1 = SpaceCategoryImages.objects.create(
            category=self.cat,
            image=create_test_image("img1.jpg", color=(255, 100, 50)),
            is_default=True,
            description="Luxury marble style",
        )
        self.img2 = SpaceCategoryImages.objects.create(
            category=self.cat,
            image=create_test_image("img2.jpg", color=(50, 100, 255)),
            is_default=False,
            description="Scandinavian minimalist style",
        )

        self.project = DesignRequest.objects.create(
            first_name="Karim",
            last_name="Amrani",
            email="karim.amrani@example.com",
            phone="+213555123456",
            project_name="Villa Sahel",
            project_type=self.pt,
            total_surface=350,
            total=150000,
        )

    def test_admin_send_gallery_link(self):
        self.client.force_login(self.admin)
        url = reverse("dash:admin_send_gallery_link", kwargs={"pk": self.project.pk})
        res = self.client.post(
            url,
            {"email": "karim.amrani@example.com"},
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"), msg=str(data))
        self.assertTrue(self.project.gallery_invitations.filter(email="karim.amrani@example.com").exists())

    def test_client_gallery_selection_and_submission_flow(self):
        from dashboard.models import ProjectGalleryInvitation, Notification

        invitation = ProjectGalleryInvitation.objects.create(
            design_request=self.project,
            email=self.project.email,
            is_used=False,
        )
        anon_client = Client()

        # 1. Open selection view
        select_url = reverse("frontend:gallery_client_selection", kwargs={"token": invitation.token})
        get_res = anon_client.get(select_url)
        self.assertEqual(get_res.status_code, 200)
        self.assertTemplateUsed(get_res, "gallery_client_select.html")
        self.assertIn(self.space, get_res.context["spaces"])

        # Test search filter
        search_res = anon_client.get(f"{select_url}?q=marble")
        self.assertEqual(search_res.status_code, 200)
        self.assertEqual(len(search_res.context["images"]), 1)
        self.assertEqual(search_res.context["images"][0].pk, self.img1.pk)

        # 2. Submit moodboard selection
        submit_url = reverse("frontend:gallery_client_selection_submit", kwargs={"token": invitation.token})
        post_res = anon_client.post(
            submit_url,
            json.dumps({"image_ids": [self.img1.pk, self.img2.pk], "notes": "Prefer gold accents"}),
            content_type="application/json",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(post_res.status_code, 200)
        post_data = post_res.json()
        self.assertTrue(post_data["success"])

        # 3. Verify invitation is marked used
        invitation.refresh_from_db()
        self.assertTrue(invitation.is_used)
        self.assertIsNotNone(invitation.used_at)

        # 4. Verify gallery selections saved
        self.assertEqual(self.project.gallery_selections.count(), 2)

        # 5. Verify admin notification generated
        self.assertTrue(Notification.objects.filter(user=self.admin, notification_type="gallery").exists())

        # 6. Verify subsequent submission is rejected
        second_res = anon_client.post(
            submit_url,
            json.dumps({"image_ids": [self.img1.pk]}),
            content_type="application/json",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertFalse(second_res.json()["success"])

        # 7. Verify view now displays submitted confirmation
        confirm_res = anon_client.get(select_url)
        self.assertEqual(confirm_res.status_code, 200)
        self.assertTemplateUsed(confirm_res, "gallery_client_submitted.html")
