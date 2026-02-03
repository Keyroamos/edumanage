"""
Create sample fee structures for testing
"""
from django.core.management.base import BaseCommand
from config.models import SchoolConfig
from finance.models import FeeStructure, FeeCategory
from schools.models import Grade


class Command(BaseCommand):
    help = 'Create sample fee structures for Mount Kenya Academy'

    def handle(self, *args, **options):
        try:
            # Get Mount Kenya Academy
            school = SchoolConfig.objects.filter(school_name__icontains='Mount Kenya').first()
            if not school:
                self.stdout.write(self.style.ERROR('Mount Kenya Academy not found'))
                return
            
            self.stdout.write(f'Creating fee structures for {school.school_name}...')
            
            # Get or create categories
            tuition, _ = FeeCategory.objects.get_or_create(
                school=school,
                name='Tuition',
                defaults={'description': 'Regular tuition fees'}
            )
            
            lab, _ = FeeCategory.objects.get_or_create(
                school=school,
                name='Lab Fees',
                defaults={'description': 'Laboratory fees'}
            )
            
            # Get all grades for this school
            grades = Grade.objects.filter(school=school)
            
            if not grades.exists():
                self.stdout.write(self.style.WARNING('No grades found for this school'))
                return
            
            created_count = 0
            academic_year = '2024-2025'
            
            # Create fee structures for each grade and term
            for grade in grades:
                for term in [1, 2, 3]:
                    # Tuition fee
                    tuition_amount = 15000 + (grade.id % 5) * 1000  # Vary by grade
                    
                    fs, created = FeeStructure.objects.get_or_create(
                        school=school,
                        grade=grade,
                        term=term,
                        category=tuition,
                        academic_year=academic_year,
                        defaults={
                            'amount': tuition_amount,
                            'is_mandatory': True
                        }
                    )
                    if created:
                        created_count += 1
                        self.stdout.write(f'  ✓ {grade.name} - Term {term} - Tuition: {tuition_amount}')
                    
                    # Lab fees (only for higher grades)
                    if 'Grade' in grade.name or 'Form' in grade.name:
                        lab_amount = 2000
                        fs, created = FeeStructure.objects.get_or_create(
                            school=school,
                            grade=grade,
                            term=term,
                            category=lab,
                            academic_year=academic_year,
                            defaults={
                                'amount': lab_amount,
                                'is_mandatory': True
                            }
                        )
                        if created:
                            created_count += 1
                            self.stdout.write(f'  ✓ {grade.name} - Term {term} - Lab: {lab_amount}')
            
            self.stdout.write(self.style.SUCCESS(f'\n✅ Created {created_count} fee structures!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            traceback.print_exc()
