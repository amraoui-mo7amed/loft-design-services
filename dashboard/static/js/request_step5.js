document.addEventListener("DOMContentLoaded", function () {
    // ── Retrieve Session / Client Data ──
    let projectData = window.LOFT_REQUEST_DATA || {};
    
    // Check fallback sessionStorage if sessionData was empty
    if (!projectData.total_surface) {
        try {
            const stored = sessionStorage.getItem("loft_request_flow");
            if (stored) {
                projectData = JSON.parse(stored);
            }
        } catch (e) {}
    }

    // Default fallback values if direct access
    const projectTypeName = projectData.project_type_name || "Custom Architecture Project";
    const totalSurface = parseFloat(projectData.total_surface) || 200;
    const floors = projectData.floors || [
        { name: "Rez-de-Chaussée (RDC)", surface: totalSurface }
    ];
    const clientEmail = projectData.email || "";
    const clientPhone = projectData.phone || "";

    // ── Elements ──
    const serviceCards = document.querySelectorAll(".service-select-card");
    const factureFloorsList = document.getElementById("factureFloorsList");
    const factureServiceNameDisplay = document.getElementById("factureServiceNameDisplay");
    const factureServiceRateDisplay = document.getElementById("factureServiceRateDisplay");
    const factureServiceTotalDisplay = document.getElementById("factureServiceTotalDisplay");
    const factureGrandTotalDisplay = document.getElementById("factureGrandTotalDisplay");

    const emailFactureBtn = document.getElementById("emailFactureBtn");
    const submitProjectBtn = document.getElementById("submitProjectBtn");

    const navNodes = [
        document.getElementById("navNode1"),
        document.getElementById("navNode2"),
        document.getElementById("navNode3"),
        document.getElementById("navNode4"),
    ];

    const sections = [
        document.getElementById("section-project-overview"),
        document.getElementById("section-services"),
        document.getElementById("section-facture"),
        document.getElementById("section-actions"),
    ];

    let currentSelectedService = null;
    let currentCalculatedTotal = 0;

    // Helper CSRF
    function getCsrfToken() {
        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input && input.value) return input.value;
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || "";
    }

    // ── Scroll Spy for Step 5 Navigation ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navNodes.forEach(node => {
                    if (node) {
                        const href = node.getAttribute("href");
                        if (href === `#${targetId}`) {
                            node.classList.add("active");
                        } else {
                            node.classList.remove("active");
                        }
                    }
                });
            }
        });
    }, { rootMargin: "-20% 0px -50% 0px", threshold: 0.1 });

    sections.forEach(sec => {
        if (sec) observer.observe(sec);
    });

    // ── Service Card Selection ──
    serviceCards.forEach(card => {
        card.addEventListener("click", function () {
            serviceCards.forEach(c => c.classList.remove("selected"));
            this.classList.add("selected");

            currentSelectedService = {
                id: this.dataset.serviceId,
                name: this.dataset.serviceName,
                pricingType: this.dataset.pricingType,
                price: parseFloat(this.dataset.servicePrice) || 0,
            };

            recalculateFacture();

            // Smooth scroll into Facture Calculator section
            const factureSec = document.getElementById("section-facture");
            if (factureSec) {
                factureSec.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Initialize first selected service
    const initialSelected = document.querySelector(".service-select-card.selected") || serviceCards[0];
    if (initialSelected) {
        currentSelectedService = {
            id: initialSelected.dataset.serviceId,
            name: initialSelected.dataset.serviceName,
            pricingType: initialSelected.dataset.pricingType,
            price: parseFloat(initialSelected.dataset.servicePrice) || 0,
        };
    }

    // ── Facture Calculation Engine ──
    function recalculateFacture() {
        if (!currentSelectedService) return;

        // Render Floors Breakdown in Table
        if (factureFloorsList) {
            factureFloorsList.innerHTML = floors.map(f => `
                <tr>
                    <td><i class="fas fa-layer-group text-warning me-2"></i>${f.name}</td>
                    <td class="text-end fw-bold">${f.surface} m²</td>
                    <td class="text-end text-muted">-</td>
                </tr>
            `).join("");
        }

        let serviceTotal = 0;
        let rateText = "";

        if (currentSelectedService.pricingType === "area") {
            serviceTotal = totalSurface * currentSelectedService.price;
            rateText = `${currentSelectedService.price.toLocaleString()} DA / m²`;
        } else if (currentSelectedService.pricingType === "hourly") {
            serviceTotal = currentSelectedService.price * 10;
            rateText = `${currentSelectedService.price.toLocaleString()} DA / hr (est. 10 hrs)`;
        } else {
            serviceTotal = currentSelectedService.price;
            rateText = `${currentSelectedService.price.toLocaleString()} DA (Fixed)`;
        }

        currentCalculatedTotal = Math.round(serviceTotal);

        if (factureServiceNameDisplay) {
            factureServiceNameDisplay.textContent = currentSelectedService.name;
        }
        if (factureServiceRateDisplay) {
            factureServiceRateDisplay.textContent = rateText;
        }
        if (factureServiceTotalDisplay) {
            factureServiceTotalDisplay.textContent = `${currentCalculatedTotal.toLocaleString()} DA`;
        }
        if (factureGrandTotalDisplay) {
            factureGrandTotalDisplay.textContent = `${currentCalculatedTotal.toLocaleString()} DA`;
        }
    }

    recalculateFacture();

    // ── Build Full Request Payload ──
    function buildFullPayload() {
        return {
            project_type_slug: projectData.project_type_slug,
            project_type_name: projectTypeName,
            floors_above: projectData.floors_above || 0,
            floors_below: projectData.floors_below || 0,
            has_terrace: projectData.has_terrace || false,
            has_garden: projectData.has_garden || false,
            floors: floors,
            total_surface: totalSurface,
            service_id: currentSelectedService ? currentSelectedService.id : null,
            service_name: currentSelectedService ? currentSelectedService.name : "",
            total: currentCalculatedTotal,
            first_name: projectData.first_name || "",
            last_name: projectData.last_name || "",
            email: clientEmail,
            phone: clientPhone,
        };
    }

    // ── Send Facture to Email ──
    if (emailFactureBtn) {
        emailFactureBtn.addEventListener("click", async function () {
            if (!clientEmail) {
                const { value: emailInput } = await Swal.fire({
                    title: "Enter Your Email",
                    input: "email",
                    inputLabel: "We'll send your proforma facture estimate to this address:",
                    inputPlaceholder: "client@example.com",
                    confirmButtonColor: "var(--step5-gold, #FFD65A)",
                });
                if (!emailInput) return;
                projectData.email = emailInput;
            }

            const originalBtnHtml = emailFactureBtn.innerHTML;
            emailFactureBtn.disabled = true;
            emailFactureBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Sending Facture...`;

            const payload = buildFullPayload();
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
                    Swal.fire({
                        icon: "success",
                        title: "Facture Sent!",
                        text: `Your proforma invoice has been sent to ${payload.email}. Check your inbox.`,
                        confirmButtonColor: "var(--step5-gold, #FFD65A)",
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to Send",
                        text: data.errors ? data.errors[0] : "Could not send email.",
                        confirmButtonColor: "#dc3545",
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ icon: "error", title: "Error", text: "Network error occurred." });
            } finally {
                emailFactureBtn.disabled = false;
                emailFactureBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    // ── Final Project Submission ──
    if (submitProjectBtn) {
        submitProjectBtn.addEventListener("click", async function () {
            const result = await Swal.fire({
                title: "Submit Design Request?",
                text: `You are about to submit your project (${totalSurface} m²) with ${currentSelectedService?.name}.`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "var(--step5-gold, #FFD65A)",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, submit request",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            const originalBtnHtml = submitProjectBtn.innerHTML;
            submitProjectBtn.disabled = true;
            submitProjectBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Creating Project...`;

            const payload = buildFullPayload();
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

                    Swal.fire({
                        icon: "success",
                        title: "Project Submitted!",
                        text: `Your project ${data.project_number} has been registered successfully. Our architects will review it immediately.`,
                        confirmButtonColor: "var(--step5-gold, #FFD65A)",
                    }).then(() => {
                        window.location.href = data.redirect_url || "/dashboard/my-projects/";
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Submission Error",
                        text: data.errors ? data.errors[0] : "Could not submit design request.",
                        confirmButtonColor: "#dc3545",
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ icon: "error", title: "Error", text: "Network error occurred." });
            } finally {
                submitProjectBtn.disabled = false;
                submitProjectBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});
