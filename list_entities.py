import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig
from schools.models import Student, Employee, Teacher, NonTeachingStaff
from django.contrib.auth.models import User

def list_all_entities():
    print("--- Detailed Entity Listing ---")
    
    # Schools with students
    print("\n[Schools with Students]")
    for c in SchoolConfig.objects.all():
        s_count = c.students.count()
        if s_count > 0:
            e_count = Employee.objects.filter(school=c).count()
            print(f"ID: {c.id} | Name: {c.school_name} | Students: {s_count} | Employees: {e_count}")
            
    # Employees and where they are
    print("\n[Employees]")
    for e in Employee.objects.all():
        print(f"Emp: {e.first_name} | Position: {e.position} | School ID: {e.school.id if e.school else 'None'}")
        
    # User to Profile links
    print("\n[User Profiles]")
    for u in User.objects.filter(is_staff=True):
        has_t = hasattr(u, 'teacher')
        has_s = hasattr(u, 'staff_profile')
        print(f"User: {u.username} | Teacher: {has_t} | Staff Profile: {has_s}")

if __name__ == "__main__":
    list_all_entities()
