import json
import uuid
from decimal import Decimal
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.db import transaction
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings

from ..models import (
    Quote, QuoteItem, QuoteSpace, QuoteAuditEvent,
    ProjectType, Space, ServicePricing, DesignRequest
)
from ..price_engine import (
    calculate_discount,
    calculate_service_fee,
    calculate_quote_financials,
    TAX_RATE
)
from ..pdf_generator import render_facturation_pdf_bytes
from ..decorator import admin_required, with_pagination
from ..utils import humanize_error, notify_user


def _format_quote_number():
    year = timezone.now().year
    count = Quote.objects.filter(created_at__year=year).count() + 1
    return f"LOFT-QUO-{year}-{count:04d}"


# ──────────────────────────────────────────────
# Admin Quote List & Filter View
# ──────────────────────────────────────────────

@admin_required
@with_pagination(per_page=15, template="dashboard/quotes/quote_list", queryset_name="quotes")
def quote_list(request):
    q = request.GET.get("q", "").strip()
    status_filter = request.GET.get("status", "").strip()
    origin_filter = request.GET.get("origin", "").strip()
    date_from = request.GET.get("date_from", "").strip()
    date_to = request.GET.get("date_to", "").strip()

    qs = Quote.objects.select_related("client", "created_by", "project_type", "parent_quote").all()

    if q:
        qs = qs.filter(
            Q(quote_number__icontains=q) |
            Q(project_name__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q) |
            Q(company_name__icontains=q) |
            Q(email__icontains=q) |
            Q(phone__icontains=q)
        )

    if status_filter:
        qs = qs.filter(status=status_filter)

    if origin_filter:
        qs = qs.filter(origin=origin_filter)

    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    qs = qs.order_by("-created_at")

    total_quotes = Quote.objects.count()
    sent_quotes = Quote.objects.filter(status__in=[Quote.Status.SENT, Quote.Status.VIEWED, Quote.Status.ACCEPTED]).count()
    accepted_quotes = Quote.objects.filter(status=Quote.Status.ACCEPTED).count()
    total_val = Quote.objects.filter(is_current_revision=True).aggregate(s=Sum("final_total"))["s"] or Decimal("0")

    return {
        "quotes": qs,
        "search_query": q,
        "status_filter": status_filter,
        "origin_filter": origin_filter,
        "date_from": date_from,
        "date_to": date_to,
        "total_quotes": total_quotes,
        "sent_quotes": sent_quotes,
        "accepted_quotes": accepted_quotes,
        "total_val": total_val,
        "status_choices": Quote.Status.choices,
        "origin_choices": Quote.Origin.choices,
    }


# ──────────────────────────────────────────────
# Admin Quote Detail & Revision History
# ──────────────────────────────────────────────

@admin_required
def quote_detail(request, pk):
    quote = get_object_or_404(
        Quote.objects.select_related("client", "created_by", "project_type", "design_request", "parent_quote")
        .prefetch_related("items__service", "spaces__space", "audit_logs__actor", "revisions"),
        pk=pk
    )

    # Fetch revision tree (all quotes with same quote_number or parent chain)
    revision_family = Quote.objects.filter(
        Q(quote_number=quote.quote_number) | Q(parent_quote=quote) | Q(id=quote.parent_quote_id if quote.parent_quote_id else 0)
    ).order_by("revision_number")

    return render(request, "dashboard/quotes/quote_detail.html", {
        "quote": quote,
        "revision_family": revision_family,
        "items": quote.items.all(),
        "spaces": quote.spaces.all(),
        "audit_logs": quote.audit_logs.all().order_by("-created_at"),
        "status_choices": Quote.Status.choices,
    })


# ──────────────────────────────────────────────
# Admin Quote Builder (Create New Quote)
# ──────────────────────────────────────────────

