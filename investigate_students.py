import os
import django
from django.utils import timezone
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Student, School
from config.models import SchoolConfig
from django.db.models import Count
from django.contrib.auth.models import User

def investigate():
    print("--- INVESTIGATION START ---")
    
    # 1. Total student count
    total = Student.objects.count()
    print(f"Total students in DB: {total}")
    
    # 2. Distribution by school
    dist = Student.objects.values('school_id', 'school__school_name').annotate(count=Count('id')).order_by('-count')
    print("\nStudents by School:")
    for d in dist:
        print(f" - ID {d['school_id']}: {d['school__school_name']} | Count: {d['count']}")
        
    # 3. Mount Kenya Academy check
    sc = SchoolConfig.objects.filter(school_name__icontains='Mount Kenya').first()
    if sc:
        print(f"\nMount Kenya Academy (ID: {sc.id})")
        print(f"  Admin: {sc.admin.email if sc.admin else 'None'}")
        print(f"  Students in this school: {Student.objects.filter(school=sc).count()}")
        if Student.objects.filter(school=sc).exists():
            s = Student.objects.filter(school=sc).first()
            print(f"  Sample student: {s.first_name} {s.last_name} (ADM: {s.admission_number})")
    
    # 4. Check for students in School 2 that might belong here
    s2 = SchoolConfig.objects.filter(id=2).first()
    if s2:
        print(f"\nComparing Mount Kenya with Casavilians (ID 2)")
        matches = Student.objects.filter(school=s2, last_name__icontains='ABDINASSIR').count()
        print(f"  Students in Casavilians with last name 'ABDINASSIR': {matches}")
        
        # Check if the Casavilians admin has any relation to info@mku.com
        u2 = User.objects.filter(email='info@mku.com').first()
        if s2.admin == u2:
            print("  User info@mku.com IS CURRENTLY THE ADMIN OF SCHOOL 2!")
        else:
            print(f"  User info@mku.com IS NOT THE ADMIN OF SCHOOL 2. (Admin is {s2.admin.email if s2.admin else 'None'})")

    # 5. Check if info@mku.com is any other Employee
    if u2:
        from schools.models import Employee
        es = Employee.objects.filter(email=u2.email)
        print(f"\nEmployee records for info@mku.com: {es.count()}")
        for e in es:
            print(f"  - {e.get_full_name()} in {e.school.school_name if e.school else 'None'} (Pos: {e.position})")

    # 6. Check for any schools with 'Mount Kenya' in name again
    all_kenya = SchoolConfig.objects.filter(school_name__icontains='Kenya')
    print(f"\nAll schools with 'Kenya' in name: {all_kenya.count()}")
    for s in all_kenya:
        print(f"  - ID {s.id}: {s.school_name} (Admin: {s.admin.email if s.admin else 'None'}, Slug: {s.portal_slug})")

    # 7. Check if there are any students with school=None
    print(f"\nStudents with no school: {Student.objects.filter(school__isnull=True).count()}")

if __name__ == "__main__":
    investigate()
