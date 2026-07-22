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

    continueBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var ids = getSelectedSpaces();
        if (ids.length > 0) {
            window.location.href = "/order/?spaces=" + ids.join(",");
        }
    });

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

    document.addEventListener("scroll", function () {
        var nav = document.getElementById("landingNav");
        if (window.scrollY > 50) {
            nav.classList.add("bg-white", "shadow-sm");
            nav.classList.remove("bg-transparent");
        } else {
            nav.classList.remove("bg-white", "shadow-sm");
            nav.classList.add("bg-transparent");
        }
    });
});
