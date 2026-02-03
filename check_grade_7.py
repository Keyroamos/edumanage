import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Grade, Student

g = Grade.objects.get(id=7)
print(f'Grade: {g.name} (ID: {g.id})')
print(f'School: {g.school.school_name if g.school else "No school"}')
print(f'Students: {Student.objects.filter(grade=g).count()}')
print(f'Class Teacher: {g.class_teacher.get_full_name() if g.class_teacher else "None"}')
