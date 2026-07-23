(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // Dropdown z-index fix
        document.querySelectorAll(".crm-status-dropdown").forEach(function (dd) {
            var col = dd.closest(".col-lg-4, .col-md-6");
            dd.addEventListener("show.bs.dropdown", function () {
                if (col) col.style.zIndex = 10;
            });
            dd.addEventListener("hide.bs.dropdown", function () {
                if (col) col.style.zIndex = "";
            });
        });

        // Status option click in dropdown (kanban list cards)
        document.querySelectorAll(".crm-status-option").forEach(function (opt) {
            opt.addEventListener("click", function () {
                var dropdown = this.closest(".crm-status-dropdown");
                var projectId = dropdown.dataset.projectId;
                var newStatus = this.dataset.value;
                var btn = dropdown.querySelector(".crm-status-btn");
                var label = dropdown.querySelector(".crm-status-btn-label");
                var card = dropdown.closest(".crm-card");
                var projectName = card ? card.dataset.projectName : "";

                var statusLabel = this.textContent.trim();
                var confirmText = 'Are you sure you want to change "' + projectName + '" to ' + statusLabel + "?";

                Swal.fire({
                    title: "Change Status?",
                    text: confirmText + " The customer will receive an email notification.",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#2a5a5a",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Yes, change status",
                    cancelButtonText: "Cancel",
                    reverseButtons: true,
                }).then(function (result) {
                    if (!result.isConfirmed) return;

                    Swal.fire({
                        title: "Updating Status...",
                        html: '<div class="d-flex flex-column align-items-center gap-2"><div class="spinner-border text-primary" role="status"></div><p class="text-muted small mb-0">Sending notification email...</p></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    });

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
                            card.dataset.status = newStatus;
                            btn.className = btn.className.replace(/bg-\S+/g, "bg-" + newStatus);
                            label.textContent = statusLabel;
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
                            Swal.fire({
                                icon: "success",
                                title: "Status Updated",
                                text: data.message || "Status changed to " + statusLabel,
                                showConfirmButton: false,
                                timer: 2000,
                            });
                        } else {
                            Swal.fire({ icon: "error", title: "Update Failed", text: data.errors ? data.errors.join(", ") : "Failed to update." });
                        }
                    }.bind(this))
                    .catch(function () {
                        Swal.fire({ icon: "error", title: "Connection Failed", text: "Could not reach the server." });
                    });
                });
            });
        });

        // Quick status buttons in project detail page
        document.querySelectorAll(".quick-status-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var pk = this.dataset.projectId;
                var status = this.dataset.status;
                var url = this.dataset.url;
                var shouldReload = this.dataset.reload === "true";
                var statusLabel = this.textContent.trim();

                Swal.fire({
                    title: "Change Status?",
                    text: 'Are you sure you want to set this project to "' + statusLabel + '"? The customer will receive an email notification.',
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: status === "approved" ? "#28a745" : status === "declined" ? "#dc3545" : "#ffc107",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Yes, " + statusLabel.toLowerCase(),
                    cancelButtonText: "Cancel",
                    reverseButtons: true,
                }).then(function (result) {
                    if (!result.isConfirmed) return;

                    Swal.fire({
                        title: "Updating Status...",
                        html: '<div class="d-flex flex-column align-items-center gap-2"><div class="spinner-border text-primary" role="status"></div><p class="text-muted small mb-0">Sending notification email...</p></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    });

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
                            Swal.fire({
                                icon: "success",
                                title: "Status Updated",
                                text: data.message || "Project set to " + statusLabel,
                                showConfirmButton: false,
                                timer: 2000,
                            }).then(function () {
                                if (shouldReload) location.reload();
                            });
                        } else {
                            Swal.fire({ icon: "error", title: "Update Failed", text: data.errors ? data.errors.join(", ") : "Failed to update." });
                        }
                    })
                    .catch(function () {
                        Swal.fire({ icon: "error", title: "Connection Failed", text: "Could not reach the server." });
                    });
                });
            });
        });
    });

    function getCsrfToken() {
        var match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : "";
    }
})();
