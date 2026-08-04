from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from django.core.paginator import Paginator

from ..models import ProductCategory, Product, SpaceProductRecommendation, Cart, CartItem, Order, OrderItem, Space


def product_list(request):
    category_slug = request.GET.get("category")
    products = Product.objects.filter(active=True).select_related("category")
    categories = ProductCategory.objects.all()
    if category_slug:
        products = products.filter(category__slug=category_slug)
    paginator = Paginator(products, 12)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "dashboard/marketplace/product_list.html", {
        "products": page_obj,
        "page_obj": page_obj,
        "categories": categories,
        "current_category": category_slug,
    })


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, active=True)
    recommendations = SpaceProductRecommendation.objects.filter(product=product).select_related("space")
    return render(request, "dashboard/marketplace/product_detail.html", {
        "product": product,
        "recommendations": recommendations,
    })


@login_required
def cart_view(request):
    cart, cart_created = Cart.objects.get_or_create(user=request.user)
    items = cart.items.select_related("product").all()
    total = sum(item.price_at_time * item.quantity for item in items)
    return render(request, "dashboard/marketplace/cart.html", {
        "cart": cart,
        "items": items,
        "total": total,
    })


@login_required
@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, active=True)
    cart, cart_created = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product,
        defaults={"price_at_time": product.price, "quantity": 1},
    )
    if not created:
        cart_item.quantity += 1
        cart_item.save(update_fields=["quantity"])
    return JsonResponse({"success": True, "message": _("Added to cart.")})


@login_required
@require_POST
def update_cart_item(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    quantity = int(request.POST.get("quantity", 1))
    if quantity < 1:
        item.delete()
        return JsonResponse({"success": True, "message": _("Item removed.")})
    item.quantity = quantity
    item.save(update_fields=["quantity"])
    return JsonResponse({"success": True, "message": _("Cart updated.")})


@login_required
@require_POST
def remove_from_cart(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    item.delete()
    return JsonResponse({"success": True, "message": _("Item removed.")})


@login_required
def checkout(request):
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or not cart.items.exists():
        return redirect("marketplace_cart")
    items = cart.items.select_related("product").all()
    total = sum(item.price_at_time * item.quantity for item in items)
    return render(request, "dashboard/marketplace/checkout.html", {
        "cart": cart,
        "items": items,
        "total": total,
    })


@login_required
@require_POST
def place_order(request):
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or not cart.items.exists():
        return JsonResponse({"success": False, "errors": [_("Cart is empty.")]})

    with transaction.atomic():
        items = cart.items.select_related("product").all()
        total = sum(item.price_at_time * item.quantity for item in items)
        order = Order.objects.create(
            user=request.user,
            total=total,
            payment_method=request.POST.get("payment_method", ""),
            shipping_address=request.POST.get("shipping_address", ""),
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_time=item.price_at_time,
            )
        cart.items.all().delete()

    return JsonResponse({"success": True, "message": _("Order placed successfully!"), "order_id": order.pk})


@login_required
def order_history(request):
    orders = Order.objects.filter(user=request.user).prefetch_related("items__product")
    paginator = Paginator(orders, 12)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "dashboard/marketplace/orders.html", {
        "orders": page_obj,
        "page_obj": page_obj,
    })
