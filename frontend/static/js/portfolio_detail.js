(function () {
  "use strict";

  /* ── Image Viewer ── */
  var viewer = document.getElementById("portfolioViewer");
  if (!viewer) return;

  var viewerImg = viewer.querySelector(".viewer-main-img");
  var prevBtn = viewer.querySelector(".nav-prev");
  var nextBtn = viewer.querySelector(".nav-next");
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

  if (thumbStrip) {
    thumbStrip.addEventListener("click", function (e) {
      var thumb = e.target.closest(".thumb-item");
      if (!thumb) {
        setGalleryVisible(false);
        return;
      }
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

  /* ── Gallery toggle via bottom-of-screen zone ── */
  var galleryZone = document.getElementById("galleryZone");
  var galleryVisible = false;

  function setGalleryVisible(visible) {
    galleryVisible = visible;
    if (thumbStrip) thumbStrip.style.display = visible ? "" : "none";
    if (galleryZone) galleryZone.classList.toggle("active", visible);
  }

  setGalleryVisible(false);

  if (galleryZone) {
    galleryZone.addEventListener("click", function () {
      setGalleryVisible(true);
    });
    galleryZone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setGalleryVisible(true);
      }
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
      if (thumbStrip) thumbStrip.style.display = is3dActive ? "none" : "";
      if (galleryZone) galleryZone.style.display = is3dActive ? "none" : "";
    });
  }
})();
