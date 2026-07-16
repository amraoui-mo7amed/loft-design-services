document.addEventListener("DOMContentLoaded", function () {
  var catListModal = document.getElementById("categoryListModal");
  var catBody = document.getElementById("categoryTableBody");
  var addForm = document.getElementById("addCategoryForm");
  var editForm = document.getElementById("editCategoryForm");
  var editModal = document.getElementById("editCategoryModal");

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function loadCategories() {
    catBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Loading...</td></tr>';
    fetch("/dashboard/design/service-categories/list/")
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
            '<td class="text-center"><span class="badge bg-secondary rounded-pill">' + c.option_count + '</span></td>' +
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

  function bindCatActions() {
    document.querySelectorAll(".edit-cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        editForm.action = "/dashboard/design/service-categories/" + this.dataset.id + "/edit/";
        editForm.querySelector("[name='name']").value = this.dataset.name;
        editForm.querySelector("[name='description']").value = this.dataset.description;
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
          text: "This will unset the category from its design options but won't delete them.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          buttonsStyling: false,
          customClass: { confirmButton: "btn btn-danger mx-2", cancelButton: "btn btn-secondary" },
        }).then(function (result) {
          if (result.isConfirmed) {
            fetch("/dashboard/design/service-categories/" + id + "/delete/", {
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
                    refreshOptionCategorySelect();
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

  function refreshOptionCategorySelect() {
    fetch("/dashboard/design/service-categories/list/")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.querySelectorAll("#packageModal .custom-select-wrapper").forEach(function (wrapper) {
          var list = wrapper.querySelector(".custom-select-list");
          var hidden = wrapper.querySelector('input[type="hidden"]');
          if (!list) return;
          var currentVal = hidden ? hidden.value : "";
          list.innerHTML = '<li data-value="">Category</li>';
          if (data.categories) {
            data.categories.forEach(function (c) {
              var li = document.createElement("li");
              li.dataset.value = c.id;
              li.textContent = c.name;
              list.appendChild(li);
            });
          }
          if (hidden) hidden.value = currentVal;
        });
        if (window.initCustomSelects) window.initCustomSelects();
      });
  }

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
              refreshOptionCategorySelect();
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
              refreshOptionCategorySelect();
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

  if (window.initCustomSelects) window.initCustomSelects();
});
