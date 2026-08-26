from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from dashboard.models import (
    ProjectType, Space, ServicePricing, ServiceTranslation,
    Quote, QuoteItem, QuoteSpace, QuoteAuditEvent, DesignRequest
)
from dashboard.price_engine import (
    calculate_service_fee,
    calculate_discount,
    calculate_quote_financials,
    TAX_RATE
)

User = get_user_model()


class ServicePricingAndTranslationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(
            username="admin_user",
            email="admin@loftdesign.dz",
            password="adminpassword123"
        )
        self.client.force_login(self.user)

    def test_single_default_service_invariant(self):
        """Test that exactly one service is default at any time."""
        # Create service 1 as default
        s1 = ServicePricing.objects.create(
            service_name="3D Modeling Standard",
            pricing_type=ServicePricing.PricingType.FIXED,
            service_price=Decimal("15000.00"),
            is_default=True
        )
        self.assertTrue(s1.is_default)

        # Create service 2 also marked as default -> s1 must be unset
        s2 = ServicePricing.objects.create(
            service_name="Virtual Tour 360",
            pricing_type=ServicePricing.PricingType.FIXED,
            service_price=Decimal("25000.00"),
            is_default=True
        )
        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertFalse(s1.is_default)
        self.assertTrue(s2.is_default)

        # Setting s1 as default again via toggle endpoint unsets s2
        toggle_url = reverse("dash:service_toggle_default", kwargs={"pk": s1.pk})
        resp = self.client.post(toggle_url, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertEqual(resp.status_code, 200)
        s1.refresh_from_db()
        s2.refresh_from_db()
        self.assertTrue(s1.is_default)
        self.assertFalse(s2.is_default)

    def test_percentage_of_project_cost_calculation(self):
        """Test percentage fee calculation with minimum and maximum bounds."""
        s_pct = ServicePricing.objects.create(
            service_name="Full Architectural Supervision",
            pricing_type=ServicePricing.PricingType.PERCENTAGE_PROJECT_COST,
            percentage_rate=Decimal("5.00"),
            min_fee=Decimal("100000.00"),
            max_fee=Decimal("1000000.00"),
            service_price=Decimal("0.00"),
        )

        # 1. Normal range: 5% of 10,000,000 DA = 500,000 DA
        fee1 = calculate_service_fee(s_pct, estimated_project_cost=Decimal("10000000.00"))
        self.assertEqual(fee1, Decimal("500000.00"))

        # 2. Below minimum: 5% of 1,000,000 DA = 50,000 DA -> clamped to min_fee = 100,000 DA
        fee2 = calculate_service_fee(s_pct, estimated_project_cost=Decimal("1000000.00"))
        self.assertEqual(fee2, Decimal("100000.00"))

        # 3. Above maximum: 5% of 30,000,000 DA = 1,500,000 DA -> clamped to max_fee = 1,000,000 DA
        fee3 = calculate_service_fee(s_pct, estimated_project_cost=Decimal("30000000.00"))
        self.assertEqual(fee3, Decimal("1000000.00"))

    def test_service_multilingual_fallback(self):
        """Test translation resolution order: requested -> fr -> first -> base."""
        s = ServicePricing.objects.create(
            service_name="Lighting Study Base",
            pricing_type=ServicePricing.PricingType.FIXED,
            service_price=Decimal("12000.00"),
            short_description="Base short description",
            included_items=["Plan d'implantation", "Schéma électrique"],
            excluded_items=["Fourniture luminaires"],
            deliverables=["Dossier technique PDF"],
            included_revisions="2 révisions",
            estimated_delivery_time="5 jours",
        )

        ServiceTranslation.objects.create(
            service=s,
            locale="fr",
            service_name="Étude d'éclairage FR",
            short_description="Description courte FR",
            included_items=["Plan d'implantation FR"],
            excluded_items=["Fourniture FR"],
            deliverables=["PDF FR"],
            included_revisions="2 révisions",
            estimated_delivery_time="5 jours",
        )

        ServiceTranslation.objects.create(
            service=s,
            locale="ar",
            service_name="دراسة الإضاءة AR",
            short_description="وصف موجز AR",
            included_items=["مخطط التوزيع AR"],
            excluded_items=["توفير المصابيح AR"],
            deliverables=["ملف تقني AR"],
            included_revisions="تعديلان",
            estimated_delivery_time="5 أيام",
        )

        # Arabic lookup
        trans_ar = s.get_translation("ar")
        self.assertEqual(trans_ar["service_name"], "دراسة الإضاءة AR")
        self.assertEqual(trans_ar["short_description"], "وصف موجز AR")
        self.assertEqual(s.name_ar, "دراسة الإضاءة AR")

        # French lookup
        trans_fr = s.get_translation("fr")
        self.assertEqual(trans_fr["service_name"], "Étude d'éclairage FR")
        self.assertEqual(s.name_fr, "Étude d'éclairage FR")

        # Non-existing locale (en) falls back to French
        trans_en = s.get_translation("en")
        self.assertEqual(trans_en["service_name"], "Étude d'éclairage FR")
        self.assertEqual(s.name_en, "Étude d'éclairage FR")


class QuoteManagementTestCase(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin_quote",
            email="admin.quote@loftdesign.dz",
            password="adminpassword123"
        )
        self.client.force_login(self.admin)

        self.project_type = ProjectType.objects.create(name="Villa de Luxe", slug="villa-luxe")
        self.space1 = Space.objects.create(name="Grand Salon", slug="grand-salon", base_price=Decimal("15000.00"))
        self.space2 = Space.objects.create(name="Suite Parentale", slug="suite-parentale", base_price=Decimal("12000.00"))

        self.service1 = ServicePricing.objects.create(
            service_name="Modélisation 3D Complète",
            pricing_type=ServicePricing.PricingType.AREA,
            service_price=Decimal("800.00"),
            is_default=True,
        )

    def test_quote_builder_creation_and_financials(self):
        """Test admin quote creation with spaces, services, and live calculation."""
        create_url = reverse("dash:quote_create")
        payload = {
            "client_type": "particular",
            "first_name": "Karim",
            "last_name": "Benali",
            "email": "karim.benali@test.dz",
            "phone": "0550112233",
            "wilaya": "Alger",
            "commune": "Hydra",
            "project_name": "Villa Karim Hydra",
            "project_type_id": self.project_type.id,
            "total_surface": "150",
            "estimated_total_project_cost": "0",
            "space_ids": [self.space1.id, self.space2.id],
            "service_ids": [self.service1.id],
            "discount_type": "percentage",
            "discount_value": "10",
            "internal_discount_reason": "VIP Client Summer Discount Agreement",
            "client_discount_note": "Remise commerciale exceptionnelle 10%",
        }

        resp = self.client.post(create_url, payload, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])

        # Verify DB quote records
        quote = Quote.objects.get(email="karim.benali@test.dz")
        self.assertEqual(quote.revision_number, 1)
        self.assertTrue(quote.is_current_revision)
        self.assertEqual(quote.spaces.count(), 2)
        self.assertEqual(quote.items.count(), 1)

        # Expected Math:
        # Spaces: 15,000 + 12,000 = 27,000 DA
        # Services: 150 m² * 800 DA/m² = 120,000 DA
        # Subtotal: 147,000 DA
        # Discount 10%: 14,700 DA
        # Subtotal after discount: 132,300 DA
        # Tax (Particular): 0 DA
        # Final Total: 132,300 DA
        self.assertEqual(quote.subtotal_before_discount, Decimal("147000.00"))
        self.assertEqual(quote.discount_amount, Decimal("14700.00"))
        self.assertEqual(quote.subtotal_after_discount, Decimal("132300.00"))
        self.assertEqual(quote.final_total, Decimal("132300.00"))

        # Verify Audit Log
        audit = QuoteAuditEvent.objects.filter(quote=quote).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.action, "quote_created_by_admin")

    def test_discount_validation_mandatory_internal_reason(self):
        """Test that applying a discount strictly requires an internal audit reason."""
        quote = Quote.objects.create(
            quote_number="LOFT-QUO-2026-TEST",
            revision_number=1,
            first_name="Amine",
            last_name="Tounsi",
            email="amine@test.dz",
            subtotal_before_discount=Decimal("200000.00"),
            final_total=Decimal("200000.00"),
        )

        discount_url = reverse("dash:quote_apply_discount", kwargs={"pk": quote.pk})

        # 1. Attempt discount without internal reason -> Should Fail
        resp_fail = self.client.post(discount_url, {
            "discount_type": "fixed",
            "discount_value": "20000",
            "internal_discount_reason": "",  # Empty!
        }, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertFalse(resp_fail.json()["success"])

        # 2. Provide mandatory internal reason -> Should Succeed
        resp_success = self.client.post(discount_url, {
            "discount_type": "fixed",
            "discount_value": "20000",
            "internal_discount_reason": "Promotional agreement approved by Director",
            "client_discount_note": "Remise spéciale",
        }, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertTrue(resp_success.json()["success"])

        quote.refresh_from_db()
        self.assertEqual(quote.discount_amount, Decimal("20000.00"))
        self.assertEqual(quote.final_total, Decimal("180000.00"))

    def test_quote_revision_chain(self):
        """Test creating quote revisions and superseding older versions."""
        parent_quote = Quote.objects.create(
            quote_number="LOFT-QUO-2026-REVTEST",
            revision_number=1,
            is_current_revision=True,
            first_name="Sarah",
            last_name="M",
            email="sarah@test.dz",
            subtotal_before_discount=Decimal("100000.00"),
            final_total=Decimal("100000.00"),
            status=Quote.Status.SENT,
        )

        rev_url = reverse("dash:quote_create_revision", kwargs={"pk": parent_quote.pk})
        resp = self.client.post(rev_url, {
            "reason": "Client requested upgraded package"
        }, HTTP_X_REQUESTED_WITH="XMLHttpRequest")

        self.assertTrue(resp.json()["success"])

        # Find new revision
        new_rev = Quote.objects.get(quote_number=parent_quote.quote_number, revision_number=2)
        self.assertEqual(new_rev.parent_quote, parent_quote)
        self.assertEqual(new_rev.status, Quote.Status.DRAFT)

        # Dispatching new revision marks previous revision superseded
        send_url = reverse("dash:quote_send", kwargs={"pk": new_rev.pk})
        send_resp = self.client.post(send_url, {
            "email": "sarah@test.dz",
            "subject": "Devis Rev 2",
            "message": "Voici votre nouveau devis révisé",
        }, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertTrue(send_resp.json()["success"])

        parent_quote.refresh_from_db()
        new_rev.refresh_from_db()
        self.assertEqual(parent_quote.status, Quote.Status.SUPERSEDED)
        self.assertFalse(parent_quote.is_current_revision)
        self.assertEqual(new_rev.status, Quote.Status.SENT)
        self.assertTrue(new_rev.is_current_revision)