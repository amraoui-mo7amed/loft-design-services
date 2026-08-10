from django.urls import path
from frontend.views import main, portfolio

app_name = "frontend"

urlpatterns = [
    path("", main.home_view, name="home"),
    path("order/", main.order_view, name="order"),
    path("order/pack/", main.pack_select_view, name="pack_select"),
    path("portfolio/", portfolio.portfolio_list, name="portfolio_list"),
    path("portfolio/<int:pk>/", portfolio.portfolio_detail, name="portfolio_detail"),
]
