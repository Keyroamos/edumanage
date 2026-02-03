from django.core.management.base import BaseCommand
from schools.models import Student, Grade
from django.contrib.auth.models import User, Group
import openpyxl
from datetime import date, datetime
from django.db import transaction
import sys

class Command(BaseCommand):
    help = 'Import students from Excel file'

    def handle(self, *args, **options):
        file_path = r'c:\Users\Admin\OneDrive\Desktop\edumanage\STUDENT DETAILS (Responses).xlsx'
        
        # Open workbook
        try:
            wb = openpyxl.load_workbook(file_path)
            sheet = wb.active
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error opening file: {e}'))
            return

        # 1. Clear existing students
        self.stdout.write('Deleting existing students...')
        with transaction.atomic():
            # Collect users to delete
            users_to_delete = []
            for student in Student.objects.all():
                if student.user:
                    users_to_delete.append(student.user.id)
            
            # Delete students
            Student.objects.all().delete()
            
            # Delete users
            if users_to_delete:
                User.objects.filter(id__in=users_to_delete).delete()
        
        self.stdout.write('Existing students deleted.')

        # 2. Iterate rows
        rows = list(sheet.iter_rows(min_row=2, values_only=True))
        total_rows = len(rows)
        self.stdout.write(f'Found {total_rows} rows to process.')
        
        count = 0
        students_group, _ = Group.objects.get_or_create(name='Students')
        
        for i, row in enumerate(rows):
            try:
                # Progress update every 10 rows
                if i % 10 == 0:
                    self.stdout.write(f'Processing row {i+1}/{total_rows}...')
                    
                if not row[1]: # Admission number is empty
                    continue
                
                # Excel columns: Timestamp, Admission number, Name, Grade, Column 4 (Location)
                adm_no = str(row[1]).strip() if row[1] else ''
                # Remove .0 if it was parsed as float
                if adm_no.endswith('.0'):
                    adm_no = adm_no[:-2]
                    
                full_name = row[2]
                grade_name = str(row[3]).strip() if row[3] else None
                location_val = row[4]
                
                if not full_name:
                    continue

                # Name split
                parts = full_name.strip().split()
                if len(parts) >= 2:
                    first_name = parts[0]
                    last_name = ' '.join(parts[1:])
                else:
                    first_name = parts[0]
                    last_name = 'Student' # Fallback
                
                # Grade logic
                grade = None
                if grade_name:
                    try:
                        grade = Grade.objects.get(name__iexact=grade_name)
                    except Grade.DoesNotExist:
                        normalized_name = str(grade_name).replace('Grade ', 'G')
                        try:
                            grade = Grade.objects.get(name__iexact=normalized_name)
                        except Grade.DoesNotExist:
                            pass # Fail silently or log if needed
                
                # Location
                loc = 'MAIN'
                if location_val and 'annex' in str(location_val).lower():
                    loc = 'ANNEX'
                
                # Handle duplicates by appending suffix
                original_adm_no = adm_no
                original_username = f"STD{adm_no}"
                
                # Initialize variables for the loop
                current_username = original_username
                current_adm_no = adm_no
                
                counter = 1
                # Check for existing username or existing admission number
                while User.objects.filter(username=current_username).exists() or \
                      Student.objects.filter(admission_number=current_adm_no).exists():
                    counter += 1
                    current_adm_no = f"{original_adm_no}_{counter}"
                    current_username = f"{original_username}_{counter}"

                if counter > 1:
                     self.stdout.write(self.style.WARNING(f"Duplicate resolved: {original_adm_no} -> {current_adm_no}"))

                with transaction.atomic():
                    user = User.objects.create_user(
                        username=current_username,
                        # Use original adm no for password ease
                        password=f"Edu@{original_adm_no}", 
                        first_name=first_name,
                        last_name=last_name,
                        email=f"student{current_adm_no}@example.com"
                    )
                    user.groups.add(students_group)
                    
                    # Create Student
                    Student.objects.create(
                        user=user,
                        admission_number=current_adm_no,
                        first_name=first_name,
                        last_name=last_name,
                        grade=grade,
                        location=loc,
                        date_of_birth=date(2020, 1, 1),
                        gender='M',
                        current_term=1,
                        term_fees=15000,
                        academic_year=str(datetime.now().year)
                    )
                count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing row {i+1}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Import complete. Imported {count} students.'))
