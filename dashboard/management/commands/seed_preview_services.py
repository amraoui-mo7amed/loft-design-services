from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from dashboard.models import ServicePricing, ServiceTranslation


PREVIEW_SERVICES = [
    {
        "service_name": "Conception 3D intérieure",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("900.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": True,
        "allow_exterior": False,
        "default_interior_selected": True,
        "default_exterior_selected": False,
        "unit_name": "m²",
        "is_default": True,
        "short_description": "Modélisation 3D photoréaliste de l'intérieur basée sur la surface intérieure.",
        "detailed_description": "Conception 3D complète de tous vos espaces intérieurs avec choix des matériaux, textures et éclairages.",
        "included_items": ["Modélisation 3D intérieure complète", "Rendus haute résolution 4K", "Choix des matières et éclairages", "2 révisions incluses"],
        "excluded_items": ["Espaces extérieurs", "Suivi de chantier"],
        "deliverables": ["Rendus 4K JPG/PNG", "Dossier de présentation conceptuelle"],
        "estimated_delivery_time": "5 à 7 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "translations": {
            "fr": {
                "name": "Conception 3D intérieure",
                "short_description": "Modélisation 3D photoréaliste de vos espaces intérieurs.",
                "detailed_description": "Conception 3D complète de vos espaces intérieurs avec choix des matériaux, textures et éclairages.",
            },
            "en": {
                "name": "3D Interior Design",
                "short_description": "Photorealistic 3D interior modeling based on interior surface.",
                "detailed_description": "Full 3D interior design with material, texture and lighting selection.",
            },
            "ar": {
                "name": "التصميم الداخلي ثلاثي الأبعاد 3D",
                "short_description": "نمذجة 3D واقعية للمساحات الداخلية محسوبة على أساس المساحة الداخلية.",
                "detailed_description": "تصميم ثلاثي الأبعاد شامل لكافة الفضاءات الداخلية مع محاكاة المواد والإضاءة.",
            },
        },
    },
    {
        "service_name": "Conception 3D extérieure",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("600.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": False,
        "allow_exterior": True,
        "default_interior_selected": False,
        "default_exterior_selected": True,
        "unit_name": "m²",
        "is_default": False,
        "short_description": "Conception 3D extérieure pour façades, terrasse, jardin et piscine.",
        "detailed_description": "Modélisation 3D et rendu des aménagements extérieurs, éclairage de façade et paysagisme.",
        "included_items": ["Modélisation 3D extérieure", "Aménagement terrasse / jardin", "Éclairage extérieur et textures réelles"],
        "excluded_items": ["Plans intérieurs", "Gros œuvre"],
        "deliverables": ["Rendus 4K extérieur", "Planche paysagère et matières"],
        "estimated_delivery_time": "4 à 6 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "translations": {
            "fr": {
                "name": "Conception 3D extérieure",
                "short_description": "Conception 3D des aménagements extérieurs, façades et terrasses.",
                "detailed_description": "Modélisation 3D et rendu des aménagements extérieurs, terrasse, jardin et piscine.",
            },
            "en": {
                "name": "3D Exterior Design",
                "short_description": "3D exterior modeling for facade, terrace, garden and pool.",
                "detailed_description": "Exterior architectural rendering and landscape design visualization.",
            },
            "ar": {
                "name": "التصميم الخارجي ثلاثي الأبعاد 3D",
                "short_description": "تصميم ثلاثي الأبعاد للواجهات الخارجية والحدائق والتراسات.",
                "detailed_description": "نمذجة ثلاثية الأبعاد للمساحات الخارجية والتراسات والحدائق والمسابح.",
            },
        },
    },
    {
        "service_name": "Plan plomberie 2D",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("150.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": True,
        "allow_exterior": True,
        "default_interior_selected": True,
        "default_exterior_selected": False,
        "unit_name": "m²",
        "is_default": False,
        "short_description": "Plan technique des arrivées, évacuations et réseaux de plomberie.",
        "detailed_description": "Schémas côtés et implantations exactes des sanitaires, robinetterie, évacuations et alimentation.",
        "included_items": ["Plan d'implantation sanitaire côté", "Tracé des alimentations et évacuations", "Schéma des pentes et colonnes"],
        "excluded_items": ["Fourniture matérielle", "Pose physique"],
        "deliverables": ["Plan PDF / DWG côté", "Nomenclature sanitaire"],
        "estimated_delivery_time": "3 à 5 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "translations": {
            "fr": {
                "name": "Plan plomberie 2D",
                "short_description": "Plan technique des arrivées et évacuations de plomberie au m².",
                "detailed_description": "Plans côtés au 1/50 pour les artisans plombiers, sanitaires et réseaux.",
            },
            "en": {
                "name": "2D Plumbing Blueprint",
                "short_description": "Technical plumbing layout for supply lines and drainage per m².",
                "detailed_description": "Dimensioned plumbing blueprints ready for plumbing contractors.",
            },
            "ar": {
                "name": "مخطط السباكة والصرف الصحي 2D",
                "short_description": "مخطط تقني هندسي لشبكات التغذية والصرف الصحي بالمتر المربع.",
                "detailed_description": "مخططات تنفيذية قياسية دقيقة لشبكة المياه والصرف الصحي والصحيات.",
            },
        },
    },
    {
        "service_name": "Plan électricité & luminaires 2D",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("150.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": True,
        "allow_exterior": True,
        "default_interior_selected": True,
        "default_exterior_selected": False,
        "unit_name": "m²",
        "is_default": False,
        "short_description": "Plan d'implantation des prises, interrupteurs, circuits et luminaires.",
        "detailed_description": "Schémas électriques détaillés avec scénographie d'éclairage direct et indirect.",
        "included_items": ["Plan électrique côté", "Implantation des interrupteurs et prises", "Scénarios d'éclairage"],
        "excluded_items": ["Installation électrique"],
        "deliverables": ["Plan PDF / DWG électrique", "Cahier des luminaires"],
        "estimated_delivery_time": "3 à 5 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "translations": {
            "fr": {
                "name": "Plan électricité & luminaires 2D",
                "short_description": "Plan d'implantation électrique et éclairage au m².",
                "detailed_description": "Plan côté des prises, éclairages et circuits pour électricien.",
            },
            "en": {
                "name": "2D Electrical & Lighting Plan",
                "short_description": "Electrical layout and architectural lighting plan per m².",
                "detailed_description": "Detailed electrical blueprint with switches, outlets and lighting scenes.",
            },
            "ar": {
                "name": "مخطط الكهرباء والإنارة 2D",
                "short_description": "مخطط هندسي مفصل لتوزيع الكهرباء والإنارة بالمتر المربع.",
                "detailed_description": "مخطط قياسي لمفاتيح الكهرباء والمآخذ والإنارة المباشرة وغير المباشرة.",
            },
        },
    },
    {
        "service_name": "Suivi de chantier",
        "pricing_type": ServicePricing.PricingType.HOURLY,
        "service_price": Decimal("5000.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": True,
        "allow_exterior": True,
        "default_interior_selected": True,
        "default_exterior_selected": False,
        "unit_name": "h",
        "default_hours": 20,
        "is_default": False,
        "short_description": "Assistance et visites de contrôle sur le chantier facturées à l'heure.",
        "detailed_description": "Supervision architecturale, vérification de conformité des travaux et comptes-rendus de visite.",
        "included_items": ["Visites de chantier sur site", "Contrôle de conformité des plans", "Comptes-rendus de visite avec photos"],
        "excluded_items": ["Exécution des travaux"],
        "deliverables": ["Rapports de visite d'architecte", "Photos de suivi"],
        "estimated_delivery_time": "À la demande",
        "included_revisions": "Selon heures souscrites",
        "translations": {
            "fr": {
                "name": "Suivi de chantier",
                "short_description": "Accompagnement et contrôle architectural facturé à l'heure.",
                "detailed_description": "Visites de chantier sur site par nos architectes coordinateurs.",
            },
            "en": {
                "name": "Site Supervision & Coordination",
                "short_description": "Architectural on-site supervision and monitoring billed hourly.",
                "detailed_description": "On-site visits and inspection by certified architects.",
            },
            "ar": {
                "name": "المتابعة والإشراف الميداني",
                "short_description": "إشراف وزيارات ميدانية للورشة محتسبة بالساعة.",
                "detailed_description": "متابعة ميدانية دورية من طرف مهندسين معماريين لضمان مطابقة الإنجاز للمخططات.",
            },
        },
    },
    {
        "service_name": "Conception de façade",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("100000.00"),
        "percentage_rate": Decimal("0.00"),
        "allow_interior": False,
        "allow_exterior": True,
        "default_interior_selected": False,
        "default_exterior_selected": True,
        "unit_name": "façade",
        "default_quantity": 3,
        "is_default": False,
        "short_description": "Conception architecturale et habillage de façade au forfait unitaire.",
        "detailed_description": "Étude stylistique, modélisation et rendus 3D pour chaque façade du bâtiment.",
        "included_items": ["Conception complète de la façade", "Choix des matériaux et finitions", "Rendus 3D haute définition"],
        "excluded_items": ["Ravalement physique", "Permis de démolir"],
        "deliverables": ["Rendus 3D façade", "Plans de calepinage façade"],
        "estimated_delivery_time": "7 à 10 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "translations": {
            "fr": {
                "name": "Conception de façade",
                "short_description": "Conception architecturale et habillage de façade au forfait par façade.",
                "detailed_description": "Étude et rendus 3D photoréalistes pour chaque façade.",
            },
            "en": {
                "name": "Facade Architectural Design",
                "short_description": "Architectural facade styling and 3D rendering per facade unit.",
                "detailed_description": "Stylistic study, cladding and 3D visualization for building facades.",
            },
            "ar": {
                "name": "تصميم الواجهات المعمارية",
                "short_description": "تصميم معماري وتلبيس الواجهات بسعر ثابت لكل واجهة.",
                "detailed_description": "دراسة معمارية ورندرات واقعية ثلاثية الأبعاد لكل واجهة مبنى.",
            },
        },
    },
    {
        "service_name": "Gestion de projet",
        "pricing_type": ServicePricing.PricingType.PERCENTAGE_PROJECT_COST,
        "service_price": Decimal("0.00"),
        "percentage_rate": Decimal("10.00"),
        "default_reference_amount": Decimal("100000.00"),
        "allow_interior": True,
        "allow_exterior": True,
        "default_interior_selected": True,
        "default_exterior_selected": False,
        "unit_name": "%",
        "is_default": False,
        "short_description": "Management global du projet calculé en pourcentage du montant de référence.",
        "detailed_description": "Pilotage stratégique, sélection des prestataires, négociation devis et coordination globale.",
        "included_items": ["Coordination générale du projet", "Optimisation budgétaire", "Planning d'exécution et suivi"],
        "excluded_items": ["Assurance dommage-ouvrage"],
        "deliverables": ["Planning maître", "Tableau de bord financier"],
        "estimated_delivery_time": "Durée du projet",
        "included_revisions": "Suivi continu",
        "translations": {
            "fr": {
                "name": "Gestion de projet",
                "short_description": "Pilotage global du projet calculé en pourcentage (10%) du montant de référence.",
                "detailed_description": "Coordination générale, sélection des prestataires et optimisation des coûts.",
            },
            "en": {
                "name": "Full Project Management",
                "short_description": "Comprehensive project management calculated as 10% of reference amount.",
                "detailed_description": "Strategic steering, vendor bidding management and execution schedule.",
            },
            "ar": {
                "name": "إدارة وتنسيق المشروع المتكامل",
                "short_description": "إدارة شاملة للمشروع بنسبة مئوية (10%) من المبلغ المرجعي المحدد.",
                "detailed_description": "إدارة التكاليف واختيار الموردين والحرفيين وجدولة تنفيذ المشروع.",
            },
        },
    },
]


