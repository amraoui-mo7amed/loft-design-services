# LoftDesign — Service Calculation Rules & Pricing Engine Specification

This document provides the authoritative mathematical and business rules for the LoftDesign pricing engine, extracted directly from `loft-design-developer-correction-report-v4-gallery-client-dashboard.html` (Sections 1, 2, 3, 4, 5, and 10).

---

## 1. Surface Architecture: Separation of Interior & Exterior

The project composer strictly separates interior and exterior surfaces at both data-model and business-logic levels:

```
surfaceInterior = Sum of all covered/built level surfaces (RDC + Basements R-n + Upper floors R+n)
surfaceExterior = Terrace, Garden, Rooftop, Pool Area, and other outdoor surfaces
surfaceGlobal   = surfaceInterior + surfaceExterior
```

### Critical Rule
> **`surfaceGlobal` is informational only.** It must **never** be automatically used as a universal calculation base or generic multiplier for all services.

### Real Example:
| Area Type | Breakdown / Levels | Surface |
| :--- | :--- | :--- |
| **Interior** | R-1 (258 m²) + Ground Floor RDC (334 m²) + R+1 (282 m²) | **874 m²** |
| **Exterior** | Terrace / Garden / Pool Area | **1,020 m²** |
| **Global** | Interior + Exterior (Informational only) | **1,894 m²** |

---

## 2. Pricing Models & Formulas

Every service in the catalog belongs to one of four authoritative pricing types. There is no single generic formula.

### Summary Table

