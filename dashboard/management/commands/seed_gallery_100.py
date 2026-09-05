import hashlib
import os
import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from dashboard.models import Space, SpaceCategory, SpaceCategoryImages


GALLERY_100_DATA = [
    # ── 1. Architecture & Extérieur (12 photos) ──
    {
        "space": "Architecture",
        "cat": "Façades & Extérieurs",
        "tag": "Modern Architecture",
        "desc": "Façade contemporaine aux lignes pures, géométrie affirmée et surfaces vitrées",
        "pid": "1486406146926-c627a92ad1ab",
        "ref": "loft-gal-100-001",
    },
    {
        "space": "Architecture",
        "cat": "Façades & Extérieurs",
        "tag": "Villa Minimaliste",
        "desc": "Villa d architecte contemporaine avec volumes en porte-à-faux et larges baies vitrées",
        "pid": "1512917774080-9991f1c4c750",
        "ref": "loft-gal-100-002",
    },
    {
        "space": "Architecture",
        "cat": "Façades & Extérieurs",
        "tag": "Béton & Verre",
        "desc": "Élévation architecturale moderne alliant béton texturé, verre et menuiseries sombres",
        "pid": "1545324418-cc1a3fa10c00",
        "ref": "loft-gal-100-003",
    },
    {
        "space": "Architecture",
        "cat": "Façades & Extérieurs",
        "tag": "Architecture Contemporaine",
        "desc": "Résidence d architecte avec intégration subtile dans le paysage environnant",
        "pid": "1513584684374-8bab748fbf90",
        "ref": "loft-gal-100-004",
    },
    {
        "space": "Architecture",
        "cat": "Villas & Résidences",
        "tag": "Villa de Luxe",
        "desc": "Propriété de prestige aux volumes généreux, éclairage scénographique nocturne",
        "pid": "1600585154340-be6161a56a0c",
        "ref": "loft-gal-100-005",
    },
    {
        "space": "Architecture",
        "cat": "Villas & Résidences",
        "tag": "Résidence Moderne",
        "desc": "Entrée de résidence contemporaine avec auvent design et parvis minéral",
        "pid": "1600596542815-ffad4c1539a9",
        "ref": "loft-gal-100-006",
    },
    {
        "space": "Architecture",
        "cat": "Villas & Résidences",
        "tag": "Architecture Urbaine",
        "desc": "Architecture urbaine haut standing aux lignes épurées et matériaux pérennes",
        "pid": "1600607687939-ce8a6c25118c",
        "ref": "loft-gal-100-007",
    },
    {
        "space": "Architecture",
        "cat": "Villas & Résidences",
        "tag": "Maison d Architecte",
        "desc": "Volumes cubiques imbriqués avec terrasses suspendues et bardage naturel",
        "pid": "1600566753376-12c8ab7fb75b",
        "ref": "loft-gal-100-008",
    },
    {
        "space": "Architecture",
        "cat": "Élévations & Volumes",
        "tag": "Design Géométrique",
        "desc": "Jeux d ombres et de lumière sur façades architecturales en brique et pierre",
        "pid": "1600585154526-990dced4db0d",
        "ref": "loft-gal-100-009",
    },
    {
        "space": "Architecture",
        "cat": "Élévations & Volumes",
        "tag": "Façade Épurée",
        "desc": "Harmonie des proportions, menuiseries fines et continuité visuelle",
        "pid": "1600573472591-ee6b68d14c68",
        "ref": "loft-gal-100-010",
    },
    {
        "space": "Architecture",
        "cat": "Élévations & Volumes",
        "tag": "Pavillon Contemporain",
        "desc": "Pavillon vitré ouvert sur jardin zen et patio d agrément",
        "pid": "1600585152220-90363fe7e115",
        "ref": "loft-gal-100-011",
    },
    {
        "space": "Architecture",
        "cat": "Élévations & Volumes",
        "tag": "Structure Métal & Bois",
        "desc": "Structure alliant ossature acier et habillage bois chaleureux",
        "pid": "1600565193348-f74bd3c7ccdf",
        "ref": "loft-gal-100-012",
    },

    # ── 2. Modern Apartment & Lofts (12 photos) ──
    {
        "space": "Modern Apartment",
        "cat": "Lofts & Duplex",
        "tag": "Open Space Loft",
        "desc": "Grand volume loft décloisonné avec belle hauteur sous plafond et verrière",
        "pid": "1502672260266-1c1ef2d93688",
        "ref": "loft-gal-100-013",
    },
    {
        "space": "Modern Apartment",
        "cat": "Lofts & Duplex",
        "tag": "Duplex d Architecte",
        "desc": "Appartement contemporain en duplex avec escalier suspendu et mezzanine",
        "pid": "1616046229478-9901c5536a45",
        "ref": "loft-gal-100-014",
    },
    {
        "space": "Modern Apartment",
        "cat": "Lofts & Duplex",
        "tag": "Loft Contemporain",
        "desc": "Pièce de vie traversante associant teintes neutres et mobilier sur mesure",
        "pid": "1560448204-61dc36dc98c8",
        "ref": "loft-gal-100-015",
    },
    {
        "space": "Modern Apartment",
        "cat": "Lofts & Duplex",
        "tag": "Mezzanine & Escalier",
        "desc": "Aménagement intérieur fluide reliant l espace salon et le niveau supérieur",
        "pid": "1507089947368-19c1da9775ae",
        "ref": "loft-gal-100-016",
    },
    {
        "space": "Modern Apartment",
        "cat": "Penthouses",
        "tag": "Skyline Penthouse",
        "desc": "Salon de penthouse d exception avec vue panoramique imprenable sur la ville",
        "pid": "1560184897-ae75f418493e",
        "ref": "loft-gal-100-017",
    },
    {
        "space": "Modern Apartment",
        "cat": "Penthouses",
        "tag": "Penthouse de Luxe",
        "desc": "Mobilier design italien, marbre veiné et éclairages architecturaux tamisés",
        "pid": "1560185007-cde436f6a4d0",
        "ref": "loft-gal-100-018",
    },
    {
        "space": "Modern Apartment",
        "cat": "Penthouses",
        "tag": "Terrasse Penthouse",
        "desc": "Continuité fluide entre la pièce à vivre et la terrasse panoramique",
        "pid": "1560185127-6ed189bf02f4",
        "ref": "loft-gal-100-019",
    },
    {
        "space": "Modern Apartment",
        "cat": "Penthouses",
        "tag": "Salon Contemporain",
        "desc": "Espace de vie baigné de lumière naturelle du matin au soir",
        "pid": "1560185893-a55cbc8c57e8",
        "ref": "loft-gal-100-020",
    },
    {
        "space": "Modern Apartment",
        "cat": "Espaces Ouverts",
        "tag": "Appartement Haussmannien",
        "desc": "Moulures et parquets anciens sublimés par un design minimaliste contemporain",
        "pid": "1567496898669-ee935f5f647a",
        "ref": "loft-gal-100-021",
    },
    {
        "space": "Modern Apartment",
        "cat": "Espaces Ouverts",
        "tag": "Design Scandinave",
        "desc": "Atmosphère sereine en chêne blond, textiles naturels et teintes claires",
        "pid": "1522708323590-d24dbb6b0267",
        "ref": "loft-gal-100-022",
    },
    {
        "space": "Modern Apartment",
        "cat": "Espaces Ouverts",
        "tag": "Studio Optimisé",
        "desc": "Agencement d architecte optimisé avec meubles escamotables et rangements intégrés",
        "pid": "1502005097973-6a7082348e28",
        "ref": "loft-gal-100-023",
    },
    {
        "space": "Modern Apartment",
        "cat": "Espaces Ouverts",
        "tag": "Appartement Épuré",
        "desc": "Lignes minimalistes, palette sobre et mise en valeur des volumes architecturaux",
        "pid": "1493809842364-78817add7ffb",
        "ref": "loft-gal-100-024",
    },

    # ── 3. Salon & Séjour (Living Room) (12 photos) ──
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Salon Minimaliste",
        "desc": "Canapé d angle aux lignes fluides, table basse en travertin et tapis épais",
        "pid": "1586023492125-27b2c045efd7",
        "ref": "loft-gal-100-025",
    },
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Japandi Living",
        "desc": "Alliance du minimalisme japonais et du confort scandinave chaleureux",
        "pid": "1600210492486-724fe5c67fb0",
        "ref": "loft-gal-100-026",
    },
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Salon Scandinave",
        "desc": "Luminosité douce, bois clair naturel et touches de céramique artisanale",
        "pid": "1618221195710-dd6b41faaea6",
        "ref": "loft-gal-100-027",
    },
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Grand Salon Ouvert",
        "desc": "Espace de réception généreux avec coin salon, espace lounge et salle à manger",
        "pid": "1618219908412-a29a1bb7b86e",
        "ref": "loft-gal-100-028",
    },
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Salon Cosy & Moderne",
        "desc": "Tonalités feutrées, velours texturés et éclairages d ambiance indirects",
        "pid": "1616486338812-3dadae4b4ace",
        "ref": "loft-gal-100-029",
    },
    {
        "space": "Living Room",
        "cat": "Salons Contemporains",
        "tag": "Mobilier Design",
        "desc": "Fauteuils iconiques du design moderne et compositions graphiques sur mesure",
        "pid": "1555041469-a586c61ea9bc",
        "ref": "loft-gal-100-030",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Salon de Réception",
        "desc": "Boiseries murales contemporaines et suspensions sculpturales",
        "pid": "1567016432779-094069958ea5",
        "ref": "loft-gal-100-031",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Console & Entrée",
        "desc": "Perspective élégante reliant le hall d entrée au grand salon de vie",
        "pid": "1583847268964-b28dc8f51f92",
        "ref": "loft-gal-100-032",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Salon Décoration Bleue",
        "desc": "Accents de bleu nuit sur fond écru et table d appoint en laiton brossé",
        "pid": "1598928506311-c55ded91a20c",
        "ref": "loft-gal-100-033",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Atmosphère Lumineuse",
        "desc": "Grandes ouvertures vitrées inondant le salon d une douce lumière zénithale",
        "pid": "1554995207-c18c203602cb",
        "ref": "loft-gal-100-034",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Espace Détente",
        "desc": "Coin méridienne et bibliothèque murale intégrée pour moments calmes",
        "pid": "1524758631624-e2822e304c36",
        "ref": "loft-gal-100-035",
    },
    {
        "space": "Living Room",
        "cat": "Salons de Réception",
        "tag": "Cheminée Contemporaine",
        "desc": "Foyer linéaire moderne encastré dans un meuble en pierre naturelle",
        "pid": "1513694203232-719a280e022f",
        "ref": "loft-gal-100-036",
    },

    # ── 4. Cuisine & Salle à Manger (Kitchen & Dining) (12 photos) ──
    {
        "space": "Kitchen",
        "cat": "Cuisines Îlots & Marbre",
        "tag": "Îlot Marbre Blanc",
        "desc": "Cuisine de chef avec îlot monumental en marbre Calacatta et robinetterie laiton",
        "pid": "1556909114-f6e7ad7d3136",
        "ref": "loft-gal-100-037",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Îlots & Marbre",
        "tag": "Cuisine Minimaliste",
        "desc": "Meubles colonnes sans poignées et crédence intégrée en composite minéral",
        "pid": "1556911220-e15b29be8c8f",
        "ref": "loft-gal-100-038",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Îlots & Marbre",
        "tag": "Bois & Quartz",
        "desc": "Contraste chaleureux entre façades en chêne brossé et plan de travail sombre",
        "pid": "1484154218962-a197022b5858",
        "ref": "loft-gal-100-039",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Îlots & Marbre",
        "tag": "Cuisine Architecte",
        "desc": "Cuisine sur mesure avec hotte intégrée dans le faux plafond et éclairage LED",
        "pid": "1556912172-45b7abe8b7e1",
        "ref": "loft-gal-100-040",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Minimalistes",
        "tag": "Cuisine Contemporaine",
        "desc": "Cuisine épurée avec grand îlot repas et rangements du sol au plafond",
        "pid": "1556909212-d5b604d0c90d",
        "ref": "loft-gal-100-041",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Minimalistes",
        "tag": "Design Sombre & Élégant",
        "desc": "Finitions noir mat texturées, électroménager affleurant et cave à vin vitrée",
        "pid": "1556911073-38141963c9e0",
        "ref": "loft-gal-100-042",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Minimalistes",
        "tag": "Cuisine Scandinave",
        "desc": "Clarté du blanc et chaleur du bois massif pour une cuisine lumineuse",
        "pid": "1556912167-f556f1f39fdf",
        "ref": "loft-gal-100-043",
    },
    {
        "space": "Kitchen",
        "cat": "Cuisines Minimalistes",
        "tag": "Espace Bar Cuisine",
        "desc": "Plan snack convivial pour petits déjeuners et repas informels",
        "pid": "1556912998-c57cc6b63cd7",
        "ref": "loft-gal-100-044",
    },
    {
        "space": "Dining Room",
        "cat": "Salles à Manger Design",
        "tag": "Table Chêne Massif",
        "desc": "Grande table de repas sculpturale pouvant accueillir dix convives",
        "pid": "1617806118233-18e1de247200",
        "ref": "loft-gal-100-045",
    },
    {
        "space": "Dining Room",
        "cat": "Salles à Manger Design",
        "tag": "Luminaires Suspendus",
        "desc": "Composition de luminaires en verre soufflé au-dessus de la table à manger",
        "pid": "1604578762246-41134e37f9cc",
        "ref": "loft-gal-100-046",
    },
    {
        "space": "Dining Room",
        "cat": "Salles à Manger Design",
        "tag": "Repas Baigné de Lumière",
        "desc": "Espace repas avec baies vitrées coulissantes ouvrant sur le jardin",
        "pid": "1615066390971-03e4e1c36ddf",
        "ref": "loft-gal-100-047",
    },
    {
        "space": "Dining Room",
        "cat": "Salles à Manger Design",
        "tag": "Salle à Manger Moderne",
        "desc": "Chaises contemporaines habillées de tissu bouclé et table en pierre polie",
        "pid": "1577140917170-285929fb55b7",
        "ref": "loft-gal-100-048",
    },

    # ── 5. Chambre & Suites (Bedroom & Master Suite) (10 photos) ──
    {
        "space": "Bedroom",
        "cat": "Suites Parentales",
        "tag": "Master Suite Épurée",
        "desc": "Suite parentale spacieuse avec tête de lit capitonnée sur mesure",
        "pid": "1616594039964-ae9021a400a0",
        "ref": "loft-gal-100-049",
    },
    {
        "space": "Bedroom",
        "cat": "Suites Parentales",
        "tag": "Tons Neutres & Lin",
        "desc": "Linge de lit en gaze de lin, palette de teintes douces et apaisantes",
        "pid": "1595526114035-0d45ed16cfbf",
        "ref": "loft-gal-100-050",
    },
    {
        "space": "Bedroom",
        "cat": "Suites Parentales",
        "tag": "Chambre Contemporaine",
        "desc": "Claustra ajouré en noyer séparant subtilement le couchage du dressing",
        "pid": "1560448204-e02f11c3d0e2",
        "ref": "loft-gal-100-051",
    },
    {
        "space": "Bedroom",
        "cat": "Suites Parentales",
        "tag": "Suite d Hôtel Particulier",
        "desc": "Ambiance boutique-hôtel haut de gamme avec chevets flottants et liseuses LED",
        "pid": "1566665797739-1674de7a421a",
        "ref": "loft-gal-100-052",
    },
    {
        "space": "Bedroom",
        "cat": "Suites Parentales",
        "tag": "Chambre Lumineuse",
        "desc": "Chambre principale baignée de soleil avec voilages légers et vue dégagée",
        "pid": "1590490360182-c33d57733427",
        "ref": "loft-gal-100-053",
    },
    {
        "space": "Bedroom",
        "cat": "Chambres d Invités",
        "tag": "Chambre Confort",
        "desc": "Chambre d amis accueillante avec lit douillet et espace bureau d appoint",
        "pid": "1505693416388-ac5ce068fe85",
        "ref": "loft-gal-100-054",
    },
    {
        "space": "Bedroom",
        "cat": "Chambres d Invités",
        "tag": "Suite Contemporaine",
        "desc": "Harmonie des tonalités terracotta et beige sable",
        "pid": "1617325247661-675ab4b64ae2",
        "ref": "loft-gal-100-055",
    },
    {
        "space": "Bedroom",
        "cat": "Chambres d Invités",
        "tag": "Chambre Prestige",
        "desc": "Décoration soignée avec papier peint panoramique textile et parquet",
        "pid": "1613545325278-f24b0cae1224",
        "ref": "loft-gal-100-056",
    },
    {
        "space": "Bedroom",
        "cat": "Chambres d Invités",
        "tag": "Coin Nuit Intimiste",
        "desc": "Espace nuit épuré avec menuiserie sur mesure et rangements invisibles",
        "pid": "1595428774223-ef52624120d2",
        "ref": "loft-gal-100-057",
    },
    {
        "space": "Bedroom",
        "cat": "Chambres d Invités",
        "tag": "Chambre Zen",
        "desc": "Inspiration japonaise avec lit bas en chêne et matières brutes naturelles",
        "pid": "1505691938895-1758d7feb511",
        "ref": "loft-gal-100-058",
    },

    # ── 6. Salle de Bain & Spa (Bathroom) (10 photos) ──
    {
        "space": "Bathroom",
        "cat": "Baignoires & Wellness",
        "tag": "Baignoire Îlot Design",
        "desc": "Baignoire îlot sculpturale en résine minérale posée devant une baie vitrée",
        "pid": "1584622650111-993a426fbf0a",
        "ref": "loft-gal-100-059",
    },
    {
        "space": "Bathroom",
        "cat": "Baignoires & Wellness",
        "tag": "Robinetterie Noire & Marbre",
        "desc": "Marbre veiné blanc, mitigeurs noir mat encastrés et niches rétroéclairées",
        "pid": "1552321554-5fefe8c9ef14",
        "ref": "loft-gal-100-060",
    },
    {
        "space": "Bathroom",
        "cat": "Baignoires & Wellness",
        "tag": "Douche Terrazzo",
        "desc": "Grand receveur affleurant en terrazzo aux éclats minéraux chaleureux",
        "pid": "1620626011761-996317b8d101",
        "ref": "loft-gal-100-061",
    },
    {
        "space": "Bathroom",
        "cat": "Baignoires & Wellness",
        "tag": "Spa Privatif",
        "desc": "Ambiance spa relaxante avec ciel de pluie chromothérapie et banc chauffant",
        "pid": "1507652313519-d4e9174996dd",
        "ref": "loft-gal-100-062",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Douche à l Italienne",
        "desc": "Douche à l italienne sans ressaut avec paroi en verre extra-clair",
        "pid": "1584622781564-1d987f7333c1",
        "ref": "loft-gal-100-063",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Double Vasque Suspendue",
        "desc": "Meuble vasque en noyer d Amérique avec grands tiroirs et miroirs à LED",
        "pid": "1604014237800-1c9102c219da",
        "ref": "loft-gal-100-064",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Salle de Bain Moderne",
        "desc": "Béton ciré aux teintes beiges, vasque en pierre naturelle posée",
        "pid": "1507652313519-d4e9174996dd",
        "ref": "loft-gal-100-065",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Marbre & Miroir Rond",
        "desc": "Miroir rond rétroéclairé sur fond de carrelage grand format effet marbre",
        "pid": "1552321554-5fefe8c9ef14",
        "ref": "loft-gal-100-066",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Espace Bain Zen",
        "desc": "Plantes dépolluantes, claustra bois et sensation de bien-être absolu",
        "pid": "1584622650111-993a426fbf0a",
        "ref": "loft-gal-100-067",
    },
    {
        "space": "Bathroom",
        "cat": "Douches à l Italienne",
        "tag": "Finitions Contemporaines",
        "desc": "Détails impeccables, siphons dissimulés et carrelage rectifié",
        "pid": "1620626011761-996317b8d101",
        "ref": "loft-gal-100-068",
    },

    # ── 7. Terrasse, Balcon & Rooftop (10 photos) ──
    {
        "space": "Terrace",
        "cat": "Terrasses de Villa",
        "tag": "Terrasse Lounge de Villa",
        "desc": "Salon d extérieur contemporain sur terrasse en bois exotique avec coussins d assise",
        "pid": "1600596542815-ffad4c1539a9",
        "ref": "loft-gal-100-069",
    },
    {
        "space": "Terrace",
        "cat": "Terrasses de Villa",
        "tag": "Pergola Bioclimatique",
        "desc": "Pergola à lames orientables abritant une grande table de repas estivale",
        "pid": "1585320806297-9794b3e4eeae",
        "ref": "loft-gal-100-070",
    },
    {
        "space": "Terrace",
        "cat": "Terrasses de Villa",
        "tag": "Terrasse avec Brasero",
        "desc": "Coin lounge intimiste avec foyer d extérieur au gaz pour soirées d été",
        "pid": "1582268611958-ebfd161ef9cf",
        "ref": "loft-gal-100-071",
    },
    {
        "space": "Terrace",
        "cat": "Terrasses de Villa",
        "tag": "Terrasse Moderne Minérale",
        "desc": "Grandes dalles de travertin clair et mobilier outdoor haut de gamme",
        "pid": "1519643381401-22c77e60520e",
        "ref": "loft-gal-100-072",
    },
    {
        "space": "Balcony",
        "cat": "Balcons Contemporains",
        "tag": "Balcon Citadin Végétalisé",
        "desc": "Aménagement compact avec mur végétal, fauteuils Acapulco et vue dégagée",
        "pid": "1512917774080-9991f1c4c750",
        "ref": "loft-gal-100-073",
    },
    {
        "space": "Balcony",
        "cat": "Balcons Contemporains",
        "tag": "Vue Panoramique",
        "desc": "Balcon d appartement avec garde-corps vitré pour maximiser le panorama",
        "pid": "1582268611958-ebfd161ef9cf",
        "ref": "loft-gal-100-074",
    },
    {
        "space": "Rooftop",
        "cat": "Rooftops Panoramiques",
        "tag": "Rooftop Coucher de Soleil",
        "desc": "Toit-terrasse panoramique aménagé avec banquettes maçonnées et coussins outdoor",
        "pid": "1575517111478-7f6afd0973db",
        "ref": "loft-gal-100-075",
    },
    {
        "space": "Rooftop",
        "cat": "Rooftops Panoramiques",
        "tag": "Rooftop Aménagé",
        "desc": "Vue à 360 degrés sur la ville, cuisine d été et bar extérieur sous pergola",
        "pid": "1533090161767-e6ffed986c88",
        "ref": "loft-gal-100-076",
    },
    {
        "space": "Terrace",
        "cat": "Terrasses de Villa",
        "tag": "Terrasse Repas Extérieur",
        "desc": "Table conviviale ombragée par des voiles d ombrage géométriques",
        "pid": "1533105079780-92b9be482077",
        "ref": "loft-gal-100-077",
    },
    {
        "space": "Rooftop",
        "cat": "Rooftops Panoramiques",
        "tag": "Pergola de Toit",
        "desc": "Espace détente ombragé avec luminaires suspendus résistants aux intempéries",
        "pid": "1571896349842-33c89424de2d",
        "ref": "loft-gal-100-078",
    },

    # ── 8. Jardin & Piscine (Garden & Pool) (8 photos) ──
    {
        "space": "Pool Area",
        "cat": "Piscines & Spas",
        "tag": "Piscine à Débordement",
        "desc": "Bassin miroir à débordement reflétant l architecture moderne de la villa",
        "pid": "1576013551627-0cc20b96c2a7",
        "ref": "loft-gal-100-079",
    },
    {
        "space": "Pool Area",
        "cat": "Piscines & Spas",
        "tag": "Plage de Piscine",
        "desc": "Plage immergée avec transats design et revêtement en pierre de Bali",
        "pid": "1584132967334-10e028bd69f7",
        "ref": "loft-gal-100-080",
    },
    {
        "space": "Pool Area",
        "cat": "Piscines & Spas",
        "tag": "Piscine Intérieure Design",
        "desc": "Bassin de nage couvert avec parois en verre et éclairage subaquatique",
        "pid": "1572331165267-854da2b10ccc",
        "ref": "loft-gal-100-081",
    },
    {
        "space": "Pool Area",
        "cat": "Piscines & Spas",
        "tag": "Miroir d Eau Contemporain",
        "desc": "Plan d eau décoratif structurant les circulations entre maison et jardin",
        "pid": "1576013551627-0cc20b96c2a7",
        "ref": "loft-gal-100-082",
    },
    {
        "space": "Garden",
        "cat": "Jardins Paysagers",
        "tag": "Cour Intérieure Zen",
        "desc": "Patio paysager avec graviers ratissés, rochers choisis et arbustes taillés",
        "pid": "1592595896551-12b371d546d5",
        "ref": "loft-gal-100-083",
    },
    {
        "space": "Garden",
        "cat": "Jardins Paysagers",
        "tag": "Jardin Méditerranéen",
        "desc": "Oliviers centenaires, lavandes et murets en pierres sèches traditionnelles",
        "pid": "1489987707025-afc232f7ea0f",
        "ref": "loft-gal-100-084",
    },
    {
        "space": "Garden",
        "cat": "Jardins Paysagers",
        "tag": "Allée Paysagère",
        "desc": "Cheminement de pas japonais éclairé par des bornes LED discrètes",
        "pid": "1585320806297-9794b3e4eeae",
        "ref": "loft-gal-100-085",
    },
    {
        "space": "Garden",
        "cat": "Jardins Paysagers",
        "tag": "Patio Contemporain",
        "desc": "Végétalisation verticale et fontaine murale contemporaine apaisante",
        "pid": "1584738766473-61c083514bf4",
        "ref": "loft-gal-100-086",
    },

    # ── 9. Dressing & Rangements (Dressing Room) (8 photos) ──
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Dressing Portes Vitrées",
        "desc": "Vitrines en verre fumé, profilés aluminium anodisé noir et penderies rétroéclairées",
        "pid": "1544457070-4cd773b4d71e",
        "ref": "loft-gal-100-087",
    },
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Walk-in Dressing Chêne",
        "desc": "Pièce dressing dédiée avec îlot central à tiroirs vitrés pour accessoires",
        "pid": "1595428774223-ef52624120d2",
        "ref": "loft-gal-100-088",
    },
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Penderie Ouverte",
        "desc": "Agencement moderne esprit boutique avec étagères bois et tringles intégrées",
        "pid": "1507652313519-d4e9174996dd",
        "ref": "loft-gal-100-089",
    },
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Dressing Moderne Épuré",
        "desc": "Façades laquées mates sans poignées avec système touche-lâche invisible",
        "pid": "1600585152220-90363fe7e115",
        "ref": "loft-gal-100-090",
    },
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Dressing d Angle Optimisé",
        "desc": "Exploitation ingénieuse des angles avec tringles basculantes et miroirs intégrés",
        "pid": "1616486029423-aaa4789e8c9a",
        "ref": "loft-gal-100-091",
    },
    {
        "space": "Dressing Room",
        "cat": "Dressings Sur Mesure",
        "tag": "Organisateur de Garde-robe",
        "desc": "Compartiments sur mesure pour montres, bijoux, maroquinerie et souliers",
        "pid": "1551298370-9d3d53740c72",
        "ref": "loft-gal-100-092",
    },
    {
        "space": "Laundry Room",
        "cat": "Buanderie & Cellier",
        "tag": "Buanderie Intégrée",
        "desc": "Buanderie épurée avec machines surélevées, paniers intégrés et plan de repassage",
        "pid": "1604335399105-a0c585fd81a1",
        "ref": "loft-gal-100-093",
    },
    {
        "space": "Storage Room",
        "cat": "Buanderie & Cellier",
        "tag": "Cellier Moderne Aménagé",
        "desc": "Rangements modulables en bois clair pour provisions et vaisselle de réception",
        "pid": "1597589827317-4c6d6e0a90bd",
        "ref": "loft-gal-100-094",
    },

    # ── 10. Bureau & Bibliothèque (Home Office) (6 photos) ──
    {
        "space": "Home Office",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Bureau d Architecte",
        "desc": "Large plateau de travail en chêne massif face à une baie vitrée avec vue nature",
        "pid": "1604329760661-e71dc83f8f26",
        "ref": "loft-gal-100-095",
    },
    {
        "space": "Home Office",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Espace Télétravail Minimaliste",
        "desc": "Agencement épuré avec gestion invisible des câbles et rangements suspendus",
        "pid": "1518455027359-f3f8164ba6bd",
        "ref": "loft-gal-100-096",
    },
    {
        "space": "Home Office",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Bureau Contemporain",
        "desc": "Fauteuil ergonomique design, étagères métalliques fines et éclairage ciblé",
        "pid": "1593642632823-8f785ba67e45",
        "ref": "loft-gal-100-097",
    },
    {
        "space": "Study Room",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Bibliothèque Murale",
        "desc": "Grande bibliothèque toute hauteur sur mesure avec échelle coulissante en laiton",
        "pid": "1505664194779-8beaceb93744",
        "ref": "loft-gal-100-098",
    },
    {
        "space": "Study Room",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Coin Lecture Cosy",
        "desc": "Fauteuil lounge en cuir, repose-pieds et table d appoint sous liseuse design",
        "pid": "1524995997946-a1c2e315a42f",
        "ref": "loft-gal-100-099",
    },
    {
        "space": "Home Office",
        "cat": "Bureaux & Bibliothèques",
        "tag": "Atelier de Création",
        "desc": "Atelier lumineux avec planches de tendances, échantillons de matériaux et grand plan",
        "pid": "1585771724684-38269d6639fd",
        "ref": "loft-gal-100-100",
    },
]


