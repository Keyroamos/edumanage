import os
import django
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig
from finance.models import FeeStructure

# For "Casavilian Academy" (which was mentioned previously as having ID 2)
# Let's check all schools' fee structures
schools = SchoolConfig.objects.all()
for school in schools:
    structures = FeeStructure.objects.filter(school=school)
    print(f"School: {school.school_name} (ID: {school.id})")
    print(f"Fee Structures count: {structures.count()}")
    if structures.exists():
        for fs in structures:
            print(f"  - Grade: {fs.grade.name}, Term: {fs.term}, Category: {fs.category.name}, Amount: {fs.amount}, Year: {fs.academic_year}")
    print("-" * 20)
