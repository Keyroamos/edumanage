import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig, SystemSettings

print("--- SystemSettings ---")
try:
    s = SystemSettings.load()
    print(f"Maintenance: {s.maintenance_mode}")
    print(f"Registration: {s.registration_open}")
    print(f"Prices: {s.basic_price}, {s.standard_price}, {s.enterprise_price}")
    print(f"Currency: {s.currency}")
except Exception as e:
    print(f"Error loading SystemSettings: {e}")

print("\n--- SchoolConfigs ---")
configs = SchoolConfig.objects.all()
if not configs.exists():
    print("No SchoolConfigs found!")
for c in configs:
    print(f"School: {c.school_name} (ID: {c.pk})")
    print(f"  Code: {c.school_code}")
    print(f"  Logo: {c.school_logo}")
    try:
        if c.school_logo:
            print(f"  Logo URL: {c.school_logo.url}")
    except Exception as e:
        print(f"  Logo URL Error: {e}")
    print(f"  Plan: {c.subscription_plan}")
    print(f"  Status: {c.subscription_status}")
    print(f"  Trial Start: {c.trial_start_date}")
    print(f"  Trial End: {c.trial_end_date}")
