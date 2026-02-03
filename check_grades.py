import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Student, Grade, Teacher
from django.db.models import Count

print("=== GRADE DISTRIBUTION ===")
grades_with_students = Student.objects.values('grade__name', 'grade__id').annotate(count=Count('id')).order_by('-count')[:15]
for g in grades_with_students:
    print(f"  {g['grade__name']} (ID: {g['grade__id']}): {g['count']} students")

print("\n=== TEACHER INFO ===")
teacher = Teacher.objects.filter(email='uniqokeyro@gmail.com').first()
if teacher:
    print(f"Teacher: {teacher.get_full_name()}")
    print(f"Is Class Teacher: {teacher.is_class_teacher}")
    print(f"Assigned Grade: {teacher.grade.name if teacher.grade else 'None'} (ID: {teacher.grade.id if teacher.grade else 'None'})")
    print(f"School: {teacher.school.school_name if teacher.school else 'None'}")
    
    if teacher.grade:
        students_in_grade = Student.objects.filter(grade=teacher.grade, school=teacher.school)
        print(f"Students in teacher's grade: {students_in_grade.count()}")
