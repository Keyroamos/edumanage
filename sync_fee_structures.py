import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from finance.models import FeeStructure, FeeCategory
from schools.models import Grade

def sync_fees():
    try:
        tuition_cat = FeeCategory.objects.get(name__icontains='Tuition')
    except FeeCategory.DoesNotExist:
        tuition_cat = FeeCategory.objects.create(name='Tuition')
        
    year = '2024'
    count = 0
    
    for grade in Grade.objects.all():
        for term in [1, 2, 3]:
            fs, created = FeeStructure.objects.get_or_create(
                grade=grade,
                term=term,
                academic_year=year,
                category=tuition_cat,
                defaults={'amount': 0}
            )
            
            # Update amount from Grade model
            amount = 0
            if term == 1: amount = grade.term1_fees
            elif term == 2: amount = grade.term2_fees
            elif term == 3: amount = grade.term3_fees
            
            if amount > 0:
                fs.amount = amount
                fs.save()
                print(f"Updated {grade.name} Term {term} to {amount}")
            if created:
                count += 1
                print(f"Created FeeStructure for {grade.name} Term {term}")
    
    print(f"Total new structures created: {count}")

if __name__ == "__main__":
    sync_fees()
