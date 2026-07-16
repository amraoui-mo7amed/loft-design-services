document.addEventListener("DOMContentLoaded", function () {
    var optionsList = document.getElementById("optionsList");

    function fetchDeliveryTotal() {
        var el = document.getElementById("totalDelivery");
        if (!el) return;
        var sum = 0;
        document.querySelectorAll("#optionsList [data-opt-id]").forEach(function (card) {
            var txt = card.querySelector(".fa-clock") ? card.querySelector(".fa-clock").parentElement.textContent.trim() : "";
            var match = txt.match(/(\d+)/);
            if (match) sum += parseInt(match[1], 10);
        });
        var daysText = optionsList ? optionsList.dataset.daysText : "days";
        el.textContent = sum + " " + daysText;
    }

    function updateOptionCount(count) {
        var el = document.getElementById("optCountBadge");
        if (el) el.textContent = count;
    }

    // Delete option via SweetAlert
    if (optionsList) {
        optionsList.addEventListener("click", function (e) {
            var btn = e.target.closest(".option-delete-btn");
            if (!btn) return;
            var card = btn.closest("[data-opt-id]");
            if (!card) return;
            var optId = card.dataset.optId;
            var deleteUrl = optionsList.dataset.deleteUrl.replace("0", optId);
            var removeText = optionsList.dataset.removeConfirm || "Remove this option?";
            var csrf = optionsList.dataset.csrf;

            Swal.fire({
                title: removeText,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, remove",
                cancelButtonText: "Cancel",
                buttonsStyling: false,
                customClass: { confirmButton: "btn btn-danger mx-2", cancelButton: "btn btn-secondary" },
            }).then(function (result) {
                if (!result.isConfirmed) return;
                var fd = new FormData();
                fd.append("csrfmiddlewaretoken", csrf);
                fetch(deleteUrl, {
                    method: "POST",
                    body: fd,
                    headers: { "X-Requested-With": "XMLHttpRequest" }
                })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        card.remove();
                        updateOptionCount(data.option_count);
                        if (!optionsList.querySelector("[data-opt-id]")) {
                            optionsList.innerHTML = '<div class="text-center py-4" id="emptyOptions"><p class="small text-muted mb-0">' + (optionsList.dataset.emptyText || "No options yet. Add one to get started.") + '</p></div>';
                        }
                        fetchDeliveryTotal();
                        Swal.fire({ title: "Removed!", icon: "success", timer: 1000, showConfirmButton: false });
                    } else {
                        Swal.fire({ title: "Error", text: data.message || "Failed to remove option.", icon: "error" });
                    }
                })
                .catch(function () {
                    Swal.fire({ title: "Error", text: "Connection failed", icon: "error" });
                });
            });
        });
    }

    // Add option via AJAX
    var addForm = document.getElementById("addOptionForm");
    if (addForm) {
        addForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var form = this;
            var errorList = form.querySelector("#errorList");
            if (errorList) errorList.innerHTML = "";
            var btn = form.querySelector("button[type=submit]");
            if (btn) btn.disabled = true;
            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (btn) btn.disabled = false;
                if (data.success) {
                    var list = document.getElementById("optionsList");
                    var empty = list ? list.querySelector("#emptyOptions") : null;
                    if (empty) empty.remove();
                    var card = document.createElement("div");
                    card.className = "border rounded-2 p-3 option-card";
                    card.dataset.optId = data.option.id;
                    var catHtml = data.option.category_name
                        ? '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-tag me-1"></i>' + data.option.category_name + '</span>'
                        : "";
                    var daysText = list ? list.dataset.daysText : "days";
                    card.innerHTML =
                        '<div class="d-flex align-items-start justify-content-between gap-2">' +
                            '<div class="flex-grow-1">' +
                                '<div class="fw-semibold" style="font-size:0.85rem;">' + data.option.name + '</div>' +
                                '<div class="d-flex align-items-center gap-3 mt-1">' +
                                    catHtml +
                                    '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-dollar-sign me-1"></i>' + data.option.price + '</span>' +
                                    '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-clock me-1"></i>' + data.option.delivery_time_days + " " + daysText + '</span>' +
                                    (data.option.description ? '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-align-left me-1"></i>' + data.option.description + '</span>' : "") +
                                '</div>' +
                            '</div>' +
                            '<button type="button" class="btn btn-sm option-delete-btn flex-shrink-0" title="Remove" style="border:1px solid #e9ecef;color:#adb5bd;background:#fff;border-radius:4px;padding:0.2rem 0.45rem;font-size:0.65rem;"><i class="fas fa-times"></i></button>' +
                        '</div>';
                    if (list) list.appendChild(card);
                    updateOptionCount(data.option_count);
                    fetchDeliveryTotal();
                    var modalEl = document.getElementById("addOptionModal");
                    var modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    form.reset();
                    var sel = form.querySelector(".custom-select-wrapper");
                    if (sel) {
                        var hidden = sel.querySelector('input[type="hidden"]');
                        if (hidden) hidden.value = "";
                        var display = sel.querySelector(".custom-select-display");
                        if (display) {
                            var firstLi = sel.querySelector(".custom-select-list li:first-child");
                            display.innerHTML = (firstLi ? firstLi.textContent : "Select") + '<span class="arrow"><i class="fas fa-caret-down"></i></span>';
                        }
                    }
                } else {
                    if (errorList && data.errors) {
                        var items = Array.isArray(data.errors) ? data.errors : Object.values(data.errors).flat();
                        errorList.innerHTML = items.map(function (m) { return '<li class="alert-danger">' + m + '</li>'; }).join("");
                    }
                }
            })
            .catch(function () {
                if (btn) btn.disabled = false;
            });
        });
    }
});
