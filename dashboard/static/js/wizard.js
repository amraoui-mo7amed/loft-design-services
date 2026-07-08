(function () {
  "use strict";

  const stepUrls = [
    "/request/step/project-type/",
    "/request/step/floors/",
    "/request/step/spaces/",
    "/request/step/packages/",
    "/request/step/options/",
    "/request/step/inspirations/",
    "/request/step/questionnaire/",
    "/request/step/uploads/",
    "/request/step/summary/",
  ];

  const TOTAL_STEPS = stepUrls.length;
  let currentStep = 0;
  const wizardData = {
    projectTypeSlug: null,
    floors: [],
    spaces: [],
    packageId: null,
    optionIds: [],
    inspirations: {},
    questionnaire: {},
    files: [],
  };

  const priceUrl = "/api/design/calculate-price/";
  const submitUrl = "/api/design/requests/";

  function init() {
    const container = document.querySelector(".wizard-container");
    if (!container) return;
    loadStep(0);
    document.getElementById("prevBtn").addEventListener("click", prevStep);
    document.getElementById("nextBtn").addEventListener("click", nextStep);
  }

  function loadStep(index, params) {
    const content = document.getElementById("stepContent");
    content.innerHTML =
      '<div class="text-center py-5"><div class="spinner-border text-secondary" role="status" style="width:2.5rem;height:2.5rem;"></div><p class="mt-3 text-muted" style="font-size:0.9rem;">Loading...</p></div>';
    var url = stepUrls[index];
    if (params) {
      var qs = new URLSearchParams(params).toString();
      url += "?" + qs;
    }
    fetch(url)
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        content.innerHTML = html;
        currentStep = index;
        updateStepper(index);
        updateNav(index);
        bindStepEvents(index);
        if (window.initCustomSelects) window.initCustomSelects();
        if (index > 2) updatePriceSummary();
      })
      .catch(function () {
        content.innerHTML =
          "<p class='text-danger text-center py-5'>Failed to load step. Please refresh.</p>";
      });
  }

  function updateStepper(index) {
    const items = document.querySelectorAll(".wiz-step-item");
    items.forEach(function (el, i) {
      el.classList.remove("active", "completed");
      if (i < index) el.classList.add("completed");
      if (i === index) el.classList.add("active");
    });
    var pct = (index / (TOTAL_STEPS - 1)) * 100;
    document.getElementById("progressBar").style.width = pct + "%";
  }

  function updateNav(index) {
    var prev = document.getElementById("prevBtn");
    var next = document.getElementById("nextBtn");
    prev.disabled = index === 0;
    if (index === TOTAL_STEPS - 1) {
      next.innerHTML = '<i class="fas fa-check me-2"></i> Submit';
      next.className = "wiz-btn wiz-btn-success";
    } else {
      next.innerHTML = "Next <i class=\"fas fa-arrow-right ms-2\"></i>";
      next.className = "wiz-btn wiz-btn-primary";
    }
  }

  function bindStepEvents(index) {
    switch (index) {
      case 0:
        bindProjectTypeStep();
        break;
      case 1:
        bindFloorsStep();
        break;
      case 2:
        bindSpacesStep();
        break;
      case 3:
        bindPackagesStep();
        break;
      case 4:
        bindOptionsStep();
        break;
      case 5:
        bindInspirationsStep();
        break;
      case 7:
        bindUploadsStep();
        break;
      case 8:
        bindSummaryStep();
        break;
    }
  }

  function bindProjectTypeStep() {
    document.querySelectorAll(".project-type-card").forEach(function (card) {
      card.addEventListener("click", function () {
        document
          .querySelectorAll(".project-type-card")
          .forEach(function (c) {
            c.classList.remove("selected");
          });
        card.classList.add("selected");
        wizardData.projectTypeSlug = card.dataset.slug;
      });
    });
  }

  function bindFloorsStep() {
    var container = document.getElementById("floorsContainer");
    var addBtn = document.getElementById("addFloorBtn");
    var dupBtn = document.getElementById("duplicateFloorBtn");

    function addFloor(name, index) {
      var div = document.createElement("div");
      div.className = "wiz-floor-item";
      div.dataset.floorIndex = index;
      div.innerHTML =
        '<div class="wiz-floor-grip"><i class="fas fa-grip-vertical"></i></div><div class="flex-grow-1"><input type="text" class="wiz-floor-input" value="' +
        name +
        '"></div><button type="button" class="wiz-floor-remove"><i class="fas fa-times"></i></button>';
      container.appendChild(div);
      div
        .querySelector(".wiz-floor-remove")
        .addEventListener("click", function () {
          div.remove();
        });
    }

    container.querySelectorAll(".wiz-floor-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.closest(".wiz-floor-item").remove();
      });
    });

    addBtn.addEventListener("click", function () {
      var items = container.querySelectorAll(".wiz-floor-item");
      addFloor("Floor " + (items.length + 1), items.length);
    });

    dupBtn.addEventListener("click", function () {
      var items = container.querySelectorAll(".wiz-floor-item");
      if (items.length > 0) {
        var last = items[items.length - 1];
        var name = last.querySelector(".wiz-floor-input").value;
        addFloor(name + " (Copy)", items.length);
      }
    });
  }

  function bindSpacesStep() {
    document.querySelectorAll(".space-checkbox-card").forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("selected");
        var cb = card.querySelector(".space-checkbox");
        cb.checked = !cb.checked;
        updateSpacesSubtotal();
      });
    });

    document.querySelectorAll(".floor-space-group").forEach(function (group) {
      var addBtn = group.querySelector(".add-custom-space-btn");
      var inlineForm = group.querySelector(".custom-space-inline");
      var input = inlineForm.querySelector(".custom-space-input");
      var confirmBtn = inlineForm.querySelector(".confirm-custom-space");
      var cancelBtn = inlineForm.querySelector(".cancel-custom-space");
      var grid = group.querySelector(".floor-spaces-grid");

      if (!addBtn || !inlineForm) return;

      addBtn.addEventListener("click", function () {
        addBtn.style.display = "none";
        inlineForm.style.display = "block";
        input.focus();
      });

      function addCustomSpaceCard(name) {
        var col = document.createElement("div");
        col.className = "col-md-4 col-sm-6";
        var card = document.createElement("div");
        card.className = "wiz-space-card space-checkbox-card selected";
        card.dataset.spaceId = "custom";
        card.dataset.price = "0";
        card.dataset.days = "0";
        card.innerHTML =
          '<div class="wiz-space-img"><i class="fas fa-plus"></i></div><div class="wiz-space-info"><div class="wiz-space-name">' +
          name +
          '</div><div class="wiz-space-price">Custom</div></div><div class="wiz-space-check"><i class="fas fa-check"></i></div><input type="checkbox" class="d-none space-checkbox" checked>';
        col.appendChild(card);
        grid.appendChild(col);
        card.addEventListener("click", function () {
          card.classList.toggle("selected");
          var cb2 = card.querySelector(".space-checkbox");
          cb2.checked = !cb2.checked;
          updateSpacesSubtotal();
        });
      }

      function resetInline() {
        input.value = "";
        inlineForm.style.display = "none";
        addBtn.style.display = "inline-block";
      }

      confirmBtn.addEventListener("click", function () {
        var name = input.value.trim();
        if (!name) return;
        addCustomSpaceCard(name);
        resetInline();
      });

      cancelBtn.addEventListener("click", resetInline);

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var name = this.value.trim();
          if (!name) return;
          addCustomSpaceCard(name);
          resetInline();
        }
        if (e.key === "Escape") {
          resetInline();
        }
      });
    });
  }

  function updateSpacesSubtotal() {
    var total = 0;
    document
      .querySelectorAll(".space-checkbox-card.selected")
      .forEach(function (c) {
        total += parseFloat(c.dataset.price) || 0;
      });
    var el = document.getElementById("spacesSubtotal");
    if (el) el.textContent = total.toLocaleString() + " DA";
    updatePriceSummary();
  }

  function bindPackagesStep() {
    document.querySelectorAll(".package-card").forEach(function (card) {
      card.addEventListener("click", function () {
        document
          .querySelectorAll(".package-card")
          .forEach(function (c) {
            c.classList.remove("selected");
          });
        card.classList.add("selected");
        var radio = card.querySelector(".package-radio");
        if (radio) radio.checked = true;
        wizardData.packageId = card.dataset.packageId;
        updatePriceSummary();
      });
    });
  }

  function bindOptionsStep() {
    document.querySelectorAll(".option-checkbox-card").forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("selected");
        var cb = card.querySelector(".option-checkbox");
        cb.checked = !cb.checked;
        updateOptionsTotal();
      });
    });
  }

  function updateOptionsTotal() {
    var total = 0;
    document
      .querySelectorAll(".option-checkbox-card.selected")
      .forEach(function (c) {
        total += parseFloat(c.dataset.price) || 0;
      });
    var el = document.getElementById("optionsTotal");
    if (el) el.textContent = total.toLocaleString() + " DA";
    updatePriceSummary();
  }

  function bindInspirationsStep() {
    document.querySelectorAll(".inspiration-card").forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("selected");
      });
    });

    document
      .querySelectorAll(".inspiration-style-tabs button")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          var spaceId = btn.dataset.spaceId;
          var styleId = btn.dataset.styleId;
          document
            .querySelectorAll(
              ".inspiration-gallery[data-space-id='" +
                spaceId +
                "'] .inspiration-item"
            )
            .forEach(function (item) {
              item.style.display =
                item.dataset.styleId === styleId ? "block" : "none";
            });
          document
            .querySelectorAll(
              ".inspiration-style-tabs button[data-space-id='" +
                spaceId +
                "']"
            )
            .forEach(function (b) {
              b.classList.remove("active");
            });
          btn.classList.add("active");
        });
      });
  }

  function bindUploadsStep() {
    var zone = document.getElementById("uploadDropZone");
    var fileInput = document.getElementById("fileInput");
    var browseBtn = document.getElementById("uploadBrowseBtn");

    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("dragover");
    });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });
    browseBtn.addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      handleFiles(fileInput.files);
    });
  }

  function handleFiles(files) {
    var preview = document.getElementById("uploadPreview");
    preview.style.display = "block";
    for (var i = 0; i < files.length; i++) {
      wizardData.files.push(files[i]);
      addFileItem(files[i]);
    }
    document.getElementById("fileCount").textContent =
      wizardData.files.length + " files";
  }

  function addFileItem(file) {
    var list = document.getElementById("uploadedFilesList");
    var div = document.createElement("div");
    div.className = "wiz-file-item";
    var icon = "fa-file";
    if (file.type.startsWith("image/")) icon = "fa-file-image";
    else if (file.name.endsWith(".pdf")) icon = "fa-file-pdf";
    else if (file.name.endsWith(".dwg") || file.name.endsWith(".dxf"))
      icon = "fa-file-archive";
    else if (file.type.startsWith("video/")) icon = "fa-file-video";
    div.innerHTML =
      '<div class="wiz-file-icon"><i class="fas ' +
      icon +
      '"></i></div><div class="wiz-file-info"><div class="wiz-file-name">' +
      file.name +
      '</div><div class="wiz-file-size">' +
      formatSize(file.size) +
      '</div><div class="wiz-file-progress"><div class="wiz-file-progress-fill" style="width:0%"></div></div></div><button type="button" class="wiz-file-remove"><i class="fas fa-times"></i></button>';
    list.appendChild(div);
    div
      .querySelector(".wiz-file-remove")
      .addEventListener("click", function () {
        var idx = wizardData.files.indexOf(file);
        if (idx > -1) wizardData.files.splice(idx, 1);
        div.remove();
        var count = wizardData.files.length;
        document.getElementById("fileCount").textContent = count + " files";
        if (count === 0) {
          document.getElementById("uploadPreview").style.display = "none";
        }
      });
    setTimeout(function () {
      div.querySelector(".wiz-file-progress-fill").style.width = "100%";
    }, 300);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function bindSummaryStep() {
    var pt = document.getElementById("summaryProjectType");
    if (wizardData.projectTypeSlug && pt) {
      var card = document.querySelector(
        ".project-type-card[data-slug='" + wizardData.projectTypeSlug + "']"
      );
      pt.textContent = card ? card.dataset.name : wizardData.projectTypeSlug;
    }
    var floorsEl = document.getElementById("summaryFloors");
    if (floorsEl) {
      var names = [];
      document
        .querySelectorAll("#floorsContainer .wiz-floor-input")
        .forEach(function (inp) {
          names.push(inp.value);
        });
      if (names.length)
        floorsEl.innerHTML = names
          .map(function (n) {
            return "<li>" + n + "</li>";
          })
          .join("");
    }
    var spacesEl = document.getElementById("summarySpaces");
    if (spacesEl) {
      var names2 = [];
      document
        .querySelectorAll(".space-checkbox-card.selected .wiz-space-name")
        .forEach(function (el) {
          names2.push(el.textContent);
        });
      spacesEl.textContent = names2.length
        ? names2.join(", ")
        : "None selected";
    }
    var pkgEl = document.getElementById("summaryPackage");
    if (wizardData.packageId && pkgEl) {
      var pkgCard = document.querySelector(
        ".package-card[data-package-id='" + wizardData.packageId + "']"
      );
      pkgEl.textContent = pkgCard
        ? pkgCard.querySelector(".wiz-pkg-name").textContent
        : "Selected";
    }
    var optsEl = document.getElementById("summaryOptions");
    if (optsEl) {
      var names3 = [];
      document
        .querySelectorAll(".option-checkbox-card.selected .wiz-opt-name")
        .forEach(function (el) {
          names3.push(el.textContent);
        });
      optsEl.textContent = names3.length ? names3.join(", ") : "None";
    }
    updateSummaryPrice();
  }

  function updateSummaryPrice() {
    var subtotal = 0;
    var packagePrice = 0;
    var optionsTotal = 0;
    document
      .querySelectorAll(".space-checkbox-card.selected")
      .forEach(function (c) {
        subtotal += parseFloat(c.dataset.price) || 0;
      });
    var pkgCard = document.querySelector(".package-card.selected");
    if (pkgCard) {
      var mult = parseFloat(pkgCard.dataset.multiplier) || 1;
      packagePrice = subtotal * mult;
    }
    document
      .querySelectorAll(".option-checkbox-card.selected")
      .forEach(function (c) {
        optionsTotal += parseFloat(c.dataset.price) || 0;
      });
    var taxable = subtotal + packagePrice + optionsTotal;
    var tax = taxable * 0.19;
    var total = taxable + tax;
    var elTotal = document.getElementById("summaryTotal");
    if (elTotal)
      elTotal.textContent = Math.round(total).toLocaleString() + " DA";
    var elDelivery = document.getElementById("summaryDelivery");
    if (elDelivery) {
      var maxDays = 1;
      document
        .querySelectorAll(".space-checkbox-card.selected")
        .forEach(function (c) {
          var d = parseInt(c.dataset.days) || 0;
          if (d > maxDays) maxDays = d;
        });
      elDelivery.textContent = "Estimated delivery: " + maxDays + " days";
    }
  }

  function updatePriceSummary() {
    var bar = document.getElementById("priceSummaryBar");
    if (!bar) return;
    var params = new URLSearchParams();
    document
      .querySelectorAll(".space-checkbox-card.selected")
      .forEach(function (c) {
        var id = c.dataset.spaceId;
        if (id && id !== "custom") params.append("space_ids[]", id);
      });
    if (wizardData.packageId) params.set("package_id", wizardData.packageId);
    document
      .querySelectorAll(".option-checkbox-card.selected")
      .forEach(function (c) {
        var id = c.dataset.optionId;
        if (id) params.append("option_ids[]", id);
      });
    if (!params.has("space_ids[]")) {
      bar.style.display = "none";
      return;
    }
    bar.style.display = "block";
    fetch(priceUrl + "?" + params.toString())
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        document.getElementById("priceTotal").textContent =
          Math.round(data.total).toLocaleString() + " DA";
        document.getElementById("priceSubtotal").textContent =
          Math.round(data.subtotal).toLocaleString();
        document.getElementById("pricePackage").textContent =
          Math.round(data.package_price).toLocaleString();
        document.getElementById("priceOptions").textContent =
          Math.round(data.options_total).toLocaleString();
      })
      .catch(function () {});
  }

  function collectStepData() {
    wizardData.floors = [];
    document
      .querySelectorAll("#floorsContainer .wiz-floor-input")
      .forEach(function (inp) {
        wizardData.floors.push(inp.value);
      });
    wizardData.spaces = [];
    document
      .querySelectorAll(".floor-space-group")
      .forEach(function (group) {
        var fi = parseInt(group.dataset.floorIndex);
        group
          .querySelectorAll(".space-checkbox-card.selected")
          .forEach(function (card) {
            var sid = card.dataset.spaceId;
            if (sid && sid !== "custom") {
              wizardData.spaces.push({
                floorIndex: fi,
                spaceId: parseInt(sid),
              });
            }
          });
      });
    wizardData.optionIds = [];
    document
      .querySelectorAll(".option-checkbox-card.selected")
      .forEach(function (card) {
        var oid = card.dataset.optionId;
        if (oid) wizardData.optionIds.push(parseInt(oid));
      });
    wizardData.inspirations = {};
    document
      .querySelectorAll(".inspiration-card.selected")
      .forEach(function (card) {
        var spaceId = card
          .closest(".inspiration-gallery")
          .dataset.spaceId;
        if (!wizardData.inspirations[spaceId])
          wizardData.inspirations[spaceId] = [];
        wizardData.inspirations[spaceId].push(
          parseInt(card.dataset.imgId)
        );
      });
    var qForm = document.querySelector(".wizard-step[data-step='6']");
    if (qForm) {
      wizardData.questionnaire = {};
      qForm
        .querySelectorAll("input, select, textarea")
        .forEach(function (el) {
          if (el.type === "checkbox") {
            wizardData.questionnaire[el.name] = el.checked;
          } else if (el.name) {
            wizardData.questionnaire[el.name] = el.value;
          }
        });
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      collectStepData();
      loadStep(currentStep - 1);
    }
  }

  function nextStep() {
    if (currentStep === 0) {
      if (!wizardData.projectTypeSlug) {
        var msg = document.createElement("div");
        msg.className = "alert alert-warning text-center py-2 mb-3";
        msg.style.cssText = "font-size:0.85rem;border-radius:10px;";
        msg.textContent = "Please select a project type.";
        var title = document.querySelector(".wiz-step-title");
        if (title) title.parentNode.insertBefore(msg, title.nextSibling);
        setTimeout(function () { msg.remove(); }, 2500);
        return;
      }
    }
    if (currentStep === TOTAL_STEPS - 1) {
      submitRequest();
      return;
    }
    collectStepData();
    var params = null;
    if (currentStep + 1 === 2) {
      params = { floor_count: wizardData.floors.length || 1 };
    }
    loadStep(currentStep + 1, params);
  }

  function submitRequest() {
    var terms = document.getElementById("acceptTerms");
    if (terms && !terms.checked) {
      var termsMsg = document.createElement("div");
      termsMsg.className = "alert alert-warning text-center py-2 mb-3";
      termsMsg.style.cssText = "font-size:0.85rem;border-radius:10px;";
      termsMsg.textContent = "Please accept the terms and conditions.";
      var summaryTotal = document.querySelector(".wiz-summary-total");
      if (summaryTotal) summaryTotal.parentNode.insertBefore(termsMsg, summaryTotal.nextSibling);
      setTimeout(function () { termsMsg.remove(); }, 2500);
      return;
    }
    var btn = document.getElementById("nextBtn");
    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span> Submitting...';

    collectStepData();

    var payload = {
      project_type_slug: wizardData.projectTypeSlug,
      package_id: wizardData.packageId,
      floors: JSON.stringify(wizardData.floors),
      spaces: JSON.stringify(wizardData.spaces),
      options: JSON.stringify(wizardData.optionIds),
      inspirations: JSON.stringify(wizardData.inspirations),
      questionnaire: JSON.stringify(wizardData.questionnaire),
      total: document.getElementById("summaryTotal")
        ? document
            .getElementById("summaryTotal")
            .textContent.replace(/[^0-9]/g, "")
        : 0,
    };

    fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.success) {
          var content = document.getElementById("stepContent");
          fetch("/request/step/confirmation/")
            .then(function (r) {
              return r.text();
            })
            .then(function (html) {
              content.innerHTML = html;
              document.getElementById("confirmProjectNumber").textContent =
                data.project_number;
              document.getElementById("confirmTotal").textContent =
                document.getElementById("summaryTotal")
                  ? document.getElementById("summaryTotal").textContent
                  : "—";
              var nav = document.getElementById("wizardNav");
              if (nav) nav.style.display = "none";
              document.querySelectorAll(".wiz-step-item").forEach(function (el) {
                el.classList.remove("active");
                el.classList.add("completed");
              });
              document.getElementById("progressBar").style.width = "100%";
            });
        } else {
          var errMsg = data.errors ? data.errors.join("<br>") : "Submission failed.";
          var errDiv = document.createElement("div");
          errDiv.className = "alert alert-danger text-center py-2 mb-3";
          errDiv.style.cssText = "font-size:0.85rem;border-radius:10px;";
          errDiv.innerHTML = errMsg;
          var summaryTotal = document.querySelector(".wiz-summary-total");
          if (summaryTotal) summaryTotal.parentNode.insertBefore(errDiv, summaryTotal.nextSibling);
          btn.disabled = false;
          btn.innerHTML = "Submit";
        }
      })
      .catch(function () {
        var errDiv2 = document.createElement("div");
        errDiv2.className = "alert alert-danger text-center py-2 mb-3";
        errDiv2.style.cssText = "font-size:0.85rem;border-radius:10px;";
        errDiv2.textContent = "An error occurred. Please try again.";
        var summaryTotal2 = document.querySelector(".wiz-summary-total");
        if (summaryTotal2) summaryTotal2.parentNode.insertBefore(errDiv2, summaryTotal2.nextSibling);
        btn.disabled = false;
        btn.innerHTML = "Submit";
      });
  }

  function getCsrfToken() {
    var match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : "";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
