(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (typeof AOS !== "undefined") {
            AOS.init({
                duration: 600,
                once: true,
                offset: 50,
            });
        }
    });
})();
