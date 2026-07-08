from django.urls import path
from dashboard.views import wizard

urlpatterns = [
    path("request/", wizard.wizard_container, name="design_service"),
    path("request/step/project-type/", wizard.step_project_type, name="wizard_step_project_type"),
    path("request/step/floors/", wizard.step_floors, name="wizard_step_floors"),
    path("request/step/spaces/", wizard.step_spaces, name="wizard_step_spaces"),
    path("request/step/packages/", wizard.step_packages, name="wizard_step_packages"),
    path("request/step/options/", wizard.step_options, name="wizard_step_options"),
    path("request/step/inspirations/", wizard.step_inspirations, name="wizard_step_inspirations"),
    path("request/step/questionnaire/", wizard.step_questionnaire, name="wizard_step_questionnaire"),
    path("request/step/uploads/", wizard.step_uploads, name="wizard_step_uploads"),
    path("request/step/summary/", wizard.step_summary, name="wizard_step_summary"),
    path("request/step/confirmation/", wizard.step_confirmation, name="wizard_step_confirmation"),
]
