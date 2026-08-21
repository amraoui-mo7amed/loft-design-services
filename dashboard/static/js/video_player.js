(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    function isEmbeddable(url) {
      if (!url || typeof url !== "string") return false;
      return /youtube\.com|youtu\.be|vimeo\.com|^[\w-]{11}$/.test(url.trim());
    }

    function buildEmbedUrl(url) {
      if (!url) return "";
      url = url.trim();

      // Raw 11-char YouTube ID
      if (/^[\w-]{11}$/.test(url)) {
        return "https://www.youtube-nocookie.com/embed/" + url + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1";
      }

      // YouTube URL parser
      var ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
      );
      if (ytMatch) {
        var videoId = ytMatch[1];
        var params = new URLSearchParams();
        params.set("autoplay", "1");
        params.set("rel", "0");
        params.set("modestbranding", "1");
        params.set("playsinline", "1");
        params.set("enablejsapi", "1");
        return "https://www.youtube-nocookie.com/embed/" + videoId + "?" + params.toString();
      }

      // Vimeo URL parser
      var vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) {
        var vimeoId = vimeoMatch[1];
        return "https://player.vimeo.com/video/" + vimeoId + "?autoplay=1&dnt=1";
      }

      return url;
    }

    function renderEmpty(stage) {
      if (!stage) return;
      stage.innerHTML =
        '<div class="video-widget-empty" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #8b95a1;"><i class="fas fa-video" style="font-size: 2.4rem; opacity: 0.35;"></i><p style="margin: 0; font-size: 0.85rem;">Aucune vidéo disponible.</p></div>';
    }

    function renderVideo(stage, url) {
      if (!stage) return;
      if (!url || !isEmbeddable(url)) {
        renderEmpty(stage);
        return;
      }
      var frame = document.createElement("iframe");
      frame.src = buildEmbedUrl(url);
      frame.setAttribute("title", "Vidéo LOFT DESIGN");
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen");
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

    window.openVideoPlayer = function (url, title) {
      var widget = document.querySelector(".video-widget-overlay");
      if (!widget) return;
      if (widget.parentNode !== document.body) {
        document.body.appendChild(widget);
      }
      var stage = widget.querySelector(".video-widget-stage");
      var titleEl = widget.querySelector(".video-widget-title span") || widget.querySelector("#videoPlayerWidgetTitle");
      if (titleEl) {
        titleEl.textContent = title || "LOFT DESIGN";
      }
      renderVideo(stage, url);
      widget.style.display = "flex";
    };

    // Delegate click handler on document to handle triggers dynamically loaded via AJAX
    document.addEventListener("click", function (e) {
      var selector = "button[data-video-url], a[data-video-url], .btn-service-video-play, .pkg-video-btn, [data-video-trigger], .videoCard, .videoInsideBtn, [data-explain-video]";
      var trigger = e.target.closest ? e.target.closest(selector) : null;

      // Fallback if pointer capture or inner wrapper set event target to a parent container
      if (!trigger && e.clientX && e.clientY) {
        var elAtPoint = document.elementFromPoint(e.clientX, e.clientY);
        if (elAtPoint && elAtPoint.closest) {
          trigger = elAtPoint.closest(selector);
        }
      }

      if (!trigger) return;

      var url = trigger.getAttribute("data-video-url") ||
                trigger.getAttribute("data-youtube-id") ||
                trigger.getAttribute("data-explain-video") ||
                "";
      if (!url) return;

      e.preventDefault();
      e.stopPropagation();

      var title = trigger.getAttribute("data-video-title") ||
                  trigger.getAttribute("data-explain-title") ||
                  trigger.innerText.trim() ||
                  "LOFT DESIGN";

      window.openVideoPlayer(url, title);
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