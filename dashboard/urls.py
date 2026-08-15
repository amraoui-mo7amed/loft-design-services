from django.urls import path
from dashboard.views import dashboard, users, notifications, design, customer, designer, admin_crm, pricing, portfolio, videos, content

app_name = "dash"

urlpatterns = [
    # Dashboard
    path("home/", dashboard.dash_home, name="dash_home"),
    # Designers
    path("designers/", users.designer_list, name="designer_list"),
    path("designers/<int:pk>/delete/", users.designer_delete, name="designer_delete"),
    path("designers/<int:pk>/approve/", users.designer_approve, name="designer_approve"),
    path("designers/add-designer/", users.add_designer, name="add_designer"),
    path("designers/assign/", users.designer_assign, name="designer_assign"),
    # Legacy user URLs (backward compat)
    path("users/", users.user_list, name="user_list"),
    path("users/<int:pk>/delete/", users.user_delete, name="user_delete"),
    path("users/<int:pk>/approve/", users.user_approve, name="user_approve"),
    path("users/add-designer/", users.add_designer, name="add_designer"),
    # Notifications
    path("notifications/stream/",notifications.notifications_stream,name="notifications_stream"),
    path("notifications/unread-count/",notifications.get_unread_count,name="notifications_unread_count"),
    path("notifications/list/",notifications.get_notifications,name="notifications_list"),
    path("notifications/<int:notification_id>/read/",notifications.mark_as_read,name="notification_mark_read"),
    path("notifications/mark-all-read/",notifications.mark_all_as_read,name="notifications_mark_all_read"),
    path("notifications/<int:notification_id>/delete/",notifications.delete_notification,name="notification_delete"),
    # Design Catalog - Project Types
    path("design/project-types/", design.project_type_list, name="project_type_list"),
    path("design/project-types/create/", design.project_type_create, name="project_type_create"),
    path("design/project-types/<int:pk>/", design.project_type_detail, name="project_type_detail"),
    path("design/project-types/<int:pk>/edit/", design.project_type_update, name="project_type_update"),
    path("design/project-types/<int:pk>/delete/", design.project_type_delete, name="project_type_delete"),
    path("design/project-types/<int:pk>/home/", design.project_type_home_toggle, name="project_type_home_toggle"),
    path("design/project-types/<int:pk>/spaces/", design.space_type_spaces, name="space_type_spaces"),
    # Design Catalog - Spaces (managed from project type detail)
    path("design/spaces/create/", design.space_create, name="space_create"),
    path("design/spaces/<int:pk>/edit/", design.space_update, name="space_update"),
    path("design/spaces/<int:pk>/delete/", design.space_delete, name="space_delete"),
    path("design/spaces/<int:pk>/home-save/", design.space_home_save, name="space_home_save"),
    path("design/spaces/<int:pk>/home-toggle/", design.space_home_toggle, name="space_home_toggle"),
    path("design/spaces/image/delete/", design.space_image_delete, name="space_image_delete"),
    # Design Catalog - Packages
    path("design/packages/", design.package_list, name="package_list"),
    path("design/packages/create/", design.package_create, name="package_create"),
    path("design/packages/<int:pk>/", design.package_detail, name="package_detail"),
    path("design/packages/<int:pk>/edit/", design.package_update, name="package_update"),
    path("design/packages/<int:pk>/delete/", design.package_delete, name="package_delete"),
    path("design/packages/<int:pk>/default/", design.package_set_default, name="package_set_default"),
    path("design/packages/<int:pk>/options/add/", design.package_option_add, name="package_option_add"),
    path("design/packages/<int:pk>/options/<int:opt_pk>/update/", design.package_option_update, name="package_option_update"),
    path("design/packages/<int:pk>/options/<int:opt_pk>/delete/", design.package_option_delete, name="package_option_delete"),
    # Pricing
    path("pricing/", pricing.pricing_settings, name="pricing_settings"),
    # Customer Dashboard
    path("my-projects/", customer.my_projects, name="customer_projects"),
    path("my-projects/<uuid:uuid>/", customer.project_detail, name="customer_project_detail"),
    path("my-projects/<int:pk>/approve-deliverable/", customer.approve_deliverable, name="approve_deliverable"),
    # Designer Dashboard
    path("designer/projects/", designer.designer_projects, name="designer_projects"),
    path("designer/projects/<uuid:uuid>/", designer.designer_project_detail, name="designer_project_detail"),
    path("designer/projects/<uuid:uuid>/upload/", designer.upload_deliverable, name="designer_upload_deliverable"),
    path("designer/projects/<uuid:uuid>/note/", designer.add_note, name="designer_add_note"),
    # Admin CRM Kanban
    path("crm/", admin_crm.kanban_view, name="admin_crm"),
    path("crm/<int:pk>/", admin_crm.project_detail, name="admin_project_detail"),
    path("crm/update-status/<int:pk>/", admin_crm.update_status, name="crm_update_status"),
    path("crm/assign-designer/<int:pk>/", admin_crm.assign_designer, name="crm_assign_designer"),
    path("crm/<int:pk>/delete/", admin_crm.delete_project, name="crm_delete_project"),
    # Inquiries
    path("inquiries/", admin_crm.inquiry_list, name="inquiry_list"),
    path("inquiries/<int:pk>/", admin_crm.inquiry_detail, name="inquiry_detail"),
    path("inquiries/<int:pk>/delete/", admin_crm.delete_inquiry, name="inquiry_delete"),
    # Portfolio
    path("portfolio/", portfolio.portfolio_list, name="portfolio_list"),
    path("portfolio/create/", portfolio.portfolio_create, name="portfolio_create"),
    path("portfolio/<int:pk>/update/", portfolio.portfolio_update, name="portfolio_update"),
    path("portfolio/<int:pk>/delete/", portfolio.portfolio_delete, name="portfolio_delete"),
    # Videos
    path("videos/", videos.video_list, name="video_list"),
    path("videos/create/", videos.video_create, name="video_create"),
    path("videos/<int:pk>/update/", videos.video_update, name="video_update"),
    path("videos/<int:pk>/delete/", videos.video_delete, name="video_delete"),
    # Contacts
    path("contacts/", content.contact_list, name="contact_list"),
    path("contacts/<int:pk>/", content.contact_detail, name="contact_detail"),
    path("contacts/<int:pk>/delete/", content.contact_delete, name="contact_delete"),
    # Leads
    path("leads/", content.lead_list, name="lead_list"),
    path("leads/<int:pk>/delete/", content.lead_delete, name="lead_delete"),
]
