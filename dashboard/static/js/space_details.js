document.addEventListener("DOMContentLoaded", function () {
    // ── Helper to retrieve valid CSRF token ──
    function getCsrfToken() {
        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input && input.value) return input.value;
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || "";
    }

    const container = document.querySelector(".space-management-container");
    const spaceId = container ? container.dataset.spaceId : "default";
    const storageKey = `loft_space_active_cat_${spaceId}`;

    // ── 1. Dynamic Category Tab Switcher & Session Recovery ──
    const allTabBtns = document.querySelectorAll(".cat-tab-btn");
    const activeCatNameDisplay = document.getElementById("activeCategoryNameDisplay");
    const activeCatCountBadge = document.getElementById("activeCategoryCountBadge");
    const activeUploadBtn = document.getElementById("activeUploadPhotosBtn");
    const activeEditBtn = document.getElementById("activeEditCategoryBtn");
    const activeDeleteBtn = document.getElementById("activeDeleteCategoryBtn");
    let currentActiveCatId = null;

    function selectCategory(catId, catName, catCount, uploadUrl, updateUrl, deleteUrl, saveState = true) {
        if (!catId) return;
        currentActiveCatId = String(catId);

        if (saveState) {
            try {
                localStorage.setItem(storageKey, currentActiveCatId);
                history.replaceState(null, null, `#category-${currentActiveCatId}`);
            } catch (e) {}
        }

        // Update active class on all category tab buttons
        allTabBtns.forEach(btn => {
            if (btn.dataset.catId === currentActiveCatId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Update header banner details
        if (activeCatNameDisplay && catName) activeCatNameDisplay.textContent = catName;
        if (activeCatCountBadge && catCount !== undefined) activeCatCountBadge.textContent = `${catCount} photos`;

        // Update banner actions dataset
        if (activeUploadBtn) {
            activeUploadBtn.dataset.catId = currentActiveCatId;
            if (uploadUrl) activeUploadBtn.dataset.uploadUrl = uploadUrl;
        }
        if (activeEditBtn) {
            activeEditBtn.dataset.catId = currentActiveCatId;
            if (catName) activeEditBtn.dataset.catName = catName;
            if (updateUrl) activeEditBtn.dataset.updateUrl = updateUrl;
        }
        if (activeDeleteBtn) {
            activeDeleteBtn.dataset.catId = currentActiveCatId;
            if (catName) activeDeleteBtn.dataset.catName = catName;
            if (deleteUrl) activeDeleteBtn.dataset.deleteUrl = deleteUrl;
        }

        // Show only the selected category gallery view
        document.querySelectorAll(".category-gallery-view").forEach(view => {
            if (view.dataset.catId === currentActiveCatId) {
                view.style.display = "block";
            } else {
                view.style.display = "none";
            }
        });
    }

    // Attach click handlers to all category tab buttons
    allTabBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const catId = this.dataset.catId;
            const catName = this.dataset.catName;
            const catCount = this.dataset.catCount || "0";
            const uploadUrl = this.dataset.uploadUrl;
            const updateUrl = this.dataset.updateUrl;
            const deleteUrl = this.dataset.deleteUrl;
            selectCategory(catId, catName, catCount, uploadUrl, updateUrl, deleteUrl, true);
        });
    });

    // ── Recover Recent Active Category Tab on Page Load ──
    function recoverActiveCategory() {
        if (allTabBtns.length === 0) return;

        let targetCatId = null;

        // 1. Check URL hash (e.g. #category-12 or #cat-12)
        const hash = window.location.hash;
        if (hash) {
            const match = hash.match(/category-(\d+)/) || hash.match(/cat-(\d+)/);
            if (match && match[1]) {
                targetCatId = match[1];
            }
        }

        // 2. Check localStorage if no URL hash
        if (!targetCatId) {
            try {
                targetCatId = localStorage.getItem(storageKey);
            } catch (e) {}
        }

        // 3. Find button matching targetCatId
        let matchedBtn = null;
        if (targetCatId) {
            matchedBtn = Array.from(allTabBtns).find(btn => btn.dataset.catId === String(targetCatId));
        }

        // 4. Fallback to current active or first button
        if (!matchedBtn) {
            matchedBtn = document.querySelector(".cat-tab-btn.active") || allTabBtns[0];
        }

        if (matchedBtn) {
            selectCategory(
                matchedBtn.dataset.catId,
                matchedBtn.dataset.catName,
                matchedBtn.dataset.catCount || "0",
                matchedBtn.dataset.uploadUrl,
                matchedBtn.dataset.updateUrl,
                matchedBtn.dataset.deleteUrl,
                false
            );
        }
    }

    recoverActiveCategory();

    // ── 2. Custom JS Code to Save Images into Category ──
    function uploadFilesToCategory(catId, files) {
        if (!files || files.length === 0) return;

        const form = document.getElementById(`catForm-${catId}`);
        if (!form) return;

        try {
            localStorage.setItem(storageKey, String(catId));
        } catch (e) {}

        Swal.fire({
            title: "Uploading photos...",
            text: `Saving ${files.length} photo(s) into category...`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const csrfToken = getCsrfToken();
        const formData = new FormData();
        formData.append("csrfmiddlewaretoken", csrfToken);
        for (let i = 0; i < files.length; i++) {
            formData.append("gallery_images", files[i]);
        }

        fetch(form.action, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
                "X-Requested-With": "XMLHttpRequest",
            },
            body: formData,
        })
        .then(async r => {
            if (!r.ok) {
                const text = await r.text();
                let errMsg = "Upload failed";
                try {
                    const errData = JSON.parse(text);
                    if (errData.errors) errMsg = errData.errors[0];
                } catch (e) {}
                throw new Error(errMsg);
            }
            return r.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: data.message,
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Upload Failed",
                    text: data.errors ? data.errors[0] : "Could not upload photos.",
                });
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: err.message || "Network error occurred while uploading photos.",
            });
        });
    }

    // Banner "Upload Photos" button
    if (activeUploadBtn) {
        activeUploadBtn.addEventListener("click", function () {
            const catId = this.dataset.catId || currentActiveCatId;
            const form = document.getElementById(`catForm-${catId}`);
            if (form) {
                const fileInput = form.querySelector(".cat-images-input");
                if (fileInput) fileInput.click();
            }
        });
    }

    // Dropzone triggers & drag/drop handlers
    document.querySelectorAll(".dropzone-trigger").forEach(dropzone => {
        const catId = dropzone.dataset.catId;
        const form = document.getElementById(`catForm-${catId}`);
        const fileInput = form ? form.querySelector(".cat-images-input") : null;

        dropzone.addEventListener("click", function () {
            if (fileInput) fileInput.click();
        });

        // Drag and drop listeners
        dropzone.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove("dragover");
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                uploadFilesToCategory(catId, files);
            }
        });
    });

    // File input change handler
    document.querySelectorAll(".cat-images-input").forEach(input => {
        input.addEventListener("change", function () {
            if (this.files && this.files.length > 0) {
                const catId = this.dataset.catId;
                uploadFilesToCategory(catId, this.files);
            }
        });
    });

    // ── 3. Edit Category Modal ──
    const editCatModalEl = document.getElementById("editCategoryModal");
    let editCatModal = null;
    if (editCatModalEl && typeof bootstrap !== "undefined") {
        editCatModal = new bootstrap.Modal(editCatModalEl);
    }

    const editCategoryForm = document.getElementById("editCategoryForm");
    const editCategoryNameInput = document.getElementById("editCategoryNameInput");

    function openEditCategoryModal(catId, catName, updateUrl) {
        if (editCategoryForm) {
            editCategoryForm.action = updateUrl;
            editCategoryForm.dataset.catId = catId;
            if (editCategoryNameInput) editCategoryNameInput.value = catName;
            const errList = editCategoryForm.querySelector("#errorList");
            if (errList) errList.innerHTML = "";
        }
        if (editCatModal) editCatModal.show();
    }

    if (activeEditBtn) {
        activeEditBtn.addEventListener("click", function () {
            const catId = this.dataset.catId || currentActiveCatId;
            const catName = this.dataset.catName || "";
            const updateUrl = this.dataset.updateUrl || "";
            openEditCategoryModal(catId, catName, updateUrl);
        });
    }

    if (editCategoryForm) {
        editCategoryForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const csrfToken = getCsrfToken();
            const formData = new FormData(editCategoryForm);
            formData.set("csrfmiddlewaretoken", csrfToken);

            try {
                const res = await fetch(editCategoryForm.action, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    if (editCatModal) editCatModal.hide();
                    Swal.fire({
                        icon: "success",
                        title: data.message,
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    const errList = editCategoryForm.querySelector("#errorList");
                    if (errList && data.errors) {
                        errList.innerHTML = data.errors.map(err => `<li class="alert alert-danger mb-2">${err}</li>`).join("");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // ── 4. Delete Category ──
    function confirmDeleteCategory(url, name) {
        const csrfToken = getCsrfToken();
        Swal.fire({
            title: "Delete Category?",
            text: `Are you sure you want to delete category "${name}" and all its photos? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "var(--brand-danger, #dc3545)",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "swal-glass"
            }
        }).then(async result => {
            if (!result.isConfirmed) return;
            const formData = new FormData();
            formData.append("csrfmiddlewaretoken", csrfToken);
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    try {
                        localStorage.removeItem(storageKey);
                    } catch (e) {}
                    Swal.fire({
                        icon: "success",
                        title: data.message,
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => {
                        if (data.redirect_url) window.location.href = data.redirect_url;
                        else window.location.reload();
                    });
                } else {
                    Swal.fire({ icon: "error", title: "Error", text: data.errors ? data.errors[0] : "Failed to delete" });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    if (activeDeleteBtn) {
        activeDeleteBtn.addEventListener("click", function () {
            const url = this.dataset.deleteUrl;
            const name = this.dataset.catName;
            confirmDeleteCategory(url, name);
        });
    }

    // ── 5. Set Default Photo Button (No Checkbox) ──
    document.querySelectorAll(".set-default-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            const url = this.dataset.defaultUrl;
            const csrfToken = this.dataset.csrf || getCsrfToken();

            const result = await Swal.fire({
                title: "Set as Default Photo?",
                text: "This photo will be displayed as the main thumbnail for this space and category.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "var(--brand-primary)",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, set default",
                cancelButtonText: "Cancel",
                customClass: {
                    popup: "swal-glass"
                }
            });

            if (!result.isConfirmed) return;

            const formData = new FormData();
            formData.append("csrfmiddlewaretoken", csrfToken);

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                });
                if (!res.ok) {
                    const text = await res.text();
                    let errMsg = "Failed to set default";
                    try {
                        const errData = JSON.parse(text);
                        if (errData.errors) errMsg = errData.errors[0];
                    } catch (e) {}
                    Swal.fire({ icon: "error", title: "Error", text: errMsg });
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: data.message,
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({ icon: "error", title: "Error", text: data.errors ? data.errors[0] : "Failed to set default" });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ icon: "error", title: "Error", text: "Network error occurred." });
            }
        });
    });

    // ── 6. Edit Photo Details Modal ──
    const editModalEl = document.getElementById("imageEditModal");
    let editModal = null;
    if (editModalEl && typeof bootstrap !== "undefined") {
        editModal = new bootstrap.Modal(editModalEl);
    }

    const editForm = document.getElementById("imageEditForm");
    const modalImgPreview = document.getElementById("modalImgPreview");
    const modalImgTags = document.getElementById("modalImgTags");
    const modalImgDesc = document.getElementById("modalImgDesc");

    document.querySelectorAll(".open-img-modal-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const imgId = this.dataset.imgId;
            const tags = this.dataset.tags || "";
            const desc = this.dataset.description || "";
            const updateUrl = this.dataset.updateUrl;
            const imgUrl = this.dataset.imgUrl;

            if (editForm) {
                editForm.action = updateUrl;
                editForm.dataset.imgId = imgId;
                if (modalImgPreview) modalImgPreview.src = imgUrl;
                if (modalImgTags) modalImgTags.value = tags;
                if (modalImgDesc) modalImgDesc.value = desc;

                const errorList = editForm.querySelector("#errorList");
                if (errorList) errorList.innerHTML = "";
            }

            if (editModal) editModal.show();
        });
    });

    if (editForm) {
        editForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById("saveImageDetailsBtn");
            const originalText = submitBtn.innerHTML;
            const imgId = editForm.dataset.imgId;
            const csrfToken = getCsrfToken();
            const formData = new FormData(editForm);
            formData.set("csrfmiddlewaretoken", csrfToken);

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

            try {
                const response = await fetch(editForm.action, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });
                const data = await response.json();

                if (data.success) {
                    const tagsEl = document.getElementById(`tags-display-${imgId}`);
                    const descEl = document.getElementById(`desc-display-${imgId}`);
                    const editBtn = document.querySelector(`.open-img-modal-btn[data-img-id="${imgId}"]`);

                    if (tagsEl) {
                        tagsEl.innerHTML = data.tags ? `<i class="fas fa-tags me-1 text-warning"></i>${data.tags}` : `<i class="fas fa-tags me-1"></i>No tags`;
                        if (data.tags) tagsEl.className = "sd-tags-pill text-truncate mb-1";
                        else tagsEl.className = "sd-tags-pill text-muted fst-italic mb-1";
                    }

                    if (descEl) {
                        descEl.textContent = data.description || "No description";
                        if (data.description) descEl.className = "sd-desc-snip text-truncate mb-0";
                        else descEl.className = "sd-desc-snip text-muted fst-italic mb-0";
                    }

                    if (editBtn) {
                        editBtn.dataset.tags = data.tags || "";
                        editBtn.dataset.description = data.description || "";
                    }

                    if (editModal) editModal.hide();

                    Swal.fire({
                        icon: "success",
                        title: data.message || "Updated successfully",
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                } else {
                    const errorList = editForm.querySelector("#errorList");
                    if (errorList && data.errors) {
                        errorList.innerHTML = data.errors.map(err => `<li class="alert alert-danger mb-2">${err}</li>`).join("");
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ── 7. Delete Photo ──
    document.querySelectorAll(".delete-img-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            const url = this.dataset.deleteUrl;
            const imgId = this.dataset.imageId;
            const csrfToken = getCsrfToken();

            const result = await Swal.fire({
                title: "Delete Photo?",
                text: "This photo will be permanently removed from the space gallery.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "var(--brand-danger, #dc3545)",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
                customClass: {
                    popup: "swal-glass"
                }
            });

            if (!result.isConfirmed) return;

            const formData = new FormData();
            formData.append("csrfmiddlewaretoken", csrfToken);
            formData.append("image_id", imgId);

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    const card = document.getElementById(`image-card-${imgId}`);
                    if (card) {
                        card.style.transition = "all 0.3s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.8)";
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                    }
                    Swal.fire({
                        icon: "success",
                        title: data.message,
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({ icon: "error", title: "Error", text: data.errors ? data.errors[0] : "Failed to delete" });
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
});