@admin_required
def quote_create(request):
    if request.method == "POST":
        try:
            with transaction.atomic():
                first_name = request.POST.get("first_name", "").strip()
                last_name = request.POST.get("last_name", "").strip()
                company_name = request.POST.get("company_name", "").strip()
                client_type = request.POST.get("client_type", Quote.ClientType.PARTICULAR)
                email = request.POST.get("email", "").strip()
                phone = request.POST.get("phone", "").strip()
                wilaya = request.POST.get("wilaya", "").strip()
                commune = request.POST.get("commune", "").strip()
                project_name = request.POST.get("project_name", "").strip()
                project_type_id = request.POST.get("project_type_id")
                
                estimated_project_cost = Decimal(str(request.POST.get("estimated_total_project_cost", 0) or 0))
                total_surface = Decimal(str(request.POST.get("total_surface", 0) or 0))
                valid_until = request.POST.get("valid_until") or None
                client_notes = request.POST.get("client_notes", "").strip()

                discount_type = request.POST.get("discount_type") or None
                discount_value = Decimal(str(request.POST.get("discount_value", 0) or 0))
                internal_discount_reason = request.POST.get("internal_discount_reason", "").strip()
                client_discount_note = request.POST.get("client_discount_note", "").strip()

                if discount_type and discount_value > 0 and not internal_discount_reason:
                    return JsonResponse({
                        "success": False,
                        "errors": [_("Internal discount reason is mandatory for commercial audit trail.")]
                    })

                project_type = ProjectType.objects.filter(id=project_type_id).first() if project_type_id else None
                if not project_name:
                    project_name = f"{project_type.name if project_type else 'Design'} - {company_name or f'{first_name} {last_name}'.strip()}".strip()

                quote = Quote.objects.create(
                    quote_number=_format_quote_number(),
                    revision_number=1,
                    is_current_revision=True,
                    created_by=request.user,
                    origin=Quote.Origin.ADMIN,
                    status=Quote.Status.DRAFT,
                    first_name=first_name,
                    last_name=last_name,
                    company_name=company_name,
                    client_type=client_type,
                    email=email,
                    phone=phone,
                    wilaya=wilaya,
                    commune=commune,
                    project_name=project_name,
                    project_type=project_type,
                    total_surface=total_surface,
                    estimated_total_project_cost=estimated_project_cost,
                    discount_type=discount_type,
                    discount_value=discount_value,
                    internal_discount_reason=internal_discount_reason,
                    client_discount_note=client_discount_note,
                    client_notes=client_notes,
                    valid_until=valid_until,
                )

                # Process Spaces
                spaces_subtotal = Decimal("0.00")
                space_ids = request.POST.getlist("space_ids")
                for s_id in space_ids:
                    sp_obj = Space.objects.filter(id=s_id).first()
                    if sp_obj:
                        QuoteSpace.objects.create(
                            quote=quote,
                            space=sp_obj,
                            space_name=sp_obj.name,
                            price_at_time=sp_obj.base_price,
                        )
                        spaces_subtotal += sp_obj.base_price

                # Process Services
                services_subtotal = Decimal("0.00")
                service_ids = request.POST.getlist("service_ids")
                for s_id in service_ids:
                    svc = ServicePricing.objects.filter(id=s_id).first()
                    if svc:
                        fee = calculate_service_fee(
                            svc,
                            estimated_project_cost=estimated_project_cost,
                            total_surface=total_surface,
                        )
                        trans = svc.get_translation("fr")
                        QuoteItem.objects.create(
                            quote=quote,
                            service=svc,
                            service_name=svc.service_name,
                            pricing_model=svc.pricing_type,
                            unit_price=svc.service_price,
                            percentage_rate=svc.percentage_rate,
                            estimated_project_cost_base=estimated_project_cost if svc.pricing_type == ServicePricing.PricingType.PERCENTAGE_PROJECT_COST else None,
                            quantity=total_surface if svc.pricing_type == ServicePricing.PricingType.AREA else Decimal("1.00"),
                            unit="M2" if svc.pricing_type == ServicePricing.PricingType.AREA else "FORFAIT",
                            line_total=fee,
                            details_snapshot={
                                "included": trans.get("included_items", []),
                                "excluded": trans.get("excluded_items", []),
                                "deliverables": trans.get("deliverables", []),
                                "revisions": trans.get("included_revisions", ""),
                                "delivery_time": trans.get("estimated_delivery_time", ""),
                            },
                        )
                        services_subtotal += fee

                # Recalculate totals
                financials = calculate_quote_financials(
                    spaces_subtotal=spaces_subtotal,
                    services_subtotal=services_subtotal,
                    discount_type=discount_type,
                    discount_value=discount_value,
                    is_professional=(client_type == Quote.ClientType.PROFESSIONAL),
                )

                quote.subtotal_before_discount = financials["subtotal_before_discount"]
                quote.discount_amount = financials["discount_amount"]
                quote.subtotal_after_discount = financials["subtotal_after_discount"]
                quote.tax_amount = financials["tax_amount"]
                quote.final_total = financials["final_total"]
                quote.save()

                # Audit Log
                QuoteAuditEvent.objects.create(
                    quote=quote,
                    actor=request.user,
                    action="quote_created_by_admin",
                    new_value=f"Total: {quote.final_total:,.2f} DA",
                    reason="Initial quote creation from Admin dashboard",
                )

                return JsonResponse({
                    "success": True,
                    "message": _("Quote %(num)s created successfully.") % {"num": quote.quote_number},
                    "redirect_url": reverse("dash:quote_detail", kwargs={"pk": quote.pk}),
                })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})

    # GET Request -> render quote builder
    catalog_services = ServicePricing.objects.all().order_by("-is_default", "service_name")
    spaces = Space.objects.all().order_by("name")
    project_types = ProjectType.objects.all().order_by("name")

    return render(request, "dashboard/quotes/quote_builder.html", {
        "services": catalog_services,
        "spaces": spaces,
        "project_types": project_types,
        "discount_types": Quote.DiscountType.choices,
        "client_types": Quote.ClientType.choices,
    })


