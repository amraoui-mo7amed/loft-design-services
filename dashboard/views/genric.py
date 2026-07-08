from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _


class BaseDeleteView(View):
    model = None

    def post(self, request, pk, *args, **kwargs):
        if not self.model:
            return HttpResponseBadRequest("No model defined")
        obj = get_object_or_404(self.model, pk=pk)
        obj.delete()
        return JsonResponse({"success": True, "message": _("Deleted successfully.")})
