import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.contrib.auth.models import User, Group
from config.models import SchoolConfig
from schools.models import Student

def debug_managers():
    print("--- Manager Users Debug ---")
    manager_users = User.objects.filter(email__icontains='manager').union(
        User.objects.filter(email__icontains='food'),
        User.objects.filter(email__icontains='transport'),
        User.objects.filter(username__icontains='manager')
    )
    
    for u in manager_users:
        print(f"\nUser: {u.username} ({u.email})")
        print(f"  Groups: {[g.name for g in u.groups.all()]}")
        print(f"  Is Staff: {u.is_staff}")
        
        # Current inferred school
        config = SchoolConfig.get_config(user=u)
        s_count = Student.objects.filter(school=config).count()
        print(f"  Current School: {config.school_name} (ID: {config.id}) | Students: {s_count}")
        
        # If students are 0, try to find the "Main" school (ID 2)
        main_school = SchoolConfig.objects.filter(id=2).first()
        if main_school and s_count == 0:
            print(f"  Main School (Potential): {main_school.school_name} (ID: 2) | Students: {main_school.students.count()}")

if __name__ == "__main__":
    debug_managers()
