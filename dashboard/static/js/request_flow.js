document.addEventListener("DOMContentLoaded", function () {
    // ── SweetAlert2 Safe Fallback ──
    const safeSwal = {
        fire: function (opts) {
            if (typeof Swal !== "undefined" && typeof Swal.fire === "function") {
                return Swal.fire(opts);
            }
            const msg = (typeof opts === "string") ? opts : (opts.text || opts.title || "");
            if (opts && opts.showCancelButton) {
                const res = window.confirm(msg);
                return Promise.resolve({ isConfirmed: res });
            }
            window.alert(msg);
            return Promise.resolve({ isConfirmed: true });
        }
    };

    // ── Elements ──
    const selectedProjectTypeInput = document.getElementById("selectedProjectType");
    const selectedProjectTypeNameInput = document.getElementById("selectedProjectTypeName");
    const projectTypeSelect = document.getElementById("projectTypeSelect");

    const buildingLevelsStack = document.getElementById("buildingLevelsStack");
    const stackAbove = document.getElementById("stackAbove");
    const stackRdcRow = document.getElementById("stackRdcRow");
    const stackBelow = document.getElementById("stackBelow");
    const btnAddFloorAbove = document.getElementById("btnAddFloorAbove");
    const btnAddFloorBelow = document.getElementById("btnAddFloorBelow");
    const floorsAriaAnnouncement = document.getElementById("floorsAriaAnnouncement");

    const floorSurfacesContainer = document.getElementById("floorSurfacesContainer");
    const step3TotalSurfaceDisplay = document.getElementById("step3TotalSurfaceDisplay");
    const step4TotalSurfaceDisplay = document.getElementById("step4TotalSurfaceDisplay");
    const step4GrandTotalPrice = document.getElementById("step4GrandTotalPrice");
    const factureTableBody = document.getElementById("factureTableBody");
    const serviceOptionRows = document.querySelectorAll(".service-option-row");

    const chipProjectTypeName = document.getElementById("chipProjectTypeName");
    const chipFloorsCount = document.getElementById("chipFloorsCount");
    const chipTotalSurface = document.getElementById("chipTotalSurface");
    const chipServicesCount = document.getElementById("chipServicesCount");
    const chipTotalPrice = document.getElementById("chipTotalPrice");

    const btnEmailFacture = document.getElementById("btnEmailFacture");
    const btnSubmitRequest = document.getElementById("btnSubmitRequest");
    const stickySubmitBtn = document.getElementById("stickySubmitBtn");
    const reqStickyBar = document.getElementById("reqStickyBar");

    // Progressive step cards
    const stepCard1 = document.getElementById("stepCard1");
    const stepCard2 = document.getElementById("stepCard2");
    const stepCard3 = document.getElementById("stepCard3");
    const stepCard4 = document.getElementById("stepCard4");
    const stepCard5 = document.getElementById("stepCard5");

    // Navigation pills
    const trackerNode1 = document.getElementById("trackerNode1");
    const trackerNode2 = document.getElementById("trackerNode2");
    const trackerNode3 = document.getElementById("trackerNode3");
    const trackerNode4 = document.getElementById("trackerNode4");
    const trackerNode5 = document.getElementById("trackerNode5");

    const btnUnlockStep2 = document.getElementById("btnUnlockStep2");
    const btnUnlockStep3 = document.getElementById("btnUnlockStep3");
    const btnUnlockStep4 = document.getElementById("btnUnlockStep4");
    const btnUnlockStep5 = document.getElementById("btnUnlockStep5");

    // ── State: Normalized Building Hierarchy ──
    const floorState = {
        maxAbove: 5,        // highest rendered upper floor
        maxBelow: 5,        // deepest rendered basement
        selectedAbove: 0,   // continuous active count above RDC (0 initially)
        selectedBelow: 0,   // continuous active basements (0 initially)
        terrace: false,     // independent toggle
        garden: false,      // independent toggle
        surfaces: {
            "rdc": 120,
            "terrace": 60,
            "garden": 80,
        }
    };

    let selectedServices = [];
    let calculatedTotalSurface = 120;
    let grandCalculatedTotal = 0;

    // Accessibility screen-reader announcer
    function announceAria(message) {
        if (!floorsAriaAnnouncement) return;
        floorsAriaAnnouncement.textContent = "";
        setTimeout(() => {
            floorsAriaAnnouncement.textContent = message;
        }, 50);
    }

    // Helper CSRF Token
    function getCsrfToken() {
        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input && input.value) return input.value;
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || "";
    }

    function unlockStep(stepEl, nextTracker, prevTracker) {
        if (!stepEl) return;
        stepEl.classList.remove("is-locked");
        if (prevTracker) {
            prevTracker.classList.remove("active");
            prevTracker.classList.add("completed");
        }
        if (nextTracker) {
            nextTracker.classList.add("active");
        }
        stepEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // ── STEP 1: Custom Select Dropdown for Project Type ──
    if (projectTypeSelect) {
        const display = projectTypeSelect.querySelector(".custom-select-display");
        const list = projectTypeSelect.querySelector(".custom-select-list");
        const hiddenInput = projectTypeSelect.querySelector('input[type="hidden"]');

        function onProjectTypeChanged(val, text) {
            if (hiddenInput) hiddenInput.value = val;
            if (selectedProjectTypeInput) selectedProjectTypeInput.value = val;
            if (selectedProjectTypeNameInput) selectedProjectTypeNameInput.value = text;
            if (chipProjectTypeName) chipProjectTypeName.textContent = text;
        }

        if (hiddenInput) {
            hiddenInput.addEventListener("change", function () {
                const selectedLi = list ? list.querySelector(`li[data-value="${this.value}"]`) : null;
                const text = selectedLi ? selectedLi.textContent.trim() : this.value;
                onProjectTypeChanged(this.value, text);
            });
        }

        if (list) {
            list.querySelectorAll("li").forEach(item => {
                item.addEventListener("click", function () {
                    const val = this.dataset.value;
                    const text = this.textContent.trim();
                    onProjectTypeChanged(val, text);
                });
            });
        }
    }

    if (btnUnlockStep2) {
        btnUnlockStep2.addEventListener("click", function () {
            unlockStep(stepCard2, trackerNode2, trackerNode1);
        });
    }

    // ── STEP 2: Building Hierarchy Vertical Carousel & Cascade Logic ──

    function toggleAbove(n) {
        if (n <= floorState.selectedAbove) {
            floorState.selectedAbove = n - 1;
            announceAria(floorState.selectedAbove === 0
                ? "Étages supérieurs désactivés"
                : `Étages actifs de R+1 à R+${floorState.selectedAbove}`);
        } else {
            floorState.selectedAbove = n;
            announceAria(`R+1 à R+${n} sélectionnés automatiquement`);
        }
        renderBuildingStack();
        updateSummaryChips();
    }

    function toggleBelow(n) {
        if (n <= floorState.selectedBelow) {
            floorState.selectedBelow = n - 1;
            announceAria(floorState.selectedBelow === 0
                ? "Sous-sols désactivés"
                : `Sous-sols actifs de R-1 à R-${floorState.selectedBelow}`);
        } else {
            floorState.selectedBelow = n;
            announceAria(`R-1 à R-${n} sélectionnés automatiquement`);
        }
        renderBuildingStack();
        updateSummaryChips();
    }

    function toggleTerrace() {
        floorState.terrace = !floorState.terrace;
        announceAria(floorState.terrace ? "Terrasse sélectionnée" : "Terrasse désélectionnée");
        renderBuildingStack();
        updateSummaryChips();
    }

    function toggleGarden() {
        floorState.garden = !floorState.garden;
        announceAria(floorState.garden ? "Jardin sélectionné" : "Jardin désélectionné");
        renderBuildingStack();
        updateSummaryChips();
    }

    function renderBuildingStack() {
        if (!stackAbove || !stackRdcRow || !stackBelow) return;

        // 1. Upper Floors Stack (R+maxAbove down to R+1)
        stackAbove.innerHTML = "";
        for (let n = floorState.maxAbove; n >= 1; n--) {
            const isActive = n <= floorState.selectedAbove;
            const card = document.createElement("div");
            card.className = `building-level-card${isActive ? " active" : ""}`;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-pressed", isActive ? "true" : "false");
            card.dataset.level = n;
            card.dataset.key = `above_${n}`;
            card.title = `Étage R+${n}`;

            card.innerHTML = `
                <div class="level-card-left">
                    <div class="level-icon-wrap">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <span class="level-badge">R+${n}</span>
                    <span class="level-name">Étage R+${n}</span>
                </div>
                <div class="level-card-check">
                    <i class="fas fa-check"></i>
                </div>
            `;

            card.addEventListener("click", () => toggleAbove(n));
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleAbove(n);
                }
            });

            stackAbove.appendChild(card);
        }

        // 2. RDC Row: RDC + Terrasse + Jardin
        stackRdcRow.innerHTML = "";

        // RDC (Always Active)
        const rdcCard = document.createElement("div");
        rdcCard.className = "building-level-card rdc-card active";
        rdcCard.setAttribute("role", "button");
        rdcCard.setAttribute("tabindex", "0");
        rdcCard.setAttribute("aria-pressed", "true");
        rdcCard.dataset.level = "0";
        rdcCard.dataset.key = "rdc";
        rdcCard.title = "Rez-de-Chaussée (RDC) - Toujours inclus";

        rdcCard.innerHTML = `
            <div class="level-card-left">
                <div class="level-icon-wrap">
                    <i class="fas fa-door-open"></i>
                </div>
                <span class="level-badge">RDC</span>
                <span class="level-name">Rez-de-Chaussée (RDC)</span>
            </div>
            <div class="level-card-check">
                <i class="fas fa-check"></i>
            </div>
        `;

        rdcCard.addEventListener("click", () => {
            announceAria("Le Rez-de-Chaussée est obligatoire et toujours inclus");
        });
        rdcCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                announceAria("Le Rez-de-Chaussée est obligatoire et toujours inclus");
            }
        });
        stackRdcRow.appendChild(rdcCard);

        // Terrasse Option Card
        const terraceCard = document.createElement("div");
        terraceCard.className = `building-option-card terrace-card${floorState.terrace ? " active" : ""}`;
        terraceCard.setAttribute("role", "button");
        terraceCard.setAttribute("tabindex", "0");
        terraceCard.setAttribute("aria-pressed", floorState.terrace ? "true" : "false");
        terraceCard.id = "cardTerrace";
        terraceCard.title = "Terrasse / Toiture (Option indépendante)";

        terraceCard.innerHTML = `
            <div class="level-card-left">
                <div class="level-icon-wrap">
                    <i class="fas fa-umbrella-beach"></i>
                </div>
                <span class="level-badge">Terrasse</span>
            </div>
            <div class="level-card-check">
                <i class="fas fa-check"></i>
            </div>
        `;

        terraceCard.addEventListener("click", toggleTerrace);
        terraceCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTerrace();
            }
        });
        stackRdcRow.appendChild(terraceCard);

        // Jardin Option Card
        const gardenCard = document.createElement("div");
        gardenCard.className = `building-option-card garden-card${floorState.garden ? " active" : ""}`;
        gardenCard.setAttribute("role", "button");
        gardenCard.setAttribute("tabindex", "0");
        gardenCard.setAttribute("aria-pressed", floorState.garden ? "true" : "false");
        gardenCard.id = "cardGarden";
        gardenCard.title = "Jardin / Extérieur (Option indépendante)";

        gardenCard.innerHTML = `
            <div class="level-card-left">
                <div class="level-icon-wrap">
                    <i class="fas fa-tree"></i>
                </div>
                <span class="level-badge">Jardin</span>
            </div>
            <div class="level-card-check">
                <i class="fas fa-check"></i>
            </div>
        `;

        gardenCard.addEventListener("click", toggleGarden);
        gardenCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleGarden();
            }
        });
        stackRdcRow.appendChild(gardenCard);

        // 3. Basement Floors Stack (R-1 down to R-maxBelow)
        stackBelow.innerHTML = "";
        for (let n = 1; n <= floorState.maxBelow; n++) {
            const isActive = n <= floorState.selectedBelow;
            const card = document.createElement("div");
            card.className = `building-level-card${isActive ? " active" : ""}`;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-pressed", isActive ? "true" : "false");
            card.dataset.level = -n;
            card.dataset.key = `below_${n}`;
            card.title = `Sous-sol R-${n}`;

            card.innerHTML = `
                <div class="level-card-left">
                    <div class="level-icon-wrap">
                        <i class="fas fa-dungeon"></i>
                    </div>
                    <span class="level-badge">R-${n}</span>
                    <span class="level-name">Sous-sol R-${n}</span>
                </div>
                <div class="level-card-check">
                    <i class="fas fa-check"></i>
                </div>
            `;

            card.addEventListener("click", () => toggleBelow(n));
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleBelow(n);
                }
            });

            stackBelow.appendChild(card);
        }

        updateSummaryChips();
    }

    // Dynamic Level Addition (Top / Bottom)
    if (btnAddFloorAbove) {
        btnAddFloorAbove.addEventListener("click", function () {
            floorState.maxAbove += 1;
            announceAria(`Étage R+${floorState.maxAbove} ajouté`);
            renderBuildingStack();
        });
    }

    if (btnAddFloorBelow) {
        btnAddFloorBelow.addEventListener("click", function () {
            floorState.maxBelow += 1;
            announceAria(`Sous-sol R-${floorState.maxBelow} ajouté`);
            renderBuildingStack();
        });
    }

    // Helper: Compute ordered list of active configured levels
    function getActiveFloors() {
        const list = [];

        // 1. Basements (from deepest selected up to R-1)
        for (let n = floorState.selectedBelow; n >= 1; n--) {
            const key = `below_${n}`;
            list.push({
                key: key,
                badge: `R-${n}`,
                name: `Sous-sol R-${n}`,
                level: -n,
                surface: floorState.surfaces[key] !== undefined ? floorState.surfaces[key] : 100,
            });
        }

        // 2. Ground floor (RDC)
        list.push({
            key: "rdc",
            badge: "RDC",
            name: "Rez-de-Chaussée (RDC)",
            level: 0,
            surface: floorState.surfaces["rdc"] !== undefined ? floorState.surfaces["rdc"] : 120,
        });

        // 3. Upper floors (from R+1 to highest selected)
        for (let n = 1; n <= floorState.selectedAbove; n++) {
            const key = `above_${n}`;
            list.push({
                key: key,
                badge: `R+${n}`,
                name: `Étage R+${n}`,
                level: n,
                surface: floorState.surfaces[key] !== undefined ? floorState.surfaces[key] : 100,
            });
        }

        // 4. Terrace (if selected)
        if (floorState.terrace) {
            list.push({
                key: "terrace",
                badge: "Terrasse",
                name: "Terrasse / Toiture",
                level: 99,
                surface: floorState.surfaces["terrace"] !== undefined ? floorState.surfaces["terrace"] : 60,
            });
        }

        // 5. Garden (if selected)
        if (floorState.garden) {
            list.push({
                key: "garden",
                badge: "Jardin",
                name: "Jardin / Extérieur",
                level: 100,
                surface: floorState.surfaces["garden"] !== undefined ? floorState.surfaces["garden"] : 80,
            });
        }

        return list;
    }

    if (btnUnlockStep3) {
        btnUnlockStep3.addEventListener("click", function () {
            rebuildStep3Surfaces();
            unlockStep(stepCard3, trackerNode3, trackerNode2);
        });
    }

    // ── STEP 3: Floor Surfaces (Restyled Light Inputs) ──
    function rebuildStep3Surfaces() {
        if (!floorSurfacesContainer) return;
        floorSurfacesContainer.innerHTML = "";

        const activeFloors = getActiveFloors();

        activeFloors.forEach(item => {
            const row = document.createElement("div");
            row.className = "surface-entry-card";
            row.innerHTML = `
                <div class="surface-level-info">
                    <span class="surface-badge-pill">${item.badge}</span>
                    <span class="surface-level-title">${item.name}</span>
                </div>
                <div class="surface-input-wrap">
                    <input type="number" step="0.5" min="1" max="10000"
                           class="form-control surface-input-control"
                           data-floor-key="${item.key}"
                           data-floor-name="${item.name}"
                           data-floor-level="${item.level}"
                           value="${item.surface || 100}"
                           placeholder="100" required>
                    <span class="surface-unit-label">m²</span>
                </div>
            `;

            const input = row.querySelector(".surface-input-control");
            input.addEventListener("input", function () {
                const val = parseFloat(this.value) || 0;
                floorState.surfaces[item.key] = val;
                item.surface = val;
                recalculateTotalSurface();
            });

            floorSurfacesContainer.appendChild(row);
        });

        recalculateTotalSurface();
    }

    function recalculateTotalSurface() {
        let total = 0;
        const activeFloors = getActiveFloors();
        activeFloors.forEach(f => {
            total += (f.surface || 0);
        });

        calculatedTotalSurface = Math.round(total * 10) / 10;

        if (step3TotalSurfaceDisplay) step3TotalSurfaceDisplay.textContent = calculatedTotalSurface;
        if (step4TotalSurfaceDisplay) step4TotalSurfaceDisplay.textContent = calculatedTotalSurface;
        if (chipTotalSurface) chipTotalSurface.textContent = `${calculatedTotalSurface} m²`;

        recalculateStep4Facture();
    }

    if (btnUnlockStep4) {
        btnUnlockStep4.addEventListener("click", function () {
            const surfaceInputs = floorSurfacesContainer.querySelectorAll(".surface-input-control");
            for (let inp of surfaceInputs) {
                const val = parseFloat(inp.value) || 0;
                if (val <= 0) {
                    safeSwal.fire({
                        icon: "warning",
                        title: "Surface Required",
                        text: `Please enter a valid surface area (> 0) for each configured floor.`,
                        confirmButtonColor: "var(--gold, #FFD65A)",
                    });
                    inp.focus();
                    return;
                }
            }
            recalculateStep4Facture();
            unlockStep(stepCard4, trackerNode4, trackerNode3);
        });
    }

    // ── STEP 4: Choose Your Design Services (Redesigned as Rows, No Description) ──
    function initServicesMultiSelect() {
        serviceOptionRows.forEach(row => {
            row.addEventListener("click", function (e) {
                // If clicked on video play button or video player overlay, do NOT toggle row selection
                if (e.target.closest(".btn-service-video-play") || e.target.closest(".video-widget-overlay")) {
                    return;
                }

                this.classList.toggle("selected");
                syncSelectedServicesState();
                recalculateStep4Facture();
            });
        });

        // Ensure default service is selected if nothing selected yet
        const currentlySelected = document.querySelectorAll(".service-option-row.selected");
        if (currentlySelected.length === 0 && serviceOptionRows.length > 0) {
            const defaultRow = document.querySelector('.service-option-row[data-is-default="true"]') || serviceOptionRows[0];
            if (defaultRow) defaultRow.classList.add("selected");
        }

        syncSelectedServicesState();
    }

    function syncSelectedServicesState() {
        selectedServices = [];
        document.querySelectorAll(".service-option-row.selected").forEach(row => {
            selectedServices.push({
                id: row.dataset.serviceId,
                name: row.dataset.serviceName,
                pricingType: row.dataset.pricingType,
                price: parseFloat(row.dataset.servicePrice) || 0,
            });
        });

        if (chipServicesCount) {
            chipServicesCount.textContent = `${selectedServices.length} Service${selectedServices.length > 1 ? 's' : ''} Selected`;
        }
    }

    function recalculateStep4Facture() {
        let grandTotal = 0;
        let tableHtml = "";

        if (selectedServices.length === 0) {
            tableHtml = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <i class="fas fa-hand-pointer text-warning me-2"></i> Please select at least one design service above to calculate your quotation.
                    </td>
                </tr>
            `;
        } else {
            selectedServices.forEach(svc => {
                let svcTotal = 0;
                let rateText = "";

                if (svc.pricingType === "area") {
                    svcTotal = Math.round(calculatedTotalSurface * svc.price);
                    rateText = `${svc.price.toLocaleString()} DA / m²`;
                } else if (svc.pricingType === "hourly") {
                    svcTotal = Math.round(svc.price * 10);
                    rateText = `${svc.price.toLocaleString()} DA / hr`;
                } else {
                    svcTotal = Math.round(svc.price);
                    rateText = `${svc.price.toLocaleString()} DA`;
                }

                grandTotal += svcTotal;

                tableHtml += `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <i class="fas fa-check-circle text-warning"></i>
                                <span class="fw-bold text-light">${svc.name}</span>
                            </div>
                        </td>
                        <td class="text-center font-monospace text-light">${rateText}</td>
                        <td class="text-end font-monospace text-warning fw-bold">${svcTotal.toLocaleString()} DA</td>
                    </tr>
                `;
            });
        }

        grandCalculatedTotal = Math.round(grandTotal);

        if (factureTableBody) factureTableBody.innerHTML = tableHtml;
        if (step4GrandTotalPrice) step4GrandTotalPrice.textContent = `${grandCalculatedTotal.toLocaleString()} DA`;
        if (chipTotalPrice) chipTotalPrice.textContent = `${grandCalculatedTotal.toLocaleString()} DA`;
    }

    function updateSummaryChips() {
        const activeFloors = getActiveFloors();
        const count = activeFloors.length;
        if (chipFloorsCount) {
            chipFloorsCount.textContent = `${count} ${count > 1 ? "Niveaux" : "Niveau"}`;
        }
    }

    // ── STEP 4: Unlock Step 5 (Client Contact Details & Submit) ──
    if (btnUnlockStep5) {
        btnUnlockStep5.addEventListener("click", function () {
            if (selectedServices.length === 0) {
                safeSwal.fire({
                    icon: "warning",
                    title: "Select Services",
                    text: "Please select at least one design service package to continue.",
                    confirmButtonColor: "var(--gold, #FFD65A)",
                });
                return;
            }
            unlockStep(stepCard5, trackerNode5, trackerNode4);
            if (reqStickyBar) reqStickyBar.style.display = "block";
        });
    }

    // ── Build Full Request Payload ──
    function buildRequestPayload() {
        const activeFloors = getActiveFloors();
        const floorsData = [];
        let totalSurface = 0;

        activeFloors.forEach((f, idx) => {
            const surf = parseFloat(f.surface) || 0;
            totalSurface += surf;
            floorsData.push({
                key: f.key,
                name: f.name,
                level: f.level,
                order: idx,
                surface: surf,
            });
        });

        const firstName = document.getElementById("firstNameInput")?.value.trim() || "";
        const lastName = document.getElementById("lastNameInput")?.value.trim() || "";
        const email = document.getElementById("emailInput")?.value.trim() || "";
        const phone = document.getElementById("phoneInput")?.value.trim() || "";

        const primaryService = selectedServices[0] || null;
        const serviceIds = selectedServices.map(s => s.id);

        return {
            project_type_slug: selectedProjectTypeInput?.value || "villa",
            project_type_name: selectedProjectTypeNameInput?.value || "Villa",
            service_id: primaryService ? primaryService.id : null,
            service_name: primaryService ? primaryService.name : "",
            service_ids: serviceIds,
            floors_above: floorState.selectedAbove,
            floors_below: floorState.selectedBelow,
            has_terrace: floorState.terrace,
            has_garden: floorState.garden,
            floors: floorsData,
            total_surface: totalSurface,
            total: grandCalculatedTotal,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
        };
    }

    // ── STEP 5: Email Proforma Facture ──
    if (btnEmailFacture) {
        btnEmailFacture.addEventListener("click", async function () {
            if (selectedServices.length === 0) {
                safeSwal.fire({
                    icon: "warning",
                    title: "Select Services",
                    text: "Please select at least one design service package in Step 4.",
                    confirmButtonColor: "var(--gold, #FFD65A)",
                });
                return;
            }

            const emailInput = document.getElementById("emailInput");
            const email = emailInput ? emailInput.value.trim() : "";
            if (!email) {
                safeSwal.fire({
                    icon: "warning",
                    title: "Email Required",
                    text: "Please enter your email address to receive your proforma quotation PDF.",
                    confirmButtonColor: "var(--gold, #FFD65A)",
                });
                emailInput?.focus();
                return;
            }

            const originalHtml = btnEmailFacture.innerHTML;
            btnEmailFacture.disabled = true;
            btnEmailFacture.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Sending Facture...`;

            const payload = buildRequestPayload();
            const csrfToken = getCsrfToken();

            try {
                const res = await fetch("/request/facturation/email/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.success) {
                    safeSwal.fire({
                        icon: "success",
                        title: "Facture Sent!",
                        text: `Your proforma invoice has been sent to ${payload.email}.`,
                        confirmButtonColor: "#FFD65A",
                    });
                } else {
                    safeSwal.fire({
                        icon: "error",
                        title: "Could Not Send",
                        text: data.errors ? data.errors[0] : "Unable to email proforma invoice.",
                        confirmButtonColor: "#dc3545",
                    });
                }
            } catch (err) {
                console.error(err);
                safeSwal.fire({ icon: "error", title: "Error", text: "Network error occurred." });
            } finally {
                btnEmailFacture.disabled = false;
                btnEmailFacture.innerHTML = originalHtml;
            }
        });
    }

    // ── STEP 5: Submit Architectural Request (FINAL CTA) ──
    async function handleFinalSubmit(triggerBtn) {
        if (selectedServices.length === 0) {
            safeSwal.fire({
                icon: "warning",
                title: "Select Services",
                text: "Please select at least one design service package in Step 4.",
                confirmButtonColor: "var(--gold, #FFD65A)",
            });
            return;
        }

        const payload = buildRequestPayload();

        if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone) {
            if (stepCard5.classList.contains("is-locked")) {
                unlockStep(stepCard5, trackerNode5, trackerNode4);
            }
            safeSwal.fire({
                icon: "warning",
                title: "Contact Incomplete",
                text: "Please enter your First Name, Last Name, Email, and Phone in Step 5 before submitting.",
                confirmButtonColor: "var(--gold, #FFD65A)",
            });
            document.getElementById("firstNameInput")?.focus();
            return;
        }

        const serviceNamesList = selectedServices.map(s => `<li>${s.name}</li>`).join("");

        const confirm = await safeSwal.fire({
            title: "Submit Design Request?",
            html: `
                <div class="text-start p-2">
                    <p class="mb-1"><strong>Property:</strong> ${payload.project_type_name}</p>
                    <p class="mb-1"><strong>Total Surface:</strong> ${payload.total_surface} m² (${payload.floors.length} levels)</p>
                    <p class="mb-1"><strong>Selected Services (${selectedServices.length}):</strong></p>
                    <ul class="small mb-2 text-warning ps-3">${serviceNamesList}</ul>
                    <p class="mb-0 text-warning fs-5"><strong>Estimated Total:</strong> ${payload.total.toLocaleString()} DA</p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "var(--gold, #FFD65A)",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Submit Project",
            cancelButtonText: "Review",
        });

        if (!confirm.isConfirmed) return;

        const originalBtnHtml = triggerBtn.innerHTML;
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Creating Project...`;

        const csrfToken = getCsrfToken();

        try {
            const res = await fetch("/request/submit/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                try {
                    sessionStorage.removeItem("loft_request_flow");
                } catch (e) {}

                safeSwal.fire({
                    icon: "success",
                    title: "Project Submitted!",
                    text: `Project ${data.project_number} registered successfully.`,
                    confirmButtonColor: "#FFD65A",
                }).then(() => {
                    window.location.href = data.redirect_url || "/dashboard/my-projects/";
                });
            } else {
                safeSwal.fire({
                    icon: "error",
                    title: "Submission Error",
                    text: data.errors ? data.errors[0] : "Could not create design request.",
                    confirmButtonColor: "#dc3545",
                });
            }
        } catch (err) {
            console.error(err);
            safeSwal.fire({ icon: "error", title: "Error", text: "Network error occurred." });
        } finally {
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = originalBtnHtml;
        }
    }

    if (btnSubmitRequest) {
        btnSubmitRequest.addEventListener("click", function (e) {
            e.preventDefault();
            handleFinalSubmit(btnSubmitRequest);
        });
    }

    if (stickySubmitBtn) {
        stickySubmitBtn.addEventListener("click", function (e) {
            e.preventDefault();
            handleFinalSubmit(stickySubmitBtn);
        });
    }

    // Initial setup
    renderBuildingStack();
    rebuildStep3Surfaces();
    initServicesMultiSelect();
    recalculateStep4Facture();
});
