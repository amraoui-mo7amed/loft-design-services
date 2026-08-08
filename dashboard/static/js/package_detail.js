document.addEventListener("DOMContentLoaded", function () {
    var optionsList = document.getElementById("optionsList");

    function fmt(n) {
        return Math.round(Number(n) || 0).toString();
    }

    function updateOptionCount(count) {
        var el = document.getElementById("optCountBadge");
        if (el) el.textContent = count;
    }

    function showErrors(form, data) {
        var errorList = form.querySelector("#errorList");
        if (errorList && data.errors) {
            var items = Array.isArray(data.errors) ? data.errors : Object.values(data.errors).flat();
            errorList.innerHTML = items.map(function (m) { return '<li class="alert-danger">' + m + '</li>'; }).join("");
        }
    }

    // Edit option via SweetAlert-free modal
    if (optionsList) {
        optionsList.addEventListener("click", function (e) {
            var btn = e.target.closest(".option-edit-btn");
            if (!btn) return;
            var card = btn.closest("[data-opt-id]");
            if (!card) return;
            var optId = card.dataset.optId;
            var updateUrl = (optionsList.dataset.updateUrl || "").replace("0", optId);
            document.getElementById("editOptionForm").action = updateUrl;
            document.getElementById("editOptionId").value = optId;
            document.getElementById("editOptionName").value = btn.dataset.name || "";
            document.getElementById("editOptionDescription").value = btn.dataset.description || "";
            document.getElementById("editOptionPrice").value = btn.dataset.price || "";
            var errorList = document.getElementById("editOptionForm").querySelector("#errorList");
            if (errorList) errorList.innerHTML = "";
            var modal = new bootstrap.Modal(document.getElementById("editOptionModal"));
            modal.show();
        });
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
                        if (data.new_package_total !== undefined) {
                            var totalEl = document.getElementById("detailTotalPrice");
                            if (totalEl) totalEl.textContent = data.new_package_total;
                        }
                        if (!optionsList.querySelector("[data-opt-id]")) {
                            optionsList.innerHTML = '<div class="text-center py-4" id="emptyOptions"><p class="small text-muted mb-0">' + (optionsList.dataset.emptyText || "No options yet. Add one to get started.") + '</p></div>';
                        }
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
                    var price = data.price ? parseFloat(data.price) : 0;
                    var priceHtml = '<span class="badge rounded-pill ms-2" style="font-size:0.65rem;background:rgba(255,214,90,0.12);color:#b8860b;">' + fmt(price) + ' DA</span>';
                    card.innerHTML =
                        '<div class="d-flex align-items-start justify-content-between gap-2">' +
                            '<div class="flex-grow-1">' +
                                '<div class="fw-semibold" style="font-size:0.85rem;">' + data.option.name + priceHtml + '</div>' +
                                '<div class="d-flex align-items-center gap-3 mt-1">' +
                                    catHtml +
                                    (data.option.description ? '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-align-left me-1"></i>' + data.option.description + '</span>' : "") +
                                '</div>' +
                            '</div>' +
                            '<div class="d-flex align-items-center gap-2 flex-shrink-0">' +
                                '<button type="button" class="btn btn-sm option-edit-btn flex-shrink-0" title="Edit" data-name="" data-description="" data-price="' + price + '" style="border:1px solid #e9ecef;color:#495057;background:#fff;border-radius:4px;padding:0.2rem 0.45rem;font-size:0.65rem;"><i class="fas fa-pen"></i></button>' +
                                '<button type="button" class="btn btn-sm option-delete-btn flex-shrink-0" title="Remove" style="border:1px solid #e9ecef;color:#adb5bd;background:#fff;border-radius:4px;padding:0.2rem 0.45rem;font-size:0.65rem;"><i class="fas fa-times"></i></button>' +
                            '</div>' +
                        '</div>';
                    card.querySelector(".option-edit-btn").dataset.name = data.option.name;
                    card.querySelector(".option-edit-btn").dataset.description = data.option.description || "";
                    if (list) list.appendChild(card);
                    updateOptionCount(data.option_count);

                    var totalEl = document.getElementById("detailTotalPrice");
                    if (totalEl) totalEl.textContent = fmt(data.new_package_total) + " DA";
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
                    showErrors(form, data);
                }
            })
            .catch(function () {
                if (btn) btn.disabled = false;
            });
        });
    }

    // Edit option via AJAX
    var editForm = document.getElementById("editOptionForm");
    if (editForm) {
        editForm.addEventListener("submit", function (e) {
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
                    var optId = document.getElementById("editOptionId").value;
                    var card = document.querySelector("#optionsList .option-card[data-opt-id='" + optId + "']");
                    var list = document.getElementById("optionsList");
                    if (card && list) {
                        var price = data.price ? parseFloat(data.price) : 0;
var priceHtml = '<span class="badge rounded-pill ms-2" style="font-size:0.65rem;background:rgba(255,214,90,0.12);color:#b8860b;">' + fmt(price) + ' DA</span>';
                        var descChip = data.option.description
                            ? '<span class="small" style="font-size:0.72rem;color:#868e96;"><i class="fas fa-align-left me-1"></i>' + data.option.description + '</span>'
                            : "";
                        var descHtml = data.option.description
                            ? '<div class="mt-1 option-desc-text">' + descChip + '</div>'
                            : "";
                        var newCard = document.createElement("div");
                        newCard.className = "border rounded-2 p-3 option-card";
                        newCard.dataset.optId = optId;
                        newCard.innerHTML =
                            '<div class="d-flex align-items-start justify-content-between gap-2">' +
                                '<div class="flex-grow-1">' +
                                    '<div class="fw-semibold" style="font-size:0.85rem;">' + data.option.name + priceHtml + '</div>' +
                                    descHtml +
                                '</div>' +
                                '<div class="d-flex align-items-center gap-2 flex-shrink-0">' +
                                    '<button type="button" class="btn btn-sm option-edit-btn flex-shrink-0" title="Edit" data-name="' + data.option.name + '" data-description="' + (data.option.description || "") + '" data-price="' + price + '" style="border:1px solid #e9ecef;color:#495057;background:#fff;border-radius:4px;padding:0.2rem 0.45rem;font-size:0.65rem;"><i class="fas fa-pen"></i></button>' +
                                    '<button type="button" class="btn btn-sm option-delete-btn flex-shrink-0" title="Remove" style="border:1px solid #e9ecef;color:#adb5bd;background:#fff;border-radius:4px;padding:0.2rem 0.45rem;font-size:0.65rem;"><i class="fas fa-times"></i></button>' +
                                '</div>' +
                            '</div>';
                        card.replaceWith(newCard);
                    }

                    var totalEl = document.getElementById("detailTotalPrice");
                    if (totalEl) totalEl.textContent = fmt(data.new_package_total) + " DA";
                    var modalEl = document.getElementById("editOptionModal");
                    var modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    form.reset();
                    Swal.fire({ title: "Saved!", icon: "success", timer: 1000, showConfirmButton: false });
                } else {
                    showErrors(form, data);
                }
            })
            .catch(function () {
                if (btn) btn.disabled = false;
            });
        });
    }
});
