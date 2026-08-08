document.addEventListener("DOMContentLoaded", function () {
    var lightbox = document.getElementById("inspirationLightbox");
    if (!lightbox) return;

    var imgEl = lightbox.querySelector(".inspo-lightbox-img");
    var captionEl = lightbox.querySelector(".inspo-lightbox-caption");
    var counterEl = lightbox.querySelector(".inspo-lightbox-counter");
    var prevBtn = lightbox.querySelector("[data-lb-prev]");
    var nextBtn = lightbox.querySelector("[data-lb-next]");
    var closeBtn = lightbox.querySelector("[data-lb-close]");

    var images = [];
    var currentIndex = 0;

    function collect(container) {
        var thumbs = container.querySelectorAll("[data-lightbox]");
        images = [];
        thumbs.forEach(function (thumb) {
            var src = thumb.currentSrc || thumb.src || thumb.dataset.full;
            if (src) {
                images.push({
                    src: src,
                    caption: thumb.dataset.lbCaption || thumb.alt || "",
                });
            }
        });
    }

    function show(index) {
        if (images.length === 0) return;
        currentIndex = (index + images.length) % images.length;
        var item = images[currentIndex];
        imgEl.src = item.src;
        imgEl.alt = item.caption;
        captionEl.textContent = item.caption;
        counterEl.textContent = (currentIndex + 1) + " / " + images.length;
        prevBtn.style.visibility = images.length > 1 ? "visible" : "hidden";
        nextBtn.style.visibility = images.length > 1 ? "visible" : "hidden";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function close() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        imgEl.src = "";
        document.body.style.overflow = "";
    }

    function next() { show(currentIndex + 1); }
    function prev() { show(currentIndex - 1); }

    document.querySelectorAll("[data-inspiration-gallery]").forEach(function (gallery) {
        gallery.addEventListener("click", function (e) {
            var thumb = e.target.closest("[data-lightbox]");
            if (!thumb) return;
            collect(gallery);
            var thumbs = gallery.querySelectorAll("[data-lightbox]");
            var index = Array.prototype.indexOf.call(thumbs, thumb);
            show(index);
        });
    });

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);
    closeBtn.addEventListener("click", close);

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox || e.target === lightbox.querySelector(".inspo-lightbox-figure")) {
            close();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") prev();
        else if (e.key === "ArrowRight") next();
    });
});