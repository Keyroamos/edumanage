import os
import django
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig
from finance.models import FeeStructure, FeeCategory

schools = SchoolConfig.objects.filter(school_name__icontains='Casavilian')
for school in schools:
    print(f"School: {school.school_name} (ID: {school.id})")
    categories = FeeCategory.objects.filter(school=school)
    print(f"Fee Categories count: {categories.count()}")
    for cat in categories:
        print(f"  - Category: {cat.name}")
    
    structures = FeeStructure.objects.filter(school=school)
    print(f"Fee Structures count: {structures.count()}")
    for fs in structures:
        print(f"  - Grade: {fs.grade.name}, Term: {fs.term}, Category: {fs.category.name}, Amount: {fs.amount}, Year: {fs.academic_year}")
    print("-" * 20)
