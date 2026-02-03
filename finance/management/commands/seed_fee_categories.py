"""
Management command to create default fee categories for all schools
"""
from django.core.management.base import BaseCommand
from config.models import SchoolConfig
from finance.models import FeeCategory


class Command(BaseCommand):
    help = 'Create default fee categories for all schools'

    def handle(self, *args, **options):
        default_categories = [
            {'name': 'Tuition', 'description': 'Regular tuition fees'},
            {'name': 'Lab Fees', 'description': 'Laboratory and practical fees'},
            {'name': 'Library', 'description': 'Library access and maintenance'},
            {'name': 'Sports', 'description': 'Sports and physical education'},
            {'name': 'Exam Fees', 'description': 'Examination and assessment fees'},
            {'name': 'Activity Fees', 'description': 'Co-curricular activities'},
            {'name': 'Development', 'description': 'School development fund'},
        ]

        schools = SchoolConfig.objects.all()
        
        for school in schools:
            self.stdout.write(f'Processing {school.school_name}...')
            created_count = 0
            
            for cat_data in default_categories:
                category, created = FeeCategory.objects.get_or_create(
                    school=school,
                    name=cat_data['name'],
                    defaults={'description': cat_data['description']}
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {cat_data["name"]}'))
            
            if created_count == 0:
                self.stdout.write(self.style.WARNING(f'  No new categories created for {school.school_name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'  Created {created_count} categories for {school.school_name}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Done!'))
