from django.core.management.base import BaseCommand
from django.utils import timezone
from schools.models import Student, Grade, Payment
from decimal import Decimal
import random
from datetime import timedelta
import uuid

class Command(BaseCommand):
    help = 'Creates 20 sample students with sequential admission numbers'

    def handle(self, *args, **kwargs):
        # Sample data
        first_names = [
            'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
            'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
            'Thomas', 'Sarah', 'Charles', 'Karen'
        ]
        
        last_names = [
            'Kamau', 'Wanjiru', 'Ochieng', 'Akinyi', 'Mwangi', 'Njeri', 'Otieno', 'Wambui',
            'Kipchoge', 'Chebet', 'Mutua', 'Muthoni', 'Omondi', 'Nyambura', 'Kibet', 'Wairimu',
            'Kimani', 'Wangari', 'Okoth', 'Njoki'
        ]
        
        guardian_names = [
            'Peter Kamau', 'Grace Wanjiru', 'Samuel Ochieng', 'Faith Akinyi', 'Daniel Mwangi',
            'Rose Njeri', 'Joseph Otieno', 'Lucy Wambui', 'Patrick Kipchoge', 'Agnes Chebet',
            'Francis Mutua', 'Jane Muthoni', 'George Omondi', 'Nancy Nyambura', 'Paul Kibet',
            'Catherine Wairimu', 'Stephen Kimani', 'Margaret Wangari', 'Vincent Okoth', 'Anne Njoki'
        ]
        
        # Get all grades
        grades = list(Grade.objects.all())
        if not grades:
            self.stdout.write(self.style.ERROR('No grades found! Please create grades first.'))
            return
        
        # Get the highest existing admission number to continue from
        last_student = Student.objects.order_by('-id').first()
        start_number = 1
        if last_student and last_student.admission_number:
            try:
                # Try to extract number from admission number
                import re
                numbers = re.findall(r'\d+', last_student.admission_number)
                if numbers:
                    start_number = int(numbers[-1]) + 1
            except:
                start_number = Student.objects.count() + 1
        
        self.stdout.write(self.style.SUCCESS(f'Creating 20 sample students...'))
        self.stdout.write(f'Starting from admission number: EDU/2024/{start_number:04d}')
        
        created_count = 0
        
        for i in range(20):
            try:
                # Random data
                first_name = random.choice(first_names)
                last_name = random.choice(last_names)
                grade = random.choice(grades)
                gender = random.choice(['M', 'F'])
                
                # Generate date of birth (6-18 years old)
                age_years = random.randint(6, 18)
                date_of_birth = timezone.now().date() - timedelta(days=age_years*365 + random.randint(0, 365))
                
                # Guardian info
                guardian_name = random.choice(guardian_names)
                guardian_phone = f'+2547{random.randint(10000000, 99999999)}'
                guardian_email = f'{guardian_name.lower().replace(" ", ".")}@example.com'
                
                # Generate admission number
                admission_number = f'EDU/2024/{(start_number + i):04d}'
                
                # Create student
                student = Student.objects.create(
                    admission_number=admission_number,
                    first_name=first_name,
                    last_name=last_name,
                    date_of_birth=date_of_birth,
                    gender=gender,
                    grade=grade,
                    guardian_name=guardian_name,
                    guardian_phone=guardian_phone,
                    guardian_email=guardian_email,
                    parent_name=guardian_name,
                    parent_phone=guardian_phone,
                    parent_email=guardian_email,
                    academic_year='2024-2025',
                    current_term=1,
                    term_fees=Decimal(random.choice(['15000.00', '20000.00', '25000.00', '30000.00'])),
                    term1_fees=Decimal(random.choice(['15000.00', '20000.00', '25000.00'])),
                    term2_fees=Decimal(random.choice(['15000.00', '20000.00', '25000.00'])),
                    term3_fees=Decimal(random.choice(['15000.00', '20000.00', '25000.00'])),
                    location=random.choice(['MAIN', 'ANNEX'])
                )
                
                # Create initial payment (admission fee)
                payment_amount = Decimal(random.choice(['500.00', '1000.00', '1500.00']))
                Payment.objects.create(
                    student=student,
                    amount=payment_amount,
                    payment_method=random.choice(['CASH', 'MPESA', 'BANK']),
                    transaction_id=f'TXN{random.randint(100000, 999999)}',
                    reference_number=f'REF-{uuid.uuid4().hex[:8].upper()}-{i}',
                    status='COMPLETED',
                    term=1
                )
                
                # Random additional payments for some students
                if random.random() > 0.5:
                    Payment.objects.create(
                        student=student,
                        amount=Decimal(random.choice(['5000.00', '7500.00', '10000.00'])),
                        payment_method=random.choice(['CASH', 'MPESA', 'BANK']),
                        transaction_id=f'TXN{random.randint(100000, 999999)}',
                        reference_number=f'REF-{uuid.uuid4().hex[:8].upper()}-P{i}',
                        status='COMPLETED',
                        term=1
                    )
                
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created: {student.get_full_name()} - {student.admission_number} ({grade.name})'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating student {i+1}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Successfully created {created_count} students!')
        )
        self.stdout.write(f'Total students in database: {Student.objects.count()}')
