from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from schools.models import Term, Student, Grade
from datetime import datetime, date


class Command(BaseCommand):
    help = 'Automatically checks dates and advances terms/promotes students based on Kenyan government school calendar'

    def get_kenyan_term_dates(self, term, year):
        """Get Kenyan government school term dates"""
        # Kenyan school calendar (approximate - adjust as needed)
        # Term 1: January - April
        # Term 2: May - August  
        # Term 3: September - December
        
        if term == 1:
            # Term 1: Early January to Late April
            start_date = date(year, 1, 8)  # Typically starts around Jan 8
            end_date = date(year, 4, 30)   # Ends late April
        elif term == 2:
            # Term 2: Early May to Late August
            start_date = date(year, 5, 6)   # Typically starts around May 6
            end_date = date(year, 8, 30)    # Ends late August
        else:  # term == 3
            # Term 3: Early September to Mid December
            start_date = date(year, 9, 2)   # Typically starts around Sep 2
            end_date = date(year, 12, 20)  # Ends mid December
        
        return start_date, end_date

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

    def initialize_current_term(self):
        """Initialize or update current term based on today's date"""
        today = timezone.now().date()
        current_year = today.year
        
        # Determine which term we should be in based on date
        if today.month >= 1 and today.month <= 4:
            # January - April: Term 1
            term_num = 1
        elif today.month >= 5 and today.month <= 8:
            # May - August: Term 2
            term_num = 2
        else:
            # September - December: Term 3
            term_num = 3
        
        # Get term dates
        start_date, end_date = self.get_kenyan_term_dates(term_num, current_year)
        
        # Create or update term
        term_obj, created = Term.objects.get_or_create(
            number=term_num,
            year=current_year,
            defaults={
                'start_date': timezone.make_aware(datetime.combine(start_date, datetime.min.time())),
                'end_date': timezone.make_aware(datetime.combine(end_date, datetime.max.time())),
                'is_current': True
            }
        )
        
        if not created:
            # Update existing term
            term_obj.start_date = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
            term_obj.end_date = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
            term_obj.is_current = True
            term_obj.save()
        
        return term_obj, term_num, current_year

    def should_advance_term(self, current_term_obj):
        """Check if we should advance to next term based on dates"""
        if not current_term_obj:
            return False
        
        today = timezone.now().date()
        end_date = current_term_obj.end_date.date()
        
        # Advance if we're past the term end date (with 3 day buffer for weekends/holidays)
        from datetime import timedelta
        buffer_days = 3
        return today > (end_date + timedelta(days=buffer_days))

    def handle(self, *args, **options):
        today = timezone.now().date()
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(f"  AUTOMATIC ACADEMIC PROGRESSION CHECK")
        self.stdout.write(f"  Date: {today.strftime('%B %d, %Y')}")
        self.stdout.write(f"{'=' * 60}\n")
        
        # Step 1: Initialize or get current term
        current_term_obj, current_term_num, current_year = self.initialize_current_term()
        
        self.stdout.write(f"Current Term: Term {current_term_num} ({current_year})")
        self.stdout.write(f"Term Period: {current_term_obj.start_date.date()} to {current_term_obj.end_date.date()}")
        
        # Step 2: Check if we should advance
        should_advance = self.should_advance_term(current_term_obj)
        
        if not should_advance:
            self.stdout.write(self.style.SUCCESS("\n✓ No advancement needed. Current term is still active."))
            return
        
        self.stdout.write(self.style.WARNING(f"\n⚠ Term end date has passed. Advancing to next term..."))
        
        # Step 3: Determine next term
        if current_term_num == 3:
            # End of academic year - go to Term 1 of next year
            next_term = 1
            next_year = current_year + 1
            is_end_of_year = True
        else:
            # Advance to next term in same year
            next_term = current_term_num + 1
            next_year = current_year
            is_end_of_year = False
        
        self.stdout.write(f"\nAdvancing to: Term {next_term} ({next_year})")
        
        # Step 4: Advance all students
        students_to_update = Student.objects.filter(current_term=current_term_num)
        count = students_to_update.count()
        
        if count == 0:
            self.stdout.write(self.style.WARNING("No students found to update"))
            return
        
        self.stdout.write(f"Students to update: {count}")
        
        with transaction.atomic():
            # Update students' current_term
            updated = students_to_update.update(current_term=next_term)
            self.stdout.write(f"  ✓ Updated {updated} students to Term {next_term}")
            
            # Update academic year if starting new year
            if is_end_of_year:
                academic_year_str = f"{next_year-1}-{next_year}"
                Student.objects.filter(current_term=1).update(academic_year=academic_year_str)
                self.stdout.write(f"  ✓ Updated academic year to {academic_year_str}")
            
            # Update Term model
            current_term_obj.is_current = False
            current_term_obj.save()
            
            # Get dates for next term
            next_start, next_end = self.get_kenyan_term_dates(next_term, next_year)
            
            # Create or update next term
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
            
            self.stdout.write(f"  ✓ {'Created' if created else 'Updated'} Term {next_term} ({next_year}) as current")
            
            # Step 5: Promote students if end of year
            if is_end_of_year:
                self.stdout.write(f"\n{'─' * 60}")
                self.stdout.write("PROMOTING STUDENTS (End of Academic Year)")
                self.stdout.write(f"{'─' * 60}")
                
                students = Student.objects.filter(
                    grade__isnull=False,
                    current_term=1  # Students now in Term 1
                ).select_related('grade').exclude(grade__name='G12')
                
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
                
                # Display and execute promotion
                for current_grade, data in promotion_plan.items():
                    self.stdout.write(f"  {current_grade} → {data['next_grade']}: {data['count']} students")
                    
                    try:
                        next_grade = Grade.objects.get(name=data['next_grade'])
                    except Grade.DoesNotExist:
                        self.stdout.write(
                            self.style.ERROR(f"    ✗ Grade {data['next_grade']} does not exist")
                        )
                        continue
                    
                    students_to_promote = Student.objects.filter(
                        grade__name=current_grade,
                        current_term=1
                    )
                    
                    promoted_count = 0
                    for student in students_to_promote:
                        student.previous_grade = student.grade
                        student.grade = next_grade
                        student.term_fees = next_grade.get_total_fees() / 3
                        student.save()
                        promoted_count += 1
                    
                    self.stdout.write(f"    ✓ Promoted {promoted_count} students")
        
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("  ✓ AUTOMATIC PROGRESSION COMPLETED"))
        self.stdout.write(f"{'=' * 60}\n")

