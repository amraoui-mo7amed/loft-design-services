function showSpinner(el) {
  var prog = el.querySelector(".upload-progress");
  if (prog) prog.classList.add("active");
}

function hideSpinner(el) {
  var prog = el.querySelector(".upload-progress");
  if (prog) prog.classList.remove("active");
}

(function () {
  "use strict";

  /* ── Thumbnail Upload ── */
  var thumbZone = document.getElementById("thumbnailZone");
  var thumbInput = document.getElementById("thumbnailInput");
  var thumbPreview = document.getElementById("thumbnailPreview");
  var currentThumb = document.getElementById("currentThumbnail");

  if (thumbZone && thumbInput) {
    thumbZone.addEventListener("click", function () { thumbInput.click(); });

    thumbZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("drag-over");
    });
    thumbZone.addEventListener("dragleave", function () {
      this.classList.remove("drag-over");
    });
    thumbZone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      if (e.dataTransfer.files.length) {
        thumbInput.files = e.dataTransfer.files;
        handleThumbFile(e.dataTransfer.files[0]);
      }
    });

    thumbInput.addEventListener("change", function () {
      if (this.files.length) handleThumbFile(this.files[0]);
    });

    function handleThumbFile(file) {
      showSpinner(thumbPreview || thumbZone);
      showThumbPreview(file);
      hideSpinner(thumbPreview || thumbZone);
    }

    function showThumbPreview(file) {
      var url = URL.createObjectURL(file);
      if (thumbPreview) {
        thumbPreview.innerHTML = '<img src="' + url + '" alt="Thumbnail">';
        thumbPreview.classList.add("has-image");
      }
      if (currentThumb) currentThumb.style.display = "none";
    }
  }

  /* ── 3D Model Upload ── */
  var model3dZone = document.getElementById("model3dZone");
  var model3dInput = document.getElementById("model3dInput");
  var model3dPreview = document.getElementById("model3dPreview");
  var model3dFilename = document.getElementById("model3dFilename");

  if (model3dZone && model3dInput) {
    model3dZone.addEventListener("click", function () { model3dInput.click(); });

    model3dZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("drag-over");
    });
    model3dZone.addEventListener("dragleave", function () {
      this.classList.remove("drag-over");
    });
    model3dZone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      if (e.dataTransfer.files.length) {
        model3dInput.files = e.dataTransfer.files;
        handleModelFile(e.dataTransfer.files[0]);
      }
    });

    model3dInput.addEventListener("change", function () {
      if (this.files.length) handleModelFile(this.files[0]);
    });

    function handleModelFile(file) {
      showSpinner(model3dZone);
      setTimeout(function () {
        if (model3dFilename) model3dFilename.textContent = file.name;
        if (model3dPreview) model3dPreview.classList.remove("d-none");
        hideSpinner(model3dZone);
      }, 300);
    }
  }

  /* ── Remove 3D Model (Edit) ── */
  var removeModelBtn = document.getElementById("removeModel3dBtn");
  var clearModelInput = document.getElementById("clearModel3d");
  var currentModelEl = document.getElementById("currentModel3d");

  if (removeModelBtn && clearModelInput) {
    removeModelBtn.addEventListener("click", function () {
      clearModelInput.value = "1";
      if (currentModelEl) currentModelEl.style.display = "none";
      if (model3dZone) {
        var p = model3dZone.querySelector("p.small");
        if (p) p.textContent = "Upload GLB/GLTF model";
      }
    });
  }

  /* ── Gallery Upload ── */
  var galleryZone = document.getElementById("galleryZone");
  var galleryInput = document.getElementById("galleryInput");
  var galleryPreview = document.getElementById("galleryPreview");
  var pendingGalleryFiles = [];

  if (galleryZone && galleryInput) {
    galleryZone.addEventListener("click", function () { galleryInput.click(); });

    galleryZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("drag-over");
    });
    galleryZone.addEventListener("dragleave", function () {
      this.classList.remove("drag-over");
    });
    galleryZone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      if (e.dataTransfer.files.length) addGalleryFiles(e.dataTransfer.files);
    });

    galleryInput.addEventListener("change", function () {
      if (this.files.length) addGalleryFiles(this.files);
    });

    function addGalleryFiles(files) {
      showSpinner(galleryZone);
      Array.from(files).forEach(function (file) {
        pendingGalleryFiles.push(file);
        showGalleryPreview(file);
      });
      rebuildGalleryFileList();
      hideSpinner(galleryZone);
    }

    function showGalleryPreview(file) {
      if (!galleryPreview) return;
      var url = URL.createObjectURL(file);
      var div = document.createElement("div");
      div.className = "preview-item";
      div.innerHTML = '<img src="' + url + '" alt="Gallery">'
        + '<button type="button" class="preview-remove" title="Remove">&times;</button>';
      div.querySelector(".preview-remove").addEventListener("click", function () {
        div.remove();
        var idx = pendingGalleryFiles.indexOf(file);
        if (idx !== -1) pendingGalleryFiles.splice(idx, 1);
        rebuildGalleryFileList();
      });
      galleryPreview.appendChild(div);
    }

    function rebuildGalleryFileList() {
      if (!galleryPreview || !galleryInput) return;
      var container = new DataTransfer();
      pendingGalleryFiles.forEach(function (file) {
        container.items.add(file);
      });
      galleryInput.files = container.files;
    }
  }

  /* ── Existing Gallery Delete Checkboxes ── */
  document.querySelectorAll(".existing-image-wrapper .form-check-input").forEach(function (cb) {
    cb.addEventListener("change", function () {
      this.closest(".existing-image-wrapper").classList.toggle("marked-for-delete", this.checked);
    });
  });

  /* ── AJAX Delete ── */
  document.querySelectorAll("[data-delete-url]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var url = this.dataset.deleteUrl;
      var swalTitle = this.dataset.swalTitle || "Delete?";
      var swalText = this.dataset.swalText || "This cannot be undone.";
      var csrf = this.dataset.csrfToken || document.querySelector("[name=csrfmiddlewaretoken]");

      if (typeof Swal === "undefined") {
        if (confirm(swalTitle + " " + swalText)) {
          var form = document.createElement("form");
          form.method = "POST";
          form.action = url;
          var input = document.createElement("input");
          input.type = "hidden";
          input.name = "csrfmiddlewaretoken";
          input.value = csrf && csrf.value ? csrf.value : "";
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        }
        return;
      }

      Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then(function (result) {
        if (!result.isConfirmed) return;
        fetch(url, {
          method: "POST",
          headers: {
            "X-CSRFToken": csrf && csrf.value ? csrf.value : "",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "csrfmiddlewaretoken=" + encodeURIComponent(csrf && csrf.value ? csrf.value : ""),
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            Swal.fire({ title: "Deleted!", text: data.message || "", icon: "success", timer: 1500, showConfirmButton: false })
              .then(function () { location.reload(); });
          } else {
            Swal.fire({ title: "Error", text: data.message || "Something went wrong.", icon: "error" });
          }
        })
        .catch(function () {
          Swal.fire({ title: "Error", text: "Network error.", icon: "error" });
        });
      });
    });
  });

  /* ── Form Submission ── */
  var portfolioForm = document.getElementById("portfolioForm");
  if (portfolioForm) {
    portfolioForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = this.querySelector("[type=submit]");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...'; }

      var formData = new FormData(this);

      fetch(this.action, {
        method: "POST",
        body: formData,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          if (typeof Swal !== "undefined") {
            Swal.fire({ title: "Saved!", text: data.message || "", icon: "success", timer: 1500, showConfirmButton: false })
              .then(function () { window.location.href = data.redirect_url || "."; });
          } else {
            window.location.href = data.redirect_url || ".";
          }
        } else {
          if (typeof Swal !== "undefined") {
            Swal.fire({ title: "Error", text: data.message || "Please check the form.", icon: "error" });
          } else {
            alert(data.message || "Error");
          }
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitBtn.dataset.originalText || "Save"; }
        }
      })
      .catch(function () {
        if (typeof Swal !== "undefined") {
          Swal.fire({ title: "Error", text: "Network error.", icon: "error" });
        } else {
          alert("Network error.");
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitBtn.dataset.originalText || "Save"; }
      });
    });

    var btns = portfolioForm.querySelectorAll("[type=submit]");
    btns.forEach(function (b) { b.dataset.originalText = b.innerHTML; });
  }

  /* ── Portfolio Search ── */
  var searchInput = document.querySelector("[data-portfolio-search]");
  var clearBtn = document.querySelector("[data-search-clear]");

  if (searchInput) {
    var timer;
    searchInput.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = searchInput.value.trim();
        window.location.href = q ? "?q=" + encodeURIComponent(q) : ".";
      }, 400);
    });

    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        clearTimeout(timer);
        var q = searchInput.value.trim();
        window.location.href = q ? "?q=" + encodeURIComponent(q) : ".";
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      window.location.href = ".";
    });
  }
})();
