import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.contrib.auth.models import User
from schools.models import Employee, NonTeachingStaff, Student, Teacher
from config.models import SchoolConfig

def debug_school_access():
    print("--- Focused School Access Debug ---")
    
    # 1. Users with profiles
    print("\n[Users with Profiles]")
    teachers = Teacher.objects.all().select_related('user', 'school')
    for t in teachers:
        if t.user:
            print(f"Teacher User: {t.user.username} -> School: {t.school.school_name if t.school else 'None'}")
            
    staff = NonTeachingStaff.objects.all().select_related('user', 'school')
    for s in staff:
        if s.user:
            print(f"Staff User: {s.user.username} -> School: {s.school.school_name if s.school else 'None'}")

    # 2. Users that might be managers but missing profiles
    print("\n[Possible Missing Profiles]")
    managers = User.objects.filter(email__icontains='manager').union(
        User.objects.filter(email__icontains='food'),
        User.objects.filter(email__icontains='transport')
    )
    for u in managers:
        has_prof = hasattr(u, 'teacher') or hasattr(u, 'staff_profile')
        print(f"User: {u.username} ({u.email}) -> Has Profile: {has_prof}")
        if not has_prof:
            config = SchoolConfig.get_config(user=u)
            print(f"  Implicit School (from get_config): {config.school_name} (ID: {config.id})")

    # 3. Last 10 schools created
    print("\n[Top 10 Recent Schools]")
    recent = SchoolConfig.objects.all().order_by('-id')[:10]
    for r in recent:
        s_count = Student.objects.filter(school=r).count()
        print(f"School: {r.school_name} (ID: {r.id}) | Admin: {r.admin.username if r.admin else 'None'} | Students: {s_count}")

if __name__ == "__main__":
    debug_school_access()
