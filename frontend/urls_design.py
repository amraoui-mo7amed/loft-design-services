from django.urls import path
from dashboard.views import wizard

urlpatterns = [
    path("request/", wizard.wizard_container, name="design_service"),
    path("request/estimate/", wizard.step_summary, name="request_step5"),
    path("request/step5/", wizard.step_summary, name="wizard_step_summary"),
    path("request/step/combined/", wizard.step_combined, name="wizard_step_combined"),
    path("request/step/packages/", wizard.step_packages, name="wizard_step_packages"),
    path("request/step/inspirations/", wizard.step_inspirations, name="wizard_step_inspirations"),
    path("request/step/questionnaire/", wizard.step_questionnaire, name="wizard_step_questionnaire"),
    path("request/step/summary/", wizard.step_summary, name="wizard_step_summary_alias"),
    path("request/facturation/download/", wizard.facturation_download, name="facturation_download"),
    path("request/facturation/email/", wizard.facturation_email, name="facturation_email"),
    path("request/submit/", wizard.submit_design_request, name="request_submit"),
    path("devis/save/<uuid:quote_uuid>/", wizard.quote_save_snapshot, name="quote_save_snapshot"),
    path("devis/<uuid:quote_uuid>/", wizard.quote_public_view, name="quote_public_view"),
]
