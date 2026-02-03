import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig
from schools.models import Student, Employee, Teacher, NonTeachingStaff
from django.contrib.auth.models import User

def find_casavillians():
    print("Searching for Casavillians Academy...")
    configs = SchoolConfig.objects.filter(school_name__icontains='Casavillians')
    if not configs:
        print("No school found with 'Casavillians' in name.")
        # Try finding the one with most students
        from django.db.models import Count
        best = SchoolConfig.objects.annotate(s_count=Count('students')).order_by('-s_count').first()
        if best:
            print(f"Top school by students: {best.school_name} (ID: {best.id}) with {best.students.count()} students.")
            configs = [best]

    for c in configs:
        print(f"\nSchool: {c.school_name} (ID: {c.id})")
        print(f"  Admin: {c.admin.username if c.admin else 'None'} ({c.admin.email if c.admin else 'N/A'})")
        print(f"  Student Count: {Student.objects.filter(school=c).count()}")
        
        # Check for employees
        employees = Employee.objects.filter(school=c)
        print(f"  Employee Count: {employees.count()}")
        for e in employees:
             user_linked = "Yes" if hasattr(e, 'user') or (hasattr(e, 'teacher') and e.teacher.user) or (hasattr(e, 'staff_profile') and e.staff_profile.user) else "No"
             # Specifically check NonTeachingStaff
             nt = None
             try: nt = NonTeachingStaff.objects.get(id=e.id)
             except: pass
             print(f"    - {e.first_name} ({e.position}) | Linked to User: {nt.user.username if nt and nt.user else 'No'}")

if __name__ == "__main__":
    find_casavillians()
