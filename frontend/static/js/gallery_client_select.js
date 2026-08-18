document.addEventListener("DOMContentLoaded", function () {
    const selectedImageIds = new Set();

    const cards = document.querySelectorAll(".select-gallery-card");
    const submitBtn = document.getElementById("btnSubmitGallery");
    const countBadge = document.getElementById("selectedCountBadge");
    const countText = document.getElementById("selectedCountText");
    const submitBar = document.getElementById("clientSubmitBar");
    const notesInput = document.getElementById("clientNotesInput");

    // ==========================================
    // Selection Management
    // ==========================================
    function updateSelectionUI() {
        const count = selectedImageIds.size;

        if (countBadge) {
            countBadge.textContent = count;
        }

        if (countText) {
            const singularText = countText.dataset.singular || "Inspiration Selected";
            const pluralText = countText.dataset.plural || "Inspirations Selected";
            countText.textContent = count === 1 ? `1 ${singularText}` : `${count} ${pluralText}`;
        }

        if (submitBtn) {
            submitBtn.disabled = count === 0;
        }

        if (submitBar) {
            if (count > 0) {
                submitBar.classList.remove("is-hidden");
            }
        }
    }

    cards.forEach(card => {
        const imgId = parseInt(card.dataset.imageId, 10);
        if (!imgId) return;

        card.addEventListener("click", function (e) {
            // Prevent toggling if clicked on lightbox trigger
            if (e.target.closest(".gallery-lightbox-trigger-btn")) {
                return;
            }

            if (selectedImageIds.has(imgId)) {
                selectedImageIds.delete(imgId);
                card.classList.remove("is-selected");
            } else {
                selectedImageIds.add(imgId);
                card.classList.add("is-selected");
            }

            updateSelectionUI();
        });
    });

    updateSelectionUI();

    // ==========================================
    // Fullscreen Immersive Lightbox Viewer
    // ==========================================
    const viewer = document.getElementById("portfolioViewer");
    const viewerImg = document.getElementById("viewerMainImg");
    const viewerClose = document.getElementById("viewerCloseBtn");
    const prevBtn = document.getElementById("viewerPrevBtn");
    const nextBtn = document.getElementById("viewerNextBtn");

    const lightboxItems = [];
    let currentIdx = 0;

    cards.forEach((card, idx) => {
        const url = card.dataset.imageUrl || card.querySelector("img")?.getAttribute("src") || "";
        const space = card.dataset.spaceName || "";
        const category = card.dataset.categoryName || "";
        const title = card.dataset.title || "";

        lightboxItems.push({
            url: url,
            space: space,
            category: category,
            title: title,
        });

        // Trigger lightbox button
        const lbBtn = card.querySelector(".gallery-lightbox-trigger-btn");
        if (lbBtn) {
            lbBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                currentIdx = idx;
                openLightbox();
            });
        }
    });

    function updateViewerContent() {
        if (!viewer || !viewerImg || lightboxItems.length === 0) return;
        const item = lightboxItems[currentIdx];

        viewerImg.style.opacity = "0";
        viewerImg.style.transform = "scale(0.97)";

        setTimeout(() => {
            viewerImg.src = item.url;
            viewerImg.onload = function () {
                viewerImg.style.opacity = "1";
                viewerImg.style.transform = "scale(1)";
            };
            viewerImg.style.opacity = "1";
            viewerImg.style.transform = "scale(1)";
        }, 100);
    }

    function openLightbox() {
        if (!viewer || lightboxItems.length === 0) return;
        updateViewerContent();
        viewer.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (viewer) {
            viewer.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    if (viewerClose) {
        viewerClose.addEventListener("click", function (e) {
            e.stopPropagation();
            closeLightbox();
        });
    }

    function navigateViewer(direction) {
        if (lightboxItems.length === 0) return;
        const isRtl = document.documentElement.getAttribute("dir") === "rtl";
        let step = direction;
        if (isRtl) step = -step;

        currentIdx = (currentIdx + step + lightboxItems.length) % lightboxItems.length;
        updateViewerContent();
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            navigateViewer(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            navigateViewer(1);
        });
    }

    if (viewer) {
        viewer.addEventListener("click", function (e) {
            if (e.target === viewer || e.target.classList.contains("viewer-stage")) {
                closeLightbox();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (!viewer || !viewer.classList.contains("active")) return;
        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft") {
            navigateViewer(-1);
        } else if (e.key === "ArrowRight") {
            navigateViewer(1);
        }
    });

    // ==========================================
    // Submission Flow
    // ==========================================
    if (submitBtn) {
        submitBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            if (selectedImageIds.size === 0) {
                Swal.fire({
                    icon: "info",
                    title: submitBtn.dataset.noSelectionTitle || "Please Select Inspirations",
                    text: submitBtn.dataset.noSelectionText || "Choose at least one inspiration photo to build your moodboard.",
                    confirmButtonColor: "#FFD65A",
                });
                return;
            }

            const submitUrl = submitBtn.dataset.submitUrl;
            const csrfToken = submitBtn.dataset.csrf || "";
            const count = selectedImageIds.size;

            const confirmResult = await Swal.fire({
                title: submitBtn.dataset.confirmTitle || "Confirm Moodboard Selection",
                html: `
                    <div class="text-start">
                        <p class="mb-3 text-light">${count} ${submitBtn.dataset.confirmDesc || "inspiration photos selected for your project design team."}</p>
                        <label class="form-label text-warning small fw-bold text-uppercase mb-1">
                            ${submitBtn.dataset.notesLabel || "Optional Notes / Special Preferences"}
                        </label>
                        <textarea id="swalNotesInput" class="form-control" rows="3" placeholder="${submitBtn.dataset.notesPlaceholder || "e.g. We love the natural wood textures and ambient ceiling lights..."}"></textarea>
                    </div>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: `<i class="fas fa-check-circle me-1"></i> ${submitBtn.dataset.btnConfirm || "Submit Moodboard"}`,
                cancelButtonText: submitBtn.dataset.btnCancel || "Review Selection",
                confirmButtonColor: "#FFD65A",
                cancelButtonColor: "#475569",
                customClass: {
                    popup: "swal-glass",
                    confirmButton: "text-dark fw-bold",
                },
                didOpen: () => {
                    const swalInput = document.getElementById("swalNotesInput");
                    if (swalInput && notesInput && notesInput.value) {
                        swalInput.value = notesInput.value;
                    }
                }
            });

            if (!confirmResult.isConfirmed) return;

            const swalNotes = document.getElementById("swalNotesInput")?.value || "";

            const originalHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${submitBtn.dataset.sendingText || "Submitting..."}`;

            try {
                const response = await fetch(submitUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: JSON.stringify({
                        image_ids: Array.from(selectedImageIds),
                        notes: swalNotes,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    await Swal.fire({
                        icon: "success",
                        title: data.title || "Moodboard Submitted!",
                        text: data.message || "Your style preferences have been recorded.",
                        confirmButtonText: "View Confirmed Moodboard",
                        confirmButtonColor: "#FFD65A",
                        customClass: {
                            confirmButton: "text-dark fw-bold",
                        }
                    });

                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    } else {
                        window.location.reload();
                    }
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Submission Error",
                        text: data.errors ? data.errors.join("\n") : "Unable to submit your choices.",
                        confirmButtonColor: "#FFD65A",
                    });
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Failed to connect to the server. Please try again.",
                    confirmButtonColor: "#FFD65A",
                });
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHtml;
            }
        });
    }
});
