from django.core.management.base import BaseCommand
from schools.models import Grade

class Command(BaseCommand):
    help = 'Creates initial grade levels'

    def handle(self, *args, **kwargs):
        # Early Years
        Grade.objects.get_or_create(
            name='PG', 
            level='EY',
            defaults={'description': 'Play Group (3-4 Years)'}
        )
        Grade.objects.get_or_create(
            name='PP1', 
            level='EY',
            defaults={'description': 'Pre-Primary 1 (4-5 Years)'}
        )
        Grade.objects.get_or_create(
            name='PP2', 
            level='EY',
            defaults={'description': 'Pre-Primary 2 (5-6 Years)'}
        )

        # Lower Primary
        Grade.objects.get_or_create(
            name='G1', 
            level='LP',
            defaults={'description': 'Grade 1 (6-7 Years)'}
        )
        Grade.objects.get_or_create(
            name='G2', 
            level='LP',
            defaults={'description': 'Grade 2 (7-8 Years)'}
        )
        Grade.objects.get_or_create(
            name='G3', 
            level='LP',
            defaults={'description': 'Grade 3 (8-9 Years)'}
        )

        # Upper Primary
        Grade.objects.get_or_create(
            name='G4', 
            level='UP',
            defaults={'description': 'Grade 4 (9-10 Years)'}
        )
        Grade.objects.get_or_create(
            name='G5', 
            level='UP',
            defaults={'description': 'Grade 5 (10-11 Years)'}
        )
        Grade.objects.get_or_create(
            name='G6', 
            level='UP',
            defaults={'description': 'Grade 6 (11-12 Years)'}
        )

        # Junior High
        Grade.objects.get_or_create(
            name='G7', 
            level='JH',
            defaults={'description': 'Grade 7 (12-13 Years)'}
        )
        Grade.objects.get_or_create(
            name='G8', 
            level='JH',
            defaults={'description': 'Grade 8 (13-14 Years)'}
        )

        self.stdout.write(self.style.SUCCESS('Successfully created grade levels')) 