from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.urls import reverse
from django.db import transaction
from django.core.validators import validate_email, ValidationError
from django.utils.translation import gettext as _

from ..models import Invitation
from ..decorator import admin_required, with_pagination
from ..email_service import send_invitation_email
from ..utils import humanize_error


@admin_required
@with_pagination(per_page=12, template="dashboard/admin/invitation_list", queryset_name="invitations")
def invitation_list(request):
    invitations = Invitation.objects.select_related("created_by").order_by("-created_at")
    return {
        "invitations": invitations,
        "total_count": invitations.count(),
    }


@admin_required
def invitation_create(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})

    email = request.POST.get("email", "").strip().lower()
    name = request.POST.get("name", "").strip()
    phone_number = request.POST.get("phone_number", "").strip()

    errors = []
    if not email:
        errors.append(_("Email address is required."))
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors.append(_("Please enter a valid email address."))

    if errors:
        return JsonResponse({"success": False, "errors": errors})

    try:
        with transaction.atomic():
            invitation = Invitation.objects.create(
                email=email,
                name=name,
                phone_number=phone_number,
                created_by=request.user,
            )
            # Send invitation email with signup link
            send_invitation_email(invitation, request)

        return JsonResponse({
            "success": True,
            "message": _("Invitation created and email sent successfully to %(email)s.") % {"email": email},
            "redirect_url": reverse("dash:invitation_list"),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": humanize_error(e)})


@admin_required
def invitation_resend(request, pk):
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})

    invitation = get_object_or_404(Invitation, pk=pk)
    if invitation.is_accepted:
        return JsonResponse({
            "success": False,
            "errors": [_("This invitation has already been accepted.")],
        })

    try:
        send_invitation_email(invitation, request)
        return JsonResponse({
            "success": True,
            "message": _("Invitation email resent successfully to %(email)s.") % {"email": invitation.email},
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": humanize_error(e)})


@admin_required
def invitation_delete(request, pk):
    if request.method != "POST":
        return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})

    invitation = get_object_or_404(Invitation, pk=pk)
    email = invitation.email
    try:
        invitation.delete()
        return JsonResponse({
            "success": True,
            "message": _("Invitation for %(email)s deleted successfully.") % {"email": email},
            "redirect_url": reverse("dash:invitation_list"),
        })
    except Exception as e:
        return JsonResponse({"success": False, "errors": humanize_error(e)})
