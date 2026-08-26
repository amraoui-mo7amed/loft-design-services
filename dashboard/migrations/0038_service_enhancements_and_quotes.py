import uuid
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def forward_service_translations_and_single_default(apps, schema_editor):
    ServicePricing = apps.get_model('dashboard', 'ServicePricing')
    ServiceTranslation = apps.get_model('dashboard', 'ServiceTranslation')

    # 1. Populate French translation for existing services
    for svc in ServicePricing.objects.all():
        if not ServiceTranslation.objects.filter(service=svc, locale='fr').exists():
            ServiceTranslation.objects.create(
                service=svc,
                locale='fr',
                name=svc.service_name,
                short_description=getattr(svc, 'short_description', '') or '',
                detailed_description=getattr(svc, 'detailed_description', '') or '',
                included_items=getattr(svc, 'included_items', []) or [],
                excluded_items=getattr(svc, 'excluded_items', []) or [],
                deliverables=getattr(svc, 'deliverables', []) or [],
                included_revisions=getattr(svc, 'included_revisions', '') or '',
                estimated_delivery_time=getattr(svc, 'estimated_delivery_time', '') or '',
            )

    # 2. Enforce exactly one default service
    defaults = list(ServicePricing.objects.filter(is_default=True).order_by('id'))
    if len(defaults) > 1:
        # Keep only the first approved default, unset the others
        for extra_def in defaults[1:]:
            extra_def.is_default = False
            extra_def.save(update_fields=['is_default'])
    elif len(defaults) == 0:
        first_svc = ServicePricing.objects.first()
        if first_svc:
            first_svc.is_default = True
            first_svc.save(update_fields=['is_default'])


