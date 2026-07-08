document.addEventListener("DOMContentLoaded", () => {
  var sidebar = document.getElementById("sidebar");
  var toggleBtn = document.getElementById("sidebarToggleBtn");
  var backdrop = document.getElementById("sidebarBackdrop");

  function openSidebar() {
    sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (window.innerWidth < 992) {
        sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeSidebar);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 992 && sidebar && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  document.querySelectorAll(".nav-child-item.active").forEach(function (link) {
    var collapseEl = link.closest(".collapse");
    if (collapseEl) {
      var bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
      bsCollapse.show();
      var toggle = document.querySelector('[data-bs-target="#' + collapseEl.id + '"]');
      if (toggle) toggle.setAttribute("aria-expanded", "true");
    }
  });

  // Delete with SweetAlert2
  document.querySelectorAll(".delete_button").forEach(function (button) {
    button.addEventListener("click", function () {
      var deleteUrl = button.dataset.deleteUrl;
      var csrfToken = button.dataset.csrfToken;
      var itemTitle = button.dataset.itemTitle || "this item";

      Swal.fire({
        title: "Are you sure?",
        text: "You are about to delete " + itemTitle + ". This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        buttonsStyling: false,
        customClass: { confirmButton: "btn btn-danger mx-2", cancelButton: "btn btn-secondary" },
      }).then(function (result) {
        if (result.isConfirmed) {
          fetch(deleteUrl, {
            method: "POST",
            headers: {
              "X-CSRFToken": csrfToken,
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
                if (data.success) location.reload();
              });
            })
            .catch(function () {
              Swal.fire({ title: "Error", text: "Connection failed", icon: "error" });
            });
        }
      });
    });
  });

  // Auto-submit custom selects on change
  document.addEventListener('change', function (e) {
    var wrapper = e.target.closest('.custom-select-wrapper[data-auto-submit]');
    if (wrapper) {
      var form = wrapper.closest('form');
      if (form) form.submit();
    }
  });
});

// ---- Custom Select (shared with filter modals) ----
function initCustomSelects(wrapper) {
  var wrappers = wrapper ? [wrapper] : document.querySelectorAll('.custom-select-wrapper');
  wrappers.forEach(function (w) {
    if (w._customSelectInitialized) return;
    w._customSelectInitialized = true;
    var display = w.querySelector('.custom-select-display');
    var list = w.querySelector('.custom-select-list');
    var hiddenInput = w.querySelector('input[type="hidden"]');

    display.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper').forEach(function (otherWrapper) {
        if (otherWrapper !== w) {
          otherWrapper.querySelector('.custom-select-list').classList.remove('show');
          otherWrapper.querySelector('.custom-select-display').classList.remove('active');
          otherWrapper.classList.remove('active');
        }
      });
      list.classList.toggle('show');
      display.classList.toggle('active');
      w.classList.toggle('active');
    });

    list.querySelectorAll('li').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        hiddenInput.value = item.dataset.value;
        list.classList.remove('show');
        display.classList.remove('active');
        w.classList.remove('active');
        display.innerHTML = item.textContent + '<span class="arrow"><i class="fas fa-caret-down"></i></span>';
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    document.addEventListener('click', function (e) {
      if (!w.contains(e.target)) {
        list.classList.remove('show');
        display.classList.remove('active');
        w.classList.remove('active');
      }
    });
  });
}
window.initCustomSelects = initCustomSelects;

document.addEventListener("DOMContentLoaded", function () { initCustomSelects(); });

function filterTable(tableId, query) {
  var table = document.getElementById(tableId);
  if (!table) return;
  var rows = table.querySelectorAll("tbody tr");
  var filter = query.toLowerCase();
  rows.forEach(function (row) {
    var matchFound = false;
    row.querySelectorAll("td").forEach(function (cell) {
      if (cell.innerText.toLowerCase().includes(filter)) matchFound = true;
    });
    row.style.display = matchFound || filter === "" ? "" : "none";
  });
}
