document.addEventListener("DOMContentLoaded", function () {
    var page = document.getElementById("packSelectPage");
    if (!page) return;

    var subtotal = parseFloat(page.dataset.subtotal) || 0;
    var spaceIds = page.dataset.spaces || "";

    var cards = page.querySelectorAll(".pkg-card");
    var basicCard = page.querySelector(".pkg-card.basic-card");
    var selectedPkgId = null;

    function fmt(n) {
        return Math.round(n).toString();
    }

    function renderPrices() {
        cards.forEach(function (card) {
            var addon = parseFloat(card.dataset.packagePrice) || 0;
            var sum = fmt(subtotal + addon);
            var priceEl = card.querySelector(".pkg-dynamic-price");
            var sumEl = card.querySelector(".pkg-sum-price");
            var baseEl = card.querySelector(".pkg-base-price");
            var addonEl = card.querySelector(".pkg-addon-price");
            var basicEl = card.querySelector(".pkg-basic-breakdown");
            if (priceEl) priceEl.textContent = sum;
            if (sumEl) sumEl.textContent = sum;
            if (baseEl) baseEl.textContent = fmt(subtotal);
            if (addonEl) addonEl.textContent = fmt(addon);
            if (basicEl) basicEl.textContent = fmt(subtotal);
        });
    }

    function selectBasic() {
        cards.forEach(function (c) {
            if (c !== basicCard) c.classList.remove("selected");
        });
        if (basicCard) basicCard.classList.add("selected");
        selectedPkgId = basicCard && basicCard.dataset.packageId ? basicCard.dataset.packageId : null;
        updateTotalBar();
    }

    function updateTotalBar() {
        var addon = 0;
        var nameEl = null;
        cards.forEach(function (c) {
            if (c.classList.contains("selected")) {
                addon = parseFloat(c.dataset.packagePrice) || 0;
                nameEl = c.querySelector(".pkg-card-name");
            }
        });
        var totalEl = document.getElementById("packPkgPrice");
        if (totalEl) totalEl.textContent = fmt(addon) + " DA";
        var subEl = document.getElementById("packSubtotal");
        if (subEl) subEl.textContent = fmt(subtotal) + " DA";
        var nameElOut = document.getElementById("packTotalName");
        if (nameElOut) nameElOut.textContent = nameEl ? nameEl.textContent.trim() : "";
    }

    renderPrices();

    if (basicCard) {
        var params = new URLSearchParams(window.location.search);
        var pre = params.get("pkg");
        if (pre) {
            var matched = false;
            cards.forEach(function (c) {
                if (c.dataset.packageId === pre) {
                    c.classList.add("selected");
                    matched = true;
                }
            });
            if (!matched) selectBasic();
        } else {
            selectBasic();
        }
    }

    cards.forEach(function (card) {
        card.addEventListener("click", function (e) {
            if (e.target.closest(".pkg-details-btn") || e.target.closest("[data-video-url]")) return;

            if (this === basicCard) {
                selectBasic();
            } else {
                var isActive = this.classList.contains("selected");
                cards.forEach(function (c) {
                    if (c !== basicCard) c.classList.remove("selected");
                });
                if (isActive) {
                    selectBasic();
                } else {
                    this.classList.add("selected");
                    selectedPkgId = this.dataset.packageId;
                }
            }
            updateTotalBar();
        });
    });

    cards.forEach(function (card) {
        var btn = card.querySelector(".pkg-details-btn");
        if (!btn) return;
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            renderDetails(card);
            var modalEl = document.getElementById("estimateDetailsModal");
            if (modalEl) new bootstrap.Modal(modalEl).show();
        });
    });

    function renderDetails(cardEl) {
        var body = document.getElementById("estimateDetailsBody");
        if (!body) return;

        var addon = cardEl ? (parseFloat(cardEl.dataset.packagePrice) || 0) : 0;
        var nameEl = cardEl ? cardEl.querySelector(".pkg-card-name") : null;
        var packageLabel = nameEl ? nameEl.textContent.trim() : "Basic";
        var services = [];
        if (cardEl && cardEl.dataset.packageServices) {
            try { services = JSON.parse(cardEl.dataset.packageServices); } catch (err) { services = []; }
        }
        var total = Math.round(subtotal + addon);

        var html = "";

        html += '<div class="wiz-summary-card mb-3">';
        html += '  <div class="wiz-summary-title mb-2">Selected Spaces</div>';
        var rows = page.querySelectorAll("[data-space-row]");
        if (rows.length === 0) {
            html += '<div class="wiz-text-sm text-muted">No spaces selected.</div>';
        } else {
            rows.forEach(function (row) {
                html += '  <div class="d-flex justify-content-between align-items-center py-1">';
                html += '    <span class="wiz-text-sm">' + row.dataset.spaceName + '</span>';
                html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + fmt(row.dataset.spacePrice) + ' DA</span>';
                html += '  </div>';
            });
        }
        html += '</div>';

        if (services.length > 0) {
            html += '<div class="wiz-summary-card mb-3">';
            html += '  <div class="wiz-summary-title mb-2">' + packageLabel + ' — What\'s included</div>';
            services.forEach(function (s) {
                var nm = s.name || "";
                var pr = parseFloat(s.price) || 0;
                html += '  <div class="d-flex justify-content-between align-items-center py-1 wiz-text-sm">';
                html += '    <span class="d-flex align-items-center gap-2"><i class="fas fa-check-circle" style="color:var(--wiz-success);font-size:0.6rem;flex-shrink:0;"></i>' + nm + '</span>';
                if (pr > 0) html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + fmt(pr) + ' DA</span>';
                html += '  </div>';
            });
            html += '</div>';
        }

        html += '<div class="wiz-summary-card mb-3">';
        html += '  <div class="d-flex justify-content-between align-items-center py-1">';
        html += '    <span class="wiz-text-muted-light">Base price (selected spaces)</span>';
        html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + fmt(subtotal) + ' DA</span>';
        html += '  </div>';
        html += '  <div class="d-flex justify-content-between align-items-center py-1">';
        html += '    <span class="wiz-text-muted-light">Package</span>';
        html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + packageLabel + ' — ' + fmt(addon) + ' DA</span>';
        html += '  </div>';
        html += '  <hr class="my-2" style="border-color:var(--wiz-border);opacity:0.6;">';
        html += '  <div class="d-flex justify-content-between align-items-center py-1">';
        html += '    <span class="fw-bold">Estimated Total</span>';
        html += '    <span style="font-size:1.3rem;font-weight:800;color:var(--wiz-accent);">' + fmt(total) + ' DA</span>';
        html += '  </div>';
        html += '</div>';

        body.innerHTML = html;
    }

    var continueBtn = document.getElementById("packContinueBtn");
    if (continueBtn) {
        continueBtn.addEventListener("click", function () {
            var url = "/order/?spaces=" + encodeURIComponent(spaceIds);
            if (selectedPkgId) url += "&pkg=" + encodeURIComponent(selectedPkgId);
            window.location.href = url;
        });
    }
});