class Command(BaseCommand):
    help = "Seeds the exact 7 services from preview.html calculation specification"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            ServicePricing.objects.filter(is_default=True).update(is_default=False)

            for item in PREVIEW_SERVICES:
                trans_map = item.pop("translations", {})
                svc, created = ServicePricing.objects.update_or_create(
                    service_name=item["service_name"],
                    defaults=item,
                )

                for loc, t_data in trans_map.items():
                    ServiceTranslation.objects.update_or_create(
                        service=svc,
                        locale=loc,
                        defaults={
                            "name": t_data.get("name", svc.service_name),
                            "short_description": t_data.get("short_description", svc.short_description),
                            "detailed_description": t_data.get("detailed_description", svc.detailed_description),
                            "included_items": svc.included_items,
                            "excluded_items": svc.excluded_items,
                            "deliverables": svc.deliverables,
                            "included_revisions": svc.included_revisions,
                            "estimated_delivery_time": svc.estimated_delivery_time,
                        },
                    )

            def_svc = ServicePricing.objects.filter(service_name="Conception 3D intérieure").first()
            if def_svc:
                def_svc.is_default = True
                def_svc.save()

            self.stdout.write(self.style.SUCCESS(f"✓ Successfully seeded {len(PREVIEW_SERVICES)} preview.html services."))
