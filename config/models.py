from django.db import models
from django.contrib.auth.models import User

import uuid



class SchoolConfig(models.Model):
    """
    Model to store school-wide configuration settings.
    Associated with an admin user for multi-tenancy.
    """
    # School Association
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='school_config', null=True, blank=True)
    
    # Portal Access
    portal_slug = models.SlugField(unique=True, null=True, blank=True, max_length=100)
    
    # School Information
    school_name = models.CharField(max_length=200, default="EduManage Academy")
    school_code = models.CharField(max_length=20, default="EDU")
    school_email = models.EmailField(default="info@school.com")
    school_phone = models.CharField(max_length=20, default="+254700000000")
    school_address = models.TextField(default="P.O Box 123-00100, Nairobi")
    school_logo = models.ImageField(upload_to='school_logos/', null=True, blank=True)
    
    # Admission Number Configuration
    admission_number_format = models.CharField(
        max_length=100, 
        default="{SCHOOL_CODE}/{YEAR}/{COUNTER:04d}",
        help_text="Format: {SCHOOL_CODE}, {YEAR}, {COUNTER:04d}, {GRADE}. Example: EDU/2024/0001"
    )
    admission_counter = models.IntegerField(default=0, help_text="Auto-incremented counter for admission numbers")
    
    # Academic Settings
    current_term = models.CharField(max_length=20, default="TERM_1")
    current_year = models.IntegerField(default=2024)
    
    # Financial Settings
    default_currency = models.CharField(max_length=10, default="KES")
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Portal Default Passwords
    teacher_portal_password = models.CharField(max_length=128, default="Teacher@123")
    student_portal_password = models.CharField(max_length=128, default="Student@123")
    accountant_portal_password = models.CharField(max_length=128, default="Finance@123")
    food_portal_password = models.CharField(max_length=128, default="Food@123")
    transport_portal_password = models.CharField(max_length=128, default="Transport@123")
    driver_portal_password = models.CharField(max_length=128, default="Driver@123")

    # Subscription Settings
    subscription_plan = models.CharField(max_length=50, default="Basic")
    subscription_status = models.CharField(max_length=50, default="Trial")
    is_active = models.BooleanField(default=True)
    trial_start_date = models.DateTimeField(null=True, blank=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "School Configuration"
        verbose_name_plural = "School Configurations"
    
    def save(self, *args, **kwargs):
        # Auto-generate portal_slug if not set
        if not self.portal_slug:
            import uuid
            self.portal_slug = str(uuid.uuid4())[:12]
            # Ensure uniqueness
            while SchoolConfig.objects.filter(portal_slug=self.portal_slug).exists():
                self.portal_slug = str(uuid.uuid4())[:12]

        # Removed Singleton pattern to allow multiple schools
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls, user=None, request=None):
        """ Get the configuration instance for a specific user/school """
        
        # 0. Check for explicit School Context via Header (if request provided)
        if request:
            portal_slug = request.headers.get('X-Portal-Slug')
            if portal_slug:
                config = cls.objects.filter(portal_slug=portal_slug).first()
                if config:
                    # STRICT AUTHORIZATION-CHECK
                    # Even if header is present, ensure user is actually allowed to access this school
                    # This prevents IDOR where a logged-in user of School A accesses School B's data by changing the header
                    if user and user.is_authenticated:
                        is_authorized = False
                        
                        # 1. School Admin
                        if config.admin == user:
                            is_authorized = True
                        
                        # 2. Linked Profiles
                        elif hasattr(user, 'teacher') and user.teacher.school == config:
                            is_authorized = True
                        elif hasattr(user, 'staff_profile') and user.staff_profile.school == config:
                            is_authorized = True
                        elif hasattr(user, 'student_profile') and user.student_profile.school == config:
                            is_authorized = True
                        elif hasattr(user, 'transport_driver_profile') and user.transport_driver_profile.school == config:
                            is_authorized = True
                        elif user.is_superuser:
                             # Superusers can access any school if they explicitly request it via header
                            is_authorized = True
                            
                        if is_authorized:
                            return config
                        # If not authorized, we fall through to normal user-based resolution
                        # or could raise PermissionDenied. But falling through is safer legacy behavior.

        if user and user.is_authenticated:
            # 1. Check if user is an admin of a school (OneToOneField)
            config = cls.objects.filter(admin=user).first()
            if config:
                # Auto-fix: If config name is Unassigned but user has a name (likely from signup), update it
                if config.school_name == "Unassigned Account" and user.first_name:
                    config.school_name = user.first_name
                    config.save()
                return config
            
            # 2. Check for profiles that link to a school
            if hasattr(user, 'teacher') and user.teacher.school:
                return user.teacher.school
            if hasattr(user, 'staff_profile') and user.staff_profile.school:
                return user.staff_profile.school
            if hasattr(user, 'student_profile') and user.student_profile.school:
                return user.student_profile.school
            if hasattr(user, 'transport_driver_profile') and user.transport_driver_profile.school:
                return user.transport_driver_profile.school

            # 3. If no config found but user is authenticated
            # For Staff or Superusers, we fallback to the first available school instead of creating a new potentially empty one.
            if user.is_staff or user.is_superuser:
                return cls.objects.first() or cls.objects.create(school_name="EduManage Academy")

            # 4. For regular users (potential school owners), create/get a PERSISTENT one
            config, created = cls.objects.get_or_create(
                admin=user,
                defaults={
                    'school_name': f"{user.first_name}'s School" if user.first_name else "Unassigned Account",
                    'school_email': user.email or "info@school.com"
                }
            )
            return config

        # Fallback for system tasks or unauthenticated pages (like login)
        # Use the first one available, or create a default one if none exists
        return cls.objects.first() or cls.objects.create(school_name="EduManage Academy")
    
    def generate_admission_number(self, grade=None):
        """
        Generate the next admission number following the school's format.
        Generate a new admission number based on the configured format.
        """
        from schools.models import Grade
        from django.utils import timezone
        import datetime

        # Increment for the new student
        self.admission_counter += 1
        self.save(update_fields=['admission_counter'])

        # 2. Get Grade name if grade ID provided
        grade_name = ""
        if grade:
            try:
                # 'grade' could be an ID or a name depending on context
                if isinstance(grade, (int, str)) and str(grade).isdigit():
                    grade_obj = Grade.objects.get(pk=grade)
                    grade_name = grade_obj.name
                elif hasattr(grade, 'name'):
                    grade_name = grade.name
            except Exception:
                grade_name = str(grade)

        # 3. Prepare formatting context
        context = {
            'SCHOOL_CODE': self.school_code,
            'YEAR': self.current_year or datetime.datetime.now().year,
            'COUNTER': self.admission_counter,
            'GRADE': grade_name
        }

        # 4. Apply format
        try:
            # self.admission_number_format uses standard Python string formatting
            # e.g., "{SCHOOL_CODE}/{YEAR}/{COUNTER:04d}"
            result = self.admission_number_format.format(**context)
            if len(result) > 50:
                return result[:50]
            return result
        except Exception as e:
            # Fallback if format is invalid
            print(f"Admission Format Error: {e}")
            fallback = f"{self.school_code}/{context['YEAR']}/{self.admission_counter:04d}"
            return fallback[:50]
    
    def __str__(self):
        return f"{self.school_name} Configuration"

