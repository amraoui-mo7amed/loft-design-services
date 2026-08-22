from django.contrib import admin

from .models import (
    Notification,
    ProjectType,
    Space,
    SpaceCategory,
    SpaceCategoryImages,
    ProjectTypeSpace,
    Service,
    DesignRequest,
    DesignRequestFloor,
    DesignRequestSpace,
    DesignRequestOption,
    DesignRequestSpaceImage,
    DesignRequestFile,
    DesignMessage,
    DesignRevision,
    DesignDeliverable,
    DesignNote,
    DesignActivityLog,
    DesignPayment,
    ProductCategory,
    Product,
    SpaceProductRecommendation,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Video,
    Contact,
    Lead,
)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "notification_type", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read", "created_at"]
    search_fields = ["title", "message", "user__username"]


@admin.register(ProjectType)
class ProjectTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "base_price"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(SpaceCategory)
class SpaceCategoryAdmin(admin.ModelAdmin):
    list_display = ["category_name", "space", "created_at"]
    list_filter = ["space"]
    search_fields = ["category_name", "space__name"]


@admin.register(SpaceCategoryImages)
class SpaceCategoryImagesAdmin(admin.ModelAdmin):
    list_display = ["category", "image", "is_default", "reference", "tags"]
    list_filter = ["category__space", "is_default"]
    list_editable = ["reference"]
    search_fields = ["description", "tags", "reference", "category__category_name"]


@admin.register(ProjectTypeSpace)
class ProjectTypeSpaceAdmin(admin.ModelAdmin):
    list_display = ["project_type", "space", "sort_order"]
    list_filter = ["project_type"]


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["service_name", "service_price", "is_default", "created_at"]
    list_filter = ["is_default"]
    search_fields = ["service_name"]


@admin.register(DesignRequest)
class DesignRequestAdmin(admin.ModelAdmin):
    list_display = ["project_number", "client", "first_name", "last_name", "email", "project_type", "status", "total", "created_at"]
    list_filter = ["status", "project_type", "created_at"]
    search_fields = ["client__username", "client__email", "first_name", "last_name", "email", "project_name"]
    readonly_fields = ["uuid", "created_at", "updated_at"]


@admin.register(DesignRequestFloor)
class DesignRequestFloorAdmin(admin.ModelAdmin):
    list_display = ["design_request", "name", "level", "order"]


@admin.register(DesignRequestSpace)
class DesignRequestSpaceAdmin(admin.ModelAdmin):
    list_display = ["design_request", "space", "floor", "price_at_time"]


@admin.register(DesignRequestOption)
class DesignRequestOptionAdmin(admin.ModelAdmin):
    list_display = ["design_request", "service", "price_at_time"]


@admin.register(DesignRequestSpaceImage)
class DesignRequestSpaceImageAdmin(admin.ModelAdmin):
    list_display = ["design_request_space", "space_image"]


@admin.register(DesignRequestFile)
class DesignRequestFileAdmin(admin.ModelAdmin):
    list_display = ["design_request", "file_type", "uploaded_by", "uploaded_at"]


@admin.register(DesignMessage)
class DesignMessageAdmin(admin.ModelAdmin):
    list_display = ["design_request", "sender", "is_read", "created_at"]
    list_filter = ["is_read", "created_at"]


@admin.register(DesignRevision)
class DesignRevisionAdmin(admin.ModelAdmin):
    list_display = ["design_request", "revision_number", "requested_by", "status", "created_at"]
    list_filter = ["status"]


@admin.register(DesignDeliverable)
class DesignDeliverableAdmin(admin.ModelAdmin):
    list_display = ["design_request", "title", "file_type", "version", "uploaded_by", "created_at", "approved_at"]


@admin.register(DesignNote)
class DesignNoteAdmin(admin.ModelAdmin):
    list_display = ["design_request", "author", "is_internal", "created_at"]
    list_filter = ["is_internal"]


@admin.register(DesignActivityLog)
class DesignActivityLogAdmin(admin.ModelAdmin):
    list_display = ["design_request", "actor", "action", "created_at"]
    list_filter = ["action", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(DesignPayment)
class DesignPaymentAdmin(admin.ModelAdmin):
    list_display = ["design_request", "amount", "payment_method", "status", "paid_at"]
    list_filter = ["payment_method", "status"]


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "price", "active"]
    list_filter = ["category", "active"]
    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(SpaceProductRecommendation)
class SpaceProductRecommendationAdmin(admin.ModelAdmin):
    list_display = ["space", "product", "priority"]
    list_filter = ["space"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at"]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["cart", "product", "quantity", "price_at_time"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["pk", "user", "status", "total", "payment_method", "created_at"]
    list_filter = ["status", "payment_method"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product", "quantity", "price_at_time"]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ["title", "link", "url", "created_at"]
    search_fields = ["title", "description"]


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "is_read", "created_at"]
    list_filter = ["is_read", "created_at"]
    search_fields = ["name", "email", "phone", "message"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "created_at"]
    search_fields = ["name", "email"]
