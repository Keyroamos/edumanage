"""
Passenger WSGI file for cPanel deployment
This file is the entry point for the Django application on cPanel
"""
import sys
import os

# Set the path to your project
cwd = os.getcwd()
sys.path.insert(0, cwd)

# IMPORTANT: If you have a virtual environment, uncomment and update this section
# INTERP = os.path.expanduser("~/virtualenv/public_html/edu/3.9/bin/python3")
# if sys.executable != INTERP:
#     os.execl(INTERP, INTERP, *sys.argv)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
