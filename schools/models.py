from django.db import models
from django.contrib.auth.models import User
from datetime import date
from django.db.models import Sum, Count, Avg, Q, F, Value, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django.templatetags.static import static
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import Group
from django.urls import reverse
from django.core.exceptions import ValidationError
import uuid

# Define choices at module level
TERM_CHOICES = [
    (1, 'Term 1'),
    (2, 'Term 2'),
    (3, 'Term 3'),
]

LOCATION_CHOICES = [
    ('MAIN', 'Main School'),
    ('ANNEX', 'Annex School'),
]

def student_profile_path(instance, filename):
    # Get file extension
    ext = filename.split('.')[-1]
    # File will be uploaded to MEDIA_ROOT/student_profiles/admission_number/photo.ext
    return f'student_profiles/{instance.admission_number}/photo.{ext}'

def teacher_profile_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/teacher_profiles/national_id/photo.ext
    ext = filename.split('.')[-1]
    return f'teacher_profiles/{instance.national_id}/photo.{ext}'

class Grade(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='grades', null=True, blank=True)
    GRADE_CHOICES = [
        ('PG', 'Playgroup'),
        ('PP1', 'PP1'),
        ('PP2', 'PP2'),
        ('G1', 'Grade 1'),
        ('G2', 'Grade 2'),
        ('G3', 'Grade 3'),
        ('G4', 'Grade 4'),
        ('G5', 'Grade 5'),
        ('G6', 'Grade 6'),
        ('G7', 'Grade 7'),
        ('G8', 'Grade 8'),
        ('G9', 'Grade 9'),
        ('G10', 'Grade 10'),
        ('G11', 'Grade 11'),
        ('G12', 'Grade 12'),
    ]
    
    name = models.CharField(max_length=20, choices=GRADE_CHOICES)
    description = models.TextField(blank=True, default='')
    term1_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Term 1 fees", 
        default=0
    )
    term2_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Term 2 fees", 
        default=0
    )
    term3_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Term 3 fees", 
        default=0
    )
    is_active = models.BooleanField(default=True)
    class_teacher = models.OneToOneField(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='grade_assigned'
    )

    def __str__(self):
        return self.get_name_display()

    class Meta:
        unique_together = ['school', 'name']
        ordering = ['name']

    def get_total_fees(self):
        return self.term1_fees + self.term2_fees + self.term3_fees

class Subject(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
    SUBJECT_CHOICES = [
        ('MATH', 'Mathematics'),
        ('ENG', 'English'),
        ('KIS', 'Kiswahili'),
        ('SCI', 'Science & Technology'),
        ('SST', 'Social Studies'),
        ('CRE', 'Christian Religious Education'),
        ('IRE', 'Islamic Religious Education'),
        ('HRE', 'Hindu Religious Education'),
        ('PHE', 'Physical & Health Education'),
        ('ART', 'Art & Craft'),
        ('MUS', 'Music'),
        ('AGR', 'Agriculture')
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, choices=SUBJECT_CHOICES)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['school', 'code']
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Branch(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='branch_offices', null=True, blank=True)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(f"{self.name}-{uuid.uuid4().hex[:6]}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Branches"
        unique_together = ['school', 'name']

class Department(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='departments', null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    head = models.ForeignKey(
        'Employee', 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_department'
    )
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Employee(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='employees', null=True, blank=True)
    POSITION_CHOICES = [
        ('TEACHER', 'Teacher'),
        ('HOD', 'Head of Department'),
        ('DEPUTY', 'Deputy Principal'),
        ('PRINCIPAL', 'Principal'),
        ('ADMIN', 'Administrative Staff'),
        ('ACCOUNTANT', 'Accountant'),
        ('FOOD_MANAGER', 'Food Manager'),
        ('TRANSPORT_MANAGER', 'Transport Manager'),
        ('DRIVER', 'Driver'),
        ('SUPPORT', 'Support Staff')
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ON_LEAVE', 'On Leave')
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    
    RELIGION_CHOICES = [
        ('CHRISTIAN', 'Christian'),
        ('MUSLIM', 'Muslim'),
        ('HINDU', 'Hindu'),
        ('BUDDHIST', 'Buddhist'),
        ('OTHER', 'Other')
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed')
    ]
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    national_id = models.CharField(max_length=20, unique=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES)
    date_of_birth = models.DateField()
    date_joined = models.DateField(default=timezone.now)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='employee_profiles/', blank=True, null=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Add default values for new required fields
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES, default='CHRISTIAN')
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, default='SINGLE')
    nationality = models.CharField(max_length=100, default='Kenyan')
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return self.get_full_name()
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def user(self):
        """Helper to get the user account from subclasses"""
        if hasattr(self, 'teacher'):
            return self.teacher.user
        if hasattr(self, 'nonteachingstaff'):
            return self.nonteachingstaff.user
        # Fallback for when 'user' is set as a dynamic attribute (like in some forms)
        if hasattr(self, '_user_cache'):
            return self._user_cache
        return getattr(self, '_user', None)

    @user.setter
    def user(self, value):
        self._user_cache = value
        self._user = value

    def teacher_profile(self):
        """Get associated teacher profile if exists"""
        if hasattr(self, 'teacher'):
            return self.teacher
        return None

class Teacher(Employee):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)
    QUALIFICATION_CHOICES = [
        ('CERT', 'Certificate'),
        ('DIP', 'Diploma'),
        ('DEG', 'Degree'),
        ('MAST', 'Masters'),
        ('PHD', 'PhD')
    ]
    
    SUBJECT_CHOICES = [
        ('MATH', 'Mathematics'),
        ('ENG', 'English'),
        ('KIS', 'Kiswahili'),
        ('SCI', 'Science & Technology'),
        ('SST', 'Social Studies'),
        ('CRE', 'Christian Religious Education'),
        ('IRE', 'Islamic Religious Education'),
        ('HRE', 'Hindu Religious Education'),
        ('PHE', 'Physical & Health Education'),
        ('ART', 'Art & Craft'),
        ('MUS', 'Music'),
        ('AGR', 'Agriculture')
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female')
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed')
    ]
    
    RELIGION_CHOICES = [
        ('CHRISTIAN', 'Christian'),
        ('MUSLIM', 'Muslim'),
        ('HINDU', 'Hindu'),
        ('OTHER', 'Other')
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ON_LEAVE', 'On Leave'),
        ('INACTIVE', 'Inactive')
    ]

    # Teacher specific fields
    tsc_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    qualifications = models.CharField(
        max_length=10, 
        choices=QUALIFICATION_CHOICES,
        verbose_name="Highest Qualification"
    )
    certificate = models.FileField(
        upload_to='teacher_certificates/',
        help_text='Upload your highest qualification certificate (PDF or image)',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'jpg', 'jpeg', 'png']
            )
        ],
        null=True,
        blank=True
    )
    subjects = models.ManyToManyField(
        Subject,
        related_name='teachers',
        limit_choices_to={'code__in': [code for code, _ in SUBJECT_CHOICES]}
    )
    is_class_teacher = models.BooleanField(default=False)
    grade = models.ForeignKey(
        Grade, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='teachers'
    )

    class Meta:
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'

    def __str__(self):
        return self.get_full_name()

    def get_absolute_url(self):
        return reverse('teacher_detail', kwargs={'pk': self.pk})

    @property
    def age(self):
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def gross_salary(self):
        return self.basic_salary

    @property
    def total_deductions(self):
        """Calculate total deductions from the latest salary record"""
        latest_salary = self.salaries.order_by('-month').first()
        if latest_salary:
            return latest_salary.deduction_items.aggregate(
                total=models.Sum('amount')
            )['total'] or 0
        return 0

    @property
    def net_salary(self):
        return self.gross_salary - self.total_deductions

    class Meta:
        ordering = ['first_name', 'last_name']

    def save(self, *args, **kwargs):
        if not self.position:
            self.position = 'TEACHER'
        
        # Create user account if email exists and no user is linked
        if not hasattr(self, 'user') and self.email:
            # Create user account
            user = User.objects.create_user(
                username=self.email,
                email=self.email,
                password='Bdmis@7878',
                first_name=self.first_name,
                last_name=self.last_name
            )
            # Add user to Teachers group
            teachers_group = Group.objects.get_or_create(name='Teachers')[0]
            user.groups.add(teachers_group)
        
        super().save(*args, **kwargs)
        
        # Update grade's class teacher after saving
        if self.is_class_teacher and self.grade:
            self.grade.class_teacher = self
            self.grade.save()

    def get_initials(self):
        """Return the teacher's initials"""
        return f"{self.first_name[0]}{self.last_name[0]}".upper()

    def get_full_name(self):
        """Return the teacher's full name"""
        return f"{self.first_name} {self.last_name}"

