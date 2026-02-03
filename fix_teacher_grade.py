import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Student, Grade, Teacher
from django.db import transaction

print("=== FIXING TEACHER GRADE ASSIGNMENT ===\n")

# Get the teacher
teacher = Teacher.objects.filter(email='uniqokeyro@gmail.com').first()
if not teacher:
    print("Teacher not found!")
    exit()

if not teacher.school:
    print("ERROR: Teacher has no school assigned!")
    exit()

print(f"Teacher: {teacher.get_full_name()} (ID: {teacher.id})")
print(f"School: {teacher.school.school_name}")
print(f"Teacher's grade field: {teacher.grade.name if teacher.grade else 'None'} (ID: {teacher.grade.id if teacher.grade else 'None'})")

# Check ALL grades to see which ones have this teacher as class_teacher
print(f"\n🔍 Checking all grades for class_teacher assignments...")
all_grades_with_teacher = Grade.objects.filter(class_teacher=teacher, school=teacher.school)
print(f"Found {all_grades_with_teacher.count()} grades where this teacher is class_teacher:")
for g in all_grades_with_teacher:
    student_count = Student.objects.filter(grade=g, school=teacher.school).count()
    print(f"  - {g.name} (ID: {g.id}): {student_count} students")

# IMPORTANT: Only look at grades in the SAME SCHOOL as the teacher
print(f"\n🔍 Searching for G4 grades in {teacher.school.school_name}...")
g4_grades = Grade.objects.filter(name='G4', school=teacher.school).order_by('-id')
print(f"Found {g4_grades.count()} G4 grades in this school:")

best_grade = None
max_students = 0

for grade in g4_grades:
    # CRITICAL: Only count students in the SAME SCHOOL as the teacher
    student_count = Student.objects.filter(
        grade=grade, 
        school=teacher.school  # ← Ensures students are from teacher's school
    ).count()
    
    has_class_teacher = f"✓ Has class teacher ({grade.class_teacher.get_full_name()})" if grade.class_teacher else "○ No class teacher"
    print(f"  - G4 (ID: {grade.id}): {student_count} students [{has_class_teacher}]")
    
    if student_count > max_students:
        max_students = student_count
        best_grade = grade

if best_grade and max_students > 0:
    print(f"\n✓ Best match: G4 (ID: {best_grade.id}) with {max_students} students")
    print(f"  Reassigning teacher to this grade...")
    
    # Use a transaction to ensure atomicity
    with transaction.atomic():
        # Step 1: Remove this teacher from ALL grades' class_teacher field
        print(f"\n  → Clearing teacher from all grade class_teacher assignments...")
        Grade.objects.filter(class_teacher=teacher).update(class_teacher=None)
        print(f"  ✓ Cleared")
        
        # Step 2: Update the teacher's grade field
        print(f"  → Updating teacher's grade to G4 (ID: {best_grade.id})...")
        Teacher.objects.filter(id=teacher.id).update(
            grade=best_grade,
            is_class_teacher=True
        )
        print(f"  ✓ Updated")
        
        # Step 3: Now set the grade's class_teacher
        print(f"  → Setting G4 (ID: {best_grade.id}) class_teacher to {teacher.get_full_name()}...")
        Grade.objects.filter(id=best_grade.id).update(class_teacher=teacher)
        print(f"  ✓ Set")
        
        print("\n✅ Teacher grade updated successfully!")
    
    # Final verification - MUST filter by school
    teacher = Teacher.objects.get(id=teacher.id)  # Reload
    final_count = Student.objects.filter(
        grade=teacher.grade, 
        school=teacher.school  # ← Double-check school filter
    ).count()
    print(f"✅ Verification: {final_count} students now in teacher's class (School: {teacher.school.school_name})")
    print(f"✅ Teacher's grade: {teacher.grade.name} (ID: {teacher.grade.id})")
    
    # Verify the grade's class_teacher
    grade_check = Grade.objects.get(id=best_grade.id)
    print(f"✅ Grade's class_teacher: {grade_check.class_teacher.get_full_name() if grade_check.class_teacher else 'None'}")
else:
    print("\n❌ No G4 grade with students found in this school!")
    print("   The teacher may need to be assigned to a different grade.")
