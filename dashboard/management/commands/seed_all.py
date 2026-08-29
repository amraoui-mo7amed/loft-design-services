import os
import io
import time
import random
import urllib.request
import urllib.error
from decimal import Decimal
from datetime import timedelta, date

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from user_auth.models import UserProfile
from dashboard.models import (
    ProjectType,
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    ProjectTypeSpace,
    PricingConfig,
    ServicePricing,
    ServiceTranslation,
    Portfolio,
    PortfolioGallery,
    Video,
    ProductCategory,
    Product,
    SpaceProductRecommendation,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Contact,
    Lead,
    Notification,
    DesignRequest,
    DesignRequestFloor,
    DesignRequestSpace,
    DesignRequestOption,
    DesignRequestSpaceImage,
    DesignRequestGalleryImage,
    ProjectGalleryInvitation,
    DesignRequestFile,
    DesignMessage,
    DesignRevision,
    DesignDeliverable,
    DesignNote,
    DesignActivityLog,
    DesignPayment,
    Quote,
    QuoteSpace,
    QuoteItem,
    QuoteAuditEvent,
)

# 1x1 fallback JPEG
FALLBACK_JPEG = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06"
    b"\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
    b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01"
    b"\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00"
    b"\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00"
    b"?\x00\xbf\x00\xff\xd9"
)

# Cached image bytes in memory
IMAGE_CACHE = {}


def fetch_image(url: str, timeout: int = 15) -> bytes:
    """Fetch image from Unsplash / remote URL with caching and fallback."""
    if not url:
        return FALLBACK_JPEG
    if url in IMAGE_CACHE:
        return IMAGE_CACHE[url]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                data = resp.read()
                if len(data) > 500:
                    IMAGE_CACHE[url] = data
                    return data
    except Exception as e:
        print(f"    [!] Failed to download {url[:60]}...: {e}")

    return FALLBACK_JPEG


