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

    document.querySelectorAll(".ptd-feature-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = btn.dataset.action;
            var fd = new FormData();
            fd.append("action", action);
            fd.append("csrfmiddlewaretoken", btn.dataset.csrf);

            btn.disabled = true;

            fetch(btn.dataset.toggleUrl, {
                method: "POST",
                headers: { "X-Requested-With": "XMLHttpRequest" },
                body: fd,
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    btn.disabled = false;
                    if (!data.success) {
                        toast((data.errors || ["Error"]).join(", "), "error");
                        return;
                    }
                    var icon = btn.querySelector("i");
                    if (action === "feature") {
                        btn.classList.add("is-featured");
                        icon.className = "fas fa-star";
                        btn.dataset.action = "unfeature";
                    } else {
                        btn.classList.remove("is-featured");
                        icon.className = "far fa-star";
                        btn.dataset.action = "feature";
                    }
                    toast(data.message, "success");
                })
                .catch(function () {
                    btn.disabled = false;
                    toast("Connection failed", "error");
                });
        });
    });
});
