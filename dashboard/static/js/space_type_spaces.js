document.addEventListener("DOMContentLoaded", function () {
    function toast(msg, icon) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: icon,
            title: msg,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
    }

    var saveBtn = document.getElementById("saveHomeSpacesBtn");
    var grid = document.getElementById("featuredSpacesGrid");
    var featuredCountEl = document.querySelector(".sts-featured-count-value");

    if (!saveBtn || !grid) return;

    function currentCount() {
        return document.querySelectorAll(".featured-space-toggle:checked").length;
    }

    function renderFeaturedCount() {
        var count = currentCount();
        if (featuredCountEl) featuredCountEl.textContent = count;
        saveBtn.disabled = count === 0;
    }

    grid.addEventListener("change", function (e) {
        if (e.target.classList.contains("featured-space-toggle")) {
            renderFeaturedCount();
        }
    });

    saveBtn.addEventListener("click", function () {
        var ids = [];
        document.querySelectorAll(".featured-space-toggle:checked").forEach(function (cb) {
            ids.push(cb.dataset.spaceId);
        });
        var fd = new FormData();
        ids.forEach(function (id) { fd.append("space_ids", id); });
        fd.append("csrfmiddlewaretoken", saveBtn.dataset.csrf);

        saveBtn.disabled = true;
        saveBtn.querySelector("i").className = "fas fa-spinner fa-spin me-2";

        fetch(saveBtn.dataset.saveUrl, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: fd,
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                saveBtn.querySelector("i").className = "fas fa-save me-2";
                if (data.success) {
                    renderFeaturedCount();
                    toast(data.message, "success");
                } else {
                    saveBtn.disabled = currentCount() === 0;
                    toast((data.errors || ["Error"]).join(", "), "error");
                }
            })
            .catch(function () {
                saveBtn.querySelector("i").className = "fas fa-save me-2";
                saveBtn.disabled = currentCount() === 0;
                toast("Connection failed", "error");
            });
    });

    renderFeaturedCount();
});
