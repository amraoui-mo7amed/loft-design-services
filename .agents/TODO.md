# TODO List

## Home Page 

- [x] Read the `/Users/amraouimohamed/sites/loft-design-services/LOFT_DESIGN_V93_MOBILE_SERVICES_FIXED_SCROLL_LAYOUT.html` carefully and apply the composer design and calculations to `home.html`:
  - **Section Head & Stepper**: Modern floating white card with 2-line buttons (number badge, title, subtitle pseudo-element) and full Arabic RTL support (`[dir="rtl"]`).
  - **Step 1 (Project)**: V86/V88 white floating functional cards on transparent background, 6 visual image cards with hover/selected effects, apartment & villa level controls, surface inputs with live recalculations, light cyan total card, and sticky mobile action bar.
  - **Step 2 (Services)**: V82 solid two-column architecture on desktop (light paper available column, dark selected column) + V91 clean white service cards + V93 exact 2-line article layout on phone with two-stage switcher (`.v48StageAvailable` / `.v48StageSelected`), touch-scroll containers, and fixed bottom docks (`.v48MobileServiceNext` and `.v46TotalDock`).
  - **Step 3 (Contact)**: V82 solid paper card with Particulier / Professionnel pill switcher, Wilaya/Commune selectors, and dark summary breakdown.
  - **Cleanup**: Removed all conflicting legacy prototype rules and bottom overrides in `home.css`.