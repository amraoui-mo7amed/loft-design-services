(function () {
  "use strict";

  const stepUrls = [
    "/request/step/combined/",
    "/request/step/packages/",
    "/request/step/inspirations/",
    "/request/step/questionnaire/",
    "/request/step/summary/",
  ];

  const TOTAL_STEPS = 5;
  let currentStep = 0;
  const wizardData = {
    projectTypeSlug: null,
    floors: [],
    spaces: [],
    packageId: null,
    packagePrice: 0,
    inspirations: {},
    questionnaire: {},
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
        bindInspirationsStep();
        break;
      case 3:
        bindQuestionnaireStep();
        break;
      case 4:
        bindSummaryStep();
        break;
    }
  }

  function bindCombinedStep() {
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden) {
        // Restore from DOM if pre-selected via GET param, else init
        if (!wizardData.projectTypeSlug && hidden.value) {
          wizardData.projectTypeSlug = hidden.value;
        }
        hidden.addEventListener("change", function () {
          wizardData.projectTypeSlug = this.value || null;
        });
      }
    }

    // Use event delegation on the spaces container for space card clicks
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

    // Floor count change
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
    card.dataset.days = "0";
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
        var inlineForm = clone.querySelector(".custom-space-inline");
        if (inlineForm) inlineForm.style.display = "none";
        var addBtn = clone.querySelector(".add-custom-space-btn");
        if (addBtn) addBtn.style.display = "inline-block";
        container.appendChild(clone);
      }
    } else {
      for (var j = current - 1; j >= count; j--) {
        container.removeChild(container.querySelectorAll(".floor-space-group")[j]);
      }
    }
  }

  function bindQuestionnaireStep() {
    // Restore saved values when navigating back
    var form = document.getElementById("questionnaireForm");
    if (!form || !wizardData.questionnaire) return;
    Object.keys(wizardData.questionnaire).forEach(function (key) {
      var inp = form.querySelector('[name="' + key + '"]');
      if (inp) inp.value = wizardData.questionnaire[key] || "";
    });
  }

  function bindProjectTypeStep() {
    wizardData.projectTypeSlug = null;
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden) {
        hidden.addEventListener("change", function () {
          wizardData.projectTypeSlug = this.value || null;
        });
      }
    }
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
  }

  function restoreCombinedStepSelections() {
    var floorInput = document.getElementById("floorCountInput");
    if (floorInput && wizardData.floors.length > 0) {
      floorInput.value = wizardData.floors.length;
    }
    if (wizardData.spaces && wizardData.spaces.length > 0) {
      wizardData.spaces.forEach(function (s) {
        var group = document.querySelector(
          '.floor-space-group[data-floor-index="' + s.floorIndex + '"]'
        );
        if (!group) return;
        var card = group.querySelector(
          '.space-checkbox-card[data-space-id="' + s.spaceId + '"]'
        );
        if (!card) return;
        card.classList.add("selected");
        var cb = card.querySelector(".space-checkbox");
        if (cb) cb.checked = true;
      });
      updateSpacesSubtotal();
    }
  }

  function bindPackagesStep() {
    var cards = document.querySelectorAll(".package-card");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        cards.forEach(function (c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        var radio = card.querySelector(".package-radio");
        if (radio) radio.checked = true;
        wizardData.packageId = card.dataset.packageId;
        wizardData.packagePrice = parseFloat(card.dataset.price) || 0;
        updatePackageStepPrices();
      });
    });

    // Auto-select Basic (first card) or restore previous selection
    if (wizardData.packageId) {
      cards.forEach(function (c) {
        if (c.dataset.packageId === wizardData.packageId) {
          c.classList.add("selected");
          var r = c.querySelector(".package-radio");
          if (r) r.checked = true;
          wizardData.packagePrice = parseFloat(c.dataset.price) || 0;
        }
      });
    } else if (cards.length > 0) {
      var first = cards[0];
      first.classList.add("selected");
      var radio = first.querySelector(".package-radio");
      if (radio) radio.checked = true;
      wizardData.packageId = first.dataset.packageId;
      wizardData.packagePrice = parseFloat(first.dataset.price) || 0;
    }
    updatePackageStepPrices();
  }

  function calcSubtotal() {
    var sum = 0;
    if (wizardData.spaces && wizardData.spaces.length > 0) {
      wizardData.spaces.forEach(function (s) { sum += s.price; });
    }
    return sum;
  }

  function calcTotal(subtotal, packagePrice) {
    var pkg = packagePrice || wizardData.packagePrice || 0;
    var tax = (subtotal + pkg) * 0.19;
    return subtotal + pkg + tax;
  }

  function updatePackageStepPrices() {
    var subtotal = calcSubtotal();
    if (!subtotal) return;
    var pkgPrice = wizardData.packagePrice || 0;
    var total = calcTotal(subtotal, pkgPrice);
    updateEstimateCard(subtotal, pkgPrice, total);
    updatePriceBar(subtotal, pkgPrice, total);
    updateAllPackageCardPrices(subtotal);
  }

  function updateEstimateCard(subtotal, pkgPrice, total) {
    var el = document.getElementById("estSubtotal");
    if (el) el.textContent = Math.round(subtotal).toLocaleString() + " DA";
    el = document.getElementById("estPackagePrice");
    if (el) el.textContent = Math.round(pkgPrice).toLocaleString() + " DA";
    el = document.getElementById("estTotal");
    if (el) el.textContent = Math.round(total).toLocaleString() + " DA";
  }

  function updatePriceBar(subtotal, pkgPrice, total) {
    var bar = document.getElementById("priceSummaryBar");
    if (bar) bar.style.display = "block";
    var el = document.getElementById("priceTotal");
    if (el) el.textContent = Math.round(total).toLocaleString() + " DA";
    el = document.getElementById("priceSubtotal");
    if (el) el.textContent = Math.round(subtotal).toLocaleString();
    el = document.getElementById("pricePackage");
    if (el) el.textContent = Math.round(pkgPrice).toLocaleString();
  }

  function updateAllPackageCardPrices(subtotal) {
    document.querySelectorAll(".package-card").forEach(function (card) {
      var pkgPrice = parseFloat(card.dataset.price) || 0;
      var el = card.querySelector(".pkg-dynamic-price");
      if (el) el.textContent = Math.round(pkgPrice).toLocaleString();
    });
  }

  function bindInspirationsStep() {
    var modalEl = document.getElementById("inspirationGalleryModal");
    if (!modalEl) return;
    var modalGrid = document.getElementById("inspirationModalGrid");
    var modalTitle = document.getElementById("inspirationModalTitle");
    var submitBtn = document.getElementById("inspirationSubmitBtn");
    var bsModal = new bootstrap.Modal(modalEl);
    var activeSpaceId = null;

    if (!wizardData.inspirations) wizardData.inspirations = {};

    function updateCardState(spaceId) {
      var card = document.querySelector(
        '.inspo-space-card[data-space-id="' + spaceId + '"]'
      );
      if (!card) return;
      var ids = wizardData.inspirations[spaceId] || [];
      var done = ids.length > 0;
      card.dataset.completed = done ? "true" : "false";
      var btnText = card.querySelector(".inspo-select-btn span");
      if (btnText) btnText.textContent = done ? "Modify Selection" : "Select Inspiration";
    }

    function enableNextIfAllDone() {
      var allDone = true;
      document.querySelectorAll(".inspo-space-card").forEach(function (c) {
        if (c.dataset.completed !== "true") allDone = false;
      });
      var nextBtn = document.getElementById("nextBtn");
      if (nextBtn) nextBtn.disabled = !allDone;
    }

    // Clean up stale entries for spaces no longer in the DOM
    var currentIds = [];
    document.querySelectorAll(".inspo-space-card").forEach(function (c) {
      currentIds.push(c.dataset.spaceId);
    });
    Object.keys(wizardData.inspirations).forEach(function (sid) {
      if (currentIds.indexOf(sid) === -1) delete wizardData.inspirations[sid];
    });

    // Restore existing selections on the cards
    document.querySelectorAll(".inspo-space-card").forEach(function (card) {
      var sid = card.dataset.spaceId;
      updateCardState(sid);
    });
    enableNextIfAllDone();

    function openSpaceModal(spaceId) {
      activeSpaceId = spaceId;
      var card = document.querySelector(
        '.inspo-space-card[data-space-id="' + spaceId + '"]'
      );
      if (!card) return;

      modalTitle.textContent = card.querySelector(".inspo-space-name").textContent.trim();
      modalGrid.innerHTML = "";

      var dataContainer = card.querySelector(".inspiration-data");
      if (!dataContainer) return;

      dataContainer.querySelectorAll(".inspiration-item").forEach(function (item) {
        var clone = item.cloneNode(true);
        var cardEl = clone.querySelector(".inspiration-card");
        var imgId = parseInt(clone.dataset.imgId);
        if (
          wizardData.inspirations[spaceId] &&
          wizardData.inspirations[spaceId].indexOf(imgId) !== -1
        ) {
          cardEl.classList.add("selected");
        }
        clone.classList.add("col-6");
        clone.addEventListener("click", function () {
          cardEl.classList.toggle("selected");
        });
        modalGrid.appendChild(clone);
      });

      bsModal.show();
    }

    document.querySelectorAll(".select-inspo-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openSpaceModal(this.dataset.spaceId);
      });
    });

    // Also allow clicking on the card itself (excluding the button)
    document.querySelectorAll(".inspo-space-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".select-inspo-btn")) return;
        if (e.target.closest(".inspo-checkmark")) return;
        openSpaceModal(this.dataset.spaceId);
      });
    });

    submitBtn.addEventListener("click", function () {
      if (!activeSpaceId) return;
      var selectedIds = [];
      modalGrid.querySelectorAll(".inspiration-card.selected").forEach(function (c) {
        selectedIds.push(parseInt(c.closest(".inspiration-item").dataset.imgId));
      });
      wizardData.inspirations[activeSpaceId] = selectedIds;
      updateCardState(activeSpaceId);
      bsModal.hide();
      enableNextIfAllDone();
    });
  }

  function bindSummaryStep() {
    var pt = document.getElementById("summaryProjectType");
    if (pt && wizardData.projectTypeSlug) {
      var wrapper = document.getElementById("projectTypeSelect");
      if (wrapper) {
        var hidden = wrapper.querySelector('input[type="hidden"]');
        if (hidden) {
          var li = wrapper.querySelector(
            'li[data-value="' + hidden.value + '"]'
          );
          pt.textContent = li ? li.textContent : wizardData.projectTypeSlug;
        }
      }
    }
    var floorsEl = document.getElementById("summaryFloors");
    if (floorsEl) {
      var names = wizardData.floors.length
        ? wizardData.floors
        : ["Ground Floor"];
      floorsEl.innerHTML = names
        .map(function (n) {
          return "<li>" + n + "</li>";
        })
        .join("");
    }
    var spacesEl = document.getElementById("summarySpaces");
    if (spacesEl) {
      spacesEl.textContent = wizardData.spaces && wizardData.spaces.length
        ? wizardData.spaces.length + " spaces selected"
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
    var inspEl = document.getElementById("summaryInspirations");
    if (inspEl) {
      var count = 0;
      Object.keys(wizardData.inspirations).forEach(function (key) {
        count += wizardData.inspirations[key].length;
      });
      inspEl.textContent = count
        ? count + " images selected"
        : "None selected";
    }
    updateSummaryPrice();
  }

  function updateSummaryPrice() {
    var subtotal = calcSubtotal();
    var elTotal = document.getElementById("summaryTotal");
    var elDelivery = document.getElementById("summaryDelivery");
    if (!subtotal) {
      if (elTotal) elTotal.textContent = "0 DA";
      if (elDelivery) elDelivery.textContent = "Estimated delivery: —";
      return;
    }
    var pkgPrice = wizardData.packagePrice || 0;
    var total = calcTotal(subtotal, pkgPrice);
    if (elTotal)
      elTotal.textContent = Math.round(total).toLocaleString() + " DA";
    if (elDelivery) {
      var days = 1;
      if (wizardData.spaces && wizardData.spaces.length > 0) {
        wizardData.spaces.forEach(function (s) {
          if (s.days > days) days = s.days;
        });
      }
      elDelivery.textContent = "Estimated delivery: " + days + " days";
    }
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
    if (el) el.textContent = Math.round(total).toLocaleString() + " DA";
    el = document.getElementById("priceSubtotal");
    if (el) el.textContent = Math.round(subtotal).toLocaleString();
    el = document.getElementById("pricePackage");
    if (el) el.textContent = Math.round(pkgPrice).toLocaleString();
  }

  function collectStepData() {
    // Project type — only in step 0
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden && hidden.value) {
        wizardData.projectTypeSlug = hidden.value;
      }
    }

    // Floors — only in step 0
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

    // Spaces — only in step 0
    var floorGroups = document.querySelectorAll(".floor-space-group");
    if (floorGroups.length > 0) {
      wizardData.spaces = [];
      floorGroups.forEach(function (group) {
        var fi = parseInt(group.dataset.floorIndex);
        group
          .querySelectorAll(".space-checkbox-card.selected")
          .forEach(function (card) {
            var sid = card.dataset.spaceId;
            if (sid && sid !== "custom") {
              wizardData.spaces.push({
                floorIndex: fi,
                spaceId: parseInt(sid),
                price: parseFloat(card.dataset.price) || 0,
                days: parseInt(card.dataset.days) || 1,
              });
            }
          });
      });
    }

    // Questionnaire — only in step 3
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
      // Pass space_ids when going back to inspirations step
      if (currentStep - 1 === 2) {
        var ids = (wizardData.spaces || []).map(function (s) { return s.spaceId; });
        if (ids.length > 0) params.space_ids = ids.join(",");
      }
      loadStep(currentStep - 1, Object.keys(params).length > 0 ? params : undefined);
    }
  }

  function nextStep() {
    collectStepData();

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
      var countInput = document.querySelector("[name='floor_count']");
      var floorCount = countInput ? parseInt(countInput.value) : 1;
      if (!floorCount || floorCount < 1) {
        var msg2 = document.createElement("div");
        msg2.className = "alert alert-warning text-center py-2 mb-3";
        msg2.style.cssText = "font-size:0.85rem;border-radius:10px;";
        msg2.textContent = "Please enter at least 1 floor.";
        var title2 = document.querySelector(".wiz-step-title");
        if (title2) title2.parentNode.insertBefore(msg2, title2.nextSibling);
        setTimeout(function () { msg2.remove(); }, 2500);
        return;
      }
      var hasSpaces = document.querySelectorAll(".space-checkbox-card.selected").length > 0;
      if (!hasSpaces) {
        var msg3 = document.createElement("div");
        msg3.className = "alert alert-warning text-center py-2 mb-3";
        msg3.style.cssText = "font-size:0.85rem;border-radius:10px;";
        msg3.textContent = "Please select at least one space.";
        var title3 = document.querySelector(".wiz-step-title");
        if (title3) title3.parentNode.insertBefore(msg3, title3.nextSibling);
        setTimeout(function () { msg3.remove(); }, 2500);
        return;
      }
    }

    // Pass space_ids when going to inspirations step
    if (currentStep === 1) {
      var ids = [];
      if (wizardData.spaces) {
        wizardData.spaces.forEach(function (s) { ids.push(s.spaceId); });
      }
      loadStep(2, ids.length > 0 ? { space_ids: ids.join(",") } : undefined);
      return;
    }

    if (currentStep === 2) {
      loadStep(currentStep + 1);
      return;
    }

    // Validate questionnaire before going to summary
    if (currentStep === 3) {
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
      var err = document.createElement("div");
      err.className = "alert alert-warning text-center py-2 mb-3";
      err.style.cssText = "font-size:0.85rem;border-radius:10px;";
      err.textContent = msg;
      var title = document.querySelector(".wiz-step-title");
      if (title) title.parentNode.insertBefore(err, title.nextSibling);
      setTimeout(function () { err.remove(); }, 2500);
      return false;
    }
    return true;
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
          document.getElementById("confirmProjectNumber").textContent =
            data.project_number || "—";
          document.getElementById("confirmTotal").textContent =
            document.getElementById("summaryTotal")
              ? document.getElementById("summaryTotal").textContent
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
          var summaryTotal2 = document.querySelector(".wiz-summary-total");
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
        var summaryTotal3 = document.querySelector(".wiz-summary-total");
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
