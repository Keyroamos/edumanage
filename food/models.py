from django.db import models
from django.utils import timezone
from schools.models import Student

class MealItem(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='meal_items', null=True, blank=True)
    """
    Defines available food options (e.g., 'Lunch Term 1', 'Daily Tea', 'Fruits')
    """
    BILLING_CYCLES = [
        ('DAILY', 'Daily'),
        ('MONTHLY', 'Monthly'),
        ('TERMLY', 'Termly'),
        ('ONE_OFF', 'One Off'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)  # Total subscription cost
    per_serving_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Cost per serving (for daily billing)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLES, default='TERMLY')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.cost} ({self.billing_cycle})"

class FoodStudentAccount(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='food_accounts', null=True, blank=True)
    """
    Independent account for tracking food-related finances.
    """
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='food_account')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # Positive = Owing, Negative = Credit
    active = models.BooleanField(default=True) # Is the student participating in food program?
    
    # Denormalized totals for fast dashboarding
    total_billed = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.school and self.student and self.student.school:
            self.school = self.student.school
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Food A/C: {self.student.get_full_name()}"

    def update_balance(self):
        credits = self.food_transactions.filter(type='PAYMENT').aggregate(models.Sum('amount'))['amount__sum'] or 0
        debits = self.food_transactions.filter(type='CHARGE').aggregate(models.Sum('amount'))['amount__sum'] or 0
        self.total_paid = credits
        self.total_billed = debits
        self.balance = debits - credits
        self.save()

class FoodSubscription(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='food_subscriptions', null=True, blank=True)
    """
    Links a student to specific meal items they have subscribed to.
    """
    account = models.ForeignKey(FoodStudentAccount, on_delete=models.CASCADE, related_name='subscriptions')
    meal_item = models.ForeignKey(MealItem, on_delete=models.CASCADE)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.account.student.first_name} - {self.meal_item.name}"

class FoodTransaction(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='food_transactions_list', null=True, blank=True)
    TX_TYPES = [
        ('PAYMENT', 'Payment Received'),
        ('CHARGE', 'Meal Charge'), # e.g. Monthly bill applied
    ]
    METHODS = [
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer'),
        ('SYSTEM', 'System Charge'),
    ]

    account = models.ForeignKey(FoodStudentAccount, on_delete=models.CASCADE, related_name='food_transactions')
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
