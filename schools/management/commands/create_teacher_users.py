from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from schools.models import Teacher

class Command(BaseCommand):
    help = 'Create user accounts for all teachers who do not have one'

    def handle(self, *args, **kwargs):
        teachers = Teacher.objects.all()
        created_count = 0
        updated_count = 0

        # Ensure 'Teachers' group exists
        teachers_group, _ = Group.objects.get_or_create(name='Teachers')

        for teacher in teachers:
            if not teacher.email:
                self.stdout.write(self.style.WARNING(f'Skipping teacher {teacher.get_full_name()} (No email)'))
                continue

            user = None
            if teacher.user:
                user = teacher.user
                updated_count += 1
                self.stdout.write(f'Updating existing user for {teacher.get_full_name()}')
            else:
                # Check if user with this email/username already exists but isn't linked
                try:
                    user = User.objects.get(username=teacher.email)
                    teacher.user = user
                    teacher.save()
                    updated_count += 1
                    self.stdout.write(f'Linked existing user to {teacher.get_full_name()}')
                except User.DoesNotExist:
                    # Create new user
                    try:
                        user = User.objects.create_user(
                            username=teacher.email,
                            email=teacher.email,
                            password='Bdmis@7878',
                            first_name=teacher.first_name,
                            last_name=teacher.last_name
                        )
                        teacher.user = user
                        teacher.save()
                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(f'Created user for {teacher.get_full_name()}'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error creating user for {teacher.get_full_name()}: {e}'))
                        continue

            # Ensure user is in Teachers group and set password
            if user:
                user.set_password('Bdmis@7878')
                user.save()
                user.groups.add(teachers_group)
                self.stdout.write(f'  - Password reset to default for {user.username}')

        self.stdout.write(self.style.SUCCESS(f'Process complete. Created: {created_count}, Updated/Linked: {updated_count}'))
