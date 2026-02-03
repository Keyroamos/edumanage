import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.contrib.auth.models import User
from schools.models import Employee, NonTeachingStaff, Student
from config.models import SchoolConfig

def fix_orphaned_managers():
    print("--- Fixing Orphaned Managers ---")
    
    # 1. Find the main school
    target_school = SchoolConfig.objects.filter(id=2).first()
    if not target_school:
         target_school = SchoolConfig.objects.annotate(s_count=django.db.models.Count('students')).order_by('-s_count').first()
    
    if not target_school:
        print("No target school found!")
        return
        
    print(f"Target School: {target_school.school_name} (ID: {target_school.id})")
    
    # 2. Identify managers to link
    manager_usernames = ['foodmanager', 'transportmanager', 'accountant', 'Accountant', 'TransportAdmin']
    
    for username in manager_usernames:
        u = User.objects.filter(username__iexact=username).first()
        if u:
            print(f"Processing {u.username}...")
            # Check if has profile (any Employee profile)
            # Employee doesn't have a direct user field, but its subclasses do. 
            # NonTeachingStaff has related_name='staff_profile'
            # Teacher has user field
            
            has_profile = False
            if hasattr(u, 'staff_profile') or hasattr(u, 'teacher'):
                has_profile = True
                
            if not has_profile:
                print(f"  Creating NonTeachingStaff profile for {u.username}...")
                pos = 'ADMIN'
                if 'food' in u.username.lower(): pos = 'FOOD_MANAGER'
                elif 'transport' in u.username.lower(): pos = 'TRANSPORT_MANAGER'
                elif 'account' in u.username.lower(): pos = 'ACCOUNTANT'
                
                # Create Employee / NonTeachingStaff
                try:
                    nt = NonTeachingStaff.objects.create(
                        user=u,
                        school=target_school,
                        first_name=u.first_name or u.username,
                        last_name=u.last_name or "",
                        email=u.email or f"{u.username}@school.com",
                        phone="0700000000",
                        national_id=f"ID-{u.id}-{random.randint(1000,9999)}",
                        position=pos,
                        date_of_birth="1990-01-01",
                    )
                    print(f"  Linked to {target_school.school_name} as {pos}")
                except Exception as e:
                    print(f"  Failed to create profile for {u.username}: {e}")
            else:
                # Update existing profile's school
                if hasattr(u, 'staff_profile'):
                    sp = u.staff_profile
                    print(f"  Updating staff_profile school for {u.username}")
                    sp.school = target_school
                    sp.save()
                if hasattr(u, 'teacher'):
                    t = u.teacher
                    print(f"  Updating teacher profile school for {u.username}")
                    t.school = target_school
                    t.save()
                    
    # 3. Fix employees with School ID: None
    print("\nFixing employees with no school...")
    Employee.objects.filter(school__isnull=True).update(school=target_school)
    
    print("\nFinished linking.")

if __name__ == "__main__":
    fix_orphaned_managers()
