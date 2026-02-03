from django.apps import AppConfig
from django.core.management import call_command
from django.db import connection


class SchoolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'schools'

    def ready(self):
        import schools.signals  # Import the signals
        
        # Auto-initialize academic year on startup if no terms exist
        # Only run if database is ready (migrations applied)
        # Use a delayed check to avoid database access during initialization
        import threading
        
        def delayed_init():
            try:
                from schools.models import Term
                from django.db import connection
                # Wait a bit for migrations to complete
                import time
                time.sleep(2)
                
                if connection.introspection.table_names():
                    if not Term.objects.exists():
                        # No terms exist, initialize current academic year
                        try:
                            call_command('initialize_academic_year', verbosity=0)
                        except Exception:
                            # Silently fail if there's an issue
                            pass
            except Exception:
                # Database not ready yet, skip initialization
                pass
        
        # Run initialization in background thread to avoid blocking
        threading.Thread(target=delayed_init, daemon=True).start()
