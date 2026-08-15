"""
Custom channel manager for django-eventstream.
Ensures users can only read their own notification channels.
"""

import logging

from django_eventstream.channelmanager import DefaultChannelManager

logger = logging.getLogger(__name__)


class NotificationChannelManager(DefaultChannelManager):
    """
    Channel manager that restricts access to user-specific channels.

    Channel format: user-{user_id}
    Only authenticated users can access their own user-{user_id} channel.
    """

    def can_read_channel(self, user, channel):
        """
        Check if user has permission to read from a channel.
        """
        # Superusers can read any channel
        if user and user.is_superuser:
            return True

        if not user or not user.is_authenticated:
            return False

        # 1. User notifications channel: user-{user_id}
        if channel.startswith("user-"):
            try:
                channel_user_id = int(channel.split("-")[1])
                return user.id == channel_user_id
            except (IndexError, ValueError):
                return False

        # 2. Design Request Chat channel: design-request-{uuid}
        if channel.startswith("design-request-"):
            uuid_str = channel.replace("design-request-", "").strip()
            if not uuid_str:
                return False
            try:
                from dashboard.models import DesignRequest
                dr = DesignRequest.objects.filter(uuid=uuid_str).select_related("client", "designer").first()
                if not dr:
                    return False
                return bool(dr.client_id == user.id or dr.designer_id == user.id or user.is_staff or getattr(getattr(user, "profile", None), "is_admin_role", False))
            except Exception:
                return False

        return False