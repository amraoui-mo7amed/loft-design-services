document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // Fullscreen Immersive Lightbox Viewer
    // ==========================================
    const viewer = document.getElementById("portfolioViewer");
    const viewerImg = document.getElementById("viewerMainImg");
    const viewerClose = document.getElementById("viewerCloseBtn");
    const prevBtn = document.getElementById("viewerPrevBtn");
    const nextBtn = document.getElementById("viewerNextBtn");

    const cards = document.querySelectorAll(".gallery-card");
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

        // Clicking card directly opens lightbox
        card.addEventListener("click", function (e) {
            e.preventDefault();
            currentIdx = idx;
            openLightbox();
        });
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
});
