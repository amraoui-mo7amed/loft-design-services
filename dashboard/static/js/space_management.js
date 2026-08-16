document.addEventListener("DOMContentLoaded", function () {
    // ── Add Space modal ──────────────────────────────────────────
    var spaceModalEl = document.getElementById("spaceModal");
    var spaceForm = document.getElementById("spaceForm");
    var spaceModal = null;
    if (spaceModalEl && typeof bootstrap !== "undefined") {
        spaceModal = new bootstrap.Modal(spaceModalEl);
    }

    var addBtn = document.getElementById("addSpaceBtn");
    if (addBtn && spaceModal) {
        addBtn.addEventListener("click", function () {
            if (spaceForm) {
                spaceForm.reset();
                var errorList = spaceForm.querySelector("#errorList");
                if (errorList) errorList.innerHTML = "";
            }
            spaceModal.show();
        });
    }
});
