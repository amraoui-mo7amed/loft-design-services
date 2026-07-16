(function () {
  "use strict";

  const stepUrls = [
    "/request/step/project-type/",
    "/request/step/spaces/",
    "/request/step/packages/",
    "/request/step/inspirations/",
    "/request/step/questionnaire/",
    "/request/step/summary/",
  ];

  const TOTAL_STEPS = 7;
  let currentStep = 0;
  const wizardData = {
    projectTypeSlug: null,
    floors: [],
    spaces: [],
    packageId: null,
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
    if (index === TOTAL_STEPS - 2) {
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
        bindSpacesStep();
        break;
      case 2:
        bindPackagesStep();
        break;
      case 3:
        bindInspirationsStep();
        break;
      case 4:
        bindQuestionnaireStep();
        break;
      case 5:
        bindSummaryStep();
        break;
    }
  }

  function bindQuestionnaireStep() {
    var roleCards = document.querySelectorAll(".wiz-role-card");
    var body = document.querySelector(".wiz-questionnaire-body");
    var normalRadio = document.getElementById("ctypeNormal");
    var profRadio = document.getElementById("ctypeProfessional");
    var normalFields = document.getElementById("normalFields");
    var profFields = document.getElementById("professionalFields");
    var togglesBound = false;
    if (!roleCards.length || !body) return;

    function toggleFields() {
      var showProf = profRadio.checked;
      normalFields.style.display = showProf ? "none" : "block";
      profFields.style.display = showProf ? "block" : "none";
      document.querySelectorAll(".wiz-professional-only").forEach(function (el) {
        el.style.display = showProf ? "block" : "none";
      });
    }

    function revealForm() {
      body.style.display = "block";
      body.style.animation = "none";
      void body.offsetWidth;
      body.style.animation = "wizFadeSlideIn 0.4s ease";
      if (!togglesBound) {
        if (normalRadio && profRadio && normalFields && profFields) {
          normalRadio.addEventListener("change", toggleFields);
          profRadio.addEventListener("change", toggleFields);
          togglesBound = true;
        }
      }
      toggleFields();
    }

    // If a role was already selected (navigating back)
    if (normalRadio && normalRadio.checked) {
      revealForm();
      return;
    }
    if (profRadio && profRadio.checked) {
      revealForm();
      return;
    }

    roleCards.forEach(function (card) {
      card.addEventListener("click", function () {
        var inp = card.querySelector("input[type='radio']");
        if (inp) {
          roleCards.forEach(function (c) {
            c.querySelector("input[type='radio']").checked = false;
          });
          inp.checked = true;
          revealForm();
        }
      });
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

  function bindInspirationsStep() {
    document.querySelectorAll(".inspiration-card").forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("selected");
      });
    });
  }

  function bindSummaryStep() {
    var pt = document.getElementById("summaryProjectType");
    if (pt) {
      if (wizardData.projectTypeSlug) {
        var wrapper = document.getElementById("projectTypeSelect");
        if (wrapper) {
          var hidden = wrapper.querySelector('input[type="hidden"]');
          if (hidden) {
            var li = wrapper.querySelector('li[data-value="' + hidden.value + '"]');
            pt.textContent = li ? li.textContent : wizardData.projectTypeSlug;
          }
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
    var inspEl = document.getElementById("summaryInspirations");
    if (inspEl) {
      var count = 0;
      Object.keys(wizardData.inspirations).forEach(function (key) {
        count += wizardData.inspirations[key].length;
      });
      inspEl.textContent = count ? count + " images selected" : "None selected";
    }
    updateSummaryPrice();
  }

  function updateSummaryPrice() {
    var subtotal = 0;
    var packagePrice = 0;
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
    var taxable = subtotal + packagePrice;
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
      })
      .catch(function () {});
  }

  function collectStepData() {
    // Project type from custom_select
    var wrapper = document.getElementById("projectTypeSelect");
    if (wrapper) {
      var hidden = wrapper.querySelector('input[type="hidden"]');
      if (hidden && hidden.value) {
        wizardData.projectTypeSlug = hidden.value;
      }
    }

    // Floors (generated from count input)
    var countInput = document.querySelector("[name='floor_count']");
    var count = countInput ? parseInt(countInput.value) : 1;
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

    // Spaces
    wizardData.spaces = [];
    document.querySelectorAll(".floor-space-group").forEach(function (group) {
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

    // Inspirations
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

    // Questionnaire (step 4)
    var qBody = document.querySelector(".wiz-questionnaire-body");
    wizardData.questionnaire = {};
    var ctypeNormal = document.getElementById("ctypeNormal");
    var ctypeProf = document.getElementById("ctypeProfessional");
    if (ctypeNormal && ctypeNormal.checked) {
      wizardData.questionnaire.customer_type = "normal";
      document.querySelectorAll("#normalFields [name]").forEach(function (el) {
        wizardData.questionnaire[el.name] = el.value;
      });
    } else if (ctypeProf && ctypeProf.checked) {
      wizardData.questionnaire.customer_type = "professional";
      document.querySelectorAll("#professionalFields [name]").forEach(function (el) {
        wizardData.questionnaire[el.name] = el.value;
      });
    }
    document.querySelectorAll(".wiz-professional-only input, .wiz-professional-only select, .wiz-professional-only textarea").forEach(function (el) {
      if (el.type === "checkbox") {
        wizardData.questionnaire[el.name] = el.checked;
      } else if (el.name) {
        wizardData.questionnaire[el.name] = el.value;
      }
    });
  }

  function prevStep() {
    if (currentStep > 0) {
      collectStepData();
      loadStep(currentStep - 1);
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
    }

    if (currentStep === TOTAL_STEPS - 2) {
      submitRequest();
      return;
    }

    var params = null;
    if (currentStep === 0) {
      var floorCount2 = document.querySelector("[name='floor_count']");
      params = {
        floor_count: floorCount2 ? parseInt(floorCount2.value) : 1,
        project_type: wizardData.projectTypeSlug || "",
      };
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
