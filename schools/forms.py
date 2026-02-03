from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.forms import modelformset_factory, inlineformset_factory
from datetime import date, datetime
from .models import (
    Student, Teacher, Assessment, AssessmentResult, 
    Grade, School, Payment, Employee, Salary, 
    Allowance, Deduction, Leave, Subject, Schedule, SMSMessage, Vehicle, Route, StudentTransportAssignment, TransportFee,
    MealPricing, StudentMealPayment,
)
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group
from django.utils.crypto import get_random_string

# Update the attendance choices
ATTENDANCE_CHOICES = [
    ('PRESENT', 'Present'),
    ('ABSENT', 'Absent'),
]

class StudentForm(forms.ModelForm):



    class Meta:
        model = Student
        fields = [
            'photo', 'admission_number', 'first_name', 'last_name', 
            'date_of_birth', 'gender', 'location', 'grade', 'current_term',
            'parent_name', 'parent_phone', 'parent_email', 
            'parent_occupation', 'parent_id_number',
            'guardian_name', 'guardian_phone', 'guardian_email',
            'guardian_occupation', 'guardian_id_number',
            'birth_certificate_no', 'academic_year', 'branch'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
            'grade': forms.Select(attrs={'class': 'form-select'}),
            'branch': forms.Select(attrs={'class': 'form-select'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Photo field attributes
        self.fields['photo'].widget.attrs.update({
            'class': 'form-control',
            'accept': 'image/*'
        })
        self.fields['academic_year'].required = True
        self.fields['location'].required = True
        self.fields['admission_number'].required = False
        self.fields['admission_number'].help_text = "Leave blank to auto-generate"
        

        
        # Group grades by level
        grade_choices = [('', 'Select Grade')]
        
        # Early Years
        early_years = [(g.id, g.get_name_display()) for g in Grade.objects.filter(name='PG')]
        if early_years:
            grade_choices.append(('Early Years', early_years))
        
        # Pre-Primary
        pre_primary = [(g.id, g.get_name_display()) for g in Grade.objects.filter(name__in=['PP1', 'PP2'])]
        if pre_primary:
            grade_choices.append(('Pre-Primary', pre_primary))
        
        # Primary School
        primary = [(g.id, g.get_name_display()) for g in Grade.objects.filter(name__startswith='G')]
        if primary:
            grade_choices.append(('Primary School', primary))
        
        self.fields['grade'].choices = grade_choices


    
    def clean(self):
        """Validate that at least one parent or guardian is provided"""
        cleaned_data = super().clean()
        parent_name = cleaned_data.get('parent_name')
        parent_phone = cleaned_data.get('parent_phone')
        guardian_name = cleaned_data.get('guardian_name')
        guardian_phone = cleaned_data.get('guardian_phone')
        
        # Check if at least one parent or guardian has name and phone
        has_parent = parent_name and parent_phone
        has_guardian = guardian_name and guardian_phone
        
        if not has_parent and not has_guardian:
            raise forms.ValidationError(
                "Please provide at least one parent or guardian with name and phone number."
            )
        
        # Check admission number
        admission_number = cleaned_data.get('admission_number')
        if not admission_number:
            # We'll generate it if it's empty to pass uniqueness checks
            # Note: We need school context which should be on self.instance
            if hasattr(self.instance, 'school') and self.instance.school:
                generated = self.instance.school.generate_admission_number(grade=cleaned_data.get('grade'))
                cleaned_data['admission_number'] = generated
                self.instance.admission_number = generated
        
        return cleaned_data

    def save(self, commit=True):
        student = super().save(commit=False)
        
        # Admission number is now handled in clean() or already present

        # Only create user account for new students
        if not student.pk:
            # Generate username from admission number
            admission_no = student.admission_number or self.cleaned_data.get('admission_number')
            base_username = f"STD{admission_no}"
            username = base_username
            
            # If username exists, append a number
            if User.objects.filter(username=username).exists():
                counter = 1
                while User.objects.filter(username=f"{username}{counter}").exists():
                    counter += 1
                username = f"{username}{counter}"
            
            # Get default password from school config
            raw_password = 'Student@123'
            if hasattr(student, 'school') and student.school:
                raw_password = student.school.student_portal_password
            
            # Create user account
            user = User.objects.create_user(
                username=username,
                password=raw_password,  # Django will hash this automatically
                first_name=self.cleaned_data['first_name'],
                last_name=self.cleaned_data['last_name'],
                email=self.cleaned_data.get('parent_email', '')
            )
            
            # Add user to Students group
            students_group, _ = Group.objects.get_or_create(name='Students')
            user.groups.add(students_group)
            
            # Associate user with student and store credentials
            student.user = user
            student.generated_username = username
            
            # Store the credentials temporarily for the success message
            student.temp_credentials = {
                'username': username,
                'password': raw_password
            }
            
        else:
            # Update existing user's information
            if student.user:
                student.user.first_name = self.cleaned_data['first_name']
                student.user.last_name = self.cleaned_data['last_name']
                student.user.email = self.cleaned_data.get('parent_email', '')
                student.user.save()
        
        if commit:
            student.save()
        
        return student

class TeacherForm(forms.ModelForm):


    class Meta:
        model = Teacher
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'tsc_number', 'national_id', 'position',
            'subjects', 'qualifications', 'basic_salary',
            'profile_picture', 'date_of_birth',
            'gender', 'marital_status', 'years_of_experience',
            'grade', 'is_class_teacher', 'certificate', 'branch',
            'department', 'religion', 'nationality', 'address'
        ]
        widgets = {
            'position': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'qualifications': forms.Select(attrs={'class': 'form-select'}),
            'subjects': forms.SelectMultiple(attrs={'class': 'form-select'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control'}),
            'certificate': forms.FileInput(attrs={'class': 'form-control'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-select'}),
            'marital_status': forms.Select(attrs={'class': 'form-select'}),
            'years_of_experience': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'location': forms.Select(attrs={'class': 'form-select'}),
            'grade': forms.Select(attrs={'class': 'form-select'}),
            'is_class_teacher': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'branch': forms.Select(attrs={'class': 'form-select'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'religion': forms.Select(attrs={'class': 'form-select'}),
            'nationality': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure optional fields are handled correctly in the form
        optional_fields = ['tsc_number', 'branch', 'department', 'grade', 'address', 'profile_picture', 'certificate', 'subjects', 'nationality']
        for field in optional_fields:
            if field in self.fields:
                self.fields[field].required = False

    def clean_basic_salary(self):
        val = self.cleaned_data.get('basic_salary')
        if val is None or val == '':
            return 0
        return val

    def clean_years_of_experience(self):
        val = self.cleaned_data.get('years_of_experience')
        if val is None or val == '':
            return 0
        return val

    def clean_tsc_number(self):
        tsc = self.cleaned_data.get('tsc_number')
        if not tsc or tsc.strip() == '':
            return None
        return tsc

    def clean(self):
        cleaned_data = super().clean()
        
        # Check if email is already used as username
        email = cleaned_data.get('email')
        if email and User.objects.filter(username=email).exists() and not self.instance.pk:
            self.add_error('email', 'A user with this email already exists')

        # Ensure location is set to MAIN if missing
        if not cleaned_data.get('location'):
            cleaned_data['location'] = 'MAIN'

        # Validate required fields that are not in model blank=True but might be missing/empty
        required_fields = ['position', 'first_name', 'last_name', 'email', 'national_id', 'phone', 'date_of_birth']
        for field in required_fields:
            if not cleaned_data.get(field):
                self.add_error(field, f'{field.replace("_", " ").title()} is required')

        return cleaned_data

    def save(self, commit=True):
        teacher = super().save(commit=False)
        
        if commit:
            try:
                # Get default password from school config if available
                raw_password = 'Teacher@123'
                if hasattr(teacher, 'school') and teacher.school:
                    raw_password = teacher.school.teacher_portal_password
                
                # Create user with email as username
                user = User.objects.create_user(
                    username=self.cleaned_data['email'],
                    email=self.cleaned_data['email'],
                    password=raw_password,
                    first_name=self.cleaned_data['first_name'],
                    last_name=self.cleaned_data['last_name']
                )
                
                # Add to Teachers group
                teachers_group = Group.objects.get_or_create(name='Teachers')[0]
                user.groups.add(teachers_group)
                
                # Link user to teacher
                teacher.user = user
                teacher.save()
            except Exception as e:
                # If user creation fails, do not save teacher
                raise forms.ValidationError(f'Error creating user account: {str(e)}')
            
            self.save_m2m()  # Save many-to-many relationships
            
        return teacher

class AssessmentForm(forms.ModelForm):
    class Meta:
        model = Assessment
        fields = ['student', 'assessment_type', 'date', 'term', 'remarks']
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'assessment_type': forms.Select(attrs={'class': 'form-select'}),
            'term': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'remarks': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Overall assessment remarks'}),
        }

# Create a formset for assessment results
AssessmentResultFormSet = forms.inlineformset_factory(
    Assessment,
    AssessmentResult,
    fields=['subject', 'marks', 'remarks'],
    extra=1,
    can_delete=False,
    widgets={
        'subject': forms.Select(attrs={'class': 'form-select'}),
        'marks': forms.NumberInput(attrs={
            'class': 'form-control',
            'min': '0',
            'max': '10',
            'step': '0.1',
            'placeholder': 'Marks out of 10'
        }),
        'remarks': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Subject remarks'
        })
    }
)

class AssessmentResultForm(forms.ModelForm):
    class Meta:
        model = AssessmentResult
        fields = [
            'subject',
            'performance_level',
            'opener_score',
            'midpoint_score',
            'endpoint_score'
        ]
        
    def clean(self):
        cleaned_data = super().clean()
        assessment_type = self.instance.assessment.assessment_type if self.instance.assessment else None
        
        # Validate scores based on assessment type
        if assessment_type == 'openner':
            if not cleaned_data.get('opener_score'):
                raise forms.ValidationError("Opener score is required for opener assessment")
        elif assessment_type == 'mid-term':
            if not cleaned_data.get('midpoint_score'):
                raise forms.ValidationError("Mid-term score is required for mid-term assessment")
        elif assessment_type == 'end-term':
            if not cleaned_data.get('endpoint_score'):
                raise forms.ValidationError("End-term score is required for end-term assessment")
                
        return cleaned_data

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = [
            'student',
            'amount',
            'payment_method',
            'phone_number',
            'term'
        ]
        widgets = {
            'student': forms.Select(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'step': '0.01',
                'placeholder': 'Enter amount'
            }),
            'payment_method': forms.Select(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter phone number starting with 254'
            }),
            'term': forms.Select(attrs={'class': 'form-control'})
        }

    def clean_amount(self):
        amount = self.cleaned_data.get('amount')
        if amount is None:
            raise forms.ValidationError("Please enter a payment amount")
        if amount <= 0:
            raise forms.ValidationError("Payment amount must be greater than 0")
        if amount > 1000000:  # Add a reasonable upper limit
            raise forms.ValidationError("Payment amount cannot exceed KES 1,000,000")
        return amount

    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        payment_method = self.cleaned_data.get('payment_method')
        
        if payment_method == 'MPESA' and not phone:
            raise forms.ValidationError("Phone number is required for M-Pesa payments")
        
        if phone and not phone.startswith('254'):
            raise forms.ValidationError("Phone number must start with 254")
            
        return phone

    def clean(self):
        cleaned_data = super().clean()
        payment_method = cleaned_data.get('payment_method')
        phone_number = cleaned_data.get('phone_number')
        
        if payment_method == 'MPESA' and not phone_number:
            self.add_error('phone_number', 'Phone number is required for M-Pesa payments')
            
        return cleaned_data

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'phone', 
            'position', 'date_of_birth', 'address', 'date_joined',
            'basic_salary', 'profile_picture', 'national_id'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
            'date_joined': forms.DateInput(attrs={'type': 'date'}),
            'basic_salary': forms.NumberInput(attrs={'step': '0.01'}),
            'national_id': forms.TextInput(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            self.initial['date_joined'] = timezone.now().date()
            self.initial['basic_salary'] = 0.00

        # Make national_id required
        self.fields['national_id'].required = True
        self.fields['national_id'].help_text = 'Enter a unique national ID number'

    def clean_national_id(self):
        national_id = self.cleaned_data.get('national_id')
        if not national_id:
            raise forms.ValidationError("National ID is required")
        
        # Check if national_id is unique
        if Employee.objects.filter(national_id=national_id).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("This National ID is already in use")
        
        return national_id

class SalaryForm(forms.ModelForm):
    class Meta:
        model = Salary
        fields = ['amount', 'month', 'status', 'remarks']
        widgets = {
            'amount': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'month': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'month'
            }),
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3
            })
        }

    def clean(self):
        cleaned_data = super().clean()
        month = cleaned_data.get('month')
        
        if month:
            # Check if salary already exists for this month and employee
            existing_salary = Salary.objects.filter(
                employee=self.instance.employee if self.instance else None,
                month=month
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            
            if existing_salary:
                raise forms.ValidationError('Salary already exists for this month')
        
        return cleaned_data

class AllowanceForm(forms.ModelForm):
    class Meta:
        model = Allowance
        fields = ['type', 'amount', 'description']

class DeductionForm(forms.ModelForm):
    class Meta:
        model = Deduction
        fields = ['type', 'amount', 'description']

class LeaveForm(forms.ModelForm):
    class Meta:
        model = Leave
        fields = ['leave_type', 'start_date', 'end_date', 'reason']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'})
        }

# Create formsets for allowances and deductions
AllowanceFormSet = inlineformset_factory(
    Salary,
    Allowance,
    fields=('type', 'amount', 'description'),
    extra=1,
    can_delete=True,
    widgets={
        'type': forms.Select(attrs={'class': 'form-select'}),
        'amount': forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01',
            'min': '0'
        }),
        'description': forms.TextInput(attrs={'class': 'form-control'})
    }
)

