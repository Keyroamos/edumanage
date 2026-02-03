from django.db import models
from django.utils import timezone
from schools.models import Student

class Route(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_routes', null=True, blank=True)
    """
    Defines transport routes (e.g., 'Route A - CBD', 'Route B - Westlands')
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    cost_per_term = models.DecimalField(max_digits=10, decimal_places=2)
    cost_per_month = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pickup_points = models.TextField(help_text="Comma-separated pickup points", blank=True)
    map_embed_code = models.TextField(blank=True, null=True, help_text="Google Maps embed iframe code")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - KES {self.cost_per_term}/term"

    class Meta:
        ordering = ['name']


class TransportStudentAccount(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_accounts', null=True, blank=True)
    """
    Independent account for tracking transport-related finances per student.
    """
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='transport_account')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # Positive = Owing, Negative = Credit
    active = models.BooleanField(default=True)  # Is the student using transport?
    
    # Denormalized totals for fast dashboarding
    total_billed = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.school and self.student and self.student.school:
            self.school = self.student.school
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transport A/C: {self.student.get_full_name()}"

    def update_balance(self):
        credits = self.transport_transactions.filter(type='PAYMENT').aggregate(models.Sum('amount'))['amount__sum'] or 0
        debits = self.transport_transactions.filter(type='CHARGE').aggregate(models.Sum('amount'))['amount__sum'] or 0
        self.total_paid = credits
        self.total_billed = debits
        self.balance = debits - credits
        self.save()


class TransportAssignment(models.Model):
    """
    Links a student to a specific route they are assigned to.
    """
    account = models.ForeignKey(TransportStudentAccount, on_delete=models.CASCADE, related_name='assignments')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='students')
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)
    pickup_point = models.CharField(max_length=200, blank=True)
    pickup_location_embed = models.TextField(blank=True, null=True, help_text="Google Maps embed code for student's pickup location")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.account.student.first_name} - {self.route.name}"

    class Meta:
        ordering = ['-start_date']


class TransportTransaction(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_transactions', null=True, blank=True)
    """
    Records all transport-related financial transactions.
    """
    TX_TYPES = [
        ('PAYMENT', 'Payment Received'),
        ('CHARGE', 'Transport Charge'),
    ]
    METHODS = [
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer'),
        ('SYSTEM', 'System Charge'),
    ]

    account = models.ForeignKey(TransportStudentAccount, on_delete=models.CASCADE, related_name='transport_transactions')
    type = models.CharField(max_length=10, choices=TX_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=10, choices=METHODS, default='SYSTEM')
    date = models.DateTimeField(default=timezone.now)
    recorded_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        if not self.school and self.account and self.account.school:
            self.school = self.account.school
        super().save(*args, **kwargs)
        self.account.update_balance()

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.account.student.last_name})"

    class Meta:
        ordering = ['-date']


class TransportVehicle(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_vehicles', null=True, blank=True)
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('MAINTENANCE', 'In Maintenance'),
        ('OUT_OF_SERVICE', 'Out of Service'),
    ]

    plate_number = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=100, help_text="e.g. Toyota Coaster")
    capacity = models.PositiveIntegerField()
    route = models.ForeignKey(
        Route, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='vehicles',
        help_text="Primary route assigned to this vehicle"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plate_number} ({self.model})"


from django.contrib.auth.models import User

# ...

class TransportDriver(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_drivers', null=True, blank=True)
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ON_LEAVE', 'On Leave'),
        ('INACTIVE', 'Inactive'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='transport_driver_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, unique=True)
    license_number = models.CharField(max_length=50, unique=True)
    vehicle = models.OneToOneField(
        TransportVehicle, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='driver',
        help_text="Vehicle currently assigned to this driver"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    joined_at = models.DateField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.user:
            username = self.phone_number
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                from config.models import SchoolConfig
                school = self.school or SchoolConfig.objects.first()
                password = school.driver_portal_password if school else 'Driver@123'
                
                user = User.objects.create_user(username=username, password=password)
                user.first_name = self.first_name
                user.last_name = self.last_name
                user.save()
                
                # Add to Drivers group
                try:
                    from django.contrib.auth.models import Group
                    group, _ = Group.objects.get_or_create(name='Drivers')
                    user.groups.add(group)
                except Exception:
                    pass
                    
            self.user = user
        super().save(*args, **kwargs)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.get_full_name()

class TransportExpense(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_expenses', null=True, blank=True)
    EXPENSE_TYPES = [
        ('FUEL', 'Fuel'),
        ('REPAIR', 'Vehicle Repair'),
        ('MAINTENANCE', 'Maintenance'),
        ('OTHER', 'Other'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    driver = models.ForeignKey(TransportDriver, on_delete=models.CASCADE, related_name='expenses')
    vehicle = models.ForeignKey(TransportVehicle, on_delete=models.SET_NULL, null=True, blank=True)
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    receipt_image = models.ImageField(upload_to='transport_receipts/', blank=True, null=True)
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    action_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_expenses')
    action_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.expense_type} - {self.amount} ({self.driver})"

class TransportLeaveRequest(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_driver_leaves', null=True, blank=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    driver = models.ForeignKey(TransportDriver, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    action_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_driver_leaves')
    action_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class TransportAdvanceRequest(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='transport_driver_advances', null=True, blank=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    driver = models.ForeignKey(TransportDriver, on_delete=models.CASCADE, related_name='advance_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    action_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_driver_advances')
    action_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
