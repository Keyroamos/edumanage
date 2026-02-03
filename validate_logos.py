import os
import django
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig

configs = SchoolConfig.objects.exclude(school_logo='')
for c in configs:
    print(f"School: {c.school_name}")
    print(f"Logo Field: {c.school_logo}")
    try:
        url = c.school_logo.url if c.school_logo else 'None'
        print(f"Logo URL: {url}")
        # Check if file exists
        full_path = os.path.join(django.conf.settings.MEDIA_ROOT, str(c.school_logo))
        exists = os.path.exists(full_path)
        print(f"File exists on disk: {exists} ({full_path})")
    except Exception as e:
        print(f"Logo URL Error: {e}")
    print("-" * 20)