class Student(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='student_profile'
    )
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    
    TERM_CHOICES = [
        (1, 'Term 1'),
        (2, 'Term 2'),
        (3, 'Term 3')
    ]
    
    # Basic Information
    admission_number = models.CharField(max_length=50, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    grade = models.ForeignKey(
        'Grade', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='students'
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    
    # Parent Information
    parent_name = models.CharField(max_length=100, blank=True, null=True)
    parent_phone = models.CharField(max_length=20, blank=True, null=True)
    parent_email = models.EmailField(blank=True, null=True)
    parent_occupation = models.CharField(max_length=100, blank=True, null=True)
    parent_id_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Parent ID Number")
    
    # Guardian Information
    guardian_name = models.CharField(max_length=100, blank=True, null=True)
    guardian_phone = models.CharField(max_length=20, blank=True, null=True)
    guardian_email = models.EmailField(blank=True, null=True)
    guardian_occupation = models.CharField(max_length=100, blank=True, null=True)
    guardian_id_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Guardian ID Number")
    
    # Academic Information
    previous_grade = models.ForeignKey('Grade', on_delete=models.SET_NULL, null=True, blank=True, related_name='previous_students')
    academic_year = models.CharField(
        max_length=9, 
        help_text="Format: YYYY-YYYY",
        null=True,  # Make it nullable
        blank=True  # Allow blank in forms
    )
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    photo = models.ImageField(
        upload_to='student_photos/',
        null=True,
        blank=True,
        verbose_name='Profile Photo',
        help_text='Upload a profile photo (optional)'
    )
    term_fees = models.DecimalField(max_digits=10, decimal_places=2, default=15000)
    current_term = models.IntegerField(choices=TERM_CHOICES, default=1)
    birth_certificate_no = models.CharField(max_length=50, blank=True, null=True, verbose_name="Birth Certificate Number")
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # New fee fields
    term1_fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Term 1 fees",
        default=0
    )
    term2_fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Term 2 fees",
        default=0
    )
    term3_fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Term 3 fees",
        default=0
    )
    
    def get_term_fees(self, term=None):
        """Get fees for specific term or current term"""
        term = term or self.current_term
        if term == 1:
            return self.term1_fees
        elif term == 2:
            return self.term2_fees
        elif term == 3:
            return self.term3_fees
        return 0

    def get_previous_balance(self):
        """Get balance from previous terms"""
        current_term = self.current_term
        total_previous = 0
        if current_term > 1:
            for term in range(1, current_term):
                term_fee = self.get_term_fees(term)
                term_paid = self.payments.filter(term=term).aggregate(
                    total=Sum('amount')
                )['total'] or 0
                total_previous += term_fee - term_paid
        return total_previous

    def get_total_due(self):
        """Get total amount due including current term and previous balance"""
        return self.admission_fee + self.get_term_fees() + self.get_previous_balance()

    def get_balance(self):
        """Get current overall balance"""
        # Calculate total fees applicable up to current term
        owed = self.admission_fee
        if self.current_term >= 1: owed += self.term1_fees
        if self.current_term >= 2: owed += self.term2_fees
        if self.current_term >= 3: owed += self.term3_fees
        
        paid = self.get_total_paid()
        return owed - paid

    def get_total_fees(self):
        """Get total fees for current academic year"""
        return self.admission_fee + self.term1_fees + self.term2_fees + self.term3_fees
    
    def get_paid_amount(self):
        """Get total amount paid for current academic year"""
        current_year = timezone.now().year
        return self.payments.filter(
            date__year=current_year
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
    
    def get_pending_amount(self):
        """Get pending fee amount"""
        return self.get_total_fees() - self.get_paid_amount()
    
    def is_fully_paid(self):
        """Check if all fees are paid"""
        return self.get_balance() <= 0
    
    def get_term_paid_amount(self, term):
        """Get total amount paid for specific term"""
        return self.payments.filter(term=term).aggregate(
            total=Sum('amount')
        )['total'] or 0

    def get_term_balance(self, term):
        """Get balance for specific term"""
        if term == 1:
            term_fee = self.term1_fees
        elif term == 2:
            term_fee = self.term2_fees
        else:
            term_fee = self.term3_fees
        
        term_paid = self.get_term_paid_amount(term)
        return term_fee - term_paid
    
    def get_total_balance(self):
        """Get total balance across all terms"""
        total_fees = self.get_total_fees()
        total_paid = self.get_total_paid()
        return total_fees - total_paid
    
    def get_total_paid(self):
        """Calculate total amount paid by student"""
        total = self.payments.aggregate(
            total=Sum('amount')
        )['total'] or 0
        return total

    def get_holistic_financials(self):
        """Get combined totals for Tuition, Transport, and Food"""
        # 1. Tuition
        tuition_total = float(self.get_total_fees())
        tuition_paid = float(self.get_total_paid())
        
        # 2. Transport
        transport_total = 0
        transport_paid = 0
        try:
            if hasattr(self, 'transport_account'):
                # Target: cost_per_term * 3
                from transport.models import TransportAssignment
                assignment = TransportAssignment.objects.filter(account=self.transport_account, active=True).first()
                if assignment:
                    transport_total = float(assignment.route.cost_per_term * 3)
                transport_paid = float(self.transport_account.total_paid)
        except: pass

        # 3. Food
        food_total = 0
        food_paid = 0
        try:
            if hasattr(self, 'food_account'):
                # Target: cost * 3
                from food.models import FoodSubscription
                sub = FoodSubscription.objects.filter(account=self.food_account, active=True).first()
                if sub:
                    food_total = float(sub.meal_item.cost * 3)
                food_paid = float(self.food_account.total_paid)
        except: pass

        combined_target = tuition_total + transport_total + food_total
        combined_paid = tuition_paid + transport_paid + food_paid
        
        return {
            'target': combined_target,
            'paid': combined_paid,
            'balance': max(0, combined_target - combined_paid),
            'tuition': {'target': tuition_total, 'paid': tuition_paid},
            'transport': {'target': transport_total, 'paid': transport_paid},
            'food': {'target': food_total, 'paid': food_paid}
        }
    
    def get_payment_status(self):
        """Get payment status"""
        balance = self.get_balance()
        if balance <= 0:
            return 'Paid'
        elif balance < self.term_fees:
            return 'Partial'
        return 'Unpaid'

    def get_term_payment_status(self, term):
        """Get payment status for specific term"""
        balance = self.get_term_balance(term)
        if balance <= 0:
            return 'PAID'
        elif self.get_term_paid_amount(term) > 0:
            return 'PARTIAL'
        return 'UNPAID'

    def get_formatted_balance(self):
        """Get formatted balance"""
        return f"KES {self.get_balance():,}"

    def get_formatted_total_paid(self):
        """Get formatted total paid"""
        return f"KES {self.get_total_paid():,}"

    def get_formatted_total_fees(self):
        """Get formatted total fees"""
        return f"KES {self.get_total_fees():,}"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"

    def save(self, *args, **kwargs):
        # Update term fees from grade if grade is set
        if self.grade:
            self.term1_fees = self.grade.term1_fees
            self.term2_fees = self.grade.term2_fees
            self.term3_fees = self.grade.term3_fees
            
        # Handle photo deletion if needed
        if self.pk:
            old_instance = Student.objects.get(pk=self.pk)
            if old_instance.photo and self.photo != old_instance.photo:
                old_instance.photo.delete(save=False)
                
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Update delete method to handle photo
        if self.photo:
            self.photo.delete(save=False)
        super(Student, self).delete(*args, **kwargs)

    @classmethod
    def get_total_count(cls):
        return cls.objects.count()
    
    @classmethod
    def get_by_grade_level(cls):
        return cls.objects.values('grade__level', 'grade__name').annotate(count=Count('id'))

    @classmethod
    def get_recent(cls, limit=5):
        return cls.objects.select_related('grade').order_by('-created_at')[:limit]

    @property
    def age(self):
        today = date.today()
        born = self.date_of_birth
        age = today.year - born.year
        # Adjust age if birthday hasn't occurred this year
        if today.month < born.month or (today.month == born.month and today.day < born.day):
            age -= 1
        return age

    @property
    def assessments(self):
        """Get all assessment results for the student"""
        return AssessmentResult.objects.filter(assessment__student=self)

    def get_assessment_counts(self):
        """Get counts of assessment results by performance level"""
        assessments = self.assessments
        counts = {
            'exceeding': 0,
            'meeting': 0,
            'approaching': 0,
            'below': 0
        }
        
        for assessment in assessments:
            level = assessment.performance_level
            if level == '4':
                counts['exceeding'] += 1
            elif level == '3':
                counts['meeting'] += 1
            elif level == '2':
                counts['approaching'] += 1
            elif level == '1':
                counts['below'] += 1
                
        return counts

    def get_performance_level(self, score):
        """Helper method to determine performance level"""
        if score >= 4:
            return 'EXCEEDING'
        elif score >= 3:
            return 'MEETING'
        elif score >= 2:
            return 'APPROACHING'
        else:
            return 'BELOW'

    def get_full_name(self):
        """Returns the student's full name."""
        return f"{self.first_name} {self.last_name}"

    # Alternative as a property if you prefer
    @property
    def full_name(self):
        """Returns the student's full name."""
        return f"{self.first_name} {self.last_name}"

    def get_payment_icon(self):
        """Return the appropriate Bootstrap icon class for payment methods"""
        icons = {
            'CASH': 'cash',
            'BANK_TRANSFER': 'bank',
            'MPESA': 'phone',
            'CARD': 'credit-card',
            'CHEQUE': 'file-text',
            'OTHER': 'wallet2'
        }
        return icons.get(self.method, 'wallet2')

    def get_class_position(self):
        """Get student's position in class based on average score"""
        try:
            # Get all students in the same grade ordered by average score
            students = Student.objects.filter(grade=self.grade)\
                              .annotate(avg_score=Avg('assessments__score'))\
                              .order_by('-avg_score')
            
            # Find this student's position
            for i, student in enumerate(students, 1):
                if student.id == self.id:
                    return i
            return None
        except Exception:
            return None

    def get_attendance_stats(self, start_date=None, end_date=None):
        """Get attendance statistics for the student"""
        records = self.attendance_records.all()
        
        if start_date:
            records = records.filter(date__gte=start_date)
        if end_date:
            records = records.filter(date__lte=end_date)

        total = records.count()
        present = records.filter(status='PRESENT').count()
        absent = records.filter(status='ABSENT').count()
        late = records.filter(status='LATE').count()

        return {
            'total_days': total,
            'present_count': present + late,  # Count late as present
            'present_days': present + late,  # Count late as present
            'absent_count': absent,
            'absent_days': absent,
            'late_days': late,
            'present_percentage': round((present + late) * 100 / total if total > 0 else 0, 1),
            'absent_percentage': round(absent * 100 / total if total > 0 else 0, 1),
            'attendance_rate': round((present + late) * 100 / total if total > 0 else 0, 1)
        }

    def get_recent_attendance(self, days=10):
        """Get recent attendance records"""
        return self.attendance_records.all()[:days]

    def get_initials(self):
        """Get student's initials for avatar placeholder"""
        return f"{self.first_name[0]}{self.last_name[0]}".upper()

    @property
    def recent_payments(self):
        """Get recent payments"""
        return self.payments.all().order_by('-created_at')[:5]

    def get_pending_fees(self):
        """Get pending fees for current term"""
        total_fees = self.term_fees
        paid_amount = self.get_total_paid()
        return max(total_fees - paid_amount, 0)  # Don't return negative values

    def get_photo_url(self):
        """Return the photo URL or None"""
        if self.photo:
            return self.photo.url
        return None

    class Meta:
        unique_together = ['school', 'admission_number']
        ordering = ['first_name', 'last_name']

    def get_term_paid_amount(self, term):
        """Get the total amount paid for a specific term"""
        try:
            term_payments = self.payments.filter(term=int(term))
            return term_payments.aggregate(Sum('amount'))['amount__sum'] or 0
        except (ValueError, AttributeError):
            return 0

    def get_term_payment_status(self, term):
        """Get payment status for specific term"""
        balance = self.get_term_balance(term)
        if balance <= 0:
            return 'PAID'
        elif self.get_term_paid_amount(term) > 0:
            return 'PARTIAL'
        return 'UNPAID'

class School(models.Model):
    CATEGORY_CHOICES = [
        ('PUB', 'Public'),
        ('PRI', 'Private'),
        ('INT', 'International')
    ]
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=3, choices=CATEGORY_CHOICES, default='PRI')
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    motto = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(
        upload_to='school_logos/',
        null=True,
        blank=True,
        help_text='School logo (optional)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Assessment(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='assessments', null=True, blank=True)
    ASSESSMENT_TYPES = [
        ('weekly', 'Weekly Assessment'),
        ('opener', 'Opener Assessment'),
        ('mid-term', 'Mid-Term Assessment'),
        ('end-term', 'End-Term Assessment'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    term = models.IntegerField()
    date = models.DateField()
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    remarks = models.TextField(blank=True, null=True)
    # For weekly assessments, capture week number (e.g., 1-14)
    week_number = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_assessment_type_display(self):
        # Convert to lowercase for comparison
        assessment_type = self.assessment_type.lower()
        # Create a dictionary with lowercase keys
        type_dict = {k.lower(): v for k, v in dict(self.ASSESSMENT_TYPES).items()}
        return type_dict.get(assessment_type, self.assessment_type)

    def get_score(self, subject):
        result = self.results.filter(subject=subject).first()
        if not result:
            return None
        
        if self.assessment_type == 'weekly':
            return result.weekly_score
        elif self.assessment_type == 'opener':
            return result.opener_score
        elif self.assessment_type == 'mid-term':
            return result.midpoint_score
        elif self.assessment_type == 'end-term':
            return result.endpoint_score
        return None

    def get_average_performance(self):
        results = self.results.all()
        if not results:
            return 0
        
        total = 0
        count = 0
        for result in results:
            score = self.get_score(result.subject)
            if score is not None:
                total += score
                count += 1
        
        return round((total / count) * 100) if count > 0 else 0

    def get_average_score(self):
        """Alias for get_average_performance for backward compatibility"""
        return self.get_average_performance()

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_assessment_type_display()} - Term {self.term}"

    class Meta:
        ordering = ['-date']
        constraints = [
            # For non-weekly assessments (opener, mid-term, end-term): one per term
            models.UniqueConstraint(
                fields=['student', 'assessment_type', 'term'],
                condition=~Q(assessment_type='weekly'),
                name='unique_non_weekly_assessment_per_term'
            ),
            # For weekly assessments: one per student/term/week
            models.UniqueConstraint(
                fields=['student', 'assessment_type', 'term', 'week_number'],
                condition=Q(assessment_type='weekly'),
                name='unique_weekly_assessment_per_week'
            ),
        ]

class AssessmentResult(models.Model):
    PERFORMANCE_LEVELS = [
        ('1', 'Below Expectations'),
        ('2', 'Approaching Expectations'),
        ('3', 'Meets Expectations'),
        ('4', 'Exceeds Expectations')
    ]

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    performance_level = models.CharField(max_length=1, choices=PERFORMANCE_LEVELS)
    remarks = models.TextField(blank=True, null=True)
    marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weekly_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    opener_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    midpoint_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    endpoint_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ['assessment', 'subject']

    def save(self, *args, **kwargs):
        # Calculate performance level based on marks if provided
        if self.marks is not None:
            marks_float = float(self.marks)
            if marks_float >= 80:
                self.performance_level = '4'
            elif marks_float >= 60:
                self.performance_level = '3'
            elif marks_float >= 40:
                self.performance_level = '2'
            else:
                self.performance_level = '1'
        super().save(*args, **kwargs)

    def get_score(self):
        """Get the appropriate score based on assessment type"""
        if self.assessment.assessment_type == 'weekly':
            return self.weekly_score
        elif self.assessment.assessment_type == 'opener':
            return self.opener_score
        elif self.assessment.assessment_type == 'mid-term':
            return self.midpoint_score
        elif self.assessment.assessment_type == 'end-term':
            return self.endpoint_score
        return None

    def get_performance_level_display(self):
        """Get the display text for the performance level"""
        return dict(self.PERFORMANCE_LEVELS).get(self.performance_level, '')

class Term(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='terms', null=True, blank=True)
    TERM_CHOICES = [
        (1, 'Term 1'),
        (2, 'Term 2'),
        (3, 'Term 3'),
    ]
    
    number = models.IntegerField(choices=TERM_CHOICES)
    year = models.IntegerField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Term {self.number} - {self.year}"

    class Meta:
        unique_together = ['school', 'number', 'year']
        ordering = ['-year', 'number']

    def save(self, *args, **kwargs):
        if self.is_current:
            # Set all other terms for THIS school to not current
            Term.objects.filter(school=self.school, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)

class Payment(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    
    PAYMENT_METHODS = (
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer')
    )
    
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='CASH')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='COMPLETED')
    # Changed from DateTimeField to DateField - payments only need date, not time
    # This eliminates naive datetime warnings
    date = models.DateField(default=timezone.now)
    term = models.IntegerField(choices=TERM_CHOICES)
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.amount} ({self.date})"

    class Meta:
        ordering = ['-date']

