document.addEventListener("DOMContentLoaded", function () {
    function toast(msg, icon) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: icon,
            title: msg,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
    }

    document.querySelectorAll(".pt-feature-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = btn.dataset.action;
            var card = btn.closest(".pt-card");
            var fd = new FormData();
            fd.append("action", action);
            fd.append("csrfmiddlewaretoken", btn.dataset.csrf);

            var doToggle = function () {
                fetch(btn.dataset.featureUrl, {
                    method: "POST",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    body: fd,
                })
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        if (!data.success) {
                            toast((data.errors || ["Error"]).join(", "), "error");
                            return;
                        }
                        var icon = btn.querySelector("i");
                        if (action === "feature") {
                            btn.classList.add("is-featured");
                            icon.className = "fas fa-star";
                            btn.dataset.action = "unfeature";
                            btn.dataset.featured = "true";
                            document.querySelectorAll(".pt-card").forEach(function (c) {
                                c.classList.toggle("pt-card--featured", c === card);
                            });
                            document.querySelectorAll(".pt-feature-btn").forEach(function (b) {
                                if (b !== btn) {
                                    b.classList.remove("is-featured");
                                    var ic = b.querySelector("i");
                                    if (ic) ic.className = "far fa-star";
                                    b.dataset.action = "feature";
                                    b.dataset.featured = "false";
                                }
                            });
                        } else {
                            btn.classList.remove("is-featured");
                            icon.className = "far fa-star";
                            btn.dataset.action = "feature";
                            btn.dataset.featured = "false";
                            card.classList.remove("pt-card--featured");
                        }
                        toast(data.message, "success");
                    })
                    .catch(function () {
                        toast("Connection failed", "error");
                    });
            };

            if (action === "unfeature") {
                Swal.fire({
                    title: btn.dataset.confirmTitle || "Remove featured project type?",
                    text: btn.dataset.confirmText || "This project type will no longer be featured on the homepage.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: btn.dataset.confirmOk || "Yes, unfeature",
                    cancelButtonText: btn.dataset.confirmCancel || "Cancel",
                    confirmButtonColor: "#dc3545",
                }).then(function (result) {
                    if (result.isConfirmed) doToggle();
                });
            } else {
                doToggle();
            }
        });
    });
});
