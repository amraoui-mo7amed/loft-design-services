document.addEventListener("DOMContentLoaded", function () {
    // ── Edit Space modal ──────────────────────────────────────────
    var spaceModal = document.getElementById("spaceModal");
    var spaceForm = document.getElementById("spaceForm");
    if (spaceModal && spaceForm) {
        var titleEl = spaceModal.querySelector(".modal-title");
        var submitText = spaceModal.querySelector(".catalog-submit-text");
        var editThumb = document.getElementById("editThumbPreview");
        var editThumbSection = document.getElementById("editThumbSection");
        var createGallerySection = document.getElementById("createGallerySection");
        var spaceGalleryUpload = document.getElementById("spaceGalleryUpload");
        var spaceGalleryInput = document.getElementById("spaceGalleryInput");
        var spaceGalleryPreview = document.getElementById("spaceGalleryPreview");

        function clearFormErrors() {
            var list = spaceForm.querySelector("#errorList");
            if (list) list.innerHTML = "";
        }

        function resetEditModal() {
            spaceForm.reset();
            clearFormErrors();
            editThumb.innerHTML = '<i class="fas fa-door-open"></i>';
            spaceGalleryPreview.innerHTML = "";
            createGallerySection.classList.add("d-none");
            editThumbSection.classList.remove("d-none");
        }

        // Add Space button
        var addBtn = document.getElementById("addSpaceBtn");
        if (addBtn) {
            addBtn.addEventListener("click", function () {
                resetEditModal();
                editThumbSection.classList.add("d-none");
                createGallerySection.classList.remove("d-none");
                spaceForm.action = this.dataset.createUrl;
                titleEl.textContent = "New Space";
                submitText.textContent = "Create";
                new bootstrap.Modal(spaceModal).show();
            });
        }

        // Edit Space buttons
        document.addEventListener("click", function (e) {
            var btn = e.target.closest(".space-edit-btn");
            if (!btn) return;
            resetEditModal();
            spaceForm.action = btn.dataset.updateUrl;
            titleEl.textContent = "Edit Space";
            submitText.textContent = "Save";
            // Editing must never resubmit the creation gallery uploader
            if (spaceGalleryInput) spaceGalleryInput.value = "";
            spaceForm.querySelector("input[name='name']").value = btn.dataset.name || "";
            spaceForm.querySelector("input[name='base_price']").value = btn.dataset.base_price || "0";
            if (btn.dataset.thumbnail) {
                editThumb.innerHTML = '<img src="' + btn.dataset.thumbnail + '" alt="">';
            }
            new bootstrap.Modal(spaceModal).show();
        });

        // Upload widget click -> file input
        spaceGalleryUpload.addEventListener("click", function () {
            spaceGalleryInput.click();
        });

        // Preview newly selected files
        spaceGalleryInput.addEventListener("change", function () {
            spaceGalleryPreview.innerHTML = "";
            var files = Array.from(this.files);
            files.forEach(function (file) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    var col = document.createElement("div");
                    col.className = "col-4 col-md-3";
                    var img = document.createElement("img");
                    img.src = ev.target.result;
                    img.className = "ptd-gallery-thumb";
                    img.alt = "";
                    col.appendChild(img);
                    spaceGalleryPreview.appendChild(col);
                };
                reader.readAsDataURL(file);
            });
        });

        // AJAX submit (space create/update basic fields)
        spaceForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var fd = new FormData(spaceForm);
            // Only the create flow should upload gallery images; edit relies on the Gallery modal.
            if (createGallerySection && createGallerySection.classList.contains("d-none")) {
                fd.delete("gallery_images");
            }
            var submitBtn = spaceForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            fetch(spaceForm.action, {
                method: "POST",
                headers: { "X-CSRFToken": fd.get("csrfmiddlewaretoken"), "X-Requested-With": "XMLHttpRequest" },
                body: fd,
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    submitBtn.disabled = false;
                    if (data.success) {
                        Swal.fire({
                            title: "Success",
                            text: data.message || "Saved successfully",
                            icon: "success",
                            confirmButtonText: "OK",
                            buttonsStyling: false,
                            customClass: { confirmButton: "btn btn-primary px-4" },
                        }).then(function () {
                            window.location.href = data.redirect_url || window.location.href;
                        });
                    } else {
                        showErrors(spaceForm, data.errors);
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    showErrors(spaceForm, ["Connection failed"]);
                });
        });
    }

    // ── Gallery management modal ──────────────────────────────────
    var galleryModal = document.getElementById("galleryModal");
    var galleryForm = document.getElementById("galleryForm");
    if (galleryModal && galleryForm) {
        var grid = document.getElementById("galleryModalGrid");
        var newPreview = document.getElementById("galleryNewPreview");
        var galleryAddBtn = document.getElementById("galleryAddBtn");
        var galleryInput = document.getElementById("galleryImagesInput");
        var galleryTitle = document.getElementById("galleryModalTitle");
        var activeGalleryBtn = null;
        var activeEditBtn = null;

        function clearGalleryErrors() {
            var list = galleryForm.querySelector("#errorList");
            if (list) list.innerHTML = "";
        }

        function resetGalleryModal() {
            grid.innerHTML = "";
            newPreview.innerHTML = "";
            galleryInput.value = "";
            clearGalleryErrors();
        }

        function showErrors(form, errors) {
            var el = form.querySelector("#errorList");
            if (!el) return;
            el.innerHTML = "";
            var errs = Array.isArray(errors) ? errors : Object.values(errors || {}).flat();
            errs.forEach(function (m) {
                var li = document.createElement("li");
                li.textContent = m;
                li.className = "alert alert-warning mb-2";
                el.appendChild(li);
            });
        }

        function buildGrid(images) {
            grid.innerHTML = "";
            if (!images || !images.length) {
                grid.innerHTML = '<div class="col-12 text-center text-muted py-4">No gallery images yet.</div>';
                return;
            }
            images.forEach(function (img) {
                var isThumb = img.is_thumbnail === true;
                var col = document.createElement("div");
                col.className = "col-12 col-md-6";
                col.innerHTML =
                    '<div class="ptd-gallery-view-wrap position-relative p-2 border rounded-3 mb-3" style="background: rgba(255,255,255,0.03);">' +
                      '<div class="row g-2">' +
                        '<div class="col-4">' +
                          '<div class="position-relative" style="aspect-ratio: 1/1; overflow: hidden; border-radius: 8px;">' +
                            '<img src="' + img.url + '" alt="" class="ptd-gallery-view-img w-100 h-100' + (isThumb ? " ptd-gallery-view-img--active" : "") + '" style="object-fit: cover;" loading="lazy">' +
                            (isThumb ? '<span class="ptd-thumb-badge--view" style="font-size:0.6rem; padding:2px 4px;">Thumbnail</span>' : "") +
                            '<div class="form-check ptd-thumb-select">' +
                              '<input class="form-check-input ptd-thumb-radio" type="radio" name="thumbnail_image_id" value="' + img.id + '" id="gthumb_' + img.id + '"' + (isThumb ? " checked" : "") + ">" +
                              '<label class="form-check-label" for="gthumb_' + img.id + '" title="Set as default"></label>' +
                            '</div>' +
                            '<button type="button" class="ptd-gallery-del" data-img-id="' + img.id + '" title="Delete"><i class="fas fa-trash"></i></button>' +
                          '</div>' +
                        '</div>' +
                        '<div class="col-8 d-flex flex-column justify-content-between">' +
                          '<div>' +
                            '<div class="mb-2">' +
                              '<label class="form-label mb-0" style="font-size:0.75rem;">Description</label>' +
                              '<input type="text" name="description_' + img.id + '" class="form-control form-control-sm" value="' + (img.description || "") + '" placeholder="Image description...">' +
                            '</div>' +
                            '<div>' +
                              '<label class="form-label mb-0" style="font-size:0.75rem;">Tags (comma separated)</label>' +
                              '<input type="text" name="tags_' + img.id + '" class="form-control form-control-sm" value="' + (img.tags || "") + '" placeholder="e.g. modern, lighting, wood">' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>';
                grid.appendChild(col);
            });
        }

        function syncGalleryButtons(images) {
            if (!activeGalleryBtn) return;
            activeGalleryBtn.dataset.gallery = JSON.stringify(images);
            var thumb = null;
            images.forEach(function (img) {
                if (img.is_thumbnail) thumb = img.url;
            });
            if (thumb) {
                activeGalleryBtn.dataset.thumbnail = thumb;
                if (activeEditBtn) activeEditBtn.dataset.thumbnail = thumb;
            }
        }

        // Open gallery modal
        document.addEventListener("click", function (e) {
            var btn = e.target.closest(".space-gallery-btn");
            if (!btn) return;
            resetGalleryModal();
            activeGalleryBtn = btn;
            activeEditBtn = document.querySelector('.space-edit-btn[data-update-url="' + (btn.dataset.updateUrl || "") + '"]');
            galleryForm.action = btn.dataset.updateUrl || "";
            galleryTitle.textContent = btn.dataset.name || "";
            try {
                buildGrid(JSON.parse(btn.dataset.gallery));
            } catch (err) {
                buildGrid([]);
            }
            new bootstrap.Modal(galleryModal).show();
        });

        // Default thumbnail single-select (radio) + highlight
        document.addEventListener("change", function (e) {
            var cb = e.target.closest(".ptd-thumb-radio");
            if (!cb || cb.closest("#galleryModal") === null) return;
            var images = [];
            grid.querySelectorAll(".ptd-gallery-view-wrap").forEach(function (wrap) {
                var radio = wrap.querySelector(".ptd-thumb-radio");
                var img = wrap.querySelector(".ptd-gallery-view-img");
                var badge = wrap.querySelector(".ptd-thumb-badge--view");
                var isSel = radio === cb && cb.checked;
                img.classList.toggle("ptd-gallery-view-img--active", isSel);
                var imgContainer = img.parentElement;
                if (isSel && !badge) {
                    var b = document.createElement("span");
                    b.className = "ptd-thumb-badge--view";
                    b.style.cssText = "font-size:0.6rem; padding:2px 4px;";
                    b.innerHTML = 'Thumbnail';
                    imgContainer.insertBefore(b, imgContainer.firstChild);
                } else if (!isSel && badge) {
                    badge.remove();
                }
                var descInput = wrap.querySelector('input[name="description_' + radio.value + '"]');
                var tagsInput = wrap.querySelector('input[name="tags_' + radio.value + '"]');
                images.push({
                    id: parseInt(radio.value, 10),
                    url: img.src,
                    is_thumbnail: isSel,
                    description: descInput ? descInput.value : "",
                    tags: tagsInput ? tagsInput.value : ""
                });
            });
            syncGalleryButtons(images);
        });

        // Add Images header button -> file input
        galleryAddBtn.addEventListener("click", function () {
            galleryInput.click();
        });

        // Preview newly selected files
        galleryInput.addEventListener("change", function () {
            newPreview.innerHTML = "";
            var files = Array.from(this.files);
            files.forEach(function (file) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    var col = document.createElement("div");
                    col.className = "col-4 col-md-3";
                    var img = document.createElement("img");
                    img.src = ev.target.result;
                    img.className = "ptd-gallery-thumb";
                    img.alt = "";
                    col.appendChild(img);
                    newPreview.appendChild(col);
                };
                reader.readAsDataURL(file);
            });
        });

        // Delete image directly (icon button)
        grid.addEventListener("click", function (e) {
            var btn = e.target.closest(".ptd-gallery-del");
            if (!btn) return;
            var imgId = btn.dataset.imgId;
            var delBase = (activeGalleryBtn && activeGalleryBtn.dataset.delBase) || "";
            Swal.fire({
                title: "Delete image?",
                text: "This image will be removed permanently.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                buttonsStyling: false,
                customClass: { confirmButton: "btn btn-danger px-4", cancelButton: "btn btn-light px-4" },
            }).then(function (result) {
                if (!result.isConfirmed) return;
                var fd = new FormData();
                fd.append("image_id", imgId);
                fd.append("csrfmiddlewaretoken", galleryForm.querySelector("input[name='csrfmiddlewaretoken']").value);
                fetch(delBase, {
                    method: "POST",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    body: fd,
                })
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        if (data.success) {
                            buildGrid(data.gallery || []);
                            syncGalleryButtons(data.gallery || []);
                        } else {
                            clearGalleryErrors();
                            showErrors(galleryForm, data.errors);
                        }
                    })
                    .catch(function () {
                        clearGalleryErrors();
                        showErrors(galleryForm, ["Connection failed"]);
                    });
            });
        });

        // AJAX submit gallery changes (upload + default thumbnail)
        galleryForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var fd = new FormData(galleryForm);
            var submitBtn = galleryForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            fetch(galleryForm.action, {
                method: "POST",
                headers: { "X-CSRFToken": fd.get("csrfmiddlewaretoken"), "X-Requested-With": "XMLHttpRequest" },
                body: fd,
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    submitBtn.disabled = false;
                    if (data.success) {
                        Swal.fire({
                            title: "Success",
                            text: data.message || "Gallery updated",
                            icon: "success",
                            confirmButtonText: "OK",
                            buttonsStyling: false,
                            customClass: { confirmButton: "btn btn-primary px-4" },
                        }).then(function () {
                            window.location.href = data.redirect_url || window.location.href;
                        });
                    } else {
                        clearGalleryErrors();
                        showErrors(galleryForm, data.errors);
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    clearGalleryErrors();
                    showErrors(galleryForm, ["Connection failed"]);
                });
        });
    }
});
