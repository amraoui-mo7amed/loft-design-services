import secrets
import string

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from user_auth.models import UserProfile
from django.db.models import Q, Count
from django.utils.translation import gettext as _
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.urls import reverse
from django.db import transaction

from dashboard.email_service import send_email
from dashboard.decorator import admin_required
from dashboard.utils import notify_user
from dashboard.models import DesignRequest


@admin_required
def designer_list(request):
    query = request.GET.get("q", "")
    status = request.GET.get("status", "")

    profiles_list = (
        UserProfile.objects.select_related("user")
        .filter(role=UserProfile.Role.DESIGNER)
        .annotate(project_count=Count("user__assigned_requests"))
        .order_by("-created_at")
    )

    if query:
        profiles_list = profiles_list.filter(
            Q(user__email__icontains=query)
            | Q(user__username__icontains=query)
            | Q(user__first_name__icontains=query)
            | Q(user__last_name__icontains=query)
        )

    if status:
        is_approved = status == "approved"
        profiles_list = profiles_list.filter(is_approved=is_approved)

    paginator = Paginator(profiles_list, 12)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    status_choices = [
        ("", _("All Status")),
        ("approved", _("Approved")),
        ("pending", _("Pending")),
    ]
    role_choices = UserProfile.Role.choices

    unassigned = DesignRequest.objects.filter(designer__isnull=True, status=DesignRequest.Status.PENDING)
    project_choices = [("", _("Select a project..."))] + [(p.pk, f"{p.project_number} — {p.project_name}") for p in unassigned]

    return render(request, "users/designer_list.html", {
        "page_obj": page_obj,
        "profiles": page_obj,
        "status_choices": status_choices,
        "role_choices": role_choices,
        "query": query,
        "selected_status": status,
        "unassigned_projects": unassigned,
        "project_choices": project_choices,
    })


@admin_required
def designer_delete(request, pk):
    profile = get_object_or_404(UserProfile, pk=pk, role=UserProfile.Role.DESIGNER)
    if request.method == "POST":
        full_name = profile.user.get_full_name() or profile.user.username
        profile.user.delete()
        return JsonResponse({
            "success": True,
            "message": _("Designer %(name)s deleted successfully.") % {"name": full_name},
            "redirect_url": reverse("dash:designer_list"),
        })
    return redirect("dash:designer_list")


@admin_required
def designer_approve(request, pk):
    profile = get_object_or_404(UserProfile, pk=pk, role=UserProfile.Role.DESIGNER)
    if request.method == "POST":
        profile.is_approved = True
        profile.save()
        full_name = profile.user.get_full_name() or profile.user.username
        return JsonResponse({
            "success": True,
            "message": _("Designer %(name)s approved successfully.") % {"name": full_name},
        })
    return redirect("dash:designer_list")


@admin_required
def add_designer(request):
    if request.method == "POST":
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        email = request.POST.get("email", "").strip()
        phone = request.POST.get("phone", "").strip()

        if not email:
            return JsonResponse({"success": False, "errors": [_("Email is required.")]})
        if not first_name or not last_name:
            return JsonResponse({"success": False, "errors": [_("First and last name are required.")]})

        User = get_user_model()
        if User.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "errors": [_("A user with this email already exists.")]})

        username = email.split("@")[0]
        base = username
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1

        password = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username, email=email, password=password,
                    first_name=first_name, last_name=last_name,
                )
                UserProfile.objects.create(user=user, role=UserProfile.Role.DESIGNER, is_approved=True, phone_number=phone)

                sent = send_email(
                    "dashboard/email/designer_credentials.html",
                    {
                        "user": user,
                        "password": password,
                        "login_url": request.build_absolute_uri(reverse("user_auth:login")),
                        "dashboard_url": request.build_absolute_uri(reverse("dash:designer_projects")),
                    },
                    email,
                    _("Your Designer Account Has Been Created"),
                )

                if not sent:
                    raise Exception(_("Failed to send credentials email."))

            return JsonResponse({
                "success": True,
                "message": _("Designer %(name)s created successfully. Credentials sent to %(email)s.") % {"name": f"{first_name} {last_name}", "email": email},
                "redirect_url": reverse("dash:designer_list"),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": [str(e)]})

    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


@admin_required
def designer_assign(request):
    if request.method == "POST":
        designer_id = request.POST.get("designer_id")
        project_id = request.POST.get("project_id")
        if not designer_id or not project_id:
            return JsonResponse({"success": False, "errors": [_("Designer and project are required.")]})
        project = get_object_or_404(DesignRequest, pk=project_id)
        User = get_user_model()
        designer = get_object_or_404(User, id=designer_id)
        project.designer = designer
        project.save(update_fields=["designer"])
        notify_user(
            designer,
            _("New Assignment"),
            _("You have been assigned to project %(number)s") % {"number": project.project_number},
            "success",
        )
        notify_user(
            project.client,
            _("Designer Assigned"),
            _("Designer %(name)s has been assigned to your project") % {"name": designer.get_full_name()},
            "info",
        )
        return JsonResponse({"success": True, "message": _("Designer assigned successfully.")})
    return JsonResponse({"success": False, "errors": [_("Invalid request.")]})


# Backward-compatible aliases for old URL names
user_list = designer_list
user_delete = designer_delete
user_approve = designer_approve
