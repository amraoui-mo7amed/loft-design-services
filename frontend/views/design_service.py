from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
from dashboard.models import ProjectType, DesignPackage, StyleCategory, InspirationImage


def landing_view(request):
    project_types = ProjectType.objects.filter(active=True)[:6]
    packages = DesignPackage.objects.filter(active=True)
    styles = StyleCategory.objects.all()[:8]
    how_it_works_steps = [
        {"title": _("Choose Project"), "desc": _("Select your project type")},
        {"title": _("Choose Spaces"), "desc": _("Select rooms to design")},
        {"title": _("Choose Styles"), "desc": _("Pick your design style")},
        {"title": _("Submit Brief"), "desc": _("Tell us your preferences")},
        {"title": _("Designer Assigned"), "desc": _("Expert takes over")},
        {"title": _("Receive Design"), "desc": _("Get your completed design")},
    ]
    faqs = [
        {"question": _("How long does the design process take?"), "answer": _("Depending on the package and complexity, designs are delivered within 1-4 weeks.")},
        {"question": _("Can I make changes to the design?"), "answer": _("Yes! Each package includes revisions. You can request changes until you are satisfied.")},
        {"question": _("What do I need to get started?"), "answer": _("Just your floor plan or room dimensions, inspiration images, and your preferences. We guide you through the rest.")},
        {"question": _("How do I communicate with my designer?"), "answer": _("Through our built-in messaging system. You can chat, share files, and get real-time updates on your project.")},
        {"question": _("What if I don't like the design?"), "answer": _("We offer revisions until you are happy. If you are still not satisfied, we offer a satisfaction guarantee.")},
    ]
    return render(request, "home.html", {
        "project_types": project_types,
        "packages": packages,
        "styles": styles,
        "how_it_works_steps": how_it_works_steps,
        "faqs": faqs,
    })
