from decimal import Decimal
from django.db.models import Sum

TAX_RATE = Decimal("0.19")


def calculate_subtotal(spaces_qs):
    result = spaces_qs.aggregate(total=Sum("price_at_time"))
    return result["total"] or Decimal("0")


def calculate_service_fee(
    service,
    surface_interior=0,
    surface_exterior=0,
    use_interior=None,
    use_exterior=None,
    hours=0,
    quantity=1,
    reference_amount=0,
    estimated_project_cost=0,
    total_surface=0,
):
    """
    Authoritative pure calculation for a service fee matching preview.html specification:
    Supports:
    - area / PRICE_PER_M2: (useInterior * surf_int + useExterior * surf_ext) * unitRate
    - hourly / HOURLY: hours * hourlyRate
    - fixed / FIXED_UNIT: quantity * fixedUnitPrice
    - percent_project_cost / PERCENTAGE: (referenceAmount * rate / 100) bounded by min_fee / max_fee
    """
    if not service:
        return Decimal("0.00")

    if hasattr(service, "calculate_service_fee"):
        return service.calculate_service_fee(
            surface_interior=surface_interior,
            surface_exterior=surface_exterior,
            use_interior=use_interior,
            use_exterior=use_exterior,
            hours=hours,
            quantity=quantity,
            reference_amount=reference_amount,
            estimated_project_cost=estimated_project_cost,
            total_surface=total_surface,
        )

    pricing_type = getattr(service, "pricing_type", "fixed")
    price = Decimal(str(getattr(service, "service_price", 0) or 0))
    cost = Decimal(str(estimated_project_cost or 0))
    surface = Decimal(str(total_surface or 0))
    h = Decimal(str(hours or 0))

    if pricing_type in ("percent_project_cost", "percentage_project_cost", "percent"):
        rate = Decimal(str(getattr(service, "percentage_rate", 0) or 0))
        fee = (cost * rate) / Decimal("100")
        min_fee = getattr(service, "min_fee", None)
        max_fee = getattr(service, "max_fee", None)
        if min_fee is not None:
            fee = max(fee, Decimal(str(min_fee)))
        if max_fee is not None:
            fee = min(fee, Decimal(str(max_fee)))
        return fee.quantize(Decimal("0.01"))
    elif pricing_type in ("area", "per_sqm"):
        return (surface * price).quantize(Decimal("0.01"))
    elif pricing_type in ("hourly", "per_hour"):
        qty = h if h > 0 else Decimal("1")
        return (qty * price).quantize(Decimal("0.01"))
    else:
        return price.quantize(Decimal("0.01"))


def calculate_package_price(subtotal, package):
    if not package:
        return Decimal("0")
    if hasattr(package, "service_price"):
        return Decimal(str(package.service_price))
    if hasattr(package, "price_multiplier"):
        return (subtotal * package.price_multiplier).quantize(Decimal("0.01"))
    return Decimal("0")


def calculate_options_total(options_qs):
    result = options_qs.aggregate(total=Sum("price_at_time"))
    return result["total"] or Decimal("0")


def calculate_discount(subtotal, discount_type, discount_value):
    """
    Calculate discount amount given a subtotal, discount type ('percentage' or 'fixed') and value.
    - percentage: (subtotal * discount_value / 100) bounded between 0 and subtotal
    - fixed: min(subtotal, discount_value), bounded >= 0
    """
    sub = max(Decimal("0.00"), Decimal(str(subtotal or 0)))
    val = max(Decimal("0.00"), Decimal(str(discount_value or 0)))

    if not discount_type or val <= 0:
        return Decimal("0.00")

    if discount_type == "percentage":
        # 0% to 100%
        val = min(Decimal("100.00"), val)
        amount = (sub * val) / Decimal("100")
        return amount.quantize(Decimal("0.01"))
    elif discount_type == "fixed":
        amount = min(sub, val)
        return amount.quantize(Decimal("0.01"))

    return Decimal("0.00")


def calculate_tax(subtotal, package_price=Decimal("0"), options_total=Decimal("0"), tax_rate=TAX_RATE):
    taxable = Decimal(str(subtotal or 0)) + Decimal(str(package_price or 0)) + Decimal(str(options_total or 0))
    return (max(Decimal("0.00"), taxable) * Decimal(str(tax_rate))).quantize(Decimal("0.01"))


def calculate_total(subtotal, package_price, options_total, tax):
    return (subtotal + package_price + options_total + tax).quantize(Decimal("0.01"))


def calculate_quote_financials(
    spaces_subtotal=0,
    services_subtotal=0,
    discount_type=None,
    discount_value=0,
    is_professional=False,
    tax_rate=TAX_RATE,
):
    """
    Deterministic calculation for quotes and invoices.
    1. subtotal_before_discount = spaces_subtotal + services_subtotal
    2. discount_amount = calculate_discount(...)
    3. subtotal_after_discount = max(0, subtotal_before_discount - discount_amount)
    4. tax_amount = (subtotal_after_discount * tax_rate) if is_professional else 0
    5. final_total = subtotal_after_discount + tax_amount
    """
    sub_spaces = Decimal(str(spaces_subtotal or 0)).quantize(Decimal("0.01"))
    sub_services = Decimal(str(services_subtotal or 0)).quantize(Decimal("0.01"))
    subtotal_before_discount = (sub_spaces + sub_services).quantize(Decimal("0.01"))

    discount_amount = calculate_discount(subtotal_before_discount, discount_type, discount_value)
    subtotal_after_discount = max(Decimal("0.00"), subtotal_before_discount - discount_amount).quantize(Decimal("0.01"))

    if is_professional:
        tax_amount = (subtotal_after_discount * Decimal(str(tax_rate))).quantize(Decimal("0.01"))
    else:
        tax_amount = Decimal("0.00")

    final_total = (subtotal_after_discount + tax_amount).quantize(Decimal("0.01"))

    return {
        "spaces_subtotal": sub_spaces,
        "services_subtotal": sub_services,
        "subtotal_before_discount": subtotal_before_discount,
        "discount_type": discount_type,
        "discount_value": Decimal(str(discount_value or 0)),
        "discount_amount": discount_amount,
        "subtotal_after_discount": subtotal_after_discount,
        "tax_amount": tax_amount,
        "final_total": final_total,
    }


def calculate_full_price(space_ids=None, package=None, option_ids=None, estimated_project_cost=0, total_surface=0):
    from .models import Space

    subtotal = Decimal("0")
    if space_ids:
        spaces = Space.objects.filter(id__in=space_ids)
        subtotal = spaces.aggregate(total=Sum("base_price"))["total"] or Decimal("0")

    package_price = Decimal("0")
    if package:
        package_price = calculate_service_fee(
            package,
            estimated_project_cost=estimated_project_cost,
            total_surface=total_surface,
        )

    options_total = Decimal("0")
    tax = calculate_tax(subtotal, package_price, options_total)
    total = calculate_total(subtotal, package_price, options_total, tax)

    return {
        "subtotal": float(subtotal),
        "package_price": float(package_price),
        "options_total": float(options_total),
        "tax": float(tax),
        "total": float(total),
    }
