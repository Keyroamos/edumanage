import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser, User
from django.conf import settings
from schools.views import api_school_config
from schools.views_super import api_app_status

factory = RequestFactory()

print("--- Testing api_app_status ---")
request = factory.get('/api/app-status/')
request.user = AnonymousUser()
try:
    response = api_app_status(request)
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content.decode()}")
except Exception as e:
    import traceback
    print("FAILED with exception:")
    print(traceback.format_exc())

print("\n--- Testing api_school_config ---")
request = factory.get('/api/config/')
# Try fixed user if possible, or Anonymous
admin_user = User.objects.filter(is_superuser=True).first()
request.user = admin_user if admin_user else AnonymousUser()
# Mock headers for portal resolution if needed
request.headers = {} 

try:
    response = api_school_config(request)
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content.decode()}")
except Exception as e:
    import traceback
    print("FAILED with exception:")
    print(traceback.format_exc())
