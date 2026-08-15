import io
from PIL import Image

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse

from dashboard.models import (
    Contact,
    DesignPackage,
    Lead,
    ProjectType,
    ProjectTypeSpace,
    Space,
    SpaceImage,
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
        
        # Create Images for spaces with distinct colors
        self.img1 = SpaceImage.objects.create(
            space=self.space1,
            image=create_test_image("living1.jpg", color=(255, 214, 90)),
            is_thumbnail=True,
            description="Cozy modern living room with warm light",
            tags="cozy modern warm",
        )
        self.img2 = SpaceImage.objects.create(
            space=self.space1,
            image=create_test_image("living2.jpg", color=(74, 222, 128)),
            is_thumbnail=False,
            description="Minimalist sofa setup",
            tags="minimalist sofa",
        )
        self.img3 = SpaceImage.objects.create(
            space=self.space2,
            image=create_test_image("kitchen1.jpg", color=(139, 92, 246)),
            is_thumbnail=True,
            description="Modern scandinavian kitchen",
            tags="modern kitchen wooden",
        )

    def test_home_view_includes_gallery_spaces(self):
        response = self.client.get(reverse("frontend:home"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "home.html")
        self.assertIn("gallery_spaces", response.context)
        self.assertEqual(len(response.context["gallery_spaces"]), 2)
        space_names = [s["name"] for s in response.context["gallery_spaces"]]
        self.assertIn("Living Room", space_names)
        self.assertIn("Kitchen", space_names)

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

    def test_gallery_filter_by_selected_spaces(self):
        response = self.client.get(reverse("frontend:space_gallery"), {"spaces": [str(self.space2.pk)]})
        self.assertEqual(response.status_code, 200)
        images = list(response.context["images"])
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0], self.img3)

    def test_gallery_single_space_view(self):
        response = self.client.get(reverse("frontend:space_gallery", kwargs={"space_pk": self.space1.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "gallery.html")
        self.assertTrue(response.context["is_single_space"])
        self.assertEqual(response.context["space"], self.space1)
        images = list(response.context["images"])
        self.assertEqual(len(images), 2)
        self.assertIn(self.img1, images)
        self.assertIn(self.img2, images)

    def test_gallery_single_space_search(self):
        response = self.client.get(
            reverse("frontend:space_gallery", kwargs={"space_pk": self.space1.pk}),
            {"q": "cozy"},
        )
        self.assertEqual(response.status_code, 200)
        images = list(response.context["images"])
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0], self.img1)

    def test_gallery_single_space_not_found(self):
        response = self.client.get(reverse("frontend:space_gallery", kwargs={"space_pk": 99999}))
        self.assertEqual(response.status_code, 404)

    def test_gallery_space_alias_route(self):
        response = self.client.get(reverse("frontend:space_gallery_space", kwargs={"space_pk": self.space1.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["space"], self.space1)

    def test_contact_submit_ajax(self):
        response = self.client.post(
            reverse("frontend:contact_submit"),
            {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "+213555123456",
                "message": "Hello, I want to redesign my living room.",
                "join_lead": "1",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertTrue(Contact.objects.filter(email="jane@example.com").exists())
        self.assertTrue(Lead.objects.filter(email="jane@example.com").exists())
