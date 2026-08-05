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

    // ── Hero Background Slider ──
    var heroSwiperEl = document.getElementById("heroSwiper");
    if (heroSwiperEl && window.Swiper) {
        var heroSwiper = new Swiper(heroSwiperEl, {
            effect: "fade",
            direction: "horizontal",
            loop: true,
            speed: 1400,
            allowTouchMove: false,
            fadeEffect: { crossFade: true },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
    }

    // ── Recent Projects Swiper (coverflow) ──
    var projectsSwiperEl = document.getElementById("projectsSwiper");
    if (projectsSwiperEl && window.Swiper) {
        var isRTL = document.documentElement.getAttribute("dir") === "rtl";
        var projectsSwiper = new Swiper(projectsSwiperEl, {
            effect: "coverflow",
            direction: "horizontal",
            loop: true,
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            rtl: isRTL,
            speed: 600,
            mousewheel: {
                forceToAxis: true,
            },
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 120,
                modifier: 1.4,
                slideShadows: true,
            },
            navigation: {
                prevEl: ".projects-prev",
                nextEl: ".projects-next",
            },
            breakpoints: {
                320: { slidesPerView: 1.1, coverflowEffect: { depth: 80, modifier: 1.2 } },
                640: { slidesPerView: 2, coverflowEffect: { depth: 100, modifier: 1.3 } },
                992: { slidesPerView: 3, coverflowEffect: { depth: 120, modifier: 1.4 } },
            },
        });
    }

});