class Command(BaseCommand):
    help = "Download and insert 100 curated Unsplash images for apartment, architecture, and spaces into gallery"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Force re-download even if reference exists")

    def handle(self, *args, **options):
        force = options.get("force", False)
        total = len(GALLERY_100_DATA)
        self.stdout.write(f"Preparing to process {total} curated architecture & apartment gallery images...")

        downloaded = 0
        skipped = 0
        failed = 0

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        }

        for idx, item in enumerate(GALLERY_100_DATA, 1):
            space_name = item["space"]
            cat_name = item["cat"]
            tag = item["tag"]
            desc = item["desc"]
            pid = item["pid"]
            ref = item["ref"]
            url = f"https://images.unsplash.com/photo-{pid}?w=1200&q=80&auto=format&fit=crop"

            space, _ = Space.objects.get_or_create(
                name=space_name,
                defaults={
                    "slug": slugify(space_name),
                    "base_price": 8000.0,
                },
            )

            cat, _ = SpaceCategory.objects.get_or_create(
                space=space,
                category_name=cat_name,
            )

            existing = SpaceCategoryImages.objects.filter(reference=ref).first()
            if existing and not force:
                skipped += 1
                self.stdout.write(f"[{idx}/{total}] Exists: {space_name} > {cat_name} ({tag})")
                continue

            self.stdout.write(f"[{idx}/{total}] Downloading: {space_name} > {cat_name} ({tag})... ", ending="")

            try:
                resp = requests.get(url, headers=headers, timeout=25)
                if resp.status_code == 200 and len(resp.content) >= 1000:
                    raw_bytes = resp.content
                    chash = hashlib.sha256(raw_bytes).hexdigest()

                    hash_exists = SpaceCategoryImages.objects.filter(category=cat, content_hash=chash).exists()
                    if hash_exists and not force:
                        skipped += 1
                        self.stdout.write(self.style.WARNING("Duplicate hash in category, skipped"))
                        continue

                    filename = f"{slugify(space_name)}_{idx}_{pid[:10]}.jpg"
                    is_first = not SpaceCategoryImages.objects.filter(category=cat).exists()

                    if existing and force:
                        existing.delete()

                    SpaceCategoryImages.objects.create(
                        category=cat,
                        image=ContentFile(raw_bytes, name=filename),
                        is_default=is_first,
                        tags=f"{tag}, {space_name}, Architecture, Design",
                        description=desc,
                        reference=ref,
                        content_hash=chash,
                    )
                    downloaded += 1
                    self.stdout.write(self.style.SUCCESS(f"OK ({len(raw_bytes):,} bytes)"))
                else:
                    failed += 1
                    self.stdout.write(self.style.WARNING(f"HTTP {resp.status_code}"))
            except Exception as err:
                failed += 1
                self.stdout.write(self.style.ERROR(f"Error: {err}"))

        total_in_db = SpaceCategoryImages.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nFinished! Added: {downloaded}, Skipped: {skipped}, Failed: {failed}. Total gallery images in database: {total_in_db}"
        ))
