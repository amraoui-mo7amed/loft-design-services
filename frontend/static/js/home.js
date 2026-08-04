document.addEventListener("DOMContentLoaded", function () {
    var floatingTotal = document.getElementById("floatingTotal");
    var continueBtn = document.getElementById("continueBtn");
    var checkboxes = document.querySelectorAll(".space-checkbox");
    var spaceCards = document.querySelectorAll(".space-card");

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function getSelectedSpaces() {
        var ids = [];
        checkboxes.forEach(function (cb) {
            if (cb.checked) ids.push(cb.value);
        });
        return ids;
    }

    function updateTotal() {
        var total = 0;
        checkboxes.forEach(function (cb) {
            if (cb.checked) {
                var card = cb.closest(".space-card");
                total += parseFloat(card.dataset.price) || 0;
            }
        });
        floatingTotal.textContent = formatNumber(total);
    }

    checkboxes.forEach(function (cb) {
        cb.addEventListener("change", function () {
            var card = cb.closest(".space-card");
            card.classList.toggle("selected", cb.checked);
            updateTotal();
        });
    });

    spaceCards.forEach(function (card) {
        card.addEventListener("click", function (e) {
            if (e.target.type !== "checkbox" && !e.target.closest(".space-check")) {
                var cb = card.querySelector(".space-checkbox");
                cb.checked = !cb.checked;
                card.classList.toggle("selected", cb.checked);
                updateTotal();
            }
        });
    });

    // ── Inspiration Modals ──

    function showSequentialModals(spacesData, index) {
        if (index >= spacesData.length) {
            var ids = getSelectedSpaces();
            window.location.href = "/order/?spaces=" + ids.join(",");
            return;
        }

        var space = spacesData[index];
        var isLast = index === spacesData.length - 1;

        var modalEl = document.getElementById("inspirationGalleryModal");
        var modalTitle = document.getElementById("inspirationModalTitle");
        var modalGrid = document.getElementById("inspirationModalGrid");
        var modalBody = document.getElementById("inspirationModalBody");
        var submitBtn = document.getElementById("inspirationSubmitBtn");

        modalTitle.textContent = space.name;
        modalGrid.innerHTML = "";

        space.images.forEach(function (img) {
            var col = document.createElement("div");
            col.className = "col-6";
            var card = document.createElement("div");
            card.className = "inspo-card inspo-card--modal";
            card.dataset.imgId = img.imgId;
            card.innerHTML =
                '<img src="' + img.imgUrl + '" alt="" class="inspo-card-img" loading="lazy">' +
                '<div class="inspo-card-overlay"><i class="fas fa-check-circle"></i></div>';
            card.addEventListener("click", function () { this.classList.toggle("selected"); });
            col.appendChild(card);
            modalGrid.appendChild(col);
        });

        var oldHint = modalBody.querySelector(".inspo-hint");
        if (oldHint) {
            oldHint.textContent = isLast
                ? "Select images, then Submit to continue."
                : "Select images, then Next for the next space.";
        }

        submitBtn.textContent = isLast ? "Submit & Continue" : "Next Space";

        var newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);
        submitBtn = newBtn;

        submitBtn.addEventListener("click", function () {
            modalGrid.querySelectorAll(".inspo-card.selected").forEach(function (c) {
                addInspiration(space.spaceId, parseInt(c.dataset.imgId));
            });
            var bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
            showSequentialModals(spacesData, index + 1);
        });

        var bsModal = new bootstrap.Modal(modalEl, { backdrop: "static", keyboard: false });
        bsModal.show();
    }

    function addInspiration(spaceId, imgId) {
        // Store selected inspiration data (used by the order page later)
        var stored = JSON.parse(sessionStorage.getItem("homeInspirations") || "{}");
        if (!stored[spaceId]) stored[spaceId] = [];
        if (stored[spaceId].indexOf(imgId) === -1) stored[spaceId].push(imgId);
        sessionStorage.setItem("homeInspirations", JSON.stringify(stored));
    }

    continueBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var ids = getSelectedSpaces();
        if (ids.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No spaces selected",
                text: "Please select at least one space to continue.",
                confirmButtonColor: "var(--brand-primary)",
                confirmButtonText: "OK",
            });
            return;
        }

        continueBtn.disabled = true;
        continueBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Loading...';

        fetch("/request/step/inspirations/?space_ids=" + ids.join(","))
            .then(function (r) { return r.text(); })
            .then(function (html) {
                continueBtn.disabled = false;
                continueBtn.innerHTML = "Continue";

                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");
                var spaceCards = doc.querySelectorAll(".inspo-space-card");
                var spacesData = [];
                spaceCards.forEach(function (card) {
                    var sid = card.dataset.spaceId;
                    var nameEl = card.querySelector(".inspo-space-name");
                    var items = card.querySelectorAll(".inspiration-item");
                    var images = [];
                    items.forEach(function (item) {
                        images.push({
                            imgId: parseInt(item.dataset.imgId),
                            imgUrl: item.dataset.imgUrl,
                        });
                    });
                    spacesData.push({ spaceId: sid, name: nameEl.textContent.trim(), images: images });
                });

                if (spacesData.length === 0) {
                    window.location.href = "/order/?spaces=" + ids.join(",");
                    return;
                }

                showSequentialModals(spacesData, 0);
            })
            .catch(function () {
                continueBtn.disabled = false;
                continueBtn.innerHTML = "Continue";
                window.location.href = "/order/?spaces=" + ids.join(",");
            });
    });

    // ── Bar Width ──
    document.querySelectorAll("[data-bar-width]").forEach(function (el) {
        el.style.width = el.dataset.barWidth + "%";
    });

    // ── Image Error Handling ──
    document.querySelectorAll("[data-img-error]").forEach(function (img) {
        img.addEventListener("error", function () {
            var action = this.dataset.imgError;
            if (action === "hide-parent" && this.parentElement) {
                this.parentElement.style.display = "none";
            }
        });
    });

    // ── Scroll Reveal ──

    (function () {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll(".reveal").forEach(function (el) {
            observer.observe(el);
        });
    })();

    // ── Recent Projects Slider Toggle (slide up/down) ──
    var projectsSection = document.getElementById("projects-section");
    var projectsToggle = document.getElementById("projectsToggle");
    var PROJECTS_TOGGLE_GAP = 14;
    if (projectsSection && projectsToggle) {
        function positionToggle() {
            var open = projectsSection.classList.contains("open");
            projectsToggle.style.bottom = open
                ? (projectsSection.offsetHeight + PROJECTS_TOGGLE_GAP) + "px"
                : PROJECTS_TOGGLE_GAP + "px";
        }

        window.addEventListener("resize", positionToggle);

        projectsToggle.addEventListener("click", function () {
            var isOpen = projectsSection.classList.contains("open");
            projectsSection.classList.toggle("open", !isOpen);
            projectsToggle.classList.toggle("open", !isOpen);
            projectsToggle.setAttribute("aria-expanded", String(!isOpen));
            projectsSection.setAttribute("aria-hidden", String(isOpen));
            setTimeout(positionToggle, 10);
        });
    }

    // ── Recent Projects Slider (drag + arrows) ──
    var track = document.getElementById("projectsTrack");
    if (track) {
        var prevBtn = document.querySelector(".projects-prev");
        var nextBtn = document.querySelector(".projects-next");

        function isRTL() {
            return document.documentElement.getAttribute("dir") === "rtl";
        }

        function cardWidth() {
            var first = track.querySelector(".project-rect-card");
            if (!first) return 320;
            return first.getBoundingClientRect().width + 20;
        }

        function scrollByCards(n) {
            track.scrollBy({ left: n * cardWidth(), behavior: "smooth" });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                scrollByCards(isRTL() ? 1 : -1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                scrollByCards(isRTL() ? -1 : 1);
            });
        }

        var isDown = false;
        var startX = 0;
        var startScroll = 0;
        var moved = false;

        track.addEventListener("pointerdown", function (e) {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            isDown = true;
            moved = false;
            startX = e.clientX;
            startScroll = track.scrollLeft;
            track.classList.add("dragging");
            track.setPointerCapture(e.pointerId);
        });

        track.addEventListener("pointermove", function (e) {
            if (!isDown) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 5) moved = true;
            track.scrollLeft = startScroll - dx;
        });

        function endDrag() {
            if (!isDown) return;
            isDown = false;
            track.classList.remove("dragging");
        }

        track.addEventListener("pointerup", endDrag);
        track.addEventListener("pointercancel", endDrag);

        track.addEventListener("click", function (e) {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);
    }

});
