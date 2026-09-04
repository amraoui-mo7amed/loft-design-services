# TODO List — Règles de Calcul & Périmètres des Services (Rapport V4)

> **Source de référence :** `loft-design-developer-correction-report-v4-gallery-client-dashboard.html` (Sections 1, 2, 3, 4, 5 & 10)
> **Objectif :** Corriger le calcul des devis en dissociant strictement surfaces Intérieure et Extérieure, et permettre à chaque service de calculer son montant selon son périmètre d'application (Intérieur, Extérieur, ou les deux).

---

## Synthèse des Règles de Calcul Métier (Rapport V4)

1. **Séparation Stricte des Surfaces :**
   - `surfaceInterior` = Somme des niveaux bâtis (RDC + Sous-sols R-n + Étages R+n).
   - `surfaceExterior` = Terrasse, Jardin, Piscine, aménagements extérieurs.
   - `surfaceGlobal` = `surfaceInterior + surfaceExterior` (**strictement informatif**, ne doit **jamais** servir de multiplicateur universel automatique).
2. **Modèles de Tarification selon le Périmètre :**
   - **Services 100% Intérieur** (ex: *Conception 3D Immersive Intérieure*) : `surfaceInterior × interiorRate` (exclut totalement l'extérieur).
   - **Services 100% Extérieur** (ex: *Conception 3D Paysagère / Extérieure*) : `surfaceExterior × exteriorRate` (exclut totalement l'intérieur).
   - **Services Mixtes / Compatibles** (ex: *Plans 2D Électricité, Plomberie, Éclairage, Finitions, Démolition*) : L'utilisateur choisit le périmètre facturé via des cases à cocher :
     - Intérieur seul : `surfaceInterior × unitRate`
     - Extérieur seul : `surfaceExterior × unitRate`
     - Intérieur + Extérieur : `(surfaceInterior + surfaceExterior) × unitRate`
   - **Services au Forfait Unitaire (`FIXED_UNIT`)** : `quantity × unitPrice` (ne doit **jamais** être multiplié par une surface).
   - **Services au Pourcentage (`PERCENT_PROJECT_COST`)** : `projectEstimatedCost × percentage / 100` (montant de référence global partagé).
   - **Services à l'Heure (`HOURLY`)** : `hours × hourlyRate`.

---

## 1. Modèle de Données & Base de Données (`dashboard/models/catalog.py`)

- [x] Vérifier les champs du modèle `ServicePricing` / `Service` :
  - [x] `allow_interior` (BooleanField, default=True) : Service applicable à la surface intérieure.
  - [x] `allow_exterior` (BooleanField, default=False) : Service applicable à la surface extérieure.
  - [x] `default_interior_selected` (BooleanField, default=True) : Coché par défaut pour l'intérieur lors du choix du service.
  - [x] `default_exterior_selected` (BooleanField, default=False) : Coché par défaut pour l'extérieur lors du choix du service.
  - [x] `unit_name` (CharField, default="") : Nom de l'unité personnalisée (`m²`, `h`, `façade`, `visite`, `forfait`, `%`).
  - [x] `default_quantity` (PositiveIntegerField, default=1) : Quantité par défaut pour `FIXED_UNIT`.
  - [x] `default_hours` (PositiveIntegerField, default=10/20) : Heures par défaut pour `HOURLY`.
  - [x] `default_reference_amount` (DecimalField, default=100000.00) : Montant de référence par défaut pour les pourcentages.
- [x] Dans `DesignRequest` et `Quote` (`dashboard/models/requests.py`) :
  - [x] Conserver `surface_interior` et `surface_exterior` de manière séparée en base.
  - [x] Enregistrer pour chaque ligne de service le snapshot du périmètre : `scope` (`interior`, `exterior`, `both`, `unit`, `hourly`, `percent`), `use_interior`, `use_exterior`, `billed_surface`.

---

## 2. Interface Admin — Gestion des Services (`/dashboard/design/packages/`)

- [ ] Dans le modal d'ajout / modification de service (`dashboard/templates/dashboard/design/service_list.html`) :
  - [ ] Ajouter la section **Périmètre d'application (Scope)** :
    - [ ] `[ ] Applicable à l'Intérieur` (`allow_interior`)
    - [ ] `[ ] Applicable à l'Extérieur` (`allow_exterior`)
  - [ ] Ajouter les réglages de sélection par défaut :
    - [ ] `[ ] Coché par défaut : Intérieur` (`default_interior_selected`)
    - [ ] `[ ] Coché par défaut : Extérieur` (`default_exterior_selected`)
  - [ ] Affichage conditionnel dans le modal selon le modèle de tarification (`pricing_type`) :
    - Si `area` (`PRICE_PER_M2`) : Afficher les cases à cocher Intérieur / Extérieur et sélections par défaut.
    - Si `fixed` (`FIXED_UNIT`) : Afficher `unit_name` (ex: "façade") et `default_quantity`.
    - Si `hourly` (`HOURLY`) : Afficher `default_hours` et taux horaire.
    - Si `percent_project_cost` : Afficher `percentage_rate`, `min_fee`, `max_fee` et `default_reference_amount`.
- [ ] Dans la vue `service_create` / `service_update` (`dashboard/views/design.py`) :
  - [ ] Traiter et sauvegarder `allow_interior`, `allow_exterior`, `default_interior_selected`, `default_exterior_selected`, `unit_name`, `default_quantity`, `default_hours`, `default_reference_amount`.
- [ ] Dans la liste des services (tableau admin) :
  - [ ] Afficher un badge de périmètre clair : `Intérieur`, `Extérieur`, ou `Intérieur + Extérieur`.

---

## 3. Moteur de Calcul (`dashboard/price_engine.py`)

- [x] Méthode `calculate_service_fee(service, ...)` :
  - [x] Calculer la surface facturée selon les cases sélectionnées :
    `selected_surface = (surface_interior if use_interior else 0) + (surface_exterior if use_exterior else 0)`
  - [x] Appliquer les restrictions admin : si `allow_exterior=False`, forcer `use_exterior=False` ; si `allow_interior=False`, forcer `use_interior=False`.
  - [x] Multiplier uniquement la surface sélectionnée par le tarif unitaire : `selected_surface × service_price`.
  - [x] Fournir une chaîne explicative du détail de calcul (`calculation_detail`) pour la transparence du devis.
  - [x] Clamper les honoraires au pourcentage avec `min_fee` et `max_fee` si configurés.

---

## 4. Configurateur Public / Wizard (`frontend/static/js/home.js` & `home.html`)

- [x] Étape 2 — Sélection des Prestations :
  - [x] Pour les services compatibles (`allow_interior` ET `allow_exterior`) :
    - [x] Afficher les options sous forme de cases à cocher directement sur la carte de service :
      - `[x] Intérieur (surfaceInterior m²)`
      - `[ ] Extérieur (surfaceExterior m²)`
    - [x] Initialiser les cases avec `default_interior_selected` et `default_exterior_selected`.
  - [x] Pour les services mono-périmètre :
    - [x] Si `allow_interior=True` et `allow_exterior=False` : verrouiller sur Intérieur (badge indicatif `Intérieur seul`).
    - [x] Si `allow_interior=False` et `allow_exterior=True` : verrouiller sur Extérieur (badge indicatif `Extérieur seul`).
  - [x] Réactivité instantanée :
    - [x] Le changement d'une case à cocher recalcule immédiatement la ligne du service et le total général sans rechargement.
    - [x] Si aucune case n'est cochée pour un service au m², afficher un avertissement ou surface = 0 m².
- [x] Panneau Récapitulatif / Tiroir de Devis :
  - [x] Afficher pour chaque prestation son périmètre explicite (`Intérieur`, `Extérieur`, ou `Intérieur + Extérieur`).
  - [x] Afficher la formule exacte : ex. `874 m² (Intérieur) × 150 DA/m² = 131 100 DA`.

---

## 5. Édition des Devis Existants & Dossier Commercial (`dashboard/views/quotes.py`)

- [ ] Mode "Modifier le Devis" (`edit_quote`) :
  - [ ] Permettre à l'administrateur de modifier les périmètres Intérieur / Extérieur sur chaque service d'un devis existant.
  - [ ] Permettre d'ajuster les surfaces intérieures et extérieures et recalculer instantanément le devis.
  - [ ] Créer une nouvelle version du devis (`V1` → `V2`) avec historique des modifications sans écraser silencieusement l'ancien.
- [ ] Fiche Commerciale & Export PDF (`dashboard/pdf_generator.py`) :
  - [ ] Tableau de l'offre financière :
    - Colonnes : `Désignation`, `Périmètre / Scope`, `Prix Unitaire HT`, `Unité`, `Base / Quantité`, `Total HT`.
    - Mentionner explicitement la surface prise en compte (Intérieur, Extérieur, ou Mixte).
- [ ] Geler les données historiques (`Snapshot`) lors de la validation d'un devis ou facture (les modifications futures des tarifs admin ne doivent pas altérer les devis/factures déjà émis).