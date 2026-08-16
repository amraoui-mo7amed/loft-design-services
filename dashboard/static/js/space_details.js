document.addEventListener("DOMContentLoaded", function () {
    // 1. Bulk Upload Drag and Drop & File Counter
    const dropZone = document.getElementById("dropZone");
    const bulkFileInput = document.getElementById("bulkFileInput");
    const countDisplay = document.getElementById("fileSelectedCount");

    if (dropZone && bulkFileInput) {
        dropZone.addEventListener("click", () => bulkFileInput.click());

        ["dragenter", "dragover"].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add("dragover");
            }, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove("dragover");
            }, false);
        });

        dropZone.addEventListener("drop", (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length) {
                bulkFileInput.files = files;
                updateFileCount();
            }
        });

        bulkFileInput.addEventListener("change", updateFileCount);

        function updateFileCount() {
            const count = bulkFileInput.files ? bulkFileInput.files.length : 0;
            if (count > 0) {
                countDisplay.textContent = `${count} image${count > 1 ? "s" : ""} selected for upload`;
                countDisplay.classList.remove("d-none");
            } else {
                countDisplay.classList.add("d-none");
            }
        }
    }

    // 2. Image Edit Modal Interaction
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

            editForm.action = updateUrl;
            editForm.dataset.imgId = imgId;
            modalImgPreview.src = imgUrl;
            modalImgTags.value = tags;
            modalImgDesc.value = desc;

            const errorList = editForm.querySelector("#errorList");
            if (errorList) errorList.innerHTML = "";

            if (editModal) editModal.show();
        });
    });

    // Handle Image Edit Form Submission via AJAX
    if (editForm) {
        editForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById("saveImageDetailsBtn");
            const originalText = submitBtn.innerHTML;
            const imgId = editForm.dataset.imgId;
            const formData = new FormData(editForm);

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

            try {
                const response = await fetch(editForm.action, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });
                const data = await response.json();

                if (data.success) {
                    // Update DOM metadata
                    const tagsEl = document.getElementById(`tags-display-${imgId}`);
                    const descEl = document.getElementById(`desc-display-${imgId}`);
                    const editBtn = document.querySelector(`.open-img-modal-btn[data-img-id="${imgId}"]`);

                    if (tagsEl) {
                        tagsEl.innerHTML = data.tags ? `<i class="fas fa-tags me-1 text-warning"></i>${data.tags}` : `<i class="fas fa-tags me-1"></i>No tags`;
                        if (data.tags) tagsEl.className = "sd-tags-list text-truncate";
                        else tagsEl.className = "sd-tags-list text-muted fst-italic";
                    }

                    if (descEl) {
                        descEl.textContent = data.description || "No description";
                        if (data.description) descEl.className = "sd-desc-text text-truncate mb-0";
                        else descEl.className = "sd-desc-text text-muted fst-italic mb-0";
                    }

                    if (editBtn) {
                        editBtn.dataset.tags = data.tags || "";
                        editBtn.dataset.description = data.description || "";
                    }

                    if (editModal) editModal.hide();

                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "success",
                            title: data.message || "Updated successfully",
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true,
                        });
                    }
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

    // 3. Set as Thumbnail via AJAX
    document.querySelectorAll(".set-thumb-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            const url = this.dataset.thumbUrl;
            const csrf = this.dataset.csrf;

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRFToken": csrf,
                    },
                });
                const data = await response.json();

                if (data.success) {
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "success",
                            title: data.message || "Thumbnail updated",
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        window.location.reload();
                    }
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    // 4. Delete Image via SweetAlert AJAX
    document.querySelectorAll(".delete-img-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const url = this.dataset.deleteUrl;
            const imageId = this.dataset.imageId;
            const csrf = this.dataset.csrf;

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    title: "Delete image?",
                    text: "This image will be permanently removed from this space.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ef4444",
                    cancelButtonColor: "#6b7280",
                    confirmButtonText: "Yes, delete",
                    cancelButtonText: "Cancel",
                    background: "#1e1e1e",
                    color: "#ffffff",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const fd = new FormData();
                        fd.append("image_id", imageId);

                        try {
                            const res = await fetch(url, {
                                method: "POST",
                                body: fd,
                                headers: {
                                    "X-Requested-With": "XMLHttpRequest",
                                    "X-CSRFToken": csrf,
                                },
                            });
                            const data = await res.json();
                            if (data.success) {
                                const card = document.getElementById(`image-card-${imageId}`);
                                if (card) card.remove();
                                Swal.fire({
                                    icon: "success",
                                    title: data.message || "Deleted",
                                    toast: true,
                                    position: "top-end",
                                    showConfirmButton: false,
                                    timer: 2000,
                                });
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                });
            }
        });
    });
});
