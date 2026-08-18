from decimal import Decimal
from django.db.models import Sum

TAX_RATE = Decimal("0.19")


def calculate_subtotal(spaces_qs):
    result = spaces_qs.aggregate(total=Sum("price_at_time"))
    return result["total"] or Decimal("0")


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


def calculate_tax(subtotal, package_price, options_total):
    taxable = subtotal + package_price + options_total
    return (taxable * TAX_RATE).quantize(Decimal("0.01"))


def calculate_total(subtotal, package_price, options_total, tax):
    return (subtotal + package_price + options_total + tax).quantize(Decimal("0.01"))


def calculate_full_price(space_ids=None, package=None, option_ids=None):
    from .models import Space

    subtotal = Decimal("0")
    if space_ids:
        spaces = Space.objects.filter(id__in=space_ids)
        subtotal = spaces.aggregate(total=Sum("base_price"))["total"] or Decimal("0")
    package_price = calculate_package_price(subtotal, package)
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
