document.addEventListener("DOMContentLoaded", function () {
    // Approve designer — direct AJAX
    document.querySelectorAll(".approve-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var form = document.getElementById(this.dataset.formId);
            if (!form) return;
            var fd = new FormData(form);
            var list = form.querySelector("#errorList");
            if (list) list.innerHTML = "";
            fetch(form.action, {
                method: "POST",
                body: fd,
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        setTimeout(function () {
                            if (data.redirect_url) window.location.href = data.redirect_url;
                            else location.reload();
                        }, 5000);
                    } else {
                        var errors = data.errors || [data.message || "An error occurred"];
                        if (list) {
                            errors.forEach(function (msg) {
                                var li = document.createElement("li");
                                li.textContent = msg;
                                list.appendChild(li);
                            });
                        }
                    }
                });
        });
    });

    // Delete designer — SweetAlert confirmation
    document.querySelectorAll(".delete-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var form = document.getElementById(this.dataset.formId);
            if (!form) return;
            Swal.fire({
                title: this.dataset.swalTitle || "Are you sure?",
                text: this.dataset.swalText || "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it",
                cancelButtonText: "Cancel",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-danger mx-2",
                    cancelButton: "btn btn-secondary",
                },
            }).then(function (result) {
                if (result.isConfirmed) {
                    var fd = new FormData(form);
                    fetch(form.action, {
                        method: "POST",
                        body: fd,
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    })
                        .then(function (r) { return r.json(); })
                        .then(function (data) {
                            Swal.fire({
                                title: data.success ? "Deleted!" : "Error",
                                text: data.message || "Operation completed",
                                icon: data.success ? "success" : "error",
                            }).then(function () {
                                if (data.redirect_url) window.location.href = data.redirect_url;
                                else if (data.success) location.reload();
                            });
                        })
                        .catch(function () {
                            Swal.fire({ title: "Error", text: "Connection failed", icon: "error" });
                        });
                }
            });
        });
    });

    // Assign designer — populate modal with designer data
    var assignModal = document.getElementById("assignModal");
    if (assignModal) {
        assignModal.addEventListener("show.bs.modal", function (event) {
            var btn = event.relatedTarget;
            if (!btn) return;
            document.getElementById("assignDesignerName").textContent =
                btn.dataset.designerName || "";
            document.getElementById("assignDesignerId").value =
                btn.dataset.designerId || "";
            var list = this.querySelector("#errorList");
            if (list) list.innerHTML = "";
        });
    }
});
