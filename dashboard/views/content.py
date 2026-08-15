from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.utils.translation import gettext as _

from ..decorator import admin_required, with_pagination
from ..models import Contact, Lead
from ..utils import humanize_error


@admin_required
@with_pagination(per_page=12, template="dashboard/admin/contact_list", queryset_name="contacts")
def contact_list(request):
    queryset = Contact.objects.all().order_by("-created_at")
    query = request.GET.get("q", "").strip()
    if query:
        queryset = queryset.filter(
            name__icontains=query
        ) | queryset.filter(email__icontains=query) | queryset.filter(message__icontains=query)
    return {
        "contacts": queryset,
        "query": query,
        "title": _("Contacts"),
    }


@admin_required
def contact_detail(request, pk):
    contact = get_object_or_404(Contact, pk=pk)
    if not contact.is_read:
        contact.is_read = True
        contact.save(update_fields=["is_read"])
    return render(request, "dashboard/admin/contact_detail.html", {
        "contact": contact,
        "title": _("Contact"),
    })


@admin_required
def contact_delete(request, pk):
    if request.method == "POST":
        contact = get_object_or_404(Contact, pk=pk)
        try:
            name = contact.name
            contact.delete()
            return JsonResponse({"success": True, "message": _("Contact %(name)s deleted.") % {"name": name}})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:contact_list")


@admin_required
@with_pagination(per_page=12, template="dashboard/admin/lead_list", queryset_name="leads")
def lead_list(request):
    queryset = Lead.objects.all().order_by("-created_at")
    query = request.GET.get("q", "").strip()
    if query:
        queryset = queryset.filter(name__icontains=query) | queryset.filter(email__icontains=query)
    return {
        "leads": queryset,
        "query": query,
        "title": _("Leads"),
    }


@admin_required
def lead_delete(request, pk):
    if request.method == "POST":
        lead = get_object_or_404(Lead, pk=pk)
        try:
            name = lead.name
            lead.delete()
            return JsonResponse({"success": True, "message": _("Lead %(name)s deleted.") % {"name": name}})
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return redirect("dash:lead_list")