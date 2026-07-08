document.addEventListener("DOMContentLoaded", function () {
    var fileInput = document.getElementById("profilePicInput");
    var avatarImg = document.getElementById("profileAvatarImg");
    var avatarPlaceholder = document.getElementById("profileAvatar");

    if (fileInput) {
        fileInput.addEventListener("change", function () {
            if (!this.files || !this.files[0]) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                if (avatarImg) {
                    avatarImg.src = e.target.result;
                    avatarImg.classList.remove("d-none");
                }
                if (avatarPlaceholder) {
                    avatarPlaceholder.classList.add("d-none");
                }
            };
            reader.readAsDataURL(this.files[0]);
        });
    }

    if (window.initCustomSelects) {
        window.initCustomSelects();
    }
});