class SubscriptionPayment(models.Model):
    school = models.ForeignKey(SchoolConfig, on_delete=models.CASCADE, related_name='subscription_payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    plan = models.CharField(max_length=50)
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='COMPLETED')
    date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        verbose_name = "Subscription Payment"
        verbose_name_plural = "Subscription Payments"

    def __str__(self):
        return f"{self.school.school_name} - {self.plan} - {self.amount}"

class SystemSettings(models.Model):
    """
    Singleton model to store global system configuration 
    managed by the Super Admin.
    """
    # System Control
    maintenance_mode = models.BooleanField(default=False)
    registration_open = models.BooleanField(default=True)
    debug_mode = models.BooleanField(default=False)
    allow_api_access = models.BooleanField(default=True)

    # Pricing & Plans
    currency = models.CharField(max_length=10, default="KES")
    trial_days = models.IntegerField(default=7)
    basic_price = models.DecimalField(max_digits=10, decimal_places=2, default=1499.00)
    standard_price = models.DecimalField(max_digits=10, decimal_places=2, default=2499.00)
    enterprise_price = models.DecimalField(max_digits=10, decimal_places=2, default=3499.00)

    # Communication
    sms_gateway = models.CharField(max_length=50, default="AfricasTalking")
    sms_active = models.BooleanField(default=True)
    email_active = models.BooleanField(default=True)
    
    # Security
    force_2fa_admins = models.BooleanField(default=False)
    session_timeout = models.IntegerField(default=60) # in minutes
    
    def save(self, *args, **kwargs):
        self.pk = 1 # Singleton pattern to ensure only one record exists
        super(SystemSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    class Meta:
        verbose_name = "System Global Settings"
        verbose_name_plural = "System Global Settings"
