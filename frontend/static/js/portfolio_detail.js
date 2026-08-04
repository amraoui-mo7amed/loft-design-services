(function () {
  "use strict";

  /* ── Image Viewer ── */
  var viewer = document.getElementById("portfolioViewer");
  if (!viewer) return;

  var viewerImg = viewer.querySelector(".viewer-main-img");
  var prevBtn = viewer.querySelector(".nav-prev");
  var nextBtn = viewer.querySelector(".nav-next");
  var closeBtn = viewer.querySelector(".viewer-close");
  var counterEl = viewer.querySelector(".viewer-counter");
  var thumbStrip = document.getElementById("thumbStrip");

  var images = [];
  try {
    var data = document.getElementById("galleryData");
    if (data) images = JSON.parse(data.textContent || data.dataset.images || "[]");
  } catch (e) {}

  var currentIndex = 0;

  function openViewer(index) {
    currentIndex = index;
    viewer.classList.add("active");
    showImage(index);
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
      if (counterEl) counterEl.textContent = (index + 1) + " / " + images.length;
      updateThumbs(index);
    }, 150);
  }

  function updateThumbs(index) {
    if (!thumbStrip) return;
    var thumbs = thumbStrip.querySelectorAll(".thumb-item");
    thumbs.forEach(function (t, i) {
      t.classList.toggle("active", i === index);
      if (i === index) t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  if (prevBtn) prevBtn.addEventListener("click", prevImage);
  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (closeBtn) closeBtn.addEventListener("click", closeViewer);

  if (thumbStrip) {
    thumbStrip.addEventListener("click", function (e) {
      var thumb = e.target.closest(".thumb-item");
      if (!thumb) return;
      var idx = parseInt(thumb.dataset.index, 10);
      if (!isNaN(idx)) openViewer(idx);
    });
  }

  /* Click hero image to open viewer */
  var heroImg = document.getElementById("heroImage");
  if (heroImg) {
    heroImg.addEventListener("click", function () {
      openViewer(0);
    });
  }

  /* ── Gallery auto-hide + toggle ── */
  var galleryToggleBtn = document.getElementById("galleryToggle");
  var galleryVisible = true;

  function setGalleryVisible(visible) {
    galleryVisible = visible;
    if (thumbStrip) thumbStrip.style.display = visible ? "" : "none";
    if (galleryToggleBtn) galleryToggleBtn.classList.toggle("active-3d", visible);
  }

  setTimeout(function () {
    setGalleryVisible(false);
  }, 5000);

  if (galleryToggleBtn) {
    galleryToggleBtn.addEventListener("click", function () {
      setGalleryVisible(!galleryVisible);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!viewer.classList.contains("active")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  });

  viewer.addEventListener("click", function (e) {
    if (e.target === viewer) closeViewer();
  });

  /* ── 3D Model Toggle ── */
  var view3dBtn = document.getElementById("view3dBtn");
  var modelOverlay = document.getElementById("modelViewerOverlay");

  if (view3dBtn && modelOverlay) {
    var is3dActive = false;

    view3dBtn.addEventListener("click", function () {
      is3dActive = !is3dActive;
      modelOverlay.classList.toggle("active", is3dActive);
      view3dBtn.classList.toggle("active-3d", is3dActive);

      if (viewerImg) viewerImg.style.display = is3dActive ? "none" : "";
      if (prevBtn) prevBtn.style.display = is3dActive ? "none" : "";
      if (nextBtn) nextBtn.style.display = is3dActive ? "none" : "";
      if (counterEl) counterEl.style.display = is3dActive ? "none" : "";
      if (thumbStrip) thumbStrip.style.display = is3dActive ? "none" : "";
    });
  }
})();