def backward_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0037_delete_inquiry_delete_invitation'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='servicepricing',
            options={'ordering': ['-is_default', 'service_name'], 'verbose_name': 'Service Pricing', 'verbose_name_plural': 'Service Pricings'},
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='deliverables',
            field=models.JSONField(blank=True, default=list, verbose_name='Deliverables'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='detailed_description',
            field=models.TextField(blank=True, default='', verbose_name='Detailed Description'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='estimated_delivery_time',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='Estimated Delivery Time'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='excluded_items',
            field=models.JSONField(blank=True, default=list, verbose_name='What is Not Included'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='included_items',
            field=models.JSONField(blank=True, default=list, verbose_name='What is Included'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='included_revisions',
            field=models.CharField(blank=True, default='', max_length=50, verbose_name='Included Revisions'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Is Active'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='max_fee',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Maximum Fee (DA)'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='min_fee',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Minimum Fee (DA)'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='percentage_rate',
            field=models.DecimalField(blank=True, decimal_places=2, default=Decimal('0.00'), max_digits=5, null=True, verbose_name='Percentage Rate (%)'),
        ),
        migrations.AddField(
            model_name='servicepricing',
            name='short_description',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Short Description'),
        ),
        migrations.AlterField(
            model_name='servicepricing',
            name='pricing_type',
            field=models.CharField(choices=[('fixed', 'Fixed Price'), ('area', 'Price per Square Metre (m²)'), ('hourly', 'Price per Hour'), ('percent_project_cost', 'Percentage of Estimated Total Project Cost')], default='fixed', max_length=30, verbose_name='Pricing Type'),
        ),
        migrations.CreateModel(
            name='Quote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='UUID')),
                ('quote_number', models.CharField(db_index=True, max_length=50, verbose_name='Quote Number')),
                ('revision_number', models.PositiveIntegerField(default=1, verbose_name='Revision Number')),
                ('is_current_revision', models.BooleanField(default=True, verbose_name='Is Current Revision')),
                ('origin', models.CharField(choices=[('customer', 'Customer Created'), ('admin', 'Admin Created')], default='customer', max_length=20, verbose_name='Origin')),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('ready_to_send', 'Ready to Send'), ('sent', 'Sent'), ('viewed', 'Viewed'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('expired', 'Expired'), ('superseded', 'Superseded'), ('archived', 'Archived')], default='draft', max_length=25, verbose_name='Status')),
                ('first_name', models.CharField(blank=True, default='', max_length=100, verbose_name='First Name')),
                ('last_name', models.CharField(blank=True, default='', max_length=100, verbose_name='Last Name')),
                ('email', models.EmailField(blank=True, default='', max_length=254, verbose_name='Email')),
                ('phone', models.CharField(blank=True, default='', max_length=40, verbose_name='Phone')),
                ('company_name', models.CharField(blank=True, default='', max_length=200, verbose_name='Company Name')),
                ('client_type', models.CharField(choices=[('particular', 'Particulier'), ('professional', 'Professionnel')], default='particular', max_length=20, verbose_name='Client Type')),
                ('wilaya', models.CharField(blank=True, default='', max_length=100, verbose_name='Wilaya')),
                ('commune', models.CharField(blank=True, default='', max_length=100, verbose_name='Commune')),
                ('project_name', models.CharField(max_length=200, verbose_name='Project Name')),
                ('total_surface', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=10, verbose_name='Total Surface (m²)')),
                ('estimated_total_project_cost', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=14, verbose_name='Estimated Total Project Cost (DA)')),
                ('subtotal_before_discount', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Subtotal Before Discount (DA)')),
                ('discount_type', models.CharField(blank=True, choices=[('percentage', 'Percentage (%)'), ('fixed', 'Fixed Amount (DA)')], max_length=20, null=True, verbose_name='Discount Type')),
                ('discount_value', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Discount Value')),
                ('discount_amount', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Discount Amount (DA)')),
                ('subtotal_after_discount', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Subtotal After Discount (DA)')),
                ('tax_amount', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Tax Amount (DA)')),
                ('final_total', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Final Total (DA)')),
                ('currency', models.CharField(default='DA', max_length=10, verbose_name='Currency')),
                ('internal_discount_reason', models.TextField(blank=True, default='', verbose_name='Internal Discount Reason (Audit Only)')),
                ('client_discount_note', models.TextField(blank=True, default='', verbose_name='Client-facing Discount Note')),
                ('client_notes', models.TextField(blank=True, default='', verbose_name='Client Notes / Terms')),
                ('valid_until', models.DateField(blank=True, null=True, verbose_name='Valid Until')),
                ('sent_at', models.DateTimeField(blank=True, null=True, verbose_name='Sent At')),
                ('viewed_at', models.DateTimeField(blank=True, null=True, verbose_name='Viewed At')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('client', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotes', to=settings.AUTH_USER_MODEL, verbose_name='Client')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_quotes', to=settings.AUTH_USER_MODEL, verbose_name='Created By User')),
                ('design_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotes', to='dashboard.designrequest', verbose_name='Associated Design Request')),
                ('last_sent_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_quotes', to=settings.AUTH_USER_MODEL, verbose_name='Last Sent By User')),
                ('parent_quote', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='revisions', to='dashboard.quote', verbose_name='Parent Quote Revision')),
                ('project_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotes', to='dashboard.projecttype', verbose_name='Project Type')),
            ],
            options={
                'verbose_name': 'Quote',
                'verbose_name_plural': 'Quotes',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='QuoteAuditEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=80, verbose_name='Action')),
                ('previous_value', models.TextField(blank=True, default='', verbose_name='Previous Value')),
                ('new_value', models.TextField(blank=True, default='', verbose_name='New Value')),
                ('reason', models.TextField(blank=True, default='', verbose_name='Reason / Note')),
                ('metadata', models.JSONField(blank=True, default=dict, verbose_name='Metadata')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Timestamp')),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quote_audit_logs', to=settings.AUTH_USER_MODEL, verbose_name='Actor')),
                ('quote', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='audit_logs', to='dashboard.quote', verbose_name='Quote')),
            ],
            options={
                'verbose_name': 'Quote Audit Event',
                'verbose_name_plural': 'Quote Audit Events',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='QuoteItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('service_name', models.CharField(max_length=150, verbose_name='Service Name')),
                ('pricing_model', models.CharField(default='fixed', max_length=40, verbose_name='Pricing Model')),
                ('unit_price', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Unit Price (DA)')),
                ('percentage_rate', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True, verbose_name='Percentage Rate (%)')),
                ('estimated_project_cost_base', models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True, verbose_name='Estimated Project Cost Base (DA)')),
                ('quantity', models.DecimalField(decimal_places=2, default=Decimal('1.00'), max_digits=10, verbose_name='Quantity / Surface')),
                ('unit', models.CharField(default='FORFAIT', max_length=30, verbose_name='Unit')),
                ('line_total', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Line Total (DA)')),
                ('details_snapshot', models.JSONField(blank=True, default=dict, verbose_name='Commercial Details Snapshot')),
                ('quote', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='dashboard.quote', verbose_name='Quote')),
                ('service', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quote_items', to='dashboard.servicepricing', verbose_name='Catalog Service')),
            ],
            options={
                'verbose_name': 'Quote Item',
                'verbose_name_plural': 'Quote Items',
            },
        ),
        migrations.CreateModel(
            name='QuoteSpace',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('space_name', models.CharField(max_length=150, verbose_name='Space Name')),
                ('floor_name', models.CharField(blank=True, default='', max_length=100, verbose_name='Floor / Level')),
                ('price_at_time', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Price at Time (DA)')),
                ('quote', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='spaces', to='dashboard.quote', verbose_name='Quote')),
                ('space', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quote_spaces', to='dashboard.space', verbose_name='Space')),
            ],
            options={
                'verbose_name': 'Quote Space',
                'verbose_name_plural': 'Quote Spaces',
            },
        ),
        migrations.CreateModel(
            name='ServiceTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('locale', models.CharField(choices=[('fr', 'French'), ('en', 'English'), ('ar', 'Arabic')], max_length=10, verbose_name='Locale')),
                ('name', models.CharField(max_length=150, verbose_name='Localized Name')),
                ('short_description', models.CharField(blank=True, default='', max_length=255, verbose_name='Short Description')),
                ('detailed_description', models.TextField(blank=True, default='', verbose_name='Detailed Description')),
                ('included_items', models.JSONField(blank=True, default=list, verbose_name='What is Included')),
                ('excluded_items', models.JSONField(blank=True, default=list, verbose_name='What is Not Included')),
                ('deliverables', models.JSONField(blank=True, default=list, verbose_name='Deliverables')),
                ('included_revisions', models.CharField(blank=True, default='', max_length=50, verbose_name='Included Revisions')),
                ('estimated_delivery_time', models.CharField(blank=True, default='', max_length=100, verbose_name='Estimated Delivery Time')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='dashboard.servicepricing', verbose_name='Service')),
            ],
            options={
                'verbose_name': 'Service Translation',
                'verbose_name_plural': 'Service Translations',
                'ordering': ['locale'],
            },
        ),
        migrations.AddConstraint(
            model_name='servicetranslation',
            constraint=models.UniqueConstraint(fields=('service', 'locale'), name='unique_service_translation_locale'),
        ),
        migrations.RunPython(
            forward_service_translations_and_single_default,
            backward_noop,
        ),
    ]
