
from django.core.management.base import BaseCommand
from finance.models import StudentFinanceAccount, Transaction, FeeStructure, FeeCategory
from schools.models import Student, Grade
from decimal import Decimal
import random
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = 'Populates finance data with realistic sample transactions'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting finance population...")

        # 1. Setup Categories
        categories = ['Tuition', 'Transport', 'Lunch', 'Activities']
        cat_objs = {}
        for c in categories:
            obj, _ = FeeCategory.objects.get_or_create(name=c)
            cat_objs[c] = obj
            self.stdout.write(f"Category: {c}")

        # 2. Setup Fee Structures for all Grades
        grades = Grade.objects.all()
        if not grades.exists():
            self.stdout.write(self.style.ERROR("No grades found! Run database seed first."))
            # Create dummy grades if none exist, just to make sure we have data
            for g_name in ['PP1', 'PP2', 'G1', 'G2', 'G3']:
                Grade.objects.create(name=g_name, level=int(g_name.replace('G','')) if 'G' in g_name else 0)
            grades = Grade.objects.all()

        term = 1
        year = "2024"

        for grade in grades:
            # Tuition varies by level
            base_tuition = 15000
            if 'G' in grade.name:
                try:
                    level = int(grade.name.replace('G', ''))
                    base_tuition += (level * 2000)
                except:
                    pass
            elif 'PP' in grade.name:
                base_tuition = 12000

            # Create Tuition Structure
            FeeStructure.objects.get_or_create(
                grade=grade, term=term, academic_year=year, category=cat_objs['Tuition'],
                defaults={'amount': Decimal(base_tuition), 'is_mandatory': True}
            )
            
            # Create Lunch Structure
            FeeStructure.objects.get_or_create(
                grade=grade, term=term, academic_year=year, category=cat_objs['Lunch'],
                defaults={'amount': Decimal(6500), 'is_mandatory': True}
            )

        self.stdout.write("Fee Structures configured.")

        # 3. Process Students
        students = Student.objects.all()
        self.stdout.write(f"Processing {students.count()} students...")
        
        methods = ['MPESA', 'BANK', 'CASH']

        for student in students:
            # Ensure Account
            account, created = StudentFinanceAccount.objects.get_or_create(student=student)
            
            # Check if already billed for this term (simple check to avoid dupes on re-run)
            if account.transactions.filter(type='INVOICE', term=term, academic_year=year).exists():
                # If billed, maybe check if we need to add a payment if none exists?
                if not account.transactions.filter(type='PAYMENT').exists():
                    pass # logic below handles new transaction creation but we can skip billing
                else:
                    continue

            # Bill Tuition
            tuition_fs = FeeStructure.objects.filter(grade=student.grade, category=cat_objs['Tuition']).first()
            lunch_fs = FeeStructure.objects.filter(grade=student.grade, category=cat_objs['Lunch']).first()
            
            # Fallback if student has no grade assign or structure mismatch
            amount_to_bill = Decimal(15000)
            if tuition_fs:
                amount_to_bill = tuition_fs.amount + (lunch_fs.amount if lunch_fs else 0)

            # Create Invoice (Bill) if not exists
            if not account.transactions.filter(type='INVOICE', term=term).exists():
                Transaction.objects.create(
                    account=account,
                    type='INVOICE',
                    amount=amount_to_bill,
                    description=f"Term {term} {year} Fees",
                    term=term,
                    academic_year=year,
                    date=timezone.now() - timedelta(days=random.randint(10, 30))
                )
            
            # Random Payment Logic
            # 20% Pays nothing (0)
            # 30% Pays full
            # 50% Pays partial
            
            if account.transactions.filter(type='PAYMENT', term=term).exists():
                continue

            chance = random.random()
            paid_amount = Decimal(0)
            
            if chance > 0.8: # Pays nothing
                paid_amount = 0
            elif chance > 0.5: # Pays Full
                paid_amount = amount_to_bill
            else: # Partial
                paid_amount = amount_to_bill * Decimal(random.uniform(0.3, 0.9))
            
            if paid_amount > 0:
                method = random.choice(methods)
                Transaction.objects.create(
                    account=account,
                    type='PAYMENT',
                    amount=paid_amount,
                    description=f"Fee Payment Term {term}",
                    reference=f"{method}{random.randint(10000,99999)}",
                    payment_method=method,
                    term=term,
                    academic_year=year,
                    date=timezone.now() - timedelta(days=random.randint(0, 10))
                )

        self.stdout.write(self.style.SUCCESS("Finance data populated successfully!"))
