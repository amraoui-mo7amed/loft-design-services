document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".default-package-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var url = btn.dataset.defaultUrl;
            var csrf = btn.dataset.csrfToken;
            var isDefault = btn.dataset.isDefault === "true" || btn.dataset.isDefault === "True";
            var action = isDefault ? "clear" : "set";

            Swal.fire({
                title: isDefault ? btn.dataset.titleClear : btn.dataset.titleSet,
                text: isDefault ? btn.dataset.textClear : btn.dataset.textSet,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: isDefault ? btn.dataset.confirmClear : btn.dataset.confirmSet,
                cancelButtonText: btn.dataset.cancelText,
                buttonsStyling: false,
                customClass: { confirmButton: "btn btn-primary mx-2", cancelButton: "btn btn-secondary" },
            }).then(function (result) {
                if (!result.isConfirmed) return;
                var fd = new FormData();
                fd.append("action", action);
                fetch(url, {
                    method: "POST",
                    body: fd,
                    headers: { "X-Requested-With": "XMLHttpRequest", "X-CSRFToken": csrf },
                })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        Swal.fire({ title: data.message, icon: "success", timer: 1200, showConfirmButton: false })
                            .then(function () { window.location.reload(); });
                    } else {
                        Swal.fire({ title: btn.dataset.errorTitle, text: (data.errors && data.errors[0]) || btn.dataset.errorText, icon: "error" });
                    }
                })
                .catch(function () {
                    Swal.fire({ title: btn.dataset.errorTitle, text: btn.dataset.errorText, icon: "error" });
                });
            });
        });
    });
});
