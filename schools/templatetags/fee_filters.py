from django import template
from django.template.defaultfilters import floatformat

register = template.Library()

@register.filter
def percentage(value, total):
    """Calculate percentage"""
    try:
        if total == 0:
            return 0
        return floatformat((float(value) / float(total)) * 100, 1)
    except (ValueError, ZeroDivisionError, TypeError):
        return 0 