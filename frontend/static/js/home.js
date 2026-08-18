document.addEventListener("DOMContentLoaded", function () {
    const floatingTotal = document.getElementById("floatingTotal");
    const floatingBadge = document.getElementById("floatingTotalBadge");
    const floatingBox = document.getElementById("floatingTotalBox");
    const spacesSection = document.getElementById("spaces-section");
    const continueBtn = document.getElementById("continueBtn");
    const checkboxes = document.querySelectorAll(".space-checkbox");
    const spaceCards = document.querySelectorAll(".space-card");
    let currentTotal = 0;
    let sectionInView = true;

    function formatNumber(num) {
        return Math.round(num).toString();
    }

    function getSelectedSpaces() {
        const ids = [];
        checkboxes.forEach(function (cb) {
            if (cb.checked) ids.push(cb.value);
        });
        return ids;
    }

    function updateFloatingBadge() {
        const show = sectionInView && currentTotal > 0;
        if (floatingBox) {
            floatingBox.classList.toggle("is-visible", show);
        } else if (floatingBadge) {
            floatingBadge.classList.toggle("is-visible", show);
        }
        if (continueBtn && !floatingBox) {
            continueBtn.classList.toggle("is-visible", show);
        }
    }

    function updateTotal() {
        let total = 0;
        checkboxes.forEach(function (cb) {
            if (cb.checked) {
                const card = cb.closest(".space-card");
                total += parseFloat(card.dataset.price) || 0;
            }
        });
        currentTotal = total;
        if (floatingTotal) floatingTotal.textContent = formatNumber(total);
        updateFloatingBadge();
    }

    if (spacesSection && "IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                sectionInView = entry.isIntersecting;
                updateFloatingBadge();
            });
        }, { threshold: 0.05 }).observe(spacesSection);
    }

    updateFloatingBadge();

    checkboxes.forEach(function (cb) {
        cb.addEventListener("change", function () {
            var card = cb.closest(".space-card");
            card.classList.toggle("selected", cb.checked);
            updateTotal();
        });
    });

    spaceCards.forEach(function (card) {
        card.addEventListener("click", function (e) {
            if (e.target.type !== "checkbox" && !e.target.closest(".space-card-check")) {
                var cb = card.querySelector(".space-checkbox");
                cb.checked = !cb.checked;
                card.classList.toggle("selected", cb.checked);
                updateTotal();
            }
        });
    });

    // ── Inspiration Modals ──

    function goToPackSelect() {
        var ids = getSelectedSpaces();
        window.location.href = "/order/pack/?spaces=" + ids.join(",");
    }

    function showSequentialModals(spacesData, index) {
        if (index >= spacesData.length) {
            goToPackSelect();
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
                var img = c.querySelector("img");
                addInspiration(space.spaceId, parseInt(c.dataset.imgId), img ? img.src : "");
            });
            var bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
            showSequentialModals(spacesData, index + 1);
        });

        var bsModal = new bootstrap.Modal(modalEl, { backdrop: "static", keyboard: false });
        bsModal.show();
    }

    function addInspiration(spaceId, imgId, imgUrl) {
        // Store selected inspiration data (used by the order page later)
        var stored = JSON.parse(sessionStorage.getItem("homeInspirations") || "{}");
        if (!stored[spaceId]) stored[spaceId] = [];
        // Normalize legacy entries (plain img ids) into {id, url} objects
        stored[spaceId] = stored[spaceId].map(function (it) {
            if (it && typeof it === "object") return it;
            return { id: it, url: "" };
        });
        var exists = stored[spaceId].some(function (it) { return it.id === imgId; });
        if (!exists) stored[spaceId].push({ id: imgId, url: imgUrl });
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
                    goToPackSelect();
                    return;
                }

                showSequentialModals(spacesData, 0);
            })
            .catch(function () {
                continueBtn.disabled = false;
                continueBtn.innerHTML = "Continue";
                goToPackSelect();
            });
    });

    // ── Pack selection handled on /order/pack/ ──

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

    // ── Recent Projects Swiper (coverflow effect) ──
    var projectsSwiperEl = document.getElementById("projectsSwiper");
    if (projectsSwiperEl && window.Swiper) {
        var isRTL = document.documentElement.getAttribute("dir") === "rtl";
        var projectSlides = projectsSwiperEl.querySelectorAll(".swiper-slide").length;
        var projectsPaginationEl = projectsSwiperEl.querySelector(".projects-pagination") || document.querySelector(".projects-pagination");
        var projectsSwiper = new Swiper(projectsSwiperEl, {
            effect: "coverflow",
            direction: "horizontal",
            loop: projectSlides > 2,
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            watchOverflow: false,
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 120,
                modifier: 1.4,
                slideShadows: true,
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: projectsPaginationEl,
                clickable: true,
                dynamicBullets: false,
            },
            rtl: isRTL,
            speed: 600,
            mousewheel: {
                forceToAxis: true,
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



    // ── Videos Swiper (slide effect) ──
    var videosSwiperEl = document.getElementById("videosSwiper");
    if (videosSwiperEl && window.Swiper) {
        var isRTL = document.documentElement.getAttribute("dir") === "rtl";
        var videoSlides = videosSwiperEl.querySelectorAll(".swiper-slide").length;
        var videosPaginationEl = videosSwiperEl.querySelector(".videos-pagination") || document.querySelector(".videos-pagination");
        var videosSwiper = new Swiper(videosSwiperEl, {
            effect: "slide",
            direction: "horizontal",
            loop: videoSlides > 1,
            grabCursor: true,
            slidesPerView: 1.1,
            spaceBetween: 20,
            watchOverflow: false,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: videosPaginationEl,
                clickable: true,
                dynamicBullets: false,
            },
            rtl: isRTL,
            speed: 600,
            navigation: {
                prevEl: ".videos-prev",
                nextEl: ".videos-next",
            },
            breakpoints: {
                320: { slidesPerView: 1.1, spaceBetween: 14 },
                576: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 2.5, spaceBetween: 18 },
                992: { slidesPerView: 3.2, spaceBetween: 20 },
                1200: { slidesPerView: 4, spaceBetween: 24 },
            },
        });
    }

    // ── Contact Form (AJAX without SweetAlert) ──
    var contactForm = document.getElementById("contactForm");
    if (contactForm) {
        var submitBtn = document.getElementById("contactSubmitBtn");
        var statusEl = document.getElementById("contactFormStatus");

        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop().split(";").shift();
            return null;
        }

        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            if (statusEl) {
                statusEl.className = "contact-form-status d-none";
                statusEl.innerHTML = "";
            }

            var origBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Sending...';

            fetch(contactForm.getAttribute("action"), {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: new FormData(contactForm),
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origBtnHtml;
                    if (statusEl) {
                        if (data.success) {
                            contactForm.reset();
                            statusEl.className = "contact-form-status alert-glass-success mb-3";
                            statusEl.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + (data.message || "Thank you! Your message has been sent successfully.");
                        } else {
                            var errMsg = data.errors || data.message || "Something went wrong. Please try again.";
                            if (Array.isArray(errMsg)) errMsg = errMsg.join("<br>");
                            statusEl.className = "contact-form-status alert-glass-danger mb-3";
                            statusEl.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>' + errMsg;
                        }
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origBtnHtml;
                    if (statusEl) {
                        statusEl.className = "contact-form-status alert-glass-danger mb-3";
                        statusEl.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Network error. Please try again.';
                    }
                });
        });
    }

});
