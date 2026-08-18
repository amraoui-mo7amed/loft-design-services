(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    function isEmbeddable(url) {
      return /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");
    }

    function buildEmbedUrl(url) {
      if (!url) return "";

      // YouTube URL parser
      var ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
      );
      if (ytMatch) {
        var videoId = ytMatch[1];
        var queryParams = "";
        var qIdx = url.indexOf("?");
        if (qIdx !== -1) {
          try {
            var searchParams = new URLSearchParams(url.substring(qIdx));
            searchParams.delete("v"); // Remove video ID parameter if it was in query string
            searchParams.set("autoplay", "1");
            queryParams = searchParams.toString();
          } catch (e) {
            queryParams = "autoplay=1";
          }
        } else {
          queryParams = "autoplay=1";
        }
        return "https://www.youtube.com/embed/" + videoId + "?" + queryParams;
      }

      // Vimeo URL parser
      var vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) {
        var vimeoId = vimeoMatch[1];
        return "https://player.vimeo.com/video/" + vimeoId + "?autoplay=1";
      }

      return url;
    }

    function renderEmpty(stage) {
      if (!stage) return;
      stage.innerHTML =
        '<div class="video-widget-empty" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #8b95a1;"><i class="fas fa-video" style="font-size: 2.4rem; opacity: 0.35;"></i><p style="margin: 0; font-size: 0.85rem;">No video available.</p></div>';
    }

    function renderVideo(stage, url) {
      if (!stage) return;
      if (!url || !isEmbeddable(url)) {
        renderEmpty(stage);
        return;
      }
      var frame = document.createElement("iframe");
      frame.src = buildEmbedUrl(url);
      frame.setAttribute("title", "YouTube video player");
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      frame.setAttribute("allowfullscreen", "");

      frame.className = "video-player-frame";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "none";
      frame.style.background = "#000";
      stage.innerHTML = "";
      stage.appendChild(frame);
    }

    // Delegate click handler on document to handle triggers dynamically loaded via AJAX
    document.addEventListener("click", function (e) {
      // 1. Check widgets with target-btn attribute first
      var widgets = document.querySelectorAll(".video-widget-overlay[target-btn]");
      var triggered = false;

      widgets.forEach(function (widget) {
        var targetSelector = widget.getAttribute("target-btn");
        if (!targetSelector) return;

        var trigger = e.target.closest(targetSelector);
        if (!trigger) return;

        // If nested inside a card, make sure this widget belongs to the same card as the trigger
        var triggerCard = trigger.closest(".pkg-card");
        var widgetCard = widget.originalCard || widget.closest(".pkg-card");
        if (triggerCard && widgetCard && triggerCard !== widgetCard) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        triggered = true;

        var url = widget.getAttribute("video-url") || trigger.getAttribute("data-video-url") || "";
        var title = trigger.getAttribute("data-video-title") || widget.getAttribute("data-video-title") || "Video Preview";

        // Move to body to prevent transform/container clipping and ensure centering
        if (widget.parentNode !== document.body) {
          if (triggerCard) {
            widget.originalCard = triggerCard;
          }
          document.body.appendChild(widget);
        }

        var stage = widget.querySelector(".video-widget-stage");
        var titleEl = widget.querySelector(".video-widget-title span") || widget.querySelector("#videoPlayerWidgetTitle");

        if (titleEl) {
          titleEl.textContent = title;
        }

        renderVideo(stage, url);
        widget.style.display = "flex";
      });

      if (triggered) return;

      // 2. Fallback to explicit video trigger elements with data-video-url
      var trigger = e.target.closest("button[data-video-url], a[data-video-url], .btn-service-video-play, .pkg-video-btn, [data-video-trigger]");
      if (!trigger) return;

      var url = trigger.getAttribute("data-video-url") || "";
      if (!url) return;

      e.preventDefault();
      e.stopPropagation();

      var title = trigger.getAttribute("data-video-title") || "Video Preview";

      var card = trigger.closest(".pkg-card");
      var widget = null;
      if (card) {
        widget = card.querySelector(".video-widget-overlay");
        if (!widget) {
          // If the widget was already moved to body, find it by checking originalCard reference
          var allWidgets = document.querySelectorAll(".video-widget-overlay");
          for (var i = 0; i < allWidgets.length; i++) {
            if (allWidgets[i].originalCard === card) {
              widget = allWidgets[i];
              break;
            }
          }
        }
      }

      if (!widget) {
        widget = document.querySelector(".video-widget-overlay");
      }
      if (!widget) return;

      // Move to body to prevent transform/container clipping and ensure centering, storing card reference
      if (widget.parentNode !== document.body) {
        if (card) {
          widget.originalCard = card;
        }
        document.body.appendChild(widget);
      }

      var stage = widget.querySelector(".video-widget-stage");
      var titleEl = widget.querySelector(".video-widget-title span") || widget.querySelector("#videoPlayerWidgetTitle");

      if (titleEl) {
        titleEl.textContent = title;
      }

      renderVideo(stage, url);
      widget.style.display = "flex";
    });

    // Handle close button click via delegation on document
    document.addEventListener("click", function (e) {
      var closeBtn = e.target.closest(".video-widget-close");
      if (!closeBtn) return;
      e.preventDefault();
      e.stopPropagation();

      var widget = closeBtn.closest(".video-widget-overlay");
      if (widget) {
        widget.style.display = "none";
        var stage = widget.querySelector(".video-widget-stage");
        renderEmpty(stage);
      }
    });

    // Dismiss when clicking overlay background via delegation
    document.addEventListener("click", function (e) {
      var widget = e.target.closest(".video-widget-overlay");
      if (widget && e.target === widget) {
        widget.style.display = "none";
        var stage = widget.querySelector(".video-widget-stage");
        renderEmpty(stage);
      }
    });

    // Dismiss with Escape key for any open widgets
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var widgets = document.querySelectorAll(".video-widget-overlay");
        widgets.forEach(function (widget) {
          if (widget.style.display === "flex") {
            widget.style.display = "none";
            var stage = widget.querySelector(".video-widget-stage");
            renderEmpty(stage);
          }
        });
      }
    });

    // Auto-load video if "video-url" is supplied on the widget directly via template context and auto-load attribute is present
    var widgets = document.querySelectorAll(".video-widget-overlay");
    widgets.forEach(function (widget) {
      var initialUrl = widget.getAttribute("video-url");
      if (widget.hasAttribute("auto-load") && initialUrl && initialUrl.trim() !== "" && initialUrl.trim() !== "{{ video_url }}") {
        var stage = widget.querySelector(".video-widget-stage");
        renderVideo(stage, initialUrl);
        widget.style.display = "flex";
      }
    });
  });
})();