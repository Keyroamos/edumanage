from django.contrib.auth.models import User, Group
from django.db import IntegrityError

def create_staff_user(employee, school):
    """
    Creates a Django User account for a staff member (Teacher or Non-Teaching Staff).
    Returns the user object or None if it fails.
    """
    if not employee.email:
        print(f"Skipping user creation for {employee.get_full_name()}: No email provided.")
        return None
        
    # If employee already has a user, check if it matches the email
    if hasattr(employee, 'user') and employee.user:
        if employee.user.username == employee.email or employee.user.email == employee.email:
            return employee.user
        
    # Check if user already exists in DB
    existing_user = User.objects.filter(username=employee.email).first()
    if not existing_user:
        existing_user = User.objects.filter(email=employee.email).first()
        
    if existing_user:
        # Link existing user if not linked
        if hasattr(employee, 'teacher') and employee.teacher.user != existing_user:
            employee.teacher.user = existing_user
            employee.teacher.save()
        elif hasattr(employee, 'nonteachingstaff') and employee.nonteachingstaff.user != existing_user:
            employee.nonteachingstaff.user = existing_user
            employee.nonteachingstaff.save()
        return existing_user
        
    try:
        # Determine portal password and group
        from config.models import SchoolConfig
        if not school:
            if hasattr(employee, 'school') and employee.school:
                school = employee.school
            else:
                school = SchoolConfig.objects.first()
            
        password = "Staff@123"
        group_name = 'Staff'
        
        if employee.position == 'TEACHER':
            password = school.teacher_portal_password if school else "Teacher@123"
            group_name = 'Teachers'
        elif employee.position == 'ACCOUNTANT':
            password = school.accountant_portal_password if school else "Finance@123"
            group_name = 'Finance'
        elif employee.position == 'FOOD_MANAGER':
            password = school.food_portal_password if school else "Food@123"
            group_name = 'Food'
        elif employee.position == 'TRANSPORT_MANAGER':
            password = school.transport_portal_password if school else "Transport@123"
            group_name = 'Transport'
        elif employee.position == 'DRIVER':
            password = school.driver_portal_password if school else "Driver@123"
            group_name = 'Drivers'
        else:
            # Default to teacher password for HOD, Principal etc if they are teachers
            if employee.position in ['HOD', 'DEPUTY', 'PRINCIPAL']:
                password = school.teacher_portal_password if school else "Teacher@123"
                group_name = 'Teachers'
            else:
                password = school.accountant_portal_password if school and hasattr(school, 'accountant_portal_password') else "Staff@123"
                group_name = 'Staff'
            
        user = User.objects.create_user(
            username=employee.email,
            email=employee.email,
            password=password,
            first_name=employee.first_name,
            last_name=employee.last_name
        )
        
        # Add to group
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        
        # Link to employee (NonTeachingStaff or Teacher)
        if hasattr(employee, 'teacher'):
            employee.teacher.user = user
            employee.teacher.save()
        elif hasattr(employee, 'nonteachingstaff'):
            employee.nonteachingstaff.user = user
            employee.nonteachingstaff.save()
            
        return user
    except IntegrityError:
        # Final fallback if racing
        return User.objects.filter(username=employee.email).first()
    except Exception as e:
        print(f"Error creating user for {employee.email}: {e}")
        return None
