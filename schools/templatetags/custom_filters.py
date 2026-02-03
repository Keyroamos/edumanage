from django import template

register = template.Library()

@register.filter
def index(lst, i):
    try:
        return lst[i]
    except:
        return None

@register.filter
def get_item(dictionary, key):
    try:
        return dictionary.get(key)
    except Exception:
        return None

@register.filter
def multiply(value, arg):
    """Multiply the value by the argument"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0 