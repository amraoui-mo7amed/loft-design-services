from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify

from .base import Space

userModel = get_user_model()


class ProductCategory(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    image = models.ImageField(upload_to="marketplace/categories/", null=True, blank=True, verbose_name=_("Image"))

    class Meta:
        verbose_name = _("Product Category")
        verbose_name_plural = _("Product Categories")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name=_("Slug"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Price"))
    image = models.ImageField(upload_to="marketplace/products/", null=True, blank=True, verbose_name=_("Image"))
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True, related_name="products", verbose_name=_("Category")
    )
    sku = models.CharField(max_length=100, unique=True, verbose_name=_("SKU"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SpaceProductRecommendation(models.Model):
    space = models.ForeignKey(
        Space, on_delete=models.CASCADE, related_name="product_recommendations", verbose_name=_("Space")
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="space_recommendations", verbose_name=_("Product")
    )
    priority = models.PositiveIntegerField(default=0, verbose_name=_("Priority"))

    class Meta:
        verbose_name = _("Product Recommendation")
        verbose_name_plural = _("Product Recommendations")
        ordering = ["space", "priority"]
        unique_together = ["space", "product"]

    def __str__(self):
        return f"{self.space} \u2192 {self.product}"


class Cart(models.Model):
    user = models.ForeignKey(
        userModel, on_delete=models.CASCADE, related_name="carts", verbose_name=_("User")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Cart")
        verbose_name_plural = _("Carts")

    def __str__(self):
        return f"Cart - {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart, on_delete=models.CASCADE, related_name="items", verbose_name=_("Cart")
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="cart_items", verbose_name=_("Product")
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantity"))
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Price at Time"))

    class Meta:
        verbose_name = _("Cart Item")
        verbose_name_plural = _("Cart Items")

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart}"


class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = "pending", _("Pending")
        CONFIRMED = "confirmed", _("Confirmed")
        SHIPPED = "shipped", _("Shipped")
        DELIVERED = "delivered", _("Delivered")
        CANCELLED = "cancelled", _("Cancelled")

    user = models.ForeignKey(
        userModel, on_delete=models.CASCADE, related_name="marketplace_orders", verbose_name=_("User")
    )
    status = models.CharField(
        max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, verbose_name=_("Status")
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name=_("Total"))
    payment_method = models.CharField(max_length=50, blank=True, verbose_name=_("Payment Method"))
    shipping_address = models.TextField(blank=True, verbose_name=_("Shipping Address"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items", verbose_name=_("Order")
    )
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, related_name="order_items", verbose_name=_("Product")
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantity"))
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Price at Time"))

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")

    def __str__(self):
        return f"{self.quantity}x {self.product.name if self.product else 'N/A'}"
