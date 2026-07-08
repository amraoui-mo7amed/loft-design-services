from django import forms
from django.utils.translation import gettext_lazy as _
from .models import UserProfile


class ProfileForm(forms.ModelForm):
    first_name = forms.CharField(
        max_length=30, required=True, label=_("First Name")
    )
    last_name = forms.CharField(
        max_length=30, required=True, label=_("Last Name")
    )
    email = forms.EmailField(required=True, label=_("Email"))

    class Meta:
        model = UserProfile
        fields = [
            "phone_number", "address", "bio",
            "birth_date", "sex", "profile_picture",
        ]
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
            "bio": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            self.fields["first_name"].initial = user.first_name
            self.fields["last_name"].initial = user.last_name
            self.fields["email"].initial = user.email

    def save(self, user=None, commit=True):
        profile = super().save(commit=False)
        if user:
            user.first_name = self.cleaned_data["first_name"]
            user.last_name = self.cleaned_data["last_name"]
            user.email = self.cleaned_data["email"]
            if commit:
                user.save()
        if commit:
            profile.save()
        return profile
