import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.models import Student, Teacher, NonTeachingStaff, Grade, Branch, Department
from config.models import SchoolConfig
from food.models import FoodStudentAccount, FoodTransaction, FoodSubscription, MealItem

def relink():
    print("--- RELINKING STUDENTS TO MOUNT KENYA ACADEMY ---")
    
    source_id = 2 # Casavilians Academy (550 students)
    target_id = 22088 # Mount Kenya Academy (User info@mku.com)
    
    source_school = SchoolConfig.objects.get(id=source_id)
    target_school = SchoolConfig.objects.get(id=target_id)
    
    # 1. Move students
    students = Student.objects.filter(school=source_school)
    print(f"Moving {students.count()} students...")
    students.update(school=target_school)
    
    # 2. Move Food Accounts
    accounts = FoodStudentAccount.objects.filter(school=source_school)
    print(f"Moving {accounts.count()} food accounts...")
    accounts.update(school=target_school)
    
    # 3. Move Food Transactions
    txs = FoodTransaction.objects.filter(school=source_school)
    print(f"Moving {txs.count()} food transactions...")
    txs.update(school=target_school)
    
    # 4. Move Food Subscriptions
    subs = FoodSubscription.objects.filter(school=source_school)
    print(f"Moving {subs.count()} food subscriptions...")
    subs.update(school=target_school)
    
    # 5. Move Meal Items
    meals = MealItem.objects.filter(school=source_school)
    print(f"Moving {meals.count()} meal items...")
    meals.update(school=target_school)
    
    # 6. Move Grades (Mandatory for students to show up correctly in class filters)
    grades = Grade.objects.filter(school=source_school)
    print(f"Moving {grades.count()} grades...")
    grades.update(school=target_school)
    
    # 7. Move Branches/Departments
    branches = Branch.objects.filter(school=source_school)
    print(f"Moving {branches.count()} branches...")
    branches.update(school=target_school)
    
    depts = Department.objects.filter(school=source_school)
    print(f"Moving {depts.count()} departments...")
    depts.update(school=target_school)
    
    print("--- RELINKING COMPLETE ---")

if __name__ == "__main__":
    relink()