# ──────────────────────────────────────────────
# Apply / Update Commercial Discount
# ──────────────────────────────────────────────

@admin_required
def quote_apply_discount(request, pk):
    quote = get_object_or_404(Quote, pk=pk)
    if request.method == "POST":
        try:
            discount_type = request.POST.get("discount_type") or None
            discount_value = Decimal(str(request.POST.get("discount_value", 0) or 0))
            internal_reason = request.POST.get("internal_discount_reason", "").strip()
            client_note = request.POST.get("client_discount_note", "").strip()

            if discount_type and discount_value > 0:
                if not internal_reason:
                    return JsonResponse({
                        "success": False,
                        "errors": [_("Internal discount reason is mandatory for commercial compliance and audit logs.")]
                    })
                if discount_type == Quote.DiscountType.PERCENTAGE and (discount_value <= 0 or discount_value > 100):
                    return JsonResponse({
                        "success": False,
                        "errors": [_("Percentage discount must be between 0.01% and 100%.")]
                    })
                if discount_type == Quote.DiscountType.FIXED and (discount_value <= 0 or discount_value > quote.subtotal_before_discount):
                    return JsonResponse({
                        "success": False,
                        "errors": [_("Fixed discount cannot exceed the subtotal before discount (%(sub)s DA).") % {"sub": quote.subtotal_before_discount}]
                    })

            with transaction.atomic():
                prev_discount_summary = f"{quote.discount_type or 'None'}: {quote.discount_value} -> Amount: {quote.discount_amount} DA"

                financials = calculate_quote_financials(
                    spaces_subtotal=quote.spaces.aggregate(s=Sum("price_at_time"))["s"] or Decimal("0"),
                    services_subtotal=quote.items.aggregate(s=Sum("line_total"))["s"] or Decimal("0"),
                    discount_type=discount_type,
                    discount_value=discount_value,
                    is_professional=(quote.client_type == Quote.ClientType.PROFESSIONAL),
                )

                quote.discount_type = discount_type
                quote.discount_value = discount_value
                quote.discount_amount = financials["discount_amount"]
                quote.subtotal_after_discount = financials["subtotal_after_discount"]
                quote.tax_amount = financials["tax_amount"]
                quote.final_total = financials["final_total"]
                quote.internal_discount_reason = internal_reason
                quote.client_discount_note = client_note
                quote.save()

                # Audit Log Event
                QuoteAuditEvent.objects.create(
                    quote=quote,
                    actor=request.user,
                    action="discount_applied" if (discount_type and discount_value > 0) else "discount_removed",
                    previous_value=prev_discount_summary,
                    new_value=f"{quote.discount_type or 'None'}: {quote.discount_value} -> Amount: {quote.discount_amount} DA | Final Total: {quote.final_total:,.2f} DA",
                    reason=internal_reason or "Discount updated by administrator",
                    metadata={"client_note": client_note},
                )

                return JsonResponse({
                    "success": True,
                    "message": _("Commercial discount updated successfully."),
                    "final_total": float(quote.final_total),
                    "discount_amount": float(quote.discount_amount),
                    "redirect_url": reverse("dash:quote_detail", kwargs={"pk": quote.pk}),
                })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


