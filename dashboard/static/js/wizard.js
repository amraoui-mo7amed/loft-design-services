(function () {
  "use strict";

  const stepUrls = [
    "/request/step/combined/",
    "/request/step/packages/",
    "/request/step/questionnaire/",
    "/request/step/summary/",
  ];

  const TOTAL_STEPS = 4;
  let currentStep = 0;
  const wizardData = {
    projectTypeSlug: null,
    projectTypeName: null,
    floors: [],
    spaces: [],
    packageId: null,
    packagePrice: 0,
    packageName: null,
    inspirations: {},
    questionnaire: {},
  };

  const priceUrl = "/api/design/calculate-price/";
  const submitUrl = "/api/design/requests/";

  function fmt(n) {
    return Math.round(n).toString();
  }

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
        if (index === 0 && wizardData.floors.length > 0) {
          restoreCombinedStepSelections();
        }
        if (index > 1) updatePriceSummary();
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
        bindCombinedStep();
        break;
      case 1:
        bindPackagesStep();
        break;
      case 2:
        bindQuestionnaireStep();
        break;
      case 3:
        bindSummaryStep();
        break;
    }
  }

  function bindCombinedStep() {
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden) {
        if (!wizardData.projectTypeSlug && hidden.value) {
          wizardData.projectTypeSlug = hidden.value;
        }
        hidden.addEventListener("change", function () {
          wizardData.projectTypeSlug = this.value || null;
        });
      }
    }

    var container = document.getElementById("floorSpacesContainer");
    if (container) {
      container.addEventListener("click", function (e) {
        var card = e.target.closest(".space-checkbox-card");
        if (!card) return;
        card.classList.toggle("selected");
        var cb = card.querySelector(".space-checkbox");
        if (cb) cb.checked = !cb.checked;
        updateSpacesSubtotal();
      });
    }

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

      confirmBtn.addEventListener("click", function () {
        var name = input.value.trim();
        if (!name) return;
        addCustomSpaceCard(name, grid);
        resetInline(input, inlineForm, addBtn);
      });

      cancelBtn.addEventListener("click", function () {
        resetInline(input, inlineForm, addBtn);
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var name = this.value.trim();
          if (!name) return;
          addCustomSpaceCard(name, grid);
          resetInline(input, inlineForm, addBtn);
        }
        if (e.key === "Escape") {
          resetInline(input, inlineForm, addBtn);
        }
      });
    });

    var floorInput = document.getElementById("floorCountInput");
    if (floorInput) {
      floorInput.addEventListener("change", function () {
        regenerateFloorGroups(parseInt(this.value) || 1);
      });
    }
  }

  function addCustomSpaceCard(name, grid) {
    var col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";
    var card = document.createElement("div");
    card.className = "wiz-space-card space-checkbox-card selected";
    card.dataset.spaceId = "custom";
    card.dataset.price = "0";
    card.innerHTML =
      '<div class="wiz-space-img"><i class="fas fa-plus"></i></div><div class="wiz-space-info"><div class="wiz-space-name">' +
      name +
      '</div><div class="wiz-space-price">Custom</div></div><div class="wiz-space-check"><i class="fas fa-check"></i></div><input type="checkbox" class="d-none space-checkbox" checked>';
    col.appendChild(card);
    grid.appendChild(col);
  }

  function resetInline(input, inlineForm, addBtn) {
    input.value = "";
    if (inlineForm) inlineForm.style.display = "none";
    if (addBtn) addBtn.style.display = "inline-block";
  }

  function regenerateFloorGroups(count) {
    var container = document.getElementById("floorSpacesContainer");
    if (!container) return;
    var existing = container.querySelectorAll(".floor-space-group");
    var current = existing.length;
    if (count === current) return;

    var template = existing[0];
    if (!template) return;

    if (count > current) {
      for (var i = current; i < count; i++) {
        var clone = template.cloneNode(true);
        clone.dataset.floorIndex = i;
        var nameDisplay = clone.querySelector(".floor-name-display");
        if (nameDisplay) nameDisplay.textContent = "Floor " + (i + 1);
        var grid = clone.querySelector(".floor-spaces-grid");
        grid.querySelectorAll(".space-checkbox-card").forEach(function (c) {
          c.classList.remove("selected");
          var cb = c.querySelector(".space-checkbox");
          if (cb) cb.checked = false;
        });
        var addBtn = clone.querySelector(".add-custom-space-btn");
        if (addBtn) addBtn.style.display = "inline-block";
        var inline = clone.querySelector(".custom-space-inline");
        if (inline) inline.style.display = "none";
        container.appendChild(clone);
      }
    } else if (count < current) {
      for (var i = current - 1; i >= count; i--) {
        if (existing[i]) existing[i].remove();
      }
    }
    updateSpacesSubtotal();
  }

  function updateSpacesSubtotal() {
    var total = calcSubtotal();
    var el = document.getElementById("spacesSubtotal");
    if (el) el.textContent = fmt(total) + " DA";
  }

  function restoreCombinedStepSelections() {
    if (wizardData.projectTypeSlug) {
      var hidden = document.querySelector("#projectTypeSelect input[type='hidden']");
      if (hidden) hidden.value = wizardData.projectTypeSlug;
    }
    if (wizardData.floors.length > 0) {
      var countInput = document.querySelector("[name='floor_count']");
      if (countInput) {
        countInput.value = wizardData.floors.length;
        regenerateFloorGroups(wizardData.floors.length);
      }
    }
    if (wizardData.spaces && wizardData.spaces.length > 0) {
      setTimeout(function () {
        wizardData.spaces.forEach(function (s) {
          var card = document.querySelector('.space-checkbox-card[data-space-id="' + s.spaceId + '"]');
          if (card) {
            card.classList.add("selected");
            var cb = card.querySelector(".space-checkbox");
            if (cb) cb.checked = true;
          }
        });
        updateSpacesSubtotal();
      }, 100);
    }
  }

  function bindPackagesStep() {
    var cards = document.querySelectorAll(".pkg-card");
    var basicCard = document.querySelector('.pkg-card[data-package-id=""]');

    // Pre-fill each card's price = base (spaces) + package add-on on load
    renderPackageCardPrices();

    // Basic is always included (auto-selected, cannot be unselected).
    // A package card is a complementary add-on that can be toggled on/off.
    if (wizardData.packageId) {
      cards.forEach(function (c) {
        if (c.dataset.packageId === wizardData.packageId) c.classList.add("selected");
      });
    } else {
      wizardData.packageId = null;
      wizardData.packagePrice = 0;
      var basicNameEl = basicCard ? basicCard.querySelector(".pkg-card-name") : null;
      wizardData.packageName = basicNameEl ? basicNameEl.textContent.trim() : null;
    }

    // Show estimate in sticky bar based on selected spaces
    updatePriceSummary();

    cards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".pkg-details-btn")) return;

        if (this === basicCard) {
          // Deselect any add-on package, back to basic only
          cards.forEach(function (c) {
            if (c !== basicCard) c.classList.remove("selected");
          });
          basicCard.classList.add("selected");
          wizardData.packageId = null;
          wizardData.packagePrice = 0;
          wizardData.packageName = basicCard.querySelector(".pkg-card-name").textContent.trim();
        } else {
          var isActive = this.classList.contains("selected");
          cards.forEach(function (c) {
            if (c !== basicCard) c.classList.remove("selected");
          });
          if (isActive) {
            // toggle off -> back to basic only
            basicCard.classList.add("selected");
            wizardData.packageId = null;
            wizardData.packagePrice = 0;
            var bn = basicCard.querySelector(".pkg-card-name");
            wizardData.packageName = bn ? bn.textContent.trim() : null;
          } else {
            this.classList.add("selected");
            wizardData.packageId = this.dataset.packageId;
            wizardData.packagePrice = parseFloat(this.dataset.packagePrice) || 0;
            var nameEl = this.querySelector(".pkg-card-name");
            wizardData.packageName = nameEl ? nameEl.textContent.trim() : null;
          }
        }
        updatePriceSummary();
        var hiddenTotal = document.querySelector("input[name='package_total']");
        if (hiddenTotal) hiddenTotal.value = wizardData.packagePrice;
      });
    });

    // View details opens a modal showing that card's breakdown (base + add-on)
    cards.forEach(function (card) {
      var btn = card.querySelector(".pkg-details-btn");
      if (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          renderEstimateDetailsModal(card);
          var estModal = new bootstrap.Modal(document.getElementById("estimateDetailsModal"));
          estModal.show();
        });
      }
    });

    var params = new URLSearchParams(window.location.search);
    var preselected = params.get("package_id");
    if (preselected && wizardData.packageId === null) {
      cards.forEach(function (c) {
        if (c.dataset.packageId === preselected) {
          c.classList.add("selected");
          wizardData.packageId = preselected;
          wizardData.packagePrice = parseFloat(c.dataset.packagePrice) || 0;
          var nameEl = c.querySelector(".pkg-card-name");
          wizardData.packageName = nameEl ? nameEl.textContent.trim() : null;
          updatePriceSummary();
        }
      });
    }

    var pkgForm = document.getElementById("packageOptionForm");
    if (pkgForm) {
      pkgForm.querySelectorAll("input[type='checkbox']").forEach(function (cb) {
        cb.addEventListener("change", function () {
          updatePriceSummary();
        });
      });
    }
  }

  function renderPackageCardPrices() {
    var subtotal = calcSubtotal();
    var spacesCount = (wizardData.spaces || []).length;
    var floorsCount = (wizardData.floors || []).length || 1;

    document.querySelectorAll(".pkg-card").forEach(function (card) {
      var priceEl = card.querySelector(".pkg-dynamic-price");
      var sumEl = card.querySelector(".pkg-sum-price");
      var baseEl = card.querySelector(".pkg-base-price");
      var addonEl = card.querySelector(".pkg-addon-price");
      var basicEl = card.querySelector(".pkg-basic-breakdown");
      var addon = parseFloat(card.dataset.packagePrice) || 0;
      var sum = fmt(subtotal + addon);
      if (priceEl) priceEl.textContent = sum;
      if (sumEl) sumEl.textContent = sum;
      if (baseEl) baseEl.textContent = fmt(subtotal);
      if (addonEl) addonEl.textContent = fmt(addon);
      if (basicEl) basicEl.textContent = fmt(subtotal);
    });

    var elSpaces = document.getElementById("basicSpacesCount");
    if (elSpaces) elSpaces.textContent = spacesCount;
    var elFloors = document.getElementById("basicFloorsCount");
    if (elFloors) elFloors.textContent = floorsCount;
    var elSub = document.getElementById("basicSubtotal");
    if (elSub) elSub.textContent = fmt(subtotal);
  }

  function renderEstimateDetailsModal(cardEl) {
    var body = document.getElementById("estimateDetailsBody");
    if (!body) return;

    var subtotal = calcSubtotal();
    var addon = 0;
    var cardName = wizardData.projectTypeName || "Basic";
    if (cardEl) {
      addon = parseFloat(cardEl.dataset.packagePrice) || 0;
      var nameEl = cardEl.querySelector(".pkg-card-name");
      cardName = nameEl ? nameEl.textContent.trim() : cardName;
    }
    var packageLabel = cardName;
    var total = Math.round(subtotal + addon);

    var html = "";

    // Step 1 summary: project type + floors
    html += '<div class="wiz-summary-card mb-3">';
    html += '  <div class="d-flex align-items-center gap-2 mb-2">';
    html += '    <div class="wiz-summary-icon"><i class="fas fa-building"></i></div>';
    html += '    <div>';
    html += '      <div class="wiz-summary-title">' + (wizardData.projectTypeName || wizardData.projectTypeSlug || "—") + '</div>';
    html += '      <div class="wiz-text-sm text-muted">' + (wizardData.floors.length || 1) + ' floor(s)</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // Selected spaces with prices
    html += '<div class="wiz-summary-card mb-3">';
    html += '  <div class="wiz-summary-title mb-2">' + "Selected Spaces" + '</div>';
    var spaces = wizardData.spaces || [];
    if (spaces.length === 0) {
      html += '<div class="wiz-text-sm text-muted">' + "No spaces selected." + '</div>';
    } else {
      spaces.forEach(function (s) {
        html += '  <div class="d-flex justify-content-between align-items-center py-1">';
        html += '    <span class="wiz-text-sm">' + (s.name || ("Space #" + s.spaceId)) + '</span>';
        html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + fmt(s.price) + ' DA</span>';
        html += '  </div>';
      });
    }
    html += '</div>';

    // Included services for this specific package
    var services = [];
    if (cardEl) {
      cardEl.querySelectorAll(".pkg-card-feature span").forEach(function (s) {
        services.push(s.textContent.trim());
      });
    }
    if (services.length > 0) {
      html += '<div class="wiz-summary-card mb-3">';
      html += '  <div class="wiz-summary-title mb-2">' + packageLabel + ' — ' + "What's included" + '</div>';
      services.forEach(function (name) {
        html += '  <div class="d-flex align-items-center gap-2 py-1 wiz-text-sm">';
        html += '    <i class="fas fa-check-circle" style="color:var(--wiz-success);font-size:0.6rem;flex-shrink:0;"></i>';
        html += '    <span>' + name + '</span>';
        html += '  </div>';
      });
      html += '</div>';
    }

    // Totals breakdown
    html += '<div class="wiz-summary-card mb-3">';
    html += '  <div class="d-flex justify-content-between align-items-center py-1">';
    html += '    <span class="wiz-text-muted-light">' + "Base price (selected spaces)" + '</span>';
    html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + fmt(subtotal) + ' DA</span>';
    html += '  </div>';
    html += '  <div class="d-flex justify-content-between align-items-center py-1">';
    html += '    <span class="wiz-text-muted-light">' + "Package" + '</span>';
    html += '    <span class="fw-bold" style="color:var(--wiz-text);">' + packageLabel + ' — ' + fmt(addon) + ' DA</span>';
    html += '  </div>';
    html += '  <hr class="my-2" style="border-color:var(--wiz-border);opacity:0.6;">';
    html += '  <div class="d-flex justify-content-between align-items-center py-1">';
    html += '    <span class="fw-bold">' + "Estimated Total" + '</span>';
    html += '    <span style="font-size:1.3rem;font-weight:800;color:var(--wiz-accent);">' + fmt(total) + ' DA</span>';
    html += '  </div>';
    html += '</div>';

    body.innerHTML = html;
  }

  function calcSubtotal() {
    var total = 0;
    if (wizardData.spaces && wizardData.spaces.length > 0) {
      wizardData.spaces.forEach(function (s) { total += s.price || 0; });
    }
    return total;
  }

  function calcTotal(subtotal, pkgPrice) {
    return (subtotal || 0) + (pkgPrice || 0);
  }

  function showWarning(message) {
    var title = document.querySelector(".wiz-step-title");
    if (!title) return;
    var existing = title.parentNode.querySelector(".wiz-warning-msg");
    if (existing) existing.remove();
    var msg = document.createElement("div");
    msg.className = "alert alert-warning text-center py-2 mb-3 wiz-warning-msg";
    msg.style.cssText = "font-size:0.85rem;border-radius:10px;";
    msg.textContent = message;
    title.parentNode.insertBefore(msg, title.nextSibling);
    setTimeout(function () { msg.remove(); }, 2500);
  }

  function startInspirationModals() {
    var ids = (wizardData.spaces || []).map(function (s) { return s.spaceId; }).filter(function (id) { return id; });
    if (ids.length === 0) {
      loadStep(2);
      return;
    }

    var btn = document.getElementById("nextBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Loading...';

    fetch("/request/step/inspirations/?space_ids=" + ids.join(","))
      .then(function (r) { return r.text(); })
      .then(function (html) {
        btn.disabled = false;
        btn.innerHTML = 'Next <i class="fas fa-arrow-right ms-2"></i>';

        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var spaceCards = doc.querySelectorAll(".inspo-space-card");
        var spacesData = [];
        spaceCards.forEach(function (card) {
          var sid = card.dataset.spaceId;
          var nameEl = card.querySelector(".inspo-space-name");
          var items = card.querySelectorAll(".inspiration-item");
          var images = [];
          items.forEach(function (item) {
            images.push({
              imgId: parseInt(item.dataset.imgId),
              imgUrl: item.dataset.imgUrl,
            });
          });
          spacesData.push({ spaceId: sid, name: nameEl.textContent.trim(), images: images });
        });

        if (spacesData.length === 0) {
          loadStep(2);
          return;
        }

        showSequentialModals(spacesData, 0);
      })
      .catch(function () {
        btn.disabled = false;
        btn.innerHTML = 'Next <i class="fas fa-arrow-right ms-2"></i>';
        loadStep(2);
      });
  }

  function showSequentialModals(spacesData, index) {
    if (index >= spacesData.length) {
      loadStep(2);
      return;
    }

    var space = spacesData[index];
    var isLast = index === spacesData.length - 1;

    var modalEl = document.getElementById("inspirationGalleryModal");
    var modalTitle = document.getElementById("inspirationModalTitle");
    var modalGrid = document.getElementById("inspirationModalGrid");
    var modalBody = document.getElementById("inspirationModalBody");
    var submitBtn = document.getElementById("inspirationSubmitBtn");

    modalTitle.textContent = space.name;
    modalGrid.innerHTML = "";

    space.images.forEach(function (img) {
      var col = document.createElement("div");
      col.className = "col-6";
      var card = document.createElement("div");
      card.className = "wiz-inspo-card inspiration-card";
      card.dataset.imgId = img.imgId;
      card.innerHTML =
        '<img src="' + img.imgUrl + '" alt="" class="wiz-inspo-img" loading="lazy">' +
        '<div class="wiz-inspo-overlay"><i class="fas fa-check-circle"></i></div>';
      card.addEventListener("click", function () { this.classList.toggle("selected"); });
      col.appendChild(card);
      modalGrid.appendChild(col);
    });

    var oldHint = modalBody.querySelector(".modal-hint");
    if (oldHint) oldHint.remove();

    var hint = document.createElement("p");
    hint.className = "text-muted mb-3 wiz-text-sm modal-hint";
    hint.textContent = isLast
      ? "Select images, then Submit to continue."
      : "Select images, then Next for the next space.";
    modalBody.insertBefore(hint, modalGrid);

    var newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    submitBtn = newBtn;

    if (isLast) {
      submitBtn.textContent = "Submit & Continue";
      submitBtn.className = "btn btn-sm wiz-btn-success rounded-3 px-4";
    } else {
      submitBtn.textContent = "Next Space";
      submitBtn.className = "btn btn-sm wiz-btn-primary rounded-3 px-4";
    }

    submitBtn.addEventListener("click", function () {
      var selectedIds = [];
      modalGrid.querySelectorAll(".inspiration-card.selected").forEach(function (c) {
        selectedIds.push(parseInt(c.dataset.imgId));
      });
      wizardData.inspirations[space.spaceId] = selectedIds;
      var bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
      showSequentialModals(spacesData, index + 1);
    });

    var bsModal = new bootstrap.Modal(modalEl, { backdrop: "static", keyboard: false });
    bsModal.show();
  }

  function bindQuestionnaireStep() {
    var form = document.getElementById("questionnaireForm");
    if (!form) return;
  }

  function bindSummaryStep() {
    updateSummaryTotal();
    renderFacturationTable();
    bindFacturationButtons();
  }

  function renderFacturationTable() {
    var body = document.getElementById("facturationTableBody");
    if (!body) return;

    var spaces = wizardData.spaces || [];
    var pkgName = wizardData.packageName;
    var pkgPrice = wizardData.packagePrice || 0;
    var html = "";
    spaces.forEach(function (s) {
      html += "<tr><td>" + (s.name || "Space") + "</td><td class=\"text-end\">" +
        fmt(s.price || 0) + "</td></tr>";
    });

    var subWithPkg = calcSubtotal();
    body.innerHTML = html;

    var el = document.getElementById("factSubtotal");
    if (el) el.textContent = fmt(subWithPkg);
    el = document.getElementById("factPackage");
    if (el) el.textContent = pkgName ? fmt(pkgPrice) : "0";
    el = document.getElementById("factGrandTotal");
    if (el) el.textContent = fmt(calcTotal(subWithPkg, pkgPrice)) + " DA";

    var clientEl = document.getElementById("facturationClient");
    var contactEl = document.getElementById("facturationContact");
    var q = wizardData.questionnaire || {};
    if (clientEl) {
      clientEl.textContent = (q.first_name || "") + " " + (q.last_name || "");
      clientEl.textContent = clientEl.textContent.trim() || "-";
    }
    if (contactEl) {
      contactEl.textContent = [q.email, q.phone].filter(Boolean).join(" • ");
    }
    var dateEl = document.getElementById("facturationDate");
    if (dateEl) {
      var d = new Date();
      dateEl.textContent = d.toLocaleDateString();
    }
  }

  function buildFacturationPayload() {
    collectStepData();
    return {
      questionnaire: JSON.stringify(wizardData.questionnaire || {}),
      spaces: JSON.stringify(wizardData.spaces || []),
      package_id: wizardData.packageId || "",
      total: document.getElementById("factGrandTotal")
        ? document.getElementById("factGrandTotal").textContent.replace(/[^0-9]/g, "")
        : 0,
    };
  }

  function bindFacturationButtons() {
    var dlBtn = document.getElementById("facturationDownloadBtn");
    var emBtn = document.getElementById("facturationEmailBtn");
    var statusEl = document.getElementById("facturationStatus");
    var email = (wizardData.questionnaire || {}).email;

    function setBtnLoading(btn, loading) {
      if (!btn) return;
      btn.disabled = loading;
    }

    function setStatus(html, cls) {
      if (!statusEl) return;
      statusEl.textContent = html;
      statusEl.className = "wiz-fact-status" + (cls ? " " + cls : "");
    }

    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        setBtnLoading(dlBtn, true);
        setStatus("Generating PDF...", "");
        fetch("/request/facturation/download/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
          body: JSON.stringify(buildFacturationPayload()),
        })
          .then(function (r) {
            if (!r.ok) throw new Error("bad");
            return r.blob();
          })
          .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "facturation.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            setStatus("Downloaded", "success");
          })
          .catch(function () {
            setStatus("Could not generate the PDF", "error");
          })
          .finally(function () {
            setBtnLoading(dlBtn, false);
          });
      });
    }

    if (emBtn) {
      emBtn.addEventListener("click", function () {
        if (!email) {
          setStatus("Add your email in the Contact step first", "error");
          return;
        }
        setBtnLoading(emBtn, true);
        setStatus("Sending...", "");
        fetch("/request/facturation/email/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
          body: JSON.stringify(buildFacturationPayload()),
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success) {
              setStatus("Sent to " + email, "ok");
            } else {
              setStatus(data.errors && data.errors[0] ? data.errors[0] : "Failed to send", "error");
            }
          })
          .catch(function () {
            setStatus("Failed to send", "error");
          })
          .finally(function () {
            setBtnLoading(emBtn, false);
          });
      });
    }
  }

  function updateSummaryTotal() {
    var subtotal = calcSubtotal();
    var pkgPrice = wizardData.packagePrice || 0;
    var total = calcTotal(subtotal, pkgPrice);
    var elTotal = document.getElementById("summaryTotal");
    if (elTotal) elTotal.textContent = fmt(total) + " DA";
    var elGrand = document.getElementById("factGrandTotal");
    if (elGrand) elGrand.textContent = fmt(total) + " DA";
  }

  function updatePriceSummary() {
    var bar = document.getElementById("priceSummaryBar");
    if (!bar) return;
    var subtotal = calcSubtotal();
    if (!subtotal) {
      bar.style.display = "none";
      return;
    }
    var pkgPrice = wizardData.packagePrice || 0;
    var total = calcTotal(subtotal, pkgPrice);
    bar.style.display = "block";
    var el = document.getElementById("priceTotal");
    if (el) el.textContent = fmt(total) + " DA";
    el = document.getElementById("priceSubtotal");
    if (el) el.textContent = fmt(subtotal);
    el = document.getElementById("pricePackage");
    if (el) el.textContent = fmt(pkgPrice);
  }

  function collectStepData() {
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden && hidden.value) {
        wizardData.projectTypeSlug = hidden.value;
        var opt = wrapper.querySelector('li[data-value="' + hidden.value + '"]');
        wizardData.projectTypeName = opt ? opt.textContent.trim() : hidden.value;
      }
    }

    var countInput = document.querySelector("[name='floor_count']");
    if (countInput) {
      var count = parseInt(countInput.value) || 1;
      if (count > 0) {
        var floorNames = [
          "Ground Floor", "First Floor", "Second Floor", "Third Floor",
          "Fourth Floor", "Fifth Floor", "Sixth Floor", "Seventh Floor",
          "Eighth Floor", "Ninth Floor", "Tenth Floor", "Eleventh Floor",
          "Twelfth Floor", "Thirteenth Floor", "Fourteenth Floor", "Fifteenth Floor",
          "Sixteenth Floor", "Seventeenth Floor", "Eighteenth Floor", "Nineteenth Floor",
          "Twentieth Floor"
        ];
        wizardData.floors = [];
        for (var i = 0; i < count; i++) {
          wizardData.floors.push(floorNames[i] || "Floor " + (i + 1));
        }
      }
    }

    var floorGroups = document.querySelectorAll(".floor-space-group");
    if (floorGroups.length > 0) {
      wizardData.spaces = [];
      floorGroups.forEach(function (group) {
        var fi = parseInt(group.dataset.floorIndex);
        group.querySelectorAll(".space-checkbox-card.selected").forEach(function (card) {
          var sid = card.dataset.spaceId;
          if (sid && sid !== "custom") {
            var nameEl = card.querySelector(".wiz-space-name");
            wizardData.spaces.push({
              floorIndex: fi,
              spaceId: parseInt(sid),
              name: nameEl ? nameEl.textContent.trim() : "Space",
              price: parseFloat(card.dataset.price) || 0,
            });
          }
        });
      });
    }

    var qForm = document.getElementById("questionnaireForm");
    if (qForm) {
      wizardData.questionnaire = {};
      qForm.querySelectorAll("[name]").forEach(function (el) {
        wizardData.questionnaire[el.name] = el.value.trim();
      });
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      collectStepData();
      var params = {};
      if (currentStep - 1 === 0) {
        params.floor_count = wizardData.floors.length || 1;
        if (wizardData.projectTypeSlug) params.project_type = wizardData.projectTypeSlug;
      }
      loadStep(currentStep - 1, Object.keys(params).length > 0 ? params : undefined);
    }
  }

  function nextStep() {
    collectStepData();

    if (currentStep === 0) {
      if (!wizardData.projectTypeSlug) {
        showWarning("Please select a project type.");
        return;
      }
      var countInput = document.querySelector("[name='floor_count']");
      var floorCount = countInput ? parseInt(countInput.value) : 1;
      if (!floorCount || floorCount < 1) {
        showWarning("Please enter at least 1 floor.");
        return;
      }
      var hasSpaces = document.querySelectorAll(".space-checkbox-card.selected").length > 0;
      if (!hasSpaces) {
        showWarning("Please select at least one space.");
        return;
      }
      loadStep(1);
      return;
    }

    if (currentStep === 1) {
      startInspirationModals();
      return;
    }

    if (currentStep === 2) {
      if (!validateQuestionnaire()) return;
      loadStep(currentStep + 1);
      return;
    }

    if (currentStep === TOTAL_STEPS - 1) {
      submitRequest();
      return;
    }

    loadStep(currentStep + 1);
  }

  function validateQuestionnaire() {
    var q = wizardData.questionnaire;
    var msg;
    if (!q.first_name) msg = "Please enter your first name.";
    else if (!q.last_name) msg = "Please enter your last name.";
    else if (!q.email) msg = "Please enter your email address.";
    else if (q.email.indexOf("@") === -1) msg = "Please enter a valid email address.";
    else if (!q.phone) msg = "Please enter your phone number.";
    if (msg) {
      showWarning(msg);
      return false;
    }
    return true;
  }

  function submitRequest() {
    var terms = document.getElementById("acceptTerms");
    if (terms && !terms.checked) {
      showWarning("Please accept the terms and conditions.");
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
      inspirations: JSON.stringify(wizardData.inspirations),
      questionnaire: JSON.stringify(wizardData.questionnaire),
      total: document.getElementById("factGrandTotal")
        ? document.getElementById("factGrandTotal").textContent.replace(/[^0-9]/g, "")
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
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          document.getElementById("confirmProjectNumber").textContent =
            data.project_number || "—";
          document.getElementById("confirmTotal").textContent =
            document.getElementById("factGrandTotal")
              ? document.getElementById("factGrandTotal").textContent
              : "—";
          var cModal = new bootstrap.Modal(
            document.getElementById("confirmationModal")
          );
          cModal.show();
          document.querySelectorAll(".wiz-step-item").forEach(function (el) {
            el.classList.remove("active");
            el.classList.add("completed");
          });
          document.getElementById("progressBar").style.width = "100%";
        } else {
          var errMsg = data.errors ? data.errors.join("<br>") : "Submission failed.";
          var errDiv = document.createElement("div");
          errDiv.className = "alert alert-danger text-center py-2 mb-3";
          errDiv.style.cssText = "font-size:0.85rem;border-radius:10px;";
          errDiv.innerHTML = errMsg;
          var summaryTotal2 = document.getElementById("facturationCard");
          if (summaryTotal2) summaryTotal2.parentNode.insertBefore(errDiv, summaryTotal2.nextSibling);
          btn.disabled = false;
          btn.innerHTML = "Submit";
        }
      })
      .catch(function () {
        var errDiv2 = document.createElement("div");
        errDiv2.className = "alert alert-danger text-center py-2 mb-3";
        errDiv2.style.cssText = "font-size:0.85rem;border-radius:10px;";
        errDiv2.textContent = "An error occurred. Please try again.";
        var summaryTotal3 = document.getElementById("facturationCard");
        if (summaryTotal3) summaryTotal3.parentNode.insertBefore(errDiv2, summaryTotal3.nextSibling);
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
