import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Student, Teacher, NonTeachingStaff
from config.models import SchoolConfig
from food.models import FoodStudentAccount, FoodTransaction, FoodSubscription
from finance.models import Payment, Invoice # Adjust based on actual models if they exist

def migrate_data(from_id, to_id):
    print(f"--- MIGRATING DATA FROM ID {from_id} TO ID {to_id} ---")
    
    source_school = SchoolConfig.objects.get(id=from_id)
    target_school = SchoolConfig.objects.get(id=to_id)
    
    print(f"Source: {source_school.school_name}")
    print(f"Target: {target_school.school_name}")
    
    # 1. Update Students
    students = Student.objects.filter(school=source_school)
    count = students.count()
    students.update(school=target_school)
    print(f"Moved {count} students.")
    
    # 2. Update Teachers/Staff
    teachers = Teacher.objects.filter(school=source_school)
    t_count = teachers.count()
    teachers.update(school=target_school)
    print(f"Moved {t_count} teachers.")
    
    staff = NonTeachingStaff.objects.filter(school=source_school)
    s_count = staff.count()
    staff.update(school=target_school)
    print(f"Moved {s_count} non-teaching staff.")
    
    # 3. Update Food Accounts (if they exist)
    # FoodStudentAccount might be linked to Student, and Student's school changed.
    # But check if FoodStudentAccount itself has a school field.
    # (Based on grep, it might not, but let's check)

    print("--- MIGRATION COMPLETE ---")

if __name__ == "__main__":
    # ONLY RUN THIS IF CONFIRMED
    # migrate_data(2, 22088)
    pass
