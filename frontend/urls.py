from django.urls import path
from frontend.views import main, portfolio, gallery

app_name = "frontend"

urlpatterns = [
    path("", main.home_view, name="home"),
    path("order/", main.order_view, name="order"),
    path("order/pack/", main.pack_select_view, name="pack_select"),
    path("contact/submit/", main.submit_contact, name="contact_submit"),
    path("contact/submit-alias/", main.submit_contact, name="submit_contact"),
    path("portfolio/", portfolio.portfolio_list, name="portfolio_list"),
    path("portfolio/<int:pk>/", portfolio.portfolio_detail, name="portfolio_detail"),
    path("gallery/", gallery.space_gallery, name="space_gallery"),
    path("gallery/<int:space_pk>/", gallery.space_gallery, name="space_gallery"),
    path("gallery/space/<int:space_pk>/", gallery.space_gallery, name="space_gallery_space"),
    path("gallery/select/<uuid:token>/", gallery.client_gallery_selection, name="gallery_client_selection"),
    path("gallery/select/<uuid:token>/submit/", gallery.submit_client_gallery_selection, name="gallery_client_selection_submit"),
]
