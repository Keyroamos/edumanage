from schools.models import Student, School
from config.models import SchoolConfig
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

def check_students():
    schools = SchoolConfig.objects.filter(school_name__icontains='Mount Kenya')
    if not schools.exists():
        print("No school found with name 'Mount Kenya'")
        return

    for school in schools:
        student_count = Student.objects.filter(school=school).count()
        print(f"School: {school.school_name} (ID: {school.id}, Slug: {school.portal_slug})")
        print(f"Student Count: {student_count}")
        
        if student_count == 0:
            print("Trying to find any students in the database...")
            total_students = Student.objects.count()
            print(f"Total students in DB: {total_students}")
            if total_students > 0:
                first_few = Student.objects.all()[:5]
                for s in first_few:
                    print(f"- {s.first_name} {s.last_name} (School: {s.school.school_name if s.school else 'None'})")

if __name__ == "__main__":
    check_students()
