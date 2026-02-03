from django.core.management.base import BaseCommand
from django.utils import timezone
from schools.models import Student, Payment, Grade
import importlib.util
import sys
from pathlib import Path

# Import directly from schools/utils.py
_utils_path = Path(__file__).parent.parent.parent / 'utils.py'
spec = importlib.util.spec_from_file_location("schools_utils", _utils_path)
utils_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(utils_module)
generate_payment_receipt = utils_module.generate_payment_receipt
generate_payment_receipt_qr = utils_module.generate_payment_receipt_qr

from schools.utils.whatsapp import send_whatsapp_pdf
from decimal import Decimal
from datetime import date
import random
import string

class Command(BaseCommand):
    help = 'Test payment receipt generation and WhatsApp sending'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            default='254794643206',
            help='Phone number to send receipt to (default: 254794643206)'
        )
        parser.add_argument(
            '--student-id',
            type=int,
            help='Student ID to use (creates test student if not provided)'
        )
        parser.add_argument(
            '--amount',
            type=float,
            default=5000.00,
            help='Payment amount (default: 5000.00)'
        )

    def handle(self, *args, **options):
        phone_number = options['phone']
        student_id = options.get('student_id')
        amount = Decimal(str(options['amount']))
        
        self.stdout.write(self.style.SUCCESS(f'Testing payment receipt generation and WhatsApp sending...'))
        self.stdout.write(f'Phone number: {phone_number}')
        self.stdout.write(f'Amount: KES {amount:,.2f}')
        
        # Get or create a test student
        if student_id:
            try:
                student = Student.objects.get(pk=student_id)
                self.stdout.write(f'Using existing student: {student.get_full_name()}')
            except Student.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Student with ID {student_id} not found'))
                return
        else:
            # Create a test student
            self.stdout.write('Creating test student...')
            
            # Get or create a grade
            grade, _ = Grade.objects.get_or_create(
                name='G1',
                defaults={'description': 'Grade 1'}
            )
            
            # Generate unique admission number
            admission_number = f'TEST-{timezone.now().strftime("%Y%m%d%H%M%S")}'
            
            student = Student.objects.create(
                admission_number=admission_number,
                first_name='Test',
                last_name='Student',
                date_of_birth=date(2010, 1, 1),
                gender='M',
                grade=grade,
                parent_name='Test Parent',
                parent_phone=phone_number,  # Use the provided phone number
                parent_email='test@example.com',
                term_fees=Decimal('15000.00'),
                current_term=1
            )
            self.stdout.write(self.style.SUCCESS(f'Created test student: {student.get_full_name()} (ID: {student.id})'))
        
        # Generate unique reference number
        reference_number = f'TEST-{timezone.now().strftime("%Y%m%d%H%M%S")}-{random.randint(1000, 9999)}'
        
        # Create a test payment
        self.stdout.write('Creating test payment...')
        payment = Payment.objects.create(
            student=student,
            amount=amount,
            payment_method='MPESA',
            reference_number=reference_number,
            phone_number=phone_number,
            term=student.current_term,
            status='COMPLETED'
        )
        self.stdout.write(self.style.SUCCESS(f'Created payment: {payment.reference_number}'))
        
        # Generate PDF receipt
        self.stdout.write('Generating PDF receipt...')
        try:
            qr_code = generate_payment_receipt_qr(payment)
            pdf_content = generate_payment_receipt(payment, qr_code)
            
            if not pdf_content:
                self.stdout.write(self.style.ERROR('Failed to generate PDF receipt'))
                return
            
            self.stdout.write(self.style.SUCCESS('PDF receipt generated successfully'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error generating PDF: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())
            return
        
        # Send PDF via WhatsApp
        self.stdout.write(f'Sending PDF receipt via WhatsApp to {phone_number}...')
        try:
            # Convert PDF content to BytesIO if needed
            from io import BytesIO
            
            if isinstance(pdf_content, BytesIO):
                pdf_content.seek(0)
                pdf_io = pdf_content
            elif isinstance(pdf_content, bytes):
                pdf_io = BytesIO(pdf_content)
            else:
                if hasattr(pdf_content, 'read'):
                    pdf_content.seek(0)
                    pdf_io = BytesIO(pdf_content.read())
                else:
                    pdf_io = BytesIO(pdf_content)
            
            pdf_filename = f'receipt_{payment.reference_number}.pdf'
            caption = f"""Payment Receipt - Bishop Dr Mando International School

Receipt No: {payment.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Amount: KES {payment.amount:,.2f}
Payment Method: {payment.get_payment_method_display()}
Date: {payment.date.strftime('%B %d, %Y')}
Term: Term {payment.term}

Thank you for your payment!"""
            
            success, response = send_whatsapp_pdf(
                phone_number,
                pdf_io,
                filename=pdf_filename,
                caption=caption
            )
            
            if success:
                self.stdout.write(self.style.SUCCESS(f'✅ PDF receipt sent successfully via WhatsApp!'))
                self.stdout.write(f'Response: {response}')
            else:
                self.stdout.write(self.style.ERROR(f'❌ Failed to send PDF via WhatsApp'))
                self.stdout.write(f'Error: {response}')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error sending PDF via WhatsApp: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())
            return
        
        self.stdout.write(self.style.SUCCESS('\n✅ Test completed!'))
        self.stdout.write(f'Payment ID: {payment.id}')
        self.stdout.write(f'Reference Number: {payment.reference_number}')

