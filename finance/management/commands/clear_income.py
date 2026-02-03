
from django.core.management.base import BaseCommand
from finance.models import Transaction, StudentFinanceAccount

class Command(BaseCommand):
    help = 'Clears all income/payments to reset collections to 0'

    def handle(self, *args, **kwargs):
        # 1. Delete all payments
        payments = Transaction.objects.filter(type='PAYMENT')
        count = payments.count()
        payments.delete()
        self.stdout.write(f"Deleted {count} payment transactions.")

        # 2. Recalculate all balances
        self.stdout.write("Recalculating all account balances...")
        accounts = StudentFinanceAccount.objects.all()
        for acc in accounts:
            acc.update_balance()
        
        self.stdout.write(self.style.SUCCESS("Successfully removed all income and updated balances."))
