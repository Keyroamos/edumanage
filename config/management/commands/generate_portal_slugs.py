from django.core.management.base import BaseCommand
from config.models import SchoolConfig
import uuid


class Command(BaseCommand):
    help = 'Generate portal slugs for existing schools'

    def handle(self, *args, **options):
        schools = SchoolConfig.objects.filter(portal_slug__isnull=True)
        count = 0
        
        for school in schools:
            # Generate unique slug
            new_slug = str(uuid.uuid4())[:12]
            while SchoolConfig.objects.filter(portal_slug=new_slug).exists():
                new_slug = str(uuid.uuid4())[:12]
            
            school.portal_slug = new_slug
            school.save()
            count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Generated portal slug for {school.school_name}: {new_slug}')
            )
        
        # Also handle empty string slugs
        schools_empty = SchoolConfig.objects.filter(portal_slug='')
        for school in schools_empty:
            new_slug = str(uuid.uuid4())[:12]
            while SchoolConfig.objects.filter(portal_slug=new_slug).exists():
                new_slug = str(uuid.uuid4())[:12]
            
            school.portal_slug = new_slug
            school.save()
            count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Generated portal slug for {school.school_name}: {new_slug}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated portal slugs for {count} schools')
        )
