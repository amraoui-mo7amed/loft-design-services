from django.urls import path
from frontend.views import main

app_name = "frontend"

urlpatterns = [
    path("", main.home_view, name="home"),
    path("order/", main.order_view, name="order"),
]
