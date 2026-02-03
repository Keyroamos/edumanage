from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from schools.models import Student, Grade
from datetime import datetime


class Command(BaseCommand):
    help = 'Automatically promotes students to the next grade level at the end of academic year'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
        parser.add_argument(
            '--grade',
            type=str,
            help='Promote students from a specific grade only (e.g., G1, G2, PP1)',
        )
        parser.add_argument(
            '--skip-final',
            action='store_true',
            help='Skip promoting students in the final grade (G12)',
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
        
        return None  # No next grade (already at highest level)

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        specific_grade = options.get('grade')
        skip_final = options.get('skip_final', False)
        
        # Get current year
        current_year = timezone.now().year
        
        # Filter students
        if specific_grade:
            students = Student.objects.filter(
                grade__name=specific_grade,
                grade__isnull=False
            ).select_related('grade')
            self.stdout.write(f"\nPromoting students from {specific_grade} only")
        else:
            students = Student.objects.filter(
                grade__isnull=False
            ).select_related('grade')
            self.stdout.write("\nPromoting all students with assigned grades")
        
        if skip_final:
            students = students.exclude(grade__name='G12')
            self.stdout.write("Skipping students in final grade (G12)")
        
        total_students = students.count()
        
        if total_students == 0:
            self.stdout.write(self.style.WARNING("No students found to promote"))
            return
        
        if dry_run:
            self.stdout.write(self.style.WARNING("\nDRY RUN - No changes will be made"))
        
        # Group by current grade
        promotion_plan = {}
        students_without_next = []
        
        for student in students:
            current_grade_name = student.grade.name
            next_grade_name = self.get_next_grade(current_grade_name)
            
            if next_grade_name:
                if current_grade_name not in promotion_plan:
                    promotion_plan[current_grade_name] = {
                        'next_grade': next_grade_name,
                        'students': []
                    }
                promotion_plan[current_grade_name]['students'].append(student)
            else:
                students_without_next.append((student, current_grade_name))
        
        # Display promotion plan
        self.stdout.write(f"\nPromotion Plan:")
        self.stdout.write("=" * 60)
        for current_grade, data in promotion_plan.items():
            count = len(data['students'])
            self.stdout.write(f"{current_grade} → {data['next_grade']}: {count} students")
        
        if students_without_next:
            self.stdout.write(f"\nStudents at final grade (will not be promoted): {len(students_without_next)}")
            for student, grade in students_without_next[:5]:  # Show first 5
                self.stdout.write(f"  - {student.get_full_name()} ({grade})")
            if len(students_without_next) > 5:
                self.stdout.write(f"  ... and {len(students_without_next) - 5} more")
        
        if not dry_run:
            updated_count = 0
            with transaction.atomic():
                for current_grade, data in promotion_plan.items():
                    # Get next grade object
                    try:
                        next_grade = Grade.objects.get(name=data['next_grade'])
                    except Grade.DoesNotExist:
                        self.stdout.write(
                            self.style.ERROR(f"\n✗ Grade {data['next_grade']} does not exist. Skipping promotion from {current_grade}")
                        )
                        continue
                    
                    # Update students
                    for student in data['students']:
                        # Store previous grade
                        student.previous_grade = student.grade
                        student.grade = next_grade
                        # Update term fees from new grade
                        student.term_fees = next_grade.get_total_fees() / 3
                        student.save()
                        updated_count += 1
                
                self.stdout.write(self.style.SUCCESS(f"\n✓ Successfully promoted {updated_count} students"))
        else:
            total_to_promote = sum(len(data['students']) for data in promotion_plan.values())
            self.stdout.write(self.style.WARNING(f"\nWould promote {total_to_promote} students"))

