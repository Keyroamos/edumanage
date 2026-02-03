import os
import django
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig

configs = SchoolConfig.objects.all()
for c in configs:
    print(f"School: {c.school_name}")
    print(f"Logo Field: {c.school_logo}")
    try:
        print(f"Logo URL: {c.school_logo.url if c.school_logo else 'None'}")
    except Exception as e:
        print(f"Logo URL Error: {e}")
    print("-" * 20)