DeductionFormSet = inlineformset_factory(
    Salary,
    Deduction,
    fields=('type', 'amount', 'description'),
    extra=1,
    can_delete=True,
    widgets={
        'type': forms.Select(attrs={'class': 'form-select'}),
        'amount': forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01',
            'min': '0'
        }),
        'description': forms.TextInput(attrs={'class': 'form-control'})
    }
)

class ScheduleForm(forms.ModelForm):
    class Meta:
        model = Schedule
        fields = ['day', 'start_time', 'end_time', 'subject', 'grade']
        widgets = {
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'type': 'time'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise forms.ValidationError("End time must be after start time")
        
        return cleaned_data

class SMSMessageForm(forms.ModelForm):
    class Meta:
        model = SMSMessage
        fields = ['message', 'recipient_type', 'specific_grade', 'specific_student', 'specific_employee', 'fee_min', 'fee_max']
        widgets = {
            'message': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 6,
                'placeholder': 'Enter your message here (max 160 characters per SMS)',
                'maxlength': '160'
            }),
            'recipient_type': forms.Select(attrs={
                'class': 'form-select',
                'id': 'id_recipient_type'
            }),
            'specific_grade': forms.Select(attrs={
                'class': 'form-select',
                'id': 'id_specific_grade'
            }),
            'specific_student': forms.Select(attrs={
                'class': 'form-select',
                'id': 'id_specific_student'
            }),
            'specific_employee': forms.Select(attrs={
                'class': 'form-select',
                'id': 'id_specific_employee'
            }),
            'fee_min': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Min Balance'
            }),
            'fee_max': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Max Balance'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .models import Grade, Student, Employee
        
        self.fields['specific_grade'].required = False
        self.fields['specific_grade'].queryset = Grade.objects.filter(is_active=True).order_by('name')
        self.fields['specific_grade'].label = 'Select Grade/Class'
        
        self.fields['specific_student'].required = False
        self.fields['specific_student'].queryset = Student.objects.all().order_by('first_name', 'last_name')
        self.fields['specific_student'].label = 'Select Student'

        self.fields['specific_employee'].required = False
        self.fields['specific_employee'].queryset = Employee.objects.all().order_by('first_name', 'last_name')
        self.fields['specific_employee'].label = 'Select Staff Member'

        self.fields['fee_min'].required = False
        self.fields['fee_max'].required = False
        
        # Add help text
        self.fields['recipient_type'].help_text = 'Choose who should receive this SMS message'
        self.fields['message'].help_text = 'Enter your message (keep it concise for SMS)'
        
    def clean(self):
        cleaned_data = super().clean()
        recipient_type = cleaned_data.get('recipient_type')
        specific_grade = cleaned_data.get('specific_grade')
        specific_student = cleaned_data.get('specific_student')
        specific_employee = cleaned_data.get('specific_employee')
        
        if recipient_type == 'GRADE' and not specific_grade:
            raise forms.ValidationError({
                'specific_grade': 'Please select a grade/class for grade-specific messages'
            })
        
        if recipient_type == 'INDIVIDUAL' and not specific_student:
            raise forms.ValidationError({
                'specific_student': 'Please select a student for individual messages'
            })

        if recipient_type == 'INDIVIDUAL_STAFF' and not specific_employee:
            raise forms.ValidationError({
                'specific_employee': 'Please select a staff member for individual messages'
            })
            
        return cleaned_data

