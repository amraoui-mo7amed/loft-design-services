document.addEventListener("DOMContentLoaded", function () {
    // 1. Copy Link to Clipboard
    document.querySelectorAll(".copy-link-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const link = this.dataset.link;
            if (!link) return;

            const fullUrl = link.startsWith("http") ? link : window.location.origin + link;

            navigator.clipboard.writeText(fullUrl).then(() => {
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "success",
                        title: "Link copied to clipboard!",
                        text: fullUrl,
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                }
            }).catch(() => {
                prompt("Copy this invitation link:", fullUrl);
            });
        });
    });

    // 2. Resend Invitation via AJAX
    document.querySelectorAll(".resend-inv-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            const url = this.dataset.url;
            const csrf = this.dataset.csrf;
            const originalHtml = this.innerHTML;

            this.disabled = true;
            this.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>`;

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
                            title: data.message || "Invitation resent!",
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true,
                        });
                    }
                } else {
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: data.errors ? data.errors.join("\n") : "Failed to resend.",
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                this.disabled = false;
                this.innerHTML = originalHtml;
            }
        });
    });
});