class Salary(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='salaries'
    )
    month = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PAID', 'Paid'),
            ('CANCELLED', 'Cancelled')
        ],
        default='PENDING'
    )
    payment_date = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['employee', 'month']
        ordering = ['-month', '-payment_date']

    def __str__(self):
        month_str = self.month.strftime('%B %Y') if self.month else 'No Date'
        return f"{self.employee.get_full_name()} - {month_str}"

class Allowance(models.Model):
    ALLOWANCE_TYPES = [
        ('HOUSE', 'House Allowance'),
        ('TRANSPORT', 'Transport Allowance'),
        ('MEDICAL', 'Medical Allowance'),
        ('OVERTIME', 'Overtime'),
        ('OTHER', 'Other')
    ]

    salary = models.ForeignKey(Salary, on_delete=models.CASCADE, related_name='allowance_items')
    type = models.CharField(max_length=20, choices=ALLOWANCE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.amount}"

class Deduction(models.Model):
    DEDUCTION_TYPES = [
        ('NSSF', 'NSSF'),
        ('NHIF', 'NHIF'),
        ('PAYE', 'PAYE'),
        ('ADVANCE', 'Salary Advance'),
        ('LOAN', 'Loan'),
        ('OTHER', 'Other')
    ]

    salary = models.ForeignKey(Salary, on_delete=models.CASCADE, related_name='deduction_items')
    type = models.CharField(max_length=20, choices=DEDUCTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.amount}"