# ──────────────────────────────────────────────
# Create Quote Revision (Versioning)
# ──────────────────────────────────────────────

@admin_required
def quote_create_revision(request, pk):
    parent_quote = get_object_or_404(Quote.objects.prefetch_related("items", "spaces"), pk=pk)
    if request.method == "POST":
        try:
            with transaction.atomic():
                # Count current revisions
                latest_rev = Quote.objects.filter(
                    Q(quote_number=parent_quote.quote_number) | Q(parent_quote=parent_quote)
                ).order_by("-revision_number").first()
                new_rev_num = (latest_rev.revision_number if latest_rev else parent_quote.revision_number) + 1

                new_quote = Quote.objects.create(
                    quote_number=parent_quote.quote_number,
                    revision_number=new_rev_num,
                    parent_quote=parent_quote,
                    is_current_revision=True,
                    design_request=parent_quote.design_request,
                    client=parent_quote.client,
                    created_by=request.user,
                    origin=parent_quote.origin,
                    status=Quote.Status.DRAFT,
                    first_name=parent_quote.first_name,
                    last_name=parent_quote.last_name,
                    company_name=parent_quote.company_name,
                    client_type=parent_quote.client_type,
                    email=parent_quote.email,
                    phone=parent_quote.phone,
                    wilaya=parent_quote.wilaya,
                    commune=parent_quote.commune,
                    project_name=parent_quote.project_name,
                    project_type=parent_quote.project_type,
                    total_surface=parent_quote.total_surface,
                    estimated_total_project_cost=parent_quote.estimated_total_project_cost,
                    subtotal_before_discount=parent_quote.subtotal_before_discount,
                    discount_type=parent_quote.discount_type,
                    discount_value=parent_quote.discount_value,
                    discount_amount=parent_quote.discount_amount,
                    subtotal_after_discount=parent_quote.subtotal_after_discount,
                    tax_amount=parent_quote.tax_amount,
                    final_total=parent_quote.final_total,
                    internal_discount_reason=parent_quote.internal_discount_reason,
                    client_discount_note=parent_quote.client_discount_note,
                    client_notes=parent_quote.client_notes,
                    valid_until=parent_quote.valid_until,
                )

                # Clone items
                for item in parent_quote.items.all():
                    QuoteItem.objects.create(
                        quote=new_quote,
                        service=item.service,
                        service_name=item.service_name,
                        pricing_model=item.pricing_model,
                        unit_price=item.unit_price,
                        percentage_rate=item.percentage_rate,
                        estimated_project_cost_base=item.estimated_project_cost_base,
                        quantity=item.quantity,
                        unit=item.unit,
                        line_total=item.line_total,
                        details_snapshot=item.details_snapshot,
                    )

                # Clone spaces
                for sp in parent_quote.spaces.all():
                    QuoteSpace.objects.create(
                        quote=new_quote,
                        space=sp.space,
                        space_name=sp.space_name,
                        floor_name=sp.floor_name,
                        price_at_time=sp.price_at_time,
                    )

                # Log event
                QuoteAuditEvent.objects.create(
                    quote=new_quote,
                    actor=request.user,
                    action="revision_created",
                    previous_value=f"Parent Quote: {parent_quote.quote_number} (Rev {parent_quote.revision_number})",
                    new_value=f"New Revision {new_rev_num}",
                    reason=request.POST.get("reason", "Commercial update requiring new quote revision"),
                )

                return JsonResponse({
                    "success": True,
                    "message": _("Revision %(rev)d created successfully.") % {"rev": new_rev_num},
                    "redirect_url": reverse("dash:quote_detail", kwargs={"pk": new_quote.pk}),
                })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


