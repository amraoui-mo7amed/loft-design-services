from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from user_auth import views as user_views
import django_eventstream
from dashboard.views import wizard, wizard_api, chat, file_manager, marketplace
from frontend.views import inquiry


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("user_auth.urls", namespace="user_auth")),
    path("dashboard/", include("dashboard.urls", namespace="dash")),
    path("", include("frontend.urls")),
    path("", include("frontend.urls_design")),
    path("i18n/", include("django.conf.urls.i18n")),
    path("events/", include(django_eventstream.urls)),
    # Wizard API
    path("api/design/project-types/", wizard_api.api_project_types, name="api_project_types"),
    path("api/design/spaces/", wizard_api.api_spaces, name="api_spaces"),
    path("api/design/packages/", wizard_api.api_packages, name="api_packages"),
    path("api/design/options/", wizard_api.api_options, name="api_options"),
    path("api/design/inspirations/", wizard_api.api_inspirations, name="api_inspirations"),
    path("api/design/inquiries/", inquiry.submit_inquiry, name="api_submit_inquiry"),
    path("api/design/calculate-price/", wizard_api.api_calculate_price, name="api_calculate_price"),
    path("api/design/requests/", wizard.submit_design_request, name="api_submit_request"),
    # Chat API
    path("api/design/chat/<uuid:uuid>/send/", chat.send_message, name="api_chat_send"),
    path("api/design/chat/<uuid:uuid>/messages/", chat.get_messages, name="api_chat_messages"),
    # File Manager API
    path("api/design/files/<uuid:uuid>/upload/", file_manager.upload_file, name="api_file_upload"),
    path("api/design/files/<uuid:uuid>/", file_manager.list_files, name="api_file_list"),
    # Marketplace
    path("marketplace/", marketplace.product_list, name="marketplace_list"),
    path("marketplace/<slug:slug>/", marketplace.product_detail, name="marketplace_detail"),
    path("marketplace/cart/", marketplace.cart_view, name="marketplace_cart"),
    path("marketplace/cart/add/<int:product_id>/", marketplace.add_to_cart, name="marketplace_cart_add"),
    path("marketplace/cart/update/<int:item_id>/", marketplace.update_cart_item, name="marketplace_cart_update"),
    path("marketplace/cart/remove/<int:item_id>/", marketplace.remove_from_cart, name="marketplace_cart_remove"),
    path("marketplace/checkout/", marketplace.checkout, name="marketplace_checkout"),
    path("marketplace/checkout/place-order/", marketplace.place_order, name="marketplace_place_order"),
    path("marketplace/orders/", marketplace.order_history, name="marketplace_orders"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