class Leave(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='leaves', null=True, blank=True)
    LEAVE_TYPES = [
        ('SICK', 'Sick Leave'),
        ('ANNUAL', 'Annual Leave'),
        ('MATERNITY', 'Maternity Leave'),
        ('PATERNITY', 'Paternity Leave'),
        ('OTHER', 'Other')
    ]
    
    LEAVE_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled')
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leaves'
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=LEAVE_STATUS,
        default='PENDING'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves'
    )
    approved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.get_leave_type_display()}"

    def get_duration(self):
        return (self.end_date - self.start_date).days + 1

class Attendance(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='attendance_records', null=True, blank=True)
    ATTENDANCE_STATUS = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
    )
    
    TERM_CHOICES = [
        ('1', 'Term 1'),
        ('2', 'Term 2'),
        ('3', 'Term 3'),
    ]
    
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=ATTENDANCE_STATUS)
    remarks = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    term = models.CharField(max_length=1, choices=TERM_CHOICES, default='1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date} - {self.get_status_display()}"

class Schedule(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='schedules', null=True, blank=True)
    DAY_CHOICES = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    ]
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    term = models.CharField(max_length=20, choices=TERM_CHOICES, null=True, blank=True)
    
    class Meta:
        ordering = ['day', 'start_time']
        
    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.subject.name} ({self.get_day_display()})"

