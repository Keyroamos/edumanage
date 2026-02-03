import os
import sys
import logging

# 1. SETUP PATHS
# Get the absolute path of the directory containing this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# 2. CONFIGURE LOGGING
# Log errors to a file specifically for Passenger startup issues
logging.basicConfig(
    filename=os.path.join(BASE_DIR, 'passenger_startup.log'),
    level=logging.ERROR,
    format='%(asctime)s %(levelname)s: %(message)s'
)

# 3. SET SETTINGS MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')

# 4. INITIALIZE APPLICATION
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    logging.error("CRITICAL: Failed to load Django WSGI application.")
    logging.error(f"Error: {str(e)}")
    import traceback
    logging.error(traceback.format_exc())
    # Re-raise to ensure Passenger sees the failure
    raise
