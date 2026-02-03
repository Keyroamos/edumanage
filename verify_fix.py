import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.contrib.auth.models import User
from config.models import SchoolConfig

def verify():
    print("--- Final Verification ---")
    users = ['foodmanager', 'transportmanager', 'admin', 'accountant']
    for username in users:
        u = User.objects.filter(username__iexact=username).first()
        if u:
            config = SchoolConfig.get_config(user=u)
            print(f"User: {u.username} | School: {config.school_name} (ID: {config.id}) | Students: {config.students.count()}")

if __name__ == "__main__":
    verify()
