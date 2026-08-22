import io
from PIL import Image

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse

from dashboard.models import (
    Contact,
    Service,
    Lead,
    ProjectType,
    ProjectTypeSpace,
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    Video,
)


def create_test_image(name="test.jpg", color=(255, 214, 90)):
    file_obj = io.BytesIO()
    image = Image.new("RGB", (100, 100), color=color)
    image.save(file_obj, format="JPEG")
    file_obj.seek(0)
    return SimpleUploadedFile(name, file_obj.read(), content_type="image/jpeg")


class FrontendGalleryAndHomeTests(TestCase):
    def setUp(self):
        self.client = Client()
        
        # Create ProjectType & Space
        self.project_type = ProjectType.objects.create(name="Residential", featured_on_home=True)
        self.space1 = Space.objects.create(name="Living Room", base_price=15000)
        self.space2 = Space.objects.create(name="Kitchen", base_price=20000)
        
        ProjectTypeSpace.objects.create(
            project_type=self.project_type,
            space=self.space1,
            show_on_home=True,
            sort_order=1,
        )
        ProjectTypeSpace.objects.create(
            project_type=self.project_type,
            space=self.space2,
            show_on_home=True,
            sort_order=2,
        )

        self.cat1 = SpaceCategory.objects.create(space=self.space1, category_name="Living General")
        self.cat2 = SpaceCategory.objects.create(space=self.space2, category_name="Kitchen General")
        
        # Create Images for spaces with distinct colors
        self.img1 = SpaceCategoryImages.objects.create(
            category=self.cat1,
            image=create_test_image("living1.jpg", color=(255, 214, 90)),
            is_default=True,
            description="Cozy modern living room with warm light",
            tags="cozy modern warm",
        )
        self.img2 = SpaceCategoryImages.objects.create(
            category=self.cat1,
            image=create_test_image("living2.jpg", color=(74, 222, 128)),
            is_default=False,
            description="Minimalist sofa setup",
            tags="minimalist sofa",
        )
        self.img3 = SpaceCategoryImages.objects.create(
            category=self.cat2,
            image=create_test_image("kitchen1.jpg", color=(139, 92, 246)),
            is_default=True,
            description="Modern scandinavian kitchen",
            tags="modern kitchen wooden",
        )

    def test_home_view(self):
        response = self.client.get(reverse("frontend:home"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "home.html")
        self.assertIn("spaces", response.context)

    def test_gallery_all_spaces_view(self):
        response = self.client.get(reverse("frontend:space_gallery"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "gallery.html")
        self.assertFalse(response.context["is_single_space"])
        self.assertEqual(len(response.context["spaces"]), 2)
        # Default renders featured/thumbnail images
        images = list(response.context["images"])
        self.assertEqual(len(images), 2)
        self.assertIn(self.img1, images)
        self.assertIn(self.img3, images)

    def test_gallery_search_by_tag_or_description(self):
        response = self.client.get(reverse("frontend:space_gallery"), {"q": "minimalist"})
        self.assertEqual(response.status_code, 200)
        images = list(response.context["images"])
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0], self.img2)

    def test_gallery_filter_by_space(self):
        response = self.client.get(reverse("frontend:space_gallery"), {"spaces": [self.space2.pk]})
        self.assertEqual(response.status_code, 200)
        images = list(response.context["images"])
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0], self.img3)

    def test_gallery_single_space_view(self):
        response = self.client.get(reverse("frontend:space_gallery_space", kwargs={"space_pk": self.space1.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context["is_single_space"])
        self.assertEqual(response.context["space"], self.space1)
        images = list(response.context["images"])
        self.assertEqual(len(images), 2)
        self.assertIn(self.img1, images)
        self.assertIn(self.img2, images)


class FrontendContactAndLeadTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_contact_form_submission_success(self):
        payload = {
            "first_name": "Karim",
            "last_name": "Brahimi",
            "email": "karim.brahimi@example.com",
            "phone": "+213550112233",
            "message": "I would like a quote for my apartment in Algiers.",
        }
        response = self.client.post(
            reverse("frontend:submit_contact"),
            payload,
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))

        contact = Contact.objects.filter(email="karim.brahimi@example.com").first()
        self.assertIsNotNone(contact)
        self.assertEqual(contact.name, "Karim Brahimi")
        self.assertEqual(contact.phone, "+213550112233")
        self.assertEqual(contact.message, "I would like a quote for my apartment in Algiers.")

        lead = Lead.objects.filter(email="karim.brahimi@example.com").first()
        self.assertIsNotNone(lead)
        self.assertEqual(lead.name, "Karim Brahimi")

    def test_contact_form_missing_required_fields(self):
        payload = {
            "first_name": "",
            "last_name": "Brahimi",
            "email": "invalid-email",
            "message": "",
        }
        response = self.client.post(
            reverse("frontend:submit_contact"),
            payload,
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data.get("success"))
        self.assertIn("errors", data)
        self.assertTrue(len(data["errors"]) > 0)

    def test_submit_public_gallery_selection(self):
        import json
        payload = {
            "name": "Nadia Amrani",
            "email": "nadia.amrani@example.com",
            "phone": "+213661223344",
            "notes": "Love the scandinavian warm style",
            "items": ["Salon - Contemporain", "Cuisine - Moderne"],
        }
        response = self.client.post(
            reverse("frontend:submit_public_gallery_selection"),
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"), msg=str(data))

        from dashboard.models import Lead, Contact
        lead = Lead.objects.filter(email="nadia.amrani@example.com").first()
        self.assertIsNotNone(lead)
        self.assertEqual(lead.name, "Nadia Amrani")

        contact = Contact.objects.filter(email="nadia.amrani@example.com").first()
        self.assertIsNotNone(contact)
        self.assertIn("Salon - Contemporain", contact.message)

