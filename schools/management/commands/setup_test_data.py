from django.core.management.base import BaseCommand
from schools.models import School, Grade

class Command(BaseCommand):
    help = 'Creates initial test data'

    def handle(self, *args, **kwargs):
        # Create a school
        school = School.objects.create(
            name="Demo School",
            address="123 Education St",
            phone="1234567890",
            email="demo@school.com"
        )

        # Create grades
        grades = [
            ('PG', 'Play Group'),
            ('NK', 'Nursery'),
            ('KG1', 'Kindergarten 1'),
            ('KG2', 'Kindergarten 2'),
            ('G1', 'Grade 1'),
            ('G2', 'Grade 2'),
            ('G3', 'Grade 3'),
            ('G4', 'Grade 4'),
            ('G5', 'Grade 5'),
        ]

        for grade_code, _ in grades:
            Grade.objects.create(
                name=grade_code,
                school=school,
                description=f"Description for {grade_code}"
            )

        self.stdout.write(self.style.SUCCESS('Successfully created initial data')) 