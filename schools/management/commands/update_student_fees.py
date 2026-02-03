from django.core.management.base import BaseCommand
from django.db.models import Count
from schools.models import Student, Grade
from django.db import transaction

class Command(BaseCommand):
    help = 'Updates student term fees based on their grade fees'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all students with grades
        students = Student.objects.select_related('grade').filter(grade__isnull=False)
        total_students = students.count()
        
        if dry_run:
            self.stdout.write(self.style.WARNING(f"\nDRY RUN - No changes will be made"))
        
        self.stdout.write(f"\nFound {total_students} students with assigned grades")
        
        # Group students by grade for better reporting
        grade_counts = students.values('grade__name').annotate(count=Count('id'))
        
        self.stdout.write("\nStudents per grade:")
        for grade in grade_counts:
            self.stdout.write(f"- {grade['grade__name']}: {grade['count']} students")
        
        if not dry_run:
            with transaction.atomic():
                updated_count = 0
                for student in students:
                    if student.grade:
                        old_fees = {
                            'term1': student.term1_fees,
                            'term2': student.term2_fees,
                            'term3': student.term3_fees
                        }
                        
                        # Update fees from grade
                        student.term1_fees = student.grade.term1_fees
                        student.term2_fees = student.grade.term2_fees
                        student.term3_fees = student.grade.term3_fees
                        
                        if (old_fees['term1'] != student.term1_fees or 
                            old_fees['term2'] != student.term2_fees or 
                            old_fees['term3'] != student.term3_fees):
                            student.save()
                            updated_count += 1
                            self.stdout.write(
                                f"Updated {student.admission_number} - {student.get_full_name()} "
                                f"({student.grade.name})"
                            )
                
                self.stdout.write(self.style.SUCCESS(
                    f"\nSuccessfully updated {updated_count} students"
                ))
        else:
            self.stdout.write("\nStudents that would be updated:")
            for student in students:
                if student.grade:
                    if (student.term1_fees != student.grade.term1_fees or 
                        student.term2_fees != student.grade.term2_fees or 
                        student.term3_fees != student.grade.term3_fees):
                        self.stdout.write(
                            f"- {student.admission_number} - {student.get_full_name()} "
                            f"({student.grade.name})"
                        )
                        self.stdout.write(f"  Current fees: "
                            f"T1: {student.term1_fees}, "
                            f"T2: {student.term2_fees}, "
                            f"T3: {student.term3_fees}"
                        )
                        self.stdout.write(f"  New fees: "
                            f"T1: {student.grade.term1_fees}, "
                            f"T2: {student.grade.term2_fees}, "
                            f"T3: {student.grade.term3_fees}"
                        )
        
        self.stdout.write("\nDone!") 