import sys
import os

# Get the project root directory (where this file lives)
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# If you have a virtual environment, the python path should be handled by cPanel's 
# "Setup Python App", but you can also explicitly set it here if needed.
# venv_path = os.path.join(project_root, 'venv/bin/python')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')

# Import the Django WSGI application
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    # This helps diagnose 500 errors in the logs
    import logging
    logging.error(f"Failed to load Django application: {e}")
    raise