class CommunicationTemplate(models.Model):
    """Reusable templates for SMS/Email communication"""
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='communication_templates', null=True, blank=True)
    CATEGORIES = [
        ('FEES', 'Fees Reminders'),
        ('RESULTS', 'Assessment Results'),
        ('GENERAL', 'General Announcements'),
        ('STAFF', 'Staff Communication'),
    ]
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    message = models.TextField(help_text="Use placeholders: {student_name}, {parent_name}, {balance}, {results}, {term}, {exam_type}")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class SMSMessage(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='sms_messages', null=True, blank=True)
    RECIPIENT_TYPES = [
        ('ALL_STUDENTS', 'All Students (Parents)'),
        ('GRADE', 'Students of Specific Grade/Class'),
        ('LOCATION_MAIN', 'Students of Main School'),
        ('LOCATION_ANNEX', 'Students of Annex School'),
        ('FEES_REMINDER', 'Fees Reminders (with Filters)'),
        ('ASSESSMENT_RESULTS', 'Assessment Results'),
        ('ALL_TEACHERS', 'All Teachers'),
        ('ALL_STAFF', 'All Staff (Teaching & Non-Teaching)'),
        ('NON_TEACHING_STAFF', 'Non-Teaching Staff Only'),
        ('INDIVIDUAL', 'Individual Student'),
        ('INDIVIDUAL_STAFF', 'Individual Staff Member'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]
    
    message = models.TextField()
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPES)
    
    # Filtering fields
    specific_grade = models.ForeignKey(
        Grade, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        help_text="Required for grade-specific messages"
    )
    specific_student = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Required for individual student messages"
    )
    specific_employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Required for individual staff messages"
    )
    
    # Fee filtering
    fee_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Send to students with balance above this amount")
    fee_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Send to students with balance below this amount")
    
    # Assessment filtering
    assessment_term = models.IntegerField(null=True, blank=True)
    assessment_type = models.CharField(max_length=20, choices=Assessment.ASSESSMENT_TYPES, null=True, blank=True)

    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        null=True,
        blank=True,
        help_text="School location filter"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    response_data = models.JSONField(null=True, blank=True)
    recipients_count = models.IntegerField(default=0, help_text="Number of recipients")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def send(self):
        from .utils.sms import send_bulk_sms, format_phone_number
        from django.db.models import Sum, F, Q, DecimalField, Value
        from django.db.models.functions import Coalesce
        from django.utils import timezone
        
        # Get base queryset for school
        school_students = Student.objects.filter(school=self.school)
        school_teachers = Teacher.objects.filter(school=self.school)
        school_employees = Employee.objects.filter(school=self.school)
        
        targets = [] # List of (phone, message_content)
        print(f"DEBUG: Starting SMS send for recipient_type={self.recipient_type}, school={self.school}")
        print(f"DEBUG: Specific Grade={self.specific_grade}, Student={self.specific_student}, Employee={self.specific_employee}")
        print(f"DEBUG: Assessment Term={self.assessment_term}, Type={self.assessment_type}")
        
        # Performance optimization: Pre-calculate balances if needed
        student_balances = {}
        if "{balance}" in self.message or self.recipient_type == 'FEES_REMINDER':
            for s in school_students:
                total_fees = (s.term1_fees or 0) + (s.term2_fees or 0) + (s.term3_fees or 0)
                # This is still a bit slow, but better than doing aggregate() in a loop
                # Ideally we'd use annotate(total_paid=Sum('payments__amount')) on school_students
                pass

        def populate_message(student=None, employee=None):
            msg = self.message
            if student:
                # Calculate balance if placeholder exists
                balance = 0
                if "{balance}" in msg or self.recipient_type == 'FEES_REMINDER':
                    total_fees = (student.term1_fees or 0) + (student.term2_fees or 0) + (student.term3_fees or 0)
                    total_paid = student.payments.aggregate(total=Sum('amount'))['total'] or 0
                    balance = total_fees - total_paid
                
                # Format results if placeholder exists
                results_str = ""
                if "{results}" in msg or self.recipient_type == 'ASSESSMENT_RESULTS':
                    res_qs = AssessmentResult.objects.filter(
                        assessment__student=student,
                        assessment__term=self.assessment_term or 1,
                        assessment__assessment_type=self.assessment_type or 'mid-term'
                    ).select_related('subject')
                    
                    res_list = []
                    total_marks = 0
                    for r in res_qs:
                        label = r.subject.code or r.subject.name
                        res_list.append(f"{label}: {int(r.marks or 0)}")
                        total_marks += (r.marks or 0)
                    
                    if res_list:
                        results_str = ", ".join(res_list) + f". Total: {int(total_marks)}"
                    else:
                        results_str = "No results found."

                msg = msg.replace("{student_name}", student.full_name)
                msg = msg.replace("{parent_name}", f"{student.first_name}'s Parent")
                msg = msg.replace("{balance}", f"{balance:,.2f}")
                msg = msg.replace("{results}", results_str)
                msg = msg.replace("{term}", f"Term {self.assessment_term or '1'}")
                exam_name = dict(Assessment.ASSESSMENT_TYPES).get(self.assessment_type, self.assessment_type or 'Assessment')
                msg = msg.replace("{exam_type}", str(exam_name))
            
            if employee:
                msg = msg.replace("{staff_name}", employee.get_full_name())
                msg = msg.replace("{position}", employee.position or "")
            
            # School name placeholder
            if self.school:
                msg = msg.replace("{school_name}", self.school.school_name)
            
            return msg

        # Collect targets
        # Collect targets
        if self.recipient_type == 'ALL_STUDENTS':
            # Get all students for the school
            students = school_students.all()
            total_count = students.count()
            print(f"DEBUG: Processing {total_count} students for SMS")
            
            # Use iterator to prevent loading all students into memory at once
            for s in students.iterator(chunk_size=100):
                phone = s.parent_phone
                if not phone:
                    phone = s.guardian_phone
                
                # If still no phone, check user email if it looks like a phone? No, risky.
                
                if phone:
                    targets.append((phone, populate_message(student=s)))
                else:
                    # Log only first few missing to avoid spam
                    if len(targets) < 5:
                         print(f"DEBUG: Skipping student {s.full_name} - No parent or guardian phone")

        elif self.recipient_type == 'GRADE' and self.specific_grade:
            students = school_students.filter(grade=self.specific_grade)
            total_count = students.count()
            print(f"DEBUG: Processing {total_count} students in grade {self.specific_grade}")
            
            # Use iterator to prevent memory overload
            for s in students.iterator(chunk_size=100):
                phone = s.parent_phone or s.guardian_phone
                if phone:
                    targets.append((phone, populate_message(student=s)))
                    
        elif self.recipient_type == 'FEES_REMINDER':
            students = school_students.annotate(
                total_fees=F('term1_fees') + F('term2_fees') + F('term3_fees'),
                total_paid=Coalesce(Sum('payments__amount', output_field=DecimalField(max_digits=10, decimal_places=2)), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                balance=F('total_fees') - F('total_paid')
            ).filter(balance__gt=0)
            
            if self.specific_grade: students = students.filter(grade=self.specific_grade)
            if self.fee_min is not None: students = students.filter(balance__gte=self.fee_min)
            if self.fee_max is not None: students = students.filter(balance__lte=self.fee_max)
            
            for s in students:
                # Since we already have balance annotated, let's use it
                bal = s.balance if hasattr(s, 'balance') else 0
                msg = self.message
                msg = msg.replace("{student_name}", s.full_name)
                msg = msg.replace("{parent_name}", f"{s.first_name}'s Parent")
                msg = msg.replace("{balance}", f"{bal:,.2f}")
                if self.school: msg = msg.replace("{school_name}", self.school.school_name)
                targets.append((s.parent_phone or s.guardian_phone, msg))

        elif self.recipient_type == 'ASSESSMENT_RESULTS':
            # Only students who HAVE results for this assessment
            students = school_students.filter(
                assessments__term=self.assessment_term or 1,
                assessments__assessment_type=self.assessment_type or 'mid-term'
            ).distinct().exclude(Q(parent_phone__isnull=True) | Q(parent_phone=''))
            
            if self.specific_grade:
                students = students.filter(grade=self.specific_grade)
            
            for s in students:
                targets.append((s.parent_phone or s.guardian_phone, populate_message(student=s)))
                    
        elif self.recipient_type == 'ALL_TEACHERS':
            teachers = school_teachers.filter(status='ACTIVE').exclude(Q(phone__isnull=True) | Q(phone=''))
            for t in teachers:
                targets.append((t.phone, populate_message(employee=t)))
            
        elif self.recipient_type == 'ALL_STAFF':
            staff = school_employees.filter(status='ACTIVE').exclude(Q(phone__isnull=True) | Q(phone=''))
            for s in staff:
                targets.append((s.phone, populate_message(employee=s)))
            
        elif self.recipient_type == 'INDIVIDUAL' and self.specific_student:
                phone = self.specific_student.parent_phone or self.specific_student.guardian_phone
                if phone: targets.append((phone, populate_message(student=self.specific_student)))
            
        elif self.recipient_type == 'INDIVIDUAL_STAFF' and self.specific_employee:
            if self.specific_employee.phone:
                targets.append((self.specific_employee.phone, populate_message(employee=self.specific_employee)))
        
        print(f"DEBUG: Found {len(targets)} unique targets")
        self.recipients_count = len(targets)
        
        if not targets:
            print("DEBUG: No targets found - returning FAILED")
            self.status = 'FAILED'
            self.response_data = {'error': 'No valid recipients found'}
            self.save()
            return False, 'No valid recipients found'
        
        # Check if all messages are identical
        unique_messages = set([t[1] for t in targets])
        print(f"DEBUG: Unique messages count={len(unique_messages)}")
        
        try:
            if len(unique_messages) == 1:
                # Send bulk
                phone_numbers = [t[0] for t in targets]
                print(f"DEBUG: Sending bulk to {len(phone_numbers)} numbers")
                success, response = send_bulk_sms(phone_numbers, list(unique_messages)[0])
                print(f"DEBUG: Bulk send response: success={success}, response={response}")
            else:
                # Send individually
                print(f"DEBUG: Sending individually to {len(targets)} numbers")
                results_log = []
                success_count = 0
                # Limit to first 100 to prevent long timeouts in HTTP request if not using Celery
                process_targets = targets[:100]
                for phone, individual_msg in process_targets:
                    try:
                        res_ok, res_data = send_bulk_sms([phone], individual_msg)
                        if res_ok: success_count += 1
                        results_log.append({'phone': phone, 'success': res_ok})
                    except Exception as e:
                        print(f"DEBUG: Error sending to {phone}: {str(e)}")
                        results_log.append({'phone': phone, 'success': False, 'error': str(e)})
                
                success = success_count > 0
                response = {
                    'summary': f'Sent {success_count}/{len(process_targets)} successfully',
                    'total_requested': len(targets),
                    'processed': len(process_targets),
                    'details': results_log
                }
                print(f"DEBUG: Individual send summary: {response['summary']}")
        except Exception as e:
            self.status = 'FAILED'
            self.response_data = {'error': f'Critical send failure: {str(e)}'}
            self.save()
            return False, f'Critical send failure: {str(e)}'

        # Update status
        self.status = 'SENT' if success else 'FAILED'
        self.sent_at = timezone.now() if success else None
        self.response_data = response
        self.save()
        
        return success, response

class EmployeeAttendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('HALF_DAY', 'Half Day')
    ]
    
    employee = models.ForeignKey(
        'Employee',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date} ({self.get_status_display()})"

