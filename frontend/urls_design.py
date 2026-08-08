from django.urls import path
from dashboard.views import wizard

urlpatterns = [
    path("request/", wizard.wizard_container, name="design_service"),
    path("request/step/combined/", wizard.step_combined, name="wizard_step_combined"),
    path("request/step/packages/", wizard.step_packages, name="wizard_step_packages"),
    path("request/step/inspirations/", wizard.step_inspirations, name="wizard_step_inspirations"),
    path("request/step/questionnaire/", wizard.step_questionnaire, name="wizard_step_questionnaire"),
    path("request/step/summary/", wizard.step_summary, name="wizard_step_summary"),
    path("request/facturation/download/", wizard.facturation_download, name="facturation_download"),
    path("request/facturation/email/", wizard.facturation_email, name="facturation_email"),
]
