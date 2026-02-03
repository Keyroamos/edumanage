from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from schools.models import Term, Student, Grade
from datetime import datetime, date


class Command(BaseCommand):
    help = 'Automatically advances terms and promotes students at end of academic year'

    def get_kenyan_term_dates(self, term, year):
        """Get Kenyan government school term dates"""
        if term == 1:
            start_date = date(year, 1, 8)
            end_date = date(year, 4, 30)
        elif term == 2:
            start_date = date(year, 5, 6)
            end_date = date(year, 8, 30)
        else:  # term == 3
            start_date = date(year, 9, 2)
            end_date = date(year, 12, 20)
        return start_date, end_date

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
        parser.add_argument(
            '--advance-term-only',
            action='store_true',
            help='Only advance terms, do not promote students',
        )
        parser.add_argument(
            '--promote-only',
            action='store_true',
            help='Only promote students, do not advance terms',
        )

    def get_next_grade(self, current_grade_name):
        """Get the next grade in sequence"""
        grade_sequence = [
            'PG', 'PP1', 'PP2', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6',
            'G7', 'G8', 'G9', 'G10', 'G11', 'G12'
        ]
        
        try:
            current_index = grade_sequence.index(current_grade_name)
            if current_index < len(grade_sequence) - 1:
                return grade_sequence[current_index + 1]
        except ValueError:
            pass
        
        return None

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        advance_term_only = options.get('advance_term_only', False)
        promote_only = options.get('promote_only', False)
        
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("  AUTOMATIC ACADEMIC PROGRESSION"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        
        if dry_run:
            self.stdout.write(self.style.WARNING("\n⚠ DRY RUN MODE - No changes will be made"))
        
        # Get current term
        current_term_obj = Term.objects.filter(is_current=True).first()
        
        if current_term_obj:
            current_term_num = current_term_obj.number
            current_year = current_term_obj.year
        else:
            sample_student = Student.objects.first()
            if sample_student:
                current_term_num = sample_student.current_term
            else:
                current_term_num = 1
            current_year = timezone.now().year
        
        self.stdout.write(f"\nCurrent Status:")
        self.stdout.write(f"  Term: {current_term_num}")
        self.stdout.write(f"  Year: {current_year}")
        
        # Determine if we're at end of academic year (Term 3)
        is_end_of_year = current_term_num == 3
        
        # Step 1: Advance Term
        if not promote_only:
            self.stdout.write(f"\n{'─' * 60}")
            self.stdout.write("STEP 1: ADVANCING TERM")
            self.stdout.write(f"{'─' * 60}")
            
            if is_end_of_year:
                next_term = 1
                next_year = current_year + 1
                self.stdout.write(f"End of academic year detected. Moving to Term 1 of {next_year}")
            else:
                next_term = current_term_num + 1
                next_year = current_year
                self.stdout.write(f"Advancing from Term {current_term_num} to Term {next_term}")
            
            students_to_update = Student.objects.filter(current_term=current_term_num)
            count = students_to_update.count()
            
            self.stdout.write(f"Students to update: {count}")
            
            if count > 0 and not dry_run:
                with transaction.atomic():
                    updated = students_to_update.update(current_term=next_term)
                    
                    # Update academic year if starting new year
                    if is_end_of_year:
                        academic_year_str = f"{next_year-1}-{next_year}"
                        Student.objects.filter(current_term=1).update(academic_year=academic_year_str)
                        self.stdout.write(f"  ✓ Updated academic year to {academic_year_str}")
                    
                    # Update Term model
                    if current_term_obj:
                        current_term_obj.is_current = False
                        current_term_obj.save()
                        
                        # Get Kenyan term dates
                        next_start, next_end = self.get_kenyan_term_dates(next_term, next_year)
                        
                        next_term_obj, created = Term.objects.get_or_create(
                            number=next_term,
                            year=next_year,
                            defaults={
                                'start_date': timezone.make_aware(datetime.combine(next_start, datetime.min.time())),
                                'end_date': timezone.make_aware(datetime.combine(next_end, datetime.max.time())),
                                'is_current': True
                            }
                        )
                        if not created:
                            next_term_obj.start_date = timezone.make_aware(datetime.combine(next_start, datetime.min.time()))
                            next_term_obj.end_date = timezone.make_aware(datetime.combine(next_end, datetime.max.time()))
                            next_term_obj.is_current = True
                            next_term_obj.save()
                    
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Updated {updated} students to Term {next_term}"))
            elif count > 0:
                self.stdout.write(self.style.WARNING(f"  Would update {count} students to Term {next_term}"))
        
        # Step 2: Promote Students (only at end of academic year)
        if not advance_term_only and is_end_of_year:
            self.stdout.write(f"\n{'─' * 60}")
            self.stdout.write("STEP 2: PROMOTING STUDENTS")
            self.stdout.write(f"{'─' * 60}")
            
            students = Student.objects.filter(
                grade__isnull=False,
                current_term=1  # Only promote students who are now in Term 1 (just advanced)
            ).select_related('grade').exclude(grade__name='G12')
            
            total_students = students.count()
            self.stdout.write(f"Students eligible for promotion: {total_students}")
            
            if total_students > 0:
                promotion_plan = {}
                
                for student in students:
                    current_grade_name = student.grade.name
                    next_grade_name = self.get_next_grade(current_grade_name)
                    
                    if next_grade_name:
                        if current_grade_name not in promotion_plan:
                            promotion_plan[current_grade_name] = {
                                'next_grade': next_grade_name,
                                'count': 0
                            }
                        promotion_plan[current_grade_name]['count'] += 1
                
                # Display plan
                for current_grade, data in promotion_plan.items():
                    self.stdout.write(f"  {current_grade} → {data['next_grade']}: {data['count']} students")
                
                if not dry_run:
                    updated_count = 0
                    with transaction.atomic():
                        for current_grade, data in promotion_plan.items():
                            try:
                                next_grade = Grade.objects.get(name=data['next_grade'])
                            except Grade.DoesNotExist:
                                self.stdout.write(
                                    self.style.ERROR(f"  ✗ Grade {data['next_grade']} does not exist")
                                )
                                continue
                            
                            students_to_promote = Student.objects.filter(
                                grade__name=current_grade,
                                current_term=1
                            )
                            
                            for student in students_to_promote:
                                student.previous_grade = student.grade
                                student.grade = next_grade
                                student.term_fees = next_grade.get_total_fees() / 3
                                student.save()
                                updated_count += 1
                        
                        self.stdout.write(self.style.SUCCESS(f"  ✓ Promoted {updated_count} students"))
                else:
                    total_to_promote = sum(data['count'] for data in promotion_plan.values())
                    self.stdout.write(self.style.WARNING(f"  Would promote {total_to_promote} students"))
        elif not advance_term_only:
            self.stdout.write(f"\n{'─' * 60}")
            self.stdout.write("STEP 2: PROMOTING STUDENTS")
            self.stdout.write(f"{'─' * 60}")
            self.stdout.write("  Not end of academic year. Student promotion skipped.")
            self.stdout.write("  (Students are promoted only when advancing from Term 3 to Term 1)")
        
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("  PROCESS COMPLETED"))
        self.stdout.write(f"{'=' * 60}\n")

