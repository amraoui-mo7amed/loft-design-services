(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".crm-status-dropdown").forEach(function (dd) {
            var col = dd.closest(".col-lg-4, .col-md-6");
            dd.addEventListener("show.bs.dropdown", function () {
                if (col) col.style.zIndex = 10;
            });
            dd.addEventListener("hide.bs.dropdown", function () {
                if (col) col.style.zIndex = "";
            });
        });

        document.querySelectorAll(".quick-status-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var pk = this.dataset.projectId;
                var status = this.dataset.status;
                var url = this.dataset.url;
                var shouldReload = this.dataset.reload === "true";

                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-CSRFToken": getCsrfToken(),
                    },
                    body: "status=" + encodeURIComponent(status),
                })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        if (shouldReload) {
                            location.reload();
                        }
                        showToast(data.message || "Status updated.", "success");
                    } else {
                        showToast(data.errors ? data.errors.join(", ") : "Failed to update.", "error");
                    }
                })
                .catch(function () {
                    showToast("Network error.", "error");
                });
            });
        });

        document.querySelectorAll(".crm-status-option").forEach(function (opt) {
            opt.addEventListener("click", function () {
                var dropdown = this.closest(".crm-status-dropdown");
                var projectId = dropdown.dataset.projectId;
                var newStatus = this.dataset.value;
                var btn = dropdown.querySelector(".crm-status-btn");
                var label = dropdown.querySelector(".crm-status-btn-label");

                fetch("/dashboard/crm/update-status/" + projectId + "/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-CSRFToken": getCsrfToken(),
                    },
                    body: "status=" + encodeURIComponent(newStatus),
                })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        var card = dropdown.closest(".crm-card");
                        card.dataset.status = newStatus;

                        btn.className = btn.className.replace(/bg-\S+/g, "bg-" + newStatus);
                        label.textContent = this.textContent.trim();

                        var menu = dropdown.querySelector(".crm-status-menu");
                        menu.querySelectorAll(".crm-status-option").forEach(function (o) {
                            o.classList.remove("active");
                            var check = o.querySelector(".fa-check");
                            if (check) check.remove();
                        });
                        this.classList.add("active");
                        var checkIcon = document.createElement("i");
                        checkIcon.className = "fas fa-check ms-auto";
                        this.appendChild(checkIcon);

                        showToast(data.message || "Status updated.", "success");
                    } else {
                        showToast(data.errors ? data.errors.join(", ") : "Failed to update.", "error");
                    }
                }.bind(this))
                .catch(function () {
                    showToast("Network error.", "error");
                });
            });
        });
    });

    function showToast(message, type) {
        var container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.style.cssText = "position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;";
            document.body.appendChild(container);
        }
        var toast = document.createElement("div");
        toast.className = "toast align-items-center text-bg-" + (type === "error" ? "danger" : "success") + " border-0 show";
        toast.setAttribute("role", "alert");
        toast.innerHTML = '<div class="d-flex"><div class="toast-body">' + message + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
        container.appendChild(toast);
        var bs = new bootstrap.Toast(toast, { delay: 3000 });
        bs.show();
        toast.addEventListener("hidden.bs.toast", function () { toast.remove(); });
    }

    function getCsrfToken() {
        var match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : "";
    }
})();
