from django.urls import path
from frontend.views import design_service

app_name = "frontend"

urlpatterns = [
    path("", design_service.landing_view, name="home"),
]
