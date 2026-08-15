document.addEventListener("DOMContentLoaded", function () {
    // Selectable images logic
    const cards = document.querySelectorAll(".gallery-card");
    const selectionBar = document.getElementById("gallerySelectionBar");
    const selectedCount = document.getElementById("selectedCount");
    const clearSelectionBtn = document.getElementById("clearSelectionBtn");
    const copyReferencesBtn = document.getElementById("copyReferencesBtn");
    let selectedImages = [];

    function updateSelectionBar() {
        if (!selectionBar || !selectedCount) return;
        if (selectedImages.length > 0) {
            selectedCount.textContent = selectedImages.length;
            selectionBar.classList.add("active");
        } else {
            selectionBar.classList.remove("active");
        }
    }

    cards.forEach((card) => {
        // Handle select indicator click specifically
        const selectIndicator = card.querySelector(".gallery-select-indicator");
        if (selectIndicator) {
            selectIndicator.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleCardSelection(card);
            });
        }

        // On single space view, clicking card can toggle selection
        const isSingleSpace = document.body.dataset.isSingleSpace === "true" || card.dataset.mode === "single";
        if (isSingleSpace) {
            card.addEventListener("click", function (e) {
                if (e.target.closest(".lightbox-trigger")) {
                    return;
                }
                e.preventDefault();
                toggleCardSelection(card);
            });
        }
    });

    function toggleCardSelection(card) {
        const imgId = card.dataset.imageId;
        const ref = card.dataset.reference || card.dataset.hash;

        if (card.classList.contains("selected")) {
            card.classList.remove("selected");
            selectedImages = selectedImages.filter((img) => img.id !== imgId);
        } else {
            card.classList.add("selected");
            selectedImages.push({ id: imgId, reference: ref });
        }
        updateSelectionBar();
    }

    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener("click", function () {
            cards.forEach((card) => card.classList.remove("selected"));
            selectedImages = [];
            updateSelectionBar();
        });
    }

    if (copyReferencesBtn) {
        copyReferencesBtn.addEventListener("click", function () {
            if (selectedImages.length === 0) return;
            const refsText = selectedImages.map((img) => img.reference).join("\n");
            const copyTitle = copyReferencesBtn.dataset.copyTitle || "Copied!";
            const copyMsg = copyReferencesBtn.dataset.copyMsg || "Reference paths/hashes copied to clipboard";

            navigator.clipboard.writeText(refsText).then(() => {
                if (window.Swal) {
                    Swal.fire({
                        icon: "success",
                        title: copyTitle,
                        text: copyMsg,
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                    });
                }
            }).catch((err) => {
                console.error("Could not copy text: ", err);
            });
        });
    }

    // ==========================================
    // Redesigned Lightbox Viewer
    // ==========================================
    const viewer = document.getElementById("portfolioViewer");
    const viewerImg = document.getElementById("viewerMainImg");
    const viewerClose = document.getElementById("viewerCloseBtn");
    const viewerCounter = document.getElementById("viewerCounter");
    const viewerSpaceBadge = document.getElementById("viewerSpaceBadge");
    const viewerRefBadge = document.getElementById("viewerRefBadge");
    const viewerCaption = document.getElementById("viewerCaption");
    const viewerOpenFullBtn = document.getElementById("viewerOpenFullBtn");
    const viewerCopyBtn = document.getElementById("viewerCopyBtn");
    const prevBtn = document.getElementById("viewerPrevBtn");
    const nextBtn = document.getElementById("viewerNextBtn");

    const lightboxItems = [];
    let currentIdx = 0;

    const triggers = document.querySelectorAll(".lightbox-trigger");
    triggers.forEach((trigger, idx) => {
        const card = trigger.closest(".gallery-card");
        const url = trigger.getAttribute("href") || trigger.dataset.href || (card ? card.dataset.imageUrl : "");
        const space = card ? card.dataset.spaceName : "";
        const ref = card ? (card.dataset.reference || card.dataset.hash || "") : "";
        const title = card ? (card.dataset.title || card.querySelector(".gallery-card-title")?.textContent.trim() || "") : "";

        lightboxItems.push({
            url: url,
            space: space,
            ref: ref,
            title: title,
        });

        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            currentIdx = idx;
            openLightbox();
        });
    });

    function updateViewerContent() {
        if (!viewer || !viewerImg || lightboxItems.length === 0) return;
        const item = lightboxItems[currentIdx];

        viewerImg.style.opacity = "0";
        viewerImg.style.transform = "scale(0.96)";

        setTimeout(() => {
            viewerImg.src = item.url;
            if (viewerCounter) viewerCounter.textContent = `${currentIdx + 1} / ${lightboxItems.length}`;
            if (viewerSpaceBadge) viewerSpaceBadge.textContent = item.space || "Design Space";
            if (viewerRefBadge) viewerRefBadge.textContent = item.ref ? item.ref.slice(-16) : "#REF";
            if (viewerCaption) viewerCaption.textContent = item.title || item.space || "";
            if (viewerOpenFullBtn) viewerOpenFullBtn.href = item.url;

            viewerImg.onload = function () {
                viewerImg.style.opacity = "1";
                viewerImg.style.transform = "scale(1)";
            };
            viewerImg.style.opacity = "1";
            viewerImg.style.transform = "scale(1)";
        }, 120);
    }

    function openLightbox() {
        if (!viewer) return;
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

    if (viewerClose) viewerClose.addEventListener("click", closeLightbox);

    if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const isRtl = document.documentElement.getAttribute("dir") === "rtl";
            if (isRtl) {
                currentIdx = (currentIdx + 1) % lightboxItems.length;
            } else {
                currentIdx = (currentIdx - 1 + lightboxItems.length) % lightboxItems.length;
            }
            updateViewerContent();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const isRtl = document.documentElement.getAttribute("dir") === "rtl";
            if (isRtl) {
                currentIdx = (currentIdx - 1 + lightboxItems.length) % lightboxItems.length;
            } else {
                currentIdx = (currentIdx + 1) % lightboxItems.length;
            }
            updateViewerContent();
        });
    }

    if (viewerCopyBtn) {
        viewerCopyBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (lightboxItems.length === 0) return;
            const item = lightboxItems[currentIdx];
            navigator.clipboard.writeText(item.ref || item.url).then(() => {
                if (window.Swal) {
                    Swal.fire({
                        icon: "success",
                        title: "Copied!",
                        text: "Image reference copied to clipboard",
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                    });
                }
            });
        });
    }

    if (viewer) {
        viewer.addEventListener("click", function (e) {
            if (e.target.classList.contains("viewer-stage")) {
                closeLightbox();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (!viewer || !viewer.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") {
            const isRtl = document.documentElement.getAttribute("dir") === "rtl";
            if (isRtl) {
                currentIdx = (currentIdx + 1) % lightboxItems.length;
            } else {
                currentIdx = (currentIdx - 1 + lightboxItems.length) % lightboxItems.length;
            }
            updateViewerContent();
        }
        if (e.key === "ArrowRight") {
            const isRtl = document.documentElement.getAttribute("dir") === "rtl";
            if (isRtl) {
                currentIdx = (currentIdx - 1 + lightboxItems.length) % lightboxItems.length;
            } else {
                currentIdx = (currentIdx + 1) % lightboxItems.length;
            }
            updateViewerContent();
        }
    });
});