class Vehicle(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='vehicles', null=True, blank=True)
    VEHICLE_TYPES = [
        ('BUS', 'Bus'),
        ('VAN', 'Van'),
        ('MINIBUS', 'Minibus'),
        ('CAR', 'Car'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Under Maintenance'),
    ]
    
    vehicle_number = models.CharField(max_length=50, unique=True, verbose_name="Vehicle Number/Plate")
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES, default='BUS')
    make = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    year = models.IntegerField(null=True, blank=True)
    capacity = models.PositiveIntegerField(help_text="Maximum number of passengers")
    driver = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehicles',
        limit_choices_to={'position__in': ['ADMIN', 'SUPPORT']}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    insurance_expiry = models.DateField(null=True, blank=True)
    registration_expiry = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['vehicle_number']
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.get_vehicle_type_display()}"
    
    @property
    def is_available(self):
        return self.status == 'ACTIVE'
    
    def get_current_students_count(self):
        """Get current number of students assigned to this vehicle"""
        return self.student_assignments.filter(is_active=True).count()
    
    def get_available_seats(self):
        """Get available seats"""
        return self.capacity - self.get_current_students_count()

class Route(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='routes', null=True, blank=True)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    # Coordinates for start location
    start_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Latitude for start location")
    start_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Longitude for start location")
    # Coordinates for end location
    end_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Latitude for end location")
    end_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Longitude for end location")
    # School coordinates (default pickup point)
    school_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="School latitude")
    school_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="School longitude")
    distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Distance in kilometers")
    estimated_time = models.CharField(max_length=50, blank=True, help_text="e.g., '45 minutes'")
    fee_per_term = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Transport fee per term for this route"
    )
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.start_location} - {self.end_location})"
    
    def get_students_count(self):
        """Get number of students on this route"""
        return self.student_assignments.filter(is_active=True).count()

class StudentTransportAssignment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='transport_assignments'
    )
    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='student_assignments'
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_assignments'
    )
    pickup_location = models.CharField(max_length=200, blank=True, help_text="Specific pickup point")
    dropoff_location = models.CharField(max_length=200, blank=True, help_text="Specific dropoff point")
    # Coordinates for pickup location
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Latitude for pickup location")
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Longitude for pickup location")
    # Coordinates for dropoff location
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Latitude for dropoff location")
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Longitude for dropoff location")
    pickup_time = models.TimeField(null=True, blank=True)
    dropoff_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'route']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.route.name}"
    
    def clean(self):
        if self.vehicle and self.vehicle.get_current_students_count() >= self.vehicle.capacity:
            if not self.pk or (self.pk and self.is_active):  # Only check if new or reactivating
                raise ValidationError(f"Vehicle {self.vehicle.vehicle_number} is at full capacity.")

class TransportFee(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_fees_records', null=True, blank=True)
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    
    PAYMENT_METHODS = (
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer')
    )
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='transport_fees'
    )
    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='transport_fees'
    )
    term = models.IntegerField(choices=TERM_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='CASH')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='COMPLETED')
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.route.name} - Term {self.term} - {self.amount}"

class FoodPlan(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='food_plans', null=True, blank=True)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    meal_type = models.CharField(
        max_length=50,
        choices=[
            ('BREAKFAST', 'Breakfast'),
            ('LUNCH', 'Lunch'),
            ('DINNER', 'Dinner'),
            ('ALL', 'All Meals'),
            ('BREAKFAST_LUNCH', 'Breakfast & Lunch'),
            ('LUNCH_DINNER', 'Lunch & Dinner'),
        ],
        default='ALL'
    )
    fee_per_term = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Food fee per term for this plan"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_meal_type_display()})"
    
    def get_students_count(self):
        """Get number of students on this food plan"""
        return self.student_assignments.filter(is_active=True).count()

class StudentFoodAssignment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='food_assignments'
    )
    food_plan = models.ForeignKey(
        FoodPlan,
        on_delete=models.CASCADE,
        related_name='student_assignments'
    )
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'food_plan']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.food_plan.name}"

class FoodFee(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='food_fees_records', null=True, blank=True)
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    
    PAYMENT_METHODS = (
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer')
    )
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='food_fees'
    )
    food_plan = models.ForeignKey(
        FoodPlan,
        on_delete=models.CASCADE,
        related_name='food_fees'
    )
    term = models.IntegerField(choices=TERM_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='CASH')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='COMPLETED')
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.food_plan.name} - Term {self.term} - {self.amount}"


