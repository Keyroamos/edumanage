import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from config.models import SchoolConfig

broken_filename = 'ChatGPT_Image_Dec_7_2025_10_18_19_AM_HKiJY4i.png'
correct_filename = 'school_logos/ChatGPT_Image_Dec_7_2025_10_18_19_AM.png'

configs = SchoolConfig.objects.filter(school_logo__icontains=broken_filename)

if configs.exists():
    for config in configs:
        print(f"Found broken logo in school: {config.school_name}")
        config.school_logo = correct_filename
        config.save()
        print(f"Updated school: {config.school_name} with logo: {correct_filename}")
else:
    print("No school found with broken logo path.")