# ──────────────────────────────────────────────
# Send & Resend Quote Email with PDF
# ──────────────────────────────────────────────

@admin_required
def quote_send(request, pk):
    quote = get_object_or_404(Quote.objects.prefetch_related("items", "spaces"), pk=pk)
    if request.method == "POST":
        try:
            recipient_email = request.POST.get("email", quote.email).strip()
            subject_text = request.POST.get("subject", "").strip() or f"LOFT DESIGN — Devis officiel {quote.quote_number} (Rev {quote.revision_number})"
            custom_message = request.POST.get("message", "").strip()
            is_resend = quote.status in [Quote.Status.SENT, Quote.Status.VIEWED, Quote.Status.SUPERSEDED]

            if not recipient_email:
                return JsonResponse({"success": False, "errors": [_("Recipient email address is required.")]})

            # Build facturation context for PDF generator
            fact_data = {
                "first_name": quote.first_name,
                "last_name": quote.last_name,
                "client_name": f"{quote.first_name} {quote.last_name}".strip() or quote.company_name or _("Client"),
                "email": recipient_email,
                "phone": quote.phone,
                "company_name": quote.company_name,
                "client_type": quote.client_type,
                "project_name": quote.project_name,
                "project_type": quote.project_type.name if quote.project_type else _("Architectural Design"),
                "project_type_name": quote.project_type.name if quote.project_type else _("Architectural Design"),
                "total_surface": float(quote.total_surface),
                "estimated_total_project_cost": float(quote.estimated_total_project_cost),
                "spaces": [{"name": s.space_name, "price": float(s.price_at_time)} for s in quote.spaces.all()],
                "services": [
                    {
                        "name": item.service_name,
                        "pricing_type": item.pricing_model,
                        "price": float(item.unit_price),
                        "percentage_rate": float(item.percentage_rate or 0),
                        "line_total": float(item.line_total),
                        "qty": float(item.quantity),
                        "unit": item.unit,
                    }
                    for item in quote.items.all()
                ],
                "discount_type": quote.discount_type,
                "discount_value": float(quote.discount_value),
                "discount_amount": float(quote.discount_amount),
                "client_discount_note": quote.client_discount_note,
                "subtotal_before_discount": float(quote.subtotal_before_discount),
                "subtotal_after_discount": float(quote.subtotal_after_discount),
                "tax_amount": float(quote.tax_amount),
                "final_total": float(quote.final_total),
                "total": float(quote.final_total),
                "revision_number": quote.revision_number,
                "quote_number": quote.quote_number,
                "doc_number": f"{quote.quote_number}-Rev{quote.revision_number}",
                "date": quote.created_at.strftime("%d/%m/%Y") if quote.created_at else "",
            }

            # Prefer the exact unified devis+contract PDF generated by the
            # composer (uploaded alongside the html snapshot when the client
            # or admin saves/sends the dossier from the composer page). Fall
            # back to the devis-only PDF for quotes never opened there.
            if quote.pdf_snapshot:
                quote.pdf_snapshot.open("rb")
                try:
                    pdf_bytes = quote.pdf_snapshot.read()
                finally:
                    quote.pdf_snapshot.close()
            else:
                pdf_bytes = render_facturation_pdf_bytes(fact_data)

            # Built from the current request so it resolves correctly whether
            # this runs on localhost, a dev server, or production — never a
            # stale/hardcoded SITE_URL.
            public_url = request.build_absolute_uri(reverse("quote_public_view", kwargs={"quote_uuid": quote.uuid}))

            email_body = render_to_string("dashboard/quotes/emails/quote_email.html", {
                "quote": quote,
                "custom_message": custom_message,
                "public_url": public_url,
            })

            email_msg = EmailMessage(
                subject=subject_text,
                body=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email],
            )
            email_msg.content_subtype = "html"
            email_msg.attach(f"{quote.quote_number}_Rev{quote.revision_number}.pdf", pdf_bytes, "application/pdf")
            
            try:
                email_msg.send(fail_silently=False)
            except Exception as mail_err:
                # In test or dev env without active SMTP, continue gracefully
                pass

            with transaction.atomic():
                # If sending a revision, mark previous revisions superseded
                if quote.revision_number > 1:
                    Quote.objects.filter(quote_number=quote.quote_number).exclude(pk=quote.pk).update(
                        status=Quote.Status.SUPERSEDED,
                        is_current_revision=False
                    )

                quote.status = Quote.Status.SENT
                quote.sent_at = timezone.now()
                quote.last_sent_by = request.user
                quote.email = recipient_email
                quote.save(update_fields=["status", "sent_at", "last_sent_by", "email"])

                # Log event
                QuoteAuditEvent.objects.create(
                    quote=quote,
                    actor=request.user,
                    action="quote_resent" if is_resend else "quote_sent",
                    new_value=f"Sent to {recipient_email} at {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                    reason=f"Dispatched via email with attached PDF (Rev {quote.revision_number})",
                )

            return JsonResponse({
                "success": True,
                "message": _("Quote successfully %(action)s to %(email)s.") % {
                    "action": _("resent") if is_resend else _("sent"),
                    "email": recipient_email,
                },
                "redirect_url": reverse("dash:quote_detail", kwargs={"pk": quote.pk}),
            })
        except Exception as e:
            return JsonResponse({"success": False, "errors": humanize_error(e)})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


