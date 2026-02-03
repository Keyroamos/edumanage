from django.core.management.base import BaseCommand
from schools.models import Subject

class Command(BaseCommand):
    help = 'Create initial subjects'

    def handle(self, *args, **kwargs):
        subjects_data = [
            {
                'name': 'English Activities',
                'code': 'ENG',
                'description': 'English language learning activities'
            },
            {
                'name': 'Kiswahili Activities',
                'code': 'KIS',
                'description': 'Kiswahili language learning activities'
            },
            {
                'name': 'Mathematics Activities',
                'code': 'MATH',
                'description': 'Mathematical concepts and problem solving'
            },
            {
                'name': 'Science and Technology',
                'code': 'SCI',
                'description': 'Science concepts and technological applications'
            },
            {
                'name': 'Social Studies Activities',
                'code': 'SST',
                'description': 'Social studies and environmental activities'
            },
            {
                'name': 'CRE Activities',
                'code': 'CRE',
                'description': 'Christian Religious Education activities'
            },
            {
                'name': 'Agriculture and Nutrition',
                'code': 'AGR',
                'description': 'Agricultural practices and nutritional education'
            },
            {
                'name': 'Creative Arts',
                'code': 'ART',
                'description': 'Art, music, and creative expression'
            },
        ]

        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults={
                    'name': subject_data['name'],
                    'description': subject_data['description']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created subject {subject.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Subject {subject.name} already exists')
                ) 