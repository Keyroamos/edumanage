import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Teacher, NonTeachingStaff, Employee
from schools.user_utils import create_staff_user
from config.models import SchoolConfig

def fix_users():
    print("Starting user fix for existing staff...")
    
    # 1. Fix Teachers
    teachers = Teacher.objects.filter(user__isnull=True)
    print(f"Found {teachers.count()} teachers without users.")
    for teacher in teachers:
        school = teacher.school or SchoolConfig.objects.first()
        user = create_staff_user(teacher, school)
        if user:
            print(f"Created user for teacher: {teacher.get_full_name()} ({teacher.email})")
        else:
            print(f"Failed to create user for teacher: {teacher.get_full_name()}")

    # 2. Fix Non-Teaching Staff
    staff = NonTeachingStaff.objects.filter(user__isnull=True)
    print(f"Found {staff.count()} non-teaching staff without users.")
    for s in staff:
        school = s.school or SchoolConfig.objects.first()
        user = create_staff_user(s, school)
        if user:
            print(f"Created user for staff: {s.get_full_name()} ({s.email})")
        else:
            print(f"Failed to create user for staff: {s.get_full_name()}")

    print("Finished user fix.")

if __name__ == "__main__":
    fix_users()