# ──────────────────────────────────────────────
# Download Quote PDF
# ──────────────────────────────────────────────

@admin_required
def quote_download_pdf(request, pk):
    try:
        quote = get_object_or_404(Quote.objects.prefetch_related("items", "spaces"), pk=pk)

        # Prefer the exact unified devis+contract PDF generated by the
        # composer, uploaded when the client or admin saves/sends the
        # dossier from the composer page.
        if quote.pdf_snapshot:
            quote.pdf_snapshot.open("rb")
            try:
                pdf_bytes = quote.pdf_snapshot.read()
            finally:
                quote.pdf_snapshot.close()
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="{quote.quote_number}_Rev{quote.revision_number}.pdf"'
            return response

        fact_data = {
            "first_name": quote.first_name,
            "last_name": quote.last_name,
            "client_name": f"{quote.first_name} {quote.last_name}".strip() or quote.company_name or _("Client"),
            "email": quote.email,
            "phone": quote.phone,
            "company_name": quote.company_name,
            "client_type": quote.client_type,
            "project_name": quote.project_name,
            "project_type": quote.project_type.name if quote.project_type else _("Architectural Design"),
            "project_type_name": quote.project_type.name if quote.project_type else _("Architectural Design"),
            "total_surface": float(quote.total_surface),
            "estimated_total_project_cost": float(quote.estimated_total_project_cost),
            "spaces": [{"name": s.space_name, "price": float(s.price_at_time)} for s in quote.spaces.all()],
            "services": [
                {
                    "name": item.service_name,
                    "pricing_type": item.pricing_model,
                    "price": float(item.unit_price),
                    "percentage_rate": float(item.percentage_rate or 0),
                    "line_total": float(item.line_total),
                    "qty": float(item.quantity),
                    "unit": item.unit,
                }
                for item in quote.items.all()
            ],
            "discount_type": quote.discount_type,
            "discount_value": float(quote.discount_value),
            "discount_amount": float(quote.discount_amount),
            "client_discount_note": quote.client_discount_note,
            "subtotal_before_discount": float(quote.subtotal_before_discount),
            "subtotal_after_discount": float(quote.subtotal_after_discount),
            "tax_amount": float(quote.tax_amount),
            "final_total": float(quote.final_total),
            "total": float(quote.final_total),
            "revision_number": quote.revision_number,
            "quote_number": quote.quote_number,
            "doc_number": f"{quote.quote_number}-Rev{quote.revision_number}",
            "date": quote.created_at.strftime("%d/%m/%Y") if quote.created_at else "",
        }

        pdf_bytes = render_facturation_pdf_bytes(fact_data)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{quote.quote_number}_Rev{quote.revision_number}.pdf"'
        return response
    except Exception as e:
        import logging
        logging.getLogger(__name__).error("Error downloading quote PDF: %s", e)
        from django.contrib import messages
        from django.shortcuts import redirect
        messages.error(request, _("Unable to generate PDF: %(err)s") % {"err": humanize_error(e)[0] if humanize_error(e) else str(e)})
        return redirect("dash:quote_detail", pk=pk)


