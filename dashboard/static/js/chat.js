(function () {
    "use strict";

    var ChatWidget = {
        init: function (containerId, projectUuid) {
            this.container = document.getElementById(containerId);
            this.uuid = projectUuid;
            if (!this.container) return;
            this.loadMessages();
            this.bindSend();
            this.connectEventStream();
        },

        loadMessages: function () {
            var self = this;
            fetch("/api/design/chat/" + this.uuid + "/messages/")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.data) {
                        self.renderMessages(data.data);
                    }
                });
        },

        renderMessages: function (messages) {
            var list = this.container.querySelector(".chat-messages-list");
            if (!list) return;
            list.innerHTML = "";
            messages.forEach(function (msg) {
                var div = document.createElement("div");
                div.className = "chat-message mb-2 d-flex" + (msg.is_mine ? " justify-content-end" : "");
                div.innerHTML = '<div class="chat-bubble ' + (msg.is_mine ? "bg-primary text-white" : "bg-light") + ' rounded-3 p-2 px-3" style="max-width:75%;"><small class="fw-bold d-block">' + msg.sender + '</small><span>' + (msg.message || "") + '</span>' + (msg.attachment_url ? '<br><a href="' + msg.attachment_url + '" target="_blank" class="small"><i class="fas fa-paperclip"></i> Attachment</a>' : "") + '<small class="d-block text-muted mt-1" style="font-size:0.65rem;">' + new Date(msg.created_at).toLocaleTimeString() + "</small></div></div>";
                list.appendChild(div);
            });
            list.scrollTop = list.scrollHeight;
        },

        bindSend: function () {
            var self = this;
            var form = this.container.querySelector(".chat-send-form");
            if (!form) return;
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var input = form.querySelector(".chat-input");
                var text = input.value.trim();
                if (!text) return;
                var fd = new FormData();
                fd.append("message", text);
                fetch("/api/design/chat/" + self.uuid + "/send/", {
                    method: "POST",
                    body: fd,
                    headers: { "X-CSRFToken": self.getCsrfToken() },
                })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        input.value = "";
                        self.loadMessages();
                    }
                });
            });
        },

        connectEventStream: function () {
            var self = this;
            if (typeof EventSource !== "undefined") {
                var es = new EventSource("/events/?channel=design-request-" + this.uuid);
                es.addEventListener("new_message", function () {
                    self.loadMessages();
                });
            }
        },

        getCsrfToken: function () {
            var match = document.cookie.match(/csrftoken=([^;]+)/);
            return match ? match[1] : "";
        },
    };

    window.ChatWidget = ChatWidget;
})();
