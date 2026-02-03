import os
import django
from django.apps import apps
from django.db import models

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

search_query = 'ChatGPT_Image_Dec_7_2025_10_18_19_AM_HKiJY4i.png'

for model in apps.get_models():
    # Only check models with CharField or FileField
    fields = [f.name for f in model._meta.fields if isinstance(f, (models.CharField, models.FileField, models.TextField))]
    if not fields:
        continue
        
    try:
        query = models.Q()
        for field in fields:
            query |= models.Q(**{f"{field}__icontains": search_query})
            
        results = model.objects.filter(query)
        if results.exists():
            print(f"Found in model: {model.__name__}")
            for obj in results:
                print(f"  Object ID: {obj.pk}")
                for field in fields:
                    val = getattr(obj, field)
                    if val and search_query in str(val):
                        print(f"    Field: {field}, Value: {val}")
    except Exception as e:
        # Some models might fail due to database triggers or complex logic
        pass
