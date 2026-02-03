
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from transport.models import TransportDriver

class Command(BaseCommand):
    help = 'Ensures all drivers have a user account'

    def handle(self, *args, **kwargs):
        drivers = TransportDriver.objects.filter(user__isnull=True)
        count = 0
        for driver in drivers:
            username = driver.phone_number
            if not username:
                self.stdout.write(self.style.WARNING(f'Driver {driver.id} has no phone number, skipping.'))
                continue
                
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User.objects.create_user(username=username, password='Bdmis@7878')
                user.first_name = driver.first_name
                user.last_name = driver.last_name
                user.save()
            
            driver.user = user
            driver.save()
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created/linked {count} driver users.'))
