(function () {
  "use strict";

  /* ── Scroll Reveal ── */
  var reveals = document.querySelectorAll(".scroll-reveal");
  if (reveals.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Image Viewer ── */
  var viewer = document.getElementById("portfolioViewer");
  if (!viewer) return;

  var viewerImg = viewer.querySelector(".viewer-main-img");
  var prevBtn = viewer.querySelector(".nav-prev");
  var nextBtn = viewer.querySelector(".nav-next");
  var closeBtn = viewer.querySelector(".viewer-close");
  var counterEl = viewer.querySelector(".viewer-counter");

  var images = [];
  var currentIndex = 0;

  document.querySelectorAll("[data-viewer-trigger]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var index = parseInt(this.dataset.viewerTrigger, 10);
      images = JSON.parse(this.dataset.viewerImages || "[]");
      if (!images.length) return;
      currentIndex = index;
      openViewer();
    });
  });

  function openViewer() {
    viewer.classList.add("active");
    showImage(currentIndex);
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    viewer.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showImage(index) {
    if (!images.length) return;
    viewerImg.style.opacity = "0";
    setTimeout(function () {
      viewerImg.src = images[index];
      viewerImg.style.opacity = "1";
      if (counterEl) {
        counterEl.textContent = (index + 1) + " / " + images.length;
      }
    }, 150);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
    scrollThumbActive(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
    scrollThumbActive(currentIndex);
  }

  function scrollThumbActive(idx) {
    var thumbs = viewer.querySelectorAll(".thumb-item");
    thumbs.forEach(function (t, i) {
      t.classList.toggle("active", i === idx);
      if (i === idx) t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", prevImage);
  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (closeBtn) closeBtn.addEventListener("click", closeViewer);

  document.addEventListener("keydown", function (e) {
    if (!viewer.classList.contains("active")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  });

  viewer.addEventListener("click", function (e) {
    if (e.target === viewer) closeViewer();
  });
})();