class AdminStaffForm(forms.ModelForm):


    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'national_id', 'date_of_birth', 'gender',
            'profile_picture', 'basic_salary', 'department',
            'address', 'religion', 'marital_status',
            'nationality'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-select'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'religion': forms.Select(attrs={'class': 'form-select'}),
            'marital_status': forms.Select(attrs={'class': 'form-select'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control'}),
            'basic_salary': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:  # If creating new instance
            self.initial['position'] = 'ADMIN'
            self.initial['status'] = 'ACTIVE'

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
            
        # Check if email is already used as username
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError('A user with this email already exists')

        return cleaned_data

    def save(self, commit=True):
        admin = super().save(commit=False)
        admin.position = 'ADMIN'
        admin.status = 'ACTIVE'
        
        if commit:
            admin.save()
            
            try:
                # Admin is a special case, but we can still use a default or the school email
                # Better to use a standard complex default for admins if not specified
                raw_password = 'Admin@7878'
                
                # Create user account
                user = User.objects.create_user(
                    username=self.cleaned_data['email'],
                    email=self.cleaned_data['email'],
                    password=raw_password,
                    first_name=self.cleaned_data['first_name'],
                    last_name=self.cleaned_data['last_name'],
                    is_staff=True  # Give staff permissions
                )
                
                # Add to Admin Staff group
                admin_group = Group.objects.get_or_create(name='Admin Staff')[0]
                user.groups.add(admin_group)
                
                # Save the admin staff member
                admin.user = user
                admin.save()
                
            except Exception as e:
                # If user creation fails, delete the admin staff member
                admin.delete()
                raise forms.ValidationError(f'Error creating user account: {str(e)}')
        
        return admin

class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = ['vehicle_number', 'vehicle_type', 'make', 'model', 'year', 'capacity', 
                  'driver', 'status', 'insurance_expiry', 'registration_expiry', 'notes']
        widgets = {
            'vehicle_number': forms.TextInput(attrs={'class': 'form-control'}),
            'vehicle_type': forms.Select(attrs={'class': 'form-select'}),
            'make': forms.TextInput(attrs={'class': 'form-control'}),
            'model': forms.TextInput(attrs={'class': 'form-control'}),
            'year': forms.NumberInput(attrs={'class': 'form-control'}),
            'capacity': forms.NumberInput(attrs={'class': 'form-control'}),
            'driver': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'insurance_expiry': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'registration_expiry': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }

class RouteForm(forms.ModelForm):
    # Hidden fields for coordinates (will be populated by JavaScript)
    start_latitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    start_longitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    end_latitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    end_longitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    school_latitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    school_longitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = Route
        fields = ['name', 'description', 'start_location', 'end_location', 'distance', 
                  'estimated_time', 'fee_per_term', 'location', 'is_active', 'start_latitude', 
                  'start_longitude', 'end_latitude', 'end_longitude', 'school_latitude', 
                  'school_longitude']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'start_location': forms.TextInput(attrs={'class': 'form-control', 'id': 'start-location-input'}),
            'end_location': forms.TextInput(attrs={'class': 'form-control', 'id': 'end-location-input'}),
            'distance': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'estimated_time': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., 45 minutes'}),
            'fee_per_term': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'location': forms.Select(attrs={'class': 'form-select'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }

class StudentTransportAssignmentForm(forms.ModelForm):
    # Hidden fields for coordinates
    pickup_latitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    pickup_longitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    dropoff_latitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    dropoff_longitude = forms.DecimalField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = StudentTransportAssignment
        fields = ['student', 'route', 'vehicle', 'pickup_location', 'dropoff_location', 
                  'pickup_time', 'dropoff_time', 'is_active', 'start_date', 'end_date', 'notes',
                  'pickup_latitude', 'pickup_longitude', 'dropoff_latitude', 'dropoff_longitude']
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'route': forms.Select(attrs={'class': 'form-select'}),
            'vehicle': forms.Select(attrs={'class': 'form-select'}),
            'pickup_location': forms.TextInput(attrs={'class': 'form-control', 'id': 'pickup-location-input'}),
            'dropoff_location': forms.TextInput(attrs={'class': 'form-control', 'id': 'dropoff-location-input'}),
            'pickup_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'dropoff_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['vehicle'].required = False
        self.fields['end_date'].required = False
        self.fields['notes'].required = False

class TransportFeeForm(forms.ModelForm):
    class Meta:
        model = TransportFee
        fields = ['student', 'route', 'term', 'amount', 'payment_method', 'phone_number', 
                  'transaction_id', 'reference_number', 'status', 'notes']
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'route': forms.Select(attrs={'class': 'form-select'}),
            'term': forms.Select(attrs={'class': 'form-select'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'payment_method': forms.Select(attrs={'class': 'form-select'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'transaction_id': forms.TextInput(attrs={'class': 'form-control'}),
            'reference_number': forms.TextInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['phone_number'].required = False
        self.fields['transaction_id'].required = False
        self.fields['notes'].required = False
        # Auto-generate reference number if not provided
        if not self.instance.pk and not self.initial.get('reference_number'):
            from django.utils import timezone
            import random
            ref = f'TRANS-{timezone.now().strftime("%Y%m%d")}-{random.randint(1000, 9999)}'
            self.initial['reference_number'] = ref
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        # Generate reference number if not set
        if not instance.reference_number:
            from django.utils import timezone
            import random
            instance.reference_number = f'TRANS-{timezone.now().strftime("%Y%m%d")}-{random.randint(1000, 9999)}'
        if commit:
            instance.save()
        return instance

class MealPricingForm(forms.ModelForm):
    class Meta:
        model = MealPricing
        fields = ['meal_type', 'price_per_day', 'location', 'is_active']
        widgets = {
            'meal_type': forms.Select(attrs={'class': 'form-select'}),
            'price_per_day': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': 'Enter price per day'
            }),
            'location': forms.Select(attrs={'class': 'form-select'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }
    
    def clean_price_per_day(self):
        price = self.cleaned_data.get('price_per_day')
        if price is None or price <= 0:
            raise forms.ValidationError("Price per day must be greater than 0")
        return price

class StudentMealPaymentForm(forms.ModelForm):
    meals = forms.MultipleChoiceField(
        choices=StudentMealPayment.MEAL_TYPES,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
        required=True,
        help_text="Select one or more meals for this payment"
    )
    
    class Meta:
        model = StudentMealPayment
        fields = [
            'student', 'payment_frequency', 'number_of_days', 
            'amount', 'payment_method', 'phone_number', 
            'transaction_id', 'payment_date', 'start_date', 
            'end_date', 'location', 'notes', 'status'
        ]
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'payment_frequency': forms.Select(attrs={'class': 'form-select'}),
            'number_of_days': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'step': '1',
                'placeholder': 'Number of days'
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': 'Total payment amount'
            }),
            'payment_method': forms.Select(attrs={'class': 'form-select'}),
            'phone_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Phone number (for M-Pesa)'
            }),
            'transaction_id': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Transaction ID (optional)'
            }),
            'payment_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'start_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'end_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'location': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Additional notes (optional)'
            }),
            'status': forms.Select(attrs={'class': 'form-select'})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['phone_number'].required = False
        self.fields['transaction_id'].required = False
        self.fields['end_date'].required = False
        self.fields['notes'].required = False
        # Location will be auto-populated from student, so make it not required in form validation
        self.fields['location'].required = False
        
        # Set default location from student if available
        if self.instance and self.instance.pk and hasattr(self.instance, 'student') and self.instance.student:
            self.initial['location'] = self.instance.student.location
        elif 'student' in self.initial:
            try:
                from .models import Student
                student = Student.objects.get(pk=self.initial['student'])
                self.initial['location'] = student.location
            except (Student.DoesNotExist, ValueError):
                pass
        
        # Set default values
        if not self.instance.pk:
            from django.utils import timezone
            self.initial['payment_date'] = timezone.now().date()
            self.initial['start_date'] = timezone.now().date()
            self.initial['status'] = 'COMPLETED'
            self.initial['payment_frequency'] = 'MULTIPLE_DAYS'
            self.initial['number_of_days'] = 1
    
    def clean(self):
        from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
        
        cleaned_data = super().clean()
        meals = cleaned_data.get('meals')
        number_of_days = cleaned_data.get('number_of_days')
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        payment_method = cleaned_data.get('payment_method')
        phone_number = cleaned_data.get('phone_number')
        student = cleaned_data.get('student')
        location = cleaned_data.get('location')
        amount = cleaned_data.get('amount')
        
        if not meals:
            raise forms.ValidationError("Please select at least one meal type")
        
        if number_of_days and number_of_days <= 0:
            raise forms.ValidationError("Number of days must be greater than 0")
        
        if end_date and start_date and end_date < start_date:
            raise forms.ValidationError("End date cannot be before start date")
        
        if payment_method == 'MPESA' and not phone_number:
            raise forms.ValidationError("Phone number is required for M-Pesa payments")
        
        # Auto-populate location from student if not provided
        if not location and student:
            cleaned_data['location'] = student.location
        
        # Ensure amount is properly rounded to 2 decimal places
        if amount is not None:
            try:
                amount_decimal = Decimal(str(amount))
                cleaned_data['amount'] = amount_decimal.quantize(
                    Decimal('0.01'), 
                    rounding=ROUND_HALF_UP
                )
            except (InvalidOperation, ValueError, TypeError):
                # If conversion fails, keep original value and let field validation handle it
                pass
        
        return cleaned_data
    
    def save(self, commit=True):
        # This form handles multiple meals, so we need to create multiple payment records
        meals = self.cleaned_data.pop('meals', [])
        instance = super().save(commit=False)
        
        # Generate base reference number if not set
        import uuid
        from .models import StudentMealPayment
        
        if not instance.reference_number:
            # Generate unique base reference
            while True:
                base_reference = f"MEAL-{uuid.uuid4().hex[:12].upper()}"
                if not StudentMealPayment.objects.filter(reference_number=base_reference).exists():
                    break
        else:
            base_reference = instance.reference_number
        
        # Generate payment group for payments made together
        payment_group = f"GROUP-{uuid.uuid4().hex[:8].upper()}" if len(meals) > 1 else None
        
        # Calculate amount per meal if multiple meals
        # Get amount from cleaned_data first, then instance, then default to 0
        from decimal import Decimal, ROUND_HALF_UP
        amount_value = self.cleaned_data.get('amount')
        if amount_value is None:
            amount_value = getattr(instance, 'amount', None)
        if amount_value is None:
            amount_value = 0
        
        # Convert to Decimal for precise calculations
        total_amount = Decimal(str(amount_value))
        num_meals = len(meals)
        
        if num_meals > 0:
            # Divide and round to 2 decimal places
            amount_per_meal = (total_amount / Decimal(num_meals)).quantize(
                Decimal('0.01'), 
                rounding=ROUND_HALF_UP
            )
        else:
            amount_per_meal = total_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Get location from instance or student
        location = getattr(instance, 'location', None)
        if not location and instance.student:
            location = instance.student.location
        
        # Create payment records for each selected meal
        created_payments = []
        for i, meal_type in enumerate(meals):
            # Generate unique reference number for database (to satisfy unique constraint)
            # But use base reference for display purposes
            if num_meals > 1:
                # For grouped payments, use base reference with suffix for uniqueness
                unique_ref = f"{base_reference}-{i+1}" if i > 0 else base_reference
            else:
                unique_ref = base_reference
            
            # Calculate balance (initially same as amount, will be updated as meals are consumed)
            balance = amount_per_meal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            payment = StudentMealPayment(
                student=instance.student,
                meal_type=meal_type,
                payment_frequency=instance.payment_frequency,
                number_of_days=instance.number_of_days,
                amount=amount_per_meal,
                balance=balance,
                payment_method=instance.payment_method,
                phone_number=instance.phone_number,
                transaction_id=instance.transaction_id,
                payment_date=instance.payment_date,
                start_date=instance.start_date,
                end_date=instance.end_date,
                notes=instance.notes,
                status=instance.status,
                payment_group=payment_group,
                location=location or 'MAIN',
                reference_number=unique_ref
            )
            if commit:
                payment.save()
            created_payments.append(payment)
        
        # Return the first payment as the main instance
        return created_payments[0] if created_payments else instance