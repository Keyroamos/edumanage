from django import template
from datetime import timedelta

register = template.Library()

@register.filter
def subtract(value, arg):
    """Subtract the arg from the value."""
    try:
        return value - arg
    except (ValueError, TypeError):
        try:
            return value or 0 - arg or 0
        except:
            return 0 

@register.filter
def add_days(value, days):
    """Add a number of days to a date"""
    try:
        return value + timedelta(days=int(days))
    except (ValueError, TypeError):
        return value 

@register.filter
def filter_by_date(schedules, date):
    """Filter schedules by date"""
    return [s for s in schedules if s.date == date] 

@register.filter
def performance_label(level):
    labels = {
        '1': 'Emerging',
        '2': 'Developing',
        '3': 'Meeting',
        '4': 'Exceeding'
    }
    return labels.get(str(level), 'Unknown') 