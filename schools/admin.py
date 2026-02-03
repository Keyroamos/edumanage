from django.contrib import admin
from django.db.models import Sum
from django.utils.html import format_html
from django.contrib import messages
from .models import (
    Subject, Assessment, AssessmentResult, Grade, Teacher, 
    Student, Payment, Employee, Salary, Leave, Term, Schedule,
    Attendance, SMSMessage, Department, Vehicle, Route, StudentTransportAssignment, TransportFee,
    Expense
)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']
    ordering = ['name']

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 
        'assessment_type', 
        'date', 
        'term'
    ]
    list_filter = [
        'assessment_type', 
        'term', 
        'date'
    ]
    search_fields = [
        'student__first_name',
        'student__last_name',
        'student__admission_number'
    ]
    date_hierarchy = 'date'

@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = [
        'assessment',
        'subject',
        'performance_level',
        'get_score'
    ]
    list_filter = [
        'performance_level',
        'assessment__assessment_type'
    ]
    search_fields = [
        'assessment__student__first_name',
        'assessment__student__last_name',
        'subject__name'
    ]

    def get_score(self, obj):
        """Get the appropriate score based on assessment type"""
        if obj.assessment.assessment_type == 'openner':
            return obj.opener_score
        elif obj.assessment.assessment_type == 'mid-term':
            return obj.midpoint_score
        elif obj.assessment.assessment_type == 'end-term':
            return obj.endpoint_score
        return None
    get_score.short_description = 'Score'

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = [
        'get_name_display', 
        'term1_fees', 
        'term2_fees', 
        'term3_fees', 
        'get_total_fees_display', 
        'is_active'
    ]
    list_editable = ['term1_fees', 'term2_fees', 'term3_fees', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']
    actions = ['update_student_fees']
    
    fieldsets = (
        ('Grade Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Fees Structure', {
            'fields': ('term1_fees', 'term2_fees', 'term3_fees'),
            'description': 'Set the fees for each term separately.'
        }),
        ('Class Teacher', {
            'fields': ('class_teacher',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return ('name',)
        return ()

    def get_total_fees_display(self, obj):
        total = obj.get_total_fees()
        return format_html('<strong>KES {}</strong>', '{:,.2f}'.format(total))
    get_total_fees_display.short_description = 'Total Fees'

    def update_student_fees(self, request, queryset):
        updated_count = 0
        for grade in queryset:
            students = Student.objects.filter(grade=grade)
            students.update(
                term1_fees=grade.term1_fees,
                term2_fees=grade.term2_fees,
                term3_fees=grade.term3_fees
            )
            updated_count += students.count()
        
        messages.success(
            request, 
            f'Successfully updated fees for {updated_count} student(s)'
        )
    update_student_fees.short_description = "Update student fees to match grade fees"

    def save_model(self, request, obj, form, change):
        """Override save_model to update student fees when grade fees change"""
        super().save_model(request, obj, form, change)
        
        # Update fees for all students in this grade
        students = Student.objects.filter(grade=obj)
        students.update(
            term1_fees=obj.term1_fees,
            term2_fees=obj.term2_fees,
            term3_fees=obj.term3_fees
        )
        
        if students.exists():
            messages.success(
                request, 
                f'Updated fees for {students.count()} student(s) in {obj.get_name_display()}'
            )

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'is_class_teacher', 'grade']
    list_filter = ['is_class_teacher', 'status']
    search_fields = ['first_name', 'last_name', 'email']

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'admission_number',
        'get_full_name',
        'grade',
        'current_term',
        'get_balance',
        'get_payment_status',
        'parent_phone'
    ]
    list_filter = [
        'grade',
        'current_term',
        'gender',
        'academic_year'
    ]
    search_fields = [
        'first_name',
        'last_name',
        'admission_number',
        'parent_name',
        'parent_phone',
        'parent_email'
    ]
    readonly_fields = [
        'user',
        'updated_at'
    ]
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'photo',
                'admission_number',
                'first_name',
                'last_name',
                'date_of_birth',
                'gender'
            )
        }),
        ('Academic Information', {
            'fields': (
                'grade',
                'current_term',
                'academic_year'
            )
        }),
        ('Parent/Guardian Information', {
            'fields': (
                'parent_name',
                'parent_phone',
                'parent_email',
                'parent_occupation',
                'parent_id_number'
            )
        }),
        ('Documents', {
            'fields': (
                'birth_certificate_no',
            )
        }),
        ('System Information', {
            'fields': (
                'user',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def get_payment_status(self, obj):
        status = obj.get_payment_status()
        status_colors = {
            'PAID': 'success',
            'PARTIAL': 'warning',
            'UNPAID': 'danger'
        }
        color = status_colors.get(status, 'secondary')
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            color,
            status
        )
    get_payment_status.short_description = 'Payment Status'

    def get_balance(self, obj):
        balance = obj.get_balance()
        color = 'success' if balance <= 0 else 'danger'
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            color,
            '{:,.2f}'.format(balance)
        )
    get_balance.short_description = 'Balance (KES)'

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'get_full_name',
        'position',
        'email',
        'phone',
        'department',
        'status',
        'date_joined'
    ]
    list_filter = [
        'position',
        'status',
        'department',
        'date_joined'
    ]
    search_fields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'national_id'
    ]
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'first_name', 'last_name', 'email', 'phone',
                'national_id', 'date_of_birth', 'gender',
                'profile_picture'
            )
        }),
        ('Employment Details', {
            'fields': (
                'position', 'department', 'date_joined',
                'status', 'basic_salary'
            )
        }),
        ('Additional Information', {
            'fields': (
                'address', 'religion', 'marital_status',
                'nationality'
            ),
            'classes': ('collapse',)
        })
    )
    readonly_fields = ['date_joined']
    ordering = ['first_name', 'last_name']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'head', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = [
        'employee',
        'month',
        'amount',
        'status',
        'payment_date'
    ]
    list_filter = [
        'status',
        'month',
        'payment_date'
    ]
    search_fields = [
        'employee__first_name',
        'employee__last_name',
        'employee__email'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-month', '-payment_date']

@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = [
        'employee',
        'leave_type',
        'start_date',
        'end_date',
        'status',
        'approved_by'
    ]
    list_filter = [
        'leave_type',
        'status',
        'start_date',
        'end_date'
    ]
    search_fields = [
        'employee__first_name',
        'employee__last_name',
        'reason'
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'approved_date',
        'approved_by'
    ]
    ordering = ['-created_at']

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['vehicle_number', 'vehicle_type', 'capacity', 'driver', 'status', 'get_current_students_count']
    list_filter = ['vehicle_type', 'status']
    search_fields = ['vehicle_number', 'make', 'model']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['vehicle_number']

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_location', 'end_location', 'fee_per_term', 'is_active', 'get_students_count']
    list_filter = ['is_active']
    search_fields = ['name', 'start_location', 'end_location']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']

@admin.register(StudentTransportAssignment)
class StudentTransportAssignmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'route', 'vehicle', 'is_active', 'start_date']
    list_filter = ['is_active', 'route', 'vehicle']
    search_fields = ['student__first_name', 'student__last_name', 'route__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(TransportFee)
class TransportFeeAdmin(admin.ModelAdmin):
    list_display = ['student', 'route', 'term', 'amount', 'status', 'date']
    list_filter = ['status', 'term', 'payment_method']
    search_fields = ['student__first_name', 'student__last_name', 'route__name', 'reference_number']
    readonly_fields = ['date']
    ordering = ['-date']
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'category',
        'amount',
        'date',
        'vendor',
        'payment_method',
        'receipt_number',
        'created_by'
    ]
    list_filter = [
        'category',
        'payment_method',
        'date',
        'created_by'
    ]
    search_fields = [
        'title',
        'vendor',
        'description',
        'receipt_number'
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'created_by'
    ]
    ordering = ['-date', '-created_at']
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
