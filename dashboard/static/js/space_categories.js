document.addEventListener("DOMContentLoaded", function () {
  var catListModal = document.getElementById("categoryListModal");
  var catBody = document.getElementById("categoryTableBody");
  var addForm = document.getElementById("addCategoryForm");
  var editForm = document.getElementById("editCategoryForm");
  var editModal = document.getElementById("editCategoryModal");

  // Load categories list
  function loadCategories() {
    catBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Loading...</td></tr>';
    fetch("/dashboard/design/categories/list/")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.categories || data.categories.length === 0) {
          catBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No categories yet.</td></tr>';
          return;
        }
        catBody.innerHTML = "";
        data.categories.forEach(function (c) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            '<td class="fw-bold">' + escapeHtml(c.name) + '</td>' +
            '<td class="text-muted">' + escapeHtml(c.description || "-") + '</td>' +
            '<td class="text-center"><span class="badge bg-secondary rounded-pill">' + c.space_count + '</span></td>' +
            '<td class="text-end">' +
              '<button class="btn btn-sm btn-outline-primary rounded-3 me-1 edit-cat-btn" data-id="' + c.id + '" data-name="' + escapeAttr(c.name) + '" data-description="' + escapeAttr(c.description || "") + '"><i class="fas fa-pen"></i></button>' +
              '<button class="btn btn-sm btn-outline-danger rounded-3 delete-cat-btn" data-id="' + c.id + '" data-name="' + escapeAttr(c.name) + '"><i class="fas fa-trash"></i></button>' +
            '</td>';
          catBody.appendChild(tr);
        });
        bindCatActions();
      })
      .catch(function () {
        catBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-3">Failed to load categories.</td></tr>';
      });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Bind edit/delete inside category rows
  function bindCatActions() {
    document.querySelectorAll(".edit-cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.dataset.id;
        var name = this.dataset.name;
        var desc = this.dataset.description;
        editForm.action = "/dashboard/design/categories/" + id + "/edit/";
        editForm.querySelector("[name='name']").value = name;
        editForm.querySelector("[name='description']").value = desc;
        var el = editForm.querySelector("#errorList");
        if (el) el.innerHTML = "";
        new bootstrap.Modal(editModal).show();
      });
    });

    document.querySelectorAll(".delete-cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.dataset.id;
        var name = this.dataset.name;
        Swal.fire({
          title: "Delete \"" + name + "\"?",
          text: "This will unlink the category from its spaces but won't delete them.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          buttonsStyling: false,
          customClass: { confirmButton: "btn btn-danger mx-2", cancelButton: "btn btn-secondary" },
        }).then(function (result) {
          if (result.isConfirmed) {
            fetch("/dashboard/design/categories/" + id + "/delete/", {
              method: "POST",
              headers: {
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            })
              .then(function (r) { return r.json(); })
              .then(function (data) {
                Swal.fire({
                  title: data.success ? "Deleted!" : "Error",
                  text: data.message || "Operation completed",
                  icon: data.success ? "success" : "error",
                }).then(function () {
                  if (data.success) {
                    loadCategories();
                    refreshSpaceCategorySelect();
                  }
                });
              })
              .catch(function () {
                Swal.fire({ title: "Error", text: "Connection failed", icon: "error" });
              });
          }
        });
      });
    });
  }

  // Refresh the space category custom select (in spaceModal)
  function refreshSpaceCategorySelect() {
    fetch("/dashboard/design/categories/list/")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = document.querySelector("#spaceModal .custom-select-list");
        var hidden = document.querySelector("#spaceModal input[name='space_category_id']");
        if (!list) return;
        list.innerHTML = '<li data-value="">No Category</li>';
        if (data.categories) {
          data.categories.forEach(function (c) {
            var li = document.createElement("li");
            li.dataset.value = c.id;
            li.textContent = c.name;
            list.appendChild(li);
          });
        }
        if (window.initCustomSelects) window.initCustomSelects();
      });
  }

  // Load categories when the list modal opens
  if (catListModal) {
    catListModal.addEventListener("show.bs.modal", loadCategories);
  }

  function showFormResult(form, message, isSuccess) {
    var el = form.querySelector("#errorList");
    if (!el) return;
    el.innerHTML = "";
    var li = document.createElement("li");
    li.textContent = message;
    li.className = "alert alert-" + (isSuccess ? "success" : "warning") + " mb-2";
    el.appendChild(li);
  }

  function closeModal(id) {
    var m = bootstrap.Modal.getInstance(document.getElementById(id));
    if (m) m.hide();
  }

  // Add category form
  if (addForm) {
    addForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = addForm.querySelector("#errorList");
      if (el) el.innerHTML = "";
      var fd = new FormData(addForm);
      fetch(addForm.action, {
        method: "POST",
        headers: { "X-CSRFToken": fd.get("csrfmiddlewaretoken"), "X-Requested-With": "XMLHttpRequest" },
        body: fd,
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            showFormResult(addForm, data.message || "Category created.", true);
            setTimeout(function () {
              closeModal("addCategoryModal");
              addForm.reset();
              refreshSpaceCategorySelect();
            }, 800);
          } else if (data.errors) {
            (Array.isArray(data.errors) ? data.errors : Object.values(data.errors).flat()).forEach(function (m) {
              var li = document.createElement("li");
              li.textContent = m;
              li.className = "alert alert-warning mb-2";
              if (el) el.appendChild(li);
            });
          }
        })
        .catch(function () {
          var li = document.createElement("li");
          li.textContent = "Connection failed";
          li.className = "alert alert-danger mb-2";
          if (el) el.appendChild(li);
        });
    });
  }

  // Edit category form
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = editForm.querySelector("#errorList");
      if (el) el.innerHTML = "";
      var fd = new FormData(editForm);
      fetch(editForm.action, {
        method: "POST",
        headers: { "X-CSRFToken": fd.get("csrfmiddlewaretoken"), "X-Requested-With": "XMLHttpRequest" },
        body: fd,
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            showFormResult(editForm, data.message || "Category updated.", true);
            setTimeout(function () {
              closeModal("editCategoryModal");
              loadCategories();
              refreshSpaceCategorySelect();
            }, 800);
          } else if (data.errors) {
            (Array.isArray(data.errors) ? data.errors : Object.values(data.errors).flat()).forEach(function (m) {
              var li = document.createElement("li");
              li.textContent = m;
              li.className = "alert alert-warning mb-2";
              if (el) el.appendChild(li);
            });
          }
        })
        .catch(function () {
          var li = document.createElement("li");
          li.textContent = "Connection failed";
          li.className = "alert alert-danger mb-2";
          if (el) el.appendChild(li);
        });
    });
  }

  // Initialize the space category select on page load (for the create modal)
  if (window.initCustomSelects) window.initCustomSelects();

  // Space modal: image upload, preview & status badge
  var spaceModal = document.getElementById("spaceModal");
  if (spaceModal) {
    spaceModal.addEventListener("show.bs.modal", function () {
      var preview = document.getElementById("spaceImagePreview");
      if (preview) {
        if (this.dataset.existingImage) {
          preview.innerHTML = '<img src="' + this.dataset.existingImage + '" style="max-height:120px;border-radius:8px;object-fit:cover;width:100%;">';
        } else {
          preview.innerHTML =
            '<i class="fas fa-cloud-upload-alt fa-3x text-muted mb-2"></i>' +
            '<p class="small text-muted mb-0">Click to upload</p>' +
            '<p class="small text-muted" style="font-size:0.7rem;">PNG, JPG up to 5MB</p>';
        }
      }
      var cb = document.getElementById("spaceActive");
      var badge = document.getElementById("spaceStatusBadge");
      if (cb && badge) {
        badge.textContent = cb.checked ? "Published" : "Draft";
        badge.className = "badge rounded-pill " + (cb.checked ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary");
      }
    });

    // Upload zone click -> hidden file input
    var uploadZone = spaceModal.querySelector("#spaceImageUpload");
    var fileInput = spaceModal.querySelector("input[name='image']");
    if (uploadZone && fileInput) {
      uploadZone.addEventListener("click", function () {
        fileInput.click();
      });
      fileInput.addEventListener("change", function () {
        var preview = document.getElementById("spaceImagePreview");
        if (!preview || !this.files || !this.files[0]) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          preview.innerHTML = '<img src="' + e.target.result + '" style="max-height:120px;border-radius:8px;object-fit:cover;width:100%;">';
        };
        reader.readAsDataURL(this.files[0]);
      });
    }

    var activeCheck = spaceModal.querySelector("#spaceActive");
    var statusBadge = spaceModal.querySelector("#spaceStatusBadge");
    if (activeCheck && statusBadge) {
      activeCheck.addEventListener("change", function () {
        statusBadge.textContent = this.checked ? "Published" : "Draft";
        statusBadge.className = "badge rounded-pill " + (this.checked ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary");
      });
    }
  }
});
