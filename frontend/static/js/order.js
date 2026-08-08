document.addEventListener("DOMContentLoaded", function () {
    var orderForm = document.getElementById("orderForm");
    var submitBtn = document.getElementById("submitOrderBtn");
    if (!orderForm) return;

    var d = orderForm.dataset;

    function getSelectedSpaces() {
        var rows = document.querySelectorAll(".order-summary-row");
        var spaces = [];
        rows.forEach(function (row) {
            spaces.push({
                id: row.dataset.spaceId,
                name: row.dataset.spaceName,
                price: row.dataset.spacePrice,
            });
        });
        return spaces;
    }

    function getSelectedInspirations() {
        try {
            var stored = JSON.parse(sessionStorage.getItem("homeInspirations") || "{}");
            var cleaned = {};
            Object.keys(stored).forEach(function (spaceId) {
                var imgs = (stored[spaceId] || []).filter(function (it) {
                    return it && typeof it === "object" && it.id && it.url;
                });
                if (imgs.length) cleaned[spaceId] = imgs;
            });
            return cleaned;
        } catch (err) {
            return {};
        }
    }

    orderForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var formData = new FormData(orderForm);
        var data = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            spaces: getSelectedSpaces(),
            inspirations: getSelectedInspirations(),
            total: d.total || "0",
        };

        if (!data.first_name || !data.last_name || !data.email || !data.phone) {
            Swal.fire({ icon: "warning", title: d.missingTitle, text: d.missingText, confirmButtonColor: "#FFD65A" });
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = d.sendingText;

        fetch("/api/design/inquiries/", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRFToken": d.csrf },
            body: JSON.stringify(data),
        })
        .then(function (r) { return r.json(); })
        .then(function (response) {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: d.successTitle,
                    text: d.successText,
                    confirmButtonColor: "#FFD65A",
                    confirmButtonText: d.successBtn,
                }).then(function () {
                    window.location.href = d.homeUrl;
                });
            } else {
                Swal.fire({ icon: "error", title: d.errorTitle, text: response.error || d.errorText, confirmButtonColor: "#FFD65A" });
            }
        })
        .catch(function () {
            Swal.fire({ icon: "error", title: d.networkTitle, text: d.networkText, confirmButtonColor: "#FFD65A" });
        })
        .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = d.submitText;
        });
    });
});
