from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from schools.models import Term, Student
from datetime import datetime


class Command(BaseCommand):
    help = 'Automatically advances the current term for all students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
        parser.add_argument(
            '--force-term',
            type=int,
            choices=[1, 2, 3],
            help='Force advance to a specific term (1, 2, or 3)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force_term = options.get('force_term')
        
        # Get current term from Term model
        current_term_obj = Term.objects.filter(is_current=True).first()
        
        if current_term_obj:
            current_term_num = current_term_obj.number
            current_year = current_term_obj.year
        else:
            # If no current term set, use student's current_term or default to 1
            sample_student = Student.objects.first()
            if sample_student:
                current_term_num = sample_student.current_term
            else:
                current_term_num = 1
            current_year = timezone.now().year
        
        # Determine next term
        if force_term:
            next_term = force_term
        else:
            if current_term_num == 3:
                # End of academic year - go to Term 1 of next year
                next_term = 1
                next_year = current_year + 1
            else:
                # Advance to next term in same year
                next_term = current_term_num + 1
                next_year = current_year
        
        self.stdout.write(f"\nCurrent Term: Term {current_term_num} ({current_year})")
        self.stdout.write(f"Next Term: Term {next_term} ({next_year})")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("\nDRY RUN - No changes will be made"))
        
        # Count students to update
        students_to_update = Student.objects.filter(current_term=current_term_num)
        count = students_to_update.count()
        
        self.stdout.write(f"\nFound {count} students in Term {current_term_num}")
        
        if count == 0:
            self.stdout.write(self.style.WARNING("No students found to update"))
            return
        
        if not dry_run:
            with transaction.atomic():
                # Update all students' current_term
                updated = students_to_update.update(current_term=next_term)
                
                # Update academic year if we're starting a new year
                if next_term == 1 and current_term_num == 3:
                    academic_year_str = f"{next_year-1}-{next_year}"
                    Student.objects.filter(current_term=1).update(academic_year=academic_year_str)
                    self.stdout.write(f"Updated academic year to {academic_year_str}")
                
                # Update Term model if it exists
                if current_term_obj:
                    # Mark current term as not current
                    current_term_obj.is_current = False
                    current_term_obj.save()
                    
                    # Create or update next term
                    next_term_obj, created = Term.objects.get_or_create(
                        number=next_term,
                        year=next_year,
                        defaults={
                            'start_date': timezone.now(),
                            'end_date': timezone.now(),
                            'is_current': True
                        }
                    )
                    if not created:
                        next_term_obj.is_current = True
                        next_term_obj.save()
                    
                    self.stdout.write(f"{'Created' if created else 'Updated'} Term {next_term} ({next_year}) as current")
                
                self.stdout.write(self.style.SUCCESS(f"\n✓ Successfully updated {updated} students to Term {next_term}"))
        else:
            self.stdout.write(self.style.WARNING(f"\nWould update {count} students to Term {next_term}"))

