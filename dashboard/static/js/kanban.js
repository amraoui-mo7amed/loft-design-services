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
                var btn = dropdown.querySelector(".crm-status-btn, .crm-status-badge");
                var label = dropdown.querySelector(".crm-status-btn-label");
                var card = dropdown.closest(".crm-glass-card, .crm-card");
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

                    var updateUrl = dropdown.dataset.updateStatusUrl || ("/dashboard/crm/update-status/" + projectId + "/");

                    fetch(updateUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-CSRFToken": getCsrfToken(),
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        body: "status=" + encodeURIComponent(newStatus),
                    })
                    .then(function (r) {
                        return r.json().catch(function () {
                            return { success: false, errors: ["Server returned status " + r.status] };
                        });
                    })
                    .then(function (data) {
                        if (data.success) {
                            if (card) {
                                card.dataset.status = newStatus;
                                card.className = card.className.replace(/crm-status-\S+/g, "crm-status-" + newStatus);
                                var avatar = card.querySelector(".crm-project-avatar");
                                if (avatar) {
                                    avatar.className = avatar.className.replace(/status-glow-\S+/g, "status-glow-" + newStatus);
                                }
                            }
                            if (btn) {
                                btn.className = btn.className.replace(/crm-badge-\S+/g, "crm-badge-" + newStatus).replace(/bg-\S+/g, "bg-" + newStatus);
                            }
                            if (label) {
                                label.textContent = statusLabel;
                            }
                            var menu = dropdown.querySelector(".crm-status-menu");
                            if (menu) {
                                menu.querySelectorAll(".crm-status-option").forEach(function (o) {
                                    o.classList.remove("active");
                                    var check = o.querySelector(".fa-check");
                                    if (check) check.remove();
                                });
                            }
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
                            var errMsg = data.errors ? (Array.isArray(data.errors) ? data.errors.join(", ") : String(data.errors)) : "Failed to update.";
                            Swal.fire({ icon: "error", title: "Update Failed", text: errMsg });
                        }
                    }.bind(this))
                    .catch(function (err) {
                        console.error("Status update error:", err);
                        Swal.fire({ icon: "error", title: "Request Failed", text: "Could not complete the status update. Please try again." });
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
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        body: "status=" + encodeURIComponent(status),
                    })
                    .then(function (r) {
                        return r.json().catch(function () {
                            return { success: false, errors: ["Server returned status " + r.status] };
                        });
                    })
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
                            var errMsg = data.errors ? (Array.isArray(data.errors) ? data.errors.join(", ") : String(data.errors)) : "Failed to update.";
                            Swal.fire({ icon: "error", title: "Update Failed", text: errMsg });
                        }
                    })
                    .catch(function (err) {
                        console.error("Status update error:", err);
                        Swal.fire({ icon: "error", title: "Request Failed", text: "Could not complete the status update. Please try again." });
                    });
                });
            });
        });
    });

    function getCsrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content) return meta.content;
        var input = document.querySelector('[name=csrfmiddlewaretoken]');
        if (input && input.value) return input.value;
        var match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
        return match ? match[1] : "";
    }
})();
