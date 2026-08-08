import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from decouple import config
from dashboard.models import Inquiry
from dashboard.utils import notify_user


@require_POST
@csrf_exempt
def submit_inquiry(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({"success": False, "error": "Invalid request data."})

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    spaces = data.get("spaces", [])
    inspirations = data.get("inspirations", {})
    total = data.get("total", "0")

    if not all([first_name, last_name, email, phone]):
        return JsonResponse({"success": False, "error": "All fields are required."})

    inquiry = Inquiry.objects.create(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        spaces=spaces,
        inspirations=inspirations,
        total=total,
    )

    space_names = ", ".join(s.get("name", "") for s in spaces)
    total_display = f"{float(total or 0):g}"
    subject = f"New Design Inquiry from {first_name} {last_name}"
    msg = (
        f"Name: {first_name} {last_name}\n"
        f"Email: {email}\n"
        f"Phone: {phone}\n"
        f"Selected Spaces: {space_names}\n"
        f"Total Estimate: {total_display} DA\n"
    )

    try:
        admin_email = config("ADMIN_EMAIL", default="admin@loftdesign.com")
        send_mail(subject, msg, settings.DEFAULT_FROM_EMAIL or "noreply@loftdesign.com", [admin_email], fail_silently=True)
    except Exception:
        pass

    for user in User.objects.filter(is_superuser=True):
        notify_user(
            user=user,
            title=f"New Inquiry: {first_name} {last_name}",
            message=f"Spaces: {space_names} | Total: {total_display} DA",
            notification_type="info",
            link=config("SITE_URL", default="http://localhost:8000") + "/dashboard/inquiries/" + str(inquiry.id) + "/",
        )

    return JsonResponse({"success": True, "inquiry_id": inquiry.id})