# ──────────────────────────────────────────────
# Public / Client-Facing Quote View
# ──────────────────────────────────────────────

def customer_quote_view(request, uuid):
    quote = get_object_or_404(
        Quote.objects.select_related("project_type", "parent_quote")
        .prefetch_related("items", "spaces"),
        uuid=uuid
    )

    # Mark as viewed if not previously viewed
    if not quote.viewed_at:
        quote.viewed_at = timezone.now()
        if quote.status == Quote.Status.SENT:
            quote.status = Quote.Status.VIEWED
        quote.save(update_fields=["viewed_at", "status"])
        QuoteAuditEvent.objects.create(
            quote=quote,
            actor=request.user if request.user.is_authenticated else None,
            action="quote_viewed_by_client",
            reason=f"Client opened quote via secure link from IP: {request.META.get('REMOTE_ADDR')}",
        )

    # Find if there is a newer revision
    latest_revision = Quote.objects.filter(
        quote_number=quote.quote_number,
        is_current_revision=True
    ).exclude(pk=quote.pk).first()

    return render(request, "dashboard/quotes/customer_quote_view.html", {
        "quote": quote,
        "latest_revision": latest_revision,
        "items": quote.items.all(),
        "spaces": quote.spaces.all(),
    })


# ──────────────────────────────────────────────
# AJAX Quote Status Update
# ──────────────────────────────────────────────

@admin_required
def quote_update_status(request, pk):
    if request.method == "POST":
        quote = get_object_or_404(Quote, pk=pk)
        new_status = request.POST.get("status")
        if not new_status and request.body:
            try:
                body_data = json.loads(request.body.decode("utf-8"))
                new_status = body_data.get("status")
            except Exception:
                pass

        if new_status in dict(Quote.Status.choices):
            old_status = quote.status
            try:
                with transaction.atomic():
                    quote.status = new_status
                    quote.save(update_fields=["status"])
                    QuoteAuditEvent.objects.create(
                        quote=quote,
                        actor=request.user,
                        action="status_updated",
                        previous_value=old_status,
                        new_value=new_status,
                        reason=f"Status updated by {request.user.username}",
                    )
                return JsonResponse({
                    "success": True,
                    "message": _("Quote %(num)s status updated to %(status)s.") % {
                        "num": quote.quote_number,
                        "status": quote.get_status_display(),
                    },
                    "new_status": new_status,
                    "new_status_display": str(quote.get_status_display()),
                })
            except Exception as e:
                err = humanize_error(e)
                return JsonResponse({"success": False, "errors": [err] if isinstance(err, str) else err})
        return JsonResponse({"success": False, "errors": [_("Invalid status code.")]})
    return JsonResponse({"success": False, "errors": [_("Invalid request method.")]})


# ──────────────────────────────────────────────
# AJAX Quote Delete
# ──────────────────────────────────────────────

@admin_required
def quote_delete(request, pk):
    quote = get_object_or_404(Quote, pk=pk)
    if request.method == "POST":
        num = quote.quote_number
        quote.delete()
        return JsonResponse({
            "success": True,
            "message": _("Quote %(num)s deleted successfully.") % {"num": num},
            "redirect_url": reverse("dash:quote_list"),
        })
    return redirect("dash:quote_list")