| Pricing Type | Core Formula | Unit Label | Example Service | Example Parameters | Example Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PRICE_PER_M2` | `selectedSurface × unitRate` | `m²` | Lighting Plan 2D | 874 m² × 150 DA | **131,100 DA** |
| `FIXED_UNIT` | `quantity × unitPrice` | `façade`, `room`, `unit`, `forfait` | 3D Façade Design | 3 façades × 100,000 DA | **300,000 DA** |
| `PERCENT_PROJECT_COST` | `(projectEstimatedCost × percentage) / 100` | `%` | Project Management | 10,000,000 DA × 10% | **1,000,000 DA** |
| `HOURLY` | `hours × hourlyRate` | `h` | Site Monitoring | 20 h × 5,000 DA/h | **100,000 DA** |

---

## 3. Detailed Rules per Pricing Model

### A. Price Per Square Metre (`PRICE_PER_M2`) & Scope Rules

A per-m² service calculates its price based on the **selected surface scope**, never an indiscriminate global surface.

#### Scope Categories:
1. **Interior-Only Services** (e.g. *Immersive 3D Interior Design*, *Interior Architecture*):
   - Scope: `INTERIOR`
   - Formula:
     $$\\text{Price} = \\text{surfaceInterior} \\times \\text{interiorRate}$$
   - *Example:* $874\\text{ m²} \\times 900\\text{ DA} = \\mathbf{786,600\\text{ DA}}$ (Exterior surface is strictly excluded).

2. **Exterior-Only Services** (e.g. *3D Landscape & Exterior Architecture*):
   - Scope: `EXTERIOR`
   - Formula:
     $$\\text{Price} = \\text{surfaceExterior} \\times \\text{exteriorRate}$$
   - *Example:* $1,020\\text{ m²} \\times 600\\text{ DA} = \\mathbf{612,000\\text{ DA}}$ (Interior surface is strictly excluded).

3. **Dual-Scope / Compatible Services** (e.g. *2D Electrical, Plumbing, Lighting, Floor Finishes, Technical Plans, Demolition/Construction*):
   - The user selects the billed scope via interactive checkboxes:
     - `[ ] Interior (surfaceInterior)`
     - `[ ] Exterior (surfaceExterior)`
   - Both options can be selected simultaneously.

   **Calculation Matrix (Unit Rate = 150 DA/m²):**
   | Selected Scope | Formula | Calculation | Total Price |
   | :--- | :--- | :--- | :--- |
   | **Interior Only** | `surfaceInterior × unitRate` | $874\\text{ m²} \\times 150\\text{ DA}$ | **131,100 DA** |
   | **Exterior Only** | `surfaceExterior × unitRate` | $1,020\\text{ m²} \\times 150\\text{ DA}$ | **153,000 DA** |
   | **Interior + Exterior** | `(surfaceInterior + surfaceExterior) × unitRate` | $(874 + 1,020)\\text{ m²} \\times 150\\text{ DA} = 1,894 \\times 150$ | **284,100 DA** |
   | **Neither Selected** | Service inactive for area billing | $0\\text{ m²} \\times 150\\text{ DA}$ | **0 DA** |

---

### B. Fixed Unit Price (`FIXED_UNIT`)

- **Rule:** A fixed-price service must **never** be multiplied by project surface or square meters.
- **Formula:**
  $$\\text{Price} = \\text{unitPrice} \\times \\text{quantity}$$
- Default quantity is `1` (or admin-configured `default_quantity`).
- The UI must display the proper unit name (e.g. `100,000 DA / façade`, `50,000 DA / visite`, `25,000 DA / forfait`). It is an error to display `/ m²` for a fixed unit service.
- *Example:* "3D Façade Design" at 100,000 DA / façade. For 3 façades:
  $$3 \\times 100,000\\text{ DA} = \\mathbf{300,000\\text{ DA}}$$

---

### C. Percentage of Project Cost (`PERCENT_PROJECT_COST`)

- **Rule:** Billed as a percentage of the customer\'s total estimated construction/renovation budget.
- **Formula:**
  $$\\text{Price} = \\frac{\\text{projectEstimatedCost} \\times \\text{percentage}}{100}$$
- Optional admin boundary clamps:
  $$\\text{Fee} = \\max(\\text{min_fee}, \\min(\\text{max_fee}, \\text{Fee}))$$
- **Single Source of Truth:** The estimated project cost is entered once by the user and shared across all percentage-based services. Updating the project cost immediately recalculates all related percentage services.
- Before selection, the UI displays only the percentage rate (e.g. `10%`) rather than an artificial arbitrary amount.
- *Example:* Project Management & Coordination at 10%, with a project estimated cost of 10,000,000 DA:
  $$10,000,000\\text{ DA} \\times 10\\% = \\mathbf{1,000,000\\text{ DA}}$$

---

### D. Hourly Rate (`HOURLY`)

- **Rule:** Billed on the number of dedicated consulting, meeting, or site-supervision hours.
- **Formula:**
  $$\\text{Price} = \\text{hours} \\times \\text{hourlyRate}$$
- Default hours are configurable in admin (`default_hours`, e.g. 10 or 20 hours). The user can adjust hours.
- *Example:* Site Monitoring at 5,000 DA / hour for 20 hours:
  $$20\\text{ h} \\times 5,000\\text{ DA/h} = \\mathbf{100,000\\text{ DA}}$$

---

## 4. Transparent Calculation Breakdown (Summary Display)

Every line in the quotation summary and right-side dock must explain the exact mathematical formula, including scope and multipliers:

```
Per m²:
  Lighting Plan 2D
  Scope: Interior
  874 m² × 150 DA/m² = 131,100 DA

Fixed Unit:
  Façade Design
  Scope: Fixed Unit
  3 façades × 100,000 DA = 300,000 DA

Percentage:
  Project Management & Coordination
  Scope: Percentage
  10% × 10,000,000 DA = 1,000,000 DA

Hourly:
  Site Monitoring
  Scope: Hourly
  20 h × 5,000 DA/h = 100,000 DA
```

---

## 5. Quote Editing & Historical Snapshots

1. **Editing Quotes:**
   - In quote edit mode, admins must be able to change service quantities, toggle Interior/Exterior scope, modify surfaces, adjust hours, and update estimated project cost.
   - Recalculations must immediately trigger using the exact formulas defined above.
2. **Data Freezing (Snapshot):**
   - Validated quotes and invoices freeze `serviceName`, `unitPrice`, `unit`, `quantity`, `percentage`, `scope`, `billedSurface`, `lineTotal`, and `calculationDetail`.
   - Subsequent price modifications in admin never retroactively alter existing quotes.
