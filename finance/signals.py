from django.db.models.signals import post_save
from django.dispatch import receiver
from schools.models import Payment, Student
from finance.models import Transaction, StudentFinanceAccount

@receiver(post_save, sender=Payment)
def sync_payment_to_finance(sender, instance, created, **kwargs):
    if created:
        # Get or create finance account
        account, _ = StudentFinanceAccount.objects.get_or_create(student=instance.student)
        
        # Create corresponding Transaction
        # Check if already exists to avoid dupes (e.g. if running migration script later)
        if not Transaction.objects.filter(reference=instance.transaction_id, type='PAYMENT').exists():
            Transaction.objects.create(
                account=account,
                type='PAYMENT',
                amount=instance.amount,
                description=f"Synced Payment: {instance.description if hasattr(instance, 'description') else 'Fee Payment'}",
                reference=instance.transaction_id,
                payment_method=instance.payment_method,
                date=instance.date
            )

@receiver(post_save, sender=Student)
def create_student_finance_account(sender, instance, created, **kwargs):
    if created:
        StudentFinanceAccount.objects.get_or_create(student=instance)
