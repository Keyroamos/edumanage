from django.contrib import admin
from .models import SchoolConfig

@admin.register(SchoolConfig)
class SchoolConfigAdmin(admin.ModelAdmin):
    list_display = ['school_name', 'school_code', 'admission_number_format', 'admission_counter']
    fieldsets = (
        ('School Information', {
            'fields': ('school_name', 'school_code', 'school_email', 'school_phone')
        }),
        ('Admission Number Settings', {
            'fields': ('admission_number_format', 'admission_counter'),
            'description': 'Configure how admission numbers are generated. Available placeholders: {SCHOOL_CODE}, {YEAR}, {COUNTER:04d}, {GRADE}'
        }),
        ('Academic Settings', {
            'fields': ('current_term', 'current_year')
        }),
        ('Financial Settings', {
            'fields': ('default_currency',)
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not SchoolConfig.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False
