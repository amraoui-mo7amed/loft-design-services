var _optRowCounter = 0;

function syncCustomSelectDisplay(form) {
    form.querySelectorAll(".custom-select-wrapper").forEach(function (wrapper) {
        var input = wrapper.querySelector('input[type="hidden"]');
        var display = wrapper.querySelector('.custom-select-display');
        if (!input || !display) return;
        var val = input.value;
        var li = wrapper.querySelector('li[data-value="' + val.replace(/"/g, '\\"') + '"]');
        if (li) {
            display.innerHTML = li.textContent + '<span class="arrow"><i class="fas fa-caret-down"></i></span>';
        } else {
            display.innerHTML = (wrapper.querySelector('.custom-select-list li:first-child')?.textContent || 'Select') +
                '<span class="arrow"><i class="fas fa-caret-down"></i></span>';
        }
    });
}

function addOptionRow(container, data) {
    var template = container.querySelector("[data-template-row]");
    if (!template) return;
    var row = template.cloneNode(true);
    row.classList.remove("d-none");
    row.removeAttribute("data-template-row");
    _optRowCounter++;
    var uid = "optCat_" + _optRowCounter;
    var catWrapper = row.querySelector(".custom-select-wrapper");
    if (catWrapper) {
        catWrapper.id = uid;
        var hiddenInput = catWrapper.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.id = uid + "_input";
            var val = data && data.category_id ? String(data.category_id) : "";
            hiddenInput.value = val;
        }
    }
    // Populate fields
    var idInput = row.querySelector("input[name='option_ids']");
    if (idInput) idInput.value = (data && data.id) || "";
    var nameInput = row.querySelector("input[name='option_names']");
    if (nameInput) nameInput.value = (data && data.name) || "";
    var priceInput = row.querySelector("input[name='option_prices']");
    if (priceInput) priceInput.value = (data && data.price) || "";
    var descInput = row.querySelector("input[name='option_descriptions']");
    if (descInput) descInput.value = (data && data.description) || "";
    // Remove button
    var removeBtn = row.querySelector(".remove-option-row");
    if (removeBtn) {
        removeBtn.addEventListener("click", function () { row.remove(); });
    }
    container.appendChild(row);
    // Initialize custom selects in this row
    if (window.initCustomSelects) window.initCustomSelects();
    if (catWrapper) syncCustomSelectDisplay(row);
}

function clearOptionsContainer(container) {
    var rows = container.querySelectorAll(".pkg-option-row:not([data-template-row])");
    rows.forEach(function (r) { r.remove(); });
}

document.addEventListener("DOMContentLoaded", function () {
    // Add Option button
    document.addEventListener("click", function (e) {
        if (e.target.closest("#addOptionRow")) {
            var container = document.getElementById("optionsContainer");
            if (container) addOptionRow(container, null);
        }
    });

    // Create buttons
    document.querySelectorAll(".catalog-create-btn").forEach(function (btn) {
        var targetId = btn.getAttribute("data-bs-target");
        if (!targetId) return;
        var modal = document.querySelector(targetId);
        if (!modal) return;
        var form = modal.querySelector("form");
        if (!form) return;

        btn.addEventListener("click", function () {
            form.reset();
            form.action = this.dataset.createUrl || "";
            delete modal.dataset.existingImage;
            form.querySelectorAll("[data-default]").forEach(function (el) {
                if (el.type === "checkbox") el.checked = el.dataset.default === "true";
                else el.value = el.dataset.default || "";
            });
            var container = document.getElementById("optionsContainer");
            if (container) {
                clearOptionsContainer(container);
                addOptionRow(container, null);
            }
            if (window.initCustomSelects) window.initCustomSelects();
            syncCustomSelectDisplay(form);
            var list = form.querySelector("#errorList");
            if (list) list.innerHTML = "";
            modal.querySelector(".modal-title").textContent = this.dataset.modalTitle || "Create";
            var st = modal.querySelector(".catalog-submit-text");
            if (st) st.textContent = this.dataset.submitText || "Create";
            var mi = form.querySelector("[name='_method']");
            if (mi) mi.remove();
            new bootstrap.Modal(modal).show();
        });
    });

    // Edit buttons
    document.querySelectorAll(".catalog-edit-btn").forEach(function (btn) {
        var targetId = btn.getAttribute("data-bs-target");
        if (!targetId) return;
        var modal = document.querySelector(targetId);
        if (!modal) return;
        var form = modal.querySelector("form");
        if (!form) return;

        btn.addEventListener("click", function () {
            form.reset();
            form.action = this.dataset.updateUrl || "";
            modal.querySelector(".modal-title").textContent = this.dataset.modalTitle || "Edit";
            var st = modal.querySelector(".catalog-submit-text");
            if (st) st.textContent = this.dataset.submitText || "Save";
            var existingImage = null;
            form.querySelectorAll("[data-field]").forEach(function (el) {
                var key = el.dataset.field;
                var val = btn.dataset[key] !== undefined ? btn.dataset[key] : "";
                if (el.type === "checkbox") el.checked = val === "true" || val === "True";
                else if (el.type === "file") { /* skip */ }
                else el.value = val;
            });
            if (this.dataset.image_url) {
                existingImage = this.dataset.image_url;
                modal.dataset.existingImage = existingImage;
                var preview = modal.querySelector(".catalog-image-preview");
                if (preview) {
                    preview.innerHTML = '<img src="' + existingImage + '" style="max-height:120px;border-radius:8px;object-fit:cover;width:100%;">';
                }
            } else {
                delete modal.dataset.existingImage;
            }
            // Restore inline options
            var container = document.getElementById("optionsContainer");
            if (container) {
                clearOptionsContainer(container);
                var optsData = this.dataset.options;
                if (optsData) {
                    try {
                        var opts = JSON.parse(optsData);
                        if (opts.length === 0) {
                            addOptionRow(container, null);
                        } else {
                            opts.forEach(function (o) { addOptionRow(container, o); });
                        }
                    } catch (e) {
                        addOptionRow(container, null);
                    }
                } else {
                    addOptionRow(container, null);
                }
            }
            if (window.initCustomSelects) window.initCustomSelects();
            syncCustomSelectDisplay(form);
            var list = form.querySelector("#errorList");
            if (list) list.innerHTML = "";
            new bootstrap.Modal(modal).show();
        });
    });

    // Catalog image upload: click zone to hidden input
    document.addEventListener("click", function (e) {
        var zone = e.target.closest(".catalog-image-upload");
        if (zone) {
            var fileInput = zone.querySelector('input[type="file"]');
            if (fileInput) fileInput.click();
        }
    });

    document.addEventListener("change", function (e) {
        var fileInput = e.target.closest(".catalog-image-upload input[type='file']");
        if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
        var preview = fileInput.closest(".catalog-image-upload").querySelector(".catalog-image-preview");
        if (!preview) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            preview.innerHTML = '<img src="' + ev.target.result + '" style="max-height:120px;border-radius:8px;object-fit:cover;width:100%;">';
        };
        reader.readAsDataURL(this.files[0]);
    });

    // Reset preview + sync status badge on modal show
    document.querySelectorAll(".modal").forEach(function (modal) {
        modal.addEventListener("show.bs.modal", function () {
            this.querySelectorAll(".catalog-image-preview").forEach(function (preview) {
                if (modal.dataset.existingImage) return;
                preview.innerHTML =
                    '<i class="fas fa-cloud-upload-alt fa-3x text-muted mb-2"></i>' +
                    '<p class="small text-muted mb-0">Click to upload</p>' +
                    '<p class="small text-muted" style="font-size:0.7rem;">PNG, JPG up to 5MB</p>';
            });
            this.querySelectorAll(".form-check-input[data-field='active']").forEach(function (cb) {
                var badge = cb.closest("form").querySelector("#pkgStatusBadge, .insp-status-badge, .status-badge");
                if (badge) {
                    badge.textContent = cb.checked ? "Published" : "Draft";
                    badge.className = "badge rounded-pill " + (cb.checked ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary");
                }
            });
        });
    });

    // Sync status badge on checkbox change
    document.addEventListener("change", function (e) {
        var cb = e.target.closest(".form-check-input[data-field='active']");
        if (!cb) return;
        var badge = cb.closest("form").querySelector("#pkgStatusBadge, .insp-status-badge, .status-badge");
        if (badge) {
            badge.textContent = cb.checked ? "Published" : "Draft";
            badge.className = "badge rounded-pill " + (cb.checked ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary");
        }
    });
});
