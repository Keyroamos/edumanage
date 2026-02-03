from django.core.management.base import BaseCommand
from food.models import MealItem

class Command(BaseCommand):
    help = 'Populates initial meal items'

    def handle(self, *args, **kwargs):
        items = [
            {'name': 'Termly Lunch', 'cost': 15000, 'cycle': 'TERMLY', 'desc': 'Full lunch for the whole term'},
            {'name': 'Daily Tea Break', 'cost': 50, 'cycle': 'DAILY', 'desc': 'Morning tea and snack'},
            {'name': 'Termly Fruits', 'cost': 3000, 'cycle': 'TERMLY', 'desc': 'Fruit serving daily for the term'},
            {'name': 'Monthly Special Diet', 'cost': 6000, 'cycle': 'MONTHLY', 'desc': 'Special diet accommodations'},
        ]

        for item in items:
            obj, created = MealItem.objects.get_or_create(
                name=item['name'],
                defaults={
                    'cost': item['cost'],
                    'billing_cycle': item['cycle'],
                    'description': item['desc']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created: {item['name']}"))
            else:
                self.stdout.write(f"Exists: {item['name']}")