# Real Unsplash Curated High-Res Photo Collections
SPACE_IMAGES_DATA = [
    {
        "name": "Living Room",
        "price": 8000,
        "categories": [
            {
                "name": "Modern Luxury",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1080&q=80",
                        "desc": "Contemporary open-plan living room with curved bouclé sofa and natural oak paneling.",
                        "tags": "living, luxury, modern, sofa, oak",
                        "ref": "LOFT-LR-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1080&q=80",
                        "desc": "Minimalist living space featuring travertine stone fireplace and textured linen upholstery.",
                        "tags": "minimalist, fireplace, travertine, warm",
                        "ref": "LOFT-LR-002",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&q=80",
                        "desc": "High-ceiling loft living lounge with architectural floor-to-ceiling windows and sculptural lighting.",
                        "tags": "loft, high-ceiling, architectural, lighting",
                        "ref": "LOFT-LR-003",
                    },
                ],
            },
            {
                "name": "Japandi & Minimalist",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1080&q=80",
                        "desc": "Serene Japandi salon with tatami-inspired low seating and paper pendant lanterns.",
                        "tags": "japandi, zen, wood, organic",
                        "ref": "LOFT-LR-004",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1080&q=80",
                        "desc": "Warm Scandinavian living room with soft beige tones, wool throw rugs and fluted wood details.",
                        "tags": "scandinavian, beige, hygge, cozy",
                        "ref": "LOFT-LR-005",
                    },
                ],
            },
        ],
    },
    {
        "name": "Kitchen",
        "price": 12000,
        "categories": [
            {
                "name": "Contemporary Island",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1080&q=80",
                        "desc": "Calacatta marble waterfall island with matte black fixtures and integrated concealed appliances.",
                        "tags": "kitchen, marble, luxury, island, modern",
                        "ref": "LOFT-KT-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1080&q=80",
                        "desc": "Minimalist dark charcoal kitchen with fluted walnut accents and architectural under-cabinet LED strip.",
                        "tags": "dark, charcoal, walnut, modern",
                        "ref": "LOFT-KT-002",
                    },
                ],
            },
            {
                "name": "Scandinavian Light",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1080&q=80",
                        "desc": "Bright Scandinavian kitchen with white terrazzo worktops and oak bar stools.",
                        "tags": "scandinavian, white, bright, terrazzo",
                        "ref": "LOFT-KT-003",
                    },
                ],
            },
        ],
    },
    {
        "name": "Bedroom",
        "price": 6000,
        "categories": [
            {
                "name": "Master Suite",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1080&q=80",
                        "desc": "Bespoke master suite with upholstered velvet fluted headboard, ambient cove lighting and wool carpet.",
                        "tags": "bedroom, master, luxury, velvet, lighting",
                        "ref": "LOFT-BD-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1080&q=80",
                        "desc": "Minimalist neutral bedroom with linen bedding, travertine nightstands and sheer drapery.",
                        "tags": "minimalist, linen, neutral, modern",
                        "ref": "LOFT-BD-002",
                    },
                ],
            },
        ],
    },
    {
        "name": "Bathroom",
        "price": 7000,
        "categories": [
            {
                "name": "Spa & Wellness",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1080&q=80",
                        "desc": "Spa-inspired master bathroom with monolithic freestanding stone bathtub and walk-in rain shower.",
                        "tags": "bathroom, bathtub, spa, stone, luxury",
                        "ref": "LOFT-BT-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1080&q=80",
                        "desc": "Modern terrazzo ensuite bathroom with brushed brass hardware and backlit circular vanity mirrors.",
                        "tags": "terrazzo, brass, vanity, mirror",
                        "ref": "LOFT-BT-002",
                    },
                ],
            },
        ],
    },
    {
        "name": "Dining Room",
        "price": 9000,
        "categories": [
            {
                "name": "Formal Dining",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1080&q=80",
                        "desc": "Architectural dining room with 10-seater solid walnut table and sculptural blown-glass chandelier.",
                        "tags": "dining, walnut, chandelier, luxury",
                        "ref": "LOFT-DN-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1080&q=80",
                        "desc": "Contemporary open-concept dining space with leather dining chairs and large modern abstract artwork.",
                        "tags": "modern, leather, art, open-plan",
                        "ref": "LOFT-DN-002",
                    },
                ],
            },
        ],
    },
    {
        "name": "Home Office",
        "price": 5000,
        "categories": [
            {
                "name": "Executive Studio",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1080&q=80",
                        "desc": "Executive home office with integrated floor-to-ceiling library, fluted walnut desk and acoustic wood slat wall.",
                        "tags": "office, library, walnut, acoustic, desk",
                        "ref": "LOFT-OF-001",
                    },
                    {
                        "url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1080&q=80",
                        "desc": "Airy creative workspace with dual monitor setup, ergonomic leather chair and natural daylight.",
                        "tags": "creative, daylight, minimal, ergonomic",
                        "ref": "LOFT-OF-002",
                    },
                ],
            },
        ],
    },
    {
        "name": "Garden",
        "price": 15000,
        "categories": [
            {
                "name": "Mediterranean Landscaping",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1080&q=80",
                        "desc": "Lush Mediterranean villa garden with olive trees, white limestone paving and integrated outdoor lighting.",
                        "tags": "garden, olive, limestone, landscape, villa",
                        "ref": "LOFT-GD-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Terrace",
        "price": 10000,
        "categories": [
            {
                "name": "Rooftop Lounge",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080&q=80",
                        "desc": "Expansive outdoor terrace with modular weatherproof lounge seating, bioethanol fire table and pergola.",
                        "tags": "terrace, pergola, outdoor, firepit",
                        "ref": "LOFT-TR-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Balcony",
        "price": 4000,
        "categories": [
            {
                "name": "Urban Oasis",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1080&q=80",
                        "desc": "Chic urban balcony with vertical green wall, rattan bistro set and sunset panoramic view.",
                        "tags": "balcony, bistro, rattan, green-wall",
                        "ref": "LOFT-BL-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Corridor",
        "price": 3000,
        "categories": [
            {
                "name": "Architectural Hallway",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&q=80",
                        "desc": "Linear architectural hallway with micro-cement floors, recessed baseboard lighting and art niches.",
                        "tags": "corridor, microcement, lighting, art",
                        "ref": "LOFT-CR-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Kids Room",
        "price": 6500,
        "categories": [
            {
                "name": "Modern Playroom & Bedroom",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1080&q=80",
                        "desc": "Playful Scandinavian children room with custom bunk bed, climbing elements and pastel storage cubes.",
                        "tags": "kids, playroom, bunkbed, pastel",
                        "ref": "LOFT-KD-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Guest Room",
        "price": 7000,
        "categories": [
            {
                "name": "Boutique Hotel Style",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1080&q=80",
                        "desc": "Serene guest retreat with king bed, textured wallpaper, luggage bench and hospitality bar station.",
                        "tags": "guest, hotel, calm, luxury",
                        "ref": "LOFT-GS-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Laundry Room",
        "price": 3500,
        "categories": [
            {
                "name": "Utility & Organization",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1080&q=80",
                        "desc": "Sleek utility room with stacked washer-dryer, quartz countertop, laundry folding station and shaker cabinets.",
                        "tags": "laundry, utility, quartz, organization",
                        "ref": "LOFT-LD-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Storage Room",
        "price": 2500,
        "categories": [
            {
                "name": "Custom Pantry & Storage",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?w=1080&q=80",
                        "desc": "Bespoke walk-in storage pantry with adjustable solid oak shelving and integrated LED strip lighting.",
                        "tags": "storage, pantry, shelves, oak",
                        "ref": "LOFT-ST-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Rooftop",
        "price": 18000,
        "categories": [
            {
                "name": "Skyline Lounge",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1080&q=80",
                        "desc": "Panoramic penthouse rooftop with outdoor kitchen, stainless steel grill, teak decking and bar counter.",
                        "tags": "rooftop, skyline, kitchen, teak, penthouse",
                        "ref": "LOFT-RF-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Entrance Hall",
        "price": 5500,
        "categories": [
            {
                "name": "Grand Foyer",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1080&q=80",
                        "desc": "Double-height foyer featuring sculptural spiral staircase, oversized mirror and marble console table.",
                        "tags": "foyer, entrance, marble, staircase, luxury",
                        "ref": "LOFT-EH-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Study Room",
        "price": 6000,
        "categories": [
            {
                "name": "Library & Reading Nook",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1080&q=80",
                        "desc": "Warm dark-toned library room with reading armchair, brass reading lamp and floor-to-ceiling book joinery.",
                        "tags": "study, library, reading, cozy, brass",
                        "ref": "LOFT-SD-001",
                    },
                ],
            },
        ],
    },
    {
        "name": "Pool Area",
        "price": 22000,
        "categories": [
            {
                "name": "Infinity Pool & Deck",
                "images": [
                    {
                        "url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1080&q=80",
                        "desc": "Modern geometric infinity pool with submerged tanning ledge, sun loungers and perimeter landscaping.",
                        "tags": "pool, infinity, resort, luxury, outdoor",
                        "ref": "LOFT-PL-001",
                    },
                ],
            },
        ],
    },
]

# Real Unsplash User Avatars
USER_AVATARS = [
    {
        "username": "karim_designer",
        "email": "karim.mansouri@loftdesign.com",
        "first_name": "Karim",
        "last_name": "Mansouri",
        "role": "designer",
        "bio": "Lead Architect & Interior Designer with 12+ years experience in high-end residential and commercial projects.",
        "phone": "+213 555 12 34 56",
        "address": "Hydra, Algiers, Algeria",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        "sex": "male",
    },
    {
        "username": "sarah_designer",
        "email": "sarah.benali@loftdesign.com",
        "first_name": "Sarah",
        "last_name": "Benali",
        "role": "designer",
        "bio": "Senior 3D Artist and Space Planner specializing in Japandi, Minimalist and Mediterranean luxury concepts.",
        "phone": "+213 555 98 76 54",
        "address": "El Biar, Algiers, Algeria",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
        "sex": "female",
    },
    {
        "username": "yacine_designer",
        "email": "yacine.haddad@loftdesign.com",
        "first_name": "Yacine",
        "last_name": "Haddad",
        "role": "designer",
        "bio": "Bespoke Furniture Designer & Lighting Specialist. Passionate about natural materials and lighting aesthetics.",
        "phone": "+213 555 45 67 89",
        "address": "Sidi Yahia, Algiers, Algeria",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        "sex": "male",
    },
    {
        "username": "sofiane_client",
        "email": "sofiane.cherif@gmail.com",
        "first_name": "Sofiane",
        "last_name": "Cherif",
        "role": "customer",
        "bio": "Tech Entrepreneur renovating a modern duplex villa in Oran.",
        "phone": "+213 661 22 33 44",
        "address": "Akid Lotfi, Oran, Algeria",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        "sex": "male",
    },
    {
        "username": "amina_client",
        "email": "amina.saidi@gmail.com",
        "first_name": "Amina",
        "last_name": "Saidi",
        "role": "customer",
        "bio": "Art collector seeking full interior overhaul for a contemporary seaside penthouse.",
        "phone": "+213 662 55 66 77",
        "address": "Ain Benian, Algiers, Algeria",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
        "sex": "female",
    },
]

# Real Unsplash Flagship Portfolio Projects
PORTFOLIO_DATA = [
    {
        "title": "Villa Blanche · Contemporary Mediterranean Sanctuary",
        "desc": "A 450 m² luxury villa transformation combining minimalist architecture, custom travertine joinery, expansive floor-to-ceiling glazing and seamless indoor-outdoor living.",
        "tags": "villa, modern, mediterranean, travertine, minimal, luxury",
        "is_featured": True,
        "thumbnail_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        "gallery_urls": [
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1080&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1080&q=80",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1080&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1080&q=80",
        ],
    },
    {
        "title": "Le Marais Penthouse · Industrial Minimalist Loft",
        "desc": "A double-height industrial loft featuring raw micro-cement walls, bespoke black steel mezzanine staircase, fluted walnut kitchen and curated designer lighting fixtures.",
        "tags": "loft, penthouse, industrial, steel, cement, walnut",
        "is_featured": True,
        "thumbnail_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
        "gallery_urls": [
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&q=80",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1080&q=80",
            "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1080&q=80",
        ],
    },
    {
        "title": "Japandi Residence · Serene Organic Minimal Home",
        "desc": "Harmonious residence designed using the Japandi philosophy: soft limestone textures, light oak slatted partitions, concealed storage and tranquil natural lighting.",
        "tags": "japandi, organic, minimal, oak, zen, serene",
        "is_featured": True,
        "thumbnail_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
        "gallery_urls": [
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1080&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1080&q=80",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1080&q=80",
        ],
    },
    {
        "title": "Azure Coastal Duplex · Seafront Luxury Renovation",
        "desc": "Complete overhaul of a 280 m² waterfront duplex with panoramic Mediterranean views, custom white oak joinery, terrazzo flooring and sunset lounge terrace.",
        "tags": "coastal, sea-view, terrace, terrazzo, luxury",
        "is_featured": False,
        "thumbnail_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        "gallery_urls": [
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1080&q=80",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1080&q=80",
            "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1080&q=80",
        ],
    },
    {
        "title": "Atelier Noir · High-End Executive Creative Studio",
        "desc": "Modern corporate headquarters and executive suite with acoustic slatted oak paneling, integrated smart automation, custom brass lighting and leather executive furniture.",
        "tags": "commercial, office, studio, executive, corporate",
        "is_featured": False,
        "thumbnail_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        "gallery_urls": [
            "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1080&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1080&q=80",
        ],
    },
]

# Real Unsplash Marketplace Categories and Designer Products
MARKETPLACE_DATA = [
    {
        "category_name": "Furniture & Seating",
        "desc": "Iconic designer sofas, accent armchairs, dining tables and architectural credenzas.",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "products": [
            {
                "name": "Bouclé Curved 3-Seater Sofa",
                "price": Decimal("185000.00"),
                "sku": "FUR-SOF-001",
                "desc": "Sculptural organic curved sofa upholstered in premium textured cream bouclé fabric with solid oak inner frame.",
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
            },
            {
                "name": "Walnut & Travertine Coffee Table",
                "price": Decimal("75000.00"),
                "sku": "FUR-TBL-002",
                "desc": "Handcrafted minimalist coffee table with natural Italian travertine top and fluted solid canaletto walnut base.",
                "image_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80",
            },
            {
                "name": "Lounge Chair & Ottoman in Cognac Leather",
                "price": Decimal("120000.00"),
                "sku": "FUR-CHR-003",
                "desc": "Ergonomic mid-century modern lounge armchair crafted with full-grain Italian cognac leather and molded walnut shell.",
                "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
            },
        ],
    },
    {
        "category_name": "Lighting & Lamps",
        "desc": "Sculptural pendant lights, architectural floor lamps and ambient wall sconces.",
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        "products": [
            {
                "name": "Brushed Brass Architectural Floor Lamp",
                "price": Decimal("48000.00"),
                "sku": "LGT-FLP-001",
                "desc": "Slender arched floor lamp with heavy black marble base, brushed champagne brass stem and dimmable warm LED.",
                "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
            },
            {
                "name": "Opal Blown Glass Linear Chandelier",
                "price": Decimal("89000.00"),
                "sku": "LGT-CHD-002",
                "desc": "Statement linear pendant light featuring 7 hand-blown matte opal glass globes on a blackened brass frame.",
                "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
            },
        ],
    },
    {
        "category_name": "Decor & Accents",
        "desc": "Artisan ceramic vases, gallery canvas art, sculptural mirrors and marble accessories.",
        "image_url": "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80",
        "products": [
            {
                "name": "Sculptural Raw Ceramic Vase Set (Trio)",
                "price": Decimal("24000.00"),
                "sku": "DEC-VAS-001",
                "desc": "Set of three handcrafted ceramic vessels with tactile chalk-matte finish and organic asymmetric geometry.",
                "image_url": "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80",
            },
            {
                "name": "Asymmetric Organic Wall Mirror",
                "price": Decimal("38000.00"),
                "sku": "DEC-MIR-002",
                "desc": "Large statement wall mirror with pebble-shaped organic bevel and ultra-thin brushed bronze metal frame.",
                "image_url": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
            },
        ],
    },
    {
        "category_name": "Rugs & Textiles",
        "desc": "Handwoven Berber wool rugs, organic linen drapery and textured decorative cushions.",
        "image_url": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80",
        "products": [
            {
                "name": "Handwoven High-Pile Berber Wool Rug (200x300cm)",
                "price": Decimal("95000.00"),
                "sku": "TEX-RUG-001",
                "desc": "Plush 100% natural unbleached Moroccan sheep wool rug featuring subtle geometric charcoal tribal motifs.",
                "image_url": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80",
            },
        ],
    },
]

# Real Videos Data
VIDEOS_DATA = [
    {
        "title": "LOFT DESIGN · Modern Villa 3D Immersion & Walkthrough",
        "link": "https://www.youtube.com/watch?v=66qSJ4EIIdM",
        "desc": "Explore our flagship architectural visualization project featuring photorealistic lighting and spatial flow.",
    },
    {
        "title": "Interior Architecture · Materials, Textures & Experience",
        "link": "https://www.youtube.com/watch?v=66qSJ4EIIdM",
        "desc": "A behind-the-scenes look at how our design team selects raw stones, custom woods and bespoke textiles.",
    },
    {
        "title": "Residential Makeover · Lighting Design & Execution",
        "link": "https://www.youtube.com/watch?v=66qSJ4EIIdM",
        "desc": "From preliminary layout sketches to full turnkey execution in Algiers.",
    },
]


class Command(BaseCommand):
    help = "Seeds complete, high-quality real data for all models using real Unsplash images."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== Starting Full Database Seeding with Real Unsplash Images ==="))

        with transaction.atomic():
            # 1. Pricing Config
            pricing_cfg, _ = PricingConfig.objects.get_or_create(
                pk=1,
                defaults={
                    "tax_rate": Decimal("19.00"),
                    "default_revision_count": 2,
                    "currency_symbol": "DA",
                    "default_delivery_days": 30,
                },
            )
            self.stdout.write(self.style.SUCCESS("✓ PricingConfig initialized"))

            # 2. Users & User Profiles with Real Avatars
            user_map = {}
            for u_data in USER_AVATARS:
                user, created = User.objects.get_or_create(
                    username=u_data["username"],
                    defaults={
                        "email": u_data["email"],
                        "first_name": u_data["first_name"],
                        "last_name": u_data["last_name"],
                        "is_active": True,
                    },
                )
                if created:
                    user.set_password("password123")
                    user.save()

                user_map[u_data["username"]] = user

                profile, _ = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "role": u_data["role"],
                        "bio": u_data["bio"],
                        "phone_number": u_data["phone"],
                        "address": u_data["address"],
                        "sex": u_data["sex"],
                        "is_approved": True,
                        "birth_date": date(1990, 5, 15),
                    },
                )

                if not profile.profile_picture:
                    self.stdout.write(f"  Downloading avatar for {user.username}...")
                    img_bytes = fetch_image(u_data["avatar_url"])
                    profile.profile_picture.save(
                        f"avatar_{user.username}.jpg",
                        ContentFile(img_bytes),
                        save=True,
                    )

            self.stdout.write(self.style.SUCCESS(f"✓ {len(user_map)} Users and Profiles seeded"))

            # 3. Project Types, Spaces, Categories, SpaceCategoryImages
            space_map = {}
            for s_data in SPACE_IMAGES_DATA:
                s_name = s_data["name"]
                space, _ = Space.objects.get_or_create(
                    name=s_name,
                    defaults={
                        "slug": slugify(s_name),
                        "base_price": Decimal(str(s_data["price"])),
                    },
                )
                space_map[s_name] = space

                for cat_data in s_data["categories"]:
                    cat_name = cat_data["name"]
                    category, _ = SpaceCategory.objects.get_or_create(
                        space=space,
                        category_name=cat_name,
                    )

                    for idx, img_info in enumerate(cat_data["images"]):
                        existing = SpaceCategoryImages.objects.filter(
                            category=category,
                            reference=img_info["ref"],
                        ).first()

                        if not existing:
                            self.stdout.write(f"  Downloading image for {space.name} ({cat_name})...")
                            img_bytes = fetch_image(img_info["url"])
                            img_obj = SpaceCategoryImages(
                                category=category,
                                is_default=(idx == 0),
                                description=img_info["desc"],
                                tags=img_info["tags"],
                                reference=img_info["ref"],
                            )
                            img_obj.image.save(
                                f"{space.slug}_{slugify(cat_name)}_{idx+1}.jpg",
                                ContentFile(img_bytes),
                                save=True,
                            )

            # Ensure Project Types
            project_types_config = [
                {
                    "name": "Residential Villa & Apartment",
                    "featured": True,
                    "spaces": ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Dining Room", "Kids Room", "Guest Room", "Study Room", "Laundry Room", "Storage Room"],
                },
                {
                    "name": "Commercial & Corporate Office",
                    "featured": True,
                    "spaces": ["Home Office", "Corridor", "Entrance Hall"],
                },
                {
                    "name": "Outdoor & Landscape Architecture",
                    "featured": True,
                    "spaces": ["Garden", "Terrace", "Balcony", "Rooftop", "Pool Area"],
                },
            ]

            pt_map = {}
            for pt_data in project_types_config:
                pt, _ = ProjectType.objects.get_or_create(
                    slug=slugify(pt_data["name"]),
                    defaults={
                        "name": pt_data["name"],
                        "featured_on_home": pt_data["featured"],
                    },
                )
                pt_map[pt_data["name"]] = pt

                for sort_idx, sp_name in enumerate(pt_data["spaces"]):
                    if sp_name in space_map:
                        sp_obj = space_map[sp_name]
                        ProjectTypeSpace.objects.filter(space=sp_obj).delete()
                        ProjectTypeSpace.objects.create(
                            project_type=pt,
                            space=sp_obj,
                            sort_order=sort_idx,
                            show_on_home=(sort_idx < 4),
                        )

            self.stdout.write(self.style.SUCCESS(f"✓ {len(space_map)} Spaces and ProjectTypes configured"))

            # 4. Services & Service Translations
            services_data = [
                {
                    "name": "3D Architectural Visualization",
                    "price": Decimal("15000.00"),
                    "pricing_type": ServicePricing.PricingType.FIXED,
                    "is_default": True,
                    "short_fr": "Rendu 3D photoréaliste haute définition et modélisation spatiale.",
                    "short_en": "High-definition photorealistic 3D rendering and spatial modeling.",
                    "short_ar": "تصوير ثلاثي الأبعاد فائق الدقة ونمذجة معمارية متكاملة.",
                    "desc_fr": "Conception immersive de vos espaces avec simulation des matériaux, éclairages naturels et détails de mobilier sur-mesure.",
                    "desc_en": "Immersive visualization of your spaces with realistic texture simulation, natural light studies, and custom joinery.",
                    "desc_ar": "تصميم غامر لمساحاتكم مع محاكاة واقعية للمواد والإضاءة الطبيعية والتفاصيل المخصصة.",
                    "included": ["Rendu 4K panoramique", "Étude de lumière jour/nuit", "Plan d'aménagement côté"],
                    "excluded": ["Suivi de chantier physique"],
                    "deliverables": ["Pack d'images 4K Ultra-HD", "Lien de visite interactive 360°", "Fichier PDF des textures"],
                    "delivery": "7 à 10 jours ouvrés",
                    "revisions": "2 révisions incluses",
                },
                {
                    "name": "Full Interior Design & Execution Plans",
                    "price": Decimal("2500.00"),
                    "pricing_type": ServicePricing.PricingType.AREA,
                    "is_default": False,
                    "short_fr": "Dossier d'architecture complet avec plans d'exécution et cahier des charges.",
                    "short_en": "Complete architectural interior package with execution blueprints and specs.",
                    "short_ar": "ملف معماري متكامل مع مخططات تنفيذية ودفتر الشروط.",
                    "desc_fr": "Prise en charge globale de la conception : plans techniques, démolition/reconstruction, électricité, plomberie et menuiserie.",
                    "desc_en": "Comprehensive design service: technical blueprints, demolition/construction, electrical, plumbing and bespoke joinery plans.",
                    "desc_ar": "دراسة معمارية شاملة: المخططات التقنية، الكهرباء، السباكة، وتفاصيل النجارة المخصصة.",
                    "included": ["Plans 2D cotés au 1:50", "Plans d'électricité et faux-plafonds", "Calepinage carrelage", "Rendus 3D"],
                    "excluded": ["Fourniture des matériaux"],
                    "deliverables": ["Dossier PDF d'exécution imprimable", "Fichiers DWG/AutoCAD", "Book de prescriptions"],
                    "delivery": "15 à 20 jours ouvrés",
                    "revisions": "3 révisions incluses",
                },
                {
                    "name": "Custom Furniture Procurement & Staging",
                    "price": Decimal("20000.00"),
                    "pricing_type": ServicePricing.PricingType.FIXED,
                    "is_default": False,
                    "short_fr": "Sélection, sourcing mobilier design et mise en scène décorative.",
                    "short_en": "Curated designer furniture selection, sourcing and decorative staging.",
                    "short_ar": "اختيار وتوريد الأثاث الراقي وتنسيق الديكور النهائي.",
                    "desc_fr": "Accompagnement dans le choix du mobilier, luminaires, rideaux et accessoires avec tarification négociée auprès des fabricants.",
                    "desc_en": "Personalized furniture and decor curation with direct manufacturer pricing and staging guides.",
                    "desc_ar": "مرافقة شخصية لاختيار الأثاث والإضاءة والستائر مع أفضل الأسعار من المصنعين.",
                    "included": ["Moodboards personnalisés", "Shopping list détaillée avec liens", "Conseils d'agencement"],
                    "excluded": ["Montage du mobilier"],
                    "deliverables": ["Catalogue d'achats avec devis fournisseurs", "Guide d'implantation mobilier"],
                    "delivery": "5 à 7 jours ouvrés",
                    "revisions": "2 révisions incluses",
                },
            ]

            service_objs = []
            for s_data in services_data:
                svc, _ = ServicePricing.objects.get_or_create(
                    service_name=s_data["name"],
                    defaults={
                        "service_price": s_data["price"],
                        "pricing_type": s_data["pricing_type"],
                        "is_default": s_data["is_default"],
                        "short_description": s_data["short_fr"],
                        "detailed_description": s_data["desc_fr"],
                        "included_items": s_data["included"],
                        "excluded_items": s_data["excluded"],
                        "deliverables": s_data["deliverables"],
                        "estimated_delivery_time": s_data["delivery"],
                        "included_revisions": s_data["revisions"],
                    },
                )
                service_objs.append(svc)

                # Translations
                for loc, loc_name, s_desc, d_desc in [
                    ("fr", s_data["name"], s_data["short_fr"], s_data["desc_fr"]),
                    ("en", s_data["name"], s_data["short_en"], s_data["desc_en"]),
                    ("ar", s_data["name"], s_data["short_ar"], s_data["desc_ar"]),
                ]:
                    ServiceTranslation.objects.update_or_create(
                        service=svc,
                        locale=loc,
                        defaults={
                            "name": loc_name,
                            "short_description": s_desc,
                            "detailed_description": d_desc,
                            "included_items": s_data["included"],
                            "excluded_items": s_data["excluded"],
                            "deliverables": s_data["deliverables"],
                            "estimated_delivery_time": s_data["delivery"],
                            "included_revisions": s_data["revisions"],
                        },
                    )

            self.stdout.write(self.style.SUCCESS(f"✓ {len(service_objs)} Services & Translations seeded"))

            # 5. Portfolios & Portfolio Gallery Images
            for p_data in PORTFOLIO_DATA:
                port, created = Portfolio.objects.get_or_create(
                    title=p_data["title"],
                    defaults={
                        "description": p_data["desc"],
                        "tags": p_data["tags"],
                        "is_featured": p_data["is_featured"],
                    },
                )
                if not port.thumbnail:
                    self.stdout.write(f"  Downloading portfolio hero for '{port.title[:30]}'...")
                    thumb_bytes = fetch_image(p_data["thumbnail_url"])
                    port.thumbnail.save(
                        f"portfolio_{slugify(port.title[:20])}_thumb.jpg",
                        ContentFile(thumb_bytes),
                        save=True,
                    )

                if port.gallery_images.count() == 0:
                    for g_idx, g_url in enumerate(p_data["gallery_urls"]):
                        self.stdout.write(f"  Downloading portfolio gallery image {g_idx+1}...")
                        g_bytes = fetch_image(g_url)
                        PortfolioGallery.objects.create(
                            portfolio=port,
                            image=ContentFile(g_bytes, name=f"port_{port.pk}_g{g_idx+1}.jpg"),
                        )

            self.stdout.write(self.style.SUCCESS(f"✓ {len(PORTFOLIO_DATA)} Flagship Portfolios seeded"))

            # 6. Marketplace Categories & Products
            all_products = []
            for cat_data in MARKETPLACE_DATA:
                m_cat, _ = ProductCategory.objects.get_or_create(
                    name=cat_data["category_name"],
                    defaults={
                        "slug": slugify(cat_data["category_name"]),
                        "description": cat_data["desc"],
                    },
                )
                if not m_cat.image:
                    self.stdout.write(f"  Downloading category image for {m_cat.name}...")
                    cat_img_bytes = fetch_image(cat_data["image_url"])
                    m_cat.image.save(
                        f"cat_{m_cat.slug}.jpg",
                        ContentFile(cat_img_bytes),
                        save=True,
                    )

                for p_item in cat_data["products"]:
                    prod, _ = Product.objects.get_or_create(
                        sku=p_item["sku"],
                        defaults={
                            "name": p_item["name"],
                            "slug": slugify(p_item["name"]),
                            "description": p_item["desc"],
                            "price": p_item["price"],
                            "category": m_cat,
                            "active": True,
                        },
                    )
                    all_products.append(prod)
                    if not prod.image:
                        self.stdout.write(f"  Downloading product image for '{prod.name}'...")
                        p_img_bytes = fetch_image(p_item["image_url"])
                        prod.image.save(
                            f"prod_{prod.sku.lower()}.jpg",
                            ContentFile(p_img_bytes),
                            save=True,
                        )

            # Recommendations
            living_room = space_map.get("Living Room")
            if living_room and all_products:
                for idx, p in enumerate(all_products[:3]):
                    SpaceProductRecommendation.objects.get_or_create(
                        space=living_room,
                        product=p,
                        defaults={"priority": idx + 1},
                    )

            self.stdout.write(self.style.SUCCESS(f"✓ Marketplace Categories & {len(all_products)} Products seeded"))

            # 7. Videos
            for v_data in VIDEOS_DATA:
                Video.objects.get_or_create(
                    title=v_data["title"],
                    defaults={
                        "link": v_data["link"],
                        "description": v_data["desc"],
                    },
                )
            self.stdout.write(self.style.SUCCESS("✓ Videos seeded"))

            # 8. Design Requests, Floors, Spaces, Messages, Deliverables
            client_user = user_map.get("sofiane_client")
            client_user2 = user_map.get("amina_client")
            designer_user = user_map.get("karim_designer")
            default_pt = list(pt_map.values())[0]
            default_svc = service_objs[0]

            req1, _ = DesignRequest.objects.get_or_create(
                project_name="Duplex Villa Modern Living & Dining Renovation",
                defaults={
                    "client": client_user,
                    "first_name": "Sofiane",
                    "last_name": "Cherif",
                    "email": "sofiane.cherif@gmail.com",
                    "phone": "+213 661 22 33 44",
                    "project_type": default_pt,
                    "service": default_svc,
                    "status": DesignRequest.Status.APPROVED,
                    "designer": designer_user,
                    "budget": Decimal("450000.00"),
                    "total": Decimal("75000.00"),
                    "total_surface": Decimal("180.00"),
                    "has_terrace": True,
                    "has_garden": True,
                    "floors_above": 1,
                    "floors_below": 0,
                    "wilaya": "Oran",
                    "commune": "Akid Lotfi",
                    "message": "Complete interior revamp of ground floor and first-floor master suite.",
                },
            )

            # Floors & Spaces for Req 1
            floor_rdc, _ = DesignRequestFloor.objects.get_or_create(
                design_request=req1,
                level=0,
                defaults={"name": "Rez-de-chaussée (RDC)", "order": 0, "surface": Decimal("100.00")},
            )
            floor_f1, _ = DesignRequestFloor.objects.get_or_create(
                design_request=req1,
                level=1,
                defaults={"name": "1er Étage", "order": 1, "surface": Decimal("80.00")},
            )

            if space_map.get("Living Room"):
                d_sp1, _ = DesignRequestSpace.objects.get_or_create(
                    design_request=req1,
                    floor=floor_rdc,
                    space=space_map["Living Room"],
                    defaults={"custom_name": "Grand Salon & Coin Cheminée", "price_at_time": Decimal("8000.00")},
                )
                # Link space images
                sample_img = SpaceCategoryImages.objects.filter(category__space=space_map["Living Room"]).first()
                if sample_img:
                    DesignRequestSpaceImage.objects.get_or_create(
                        design_request_space=d_sp1,
                        space_image=sample_img,
                    )
                    DesignRequestGalleryImage.objects.get_or_create(
                        design_request=req1,
                        space_image=sample_img,
                        defaults={"notes": "Love the curved sofa and ambient wood slatted lighting."},
                    )

            if space_map.get("Bedroom"):
                DesignRequestSpace.objects.get_or_create(
                    design_request=req1,
                    floor=floor_f1,
                    space=space_map["Bedroom"],
                    defaults={"custom_name": "Master Suite Parentale", "price_at_time": Decimal("6000.00")},
                )

            # Messages & Collaboration
            DesignMessage.objects.get_or_create(
                design_request=req1,
                sender=client_user,
                message="Bonjour Karim, nous avons hâte de voir les premières propositions 3D pour le salon !",
                defaults={"is_read": True},
            )
            DesignMessage.objects.get_or_create(
                design_request=req1,
                sender=designer_user,
                message="Bonjour Sofiane ! Les premiers rendus 3D sont prêts et téléchargés dans l'onglet Livrables.",
                defaults={"is_read": True},
            )

            # Deliverables
            sample_deliverable_img = fetch_image("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1080&q=80")
            deliv, _ = DesignDeliverable.objects.get_or_create(
                design_request=req1,
                title="Rendu 3D Salon & Salle à Manger v1",
                defaults={
                    "file_type": "image/jpeg",
                    "version": 1,
                    "uploaded_by": designer_user,
                    "approved_at": timezone.now(),
                },
            )
            if not deliv.file:
                deliv.file.save("render_v1.jpg", ContentFile(sample_deliverable_img), save=True)

            # Revisions & Notes & Payments
            DesignNote.objects.get_or_create(
                design_request=req1,
                author=designer_user,
                defaults={"note": "Client prefers warm oak veneers over dark walnut.", "is_internal": True},
            )
            DesignPayment.objects.get_or_create(
                design_request=req1,
                amount=Decimal("75000.00"),
                defaults={
                    "payment_method": "stripe",
                    "transaction_id": "ch_3N8LoftDesign2026Sample",
                    "status": DesignPayment.PaymentStatus.COMPLETED,
                    "paid_at": timezone.now(),
                },
            )

            # 9. Quotes & Quote Items
            admin_user = User.objects.filter(is_superuser=True).first() or user_map.get("karim_designer")
            quote1, _ = Quote.objects.get_or_create(
                quote_number="DEV-2026-0001",
                defaults={
                    "project_name": "Duplex Villa Modern Living & Dining Renovation",
                    "project_type": default_pt,
                    "design_request": req1,
                    "client": client_user,
                    "created_by": admin_user,
                    "first_name": "Sofiane",
                    "last_name": "Cherif",
                    "email": "sofiane.cherif@gmail.com",
                    "phone": "+213 661 22 33 44",
                    "client_type": Quote.ClientType.PARTICULAR,
                    "status": Quote.Status.ACCEPTED,
                    "origin": Quote.Origin.CUSTOMER,
                    "total_surface": Decimal("180.00"),
                    "subtotal_before_discount": Decimal("75000.00"),
                    "subtotal_after_discount": Decimal("75000.00"),
                    "tax_amount": Decimal("14250.00"),
                    "final_total": Decimal("89250.00"),
                },
            )

            QuoteItem.objects.get_or_create(
                quote=quote1,
                service=default_svc,
                defaults={
                    "service_name": default_svc.service_name,
                    "pricing_model": "fixed",
                    "unit_price": Decimal("75000.00"),
                    "quantity": Decimal("1.00"),
                    "unit": "FORFAIT",
                    "line_total": Decimal("75000.00"),
                },
            )

            QuoteAuditEvent.objects.get_or_create(
                quote=quote1,
                actor=admin_user,
                action="created",
                defaults={"reason": "Quote created from design request", "metadata": {"source": "seed"}},
            )

            # 10. Orders & Cart
            if client_user and all_products:
                order1, _ = Order.objects.get_or_create(
                    user=client_user,
                    defaults={
                        "status": Order.OrderStatus.CONFIRMED,
                        "total": Decimal("260000.00"),
                        "payment_method": "Credit Card / CIB",
                        "shipping_address": "Résidence Les Pins, Apt 4B, Akid Lotfi, Oran",
                    },
                )
                for prod in all_products[:2]:
                    OrderItem.objects.get_or_create(
                        order=order1,
                        product=prod,
                        defaults={
                            "quantity": 1,
                            "price_at_time": prod.price,
                        },
                    )

                cart1, _ = Cart.objects.get_or_create(user=client_user)
                if len(all_products) > 2:
                    CartItem.objects.get_or_create(
                        cart=cart1,
                        product=all_products[2],
                        defaults={
                            "quantity": 1,
                            "price_at_time": all_products[2].price,
                        },
                    )

            # 11. Inbound Contacts & Leads
            Contact.objects.get_or_create(
                email="contact.pro@algeria-invest.com",
                defaults={
                    "name": "Nabil Belkacem",
                    "phone": "+213 550 11 22 33",
                    "message": "Nous souhaitons concevoir l'aménagement intérieur de notre nouveau siège social de 600m² à Bab Ezzouar.",
                    "is_read": False,
                },
            )
            Lead.objects.get_or_create(
                email="riad.archi@yahoo.fr",
                defaults={"name": "Riad Amrani"},
            )

            # 12. Notifications
            if admin_user:
                Notification.objects.get_or_create(
                    user=admin_user,
                    title="Nouveau projet soumis : Villa Modern Living",
                    defaults={
                        "message": "Le client Sofiane Cherif a validé et payé son projet de conception.",
                        "notification_type": Notification.NotificationType.SUCCESS,
                        "is_read": False,
                        "link": f"/dashboard/crm/{req1.pk}/",
                    },
                )

        self.stdout.write(self.style.SUCCESS("\n🎉 Complete database seeded successfully with real Unsplash images!"))
