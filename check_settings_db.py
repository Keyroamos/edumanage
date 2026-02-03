import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings') # Assuming school.settings based on other files
django.setup()

try:
    from config.models import SystemSettings
    print("Successfully imported SystemSettings")
    
    # Try to load
    settings = SystemSettings.load()
    print(f"Successfully loaded settings: pk={settings.pk}")
    print(f"Maintenance Mode: {settings.maintenance_mode}")
    print(f"Currency: {settings.currency}")
    print(f"Basic Price: {settings.basic_price} (Type: {type(settings.basic_price)})")
    
except Exception as e:
    import traceback
    print("Error occurring during SystemSettings check:")
    print(traceback.format_exc())
