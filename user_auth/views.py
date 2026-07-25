from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User

from .models import UserProfile
from .forms import ProfileForm
from .utils import (
    user_profile_upload_path,
)


@login_required
def profile_edit_view(request):
    profile = request.user.profile
    if request.method == "POST":
        user = request.user
        user.first_name = request.POST.get("first_name", "")
        user.last_name = request.POST.get("last_name", "")
        user.email = request.POST.get("email", "")
        user.save()

        profile.phone_number = request.POST.get("phone_number", "")
        profile.birth_date = request.POST.get("birth_date") or None
        profile.sex = request.POST.get("sex", "")
        profile.address = request.POST.get("address", "")
        profile.bio = request.POST.get("bio", "")

        if "profile_picture" in request.FILES:
            profile.profile_picture = request.FILES["profile_picture"]

        profile.save()

        return JsonResponse({"success": True})

    sex_choices = [c for c in UserProfile.sexChoices.choices if c[0] in ("male", "female")]
    return render(request, "auth/profile_edit.html", {
        "sex_choices": sex_choices,
    })


def login_view(request):
    if request.user.is_authenticated:
        return redirect(reverse_lazy("dash:dash_home"))

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        errors = []

        if not username or not password:
            errors.append(_("Please fill in all required fields."))

        if errors:
            return JsonResponse({"success": False, "errors": errors})

        if "@" in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                pass

        try:
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse(
                    {"success": True, "redirect_url": reverse("dash:dash_home")}
                )
            else:
                return JsonResponse(
                    {
                        "success": False,
                        "errors": [
                            _("Invalid username or password. Please try again.")
                        ],
                    }
                )
        except Exception as e:
            return JsonResponse({"success": False, "errors": [str(e)]})

    return render(request, "auth/login.html")


def logout_view(request):
    logout(request)
    return redirect("user_auth:login")

