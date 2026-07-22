document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("statusForm");
    if (!form) return;
    var select = form.querySelector("select[name='status']");
    if (!select) return;

    select.dataset.originalValue = select.value;

    select.addEventListener("change", function () {
        var newStatus = select.value;

        Swal.fire({
            title: form.dataset.confirmTitle || "Change Status?",
            text: form.dataset.confirmText || "This will send an email notification to the customer.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#FFD65A",
            cancelButtonColor: "#6c757d",
            confirmButtonText: form.dataset.confirmBtn || "Yes, update",
            cancelButtonText: form.dataset.cancelBtn || "Cancel",
        }).then(function (result) {
            if (result.isConfirmed) {
                var formData = new FormData(form);
                fetch(window.location.pathname, {
                    method: "POST",
                    headers: { "X-CSRFToken": formData.get("csrfmiddlewaretoken") },
                    body: formData,
                })
                .then(function (r) { return r.json(); })
                .then(function (response) {
                    if (response.success) {
                        select.dataset.originalValue = select.value;
                        Swal.fire({
                            icon: "success",
                            title: form.dataset.successTitle || "Status Updated",
                            text: form.dataset.successText || "An email notification has been sent.",
                            showConfirmButton: false,
                            timer: 2000,
                            confirmButtonColor: "#FFD65A",
                        });
                    }
                });
            } else {
                select.value = select.dataset.originalValue || "";
            }
        });
    });
});
