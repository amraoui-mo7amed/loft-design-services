document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("projectTypeModal");
    var form = document.getElementById("projectTypeForm");
    var modalTitle = modal.querySelector(".modal-title");
    var submitBtn = form.querySelector("[type='submit']");
    var submitText = form.querySelector(".pt-submit-text");
    var nameInput = form.querySelector("[name='name']");
    var sortInput = form.querySelector("[name='sort_order']");
    var activeCheck = form.querySelector("[name='active']");

    function resetForm() {
        form.reset();
        form.action = "";
        activeCheck.checked = true;
        var list = form.querySelector("#errorList");
        if (list) list.innerHTML = "";
        nameInput.required = true;
    }

    function showModal() {
        var instance = bootstrap.Modal.getOrCreateInstance(modal);
        instance.show();
    }

    document.querySelectorAll(".pt-create-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            resetForm();
            form.action = this.dataset.createUrl;
            modalTitle.textContent = this.dataset.modalTitle || "New Project Type";
            submitText.textContent = this.dataset.submitText || "Create";
            showModal();
        });
    });

    document.querySelectorAll(".pt-edit-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            resetForm();
            form.action = this.dataset.updateUrl;
            modalTitle.textContent = this.dataset.modalTitle || "Edit Project Type";
            submitText.textContent = this.dataset.submitText || "Save";
            nameInput.value = this.dataset.name || "";
            sortInput.value = this.dataset.sortOrder || "0";
            activeCheck.checked = this.dataset.active === "true";
            nameInput.required = false;
            showModal();
        });
    });

    modal.addEventListener("hidden.bs.modal", resetForm);
});