class MealPricing(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='meal_pricings', null=True, blank=True)
    """Model to store default pricing for each meal type"""
    meal_type = models.CharField(
        max_length=20,
        choices=[
            ('TEA_BREAK', 'Tea Break'),
            ('LUNCH', 'Lunch'),
            ('FRUITS', 'Fruits'),
        ],
        help_text="Type of meal"
    )
    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Default price per day for this meal"
    )
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['meal_type']
        verbose_name_plural = "Meal Pricing"
        unique_together = ['meal_type', 'location']
    
    def __str__(self):
        return f"{self.get_meal_type_display()} - {self.get_location_display()} - KES {self.price_per_day} per day"


class StudentMealPayment(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='meal_payments', null=True, blank=True)
    """Model to track individual meal payments for students (Tea break, Lunch, Fruits)"""
    
    MEAL_TYPES = (
        ('TEA_BREAK', 'Tea Break'),
        ('LUNCH', 'Lunch'),
        ('FRUITS', 'Fruits'),
    )
    
    PAYMENT_FREQUENCY = (
        ('PER_DAY', 'Per Day'),
        ('MULTIPLE_DAYS', 'Multiple Days'),
        ('PER_WEEK', 'Per Week'),
        ('PER_MONTH', 'Per Month'),
        ('FULL_TERM', 'Full Term'),
    )
    
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    
    PAYMENT_METHODS = (
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer')
    )
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='meal_payments'
    )
    meal_type = models.CharField(
        max_length=20,
        choices=MEAL_TYPES,
        help_text="Type of meal: Tea Break, Lunch, or Fruits"
    )
    payment_frequency = models.CharField(
        max_length=20,
        choices=PAYMENT_FREQUENCY,
        default='MULTIPLE_DAYS',
        help_text="How often the student pays for this meal"
    )
    number_of_days = models.IntegerField(
        default=1,
        help_text="Number of days this payment covers"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount paid for this meal"
    )
    payment_group = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Group identifier for payments made together (same transaction)"
    )
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHODS,
        default='CASH'
    )
    status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS,
        default='COMPLETED'
    )
    payment_date = models.DateField(
        default=timezone.now,
        help_text="Date when payment was made"
    )
    start_date = models.DateField(
        help_text="Start date for this meal payment period"
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="End date for this meal payment period (if applicable)"
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique reference number for this payment"
    )
    location = models.CharField(
        max_length=10,
        choices=LOCATION_CHOICES,
        default='MAIN',
        help_text="School location: Main or Annex"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about this payment"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this payment record is currently active"
    )
    days_consumed = models.IntegerField(
        default=0,
        help_text="Number of days already consumed from this payment"
    )
    days_remaining = models.IntegerField(
        default=0,
        help_text="Number of days remaining for this payment"
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Remaining balance for this payment"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payment_date', '-created_at']
        indexes = [
            models.Index(fields=['student', 'meal_type', 'is_active']),
            models.Index(fields=['payment_date']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_meal_type_display()} - {self.number_of_days} days - {self.amount}"
    
    def get_price_per_day(self):
        """Calculate price per day for this meal"""
        from decimal import ROUND_HALF_UP
        if self.number_of_days > 0:
            price = Decimal(str(self.amount)) / Decimal(str(self.number_of_days))
            return price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return Decimal(str(self.amount))
    
    def clean(self):
        """Validate the model"""
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date.")
    
    def save(self, *args, **kwargs):
        """Override save to generate reference number if not provided"""
        if not self.reference_number:
            import uuid
            self.reference_number = f"MEAL-{uuid.uuid4().hex[:12].upper()}"
        
        # Fix invalid payment_frequency if it exists
        valid_frequencies = [choice[0] for choice in self.PAYMENT_FREQUENCY]
        if self.payment_frequency not in valid_frequencies:
            self.payment_frequency = 'MULTIPLE_DAYS'
        
        # Initialize days_remaining if not set
        if self.days_remaining == 0 and self.days_consumed == 0:
            self.days_remaining = self.number_of_days
        
        # Calculate days remaining and balance only if needed
        from decimal import ROUND_HALF_UP
        if not self.pk or 'days_consumed' in kwargs.get('update_fields', []) or 'number_of_days' in kwargs.get('update_fields', []):
            self.days_remaining = max(0, self.number_of_days - self.days_consumed)
            # Only recalculate balance if it's not already set (for new records) or if days_consumed changed
            if not self.pk or self.days_consumed > 0:
                price_per_day = self.get_price_per_day()
                # Calculate balance and round to 2 decimal places
                balance_calc = Decimal(str(self.amount)) - (Decimal(str(price_per_day)) * Decimal(str(self.days_consumed)))
                self.balance = max(Decimal('0.00'), balance_calc).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            elif not self.pk and self.balance is None:
                # For new records, set balance equal to amount if not already set
                self.balance = Decimal(str(self.amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Ensure balance is always rounded to 2 decimal places
        if self.balance is not None:
            self.balance = Decimal(str(self.balance)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Skip validation when only updating specific fields to avoid errors on old data
        update_fields = kwargs.get('update_fields', [])
        if update_fields and 'payment_frequency' not in update_fields and 'status' not in update_fields:
            # Skip validation when only updating days/balance fields
            super().save(*args, **kwargs)
        else:
            # Full validation for new records or when payment_frequency/status is being updated
            self.full_clean()
            super().save(*args, **kwargs)
    
    def consume_day(self):
        """Consume one day from this payment"""
        from decimal import ROUND_HALF_UP
        if self.days_remaining > 0:
            self.days_consumed += 1
            self.days_remaining = max(0, self.number_of_days - self.days_consumed)
            price_per_day = self.get_price_per_day()
            # Calculate balance and round to 2 decimal places
            balance_calc = Decimal(str(self.amount)) - (Decimal(str(price_per_day)) * Decimal(str(self.days_consumed)))
            self.balance = max(Decimal('0.00'), balance_calc).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            self.save(update_fields=['days_consumed', 'days_remaining', 'balance'])
            return True
        return False
    
    def get_remaining_balance(self):
        """Get remaining balance"""
        price_per_day = self.get_price_per_day()
        return max(Decimal('0.00'), Decimal(str(self.amount)) - (Decimal(str(price_per_day)) * Decimal(str(self.days_consumed))))


class MealConsumption(models.Model):
    """Model to track daily meal consumption for students"""
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='meal_consumptions'
    )
    meal_payment = models.ForeignKey(
        StudentMealPayment,
        on_delete=models.CASCADE,
        related_name='consumptions',
        help_text="The payment record this consumption is deducted from"
    )
    meal_type = models.CharField(
        max_length=20,
        choices=StudentMealPayment.MEAL_TYPES,
        help_text="Type of meal consumed"
    )
    consumption_date = models.DateField(
        default=timezone.now,
        help_text="Date when the meal was served"
    )
    served_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='meals_served',
        help_text="User who marked the meal as served"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about this meal serving"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-consumption_date', '-created_at']
        indexes = [
            models.Index(fields=['student', 'meal_type', 'consumption_date']),
            models.Index(fields=['consumption_date']),
        ]
        unique_together = ['student', 'meal_type', 'consumption_date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_meal_type_display()} - {self.consumption_date}"


class SyncQueue(models.Model):
    """Model to track operations that need to be synced to the server when online"""
    
    OPERATION_TYPES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SYNCING', 'Syncing'),
        ('SYNCED', 'Synced'),
        ('FAILED', 'Failed'),
    ]
    
    # Operation details
    operation_type = models.CharField(max_length=10, choices=OPERATION_TYPES)
    model_name = models.CharField(max_length=100, help_text="Name of the model (e.g., 'Payment', 'Student')")
    model_id = models.IntegerField(help_text="ID of the model instance")
    local_id = models.IntegerField(help_text="Local database ID before sync")
    
    # Data to sync (stored as JSON)
    data = models.JSONField(help_text="Serialized model data")
    
    # Status tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    retry_count = models.IntegerField(default=0)
    last_error = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadata
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Additional notes about this sync operation")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['model_name', 'model_id']),
        ]
    
    def __str__(self):
        return f"{self.operation_type} {self.model_name} #{self.model_id} - {self.status}"
    
    def mark_synced(self):
        """Mark this queue item as successfully synced"""
        self.status = 'SYNCED'
        self.synced_at = timezone.now()
        self.save(update_fields=['status', 'synced_at'])
    
    def mark_failed(self, error_message):
        """Mark this queue item as failed and increment retry count"""
        self.status = 'FAILED'
        self.retry_count += 1
        self.last_error = str(error_message)[:500]  # Limit error message length
        self.save(update_fields=['status', 'retry_count', 'last_error'])
    
    def reset_for_retry(self):
        """Reset status to pending for retry"""
        self.status = 'PENDING'
        self.save(update_fields=['status'])


class SyncStatus(models.Model):
    """Model to track overall sync status and settings"""
    
    is_online = models.BooleanField(default=True)
    last_sync_attempt = models.DateTimeField(null=True, blank=True)
    last_successful_sync = models.DateTimeField(null=True, blank=True)
    pending_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    auto_sync_enabled = models.BooleanField(default=True)
    sync_interval_minutes = models.IntegerField(default=5, help_text="Minutes between auto-sync attempts")
    
    # Settings
    max_retry_attempts = models.IntegerField(default=3)
    sync_on_startup = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Sync Status"
        verbose_name_plural = "Sync Status"
    
    def __str__(self):
        return f"Online: {self.is_online}, Pending: {self.pending_count}, Failed: {self.failed_count}"
    
    @classmethod
    def get_instance(cls):
        """Get or create the singleton sync status instance"""
        instance, created = cls.objects.get_or_create(pk=1)
        return instance
    
    def update_counts(self):
        """Update pending and failed counts from SyncQueue"""
        self.pending_count = SyncQueue.objects.filter(status='PENDING').count()
        self.failed_count = SyncQueue.objects.filter(status='FAILED').count()
        self.save(update_fields=['pending_count', 'failed_count'])

from django.utils import timezone
# from .models import Employee # redundant if in same file, but Circular import check needed. 


class SalaryAdvance(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='salary_advances', null=True, blank=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('DEDUCTED', 'Recouped/Deducted'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='salary_advances'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    date_requested = models.DateTimeField(auto_now_add=True)
    date_approved = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_advances'
    )
    remarks = models.TextField(blank=True, help_text="Admin remarks")

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.amount} ({self.status})"

    class Meta:
        ordering = ['-date_requested']


# ============================================
# HR MODULE MODELS
# ============================================

class NonTeachingStaff(Employee):
    """
    Non-teaching staff model extending Employee
    Includes support staff, admin staff, etc.
    """
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_profile')
    STAFF_TYPE_CHOICES = [
        ('ADMIN', 'Administrative Staff'),
        ('SUPPORT', 'Support Staff'),
        ('SECURITY', 'Security Personnel'),
        ('MAINTENANCE', 'Maintenance Staff'),
        ('KITCHEN', 'Kitchen Staff'),
        ('LIBRARIAN', 'Librarian'),
        ('LAB_TECH', 'Lab Technician'),
        ('NURSE', 'School Nurse'),
        ('DRIVER', 'Driver'),
        ('CLEANER', 'Cleaner'),
        ('OTHER', 'Other'),
    ]
    
    staff_type = models.CharField(
        max_length=20,
        choices=STAFF_TYPE_CHOICES,
        default='SUPPORT'
    )
    job_description = models.TextField(blank=True)
    supervisor = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_staff',
        help_text="Direct supervisor (usually head teacher or department head)"
    )
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = "Non-Teaching Staff"
        verbose_name_plural = "Non-Teaching Staff"
        ordering = ['first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name()} - {self.get_staff_type_display()}"

    def save(self, *args, **kwargs):
        # Create user account if email exists and no user is linked
        if not self.user and self.email:
            try:
                user, created = User.objects.get_or_create(
                    username=self.email,
                    email=self.email,
                    defaults={
                        'first_name': self.first_name,
                        'last_name': self.last_name,
                    }
                )
                if created:
                    user.set_password('Bdmis@7878')
                    user.save()
                self.user = user
                
                # Add to Staff group
                staff_group, _ = Group.objects.get_or_create(name='Staff')
                user.groups.add(staff_group)
            except Exception as e:
                print(f"Error creating user for {self.email}: {e}")
        
        super().save(*args, **kwargs)


class LeaveApproval(models.Model):
    """
    Tracks approval workflow for leave requests
    Supervisor -> HR/Admin
    """
    APPROVAL_LEVEL_CHOICES = [
        ('SUPERVISOR', 'Supervisor'),
        ('HR', 'HR/Admin'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    leave = models.ForeignKey(
        Leave,
        on_delete=models.CASCADE,
        related_name='approvals'
    )
    approval_level = models.CharField(max_length=20, choices=APPROVAL_LEVEL_CHOICES)
    status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='PENDING')
    approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leave_approvals_given'
    )
    comments = models.TextField(blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['approval_level', '-created_at']
        unique_together = ['leave', 'approval_level']
    
    def __str__(self):
        return f"{self.leave} - {self.approval_level} - {self.status}"


class AdvanceApproval(models.Model):
    """
    Tracks approval workflow for salary advance requests
    Supervisor -> HR/Admin
    """
    APPROVAL_LEVEL_CHOICES = [
        ('SUPERVISOR', 'Supervisor'),
        ('HR', 'HR/Admin'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    advance = models.ForeignKey(
        SalaryAdvance,
        on_delete=models.CASCADE,
        related_name='approvals'
    )
    approval_level = models.CharField(max_length=20, choices=APPROVAL_LEVEL_CHOICES)
    status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='PENDING')
    approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='advance_approvals_given'
    )
    comments = models.TextField(blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['approval_level', '-created_at']
        unique_together = ['advance', 'approval_level']
    
    def __str__(self):
        return f"{self.advance} - {self.approval_level} - {self.status}"


class StaffDocument(models.Model):
    """
    Store important staff documents
    """
    DOCUMENT_TYPE_CHOICES = [
        ('ID', 'National ID'),
        ('CERTIFICATE', 'Certificate'),
        ('CONTRACT', 'Employment Contract'),
        ('MEDICAL', 'Medical Report'),
        ('CLEARANCE', 'Police Clearance'),
        ('OTHER', 'Other'),
    ]
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='staff_documents/')
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.title}"


class Expense(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='school_expenses', null=True, blank=True)
    """Model for tracking school expenses"""
    CATEGORY_CHOICES = [
        ('utilities', 'Utilities'),
        ('salaries', 'Salaries'),
        ('supplies', 'Supplies'),
        ('maintenance', 'Maintenance'),
        ('transport', 'Transport'),
        ('food', 'Food'),
        ('other', 'Other'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('mobile_money', 'Mobile Money'),
    ]
    
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    date = models.DateField()
    vendor = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    receipt_number = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='expenses_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - KES {self.amount}"
