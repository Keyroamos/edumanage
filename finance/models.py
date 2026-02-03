from django.db import models
from schools.models import Student, Grade

class FeeCategory(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='fee_categories', null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Fee Categories"

class FeeStructure(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='fee_structures', null=True, blank=True)
    """
    Defines the fees applicable for a specific grade and term.
    """
    TERM_CHOICES = [
        (1, 'Term 1'),
        (2, 'Term 2'),
        (3, 'Term 3')
    ]
    
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='fee_structures')
    term = models.IntegerField(choices=TERM_CHOICES)
    academic_year = models.CharField(max_length=9, help_text="e.g. 2024-2025")
    category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_mandatory = models.BooleanField(default=True)
    description = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['grade', 'term', 'academic_year', 'category']

    def __str__(self):
        return f"{self.grade} - Term {self.term} - {self.category}: {self.amount}"

class StudentFinanceAccount(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='finance_accounts', null=True, blank=True)
    """
    The main account for a student. Everything financial links here.
    """
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='finance_account')
    # Denormalized fields for quick access, recalculated on signal/save
    total_billed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0) # positive means they owe
    
    last_updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.school and self.student and self.student.school:
            self.school = self.student.school
        super().save(*args, **kwargs)

    def update_balance(self):
        # Recalculate from transactions
        credits = self.transactions.filter(type='PAYMENT').aggregate(sum=models.Sum('amount'))['sum'] or 0
        debits = self.transactions.filter(type='INVOICE').aggregate(sum=models.Sum('amount'))['sum'] or 0
        
        self.total_paid = credits
        self.total_billed = debits
        self.balance = debits - credits
        self.save()

    def __str__(self):
        return f"{self.student.get_full_name()} Account"

class Transaction(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='financial_transactions', null=True, blank=True)
    TYPE_CHOICES = [
        ('INVOICE', 'Invoice/Bill'),
        ('PAYMENT', 'Payment/Receipt'),
        ('ADJUSTMENT', 'Adjustment'), # Waiver or Correction
    ]
    
    METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('SYSTEM', 'System/Auto')
    ]
    
    account = models.ForeignKey(StudentFinanceAccount, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True, null=True, help_text="M-Pesa Code or Receipt No")
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='SYSTEM')
    
    # Metadata
    term = models.IntegerField(choices=FeeStructure.TERM_CHOICES, null=True, blank=True)
    academic_year = models.CharField(max_length=9, null=True, blank=True)
    
    date = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.school and self.account and self.account.school:
            self.school = self.account.school
        super().save(*args, **kwargs)
        # Update account balance automatically
        self.account.update_balance()

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.date.strftime('%Y-%m-%d')})"

from django.contrib.auth.models import User

class SalaryStructure(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='salary_structures', null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='salary_structure')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Fixed monthly allowances")
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Tax, NHIF, etc")
    nssf = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="NSSF contribution")
    loans = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Loan repayments")
    
    updated_at = models.DateTimeField(auto_now=True)

    def get_advances(self):
        """Get total approved but not yet deducted advances for this user"""
        from schools.models import SalaryAdvance
        from transport.models import TransportAdvanceRequest
        try:
            # Check SalaryAdvance (Teachers & Staff)
            salary_advances = SalaryAdvance.objects.filter(
                models.Q(employee__teacher__user=self.user) | 
                models.Q(employee__nonteachingstaff__user=self.user),
                status='APPROVED'
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            # Check TransportAdvanceRequest (Drivers)
            transport_advances = TransportAdvanceRequest.objects.filter(
                driver__user=self.user,
                status='APPROVED'
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            return float(salary_advances) + float(transport_advances)
        except Exception:
            return 0

    def net_salary(self):
        base_net = float(self.base_salary) + float(self.allowances) - float(self.deductions) - float(self.nssf) - float(self.loans)
        return base_net - self.get_advances()
    
    def __str__(self):
        return f"Salary: {self.user.username}"

class PayrollRecord(models.Model):
    school = models.ForeignKey('config.SchoolConfig', on_delete=models.CASCADE, related_name='payroll_records', null=True, blank=True)
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('PAID', 'Paid')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payroll_records')
    month = models.DateField(help_text="First day of the month")
    
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nssf = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    loans = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    advances = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Salary advances deducted")
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=20, blank=True, null=True)
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)
    
    generated_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['user', 'month'] # One slip per user per month
    
    def __str__(self):
        return f"Payroll {self.user.username} - {self.month.strftime('%B %Y')}"
