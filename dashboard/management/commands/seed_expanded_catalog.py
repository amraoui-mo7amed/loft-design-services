import hashlib
import io
import math
import os
from decimal import Decimal
from PIL import Image, ImageDraw, ImageFont

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from dashboard.models import (
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    Service,
    ServicePricing,
    ServiceTranslation,
)

# ─────────────────────────────────────────────────────────────────────────────
# 1. 10 SERVICES WITH MULTILINGUAL TRANSLATIONS
# ─────────────────────────────────────────────────────────────────────────────

SERVICES_DATA = [
    {
        "service_name": "Conception 3D Immersive & Rendu Photo-Réaliste",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("850.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": True,
        "is_active": True,
        "estimated_delivery_time": "5-7 jours ouvrés",
        "included_revisions": "3 révisions incluses",
        "short_description": "Modélisation 3D ultra-détaillée et rendus photoréalistes 4K pour visualiser votre futur intérieur.",
        "detailed_description": "Notre équipe d'architectes d'intérieur modélise votre espace au millimètre près et applique les matériaux, textures et éclairages réels pour un rendu photoréaliste saisissant.",
        "included_items": ["Modélisation 3D exacte de l'espace", "Rendus 4K sous 4 angles différents", "Textures et matières réelles", "Simulation d'éclairage jour / nuit"],
        "excluded_items": ["Plans techniques de plomberie", "Suivi de chantier physique"],
        "deliverables": ["Pack d'images HD 4K (JPEG/PNG)", "Fiche palette de couleurs & textures", "Vidéo d'animation panoramique"],
        "translations": {
            "fr": {
                "name": "Conception 3D Immersive & Rendu Photo-Réaliste",
                "short_description": "Modélisation 3D ultra-détaillée et rendus photoréalistes 4K.",
                "detailed_description": "Visualisez votre espace avant travaux grâce à nos rendus 3D immersifs haute définition.",
                "included_items": ["Modélisation 3D exacte de l'espace", "Rendus 4K sous 4 angles différents", "Textures et matières réelles", "Simulation d'éclairage jour / nuit"],
                "excluded_items": ["Plans techniques de plomberie", "Suivi de chantier physique"],
                "deliverables": ["Pack d'images HD 4K (JPEG/PNG)", "Fiche palette de couleurs & textures", "Vidéo d'animation panoramique"],
                "estimated_delivery_time": "5-7 jours ouvrés",
                "included_revisions": "3 révisions incluses",
            },
            "en": {
                "name": "Immersive 3D Conception & Photorealistic Rendering",
                "short_description": "Ultra-detailed 3D modeling and 4K photorealistic rendering.",
                "detailed_description": "Visualize your space before construction with our high-definition immersive 3D renders.",
                "included_items": ["Exact 3D space modeling", "4K renders from 4 angles", "Real materials & textures", "Day/night lighting simulation"],
                "excluded_items": ["Plumbing technical plans", "On-site supervision"],
                "deliverables": ["4K HD image pack (JPEG/PNG)", "Color & material palette sheet", "Panoramic walkthrough video"],
                "estimated_delivery_time": "5-7 business days",
                "included_revisions": "3 revisions included",
            },
            "ar": {
                "name": "التصميم ثلاثي الأبعاد الشامل والإخراج الواقعي",
                "short_description": "نمذجة ثلاثية الأبعاد فائقة الدقة وإخراج واقعي بجودة 4K.",
                "detailed_description": "عاين مساحتك بالكامل قبل بدء الأشغال من خلال رندراتنا الواقعية ثلاثية الأبعاد بدقة فائقة.",
                "included_items": ["نمذجة ثلاثية الأبعاد دقيقة للمساحة", "رندرات 4K من 4 زوايا مختلفة", "مواد وخامات مطابقة للواقع", "محاكاة الإضاءة النهارية والليلية"],
                "excluded_items": ["المخططات الهندسية للسباكة", "المتابعة الميدانية للورشة"],
                "deliverables": ["حزمة صور عالية الدقة 4K", "بطاقة لوحة الألوان والخامات", "فيديو جولة بانورامية"],
                "estimated_delivery_time": "5-7 أيام عمل",
                "included_revisions": "3 تعديلات مشمولة",
            },
        },
    },
    {
        "service_name": "Visite Virtuelle 360° & Immersion VR",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("15000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "3-5 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Expérience interactive 360° compatible casque VR et smartphone.",
        "detailed_description": "Plongez au cœur de votre futur projet grâce à un panorama 360° interactif accessible depuis n'importe quel écran ou casque de réalité virtuelle.",
        "included_items": ["Visite 360° interactive complète", "Lien web privé partageable", "Compatibilité mobile et casque VR", "Points d'information interactifs"],
        "excluded_items": ["Rendus statiques imprimables", "Casque VR physique"],
        "deliverables": ["Lien de visite interactive en ligne", "Fichiers panoramiques 8K", "QR code d'accès direct"],
        "translations": {
            "fr": {
                "name": "Visite Virtuelle 360° & Immersion VR",
                "short_description": "Expérience interactive 360° compatible casque VR et smartphone.",
                "detailed_description": "Plongez au cœur de votre futur projet grâce à un panorama 360° interactif.",
                "included_items": ["Visite 360° interactive", "Lien web privé", "Compatibilité mobile/VR", "Points d'information"],
                "excluded_items": ["Casque VR physique"],
                "deliverables": ["Lien de visite interactive", "Panoramas 8K", "QR code d'accès direct"],
                "estimated_delivery_time": "3-5 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "360° Virtual Tour & VR Immersion",
                "short_description": "Interactive 360° experience compatible with VR headsets and smartphones.",
                "detailed_description": "Immerse yourself into your future design with an interactive 360° panoramic walkthrough.",
                "included_items": ["Full interactive 360° tour", "Shareable private web link", "Mobile & VR headset ready", "Interactive hotspots"],
                "excluded_items": ["Physical VR headset"],
                "deliverables": ["Online interactive tour link", "8K panoramic files", "Direct access QR code"],
                "estimated_delivery_time": "3-5 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "جولة افتراضية 360 درجة وتجربة الواقع الافتراضي",
                "short_description": "تجربة تفاعلية 360 درجة متوافقة مع نظارات VR والهواتف الذكية.",
                "detailed_description": "عش تجربة واقعية داخل مشروعك المستقبلي عبر جولة افتراضية بانورامية تفاعلية.",
                "included_items": ["جولة تفاعلية شاملة 360°", "رابط ويب خاص للمشاركة", "توافق تام مع نظارات VR والهواتف", "نقاط استكشاف تفاعلية"],
                "excluded_items": ["نظارة الواقع الافتراضي المادية"],
                "deliverables": ["رابط الجولة الافتراضية عبر الإنترنت", "ملفات بانورامية بدقة 8K", "رمز QR للوصول السريع"],
                "estimated_delivery_time": "3-5 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Étude d'Éclairage & Plan Électrique Détaillé",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("18000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "4-6 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Plan d'implantation électrique complet et scénographie d'éclairage direct/indirect.",
        "detailed_description": "Conception d'ambiances lumineuses optimales avec plans cotés pour l'électricien (prises, interrupteurs, rubans LED, spots encastrés, suspensions).",
        "included_items": ["Plan d'implantation coté pour électricien", "Calcul des flux lumineux et températures (Kelvin)", "Sélection des luminaires et références", "Scénarios d'éclairage direct et d'ambiance"],
        "excluded_items": ["Fourniture des luminaires", "Travaux d'installation électrique"],
        "deliverables": ["Plan électrique côté PDF/DWG", "Cahier des charges luminaires", "Guide des scénarios d'éclairage"],
        "translations": {
            "fr": {
                "name": "Étude d'Éclairage & Plan Électrique Détaillé",
                "short_description": "Plan d'implantation électrique complet et scénographie d'éclairage direct/indirect.",
                "detailed_description": "Conception d'ambiances lumineuses optimales avec plans cotés pour électricien.",
                "included_items": ["Plan d'implantation électrique coté", "Calcul des flux et températures (Kelvin)", "Sélection des luminaires", "Scénarios d'éclairage"],
                "excluded_items": ["Fourniture des luminaires", "Travaux d'installation"],
                "deliverables": ["Plan électrique PDF/DWG", "Cahier des charges luminaires", "Guide des ambiances lumineuses"],
                "estimated_delivery_time": "4-6 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Lighting Engineering & Detailed Electrical Plan",
                "short_description": "Comprehensive electrical layout and direct/indirect architectural lighting design.",
                "detailed_description": "Optimal lighting atmosphere engineering with dimensioned blueprints for contractors.",
                "included_items": ["Dimensioned electrical plan", "Luminous flux & Kelvin calculation", "Luminaire selection & specs", "Lighting mood scenes"],
                "excluded_items": ["Fixture hardware supply", "Physical electrical installation"],
                "deliverables": ["Electrical blueprint PDF/DWG", "Luminaire specification sheet", "Lighting scenes guide"],
                "estimated_delivery_time": "4-6 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "دراسة الإضاءة والمخطط الكهربائي المفصل",
                "short_description": "مخطط كهربائي تفصيلي ودراسة سينوغرافيا الإضاءة المباشرة وغير المباشرة.",
                "detailed_description": "تصميم الأجواء الضوئية المثالية بمخططات قياسية دقيقة للكهربائي.",
                "included_items": ["مخطط كهربائي مفصل بالقياسات", "حساب شدة الإضاءة ودرجة الحرارة (كلفن)", "اختيار وحدات الإنارة والمواصفات", "سيناريوهات الإضاءة المتنوعة"],
                "excluded_items": ["توفير أجهزة الإنارة", "أشغال التمديد الكهربائي"],
                "deliverables": ["مخطط كهربائي بصيغة PDF/DWG", "دفتر مواصفات الإنارة", "دليل السيناريوهات الضوئية"],
                "estimated_delivery_time": "4-6 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Planche d'Ambiance & Moodboard de Matériaux",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("12000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "3-4 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Harmonie des couleurs, matières nobles, tissus et finitions pour définir votre identité visuelle.",
        "detailed_description": "Création d'un dossier visuel complet associant textures, peintures, revêtements de sol, boiseries et textiles pour créer une harmonie parfaite.",
        "included_items": ["Planche de style et concept", "Palette chromatique exacte (codes RAL/NCS)", "Échantillonnage textures et matières", "Guide d'association des finitions"],
        "excluded_items": ["Rendus 3D photoréalistes", "Achats de matières physiques"],
        "deliverables": ["Moodboard haute résolution PDF", "Nuancier de couleurs et finitions", "Liste des matériaux recommandés"],
        "translations": {
            "fr": {
                "name": "Planche d'Ambiance & Moodboard de Matériaux",
                "short_description": "Harmonie des couleurs, matières, tissus et finitions.",
                "detailed_description": "Dossier visuel complet associant textures, peintures, revêtements et textiles.",
                "included_items": ["Planche de style", "Palette chromatique (RAL/NCS)", "Échantillons matières", "Guide d'association"],
                "excluded_items": ["Achats de matières physiques"],
                "deliverables": ["Moodboard HD PDF", "Nuancier de couleurs", "Liste des matériaux"],
                "estimated_delivery_time": "3-4 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Atmosphere Board & Material Moodboard",
                "short_description": "Color harmonies, premium materials, fabrics and finishes definition.",
                "detailed_description": "Comprehensive design board combining textures, paints, flooring and fabrics.",
                "included_items": ["Style concept board", "Exact color palette (RAL/NCS codes)", "Material & texture samples", "Finishes pairing guide"],
                "excluded_items": ["Physical material purchasing"],
                "deliverables": ["High-resolution PDF Moodboard", "Color & finish swatch", "Recommended materials list"],
                "estimated_delivery_time": "3-4 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "لوحة المزاج وتنسيق المواد والألوان",
                "short_description": "تناغم الألوان، المواد الراقية، الأقمشة والتشطيبات لتحديد الهوية البصرية.",
                "detailed_description": "ملف بصري متكامل يجمع بين الخامات والألوان والأرضيات والمنسوجات لتناغم مثالي.",
                "included_items": ["لوحة النمط والأسلوب", "لوحة الألوان الدقيقة (رموز RAL)", "عينات الخامات والأقمشة", "دليل تنسيق التشطيبات"],
                "excluded_items": ["شراء المواد المادية"],
                "deliverables": ["لوحة مزاج رقمية عالية الدقة PDF", "دليل تدرجات الألوان والتشطيبات", "قائمة المواد الموصى بها"],
                "estimated_delivery_time": "3-4 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Plans d'Exécution 2D & Coupes Techniques",
        "pricing_type": ServicePricing.PricingType.AREA,
        "service_price": Decimal("500.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "5-8 jours ouvrés",
        "included_revisions": "3 révisions incluses",
        "short_description": "Dossier technique complet avec plans cotés, coupes d'élévation et détails de pose.",
        "detailed_description": "Tous les documents techniques nécessaires pour les artisans et entrepreneurs du bâtiment (maçonnerie, faux plafonds, calepinage carrelage, menuiserie).",
        "included_items": ["Plan d'aménagement côté au 1/50", "Coupes et élévations techniques", "Plan de calepinage sols et faïences", "Détails des faux-plafonds et retombées"],
        "excluded_items": ["Étude de structure béton armé", "Dépôt de permis de construire"],
        "deliverables": ["Dossier technique complet PDF/DWG", "Cahier des coupes et détails", "Quantitatif estimatif des surfaces"],
        "translations": {
            "fr": {
                "name": "Plans d'Exécution 2D & Coupes Techniques",
                "short_description": "Dossier technique complet avec plans cotés et calepinage.",
                "detailed_description": "Documents techniques d'exécution pour les artisans et corps d'état.",
                "included_items": ["Plan côté au 1/50", "Coupes et élévations", "Calepinage sols et murs", "Détails faux-plafonds"],
                "excluded_items": ["Calcul de structure béton"],
                "deliverables": ["Dossier technique PDF/DWG", "Cahier des coupes", "Bordereau des surfaces"],
                "estimated_delivery_time": "5-8 jours ouvrés",
                "included_revisions": "3 révisions incluses",
            },
            "en": {
                "name": "2D Execution Plans & Technical Cross-Sections",
                "short_description": "Full technical blueprint package with dimensioned drawings and tiling layouts.",
                "detailed_description": "All technical construction documents needed by contractors (masonry, ceiling, tiling, carpentry).",
                "included_items": ["1/50 scale layout plan", "Technical elevations and sections", "Flooring & wall tiling layout", "False ceiling details"],
                "excluded_items": ["Structural engineering calculations"],
                "deliverables": ["Complete technical drawing pack PDF/DWG", "Section and detail booklet", "Surface quantity schedule"],
                "estimated_delivery_time": "5-8 business days",
                "included_revisions": "3 revisions included",
            },
            "ar": {
                "name": "المخططات التنفيذية ثنائية الأبعاد والقطاعات التقنية",
                "short_description": "ملف تقني شامل بمخططات قياسية وقطاعات رأسية ومخططات التبليط.",
                "detailed_description": "كافة الوثائق الهندسية والتنفيذية اللازمة للحرفيين والمقاولين في الورشة.",
                "included_items": ["مخطط توزيع المساحات بمقياس 1/50", "قطاعات رأسية وواجهات داخلية", "مخططات رص وتبليط الأرضيات والجدران", "تفاصيل الأسقف المستعارة"],
                "excluded_items": ["دراسة الهندسة الإنشائية والخرسانة"],
                "deliverables": ["ملف تنفيذي متكامل PDF/DWG", "دفتر القطاعات والتفاصيل المعمارية", "جدول قياس المساحات والكميات"],
                "estimated_delivery_time": "5-8 أيام عمل",
                "included_revisions": "3 تعديلات مشمولة",
            },
        },
    },
    {
        "service_name": "Suivi & Coordination de Chantier Clé-en-Main",
        "pricing_type": ServicePricing.PricingType.PERCENTAGE_PROJECT_COST,
        "service_price": Decimal("0.00"),
        "percentage_rate": Decimal("4.50"),
        "min_fee": Decimal("150000.00"),
        "max_fee": Decimal("1200000.00"),
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "Durée du chantier",
        "included_revisions": "Réunions hebdomadaires",
        "short_description": "Pilotage, contrôle qualité et coordination de tous les corps d'état jusqu'à la livraison.",
        "detailed_description": "Supervision rigoureuse de votre chantier par nos architectes coordinateurs : respect des délais, contrôle de conformité aux plans, gestion des imprévus et réception des travaux.",
        "included_items": ["Visites de chantier hebdomadaires", "Comptes-rendus réguliers avec photos", "Contrôle de conformité des matériaux", "Assistance à la réception des travaux"],
        "excluded_items": ["Fourniture directe des matériaux de gros œuvre", "Paiement direct des sous-traitants"],
        "deliverables": ["Rapports de visite hebdomadaires", "Planning d'avancement mis à jour", "Procès-verbal de réception de chantier"],
        "translations": {
            "fr": {
                "name": "Suivi & Coordination de Chantier Clé-en-Main",
                "short_description": "Pilotage, contrôle qualité et coordination des corps d'état.",
                "detailed_description": "Supervision rigoureuse par nos architectes coordinateurs jusqu'à la livraison.",
                "included_items": ["Visites de chantier hebdomadaires", "Comptes-rendus avec photos", "Contrôle de conformité", "Assistance à la réception"],
                "excluded_items": ["Paiement direct des sous-traitants"],
                "deliverables": ["Rapports hebdomadaires", "Planning de chantier", "PV de réception"],
                "estimated_delivery_time": "Durée du chantier",
                "included_revisions": "Réunions régulières",
            },
            "en": {
                "name": "Turnkey Site Supervision & Project Coordination",
                "short_description": "Full site management, quality control, and contractor coordination.",
                "detailed_description": "Rigorous oversight by our interior architects ensuring timelines, plan compliance and seamless handover.",
                "included_items": ["Weekly site inspection visits", "Photo progress reports", "Material compliance checks", "Handover assistance"],
                "excluded_items": ["Direct payment of sub-contractors"],
                "deliverables": ["Weekly progress reports", "Updated project schedule", "Handover certificate"],
                "estimated_delivery_time": "Project construction duration",
                "included_revisions": "Weekly meetings",
            },
            "ar": {
                "name": "الإشراف على الموقع والتنسيق المتكامل للمشروع",
                "short_description": "إدارة الورشة ومراقبة الجودة وتنسيق جميع الحرفيين حتى التسليم.",
                "detailed_description": "إشراف هندسي دقيق من قبل مهندسينا لضمان الالتزام بالمخططات والمواعيد وجودة التنفيذ.",
                "included_items": ["زيارات ميدانية دورية أسبوعية", "تقارير تقدم الأشغال بالصور", "مطابقة المواد وجودة التنفيذ", "المساعدة في استلام المشروع النهائي"],
                "excluded_items": ["الدفع المباشر لمقاولي الباطن"],
                "deliverables": ["تقارير تفقد أسبوعية مصورة", "جدول زمني مرحلي محدث", "محضر الاستلام النهائي للمشروع"],
                "estimated_delivery_time": "طوال فترة إنجاز الورشة",
                "included_revisions": "اجتماعات أسبوعية منتظمة",
            },
        },
    },
    {
        "service_name": "Design de Mobilier Sur-Mesure & Menuiserie",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("25000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "5-7 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Plans détaillés de dressing, meuble TV, îlot de cuisine et rangements intégrés sur-mesure.",
        "detailed_description": "Conception de meubles exclusifs parfaitement adaptés à vos espaces : dressings ergonomiques, bibliothèques suspendues, meubles vasques et cuisines sur-mesure.",
        "included_items": ["Modélisation 3D du mobilier", "Plans cotés et coupes d'ébénisterie", "Fiche technique des quincailleries et finitions", "Estimation des coûts de fabrication"],
        "excluded_items": ["Fabrication physique du meuble", "Livraison et pose"],
        "deliverables": ["Dossier de fabrication ébéniste PDF", "Rendus 3D du meuble en situation", "Fiche quincaillerie et matériaux"],
        "translations": {
            "fr": {
                "name": "Design de Mobilier Sur-Mesure & Menuiserie",
                "short_description": "Plans détaillés de dressing, meuble TV, îlot et rangements intégrés.",
                "detailed_description": "Conception de meubles exclusifs parfaitement adaptés à vos dimensions.",
                "included_items": ["Modélisation 3D du meuble", "Plans cotés d'ébénisterie", "Fiche quincaillerie et finitions", "Estimation des coûts"],
                "excluded_items": ["Fabrication physique du meuble"],
                "deliverables": ["Dossier ébéniste PDF", "Rendus 3D du meuble", "Fiche matériaux"],
                "estimated_delivery_time": "5-7 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Custom Furniture Design & Bespoke Joinery",
                "short_description": "Detailed blueprints for custom closets, media units, kitchen islands and storage.",
                "detailed_description": "Custom joinery designed to fit your exact room dimensions and storage requirements.",
                "included_items": ["3D furniture modeling", "Dimensioned carpentry blueprints", "Hardware & finishes specification", "Cost estimation"],
                "excluded_items": ["Physical manufacturing and delivery"],
                "deliverables": ["Carpentry fabrication file PDF", "3D render in context", "Hardware & material specs"],
                "estimated_delivery_time": "5-7 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "تصميم الأثاث المخصص والنجارة المعمارية",
                "short_description": "مخططات تفصيلية لغرف الملابس، وحدات التلفاز، جزر المطابخ والخزائن المدمجة.",
                "detailed_description": "تصميم أثاث حصري ومصمم خصيصاً ليناسب مساحاتك واحتياجاتك بدقة متناهية.",
                "included_items": ["نمذجة ثلاثية الأبعاد للأثاث", "مخططات تفصيلية للنجار بالقياسات", "المواصفات التقنية للإكسسوارات والمفصلات", "تقدير تكلفة التصنيع"],
                "excluded_items": ["التصنيع والتركيب الفعلي للأثاث"],
                "deliverables": ["ملف تصنيع مفصل للنجار PDF", "رندرات ثلاثية الأبعاد للأثاث في المكان", "بطاقة المواصفات والمواد"],
                "estimated_delivery_time": "5-7 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Sélection & Shopping List Mobilier / Décoration",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("10000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "3-5 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Liste d'achats clés-en-main avec références exactes, prix et magasins recommandés.",
        "detailed_description": "Sélection experte de canapés, luminaires, tables, chaises, tapis et accessoires de décoration avec liens directs et alternatives budgétaires.",
        "included_items": ["Sélection personnalisée selon votre budget", "Liens directs d'achat et magasins partenaires", "Dimensions et coloris recommandés", "Alternatives par gamme de prix"],
        "excluded_items": ["Achat direct ou avance de fonds", "Réception physique des colis"],
        "deliverables": ["Catalogue Shopping interactif PDF", "Tableau budgétaire chiffré Excel/PDF", "Guide d'agencement des accessoires"],
        "translations": {
            "fr": {
                "name": "Sélection & Shopping List Mobilier / Décoration",
                "short_description": "Liste d'achats avec références exactes, prix et magasins recommandés.",
                "detailed_description": "Sélection experte de mobilier et décoration avec liens directs et budget maîtrisé.",
                "included_items": ["Sélection selon budget", "Liens directs d'achat", "Dimensions et coloris", "Alternatives de prix"],
                "excluded_items": ["Avance de fonds"],
                "deliverables": ["Shopping List interactive PDF", "Tableau budgétaire", "Guide d'agencement"],
                "estimated_delivery_time": "3-5 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Furniture & Decor Procurement Shopping List",
                "short_description": "Turnkey shopping list with exact product references, pricing and store links.",
                "detailed_description": "Expert curation of sofas, lighting, tables, rugs, and decor accessories matching your style and budget.",
                "included_items": ["Personalized budget-matched selection", "Direct store buy links", "Exact dimensions and colors", "Tiered price alternatives"],
                "excluded_items": ["Direct product purchasing"],
                "deliverables": ["Interactive PDF shopping catalog", "Budget itemized spreadsheet", "Decor styling guide"],
                "estimated_delivery_time": "3-5 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "قائمة الشراء واختيار الأثاث والديكور",
                "short_description": "قائمة تسوق متكاملة بروابط المنتجات والأسعار والمتاجر الموصى بها.",
                "detailed_description": "اختيار متقن للأثاث والإضاءة والسجاد والتحف الديكورية بما يتناسب مع ميزانيتك وذوقك.",
                "included_items": ["اختيار مخصص وفق الميزانية المحددة", "روابط شراء مباشرة ومتاجر شريكة", "الأبعاد والألوان الدقيقة لكل قطعة", "بدائل متدرجة حسب الأسعار"],
                "excluded_items": ["الشراء الفعلي نيابة عن العميل"],
                "deliverables": ["كتالوج تسوق تفاعلي بصيغة PDF", "جدول تفصيلي للميزانية والتكاليف", "دليل تنسيق وترتيب الإكسسوارات"],
                "estimated_delivery_time": "3-5 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Étude Acoustique & Traitement Sonore",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("22000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "4-6 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Optimisation acoustique, isolation phonique et intégration esthétique de panneaux acoustiques.",
        "detailed_description": "Étude des réverbérations et isolation phonique pour salles de home cinéma, bureaux calmes, salons spacieux ou chambres à coucher.",
        "included_items": ["Calcul du temps de réverbération (RT60)", "Recommandations de matériaux absorbants/isolants", "Design d'intégration des panneaux acoustiques muraux", "Conseils pour vitrages et cloisons phoniques"],
        "excluded_items": ["Fourniture des panneaux acoustiques", "Travaux d'isolation phonique"],
        "deliverables": ["Rapport d'expertise acoustique PDF", "Plan d'implantation des panneaux", "Fiches techniques des matériaux recommandés"],
        "translations": {
            "fr": {
                "name": "Étude Acoustique & Traitement Sonore",
                "short_description": "Optimisation acoustique, isolation phonique et panneaux design.",
                "detailed_description": "Étude des réverbérations et solutions acoustiques pour home cinéma, bureaux et salons.",
                "included_items": ["Calcul de réverbération", "Matériaux absorbants et isolants", "Design de panneaux acoustiques", "Conseils cloisons phoniques"],
                "excluded_items": ["Pose des panneaux"],
                "deliverables": ["Rapport acoustique PDF", "Plan d'implantation", "Fiches matériaux"],
                "estimated_delivery_time": "4-6 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Acoustic Study & Sound Treatment Plan",
                "short_description": "Acoustic optimization, soundproofing solutions and decorative acoustic panel layout.",
                "detailed_description": "Reverberation analysis and sound insulation for home theaters, quiet offices, and living spaces.",
                "included_items": ["Reverberation time calculations (RT60)", "Sound absorption & insulation specs", "Acoustic panel aesthetic integration", "Glazing and partition acoustic advice"],
                "excluded_items": ["Physical panel installation"],
                "deliverables": ["Acoustic engineering report PDF", "Panel placement blueprint", "Technical material datasheets"],
                "estimated_delivery_time": "4-6 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "الدراسة الصوتية والمعالجة الصوتية للمساحات",
                "short_description": "تحسين الأداء الصوتي، العزل، وتوزيع الألواح الصوتية الجدارية بطريقة جمالية.",
                "detailed_description": "دراسة صدى الصوت والعزل الصوتي لقاعات السينما المنزلية، المكاتب الهادئة وغرف المعيشة.",
                "included_items": ["حساب زمن ارتداد الصوت والترددات", "تحديد المواد الماصة والعازلة للصوت", "تصميم وتوزيع الألواح الصوتية الجدارية", "توصيات العزل الصوتي للأبواب والزجاج"],
                "excluded_items": ["التركيب الفعلي للألواح والعوازل"],
                "deliverables": ["تقرير دراسة صوتية شامل بصيغة PDF", "مخطط توزيع الألواح والعوازل", "بطاقات المواصفات التقنية للخامات"],
                "estimated_delivery_time": "4-6 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
    {
        "service_name": "Home Staging & Valorisation Immobilière",
        "pricing_type": ServicePricing.PricingType.FIXED,
        "service_price": Decimal("30000.00"),
        "percentage_rate": Decimal("0.00"),
        "min_fee": None,
        "max_fee": None,
        "is_default": False,
        "is_active": True,
        "estimated_delivery_time": "3-5 jours ouvrés",
        "included_revisions": "2 révisions incluses",
        "short_description": "Optimisation visuelle et mise en valeur pour vente ou location immobilière au meilleur prix.",
        "detailed_description": "Stratégie de transformation rapide et économique pour créer un coup de cœur immédiat auprès des acquéreurs ou locataires potentiels.",
        "included_items": ["Diagnostic complet pièce par pièce", "Plan d'aménagement dépersonnalisé", "Recommandations de relooking express à petit budget", "Conseils pour photographies immobilières vendeuses"],
        "excluded_items": ["Mobilier physique de location", "Travaux de rénovation lourde"],
        "deliverables": ["Guide complet de Home Staging PDF", "Checklist de préparation avant visites", "Moodboard des aménagements express"],
        "translations": {
            "fr": {
                "name": "Home Staging & Valorisation Immobilière",
                "short_description": "Optimisation visuelle pour vente ou location au meilleur prix.",
                "detailed_description": "Stratégie de relooking express pour maximiser la valeur de votre bien immobilier.",
                "included_items": ["Diagnostic pièce par pièce", "Plan dépersonnalisé", "Relooking express petit budget", "Conseils photos de vente"],
                "excluded_items": ["Mobilier de location"],
                "deliverables": ["Guide Home Staging PDF", "Checklist avant visites", "Moodboard express"],
                "estimated_delivery_time": "3-5 jours ouvrés",
                "included_revisions": "2 révisions incluses",
            },
            "en": {
                "name": "Home Staging & Real Estate Value Enhancement",
                "short_description": "Visual property optimization to maximize sale or rental value quickly.",
                "detailed_description": "Strategic cost-effective makeover plan designed to trigger immediate buyer attraction.",
                "included_items": ["Room-by-room staging audit", "Depersonalized layout plan", "Low-budget quick makeover guide", "Real estate photo staging tips"],
                "excluded_items": ["Furniture rental fees"],
                "deliverables": ["Home staging handbook PDF", "Pre-visit checklist", "Express makeover moodboard"],
                "estimated_delivery_time": "3-5 business days",
                "included_revisions": "2 revisions included",
            },
            "ar": {
                "name": "التجهيز العقاري والارتقاء بالقيمة العقارية",
                "short_description": "التحسين البصري وتجهيز العقار للبيع أو الإيجار بأعلى عائد وبأسرع وقت.",
                "detailed_description": "خطة تجديد بصرية سريعة واقتصادية تبرز أجمل مقومات العقار وتصنع انطباعاً فورياً لدى المشترين.",
                "included_items": ["تشخيص وتدقيق شامل لكل غرفة", "مخطط توزيع أثاث جذاب ومريح", "دليل التجديد السريع بميزانية اقتصادية", "إرشادات التصوير الفوتوغرافي العقاري الاحترافي"],
                "excluded_items": ["استئجار الأثاث الفعلي"],
                "deliverables": ["دليل التجهيز العقاري الشامل PDF", "قائمة المهام والجاهزية قبل الزيارات", "لوحة أفكار التجديد السريع"],
                "estimated_delivery_time": "3-5 أيام عمل",
                "included_revisions": "تعديلان مشمولان",
            },
        },
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# 2. 20 CATEGORIES FOR EACH SPACE
# ─────────────────────────────────────────────────────────────────────────────

CATEGORIES_DATA = [
    {"name": "Minimaliste Moderne", "palette": [(24, 32, 38), (45, 60, 72), (85, 220, 255), (240, 245, 248)]},
    {"name": "Esthétique Japandi", "palette": [(44, 38, 33), (112, 94, 80), (218, 192, 168), (245, 240, 235)]},
    {"name": "Scandinave Chaleureux", "palette": [(35, 45, 48), (95, 120, 128), (245, 215, 160), (250, 248, 245)]},
    {"name": "Loft Industriel & Brut", "palette": [(20, 20, 22), (65, 50, 42), (180, 85, 45), (190, 195, 200)]},
    {"name": "Néo-Classique Élégant", "palette": [(30, 32, 40), (80, 85, 105), (212, 175, 55), (248, 246, 240)]},
    {"name": "Luxe Contemporain", "palette": [(15, 18, 24), (55, 65, 80), (230, 195, 110), (245, 245, 250)]},
    {"name": "Bohème & Ethnique Chic", "palette": [(45, 30, 25), (145, 75, 50), (225, 160, 95), (245, 235, 220)]},
    {"name": "Mid-Century Vintage", "palette": [(30, 40, 35), (135, 85, 40), (215, 135, 50), (240, 235, 225)]},
    {"name": "Méditerranéen & Côtier", "palette": [(20, 45, 65), (50, 110, 150), (235, 205, 155), (250, 250, 252)]},
    {"name": "Art Déco & Glamour", "palette": [(12, 20, 28), (40, 75, 95), (210, 170, 70), (235, 225, 205)]},
    {"name": "Wabi-Sabi & Épure", "palette": [(38, 36, 34), (90, 85, 80), (180, 170, 160), (235, 230, 225)]},
    {"name": "Biophilique & Végétal", "palette": [(18, 35, 25), (45, 90, 60), (125, 195, 140), (240, 248, 242)]},
    {"name": "Rustique & Farmhouse", "palette": [(40, 32, 25), (105, 80, 60), (195, 160, 125), (245, 240, 230)]},
    {"name": "High-Tech Smart Home", "palette": [(10, 15, 22), (30, 50, 75), (0, 210, 255), (220, 235, 245)]},
    {"name": "Monochrome & Dark Chic", "palette": [(12, 14, 18), (35, 40, 48), (90, 98, 110), (220, 225, 230)]},
    {"name": "Chic Parisien Haussmannien", "palette": [(32, 34, 42), (90, 95, 115), (205, 165, 90), (250, 248, 245)]},
    {"name": "Harmonie Transitionnelle", "palette": [(35, 40, 45), (100, 110, 120), (200, 185, 165), (245, 245, 245)]},
    {"name": "Organique & Formes Douces", "palette": [(42, 36, 32), (120, 105, 95), (215, 190, 170), (248, 244, 240)]},
    {"name": "Zen & Sérénité", "palette": [(28, 32, 30), (75, 90, 85), (165, 180, 170), (242, 246, 244)]},
    {"name": "Éclectique & Artistique", "palette": [(25, 20, 35), (110, 45, 90), (235, 140, 60), (248, 242, 235)]},
]


def _generate_styled_image(space_name, cat_name, img_index, palette):
    """
    Generates a stylish, varied interior design preview image in memory with Pillow.
    Returns JPEG bytes with guaranteed unique content hash.
    """
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color=palette[0])
    draw = ImageDraw.Draw(img)

    # 1. Subtle stylish diagonal/curved gradient simulation
    c1, c2, c3, c4 = palette
    for y in range(height):
        ratio = y / height
        # Blend c1 -> c2 vertically with light harmonic wave
        wave = math.sin((y / height) * math.pi + (img_index * 0.35)) * 0.15
        mix = max(0.0, min(1.0, ratio + wave))
        r = int(c1[0] * (1 - mix) + c2[0] * mix)
        g = int(c1[1] * (1 - mix) + c2[1] * mix)
        b = int(c1[2] * (1 - mix) + c2[2] * mix)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # 2. Architectural geometric accents (subtle translucent rectangles/frames)
    accent_box = [
        int(40 + (img_index * 11) % 50),
        int(40 + (img_index * 7) % 40),
        int(width - 40 - (img_index * 9) % 50),
        int(height - 40 - (img_index * 13) % 40),
    ]
    draw.rectangle(accent_box, outline=c3, width=2)

    # Inner decorative grid / architectural lines
    for i in range(1, 4):
        offset = i * (height // 5) + (img_index * 8) % 30
        draw.line([(60, offset), (width - 60, offset)], fill=(c2[0] + 20, c2[1] + 20, c2[2] + 20), width=1)

    # 3. Floating Glass Card Centerpiece
    card_margin_x = 100
    card_margin_y = 160
    card_rect = [card_margin_x, card_margin_y, width - card_margin_x, height - card_margin_y]
    draw.rectangle(card_rect, fill=(10, 16, 22), outline=c3, width=1)

    # 4. Text and branding overlay
    # Top badge
    draw.rectangle([card_margin_x + 20, card_margin_y + 18, card_margin_x + 160, card_margin_y + 40], fill=c3)
    draw.text((card_margin_x + 30, card_margin_y + 23), "LOFT DESIGN", fill=(10, 16, 22))

    # Space Title
    draw.text((card_margin_x + 20, card_margin_y + 60), space_name.upper(), fill=(255, 255, 255))
    # Category Style
    draw.text((card_margin_x + 20, card_margin_y + 90), f"Style : {cat_name}", fill=c3)
    # Photo Index & Reference
    draw.text((card_margin_x + 20, card_margin_y + 130), f"Réf. V23-IMG-{img_index:02d} · Rendu HD 4K", fill=(160, 175, 185))
    draw.text((card_margin_x + 20, card_margin_y + 160), "Architecture d'intérieur & Conception sur-mesure", fill=(120, 135, 145))

    # Unique pixel marker in corner to guarantee unique SHA-256 hash per image
    draw.point((width - 2 - (img_index % 50), height - 2 - ((img_index * 3) % 50)), fill=(img_index % 255, (img_index * 7) % 255, (img_index * 13) % 255))

    # Save to BytesIO
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=82, optimize=True)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# MANAGEMENT COMMAND
# ─────────────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Adds 10 services with full translations, 20 categories per space, and 20 images per category"

    def add_arguments(self, parser):
        parser.add_argument("--spaces-limit", type=int, default=None, help="Limit number of spaces to process")

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== SEEDING EXPANDED CATALOG: SERVICES, CATEGORIES & IMAGES ==="))

        # ── Step 1: Add 10 Services ──────────────────────────────────────────
        self.stdout.write("\n1. Seeding 10 Services with full translations...")
        services_created = 0
        services_updated = 0

        for s_data in SERVICES_DATA:
            service, created = ServicePricing.objects.update_or_create(
                service_name=s_data["service_name"],
                defaults={
                    "pricing_type": s_data["pricing_type"],
                    "service_price": s_data["service_price"],
                    "percentage_rate": s_data.get("percentage_rate"),
                    "min_fee": s_data.get("min_fee"),
                    "max_fee": s_data.get("max_fee"),
                    "is_default": s_data.get("is_default", False),
                    "is_active": s_data.get("is_active", True),
                    "short_description": s_data.get("short_description", ""),
                    "detailed_description": s_data.get("detailed_description", ""),
                    "included_items": s_data.get("included_items", []),
                    "excluded_items": s_data.get("excluded_items", []),
                    "deliverables": s_data.get("deliverables", []),
                    "included_revisions": s_data.get("included_revisions", ""),
                    "estimated_delivery_time": s_data.get("estimated_delivery_time", ""),
                },
            )
            if created:
                services_created += 1
            else:
                services_updated += 1

            # Seed Translations (fr, en, ar)
            trans_dict = s_data.get("translations", {})
            for locale, t_vals in trans_dict.items():
                ServiceTranslation.objects.update_or_create(
                    service=service,
                    locale=locale,
                    defaults={
                        "name": t_vals.get("name", service.service_name),
                        "short_description": t_vals.get("short_description", ""),
                        "detailed_description": t_vals.get("detailed_description", ""),
                        "included_items": t_vals.get("included_items", []),
                        "excluded_items": t_vals.get("excluded_items", []),
                        "deliverables": t_vals.get("deliverables", []),
                        "included_revisions": t_vals.get("included_revisions", ""),
                        "estimated_delivery_time": t_vals.get("estimated_delivery_time", ""),
                    },
                )

        self.stdout.write(self.style.SUCCESS(
            f"✓ Services ready: {services_created} created, {services_updated} updated. Total services in DB: {ServicePricing.objects.count()}"
        ))

        # ── Step 2 & 3: 20 Categories per Space & 20 Images per Category ─────
        spaces_qs = Space.objects.all()
        if options.get("spaces_limit"):
            spaces_qs = spaces_qs[:options["spaces_limit"]]

        total_spaces = spaces_qs.count()
        self.stdout.write(f"\n2. Seeding 20 categories per space and 20 images per category for {total_spaces} spaces...")

        total_categories_created = 0
        total_images_created = 0

        for sp_idx, space in enumerate(spaces_qs, 1):
            self.stdout.write(f"  [{sp_idx}/{total_spaces}] Processing Space: {space.name} (id={space.id}) ... ", ending="")
            space_cat_count = 0
            space_img_count = 0

            with transaction.atomic():
                for cat_idx, cat_def in enumerate(CATEGORIES_DATA, 1):
                    cat_name = cat_def["name"]
                    palette = cat_def["palette"]

                    cat, cat_created = SpaceCategory.objects.get_or_create(
                        space=space,
                        category_name=cat_name,
                    )
                    if cat_created:
                        total_categories_created += 1
                    space_cat_count += 1

                    # Check current images count in this category
                    current_images_count = cat.images.count()
                    needed_images = max(0, 20 - current_images_count)

                    if needed_images > 0:
                        for img_idx in range(current_images_count + 1, 21):
                            # Generate unique styled image
                            img_bytes = _generate_styled_image(
                                space_name=space.name,
                                cat_name=cat_name,
                                img_index=img_idx,
                                palette=palette,
                            )
                            img_filename = f"{space.slug}_{slugify(cat_name)}_{img_idx:02d}.jpg"
                            img_hash = hashlib.sha256(img_bytes).hexdigest()

                            SpaceCategoryImages.objects.create(
                                category=cat,
                                image=ContentFile(img_bytes, name=img_filename),
                                is_default=(img_idx == 1),
                                content_hash=img_hash,
                                description=f"Ambiance {cat_name} pour {space.name} - Vue {img_idx}",
                                tags=f"{space.name}, {cat_name}, Interior Design, Loft Design, Vue {img_idx}",
                                reference=f"{space.slug}-{cat.id}-{img_idx:02d}",
                            )
                            total_images_created += 1
                            space_img_count += 1

            self.stdout.write(self.style.SUCCESS(f"OK ({space_cat_count} categories, +{space_img_count} images)"))

        total_cat_final = SpaceCategory.objects.count()
        total_img_final = SpaceCategoryImages.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f"\n=== COMPLETED SUCCESSFULLY ==="
            f"\n• Total Services: {ServicePricing.objects.count()}"
            f"\n• Total Categories across all spaces: {total_cat_final}"
            f"\n• Total Gallery Images: {total_img_final}"
        ))

