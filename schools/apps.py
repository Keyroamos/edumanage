from django.apps import AppConfig
from django.core.management import call_command
from django.db import connection


class SchoolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'schools'

    def ready(self):
        import schools.signals  # Import the signals
        # NOTE: Background threads in ready() are unstable on Passenger/cPanel.
        # Initialization logic (like academic years) should be handled via 
        # management commands or lazy-loaded in views.
