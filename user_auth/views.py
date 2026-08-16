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


def invitation_signup_view(request, uuid):
    from dashboard.models import Invitation
    from django.utils import timezone
    from django.db import transaction

    invitation = get_object_or_404(Invitation, uuid=uuid)

    if invitation.is_accepted:
        return render(request, "auth/invitation_already_accepted.html", {
            "invitation": invitation,
        })

    if request.method == "POST":
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        password = request.POST.get("password", "")
        confirm_password = request.POST.get("confirm_password", "")
        phone_number = request.POST.get("phone_number", invitation.phone_number or "").strip()

        errors = []
        if not first_name:
            errors.append(_("First name is required."))
        if not password:
            errors.append(_("Password is required."))
        elif len(password) < 6:
            errors.append(_("Password must be at least 6 characters long."))
        if password != confirm_password:
            errors.append(_("Passwords do not match."))

        if errors:
            return JsonResponse({"success": False, "errors": errors})

        try:
            with transaction.atomic():
                # Check if user with this email already exists
                user = User.objects.filter(email__iexact=invitation.email).first()
                if not user:
                    username_candidate = invitation.email.split("@")[0]
                    base_username = username_candidate
                    suffix = 1
                    while User.objects.filter(username=username_candidate).exists():
                        username_candidate = f"{base_username}{suffix}"
                        suffix += 1

                    user = User.objects.create_user(
                        username=username_candidate,
                        email=invitation.email,
                        first_name=first_name,
                        last_name=last_name,
                        password=password,
                    )
                else:
                    user.first_name = first_name
                    user.last_name = last_name
                    user.set_password(password)
                    user.save()

                # Ensure UserProfile role is Customer (client) and approved
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.role = UserProfile.Role.CUSTOMER
                profile.is_approved = True
                if phone_number:
                    profile.phone_number = phone_number
                profile.save()

                # Mark invitation accepted
                invitation.is_accepted = True
                invitation.accepted_at = timezone.now()
                invitation.save(update_fields=["is_accepted", "accepted_at"])

                # Log user in
                login(request, user, backend="django.contrib.auth.backends.ModelBackend")

            return JsonResponse({
                "success": True,
                "message": _("Welcome to LoftDesign! Your account is active."),
                "redirect_url": reverse("dash:customer_projects"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": [str(e)]})

    # Pre-split name if available
    first_name_initial = ""
    last_name_initial = ""
    if invitation.name:
        parts = invitation.name.split(" ", 1)
        first_name_initial = parts[0]
        if len(parts) > 1:
            last_name_initial = parts[1]

    return render(request, "auth/invitation_signup.html", {
        "invitation": invitation,
        "first_name_initial": first_name_initial,
        "last_name_initial": last_name_initial,
    })


