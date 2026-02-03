# HR Module Models Extension
# Add this to schools/models.py after the existing models

class NonTeachingStaff(Employee):
    """
    Non-teaching staff model extending Employee
    Includes support staff, admin staff, etc.
    """
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


# Update Leave model with supervisor approval
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
        'Leave',
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
        related_name='leave_approvals'
    )
    comments = models.TextField(blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['approval_level', '-created_at']
        unique_together = ['leave', 'approval_level']
    
    def __str__(self):
        return f"{self.leave} - {self.approval_level} - {self.status}"


# Update SalaryAdvance model with supervisor approval
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
        'SalaryAdvance',
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
        related_name='advance_approvals'
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
