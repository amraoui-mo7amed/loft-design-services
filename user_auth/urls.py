from django.urls import path
from . import views

app_name = "user_auth"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("profile/", views.profile_edit_view, name="profile_edit"),
    path("invitation/<uuid:uuid>/", views.invitation_signup_view, name="invitation_signup"),
]
