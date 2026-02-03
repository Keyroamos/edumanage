import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
try:
    django.setup()
except Exception as e:
    print(f"CRITICAL ERROR during django.setup(): {e}")
    sys.exit(1)

from config.models import SystemSettings, SchoolConfig
from django.core.management import call_command
from django.contrib.auth.models import User

def run_fix():
    print("--- EDU-MANAGE ENTERPRISE OPTIMIZER ---")
    
    # 1. Run Migrations
    print("\n[1/4] Syncing Database Schema...")
    try:
        call_command('migrate', interactive=False)
        print("SUCCESS: Database is up to date.")
    except Exception as e:
        print(f"ERROR: Migrations failed: {e}")

    # 2. Update Global Pricing
    print("\n[2/4] Correcting Global Pricing...")
    try:
        settings = SystemSettings.load()
        settings.basic_price = 1499.00
        settings.standard_price = 2499.00
        settings.enterprise_price = 3499.00
        # Ensure registration is open
        settings.registration_open = True
        settings.save()
        print(f"SUCCESS: New Prices -> Basic: {settings.basic_price}, Std: {settings.standard_price}, Ent: {settings.enterprise_price}")
    except Exception as e:
        print(f"ERROR: Failed to update pricing: {e}")

    # 3. Fix Existing Schools Pricing (Legacy Support)
    print("\n[3/4] refreshing School Configurations...")
    try:
        # If any schools were on the old higher prices, we can reset them if needed
        # But usually they just follow the global settings.
        # We ensure portal slugs exist for all
        for school in SchoolConfig.objects.all():
            if not school.portal_slug:
                import uuid
                school.portal_slug = str(uuid.uuid4())[:12]
                school.save()
        print("SUCCESS: All school configs synchronized.")
    except Exception as e:
        print(f"ERROR: Config sync failed: {e}")

    # 4. Clean up
    print("\n[4/4] Finalizing optimizations...")
    try:
        # Clear any cached pages if necessary
        from django.core.cache import cache
        cache.clear()
        print("SUCCESS: System cache cleared.")
    except:
        pass

    print("\n" + "="*40)
    print("OPTIMIZATION COMPLETE!")
    print("Action Required: Restart your Python Application in cPanel.")
    print("="*40)

if __name__ == "__main__":
    run_fix()
