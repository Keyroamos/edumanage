from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from schools.models import Term, Student
from datetime import datetime, date


class Command(BaseCommand):
    help = 'Initialize academic year with Kenyan government school term dates'

    def get_kenyan_term_dates(self, term, year):
        """Get Kenyan government school term dates"""
        if term == 1:
            # Term 1: Early January to Late April
            start_date = date(year, 1, 8)
            end_date = date(year, 4, 30)
        elif term == 2:
            # Term 2: Early May to Late August
            start_date = date(year, 5, 6)
            end_date = date(year, 8, 30)
        else:  # term == 3
            # Term 3: Early September to Mid December
            start_date = date(year, 9, 2)
            end_date = date(year, 12, 20)
        
        return start_date, end_date

    def add_arguments(self, parser):
        parser.add_argument(
            '--year',
            type=int,
            help='Academic year to initialize (default: current year)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-initialization even if terms exist',
        )

    def handle(self, *args, **options):
        year = options.get('year') or timezone.now().year
        force = options.get('force', False)
        
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(f"  INITIALIZING ACADEMIC YEAR {year}")
        self.stdout.write(f"{'=' * 60}\n")
        
        # Check if terms already exist
        existing_terms = Term.objects.filter(year=year)
        if existing_terms.exists() and not force:
            self.stdout.write(self.style.WARNING(
                f"Terms for year {year} already exist. Use --force to re-initialize."
            ))
            return
        
        if force and existing_terms.exists():
            self.stdout.write(f"Removing existing terms for year {year}...")
            existing_terms.delete()
        
        with transaction.atomic():
            # Create all three terms for the year
            for term_num in [1, 2, 3]:
                start_date, end_date = self.get_kenyan_term_dates(term_num, year)
                
                # Determine if this should be the current term
                today = timezone.now().date()
                is_current = (
                    start_date <= today <= end_date or
                    (term_num == 1 and today.month <= 4) or
                    (term_num == 2 and 5 <= today.month <= 8) or
                    (term_num == 3 and today.month >= 9)
                )
                
                # If setting a term as current, unset others
                if is_current:
                    Term.objects.filter(is_current=True).update(is_current=False)
                
                term_obj, created = Term.objects.get_or_create(
                    number=term_num,
                    year=year,
                    defaults={
                        'start_date': timezone.make_aware(datetime.combine(start_date, datetime.min.time())),
                        'end_date': timezone.make_aware(datetime.combine(end_date, datetime.max.time())),
                        'is_current': is_current
                    }
                )
                
                if not created:
                    term_obj.start_date = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                    term_obj.end_date = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                    term_obj.is_current = is_current
                    term_obj.save()
                
                status = "CURRENT" if is_current else ""
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  ✓ {'Created' if created else 'Updated'} Term {term_num} "
                        f"({start_date} to {end_date}) {status}"
                    )
                )
            
            # Update all students to current term if not set
            current_term_obj = Term.objects.filter(is_current=True).first()
            if current_term_obj:
                students_without_term = Student.objects.filter(
                    current_term__isnull=True
                ) | Student.objects.exclude(current_term=current_term_obj.number)
                
                count = students_without_term.count()
                if count > 0:
                    students_without_term.update(current_term=current_term_obj.number)
                    self.stdout.write(f"\n  ✓ Updated {count} students to Term {current_term_obj.number}")
        
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(self.style.SUCCESS("  ✓ ACADEMIC YEAR INITIALIZED"))
        self.stdout.write(f"{'=' * 60}\n")

