from django.core.management.base import BaseCommand
from transport.models import Route

class Command(BaseCommand):
    help = 'Seed initial transport routes'

    def handle(self, *args, **kwargs):
        routes_data = [
            {
                'name': 'Route A - CBD',
                'description': 'Covers Central Business District and surrounding areas',
                'cost_per_term': 15000.00,
                'cost_per_month': 5500.00,
                'pickup_points': 'Kencom, Railways, GPO, Nation Centre, Hilton'
            },
            {
                'name': 'Route B - Westlands',
                'description': 'Westlands, Parklands, and Highridge areas',
                'cost_per_term': 18000.00,
                'cost_per_month': 6500.00,
                'pickup_points': 'Sarit Centre, ABC Place, Westgate Mall, Parklands Mosque'
            },
            {
                'name': 'Route C - Eastlands',
                'description': 'Eastlands estates including Umoja, Donholm, Buruburu',
                'cost_per_term': 12000.00,
                'cost_per_month': 4500.00,
                'pickup_points': 'Buruburu Phase 5, Umoja 1, Donholm Phase 8, Makadara'
            },
            {
                'name': 'Route D - South B/C',
                'description': 'South B, South C, Langata Road areas',
                'cost_per_term': 16000.00,
                'cost_per_month': 6000.00,
                'pickup_points': 'South C Shopping Centre, Bellevue, Mugoya, Nairobi West'
            },
            {
                'name': 'Route E - Ngong Road',
                'description': 'Ngong Road, Dagoretti, Karen areas',
                'cost_per_term': 20000.00,
                'cost_per_month': 7500.00,
                'pickup_points': 'Adams Arcade, Prestige Plaza, Karen Shopping Centre, Junction Mall'
            },
        ]

        for route_data in routes_data:
            route, created = Route.objects.get_or_create(
                name=route_data['name'],
                defaults=route_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created: {route.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Already exists: {route.name}'))
